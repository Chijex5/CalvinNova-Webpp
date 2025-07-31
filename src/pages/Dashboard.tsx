import React, { useEffect, useState, Component } from 'react';
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
import { MessageSquareIcon, ShoppingBagIcon, PlusCircleIcon, TrendingUpIcon, BellIcon, CalendarIcon, UserIcon, CheckCircleIcon, RefreshCwIcon, DollarSignIcon, PackageIcon, BarChart2Icon, ShoppingCartIcon, HeartIcon, TagIcon, AlertTriangleIcon, BookmarkIcon, ListIcon, ClipboardListIcon, LineChartIcon, LayersIcon, UsersIcon, HelpCircleIcon, StarIcon, PieChartIcon, ActivityIcon } from 'lucide-react';
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
interface DashboardMetrics {
  totalListings?: number;
  totalSales?: number;
  totalEarnings?: number;
  completedOrders?: number;
  totalSpent?: number;
  pendingOrders?: number;
  totalUsers?: number;
  activeTickets?: number;
  totalReports?: number;
  platformRevenue?: number;
}
// Component for the buyer dashboard
const BuyerDashboard = ({
  user,
  statsData,
  nearbyListings,
  loading,
  userActivity,
  totalUnreadMessages,
  navigate
}) => {
  return <>
      {/* Buyer Stats */}
      <FadeIn direction="up" delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                <MessageSquareIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {totalUnreadMessages}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New Messages
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                <ShoppingCartIcon size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {statsData.two}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Orders
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                <DollarSignIcon size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  ₦{statsData.three}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Spent
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                <CheckCircleIcon size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {statsData.four}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed Purchases
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
      {/* Quick Actions for Buyers */}
      <FadeIn direction="up" delay={0.15}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button onClick={() => navigate('/marketplace')} className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
              <ShoppingBagIcon size={24} className="text-indigo-600 dark:text-indigo-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Browse Marketplace
              </span>
            </button>
            <button onClick={() => navigate('/account/transactions')} className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <ClipboardListIcon size={24} className="text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                My Orders
              </span>
            </button>
            <button onClick={() => navigate('/notifications')} className="flex flex-col items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              <BellIcon size={24} className="text-amber-600 dark:text-amber-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Notifications
              </span>
            </button>
            <button onClick={() => navigate('/chat')} className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <MessageSquareIcon size={24} className="text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Messages
              </span>
            </button>
          </div>
        </div>
      </FadeIn>
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
                <p className="text-gray-500 dark:text-gray-400">
                  No new listings nearby
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Check back later or explore the marketplace!
                </p>
              </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nearbyListings.map((product, index) => <ProductCard key={product.id} product={product} delay={0.1 * index} />)}
              </div>}
            <div className="mt-4 text-center">
              <Button variant="secondary" size="sm" onClick={() => navigate('/marketplace')}>
                Explore More Items
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
      {/* Saved Searches & Alerts */}
      <FadeIn direction="up" delay={0.25}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Saved Searches & Alerts
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center p-4">
              <BookmarkIcon size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                No saved searches yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
                Save searches to get notified when new items are listed
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/marketplace')}>
                Browse Categories
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </>;
};
// Component for the seller dashboard
const SellerDashboard = ({
  user,
  statsData,
  activeListings,
  loading,
  navigate,
  formatPrice
}) => {
  return <>
      {/* Seller Stats */}
      <FadeIn direction="up" delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                <MessageSquareIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {statsData.one}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New Messages
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                <TagIcon size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {statsData.two}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Listings
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                <DollarSignIcon size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  ₦{statsData.three}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Earnings
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                <CheckCircleIcon size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {statsData.four}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed Sales
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
      {/* Quick Actions for Sellers */}
      <FadeIn direction="up" delay={0.15}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button onClick={() => navigate('/sell')} className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
              <PlusCircleIcon size={24} className="text-indigo-600 dark:text-indigo-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Create Listing
              </span>
            </button>
            <button onClick={() => navigate('/account/transactions')} className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <DollarSignIcon size={24} className="text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                My Sales
              </span>
            </button>
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              <ListIcon size={24} className="text-amber-600 dark:text-amber-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                My Listings
              </span>
            </button>
            <button onClick={() => navigate('/chat')} className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <MessageSquareIcon size={24} className="text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Messages
              </span>
            </button>
          </div>
        </div>
      </FadeIn>
      {/* Your Active Listings */}
      <FadeIn direction="up" delay={0.2}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Your Active Listings
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              Manage All
            </Button>
          </div>
          {loading ? <ListingSkeleton type="activeListings" count={4} /> : <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeListings.length > 0 ? activeListings.map(listing => <div key={listing.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer" onClick={() => navigate(`/product/${listing.slug}`)}>
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
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                          Active
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          0 views
                        </span>
                      </div>
                    </div>
                  </div>) : <div className="p-8 text-center">
                  <ShoppingBagIcon size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No active listings
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
                    Start selling your unused items today!
                  </p>
                  <Button variant="primary" size="sm" icon={<PlusCircleIcon size={16} />} onClick={() => navigate('/sell')}>
                    Create Listing
                  </Button>
                </div>}
            </div>}
          {activeListings.length > 0 && <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/70 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {activeListings.length} of {statsData.two} listings
                </p>
                <Button variant="primary" size="sm" icon={<PlusCircleIcon size={16} />} onClick={() => navigate('/sell')}>
                  New Listing
                </Button>
              </div>
            </div>}
        </div>
      </FadeIn>
      {/* Sales Performance */}
      <FadeIn direction="up" delay={0.25}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Sales Performance
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center p-4">
              <LineChartIcon size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Sales data will appear here
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
                Complete more sales to see your performance metrics
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Response Rate
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  100%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg. Response Time
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  30 min
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Seller Rating
                </p>
                <div className="flex items-center justify-center mt-1">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    5.0
                  </p>
                  <StarIcon size={16} className="text-yellow-500 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </>;
};
// Component for users with both buyer and seller roles
const BothRoleDashboard = ({
  user,
  statsData,
  activeListings,
  nearbyListings,
  loading,
  userActivity,
  totalUnreadMessages,
  navigate,
  formatPrice
}) => {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('seller');
  return <>
      {/* Role Toggle Tabs */}
      <FadeIn direction="up" delay={0.05}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          <div className="flex">
            <button onClick={() => setActiveTab('seller')} className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'seller' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
              Seller Dashboard
            </button>
            <button onClick={() => setActiveTab('buyer')} className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'buyer' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
              Buyer Dashboard
            </button>
          </div>
        </div>
      </FadeIn>
      {/* Conditional Dashboard Content */}
      {activeTab === 'seller' ? <SellerDashboard user={user} statsData={statsData} activeListings={activeListings} loading={loading} navigate={navigate} formatPrice={formatPrice} /> : <BuyerDashboard user={user} statsData={statsData} nearbyListings={nearbyListings} loading={loading} userActivity={userActivity} totalUnreadMessages={totalUnreadMessages} navigate={navigate} />}
    </>;
};
// Component for admin dashboard
const AdminDashboard = ({
  user,
  statsData,
  navigate
}) => {
  return <>
      {/* Admin Stats */}
      <FadeIn direction="up" delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                <UsersIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {statsData.one}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verified Users
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                <ShoppingBagIcon size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {statsData.two}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Products
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                <CheckCircleIcon size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {statsData.three}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed Orders
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                <DollarSignIcon size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  ₦{statsData.four}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Platform Revenue
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
      {/* Admin Quick Actions */}
      <FadeIn direction="up" delay={0.15}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Admin Controls
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button onClick={() => navigate('/admin/users')} className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
              <UsersIcon size={24} className="text-indigo-600 dark:text-indigo-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Manage Users
              </span>
            </button>
            <button onClick={() => navigate('/admin/reports')} className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <AlertTriangleIcon size={24} className="text-red-600 dark:text-red-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Reports
              </span>
            </button>
            <button onClick={() => navigate('/marketplace')} className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <ShoppingBagIcon size={24} className="text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Products
              </span>
            </button>
            <button onClick={() => navigate('/chat')} className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <HelpCircleIcon size={24} className="text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Support
              </span>
            </button>
          </div>
        </div>
      </FadeIn>
      {/* Platform Metrics */}
      <FadeIn direction="up" delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* User Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 dark:text-white">
                User Activity
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
                Details
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    New Registrations (Today)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    12
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Users (Last 24h)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    87
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Verified Sellers
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    45
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Flagged Accounts
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    3
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Transaction Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 dark:text-white">
                Transaction Stats
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/reports')}>
                Reports
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    New Orders (Today)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    8
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Verification
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    5
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Completed (Last 7 Days)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    32
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total GMV (Last 30 Days)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦325,750
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
      {/* Support Tickets */}
      <FadeIn direction="up" delay={0.25}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Support Tickets
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/reports')}>
              View All
            </Button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Payment Issue
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                  High Priority
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-5">
                User unable to complete transaction #TR-7829
              </p>
              <div className="flex justify-between items-center mt-2 ml-5">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Opened 2 hours ago
                </span>
                <Button variant="outline" size="xs">
                  Assign
                </Button>
              </div>
            </div>
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Account Verification
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                  Medium Priority
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-5">
                Seller requesting manual verification of identity
              </p>
              <div className="flex justify-between items-center mt-2 ml-5">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Opened 5 hours ago
                </span>
                <Button variant="outline" size="xs">
                  Assign
                </Button>
              </div>
            </div>
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Feature Request
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  Low Priority
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-5">
                Multiple users requesting bulk listing feature
              </p>
              <div className="flex justify-between items-center mt-2 ml-5">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Opened 1 day ago
                </span>
                <Button variant="outline" size="xs">
                  Assign
                </Button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/70 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              3 active tickets requiring attention
            </p>
          </div>
        </div>
      </FadeIn>
    </>;
};
// Main Dashboard component
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
          }, {}, {
            watch: false,
            state: true
          });
          let total = 0;
          for (const channel of channels) {
            total += channel.countUnread();
          }
          if (isMounted) setTotalUnread(total);
        } catch (err) {
          console.error('Failed to fetch unread counts:', err);
        }
      };
      calculateUnreadCount();
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
  const activeListings = products.filter(product => product.sellerId === user?.userId).slice(0, 4);
  const nearbyListings = products.filter(product => product.sellerId !== user?.userId).slice(0, 4);
  if (!user) return null;
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6">
        {/* Personal Greeting Section */}
        <FadeIn direction="up">
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                  dangerouslySetInnerHTML={{ __html: greeting.greeting }}
                />
                <p className="text-gray-600 dark:text-gray-400 mt-1"
                  dangerouslySetInnerHTML={{ __html: greeting.subMessage }}
                />
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                {(user.role === 'seller' || user.role === 'both') && <Button variant="primary" size="sm" icon={<PlusCircleIcon size={16} />} onClick={() => navigate('/sell')}>
                    List an Item
                  </Button>}
                <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
                  Browse
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
        {/* Role-specific Dashboard Content */}
        {statLoading ? <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg w-10 h-10"></div>
                    <div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>)}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm h-48"></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm h-64"></div>
          </div> : <>
            {user.role === 'buyer' && <BuyerDashboard user={user} statsData={statsData} nearbyListings={nearbyListings} loading={loading} userActivity={userActivity} totalUnreadMessages={totalUnreadMessages} navigate={navigate} />}
            {user.role === 'seller' && <SellerDashboard user={user} statsData={statsData} activeListings={activeListings} loading={loading} navigate={navigate} formatPrice={formatPrice} />}
            {user.role === 'both' && <BothRoleDashboard user={user} statsData={statsData} activeListings={activeListings} nearbyListings={nearbyListings} loading={loading} userActivity={userActivity} totalUnreadMessages={totalUnreadMessages} navigate={navigate} formatPrice={formatPrice} />}
            {user.role === 'admin' && <AdminDashboard user={user} statsData={statsData} navigate={navigate} />}
          </>}
      </div>
    </div>;
};
export default Dashboard;