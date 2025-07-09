import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Sell from './pages/Sell';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { ChatProvider } from './context/ChatContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  link?: string; // optional now
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, link }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const redirectTo = link || location.pathname + location.search;

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirectedfrom=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
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
    isSeller
  } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={`/login`} replace />;
  }
  if (!isSeller) {
    return <Navigate to={`/login?redirectedfrom=${encodeURIComponent(link)}`} replace />;
  }
  return <>{children}</>;
};
// Route wrapper component to handle conditional rendering
const HomeOrDashboard = () => {
  const {
    isAuthenticated
  } = useAuth();
  return isAuthenticated ? <Dashboard /> : <Home />;
};
export function App() {
  return <Router>
      <AuthProvider>
        <ProductProvider>
          <ChatProvider>
            <div className="font-sans antialiased text-gray-900 bg-gray-50">
              <Layout>
                <Routes>
                  <Route path="/" element={<ProtectedRoute> <HomeOrDashboard /> </ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute> <Marketplace /> </ProtectedRoute> } />
                  <Route path="/product/:id" element={<ProtectedRoute> <ProductDetails /> </ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/chat" element={<ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>} />
                  <Route path="/chat/:userId" element={<ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>} />
                  <Route path="/sell" element={<SellerRoute link='/sell'>
                        <Sell />
                      </SellerRoute>} />
                  <Route path="/admin" element={<ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>} />
                </Routes>
              </Layout>
            </div>
          </ChatProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>;
}