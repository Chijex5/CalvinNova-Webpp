import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FadeIn } from '../utils/animations';
import Button from '../components/Button';
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
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
              Welcome back
            </h2>
            <p className="text-gray-600">Sign in to your CalvinNova account</p>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md -space-y-px">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-gray-400" />
                  </div>
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="you@example.com" />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon size={18} className="text-gray-400" />
                  </div>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPassword ? <EyeOffIcon size={18} className="text-gray-400 hover:text-gray-600" /> : <EyeIcon size={18} className="text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>
            <div>
              <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </FadeIn>
    </div>;
};
export default Login;