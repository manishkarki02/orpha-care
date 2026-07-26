import HttpStatus from "http-status";
import type { ValidatedRequestHandler } from "@/common/types";
import { paginatedResponse, successResponse } from "@/common/utils/response.utils";
import type {
	CreateAdoptionRequestSchema,
	GetAllAdoptionRequestSchema,
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
