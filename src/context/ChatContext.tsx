import React, { useState, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  time: string;
  read: boolean;
}
interface Conversation {
  userId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}
interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (receiverId: string, text: string) => void;
  markAsRead: (senderId: string) => void;
}
const ChatContext = createContext<ChatContextType | undefined>(undefined);
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
export const ChatProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const {
    user
  } = useAuth();
  // Mock initial conversations
  const [conversations, setConversations] = useState<Conversation[]>([{
    userId: '2',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: 'Is this still available?',
    lastMessageTime: '10:30 AM',
    unreadCount: 1,
    isOnline: true
  }, {
    userId: '3',
    name: 'Michael Brown',
    avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
    lastMessage: 'I can meet tomorrow at 3pm',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isOnline: false
  }, {
    userId: '4',
    name: 'Emily Davis',
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
    lastMessage: 'Thanks for the quick response!',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
    isOnline: true
  }]);
  // Mock initial messages
  const [messages, setMessages] = useState<Message[]>([{
    senderId: '2',
    receiverId: '1',
    text: 'Hi, I saw your listing for the textbook. Is it still available?',
    time: '10:15 AM',
    read: true
  }, {
    senderId: '1',
    receiverId: '2',
    text: 'Yes, it is! Are you interested in buying it?',
    time: '10:20 AM',
    read: true
  }, {
    senderId: '2',
    receiverId: '1',
    text: 'Is this still available?',
    time: '10:30 AM',
    read: false
  }, {
    senderId: '3',
    receiverId: '1',
    text: "Hello, I'm interested in your desk lamp",
    time: 'Yesterday',
    read: true
  }, {
    senderId: '1',
    receiverId: '3',
    text: "It's available! When would you like to meet?",
    time: 'Yesterday',
    read: true
  }, {
    senderId: '3',
    receiverId: '1',
    text: 'I can meet tomorrow at 3pm',
    time: 'Yesterday',
    read: true
  }]);
  const sendMessage = (receiverId: string, text: string) => {
    if (!user) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    // Create new message
    const newMessage: Message = {
      senderId: user.id,
      receiverId,
      text,
      time: timeString,
      read: false
    };
    setMessages([...messages, newMessage]);
    // Update conversation
    setConversations(conversations.map(conv => {
      if (conv.userId === receiverId) {
        return {
          ...conv,
          lastMessage: text,
          lastMessageTime: timeString
        };
      }
      return conv;
    }));
  };
  const markAsRead = (senderId: string) => {
    setMessages(messages.map(message => {
      if (message.senderId === senderId && message.receiverId === user?.id) {
        return {
          ...message,
          read: true
        };
      }
      return message;
    }));
    setConversations(conversations.map(conv => {
      if (conv.userId === senderId) {
        return {
          ...conv,
          unreadCount: 0
        };
      }
      return conv;
    }));
  };
  const value = {
    conversations,
    messages,
    sendMessage,
    markAsRead
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};