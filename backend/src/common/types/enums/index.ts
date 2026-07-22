export const Role = {
	ADMIN: "ADMIN",
	USER: "USER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Order = {
	DESC: "desc",
	ASC: "asc",
} as const;
export type Order = (typeof Order)[keyof typeof Order];
