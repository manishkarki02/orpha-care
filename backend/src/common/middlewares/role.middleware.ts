import type { NextFunction, Request, Response } from "express";
import type { Role } from "@/common/types/enums";
import { AuthorizationError } from "@/common/utils/errorClass.utils";

export const requireRole = (...roles: Role[]) => {
	return (_req: Request, res: Response, next: NextFunction) => {
		if (!roles.includes(res.locals.role)) {
			throw new AuthorizationError("You are not authorized to perform this action.");
		}
		next();
	};
};
