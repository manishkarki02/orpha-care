import { PrismaPg } from "@prisma/adapter-pg";
import Environment from "@/config/env.config";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: Environment.get("DATABASE_URL"),
});

export default new PrismaClient({ adapter }).$extends({
	name: "soft-delete",
	query: {
		$allModels: {
			async $allOperations({ model, operation, args, query }) {
				const readOperations = new Set
			},
		},
	},
});
