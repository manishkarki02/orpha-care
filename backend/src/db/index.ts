import { PrismaPg } from "@prisma/adapter-pg";
import Environment from "@/config/env.config";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: Environment.get("DATABASE_URL"),
});

export default new PrismaClient({ adapter });
