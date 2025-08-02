import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import SEOHead from '../components/SEOHead';
import ProductDetailSkeleton from '../components/loaders/ProductDetsilSkeleton';
import { MessageSquareIcon, HeartIcon, ShareIcon, FlagIcon, ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon, MapPinIcon, CalendarIcon, EyeIcon } from 'lucide-react';
import { useProductStore, Product } from '../store/productStore';
import { getDominantColor } from '../functions/getDominantColour';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useChatStore } from '../store/chatStore';

const ProductDetails = () => {
  const {
    slug
  } = useParams();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();

  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactingSeller, setIsContactingSeller] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [currentColor, setCurrentColor] = useState<{dominant: string, sub:string, isDark:boolean}>({dominant: '#000000', sub: '#000000', isDark: false});

  // Store hooks
  const {
    products,
    loading: productsLoading,
    error: productError
  } = useProductStore();
  const {
    startMessaging,
    chats,
    error: chatError,
    setError: setChatError
  } = useChatStore();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  // Find similar products based on category
  const findSimilarProducts = useCallback((currentProduct: Product, allProducts: Product[]) => {
    if (!currentProduct || !allProducts.length) return [];
    
    const similar = allProducts
      .filter(p => 
        p.id !== currentProduct.id && // Exclude current product
        p.category === currentProduct.category && // Same category
        p.sellerId !== currentProduct.sellerId // Different seller for variety
      )
      .sort((a, b) => {
        // Sort by relevance: price similarity, then recency
        const priceDiffA = Math.abs(a.price - currentProduct.price);
        const priceDiffB = Math.abs(b.price - currentProduct.price);
        
        if (priceDiffA !== priceDiffB) {
          return priceDiffA - priceDiffB;
        }
        
        // If price difference is similar, sort by most recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 6); // Show max 6 similar products
      
    return similar;
  }, []);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLocalError(null);

        // If products are not loaded yet, load them
        if (!products.length && !productsLoading) {
          await productService.fetchProducts();
        }

        // Find product by slug
        const foundProduct = products.find(p => p.slug === slug);
        if (!foundProduct && products.length > 0) {
          setLocalError('Product not found');
        } else if (foundProduct) {
          setProduct(foundProduct);
          const dominantColour = await getDominantColor(foundProduct.images[0]);
          setCurrentColor(dominantColour);
          console.log('dominant Colour', dominantColour)
          // Find similar products
          const similar = findSimilarProducts(foundProduct, products);
          setSimilarProducts(similar);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        setLocalError('Failed to load product');
      }
    };
    if (slug) {
      loadProduct();
    }
  }, [slug, products, productsLoading, user?.userId, findSimilarProducts]);

  // Image navigation handlers
  const nextImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
  }, [product?.images?.length]);
  const prevImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
  }, [product?.images?.length]);

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyPress = e => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextImage, prevImage]);

  // Contact seller handler
  const handleContactSeller = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnTo: `/product/${slug}`
        }
      });
      return;
    }
    if (isOwnProduct) return;
    setIsContactingSeller(true);
    setChatError(null);
    try {
      const sellerId = product?.sellerId;

      // Check for existing conversation
      if (!sellerId) return;
      const existingChat = chats.find(chat => {
        const members = Object.keys(chat.state.members || {});
        return members.includes(user.userId) && members.includes(sellerId);
      });
      if (existingChat) {
        navigate(`/chat/${existingChat.id}`);
      } else {
        // Create new conversation
        const chatId = await startMessaging([sellerId]);
        navigate(`/chat/${chatId}`);
      }
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      setChatError('Failed to start conversation. Please try again.');
      setTimeout(() => setChatError(null), 5000);
    } finally {
      setIsContactingSeller(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          returnTo: `/product/${slug}`
        }
      });
      return;
    }
    try {
      setIsFavorited(prev => !prev);
      // Here you would call your API to toggle favorite
      // await productService.toggleFavorite(product.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      setIsFavorited(prev => !prev); // Revert on error
    }
  };

  // Share product
  const handleShare = async () => {
    const shareData = {
      title: product?.title,
      text: `Check out this ${product?.category} for ${formatPrice(product?.price || 0)}: ${product?.title}`,
      url: window.location.href
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // You might want to show a toast notification here
        alert('Product link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  // Report product
  const handleReport = () => {
    // Navigate to report page or open modal
    navigate(`/report/product/${slug}`);
  };

  // Calculate derived values
  const isOwnProduct = user?.userId === product?.sellerId;
  const displayError = localError || productError || chatError;

  // Loading state
  if (productsLoading) {
    return <ProductDetailSkeleton />;
  }

  // Error state
  if (displayError || !product) {
    return <div className="container mx-auto px-4 py-12">
        <Link to="/marketplace" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ChevronLeftIcon size={16} />
          <span className="ml-1">Back to Marketplace</span>
        </Link>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {localError === 'Product not found' ? 'Product Not Found' : 'Something went wrong'}
          </h2>
          <p className="mb-6 text-gray-600">
            {localError === 'Product not found' ? "The product you're looking for doesn't exist or has been removed." : displayError || 'Unable to load product details. Please try again.'}
          </p>
          <div className="space-x-4">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Link to="/marketplace">
              <Button variant="secondary">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>;
  }

  // Similar Product Card Component
  const SimilarProductCard = ({ product: similarProduct }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <Link 
        to={`/product/${similarProduct.slug}`}
        className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
          <img
            src={imageError ? '/placeholder-image.jpg' : similarProduct.images[0]}
            alt={similarProduct.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
              {similarProduct.condition}
            </span>
          </div>
          {similarProduct.sellerId !== product?.sellerId && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                Different Seller
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {similarProduct.title}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(similarProduct.price)}
            </p>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <EyeIcon size={12} className="mr-1" />
              {similarProduct.views || 0}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 truncate">
              {similarProduct.sellerName}
            </span>
            {similarProduct.school && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <MapPinIcon size={10} className="mr-1" />
                {similarProduct.school}
              </span>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Listed {new Date(similarProduct.createdAt).toLocaleDateString()}
          </div>
        </div>
      </Link>
    );
  };

  return <div className="container mx-auto px-4 py-6 dark:bg-gray-900">
    <SEOHead product={product} />
      {/* Breadcrumb navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/marketplace" className="hover:text-blue-600 dark:hover:text-blue-400">
          Marketplace
        </Link>
        <span>›</span>
        <Link to={`/marketplace?category=${product.category}`} className="hover:text-blue-600 dark:hover:text-blue-400">
          {product.category}
        </Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-gray-100">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="relative">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square">
            <img 
              src={product.images[currentImageIndex]} 
              alt={`${product.title} - ${product.condition} condition for sale by ${product.sellerName} - Image ${currentImageIndex + 1} of ${product.images.length}`}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" 
              loading={currentImageIndex === 0 ? "eager" : "lazy"} // First image loads immediately
              width="600"
              height="600"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }} 
            />
          </div>
          
          {product.images.length > 1 && <>
              <button onClick={prevImage} className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors" aria-label="Previous image">
                <ChevronLeftIcon size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button onClick={nextImage} className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors" aria-label="Next image">
                <ChevronRightIcon size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
              
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 dark:bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            </>}
          
          {/* Thumbnail navigation */}
          {product.images.length > 1 && <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-600/20 dark:ring-blue-400/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover"  loading='lazy' width="64" height="64" />
                </button>)}
            </div>}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex justify-between items-start mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {product.title}
              </h1>
              <div className="flex space-x-1 ml-4">
                <button onClick={handleToggleFavorite} className={`p-2 rounded-full transition-colors ${isFavorited ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`} aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
                  <HeartIcon size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
                <button onClick={handleShare} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" aria-label="Share product">
                  <ShareIcon size={20} />
                </button>
                <button onClick={handleReport} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" aria-label="Report product">
                  <FlagIcon size={20} />
                </button>
              </div>
            </div>

            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30  text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              {product.category}
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
              {product.condition}
            </span>
            {product.school && <span className={`px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-1`}>
                <MapPinIcon size={14} />
                {product.school}
              </span>}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Description</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Product Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 py-3 border-y border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <CalendarIcon size={16} />
              <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon size={16} />
              <span>{product.views || 0} views</span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Seller Information</h3>
            <div className="flex items-center">
              <img src={product.sellerAvatar || '/default-avatar.png'} alt={product.sellerName} className="w-12 h-12 rounded-full mr-3 ring-2 ring-white dark:ring-gray-700 shadow-sm" onError={e => {
              e.target.src = '/default-avatar.png';
            }} />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{product.sellerName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.school}</p>
                {product.sellerRating && <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⭐ {product.sellerRating.toFixed(1)} ({product.sellerRating || 0} reviews)
                  </p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isOwnProduct ? <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" fullWidth onClick={() => navigate(`/product/${slug}/edit`)}>
                  Edit Listing
                </Button>
                <Button variant="danger" fullWidth onClick={() => {
              if (window.confirm('Are you sure you want to delete this listing?')) {
                // Handle delete
              }
            }}>
                  Delete Listing
                </Button>
              </div> : <div className="grid grid-cols-2 gap-3">
                <Button variant="primary" fullWidth icon={<MessageSquareIcon size={18} />} onClick={handleContactSeller} disabled={isContactingSeller} className="py-4">
                  {isContactingSeller ? 'Starting conversation...' : 'Contact Seller'}
                </Button>
                <Button variant="secondary" fullWidth icon={<ShoppingBagIcon size={18} />} onClick={() => navigate(`/buy/${product.id}`)} className={`py-4 ${isFavorited ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                  Buy Now
                </Button>
              </div>}
          </div>

          {/* Error Message */}
          {chatError && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{chatError}</p>
            </div>}
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Similar {product.category} Products
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                More products in this category that might interest you
              </p>
            </div>
            <Link 
              to={`/marketplace?category=${product.category}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center group"
            >
              View All {product.category}
              <ChevronRightIcon size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              <SimilarProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
          
          {similarProducts.length >= 6 && (
            <div className="text-center mt-8">
              <Link to={`/marketplace?category=${product.category}`}>
                <Button variant="secondary" className="px-8">
                  See More {product.category} Products
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* No Similar Products Message */}
      {similarProducts.length === 0 && products.length > 1 && (
        <div className="mt-16 text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            No Similar Products Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't find other {product.category.toLowerCase()} products at the moment.
          </p>
          <Link to="/marketplace">
            <Button variant="primary">
              Browse All Products
            </Button>
          </Link>
        </div>
      )}
    </div>;
};

export default ProductDetails;