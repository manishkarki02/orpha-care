import { PrismaPg } from "@prisma/adapter-pg";
import Environment from "@/config/env.config";
import { PrismaClient } from "@/generated/prisma/client";
import { softDeleteExtension } from "./extensions/soft-delete.extension";

const adapter = new PrismaPg({
	connectionString: Environment.get("DATABASE_URL"),
});

export default new PrismaClient({ adapter }).$extends(softDeleteExtension);
