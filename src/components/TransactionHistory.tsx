import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, CreditCard, CheckCircle, Clock, AlertCircle, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../pages/TransactionPage';
import { FadeIn } from '../utils/animations';
// Mock transactions data - in a real app, this would come from an API
const mockTransactions = [{
  id: 1,
  buyerId: 'user123',
  sellerId: 'seller456',
  transactionId: 'TXN-2025-001',
  productTitle: 'MacBook Pro M1 2021',
  productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
  productId: '1',
  amount: 850000,
  sellerAmount: 833000,
  agentFee: 17000,
  status: 'completed',
  sellerPaidout: true,
  createdAt: '2025-01-15T10:30:00Z',
  completedAt: '2025-01-16T14:20:00Z',
  collectedOn: '2025-01-16T14:20:00Z',
  buyerName: 'John Doe',
  sellerName: 'Jane Smith',
  buyerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
}, {
  id: 2,
  buyerId: 'seller456',
  sellerId: 'user789',
  transactionId: 'TXN-2025-002',
  productTitle: 'iPhone 14 Pro Max',
  productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
  productId: '2',
  amount: 450000,
  sellerAmount: 441000,
  agentFee: 9000,
  status: 'paid',
  sellerPaidout: false,
  createdAt: '2025-01-20T09:15:00Z',
  buyerName: 'Jane Smith',
  sellerName: 'Mike Johnson',
  buyerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
  sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
}, {
  id: 3,
  buyerId: 'user999',
  sellerId: 'user123',
  transactionId: 'TXN-2025-003',
  productTitle: 'Dell XPS 13 Laptop',
  productImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
  productId: '3',
  amount: 320000,
  sellerAmount: 313600,
  agentFee: 6400,
  status: 'pending',
  sellerPaidout: false,
  createdAt: '2025-01-22T16:45:00Z',
  buyerName: 'Alex Brown',
  sellerName: 'John Doe',
  buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
  sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
}];
// Format currency helper
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(price);
};
// Get relative time helper
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};
// Status helpers
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    case 'paid':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    case 'pending':
      return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
    case 'cancelled':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    case 'refunded':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  }
};
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle size={16} />;
    case 'paid':
      return <CreditCard size={16} />;
    case 'pending':
      return <Clock size={16} />;
    case 'cancelled':
      return <AlertCircle size={16} />;
    case 'refunded':
      return <AlertCircle size={16} />;
    default:
      return <Clock size={16} />;
  }
};
const getStatusText = (status: string, isSeller: boolean, sellerPaidout: boolean) => {
  if (status === 'completed') {
    if (isSeller && !sellerPaidout) return 'Awaiting Payout';
    if (isSeller && sellerPaidout) return 'Paid Out';
    return 'Completed';
  }
  if (status === 'paid') {
    return isSeller ? 'Payment Received' : 'Paid';
  }
  if (status === 'pending') {
    return 'Pending Payment';
  }
  if (status === 'cancelled') {
    return 'Cancelled';
  }
  if (status === 'refunded') {
    return 'Refunded';
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
};
interface TransactionHistoryProps {
  limit?: number;
  showViewAll?: boolean;
  title?: string;
  filter?: 'all' | 'buying' | 'selling';
}
const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  limit = 3,
  showViewAll = true,
  title = 'Recent Transactions',
  filter = 'all'
}) => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // In a real app, this would fetch transactions from an API
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        // In a real implementation, you would call your API here:
        // const response = await api.get('/api/transactions');
        // setTransactions(response.data.transactions);
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user?.userId]);
  const currentUserId = user?.userId || '';
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') {
      return transaction.buyerId === currentUserId || transaction.sellerId === currentUserId;
    } else if (filter === 'buying') {
      return transaction.buyerId === currentUserId;
    } else {
      return transaction.sellerId === currentUserId;
    }
  }).slice(0, limit);
  if (loading) {
    return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, index) => <div key={index} className="animate-pulse flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="w-20">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>)}
        </div>
      </div>;
  }
  if (filteredTransactions.length === 0) {
    return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="p-6 text-center">
          <Package size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">
            No transactions yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Your transaction history will appear here
          </p>
        </div>
      </div>;
  }
  return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
        {showViewAll && <button onClick={() => navigate('/account/transactions')} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
            View All
          </button>}
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredTransactions.map((transaction, index) => {
        const isBuyer = transaction.buyerId === currentUserId;
        const otherUser = isBuyer ? transaction.sellerName : transaction.buyerName;
        const displayAmount = isBuyer ? transaction.amount : transaction.sellerAmount;
        return <FadeIn key={transaction.id} direction="up" delay={index * 0.05}>
              <div onClick={() => navigate(`/account/transaction/${transaction.transactionId}`)} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={transaction.productImage} alt={transaction.productTitle} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {transaction.productTitle}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="truncate">
                        {isBuyer ? 'Bought from' : 'Sold to'} {otherUser}
                      </span>
                      <span className="mx-1.5">•</span>
                      <span className="whitespace-nowrap text-xs">
                        {getRelativeTime(transaction.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(displayAmount)}
                    </p>
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span>
                        {getStatusText(transaction.status, !isBuyer, transaction.sellerPaidout)}
                      </span>
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 ml-1" />
                </div>
              </div>
            </FadeIn>;
      })}
      </div>
      {showViewAll && filteredTransactions.length > 0 && <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/70 border-t border-gray-200 dark:border-gray-700">
          <button onClick={() => navigate('/account/transactions')} className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm">
            View All Transactions
          </button>
        </div>}
    </div>;
};
export default TransactionHistory;