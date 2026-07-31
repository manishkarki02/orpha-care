import { internalPrisma, type SoftDeleteClient } from "@/db";
import { executeRestore, executeSoftDelete } from "@/db/repository/soft-delete.repository";
import { softDeleteTasksForAdoptionRequests } from "@/features/task/task.repository";

export function softDeleteAdoption(
	id: string,
	deletedById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return executeSoftDelete(
		client.adoptionRequest.updateMany({
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

export function restoreAdoption(
	id: string,
	restoreById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return executeRestore(
		client.adoptionRequest.updateMany({
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

// -- Delete a request and the home survey tasks that exist only to serve it.
export function softDeleteAdoptionWithRelations(id: string, deletedById: string) {
	return internalPrisma.$transaction(async (tx) => {
		await softDeleteTasksForAdoptionRequests([id], deletedById, tx);
		return softDeleteAdoption(id, deletedById, tx);
	});
}

// -- Cascade: every live request for a kid that is being deleted.
export function softDeleteAdoptionRequestsForKid(
	kidId: string,
	deletedById: string,
	client: SoftDeleteClient = internalPrisma,
) {
	return client.adoptionRequest.updateMany({
		where: { kidId, deletedAt: null },
		data: {
			deletedAt: new Date(),
			deletedById,
			updatedById: deletedById,
		},
	});
}

export async function findLiveAdoptionRequestIdsForKid(
	kidId: string,
	client: SoftDeleteClient = internalPrisma,
) {
	const requests = await client.adoptionRequest.findMany({
		where: { kidId, deletedAt: null },
		select: { id: true },
	});

	return requests.map(({ id }) => id);
}
