import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AdminChatManager from './AdminChatManager';
import { 
  SendIcon, 
  MoreVerticalIcon, 
  FlagIcon, 
  UserXIcon, 
  MessageSquareIcon, 
  ImageIcon, 
  SmileIcon,
  ArrowLeftIcon,
  PhoneIcon,
  VideoIcon,
  SearchIcon,
  PlusIcon,
  CheckIcon,
  CheckCheckIcon,
  ClockIcon
} from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuth } from '../context/AuthContext';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

const Chat = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const {
    conversations,
    messages,
    userProfiles,
    selectedConversation,
    loading,
    error,
    messageLoading,
    setSelectedConversation,
    sendMessage,
    markAsRead,
    loadMoreMessages,
    createOrGetChat,
    subscribeToUserChats,
    subscribeToMessages,
    reportSpam,
    blockUser,
    clearError
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const unsubscribeRefs = useRef<{ [key: string]: () => void }>({});

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedConversation]);

  // Subscribe to user chats
  useEffect(() => {
    if (user?.userId) {
      const unsubscribe = subscribeToUserChats(user.userId);
      unsubscribeRefs.current['userChats'] = unsubscribe;
      return () => unsubscribe();
    }
  }, [user?.userId, subscribeToUserChats]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const unsubscribe = subscribeToMessages(selectedConversation);
      unsubscribeRefs.current[`messages_${selectedConversation}`] = unsubscribe;
      
      // Mark as read when conversation is opened
      if (user?.userId) {
        markAsRead(selectedConversation, user.userId);
      }
      
      return () => unsubscribe();
    }
  }, [selectedConversation, subscribeToMessages, markAsRead, user?.userId]);

  // Handle userId from URL params
  useEffect(() => {
    if (userId && user?.userId) {
      createOrGetChat([user.userId, userId]).then(chatId => {
        setSelectedConversation(chatId);
        setShowMobileConversations(false);
      });
    }
  }, [userId, user?.userId, createOrGetChat, setSelectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && selectedConversation) {
      await sendMessage(selectedConversation, messageText.trim());
      setMessageText('');
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowMobileConversations(false);
  };

  const handleBackToConversations = () => {
    setShowMobileConversations(true);
    setSelectedConversation(null);
  };

  const toggleMenu = (conversationId: string) => {
    setShowMenu(showMenu === conversationId ? null : conversationId);
  };

  const handleReportSpam = async (conversationId: string) => {
    if (user?.userId) {
      try {
        await reportSpam(conversationId, user.userId, 'Spam reported by user');
        setShowMenu(null);
      } catch (error) {
        console.error('Error reporting spam:', error);
      }
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (user?.userId) {
      try {
        await blockUser(userId, user.userId);
        setShowMenu(null);
      } catch (error) {
        console.error('Error blocking user:', error);
      }
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const formatLastSeen = (timestamp: any) => {
    if (!timestamp) return 'Last seen long ago';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  const getMessageStatus = (message: any) => {
    if (message.senderId !== user?.userId) return null;
    
    if (message.read) {
      return <CheckCheckIcon size={14} className="text-blue-500" />;
    } else {
      return <CheckIcon size={14} className="text-gray-400" />;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find(p => p !== user?.userId);
    const profile = otherUser ? userProfiles[otherUser] : null;
    return profile?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const currentMessages = selectedConversation ? messages[selectedConversation] || [] : [];
  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const otherUserId = currentConversation?.participants.find(p => p !== user?.userId);
  const otherUserProfile = otherUserId ? userProfiles[otherUserId] : null;

  if (user?.role === 'admin') {
    return <AdminChatManager />;
  }
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={clearError}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Messages</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <PlusIcon size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`${showMobileConversations ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-col bg-white border-r border-gray-200`}>
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <PlusIcon size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conversation => {
                const otherUser = conversation.participants.find(p => p !== user?.userId);
                const profile = otherUser ? userProfiles[otherUser] : null;
                const unreadCount = user?.userId ? conversation.unreadCount[user.userId] || 0 : 0;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={`flex items-center p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedConversation === conversation.id 
                        ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      <img 
                        src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${profile?.name || 'User'}&background=6366f1&color=fff`}
                        alt={profile?.name || 'User'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {profile?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 ml-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{profile?.name || 'Unknown User'}</h3>
                        <div className="flex items-center space-x-2">
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage?.text || 'No messages yet'}
                        </p>
                        {conversation.isSpam && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            Spam
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <MoreVerticalIcon size={16} />
                      </button>
                      
                      {showMenu === conversation.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                          <button
                            onClick={() => handleReportSpam(conversation.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                          >
                            <FlagIcon size={16} className="mr-2" />
                            Report Spam
                          </button>
                          <button
                            onClick={() => otherUser && handleBlockUser(otherUser)}
                            className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50"
                          >
                            <UserXIcon size={16} className="mr-2" />
                            Block User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={`${showMobileConversations ? 'hidden' : 'flex'} md:flex flex-1 flex-col bg-white`}>
          {selectedConversation && otherUserProfile ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={handleBackToConversations}
                      className="md:hidden p-2 mr-2 hover:bg-gray-100 rounded-full"
                    >
                      <ArrowLeftIcon size={20} />
                    </button>
                    
                    <div className="relative">
                      <img 
                        src={otherUserProfile.avatarUrl || `https://ui-avatars.com/api/?name=${otherUserProfile.name}&background=6366f1&color=fff`}
                        alt={otherUserProfile.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {otherUserProfile.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="ml-3">
                      <h3 className="font-medium">{otherUserProfile.name}</h3>
                      <p className="text-xs text-gray-500">
                        {otherUserProfile.isOnline ? 'Online' : formatLastSeen(otherUserProfile.lastSeen)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                      <PhoneIcon size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                      <VideoIcon size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                      <MoreVerticalIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {messageLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                )}
                
                {currentMessages.length > 0 ? (
                  currentMessages.map((message, index) => {
                    const isOwnMessage = message.senderId === user?.userId;
                    const showTimeStamp = index === 0 || 
                      (currentMessages[index - 1] && 
                       new Date(currentMessages[index - 1].timestamp?.toDate()).getTime() - 
                       new Date(message.timestamp?.toDate()).getTime() > 300000); // 5 minutes
                    
                    return (
                      <div key={message.id}>
                        {showTimeStamp && (
                          <div className="text-center text-xs text-gray-500 mb-4">
                            {formatMessageTime(message.timestamp)}
                          </div>
                        )}
                        
                        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${
                            isOwnMessage 
                              ? 'bg-blue-600 text-white rounded-br-md' 
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}>
                            <p className="text-sm">{message.text}</p>
                            
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${
                              isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {format(message.timestamp?.toDate() || new Date(), 'HH:mm')}
                              </span>
                              {getMessageStatus(message)}
                              {message.edited && (
                                <span className="text-xs opacity-75">edited</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquareIcon size={28} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Start the conversation by sending a message to {otherUserProfile.name}
                    </p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      placeholder={`Message ${otherUserProfile.name}...`}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={1}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    
                    <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                      >
                        <SmileIcon size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      messageText.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <SendIcon size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <MessageSquareIcon size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Messages</h3>
              <p className="text-gray-600 max-w-md mb-8">
                Select a conversation from the sidebar to start chatting, or contact a seller 
                from a product page to begin a new conversation.
              </p>
              <button
                onClick={() => setShowMobileConversations(true)}
                className="md:hidden bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Conversations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;