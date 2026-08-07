import type { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status";
import { MulterError } from "multer";
import { ApiError } from "../utils/errorClass.utils";
import { removeUploadedFiles } from "../utils/file.utils";
import { errorResponse } from "../utils/response.utils";

const UPLOAD_ERROR_MESSAGES: Partial<Record<MulterError["code"], string>> = {
	LIMIT_FILE_SIZE: "Each image must not exceed 5 MB",
	LIMIT_FILE_COUNT: "Too many images uploaded",
	LIMIT_UNEXPECTED_FILE: "Unexpected file field",
};

export default function globalErrorHandler(
	error: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	removeUploadedFiles(req);
	if (error instanceof ApiError) {
		return errorResponse(res, {
			statusCode: error.statusCode,
			message: error.message,
			errors: error.errors,
		});
	}

	if (error instanceof MulterError) {
		return errorResponse(res, {
			statusCode: HttpStatus.BAD_REQUEST,
			message: UPLOAD_ERROR_MESSAGES[error.code] ?? "Invalid file upload",
		});
	}

	return errorResponse(res, {
		statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
		message: "Something went wrong",
	});
}
