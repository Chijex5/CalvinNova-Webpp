import React, { useEffect, useState, useRef, lazy } from 'react';
// Fade in animation on scroll
export const useFadeInOnScroll = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold
    });
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);
  return {
    ref,
    isVisible
  };
};
// Slide in animation component
export const FadeIn: React.FC<{
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  className = ''
}) => {
  const {
    ref,
    isVisible
  } = useFadeInOnScroll(threshold);
  const getDirectionStyles = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-10';
      case 'down':
        return '-translate-y-10';
      case 'left':
        return 'translate-x-10';
      case 'right':
        return '-translate-x-10';
      default:
        return 'translate-y-10';
    }
  };
  return <div ref={ref} className={`transition-all ${className}`} style={{
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0, 0)' : undefined,
    transitionDuration: `${duration}s`,
    transitionDelay: `${delay}s`,
    transitionProperty: 'opacity, transform'
  }}>
      <div className={isVisible ? '' : getDirectionStyles()} style={{
      transition: `transform ${duration}s ${delay}s`
    }}>
        {children}
      </div>
    </div>;
};
// Image with lazy loading and fade in effect
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({
  src,
  alt,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          observer.unobserve(img);
        }
      });
    });
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);
  return <div className={`overflow-hidden relative ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 animate-pulse ${isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
      <img ref={imageRef} data-src={src} alt={alt} className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setIsLoaded(true)} loading="lazy" />
    </div>;
};