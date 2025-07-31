import React, { useEffect, useState, createElement, Component } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import selfService from '../services/selfServices';
import { useUserStore } from '../store/userStore';
import { FadeIn } from '../utils/animations';
import { Bell, Check, Eye, Trash2, ChevronDown, ChevronRight, ExternalLink, Package, MessageSquare, UserPlus, TrendingUp, RefreshCw, Info, CheckCircle, ShoppingBag, CreditCard, Star, Truck, Filter, Search, Calendar, Clock, AlertCircle } from 'lucide-react';
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
const NotificationSkeleton = () => <div className="animate-pulse">
    {[...Array(6)].map((_, i) => <div key={i} className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          {/* Icon Placeholder */}
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>)}
  </div>;
// Empty State Component
const EmptyNotifications = ({
  filter
}: {
  filter: string;
}) => <FadeIn direction="up">
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Bell className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No notifications found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {filter === 'unread' ? "You're all caught up! No unread notifications." : filter === 'read' ? 'No read notifications to show.' : "You don't have any notifications yet."}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        New activity will appear here
      </p>
    </div>
  </FadeIn>;
// Main Component
const NotificationsPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [notificationLoading, setNotificationLoading] = useState<{
    type: string;
    id: number;
  } | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const userStore = useUserStore.getState();
  const notifications = userStore.user?.notifications || [];
  const {
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setNotifications
  } = userStore;
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [expandedNotifications, setExpandedNotifications] = useState<number[]>([]);
  const getNotificationIcon = (type: string, priority: string) => {
    const baseClasses = 'w-5 h-5';
    const priorityColor = priority === 'high' ? 'text-red-500 dark:text-red-400' : priority === 'normal' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400';
    switch (type) {
      case 'message':
        return <MessageSquare className={`${baseClasses} ${priorityColor}`} />;
      case 'order':
        return <Package className={`${baseClasses} ${priorityColor}`} />;
      case 'sale':
        return <CheckCircle className={`${baseClasses} text-green-500 dark:text-green-400`} />;
      case 'payment':
        return <CreditCard className={`${baseClasses} text-green-500 dark:text-green-400`} />;
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
  const getNotificationBackground = (type: string, isRead: number) => {
    const baseClasses = isRead === 0 ? 'bg-opacity-10 dark:bg-opacity-20' : 'bg-opacity-0 dark:bg-opacity-0';
    switch (type) {
      case 'message':
        return `${baseClasses} bg-blue-500 dark:bg-blue-700`;
      case 'order':
        return `${baseClasses} bg-purple-500 dark:bg-purple-700`;
      case 'sale':
        return `${baseClasses} bg-green-500 dark:bg-green-700`;
      case 'payment':
        return `${baseClasses} bg-green-500 dark:bg-green-700`;
      case 'system':
        return `${baseClasses} bg-yellow-500 dark:bg-yellow-700`;
      case 'price_alert':
        return `${baseClasses} bg-orange-500 dark:bg-orange-700`;
      default:
        return `${baseClasses} bg-gray-500 dark:bg-gray-700`;
    }
  };
  const getNotificationIconBackground = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'order':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'sale':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'payment':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'follower':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'price_alert':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'system':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'review':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400';
      case 'delivery':
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            High
          </span>;
      case 'normal':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            <Info className="w-3 h-3" />
            Normal
          </span>;
      case 'low':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
            <Info className="w-3 h-3" />
            Low
          </span>;
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
      console.error('Failed to refresh notifications:', error);
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
    try {
      setNotificationLoading({
        type: 'markAsRead',
        id
      });
      const response = await selfService.markAsRead(id);
      if (response.success) {
        markNotificationAsRead(id);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setNotificationLoading(null);
    }
  };
  const markAllAsRead = async () => {
    try {
      setNotificationLoading({
        type: 'markAllAsRead',
        id: -1
      });
      const response = await selfService.markAllAsRead();
      if (response.success) {
        markAllNotificationsAsRead();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setNotificationLoading(null);
    }
  };
  const deleteANotification = async (id: number) => {
    try {
      setNotificationLoading({
        type: 'deleteNotification',
        id
      });
      const response = await selfService.deleteNotification(id);
      if (response.success) {
        deleteNotification(id);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setNotificationLoading(null);
    }
  };
  const toggleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]);
  };
  const toggleExpandNotification = (id: number) => {
    setExpandedNotifications(prev => prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]);
  };
  const deleteSelected = async () => {
    try {
      setLoading(true);
      for (const id of selectedNotifications) {
        await deleteANotification(id);
      }
      setSelectedNotifications([]);
      setExpandedNotifications(prev => prev.filter(id => !selectedNotifications.includes(id)));
    } catch (error) {
      console.error('Failed to delete selected notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredNotifications = notifications.filter(notif => {
    // Filter by read/unread status
    if (filter === 'read') return notif.is_read === 1;
    if (filter === 'unread') return notif.is_read === 0;
    return true;
  }).filter(notif => {
    // Filter by search query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return notif.title.toLowerCase().includes(query) || notif.message.toLowerCase().includes(query) || notif.type.toLowerCase().includes(query) || notif.transaction_id && notif.transaction_id.toLowerCase().includes(query);
  });
  const unreadCount = notifications.filter(n => n.is_read === 0).length;
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
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
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <FadeIn direction="up">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Notifications
                  {unreadCount > 0 && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200">
                      {unreadCount} unread
                    </span>}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Stay updated with your latest activities and transactions
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedNotifications.length > 0 && <button onClick={deleteSelected} className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200">
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete ({selectedNotifications.length})
                  </button>}
                {unreadCount > 0 && <button onClick={markAllAsRead} disabled={notificationLoading?.type === 'markAllAsRead'} className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Check className="w-4 h-4 mr-1.5" />
                    {notificationLoading?.type === 'markAllAsRead' ? 'Marking all as read...' : 'Mark all as read'}
                  </button>}
                <button onClick={refreshNotifications} className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" placeholder="Search notifications..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600" />
                </div>
                {/* Filter Tabs */}
                <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                  <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${filter === 'all' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50'}`}>
                    All ({notifications.length})
                  </button>
                  <button onClick={() => setFilter('unread')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${filter === 'unread' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50'}`}>
                    Unread ({unreadCount})
                  </button>
                  <button onClick={() => setFilter('read')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${filter === 'read' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50'}`}>
                    Read ({notifications.length - unreadCount})
                  </button>
                </div>
              </div>
            </div>
            {/* Notifications List */}
            <div>
              {filteredNotifications.length === 0 ? <EmptyNotifications filter={filter} /> : <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map(notification => {
                const isExpanded = expandedNotifications.includes(notification.id);
                const isSelected = selectedNotifications.includes(notification.id);
                return <div key={notification.id} className={`transition-all duration-200 ${notification.is_read === 0 ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''} ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${getNotificationBackground(notification.type, notification.is_read)}`}>
                        {/* Collapsed View */}
                        <div className={`p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                          <div className="flex items-start gap-4">
                            {/* Checkbox + Icon */}
                            <div className="flex items-start gap-3">
                              <div className="pt-1">
                                <input type="checkbox" checked={isSelected} onChange={() => toggleSelectNotification(notification.id)} className="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2" />
                              </div>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIconBackground(notification.type)}`}>
                                {getNotificationIcon(notification.type, notification.priority)}
                              </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0" onClick={() => toggleExpandNotification(notification.id)}>
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <h3 className={`text-base font-medium ${notification.is_read === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {notification.title}
                                  {notification.is_read === 0 && <span className="inline-block ml-2 w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {getPriorityBadge(notification.priority)}
                                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true
                              })}
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {stripHtml(notification.message)}
                              </p>
                              {notification.transaction_id && <div className="inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded mb-2">
                                  {notification.transaction_id}
                                </div>}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex flex-wrap gap-2">
                                  {notification.action_url && <button onClick={e => {
                              e.stopPropagation();
                              navigate(notification?.action_url || '#');
                            }} className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors duration-200">
                                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                      {getActionButtonText(notification.type)}
                                    </button>}
                                  {notification.is_read === 0 && <button onClick={e => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }} disabled={notificationLoading?.type === 'markAsRead' && notificationLoading.id === notification.id} className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                                      {notificationLoading?.type === 'markAsRead' && notificationLoading.id === notification.id ? 'Marking...' : 'Mark as read'}
                                    </button>}
                                </div>
                                <button onClick={e => {
                            e.stopPropagation();
                            toggleExpandNotification(notification.id);
                          }} className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Expanded View */}
                        {isExpanded && <div className="px-5 pb-5 pt-2 bg-gray-50/70 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700">
                            <div className="ml-16">
                              {/* Full Message */}
                              <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm" dangerouslySetInnerHTML={{
                        __html: notification.message
                      }} />
                              {/* Action Buttons */}
                              <div className="flex flex-wrap items-center gap-3 mb-4">
                                {notification.action_url && <button onClick={() => navigate(notification?.action_url || '#')} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors duration-200">
                                    <ExternalLink className="w-4 h-4 mr-1.5" />
                                    {getActionButtonText(notification.type)}
                                  </button>}
                                {notification.is_read === 0 && <button disabled={notificationLoading?.type === 'markAsRead' && notificationLoading.id === notification.id} onClick={() => markAsRead(notification.id)} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Eye className="w-4 h-4 mr-1.5" />
                                    {notificationLoading?.type === 'markAsRead' && notificationLoading.id === notification.id ? 'Marking as read...' : 'Mark as read'}
                                  </button>}
                                <button disabled={notificationLoading?.type === 'deleteNotification' && notificationLoading.id === notification.id} onClick={() => deleteANotification(notification.id)} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                  <Trash2 className="w-4 h-4 mr-1.5" />
                                  {notificationLoading?.type === 'deleteNotification' && notificationLoading.id === notification.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                  Created:{' '}
                                  {new Date(notification.created_at).toLocaleString()}
                                </div>
                                {notification.updated_at !== notification.created_at && <div className="flex items-center">
                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                    Updated:{' '}
                                    {new Date(notification.updated_at).toLocaleString()}
                                  </div>}
                              </div>
                            </div>
                          </div>}
                      </div>;
              })}
                </div>}
            </div>
            {/* Footer */}
            {filteredNotifications.length > 0 && <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    {selectedNotifications.length > 0 ? `${selectedNotifications.length} selected` : `Showing ${filteredNotifications.length} of ${notifications.length} notifications`}
                  </p>
                  {notifications.length > 10 && <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                      Load more
                    </button>}
                </div>
              </div>}
          </div>
        </FadeIn>
      </div>
    </div>;
};
export default NotificationsPage;