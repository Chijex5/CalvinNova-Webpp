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

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <header className={`sticky top-0 left-0 right-0 z-50 mb-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
        : 'bg-white/90 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img 
                src="/logo.svg" 
                alt="NovaPlus Logo" 
                className="h-8 w-8 lg:h-10 lg:w-10 transition-all duration-300 group-hover:scale-105 group-hover:rotate-12"
              />
            </div>
            <span className="ml-3 text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              NovaPlus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-full text-sm lg:text-base font-medium transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/80 hover:shadow-sm'
                }`}
              >
                {item.icon && (
                  <span className={`transition-transform duration-300 ${
                    location.pathname === item.path ? '' : 'group-hover:scale-110'
                  }`}>
                    {item.icon}
                  </span>
                )}
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            ))}
            
            {/* Notification Bell - Desktop */}
            <button className="relative p-2 lg:p-3 ml-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-full transition-all duration-300 group">
              <BellIcon size={20} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
            </button>

            {/* User Avatar - Desktop */}
            {user && (
              <Link to="/profile" className="relative ml-2 group">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-indigo-100 group-hover:border-indigo-300 transition-all duration-300 group-hover:scale-105">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>
            )}
          </nav>

          {/* Mobile Right Section */}
          <div className="flex items-center md:hidden space-x-2">
            {/* Notification Bell - Mobile */}
            <button className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-full transition-all duration-300">
              <BellIcon size={20} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User Avatar - Mobile */}
            {user && (
              <Link to="/profile" className="relative">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-200">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu} 
              className="p-2 hover:bg-indigo-50/80 rounded-full transition-all duration-300 group"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <MenuIcon 
                  size={24} 
                  className={`absolute inset-0 text-gray-700 transition-all duration-300 ${
                    isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                  }`}
                />
                <XIcon 
                  size={24} 
                  className={`absolute inset-0 text-gray-700 transition-all duration-300 ${
                    isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden transition-all duration-300 ${
        isMenuOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <nav className="bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-lg">
          <div className="container mx-auto px-4 py-2">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg my-1 transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.icon && (
                  <span className="transition-transform duration-300">
                    {item.icon}
                  </span>
                )}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;