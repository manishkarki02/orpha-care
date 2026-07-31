import { BadRequestError } from "@/common/utils/errorClass.utils";
import { Prisma } from "@/generated/prisma/client";

const softDeleteModels = new Set([
	"User",
	"KidsForAdoption",
	"AdoptionRequest",
	"MissingReport",
	"Task",
	"Donation",
]);

const filteredOperations = new Set([
	"findUnique",
	"findUniqueOrThrow",
	"findFirst",
	"findFirstOrThrow",
	"findMany",
	"count",
	"aggregate",
	"groupBy",
	"update",
	"updateMany",
]);

export const softDeleteExtension = Prisma.defineExtension({
	name: "soft-delete",

	query: {
		$allModels: {
			async $allOperations({ model, operation, args, query }) {
				if (!model || !softDeleteModels.has(model) || !filteredOperations.has(operation)) {
					return query(args);
				}

				const queryArgs = args as {
					where?: Record<string, unknown>;
					data?: Record<string, unknown>;
				};

				if (
					(operation === "update" || operation === "updateMany") &&
					queryArgs.data &&
					Object.hasOwn(queryArgs.data, "deletedAt")
				) {
					throw new BadRequestError("The deletedAt field cannot be changed directly.", {
						deletedAt: {
							code: "PROTECTED_FIELD",
							message: "Use the soft-delete or restore operation to change this field.",
						},
					});
				}

				queryArgs.where = {
					...queryArgs.where,
					deletedAt: null,
				};

				return query(queryArgs);
			},
		},
	},
});
