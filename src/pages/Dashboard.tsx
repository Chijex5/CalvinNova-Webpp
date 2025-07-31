import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListingSkeleton from '../components/loaders/DashboardLoader';
import { getGreeting } from '../functions/getGreetings';
import RecentConversationsSkeleton from '../components/loaders/RecentConversationLoader';
import { Chat, User, OnlineIndicator } from './Chat';
import { toast } from 'sonner';
import { FadeIn } from '../utils/animations';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import api from '../utils/apiService';
import { client } from '../lib/stream-chat';
import { useChatStore } from '../store/chatStore';
import { productService } from '../services/productService';
import { useProductStore } from '../store/productStore';
import { MessageSquareIcon, ShoppingBagIcon, PlusCircleIcon, TrendingUpIcon, BellIcon, CalendarIcon, UserIcon, CheckCircleIcon, RefreshCwIcon } from 'lucide-react';
interface UserAvatarProps {
  user?: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  const fallbackColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
  const getColorFromId = (id: string): string => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbackColors[hash % fallbackColors.length];
  };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  if (!user?.image || imageError) {
    return <div className={`${sizeClasses[size]} ${getColorFromId(user?.id || '')} rounded-full flex items-center justify-center text-white dark:text-gray-900 font-medium ${className}`}>
        {initials}
      </div>;
  }
  return <img src={user.image} alt={user.name || 'User'} className={`${sizeClasses[size]} rounded-full object-cover ${className}`} onError={() => setImageError(true)} />;
};
interface StatsData {
  one: string;
  two: string;
  three: string;
  four: string;
}
const Dashboard = () => {
  const {
    user,
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  const {
    products,
    loading,
    error
  } = useProductStore();
  const [statLoading, setStatLoading] = useState<boolean>(false);
  const [statsData, setStatsData] = useState<StatsData>({
    one: '0',
    two: '0',
    three: '0',
    four: '0'
  });
  const getTitle = (number: number, role: string) => {
    if (role === 'buyer') {
      return number === 1 ? 'New Message' : number === 2 ? 'Total Orders' : number === 3 ? 'Total Amount Spent' : 'Completed Purchases';
    } else if (role === 'seller') {
      return number === 1 ? 'New Message' : number === 2 ? 'Total Products Listings' : number === 3 ? 'Total Earnings' : 'Completed Sales';
    } else if (role === 'both') {
      return number === 1 ? 'New Message' : number === 2 ? 'Total Products Listed' : number === 3 ? 'Total Earnings' : 'Completed Purchases';
    } else if (role === 'admin') {
      return number === 1 ? 'Verified Users' : number === 2 ? 'Active Products' : number === 3 ? 'Completed Orders' : 'Platform Revenue';
    } else if (role === 'agent') {
      return number === 1 ? 'Active Cases' : number === 2 ? 'Resolved Cases' : number === 3 ? 'TimedOut Tickets' : 'Assigned Cases';
    }
  };
  const {
    chats,
    getChatsForUser,
    isLoadingChats
  } = useChatStore();
  useEffect(() => {
    const loadStats = async (type: string) => {
      try {
        setStatLoading(true);
        const response = await api.get(`api/user/stats/${type}`);
        if (response.data.success) {
          if (type === 'both') {
            setStatsData(response.data.stats.overview);
          } else {
            setStatsData(response.data.stats);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setStatLoading(false);
      }
    };
    loadStats(user?.role || '');
  }, [user?.role]);
  const getLastMessage = (chat: Chat): string => {
    const messages = chat.state.messages || [];
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return 'No messages yet';
    if (lastMessage.type === 'system') {
      return '🔒 System message';
    }
    const isCurrentUser = lastMessage.user?.id === user?.userId;
    const prefix = isCurrentUser ? 'You: ' : '';
    return `${prefix}${lastMessage.text || 'Media message'}`;
  };
  const getOtherUser = (chat: Chat): User | undefined => {
    const members = chat.state.members || {};
    return Object.values(members).find(m => m.user?.id !== user?.userId)?.user;
  };
  function useTotalUnreadCount(client: any | null) {
    const [totalUnread, setTotalUnread] = useState(0);
    useEffect(() => {
      if (!client || !client.user) return;
      let isMounted = true;
      const calculateUnreadCount = async () => {
        try {
          const channels = await client.queryChannels({
            members: {
              $in: [client.user.id]
            }
          }, {},
          // sort
          {
            watch: false,
            state: true
          } // only fetch channel state
          );
          let total = 0;
          for (const channel of channels) {
            total += channel.countUnread();
          }
          if (isMounted) setTotalUnread(total);
        } catch (err) {
          console.error("Failed to fetch unread counts:", err);
        }
      };

      // Fetch on mount
      calculateUnreadCount();

      // Listener for real-time new messages
      const handleNewMessage = async (event: any) => {
        const senderId = event.user?.id;
        const isMine = senderId === client.user?.id;
        if (!isMine) {
          await calculateUnreadCount();
        }
      };
      client.on('message.new', handleNewMessage);
      client.on('notification.message_new', handleNewMessage);
      return () => {
        isMounted = false;
        client.off('message.new', handleNewMessage);
        client.off('notification.message_new', handleNewMessage);
      };
    }, [client]);
    return totalUnread;
  }
  const totalUnreadMessages = useTotalUnreadCount(client);
  useEffect(() => {
    if (isAuthenticated) {
      getChatsForUser();
    }
  }, [isAuthenticated, getChatsForUser]);
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await productService.fetchProducts();
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    loadProducts();
  }, []);
  useEffect(() => {
    if (error) {
      toast.error(error || 'Failed to load products');
    }
  }, [error]);
  const userActivity = {
    newMessages: totalUnreadMessages,
    itemsSoldThisWeek: 2,
    viewsOnListings: 15,
    savedItems: 4
  };
  const greeting = getGreeting(user?.name || 'user', user?.role || 'buyer');
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };
  const activeListings = products.filter(product => product.sellerId === user?.userId).slice(0, 2);
  const nearbyListings = products.filter(product => product.sellerId !== user?.userId).slice(0, 4);
  if (!user) return null;
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6">
        {/* Personal Greeting Section */}
        <FadeIn direction="up">
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {greeting.greeting}
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {user.name.split(' ')[0]}
                  </span>{' '}
                  👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{greeting.subMessage}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                <Button variant="primary" size="sm" icon={<PlusCircleIcon size={16} />} onClick={() => navigate('/sell')}>
                  List an Item
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
                  Browse
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Activity Cards */}
        <FadeIn direction="up" delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statLoading ? <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 animate-pulse">
                <div className="flex items-center space-x-3">
                  {/* Icon Placeholder */}
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                    <div className="w-5 h-5 bg-indigo-300 dark:bg-indigo-500 rounded" />
                  </div>

                  {/* Text Placeholder */}
                  <div className="flex flex-col space-y-2">
                    <div className="w-10 h-4 bg-indigo-200 dark:bg-indigo-600 rounded" />
                    <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded" />
                  </div>
                </div>
              </div> : <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                    <MessageSquareIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {user.role === 'admin' || user.role === 'agent' ? statsData.one : userActivity.newMessages}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{getTitle(1, user.role)}</p>
                  </div>
                </div>
              </div>}
            {statLoading ? <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 animate-pulse">
                <div className="flex items-center space-x-3">
                  {/* Icon Placeholder */}
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                    <div className="w-5 h-5 bg-green-300 dark:bg-green-500 rounded" />
                  </div>

                  {/* Text Placeholder */}
                  <div className="flex flex-col space-y-2">
                    <div className="w-10 h-4 bg-green-200 dark:bg-green-600 rounded" />
                    <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded" />
                  </div>
                </div>
              </div> : <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                    <CheckCircleIcon size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {statsData.two}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{getTitle(2, user?.role)}</p>
                  </div>
                </div>
              </div>}

            {statLoading ? <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 animate-pulse">
                <div className="flex items-center space-x-3">
                  {/* Icon Placeholder */}
                  <div className="bg-indigo-100 dark:bg-purple-900/50 p-2 rounded-lg">
                    <div className="w-5 h-5 bg-purple-300 dark:bg-indigo-500 rounded" />
                  </div>

                  {/* Text Placeholder */}
                  <div className="flex flex-col space-y-2">
                    <div className="w-10 h-4 bg-purple-200 dark:bg-purple-600 rounded" />
                    <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded" />
                  </div>
                </div>
              </div> : <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                    <TrendingUpIcon size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {statsData.three}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{getTitle(3, user?.role)}</p>
                  </div>
                </div>
              </div>}

            {statLoading ? <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 animate-pulse">
                <div className="flex items-center space-x-3">
                  {/* Icon Placeholder */}
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                    <div className="w-5 h-5 bg-amber-300 dark:bg-amber-500 rounded" />
                  </div>

                  {/* Text Placeholder */}
                  <div className="flex flex-col space-y-2">
                    <div className="w-10 h-4 bg-amber-200 dark:bg-amber-600 rounded" />
                    <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded" />
                  </div>
                </div>
              </div> : <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                    <ShoppingBagIcon size={20} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {statsData.four}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{getTitle(4, user?.role)}</p>
                  </div>
                </div>
              </div>}
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Active Conversations */}
          <div className="lg:col-span-1">
            <FadeIn direction="up" delay={0.2}>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Recent Conversations
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
                    See All
                  </Button>
                </div>
                {isLoadingChats ? <RecentConversationsSkeleton count={3} /> : <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {chats.slice(0, 3).map((convo, index) => <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer" onClick={() => navigate(`/chat/${convo.id}`)}>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <UserAvatar user={getOtherUser(convo)} size="md" className="flex-shrink-0" />
                            {<OnlineIndicator userId={getOtherUser(convo)?.userId || ''} size="sm" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {getOtherUser(convo)?.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {convo.state.last_message_at ? new Date(convo.state.last_message_at).toLocaleDateString() : 'No date'}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {getLastMessage(convo)}
                            </p>
                          </div>
                          {convo.countUnread() > 0 && <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {convo.countUnread()}
                            </span>}
                        </div>
                      </div>)}
                    {chats.length === 0 && <div className="p-8 text-center">
                        <MessageSquareIcon size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Start browsing to find items and chat with sellers!
                        </p>
                      </div>}
                  </div>}
                {chats.length > 0 && <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pro tip:{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Quick responses
                      </span>{' '}
                      get you better deals! 
                    </p>
                  </div>}
              </div>
            </FadeIn>

            {/* Your Active Listings */}
            {(user.role === 'seller' || user.role === 'both') && <FadeIn direction="up" delay={0.3}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="font-bold text-gray-900 dark:text-white">
                      Your Active Listings
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                      Manage
                    </Button>
                  </div>
                  {loading ? <ListingSkeleton type="activeListings" count={2} /> : <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {user.role === 'seller' || user.role === 'both' && activeListings.length > 0 ? activeListings.map(listing => <div key={listing.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer" onClick={() => navigate(`/product/${listing.slug}`)}>
                            <div className="flex items-center space-x-3">
                              <img src={listing.images[0]} alt={listing.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 ring-1 ring-gray-200 dark:ring-gray-700" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {listing.title}
                                </p>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold">
                                  {formatPrice(listing.price)}
                                </p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
                                    {listing.category}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    {new Date(listing.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>) : <div className="p-8 text-center">
                          <ShoppingBagIcon size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">No active listings</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
                            Start selling your unused items today!
                          </p>
                          <Button variant="primary" size="sm" icon={<PlusCircleIcon size={16} />} onClick={() => navigate('/sell')}>
                            Create Listing
                          </Button>
                        </div>}
                    </div>}
                  </div>
              </FadeIn>}
          </div>

          {/* Right Column - New Listings & Upcoming */}
          <div className="lg:col-span-2">
            {/* New Listings Near You */}
            <FadeIn direction="up" delay={0.2}>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    New Listings Near You
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
                    See All
                  </Button>
                </div>
                <div className="p-6">
                  {loading ? <ListingSkeleton type="nearbyListings" count={4} /> : nearbyListings.length === 0 ? <div className="text-center p-8">
                      <ShoppingBagIcon size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No new listings nearby</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Check back later or explore the marketplace!
                      </p>
                    </div> : null}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {nearbyListings.map((product, index) => <ProductCard key={product.id} product={product} delay={0.1 * index} />)}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Found something you like?{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Message the seller
                      </span>{' '}
                      to reserve it!
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => navigate('/marketplace')}>
                      Explore More Items
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Campus Events & Upcoming */}
            <FadeIn direction="up" delay={0.3}>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-bold text-gray-900 dark:text-white">Campus Happenings</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800/50">
                      <div className="flex items-start space-x-3">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg ring-1 ring-indigo-200 dark:ring-indigo-800/50">
                          <CalendarIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            End of Semester Sale
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Graduating seniors are listing items at huge
                            discounts! Check the marketplace this weekend.
                          </p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                            May 15-20
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800/50">
                      <div className="flex items-start space-x-3">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg ring-1 ring-purple-200 dark:ring-purple-800/50">
                          <UserIcon size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            Campus Ambassadors
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Become a CalvinNova campus ambassador and earn rewards
                            for helping fellow students!
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                            Applications open
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50">
                      <div className="flex items-start space-x-3">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg ring-1 ring-amber-200 dark:ring-amber-800/50">
                          <RefreshCwIcon size={20} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            Textbook Exchange
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Find and swap textbooks for your upcoming classes.
                            Save money and help the environment!
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                            Ongoing
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl p-4 border border-teal-200 dark:border-teal-800/50">
                      <div className="flex items-start space-x-3">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg ring-1 ring-teal-200 dark:ring-teal-800/50">
                          <BellIcon size={20} className="text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            Set Item Alerts
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Looking for something specific? Set alerts and we'll
                            notify you when it's listed!
                          </p>
                          <Button variant="outline" size="sm" className="mt-2 text-xs py-1 px-2 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/50">
                            Create Alert
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>;
};
export default Dashboard;