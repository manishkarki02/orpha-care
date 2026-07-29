import HttpStatus from "http-status";
import type { ValidatedRequestHandler } from "@/common/types";
import { BadRequestError } from "@/common/utils/errorClass.utils";
import { successResponse } from "@/common/utils/response.utils";
import type { CreateReportRequestSchema } from "@/features/report/report.schema";
import * as reportService from "@/features/report/report.service";

//creating a missing report
export const createMissingReport: ValidatedRequestHandler<CreateReportRequestSchema> = async (
	req,
	res,
) => {
	if (!req.file) {
		throw new BadRequestError("Image file is required.");
	}

	const missingReport = await reportService.createMissingReport(
		req.body,
		req.file,
		res.locals.userId,
	);

	return successResponse(res, {
		statusCode: HttpStatus.CREATED,
		message: "Missing report created successfully.",
		data: missingReport,
	});
};

//getting all missing reports except own
export const getAllMissingReports: ValidatedRequestHandler = async (_req, res) => {
	const missingReports = await reportService.getAllMissingReports(res.locals.userId);
	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Got all missing report lists except own.",
		data: missingReports,
	});
};

//get only my missing report
export const getMyMissingReports: ValidatedRequestHandler = async (_req, res) => {
	const myMissingReports = await reportService.getMyMissingReports(res.locals.userId);
	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Retrieved my missing reports successfully.",
		data: myMissingReports,
	});
};

//getting a single missing report by id
export const getMissingReportDetails: ValidatedRequestHandler = async (req, res) => {
	const missingReportDetail = await reportService.getMissingReportDetails(req.params.id);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Missing report details retrieved successfully.",
		data: missingReportDetail,
	});
};

// updating a missing report
export const updateMissingReport: ValidatedRequestHandler = async (req, res) => {
	if (!req.file) {
		throw new BadRequestError("Image file is required.");
	}

	const updatedMissingReport = await reportService.updateMissingReport({
		id: req.params.id,
		body: req.body,
		file: req.file,
		reporterId: res.locals.userId,
	});

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Missing report updated successfully.",
		data: updatedMissingReport,
	});
};

// deleting a missing report
export const deleteMissingReport: ValidatedRequestHandler = async (req, res) => {
	await reportService.deleteMissingReport(req.params.id, res.locals.userId);

	return successResponse(res, {
		statusCode: HttpStatus.OK,
		message: "Missing report deleted successfully.",
	});
};
