// Debounce function for API calls
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  // Throttle function for scroll events
  export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };
  
  // Image optimization utility
  export const optimizeImage = (src, width = 300, quality = 80) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = img.height / img.width;
        const newHeight = width * aspectRatio;
        
        canvas.width = width;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, newHeight);
        
        // Convert to optimized blob
        canvas.toBlob(resolve, 'image/jpeg', quality / 100);
      };
      
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };
  
  // Preload critical resources
  export const preloadCriticalResources = () => {
    // Preload critical routes
    const criticalRoutes = ['/dashboard', '/income', '/expense'];
    
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  
    // Preload critical images
    const criticalImages = ['/logo.png', '/avatar-placeholder.png'];
    
    criticalImages.forEach(imageSrc => {
      const img = new Image();
      img.src = imageSrc;
    });
  };
  
  // Initialize performance optimizations
  export const initPerformanceOptimizations = () => {
    // Preload resources when page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', preloadCriticalResources);
    } else {
      preloadCriticalResources();
    }
  
    // Enable performance monitoring in development
    if (import.meta.env.DEV) {
      // Monitor First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(`📊 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        });
      });
      
      try {
        observer.observe({ entryTypes: ['paint', 'navigation'] });
      } catch (error) {
        console.log('Performance observer not supported');
      }
    }
  };