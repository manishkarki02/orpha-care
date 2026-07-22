import HttpStatus from "http-status";
import type { ValidatedRequestHandler } from "@/common/types";
import ApiResponse from "@/common/utils/response.utils";
import * as donationService from "@/features/donation/donation.service";
import type {
  CreateDonationRequestSchema,
  FetchDonationDetailRequestSchema,
  FetchDonationsRequestSchema,
  UpdateDonationRequestSchema,
} from "./donations.schema";

// Create a donation
export const createDonation: ValidatedRequestHandler<
  CreateDonationRequestSchema
> = async (req, res) => {
  const donation = await donationService.createDonation(
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
export const fetchDonations: ValidatedRequestHandler<
  FetchDonationsRequestSchema
> = async (req, res) => {
  const donation = await donationService.fetchDonations(req.query);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "All donation shown successfully.",
    data: donation,
  });
};

// Fetch only my donation
export const fetchMyDonations: ValidatedRequestHandler<
  FetchDonationsRequestSchema
> = async (req, res) => {
  const donation = await donationService.fetchMyDonations(
    req.query,
    res.locals.userId,
  );

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Donation fetched successfully.",
    data: donation,
  });
};

// Fetch a single donation by id
export const fetchDonationDetails: ValidatedRequestHandler<
  FetchDonationDetailRequestSchema
> = async (req, res) => {
  const donationDetail = await donationService.fetchDonationById(
    req.params.id,
    {
      id: res.locals.userId,
      role: res.locals.role,
    },
  );

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
  const updatedData = await donationService.updateDonation(
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
  FetchDonationDetailRequestSchema
> = async (req, res) => {
  await donationService.deleteDonation(req.params.id, res.locals.userId);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Donation deleted successfully.",
  });
};
