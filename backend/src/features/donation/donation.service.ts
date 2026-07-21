import {
	AuthorizationError,
	BadRequestError,
	NotFoundError,
} from "@/common/utils/errorClass.utils";
import prisma from "@/db";
import { DonationStatus, DonationType, Role } from "@/generated/prisma/enums";
import type { CreateDonationRequestSchema, UpdateDonationRequestSchema } from "./donations.schema";

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
		data: { ...data, createdById: donorId },
	});

	return donation;
};

// Fetch all donation
export const fetchDonations = async () => {
	const donation = await prisma.donation.findMany({
		where: {
			deletedAt: null,
		},
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
			createdAt: true,
		},
	});

	return donation;
};

// Fetch donation made by myself
export const fetchMyDonations = async (donorId: string) => {
	const donation = await prisma.donation.findMany({
		where: {
			donorId,
			deletedAt: null,
		},
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
			createdAt: true,
		},
	});

	return donation;
};

// Fetch a single donation by id
export const fetchDonationById = async (donationId: string, user: { id: string; role: Role }) => {
	const donationDetail = await prisma.donation.findUnique({
		where: {
			id: donationId,
			deletedAt: null,
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
				},
			},
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
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!donationDetail) {
		throw new NotFoundError("Donation not found.");
	}

	const isOwner = donationDetail?.donor?.id === user.id;
	const isAdmin = user.role === Role.Admin;

	if (!isOwner && !isAdmin) {
		throw new AuthorizationError("You do not have access to this donation");
	}

	return donationDetail;
};

// Update a donation
export const updateDonation = async (
	body: UpdateDonationRequestSchema["body"],
	donationId: string,
	donorId: string,
) => {
	return await prisma.$transaction(async (tx) => {
		const existingDonation = await tx.donation.findUnique({
			where: {
				id: donationId,
				donorId,
			},
		});

		if (!existingDonation || existingDonation.deletedAt) {
			throw new NotFoundError("Donation not found.");
		}

		if (existingDonation.type === DonationType.Money) {
			throw new BadRequestError("Money donation cannot be updated.");
		}

		if (existingDonation.status !== DonationStatus.Pending) {
			throw new BadRequestError(
				"Only pending donations can be updated. Please create a new donation instead.",
			);
		}

		return await tx.donation.update({
			where: {
				id: donationId,
			},
			data: {
				type: body.type,
				weight: body.weight,
				updatedById: donorId,
			},
		});
	});
};

// Delete a donation
export const deleteDonation = async (id: string, donorId: string) => {
	await prisma.$transaction(async (tx) => {
		const existingDonation = await tx.donation.findUnique({
			where: { id, donorId },
		});
		if (!existingDonation || existingDonation.deletedAt) {
			throw new NotFoundError("Donation not found.");
		}

		if (existingDonation.status !== DonationStatus.Pending) {
			throw new BadRequestError("Only pending donations can be deleted.");
		}

		await tx.donation.update({
			where: { id },
			data: {
				updatedById: donorId,
				deletedAt: new Date(),
				deletedById: donorId,
			},
		});
	});
};
