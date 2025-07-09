import React, { useState, useEffect } from 'react';
import { 
  FlagIcon, 
  UserXIcon, 
  AlertTriangleIcon, 
  MessageSquareIcon,
  EyeIcon,
  ShieldIcon,
  BanIcon,
  CheckCircleIcon,
  XCircleIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Adjust the import based on your firebase config file
import { format } from 'date-fns';

interface SpamReport {
  id: string;
  chatId: string;
  reportedBy: string;
  reason: string;
  timestamp: any;
  status: 'pending' | 'resolved' | 'dismissed';
  adminId?: string;
  adminAction?: 'warned' | 'blocked' | 'dismissed';
  adminNotes?: string;
}

interface AdminChatData {
  id: string;
  participants: string[];
  messages: any[];
  isSpam: boolean;
  isBlocked: boolean;
  reports: SpamReport[];
  lastActivity: any;
}

const AdminChatManager = () => {
  const { user } = useAuth();
  const { userProfiles, subscribeToUserProfiles } = useChatStore();
  const [chats, setChats] = useState<AdminChatData[]>([]);
  const [reports, setReports] = useState<SpamReport[]>([]);
  const [selectedChat, setSelectedChat] = useState<AdminChatData | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reported' | 'blocked' | 'spam'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') return;

    // Subscribe to spam reports
    const reportsQuery = query(
      collection(db, 'spamReports'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SpamReport[];
      setReports(reportsData);
    });

    // Subscribe to all conversations for admin
    const chatsQuery = query(
      collection(db, 'conversations'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (chatDoc) => {
          const chatData = chatDoc.data();
          
          // Get messages for this chat
          const messagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', chatDoc.id),
            orderBy('timestamp', 'desc')
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Get reports for this chat
          const chatReports = reports.filter(report => report.chatId === chatDoc.id);

          return {
            id: chatDoc.id,
            participants: chatData.participants || [],
            messages,
            isSpam: chatData.isSpam || false,
            isBlocked: chatData.isBlocked || false,
            reports: chatReports,
            lastActivity: chatData.updatedAt
          };
        })
      );

      setChats(chatsData);
      setLoading(false);

      // Subscribe to user profiles for all participants
      const allParticipants = [...new Set(chatsData.flatMap(chat => chat.participants))];
      if (allParticipants.length > 0) {
        subscribeToUserProfiles(allParticipants);
      }
    });

    return () => {
      unsubscribeReports();
      unsubscribeChats();
    };
  }, [user?.role, subscribeToUserProfiles, reports]);

  const handleWarnUser = async () => {
    if (!selectedUserId || !warningMessage.trim()) return;

    try {
      const userRef = doc(db, 'userProfiles', selectedUserId);
      const userProfile = userProfiles[selectedUserId];
      
      const warning = {
        message: warningMessage,
        adminId: user?.userId,
        timestamp: serverTimestamp()
      };

      await updateDoc(userRef, {
        warnings: [...(userProfile?.warnings || []), warning]
      });

      // Update report status if applicable
      if (selectedChat) {
        const pendingReports = selectedChat.reports.filter(r => r.status === 'pending');
        for (const report of pendingReports) {
          await updateDoc(doc(db, 'spamReports', report.id), {
            status: 'resolved',
            adminId: user?.userId,
            adminAction: 'warned',
            adminNotes: warningMessage
          });
        }
      }

      setShowWarningModal(false);
      setWarningMessage('');
      setSelectedUserId('');
    } catch (error) {
      console.error('Error warning user:', error);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!user?.userId) return;

    try {
      const userRef = doc(db, 'userProfiles', userId);
      await updateDoc(userRef, {
        isBlocked: true,
        blockedBy: user?.userId,
        blockedAt: serverTimestamp()
      });

      // Update all chats with this user
      const userChats = chats.filter(chat => chat.participants.includes(userId));
      for (const chat of userChats) {
        await updateDoc(doc(db, 'conversations', chat.id), {
          isBlocked: true,
          blockedBy: user?.userId,
          blockedAt: serverTimestamp()
        });
      }

      // Update pending reports
      if (selectedChat) {
        const pendingReports = selectedChat.reports.filter(r => r.status === 'pending');
        for (const report of pendingReports) {
          await updateDoc(doc(db, 'spamReports', report.id), {
            status: 'resolved',
            adminId: user?.userId,
            adminAction: 'blocked',
            adminNotes: 'User blocked by admin'
          });
        }
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'spamReports', reportId), {
        status: 'dismissed',
        adminId: user?.userId,
        adminAction: 'dismissed',
        adminNotes: 'Report dismissed by admin'
      });
    } catch (error) {
      console.error('Error dismissing report:', error);
    }
  };

  const handleMarkAsSpam = async (chatId: string) => {
    try {
      await updateDoc(doc(db, 'conversations', chatId), {
        isSpam: true,
        markedBy: user?.userId,
        markedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking as spam:', error);
    }
  };

  const handleUnmarkSpam = async (chatId: string) => {
    try {
      await updateDoc(doc(db, 'conversations', chatId), {
        isSpam: false,
        unmarkedBy: user?.userId,
        unmarkedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error unmarking spam:', error);
    }
  };

  const filteredChats = chats.filter(chat => {
    // Filter by type
    if (filter === 'reported' && chat.reports.filter(r => r.status === 'pending').length === 0) return false;
    if (filter === 'blocked' && !chat.isBlocked) return false;
    if (filter === 'spam' && !chat.isSpam) return false;

    // Filter by search term
    if (searchTerm) {
      const participantNames = chat.participants
        .map(p => userProfiles[p]?.name || '')
        .join(' ')
        .toLowerCase();
      return participantNames.includes(searchTerm.toLowerCase());
    }

    return true;
  });

  const getPriorityScore = (chat: AdminChatData) => {
    let score = 0;
    if (chat.reports.filter(r => r.status === 'pending').length > 0) score += 10;
    if (chat.isSpam) score += 5;
    if (chat.isBlocked) score += 3;
    return score;
  };

  const sortedChats = filteredChats.sort((a, b) => {
    const priorityDiff = getPriorityScore(b) - getPriorityScore(a);
    if (priorityDiff !== 0) return priorityDiff;
    return b.lastActivity?.toDate().getTime() - a.lastActivity?.toDate().getTime();
  });

  if (user?.role !== 'admin') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldIcon size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Chat Management</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Chats</option>
              <option value="reported">Reported</option>
              <option value="spam">Spam</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : sortedChats.length > 0 ? (
            sortedChats.map(chat => {
              const pendingReports = chat.reports.filter(r => r.status === 'pending');
              const participantNames = chat.participants
                .map(p => userProfiles[p]?.name || 'Unknown')
                .join(', ');

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{participantNames}</h3>
                        {pendingReports.length > 0 && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            {pendingReports.length} Report{pendingReports.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {chat.isSpam && (
                          <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                            Spam
                          </span>
                        )}
                        {chat.isBlocked && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            Blocked
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {chat.messages.length} messages
                      </p>
                      
                      {chat.messages.length > 0 && (
                        <p className="text-xs text-gray-500 truncate">
                          Last: {chat.messages[0]?.text || 'No recent messages'}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {format(chat.lastActivity?.toDate() || new Date(), 'MMM d, HH:mm')}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              No chats found matching your criteria.
            </div>
          )}
        </div>

        {/* Chat Details */}
        <div className="flex-1 bg-white">
          {selectedChat ? (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedChat.participants.map(p => userProfiles[p]?.name || 'Unknown').join(' & ')}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedChat.messages.length} messages • Last activity: {' '}
                      {format(selectedChat.lastActivity?.toDate() || new Date(), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {selectedChat.isSpam ? (
                      <button
                        onClick={() => handleUnmarkSpam(selectedChat.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        <CheckCircleIcon size={16} className="inline mr-1" />
                        Unmark Spam
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsSpam(selectedChat.id)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                      >
                        <FlagIcon size={16} className="inline mr-1" />
                        Mark as Spam
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reports Section */}
              {selectedChat.reports.length > 0 && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                  <h3 className="font-medium text-red-800 mb-2">Reports</h3>
                  <div className="space-y-2">
                    {selectedChat.reports.map(report => (
                      <div key={report.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">
                            Reported by {userProfiles[report.reportedBy]?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-600">{report.reason}</p>
                          <p className="text-xs text-gray-500">
                            {format(report.timestamp?.toDate() || new Date(), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        
                        {report.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDismissReport(report.id)}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                              <XCircleIcon size={16} className="inline mr-1" />
                              Dismiss
                            </button>
                          </div>
                        )}
                        
                        {report.status !== 'pending' && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            report.status === 'resolved' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {report.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-3">Participant Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedChat.participants.map(participantId => {
                    const profile = userProfiles[participantId];
                    return (
                      <div key={participantId} className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{profile?.name || 'Unknown'}</span>
                          {profile?.isBlocked && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                              Blocked
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUserId(participantId);
                              setShowWarningModal(true);
                            }}
                            className="flex-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            disabled={profile?.isBlocked}
                          >
                            <AlertTriangleIcon size={14} className="inline mr-1" />
                            Warn
                          </button>
                          
                          <button
                            onClick={() => handleBlockUser(participantId)}
                            className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            disabled={profile?.isBlocked}
                          >
                            <BanIcon size={14} className="inline mr-1" />
                            Block
                          </button>
                        </div>
                        
                        {profile?.warnings && profile.warnings.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            {profile.warnings.length} warning{profile.warnings.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="font-medium text-gray-900 mb-4">Recent Messages</h3>
                <div className="space-y-3">
                  {selectedChat.messages.slice(0, 10).map(message => (
                    <div key={message.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {userProfiles[message.senderId]?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(message.timestamp?.toDate() || new Date(), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{message.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquareIcon size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a chat from the list to view details and take actions.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Send Warning</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warning to: {userProfiles[selectedUserId]?.name || 'Unknown User'}
              </label>
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Enter warning message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setWarningMessage('');
                  setSelectedUserId('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleWarnUser}
                disabled={!warningMessage.trim()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatManager;