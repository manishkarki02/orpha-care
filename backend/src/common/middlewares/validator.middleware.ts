import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodObject } from "zod/v4";
import { formatError } from "../utils/error.utils";
import { BadRequestError } from "../utils/errorClass.utils";

// ---------------------------- Combined Zod Schema Type ---------------------------- //
interface CombinedSchema extends ZodObject {
	body?: ZodObject;
	params?: ZodObject;
	query?: ZodObject;
	file?: ZodObject;
}

// ---------------------------- Validation Middleware ---------------------------- //
export const validationMiddleware = (schema: CombinedSchema) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const result = schema.safeParse({
				params: req.params,
				query: req.query,
				body: req.body,
				file: req.file,
			});

			if (!result.success) {
				return next(new BadRequestError("Validation Error", formatError(result.error)));
			}
			(["body", "params", "query", "file"] as const).forEach((key) => {
				if (req[key]) {
					Object.defineProperty(req, key, {
						value: result.data[key],
						writable: true,
						configurable: true,
						enumerable: true,
					});
				}
			});
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				return next(new BadRequestError("Validation error", formatError(error)));
			}

			return next(new BadRequestError("Unexpected validation error"));
		}
	};
};
