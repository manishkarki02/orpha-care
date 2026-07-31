import { ConflictError, NotFoundError } from "@/common/utils/errorClass.utils";
import { internalPrisma, type SoftDeleteClient } from "@/db";
import { executeRestore, executeSoftDelete } from "@/db/repository/soft-delete.repository";
import {
	findLiveAdoptionRequestIdsForKid,
	softDeleteAdoptionRequestsForKid,
} from "@/features/adoption/adoption.repository";
import { softDeleteTasksForAdoptionRequests } from "@/features/task/task.repository";

export function softDeleteKid(
	id: string,
	deletedById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return executeSoftDelete(
		client.kidsForAdoption.updateMany({
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

export function restoreKid(
	id: string,
	restoreById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return executeRestore(
		client.kidsForAdoption.updateMany({
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

// -- Delete a kid, every request for that kid, and the home survey tasks under those requests.
// All four statements share one transaction, so a failure anywhere leaves the kid undeleted.
export function softDeleteKidWithRelations(id: string, deletedById: string) {
	return internalPrisma.$transaction(async (tx) => {
		const kid = await tx.kidsForAdoption.findFirst({
			where: { id, deletedAt: null },
			select: { id: true, isAdopted: true },
		});
		if (!kid) {
			throw new NotFoundError("Kid not found.");
		}
		if (kid.isAdopted) {
			throw new ConflictError("This kid has already been adopted and cannot be deleted.");
		}

		// Collect the request ids first: once the requests are deleted we can no longer find their tasks.
		const requestIds = await findLiveAdoptionRequestIdsForKid(id, tx);
		await softDeleteTasksForAdoptionRequests(requestIds, deletedById, tx);
		await softDeleteAdoptionRequestsForKid(id, deletedById, tx);

		return softDeleteKid(id, deletedById, tx);
	});
}
