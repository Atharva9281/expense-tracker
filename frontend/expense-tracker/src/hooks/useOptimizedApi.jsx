import { useState, useCallback, useRef } from 'react';
import axiosInstance from '../utils/axiosInstance';

// Custom hook for optimized API calls with caching
export const useOptimizedApi = () => {
  const [cache, setCache] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const cachedApiCall = useCallback(async (url, options = {}, cacheTime = 300000) => {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const now = Date.now();
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < cacheTime) {
      console.log(`⚡ Frontend cache hit: ${cacheKey}`);
      return cached.data;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    const startTime = performance.now();
    
    try {
      const response = await axiosInstance({
        url,
        signal: abortControllerRef.current.signal,
        ...options
      });
      
      const endTime = performance.now();
      console.log(`📡 API call took ${(endTime - startTime).toFixed(2)}ms`);
      
      const data = response.data;
      
      // Cache the result
      setCache(prev => new Map(prev).set(cacheKey, {
        data,
        timestamp: now
      }));
      
      setLoading(false);
      return data;
      
    } catch (error) {
      setLoading(false);
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return null;
      }
      console.error('API call failed:', error);
      throw error;
    }
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache(new Map());
    console.log('🧹 Frontend cache cleared');
  }, []);

  return { 
    cachedApiCall, 
    clearCache, 
    loading 
  };
};
