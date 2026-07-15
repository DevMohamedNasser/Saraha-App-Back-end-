import { Redis } from "@upstash/redis";
import { createClient } from "redis";
import {
  REDIS_URI,
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from "../../Config/config.service.js";
import chalk from "chalk";

export const redisClient = createClient({ url: REDIS_URI });

export const clientRedisConnection = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.log(chalk.red("Filed to connect RedisDB locally", error.message));
  }
};

export const upstashRedisConnection = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});
