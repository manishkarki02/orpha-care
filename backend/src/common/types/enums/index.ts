export const Order = {
	DESC: "desc",
	ASC: "asc",
} as const;
export type Order = (typeof Order)[keyof typeof Order];
