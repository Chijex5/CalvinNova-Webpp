import React from 'react';
const RecentConversationsSkeleton = ({
  count = 3
}) => {
  return <div className="divide-y divide-gray-100">
      {Array.from({
      length: count
    }).map((_, index) => <div key={index} className="p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            {/* Avatar skeleton */}
            <div className="relative">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              {/* Online indicator skeleton */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-200 rounded-full border-2 border-white"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                {/* Name skeleton */}
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                {/* Time skeleton */}
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
              {/* Message skeleton */}
              <div className="mt-2 h-3 bg-gray-200 rounded w-32"></div>
            </div>
            
            {/* Unread count skeleton */}
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
          </div>
        </div>)}
    </div>;
};
export default RecentConversationsSkeleton;