// store/chatStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  Timestamp,
  getDocs,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
  edited?: boolean;
  editedAt?: Timestamp;
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
  };
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    timestamp: Timestamp;
    senderId: string;
  };
  unreadCount: { [userId: string]: number };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isSpam?: boolean;
  isBlocked?: boolean;
  blockedBy?: string;
  blockedAt?: Timestamp;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: Timestamp;
  campus: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  isBlocked?: boolean;
  warnings?: Array<{
    message: string;
    adminId: string;
    timestamp: Timestamp;
  }>;
}

interface ChatState {
  conversations: ChatConversation[];
  messages: { [chatId: string]: Message[] };
  userProfiles: { [userId: string]: UserProfile };
  selectedConversation: string | null;
  loading: boolean;
  error: string | null;
  messageLoading: boolean;
  hasMoreMessages: { [chatId: string]: boolean };
  lastMessageDoc: { [chatId: string]: QueryDocumentSnapshot<DocumentData> | null };
  
  // Actions
  setSelectedConversation: (chatId: string | null) => void;
  sendMessage: (chatId: string, text: string, type?: 'text' | 'image' | 'file', metadata?: any) => Promise<void>;
  markAsRead: (chatId: string, userId: string) => Promise<void>;
  loadMoreMessages: (chatId: string) => Promise<void>;
  createOrGetChat: (participantIds: string[]) => Promise<string>;
  subscribeToUserChats: (userId: string) => () => void;
  subscribeToMessages: (chatId: string) => () => void;
  subscribeToUserProfiles: (userIds: string[]) => () => void;
  reportSpam: (chatId: string, reportedBy: string, reason: string) => Promise<void>;
  blockUser: (userId: string, blockedBy: string) => Promise<void>;
  warnUser: (userId: string, message: string, adminId: string) => Promise<void>;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    conversations: [],
    messages: {},
    userProfiles: {},
    selectedConversation: null,
    loading: false,
    error: null,
    messageLoading: false,
    hasMoreMessages: {},
    lastMessageDoc: {},

    setSelectedConversation: (chatId) => {
      set({ selectedConversation: chatId });
    },

    sendMessage: async (chatId, text, type = 'text', metadata) => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('User not authenticated');

        const conversation = get().conversations.find(c => c.id === chatId);
        if (!conversation) throw new Error('Conversation not found');

        const receiverId = conversation.participants.find(p => p !== userId);
        if (!receiverId) throw new Error('Receiver not found');

        const messageData = {
          chatId,
          senderId: userId,
          receiverId,
          text,
          type,
          read: false,
          timestamp: serverTimestamp(),
          ...(metadata && { metadata })
        };

        await addDoc(collection(db, 'messages'), messageData);

