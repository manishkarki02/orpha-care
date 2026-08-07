import { createClient, type RedisClientType } from "redis";
import Environment from "../../config/env.config";

class RedisService {
	private static instance: RedisService;
	private client: RedisClientType;

	private constructor() {
		this.client = createClient({
			url: Environment.get("REDIS_URL"),
		});

		this.client.on("error", (err) => {
			console.error("Redis Client Error", err);
		});
	}

	static getInstance() {
		if (!RedisService.instance) {
			RedisService.instance = new RedisService();
		}

		return RedisService.instance;
	}

	public async connect() {
		if (!this.client.isOpen) {
			await this.client.connect();
			console.log("✅ Redis connected");
		}
	}

	public async disconnect() {
		if (this.client.isOpen) {
			await this.client.close();
			console.log("Redis disconnected");
		}
	}

	public getClient() {
		return this.client;
	}
}

export default RedisService.getInstance();
