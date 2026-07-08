import { ValidatedRequestHandler } from "@/common/types";
import {
  AdoptionRequestIdSchema,
  CreateAdoptionRequestSchema,
  FetchAdoptionRequestsSchema,
  UpdateAdoptionRequestSchema,
} from "@/features/adoption/adoption.schema";
import * as adoptionService from "./adoption.service";
import ApiResponse from "@/common/utils/response.utils";
import HttpStatus from "http-status";

// Create a new kid for adoption
export const createAdoptionKid: ValidatedRequestHandler<
  CreateAdoptionRequestSchema
> = async (req, res) => {
  const createdKid = await adoptionService.createAdoptionKid(
    req.body,
    res.locals.role,
    req.file
  );

  return ApiResponse.success(res, {
    statusCode: HttpStatus.CREATED,
    message: "Adoption kid created successfully.",
    data: createdKid,
  });
};

// Get all kids for adoption
export const fetchAllKids: ValidatedRequestHandler<
  FetchAdoptionRequestsSchema
> = async (req, res) => {
  const kids = await adoptionService.fetchAllAdoptionKids(req.query);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Adoption kids fetched successfully.",
    data: kids,
  });
};

export const fetchAdoptionKidDetails: ValidatedRequestHandler<
  AdoptionRequestIdSchema
> = async (req, res) => {
  const kidDetail = await adoptionService.fetchAdoptionKidById(req.params.id);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Adoption kid detail fetched successfully.",
    data: kidDetail,
  });
};

// Get the current user's own adoption requests
export const fetchMyAdoptionRequests: ValidatedRequestHandler = async (
  req,
  res
) => {
  const requests = await adoptionService.fetchMyAdoptionRequests(
    res.locals.userId
  );

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Adoption requests fetched successfully.",
    data: requests,
  });
};

// Get all pending adoption requests (ADMIN only)
export const fetchPendingAdoptionRequests: ValidatedRequestHandler = async (
  _req,
  res
) => {
  const requests = await adoptionService.fetchPendingAdoptionRequests();

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Pending adoption requests fetched successfully.",
    data: requests,
  });
};

// Update a kid's details
export const updateAdoptionKid: ValidatedRequestHandler<
  UpdateAdoptionRequestSchema
> = async (req, res) => {
  const updatedKid = await adoptionService.updateAdoptionKid(
    req.params.id,
    req.body,
    req.file
  );

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Donation updated successfully.",
    data: updatedKid,
  });
};

// Delete a kid
export const deleteAdoptionKid: ValidatedRequestHandler<
  AdoptionRequestIdSchema
> = async (req, res) => {
  await adoptionService.deleteAdoptionKid(req.params.id);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Adoption kid deleted successfully.",
  });
};

// Request for adoption
export const requestForAdoption: ValidatedRequestHandler<
  AdoptionRequestIdSchema
> = async (req, res) => {
  const createdAdoptionRequest = await adoptionService.requestForAdoption(
    req.params.id,
    res.locals.userId
  );

  return ApiResponse.success(res, {
    statusCode: HttpStatus.CREATED,
    message: "Kid adoption request sent successfully.",
    data: createdAdoptionRequest,
  });
};
