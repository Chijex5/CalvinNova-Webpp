import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import { SearchIcon, FilterIcon, SlidersIcon, XIcon } from 'lucide-react';
import { useMockProducts } from '../utils/mockData';
import { FadeIn } from '../utils/animations';
import Button from '../components/Button';
const Marketplace = () => {
  const {
    products,
    categories,
    schools
  } = useMockProducts();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [sortBy, setSortBy] = useState<string>('newest');
  useEffect(() => {
    let result = products;
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    if (selectedSchool) {
      result = result.filter(product => product.school === selectedSchool);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query));
    }
    // Filter by price range
    result = result.filter(product => product.price >= priceRange[0] && product.price <= priceRange[1]);
    // Sort results
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }
    setFilteredProducts(result);
  }, [products, selectedCategory, selectedSchool, searchQuery, priceRange, sortBy]);
  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSchool(null);
    setSearchQuery('');
    setPriceRange([0, 1500]);
    setSortBy('newest');
  };
  return <div className="container mx-auto px-4 py-8">
      <FadeIn direction="up">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Marketplace</h1>
        {/* Search bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={20} className="text-gray-400" />
          </div>
          <input type="text" placeholder="Search for items..." className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </FadeIn>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters (desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button onClick={clearAllFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                Clear All
              </button>
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Categories
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input id="all-categories" type="radio" name="category" checked={selectedCategory === null} onChange={() => setSelectedCategory(null)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label htmlFor="all-categories" className="ml-2 text-sm text-gray-700">
                    All Categories
                  </label>
                </div>
                {categories.map(category => <div key={category.id} className="flex items-center">
                    <input id={`category-${category.id}`} type="radio" name="category" checked={selectedCategory === category.id} onChange={() => setSelectedCategory(category.id)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                      {category.name}
                    </label>
                  </div>)}
              </div>
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-700 mb-2">School</h4>
              <select className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={selectedSchool || ''} onChange={e => setSelectedSchool(e.target.value === '' ? null : e.target.value)}>
                <option value="">All Schools</option>
                {schools.map(school => <option key={school} value={school}>
                    {school}
                  </option>)}
              </select>
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Price Range
              </h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">${priceRange[0]}</span>
                <span className="text-xs text-gray-500">${priceRange[1]}</span>
              </div>
              <input type="range" min="0" max="1500" step="10" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Sort By
              </h4>
              <select className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex-1">
          {/* Mobile filter toggle */}
          <FadeIn direction="up" delay={0.1}>
            <div className="md:hidden flex justify-between items-center mb-4">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                <FilterIcon size={18} className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <select className="p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </FadeIn>
          {/* Category filter (scrollable) */}
          <FadeIn direction="up" delay={0.2}>
            <div className="mb-6 md:hidden">
              <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            </div>
          </FadeIn>
          {/* Mobile filters */}
          {showFilters && <FadeIn direction="up" delay={0.1}>
              <div className="mb-6 p-5 border border-gray-200 rounded-xl bg-white shadow-sm md:hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                    <XIcon size={18} />
                  </button>
                </div>
                <div className="mb-4">
                  <label htmlFor="school-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    School
                  </label>
                  <select id="school-mobile" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={selectedSchool || ''} onChange={e => setSelectedSchool(e.target.value === '' ? null : e.target.value)}>
                    <option value="">All Schools</option>
                    {schools.map(school => <option key={school} value={school}>
                        {school}
                      </option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <input type="range" min="0" max="1500" step="10" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </FadeIn>}
          {/* Product grid */}
          {filteredProducts.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} delay={0.05 * (index % 6)} />)}
            </div> : <FadeIn direction="up">
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon size={24} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  No items found
                </h3>
                <p className="text-gray-500 mb-6">
                  We couldn't find any items matching your criteria.
                </p>
                <Button variant="primary" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              </div>
            </FadeIn>}
        </div>
      </div>
    </div>;
};
export default Marketplace;