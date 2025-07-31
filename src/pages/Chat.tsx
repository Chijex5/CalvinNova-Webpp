import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, Phone, Video, CheckCircle, Info, Shield, AlertTriangle, Copy, Reply, Heart, Edit, Trash2, Ban, Flag, Smile, Paperclip, ArrowLeft } from 'lucide-react';
import { useChatStore, useUserOnlineStatus } from '../store/chatStore';
import axios from 'axios';
import { getLastActive } from '../functions/lastActive';
import ContactWarningBanner from '../components/NoContacts';
import { CheckResult } from '../functions/noContact';
import { useUserStore } from '../store/userStore';
import { getUserDisplayName } from '../utils/getUserDisplayName';
import { checkMessage } from '../functions/noContact';
import { useParams, useNavigate } from 'react-router-dom';
import { Channel } from 'stream-chat';
import { client } from '../lib/stream-chat';
import verifiedbadge from '../assets/icons/verified-badge.svg';
import { set } from 'date-fns';
import api from '../utils/apiService';
const agent_id = "support-agent-id";
const we = 'calvinnova_support_team';

// Enhanced Types
export interface User {
  id: string;
  name?: string;
  image?: string;
  userId: string;
}
interface ChatMember {
  user?: User;
}
interface ChatData {
  is_spam?: boolean;
  [key: string]: any;
}
interface Message {
  id: string;
  text: string;
  user: User;
  created_at: string;
  type?: 'system' | 'regular';
  status?: 'sent' | 'delivered' | 'read';
  read_by?: string[];
  read_at?: {
    [userId: string]: string;
  };
  latest_reactions?: Array<{
    type: string;
    user?: User;
  }>;
}
export interface Chat extends Channel {
  id: string | undefined;
  data: ChatData;
  state: {
    members?: {
      [key: string]: ChatMember;
    };
    messages?: Message[];
    unreadCount?: number;
    last_message_at?: string;
    last_read?: {
      [userId: string]: string;
    };
  };
}

// Custom hook for window size detection
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
};

