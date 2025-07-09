import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FadeIn } from '../utils/animations';
import { 
  User, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShoppingBag,
  Store,
  Users,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Heart,
  Zap,
  Building2,
  MapPin
} from 'lucide-react';

// Firebase imports
import { 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  getAuth,
  AuthError
} from 'firebase/auth';
import app from '../firebase/firebaseConfig';

const auth = getAuth(app);

// Firebase error code mappings
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please try signing in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please enable popups for this site.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/credential-already-in-use':
      return 'This credential is already associated with a different user account.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to complete this action.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your information and try again.';
    case 'auth/timeout':
      return 'Request timed out. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupMethod, setSignupMethod] = useState<'email' | 'google' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'both'>('both');
  const [campus, setCampus] = useState<'UNN' | 'UNEC'>('UNN');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Clear form error when user starts typing
    if (errors.form) {
      setErrors({ ...errors, form: '' });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignup = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      if (!user.email) {
        throw new Error('Unable to get email from Google account');
      }
      
      // Store Google user data temporarily and proceed to step 2
      setGoogleUserData({
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        userId: user.uid,
        avatarUrl: user.photoURL || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
        user: user
      });
      
      setSignupMethod('google');
      setCurrentStep(2);
      
    } catch (error: any) {
      console.error('Google signup error:', error);
      
      let errorMessage = 'Google signup failed. Please try again.';
      
      if (error.code) {
        errorMessage = getFirebaseErrorMessage(error.code);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ form: errorMessage });
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email.trim(), 
        formData.password
      );
      const user = userCredential.user;
      
      try {
        await updateProfile(user, {
          displayName: formData.name.trim()
        });
      } catch (profileError) {
        console.warn('Failed to update profile:', profileError);
      }
      
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        userId: user.uid,
        avatarUrl: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
        role: userRole,
        campus: campus,
      };
      
      const success = await signup(userData);
      if (success) {
        navigate('/');
      } else {
        await user.delete().catch(console.error);
        throw new Error('Failed to create user profile');
      }
    } catch (error: any) {
      console.error('Email signup error:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.code) {
        errorMessage = getFirebaseErrorMessage(error.code);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ form: errorMessage });
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAccountCreation = async () => {
    if (isLoading || !googleUserData) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const userData = {
        name: googleUserData.name,
        email: googleUserData.email,
        userId: googleUserData.userId,
        avatarUrl: googleUserData.avatarUrl,
        role: userRole,
        campus: campus,
      };
      
      const success = await signup(userData);
      console.log(success)
      if (success) {
        navigate('/');
      } else {
        throw new Error('Failed to create user profile');
      }
    } catch (error: any) {
      console.error('Google account creation error:', error);
      
      let errorMessage = 'Account creation failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ form: errorMessage });
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setSignupMethod('email');
      setCurrentStep(2);
    }
  };

  const handleFinalSubmit = () => {
    if (currentStep === 2) {
      if (signupMethod === 'google') {
        handleGoogleAccountCreation();
      } else {
        handleEmailSignup();
      }
    }
  };

  const handleRetry = () => {
    setErrors({});
    setRetryCount(0);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setSignupMethod(null);
    setGoogleUserData(null);
    setErrors({});
  };

  const roleOptions = [
    {
      id: 'buyer',
      title: 'Buyer',
      description: 'I love discovering great deals and unique items',
      tagline: 'Shop & Discover',
      icon: ShoppingBag,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      personality: '🛍️'
    },
    {
      id: 'seller',
      title: 'Seller', 
      description: 'I want to turn my items into income',
      tagline: 'Sell & Earn',
      icon: Store,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      personality: '💰'
    },
    {
      id: 'both',
      title: 'Both',
      description: 'I want the complete marketplace experience',
      tagline: 'Buy & Sell',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      personality: '🚀'
    }
  ];

  const campusOptions = [
    {
      id: 'UNN',
      name: 'University of Nigeria, Nsukka',
      shortName: 'UNN',
      icon: Building2,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
      location: 'Nsukka, Enugu State'
    },
    {
      id: 'UNEC',
      name: 'University of Nigeria, Enugu Campus',
      shortName: 'UNEC',
      icon: Building2,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      location: 'Enugu, Enugu State'
    }
  ];

  // Error display component
  const ErrorDisplay = ({ error }: { error: string }) => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
      <div className="flex items-start">
        <AlertCircle size={16} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p>{error}</p>
          {retryCount >= 3 && (
            <div className="mt-2">
              <button
                onClick={handleRetry}
                className="text-red-600 hover:text-red-800 underline text-sm"
              >
                Reset and try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (currentStep === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md lg:max-w-2xl xl:max-w-4xl">
          <FadeIn direction="up">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16 lg:items-center">
              
              {/* Desktop Left Side - Hero Content */}
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Background decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-3xl transform rotate-2"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl transform -rotate-2"></div>
                  
                  {/* Main content */}
                  <div className="relative bg-white/80 backdrop-blur-sm p-8 xl:p-12 rounded-3xl shadow-2xl border border-white/20">
                    <div className="space-y-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6">
                        <GraduationCap className="h-8 w-8 text-white" />
                      </div>
                      
                      <h1 className="text-4xl xl:text-5xl font-bold">
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          Join the
                        </span>
                        <br />
                        <span className="text-gray-900">CalvinNova Community</span>
                      </h1>
                      
                      <p className="text-lg xl:text-xl text-gray-600 leading-relaxed">
                        Connect with fellow students, buy and sell items, and discover amazing deals in your campus community.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center text-gray-600">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                          <span>Secure student verification</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <span>Campus-focused marketplace</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                          <span>Safe trading environment</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signup Form */}
              <div className="w-full max-w-md mx-auto lg:max-w-none">
                <div className="bg-white/80 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-xl border border-white/20">
                  
                  {/* Mobile Header (hidden on desktop) */}
                  <div className="text-center lg:hidden mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Join CalvinNova
                    </h2>
                    <p className="text-gray-600">Create your account to get started</p>
                  </div>

                  {/* Desktop Header */}
                  <div className="hidden lg:block text-center mb-8">
                    <h2 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                      Create your account
                    </h2>
                    <p className="text-gray-600">Join the campus marketplace</p>
                  </div>

                  {/* Error Message */}
                  {errors.form && <ErrorDisplay error={errors.form} />}

                  {/* Google Signup Button */}
                  <button
                    onClick={handleGoogleSignup}
                    disabled={isLoading || retryCount >= 5}
                    className="w-full flex items-center justify-center px-4 py-3 lg:py-4 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        <span className="text-gray-700">Signing up...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-gray-700 font-medium">Continue with Google</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Email Signup Form */}
                  <form className="space-y-6" onSubmit={handleStep1Submit}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={18} className="text-gray-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={`appearance-none block w-full pl-10 pr-3 py-3 lg:py-4 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} className="text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={`appearance-none block w-full pl-10 pr-3 py-3 lg:py-4 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                          placeholder="you@university.edu"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={`appearance-none block w-full pl-3 pr-10 py-3 lg:py-4 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                        >
                          {showPassword ? (
                            <EyeOff size={18} className="text-gray-400 hover:text-gray-600 transition-colors" />
                          ) : (
                            <Eye size={18} className="text-gray-400 hover:text-gray-600 transition-colors" />
                          )}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={`appearance-none block w-full pl-3 pr-3 py-3 lg:py-4 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || retryCount >= 5}
                      className="group relative w-full flex justify-center py-3 lg:py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center">
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                  </form>

                  {/* Rate limit message */}
                  {retryCount >= 5 && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm mt-4">
                      <p>Too many attempts. Please wait a moment before trying again.</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="text-center mt-8">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md lg:max-w-2xl xl:max-w-3xl">
        <FadeIn direction="up">
          <div className="bg-white/80 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-xl border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Almost there!
              </h2>
              <p className="text-gray-600">Tell us how you plan to use CalvinNova</p>
            </div>

            {/* Error Message */}
            {errors.form && <ErrorDisplay error={errors.form} />}

            {/* Campus Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                Select Your Campus
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campusOptions.map((campusOption) => {
                  const Icon = campusOption.icon;
                  return (
                    <button
                      key={campusOption.id}
                      type="button"
                      onClick={() => setCampus(campusOption.id as 'UNN' | 'UNEC')}
                      disabled={isLoading}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                        campus === campusOption.id
                          ? `${campusOption.borderColor} ${campusOption.bgColor}`
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`p-2 rounded-lg mr-3 ${
                          campus === campusOption.id 
                            ? `bg-gradient-to-r ${campusOption.color} text-white` 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className={`font-medium ${
                              campus === campusOption.id 
                                ? campusOption.textColor 
                                : 'text-gray-900'
                            }`}>
                              {campusOption.shortName}
                            </h4>
                            {campus === campusOption.id && (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {campusOption.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {campusOption.location}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                What's your primary interest?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setUserRole(role.id as 'buyer' | 'seller' | 'both')}
                      disabled={isLoading}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        userRole === role.id
                          ? `${role.borderColor} ${role.bgColor} transform scale-105 shadow-lg`
                          : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`p-3 rounded-full mb-3 ${
                          userRole === role.id 
                            ? `bg-gradient-to-r ${role.color} text-white` 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex items-center mb-2">
                          <h4 className={`font-semibold ${
                            userRole === role.id 
                              ? role.textColor 
                              : 'text-gray-900'
                          }`}>
                            {role.title}
                          </h4>
                          <span className="ml-2 text-lg">{role.personality}</span>
                          {userRole === role.id && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          {role.description}
                        </p>
                        <div className={`text-xs font-medium mt-2 px-2 py-1 rounded-full ${
                          userRole === role.id
                            ? `${role.bgColor} ${role.textColor}`
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {role.tagline}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Summary */}
            <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="font-medium text-gray-900">Your Setup</h4>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Campus:</span> {
                    campusOptions.find(c => c.id === campus)?.shortName
                  }
                </p>
                <p>
                  <span className="font-medium">Role:</span> {
                    roleOptions.find(r => r.id === userRole)?.title
                  } - {
                    roleOptions.find(r => r.id === userRole)?.tagline
                  }
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading || retryCount >= 5}
                className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Create Account
                      <Zap className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Rate limit message */}
            {retryCount >= 5 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm mt-4">
                <p>Too many attempts. Please wait a moment before trying again.</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default Signup;