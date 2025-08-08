import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  AlertTriangle,
  ChevronDown, 
  CheckCircle, 
  XCircle, 
  Copy,
  Check,
  Eye, 
  RefreshCw, 
  Clock, 
  DollarSign, 
  Users, 
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
  Download,
  FileText,
  Upload,
  MessageSquare,
  Shield,
  CreditCard,
  Calendar,
  ArrowUpRight,
  Info
} from 'lucide-react';

// Import your API service
import api, { imageApi } from '../../utils/apiService';

interface Transaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  customer: {
    email: string;
    name: string;
  };
}

interface Dispute {
  id: string;
  refund_amount: number;
  currency: string;
  status: 'awaiting-merchant-feedback' | 'awaiting-bank-feedback' | 'pending' | 'resolved';
  resolution: string | null;
  domain: string;
  transaction: Transaction;
  created_at: string;
  updated_at: string;
  due_at: string;
  reason_code: string;
  more_info_url: string;
  bin: string;
  last4: string;
  card_type: string;
  evidence?: any;
  messages?: Array<{
    sender: string;
    body: string;
    sent_at: string;
  }>;
}

interface DisputeResponse {
  success: boolean;
  disputes: Dispute[];
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  summary: {
    total_awaiting_feedback: number;
    total_awaiting_bank: number;
    total_pending: number;
    total_resolved: number;
    total_amount_disputed: number;
    total_amount_resolved: number;
  };
}

