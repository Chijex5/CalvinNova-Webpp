import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import selfService from '../services/selfServices';
import { useUserStore } from '../store/userStore';
import { 
  Bell, 
  Check, 
  Eye,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Package,
  MessageSquare,
  UserPlus,
  TrendingUp,
  RefreshCw,
  Info,
  CheckCircle,
  ShoppingBag,
  CreditCard,
  Star,
  Truck
} from 'lucide-react';

// Types matching your backend structure
interface Notification {
  id: number;
  title: string;
  message: string; // Contains HTML
  type: string;
  is_read: number; // 0 or 1
  action_url?: string;
  priority: 'low' | 'normal' | 'high';
  created_at: string; // GMT format
  updated_at: string;
  transaction_id?: string;
}

// Skeleton Loader Component
const NotificationSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Main Component
const NotificationsPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [notificationLoading, setNotificationLoading] = useState<{type: string, id: number} | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const userStore = useUserStore.getState();
  const notifications = userStore.user?.notifications || [];
  const { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, setNotifications } = userStore;
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [expandedNotifications, setExpandedNotifications] = useState<number[]>([]);

  const getNotificationIcon = (type: string, priority: string) => {
    const baseClasses = "w-5 h-5";
    const priorityColor = priority === 'high' ? 'text-red-500' : 
                         priority === 'normal' ? 'text-blue-500' : 'text-gray-500';

    switch (type) {
      case 'message':
        return <MessageSquare className={`${baseClasses} ${priorityColor}`} />;
      case 'order':
        return <Package className={`${baseClasses} ${priorityColor}`} />;
      case 'sale':
        return <CheckCircle className={`${baseClasses} text-green-500`} />;
      case 'payment':
        return <CreditCard className={`${baseClasses} text-green-500`} />;
      case 'follower':
        return <UserPlus className={`${baseClasses} ${priorityColor}`} />;
      case 'price_alert':
        return <TrendingUp className={`${baseClasses} ${priorityColor}`} />;
      case 'system':
        return <Info className={`${baseClasses} ${priorityColor}`} />;
      case 'review':
        return <Star className={`${baseClasses} ${priorityColor}`} />;
      case 'delivery':
        return <Truck className={`${baseClasses} ${priorityColor}`} />;
      default:
        return <Bell className={`${baseClasses} ${priorityColor}`} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'normal':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'low':
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
      default:
        return null;
    }
  };

  const refreshNotifications = async () => {
    try {
        setLoading(true);
        const response = await selfService.refreshNotifications();
        if (response.success) {
          setNotifications(response.notifications || []);
        }
    } catch (error) {
        console.error("Failed to refresh notifications:", error);
    } finally {
        setLoading(false);
    }
  };

  const getActionButtonText = (type: string) => {
    switch (type) {
      case 'message':
        return 'Reply Now';
      case 'order':
        return 'View Order';
      case 'sale':
        return 'View Sale';
      case 'payment':
        return 'View Transaction';
      case 'follower':
        return 'View Profile';
      case 'price_alert':
        return 'Check It Out';
      case 'system':
        return 'Learn More';
      case 'review':
        return 'View Review';
      case 'delivery':
        return 'Track Order';
      default:
        return 'View Details';
    }
  };

  const markAsRead = async (id: number) => {
    try{
        setNotificationLoading({type: 'markAsRead', id});
        const response = await selfService.markAsRead(id);
        if (response.success) {
          markNotificationAsRead(id);
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      } finally {
        setNotificationLoading(null);
      }
  };

  const markAllAsRead = async () => {
    try {
      setNotificationLoading({ type: 'markAllAsRead', id: -1 });
      const response = await selfService.markAllAsRead();
      if (response.success) {
        markAllNotificationsAsRead();
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setNotificationLoading(null);
    }
  };

  const deleteANotification = async (id: number) => {
    try {
      setNotificationLoading({ type: 'deleteNotification', id });
      const response = await selfService.deleteNotification(id);
      if (response.success) {
        deleteNotification(id);
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setNotificationLoading(null);
    }
  };

  const toggleSelectNotification = (id: number) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const toggleExpandNotification = (id: number) => {
    setExpandedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    try{
        setLoading(true);
        for (const id of selectedNotifications) {
        await deleteANotification(id);
        }
        setSelectedNotifications([]);
        setExpandedNotifications(prev => 
        prev.filter(id => !selectedNotifications.includes(id))
        );
    } catch (error) {
        console.error("Failed to delete selected notifications:", error);
    } finally {
        setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'read') return notif.is_read === 1;
    if (filter === 'unread') return notif.is_read === 0;
    return true;
  });

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>

          {/* Filter Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="animate-pulse flex space-x-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <NotificationSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
                <h1 className="flex items-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    <Bell className="w-7 h-7 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Notifications
                </h1>

                {/* Right: Refresh Button */}
                <button
                    onClick={refreshNotifications}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>

              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Stay updated with your latest activities
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200">
                    {unreadCount} unread
                  </span>
                )}
              </p>

            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {selectedNotifications.length > 0 && (
                <button
                  onClick={deleteSelected}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete ({selectedNotifications.length})
                </button>
              )}
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={notificationLoading?.type === 'markAllAsRead'}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {notificationLoading?.type === 'markAllAsRead'
                    ? 'Marking all as read...'
                    : 'Mark all as read'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    filter === 'all'
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600/50'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    filter === 'unread'
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600/50'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    filter === 'read'
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600/50'
                  }`}
                >
                  Read ({notifications.length - unreadCount})
                </button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications." 
                    : filter === 'read'
                    ? "No read notifications to show."
                    : "You don't have any notifications yet."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const isExpanded = expandedNotifications.includes(notification.id);
                return (
                  <div
                    key={notification.id}
                    className={`transition-all duration-200 ${
                      notification.is_read === 0 ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                    }`}
                  >
                    {/* Collapsed View */}
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => toggleSelectNotification(notification.id)}
                            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
                          />

                          {/* Icon */}
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-full ${
                              notification.type === 'message' ? 'bg-blue-100 dark:bg-blue-900/50' :
                              notification.type === 'order' ? 'bg-purple-100 dark:bg-purple-900/50' :
                              notification.type === 'sale' ? 'bg-green-100 dark:bg-green-900/50' :
                              notification.type === 'payment' ? 'bg-green-100 dark:bg-green-900/50' :
                              notification.type === 'system' ? 'bg-gray-100 dark:bg-gray-700' :
                              'bg-indigo-100 dark:bg-indigo-900/50'
                            }`}>
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className={`text-sm font-medium truncate ${
                                notification.is_read === 0 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </h3>
                              {getPriorityBadge(notification.priority)}
                              {notification.is_read === 0 && (
                                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                              
                              {notification.transaction_id && (
                                <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {notification.transaction_id}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() => toggleExpandNotification(notification.id)}
                          className="ml-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-gray-50/50 dark:bg-gray-700/20 border-t border-gray-200 dark:border-gray-700">
                        <div className="pl-12">
                          {/* Full Message */}
                          <div 
                            className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: notification.message }}
                          />

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-3 flex-wrap gap-2">
                            {notification.action_url && (
                              <button 
                                onClick={() => navigate(notification?.action_url || '#')}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors duration-200">
                                <ExternalLink className="w-4 h-4 mr-1.5" />
                                {getActionButtonText(notification.type)}
                              </button>
                            )}
                            
                            {notification.is_read === 0 && (
                              <button
                                disabled={notificationLoading?.type === 'markAsRead' && notificationLoading.id === notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Eye className="w-4 h-4 mr-1.5" />
                                {notificationLoading?.type === 'markAsRead' && notificationLoading.id === notification.id
                                  ? 'Marking as read...'
                                  : 'Mark as read'}
                              </button>
                            )}
                            
                            <button
                              disabled={notificationLoading?.type === 'deleteNotification' && notificationLoading.id === notification.id}
                              onClick={() => deleteANotification(notification.id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4 mr-1.5" />
                              Delete
                            </button>
                          </div>

                          {/* Metadata */}
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <div>Created: {new Date(notification.created_at).toLocaleString()}</div>
                            {notification.updated_at !== notification.created_at && (
                              <div>Updated: {new Date(notification.updated_at).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {selectedNotifications.length > 0 
                    ? `${selectedNotifications.length} selected`
                    : `Showing ${filteredNotifications.length} of ${notifications.length} notifications`
                  }
                </p>
                
                {notifications.length > 10 && (
                  <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                    Load more
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;