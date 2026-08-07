import redis from "@/common/services/redis.service";
import type { IUser } from "@/common/types/interfaces/user.interface";

export const setCacheUser = async (user: IUser): Promise<void> => {
	const redisClient = redis.getClient();
	await redisClient.set(`users:${user.id}`, JSON.stringify(user), {
		expiration: {
			type: "EX",
			value: 3600,
		},
	});
};

export const getCachedUser = async (userId: string): Promise<IUser | null> => {
	const redisClient = redis.getClient();
	const data = await redisClient.get(`users:${userId}`);
	if (!data) return null;
	return JSON.parse(data) as IUser;
};

export const removeCachedUser = async (userId: string) => {
	const redisClient = redis.getClient();
	await redisClient.del(`users:${userId}`);
};
