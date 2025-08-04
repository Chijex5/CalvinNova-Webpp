// Create a marketplace SEO component
import { useEffect } from 'react';
import { Product } from '../store/productStore';

interface MarketplaceSEOHeadProps {
  products: Product[];
  searchTerm?: string;
  filters?: {
    category: string;
    school: string;
    minPrice: string;
    maxPrice: string;
    condition: string;
  };
  totalCount?: number;
}

const MarketplaceSEOHead = ({ 
  products, 
  searchTerm = '', 
  filters = {
    category: '',
    school: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
  },
  totalCount = 0 
}: MarketplaceSEOHeadProps) => {
  useEffect(() => {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(price);
    };

    // Generate dynamic page title based on filters and search
    const generatePageTitle = () => {
      let title = 'CalvinNova Marketplace - Buy & Sell Student Items';
      
      if (searchTerm) {
        title = `${searchTerm} - Search Results | CalvinNova Marketplace`;
      } else if (filters.category && filters.school) {
        title = `${filters.category} in ${filters.school} | CalvinNova Marketplace`;
      } else if (filters.category) {
        title = `${filters.category} Products | CalvinNova Marketplace`;
      } else if (filters.school) {
        title = `Products at ${filters.school} | CalvinNova Marketplace`;
      } else if (filters.condition) {
        title = `${filters.condition.charAt(0).toUpperCase() + filters.condition.slice(1)} Products | CalvinNova Marketplace`;
      }
      
      return title;
    };

    // Generate meta description
    const generateDescription = () => {
      const activeProducts = products.length;
      let description = `Discover ${activeProducts} amazing products on CalvinNova Marketplace - Nigeria's premier student marketplace. `;
      
      if (searchTerm) {
        description += `Find the best deals on "${searchTerm}" from verified student sellers across Nigerian universities.`;
      } else if (filters.category && filters.school) {
        description += `Shop ${filters.category.toLowerCase()} products from students at ${filters.school}. Safe, affordable, and convenient.`;
      } else if (filters.category) {
        description += `Browse our collection of ${filters.category.toLowerCase()} items from student sellers nationwide.`;
      } else if (filters.school) {
        description += `Connect with student sellers at ${filters.school}. Buy and sell textbooks, electronics, furniture and more.`;
      } else {
        description += `Buy and sell textbooks, electronics, furniture, and more. Connect with students nationwide for the best deals.`;
      }
      
      return description.substring(0, 160);
    };

    // Generate keywords
    const generateKeywords = () => {
      const baseKeywords = [
        'student marketplace',
        'buy sell students',
        'university marketplace',
        'student items',
        'textbooks',
        'student electronics',
        'Nigeria student market'
      ];

      if (searchTerm) {
        baseKeywords.unshift(searchTerm);
      }
      if (filters.category) {
        baseKeywords.unshift(filters.category.toLowerCase());
      }
      if (filters.school) {
        baseKeywords.unshift(filters.school);
      }

      // Add price range keywords if filters exist
      if (filters.minPrice || filters.maxPrice) {
        baseKeywords.push('affordable student items', 'cheap student products');
      }

      return baseKeywords.join(', ');
    };

    // Update page title
    document.title = generatePageTitle();

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', generateDescription());
    updateMetaTag('keywords', generateKeywords());

    // Open Graph tags
    const ogTitle = searchTerm 
      ? `Find "${searchTerm}" on CalvinNova Marketplace`
      : filters.category 
        ? `${filters.category} Products - CalvinNova Marketplace`
        : 'CalvinNova Marketplace - Student Buy & Sell Platform';
    
    updateMetaTag('og:title', ogTitle, 'property');
    updateMetaTag('og:description', generateDescription(), 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:url', window.location.href, 'property');
    updateMetaTag('og:site_name', 'CalvinNova Marketplace', 'property');
    
    // Use a default marketplace image or the first product's image
    const ogImage = products.length > 0 && products[0].images.length > 0
      ? products[0].images[0]
      : '/api/placeholder/1200/630'; // Default marketplace banner
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:image:width', '1200', 'property');
    updateMetaTag('og:image:height', '630', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', ogTitle, 'name');
    updateMetaTag('twitter:description', generateDescription(), 'name');
    updateMetaTag('twitter:image', ogImage, 'name');

    // Marketplace specific meta tags
    updateMetaTag('marketplace:total_products', totalCount.toString(), 'property');
    updateMetaTag('marketplace:active_products', products.length.toString(), 'property');
    if (filters.category) {
      updateMetaTag('marketplace:category', filters.category, 'property');
    }
    if (filters.school) {
      updateMetaTag('marketplace:school', filters.school, 'property');
    }

    // Add structured data (JSON-LD) for marketplace
    const addMarketplaceStructuredData = () => {
      // Remove existing marketplace structured data
      const existingScript = document.querySelector('script[type="application/ld+json"][data-marketplace]');
      if (existingScript) {
        existingScript.remove();
      }

      // Get price range from products
      const prices = products.map(p => p.price).filter(price => price > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      // Get unique categories and schools
      const categories = [...new Set(products.map(p => p.category))];
      const schools = [...new Set(products.map(p => p.school))];

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-marketplace', 'true');
      script.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "WebSite",
        "name": "CalvinNova Marketplace",
        "description": generateDescription(),
        "url": window.location.origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${window.location.origin}/marketplace?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "audience": {
          "@type": "Audience",
          "audienceType": "Students",
          "geographicArea": {
            "@type": "Country",
            "name": "Nigeria"
          }
        },
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": products.length,
          "itemListElement": products.slice(0, 10).map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": product.title,
              "description": product.description.substring(0, 100),
              "image": product.images[0],
              "offers": {
                "@type": "Offer",
                "price": product.price.toString(),
                "priceCurrency": "NGN",
                "availability": "https://schema.org/InStock"
              }
            }
          }))
        },
        "about": {
          "@type": "Organization",
          "name": "CalvinNova",
          "description": "Student marketplace platform connecting university students across Nigeria"
        }
      });
      document.head.appendChild(script);
    };

    addMarketplaceStructuredData();

    // Add breadcrumb structured data
    const addBreadcrumbData = () => {
      const existingBreadcrumb = document.querySelector('script[type="application/ld+json"][data-breadcrumb]');
      if (existingBreadcrumb) {
        existingBreadcrumb.remove();
      }

      const breadcrumbItems = [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": window.location.origin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Marketplace"
        }
      ];

      // Add category to breadcrumb if filtered
      if (filters.category) {
        breadcrumbItems[1].item = `${window.location.origin}/marketplace`;
        breadcrumbItems.push({
          "@type": "ListItem",
          "position": 3,
          "name": filters.category
        });
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-breadcrumb', 'true');
      script.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
      });
      document.head.appendChild(script);
    };

    addBreadcrumbData();

    // Add FAQ structured data for marketplace
    const addFAQStructuredData = () => {
      const existingFAQ = document.querySelector('script[type="application/ld+json"][data-faq]');
      if (existingFAQ) {
        existingFAQ.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-faq', 'true');
      script.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I buy items on CalvinNova Marketplace?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Browse products, contact sellers directly through our messaging system, and arrange safe meetups on campus for transactions."
            }
          },
          {
            "@type": "Question",
            "name": "Is CalvinNova Marketplace safe for students?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we verify all users through university email addresses and provide secure messaging between buyers and sellers."
            }
          },
          {
            "@type": "Question",
            "name": "What can I sell on CalvinNova Marketplace?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can sell textbooks, electronics, furniture, clothing, and other student-related items in good condition."
            }
          },
          {
            "@type": "Question",
            "name": "How do payments work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Payments are arranged directly between buyers and sellers. We recommend cash transactions during safe campus meetups."
            }
          }
        ]
      });
      document.head.appendChild(script);
    };

    addFAQStructuredData();

    // Add local business data if school filter is applied
    if (filters.school) {
      const addLocalBusinessData = () => {
        const existingBusiness = document.querySelector('script[type="application/ld+json"][data-local-business]');
        if (existingBusiness) {
          existingBusiness.remove();
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-local-business', 'true');
        script.textContent = JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "LocalBusiness",
          "name": `CalvinNova Marketplace - ${filters.school}`,
          "description": `Student marketplace serving ${filters.school} community`,
          "url": window.location.href,
          "areaServed": {
            "@type": "EducationalOrganization",
            "name": filters.school
          },
          "audience": {
            "@type": "Audience",
            "audienceType": "University Students"
          }
        });
        document.head.appendChild(script);
      };

      addLocalBusinessData();
    }

    // Cleanup function
    return () => {
      // Reset title when component unmounts
      document.title = 'CalvinNova Marketplace';
      
      // Remove marketplace-specific structured data
      const marketplaceScript = document.querySelector('script[type="application/ld+json"][data-marketplace]');
      if (marketplaceScript) {
        marketplaceScript.remove();
      }
      
      const faqScript = document.querySelector('script[type="application/ld+json"][data-faq]');
      if (faqScript) {
        faqScript.remove();
      }
      
      const localBusinessScript = document.querySelector('script[type="application/ld+json"][data-local-business]');
      if (localBusinessScript) {
        localBusinessScript.remove();
      }
    };
  }, [products, searchTerm, filters, totalCount]);

  return null; // This component doesn't render anything
};

export default MarketplaceSEOHead;