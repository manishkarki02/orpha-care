import { NotFoundError } from "@/common/utils/errorClass.utils";
import type { Prisma } from "@/generated/prisma/client";

export async function executeSoftDelete(
	operation: Promise<Prisma.BatchPayload>,
	entityName: string = "This entity",
): Promise<Prisma.BatchPayload> {
	const result = await operation;

	if (result.count === 0) {
		throw new NotFoundError(`${entityName} was not found or is already deleted.`);
	}

	return result;
}

export async function executeRestore(
	operation: Promise<Prisma.BatchPayload>,
	entityName: string = "This entity",
): Promise<Prisma.BatchPayload> {
	const result = await operation;

	if (result.count === 0) {
		throw new NotFoundError(`${entityName} was not found or is already active.`);
	}

	return result;
}
