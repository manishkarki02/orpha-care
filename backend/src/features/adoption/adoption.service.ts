import { sendMail } from "@/common/services/mail.service";
import {
	BadRequestError,
	ConflictError,
	InternalServerError,
	NotFoundError,
} from "@/common/utils/errorClass.utils";
import prisma from "@/db";
import type { CreateAdoptionRequestSchema } from "@/features/adoption/adoption.schema";
import { AdoptionRequestStatus } from "@/generated/prisma/enums";

// -- Create Adoption Request
export const createAdoptionRequest = async (
	userId: string,
	body: CreateAdoptionRequestSchema["body"],
) => {
	const createdRequest = await prisma.$transaction(async (tx) => {
		const foundKid = await tx.kidsForAdoption.findUnique({
			where: {
				id: body.kidId,
				deletedAt: null,
			},
		});
		if (!foundKid) {
			throw new NotFoundError("Kid not found.");
		} else if (foundKid.isAdopted) {
			throw new ConflictError("Kid is already adopted.");
		}

		const existingRequest = await tx.adoptionRequest.findFirst({
			where: {
				adopterId: userId,
				status: {
					in: [AdoptionRequestStatus.Pending, AdoptionRequestStatus.UnderReview],
				},
				deletedAt: null,
			},
		});
		if (existingRequest) {
			throw new ConflictError(
				"You already have an adoption request that is pending or under review.",
			);
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

	//  Convert this to queue
	await sendMail(createdRequest.adopter.email, createdRequest.kid.name);

	return createdRequest;
};

// -- Get the current user's own adoption requests
export const getMyAdoptionRequests = async (adopterId: string) => {
	const requests = await prisma.adoptionRequest.findMany({
		where: { adopterId },
		include: { kid: true },
	});

	return requests;
};

// -- Get all pending adoption requests (kids not yet adopted) — ADMIN only
export const getPendingAdoptionRequests = async () => {
	const requests = await prisma.adoptionRequest.findMany({
		where: { kid: { isAdopted: false } },
		include: {
			kid: true,
			adopter: { select: { id: true, name: true, email: true, phone: true } },
		},
	});

	return requests;
};

// -- Request for adoption
export const requestForAdoption = async (kidId: string, adopterId: string) => {
	const existingKid = await prisma.kidsForAdoption.findUnique({
		where: { id: kidId },
	});
	if (!existingKid) throw new NotFoundError("Kid not found.");

	const adopter = await prisma.user.findUnique({ where: { id: adopterId } });
	if (!adopter) throw new NotFoundError("Adopter not found.");

	if (existingKid.isAdopted) {
		throw new ConflictError("Kid is already adopted.");
	}

	const adoptionReqData = await prisma.adoptionRequest.findUnique({
		where: { kidId_adopterId: { kidId, adopterId } },
		include: { kid: true, adopter: true },
	});

	if (adoptionReqData) {
		throw new ConflictError("You have already sent an adoption request.");
	}
	const createdAdoptionRequest = await prisma.adoptionRequest.create({
		data: {
			kid: { connect: { id: kidId } },
			adopter: { connect: { id: adopterId } },
		},
		include: {
			kid: true,
			adopter: { select: { id: true, name: true, email: true, phone: true } },
		},
	});

	if (!createdAdoptionRequest) {
		throw new InternalServerError("Failed to create adoption request.");
	}

	await sendMail(createdAdoptionRequest.adopter.email, createdAdoptionRequest.kid.name);

	return createdAdoptionRequest;
};
