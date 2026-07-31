import { internalPrisma, type SoftDeleteClient } from "@/db";
import { executeRestore, executeSoftDelete } from "@/db/repository/soft-delete.repository";

export function softDeleteTask(
	id: string,
	deletedById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return executeSoftDelete(
		client.task.updateMany({
			where: { id, deletedAt: null },
			data: {
				deletedAt: new Date(),
				deletedById,
				updatedById: deletedById,
			},
		}),
		"Task",
	);
}

export function restoreTask(
	id: string,
	restoreById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return executeRestore(
		client.task.updateMany({
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
		"Task",
	);
}

// -- Cascade: the home survey tasks hanging off adoption requests that are being deleted.
// Unlike the single-id helpers this never throws on zero rows: a request with no task yet is normal.
export function softDeleteTasksForAdoptionRequests(
	adoptionRequestIds: string[],
	deletedById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	if (adoptionRequestIds.length === 0) {
		return Promise.resolve({ count: 0 });
	}

	return client.task.updateMany({
		where: { adoptionRequestId: { in: adoptionRequestIds }, deletedAt: null },
		data: {
			deletedAt: new Date(),
			deletedById,
			updatedById: deletedById,
		},
	});
}

// -- Cascade: the follow-up tasks hanging off a missing report that is being deleted.
export function softDeleteTasksForMissingReport(
	missingReportId: string,
	deletedById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return client.task.updateMany({
		where: { missingReportId, deletedAt: null },
		data: {
			deletedAt: new Date(),
			deletedById,
			updatedById: deletedById,
		},
	});
}
