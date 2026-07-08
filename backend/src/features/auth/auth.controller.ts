import HttpStatus from "http-status";
import * as authService from "@/features/auth/services/auth.service";
import ApiResponse from "@/common/utils/response.utils";
import { ValidatedRequestHandler } from "@/common/types";
import {
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  ResendVerificationRequestSchema,
  ResetPasswordRequestSchema,
  VerificationRequestSchema,
} from "@/features/auth/auth.schema";
import { clearCookie, setCookie } from "@/features/auth/utils/auth.utils";
import Environment from "@/config/env.config";

export const signUpUser: ValidatedRequestHandler<
  RegisterRequestSchema
> = async (req, res) => {
  await authService.signUpUser(req.body);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.CREATED,
    message:
      "User registered successfully. Please check your email for verification.",
  });
};

export const verifyUser: ValidatedRequestHandler<
  VerificationRequestSchema
> = async (req, res) => {
  await authService.verifyUser(req.body.email, req.body.token);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "User verified successfully.",
  });
};

export const resendVerificationToken: ValidatedRequestHandler<
  ResendVerificationRequestSchema
> = async (req, res) => {
  await authService.resendVerificationToken(req.query.email);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Verification token sent successfully.",
  });
};

export const forgetPassword: ValidatedRequestHandler<
  ResendVerificationRequestSchema
> = async (req, res) => {
  await authService.forgetPassword(req.body.email);

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Password reset initiated. Please check your email.",
  });
};

export const resetPassword: ValidatedRequestHandler<
  ResetPasswordRequestSchema
> = async (req, res) => {
  await authService.resetPassword(
    req.query.email,
    req.query.token,
    req.body.newPassword
  );

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Password reset successfully.",
  });
};

export const loginUser: ValidatedRequestHandler<LoginRequestSchema> = async (
  req,
  res
) => {
  const responseData = await authService.signInUser(req.body);

  setCookie(res, {
    cookieName: "REFRESH_TOKEN",
    path: "/refresh",
    value: responseData.refreshToken,
    expiry: Environment.get("REFRESH_TOKEN_EXPIRY"),
  });

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Login successful.",
    data: responseData,
  });
};

export const refreshAccessToken: ValidatedRequestHandler<
  RefreshTokenRequestSchema
> = async (req, res) => {
  const responseData = await authService.refreshAccessToken(
    req.body.refreshToken
  );

  setCookie(res, {
    cookieName: "REFRESH_TOKEN",
    path: "/refresh",
    value: responseData.refreshToken,
    expiry: Environment.get("REFRESH_TOKEN_EXPIRY"),
  });

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Token refreshed successfully.",
    data: responseData,
  });
};

export const logoutUser: ValidatedRequestHandler = async (req, res) => {
  const refreshToken = req.cookies["REFRESH_TOKEN"];

  await authService.signOutUser(res.locals.userId, refreshToken);
  clearCookie(res, "REFRESH_TOKEN", "/refresh");

  return ApiResponse.success(res, {
    statusCode: HttpStatus.OK,
    message: "Logout successful.",
  });
};
