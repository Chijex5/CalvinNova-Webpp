import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { ShoppingBagIcon, MessageSquareIcon, DollarSignIcon, ShieldIcon, CheckCircleIcon, StarIcon } from 'lucide-react';
import { useMockProducts } from '../utils/mockData';
import { FadeIn } from '../utils/animations';
import ProductCard from '../components/ProductCard';
const Home = () => {
  const {
    featuredProducts
  } = useMockProducts();
  return <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')] opacity-10 bg-cover bg-center"></div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn direction="up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Buy & Sell on Your Campus with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                  CalvinNova
                </span>
              </h1>
            </FadeIn>
            <FadeIn direction="up" delay={0.1}>
              <p className="text-lg md:text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
                The trusted marketplace for college students to buy and sell
                items directly on campus. Safe, simple, and student-friendly.
              </p>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Link to="/marketplace">
                  <Button variant="accent" size="lg">
                    Browse Items
                  </Button>
                </Link>
                <Link to="/sell">
                  <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
                    Start Selling
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>
      {/* Stats Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <FadeIn direction="up" delay={0.1}>
              <div className="p-4">
                <p className="text-3xl font-bold text-indigo-600">5000+</p>
                <p className="text-gray-600">Active Users</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <div className="p-4">
                <p className="text-3xl font-bold text-indigo-600">12K+</p>
                <p className="text-gray-600">Items Sold</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.3}>
              <div className="p-4">
                <p className="text-3xl font-bold text-indigo-600">50+</p>
                <p className="text-gray-600">Universities</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.4}>
              <div className="p-4">
                <p className="text-3xl font-bold text-indigo-600">4.8/5</p>
                <p className="text-gray-600">User Rating</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
              How CalvinNova Works
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <FadeIn direction="up" delay={0.1}>
              <div className="text-center relative">
                <div className="absolute top-0 right-0 -mr-4 md:mr-0 md:left-full md:translate-x-1/4 text-gray-200 hidden md:block">
                  <svg width="80" height="30" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M80 15C73 10 67 0 40 0C13 0 7 10 0 15" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                    <path d="M70 15L80 10M80 10V20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
                  <ShoppingBagIcon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  List Your Items
                </h3>
                <p className="text-gray-600">
                  Upload photos, set your price, and describe your item in
                  minutes. It's quick and easy to get started.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <div className="text-center relative">
                <div className="absolute top-0 right-0 -mr-4 md:mr-0 md:left-full md:translate-x-1/4 text-gray-200 hidden md:block">
                  <svg width="80" height="30" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M80 15C73 10 67 0 40 0C13 0 7 10 0 15" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                    <path d="M70 15L80 10M80 10V20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-200">
                  <MessageSquareIcon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Chat with Buyers
                </h3>
                <p className="text-gray-600">
                  Connect directly with interested students on your campus
                  through our secure messaging system.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.3}>
              <div className="text-center">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-200">
                  <DollarSignIcon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Complete the Sale
                </h3>
                <p className="text-gray-600">
                  Meet on campus and get paid. Our platform makes transactions
                  safe, simple, and student-friendly.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      {/* Featured Items */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Featured Items
              </h2>
              <Link to="/marketplace" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center group">
                View All
                <svg className="ml-1 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} delay={0.1 * index} />)}
          </div>
        </div>
      </section>
      {/* Trust & Safety */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <FadeIn direction="up">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                <ShieldIcon size={36} className="text-white" />
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.1}>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900">
                Trust & Safety
              </h2>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <p className="text-gray-600 text-lg text-center mb-10">
                CalvinNova is designed with student safety in mind. Our platform
                lets you chat before meeting, verify student profiles, and
                report any issues instantly.
              </p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <FadeIn direction="up" delay={0.3}>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-start mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                      <CheckCircleIcon size={24} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Verified Users</h3>
                      <p className="text-gray-600">
                        All users are verified with their university email to
                        ensure a trusted community.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
              <FadeIn direction="up" delay={0.4}>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-start mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                      <StarIcon size={24} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">User Ratings</h3>
                      <p className="text-gray-600">
                        Check seller ratings and reviews before making a
                        purchase decision.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <FadeIn direction="up" delay={0.5}>
              <div className="text-center">
                <Link to="/marketplace">
                  <Button variant="primary" size="lg">
                    Start Browsing
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn direction="up">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to buy or sell on campus?
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already using CalvinNova to buy
              and sell items on campus.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/marketplace">
                <Button variant="accent" size="lg">
                  Browse Marketplace
                </Button>
              </Link>
              <Link to="/sell">
                <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
                  List an Item
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>;
};
export default Home;