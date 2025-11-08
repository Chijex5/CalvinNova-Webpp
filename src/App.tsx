import React, { useEffect, useState, Component } from 'react';
import { useUserStore } from './store/userStore';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminReportsPage from './pages/admin/Reports';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import NotificationsPage from './pages/Notifications';
import PhoneNumberModal from './components/AddPhoneNumber';
import SellerDashboard from './pages/SellerProducts';
import DisputeSettlement from './pages/admin/Disputes';
import ResetPasswordForm from './pages/ResetPassword';
import PayoutApprovals from './pages/admin/PayoutPage';
import TransactionPages from './pages/TransactionPage';
import SupportChat from './pages/ChatBot';
import TransactionSuccess from './pages/Test';
import EmailVerification from './pages/VerificationPage';
import Dashboard from './pages/Dashboard';
import MarketplaceUI from './pages/Marketplace';
import AdminUsersPage from './pages/admin/Users';
import ProductDetails from './pages/ProductDetails';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Sell from './pages/Sell';
import Login from './pages/Login';
import BuyPage from './pages/BuyNow';
import Signup from './pages/Signup';
import QRTransactionSystem from './pages/QRCodeGenerator';
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';
import CoursePage from './pages/CoursePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { ChatProvider } from './context/ChatContext';
interface ProtectedRouteProps {
  children: React.ReactNode;
  link?: string; // optional now
}

