import { useState, useEffect } from 'react';
import api from '../utils/apiService';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircleIcon, Loader, AlertCircle, CheckCircleIcon, Eye, EyeOff, Lock } from 'lucide-react';
import Button from '../components/Button';

// Skeleton Components
const SkeletonPulse = ({
  className
}: {
  className: string;
}) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const ResetPasswordSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 rounded-full animate-spin"></div>
      </div>
      <SkeletonPulse className="h-8 w-3/4 mx-auto mb-4" />
      <SkeletonPulse className="h-4 w-full mb-2" />
      <SkeletonPulse className="h-4 w-5/6 mx-auto mb-8" />
    </div>
  </div>
);

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Token verification states
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'valid', 'invalid'
  const [verificationMessage, setVerificationMessage] = useState('');

  // Password form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Verify token on component mount
  useEffect(() => {
    verifyResetToken();
  }, [token]);

  const verifyResetToken = async () => {
    try {
      const response = await api.get(`/api/user/verify-token/${token}`);
      console.log('Token verification response:', response);
      
      if (response.data.success) {
        setVerificationStatus('valid');
        setVerificationMessage('Token verified successfully. Please enter your new password.');
      } else {
        setVerificationStatus('invalid');
        setVerificationMessage(response.data.message || 'Invalid or expired reset link.');
      }
    } catch (error: any) {
      console.error('Token verification error:', error);
      setVerificationStatus('invalid');
      setVerificationMessage(
        error.response?.data?.message || 
        'Invalid or expired reset link. Please request a new password reset.'
      );
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handlePasswordReset = async () => {
    // Validate passwords
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordError('');
    setIsResetting(true);

    try {
      const response = await api.post('/api/user/reset-password', {
        token,
        newPassword: password,
      });

      console.log('Password reset response:', response);

      if (response.status || response.data.status) {
        setResetComplete(true);
      } else {
        setPasswordError(response.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      setPasswordError(
        error.response?.data?.message || 
        'An error occurred while resetting your password. Please try again.'
      );
    } finally {
      setIsResetting(false);
    }
  };

  // Show skeleton while verifying token
  if (verificationStatus === 'verifying') {
    return <ResetPasswordSkeleton />;
  }

  // Show success screen after password reset
  if (resetComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Password Reset Successfully!
          </h1>
          <p className="text-gray-600 mb-8">
            Your password has been updated successfully. You can now log in with your new password.
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show reset form for valid tokens
  if (verificationStatus === 'valid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create New Password
            </h1>
            <p className="text-gray-600">
              Please enter a strong password for your account
            </p>
          </div>

          <div className="space-y-6">
            {/* Password Requirements Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Password Requirements:</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• One uppercase letter</li>
                <li>• One lowercase letter</li>
                <li>• One number</li>
              </ul>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">{passwordError}</p>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handlePasswordReset}
              disabled={!password || !confirmPassword || isResetting}
              loading={isResetting}
              loadingText="Resetting Password..."
            >
              Reset Password
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error screen for invalid tokens
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircleIcon className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Invalid Reset Link
        </h1>
        <p className="text-gray-600 mb-8">
          {verificationMessage}
        </p>
        <div className="flex space-x-4">
          <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>
            Back to Login
          </Button>
          <Button variant="primary" fullWidth onClick={() => navigate('/forgot-password')}>
            Request New Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;