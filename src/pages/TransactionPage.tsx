import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  ShoppingBag,
  Handshake,
  Filter,
  Search,
  ExternalLinkIcon
} from 'lucide-react';

// Mock data - replace with actual API calls
const mockTransactions = [
  {
    id: 1,
    buyerId: 'user123',
    sellerId: 'seller456',
    transactionId: 'TXN-2025-001',
    productTitle: 'MacBook Pro M1 2021',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    amount: 850000, // buyer pays full amount
    sellerAmount: 833000, // seller gets amount minus fees
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
  },
  {
    id: 2,
    buyerId: 'seller456',
    sellerId: 'user789',
    transactionId: 'TXN-2025-002',
    productTitle: 'iPhone 14 Pro Max',
    productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
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
  },
  {
    id: 3,
    buyerId: 'user999',
    sellerId: 'user123',
    transactionId: 'TXN-2025-003',
    productTitle: 'Dell XPS 13 Laptop',
    productImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
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
  }
];

const currentUserId = 'user123'; // Mock current user

const TransactionList = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filter, setFilter] = useState('all'); // all, buying, selling
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const getStatusColor = (status, isSeller, sellerPaidout) => {
    if (status === 'completed') {
      if (isSeller && sellerPaidout) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      if (isSeller && !sellerPaidout) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    }
    if (status === 'paid') return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  };

  const getStatusText = (status, isSeller, sellerPaidout) => {
    if (status === 'completed') {
      if (isSeller && sellerPaidout) return 'Paid Out';
      if (isSeller && !sellerPaidout) return 'Awaiting Payout';
      return 'Completed';
    }
    if (status === 'paid') return isSeller ? 'Payment Received' : 'Paid';
    return 'Pending Payment';
  };

  const getStatusIcon = (status, isSeller, sellerPaidout) => {
    if (status === 'completed') {
      if (isSeller && sellerPaidout) return <CheckCircle size={16} />;
      if (isSeller && !sellerPaidout) return <Clock size={16} />;
      return <CheckCircle size={16} />;
    }
    if (status === 'paid') return <CreditCard size={16} />;
    return <AlertCircle size={16} />;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const isBuyer = transaction.buyerId === currentUserId;
    const matchesFilter = filter === 'all' || 
      (filter === 'buying' && isBuyer) || 
      (filter === 'selling' && !isBuyer);
    
    const matchesSearch = searchTerm === '' || 
      transaction.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link 
                to="/account" 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                My Transactions
              </h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all"
            />
          </div>

          {/* Filter Buttons */}
          {showFilters && (
            <div className="flex space-x-2 mb-4">
              {[
                { key: 'all', label: 'All', icon: <Handshake size={16} /> },
                { key: 'buying', label: 'Buying', icon: <ShoppingBag size={16} /> },
                { key: 'selling', label: 'Selling', icon: <Package size={16} /> }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-4 py-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No transactions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t made any transactions yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const isBuyer = transaction.buyerId === currentUserId;
              const otherUser = isBuyer ? transaction.sellerName : transaction.buyerName;
              const otherUserAvatar = isBuyer ? transaction.sellerAvatar : transaction.buyerAvatar;
              const displayAmount = isBuyer ? transaction.amount : transaction.sellerAmount;

              return (
                <Link
                  key={transaction.id}
                  to={`/account/transaction/${transaction.transactionId}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={transaction.productImage}
                        alt={transaction.productTitle}
                        className="w-full h-full object-cover"
                      />
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
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status, !isBuyer, transaction.sellerPaidout)}`}>
                            {getStatusIcon(transaction.status, !isBuyer, transaction.sellerPaidout)}
                            <span>{getStatusText(transaction.status, !isBuyer, transaction.sellerPaidout)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <img
                            src={otherUserAvatar}
                            alt={otherUser}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-xs">{transaction.transactionId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span className="text-xs">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const TransactionDetail = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call - replace with actual API
    const fetchTransaction = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const found = mockTransactions.find(t => t.transactionId === transactionId);
      setTransaction(found);
      setLoading(false);
    };

    fetchTransaction();
  }, [transactionId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Transaction Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The transaction you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/account/transactions')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  const isBuyer = transaction.buyerId === currentUserId;
  const otherUser = isBuyer ? transaction.sellerName : transaction.buyerName;
  const otherUserAvatar = isBuyer ? transaction.sellerAvatar : transaction.buyerAvatar;

  const getStatusSteps = () => {
    const steps = [
      {
        label: 'Order Placed',
        completed: true,
        date: transaction.createdAt
      },
      {
        label: isBuyer ? 'Payment Made' : 'Payment Received',
        completed: ['paid', 'completed'].includes(transaction.status),
        date: transaction.status === 'paid' || transaction.status === 'completed' ? transaction.createdAt : null
      },
      {
        label: isBuyer ? 'Item Collected' : 'Item Handed Over',
        completed: transaction.status === 'completed',
        date: transaction.completedAt
      }
    ];

    if (!isBuyer) {
      steps.push({
        label: 'Payment Received',
        completed: transaction.sellerPaidout,
        date: transaction.sellerPaidout ? transaction.completedAt : null
      });
    }

    return steps;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link 
              to="/account/transactions" 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
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
      <div className="px-4 py-6 space-y-6">
        {/* Product Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={transaction.productImage}
                alt={transaction.productTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                {transaction.productTitle}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <img
                  src={otherUserAvatar}
                  alt={otherUser}
                  className="w-6 h-6 rounded-full"
                />
                <span>{isBuyer ? 'Sold by' : 'Bought by'} {otherUser}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <DollarSign size={20} className="mr-2" />
            Payment Summary
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Item Price</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatPrice(transaction.amount)}
              </span>
            </div>
            
            {!isBuyer && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatPrice(transaction.agentFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      You {transaction.sellerPaidout ? 'Received' : 'Will Receive'}
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatPrice(transaction.sellerAmount)}
                    </span>
                  </div>
                </div>
              </>
            )}
            
            {isBuyer && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Total Paid</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(transaction.amount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <CheckCircle size={20} className="mr-2" />
            Transaction Status
          </h3>
          
          <div className="space-y-4">
            {getStatusSteps().map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.completed 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle size={16} />
                  ) : (
                    <div className="w-2 h-2 bg-current rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    step.completed 
                      ? 'text-gray-900 dark:text-gray-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(step.date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Transaction Details
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {transaction.transactionId}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date Created</span>
              <span className="text-gray-900 dark:text-gray-100">
                {new Date(transaction.createdAt).toLocaleString()}
              </span>
            </div>
            
            {transaction.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {isBuyer ? 'Collected On' : 'Completed On'}
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(transaction.completedAt).toLocaleString()}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                transaction.status === 'completed' 
                  ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                  : transaction.status === 'paid'
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {transaction.status === 'completed' ? (
                  <CheckCircle size={12} />
                ) : transaction.status === 'paid' ? (
                  <CreditCard size={12} />
                ) : (
                  <Clock size={12} />
                )}
                <span className="capitalize">{transaction.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <ExternalLinkIcon size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Need Help?
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                If you have any issues with this transaction, our support team is here to help.
              </p>
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component that handles routing
const TransactionPages = () => {
  const { transactionId } = useParams();
  
  if (transactionId) {
    return <TransactionDetail />;
  }
  
  return <TransactionList />;
};

export default TransactionPages;