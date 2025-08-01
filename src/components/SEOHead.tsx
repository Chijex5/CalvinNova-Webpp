// Create a simple SEO component
import { useEffect } from 'react';
import { Product } from '../store/productStore';

const SEOHead = ({ product }: { product: Product | null }) => {
  useEffect(() => {
    if (!product) return;

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(price);
    };

    // Update page title
    document.title = `${product.title.toUpperCase()} - ${formatPrice(product.price)} | CalvinNova Marketplace`;

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
    updateMetaTag('description', 
      `Buy ${product.title} in ${product.condition} condition for ${formatPrice(product.price)}. ${product.description.substring(0, 120)}...`
    );
    
    updateMetaTag('keywords', 
      `${product.category}, ${product.condition}, ${product.school || ''}, student marketplace, buy, sell`
    );

    // Open Graph tags
    updateMetaTag('og:title', product.title, 'property');
    updateMetaTag('og:description', product.description.substring(0, 160), 'property');
    updateMetaTag('og:image', product.images[0], 'property');
    updateMetaTag('og:type', 'product', 'property');
    updateMetaTag('og:url', window.location.href, 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', product.title, 'name');
    updateMetaTag('twitter:description', product.description.substring(0, 160), 'name');
    updateMetaTag('twitter:image', product.images[0], 'name');

    // Product specific meta tags
    updateMetaTag('product:price:amount', product.price.toString(), 'property');
    updateMetaTag('product:price:currency', 'NGN', 'property');
    updateMetaTag('product:condition', product.condition, 'property');
    updateMetaTag('product:category', product.category, 'property');

    // Add structured data (JSON-LD)
    const addStructuredData = () => {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"][data-product]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-product', 'true');
      script.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "description": product.description,
        "image": product.images,
        "offers": {
          "@type": "Offer",
          "price": product.price.toString(),
          "priceCurrency": "NGN",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Person",
            "name": product.sellerName
          }
        },
        "category": product.category,
        "condition": product.condition
      });
      document.head.appendChild(script);
    };

    addStructuredData();

    // Add breadcrumb structured data
    const addBreadcrumbData = () => {
      const existingBreadcrumb = document.querySelector('script[type="application/ld+json"][data-breadcrumb]');
      if (existingBreadcrumb) {
        existingBreadcrumb.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-breadcrumb', 'true');
      script.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Marketplace",
            "item": `${window.location.origin}/marketplace`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": product.category,
            "item": `${window.location.origin}/marketplace?category=${product.category}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": product.title
          }
        ]
      });
      document.head.appendChild(script);
    };

    addBreadcrumbData();

    // Cleanup function
    return () => {
      // Reset title when component unmounts
      document.title = 'CalvinNova Marketplace';
    };
  }, [product]);

  return null; // This component doesn't render anything
};

export default SEOHead;