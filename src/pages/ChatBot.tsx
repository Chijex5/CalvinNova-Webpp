import React, { useState, useEffect, useRef } from 'react';
import { StreamChat, Channel, Message as StreamMessage, User as StreamUser } from 'stream-chat';
import { MessageCircle, X, Send, AlertCircle, User, Bot, Clock, CheckCircle, ArrowLeft, MoreVertical, Phone, Video, Paperclip, Smile, Mic, Image, Camera, Minimize2, Maximize2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { client } from '../lib/stream-chat';

// Bot configuration
const CHATBOT_ID = "novaplus-support-bot";

interface SupportChatProps {
  className?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  type?: 'message' | 'system' | 'escalation';
  isTyping?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

const SupportChat: React.FC<SupportChatProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [showTypingAnimation, setShowTypingAnimation] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [supportAgentStatus, setSupportAgentStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [isMobile, setIsMobile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { currentChat, startMessaging, sendMessage, isSendingMessage } = useChatStore();
  const { user } = useUserStore();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTypingAnimation]);

  useEffect(() => {
    if (isOpen && user?.userId) {
      initializeChat();
    }
  }, [isOpen, user?.userId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentChannel) {
        currentChannel.stopWatching();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [currentChannel]);

  const initializeChat = async () => {
    try {
      setConnectionStatus('connecting');

      // Create or get channel with bot
      const channelId = `support-${user?.userId || 'guest'}`;
      const channel = client.channel('messaging', channelId, {
        members: [user?.userId || '', CHATBOT_ID],
        created_by_id: user?.userId || CHATBOT_ID,
      });

      await channel.watch();
      setCurrentChannel(channel);
      setConnectionStatus('connected');
      setIsConnected(true);

      // Load existing messages
      const history = await channel.query({
        messages: { limit: 50 },
      });

      if (history.messages) {
        const formattedMessages: ChatMessage[] = history.messages.map(msg => ({
          id: msg.id,
          text: msg.text || '',
          sender: msg.user?.id === CHATBOT_ID ? 'bot' : 
                 msg.user?.id === user?.userId ? 'user' : 'agent',
          timestamp: new Date(msg.created_at || Date.now()),
          type: msg.type === 'system' ? 'system' : 'message',
          status: 'read',
        }));
        setMessages(formattedMessages);
      }

      // Set up real-time listeners
      channel.on('message.new', handleNewMessage);
      channel.on('typing.start', handleTypingStart);
      channel.on('typing.stop', handleTypingStop);
      channel.on('member.added', handleEscalation);

      // Send initial greeting if no messages
      if (!history.messages || history.messages.length === 0) {
        setTimeout(() => {
          showBotTyping();
          setTimeout(() => {
            addBotMessage(`Hey ${user?.name || 'there'}! 👋\n\nI'm your NovaPlus support assistant. I can help you with:\n\n• Payment & payout questions 💰\n• Item disputes & issues 🛡️\n• Account verification ✅\n• Safe buying & selling tips 🛒\n• General marketplace questions ❓\n\nWhat's on your mind today?`);
          }, 2000);
        }, 1000);
      }

    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setConnectionStatus('error');
    }
  };

  const handleNewMessage = (event: any) => {
    const message = event.message;
    if (!message || message.user?.id === user?.userId) return;

    const newMessage: ChatMessage = {
      id: message.id,
      text: message.text || '',
      sender: message.user?.id === CHATBOT_ID ? 'bot' : 'agent',
      timestamp: new Date(message.created_at || Date.now()),
      type: message.type === 'system' ? 'system' : 'message',
      status: 'delivered',
    };

    // Check for escalation messages
    if (message.text?.includes('connected to a NovaPlus support agent') || 
        message.text?.includes('human agent')) {
      setIsEscalated(true);
      newMessage.type = 'escalation';
    }

    setMessages(prev => [...prev, newMessage]);
    setBotTyping(false);
    setShowTypingAnimation(false);
  };

  const handleTypingStart = (event: any) => {
    if (event.user?.id === CHATBOT_ID) {
      setBotTyping(true);
      setShowTypingAnimation(true);
    }
  };

  const handleTypingStop = (event: any) => {
    if (event.user?.id === CHATBOT_ID) {
      setBotTyping(false);
    }
  };

  const handleEscalation = (event: any) => {
    if (event.member?.user?.role === 'admin' || event.member?.user?.name?.includes('support')) {
      setIsEscalated(true);
      addSystemMessage('🤝 Connected to human support agent');
    }
  };

  const showBotTyping = () => {
    setBotTyping(true);
    setShowTypingAnimation(true);
  };

  const addBotMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type: 'message',
      status: 'delivered',
    };
    setMessages(prev => [...prev, message]);
    setBotTyping(false);
    setShowTypingAnimation(false);
  };

  const addSystemMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type: 'system',
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentChannel || isSendingMessage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'message',
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowAttachments(false);

    // Show bot typing
    setTimeout(() => {
      setBotTyping(true);
      setShowTypingAnimation(true);
    }, 500);

    try {
      await currentChannel.sendMessage({
        text: inputText.trim(),
      });

      // Update message status
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));

    } catch (error) {
      console.error('Failed to send message:', error);
      setBotTyping(false);
      setShowTypingAnimation(false);
      // Update message status to error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Send typing indicators
    if (currentChannel && !isTyping) {
      setIsTyping(true);
      currentChannel.keystroke();
      
      // Clear typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        currentChannel.stopTyping();
      }, 3000);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const isToday = timestamp.toDateString() === now.toDateString();
    
    if (isToday) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === timestamp.toDateString();
    if (isYesterday) {
      return 'Yesterday';
    }
    
    return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const isBot = message.sender === 'bot';
    const isSystem = message.type === 'system';

    if (isSystem) {
      return (
        <div className="flex justify-center my-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
            <CheckCircle size={16} />
            {message.text}
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {!isUser && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Bot size={18} className="text-white" />
            </div>
          )}

          {/* Message content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`relative px-5 py-3 rounded-2xl max-w-full shadow-sm ${
              isUser 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
                : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.text}
              </div>
              
              {/* Message status indicator for user messages */}
              {isUser && (
                <div className="flex items-center justify-end mt-1">
                  <span className="text-xs opacity-70">
                    {message.status === 'sending' && '◐'}
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'read' && <span className="text-blue-200">✓✓</span>}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500 mt-1 px-2">
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TypingIndicator: React.FC = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Bot size={18} className="text-white" />
        </div>
        <div className="bg-white text-gray-800 px-5 py-3 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-600">typing...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const AttachmentPanel: React.FC = () => (
    <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-t-xl shadow-lg p-6 mb-2">
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all duration-200 hover:scale-105">
          <Camera size={24} className="text-purple-500" />
          <span className="text-xs text-gray-600 font-medium">Camera</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-200 hover:scale-105">
          <Image size={24} className="text-blue-500" />
          <span className="text-xs text-gray-600 font-medium">Photos</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-all duration-200 hover:scale-105">
          <Paperclip size={24} className="text-green-500" />
          <span className="text-xs text-gray-600 font-medium">File</span>
        </button>
      </div>
    </div>
  );

  const HeaderContent = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot size={24} className="text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              supportAgentStatus === 'online' ? 'bg-green-500' : 
              supportAgentStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">NovaPlus Support</h3>
            <p className="text-sm text-blue-100">
              {isEscalated ? 'Human agent • Online' : 'AI Assistant • Always available'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200">
          <Phone size={20} />
        </button>
        <button className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200">
          <Video size={20} />
        </button>
        <button className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200">
          <MoreVertical size={20} />
        </button>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
        >
          {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <div className={`fixed ${isMobile ? 'bottom-6 right-6' : 'bottom-8 right-8'} z-50 ${className}`}>
        <div className="relative">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl group"
          >
            <MessageCircle size={28} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          {/* Notification badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            1
          </div>
        </div>
      </div>
    );
  }

  // Mobile fullscreen layout
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot size={24} className="text-white" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    supportAgentStatus === 'online' ? 'bg-green-500' : 
                    supportAgentStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">NovaPlus Support</h3>
                  <p className="text-sm text-blue-100">
                    {isEscalated ? 'Human agent • Online' : 'AI Assistant • Always available'}
                  </p>
                </div>
              </div>
              <button className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200">
                <MoreVertical size={24} />
              </button>
            </div>
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'connected' && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 p-4">
              <div className="flex items-center justify-center gap-2 text-yellow-700">
                <Clock size={18} />
                <span className="text-sm font-medium">
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Error'}
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white relative">
            <div className="p-6 space-y-2">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {showTypingAnimation && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Voice Recording UI */}
          {isRecording && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-t border-red-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-700 font-medium">Recording...</span>
                  <span className="text-red-600 text-sm font-mono">{formatTime(recordingTime)}</span>
                </div>
                <button
                  onClick={stopRecording}
                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Attachment Panel */}
          {showAttachments && <AttachmentPanel />}

          {/* Input */}
          <div className="p-6 bg-white border-t border-gray-200 relative">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAttachments(!showAttachments)}
                className={`rounded-full p-3 transition-all duration-200 ${
                  showAttachments ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Paperclip size={20} />
              </button>
              
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  disabled={!isConnected || isSendingMessage}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  className="w-full px-6 py-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50 transition-all text-base"
                />
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                  <Smile size={20} />
                </button>
              </div>
              
              {inputText.trim() ? (
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || !isConnected || isSendingMessage}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Send size={20} />
                </button>
              ) : (
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`rounded-full p-3 transition-all duration-200 shadow-lg ${
                    isRecording ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Mic size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={`fixed ${isMinimized ? 'bottom-8 right-8' : 'bottom-8 right-8'} z-50 ${className}`}>
      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 shadow-lg">
          <HeaderContent />
        </div>

        {!isMinimized && (
          <>
            {/* Connection Status */}
            {connectionStatus !== 'connected' && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 p-3">
                <div className="flex items-center justify-center gap-2 text-yellow-700">
                  <Clock size={16} />
                  <span className="text-sm font-medium">
                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Error'}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white relative h-[420px]">
              <div className="p-6 space-y-2">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {showTypingAnimation && <TypingIndicator />}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Voice Recording UI */}
            {isRecording && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-t border-red-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-700 font-medium">Recording...</span>
                    <span className="text-red-600 text-sm font-mono">{formatTime(recordingTime)}</span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Attachment Panel */}
            {showAttachments && <AttachmentPanel />}

            {/* Input */}
            <div className="p-6 bg-white border-t border-gray-200 relative">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAttachments(!showAttachments)}
                  className={`rounded-full p-2 transition-all duration-200 ${
                    showAttachments ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Paperclip size={18} />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    disabled={!isConnected || isSendingMessage}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50 transition-all"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                    <Smile size={18} />
                  </button>
                </div>
                
                {inputText.trim() ? (
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || !isConnected || isSendingMessage}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Send size={18} />
                  </button>
                ) : (
                  <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`rounded-full p-2 transition-all duration-200 shadow-lg ${
                      isRecording ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Mic size={18} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportChat;