import type { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status";
import { ApiError } from "../utils/errorClass.utils";
import ApiResponse from "../utils/response.utils";

export default function globalErrorHandler(
	error: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (error instanceof ApiError) {
		return ApiResponse.error(res, {
			statusCode: error.statusCode,
			message: error.message,
			errors: error.errors,
		});
	} else {
		ApiResponse.error(res, {
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message: "Something went wrong",
		});
	}
}
