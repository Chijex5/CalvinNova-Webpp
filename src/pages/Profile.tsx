import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, MapPin, Shield, LogOut, Settings, Moon, Bell, Edit3, CreditCard, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';
import { ThemeToggle } from '../components/ThemeToggle';
import { toast } from 'sonner';
const ProfilePage = () => {
  const {
    logout,
    updateUser
  } = useAuth();
  const store = useUserStore.getState();
  const user = store.user;
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name,
    email: user?.email,
    campus: user?.campus,
    avatarUrl: user?.avatarUrl
  });

  // Avatar selection state
  const [avatarSeeds, setAvatarSeeds] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=random');
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const avatarContainerRef = useRef<HTMLDivElement | null>(null);
  const isASeller = user?.role === 'seller' || user?.role === 'both';

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

  // Fixed: Handle avatar container scroll with proper event typing
  const handleAvatarScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const {
      scrollLeft,
      scrollWidth,
      clientWidth
    } = target;

    // Check if we're near the end of the scroll area
    if (scrollLeft + clientWidth >= scrollWidth - 100) {
      loadMoreAvatars();
    }
  }, [loadMoreAvatars]);

  // Fixed: Add scroll event listener
  useEffect(() => {
    const container = avatarContainerRef.current;
    if (container) {
      const scrollHandler = (e: Event) => {
        const target = e.target as HTMLDivElement;
        const {
          scrollLeft,
          scrollWidth,
          clientWidth
        } = target;
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
        return 'bg-red-100 text-red-700';
      case 'seller':
        return 'bg-green-100 text-green-700';
      case 'buyer':
        return 'bg-blue-100 text-blue-700';
      case 'both':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
      default:
        return role;
    }
  };
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
  if (!user) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8 max-w-md w-full mx-4">
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
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account settings and preferences</p>
        </div>

        {/* Avatar Selector Modal */}
        {showAvatarSelector && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Choose Your Avatar</h2>
                  <button onClick={() => setShowAvatarSelector(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="relative">
                  <button onClick={() => scrollAvatars('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  
                  <button onClick={() => scrollAvatars('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>

                  {/* Fixed: Proper scroll event handling */}
                  <div ref={avatarContainerRef} className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 px-12" style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }} onScroll={handleAvatarScroll}>
                    {avatarSeeds.map((seed, index) => {
                  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
                  return <div key={`${seed}-${index}`} className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${selectedAvatar === avatarUrl ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'}`} onClick={() => handleAvatarSelect(seed)}>
                          <img src={avatarUrl} alt={`Avatar ${index + 1}`} className="w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-md" loading="lazy" />
                        </div>;
                })}
                    
                    {isLoadingMore && <div className="flex-shrink-0 flex items-center justify-center w-20 h-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>}
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-3">
                  <button onClick={() => setShowAvatarSelector(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => {
                setEditForm({
                  ...editForm,
                  avatarUrl: selectedAvatar
                });
                setShowAvatarSelector(false);
              }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Select Avatar
                  </button>
                </div>
              </div>
            </div>
          </div>}

        {/* Main Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-6 lg:p-8">
            {isEditing ?
          // Edit Form
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
                <div className="flex-shrink-0 mb-6 lg:mb-0">
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="relative">
                      <img src={editForm.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg ring-2 ring-gray-100 dark:ring-gray-600" />
                      <button type="button" onClick={() => {
                    setSelectedAvatar(editForm.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=random');
                    setShowAvatarSelector(true);
                  }} className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors">
                        <Edit3 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input type="text" value={editForm.name} onChange={e => setEditForm({
                    ...editForm,
                    name: e.target.value
                  })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input type="email" value={editForm.email} onChange={e => setEditForm({
                    ...editForm,
                    email: e.target.value
                  })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campus</label>
                      <input type="text" value={editForm.campus} onChange={e => setEditForm({
                    ...editForm,
                    campus: e.target.value
                  })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button onClick={handleEditSubmit} disabled={isLoading} className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Save className="w-4 h-4" />
                      {isLoading ? <span>Saving...</span> : <span>Save Changes</span>}
                    </button>
                    <button onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: user.name,
                    email: user.email,
                    campus: user.campus,
                    avatarUrl: user.avatarUrl
                  });
                }} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div> :
          // Display Mode
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
                <div className="flex-shrink-0 mb-6 lg:mb-0">
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="relative">
                      <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg ring-2 ring-gray-100 dark:ring-gray-600" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></div>
                    </div>
                    <div className="mt-4 text-center lg:text-left">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{user.name}</h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{user.email}</p>
                      <p className='text-gray-600 dark:text-gray-300 mt-1'>{user.phoneNumber}</p>
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Details</h3>
                      
                      <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{user.campus}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Joined {formatJoinDate(user.createdAt || '')}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">Verified Account</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Actions</h3>
                      
                      <div className="space-y-3">
                        <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                          <Edit3 className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </button>
                        
                        <button onClick={logout} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors">
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>}
          </div>
        </div>

        {/* Bank Details Card */}
        {isASeller && <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bank Details</h3>
                <div className="flex-1"></div>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  Protected - View Only
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Name</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.bankDetails?.accountName || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Number</label>
                  <p className="text-gray-900 dark:text-white font-medium font-mono">
                    {user.bankDetails?.accountNumber ? `****${user.bankDetails.accountNumber.slice(-4)}` : 'Not provided'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.bankDetails?.bankName || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Bank details are encrypted and cannot be edited from this interface. 
                  Contact support if you need to update your banking information.
                </p>
              </div>
            </div>
          </div>}

        {/* Account Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Preferences</h4>
                
                <div className="space-y-3">

                  <ThemeToggle />
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">Notifications</span>
                    </div>
                    <div className="w-10 h-6 bg-indigo-500 rounded-full relative cursor-not-allowed">
                      <div className="w-4 h-4 bg-white dark:bg-gray-800 rounded-full absolute top-1 right-1 transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Account Status</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <span className="text-sm text-green-700 dark:text-green-300">Email Verified</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Campus Verified</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Two-Factor Auth</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">Optional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default ProfilePage;