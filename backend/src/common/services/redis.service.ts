import redis from "redis";
import Environment from "../../config/env.config";

class Redis {
	static instance: Redis;
	private client!: redis.RedisClientType;

	constructor() {
		if (Redis.instance) {
			return Redis.instance;
		}

		this.client = redis.createClient({
			url: Environment.get("REDIS_URL"),
		});

		this.client.on("error", (err) => {
			console.error("Redis Client Error", err);
		});

		this.client.on("connect", () => {
			console.log("Redis client connected");
		});

		Redis.instance = this;
	}

	static getInstance() {
		return new Redis();
	}

	async connect() {
		if (!this.client.isOpen) {
			await this.client.connect();
		}
	}
}
