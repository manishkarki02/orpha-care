import { validationMiddleware } from "@/common/middlewares/validator.middleware";
import {
  loginRequestSchema,
  refreshTokenRequestSchema,
  registerRequestSchema,
  resendVerificationRequestSchema,
  resetPasswordRequestSchema,
  verificationRequestSchema,
} from "@/features/auth/auth.schema";
import * as authController from "@/features/auth/auth.controller";
import { Router } from "express";
import { catchAsync } from "@/common/utils/error.utils";
import { accessTokenValidator } from "@/common/middlewares/token.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - phone
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
  "/signup",
  validationMiddleware(registerRequestSchema),
  catchAsync(authController.signUpUser)
);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Invalid token or email
 *       500:
 *         description: Internal server error
 */

router.post(
  "/verify",
  validationMiddleware(verificationRequestSchema),
  catchAsync(authController.verifyUser)
);

/**
 * @swagger
 * /auth/resend-verification:
 *   get:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email address
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Validation error or user already verified
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/resend-verification",
  validationMiddleware(resendVerificationRequestSchema),
  catchAsync(authController.resendVerificationToken)
);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 */
router.post(
  "/signin",
  validationMiddleware(loginRequestSchema),
  catchAsync(authController.loginUser)
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  "/refresh",
  validationMiddleware(refreshTokenRequestSchema),
  catchAsync(authController.refreshAccessToken)
);

/**
 * @swagger
 * /auth/signout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/signout",
  accessTokenValidator,
  catchAsync(authController.logoutUser)
);

/**
 * @swagger
 * /auth/forget-password:
 *   get:
 *     summary: Request password reset link
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email address
 *     responses:
 *       200:
 *         description: Reset password email sent successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/forget-password",
  validationMiddleware(resendVerificationRequestSchema),
  catchAsync(authController.forgetPassword)
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error or invalid token
 *       500:
 *         description: Internal server error
 */
router.post(
  "/reset-password",
  validationMiddleware(resetPasswordRequestSchema),
  catchAsync(authController.resetPassword)
);

export default router;
