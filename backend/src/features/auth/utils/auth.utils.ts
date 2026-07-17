import bcrypt from "bcrypt";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError, BadRequestError } from "@/common/utils/errorClass.utils";
import Environment from "@/config/env.config";

const saltRounds = 10;
type TokenPayload = { userId: string; role: string };

// ---------------------------- Cookie Utilities ---------------------------- //
export const setCookie = (
	res: Response,
	{
		cookieName,
		path,
		value,
		expiry,
	}: { cookieName: string; path: string; value: string; expiry: number },
) => {
	return res.cookie(cookieName, value, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: expiry,
		path,
	});
};

export const getCookie = (req: Request, cookieName: string): string | undefined => {
	return req.cookies[cookieName];
};

export const clearCookie = (res: Response, cookieName: string, path: string) => {
	return res.clearCookie(cookieName, { path });
};

// ---------------------------- Hashing Utilities ---------------------------- //
export const generatePasswordHash = async (password: string): Promise<string> => {
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	return hashedPassword;
};

export const comparePasswordHash = async (
	password: string,
	hashedPassword: string,
): Promise<boolean> => {
	return await bcrypt.compare(password, hashedPassword);
};

export const generateRandomToken = () => {
	return randomBytes(32).toString("base64url");
};

export const sha256 = (token: string) => {
	return createHash("sha256").update(token).digest("hex");
};

export const timeSafeCompare = (hashA: string, hashB: string): boolean => {
	const bufferA = Buffer.from(hashA, "hex");
	const bufferB = Buffer.from(hashB, "hex");

	return timingSafeEqual(bufferA, bufferB);
};

// ---------------------------- JWT Utilities ---------------------------- //
export const createJWTToken = (payload: TokenPayload) => {
	return jwt.sign(payload, Environment.get("ACCESS_TOKEN_SECRET"), {
		expiresIn: Environment.get("ACCESS_TOKEN_EXPIRY"),
	});
};

export const validateJWTToken = (token: string): { userId: string; role: string } => {
	try {
		const decoded = jwt.verify(token, Environment.get("ACCESS_TOKEN_SECRET")) as jwt.JwtPayload;

		const decodedData = decoded as { userId: string; role: string };
		if (typeof decodedData !== "object")
			throw new BadRequestError("Token payload is missing or malformed.");
		return decodedData;
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			throw new AuthenticationError(`The access token is expired.`);
		} else if (err instanceof jwt.JsonWebTokenError) {
			throw new AuthenticationError(`Invalid token. Details: ${err.message}`);
		} else {
			throw new AuthenticationError(`Access token validation failed.`);
		}
	}
};
