import { internalPrisma } from "@/db";
import { executeRestore, executeSoftDelete } from "@/db/repository/soft-delete.repository";

export function softDeleteAdoption(id: string, deletedById: string) {
	return executeSoftDelete(
		internalPrisma.adoptionRequest.updateMany({
			where: { id, deletedAt: null },
			data: {
				deletedAt: new Date(),
				deletedById,
				updatedById: deletedById,
			},
		}),
		"Adoption request",
	);
}

export function restoreDonation(id: string, restoreById: string) {
	return executeRestore(
		internalPrisma.adoptionRequest.updateMany({
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
		"Adoption request",
	);
}
