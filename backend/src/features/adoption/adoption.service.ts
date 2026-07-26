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
import { AdoptionRequestStatus, Role } from "@/generated/prisma/enums";
import type { CreatedAdoptionRequest } from "./adoption.type";
import { throwIfActiveRequestConflict } from "./adoption.utils";

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

// -- Get Adoption Request Details
export const getAdoptionRequestDetails = async (id: string, user: { id: string; role: Role }) => {
	const isAdmin = user.role === Role.Admin;
	const isVolunteer = user.role === Role.Volunteer;

	const adoptionRequest = await prisma.adoptionRequest.findFirst({
		where: {
			id,
			deletedAt: null,
			...(user.role === Role.User ? { adopterId: user.id } : {}),
			...(isVolunteer
				? {
						tasks: {
							some: {
								volunteerId: user.id,
								deletedAt: null,
							},
						},
					}
				: {}),
		},
		select: {
			id: true,
			status: true,
			kid: {
				select: {
					id: true,
					name: true,
					image: true,
					dob: true,
					gender: true,
					province: true,
					description: true,
				},
			},
			adopter: (isAdmin || isVolunteer) && {
				select: {
					id: true,
					name: true,
					phone: true,
					address: true,
					...(isAdmin ? { image: true, email: true } : {}),
				},
			},
			createdAt: true,
			updatedAt: true,
			updatedBy: isAdmin && {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
			tasks: isAdmin
				? {
						select: {
							id: true,
							volunteer: {
								select: {
									name: true,
									id: true,
									image: true,
								},
							},
							status: true,
							result: true,
							remarks: true,
							dueDate: true,
							images: true,
						},
					}
				: isVolunteer
					? {
							where: {
								volunteerId: user.id,
								deletedAt: null,
							},
							select: {
								id: true,
								status: true,
								result: true,
								remarks: true,
								dueDate: true,
								images: true,
							},
						}
					: false,
		},
	});

	if (!adoptionRequest) {
		throw new NotFoundError("Adoption request not found.");
	}

	return adoptionRequest;
};
