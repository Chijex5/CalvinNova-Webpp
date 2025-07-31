import React, { useState, useEffect, useRef } from 'react';
import { Channel } from 'stream-chat';
import { RiCustomerService2Line } from "react-icons/ri";
import { MessageCircle, X, Send, Bot, Clock, CheckCircle, Zap, ArrowLeft, MoreVertical, Paperclip, Mic, Image, Camera, Shield, UserCheck } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { useAuth } from '../context/AuthContext';
import { client } from '../lib/stream-chat';

// Bot configuration
const CHATBOT_ID = "novaplus-support-bot";
const SUPPORT_AGENT_ID = "support-agent-id";
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
const SupportChat: React.FC<SupportChatProps> = ({
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const {
    isAuthenticated,
    isLoading
  } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [showTypingAnimation, setShowTypingAnimation] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [supportAgentStatus, setSupportAgentStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [isMobile, setIsMobile] = useState(false);
  const [agentInfo, setAgentInfo] = useState<{
    name: string;
    avatar?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    currentChat,
    startMessaging,
    sendMessage,
    isSendingMessage
  } = useChatStore();
  const {
    user
  } = useUserStore();

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
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    if (currentChannel) {
      currentChannel.markRead();
    }
  }, [currentChannel, messages]);
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setIsReady(true);
    }
  }, [isLoading, isAuthenticated]);
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
      if (botTypingTimeoutRef.current) {
        clearTimeout(botTypingTimeoutRef.current);
      }
    };
  }, [currentChannel]);

  // Bot typing timeout - 30 seconds
  const startBotTypingTimeout = () => {
    if (botTypingTimeoutRef.current) {
      clearTimeout(botTypingTimeoutRef.current);
    }
    botTypingTimeoutRef.current = setTimeout(() => {
      setBotTyping(false);
      setShowTypingAnimation(false);
    }, 30000); // 30 seconds
  };

  // Clear bot typing timeout
  const clearBotTypingTimeout = () => {
    if (botTypingTimeoutRef.current) {
      clearTimeout(botTypingTimeoutRef.current);
    }
  };
  const initializeChat = async () => {
    try {
      setConnectionStatus('connecting');

      // Create or get channel with bot
      const channelId = `support-${user?.userId || 'guest'}`;
      const channel = client.channel('messaging', channelId, {
        members: [user?.userId || '', CHATBOT_ID],
        created_by_id: user?.userId || CHATBOT_ID
      });
      await channel.watch();
      setCurrentChannel(channel);
      setConnectionStatus('connected');
      setIsConnected(true);
      channel.markRead();

      // Check if support agent is already in the channel
      const channelState = channel.state;
      const members = channelState.members;
      const hasAgent = Object.keys(members).some(memberId => memberId === SUPPORT_AGENT_ID || members[memberId].user?.role === 'admin' || members[memberId].user?.name?.toLowerCase().includes('support'));
      if (hasAgent) {
        setIsEscalated(true);
        // Get agent info
        const agentMember = Object.values(members).find(member => member.user?.id === SUPPORT_AGENT_ID || member.user?.role === 'admin' || member.user?.name?.toLowerCase().includes('support'));
        if (agentMember) {
          setAgentInfo({
            name: agentMember.user?.name || 'Support Agent',
            avatar: agentMember.user?.image
          });
        }
      }

      // Load existing messages
      const history = await channel.query({
        messages: {
          limit: 50
        }
      });
      if (history.messages) {
        const formattedMessages: ChatMessage[] = Array.from(new Map(history.messages.map(msg => {
          const sender: 'user' | 'bot' | 'agent' = msg.user?.id === CHATBOT_ID ? 'bot' : msg.user?.id === user?.userId ? 'user' : 'agent';
          const type: 'message' | 'system' | 'escalation' = msg.type === 'system' ? 'system' : 'message';
          return [msg.id, {
            id: msg.id,
            text: msg.text || '',
            sender,
            timestamp: new Date(msg.created_at || Date.now()),
            type,
            status: 'read' as const
          }];
        })).values());
        setMessages(formattedMessages);
      }

      // Set up real-time listeners
      channel.on('message.new', handleNewMessage);
      channel.on('typing.start', handleTypingStart);
      channel.on('typing.stop', handleTypingStop);
      channel.on('member.added', handleEscalation);

      // Send initial greeting if no messages and not escalated
      if ((!history.messages || history.messages.length === 0) && !hasAgent) {
        setTimeout(() => {
          showBotTyping();
          setTimeout(() => {
            addBotMessage(`Hey ${user?.name || 'there'}! 👋\n\nI'm your CalvinNova support assistant. I can help you with:\n\n• Payment & payout questions 💰\n• Item disputes & issues 🛡️\n• Account verification ✅\n• Safe buying & selling tips 🛒\n• General marketplace questions ❓\n\nWhat's on your mind today?`);
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
      status: 'delivered'
    };

    // Check for escalation messages
    if (message.text?.includes('connected to a CalvinNova support agent') || message.text?.includes('human agent')) {
      setIsEscalated(true);
      newMessage.type = 'escalation';
    }
    setMessages(prev => [...prev, newMessage]);
    setBotTyping(false);
    setShowTypingAnimation(false);
    clearBotTypingTimeout();
  };
  const handleTypingStart = (event: any) => {
    if (event.user?.id === CHATBOT_ID && !isEscalated) {
      setBotTyping(true);
      setShowTypingAnimation(true);
      startBotTypingTimeout();
    }
  };
  const handleTypingStop = (event: any) => {
    if (event.user?.id === CHATBOT_ID) {
      setBotTyping(false);
      clearBotTypingTimeout();
    }
  };
  const handleEscalation = (event: any) => {
    const newMember = event.member;
    if (newMember?.user?.id === SUPPORT_AGENT_ID || newMember?.user?.role === 'admin' || newMember?.user?.name?.toLowerCase().includes('support')) {
      setIsEscalated(true);
      setAgentInfo({
        name: newMember.user?.name || 'Support Agent',
        avatar: newMember.user?.image
      });
      setBotTyping(false);
      setShowTypingAnimation(false);
      clearBotTypingTimeout();
      addSystemMessage('🤝 Connected to human support agent');
    }
  };
  const showBotTyping = () => {
    if (!isEscalated) {
      setBotTyping(true);
      setShowTypingAnimation(true);
      startBotTypingTimeout();
    }
  };
  const addBotMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type: 'message',
      status: 'delivered'
    };
    setMessages(prev => [...prev, message]);
    setBotTyping(false);
    setShowTypingAnimation(false);
    clearBotTypingTimeout();
  };
  const addSystemMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type: 'system'
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
      status: 'sending'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowAttachments(false);

    // Show bot typing only if not escalated
    if (!isEscalated) {
      setTimeout(() => {
        showBotTyping();
      }, 500);
    }
    try {
      await currentChannel.sendMessage({
        text: inputText.trim()
      });

      // Update message status
      setMessages(prev => prev.map(msg => msg.id === userMessage.id ? {
        ...msg,
        status: 'sent'
      } : msg));
    } catch (error) {
      console.error('Failed to send message:', error);
      setBotTyping(false);
      setShowTypingAnimation(false);
      clearBotTypingTimeout();
      // Update message status to error
      setMessages(prev => prev.map(msg => msg.id === userMessage.id ? {
        ...msg,
        status: 'sent'
      } : msg));
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
      return timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === timestamp.toDateString();
    if (isYesterday) {
      return 'Yesterday';
    }
    return timestamp.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  };
  const MessageBubble: React.FC<{
    message: ChatMessage;
  }> = ({
    message
  }) => {
    const isUser = message.sender === 'user';
    const isBot = message.sender === 'bot';
    const isAgent = message.sender === 'agent';
    const isSystem = message.type === 'system';
    if (isSystem) {
      return <div className="flex justify-center my-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm dark:shadow-lg">
            <CheckCircle size={16} />
            {message.text}
          </div>
        </div>;
    }
    return <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {!isUser && <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg dark:shadow-xl ${isAgent ? 'bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700' : 'bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700'}`}>
              {isAgent ? agentInfo?.avatar ? <img src={agentInfo.avatar} alt="Agent" className="w-full h-full rounded-full object-cover" /> : <UserCheck size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
            </div>}

          {/* Message content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            {/* Agent name */}
            {isAgent && agentInfo && <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2 flex items-center gap-1">
                <Shield size={12} />
                {agentInfo.name}
              </div>}
            
            <div className={`relative px-5 py-3 rounded-2xl max-w-full shadow-sm dark:shadow-lg ${isUser ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-br-md' : isAgent ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-gray-800 dark:text-gray-200 rounded-bl-md border border-green-200 dark:border-green-700' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-700'}`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.text}
              </div>
              
              {/* Message status indicator for user messages */}
              {isUser && <div className="flex items-center justify-end mt-1">
                  <span className="text-xs opacity-70">
                    {message.status === 'sending' && '◐'}
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'read' && <span className="text-blue-200 dark:text-blue-300">✓✓</span>}
                  </span>
                </div>}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>;
  };
  const TypingIndicator: React.FC = () => <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg dark:shadow-xl ${isEscalated ? 'bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700' : 'bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700'}`}>
          {isEscalated ? <UserCheck size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
        </div>
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-5 py-3 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{
              animationDelay: '0.1s'
            }}></div>
              <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{
              animationDelay: '0.2s'
            }}></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">typing...</span>
          </div>
        </div>
      </div>
    </div>;
  const AttachmentPanel: React.FC = () => <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-xl shadow-lg dark:shadow-xl p-6 mb-2">
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-200 hover:scale-105">
          <Camera size={24} className="text-purple-500 dark:text-purple-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Camera</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 hover:scale-105">
          <Image size={24} className="text-blue-500 dark:text-blue-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Photos</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-200 hover:scale-105">
          <Paperclip size={24} className="text-green-500 dark:text-green-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">File</span>
        </button>
      </div>
    </div>;
  const EscalationBanner: React.FC = () => <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-b border-green-200 dark:border-green-700 p-4">
      <div className="flex items-center justify-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-full flex items-center justify-center">
          <UserCheck size={16} className="text-white" />
        </div>
        <div className="text-center">
          <div className="text-green-800 dark:text-green-200 font-semibold text-sm">Connected to Human Support</div>
          <div className="text-green-600 dark:text-green-300 text-xs">
            {agentInfo?.name || 'Support Agent'} is here to help
          </div>
        </div>
        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
      </div>
    </div>;
  if (isLoading || !isReady) {
    return null;
  }
  if (!isOpen) {
    return <div className={`fixed ${isMobile ? 'bottom-20 right-6' : 'bottom-24 right-8'} z-50`}>
        <div className="relative group">
          {/* Attention-grabbing pulse ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 opacity-75 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 opacity-50 animate-pulse"></div>

          <button onClick={() => {
          setIsOpen(true);
        }} className="relative bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 hover:from-blue-700 hover:to-purple-800 dark:hover:from-blue-800 dark:hover:to-purple-900 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25 dark:hover:shadow-purple-400/30 border-2 border-white/20 dark:border-white/10">
            <RiCustomerService2Line size={24} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          {/* Floating help text */}
          <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-500 dark:text-yellow-400" />
              <span className="font-semibold">Need help? We're online!</span>
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
          </div>
        </div>
      </div>;
  }

  // Mobile fullscreen layout
  if (isMobile) {
    return <div className="fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 h-full flex flex-col">
          {/* Header */}
          <div className={`text-white p-6 shadow-lg ${isEscalated ? 'bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700' : 'bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700'}`}>
            <div className="flex items-center justify-between">
              <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white hover:bg-opacity-20 dark:hover:bg-white dark:hover:bg-opacity-10 rounded-full p-2 transition-all duration-200">
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white bg-opacity-20 dark:bg-white dark:bg-opacity-10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    {isEscalated ? <UserCheck size={24} className="text-white" /> : <Bot size={24} className="text-white" />}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${supportAgentStatus === 'online' ? 'bg-green-500 dark:bg-green-400' : supportAgentStatus === 'away' ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-gray-500 dark:bg-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">CalvinNova Support</h3>
                  <p className="text-sm text-blue-100 dark:text-blue-200">
                    {isEscalated ? `${agentInfo?.name || 'Human agent'} • Online` : 'AI Assistant • Always available'}
                  </p>
                </div>
              </div>
              <button className="text-white hover:bg-white hover:bg-opacity-20 dark:hover:bg-white dark:hover:bg-opacity-10 rounded-full p-2 transition-all duration-200">
                <MoreVertical size={24} />
              </button>
            </div>
          </div>

          {/* Escalation Banner */}
          {isEscalated && <EscalationBanner />}

          {/* Connection Status */}
          {connectionStatus !== 'connected' && <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-b border-yellow-200 dark:border-yellow-700 p-4">
              <div className="flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-300">
                <Clock size={18} />
                <span className="text-sm font-medium">
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Error'}
                </span>
              </div>
            </div>}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative">
            <div className="p-6 space-y-2 min-h-full">
              {Array.from(new Map(messages.map(msg => [msg.id, msg])).values()).map(message => <MessageBubble key={message.id} message={message} />)}
             
              {showTypingAnimation && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Voice Recording UI */}
          {isRecording && <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-t border-red-200 dark:border-red-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 dark:bg-red-400 rounded-full animate-pulse" />
                  <span className="text-red-700 dark:text-red-300 font-medium">Recording...</span>
                  <span className="text-red-600 dark:text-red-400 text-sm font-mono">{formatTime(recordingTime)}</span>
                </div>
                <button onClick={stopRecording} className="bg-red-500 dark:bg-red-600 text-white rounded-full p-2 hover:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-lg">
                  <X size={18} />
                </button>
              </div>
            </div>}

          {/* Attachment Panel */}
          {showAttachments && <AttachmentPanel />}

          {/* Input */}
          <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAttachments(!showAttachments)} className={`hidden rounded-full p-3 transition-all duration-200 ${showAttachments ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Paperclip size={20} />
              </button>
              
              <div className="flex-1 relative">
                <input ref={inputRef} type="text" value={inputText} onChange={handleInputChange} placeholder="Type a message..." disabled={!isConnected || isSendingMessage} onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }} className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-700 disabled:opacity-50 transition-all text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
              </div>
              
              {inputText.trim() ? <button onClick={handleSendMessage} disabled={!inputText.trim() || !isConnected || isSendingMessage} className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 disabled:opacity-50 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Send size={20} />
                </button> : <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`hidden rounded-full p-3 transition-all duration-200 shadow-lg ${isRecording ? 'bg-red-500 dark:bg-red-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <Mic size={20} />
                </button>}
            </div>
          </div>
        </div>
      </div>;
  }

  // Desktop layout
  return <div className={`fixed bottom-8 right-8 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 w-[800px] h-[500px] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">C</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Chat Assistant</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 dark:bg-green-400' : connectionStatus === 'connecting' ? 'bg-yellow-500 dark:bg-yellow-400 animate-pulse' : 'bg-red-500 dark:bg-red-400'}`} />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {connectionStatus === 'connected' ? 'Online' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAttachments(!showAttachments)} className={`rounded-lg hidden p-2 transition-all duration-200 ${showAttachments ? 'bg-blue-500 dark:bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Paperclip size={16} />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="p-6 space-y-2">
                {Array.from(new Map(messages.map(msg => [msg.id, msg])).values()).map(message => <MessageBubble key={message.id} message={message} />)}
             
                {showTypingAnimation && <TypingIndicator />}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Voice Recording UI */}
            {isRecording && <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-t border-red-200 dark:border-red-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full animate-pulse" />
                    <span className="text-red-700 dark:text-red-300 font-medium">Recording...</span>
                    <span className="text-red-600 dark:text-red-400 text-sm font-mono">{formatTime(recordingTime)}</span>
                  </div>
                  <button onClick={stopRecording} className="bg-red-500 dark:bg-red-600 text-white rounded-full p-2 hover:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-lg">
                    <X size={16} />
                  </button>
                </div>
              </div>}

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input ref={inputRef} type="text" value={inputText} onChange={handleInputChange} placeholder="Type a message..." disabled={!isConnected || isSendingMessage} onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-700 disabled:opacity-50 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
                </div>
                
                {inputText.trim() ? <button onClick={handleSendMessage} disabled={!inputText.trim() || !isConnected || isSendingMessage} className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 disabled:opacity-50 text-white rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <Send size={18} />
                  </button> : <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`hidden rounded-full p-2 transition-all duration-200 shadow-lg ${isRecording ? 'bg-red-500 dark:bg-red-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <Mic size={18} />
                  </button>}
              </div>
            </div>
          </div>

          {/* Attachment Panel - Side Panel */}
          {showAttachments && <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
              <AttachmentPanel />
            </div>}
        </div>
      </div>
    </div>;
};
export default SupportChat;