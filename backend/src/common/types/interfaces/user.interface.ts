import type { Role } from "@/generated/prisma/enums";

export interface IUser {
	id: string;
	name: string;
	email: string;
	address?: string;
	createdAt: Date;
	role: Role;
	[key: string]: unknown;
}
