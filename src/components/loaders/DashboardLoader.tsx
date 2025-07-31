const ListingSkeleton = ({
  type = 'activeListings',
  // 'activeListings' or 'nearbyListings'
  count = 4,
  className = ''
}) => {
  // Active listings skeleton (list format)
  const ActiveListingsSkeleton = () => <div className={`divide-y divide-gray-100 ${className}`}>
      {Array(count).fill(0).map((_, index) => <div key={index} className="p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="flex items-center space-x-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>)}
    </div>;

  // Nearby listings skeleton (grid format)
  const NearbyListingsSkeleton = () => <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {Array(count).fill(0).map((_, index) => <div key={index} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>)}
    </div>;

  // Render based on type
  if (type === 'activeListings') {
    return <ActiveListingsSkeleton />;
  }
  if (type === 'nearbyListings') {
    return <NearbyListingsSkeleton />;
  }
  return null;
};
export default ListingSkeleton;