// Enhanced WhatsApp-style date formatting
const formatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (daysDiff === 0) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (daysDiff === 1) {
    return `Yesterday ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } else if (daysDiff < 7) {
    return `${date.toLocaleDateString([], {
      weekday: 'long'
    })} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } else {
    return date.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

// Chat list date formatting (less precise)
const formatChatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (daysDiff === 0) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (daysDiff === 1) {
    return 'Yesterday';
  } else if (daysDiff < 7) {
    return date.toLocaleDateString([], {
      weekday: 'long'
    });
  } else {
    return date.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

// Date separator formatting
const formatDateSeparator = (date: string): string => {
  const msgDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (msgDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (msgDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return msgDate.toLocaleDateString([], {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
};

// Enhanced avatar component with fallback
interface UserAvatarProps {
  user?: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  const fallbackColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
  const getColorFromId = (id: string): string => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbackColors[hash % fallbackColors.length];
  };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  if (user?.id === we || user?.id === agent_id) {
    return <img src="https://i.imgur.com/cXQ5hXr.png" alt={user.name || 'CalvinNova Support'} className={`${sizeClasses[size]} rounded-full object-cover ${className}`} onError={() => setImageError(true)} />;
  }
  if (!user?.image || imageError) {
    return <div className={`${sizeClasses[size]} ${getColorFromId(user?.id || '')} rounded-full flex items-center justify-center text-white font-medium ${className}`}>
        {initials}
      </div>;
  }
  return <img src={user.image} alt={user.name || 'User'} className={`${sizeClasses[size]} rounded-full object-cover ${className}`} onError={() => setImageError(true)} />;
};
interface ResolvedButtonProps {
  userId: string;
  isResolved: boolean;
}
const MarkAsResolvedButton: React.FC<ResolvedButtonProps> = ({
  userId,
  chatId,
  isResolved = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await axios.post('https://chat.calvinnova.com/admin/resolve-chat', {
        agent_id,
        user_id: userId,
        chat_id: chatId
      });
    } catch (error) {
      console.error('Failed to mark as resolved:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return <button onClick={handleClick} disabled={isLoading || isResolved} className={`fixed bottom-20 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${isResolved ? 'bg-green-500 text-white cursor-not-allowed opacity-70' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'}`} title={isResolved ? 'Issue already resolved' : 'Mark as resolved'}>
      {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-6 h-6" />}
    </button>;
};

// Enhanced online indicator component
interface OnlineIndicatorProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
}

// VerifiedBadge.tsx
export const VerifiedBadge = ({
  size = 18
}: {
  size?: number;
}) => <img src={verifiedbadge} alt="Verified" width={size} height={size} className="inline-block" />;
export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  userId,
  size = 'sm'
}) => {
  const isOnline = useUserOnlineStatus(userId);
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  return <>
      {userId === we ? <VerifiedBadge /> : <div className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white shadow-sm`} />}
    </>;
};

// Enhanced typing indicator component
interface TypingIndicatorProps {
  chat: Channel;
}
const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  chat
}) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const {
    user
  } = useUserStore();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (typingUsers.length > 0) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [typingUsers]);
  useEffect(() => {
    const handleTypingStart = (event: any) => {
      const userId = event.user?.id;
      if (userId && userId !== user?.userId) {
        setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
      }
    };
    const handleTypingStop = (event: any) => {
      const userId = event.user?.id;
      if (userId) {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }
    };
    chat.on('typing.start', handleTypingStart);
    chat.on('typing.stop', handleTypingStop);
    return () => {
      chat.off('typing.start', handleTypingStart);
      chat.off('typing.stop', handleTypingStop);
    };
  }, [chat, user?.userId]);
  if (typingUsers.length === 0) return null;
  const name = (id: string) => {
    if (id === we) return 'CalvinNova';
    return getUserDisplayName(id, chat);
  };
  const getOtherUser = (chat: Channel, userId: string): User | undefined => {
    const members = chat.state.members || {};
    return Object.values(members).find(m => m.user?.id === userId)?.user;
  };
  return <div className="flex items-start space-x-3 p-4 sm:p-6 bg-white dark:bg-gray-900 ">
      {/* Avatar(s) */}
      <div className="flex-shrink-0 flex">
        {typingUsers.length === 1 ? <UserAvatar user={getOtherUser(chat, typingUsers[0])} size="sm" className="mt-1" /> : <div className="flex -space-x-2">
            {typingUsers.slice(0, 3).map((userId, index) => <UserAvatar key={userId} user={getOtherUser(chat, userId)} size="sm" className="mt-1 ring-2 ring-white dark:ring-gray-900" />)}
            {typingUsers.length > 3 && <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 mt-1 ring-2 ring-white dark:ring-gray-900">
                +{typingUsers.length - 3}
              </div>}
          </div>}
      </div>
      
      {/* Typing bubble */}
      <div className="flex flex-col space-y-1 max-w-xs">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-1">
            {/* Modern dot animation */}
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{
              animationDelay: '0ms',
              animationDuration: '1.4s'
            }}></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{
              animationDelay: '150ms',
              animationDuration: '1.4s'
            }}></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{
              animationDelay: '300ms',
              animationDuration: '1.4s'
            }}></div>
            </div>
          </div>
        </div>
        
        {/* Typing text */}
        <div className="px-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {typingUsers.length === 1 ? `${name(typingUsers[0])} is typing...` : `${typingUsers.map(id => name(id)).join(', ')} are typing...`}
          </span>
        </div>
      </div>
      
      <div ref={messagesEndRef} className="flex-shrink-0" />
    </div>;
};

