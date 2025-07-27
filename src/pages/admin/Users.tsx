import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  User,
  MessageSquare,
  Ban,
  Shield,
  Flag,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  X,
  Send,
  Eye,
  Package,
  Loader2
} from 'lucide-react';
import { useAdminDataStore, AllUsers } from '../../store/adminData';
import adminService from '../../services/adminService';
import { client } from '../../lib/stream-chat';

// Enhanced skeleton loader component for chat length
const ChatLengthSkeleton = () => (
  <div className="flex items-center space-x-2">
    <MessageSquare className="w-4 h-4 text-gray-400" />
    <div className="flex items-center space-x-1">
      <Loader2 className="w-3 h-3 text-purple-500 animate-spin" />
      <span className="text-xs text-gray-500">Loading chats...</span>
    </div>
  </div>
);

// Enhanced skeleton loader component for listings
const ListingsSkeleton = () => (
  <div className="flex items-center space-x-2">
    <Package className="w-4 h-4 text-gray-400" />
    <div className="flex items-center space-x-1">
      <Loader2 className="w-3 h-3 text-purple-500 animate-spin" />
      <span className="text-xs text-gray-500">Loading listings...</span>
    </div>
  </div>
);

const AdminUsersPage = () => {
  const { users, loading, error, setUsers, updateUser } = useAdminDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Expanded states for individual users
  const [expandedUsers, setExpandedUsers] = useState<{[key: string]: boolean}>({});
  
  // Loading states - more granular tracking
  const [chatLengthLoading, setChatLengthLoading] = useState<{[key: string]: boolean}>({});
  const [listingsLoading, setListingsLoading] = useState<{[key: string]: boolean}>({});
  
  // Data cache (in memory only) - with error states
  const [chatLengths, setChatLengths] = useState<{[key: string]: number | 'error'}>({});
  const [listingsCounts, setListingsCounts] = useState<{[key: string]: number | 'error'}>({});
  
  // Track which data has been fetched
  const [chatDataFetched, setChatDataFetched] = useState<{[key: string]: boolean}>({});
  const [listingsDataFetched, setListingsDataFetched] = useState<{[key: string]: boolean}>({});
  
  const [selectedUser, setSelectedUser] = useState<AllUsers | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'All',
    verified: false,
    joinedFrom: '',
    joinedTo: '',
    campus: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    console.log('Fetching all users...');
    await adminService.getAllUsers();
  };

  const handleRefresh = () => {
    console.log('Refreshing users data...');
    // Clear all cached data and expanded states when refreshing
    setChatLengths({});
    setListingsCounts({});
    setChatLengthLoading({});
    setListingsLoading({});
    setExpandedUsers({});
    setChatDataFetched({});
    setListingsDataFetched({});
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filters.status === 'All' || user.status === filters.status.toLowerCase();
    const matchesVerified = !filters.verified || user.isVerified;
    
    return matchesSearch && matchesStatus && matchesVerified;
  });

  const toggleUserExpanded = async (userId: string) => {
    const isCurrentlyExpanded = expandedUsers[userId];
    
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !isCurrentlyExpanded
    }));

    // If expanding and data hasn't been fetched yet, fetch it
    if (!isCurrentlyExpanded) {
      console.log(`Expanding user ${userId}, checking data...`);
      
      // Fetch chat data if not already fetched or in progress
      if (!chatDataFetched[userId] && !chatLengthLoading[userId]) {
        console.log(`Fetching chat data for user ${userId}`);
        await getUserChatList(userId);
      }
      
      // Fetch listings data if not already fetched or in progress
      if (!listingsDataFetched[userId] && !listingsLoading[userId]) {
        console.log(`Fetching listings data for user ${userId}`);
        await getUserListingsCount(userId);
      }
    }
  };

  const getUserChatList = async (targetUserId: string) => {
    console.log(`Starting chat fetch for user: ${targetUserId}`);
    
    try {
      setChatLengthLoading(prev => ({ ...prev, [targetUserId]: true }));
      
      const channels = await client.queryChannels({
        members: { $in: [targetUserId] }
      });

      const totalChannels = channels.length;
      console.log(`Found ${totalChannels} chats for user ${targetUserId}`);
      
      setChatLengths(prev => ({ ...prev, [targetUserId]: totalChannels }));
      setChatDataFetched(prev => ({ ...prev, [targetUserId]: true }));
      
    } catch (error) {
      console.error('Error fetching user chat list:', error);
      setChatLengths(prev => ({ ...prev, [targetUserId]: 'error' }));
      setChatDataFetched(prev => ({ ...prev, [targetUserId]: true }));
    } finally {
      setChatLengthLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const getUserListingsCount = async (targetUserId: string) => {
    console.log(`Starting listings fetch for user: ${targetUserId}`);
    
    try {
      setListingsLoading(prev => ({ ...prev, [targetUserId]: true }));
      const totalListings = await adminService.getTotalListings(targetUserId);
      console.log(`Found ${totalListings} listings for user ${targetUserId}`);
      
      setListingsCounts(prev => ({ ...prev, [targetUserId]: totalListings }));
      setListingsDataFetched(prev => ({ ...prev, [targetUserId]: true }));
      
    } catch (error) {
      console.error('Error fetching user listings:', error);
      setListingsCounts(prev => ({ ...prev, [targetUserId]: 'error' }));
      setListingsDataFetched(prev => ({ ...prev, [targetUserId]: true }));
    } finally {
      setListingsLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleUserAction = (action: string, user: AllUsers) => {
    console.log(`Performing action: ${action} on user: ${user.id}`);
    
    switch(action) {
      case 'view':
        setSelectedUser(user);
        setShowUserDetail(true);
        // Pre-fetch data for modal if not already available
        if (!chatDataFetched[user.id] && !chatLengthLoading[user.id]) {
          getUserChatList(user.id);
        }
        if (!listingsDataFetched[user.id] && !listingsLoading[user.id]) {
          getUserListingsCount(user.id);
        }
        break;
      case 'ban':
        console.log('Banning user:', user.id);
        updateUser(user.id, { status: 'banned' });
        break;
      case 'message':
        setSelectedUser(user);
        setShowWarningModal(true);
        break;
      case 'verify':
        console.log('Verifying user:', user.id);
        updateUser(user.id, { isVerified: true });
        break;
      case 'unban':
        console.log('Unbanning user:', user.id);
        updateUser(user.id, { status: 'active' });
        break;
    }
  };

  const sendWarning = async () => {
    if (selectedUser && warningMessage.trim()) {
      console.log('Sending warning to user:', selectedUser.id, warningMessage);
      await adminService.sendWarning(selectedUser.id, warningMessage);
      setShowWarningModal(false);
      setWarningMessage('');
      setSelectedUser(null);
    }
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'banned': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'suspended': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'inactive': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusDotColor = (status?: string) => {
    switch(status) {
      case 'active': return 'bg-green-500 dark:bg-green-400';
      case 'banned': return 'bg-red-500 dark:bg-red-400';
      case 'suspended': return 'bg-orange-500 dark:bg-orange-400';
      case 'inactive': return 'bg-gray-400 dark:bg-gray-500';
      default: return 'bg-gray-400 dark:bg-gray-500';
    }
  };

  // Helper function to render chat count
  const renderChatCount = (userId: string) => {
    if (chatLengthLoading[userId]) {
      return <ChatLengthSkeleton />;
    }

    const count = chatLengths[userId];
    
    if (count === 'error') {
      return (
        <div className="flex items-center space-x-1 text-red-500 dark:text-red-400">
          <MessageSquare className="w-4 h-4" />
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">Error loading</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-900 dark:text-gray-300">{count ?? 0} chats</span>
      </div>
    );
  };

  // Helper function to render listings count
  const renderListingsCount = (userId: string) => {
    if (listingsLoading[userId]) {
      return <ListingsSkeleton />;
    }

    const count = listingsCounts[userId];
    
    if (count === 'error') {
      return (
        <div className="flex items-center space-x-1 text-red-500 dark:text-red-400">
          <Package className="w-4 h-4" />
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">Error loading</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-900 dark:text-gray-300">{count ?? 0} listings</span>
      </div>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h1>
            {users.filter(u => u.isFlagged).length > 0 && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select 
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option>All</option>
                <option>Active</option>
                <option>Banned</option>
                <option>Suspended</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campus</label>
              <input
                type="text"
                placeholder="Filter by campus"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={filters.campus}
                onChange={(e) => setFilters({...filters, campus: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="verified"
              className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 bg-white dark:bg-gray-700"
              checked={filters.verified}
              onChange={(e) => setFilters({...filters, verified: e.target.checked})}
            />
            <label htmlFor="verified" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Verified users only</label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="px-4 py-2 space-y-3">
        {filteredUsers.map((user) => {
          const isExpanded = expandedUsers[user.id];
          
          return (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusDotColor(user.status)}`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                      {user.isVerified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      {user.isFlagged && <Flag className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status || 'Unknown'}
                  </span>
                  <button
                    onClick={() => toggleUserExpanded(user.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>Campus: {user.campus || 'N/A'}</span>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {renderChatCount(user.id)}
                    {renderListingsCount(user.id)}
                  </div>
                </div>
              )}

              {user.isFlagged && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mb-3">
                  <div className="flex items-center text-red-700 dark:text-red-400">
                    <Flag className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">This user has been flagged</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUserAction('view', user)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>

                {user.status !== 'banned' ? (
                  <button
                    onClick={() => handleUserAction('ban', user)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Ban</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUserAction('unban', user)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Unban</span>
                  </button>
                )}

                <button
                  onClick={() => handleUserAction('message', user)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>

                {!user.isVerified && (
                  <button
                    onClick={() => handleUserAction('verify', user)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Verify</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-3xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h2>
                <button onClick={() => setShowUserDetail(false)}>
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Identity Section */}
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {selectedUser.avatarUrl ? (
                    <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                <div className="flex justify-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Basic Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Campus:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedUser.campus || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Role:</span>
                    <span className="font-medium capitalize text-gray-900 dark:text-white">{selectedUser.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Verification</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email Verified:</span>
                  <div className="flex items-center">
                    {selectedUser.isVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedUser.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Activity Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    {listingsLoading[selectedUser.id] ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mb-2" />
                        <div className="text-xs text-blue-700 dark:text-blue-400">Loading...</div>
                      </div>
                    ) : listingsCounts[selectedUser.id] === 'error' ? (
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                        <div className="text-xs text-red-700 dark:text-red-400">Error</div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {listingsCounts[selectedUser.id] ?? 0}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-400">Listings</div>
                      </>
                    )}
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    {chatLengthLoading[selectedUser.id] ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-6 h-6 text-green-600 dark:text-green-400 animate-spin mb-2" />
                        <div className="text-xs text-green-700 dark:text-green-400">Loading...</div>
                      </div>
                    ) : chatLengths[selectedUser.id] === 'error' ? (
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                        <div className="text-xs text-red-700 dark:text-red-400">Error</div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {chatLengths[selectedUser.id] ?? 0}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-400">Chats</div>
                      </> 
                    )}
                  </div>
                </div>
              </div>

              {selectedUser.isFlagged && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">Flagged Content</h4>
                  <div className="text-sm text-red-700 dark:text-red-400">
                    <p>• 0 chats flagged</p>
                    <p>• 0 listings flagged</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send Warning</h2>
                <button onClick={() => setShowWarningModal(false)}>
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sending warning to:</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedUser.name} ({selectedUser.email})</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Warning Message</label>
                <textarea
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  rows={4}
                  placeholder="Enter your warning message..."
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendWarning}
                  disabled={!warningMessage.trim() || loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;