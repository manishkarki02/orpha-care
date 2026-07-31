import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod";
import { formatError } from "../utils/error.utils";
import { BadRequestError } from "../utils/errorClass.utils";

export const validationMiddleware = <TSchema extends ZodObject>(schema: TSchema) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const result = await schema.safeParseAsync({
				params: req.params,
				query: req.query,
				body: req.body,
				file: req.file,
				files: req.files,
			});

			if (!result.success) {
				return next(new BadRequestError("Validation error", formatError(result.error)));
			}

			req.validated = result.data;

			return next();
		} catch (error) {
			return next(error);
		}
	};
};
