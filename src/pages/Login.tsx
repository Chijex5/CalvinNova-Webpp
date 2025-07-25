import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, X, Mail, Lock, ArrowRight, ShoppingBag, Users, Star, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FormErrors {
  email?: string;
  password?: string;
  forgotEmail?: string;
}

interface TouchedFields {
  email?: boolean;
  password?: boolean;
  forgotEmail?: boolean;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  
  const { login, user, isAuthenticated, resetPassword, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    forgotEmail: ''
  });

  // Get redirect path from URL parameters
  const redirectFrom = searchParams.get('redirectedfrom');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`Welcome back, ${user.name || user.email}!`);
      // Redirect to the original path or default to home
      const redirectPath = redirectFrom ? decodeURIComponent(redirectFrom) : '/';
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate, redirectFrom]);

  // Handle auth context errors
  useEffect(() => {
    if (authError) {
      const msg = typeof authError === 'string'
        ? authError
        : (authError as any)?.response?.data?.message ||
          (authError as any)?.message ||
          "An unknown error occurred";

      toast.error(msg);
      clearError && clearError();
    }
  }, [authError, clearError]);

  // Load remember me preference
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  // Validate forgot password form
  const validateForgotPasswordForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.forgotEmail) {
      newErrors.forgotEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.forgotEmail)) {
      newErrors.forgotEmail = 'Please enter a valid email address';
    }
    
    return newErrors;
  };

  interface InputChangeEvent {
    target: {
      name: string;
      value: string;
    };
  }

  const handleInputChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInputBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Validate on blur
    const fieldErrors = validateForm();
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors[field] || ''
    }));
  };

  interface LoginResponse {
    success: boolean;
    error?: string;
    message?: string;
  }

  interface LoginError {
    response?: {
      status: number;
    };
    message?: string;
  }

  interface FormEvent {
    preventDefault(): void;
  }

  const handleLogin = async (e: FormEvent) => {
    e?.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched({ email: true, password: true });
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setIsLoading(true);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      const response: LoginResponse = await login(formData.email, formData.password);
      
      if (response?.success) {
        toast.success('Login successful! Redirecting...', {
          icon: <CheckCircle className="text-green-500" size={16} />
        });
        
        // Small delay for better UX, then redirect to original path or home
        setTimeout(() => {
          const redirectPath = redirectFrom ? decodeURIComponent(redirectFrom) : '/';
          navigate(redirectPath);
        }, 1000);
      } else {
        // Handle specific error responses
        const errorMessage: string = response?.error || response?.message || 'Login failed. Please try again.';
        
        if (errorMessage.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Invalid email address' }));
        } else if (errorMessage.toLowerCase().includes('password')) {
          setErrors(prev => ({ ...prev, password: 'Invalid password' }));
        }
        
        toast.error(errorMessage, {
          icon: <AlertCircle className="text-red-500" size={16} />
        });
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      const loginError = error as LoginError;
      
      // Handle different types of errors
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (loginError.response?.status === 401) {
        errorMessage = 'Invalid email or password';
        setErrors({ email: 'Invalid credentials', password: 'Invalid credentials' });
      } else if (loginError.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (loginError.response?.status && loginError.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (loginError.message) {
        errorMessage = loginError.message;
      }
      
      toast.error(errorMessage, {
        icon: <AlertCircle className="text-red-500" size={16} />
      });
    } finally {
      setIsLoading(false);
    }
  };

  interface ForgotPasswordResponse {
    success: boolean;
    error?: string;
    message?: string;
  }

  interface ForgotPasswordError {
    response?: {
      status: number;
    };
    message?: string;
  }

  const handleForgotPassword = async (e: FormEvent) => {
    e?.preventDefault();
    
    // Validate forgot password form
    const formErrors = validateForgotPasswordForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsForgotPasswordLoading(true);
      
      // Use resetPassword from auth context if available
      if (resetPassword) {
        const response: ForgotPasswordResponse = await resetPassword(formData.forgotEmail);
        
        if (response?.success) {
          toast.success('Password reset link sent to your email!', {
            icon: <CheckCircle className="text-green-500" size={16} />
          });
          setShowForgotModal(false);
          setFormData(prev => ({ ...prev, forgotEmail: '' }));
        } else {
          throw new Error(response?.error || 'Failed to send reset link');
        }
      } else {
        // Fallback demo behavior
        toast.success('Password reset link sent! (Demo mode)', {
          icon: <CheckCircle className="text-green-500" size={16} />
        });
        setShowForgotModal(false);
        setFormData(prev => ({ ...prev, forgotEmail: '' }));
      }
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
      
      const forgotPasswordError = error as ForgotPasswordError;
      let errorMessage = 'Failed to send reset link. Please try again.';
      
      if (forgotPasswordError.response?.status === 404) {
        errorMessage = 'Email address not found';
      } else if (forgotPasswordError.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (forgotPasswordError.message) {
        errorMessage = forgotPasswordError.message;
      }
      
      toast.error(errorMessage, {
        icon: <AlertCircle className="text-red-500" size={16} />
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  const handleForgotModalKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleForgotPassword(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-indigo-800 dark:via-indigo-900 dark:to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')] opacity-10 bg-cover bg-center"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                CalvinNova
              </span>
            </h1>
            <p className="text-xl text-indigo-100 dark:text-indigo-200 leading-relaxed">
              The trusted marketplace for college students to buy and sell items directly on campus.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Easy Trading</h3>
                <p className="text-indigo-200 dark:text-indigo-300">Buy and sell with fellow students</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Safe & Secure</h3>
                <p className="text-indigo-200 dark:text-indigo-300">Verified university students only</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Campus Community</h3>
                <p className="text-indigo-200 dark:text-indigo-300">Connect with students nearby</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-300" size={20} />
                <span className="font-semibold">4.8/5 Rating</span>
              </div>
              <span className="text-sm text-indigo-200 dark:text-indigo-300">5000+ Active Users</span>
            </div>
            <p className="text-sm text-indigo-200 dark:text-indigo-300">
              "CalvinNova made selling my textbooks so easy! Found buyers within hours." - Sarah M.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              CalvinNova
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Campus Marketplace</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back!</h2>
              <p className="text-gray-600 dark:text-gray-300">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleInputBlur('email')}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={20} />
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleInputBlur('password')}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 dark:text-white ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="ml-2" size={20} />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <a
                  href="/signup"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign up here
                </a>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By signing in, you agree to our{' '}
                <a href="https://calvinnova.com/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="https://calvinnova.com/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setErrors(prev => ({ ...prev, forgotEmail: '' }));
                setFormData(prev => ({ ...prev, forgotEmail: '' }));
              }}
              className="absolute right-4 top-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="forgotEmail"
                    name="forgotEmail"
                    value={formData.forgotEmail}
                    onChange={handleInputChange}
                    onKeyPress={handleForgotModalKeyPress}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white ${
                      errors.forgotEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.forgotEmail && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={20} />
                  )}
                </div>
                {errors.forgotEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.forgotEmail}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setErrors(prev => ({ ...prev, forgotEmail: '' }));
                    setFormData(prev => ({ ...prev, forgotEmail: '' }));
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isForgotPasswordLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isForgotPasswordLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;