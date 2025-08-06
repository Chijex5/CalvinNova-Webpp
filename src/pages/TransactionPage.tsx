import React, { useEffect, useState, Component } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CreditCard, CheckCircle, Clock, AlertCircle, User, Calendar, DollarSign, ShoppingBag, Handshake, Filter, Search, ExternalLink, ChevronRight, Truck, ShieldCheck, Repeat, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FadeIn } from '../utils/animations';
import api from '../utils/apiService';
export interface Transaction {
  id: number;
  buyerId: string;
  sellerId: string;
  transactionId: string;
  productTitle: string;
  productImage: string;
  productId: string;
  amount: number;
  sellerAmount: number;
  agentFee: number;
  status: 'pending' | 'paid' | 'collected' | 'cancelled' | 'refunded';
  sellerPaidout: boolean;
  createdAt: string;
  completedAt?: string;
  collectedOn?: string;
  buyerName: string;
  sellerName: string;
  buyerAvatar: string;
  sellerAvatar: string;
}
// Format currency helper
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(price);
};
// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'collected':
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
const getStatusIcon = (status: Transaction['status']) => {
  switch (status) {
    case 'collected':
      return <CheckCircle size={16} />;
    case 'paid':
      return <CreditCard size={16} />;
    case 'pending':
      return <Clock size={16} />;
    case 'cancelled':
      return <AlertCircle size={16} />;
    case 'refunded':
      return <Repeat size={16} />;
    default:
      return <Clock size={16} />;
  }
};
const getStatusText = (status: Transaction['status'], isSeller: boolean, sellerPaidout: boolean): string => {
  if (status === 'collected') {
    if (isSeller && !sellerPaidout) return 'Awaiting Payout';
    if (isSeller && sellerPaidout) return 'Paid Out';
    return 'Collected';
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
  // This should never be reached, but handle it gracefully
  return String(status).charAt(0).toUpperCase() + String(status).slice(1);
};
// Transaction List Component
const TransactionList = () => {
  const {
    user
  } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'buying' | 'selling'>('all');
  const [statusFilter, setStatusFilter] = useState<Transaction['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // In a real app, this would fetch transactions from an API
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {

        const response = await api.get('/api/transactions');
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [user?.userId]);
  const currentUserId = user?.userId || '';
  const filteredTransactions = transactions.filter(transaction => {
    const isBuyer = transaction.buyerId === currentUserId;
    const isSeller = transaction.sellerId === currentUserId;
    // Filter by role (buying/selling)
    const matchesRoleFilter = filter === 'all' || filter === 'buying' && isBuyer || filter === 'selling' && isSeller;
    // Filter by status
    const matchesStatusFilter = statusFilter === 'all' || transaction.status === statusFilter;
    // Filter by search term
    const matchesSearch = searchTerm === '' || transaction.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRoleFilter && matchesStatusFilter && matchesSearch;
  });
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                My Transactions
              </h1>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-all" />
          </div>
          {/* Filter Buttons */}
          {showFilters && <FadeIn direction="up">
              <div className="space-y-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {[{
                key: 'all',
                label: 'All Transactions',
                icon: <Handshake size={16} />
              }, {
                key: 'buying',
                label: 'Purchases',
                icon: <ShoppingBag size={16} />
              }, {
                key: 'selling',
                label: 'Sales',
                icon: <Package size={16} />
              }].map(({
                key,
                label,
                icon
              }) => <button key={key} onClick={() => setFilter(key as 'all' | 'buying' | 'selling')} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                      {icon}
                      <span>{label}</span>
                    </button>)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[{
                  key: 'all',
                  label: 'All Statuses'
                }, {
                  key: 'pending',
                  label: 'Pending'
                }, {
                  key: 'paid',
                  label: 'Paid'
                }, {
                  key: 'collected',
                  label: 'Collected'
                }, {
                  key: 'cancelled',
                  label: 'Cancelled'
                }, {
                  key: 'refunded',
                  label: 'Refunded'
                }].map(({
                  key,
                  label
                }) => <button key={key} onClick={() => setStatusFilter(key as Transaction['status'] | 'all')} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${statusFilter === key ? getStatusColor(key as Transaction['status']) : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        {label}
                      </button>)}
                  </div>
                </div>
              </div>
            </FadeIn>}
        </div>
      </div>
      {/* Transaction List */}
      <div className="px-4 py-6">
        {isLoading ? <div className="space-y-4">
            {[...Array(3)].map((_, index) => <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                  <div className="w-20">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              </div>)}
          </div> : filteredTransactions.length === 0 ? <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No transactions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : "You haven't made any transactions yet"}
            </p>
          </div> : <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => {
          const isBuyer = transaction.buyerId === currentUserId;
          const otherUser = isBuyer ? transaction.sellerName : transaction.buyerName;
          const otherUserAvatar = isBuyer ? transaction.sellerAvatar : transaction.buyerAvatar;
          const displayAmount = isBuyer ? transaction.amount : transaction.sellerAmount;
          return <FadeIn key={transaction.id} direction="up" delay={index * 0.05}>
                  <div onClick={() => navigate(`/account/transaction/${transaction.transactionId}`)} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 cursor-pointer">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={transaction.productImage} alt={transaction.productTitle} className="w-full h-full object-cover" />
                      </div>
                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {transaction.productTitle}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {isBuyer ? 'Bought from' : 'Sold to'} {otherUser}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {formatPrice(displayAmount)}
                            </p>
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusIcon(transaction.status)}
                              <span>
                                {getStatusText(transaction.status, !isBuyer, transaction.sellerPaidout)}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <img src={otherUserAvatar} alt={otherUser} className="w-5 h-5 rounded-full" />
                            <span className="text-xs">
                              {transaction.transactionId}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span className="text-xs">
                              {getRelativeTime(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>;
        })}
          </div>}
      </div>
    </div>;
};
// Transaction Detail Component
const TransactionDetail = () => {
  const {
    transactionId
  } = useParams();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Mock API call - replace with actual API
    const fetchTransaction = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/transactions/${transactionId}`);
        setTransaction(response.data.transaction);
      } catch (error) {
        console.error('Error fetching transaction:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [transactionId]);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>;
  }
  if (!transaction) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Transaction Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The transaction you're looking for doesn't exist.
          </p>
          <button onClick={() => navigate('/account/transactions')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Back to Transactions
          </button>
        </div>
      </div>;
  }
  const currentUserId = user?.userId || '';
  const isBuyer = transaction.buyerId === currentUserId;
  const otherUser = isBuyer ? transaction.sellerName : transaction.buyerName;
  const otherUserAvatar = isBuyer ? transaction.sellerAvatar : transaction.buyerAvatar;
  const getStatusSteps = () => {
    const steps = [{
      label: 'Order Placed',
      completed: true,
      date: transaction.createdAt,
      icon: <ShoppingBag size={18} />
    }, {
      label: isBuyer ? 'Payment Made' : 'Payment Received',
      completed: ['paid', 'collected', 'refunded'].includes(transaction.status),
      date: transaction.status === 'paid' || transaction.status === 'collected' || transaction.status === 'refunded' ? transaction.createdAt : null,
      icon: <CreditCard size={18} />
    }, {
      label: isBuyer ? 'Item Collected' : 'Item Handed Over',
      completed: transaction.status === 'collected' || transaction.status === 'refunded',
      date: transaction.completedAt,
      icon: <Truck size={18} />
    }];
    if (transaction.status === 'refunded') {
      steps.push({
        label: 'Refund Processed',
        completed: true,
        date: transaction.completedAt,
        icon: <Repeat size={18} />
      });
    } else if (!isBuyer) {
      steps.push({
        label: 'Payment Received',
        completed: transaction.sellerPaidout,
        date: transaction.sellerPaidout ? transaction.completedAt : undefined,
        icon: <DollarSign size={18} />
      });
    }
    return steps;
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link to="/account/transactions" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Transaction Details
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {transaction.transactionId}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Product Info */}
        <FadeIn direction="up">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                <img src={transaction.productImage} alt={transaction.productTitle} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {transaction.productTitle}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <img src={otherUserAvatar} alt={otherUser} className="w-6 h-6 rounded-full" />
                  <span>
                    {isBuyer ? 'Sold by' : 'Bought by'} {otherUser}
                  </span>
                </div>
                <button onClick={() => navigate(`/product/${transaction.productId}`)} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:text-indigo-700 dark:hover:text-indigo-300">
                  View Product
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
        {/* Transaction Status */}
        <FadeIn direction="up" delay={0.1}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <RefreshCw size={20} className="mr-2" />
              Transaction Status
            </h3>
            <div className="space-y-8">
              {getStatusSteps().map((step, index) => <div key={index} className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                    {step.completed ? step.icon : <div className="w-2 h-2 bg-current rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.date && <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(step.date)}
                      </p>}
                  </div>
                </div>)}
            </div>
          </div>
        </FadeIn>
        {/* Payment Summary */}
        <FadeIn direction="up" delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <DollarSign size={20} className="mr-2" />
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Item Price
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatPrice(transaction.amount)}
                </span>
              </div>
              {!isBuyer && <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Platform Fee
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -{formatPrice(transaction.agentFee)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        You{' '}
                        {transaction.sellerPaidout ? 'Received' : 'Will Receive'}
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatPrice(transaction.sellerAmount)}
                      </span>
                    </div>
                  </div>
                </>}
              {isBuyer && <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Total Paid
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatPrice(transaction.amount)}
                    </span>
                  </div>
                </div>}
            </div>
          </div>
        </FadeIn>
        {/* Transaction Details */}
        <FadeIn direction="up" delay={0.3}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Transaction Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Transaction ID
                </span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {transaction.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Date Created
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatDate(transaction.createdAt)}
                </span>
              </div>
              {transaction.completedAt && <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isBuyer ? 'Collected On' : 'Completed On'}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatDate(transaction.completedAt)}
                  </span>
                </div>}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  <span className="capitalize">{transaction.status}</span>
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
        {/* Action Buttons */}
        {(transaction.status === 'paid' || transaction.status === 'pending') && <FadeIn direction="up" delay={0.4}>
            <div className="flex gap-3">
              {isBuyer && transaction.status === 'paid' && <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center">
                  <CheckCircle size={18} className="mr-2" />
                  Confirm Receipt
                </button>}
              {!isBuyer && transaction.status === 'paid' && <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center">
                  <Truck size={18} className="mr-2" />
                  Mark as Delivered
                </button>}
              {transaction.status === 'pending' && <button className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center">
                  <AlertCircle size={18} className="mr-2" />
                  Cancel Transaction
                </button>}
            </div>
          </FadeIn>}
        {/* Contact Support */}
        <FadeIn direction="up" delay={0.5}>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">
                  Need Help?
                </h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">
                  If you have any issues with this transaction, our support team
                  is here to help.
                </p>
                <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>;
};
// Main component that handles routing
const TransactionPages = () => {
  const {
    transactionId
  } = useParams();
  if (transactionId) {
    return <TransactionDetail />;
  }
  return <TransactionList />;
};
export default TransactionPages;