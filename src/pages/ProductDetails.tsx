import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ProductDetailSkeleton from '../components/loaders/ProductDetsilSkeleton';
import { 
  MessageSquareIcon, 
  HeartIcon, 
  ShareIcon, 
  FlagIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon
} from 'lucide-react';
import { useProductStore, Product } from '../store/productStore';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useChatStore } from '../store/chatStore';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactingSeller, setIsContactingSeller] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Store hooks
  const { products, loading: productsLoading, error: productError } = useProductStore();
  const { startMessaging, chats, error: chatError, setError: setChatError } = useChatStore();const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };



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
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        setLocalError('Failed to load product');
      }
    };

    if (slug) {
      loadProduct();
    }
  }, [slug, products, productsLoading, user?.userId]);

  // Image navigation handlers
  const nextImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  }, [product?.images?.length]);

  const prevImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  }, [product?.images?.length]);

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextImage, prevImage]);

  // Contact seller handler
  const handleContactSeller = async () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/product/${slug}` } });
      return;
    }

    if (isOwnProduct) return;

    setIsContactingSeller(true);
    setChatError(null);

    try {
      const sellerId = product?.sellerId;
      
      // Check for existing conversation
     if (!sellerId)  return;
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
      navigate('/login', { state: { returnTo: `/product/${slug}` } });
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
    return (
      <div className="container mx-auto px-4 py-12">
        <Link 
          to="/marketplace" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeftIcon size={16} />
          <span className="ml-1">Back to Marketplace</span>
        </Link>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {localError === 'Product not found' ? 'Product Not Found' : 'Something went wrong'}
          </h2>
          <p className="mb-6 text-gray-600">
            {localError === 'Product not found' 
              ? "The product you're looking for doesn't exist or has been removed."
              : displayError || 'Unable to load product details. Please try again.'
            }
          </p>
          <div className="space-x-4">
            <Button 
              variant="primary" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Link to="/marketplace">
              <Button variant="secondary">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/marketplace" className="hover:text-blue-600">
          Marketplace
        </Link>
        <span>›</span>
        <Link to={`/marketplace?category=${product.category}`} className="hover:text-blue-600">
          {product.category}
        </Link>
        <span>›</span>
        <span className="text-gray-900">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="relative">
          <div className="bg-gray-50 rounded-lg overflow-hidden aspect-square">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.title}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg'; // Fallback image
              }}
            />
          </div>
          
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRightIcon size={20} />
              </button>
              
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            </>
          )}
          
          {/* Thumbnail navigation */}
          {product.images.length > 1 && (
            <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-blue-600 ring-2 ring-blue-600/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex justify-between items-start mb-3">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>
              <div className="flex space-x-1 ml-4">
                <button 
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorited 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                  }`}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <HeartIcon size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Share product"
                >
                  <ShareIcon size={20} />
                </button>
                <button 
                  onClick={handleReport}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Report product"
                >
                  <FlagIcon size={20} />
                </button>
              </div>
            </div>

            <p className="text-3xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {product.category}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {product.condition}
            </span>
            {product.school && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1">
                <MapPinIcon size={14} />
                {product.school}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Product Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 py-3 border-y border-gray-200">
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
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-900">Seller Information</h3>
            <div className="flex items-center">
              <img 
                src={product.sellerAvatar || '/default-avatar.png'} 
                alt={product.sellerName}
                className="w-12 h-12 rounded-full mr-3 ring-2 ring-white shadow-sm"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div>
                <p className="font-medium text-gray-900">{product.sellerName}</p>
                <p className="text-sm text-gray-600">{product.school}</p>
                {product.sellerRating && (
                  <p className="text-sm text-yellow-600">
                    ⭐ {product.sellerRating.toFixed(1)} ({product.sellerRating || 0} reviews)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isOwnProduct ? (
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="secondary" 
                  fullWidth
                  onClick={() => navigate(`/product/${slug}/edit`)}
                >
                  Edit Listing
                </Button>
                <Button 
                  variant="danger" 
                  fullWidth
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this listing?')) {
                      // Handle delete
                    }
                  }}
                >
                  Delete Listing
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                fullWidth 
                size="lg"
                icon={<MessageSquareIcon size={18} />}
                onClick={handleContactSeller}
                disabled={isContactingSeller}
                className="py-4"
              >
                {isContactingSeller ? 'Starting conversation...' : 'Contact Seller'}
              </Button>
            )}
          </div>

          {/* Error Message */}
          {chatError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{chatError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
        {/* You can add a RelatedProducts component here */}
      </div>
    </div>
  );
};

export default ProductDetails;