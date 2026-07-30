import { InternalServerError, NotFoundError } from "@/common/utils/errorClass.utils";
import Environment from "@/config/env.config";
import prisma from "@/db";
import type { UpdateVolunteerRequestSchema } from "@/features/volunteer/volunteer.schema";

// Get all volunteers
export const getAllVolunteers = async () => {
	const volunteers = await prisma.user.findMany({
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
	const volunteer = await prisma.user.findUnique({
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
	const existingVolunteer = await prisma.user.findUnique({
		where: { id },
	});
	if (!existingVolunteer) {
		throw new NotFoundError("Volunteer not found.");
	}

	let imageUrl = null;
	if (file) {
		imageUrl = `${Environment.get("API_URL")}/uploads/${file.path}`;
	}

	const updatedVolunteer = await prisma.user.update({
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
	const existingVolunteer = await prisma.user.findUnique({
		where: { id },
	});
	if (!existingVolunteer) {
		throw new NotFoundError("Volunteer not found.");
	}

	await prisma.user.delete({
		where: { id },
	});
	return;
};