// Mobile-first chat inbox component
interface ChatInboxProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
  isMobile: boolean;
  isAdminView: boolean;
}
const ChatInbox: React.FC<ChatInboxProps> = ({
  onChatSelect,
  selectedChatId,
  isMobile,
  isAdminView
}) => {
  const {
    chats,
    isLoadingChats,
    getChatsForUser,
    getAllChats
  } = useChatStore();
  const {
    user
  } = useUserStore();
  const [searchTerm, setSearchTerm] = useState<string>('');
  useEffect(() => {
    if (isAdminView) {
      getAllChats();
    } else {
      getChatsForUser();
    }
  }, [isAdminView, getAllChats, getChatsForUser]);
  const getOtherUser = (chat: Chat): User | undefined => {
    const members = chat.state.members || {};
    return Object.values(members).find(m => m.user?.id !== user?.userId)?.user;
  };
  const filteredChats = chats.filter((chat: Chat) => {
    const otherUser = getOtherUser(chat);
    const chatName = otherUser?.id === we ? "CalvinNova" : otherUser?.name || 'Unknown User';
    return chatName.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const getLastMessage = (chat: Chat): string => {
    const messages = chat.state.messages || [];
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return 'No messages yet';
    if (lastMessage.type === 'system') {
      return '🔒 System message';
    }
    const isCurrentUser = lastMessage.user?.id === user?.userId;
    const prefix = isCurrentUser ? 'You: ' : '';
    return `${prefix}${lastMessage.text || 'Media message'}`;
  };
  const handleChatSelect = async (chat: Chat) => {
    onChatSelect(chat);
    if (chat.id && user?.userId) {
      await chat.markRead();
    }
  };
  return <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Mobile-first header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {isAdminView ? 'All Chats' : 'Messages'}
          </h1>
          {isAdminView && <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">Admin</span>
            </div>}
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input type="text" placeholder="Search conversations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base" />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingChats ? <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div> : filteredChats.length === 0 ? <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-center">No conversations found</p>
          </div> : <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredChats.map((chat: Chat) => {
          const isSelected = selectedChatId === chat.id;
          const unreadCount = chat.countUnread();
          const otherUser = getOtherUser(chat);
          const lastMessage = getLastMessage(chat);
          const lastMessageTime = chat.state.last_message_at;
          return <div key={chat.id || `chat-${Math.random()}`} onClick={() => handleChatSelect(chat)} className={`flex items-center space-x-3 p-4 sm:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <div className="relative flex-shrink-0">
                    <UserAvatar user={otherUser} size="md" />
                    <div className="absolute -bottom-1 -right-1">
                      <OnlineIndicator userId={otherUser?.id || ''} size="sm" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm sm:text-base font-semibold truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {otherUser?.id === we ? 'CalvinNova' : otherUser?.name || 'Unknown User'} 
                      </h3>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {lastMessageTime && <span className={`text-xs sm:text-sm ${unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatChatTime(lastMessageTime)}
                          </span>}
                        {unreadCount > 0 && <span className="bg-green-500 dark:bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center text-center font-medium">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>}
                      </div>
                    </div>
                    
                    <p className={`text-sm sm:text-base truncate ${unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      {lastMessage}
                    </p>
                  </div>
                </div>;
        })}
          </div>}
      </div>
    </div>;
};

// Mobile-first chat header component
interface ChatHeaderProps {
  chat: Channel;
  onBack: () => void;
  showBackButton: boolean;
}
const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onBack,
  showBackButton
}) => {
  const {
    isAdminView,
    flagChat,
    sendSystemMessage
  } = useChatStore();
  const {
    user
  } = useUserStore();
  const [showAdminMenu, setShowAdminMenu] = useState<boolean>(false);
  const members = chat?.state.members || {};
  const otherUser = Object.values(members).find(m => m.user?.id !== user?.userId)?.user;
  const isOtherUserOnline = useUserOnlineStatus(otherUser?.id || '');
  const lastActive = getLastActive({
    chat,
    userId: otherUser?.id || '',
    humanReadable: true
  });
  if (!chat) return null;
  const handleFlagChat = async (): Promise<void> => {
    if (chat?.id) {
      await flagChat(chat.id);
      setShowAdminMenu(false);
    }
  };
  const handleSendWarning = async (): Promise<void> => {
    if (chat?.id) {
      await sendSystemMessage(chat.id, 'This chat is being monitored for policy violations.');
      setShowAdminMenu(false);
    }
  };
  return <div className={`sticky top-0 ${showBackButton ? 'z-50' : 'z-20'} bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm`}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {showBackButton && <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>}
        
        <div className="relative flex-shrink-0">
          <UserAvatar user={otherUser} size="md" />
          <div className="absolute -bottom-1 -right-1">
            <OnlineIndicator userId={otherUser?.id || ''} size="sm" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate">
            {otherUser?.id === we ? 'CalvinNova' : otherUser?.name || 'Unknown User'}
            <p className="md:text-sm text-xs text-gray-500 dark:text-gray-400 truncate">
              {isOtherUserOnline ? 'Online' : otherUser?.id === we ? 'CalvinNova Support' : lastActive ? `Last seen: ${String(lastActive)}` : 'CalvinNova Student'}
            </p>
          </h3>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        
        {isAdminView && <div className="relative">
            <button onClick={() => setShowAdminMenu(!showAdminMenu)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation">
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            {showAdminMenu && <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-30">
                <button onClick={handleFlagChat} className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 touch-manipulation">
                  <Flag className="w-4 h-4" />
                  <span>Flag as Spam</span>
                </button>
                <button onClick={handleSendWarning} className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-orange-600 dark:text-orange-400 touch-manipulation">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Send Warning</span>
                </button>
                <button onClick={() => {/* Handle ban user */}} className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600 dark:text-red-400 touch-manipulation">
                  <Ban className="w-4 h-4" />
                  <span>Ban User</span>
                </button>
              </div>}
          </div>}
      </div>
    </div>;
};
interface ContextMenuState {
  messageId: string;
  message: Message; // You can replace with your Message type
  x: number;
  y: number;
}
interface MessageContextMenuProps {
  contextMenu: ContextMenuState | null;
  onClose: () => void;
  isCurrentUser: boolean;
  currentUser: string;
  messageId: string;
  channel: Channel;
}
const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  contextMenu,
  onClose,
  currentUser,
  isCurrentUser,
  messageId,
  channel
}) => {
  if (!contextMenu) return null;
  const handleAction = async (action: string) => {
    const message = contextMenu.message;
    switch (action) {
      case 'edit':
        console.log('Edit message:', message);
        break;
      case 'delete':
        try {
          await client.deleteMessage(messageId);
          // The message deletion will be handled by the event listener
          console.log('Message deleted successfully');
        } catch (error) {
          console.error('Failed to delete message:', error);
          // You might want to show an error toast here
        }
        break;
      case 'reply':
        console.log('Reply to message:', message);
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(message.text || '');
        } catch (err) {
          console.error('Failed to copy message:', err);
          const textArea = document.createElement('textarea');
          textArea.value = message.text || '';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        break;
      case 'report':
        try {
          await client.flagMessage(messageId, {
            reason: 'Inappropriate content'
          });
          console.log('Message reported successfully');
        } catch (error) {
          console.error('Failed to report message:', error);
        }
        break;
      case 'react':
        try {
          await channel.sendReaction(messageId, {
            type: 'love'
          });
          console.log('Reaction sent successfully');
        } catch (error) {
          console.error('Failed to send reaction:', error);
        }
        break;
    }
    onClose();
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 m-4 w-full max-w-xs">
        <div className="space-y-2">
          {isCurrentUser ?
        // Actions for current user's messages
        <>
              <button onClick={() => handleAction('edit')} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Edit Message</span>
              </button>
              
              <button onClick={() => handleAction('delete')} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 text-red-600 dark:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Delete Message</span>
              </button>
              
              <button onClick={() => handleAction('reply')} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                <Reply className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Reply</span>
              </button>
              
              <button onClick={() => handleAction('copy')} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Copy Message</span>
              </button>
            </> :
        // Actions for other users' messages
        <>
              <button onClick={() => handleAction('report')} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 text-orange-600 dark:text-orange-400 transition-colors">
                <Flag className="w-4 h-4" />
                <span>Report Message</span>
              </button>
              
              <button onClick={() => handleAction('copy')} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Copy Message</span>
              </button>
              
              <button onClick={() => handleAction('reply')} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                <Reply className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Reply</span>
              </button>
              
              <button onClick={() => handleAction('react')} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">React</span>
              </button>
            </>}
        </div>
        
        <button onClick={onClose} className="w-full mt-4 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white">
          Cancel
        </button>
      </div>
    </div>;
};
interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isAdminView: boolean;
  chatId: string;
  chat: Channel;
  isLoading?: boolean;
}
interface ContextMenuState {
  messageId: string;
  message: Message;
  x: number;
  y: number;
}
const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isAdminView,
  chatId,
  chat,
  isLoading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    markChatAsRead
  } = useChatStore();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isLoading]);
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.getAttribute('data-message-id');
          if (messageId) {
            const message = messages.find(msg => msg.id === messageId);
            if (message && message.user?.id !== currentUserId && !message.read_by?.includes(currentUserId)) {
              markChatAsRead(chatId);
            }
          }
        }
      });
    }, {
      threshold: 0.5
    });
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, currentUserId, chatId, markChatAsRead]);
  const handleTouchStart = (message: Message) => {
    const timer = setTimeout(() => {
      setContextMenu({
        messageId: message.id,
        message: message,
        x: 0,
        y: 0
      });
    }, 600);
    setLongPressTimer(timer);
  };
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };
  const groupMessagesByDate = (messages: Message[]): {
    [key: string]: Message[];
  } => {
    const groups: {
      [key: string]: Message[];
    } = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };
  const renderReactionIcon = (reactionType: string) => {
    const iconMap = {
      'love': '❤️',
      'like': '👍',
      'laugh': '😂',
      'wow': '😮',
      'sad': '😢',
      'angry': '😡',
      'fire': '🔥',
      'thumbs_up': '👍',
      'thumbs_down': '👎',
      'heart': '❤️',
      'smile': '😊',
      'cry': '😭'
    };
    return iconMap[reactionType] || reactionType;
  };
  const groupedMessages = groupMessagesByDate(messages);
  return <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900" style={{
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.3"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
  }}>
      <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-6">
              <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
                {formatDateSeparator(date)}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
          const isCurrentUser = message.user?.id === currentUserId;
          const isSystem = message.type === 'system';
          const prevMessage = index > 0 ? dateMessages[index - 1] : null;
          const nextMessage = index < dateMessages.length - 1 ? dateMessages[index + 1] : null;
          const isMobile = window.innerWidth < 768;
          const showAvatar = !isCurrentUser && (!nextMessage || nextMessage.user?.id !== message.user?.id);
          const showName = !isCurrentUser && (!prevMessage || prevMessage.user?.id !== message.user?.id);
          const isGrouped = prevMessage && prevMessage.user?.id === message.user?.id;
          const hasReactions = message.latest_reactions && message.latest_reactions.length > 0;
          if (isSystem) {
            return <div key={message.id} className="flex justify-center my-3">
                    <div className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-sm px-4 py-2 rounded-full shadow-sm border border-amber-200 dark:border-amber-700 max-w-xs">
                      {message.text}
                    </div>
                  </div>;
          }
          return <div key={message.id} data-message-id={message.id} ref={el => {
            if (el && observerRef.current && !isCurrentUser) {
              observerRef.current.observe(el);
            }
          }} onContextMenu={e => {
            // Only run on desktop devices
            if (window.innerWidth >= 768) {
              e.preventDefault(); // stop the default browser menu
              setContextMenu({
                messageId: message.id,
                message,
                x: e.clientX,
                y: e.clientY
              });
            }
          }} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isGrouped && !hasReactions ? 'mb-1' : 'mb-3'} ${hasReactions ? 'mb-6' : ''}`}>
                  <div className={`flex items-end space-x-2 max-w-xs sm:max-w-md lg:max-w-lg ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isCurrentUser && <div className="w-8 h-8 flex-shrink-0">
                        {showAvatar && <UserAvatar user={message.user} size="sm" />}
                      </div>}
                    
                    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} relative`}>
                      {showName && !isCurrentUser && <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-2 font-medium">
                          {message.user?.name || 'Unknown User'}
                          {isAdminView && <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                              ID: {message.user?.id}
                            </span>}
                        </span>}
                      
                      <div className={`px-4 py-2 rounded-2xl select-none shadow-sm break-words relative ${isCurrentUser ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'} ${isGrouped ? 'rounded-t-lg' : ''}`} {...isMobile && {
                  onTouchStart: () => handleTouchStart(message),
                  onTouchEnd: handleTouchEnd,
                  onTouchMove: handleTouchEnd,
                  // Cancel on move
                  onTouchCancel: handleTouchEnd // Cancel on interrupt
                }}>
                        <p className="text-sm sm:text-base leading-relaxed">{message.text}</p>
                        
                        {/* Reactions positioned at bottom-right corner of bubble */}
                        {hasReactions && <div className={`absolute -bottom-2 ${isCurrentUser ? '-left-2' : '-right-2'} flex gap-1 z-10`}>
                            {message.latest_reactions?.map((reaction, i) => <div key={i} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-1 py-1 shadow-md flex items-center gap-1 min-w-fit" style={{
                      fontSize: '12px',
                      lineHeight: '1',
                      maxWidth: '60px'
                    }}>
                                <span className="text-sm leading-none">
                                  {renderReactionIcon(reaction.type)}
                                </span>
                                {reaction.count && reaction.count > 1 && <span className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-none">
                                    {reaction.count}
                                  </span>}
                              </div>)}
                          </div>}
                      </div>
                      
                      <div className="flex items-center space-x-1 mt-1 px-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(message.created_at)}
                        </span>
                        {isAdminView && message.read_by && message.read_by.length > 0 && <span className="text-xs text-gray-400 dark:text-gray-500">
                            Read by {message.read_by.length} user{message.read_by.length > 1 ? 's' : ''}
                          </span>}
                        {/* Show "You reacted" indicator for current user */}
                        {hasReactions && message.latest_reactions.some(r => r.user?.id === currentUserId) && <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                            You reacted
                          </span>}
                      </div>
                    </div>
                  </div>
                </div>;
        })}
          </div>)}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Typing indicator */}
      <TypingIndicator chat={chat} />
      {contextMenu && <MessageContextMenu contextMenu={contextMenu} channel={chat} onClose={() => setContextMenu(null)} isCurrentUser={contextMenu.message.user?.id === currentUserId} currentUser={currentUserId} messageId={contextMenu.messageId} />}
    </div>;
};

