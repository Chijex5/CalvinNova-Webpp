import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMockProducts } from '../utils/mockData';
import { useChat } from '../context/ChatContext';
import { FadeIn } from '../utils/animations';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { MessageSquareIcon, ShoppingBagIcon, PlusCircleIcon, TrendingUpIcon, BellIcon, CalendarIcon, UserIcon, CheckCircleIcon, RefreshCwIcon } from 'lucide-react';
const Dashboard = () => {
  const {
    user,
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  const {
    products,
    featuredProducts
  } = useMockProducts();
  const {
    conversations
  } = useChat();
  const [greeting, setGreeting] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);
  // Set random motivational quote
  useEffect(() => {
    const quotes = ["Today's a great day to find what you need!", "One student's clutter is another's treasure.", 'Campus deals are just a message away!', 'Your next favorite item is waiting for you.', "Connect, buy, sell, repeat. That's the CalvinNova way!"];
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);
  // Mock user activity data
  const userActivity = {
    newMessages: 3,
    itemsSoldThisWeek: 2,
    viewsOnListings: 15,
    savedItems: 4
  };
  // Mock active listings data
  const activeListings = products.slice(0, 2);
  // Mock nearby listings - filter products not from the user
  const nearbyListings = products.filter(product => product.sellerId !== user?.id).slice(0, 4);
  if (!user) return null;
  return <div className="container mx-auto px-4 py-6">
      {/* Personal Greeting Section */}
      <FadeIn direction="up">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {greeting},{' '}
                <span className="text-indigo-600">
                  {user.name.split(' ')[0]}
                </span>{' '}
                👋
              </h1>
              <p className="text-gray-600 mt-1">{motivationalQuote}</p>
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
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <MessageSquareIcon size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-indigo-600">
                  {userActivity.newMessages}
                </p>
                <p className="text-sm text-gray-600">New messages</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircleIcon size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">
                  {userActivity.itemsSoldThisWeek}
                </p>
                <p className="text-sm text-gray-600">Items sold this week</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingUpIcon size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">
                  {userActivity.viewsOnListings}
                </p>
                <p className="text-sm text-gray-600">Views on your listings</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <ShoppingBagIcon size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">
                  {userActivity.savedItems}
                </p>
                <p className="text-sm text-gray-600">Saved items</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Active Conversations */}
        <div className="lg:col-span-1">
          <FadeIn direction="up" delay={0.2}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-900">
                  Recent Conversations
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
                  See All
                </Button>
              </div>
              <div className="divide-y divide-gray-100">
                {conversations.slice(0, 3).map(convo => <div key={convo.userId} className="p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => navigate(`/chat/${convo.userId}`)}>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img src={convo.avatar} alt={convo.name} className="w-10 h-10 rounded-full object-cover" />
                        {convo.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-900 truncate">
                            {convo.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {convo.lastMessageTime}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {convo.lastMessage}
                        </p>
                      </div>
                      {convo.unreadCount > 0 && <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {convo.unreadCount}
                        </span>}
                    </div>
                  </div>)}
                {conversations.length === 0 && <div className="p-8 text-center">
                    <MessageSquareIcon size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No conversations yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Start browsing to find items and chat with sellers!
                    </p>
                  </div>}
              </div>
              {conversations.length > 0 && <div className="px-6 py-3 bg-gray-50 text-center">
                  <p className="text-sm text-gray-500">
                    Pro tip:{' '}
                    <span className="text-indigo-600 font-medium">
                      Quick responses
                    </span>{' '}
                    get you better deals! 🚀
                  </p>
                </div>}
            </div>
          </FadeIn>
          {/* Your Active Listings */}
          <FadeIn direction="up" delay={0.3}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-900">
                  Your Active Listings
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                  Manage
                </Button>
              </div>
              <div className="divide-y divide-gray-100">
                {activeListings.length > 0 ? activeListings.map(listing => <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => navigate(`/product/${listing.id}`)}>
                      <div className="flex items-center space-x-3">
                        <img src={listing.images[0]} alt={listing.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {listing.title}
                          </p>
                          <p className="text-indigo-600 font-bold">
                            ${listing.price}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                              {listing.category}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(listing.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>) : <div className="p-8 text-center">
                    <ShoppingBagIcon size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No active listings</p>
                    <p className="text-sm text-gray-400 mt-1 mb-4">
                      Start selling your unused items today!
                    </p>
                    <Button variant="primary" size="sm" icon={<PlusCircleIcon size={16} />} onClick={() => navigate('/sell')}>
                      Create Listing
                    </Button>
                  </div>}
              </div>
            </div>
          </FadeIn>
        </div>
        {/* Right Column - New Listings & Upcoming */}
        <div className="lg:col-span-2">
          {/* New Listings Near You */}
          <FadeIn direction="up" delay={0.2}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-900">
                  New Listings Near You
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
                  See All
                </Button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nearbyListings.map((product, index) => <ProductCard key={product.id} product={product} delay={0.1 * index} />)}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Found something you like?{' '}
                    <span className="text-indigo-600 font-medium">
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
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Campus Happenings</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-start space-x-3">
                      <div className="bg-white p-2 rounded-lg">
                        <CalendarIcon size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          End of Semester Sale
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Graduating seniors are listing items at huge
                          discounts! Check the marketplace this weekend.
                        </p>
                        <p className="text-xs text-indigo-600 mt-2 font-medium">
                          May 15-20
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="bg-white p-2 rounded-lg">
                        <UserIcon size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Campus Ambassadors
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Become a CalvinNova campus ambassador and earn rewards
                          for helping fellow students!
                        </p>
                        <p className="text-xs text-purple-600 mt-2 font-medium">
                          Applications open
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-start space-x-3">
                      <div className="bg-white p-2 rounded-lg">
                        <RefreshCwIcon size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Textbook Exchange
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Find and swap textbooks for your upcoming classes.
                          Save money and help the environment!
                        </p>
                        <p className="text-xs text-amber-600 mt-2 font-medium">
                          Ongoing
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
                    <div className="flex items-start space-x-3">
                      <div className="bg-white p-2 rounded-lg">
                        <BellIcon size={20} className="text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Set Item Alerts
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Looking for something specific? Set alerts and we'll
                          notify you when it's listed!
                        </p>
                        <Button variant="outline" size="sm" className="mt-2 text-xs py-1 px-2 border-teal-300 text-teal-700 hover:bg-teal-50">
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
    </div>;
};
export default Dashboard;