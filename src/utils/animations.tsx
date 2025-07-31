import React, { useEffect, useRef, createElement } from 'react';
interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  once = true,
  className = ''
}) => {
  const domRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          entry.target.classList.remove('is-visible');
        }
      });
    });
    const {
      current
    } = domRef;
    if (current) {
      observer.observe(current);
    }
    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [once]);
  const getTransform = () => {
    switch (direction) {
      case 'up':
        return 'translate3d(0, 30px, 0)';
      case 'down':
        return 'translate3d(0, -30px, 0)';
      case 'left':
        return 'translate3d(30px, 0, 0)';
      case 'right':
        return 'translate3d(-30px, 0, 0)';
      default:
        return 'translate3d(0, 0, 0)';
    }
  };
  return <div ref={domRef} className={`fade-in-section ${className}`} style={{
    opacity: 0,
    transform: getTransform(),
    transition: `opacity ${duration}s ease-out, transform ${duration}s ease-out`,
    transitionDelay: `${delay}s`
  }}>
      {children}
    </div>;
};
// Add this to your global CSS or add it inline here
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .fade-in-section.is-visible {
      opacity: 1 !important;
      transform: translate3d(0, 0, 0) !important;
    }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }
    .animate-float {
      animation-name: float;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }
  `;
  document.head.appendChild(style);
}