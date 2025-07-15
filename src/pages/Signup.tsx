import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  CheckCircle, 
  MapPin, 
  Users, 
  Sparkles, 
  Heart, 
  Zap,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  GraduationCap,
  Building,
  ArrowRight,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    campus: '',
    userRole: '' as 'buyer' | 'seller' | 'both' 
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    campus: '',
    userRole: '',
    form: ''
  });

  const campusOptions = [
    {
      id: 'UNN',
      shortName: 'UNN',
      name: 'University of Nigeria, Nsukka',
      location: 'Nsukka, Enugu State',
      icon: GraduationCap,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-700'
    },
    {
      id: 'UNEC',
      shortName: 'UNEC',
      name: 'University of Nigeria, Enugu Campus',
      location: 'Enugu, Enugu State',
      icon: Building,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-700'
    }
  ];

  const roleOptions = [
    {
      id: 'buyer',
      title: 'Buyer',
      personality: '🛒',
      description: 'Looking to find great deals on campus',
      tagline: 'Deal Hunter',
      icon: ShoppingCart,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      textColor: 'text-indigo-700'
    },
    {
      id: 'seller',
      title: 'Seller',
      personality: '💰',
      description: 'Ready to sell items and earn money',
      tagline: 'Entrepreneur',
      icon: ShoppingBag,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-700'
    },
    {
      id: 'both',
      title: 'Both',
      personality: '🔄',
      description: 'Buy and sell as opportunities arise',
      tagline: 'Flexible Trader',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-700'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: any = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: any = {};
    
    if (!formData.campus) {
      newErrors.campus = 'Please select your campus';
    }
    
    if (!formData.userRole) {
      newErrors.userRole = 'Please select your primary interest';
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateStep2()) return;
    
    setIsLoading(true);
    setErrors(prev => ({ ...prev, form: '' }));
    
    try {
      const response = await signup(formData);

      if (response.success) {
        // Redirect to dashboard or next step
        toast.success('Account created successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setErrors(prev => ({ 
          ...prev, 
          form: response.message || 'Failed to create account. Please try again.' 
        }));
      }
      
    } catch (error) {
      setRetryCount(prev => prev + 1);
      setErrors(prev => ({ 
        ...prev, 
        form: error instanceof Error ? error.message : 'Failed to create account. Please try again.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorDisplay = ({ error }: { error: string }) => (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
      <span className="text-red-700 text-sm">{error}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')] opacity-10 bg-cover bg-center"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Join{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                NovaPlus
              </span>
            </h1>
            <p className="text-xl text-indigo-100 leading-relaxed">
              Connect with thousands of students and start trading on your campus today.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">5000+ Students</h3>
                <p className="text-indigo-200">Active trading community</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">12K+ Items Sold</h3>
                <p className="text-indigo-200">Trusted marketplace</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Verified Students</h3>
                <p className="text-indigo-200">Safe and secure trading</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-4">
                <div className={`w-8 h-2 rounded-full ${currentStep >= 1 ? 'bg-teal-300' : 'bg-white/30'}`}></div>
                <div className={`w-8 h-2 rounded-full ${currentStep >= 2 ? 'bg-teal-300' : 'bg-white/30'}`}></div>
              </div>
              <p className="text-sm text-indigo-200">
                Step {currentStep} of 2 - {currentStep === 1 ? 'Personal Info' : 'Campus & Role'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md lg:max-w-2xl xl:max-w-3xl">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              NovaPlus
            </h1>
            <p className="text-gray-600 mt-2">Join the Campus Marketplace</p>
          </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-xl border border-white/20">
              
              {currentStep === 1 && (
                <>
                  {/* Step 1: Personal Information */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Create Your Account
                    </h2>
                    <p className="text-gray-600">Enter your personal information to get started</p>
                  </div>

                  {errors.form && <ErrorDisplay error={errors.form} />}

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                            errors.firstName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your first name"
                        />
                        {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                            errors.lastName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your last name"
                        />
                        {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        University Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="your.email@university.edu"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                            errors.password ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                            errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={handleNextStep}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <span>Continue</span>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  {/* Step 2: Campus & Role Selection */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Almost there!
                    </h2>
                    <p className="text-gray-600">Tell us how you plan to use NovaPlus</p>
                  </div>

                  {errors.form && <ErrorDisplay error={errors.form} />}

                  {/* Campus Selection */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                      Select Your Campus
                    </h3>
                    {errors.campus && <p className="mb-2 text-sm text-red-600">{errors.campus}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campusOptions.map((campusOption) => {
                        const Icon = campusOption.icon;
                        return (
                          <button
                            key={campusOption.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, campus: campusOption.id }))}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              formData.campus === campusOption.id
                                ? `${campusOption.borderColor} ${campusOption.bgColor}`
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg mr-3 ${
                                formData.campus === campusOption.id 
                                  ? `bg-gradient-to-r ${campusOption.color} text-white` 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className={`font-medium ${
                                    formData.campus === campusOption.id 
                                      ? campusOption.textColor 
                                      : 'text-gray-900'
                                  }`}>
                                    {campusOption.shortName}
                                  </h4>
                                  {formData.campus === campusOption.id && (
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
                    {errors.userRole && <p className="mb-2 text-sm text-red-600">{errors.userRole}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {roleOptions.map((role) => {
                        const Icon = role.icon;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, userRole: role.id as 'buyer' | 'seller' | 'both' }))}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                              formData.userRole === role.id
                                ? `${role.borderColor} ${role.bgColor} transform scale-105 shadow-lg`
                                : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md'
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <div className={`p-3 rounded-full mb-3 ${
                                formData.userRole === role.id 
                                  ? `bg-gradient-to-r ${role.color} text-white` 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <Icon size={24} />
                              </div>
                              <div className="flex items-center mb-2">
                                <h4 className={`font-semibold ${
                                  formData.userRole === role.id 
                                    ? role.textColor 
                                    : 'text-gray-900'
                                }`}>
                                  {role.title}
                                </h4>
                                <span className="ml-2 text-lg">{role.personality}</span>
                                {formData.userRole === role.id && (
                                  <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 text-center">
                                {role.description}
                              </p>
                              <div className={`text-xs font-medium mt-2 px-2 py-1 rounded-full ${
                                formData.userRole === role.id
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
                  {formData.campus && formData.userRole && (
                    <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                      <div className="flex items-center">
                        <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Your Setup</h4>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Campus:</span> {
                            campusOptions.find(c => c.id === formData.campus)?.shortName
                          }
                        </p>
                        <p>
                          <span className="font-medium">Role:</span> {
                            roleOptions.find(r => r.id === formData.userRole)?.title
                          } - {
                            roleOptions.find(r => r.id === formData.userRole)?.tagline
                          }
                        </p>
                      </div>
                    </div>
                  )}

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
                            <span>Create Account</span>
                            <ArrowRight className="ml-2" size={20} />
                          </>
                        )}
                      </div>
                    </button>
                    {retryCount >= 5 && (
                      <button
                        type="button"
                        onClick={() => setRetryCount(0)}
                        className="flex-1 px-4 py-3 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-xl hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                      >
                        <X className="inline mr-2" size={16} />
                        Reset Retry Count
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
export default Signup;