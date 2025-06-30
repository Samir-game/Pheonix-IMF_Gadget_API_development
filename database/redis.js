const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

async function connectRedis(){
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection failed:",error.message);
    process.exit(1);
  }
}


process.on('SIGINT',async()=>{
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGTERM',async()=>{
  await redisClient.quit();
  process.exit(0);
});

module.exports={
  connectRedis,
  redisClient,
};
