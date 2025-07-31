import React, { useEffect, useState } from 'react';
import api from '../../utils/apiService';
import { useNavigate } from 'react-router-dom';
import AdminReportsSkeleton from '../../components/loaders/ReportsLoader';
import { AlertTriangle, Eye, Flag, Ban, Clock, Search, Filter, ChevronDown, MessageSquare, Shield, User, X, AlertCircle, CheckCircle, RefreshCw, Users, ChevronUp } from 'lucide-react';
interface Report {
  id: number;
  userId: string;
  type: string;
  riskLevel: 'low' | 'medium' | 'high';
  message: string;
  match: string;
  isSuspended: boolean;
  isBanned: boolean;
  isFlagged: boolean;
  chatId?: string;
}
interface GroupedReport {
  userId: string;
  reports: Report[];
  totalReports: number;
  highestRiskLevel: 'low' | 'medium' | 'high';
  reportTypes: string[];
}
interface ErrorState {
  show: boolean;
  message: string;
  type: 'error' | 'success' | 'warning';
}
const AdminReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [groupedView, setGroupedView] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>({
    show: false,
    message: '',
    type: 'error'
  });
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const showNotification = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setError({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setError({
        show: false,
        message: '',
        type: 'error'
      });
    }, 5000);
  };
  const fetchReports = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const response = await api.get('/api/reports');
      if (!response?.data) {
        throw new Error('Invalid response format');
      }
      const reportsData = response.data.reports || [];
      if (!Array.isArray(reportsData)) {
        throw new Error('Reports data is not in expected format');
      }
      setReports(reportsData);
      if (reportsData.length === 0 && showLoadingSpinner) {
        showNotification('No reports found', 'warning');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      let errorMessage = 'Failed to load reports';
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('403') || error.message.includes('401')) {
          errorMessage = 'You are not authorized to view this content.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      showNotification(errorMessage, 'error');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReports();
  }, []);

  // Group reports by userId
  const groupReportsByUser = (reports: Report[]): GroupedReport[] => {
    const grouped = reports.reduce((acc, report) => {
      const userId = report.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          reports: [],
          totalReports: 0,
          highestRiskLevel: 'low' as const,
          reportTypes: []
        };
      }
      acc[userId].reports.push(report);
      acc[userId].totalReports += 1;

      // Determine highest risk level
      const riskLevels = {
        'low': 1,
        'medium': 2,
        'high': 3
      };
      if (riskLevels[report.riskLevel] > riskLevels[acc[userId].highestRiskLevel]) {
        acc[userId].highestRiskLevel = report.riskLevel;
      }

      // Collect unique report types
      if (!acc[userId].reportTypes.includes(report.type)) {
        acc[userId].reportTypes.push(report.type);
      }
      return acc;
    }, {} as Record<string, GroupedReport>);
    return Object.values(grouped).sort((a, b) => {
      // Sort by total reports (descending), then by highest risk level
      if (a.totalReports !== b.totalReports) {
        return b.totalReports - a.totalReports;
      }
      const riskLevels = {
        'low': 1,
        'medium': 2,
        'high': 3
      };
      return riskLevels[b.highestRiskLevel] - riskLevels[a.highestRiskLevel];
    });
  };
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };
  const handleAction = async (userId: string, action: string, reportId: number) => {
    const actionKey = `${reportId}_${action}`;
    try {
      setActionLoading(prev => ({
        ...prev,
        [actionKey]: true
      }));
      await api.post(`/api/report/action/${userId}`, {
        action
      });
      showNotification(`Successfully ${action}ed user ${userId}`, 'success');
      await fetchReports(false);
    } catch (error: any) {
      const errorMessage = error.response?.data.message || `Failed to ${action} user. Please try again.`;
      showNotification(errorMessage, 'error');
    } finally {
      setActionLoading(prev => ({
        ...prev,
        [actionKey]: false
      }));
    }
  };
  const navigateToChat = (chatId: string) => {
    try {
      if (!chatId) {
        showNotification('Chat ID is not available', 'warning');
        return;
      }
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      showNotification('Failed to navigate to chat', 'error');
    }
  };
  const toggleGroupExpansion = (userId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  const filteredReports = reports.filter(report => {
    try {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = report.message?.toLowerCase().includes(searchLower) || report.userId?.toLowerCase().includes(searchLower) || report.match?.toLowerCase().includes(searchLower);
      const matchesType = filterType === 'all' || report.type === filterType;
      const matchesRisk = filterRisk === 'all' || report.riskLevel === filterRisk;
      return matchesSearch && matchesType && matchesRisk;
    } catch (error) {
      console.error('Error filtering report:', error);
      return false;
    }
  });
  const groupedReports = groupReportsByUser(filteredReports);
  const handleRefresh = () => {
    fetchReports();
  };
  if (loading) {
    return <AdminReportsSkeleton />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      {/* Error/Success Notification */}
      {error.show && <div className={`fixed top-12 right-4 z-50 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg border transition-all duration-300 ${error.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200' : error.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'}`}>
          {error.type === 'error' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
          {error.type === 'success' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
          {error.type === 'warning' && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
          <span className="text-xs sm:text-sm font-medium">{error.message}</span>
          <button onClick={() => setError({
        show: false,
        message: '',
        type: 'error'
      })} className="ml-2 p-1 hover:bg-black/10 rounded transition-colors">
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>}

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  User Reports
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Review flagged content and manage user violations
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span>Total: {reports.length}</span>
                  <span>Filtered: {filteredReports.length}</span>
                  {groupedView && <span className="hidden sm:inline">Unique Users: {groupedReports.length}</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => setGroupedView(!groupedView)} className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm ${groupedView ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'}`}>
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{groupedView ? 'Grouped View' : 'List View'}</span>
                <span className="sm:hidden">{groupedView ? 'Group' : 'List'}</span>
              </button>
              <button onClick={handleRefresh} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm">
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input type="text" placeholder="Search reports, users, or violations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm text-sm sm:text-base" />
            </div>

            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-sm">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Advanced Filters</span>
              <span className="sm:hidden">Filters</span>
              <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Type
                  </label>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                    <option value="all">All Types</option>
                    <option value="phone">Phone Number Content</option>
                    <option value="social">Social Media Content</option>
                    <option value="payment">Payment Content</option>
                    <option value="email">Email Content</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Risk Level
                  </label>
                  <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                    <option value="all">All Risk Levels</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                  </select>
                </div>
              </div>}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="px-4 sm:px-6 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {groupedView ?
        // Grouped View
        groupedReports.map(group => <div key={group.userId} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
                {/* Group Header */}
                <div className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-t-2xl" onClick={() => toggleGroupExpansion(group.userId)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex-shrink-0">
                        <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <span className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                            User: {group.userId}
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getRiskColor(group.highestRiskLevel)}`}>
                              {group.highestRiskLevel} Risk
                            </span>
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {group.totalReports} Report{group.totalReports > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span className="truncate">Types: {group.reportTypes.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {group.totalReports > 1 && <span className="px-1 sm:px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium rounded-full hidden sm:inline">
                          REPEAT OFFENDER
                        </span>}
                      {expandedGroups.has(group.userId) ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Group Content */}
                {expandedGroups.has(group.userId) && <div className="border-t border-gray-200 dark:border-gray-700">
                    {group.reports.map((report, index) => <div key={report.id} className={`p-4 sm:p-6 ${index !== group.reports.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                        {/* Individual Report Header */}
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getRiskColor(report.riskLevel)}`}>
                              {report.riskLevel} Risk
                            </span>
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 capitalize border border-blue-200 dark:border-blue-800">
                              {report.type}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              ID: #{report.id}
                            </span>
                          </div>
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                        </div>

                        {/* Report Details */}
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white mb-2 sm:mb-3 font-medium leading-relaxed">
                            {report.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                            <span className="font-medium">Match:</span>
                            <span className="font-mono bg-gray-200 dark:bg-gray-600 px-1 sm:px-2 py-1 rounded text-xs truncate">{report.match}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {report.chatId && <button onClick={() => navigateToChat(report.chatId || '')} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:shadow-md">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">View Chat</span>
                              <span className="sm:hidden">View</span>
                            </button>}
                          
                          <button onClick={() => handleAction(report.userId, report.isFlagged ? 'unflag' : 'flag', report.id)} disabled={actionLoading[`${report.id}_${report.isFlagged ? 'unflag' : 'flag'}`]} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-all duration-200 border border-yellow-200 dark:border-yellow-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                            {actionLoading[`${report.id}_flag`] || actionLoading[`${report.id}_unflag`] ? <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Flag className="w-3 h-3 sm:w-4 sm:h-4" />}
                            <span className="hidden sm:inline">{report.isFlagged ? 'Unflag User' : 'Flag User'}</span>
                            <span className="sm:hidden">{report.isFlagged ? 'Unflag' : 'Flag'}</span>
                          </button>
                          
                          <button onClick={() => handleAction(report.userId, report.isSuspended ? 'unsuspend' : 'suspend', report.id)} disabled={actionLoading[`${report.id}_${report.isSuspended ? 'unsuspend' : 'suspend'}`]} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg transition-all duration-200 border border-orange-200 dark:border-orange-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                            {actionLoading[`${report.id}_suspend`] || actionLoading[`${report.id}_unsuspend`] ? <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                            <span className="hidden sm:inline">{report.isSuspended ? 'Unsuspend User' : 'Suspend User'}</span>
                            <span className="sm:hidden">{report.isSuspended ? 'Unsuspend' : 'Suspend'}</span>
                          </button>
                          
                          <button onClick={() => handleAction(report.userId, report.isBanned ? 'unban' : 'ban', report.id)} disabled={actionLoading[`${report.id}_${report.isBanned ? 'unban' : 'ban'}`]} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                            {actionLoading[`${report.id}_ban`] || actionLoading[`${report.id}_unban`] ? <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Ban className="w-3 h-3 sm:w-4 sm:h-4" />}
                            <span className="hidden sm:inline">{report.isBanned ? 'Unban User' : 'Ban User'}</span>
                            <span className="sm:hidden">{report.isBanned ? 'Unban' : 'Ban'}</span>
                          </button>
                        </div>
                      </div>)}
                  </div>}
              </div>) :
        // Original List View
        filteredReports.map(report => <div key={report.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Report Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-shrink-0">
                      <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getRiskColor(report.riskLevel)}`}>
                          {report.riskLevel} Risk
                        </span>
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 capitalize border border-blue-200 dark:border-blue-800">
                          {report.type}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        Report ID: #{report.id} | User: {report.userId}
                      </p>
                    </div>
                  </div>
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                </div>

                {/* Report Details */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white mb-2 sm:mb-3 font-medium leading-relaxed">
                    {report.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Match:</span>
                    <span className="font-mono bg-gray-200 dark:bg-gray-600 px-1 sm:px-2 py-1 rounded text-xs truncate">{report.match}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {report.chatId && <button onClick={() => navigateToChat(report.chatId || '')} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:shadow-md">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">View Chat</span>
                      <span className="sm:hidden">View</span>
                    </button>}
                  
                  <button onClick={() => handleAction(report.userId, 'flag', report.id)} disabled={actionLoading[`${report.id}_flag`]} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-all duration-200 border border-yellow-200 dark:border-yellow-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {actionLoading[`${report.id}_flag`] ? <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Flag className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="hidden sm:inline">Flag User</span>
                    <span className="sm:hidden">Flag</span>
                  </button>
                  
                  <button onClick={() => handleAction(report.userId, 'suspend', report.id)} disabled={actionLoading[`${report.id}_suspend`]} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg transition-all duration-200 border border-orange-200 dark:border-orange-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {actionLoading[`${report.id}_suspend`] ? <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="hidden sm:inline">Suspend</span>
                    <span className="sm:hidden">Suspend</span>
                  </button>
                  
                  <button onClick={() => handleAction(report.userId, 'ban', report.id)} disabled={actionLoading[`${report.id}_ban`]} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {actionLoading[`${report.id}_ban`] ? <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Ban className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="hidden sm:inline">Ban User</span>
                    <span className="sm:hidden">Ban</span>
                  </button>
                </div>
              </div>)}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl mb-4 sm:mb-6">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No reports found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
              {searchTerm || filterType !== 'all' || filterRisk !== 'all' ? 'Try adjusting your search criteria or filters to find more reports' : 'Great job! All reports have been handled successfully'}
            </p>
            {(searchTerm || filterType !== 'all' || filterRisk !== 'all') && <button onClick={() => {
          setSearchTerm('');
          setFilterType('all');
          setFilterRisk('all');
        }} className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm sm:text-base">
                Clear Filters
              </button>}
          </div>}
      </div>
    </div>;
};
export default AdminReportsPage;