import HttpStatus from "http-status";
import type { ValidatedRequestHandler } from "@/common/types";
import { successResponse } from "@/common/utils/response.utils";
import type { CreateAdoptionRequestSchema } from "@/features/adoption/adoption.schema";
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
		statusCode: HttpStatus.OK,
		message: "Adoption request created successfully.",
		data: createdAdoptionRequest,
	});
};
