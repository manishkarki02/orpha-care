import { sendMail } from "@/common/services/mail.service";
import {
	AuthorizationError,
	ConflictError,
	InternalServerError,
	NotFoundError,
} from "@/common/utils/errorClass.utils";
import Environment from "@/config/env.config";
import prisma from "@/db";
import type {
	CreateAdoptionRequestSchema,
	FetchAdoptionRequestsSchema,
	UpdateAdoptionRequestSchema,
} from "@/features/adoption/adoption.schema";
import { Role } from "@/generated/prisma/enums";

// Create a new kid for adoption
export const createAdoptionKid = async (
	body: CreateAdoptionRequestSchema["body"],
	role: string,
	file: CreateAdoptionRequestSchema["file"],
) => {
	if (role !== Role.Admin) {
		throw new AuthorizationError("You are not authorized to create the kids for adoption.");
	}

	let imageUrl = null;
	if (file) {
		imageUrl = `${Environment.get("API_URL")}/uploads/${file.filename}`;
	}

	const kid = await prisma.kidsForAdoption.create({
		data: {
			picture: imageUrl,
			name: body.name,
			surname: body.surName,
			age: body.age,
			gender: body.gender,
			province: body.province,
			description: body.description,
		},
	});
	if (!kid) {
		throw new InternalServerError("Failed to create kid for adoption.");
	}

	return kid;
};

// Get all kids for adoption
export const fetchAllAdoptionKids = async (query: FetchAdoptionRequestsSchema["query"]) => {
	const queryFilter: { [key: string]: unknown } = {};
	if (query.gender) {
		queryFilter.gender = query.gender;
	}

	if (query.minAge || query.maxAge) {
		queryFilter.age = {
			...(query.minAge && { gte: query.minAge }),
			...(query.maxAge && { lte: query.maxAge }),
		};
	}

	const kids = await prisma.kidsForAdoption.findMany({
		where: {
			isAdopted: false,
			...queryFilter,
		},
	});

	return kids;
};

// Get a single kid by ID
export const fetchAdoptionKidById = async (id: string) => {
	const kid = await prisma.kidsForAdoption.findUnique({
		where: { id },
	});

	if (!kid) {
		throw new NotFoundError("Kid not found.");
	}
	return kid;
};

// Update a kid's details
export const updateAdoptionKid = async (
	id: string,
	data: UpdateAdoptionRequestSchema["body"],
	file: UpdateAdoptionRequestSchema["file"],
) => {
	const existingKid = await prisma.kidsForAdoption.findUnique({
		where: { id, isAdopted: false },
	});
	if (!existingKid) {
		throw new NotFoundError("Kid not found.");
	}

	let imageUrl = null;
	if (file) {
		imageUrl = `${Environment.get("API_URL")}/uploads/${file.filename}`;
	}

	const updatedKid = await prisma.kidsForAdoption.update({
		where: { id },
		data: {
			picture: imageUrl,
			name: data.name,
			surname: data.surName,
			age: data.age,
			gender: data.gender,
			province: data.province,
			description: data.description,
		},
	});

	if (!updatedKid) {
		throw new InternalServerError("Failed to update kid for adoption.");
	}

	return updatedKid;
};

// Get the current user's own adoption requests
export const fetchMyAdoptionRequests = async (adopterId: string) => {
	const requests = await prisma.adoptionRequest.findMany({
		where: { adopterId },
		include: { kid: true },
	});

	return requests;
};

// Get all pending adoption requests (kids not yet adopted) — ADMIN only
export const fetchPendingAdoptionRequests = async () => {
	const requests = await prisma.adoptionRequest.findMany({
		where: { kid: { isAdopted: false } },
		include: {
			kid: true,
			adopter: { select: { id: true, name: true, email: true, phone: true } },
		},
	});

	return requests;
};

// Delete a kid by ID
export const deleteAdoptionKid = async (id: string) => {
	const existingKid = await prisma.kidsForAdoption.findUnique({
		where: { id },
	});
	if (!existingKid) {
		throw new NotFoundError("Kid not found.");
	}
	await prisma.kidsForAdoption.delete({
		where: { id },
	});
	return;
};

// Request for adoption
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
