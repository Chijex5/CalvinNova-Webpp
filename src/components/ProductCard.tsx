import React, { useState, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../store/productStore';
import { HeartIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { FadeIn } from '../utils/animations';
interface ProductCardProps {
  product: Product;
  delay?: number;
}
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  delay = 0
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
  };
  return <FadeIn direction="up" delay={delay} duration={0.4}>
      <Link to={`/product/${product.slug}`} className="group block" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[1.02] hover:border-transparent dark:hover:border-transparent h-full flex flex-col">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 relative">
            <img src={product.images[currentImageIndex]} alt={product.slug} className="h-48 w-full object-cover object-center transition-all duration-300 group-hover:opacity-95 group-hover:scale-105" loading="lazy" />
            {/* Image navigation controls - only show when hovering and there are multiple images */}
            {product.images.length > 1 && isHovering && <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-800" aria-label="Previous image">
                  <ChevronLeftIcon size={16} className="text-gray-700 dark:text-gray-300" />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-800" aria-label="Next image">
                  <ChevronRightIcon size={16} className="text-gray-700 dark:text-gray-300" />
                </button>
              </>}
            {/* Image indicators */}
            {product.images.length > 1 && <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
                {product.images.map((_, index) => <span key={index} className={`block h-1.5 rounded-full transition-all duration-200 ${currentImageIndex === index ? 'w-4 bg-white dark:bg-gray-200' : 'w-1.5 bg-white/60 dark:bg-gray-300/60'}`} />)}
              </div>}
            <button className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
              <HeartIcon size={18} />
            </button>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                {product.title}
              </h3>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-200">
                {formatPrice(product.price)}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 flex-grow">
              {product.description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
                {product.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{product.school}</span>
            </div>
          </div>
        </div>
      </Link>
    </FadeIn>;
};
export default ProductCard;