import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useUserStore } from './userStore';
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
  markChatAsRead: (channelId: string) => Promise<void>;
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

          const allParticipants = [...new Set([currentUser, ...participantIds])];
          const channelId = allParticipants.sort().join('-');

          let channel: Channel;
          try {
            channel = client.channel('messaging', channelId, {
              members: allParticipants,
              created_by_id: currentUser,
            });

            await channel.watch(); // If channel doesn't exist, this creates & watches it
          } catch (error) {
            console.error('Error creating/accessing channel:', error);
            throw error;
          }

          // Set as current chat
          set({ currentChat: channel });
          await get().getChatDetails(channelId);

          // Add to chat list if new
          const { chats } = get();
          if (!chats.find(chat => chat.id === channelId)) {
            set({ chats: [...chats, channel] });
          }

          return channelId;

        } catch (error) {
          console.error('Error starting messaging:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to start messaging',
          });
          return null; // ❌ Don't return chatId on error
        } finally {
          set({ isCreatingChat: false });
        }
      },

      getChatsForUser: async () => {
        try {
          set({ isLoadingChats: true, error: null });

          const currentUser = client.userID;
          const CHATBOT_ID = "novaplus-support-bot";
          const SUPPORT_AGENT_ID = "support-agent-id";

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

          // Manually filter out channels that include the chatbot,
          // except when current user is the support agent
          const filteredChannels = channels.filter((channel) => {
            const members = Object.values(channel.state.members ?? {});
            const includesBot = members.some((m) => m.user?.id === CHATBOT_ID);

            if (includesBot && currentUser !== SUPPORT_AGENT_ID) {
              return false;
            }

            return true;
          });

          set({ chats: filteredChannels });
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

      markChatAsRead: async (channelId: string) => {
        try {
          const channel = client.channel('messaging', channelId);
          await channel.markRead();
        } catch (error) {
          console.error(`Failed to mark chat ${channelId} as read`, error);
        }
      },
      // Admin functions
      getAllChats: async () => {
        try {
          set({ isLoadingChats: true, error: null });
          
          const currentUser = client.userID;
          const CHATBOT_ID = "novaplus-support-bot";
          const SUPPORT_AGENT_ID = "support-agent-id";

          if (!currentUser) {
            throw new Error('User not authenticated');
          }
          
          const filters = {
            type: 'messaging',
          };
          
          const sort = [{ last_message_at: -1 }];
          const options = { limit: 100, presence: true };
          
          const channels = await client.queryChannels(filters, sort, options);
          
          const filteredChannels = channels.filter((channel) => {
            const members = Object.values(channel.state.members ?? {});
            const includesBot = members.some((m) => m.user?.id === CHATBOT_ID);

            if (includesBot && currentUser !== SUPPORT_AGENT_ID) {
              return false;
            }

            return true;
          });

          set({ chats: filteredChannels });
          
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
    
    const userId = useUserStore.getState().user?.userId;

    return Object.keys(typingUsers)
      .filter(id => typingUsers[id] && id !== userId);
  });
};

// Fixed utility hook for getting online status
export const useUserOnlineStatus = (userId: string): boolean => {
  return useChatStore(state => state.isUserOnline(userId));
};