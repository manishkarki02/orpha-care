import { InternalServerError, NotFoundError } from "@/common/utils/errorClass.utils";
import Environment from "@/config/env.config";
import prisma from "@/db";
import type {
	CreateVolunteerRequestSchema,
	UpdateVolunteerRequestSchema,
} from "@/features/volunteer/volunteer.schema";

// Create a new volunteer
export const createVolunteer = async (
	data: CreateVolunteerRequestSchema["body"],
	file: CreateVolunteerRequestSchema["file"],
) => {
	let imageUrl = null;
	if (file) {
		imageUrl = `${Environment.get("API_URL")}/uploads/${file.path}`;
	}
	const volunteer = await prisma.volunteer.create({
		data: {
			name: data.name,
			age: data.age,
			picture: imageUrl,
		},
	});
	if (!volunteer) {
		throw new InternalServerError("Failed to create volunteer");
	}

	return volunteer;
};

// Get all volunteers
export const getAllVolunteers = async () => {
	const volunteers = await prisma.volunteer.findMany({
		select: {
			id: true,
			name: true,
			age: true,
			picture: true,
		},
	});

	return volunteers;
};

// Get a single volunteer by ID
export const getVolunteerById = async (id: string) => {
	const volunteer = await prisma.volunteer.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			age: true,
			picture: true,
		},
	});

	if (!volunteer) {
		throw new NotFoundError("Volunteer not found.");
	}

	return volunteer;
};

// Update a volunteer
export const updateVolunteer = async (
	id: string,
	data: UpdateVolunteerRequestSchema["body"],
	file: UpdateVolunteerRequestSchema["file"],
) => {
	const existingVolunteer = await prisma.volunteer.findUnique({
		where: { id },
	});
	if (!existingVolunteer) {
		throw new NotFoundError("Volunteer not found.");
	}

	let imageUrl = null;
	if (file) {
		imageUrl = `${Environment.get("API_URL")}/uploads/${file.path}`;
	}

	const updatedVolunteer = await prisma.volunteer.update({
		where: { id },
		data: {
			name: data.name,
			age: data.age,
			picture: imageUrl,
		},
	});

	if (!updatedVolunteer) {
		throw new InternalServerError("Failed to update volunteer");
	}

	return updatedVolunteer;
};

// Delete a volunteer
export const deleteVolunteer = async (id: string) => {
	const existingVolunteer = await prisma.volunteer.findUnique({
		where: { id },
	});
	if (!existingVolunteer) {
		throw new NotFoundError("Volunteer not found.");
	}

	await prisma.volunteer.delete({
		where: { id },
	});
	return;
};
