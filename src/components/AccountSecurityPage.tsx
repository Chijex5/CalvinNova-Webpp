import { useState } from 'react';
import { Shield, Key, CreditCard, Eye, EyeOff, AlertTriangle, CheckCircle, Plus, Edit3, Trash2} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { toast } from 'sonner';
import api from '../utils/apiService';
import { useAuth } from '../context/AuthContext';
import BankVerificationModal from './AccountUpdateModal';
import { formatDistanceToNow } from 'date-fns';
import { Payload } from './AccountSettings';

const AccountSecurityPage = () => {
  const store = useUserStore.getState();
  const user = store.user;
  const { changePassword } = useAuth();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false); // TODO: Get from user data

  const isASeller = user?.role === 'seller' || user?.role === 'both';

  // TODO: Implement password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const response = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (response.success) {
        toast.success('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setActiveSection('');
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error : any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Implement 2FA toggle
  const handleToggle2FA = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Implement 2FA setup/disable
      // if (!twoFactorEnabled) {
      //   const response = await setup2FA();
      //   // Show QR code modal for setup
      // } else {
      //   const response = await disable2FA();
      // }
      
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
      
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      toast.error('Failed to update two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBankAccount =  () => {
      setShowBankModal(true);
  };

  const handleBankVerificationSuccess = async (payload: Payload) => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/users/additional-info', {
        accountName: payload.accountName,
        bankCode: payload.bankCode,
        bankName: payload.bankName,
        accountNumber: payload.accountNumber
      });

      const data = response.data;
      if (data.success) {
        store.setBankDetails({
          accountName: payload.accountName,
          bankName: payload.bankName,
          accountNumber: payload.accountNumber
        });
        setShowBankModal(false);
        toast.success('Bank account added successfully');
      } else {
        toast.error('Failed to add bank account');
      }

    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error('Failed to add bank account');
    } finally {
      setIsLoading(false);
    }
  };



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
      {/* Password Security */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Password Security
              </h3>
            </div>
            <button
              onClick={() => setActiveSection(activeSection === 'password' ? '' : 'password')}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              <Key className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </div>

          {activeSection === 'password' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handlePasswordChange}
                  disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  onClick={() => {
                    setActiveSection('');
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Password</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                </p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={handleToggle2FA}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {!twoFactorEnabled && (
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    We recommend enabling two-factor authentication to secure your account.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banking Details (For Sellers) */}
      {isASeller && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Banking Details
                </h3>
              </div>
              {!user.bankDetails?.accountName && (
                <button
                  onClick={handleAddBankAccount}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Bank Account</span>
                </button>
              )}
            </div>

            {user.bankDetails?.accountName ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Account Name
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user.bankDetails.accountName}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Account Number
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium font-mono">
                      ****{user.bankDetails.accountNumber?.slice(-4)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Bank Name
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user.bankDetails.bankName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Bank account verified
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        You can receive payments from sales
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">No bank account added</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Add your bank account to receive payments from sales
                </p>
                <button
                  onClick={handleAddBankAccount}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Bank Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <BankVerificationModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSuccess={handleBankVerificationSuccess}
        userName={user.name}
      />
    </div>
  );
};

export default AccountSecurityPage;