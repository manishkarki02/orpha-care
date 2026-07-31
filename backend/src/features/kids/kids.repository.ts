import { internalPrisma } from "@/db";
import { executeRestore, executeSoftDelete } from "@/db/repository/soft-delete.repository";

export function softDeleteKid(id: string, deletedById: string) {
	return executeSoftDelete(
		internalPrisma.kidsForAdoption.updateMany({
			where: { id, deletedAt: null },
			data: {
				deletedAt: new Date(),
				deletedById,
				updatedById: deletedById,
			},
		}),
		"Kid for adoption",
	);
}

export function restoreKid(id: string, restoreById: string) {
	return executeRestore(
		internalPrisma.kidsForAdoption.updateMany({
			where: {
				id,
				deletedAt: {
					not: null,
				},
			},
			data: {
				deletedAt: null,
				deletedById: null,
				updatedById: restoreById,
			},
		}),
		"Kid for adoption",
	);
}
