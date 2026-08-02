import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod";
import { formatError } from "../utils/error.utils";
import { BadRequestError } from "../utils/errorClass.utils";

type ValidatedRequestData = Partial<Pick<Request, "body" | "query" | "params" | "file" | "files">>;

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

			const data = result.data as ValidatedRequestData;

			if (data.params !== undefined) req.params = data.params;

			if (data.query !== undefined) {
				Object.defineProperty(req, "query", {
					value: data.query,
					writable: true,
					configurable: true,
					enumerable: true,
				});
			}

			if ("body" in data) req.body = data.body;
			if ("file" in data) req.file = data.file;
			if ("files" in data) req.files = data.files;

			return next();
		} catch (error) {
			return next(error);
		}
	};
};
