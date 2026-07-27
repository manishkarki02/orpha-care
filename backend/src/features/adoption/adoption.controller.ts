import HttpStatus from "http-status";
import type { ValidatedRequestHandler } from "@/common/types";
import { paginatedResponse, successResponse } from "@/common/utils/response.utils";
import type {
	CreateAdoptionRequestSchema,
	GetAdoptionRequestDetailsSchema,
	GetAllAdoptionRequestSchema,
	GetMyAdoptionRequestsSchema,
	UpdateAdoptionRequestSchema,
} from "@/features/adoption/adoption.schema";
import * as adoptionService from "./adoption.service";

// -- Create a Adoption Request
export const createAdoptionRequest: ValidatedRequestHandler<CreateAdoptionRequestSchema> = async (
	req,
	res,
) => {
	const createdAdoptionRequest = await adoptionService.createAdoptionRequest(
		res.locals.userId,
		req.body,
	);

	return successResponse(res, {
		statusCode: HttpStatus.CREATED,
		message: "Adoption request created successfully.",
		data: createdAdoptionRequest,
	});
};

// -- Get Adoption Requests (Admin)
export const getAllAdoptionRequests: ValidatedRequestHandler<GetAllAdoptionRequestSchema> = async (
	req,
	res,
) => {
	const { data, pagination } = await adoptionService.getAllAdoptionRequests(req.query);

	return paginatedResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Adoption Requests fetched successfully.",
		data,
		pagination,
	});
};

// -- Get My Adoption Requests
export const getMyAdoptionRequests: ValidatedRequestHandler<GetMyAdoptionRequestsSchema> = async (
	req,
	res,
) => {
	const { data, pagination } = await adoptionService.getMyAdoptionRequests(
		res.locals.userId,
		req.query,
	);

	return paginatedResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Adoption requests fetched successfully.",
		data,
		pagination,
	});
};

// -- Get Adoption Requests Detail
export const getAdoptionRequestDetails: ValidatedRequestHandler<
	GetAdoptionRequestDetailsSchema
> = async (req, res) => {
	const data = await adoptionService.getAdoptionRequestDetails(req.params.id, {
		id: res.locals.userId,
		role: res.locals.role,
	});

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Adoption request detail fetched successfully.",
		data,
	});
};

// -- Update Adoption Request Status (Admin, User)
export const updateAdoptionRequestStatus: ValidatedRequestHandler<UpdateAdoptionRequestSchema> = async (req, res) => {
}