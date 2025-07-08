import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
interface Category {
  id: string;
  name: string;
}
interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}
const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const {
        current
      } = scrollRef;
      const scrollAmount = 200;
      if (direction === 'left') {
        current.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      } else {
        current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const {
        current
      } = scrollRef;
      setShowLeftArrow(current.scrollLeft > 0);
      setShowRightArrow(current.scrollLeft < current.scrollWidth - current.clientWidth - 10);
    }
  };
  useEffect(() => {
    const {
      current
    } = scrollRef;
    if (current) {
      current.addEventListener('scroll', checkScrollPosition);
      // Check on resize too
      window.addEventListener('resize', checkScrollPosition);
      // Initial check
      checkScrollPosition();
    }
    return () => {
      if (current) {
        current.removeEventListener('scroll', checkScrollPosition);
      }
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);
  return <div className="relative">
      {showLeftArrow && <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100" aria-label="Scroll left">
          <ChevronLeftIcon size={20} />
        </button>}
      <div ref={scrollRef} className="flex space-x-2 overflow-x-auto scrollbar-hide py-2 px-1" style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
        <button onClick={() => onSelectCategory(null)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          All Categories
        </button>
        {categories.map(category => <button key={category.id} onClick={() => onSelectCategory(category.id)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {category.name}
          </button>)}
      </div>
      {showRightArrow && <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100" aria-label="Scroll right">
          <ChevronRightIcon size={20} />
        </button>}
    </div>;
};
export default CategoryFilter;