// Enhanced message input component
interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  channel: Channel;
}
const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  channel
}) => {
  const [message, setMessage] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }

    // Clear timeout and stop typing only after sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    channel.stopTyping().catch(console.error);
  };
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const handleTextareaChange = async (e: React.ChangeEvent<HTMLTextAreaElement>): Promise<void> => {
    const value = e.target.value;
    setMessage(value);

    // Handle textarea resizing
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }

    // Only send keystroke if there's actual content
    if (value.trim()) {
      try {
        await channel.keystroke();
      } catch (err) {
        console.error("Keystroke failed:", err);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        channel.stopTyping().catch(console.error);
      }, 3000);
    } else {
      // If input is empty, stop typing immediately
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      channel.stopTyping().catch(console.error);
    }
  };
  return <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative min-w-0">
          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors touch-manipulation flex-shrink-0" disabled={disabled}>
              <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            
            <textarea ref={textareaRef} value={message} onChange={handleTextareaChange} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={disabled} className="flex-1 bg-transparent border-none outline-none resize-none text-base placeholder-gray-500 dark:placeholder-gray-400 dark:text-white max-h-[120px] min-h-[24px] leading-6 min-w-0 break-words" style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }} rows={1} />
            
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors touch-manipulation flex-shrink-0" disabled={disabled}>
              <Smile className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <button type="submit" disabled={!message.trim() || disabled} className="flex-shrink-0 p-3 bg-blue-600 dark:bg-blue-700 text-white rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation shadow-lg">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>;
};

