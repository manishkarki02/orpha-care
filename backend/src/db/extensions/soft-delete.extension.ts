import { Prisma } from "@/generated/prisma/client";

const softDeleteModels = new Set([
    "users",
    "kids_for_adoption",
    "adoption_requests",
    "missing_reports",
    "tasks",
    "donations"
])

export const softDeleteExtension = Prisma.defineExtension({
	name: "soft-delete",
	query: {
		$allModels: {
			async $allOperations({ model, operation, args, query }) {
				const readOperations = new Set([
					"findUnique",
					"findUniqueOrThrow",
					"findFirst",
					"findFirstOrThrow",
					"findMany",
					"count",
					"aggregate",
					"groupBy",
				]);

                
			},
		},
	},
});
