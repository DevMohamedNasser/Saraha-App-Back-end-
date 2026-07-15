import { redisClient } from "./redis.connection.js";

export const revokeTokenKeyPrefix = ({ userId }) => {
  return `user:${userId}`;
};

// jti
export const revokeTokenKey = ({ userId, jti }) => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

export const set = async ({ key, value, ttl = null }) => {
  try {
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl)
      return await redisClient.set(key, data, {
        expiration: { type: "EXAT", value: ttl },
      });
    else return await redisClient.set(key, data);
  } catch (error) {
    console.log("Redis set error", error.message);
  }
};

export const get = async ({ key }) => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.log("Redis get error", error.message);
  }
};

export const isExist = async ({ key }) => {
  try {
    return await redisClient.exists(key);
  } catch (error) {
    console.log("Redis exists error", error.message);
  }
};

export const update = async ({ key, value, ttl = null }) => {
  try {
    const exists = await isExist({ key });
    if (!exists) return false;

    return await set({ key, value, ttl });
  } catch (error) {
    console.log("Redis update error", error.message);
  }
};

export const del = async ({ key }) => {
  try {
    const exists = await isExist({ key });
    if (!exists) return false;

    return await redisClient.del( key );
  } catch (error) {
    console.log("Redis DEL error", error.message);
  }
};

export const expire = async ({ key, ttl }) => {
  try {
    const exists = await isExist({ key });
    if (!exists) return false;

    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.log("Redis EXPIRE error", error.message);
  }
};

export const ttl = async ({ key }) => {
  try {
    const exists = await isExist({ key });
    if (!exists) return false;

    return await redisClient.ttl(key);
  } catch (error) {
    console.log("Redis TTL error", error.message);
  }
};

export const keys = async ({ pattern = "*" }) => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.log("Redis KEYS error", error.message);
  }
};
