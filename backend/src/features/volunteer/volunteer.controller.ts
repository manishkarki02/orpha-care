import HttpStatus from "http-status";
import type { ValidatedRequestHandler } from "@/common/types";
import { successResponse } from "@/common/utils/response.utils";
import type {
	CreateVolunteerRequestSchema,
	UpdateVolunteerRequestSchema,
	VolunteerRequestIdSchema,
} from "@/features/volunteer/volunteer.schema";
import * as volunteerService from "@/features/volunteer/volunteer.service";

export const createVolunteer: ValidatedRequestHandler<CreateVolunteerRequestSchema> = async (
	req,
	res,
) => {
	const createdVolunteer = await volunteerService.createVolunteer(req.body, req.file);

	return successResponse(res, {
		statusCode: HttpStatus.CREATED,
		message: "Volunteer created successfully",
		data: createdVolunteer,
	});
};

export const getAllVolunteers: ValidatedRequestHandler = async (_req, res) => {
	const volunteers = await volunteerService.getAllVolunteers();

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Volunteers retrieved successfully",
		data: volunteers,
	});
};

export const getVolunteerDetail: ValidatedRequestHandler<VolunteerRequestIdSchema> = async (
	req,
	res,
) => {
	const volunteer = await volunteerService.getVolunteerById(req.params.id);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Volunteer detail retrieved successfully",
		data: volunteer,
	});
};

export const updateVolunteer: ValidatedRequestHandler<UpdateVolunteerRequestSchema> = async (
	req,
	res,
) => {
	const updatedVolunteer = await volunteerService.updateVolunteer(
		req.params.id,
		req.body,
		req.file,
	);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Volunteer updated successfully",
		data: updatedVolunteer,
	});
};

export const deleteVolunteer: ValidatedRequestHandler<VolunteerRequestIdSchema> = async (
	req,
	res,
) => {
	await volunteerService.deleteVolunteer(req.params.id);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Volunteer deleted successfully",
	});
};
