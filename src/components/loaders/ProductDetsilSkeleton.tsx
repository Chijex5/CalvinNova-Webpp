import React from 'react';
import { ChevronLeft } from 'lucide-react';
const ProductDetailSkeleton = () => {
  return <div className="container mx-auto px-4 py-6">
      {/* Back button skeleton */}
      <div className="inline-flex items-center text-gray-400 mb-6">
        <ChevronLeft size={16} />
        <div className="ml-1 w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Skeleton */}
        <div className="relative">
          {/* Main image skeleton */}
          <div className="bg-gray-200 rounded-lg aspect-w-1 aspect-h-1 animate-pulse">
            <div className="w-full h-80 md:h-96 bg-gray-300 rounded-lg flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-400 rounded opacity-50"></div>
            </div>
          </div>
          
          {/* Navigation buttons skeleton */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md opacity-50">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
          </div>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md opacity-50">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
          </div>
          
          {/* Thumbnail navigation skeleton */}
          <div className="flex mt-4 space-x-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-16 h-16 rounded-md bg-gray-300 animate-pulse"></div>)}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div>
          {/* Header with title and action buttons */}
          <div className="flex justify-between items-start">
            <div className="w-3/4 h-8 bg-gray-300 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>)}
            </div>
          </div>

          {/* Price skeleton */}
          <div className="w-24 h-8 bg-gray-300 rounded animate-pulse mt-2"></div>

          {/* Category and condition badges skeleton */}
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-20 h-6 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="w-16 h-6 bg-gray-300 rounded-md animate-pulse"></div>
          </div>

          {/* Description section skeleton */}
          <div className="mt-6">
            <div className="w-24 h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-5/6 h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Seller info skeleton */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 animate-pulse"></div>
              <div className="space-y-2">
                <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-32 h-3 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Action button skeleton */}
          <div className="mt-6">
            <div className="w-full h-12 bg-gray-300 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>;
};
export default ProductDetailSkeleton;