const ModernLoader: React.FC = () => {
  return <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center overflow-hidden">
      {/* Brand-aligned background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400 dark:bg-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{
        animationDelay: '2s'
      }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{
        animationDelay: '4s'
      }}></div>
      </div>

      {/* Main loader container */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* CalvinNova brand logo placeholder */}
        <div className="relative mb-4">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300 dark:from-teal-400 dark:to-cyan-400 animate-pulse">
            CalvinNova
          </div>
        </div>

        {/* Campus-themed spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-20 h-20 rounded-full border-4 border-white/10 dark:border-gray-300/10"></div>

          {/* Animated rings with brand colors */}
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-indigo-400 border-r-purple-400 dark:border-t-indigo-300 dark:border-r-purple-300 animate-spin"></div>
          <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-t-teal-400 border-l-indigo-400 dark:border-t-teal-300 dark:border-l-indigo-300 animate-spin" style={{
          animationDirection: 'reverse',
          animationDelay: '0.3s'
        }}></div>
          <div className="absolute inset-4 w-12 h-12 rounded-full border-4 border-transparent border-t-purple-400 border-b-teal-400 dark:border-t-purple-300 dark:border-b-teal-300 animate-spin" style={{
          animationDelay: '0.6s'
        }}></div>

          {/* Center shield icon for trust */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-white/90 dark:bg-gray-200/90 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-sm animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Campus marketplace messaging */}
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Connecting Campus
          </div>
          <div className="text-indigo-100 dark:text-gray-300 text-sm">
            Verifying your student access...
          </div>

          {/* Animated dots with brand colors */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 dark:bg-purple-300 rounded-full animate-bounce" style={{
            animationDelay: '0.15s'
          }}></div>
            <div className="w-2 h-2 bg-teal-400 dark:bg-teal-300 rounded-full animate-bounce" style={{
            animationDelay: '0.3s'
          }}></div>
          </div>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-white/10 dark:bg-gray-300/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 dark:from-indigo-300 dark:via-purple-300 dark:to-teal-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Floating particles representing campus community */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => <div key={i} className="absolute w-2 h-2 bg-white/20 dark:bg-gray-300/20 rounded-full animate-ping" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      }} />)}
      </div>
    </div>;
};
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  link
}) => {
  const {
    isAuthenticated,
    isLoading,
    isCheckingAuth
  } = useAuth();
  const location = useLocation();
  const redirectTo = link || location.pathname + location.search;
  if (isLoading || isCheckingAuth) {
    return <ModernLoader />;
  }
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirectedfrom=${encodeURIComponent(redirectTo)}`} replace />;
  }
  return <>{children}</>;
};
export default ProtectedRoute;
// Seller-only route component
const SellerRoute = ({
  children,
  link
}: {
  children: React.ReactNode;
  link: string;
}) => {
  const {
    isAuthenticated,
    isLoading,
    isCheckingAuth,
    user
  } = useAuth();
  const location = useLocation();
  const redirectTo = link || location.pathname + location.search;
  if (isLoading || isCheckingAuth) {
    return <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>;
  }
  if (!isAuthenticated) {
    console.warn('Unauthorized access to seller route');
    return <Navigate to={`/login?redirectedfrom=${encodeURIComponent(redirectTo)}`} replace />;
  }
  if (user && user.role !== 'seller' && user.role !== 'both') {
    console.warn('Access denied: Seller route requires seller permissions');
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
const AdminRoute = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const {
    user
  } = useAuth();
  if (user && user.role === 'admin') {
    return <>{children}</>;
  }
  return <Navigate to="/" replace />;
};
export function App() {
  const user = useUserStore(state => state.user);
  const isLoading = useUserStore(state => state.isLoading);
  const isASeller = user?.role === 'seller' || user?.role === 'both';
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(false);
  useEffect(() => {
    if (isLoading) return;
    if (user && isASeller && !user.phoneNumber) {
      setShowPhoneNumberModal(true);
    }
  }, [user, isASeller, isLoading]);
  return <Router>
      <Toaster position="top-right" richColors />
      <AuthProvider>
        <ProductProvider>
          <ChatProvider>
            <div className="font-sans antialiased text-gray-900 bg-gray-50">
              <Layout>
                <SupportChat />
                <Routes>
                  <Route path="/test" element={<TransactionSuccess onBack={() => console.log('back')} userType='buyer' />} />
                  <Route path="/" element={<ProtectedRoute>
                        {' '}
                        <Dashboard />{' '}
                      </ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute>
                        {' '}
                        <NotificationsPage />{' '}
                      </ProtectedRoute>} />
                  <Route path="/transaction/verify/:transactionId" element={<ProtectedRoute>
                        {' '}
                        <QRTransactionSystem />{' '}
                      </ProtectedRoute>} />
                  <Route path="/buy/:productId" element={<ProtectedRoute>
                        {' '}
                        <BuyPage />{' '}
                      </ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute>
                        {' '}
                        <MarketplaceUI />{' '}
                      </ProtectedRoute>} />
                  <Route path="/product/:slug" element={<ProtectedRoute>
                        {' '}
                        <ProductDetails />{' '}
                      </ProtectedRoute>} />
                  <Route path="/verification/:token" element={<EmailVerification />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset/:token" element={<ResetPasswordForm />} />
                  <Route path="/chat" element={<ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>} />
                  <Route path="/chat/:chatId" element={<ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>} />
                  <Route path="/course/:coursecode" element={<ProtectedRoute>
                        <CoursePage />
                      </ProtectedRoute>} />
                  <Route path="/account/transactions" element={<ProtectedRoute>
                        <TransactionPages />
                      </ProtectedRoute>} />
                  <Route path="/account/transaction/:transactionId" element={<ProtectedRoute>
                        <TransactionPages />
                      </ProtectedRoute>} />
                  <Route path="/sell" element={<ProtectedRoute>
                        <SellerRoute link="/sell">
                          <Sell />
                        </SellerRoute>
                      </ProtectedRoute>} />
                  <Route path="/my-products" element={<ProtectedRoute>
                        <SellerRoute link="/my-products">
                          <SellerDashboard />
                        </SellerRoute>
                      </ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute>
                        <AdminRoute>
                          <AdminUsersPage />
                        </AdminRoute>
                      </ProtectedRoute>} />
                  <Route path="/admin/payouts" element={<ProtectedRoute>
                        <AdminRoute>
                          <PayoutApprovals />
                        </AdminRoute>
                      </ProtectedRoute>} />

                  <Route path="/admin/dispute" element={<ProtectedRoute>
                    <AdminRoute>
                      <DisputeSettlement />
                    </AdminRoute>
                    </ProtectedRoute>} />
                  <Route path="/admin/reports" element={<ProtectedRoute>
                        <AdminRoute>
                          <AdminReportsPage />
                        </AdminRoute>
                      </ProtectedRoute>} />
                  <Route path="/error" element={<ErrorPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </div>
          </ChatProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>;
}