// Main chat view component
interface ChatViewProps {
  chat: Chat;
  onBack: () => void;
  showBackButton: boolean;
}
const ChatView: React.FC<ChatViewProps> = ({
  chat,
  onBack,
  showBackButton
}) => {
  const {
    sendMessage,
    isAdminView
  } = useChatStore();
  const {
    user
  } = useUserStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWindowVisible, setIsWindowVisible] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [messages, setMessages] = useState<Message[]>(chat.state.messages || []);
  const currentUserId = user?.userId || '';
  const CHATBOT_ID = "novaplus-support-bot";
  const otherUser = chat.state.members ? Object.values(chat.state.members).find(m => m.user?.id !== agent_id && m.user?.id !== CHATBOT_ID) : undefined;
  useEffect(() => {
    setMessages(chat.state.messages || []);
  }, [chat.state.messages]);
  const isSupportChat = !!chat.state.members && Object.values(chat.state.members).some(member => member.user?.id === CHATBOT_ID);
  useEffect(() => {
    const handleNewMessage = (event: any) => {
      if (event.message) {
        if (!isSupportChat) {
          const result = checkMessage(event.message.text);
          if (result.hasViolation) {
            setCheckResult(result);
            setShowWarning(true);
            if (event.message.user.id === currentUserId) {
              api.post('/api/report', {
                chatId: chat.id,
                message: event.message.text,
                type: result.violations[0].type,
                riskLevel: result.riskLevel,
                match: result.violations[0].match
              });
            }
          }
        }
        setMessages(prev => {
          const existingIndex = prev.findIndex(msg => msg.id === event.message.id);
          if (existingIndex >= 0) {
            // Update existing message
            const updated = [...prev];
            updated[existingIndex] = event.message;
            return updated;
          } else {
            // Add new message
            return [...prev, event.message];
          }
        });
      }
    };
    const handleMessageUpdated = (event: any) => {
      if (event.message) {
        setMessages(prev => {
          const existingIndex = prev.findIndex(msg => msg.id === event.message.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = event.message;
            return updated;
          }
          return prev;
        });
      }
    };
    const handleMessageDeleted = (event: any) => {
      if (event.message) {
        setMessages(prev => prev.filter(msg => msg.id !== event.message.id));
      }
    };

    // Add event listeners
    chat.on('message.new', handleNewMessage);
    chat.on('message.updated', handleMessageUpdated);
    chat.on('message.deleted', handleMessageDeleted);
    return () => {
      // Clean up event listeners
      chat.off('message.new', handleNewMessage);
      chat.off('message.updated', handleMessageUpdated);
      chat.off('message.deleted', handleMessageDeleted);
    };
  }, [chat]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsWindowVisible(!document.hidden);
    };
    const handleWindowFocus = () => setIsWindowVisible(true);
    const handleWindowBlur = () => setIsWindowVisible(false);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Add auto-mark as read logic
  useEffect(() => {
    if (chat && isWindowVisible && messages.length > 0) {
      const unreadMessages = messages.filter(msg => msg.user?.id !== currentUserId && !msg.read_by?.includes(currentUserId));
      if (unreadMessages.length > 0) {
        chat.markRead();
      }
    }
  }, [chat, isWindowVisible, messages, currentUserId]);
  const handleSendMessage = async (text: string): Promise<void> => {
    if (!chat.id || isLoading) return;
    setIsLoading(true);
    try {
      await sendMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return <>
      {showWarning && checkResult && <ContactWarningBanner checkResult={checkResult} onDismiss={() => {
      setShowWarning(false);
      setCheckResult(null);
    }} />}
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <ChatHeader chat={chat} onBack={onBack} showBackButton={showBackButton} />
        
        <MessageList messages={messages} currentUserId={currentUserId} isAdminView={isAdminView} chatId={chat?.id || ''} chat={chat} isLoading={isLoading} />
        
        <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} placeholder={isLoading ? "Sending..." : "Type a message..."} channel={chat} />

        {user?.userId === agent_id && otherUser?.user?.id && <MarkAsResolvedButton userId={otherUser?.user?.id || ''} isResolved={false} chatId={chat.id || ''} />}
      </div>
    </>;
};

