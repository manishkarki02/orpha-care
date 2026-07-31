import { internalPrisma } from "@/db";
import { executeRestore, executeSoftDelete } from "@/db/repository/soft-delete.repository";

export function softDeleteMissingReport(id: string, deletedById: string) {
	return executeSoftDelete(
		internalPrisma.missingReport.updateMany({
			where: { id, deletedAt: null },
			data: {
				deletedAt: new Date(),
				deletedById,
				updatedById: deletedById,
			},
		}),
		"Missing report",
	);
}

export function restoreMissingReport(id: string, restoreById: string) {
	return executeRestore(
		internalPrisma.missingReport.updateMany({
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
		"Missing report",
	);
}
