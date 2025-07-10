import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Channel, StreamChat, Message as StreamMessage, Event } from 'stream-chat';
import { client } from '../lib/stream-chat';

// Types
interface TypingUsers {
  [channelId: string]: {
    [userId: string]: boolean;
  };
}

interface ChatState {
  // Core state
  chats: Channel[];
  currentChat: Channel | null;
  messages: StreamMessage[];
  
  // Loading states
  isLoadingChats: boolean;
  isCreatingChat: boolean;
  isSendingMessage: boolean;
  
  // Admin/User mode
  isAdminView: boolean;
  
  // Bonus features
  typingUsers: TypingUsers;
  
  // Error handling
  error: string | null;
  
  // User functions
  startMessaging: (participantIds: string[]) => Promise<void>;
  getChatsForUser: () => Promise<void>;
  getChatDetails: (channelId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  
  // Admin functions
  getAllChats: () => Promise<void>;
  flagChat: (channelId: string) => Promise<void>;
  sendSystemMessage: (channelId: string, text: string) => Promise<void>;
  banUser: (userId: string, reason?: string) => Promise<void>;
  
  // Utility functions
  setAdminView: (isAdmin: boolean) => void;
  setError: (error: string | null) => void;
  isUserOnline: (userId: string) => boolean;
  
  // Typing functions
  startTyping: (channelId: string) => Promise<void>;
  stopTyping: (channelId: string) => Promise<void>;
  handleTypingEvent: (event: Event) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      chats: [],
      currentChat: null,
      messages: [],
      isLoadingChats: false,
      isCreatingChat: false,
      isSendingMessage: false,
      isAdminView: false,
      typingUsers: {},
      error: null,

      // User functions
      startMessaging: async (participantIds: string[]) => {
        try {
          set({ isCreatingChat: true, error: null });
          
          const currentUser = client.userID;
          if (!currentUser) {
            throw new Error('User not authenticated');
          }
          
          // Include current user in participants
          const allParticipants = [...new Set([currentUser, ...participantIds])];
          
          // Create channel ID based on sorted participant IDs for consistency
          const channelId = allParticipants.sort().join('-');
          
          // Check if channel already exists
          let channel: Channel;
          try {
            channel = client.channel('messaging', channelId, {
              members: allParticipants,
              created_by_id: currentUser,
            });
            
            await channel.watch();
          } catch (error) {
            console.error('Error creating/accessing channel:', error);
            throw error;
          }
          
          // Set as current chat and load messages
          set({ currentChat: channel });
          await get().getChatDetails(channelId);
          
          // Add to chats list if not already there
          const { chats } = get();
          if (!chats.find(chat => chat.id === channelId)) {
            set({ chats: [...chats, channel] });
          }
          
        } catch (error) {
          console.error('Error starting messaging:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to start messaging' });
        } finally {
          set({ isCreatingChat: false });
        }
      },

