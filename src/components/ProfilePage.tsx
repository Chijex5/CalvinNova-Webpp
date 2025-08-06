import React from 'react';
import { Calendar, MapPin, Shield, Award, TrendingUp, Package, Star, Eye, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';
import TransactionHistory from './TransactionHistory';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const store = useUserStore.getState();

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-600 h-20 w-20"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'seller':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'buyer':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'both':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'agent':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'seller':
        return 'Seller';
      case 'buyer':
        return 'Buyer';
      case 'both':
        return 'Buyer & Seller';
      case 'agent':
        return 'Support Agent';
      default:
        return role;
    }
  };

  const isASeller = user?.role === 'seller' || user?.role === 'both';
  const isABuyer = user?.role === 'buyer' || user?.role === 'both';

  // Mock stats - replace with actual data from your store/API
  const profileStats = {
    profileViews: 0,
    totalTransactions: 0,
    successRate: 100,
    joinedDaysAgo: Math.floor((new Date().getTime() - new Date(user.createdAt || '').getTime()) / (1000 * 60 * 60 * 24))
  };

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0 mb-6 lg:mb-0">
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg ring-2 ring-gray-100 dark:ring-gray-600"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></div>
                </div>
                
                <div className="mt-4 text-center lg:text-left">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {user.email}
                  </p>
                  {user.phoneNumber && (
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {user.phoneNumber}
                    </p>
                  )}
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="flex-1">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Account Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{user.campus}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Joined {formatJoinDate(user.createdAt || '')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Verified Account</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Profile Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Profile Stats
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Profile Views
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {profileStats.profileViews}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Total Transactions
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {profileStats.totalTransactions}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Success Rate
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {profileStats.successRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific Information */}
      {isASeller && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Seller Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Bank Status
                </label>
                <p className={`text-sm font-medium ${user.bankDetails?.accountName ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {user.bankDetails?.accountName ? 'Verified' : 'Setup Required'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Listings
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  0 {/* Replace with actual count from store */}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Sales
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  ₦0.00 {/* Replace with actual amount from store */}
                </p>
              </div>
            </div>

            {!user.bankDetails?.accountName && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Action Required:</strong> Please set up your bank details in the Security & Payments section to start receiving payments.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>

          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity to show</p>
              <p className="text-sm mt-1">Your recent transactions and activities will appear here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {(isABuyer || isASeller) && (
        <TransactionHistory
          title={
            user?.role === 'both' 
              ? 'Recent Transactions' 
              : user?.role === 'buyer' 
                ? 'Recent Purchases' 
                : 'Recent Sales'
          }
          filter={
            user?.role === 'both' 
              ? 'all' 
              : user?.role === 'buyer' 
                ? 'buying' 
                : 'selling'
          }
        />
      )}
    </div>
  );
};

export default ProfilePage;