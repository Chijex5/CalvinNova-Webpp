import React from 'react';
import { User, Calendar, MapPin, Shield, LogOut, Settings, Moon, Bell, Edit3 } from 'lucide-react';

// Import the actual hooks as specified
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';

const ProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const store = useUserStore.getState();
  const user = store.user;

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'seller': return 'bg-green-100 text-green-700';
      case 'buyer': return 'bg-blue-100 text-blue-700';
      case 'both': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'seller': return 'Seller';
      case 'buyer': return 'Buyer';
      case 'both': return 'Buyer & Seller';
      default: return role;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full mx-4">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-16 w-16"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
              {/* Left Column - Profile Image & Basic Info */}
              <div className="flex-shrink-0 mb-6 lg:mb-0">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg ring-2 ring-gray-100"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="mt-4 text-center lg:text-left">
                    <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600 mt-1">{user.email}</p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Metadata & Actions */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{user.campus}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Joined {formatJoinDate(user.createdAt || '')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Verified Account</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Actions</h3>
                    
                    <div className="space-y-3">
                      <button
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed transition-colors"
                        disabled
                        title="Coming Soon"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                      <p className="text-xs text-gray-500 text-center">Coming Soon</p>
                      
                      <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Preferences</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Moon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Dark Mode</span>
                    </div>
                    <div className="w-10 h-6 bg-gray-300 rounded-full relative cursor-not-allowed">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Notifications</span>
                    </div>
                    <div className="w-10 h-6 bg-indigo-500 rounded-full relative cursor-not-allowed">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Account Status</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700">Email Verified</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">Campus Verified</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Two-Factor Auth</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Optional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;