const DisputeSettlement: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidenceDescription, setEvidenceDescription] = useState('');

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await api.get<DisputeResponse>('/api/get_dispute_list', {
        params: {
          status: statusFilter === 'all' ? undefined : statusFilter,
          page: currentPage,
          per_page: 20
        }
      });

      if (response.data.success) {
        setDisputes(response.data.disputes);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter, currentPage]);

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateId = (id: string) => {
    return id.length > 30 ? id.slice(0, 30) + '...' : id;
  };

  const formatPrice = (price: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'awaiting-merchant-feedback': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      'awaiting-bank-feedback': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      'pending': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      'resolved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    };

    const labels = {
      'awaiting-merchant-feedback': 'Action Required',
      'awaiting-bank-feedback': 'Bank Review',
      'pending': 'Pending',
      'resolved': 'Resolved'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getUrgencyBadge = (dueAt: string) => {
    const now = new Date();
    const due = new Date(dueAt);
    const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursLeft < 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Overdue</span>;
    } else if (hoursLeft < 24) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Urgent</span>;
    } else if (hoursLeft < 72) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Soon</span>;
    }
    return null;
  };

  const handleUploadEvidence = async (disputeId: string, files: File[], description: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(disputeId));
      
      const formData = new FormData();
      files.forEach(file => formData.append('evidence_files', file));
      formData.append('description', description);

      const response = await imageApi.post(`/api/dispute/${disputeId}/evidence`, formData);
      
      if (response.data.success) {
        fetchDisputes();
        setShowEvidenceModal(false);
        setEvidenceFiles([]);
        setEvidenceDescription('');
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(disputeId);
        return newSet;
      });
    }
  };

  const handleAcceptDispute = async (disputeId: string, refundAmount: number) => {
    try {
      setProcessingIds(prev => new Set(prev).add(disputeId));
      const response = await api.post(`/api/dispute/${disputeId}/accept`, {
        refund_amount: refundAmount
      });
      
      if (response.data.success) {
        fetchDisputes();
      }
    } catch (error) {
      console.error('Error accepting dispute:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(disputeId);
        return newSet;
      });
    }
  };

  const handleExportEvidence = async (disputeId: string) => {
    try {
      const response = await api.get(`/api/dispute/${disputeId}/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dispute-${disputeId}-evidence.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting evidence:', error);
    }
  };

  const filteredDisputes = useMemo(() => {
    if (!searchTerm) return disputes;
    
    return disputes.filter(dispute => 
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.transaction.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.transaction.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [disputes, searchTerm]);

  const urgentCount = disputes.filter(dispute => {
    const due = new Date(dispute.due_at);
    const now = new Date();
    return (due.getTime() - now.getTime()) / (1000 * 60 * 60) < 24 && dispute.status === 'awaiting-merchant-feedback';
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dispute & Settlement Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage payment disputes and chargebacks
              </p>
            </div>
            <div className="flex items-center gap-3">
              {urgentCount > 0 && (
                <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-3 py-2 rounded-lg">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">{urgentCount} urgent</span>
                </div>
              )}
              <button
                onClick={fetchDisputes}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting Response</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_awaiting_feedback || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Action required</p>
                </div>
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bank Review</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_awaiting_bank || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Under review</p>
                </div>
                <Shield className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_resolved || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {formatPrice(summary.total_amount_resolved || 0)}
                  </p>
                </div>
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Disputed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(summary.total_amount_disputed || 0)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">All time</p>
                </div>
                <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
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
                placeholder="Search by dispute ID, transaction reference, or customer email..."
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
                <option value="awaiting-merchant-feedback">Awaiting Response</option>
                <option value="awaiting-bank-feedback">Bank Review</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin text-purple-600" size={24} />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading disputes...</span>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No disputes found</h3>
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
                        Dispute Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Due Date
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
                    {filteredDisputes.map((dispute) => (
                      <tr key={dispute.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {truncateId(dispute.id)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <CreditCard size={12} />
                            {dispute.card_type} •••• {dispute.last4}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {truncateId(dispute.transaction.reference)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(dispute.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {dispute.transaction.customer.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {dispute.transaction.customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPrice(dispute.refund_amount, dispute.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDate(dispute.due_at)}
                          </div>
                          {getUrgencyBadge(dispute.due_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(dispute.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {dispute.status === 'awaiting-merchant-feedback' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedDispute(dispute);
                                    setShowEvidenceModal(true);
                                  }}
                                  className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                                >
                                  <Upload size={14} />
                                  Evidence
                                </button>
                                <button
                                  onClick={() => handleAcceptDispute(dispute.id, dispute.refund_amount)}
                                  disabled={processingIds.has(dispute.id)}
                                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                                >
                                  <Check size={14} />
                                  {processingIds.has(dispute.id) ? 'Processing...' : 'Accept'}
                                </button>
                              </>
                            )}
                            
                            <button
                              onClick={() => handleExportEvidence(dispute.id)}
                              className="inline-flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                            >
                              <Download size={14} />
                              Export
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedDispute(dispute);
                                setShowDetailsModal(true);
                              }}
                              className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                            >
                              <Eye size={14} />
                              Details
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

      {/* Evidence Upload Modal */}
      {showEvidenceModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Upload Evidence
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dispute {truncateId(selectedDispute.id)} • Due: {formatDate(selectedDispute.due_at)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEvidenceModal(false);
                    setEvidenceFiles([]);
                    setEvidenceDescription('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Evidence Description
                  </label>
                  <textarea
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    placeholder="Describe the evidence you're uploading..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Evidence Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files) {
                          setEvidenceFiles(Array.from(e.target.files));
                        }
                      }}
                      className="hidden"
                      id="evidence-upload"
                    />
                    <label htmlFor="evidence-upload" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 dark:text-gray-400">
                        Click to upload files or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        PDF, JPG, PNG, DOC files up to 10MB each
                      </p>
                    </label>
                  </div>
                  
                  {evidenceFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {evidenceFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                          </div>
                          <button
                            onClick={() => {
                              const newFiles = evidenceFiles.filter((_, i) => i !== index);
                              setEvidenceFiles(newFiles);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowEvidenceModal(false);
                      setEvidenceFiles([]);
                      setEvidenceDescription('');
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUploadEvidence(selectedDispute.id, evidenceFiles, evidenceDescription)}
                    disabled={processingIds.has(selectedDispute.id) || evidenceFiles.length === 0}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processingIds.has(selectedDispute.id) ? 'Uploading...' : 'Upload Evidence'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Details Modal */}
      {showDetailsModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Dispute Details
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Complete information for dispute {truncateId(selectedDispute.id)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedDispute(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Dispute Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Dispute Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Dispute ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-900 dark:text-white">
                            {truncateId(selectedDispute.id)}
                          </span>
                          <button
                            onClick={() => handleCopy(selectedDispute.id)}
                            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                        <span className="text-sm text-gray-600 dark:text-gray-400">Reason:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedDispute.reason_code}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">
                          -{formatPrice(selectedDispute.refund_amount, selectedDispute.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        {getStatusBadge(selectedDispute.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(selectedDispute.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Due Date:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {formatDate(selectedDispute.due_at)}
                          </span>
                          {getUrgencyBadge(selectedDispute.due_at)}
                        </div>
                      </div>
                      {selectedDispute.more_info_url && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">More Info:</span>
                          <a
                            href={selectedDispute.more_info_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            View Details <ArrowUpRight size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Payment Method
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Card Type:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {selectedDispute.card_type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Card Number:</span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          •••• •••• •••• {selectedDispute.last4}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">BIN:</span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {selectedDispute.bin}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Transaction Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Transaction Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Reference:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-900 dark:text-white">
                            {truncateId(selectedDispute.transaction.reference)}
                          </span>
                          <button
                            onClick={() => handleCopy(selectedDispute.transaction.reference)}
                            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(selectedDispute.transaction.amount, selectedDispute.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          selectedDispute.transaction.status === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {selectedDispute.transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Customer Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedDispute.transaction.customer.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {selectedDispute.transaction.customer.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Risk Assessment
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          selectedDispute.status === 'resolved' ? 'text-green-600 dark:text-green-400' : 
                          selectedDispute.status === 'awaiting-merchant-feedback' ? 'text-red-600 dark:text-red-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {selectedDispute.status === 'resolved' ? 'LOW' : 
                           selectedDispute.status === 'awaiting-merchant-feedback' ? 'HIGH' : 'MED'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Urgency Risk</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          selectedDispute.refund_amount <= 5000000 ? 'text-green-600 dark:text-green-400' :
                          selectedDispute.refund_amount <= 15000000 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {selectedDispute.refund_amount <= 5000000 ? 'LOW' :
                           selectedDispute.refund_amount <= 15000000 ? 'MED' : 'HIGH'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Amount Risk</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Dispute Timeline
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                      <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Dispute Opened
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(selectedDispute.created_at)}
                      </p>
                    </div>
                  </div>

                  {selectedDispute.status !== 'awaiting-merchant-feedback' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Response Submitted
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Evidence provided to bank
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedDispute.status === 'resolved' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Dispute Resolved
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedDispute.resolution || 'Resolution details not available'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {selectedDispute.status === 'awaiting-merchant-feedback' && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowEvidenceModal(true);
                      }}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Upload size={16} />
                      Upload Evidence
                    </button>
                    <button
                      onClick={() => handleAcceptDispute(selectedDispute.id, selectedDispute.refund_amount)}
                      disabled={processingIds.has(selectedDispute.id)}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Check size={16} />
                      {processingIds.has(selectedDispute.id) ? 'Processing...' : 'Accept Dispute'}
                    </button>
                    <button
                      onClick={() => handleExportEvidence(selectedDispute.id)}
                      className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download size={16} />
                      Export Evidence
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

export default DisputeSettlement;