import { sendMail } from "@/common/services/mail.service";
import { ConflictError, NotFoundError } from "@/common/utils/errorClass.utils";
import buildPrismaQuery from "@/common/utils/query.utils";
import { buildPaginationMetaData } from "@/common/utils/response.utils";
import {
	allAdoptionRequestsQueryConfig,
	myAdoptionRequestsQueryConfig,
} from "@/config/query.config";
import prisma from "@/db";
import type {
	CreateAdoptionRequestSchema,
	GetAllAdoptionRequestSchema,
	GetMyAdoptionRequestsSchema,
} from "@/features/adoption/adoption.schema";
import { Prisma } from "@/generated/prisma/client";
import { AdoptionRequestStatus } from "@/generated/prisma/enums";

// This partial unique index lives in a migration, not in schema.prisma, so Prisma cannot
// map it back to model fields and leaves `meta.target` undefined. The violated index name
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

const throwIfActiveRequestConflict = (ex: unknown): never => {
	if (violatedUniqueIndex(ex) === ACTIVE_REQUEST_INDEX) {
		throw new ConflictError(
			"You already have an adoption request that is pending or under review.",
		);
	}

	throw ex;
};

type CreatedAdoptionRequest = {
	id: string;
	kid: {
		id: string;
		name: string;
	};
	adopter: {
		id: string;
		name: string;
		email: string;
	};
	status: AdoptionRequestStatus;
	createdAt: Date;
	createdBy: {
		id: string;
		name: string;
	};
};

// -- Create Adoption Request
export const createAdoptionRequest = async (
	userId: string,
	body: CreateAdoptionRequestSchema["body"],
) => {
	const createdRequest = await (async (): Promise<CreatedAdoptionRequest> => {
		try {
			return await prisma.$transaction(async (tx) => {
				// FOR UPDATE so a concurrent approval cannot flip is_adopted while we decide.
				const [foundKid] = await tx.$queryRaw<{ id: string; is_adopted: boolean | null }[]>`
	SELECT id, is_adopted FROM kids_for_adoption
	WHERE id = ${body.kidId} AND deleted_at IS NULL
	FOR UPDATE
`;
				if (!foundKid) {
					throw new NotFoundError("Kid not found.");
				} else if (foundKid.is_adopted !== false) {
					throw new ConflictError("Kid is already adopted.");
				}

				const activeRequest = await tx.adoptionRequest.findFirst({
					where: {
						adopterId: userId,
						status: {
							in: [AdoptionRequestStatus.Pending, AdoptionRequestStatus.UnderReview],
						},
						deletedAt: null,
					},
				});
				if (activeRequest) {
					throw new ConflictError(
						"You already have an adoption request that is pending or under review.",
					);
				}

				const approvedSameKidRequest = await tx.adoptionRequest.findFirst({
					where: {
						adopterId: userId,
						kidId: body.kidId,
						status: AdoptionRequestStatus.Approved,
						deletedAt: null,
					},
				});
				if (approvedSameKidRequest) {
					throw new ConflictError("You already have an approved adoption request for this kid.");
				}

				return await tx.adoptionRequest.create({
					data: {
						kidId: body.kidId,
						adopterId: userId,
						createdById: userId,
					},
					select: {
						id: true,
						kid: {
							select: {
								id: true,
								name: true,
							},
						},
						adopter: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						status: true,
						createdAt: true,
						createdBy: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				});
			});
		} catch (ex) {
			return throwIfActiveRequestConflict(ex);
		}
	})();

	//  Convert this to queue
	await sendMail(createdRequest.adopter.email, createdRequest.kid.name);

	return createdRequest;
};

// -- Get All Adoption Requests
export const getAllAdoptionRequests = async (query: GetAllAdoptionRequestSchema["query"]) => {
	const { where, take, skip, orderBy } = buildPrismaQuery(query, allAdoptionRequestsQueryConfig);
	const finalWhere = { ...where, deletedAt: null };
	const [requests, total] = await prisma.$transaction([
		prisma.adoptionRequest.findMany({
			where: finalWhere,
			take,
			skip,
			orderBy,
			select: {
				id: true,
				status: true,
				kid: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				adopter: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				createdAt: true,
				updatedAt: true,
				updatedBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		}),
		prisma.adoptionRequest.count({ where: finalWhere }),
	]);

	return {
		data: requests,
		pagination: buildPaginationMetaData({ page: query.page, limit: query.limit, total }),
	};
};

// -- Get My Adoption Requests
export const getMyAdoptionRequests = async (
	adopterId: string,
	query: GetMyAdoptionRequestsSchema["query"],
) => {
	const { where, take, skip, orderBy } = buildPrismaQuery(query, myAdoptionRequestsQueryConfig);

	const finalWhere = { ...where, deletedAt: null, adopterId };
	const [requests, total] = await prisma.$transaction([
		prisma.adoptionRequest.findMany({
			where: finalWhere,
			take,
			skip,
			orderBy,
			select: {
				id: true,
				status: true,
				kid: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				createdAt: true,
				updatedAt: true,
				updatedBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		}),
		prisma.adoptionRequest.count({
			where: finalWhere,
		}),
	]);
	return {
		data: requests,
		pagination: buildPaginationMetaData({ page: query.page, limit: query.limit, total }),
	};
};
