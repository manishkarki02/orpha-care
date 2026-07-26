import { ConflictError } from "@/common/utils/errorClass.utils";
import { Prisma } from "@/generated/prisma/client";

// is only available on the driver error.
const ACTIVE_REQUEST_INDEX = "adoption_requests_adopter_id_active_key";

const violatedUniqueIndex = (ex: unknown) => {
	if (!(ex instanceof Prisma.PrismaClientKnownRequestError) || ex.code !== "P2002") return null;

	const driverMessage = (
		ex.meta?.driverAdapterError as { cause?: { originalMessage?: string } } | undefined
	)?.cause?.originalMessage;
	const indexName = driverMessage?.match(/unique constraint "([^"]+)"/)?.[1];
	if (indexName) return indexName;

	// Fallback for setups where Prisma does resolve the target.
	const target = ex.meta?.target;
	if (typeof target === "string") return target;
	if (Array.isArray(target)) return target.join(",");
	return null;
};

export const throwIfActiveRequestConflict = (ex: unknown): never => {
	if (violatedUniqueIndex(ex) === ACTIVE_REQUEST_INDEX) {
		throw new ConflictError(
			"You already have an adoption request that is pending or under review.",
		);
	}

	throw ex;
};
