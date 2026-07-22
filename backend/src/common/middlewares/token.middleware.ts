import type { NextFunction, Request, Response } from "express";
import { getCachedToken } from "@/features/auth/services/tokenCache.service";
import * as tokenUtils from "@/features/auth/utils/auth.utils";
import { AuthenticationError } from "../utils/errorClass.utils";

function tokenValidator(tokenType: "ACCESS_TOKEN" | "REFRESH_TOKEN") {
	return async (req: Request, res: Response, next: NextFunction) => {
		const token = getToken(req, tokenType);

		if (!token) {
			throw new AuthenticationError(`${tokenType.replace("_", " ").toLowerCase()} is missing.`);
		}

		if (tokenType === "ACCESS_TOKEN") {
			const userData = await tokenUtils.validateJWTToken(token);
			res.locals.userId = userData.userId;
			res.locals.role = userData.role;
			return next();
		}

		const cached = await getCachedToken("refresh-token", token);
		if (!cached) {
			throw new AuthenticationError("Refresh token is invalid or expired.");
		}

		res.locals.refreshToken = token;
		next();
	};
}

function getToken(req: Request, type: "ACCESS_TOKEN" | "REFRESH_TOKEN"): string | null {
	if (type === "ACCESS_TOKEN") {
		const bearerToken = req.headers.authorization;
		if (!bearerToken?.trim()) {
			return null;
		}
		return bearerToken.split(" ")[1];
	}

	return req.cookies[type] || null;
}

export const accessTokenValidator = tokenValidator("ACCESS_TOKEN");
export const refreshTokenValidator = tokenValidator("REFRESH_TOKEN");
