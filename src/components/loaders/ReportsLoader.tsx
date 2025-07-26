import React from 'react';
import { Shield, Search, Filter, ChevronDown } from 'lucide-react';

const AdminReportsSkeleton = () => {
  // Generate skeleton items
  const skeletonItems = Array.from({ length: 4 }, (_, i) => (
    <div
      key={i}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
    >
      {/* Report Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Icon placeholder */}
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* Risk level badge skeleton */}
              <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              {/* Type badge skeleton */}
              <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
        {/* Alert icon skeleton */}
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Report Details */}
      <div className="mb-4">
        {/* Message skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        
        {/* User and match info skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons skeleton */}
      <div className="flex flex-wrap gap-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-20"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-20"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-20"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-20"></div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                User Reports
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review flagged content and manage user violations
              </p>
            </div>
          </div>

          {/* Search and Filters skeleton */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <div className="w-full h-10 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Reports List skeleton */}
      <div className="px-4 py-6">
        <div className="space-y-4">
          {skeletonItems}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsSkeleton;