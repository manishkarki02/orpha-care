import { PrismaPg } from "@prisma/adapter-pg";
import type { ITXClientDenyList } from "@prisma/client/runtime/client";
import Environment from "@/config/env.config";
import { PrismaClient } from "@/generated/prisma/client";
import { softDeleteExtension } from "./extensions/soft-delete.extension";

const adapter = new PrismaPg({
	connectionString: Environment.get("DATABASE_URL"),
});
const basePrisma = new PrismaClient({ adapter });

export const prisma = basePrisma.$extends(softDeleteExtension);
export const internalPrisma = basePrisma;

export type ExtendedPrismaClient = typeof prisma;
export type TransactionClient = Omit<ExtendedPrismaClient, ITXClientDenyList>;

/**
 * The raw client, or a transaction opened on it via `internalPrisma.$transaction`.
 * Soft-delete writes must use this: the extended client blocks writes to `deletedAt`.
 * A whole client is assignable to this type, so it doubles as the default.
 */
export type SoftDeleteClient = Omit<typeof internalPrisma, ITXClientDenyList>;
