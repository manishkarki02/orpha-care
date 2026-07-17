import { createClient } from "redis";
import Environment from "./env.config";

export const redisClient = createClient({
	url: Environment.get("REDIS_URL"),
});

redisClient.on("connect", () => {
	console.log("Redis client connected");
});

redisClient.on("error", (err) => {
	console.error("Redis client error", err);
});

redisClient.on("reconnecting", () => {
	console.log("Redis client reconnecting");
});

(async () => {
	try {
		await redisClient.connect();
	} catch (error) {
		console.error("Redis connection error", error);
	}
})();

export default redisClient;
