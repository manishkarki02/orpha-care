import HttpStatus from "http-status";
import type { ValidatedRequestHandler } from "@/common/types";
import { successResponse } from "@/common/utils/response.utils";
import type {
	CreateKidRequestSchema,
	GetAllKidsRequestSchema,
	GetKidDetailRequestSchema,
	GetKidsRequestSchema,
	UpdateKidDetailsRequestSchema,
} from "./kids.schema";
import * as kidsService from "./kids.service";

// -- Create a new kid for adoption (Admin)
export const createKid: ValidatedRequestHandler<CreateKidRequestSchema> = async (req, res) => {
	const createdKid = await kidsService.createKid(req.body, res.locals.userId, req.file);

	return successResponse(res, {
		statusCode: HttpStatus.CREATED,
		message: "Adoption kid created successfully.",
		data: createdKid,
	});
};

// -- Get kids for adoption
export const getKids: ValidatedRequestHandler<GetKidsRequestSchema> = async (req, res) => {
	const kids = await kidsService.getKids(req.query);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Adoption kids retrieved successfully.",
		data: kids,
	});
};

// -- Get All kids for adoption (Admin)
export const getAllKids: ValidatedRequestHandler<GetAllKidsRequestSchema> = async (req, res) => {
	const kids = await kidsService.getAllKids(req.query);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Adoption kids retrieved successfully.",
		data: kids,
	});
};

// -- Get Kids Details for adoption
export const getKidDetails: ValidatedRequestHandler<GetKidDetailRequestSchema> = async (
	req,
	res,
) => {
	const kidDetail = await kidsService.getKidDetailById(req.params.id, res.locals.role);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Adoption kid detail retrieved successfully.",
		data: kidDetail,
	});
};

// -- Update Kids Details for Adoption (Admin)
export const updateKidDetails: ValidatedRequestHandler<UpdateKidDetailsRequestSchema> = async (
	req,
	res,
) => {
	const updatedKid = await kidsService.updateKidDetails(
		req.params.id,
		res.locals.userId,
		req.body,
		req.file,
	);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Adoption kid details updated successfully.",
		data: updatedKid,
	});
};

// -- Delete a kid for adoption (Admin)
export const deleteKid: ValidatedRequestHandler<GetKidDetailRequestSchema> = async (req, res) => {
	await kidsService.deleteKidById(req.params.id, res.locals.userId);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Adoption kid deleted successfully.",
	});
};
