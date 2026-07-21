import type { NextFunction, Request, Response } from "express";
import { AuthorizationError } from "@/common/utils/errorClass.utils";
import type { Role } from "@/generated/prisma/enums";

export const requireRole = (...roles: Role[]) => {
	return (_req: Request, res: Response, next: NextFunction) => {
		if (!roles.includes(res.locals.role)) {
			throw new AuthorizationError("You are not authorized to perform this action.");
		}
		next();
	};
};
