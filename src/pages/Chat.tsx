import React, { useState, useEffect, useRef } from 'react';
import { useInitStreamChat } from '../hooks/useInitStreamChat';
import { Search, Send, MoreVertical, Phone, Video, Info, Shield, AlertTriangle, Ban, Flag, Smile, Paperclip, ChevronLeft } from 'lucide-react';
import { useChatStore, useTypingUsers, useUserOnlineStatus } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { Channel } from 'stream-chat';

// Types
interface User {
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

interface Chat extends Channel {
  id?: string;
  data: ChatData;
  state: {
    members?: { [key: string]: ChatMember };
    messages?: any[];
    unreadCount?: number;
    last_message_at?: string;
  };
}

// Utility function to format timestamps
const formatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

// Online indicator component
interface OnlineIndicatorProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
}

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({ userId, size = 'sm' }) => {
  const isOnline = useUserOnlineStatus(userId);
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white`} />
  );
};

// Typing indicator component
interface TypingIndicatorProps {
  channelId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ channelId }) => {
  const typingUsers = useTypingUsers(channelId);
  
  if (typingUsers.length === 0) return null;
  
  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>
        {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
      </span>
    </div>
  );
};

// Chat sidebar component
interface ChatSidebarProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
  isMobile: boolean;
  onCloseSidebar: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onChatSelect, selectedChatId, isMobile, onCloseSidebar }) => {
  const { chats, isLoadingChats, isAdminView, getChatsForUser, getAllChats } = useChatStore();
  const { user } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAdminView) {
      getAllChats();
    } else {
      getChatsForUser();
    }
  }, [isAdminView, getAllChats, getChatsForUser]);

  const filteredChats = chats.filter((chat: Chat) => {
    const members = chat.state.members || {};
    const otherUser = Object.values(members).find(m => m.user?.id !== user?.userId)?.user;
    const chatName = otherUser?.name || 'Unknown User';
    return chatName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getLastMessage = (chat: Chat): string => {
    const messages = chat.state.messages || [];
    const lastMessage = messages[messages.length - 1];
    return lastMessage?.text || 'No messages yet';
  };

  const getUnreadCount = (chat: Chat): number => {
    return chat.state.unreadCount || 0;
  };

  const getChatName = (chat: Chat): string => {
    const members = chat.state.members || {};
    const otherUser = Object.values(members).find(m => m.user?.id !== user?.userId)?.user;
    return otherUser?.name || 'Unknown User';
  };

  const getChatAvatar = (chat: Chat): string => {
    const members = chat.state.members || {};
    const otherUser = Object.values(members).find(m => m.user?.id !== user?.userId)?.user;
    return otherUser?.image || `/api/placeholder/40/40?text=${getChatName(chat).charAt(0)}`;
  };

  const getOtherUserId = (chat: Chat): string => {
    const members = chat.state.members || {};
    const otherUser = Object.values(members).find(m => m.user?.id !== user?.userId)?.user;
    return otherUser?.id || '';
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${isMobile ? 'w-full' : 'w-80'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isAdminView ? 'All Chats (Admin)' : 'Messages'}
          </h2>
          {isAdminView && (
            <Shield className="w-5 h-5 text-blue-600" />
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingChats ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat: Chat) => {
              const isSelected = selectedChatId === chat.id;
              const unreadCount = getUnreadCount(chat);
              const chatName = getChatName(chat);
              const lastMessage = getLastMessage(chat);
              const lastMessageTime = chat.state.last_message_at;
              const otherUserId = getOtherUserId(chat);
              
              return (
                <div
                  key={chat.id || `chat-${Math.random()}`}
                  onClick={() => {
                    onChatSelect(chat);
                    if (isMobile) onCloseSidebar();
                  }}
                  className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={getChatAvatar(chat)}
                      alt={chatName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      <OnlineIndicator userId={otherUserId} size="sm" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {chatName}
                      </h3>
                      {lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {formatTime(lastMessageTime)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Chat header component
interface ChatHeaderProps {
  chat: Chat;
  isMobile: boolean;
  onShowSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, isMobile, onShowSidebar }) => {
  const { isAdminView, flagChat, sendSystemMessage } = useChatStore();
  const { user } = useUserStore();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  
  if (!chat) return null;

  const members = chat.state.members || {};
  const currentUserId = user?.userId;

  // Find the other member
  const otherUser = Object.values(members).find(m => m.user?.id !== currentUserId)?.user;

  // Fallbacks
  const chatName = otherUser?.name || 'Unknown User';
  const chatAvatar = otherUser?.image || `/api/placeholder/32/32?text=${chatName.charAt(0)}`;

  const handleFlagChat = async () => {
    await flagChat(chat?.id || '');
    setShowAdminMenu(false);
  };

  const handleSendWarning = async () => {
    await sendSystemMessage(chat?.id || " ", '⚠️ This chat is being monitored for policy violations.');
    setShowAdminMenu(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {isMobile && (
          <button
            onClick={onShowSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="relative">
          <img
            src={chatAvatar}
            alt={chatName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1">
            <OnlineIndicator userId={otherUser?.id || ''} size="sm" />
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900">{chatName}</h3>
          <p className="text-sm text-gray-500">CalvinNova Student</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Info className="w-5 h-5 text-gray-600" />
        </button>
        
        {isAdminView && (
          <div className="relative">
            <button
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {showAdminMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleFlagChat}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-yellow-600"
                >
                  <Flag className="w-4 h-4" />
                  <span>Flag as Spam</span>
                </button>
                <button
                  onClick={handleSendWarning}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-orange-600"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Send Warning</span>
                </button>
                <button
                  onClick={() => {/* Handle ban user */}}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                >
                  <Ban className="w-4 h-4" />
                  <span>Ban User</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Message list component
interface MessageListProps {
  messages: any[];
  currentUserId: string;
  isAdminView: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, isAdminView }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {new Date(date).toLocaleDateString([], { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Messages for this date */}
          {dateMessages.map((message, index) => {
            const isCurrentUser = message.user?.id === currentUserId;
            const isSystem = message.type === 'system';
            const prevMessage = index > 0 ? dateMessages[index - 1] : null;
            const nextMessage = index < dateMessages.length - 1 ? dateMessages[index + 1] : null;
            
            const showAvatar = !isCurrentUser && (!nextMessage || nextMessage.user?.id !== message.user?.id);
            const showName = !isCurrentUser && (!prevMessage || prevMessage.user?.id !== message.user?.id);

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center my-2">
                  <div className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                    {message.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isCurrentUser && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && (
                        <img
                          src={`/api/placeholder/32/32?text=${message.user?.name?.charAt(0) || 'U'}`}
                          alt={message.user?.name || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {showName && !isCurrentUser && (
                      <span className="text-xs text-gray-500 mb-1 px-2">
                        {message.user?.name || 'Unknown User'}
                        {isAdminView && (
                          <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                            {message.user?.id}
                          </span>
                        )}
                      </span>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    
                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Message input component
interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  interface HandleKeyPressEvent {
    key: string;
    shiftKey: boolean;
    preventDefault: () => void;
  }

  const handleKeyPress = (e: HandleKeyPressEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-2">
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
        </div>
        
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Smile className="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ type }) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {type === 'no-chat' ? 'No chat selected' : 'No messages yet'}
        </h3>
        <p className="text-gray-500">
          {type === 'no-chat' 
            ? 'Select a conversation to start messaging' 
            : 'Send a message to start the conversation'}
        </p>
      </div>
    </div>
  );
};

// Main chat component
const Chat = () => {
  const { 
    currentChat, 
    messages, 
    isAdminView, 
    setAdminView, 
    getChatDetails, 
    sendMessage, 
    clearChat, 
    error,
    isSendingMessage 
  } = useChatStore();
  const { user } = useUserStore();
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const isAdmin = user?.role === 'admin' || false;
  console.log('isAdmin:', isAdmin, 'user role:', user?.role);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChatSelect = async (chat) => {
    if (currentChat?.id !== chat.id) {
      clearChat();
      await getChatDetails(chat.id);
    }
  };

  const handleSendMessage = async (text) => {
    if (currentChat) {
      await sendMessage(text);
    }
  };

  const handleAdminToggle = () => {
    setAdminView(!isAdminView);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Admin Toggle (if user is admin) */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleAdminToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAdminView
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isAdminView ? 'Exit Admin Mode' : 'Admin Mode'}
          </button>
        </div>
      )}

      {/* Sidebar */}
      {(!isMobile || showSidebar) && (
        <ChatSidebar
          onChatSelect={handleChatSelect}
          selectedChatId={currentChat?.id}
          isMobile={isMobile}
          onCloseSidebar={() => setShowSidebar(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <ChatHeader
              chat={currentChat}
              isMobile={isMobile}
              onShowSidebar={() => setShowSidebar(true)}
            />
            
            <MessageList
              messages={messages}
              currentUserId={user?.userId || ''} 
              isAdminView={isAdminView}
            />
            
            <TypingIndicator channelId={currentChat?.id || ''} />
            
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isSendingMessage}
            />
          </>
        ) : (
          <EmptyState type="no-chat" />
        )}
      </div>

      {/* Error notification */}
      {error && (
        <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default Chat;