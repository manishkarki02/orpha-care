import {
	sendAdoptionRequestApprovedMail,
	sendAdoptionRequestRejectedMail,
	sendMail,
} from "@/common/services/mail.service";
import {
	AuthorizationError,
	BadRequestError,
	ConflictError,
	NotFoundError,
} from "@/common/utils/errorClass.utils";
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
	UpdateAdoptionRequestSchema,
} from "@/features/adoption/adoption.schema";
import type { Prisma } from "@/generated/prisma/client";
import {
	AdoptionRequestStatus,
	Role,
	TaskResult,
	TaskStatus,
	TaskType,
} from "@/generated/prisma/enums";
import type { AdoptionRequestData, CreatedAdoptionRequest } from "./adoption.type";
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

// -- Statuses a Request can still be Moved Out Of
const OPEN_STATUSES = [AdoptionRequestStatus.Pending, AdoptionRequestStatus.UnderReview] as const;

// -- Update Adoption Request Status (Admin, User)
export const updateAdoptionRequestStatus = async (
	id: string,
	user: {
		id: string;
		role: Role;
	},
	body: UpdateAdoptionRequestSchema["body"],
) => {
	const { updatedRequest, mails } = await prisma.$transaction(async (tx) => {
		const foundRequest = await tx.adoptionRequest.findFirst({
			where: {
				id,
				deletedAt: null,
			},
			select: {
				id: true,
				status: true,
				kidId: true,
				adopterId: true,
				kid: { select: { name: true } },
				adopter: { select: { email: true } },
				tasks: {
					where: { deletedAt: null },
					select: {
						type: true,
						status: true,
						result: true,
					},
				},
			},
		});

		if (!foundRequest) {
			throw new NotFoundError("Adoption request not found.");
		}

		assertStatusChangeAllowed(foundRequest, user, body.status);

		if (body.status === AdoptionRequestStatus.Approved) {
			return approveAdoptionRequest(tx, foundRequest, user.id);
		}

		const updatedRequest = await setAdoptionRequestStatus(
			tx,
			foundRequest.id,
			body.status,
			user.id,
		);

		return {
			updatedRequest,
			// Cancelling is the adopter's own action, so it needs no notification.
			mails:
				body.status === AdoptionRequestStatus.Rejected
					? [{ email: foundRequest.adopter.email, kidName: foundRequest.kid.name, approved: false }]
					: [],
		};
	});

	//  Convert this to queue
	await Promise.all(
		mails.map(({ email, kidName, approved }) =>
			approved
				? sendAdoptionRequestApprovedMail(email, kidName)
				: sendAdoptionRequestRejectedMail(email, kidName),
		),
	);

	return updatedRequest;
};

// -- Approve a Request: adopt the kid out and reject every other request for that kid
const approveAdoptionRequest = async (
	tx: Prisma.TransactionClient,
	request: AdoptionRequestData,
	adminId: string,
) => {
	// FOR UPDATE so a concurrent approval or new request cannot race us on the same kid.
	const [foundKid] = await tx.$queryRaw<{ id: string; is_adopted: boolean | null }[]>`
		SELECT id, is_adopted FROM kids_for_adoption
		WHERE id = ${request.kidId} AND deleted_at IS NULL
		FOR UPDATE
	`;

	if (!foundKid) {
		throw new NotFoundError("Kid not found.");
	} else if (foundKid.is_adopted !== false) {
		throw new ConflictError("Kid is already adopted.");
	}

	// Read the losing requests before updating them, so we still know whom to notify.
	const losingRequests = await tx.adoptionRequest.findMany({
		where: {
			kidId: request.kidId,
			id: { not: request.id },
			status: { in: [...OPEN_STATUSES] },
			deletedAt: null,
		},
		select: {
			id: true,
			adopter: { select: { email: true } },
		},
	});

	await tx.kidsForAdoption.update({
		where: { id: request.kidId },
		data: {
			isAdopted: true,
			adopterId: request.adopterId,
			updatedById: adminId,
		},
	});

	await tx.adoptionRequest.updateMany({
		where: { id: { in: losingRequests.map(({ id }) => id) } },
		data: {
			status: AdoptionRequestStatus.Rejected,
			updatedById: adminId,
		},
	});

	const updatedRequest = await setAdoptionRequestStatus(
		tx,
		request.id,
		AdoptionRequestStatus.Approved,
		adminId,
	);

	return {
		updatedRequest,
		mails: [
			{ email: request.adopter.email, kidName: request.kid.name, approved: true },
			...losingRequests.map(({ adopter }) => ({
				email: adopter.email,
				kidName: request.kid.name,
				approved: false,
			})),
		],
	};
};

// -- Write the New Status Onto a Request
const setAdoptionRequestStatus = (
	tx: Prisma.TransactionClient,
	id: string,
	status: AdoptionRequestStatus,
	updatedById: string,
) =>
	tx.adoptionRequest.update({
		where: { id },
		data: { status, updatedById },
		select: {
			id: true,
			status: true,
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
				},
			},
			updatedAt: true,
		},
	});

// -- Guard: Who may move a Request into which Status
function assertStatusChangeAllowed(
	request: AdoptionRequestData,
	user: { id: string; role: Role },
	nextStatus: AdoptionRequestStatus,
) {
	// Approved, Rejected and Cancelled requests are final for everyone.
	if (!isOpen(request)) {
		throw new BadRequestError("Invalid request: adoption request's status cannot be updated.");
	}

	if (user.role === Role.User) {
		if (request.adopterId !== user.id) {
			throw new AuthorizationError("You are not allowed to update this adoption request.");
		} else if (nextStatus !== AdoptionRequestStatus.Cancelled) {
			throw new BadRequestError("You can only cancel your own adoption request.");
		}
		return;
	}

	if (user.role !== Role.Admin) {
		throw new AuthorizationError("You are not allowed to perform this action.");
	}

	if (
		nextStatus !== AdoptionRequestStatus.Approved &&
		nextStatus !== AdoptionRequestStatus.Rejected
	) {
		throw new BadRequestError("An adoption request can only be approved or rejected.");
	}

	// Rejection needs no survey; approval does.
	if (nextStatus === AdoptionRequestStatus.Approved && !hasSuitableHomeSurvey(request)) {
		throw new BadRequestError(
			"This request cannot be approved: its home survey must be completed with a suitable result.",
		);
	}
}

// -- Check if the Adoption Request is still Awaiting a Decision
function isOpen(request: AdoptionRequestData): boolean {
	return OPEN_STATUSES.some((status) => status === request.status);
}

// -- Check if the Adoption Request's Home Survey Cleared the Adopter
function hasSuitableHomeSurvey(request: AdoptionRequestData): boolean {
	return request.tasks.some(
		(task) =>
			task.type === TaskType.AdoptionHomeSurvey &&
			task.status === TaskStatus.Completed &&
			task.result === TaskResult.Suitable,
	);
}
