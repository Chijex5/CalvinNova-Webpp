import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ShoppingBagIcon, MessageSquareIcon, UserIcon, PlusCircleIcon, MenuIcon, X as XIcon, BellIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const {
    user,
    isAdmin,
    isAuthenticated,
    isLoading
  } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const navItems: Array<{
    name: string;
    path: string;
    icon: React.ReactElement | null;
  }> = [{
    name: 'Home',
    path: '/',
    icon: <HomeIcon size={20} />
  }, {
    name: 'Marketplace',
    path: '/marketplace',
    icon: <ShoppingBagIcon size={20} />
  }, {
    name: 'Chat',
    path: '/chat',
    icon: <MessageSquareIcon size={20} />
  }, {
    name: 'Sell',
    path: '/sell',
    icon: <PlusCircleIcon size={20} />
  }];
  if (isAdmin) {
    navItems.push({
      name: 'Admin',
      path: '/admin',
      icon: null
    });
  }
  if (!isAuthenticated || isLoading){
    return null;
  }
  
  return <header className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white border-b border-gray-200'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CalvinNova
            </span>
          </Link>
          {/* Notification icon for mobile */}
          <div className="flex items-center md:hidden">
            <button className="p-2 mr-2 text-gray-500 hover:text-indigo-600 relative">
              <BellIcon size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {user && <Link to="/profile" className="mr-4 w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-200">
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              </Link>}
            <button onClick={toggleMenu} className="flex items-center" aria-label="Toggle menu">
              {isMenuOpen ? <XIcon size={24} className="text-gray-700" /> : <MenuIcon size={24} className="text-gray-700" />}
            </button>
          </div>
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => <Link key={item.path} to={item.path} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === item.path ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                {item.icon && <span>{item.icon}</span>}
                <span>{item.name}</span>
              </Link>)}
            {/* Notification icon for desktop */}
            <button className="p-2 ml-2 text-gray-500 hover:text-indigo-600 relative">
              <BellIcon size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {/* User avatar */}
            {user && <Link to="/profile" className="ml-2 w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-200">
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              </Link>}
          </nav>
        </div>
      </div>
      {/* Mobile navigation */}
      {isMenuOpen && <nav className="md:hidden bg-white border-t border-gray-100 shadow-lg rounded-b-xl">
          {navItems.map(item => <Link key={item.path} to={item.path} className={`flex items-center space-x-3 px-4 py-3 border-b border-gray-100 ${location.pathname === item.path ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'}`} onClick={() => setIsMenuOpen(false)}>
              {item.icon && <span>{item.icon}</span>}
              <span>{item.name}</span>
            </Link>)}
        </nav>}
    </header>;
};
export default Navigation;