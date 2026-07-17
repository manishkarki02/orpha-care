import Environment from "@/config/env.config";
import redisClient from "@/config/redis.config";
import { sha256, timeSafeCompare } from "../utils/auth.utils";

type CachedTokenType = "reset-password" | "verify-email" | "refresh-token";

const TOKEN_CONFIG = {
	"refresh-token": {
		expiry: Environment.get("REFRESH_TOKEN_EXPIRY"),
		key: (token: string) => `refresh-token:${sha256(token)}`,
	},
	"reset-password": {
		expiry: 3600,
		key: (email: string) => `reset-password:${sha256(email)}`,
	},
	"verify-email": {
		expiry: 300,
		key: (email: string) => `verify-email:${sha256(email)}`,
	},
} satisfies Record<CachedTokenType, any>;

export const setCachedToken = async (
	type: CachedTokenType,
	payload: { email?: string; token: string; userId?: string },
) => {
	const config = TOKEN_CONFIG[type];
	if (type === "refresh-token") {
		// Store userId as the value for the refresh token key
		await redisClient.set(config.key(payload.token), payload.userId || "1", {
			expiration: {
				type: "EX",
				value: config.expiry,
			},
		});

		return;
	}

	await redisClient.set(config.key(payload.email!), sha256(payload.token), {
		expiration: {
			type: "EX",
			value: config.expiry,
		},
	});
};

export const getCachedToken = async (type: CachedTokenType, key: string) => {
	const config = TOKEN_CONFIG[type];
	return await redisClient.get(config.key(key));
};

export const consumeCachedToken = async (type: CachedTokenType, key: string, token?: string) => {
	if (type === "refresh-token") {
		const existed = await redisClient.del(TOKEN_CONFIG["refresh-token"].key(key));
		return existed === 1;
	}
	if (!token) return false;
	const storedHash = await redisClient.getDel(TOKEN_CONFIG[type].key(key));
	if (!storedHash) return false;

	return timeSafeCompare(storedHash, sha256(token));
};
