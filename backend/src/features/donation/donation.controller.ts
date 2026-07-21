import HttpStatus from "http-status";
import type { ValidatedRequestHandler } from "@/common/types";
import ApiResponse from "@/common/utils/response.utils";
import * as donationervice from "@/features/donation/donation.service";
import type {
  CreateDonationRequestSchema,
  GetDonationRequestSchema,
  UpdateDonationRequestSchema,
} from "@/features/donation/donation.schema";

// Create a donation
export const createDonation: ValidatedRequestHandler<
  CreateDonationRequestSchema
> = async (req, res) => {
  const donation = await donationervice.createDonation(
    req.body,
    res.locals.userId,
  );

  return ApiResponse.success(res, {
    statusCode: HttpStatus.CREATED,
    message: "Donation created successfully.",
    data: donation,
  });
};

// Fetch all donation
export const fetchAllDonation: ValidatedRequestHandler = async (_req, res) => {
  const donation = await donationervice.fetchAllDonation();

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "All donation shown successfully.",
    data: donation,
  });
};

// Fetch only my donation
export const fetchMyDonation: ValidatedRequestHandler = async (_req, res) => {
  const donation = await donationervice.fetchMyDonation(res.locals.userId);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Donation fetched successfully.",
    data: donation,
  });
};

// Fetch a single donation by id
export const fetchDonationDetails: ValidatedRequestHandler<
  GetDonationRequestSchema
> = async (req, res) => {
  const donationDetail = await donationervice.fetchDonationById(req.params.id);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Donation detail fetched successfully.",
    data: donationDetail,
  });
};

// updating a donation
export const updateDonation: ValidatedRequestHandler<
  UpdateDonationRequestSchema
> = async (req, res) => {
  const updatedData = await donationervice.updateDonation(
    req.body,
    req.params.id,
    res.locals.userId,
  );

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Donation updated successfully.",
    data: updatedData,
  });
};

// deleting a donation
export const deleteDonation: ValidatedRequestHandler<
  GetDonationRequestSchema
> = async (req, res) => {
  await donationervice.deleteDonation(req.params.id, res.locals.userId);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Donation deleted successfully.",
  });
};
