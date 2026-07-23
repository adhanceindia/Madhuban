import { getRedis } from './lib/redis'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
async function run() {
  const redis = getRedis()
  if (redis) {
    await redis.del('rl:login:127.0.0.1')
    await redis.del('rl:login:::1')
    console.log('Cleared redis rate limit')
  }
}
run()