        // Update conversation's last message
        const chatRef = doc(db, 'conversations', chatId);
        await updateDoc(chatRef, {
          lastMessage: {
            text,
            timestamp: serverTimestamp(),
            senderId: userId
          },
          updatedAt: serverTimestamp(),
          [`unreadCount.${receiverId}`]: (conversation.unreadCount[receiverId] || 0) + 1
        });

      } catch (error) {
        console.error('Error sending message:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to send message' });
      }
    },

    markAsRead: async (chatId, userId) => {
      try {
        const chatRef = doc(db, 'conversations', chatId);
        await updateDoc(chatRef, {
          [`unreadCount.${userId}`]: 0
        });

        // Update local messages as read
        const messagesQuery = query(
          collection(db, 'messages'),
          where('chatId', '==', chatId),
          where('receiverId', '==', userId),
          where('read', '==', false)
        );

        const unreadMessages = await getDocs(messagesQuery);
        const batch = unreadMessages.docs.map(doc => 
          updateDoc(doc.ref, { read: true })
        );
        await Promise.all(batch);

      } catch (error) {
        console.error('Error marking as read:', error);
      }
    },

    loadMoreMessages: async (chatId) => {
      try {
        const state = get();
        if (!state.hasMoreMessages[chatId]) return;

        set({ messageLoading: true });

        let messagesQuery = query(
          collection(db, 'messages'),
          where('chatId', '==', chatId),
          orderBy('timestamp', 'desc'),
          limit(20)
        );

        if (state.lastMessageDoc[chatId]) {
          messagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', chatId),
            orderBy('timestamp', 'desc'),
            startAfter(state.lastMessageDoc[chatId]),
            limit(20)
          );
        }

        const snapshot = await getDocs(messagesQuery);
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];

        if (messages.length > 0) {
          set(state => ({
            messages: {
              ...state.messages,
              [chatId]: [...(state.messages[chatId] || []), ...messages.reverse()]
            },
            lastMessageDoc: {
              ...state.lastMessageDoc,
              [chatId]: snapshot.docs[snapshot.docs.length - 1]
            },
            hasMoreMessages: {
              ...state.hasMoreMessages,
              [chatId]: messages.length === 20
            }
          }));
        } else {
          set(state => ({
            hasMoreMessages: {
              ...state.hasMoreMessages,
              [chatId]: false
            }
          }));
        }

      } catch (error) {
        console.error('Error loading more messages:', error);
      } finally {
        set({ messageLoading: false });
      }
    },

    createOrGetChat: async (participantIds) => {
      try {
        // Check if chat already exists
        const chatsQuery = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains-any', participantIds)
        );

        const existingChats = await getDocs(chatsQuery);
        const existingChat = existingChats.docs.find(doc => {
          const data = doc.data();
          return data.participants.every((p: string) => participantIds.includes(p)) &&
                 participantIds.every(p => data.participants.includes(p));
        });

        if (existingChat) {
          return existingChat.id;
        }

        // Create new chat
        const chatData = {
          participants: participantIds,
          unreadCount: participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const chatRef = await addDoc(collection(db, 'conversations'), chatData);
        return chatRef.id;

      } catch (error) {
        console.error('Error creating/getting chat:', error);
        throw error;
      }
    },

    subscribeToUserChats: (userId) => {
      const chatsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      return onSnapshot(chatsQuery, (snapshot) => {
        const conversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatConversation[];

        set({ conversations });

        // Subscribe to user profiles for all participants
        const allParticipants = [...new Set(conversations.flatMap(c => c.participants))];
        if (allParticipants.length > 0) {
          get().subscribeToUserProfiles(allParticipants);
        }
      });
    },

    subscribeToMessages: (chatId) => {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];

        set(state => ({
          messages: {
            ...state.messages,
            [chatId]: messages.reverse()
          },
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [chatId]: messages.length === 20
          },
          lastMessageDoc: {
            ...state.lastMessageDoc,
            [chatId]: snapshot.docs[snapshot.docs.length - 1] || null
          }
        }));
      });
    },

    subscribeToUserProfiles: (userIds) => {
      const profilesQuery = query(
        collection(db, 'userProfiles'),
        where('id', 'in', userIds.slice(0, 10)) // Firestore limit
      );

      return onSnapshot(profilesQuery, (snapshot) => {
        const profiles = snapshot.docs.reduce((acc, doc) => {
          const profile = doc.data() as UserProfile;
          acc[profile.id] = profile;
          return acc;
        }, {} as { [userId: string]: UserProfile });

        set(state => ({
          userProfiles: {
            ...state.userProfiles,
            ...profiles
          }
        }));
      });
    },

    reportSpam: async (chatId, reportedBy, reason) => {
      try {
        const reportData = {
          chatId,
          reportedBy,
          reason,
          timestamp: serverTimestamp(),
          status: 'pending'
        };

        await addDoc(collection(db, 'spamReports'), reportData);
        
        // Mark chat as potentially spam
        const chatRef = doc(db, 'conversations', chatId);
        await updateDoc(chatRef, {
          isSpam: true,
          updatedAt: serverTimestamp()
        });

      } catch (error) {
        console.error('Error reporting spam:', error);
        throw error;
      }
    },

    blockUser: async (userId, blockedBy) => {
      try {
        const userRef = doc(db, 'userProfiles', userId);
        await updateDoc(userRef, {
          isBlocked: true,
          blockedBy,
          blockedAt: serverTimestamp()
        });

      } catch (error) {
        console.error('Error blocking user:', error);
        throw error;
      }
    },

    warnUser: async (userId, message, adminId) => {
      try {
        const userRef = doc(db, 'userProfiles', userId);
        const userProfile = get().userProfiles[userId];
        
        const warning = {
          message,
          adminId,
          timestamp: serverTimestamp()
        };

        await updateDoc(userRef, {
          warnings: [...(userProfile?.warnings || []), warning]
        });

      } catch (error) {
        console.error('Error warning user:', error);
        throw error;
      }
    },

    updateUserProfile: async (userId, updates) => {
      try {
        const userRef = doc(db, 'userProfiles', userId);
        await updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });

      } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    },

    clearError: () => set({ error: null })
  }))
);