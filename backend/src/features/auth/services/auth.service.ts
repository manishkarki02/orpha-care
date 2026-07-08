import prisma from "@/db";
import {
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "@/common/utils/errorClass.utils";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from "@/features/auth/auth.schema";
import * as authUtils from "@/features/auth/utils/auth.utils";
import {
  consumeCachedToken,
  getCachedToken,
  setCachedToken,
} from "./tokenCache.service";
import { removeCachedUser, setCacheUser } from "./userCache.service";
import { Role } from "@/common/types/enums";
import {
  sendResetPasswordMail,
  sendVerificationMail,
} from "@/common/services/mail.service";

export const signUpUser = async (body: RegisterRequestSchema["body"]) => {
  const { name, address, email, phone, password } = body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    if (!existingUser.isVerified) {
      throw new AuthenticationError(
        "User already registered but not verified. Please verify your email."
      );
    }
    throw new BadRequestError("Email or phone number already exists");
  }

  const hashedPassword = await authUtils.generatePasswordHash(password);

  const user = await prisma.user.create({
    data: {
      name,
      address,
      email,
      phone,
      password: hashedPassword,
      role: Role.USER,
    },
  });
  if (!user) {
    throw new InternalServerError("Failed to create user");
  }

  const token = authUtils.generateRandomToken();

  await setCachedToken("verify-email", {
    email,
    token,
  });

  await sendVerificationMail(email, token);

  return user;
};

export const verifyUser = async (userEmail: string, token: string) => {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  if (!user) {
    throw new NotFoundError("User is not registered.");
  }

  if (user.isVerified) {
    throw new BadRequestError("User is already verified.");
  }

  const cachedToken = await consumeCachedToken(
    "verify-email",
    userEmail,
    token
  );
  if (!cachedToken) {
    throw new BadRequestError("Invalid or expired verification token.");
  }

  await prisma.user.update({
    where: { email: userEmail },
    data: { isVerified: true },
  });
};

export const resendVerificationToken = async (userEmail: string) => {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new NotFoundError("User is not registered.");
  }

  if (user.isVerified) {
    throw new BadRequestError("User is already verified.");
  }

  const token = authUtils.generateRandomToken();

  await setCachedToken("verify-email", {
    email: userEmail,
    token,
  });

  await sendVerificationMail(userEmail, token);
};

export const forgetPassword = async (userEmail: string) => {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new NotFoundError("User is not registered.");
  }

  if (!user.isVerified) {
    throw new BadRequestError("User is not verified.");
  }

  const token = authUtils.generateRandomToken();

  await setCachedToken("reset-password", {
    email: userEmail,
    token,
  });

  await sendResetPasswordMail(userEmail, token);
};

export const resetPassword = async (
  userEmail: string,
  token: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new NotFoundError("User is not registered.");
  }

  const cachedToken = await consumeCachedToken(
    "reset-password",
    userEmail,
    token
  );
  if (!cachedToken) {
    throw new BadRequestError("Invalid or expired password reset token.");
  }

  const hashedPassword = await authUtils.generatePasswordHash(newPassword);

  await prisma.user.update({
    where: { email: userEmail },
    data: { password: hashedPassword },
  });
};

export const signInUser = async (body: LoginRequestSchema["body"]) => {
  const { email, password } = body;

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AuthenticationError("Invalid email address or password");
  }

  if (!(await authUtils.comparePasswordHash(password, user.password))) {
    throw new AuthenticationError("Invalid email address or password");
  }

  if (!user.isVerified) {
    throw new AuthenticationError(
      "User is not verified. Please verify your email."
    );
  }

  // Create JWT token
  const accessToken = authUtils.createJWTToken({
    userId: user.id,
    role: user.role,
  });
  const refreshToken = authUtils.generateRandomToken();

  await setCachedToken("refresh-token", {
    token: refreshToken,
    userId: user.id,
  });
  await setCacheUser({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    address: user.address,
    role: user.role,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const cachedUserId = await getCachedToken("refresh-token", refreshToken);
  if (!cachedUserId) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: cachedUserId } });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  await consumeCachedToken("refresh-token", refreshToken);

  const newRefreshToken = authUtils.generateRandomToken();
  await setCachedToken("refresh-token", {
    token: newRefreshToken,
    userId: user.id,
  });

  const accessToken = authUtils.createJWTToken({
    userId: user.id,
    role: user.role,
  });

  return { accessToken, refreshToken: newRefreshToken };
};

export const signOutUser = async (userId: string, refreshToken: string) => {
  if (!refreshToken) {
    return;
  }

  const cachedToken = await getCachedToken("refresh-token", refreshToken);
  if (!cachedToken) {
    throw new AuthenticationError("Invalid refresh token");
  }

  await consumeCachedToken("refresh-token", refreshToken);
  await removeCachedUser(userId);
};
