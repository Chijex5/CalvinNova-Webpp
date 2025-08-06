import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Edit3, Save, X, ChevronLeft, ChevronRight, User, MapPin, Mail, Phone, UserCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';
import api from '../utils/apiService';
import { toast } from 'sonner';
import BankVerificationModal from './AccountUpdateModal';
import { ThemeToggle } from './ThemeToggle';

export interface Payload {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

const SettingsPage = () => {
  const { updateUser } = useAuth();
  const store = useUserStore.getState();
  const user = store.user;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<string>('');
  
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    campus: user?.campus || '',
    phoneNumber: user?.phoneNumber || '',
    avatarUrl: user?.avatarUrl || ''
  });

  // Avatar selection state
  const [avatarSeeds, setAvatarSeeds] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=random');
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const avatarContainerRef = useRef<HTMLDivElement | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);

  // Generate random seeds for avatars
  const generateRandomSeeds = (count = 20) => {
    return Array.from({
      length: count
    }, () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  };

  // Load initial avatars
  useEffect(() => {
    const initialSeeds = generateRandomSeeds(20);
    setAvatarSeeds(initialSeeds);
  }, []);

  // Load more avatars when scrolling
  const loadMoreAvatars = useCallback(() => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      const newSeeds = generateRandomSeeds(20);
      setAvatarSeeds(prev => [...prev, ...newSeeds]);
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore]);

  // Handle avatar container scroll
  const handleAvatarScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollLeft, scrollWidth, clientWidth } = target;
    if (scrollLeft + clientWidth >= scrollWidth - 100) {
      loadMoreAvatars();
    }
  }, [loadMoreAvatars]);

  // Add scroll event listener
  useEffect(() => {
    const container = avatarContainerRef.current;
    if (container) {
      const scrollHandler = (e: Event) => {
        const target = e.target as HTMLDivElement;
        const { scrollLeft, scrollWidth, clientWidth } = target;
        if (scrollLeft + clientWidth >= scrollWidth - 100) {
          loadMoreAvatars();
        }
      };
      container.addEventListener('scroll', scrollHandler);
      return () => {
        container.removeEventListener('scroll', scrollHandler);
      };
    }
  }, [loadMoreAvatars]);

  const handleEditSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await updateUser(editForm);
      if (response.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSelect = (seed: string) => {
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
    setSelectedAvatar(avatarUrl);
    setEditForm({
      ...editForm,
      avatarUrl
    });
  };

  const scrollAvatars = (direction: 'left' | 'right') => {
    if (avatarContainerRef.current) {
      const scrollAmount = 200;
      avatarContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // TODO: Implement role change logic
  const handleRoleChange = async (newRole: string) => {
    try {
      setIsLoading(true);
      
      const response = await api.post('/api/change-role',{
        role: newRole
      })
      const data = response.data
      if (data.success) {
        if (data.requires_account) {
          setShowBankModal(true);
        } else {
          store.updateUserRole(newRole as "buyer" | "seller" | "both");
          toast.success(`Role changed to ${newRole}`);
          setShowRoleChangeModal(false);
        }
      }
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Failed to change role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankVerificationSuccess = async(payload: Payload) => {
    const response = await api.post('/api/users/additional-info', { 
      accountName: payload.accountName,
      bankCode: payload.bankCode,
      bankName: payload.bankName,
      accountNumber: payload.accountNumber
    });
    const data = response.data
    if (data.success){
      store.updateUserRole(pendingRole as "buyer" | "seller" | "both");
      store.setBankDetails({
        accountName: payload.accountName,
        bankName: payload.bankName,
        accountNumber: payload.accountNumber
      });
      setShowBankModal(false);
      toast.success('Changed role successfully')
    }
  }

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

  const availableRoles = ['buyer', 'seller', 'both'].filter(role => role !== user?.role);

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Choose Your Avatar
                </h2>
                <button
                  onClick={() => setShowAvatarSelector(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="relative">
                <button
                  onClick={() => scrollAvatars('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                <button
                  onClick={() => scrollAvatars('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                <div
                  ref={avatarContainerRef}
                  className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 px-12"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                  onScroll={handleAvatarScroll}
                >
                  {avatarSeeds.map((seed, index) => {
                    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
                    return (
                      <div
                        key={`${seed}-${index}`}
                        className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
                          selectedAvatar === avatarUrl
                            ? 'ring-4 ring-blue-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        onClick={() => handleAvatarSelect(seed)}
                      >
                        <img
                          src={avatarUrl}
                          alt={`Avatar ${index + 1}`}
                          className="w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-md"
                          loading="lazy"
                        />
                      </div>
                    );
                  })}

                  {isLoadingMore && (
                    <div className="flex-shrink-0 flex items-center justify-center w-20 h-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowAvatarSelector(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setEditForm({
                      ...editForm,
                      avatarUrl: selectedAvatar
                    });
                    setShowAvatarSelector(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select Avatar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Change Account Role
                </h2>
                <button
                  onClick={() => setShowRoleChangeModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Select your new account role. This will change what features you have access to.
                </p>
                
                <div className="space-y-3">
                  {availableRoles.map((role) => (
                    <label
                      key={role}
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={pendingRole === role}
                        onChange={(e) => setPendingRole(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRoleColor(role)}`}>
                            {getRoleLabel(role)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {role === 'buyer' && 'Purchase items from other students'}
                          {role === 'seller' && 'Sell items to other students (requires bank setup)'}
                          {role === 'both' && 'Both buy and sell items (requires bank setup)'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Role changes are permanent and may require additional setup steps.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRoleChangeModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRoleChange(pendingRole)}
                  disabled={!pendingRole || isLoading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    !pendingRole || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Changing...' : 'Change Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Personal Details
              </h3>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {isEditing ? (
            // Edit Form
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
              <div className="flex-shrink-0 mb-6 lg:mb-0">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="relative">
                    <img
                      src={editForm.avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg ring-2 ring-gray-100 dark:ring-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(editForm.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=random');
                        setShowAvatarSelector(true);
                      }}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Campus
                    </label>
                    <input
                      type="text"
                      value={editForm.campus}
                      onChange={(e) => setEditForm({ ...editForm, campus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleEditSubmit}
                    disabled={isLoading}
                    className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? <span>Saving...</span> : <span>Save Changes</span>}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        name: user.name || '',
                        email: user.email || '',
                        campus: user.campus || '',
                        phoneNumber: user.phoneNumber || '',
                        avatarUrl: user.avatarUrl || ''
                      });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Display Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Campus</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.campus}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Management Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Account Role
              </h3>
            </div>
            <button
              onClick={() => {
                setPendingRole('');
                setShowRoleChangeModal(true);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Change Role</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Current Role</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {user.role === 'buyer' && 'You can purchase items from other students'}
                  {user.role === 'seller' && 'You can sell items to other students'}
                  {user.role === 'both' && 'You can both buy and sell items'}
                  {user.role === 'admin' && 'You have administrative privileges'}
                  {user.role === 'agent' && 'You provide support to users'}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p><strong>Available roles:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Buyer:</strong> Purchase items from other students</li>
                <li><strong>Seller:</strong> Sell your items to other students (requires bank setup)</li>
                <li><strong>Both:</strong> Full access to buy and sell features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 lg:p-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose your preferred color scheme
                </p>
              </div>
              <ThemeToggle />
            </div>

            {/* TODO: Add more preferences */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-50">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Language</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Select your preferred language
                </p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-50">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Time Zone</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Set your local time zone
                </p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
      <BankVerificationModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSuccess={handleBankVerificationSuccess}
        userName={user?.name || ''}
      />
    </div>
  );
};

export default SettingsPage;