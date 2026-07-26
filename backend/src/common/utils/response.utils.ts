import type { Response } from "express";
import type { ErrorResponse, PaginatedResponse, SuccessResponse } from "../types/index";

// ====== Success Response ====== //
export function successResponse<T>(
	res: Response,
	{ statusCode = 200, message, data = null, status = "success" }: SuccessResponse<T>,
) {
	res.status(statusCode).json({ status, message, data });
}

// ====== Error Response ====== //
export function errorResponse<T>(
	res: Response,
	{ statusCode = 400, message, errors = null, status = "error" }: ErrorResponse<T>,
) {
	res.status(statusCode).json({
		status,
		message,
		errors,
	});
}

// ====== Paginated Response ====== //
export function paginatedResponse<T>(
	res: Response,
	{ statusCode = 200, message, data, status = "success", pagination }: PaginatedResponse<T>,
) {
	const response: PaginatedResponse<T> = {
		status,
		message,
		statusCode,
		data,
		pagination,
	};

	res.status(statusCode).json(response);
}

export const buildPaginationMetaData = ({
	page = 1,
	limit = 10,
	total,
}: {
	page?: number;
	limit?: number;
	total: number;
}) => {
	const totalPages = Math.ceil(total / limit);

	return {
		page,
		limit,
		total,
		totalPages,
		hasNext: page < totalPages,
		hasPrev: page > 1,
	};
};
