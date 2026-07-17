type BaseResponse = {
	status?: "success" | "error";
	statusCode: number;
	message: string;
};

export type SuccessResponse<T = unknown> = BaseResponse & {
	data?: T | null;
};
export type ErrorResponse<T = unknown> = BaseResponse & {
	errors?: T | null;
};

export type PaginationMetadata = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
};

export type PaginatedResponse<T = unknown> = BaseResponse & {
	data: T;
	pagination: PaginationMetadata;
};
