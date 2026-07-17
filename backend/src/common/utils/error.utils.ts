import type { NextFunction, Request, Response } from "express";
import type { ZodError } from "zod/v4";
import type { ValidatedRequestHandler } from "@/common/types";
import type { Errors } from "./errorClass.utils";

// ---------------------------- Format Zod Error Function ---------------------------- //
export const catchAsync =
	<T extends { params?: any; body?: any; query?: any }>(fn: ValidatedRequestHandler<T>) =>
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch((err) => next(err));
	};

// ---------------------------- Format Zod Error Function ---------------------------- //
export function formatError(errors: ZodError): Errors {
	const formattedError: Errors = {};

	for (const issue of errors?.issues ?? []) {
		if (issue.path.length === 0) continue;
		const mainField = String(issue.path[0]);
		const subField = issue.path.length > 1 ? String(issue.path[1]) : "__self";

		if (!formattedError[mainField]) {
			formattedError[mainField] = {};
		}

		formattedError[mainField][subField] = issue.message;
	}
	return formattedError;
}
