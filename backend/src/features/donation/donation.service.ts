import {
	AuthorizationError,
	InternalServerError,
	NotFoundError,
} from "@/common/utils/errorClass.utils";
import prisma from "@/db";
import type {
	CreateDonationRequestSchema,
	UpdateDonationRequestSchema,
} from "@/features/donation/donation.schema";
import { DonationType } from "@/generated/prisma/enums";

// Create a donation
export const createDonation = async (
	body: CreateDonationRequestSchema["body"],
	donorId: string,
) => {
	const data =
		body.type === DonationType.Money
			? {
					amount: body.amount,
					type: body.type,
					donorId,
				}
			: {
					weight: body.weight,
					type: body.type,
					donorId,
				};

	const donation = await prisma.donation.create({
		data: data as any,
	});

	if (!donation) {
		throw new InternalServerError("Failed to create donation.");
	}

	return donation;
};

// Fetch all donation
export const fetchAllDonation = async () => {
	const donation = await prisma.donation.findMany({
		select: {
			id: true,
			weight: true,
			amount: true,
			type: true,
			donor: {
				select: {
					name: true,
				},
			},
		},
	});

	return donation;
};

// Fetch donation made by myself
export const fetchMyDonation = async (donorId: string) => {
	const donation = await prisma.donation.findMany({
		where: {
			donorId,
		},
		select: {
			id: true,
			weight: true,
			amount: true,
			type: true,
			donor: {
				select: {
					id: true,
					name: true,
					address: true,
					email: true,
					phone: true,
				},
			},
		},
	});

	return donation;
};

// Fetch a single donation by id
export const fetchDonationById = async (donationId: string) => {
	const donationDetail = await prisma.donation.findUnique({
		where: {
			id: donationId,
		},
		select: {
			id: true,
			weight: true,
			amount: true,
			type: true,
			donor: {
				select: {
					id: true,
					name: true,
					address: true,
					email: true,
					phone: true,
				},
			},
		},
	});

	if (!donationDetail) {
		throw new NotFoundError("Donation not found.");
	}

	return donationDetail;
};

// Update a donation
export const updateDonation = async (
	body: UpdateDonationRequestSchema["body"],
	donationId: string,
	donorId: string,
) => {
	const existingDonation = await prisma.donation.findUnique({
		where: {
			id: donationId,
		},
	});

	if (!existingDonation) {
		throw new NotFoundError("Donation not found.");
	}

	if (existingDonation.donorId !== donorId) {
		throw new AuthorizationError("You are not authorized to update this donation.");
	}

	const updatedDonation = await prisma.donation.update({
		where: {
			id: donationId,
		},
		data: {
			amount: body.amount ?? existingDonation.amount,
			type: existingDonation.type,
			donorId: existingDonation.donorId,
			weight: existingDonation.weight,
		},
	});

	if (!updatedDonation) {
		throw new InternalServerError("Failed to update donation.");
	}

	return updatedDonation;
};

// Delete a donation
export const deleteDonation = async (id: string, donorId: string) => {
	const existingDonation = await prisma.donation.findUnique({
		where: { id },
	});
	if (!existingDonation) {
		throw new NotFoundError("Donation not found.");
	}

	if (existingDonation.donorId !== donorId) {
		throw new AuthorizationError("You are not authorized to delete this donation.");
	}

	await prisma.donation.delete({
		where: { id },
	});

	return;
};
