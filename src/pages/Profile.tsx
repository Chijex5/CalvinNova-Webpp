import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfilePage from '../components/ProfilePage';
import SettingsPage from '../components/AccountSettings';
import AccountSecurityPage from '../components/AccountSecurityPage';

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get active tab from URL params or default to 'profile'
  const getActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'profile';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update activeTab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.search]);

  // Handle tab change
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    navigate(`/profile?tab=${tabName}`, { replace: true });
  };

  const tabs = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'View your profile information'
    },
    {
      id: 'settings',
      name: 'Account Settings',
      icon: Settings,
      description: 'Manage your account preferences'
    },
    {
      id: 'security',
      name: 'Security & Payments',
      icon: Shield,
      description: 'Security settings and payment methods'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'security':
        return <AccountSecurityPage />;
      default:
        return <ProfilePage />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full mx-4">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-600 h-16 w-16"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Account Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your profile, settings, and security preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={`-ml-0.5 mr-2 h-5 w-5 ${
                        isActive
                          ? 'text-blue-500 dark:text-blue-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      }`}
                    />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;