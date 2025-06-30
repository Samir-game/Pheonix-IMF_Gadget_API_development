const redis= require("../database/redis.js").redisClient;

const clearRedisData=async(cacheKey)=>{
  try {
    await redis.del(cacheKey);
  } catch (error) {
    console.error('Failed to clear cache:',error.message);
  }
};

module.exports={ 
  clearRedisData
};
