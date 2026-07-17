import type { IUser } from "@/common/types/interfaces/user.interface";
import redisClient from "@/config/redis.config";

export const setCacheUser = async (user: IUser): Promise<void> => {
	await redisClient.set(`users:${user.id}`, JSON.stringify(user), {
		expiration: {
			type: "EX",
			value: 3600,
		},
	});
};

export const getCachedUser = async (userId: string): Promise<IUser | null> => {
	const data = await redisClient.get(`users:${userId}`);
	if (!data) return null;
	return JSON.parse(data) as IUser;
};

export const removeCachedUser = async (userId: string) => {
	await redisClient.del(`users:${userId}`);
};
