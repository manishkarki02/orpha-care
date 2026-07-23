import HttpStatus from "http-status";
import type { ValidatedRequestHandler } from "@/common/types";
import { successResponse } from "@/common/utils/response.utils";
import * as donationService from "@/features/donation/donation.service";
import type {
	CreateDonationRequestSchema,
	GetDonationDetailRequestSchema,
	GetDonationsRequestSchema,
	UpdateDonationRequestSchema,
	UpdateDonationStatusRequestSchema,
} from "./donations.schema";

// Create a donation
export const createDonation: ValidatedRequestHandler<CreateDonationRequestSchema> = async (
	req,
	res,
) => {
	const donation = await donationService.createDonation(req.body, res.locals.userId);

	return successResponse(res, {
		statusCode: HttpStatus.CREATED,
		message: "Donation created successfully.",
		data: donation,
	});
};

// Get all donation
export const getDonations: ValidatedRequestHandler<GetDonationsRequestSchema> = async (
	req,
	res,
) => {
	const donation = await donationService.getDonations(req.query);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "All donation shown successfully.",
		data: donation,
	});
};

// Get only my donation
export const getMyDonations: ValidatedRequestHandler<GetDonationsRequestSchema> = async (
	req,
	res,
) => {
	const donation = await donationService.getMyDonations(req.query, res.locals.userId);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Donation retrieved successfully.",
		data: donation,
	});
};

// Get a single donation by id
export const getDonationDetails: ValidatedRequestHandler<GetDonationDetailRequestSchema> = async (
	req,
	res,
) => {
	const donationDetail = await donationService.getDonationById(req.params.id, {
		id: res.locals.userId,
		role: res.locals.role,
	});

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Donation detail retrieved successfully.",
		data: donationDetail,
	});
};

// updating a donation
export const updateDonation: ValidatedRequestHandler<UpdateDonationRequestSchema> = async (
	req,
	res,
) => {
	const updatedData = await donationService.updateDonation(
		req.body,
		req.params.id,
		res.locals.userId,
	);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Donation updated successfully.",
		data: updatedData,
	});
};

export const updateDonationStatus: ValidatedRequestHandler<
	UpdateDonationStatusRequestSchema
> = async (req, res) => {
	const updatedData = await donationService.updateDonationStatus(
		req.params.id,
		res.locals.userId,
		req.body,
	);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Donation status updated successfully.",
		data: updatedData,
	});
};

// deleting a donation
export const deleteDonation: ValidatedRequestHandler<GetDonationDetailRequestSchema> = async (
	req,
	res,
) => {
	await donationService.deleteDonation(req.params.id, res.locals.userId);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Donation deleted successfully.",
	});
};
