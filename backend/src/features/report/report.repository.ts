import { internalPrisma, type SoftDeleteClient } from "@/db";
import { executeRestore, executeSoftDelete } from "@/db/repository/soft-delete.repository";
import { softDeleteTasksForMissingReport } from "@/features/task/task.repository";

export function softDeleteMissingReport(
	id: string,
	deletedById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return executeSoftDelete(
		client.missingReport.updateMany({
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

export function restoreMissingReport(
	id: string,
	restoreById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return executeRestore(
		client.missingReport.updateMany({
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

// -- Delete a report and the follow-up tasks that exist only to serve it.
export function softDeleteMissingReportWithRelations(id: string, deletedById: string) {
	return internalPrisma.$transaction(async (tx) => {
		await softDeleteTasksForMissingReport(id, deletedById, tx);
		return softDeleteMissingReport(id, deletedById, tx);
	});
}
