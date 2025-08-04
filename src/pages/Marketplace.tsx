import React, { useState, useEffect, useRef } from 'react';
import ModernItemEditForm from '../components/EditProduct';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useProductStore } from '../store/productStore';
import MarketplaceSEOHead from '../components/MarketPlaceSEOHead';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  MapPin,
  X,
  Heart,
  MessageCircle,
  ShoppingCart,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Expand,
  Loader,
  SlidersHorizontal,
  Check,
  Bookmark,
  ArrowUpDown,
  Sparkles,
  Plus,
} from 'lucide-react';
import { productService } from '../services/productService';
import { useChatStore } from '../store/chatStore';
import { Product } from '../store/productStore';

const FadeIn = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) => {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return (
    <div
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {children}
    </div>
  )
}
interface ImageGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
  productTitle: string
}
const ImageGalleryModal = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productTitle,
}: ImageGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const imageRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setIsZoomed(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, initialIndex])
  useEffect(() => {
    interface KeyboardEvent {
      key: string
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isOpen) return
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex])
  const goToPrevious = () => {
    setIsLoading(true)
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setIsZoomed(false)
  }
  const goToNext = () => {
    setIsLoading(true)
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
  }
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    if (isLeftSwipe) {
      goToNext()
    }
    if (isRightSwipe) {
      goToPrevious()
    }
    setTouchStart(0)
    setTouchEnd(0)
  }
  const handleImageLoad = () => {
    setIsLoading(false)
  }
  if (!isOpen || !images?.length) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/95 dark:bg-black/98 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 dark:from-black/70 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="text-white">
            <h3 className="font-semibold text-lg truncate">{productTitle}</h3>
            <p className="text-sm text-gray-300 dark:text-gray-400">
              {currentIndex + 1} of {images.length}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white transition-colors duration-200"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Main Image */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4 pt-20 pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative max-w-full max-h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            ref={imageRef}
            src={images[currentIndex]}
            alt={`${productTitle} - Image ${currentIndex + 1}`}
            className={`max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onClick={() => setIsZoomed(!isZoomed)}
            onLoad={handleImageLoad}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/800/600'
              setIsLoading(false)
            }}
          />
        </div>
      </div>
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 dark:from-black/70 to-transparent">
          <div className="flex items-center justify-center p-4 space-x-2 overflow-x-auto scrollbar-hide">
            {images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsZoomed(false)
                  setIsLoading(true)
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex
                    ? 'border-white dark:border-gray-200 scale-110 shadow-lg'
                    : 'border-white/30 dark:border-gray-500/50 hover:border-white/60 dark:hover:border-gray-400/70'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement, Event>,
                  ) => {
                    (e.target as HTMLImageElement).src =
                      '/api/placeholder/64/64'
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
// Enhanced Product Card Component
const ProductCard = ({
  product,
  onEdit,
  onDelete,
  currentUserId = null,
}: {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  currentUserId?: string | null
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const navigate = useNavigate()
  const [isContactingSeller, setIsContactingSeller] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const user = useUserStore((state) => state.user)
  const { startMessaging, chats } = useChatStore()
  const [imageError, setImageError] = useState<{
    [key: number]: boolean
  }>({})
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isOwner = currentUserId === product.sellerId
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : ['/api/placeholder/400/400']
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price)
  }
  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'good':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'used':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    }
  }
  useEffect(() => {
    // Start auto-advance when hovering
    if (isHovering && productImages.length > 1) {
      autoAdvanceTimerRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
      }, 3000)
    }
    // Clear timer when not hovering
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current)
      }
    }
  }, [isHovering, productImages.length])
  const handleImageError = (imageIndex: number) => {
    setImageError((prev) => ({
      ...prev,
      [imageIndex]: true,
    }))
    setIsImageLoading(false)
  }
  const handleImageLoad = () => {
    setIsImageLoading(false)
  }
  const goToNextImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setIsImageLoading(true)
    setCurrentImageIndex((prev) =>
      prev < productImages.length - 1 ? prev + 1 : 0,
    )
  }
  const goToPreviousImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setIsImageLoading(true)
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : productImages.length - 1,
    )
  }
  const openGallery = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setIsGalleryOpen(true)
  }
  const isOwnProduct = user?.userId === product.sellerId
  const handleContactSeller = async (sellerId: string) => {
    if (!user) {
      navigate('/login')
      return
    }
    if (isOwnProduct) {
      // Shouldn't happen, but just in case
      return
    }
    setIsContactingSeller(true)
    setError(null) // Clear any previous errors
    try {
      // Check if conversation already exists
      const existingChat = chats.find((chat) => {
        const members = Object.keys(chat.state.members || {})
        return members.includes(user.userId) && members.includes(sellerId)
      })
      if (existingChat) {
        navigate(`/chat/${existingChat.id}`)
      } else {
        const chatId = await startMessaging([sellerId])
        navigate(`/chat/${chatId}`)
      }
    } catch (error) {
      console.error('Error creating/getting chat:', error)
      setError('Failed to start conversation. Please try again.')
      // Show error message to user
      setTimeout(() => {
        setError(null)
      }, 5000)
    } finally {
      setIsContactingSeller(false)
    }
  }
  return (
    <>
      <div
        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Image Container */}
        <div
          ref={imageContainerRef}
          className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900"
        >
          {/* Loading indicator */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={
              imageError[currentImageIndex]
                ? '/api/placeholder/400/400'
                : productImages[currentImageIndex]
            }
            alt={product.title}
            className={`w-full h-full object-cover transition-all duration-500 ${isHovering ? 'scale-110' : 'scale-100'} ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={() => handleImageError(currentImageIndex)}
            onLoad={handleImageLoad}
          />
          {/* Image Navigation Overlay */}
          <div
            className={`absolute inset-0 transition-all duration-300 ${isHovering ? 'bg-black/20' : 'bg-black/0'}`}
          >
            {/* Image Count Indicator */}
            {productImages.length > 1 && (
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full z-10 transition-opacity duration-300">
                {currentImageIndex + 1}/{productImages.length}
              </div>
            )}
            {/* Navigation Arrows - Show on hover */}
            {productImages.length > 1 && (
              <div
                className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
              >
                <button
                  onClick={goToPreviousImage}
                  className="w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-700 transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                </button>
                <button
                  onClick={goToNextImage}
                  className="w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-700 transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                </button>
              </div>
            )}
            {/* Expand Button */}
            <button
              onClick={openGallery}
              className={`absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-700 transform hover:scale-110 transition-all duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
              aria-label="View full gallery"
            >
              <Expand className="w-4 h-4 text-gray-800 dark:text-gray-200" />
            </button>
          </div>
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 shadow-md transition-all duration-200 z-10"
            aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
            />
          </button>
          {/* Condition Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getConditionColor(product.condition)}`}
            >
              {product.condition}
            </span>
          </div>
          {/* Price Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1 bg-indigo-600 dark:bg-indigo-600 text-white rounded-full text-sm font-semibold shadow-md">
              {formatPrice(product.price)}
            </span>
          </div>
          {/* Image Indicators */}
          {productImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsImageLoading(true)
                    setCurrentImageIndex(index)
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-white w-4 scale-110'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                  aria-current={index === currentImageIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3
            onClick={() => navigate(`/product/${product.slug}`)}
            className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 text-lg mb-2 line-clamp-2 transition-colors duration-200"
          >
            {product.title}
          </h3>
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
            {product.description}
          </p>
          {/* Seller Info */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={product?.sellerAvatar || '/api/placeholder/32/32'}
              alt={product?.sellerName || 'Seller'}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {product?.sellerName || 'Unknown Seller'}
              </p>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {product?.sellerRating || 'N/A'}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  •
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {product?.sellerCampus || product.school}
                </span>
              </div>
            </div>
          </div>
          {/* Category and School */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {product.school}
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              {product.category}
            </span>
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-2 mt-auto">
            {isOwner ? (
              <>
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="px-4 py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex-1 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  onClick={() => navigate(`/buy/${product.id}`)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
                <button
                  onClick={() => handleContactSeller(product.sellerId)}
                  disabled={isContactingSeller}
                  className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors duration-200"
                >
                  {isContactingSeller ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={productImages}
        initialIndex={currentImageIndex}
        productTitle={product.title}
      />
    </>
  )
}
// Filter Sheet Component (Mobile)
const FilterSheet = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  categories,
  schools,
}: {
  isOpen: boolean
  onClose: () => void
  filters: {
    category: string
    school: string
    minPrice: string
    maxPrice: string
    condition: string
  }
  onFiltersChange: (filters: {
    category: string
    school: string
    minPrice: string
    maxPrice: string
    condition: string
  }) => void
  categories: string[]
  schools: string[]
}) => {
  if (!isOpen) return null
  const conditions = ['All', 'New', 'Good', 'Used']
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <SlidersHorizontal className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            Filters
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                category: e.target.value,
              })
            }
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat: string) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {/* Condition Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Condition
          </label>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition) => (
              <button
                key={condition}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    condition:
                      condition === 'All' ? '' : condition.toLowerCase(),
                  })
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (condition === 'All' && !filters.condition) ||
                  (condition !== 'All' &&
                    filters.condition === condition.toLowerCase())
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>
        {/* School Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            School
          </label>
          <select
            value={filters.school}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                school: e.target.value,
              })
            }
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500"
          >
            <option value="">All Schools</option>
            {schools.map((school: string) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>
        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Price Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minPrice: e.target.value,
                })
              }
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxPrice: e.target.value,
                })
              }
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() =>
              onFiltersChange({
                category: '',
                school: '',
                minPrice: '',
                maxPrice: '',
                condition: '',
              })
            }
            className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
// Main Marketplace Component
const MarketplaceUI = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    school: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
  })
  const [categories, setCategories] = useState<string[]>([])
  const [schools, setSchools] = useState<string[]>([])
  const [showEditForm, setShowEditForm] = useState(false)
  const [deleteConfirmProduct, setDeleteConfirmProduct] =
    useState<Product | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  // Get state from stores
  const { products, loading, error } = useProductStore()
  const user = useUserStore((state) => state.user)
  const currentUserId = user?.userId
  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await productService.fetchProducts()
      } catch (error) {
        console.error('Failed to load products:', error)
      }
    }
    loadProducts()
  }, [])
  // Count active filters
  useEffect(() => {
    let count = 0
    if (filters.category) count++
    if (filters.school) count++
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.condition) count++
    setActiveFiltersCount(count)
  }, [filters])
  const handleDeleteRequest = (product: Product) => {
    setDeleteConfirmProduct(product)
  }
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmProduct) return
    setDeleteLoading(true)
    try {
      await productService.deleteProduct(deleteConfirmProduct.id)
      setDeleteConfirmProduct(null) // Close modal on success
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setDeleteLoading(false)
    }
  }
  const handleDeleteCancel = () => {
    setDeleteConfirmProduct(null)
  }
  const clearAllFilters = () => {
    setFilters({
      category: '',
      school: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
    })
    setSearchTerm('')
  }
  // Extract unique categories and schools from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [
        ...new Set(products.map((p) => p.category)),
      ].filter(Boolean)
      const uniqueSchools = [...new Set(products.map((p) => p.school))].filter(
        Boolean,
      )
      setCategories(uniqueCategories)
      setSchools(uniqueSchools)
    }
  }, [products])
  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        !filters.category || product.category === filters.category
      const matchesSchool = !filters.school || product.school === filters.school
      const matchesMinPrice =
        !filters.minPrice || product.price >= parseFloat(filters.minPrice)
      const matchesMaxPrice =
        !filters.maxPrice || product.price <= parseFloat(filters.maxPrice)
      const matchesCondition =
        !filters.condition ||
        product.condition.toLowerCase() === filters.condition.toLowerCase()
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSchool &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesCondition
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          return 0
      }
    })
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Loading products...
          </p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to load products
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => productService.fetchProducts()}
            className="px-6 py-3 bg-indigo-600 dark:bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  if (showEditForm && selectedProduct) {
    return (
      <ModernItemEditForm
        productData={selectedProduct}
        onCancel={() => setShowEditForm(false)}
        onSuccess={() => setShowEditForm(false)}
      />
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <MarketplaceSEOHead
        products={filteredProducts}
        searchTerm={searchTerm}
        filters={filters}
        totalCount={filteredProducts.length}
      />
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Marketplace
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() =>
                  setViewMode(viewMode === 'grid' ? 'list' : 'grid')
                }
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                aria-label={
                  viewMode === 'grid'
                    ? 'Switch to list view'
                    : 'Switch to grid view'
                }
              >
                {viewMode === 'grid' ? (
                  <List className="w-5 h-5" />
                ) : (
                  <Grid className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {/* Sort and Filter Controls */}
          <div className="flex space-x-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ArrowUpDown className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center space-x-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white relative"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-xs flex items-center justify-center rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Desktop Filters */}
        <div className="hidden lg:block mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {/* School Filter */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  School
                </label>
                <select
                  value={filters.school}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      school: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Schools</option>
                  {schools.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
              {/* Condition Filter */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Condition
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      condition: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Any Condition</option>
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="used">Used</option>
                </select>
              </div>
              {/* Price Range */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minPrice: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                  />
                  <span className="text-gray-400 dark:text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxPrice: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.category && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                Category: {filters.category}
                <button
                  onClick={() => setFilters({ ...filters, category: '' })}
                  className="ml-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {filters.school && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                School: {filters.school}
                <button
                  onClick={() => setFilters({ ...filters, school: '' })}
                  className="ml-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {filters.condition && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                Condition: {filters.condition}
                <button
                  onClick={() => setFilters({ ...filters, condition: '' })}
                  className="ml-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                Price: {filters.minPrice ? `₦${filters.minPrice}` : '₦0'} -{' '}
                {filters.maxPrice ? `₦${filters.maxPrice}` : 'Any'}
                <button
                  onClick={() =>
                    setFilters({ ...filters, minPrice: '', maxPrice: '' })
                  }
                  className="ml-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Showing{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {filteredProducts.length}
            </span>{' '}
            of{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {products.length}
            </span>{' '}
            products
          </p>
          {/* Featured Products Toggle - Could be implemented in the future */}
          <button className="hidden md:flex items-center space-x-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            <Sparkles className="w-4 h-4" />
            <span>Featured First</span>
          </button>
        </div>
        {/* Products Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {filteredProducts.map((product, index) => (
            <FadeIn key={product.id} delay={index * 50}>
              <ProductCard
                product={product}
                onDelete={handleDeleteRequest}
                currentUserId={currentUserId}
                onEdit={(product) => {
                  setSelectedProduct(product)
                  setShowEditForm(true)
                }}
              />
            </FadeIn>
          ))}
        </div>
        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 mx-auto bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find any products matching your current filters. Try
              adjusting your search criteria or browse all products.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
      {/* Mobile Filter Sheet */}
      <FilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        schools={schools}
      />
      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          />
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-md w-full mx-4">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              Delete Item
            </h3>
            {/* Message */}
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                "{deleteConfirmProduct.title}"
              </span>
              ? This action cannot be undone.
            </p>
            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating "Add Product" Button */}
      {user && (user.role === 'seller' || user.role === 'both') && (
        <Link
          to="/sell"
          className="fixed right-6 bottom-6 w-14 h-14 bg-indigo-600 dark:bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-20"
        >
          <Plus className="w-6 h-6" />
          <span className="sr-only">Add Product</span>
        </Link>
      )}
    </div>
  )
}
export default MarketplaceUI