// Main chat interface component
const ChatInterface: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showChatView, setShowChatView] = useState<boolean>(false);
  const {
    isAdminView
  } = useChatStore();
  const {
    width
  } = useWindowSize();
  const navigate = useNavigate();
  const {
    chatId
  } = useParams<{
    chatId: string;
  }>();
  const chats = useChatStore(state => state.chats);
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setSelectedChat(chat);
        chat.markRead();
        setShowChatView(true);

        // 👇 Clean up the URL right after setting state
        navigate('/chat', {
          replace: true
        });
      }
    }
  }, [chatId, chats]);
  const isMobile = width < 768;
  const handleChatSelect = (chat: Chat): void => {
    setSelectedChat(chat);
    chat.markRead();
    useChatStore.getState().getChatDetails(chat.id || '');
    if (isMobile) {
      setShowChatView(true);
    }
  };
  const handleBackToInbox = (): void => {
    setShowChatView(false);
    setSelectedChat(null);
  };

  // Mobile view logic
  if (isMobile) {
    if (showChatView && selectedChat) {
      return <div className="h-screen flex flex-col">
          <ChatView chat={selectedChat} onBack={handleBackToInbox} showBackButton={true} />
        </div>;
    }
    return <div className="h-screen flex flex-col">
        <ChatInbox onChatSelect={handleChatSelect} selectedChatId={selectedChat?.id} isMobile={true} isAdminView={isAdminView} />
      </div>;
  }

  // Desktop view
  return <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r border-gray-200 bg-white">
        <ChatInbox onChatSelect={handleChatSelect} selectedChatId={selectedChat?.id} isMobile={false} isAdminView={isAdminView} />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? <ChatView chat={selectedChat} onBack={handleBackToInbox} showBackButton={false} /> : <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Welcome to CalvinNova Chat
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Select a conversation from the sidebar to start messaging. 
                Connect with students and staff securely.
              </p>
            </div>
          </div>}
      </div>
    </div>;
};
export default ChatInterface;