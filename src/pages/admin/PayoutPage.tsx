import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Verified,
  ChevronDown, 
  CheckCircle, 
  XCircle, 
  Copy,
  CheckIcon,
  Eye, 
  RefreshCw, 
  Clock, 
  DollarSign, 
  Users, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Bell,
  Download
} from 'lucide-react';

// Import your API service
import api from '../../utils/apiService';

interface SellerInfo {
  full_name: string;
  email: string;
  avatar_url: string;
  campus: string;
  phone_number: string;
  paystack_recipient_code: string;
  is_verified: boolean;
  average_rating: number;
  total_ratings: number;
}

interface Payout {
  id: number;
  transaction_id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
  paid_at: string | null;
  seller_info: SellerInfo;
}

interface PayoutResponse {
  success: boolean;
  payouts: Payout[];
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  summary: {
    total_pending: number;
    total_approved: number;
    total_paid: number;
    total_amount_pending: number;
    total_amount_approved: number;
    total_amount_paid: number;
  };
}

const PayoutApprovals: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [selectedPayouts, setSelectedPayouts] = useState<Set<number>>(new Set());
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsPayout, setDetailsPayout] = useState<Payout | null>(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await api.get<PayoutResponse>('/api/get_payout_list', {
        params: {
          status: statusFilter,
          page: currentPage,
          per_page: 20
        }
      });

      if (response.data.success) {
        setPayouts(response.data.payouts);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter, currentPage]);

  const handleCopy = async (id: string) => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500); // Reset after 1.5s
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateId = (id: string) => {
    const truncated = id.length > 30 ? id.slice(0, 30) + '...' : id;
    return truncated;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const utcDate = new Date(dateString + "Z");
    const formatted = utcDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    return formatted;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleApprove = async (payoutId: number) => {
    try {
      setProcessingIds(prev => new Set(prev).add(payoutId));
      const response = await api.post(`/api/payout/${payoutId}/approve`);
      
      if (response.data.success) {
        fetchPayouts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving payout:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(payoutId);
        return newSet;
      });
    }
  };

  const handleReject = async (payoutId: number, reason = '') => {
    try {
      setProcessingIds(prev => new Set(prev).add(payoutId));
      const response = await api.post(`/api/payout/${payoutId}/reject`, {
        reason
      });
      
      if (response.data.success) {
        fetchPayouts(); // Refresh the list
        setShowModal(false);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting payout:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(payoutId);
        return newSet;
      });
    }
  };

  const handleMarkPaid = async (payoutId: number) => {
    try {
      setProcessingIds(prev => new Set(prev).add(payoutId));
      const response = await api.post(`/api/payout/${payoutId}/mark_paid`);
      
      if (response.data.success) {
        fetchPayouts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error marking payout as paid:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(payoutId);
        return newSet;
      });
    }
  };

  const filteredPayouts = useMemo(() => {
    if (!searchTerm) return payouts;
    
    return payouts.filter(payout => 
      payout.seller_info.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.seller_info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payouts, searchTerm]);

  const pendingCount = summary?.total_pending || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Payout Approvals
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and approve seller payout requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-3 py-2 rounded-lg">
                  <Bell size={16} />
                  <span className="text-sm font-medium">{pendingCount} pending</span>
                </div>
              )}
              <button
                onClick={fetchPayouts}
                disabled={loading}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_pending}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {formatPrice(summary.total_amount_pending)}
                  </p>
                </div>
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_approved}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {formatPrice(summary.total_amount_approved)}
                  </p>
                </div>
                <CheckCircle className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paid Out</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_paid}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {formatPrice(summary.total_amount_paid)}
                  </p>
                </div>
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(
                        parseFloat(summary.total_amount_pending) +
                        parseFloat(summary.total_amount_approved) +
                        parseFloat(summary.total_amount_paid)
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">All time</p>
                </div>
                <Users className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by seller name, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 pr-8 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin text-purple-600" size={24} />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading payouts...</span>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payouts found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Payout ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Seller Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{payout.id}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {truncateId(payout.transaction_id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={payout.seller_info.avatar_url || 'https://via.placeholder.com/40'}
                              alt={payout.seller_info.full_name}
                            />
                            <div className="ml-4">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {payout.seller_info.full_name}
                                </div>
                                {payout.seller_info.is_verified && (
                                  <CheckCircle className="text-green-500" size={14} />
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {payout.seller_info.email}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {payout.seller_info.campus} • ⭐ {payout.seller_info.average_rating === 0 ? 'No ratings' : payout.seller_info.average_rating} ({payout.seller_info.total_ratings === 0 ? 'No ratings' : payout.seller_info.total_ratings} ratings)
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPrice(payout.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payout.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payout.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {payout.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(payout.id)}
                                  disabled={processingIds.has(payout.id)}
                                  className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                                >
                                  <Check size={14} />
                                  {processingIds.has(payout.id) ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPayout(payout);
                                    setShowModal(true);
                                  }}
                                  disabled={processingIds.has(payout.id)}
                                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                                >
                                  <X size={14} />
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {payout.status === 'approved' && (
                              <button
                                onClick={() => handleMarkPaid(payout.id)}
                                disabled={processingIds.has(payout.id)}
                                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                              >
                                <DollarSign size={14} />
                                {processingIds.has(payout.id) ? 'Processing...' : 'Mark Paid'}
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                setDetailsPayout(payout);
                                setShowDetailsModal(true);
                              }}
                              className="inline-flex items-center gap-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-3 py-1 rounded-md text-xs transition-colors"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {((currentPage - 1) * pagination.per_page) + 1} to{' '}
                      {Math.min(currentPage * pagination.per_page, pagination.total_count)} of{' '}
                      {pagination.total_count} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={!pagination.has_prev}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {pagination.total_pages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination.has_next}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Reject Payout Request
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to reject the payout request for{' '}
                <strong>{selectedPayout.seller_info.full_name}</strong> of{' '}
                <strong>{formatPrice(selectedPayout.amount)}</strong>?
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection (optional)"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedPayout.id, rejectionReason)}
                  disabled={processingIds.has(selectedPayout.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {processingIds.has(selectedPayout.id) ? 'Processing...' : 'Reject Payout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Details Modal */}
      {showDetailsModal && detailsPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Payout Details
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Complete information for payout #{detailsPayout.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailsPayout(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Payout Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Payout Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Payout ID:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          #{detailsPayout.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2 w-full">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID:</span>

                        <div className="flex items-center gap-2 max-w-[70%] sm:max-w-[80%] overflow-hidden">
                            <span className="text-sm font-mono text-gray-900 dark:text-white truncate">
                            {truncateId(detailsPayout.transaction_id)}
                            </span>
                            <button
                            onClick={() => handleCopy(detailsPayout.transaction_id)}
                            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                            {isCopied ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                            )}
                            </button>
                        </div>
                        </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatPrice(detailsPayout.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        {getStatusBadge(detailsPayout.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Date Requested:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(detailsPayout.created_at)}
                        </span>
                      </div>
                      {detailsPayout.paid_at && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Date Paid:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {formatDate(detailsPayout.paid_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Payment Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Paystack Code:</span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {detailsPayout.seller_info.paystack_recipient_code}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Phone Number:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {detailsPayout.seller_info.phone_number}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Seller Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Seller Information
                    </h4>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          src={detailsPayout.seller_info.avatar_url || 'https://via.placeholder.com/64'}
                          alt={detailsPayout.seller_info.full_name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {detailsPayout.seller_info.full_name}
                          </h5>
                          {detailsPayout.seller_info.is_verified && (
                            <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {detailsPayout.seller_info.email}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>📍 {detailsPayout.seller_info.campus}</span>
                          <span>⭐ {detailsPayout.seller_info.average_rating}</span>
                          <span>({detailsPayout.seller_info.total_ratings} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seller Stats */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Seller Performance
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Overall Rating</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {detailsPayout.seller_info.average_rating}/5.0
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(detailsPayout.seller_info.average_rating / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {detailsPayout.seller_info.total_ratings}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Total Reviews</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center text-center space-y-1">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {detailsPayout.seller_info.is_verified ? (
                                <Verified className="text-blue-500 w-6 h-6" />
                                ) : (
                                <X className="text-red-500 w-6 h-6" />
                                )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Verified</div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Timeline */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Transaction Timeline
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Payout Requested
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(detailsPayout.created_at)}
                      </p>
                    </div>
                  </div>

                  {detailsPayout.status === 'approved' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Payout Approved
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ready for payment processing
                        </p>
                      </div>
                    </div>
                  )}

                  {detailsPayout.status === 'paid' && detailsPayout.paid_at && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                        <DollarSign size={16} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Payment Completed
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(detailsPayout.paid_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Risk Assessment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${detailsPayout.seller_info.is_verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {detailsPayout.seller_info.is_verified ? 'LOW' : 'HIGH'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Verification Risk</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${detailsPayout.seller_info.average_rating >= 4.0 ? 'text-green-600 dark:text-green-400' : detailsPayout.seller_info.average_rating >= 3.0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {detailsPayout.seller_info.average_rating >= 4.0 ? 'LOW' : detailsPayout.seller_info.average_rating >= 3.0 ? 'MED' : 'HIGH'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Rating Risk</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${detailsPayout.seller_info.total_ratings >= 10 ? 'text-green-600 dark:text-green-400' : detailsPayout.seller_info.total_ratings >= 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {detailsPayout.seller_info.total_ratings >= 10 ? 'LOW' : detailsPayout.seller_info.total_ratings >= 5 ? 'MED' : 'HIGH'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Experience Risk</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${detailsPayout.amount <= 50000 ? 'text-green-600 dark:text-green-400' : detailsPayout.amount <= 100000 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {detailsPayout.amount <= 50000 ? 'LOW' : detailsPayout.amount <= 100000 ? 'MED' : 'HIGH'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Amount Risk</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {(detailsPayout.status === 'pending' || detailsPayout.status === 'approved') && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {detailsPayout.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleApprove(detailsPayout.id);
                            setShowDetailsModal(false);
                          }}
                          disabled={processingIds.has(detailsPayout.id)}
                          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          {processingIds.has(detailsPayout.id) ? 'Processing...' : 'Approve Payout'}
                        </button>
                        <button
                          onClick={() => {
                            setShowDetailsModal(false);
                            setSelectedPayout(detailsPayout);
                            setShowModal(true);
                          }}
                          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <XCircle size={16} />
                          Reject Payout
                        </button>
                      </>
                    )}
                    
                    {detailsPayout.status === 'approved' && (
                      <button
                        onClick={() => {
                          handleMarkPaid(detailsPayout.id);
                          setShowDetailsModal(false);
                        }}
                        disabled={processingIds.has(detailsPayout.id)}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <DollarSign size={16} />
                        {processingIds.has(detailsPayout.id) ? 'Processing...' : 'Mark as Paid'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        // Export payout details as JSON
                        const dataStr = JSON.stringify(detailsPayout, null, 2);
                        const dataBlob = new Blob([dataStr], {type:'application/json'});
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `payout-${detailsPayout.id}-details.json`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download size={16} />
                      Export Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutApprovals;