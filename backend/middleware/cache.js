const NodeCache = require('node-cache');

// Create cache instance (stores in memory)
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check expired keys every 60 seconds
  useClones: false // Better performance
});

// Cache middleware for your API routes
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // ✅ FIXED: Always skip cache in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode - Cache disabled');
      return next();
    }

    // ✅ FIXED: Also skip cache for auth/user-related routes
    const skipCacheRoutes = ['/auth/', '/register', '/login', '/verify-email'];
    const shouldSkipCache = skipCacheRoutes.some(route => req.originalUrl.includes(route));
    
    if (shouldSkipCache) {
      console.log('🔧 Auth route - Cache disabled');
      return next();
    }

    // Create unique cache key
    const key = `${req.user?.id || 'anonymous'}_${req.method}_${req.originalUrl}`;
    
    // Try to get cached data
    const cachedData = cache.get(key);
    if (cachedData) {
      console.log(`⚡ Cache HIT: ${key}`);
      return res.json(cachedData);
    }
    
    // Store original json method
    const originalJson = res.json;
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, data, duration);
        console.log(`💾 Cache SET: ${key} (${duration}s)`);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Clear cache for specific user (when they add/edit/delete data)
const clearUserCache = (userId) => {
  const keys = cache.keys();
  const userKeys = keys.filter(key => key.startsWith(userId));
  
  userKeys.forEach(key => cache.del(key));
  console.log(`🧹 Cleared ${userKeys.length} cache entries for user ${userId}`);
};

// Clear all cache
const clearAllCache = () => {
  cache.flushAll();
  console.log('🧹 All cache cleared');
};

// ✅ NEW: Clear cache when users are deleted (for cleanup jobs)
const clearCacheForDeletedUsers = (userIds) => {
  if (!Array.isArray(userIds)) return;
  
  userIds.forEach(userId => {
    clearUserCache(userId.toString());
  });
  
  console.log(`🧹 Cleared cache for ${userIds.length} deleted users`);
};

module.exports = { 
  cacheMiddleware, 
  clearUserCache, 
  clearAllCache,
  clearCacheForDeletedUsers,
  cache 
};