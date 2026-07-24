import { InternalServerError, NotFoundError } from "@/common/utils/errorClass.utils";
import buildPrismaQuery from "@/common/utils/query.utils";
import Environment from "@/config/env.config";
import { kidsAllQueryConfig, kidsQueryConfig } from "@/config/query.config";
import prisma from "@/db";
import { Role } from "@/generated/prisma/enums";
import type {
	CreateKidRequestSchema,
	GetAllKidsRequestSchema,
	GetKidsRequestSchema,
	UpdateKidDetailsRequestSchema,
} from "./kids.schema";

// -- Create a new kid for adoption
export const createKid = async (
	body: CreateKidRequestSchema["body"],
	userId: string,
	file: CreateKidRequestSchema["file"],
) => {
	let imageUrl = null;
	if (file) {
		imageUrl = `${Environment.get("API_URL")}/uploads/${file.filename}`;
	}

	const kid = await prisma.kidsForAdoption.create({
		data: {
			image: imageUrl,
			name: body.name,
			dob: body.dob,
			gender: body.gender,
			province: body.province,
			description: body.description,
			createdById: userId,
		},
	});
	if (!kid) {
		throw new InternalServerError("Failed to create kid for adoption.");
	}

	return kid;
};

// -- Get all kids for adoption
export const getKids = async (query: GetKidsRequestSchema["query"]) => {
	const { where, take, orderBy, skip } = buildPrismaQuery(query, kidsQueryConfig);

	const kids = await prisma.kidsForAdoption.findMany({
		where: {
			...where,
			isAdopted: false,
			deletedAt: null,
		},
		take,
		orderBy,
		skip,
		select: {
			id: true,
			image: true,
			name: true,
			dob: true,
			gender: true,
		},
	});

	return kids;
};

// -- Get all kids for adoption (Admin)
export const getAllKids = async (query: GetAllKidsRequestSchema["query"]) => {
	const { where, take, orderBy, skip } = buildPrismaQuery(query, kidsAllQueryConfig);

	const kids = await prisma.kidsForAdoption.findMany({
		where: {
			...where,
			deletedAt: null,
		},
		take,
		orderBy,
		skip,
		select: {
			id: true,
			image: true,
			name: true,
			dob: true,
			gender: true,
			createdAt: true,
			createdBy: {
				select: {
					id: true,
					name: true,
				},
			},
			updatedAt: true,
			updatedBy: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	return kids;
};

// -- Get a single kid by ID
export const getKidDetailById = async (id: string, role: Role) => {
	const where: { id: string; isAdopted?: boolean } = { id };
	if (role !== Role.Admin) {
		where.isAdopted = false;
	}
	const kid = await prisma.kidsForAdoption.findUnique({
		where: { ...where, deletedAt: null },
		select: {
			id: true,
			image: true,
			name: true,
			dob: true,
			gender: true,
			province: true,
			description: true,
			createdAt: true,
			updatedAt: true,
			createdBy: {
				select: {
					id: true,
					name: true,
				},
			},
			updatedBy: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	if (!kid) {
		throw new NotFoundError("Kid not found.");
	}
	return kid;
};

// -- Update a kid's details
export const updateKidDetails = async (
	id: string,
	userId: string,
	data: UpdateKidDetailsRequestSchema["body"],
	file: UpdateKidDetailsRequestSchema["file"],
) => {
	return await prisma.$transaction(async (tx) => {
		const existingKid = await tx.kidsForAdoption.findUnique({
			where: { id, isAdopted: false, deletedAt: null },
		});
		if (!existingKid) {
			throw new NotFoundError("Kid not found.");
		}

		let imageUrl: string | undefined;
		if (file) {
			imageUrl = `${Environment.get("API_URL")}/uploads/${file.filename}`;
		}

		return await tx.kidsForAdoption.update({
			where: { id },
			data: {
				image: imageUrl,
				name: data.name,
				dob: data.dob,
				gender: data.gender,
				province: data.province,
				description: data.description,
				updatedById: userId,
			},
		});
	});
};

// -- Delete a Kid by Id
export const deleteKidById = async (id: string, userId: string) => {
	await prisma.$transaction(async (tx) => {
		const existingKid = await tx.kidsForAdoption.findUnique({
			where: { id, deletedAt: null, isAdopted: false },
		});
		if (!existingKid) {
			throw new NotFoundError("Kid not found.");
		}
		await tx.kidsForAdoption.update({
			where: { id },
			data: {
				deletedAt: new Date(),
				updatedById: userId,
				deletedById: userId,
			},
		});
	});
	return;
};
