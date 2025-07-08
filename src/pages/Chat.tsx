import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { SendIcon, MoreVerticalIcon, FlagIcon, UserXIcon, MessageSquareIcon, ImageIcon, SmileIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Button from '../components/Button';
const Chat = () => {
  const {
    userId
  } = useParams<{
    userId?: string;
  }>();
  const {
    user
  } = useAuth();
  const {
    conversations,
    messages,
    sendMessage
  } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(userId || null);
  const [messageText, setMessageText] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, selectedConversation]);
  // Set initial conversation if userId is provided
  useEffect(() => {
    if (userId) {
      setSelectedConversation(userId);
    }
  }, [userId]);
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && selectedConversation) {
      sendMessage(selectedConversation, messageText);
      setMessageText('');
    }
  };
  const toggleMenu = (conversationId: string) => {
    setShowMenu(showMenu === conversationId ? null : conversationId);
  };
  const currentMessages = selectedConversation ? messages.filter(m => m.senderId === selectedConversation || m.receiverId === selectedConversation) : [];
  const currentConversation = conversations.find(c => c.userId === selectedConversation);
  return <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] border border-gray-200 rounded-lg overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-1/3 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {conversations.length > 0 ? conversations.map(conversation => <div key={conversation.userId} onClick={() => setSelectedConversation(conversation.userId)} className={`flex items-center p-4 border-b border-gray-100 cursor-pointer ${selectedConversation === conversation.userId ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <img src={conversation.avatar} alt={conversation.name} className="w-12 h-12 rounded-full mr-3" />
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{conversation.name}</h3>
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <div className="relative">
                    <button onClick={e => {
                e.stopPropagation();
                toggleMenu(conversation.userId);
              }} className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                      <MoreVerticalIcon size={16} />
                    </button>
                    {showMenu === conversation.userId && <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                          <FlagIcon size={16} className="mr-2" />
                          Report User
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100">
                          <UserXIcon size={16} className="mr-2" />
                          Block User
                        </button>
                      </div>}
                  </div>
                </div>) : <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>}
          </div>
        </div>
        {/* Messages */}
        <div className="flex-grow flex flex-col bg-gray-50">
          {selectedConversation ? <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center">
                {currentConversation && <>
                    <img src={currentConversation.avatar} alt={currentConversation.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <h3 className="font-medium">
                        {currentConversation.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {currentConversation.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </>}
              </div>
              {/* Messages container */}
              <div className="flex-grow p-4 overflow-y-auto">
                {currentMessages.length > 0 ? currentMessages.map((message, index) => {
              const isOwnMessage = message.senderId === user?.id;
              return <div key={index} className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${isOwnMessage ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
                          <p>{message.text}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                            {message.time}
                          </p>
                        </div>
                      </div>;
            }) : <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation!</p>
                  </div>}
                <div ref={messagesEndRef} />
              </div>
              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center">
                  <button type="button" className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                    <ImageIcon size={20} />
                  </button>
                  <button type="button" className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                    <SmileIcon size={20} />
                  </button>
                  <input type="text" placeholder="Type a message..." className="flex-grow mx-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={messageText} onChange={e => setMessageText(e.target.value)} />
                  <Button type="submit" variant="primary" disabled={!messageText.trim()} icon={<SendIcon size={16} />}>
                    Send
                  </Button>
                </div>
              </form>
            </> : <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <MessageSquareIcon size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
              <p className="text-gray-600 max-w-md mb-6">
                Select a conversation from the list to view messages, or start a
                new conversation by contacting a seller from a product page.
              </p>
            </div>}
        </div>
      </div>
    </div>;
};
export default Chat;