      getChatsForUser: async () => {
        try {
          set({ isLoadingChats: true, error: null });
          
          const currentUser = client.userID;
          if (!currentUser) {
            throw new Error('User not authenticated');
          }
          
          const filters = {
            type: 'messaging',
            members: { $in: [currentUser] },
          };
          
          const sort = [{ last_message_at: -1 }];
          const options = { limit: 50, presence: true };
          
          const channels = await client.queryChannels(filters, sort, options);
          
          set({ chats: channels });
          
        } catch (error) {
          console.error('Error fetching user chats:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch chats' });
        } finally {
          set({ isLoadingChats: false });
        }
      },

      getChatDetails: async (channelId: string) => {
        try {
          set({ isLoadingChats: true, error: null });
          
          const channel = client.channel('messaging', channelId);
          await channel.watch();
          
          const messagesResponse = await channel.query({
            messages: { limit: 50 },
            presence: true,
          });
          
          set({ 
            currentChat: channel,
            messages: messagesResponse.messages || [],
          });
          
          // Set up real-time event listeners
          channel.on('message.new', (event) => {
            if (event.message) {
              set(state => ({
                messages: [...state.messages, event.message!]
              }));
            }
          });
          
          channel.on('message.updated', (event) => {
            if (event.message) {
              set(state => ({
                messages: state.messages.map(msg => 
                  msg.id === event.message!.id ? event.message! : msg
                )
              }));
            }
          });
          
          channel.on('message.deleted', (event) => {
            if (event.message) {
              set(state => ({
                messages: state.messages.filter(msg => msg.id !== event.message!.id)
              }));
            }
          });
          
          // Set up typing event listeners
          channel.on('typing.start', get().handleTypingEvent);
          channel.on('typing.stop', get().handleTypingEvent);
          
        } catch (error) {
          console.error('Error fetching chat details:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch chat details' });
        } finally {
          set({ isLoadingChats: false });
        }
      },

      sendMessage: async (text: string) => {
        try {
          const { currentChat } = get();
          if (!currentChat) {
            throw new Error('No active chat selected');
          }
          
          set({ isSendingMessage: true, error: null });
          
          await currentChat.sendMessage({
            text: text.trim(),
          });
          
        } catch (error) {
          console.error('Error sending message:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to send message' });
        } finally {
          set({ isSendingMessage: false });
        }
      },

      clearChat: () => {
        const { currentChat } = get();
        if (currentChat) {
          // Remove event listeners
          currentChat.off('message.new');
          currentChat.off('message.updated');
          currentChat.off('message.deleted');
          currentChat.off('typing.start');
          currentChat.off('typing.stop');
        }
        
        set({ 
          currentChat: null, 
          messages: [],
          error: null,
        });
      },

      // Admin functions
      getAllChats: async () => {
        try {
          set({ isLoadingChats: true, error: null });
          
          const filters = {
            type: 'messaging',
          };
          
          const sort = [{ last_message_at: -1 }];
          const options = { limit: 100, presence: true };
          
          const channels = await client.queryChannels(filters, sort, options);
          
          set({ chats: channels });
          
        } catch (error) {
          console.error('Error fetching all chats (admin):', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch all chats' });
        } finally {
          set({ isLoadingChats: false });
        }
      },

      flagChat: async (channelId: string) => {
        try {
          set({ error: null });
          
          const channel = client.channel('messaging', channelId);
          await channel.updatePartial({
            set: {
              is_spam: true,
              flagged_at: new Date().toISOString(),
              flagged_by: client.userID,
            },
          });
          
          // Update local state
          set(state => ({
            chats: state.chats.map(chat =>
              chat.id === channelId 
                ? { ...chat, data: { ...chat.data, is_spam: true } }
                : chat
            ),
          }));
          
        } catch (error) {
          console.error('Error flagging chat:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to flag chat' });
        }
      },

      sendSystemMessage: async (channelId: string, text: string) => {
        try {
          set({ isSendingMessage: true, error: null });
          
          const channel = client.channel('messaging', channelId);
          await channel.sendMessage({
            text,
            type: 'system',
            user: {
              id: 'system',
              name: 'System',
              role: 'admin',
            },
          });
          
        } catch (error) {
          console.error('Error sending system message:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to send system message' });
        } finally {
          set({ isSendingMessage: false });
        }
      },

      banUser: async (userId: string, reason = 'Violation of community guidelines') => {
        try {
          set({ error: null });
          
          await client.banUser(userId, {
            reason,
            timeout: 60 * 24 * 7, // 7 days in minutes
          });
          
        } catch (error) {
          console.error('Error banning user:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to ban user' });
        }
      },

      // Utility functions
      setAdminView: (isAdmin: boolean) => {
        set({ isAdminView: isAdmin });
        // Clear current data when switching modes
        get().clearChat();
        set({ chats: [] });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      isUserOnline: (userId: string) => {
        try {
          const user = client.state.users[userId];
          return user?.online || false;
        } catch (error) {
          console.error('Error checking user online status:', error);
          return false;
        }
      },

      // Typing functions
      startTyping: async (channelId: string) => {
        try {
          const channel = client.channel('messaging', channelId);
          await channel.keystroke();
        } catch (error) {
          console.error('Error starting typing:', error);
        }
      },

      stopTyping: async (channelId: string) => {
        try {
          const channel = client.channel('messaging', channelId);
          await channel.stopTyping();
        } catch (error) {
          console.error('Error stopping typing:', error);
        }
      },

      handleTypingEvent: (event: Event) => {
        if (!event.channel_id || !event.user?.id) return;
        
        const channelId = event.channel_id;
        const userId = event.user.id;
        const isTyping = event.type === 'typing.start';
        
        set(state => ({
          typingUsers: {
            ...state.typingUsers,
            [channelId]: {
              ...state.typingUsers[channelId],
              [userId]: isTyping,
            },
          },
        }));
        
        // Clean up typing state after timeout
        if (isTyping) {
          setTimeout(() => {
            set(state => ({
              typingUsers: {
                ...state.typingUsers,
                [channelId]: {
                  ...state.typingUsers[channelId],
                  [userId]: false,
                },
              },
            }));
          }, 3000);
        }
      },
    }),
    {
      name: 'chat-store',
    }
  )
);

// Fixed utility hook for getting typing users in current channel
export const useTypingUsers = (channelId: string): string[] => {
  return useChatStore(state => {
    const typingUsers = state.typingUsers[channelId];
    if (!typingUsers) return [];
    
    return Object.keys(typingUsers).filter(userId => typingUsers[userId]);
  }, 
  // Add shallow comparison to prevent infinite loops
  (a, b) => {
    if (a.length !== b.length) return false;
    return a.every((item, index) => item === b[index]);
  });
};

// Fixed utility hook for getting online status
export const useUserOnlineStatus = (userId: string): boolean => {
  return useChatStore(state => state.isUserOnline(userId));
};