import React, { useEffect, useState, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, RefreshCw, Search, Compass, Map, Frown, HelpCircle } from 'lucide-react';
import { FadeIn } from '../utils/animations';
const NotFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  // For the floating elements animation
  const [elements] = useState(() => Array.from({
    length: 8
  }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 5
  })));
  useEffect(() => {
    // Set animation complete after a delay
    const timer = setTimeout(() => setAnimationComplete(true), 1200);
    return () => clearTimeout(timer);
  }, []);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  const goBack = () => {
    navigate(-1);
  };
  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {elements.map(el => <div key={el.id} className="absolute rounded-full bg-gradient-to-r from-indigo-400/10 to-purple-400/10 dark:from-indigo-500/20 dark:to-purple-500/20 animate-float" style={{
        left: `${el.x}%`,
        top: `${el.y}%`,
        width: `${el.size}px`,
        height: `${el.size}px`,
        animationDelay: `${el.delay}s`,
        animationDuration: `${el.duration}s`
      }} />)}
      </div>
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="p-8 md:p-12 relative">
                {/* 404 Text */}
                <div className="relative mb-8 md:mb-12">
                  <div className="flex justify-center relative z-10">
                    <h1 className="text-[120px] md:text-[180px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 leading-none select-none">
                      404
                    </h1>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-5">
                    <div className="text-[250px] md:text-[350px] font-black text-gray-900 dark:text-white">
                      404
                    </div>
                  </div>
                </div>
                {/* Message */}
                <div className="text-center mb-10 md:mb-12">
                  <FadeIn direction="up" delay={0.1}>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      Oops! Page Not Found
                    </h2>
                  </FadeIn>
                  <FadeIn direction="up" delay={0.2}>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                      The page you are looking for might have been removed, had
                      its name changed, or is temporarily unavailable. Let's get
                      you back on track!
                    </p>
                  </FadeIn>
                </div>
                {/* Actions */}
                <FadeIn direction="up" delay={0.3}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                    <button onClick={goBack} className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 px-6 rounded-xl font-medium transition-all duration-200 group">
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      <span>Go Back</span>
                    </button>
                    <Link to="/" className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg group">
                      <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Back to Home</span>
                    </Link>
                  </div>
                </FadeIn>
                {/* Search Box */}
                <FadeIn direction="up" delay={0.4}>
                  <div className="max-w-md mx-auto">
                    <div className="relative">
                      <form onSubmit={handleSearch}>
                        <input type="text" placeholder="Search for something else..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200" />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                          <Search className="w-5 h-5" />
                        </div>
                        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-indigo-600 dark:bg-indigo-500 text-white p-1.5 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200">
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                      </form>
                    </div>
                  </div>
                </FadeIn>
              </div>
              {/* Footer with Helpful Links */}
              <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50 py-4 px-8">
                <FadeIn direction="up" delay={0.5}>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                    <Link to="/marketplace" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
                      <Compass className="w-4 h-4 mr-1" />
                      <span>Explore Marketplace</span>
                    </Link>
                    <Link to="/profile" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
                      <Map className="w-4 h-4 mr-1" />
                      <span>Your Profile</span>
                    </Link>
                    <button onClick={() => window.location.reload()} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      <span>Refresh Page</span>
                    </button>
                  </div>
                </FadeIn>
              </div>
            </div>
          </FadeIn>
          {/* Lost Campus Student Illustration */}
          <div className={`mt-8 text-center transition-all duration-500 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center justify-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-gray-200/50 dark:border-gray-700/50">
              <Frown className="w-5 h-5 text-amber-500" />
              <span className="text-gray-600 dark:text-gray-300">
                Lost on campus? Don't worry, it happens to everyone!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default NotFound;