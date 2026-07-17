export type Errors = Record<string, Record<string, string>>;

// ---------------------------- Custom Error Class ---------------------------- //
export class ApiError extends Error {
	public readonly statusCode: number;
	public readonly isOperational?: boolean;
	public readonly errors?: Errors;

	constructor(
		message: string,
		statusCode: number,
		errors?: Errors,
		isOperational = true,
		stack = "",
	) {
		super(message);
		this.errors = errors;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

// ---------------------------- Bad Request Error Class ---------------------------- //
export class BadRequestError extends ApiError {
	constructor(message: string, errors?: Errors) {
		super(message, 400, errors);
	}
}

// ---------------------------- Authentication Error Class ---------------------------- //
export class AuthenticationError extends ApiError {
	constructor(message: string) {
		super(message, 401);
	}
}

// ---------------------------- Authorization Error Class ---------------------------- //
export class AuthorizationError extends ApiError {
	constructor(message: string) {
		super(message, 403);
	}
}

// ---------------------------- Not Found Error Class ---------------------------- //
export class NotFoundError extends ApiError {
	constructor(message: string) {
		super(message, 404);
	}
}

// ---------------------------- Request Timeout Error Class ---------------------------- //
export class TimeoutError extends ApiError {
	constructor(message: string) {
		super(message, 408);
	}
}

// ---------------------------- Conflict Error Class ---------------------------- //
export class ConflictError extends ApiError {
	constructor(message: string) {
		super(message, 409);
	}
}

// ---------------------------- GONE Error Class ---------------------------- //
export class GoneError extends ApiError {
	constructor(message: string) {
		super(message, 410);
	}
}

// ---------------------------- Internal Server Error Class ---------------------------- //
export class InternalServerError extends ApiError {
	constructor(message: string = "Something went wrong.") {
		super(message, 500);
	}
}
