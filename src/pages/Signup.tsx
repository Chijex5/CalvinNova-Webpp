import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FadeIn } from '../utils/animations';
import Button from '../components/Button';
import { UserIcon, LockIcon, MailIcon, EyeIcon, EyeOffIcon, ShoppingBagIcon, TagIcon } from 'lucide-react';
const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'both' as 'buyer' | 'seller' | 'both',
    school: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const {
    signup
  } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.school) {
      newErrors.school = 'Please select your school';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const success = await signup(formData);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setErrors({
        form: 'An error occurred during registration. Please try again.'
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <FadeIn direction="up">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">Join the CalvinNova community today</p>
          </div>
          {errors.form && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.form}
            </div>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-gray-400" />
                  </div>
                  <input id="name" name="name" type="text" autoComplete="name" required value={formData.name} onChange={handleChange} className={`appearance-none block w-full pl-10 pr-3 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} placeholder="John Doe" />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon size={18} className="text-gray-400" />
                  </div>
                  <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={`appearance-none block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} placeholder="you@example.com" />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon size={18} className="text-gray-400" />
                  </div>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} className={`appearance-none block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPassword ? <EyeOffIcon size={18} className="text-gray-400 hover:text-gray-600" /> : <EyeIcon size={18} className="text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon size={18} className="text-gray-400" />
                  </div>
                  <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className={`appearance-none block w-full pl-10 pr-3 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} placeholder="••••••••" />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>}
              </div>
              <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                  School
                </label>
                <select id="school" name="school" required value={formData.school} onChange={handleChange} className={`appearance-none block w-full px-3 py-3 border ${errors.school ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}>
                  <option value="">Select your school</option>
                  <option value="University of California, Berkeley">
                    University of California, Berkeley
                  </option>
                  <option value="Stanford University">
                    Stanford University
                  </option>
                  <option value="UCLA">UCLA</option>
                  <option value="MIT">MIT</option>
                  <option value="Harvard University">Harvard University</option>
                  <option value="University of Michigan">
                    University of Michigan
                  </option>
                </select>
                {errors.school && <p className="mt-1 text-sm text-red-600">{errors.school}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to use CalvinNova as a:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button type="button" className={`flex flex-col items-center justify-center py-3 px-4 border rounded-lg transition-colors ${formData.role === 'buyer' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => setFormData({
                  ...formData,
                  role: 'buyer'
                })}>
                    <ShoppingBagIcon size={24} className={formData.role === 'buyer' ? 'text-indigo-600' : 'text-gray-500'} />
                    <span className="mt-2 text-sm font-medium">Buyer</span>
                  </button>
                  <button type="button" className={`flex flex-col items-center justify-center py-3 px-4 border rounded-lg transition-colors ${formData.role === 'seller' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => setFormData({
                  ...formData,
                  role: 'seller'
                })}>
                    <TagIcon size={24} className={formData.role === 'seller' ? 'text-indigo-600' : 'text-gray-500'} />
                    <span className="mt-2 text-sm font-medium">Seller</span>
                  </button>
                  <button type="button" className={`flex flex-col items-center justify-center py-3 px-4 border rounded-lg transition-colors ${formData.role === 'both' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => setFormData({
                  ...formData,
                  role: 'both'
                })}>
                    <div className="flex">
                      <ShoppingBagIcon size={20} className={formData.role === 'both' ? 'text-indigo-600' : 'text-gray-500'} />
                      <TagIcon size={20} className={formData.role === 'both' ? 'text-indigo-600' : 'text-gray-500'} />
                    </div>
                    <span className="mt-2 text-sm font-medium">Both</span>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </FadeIn>
    </div>;
};
export default Signup;