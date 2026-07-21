import { Router } from "express";
import { accessTokenValidator } from "@/common/middlewares/token.middleware";
import { validationMiddleware } from "@/common/middlewares/validator.middleware";
import * as donationController from "@/features/donation/donation.controller";
import {
	createDonationRequestSchema,
	getDonationRequestSchema,
	updateDonationRequestSchema,
} from "@/features/donation/donation.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Donation
 *   description: Donation management API
 */

/**
 * @swagger
 * /donation:
 *   post:
 *     summary: Create a new donation
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Food, Cloth, Books, Money]
 *               amount:
 *                 type: number
 *                 description: Required if type is Money
 *               weight:
 *                 type: number
 *                 description: Required if type is NOT Money
 *     responses:
 *       201:
 *         description: Donation created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post(
	"/",
	accessTokenValidator,
	validationMiddleware(createDonationRequestSchema),
	donationController.createDonation,
);

/**
 * @swagger
 * /donation:
 *   get:
 *     summary: Fetch all donation
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of donation
 *       401:
 *         description: Unauthorized
 */
router.get("/", accessTokenValidator, donationController.fetchAllDonation);

/**
 * @swagger
 * /donation/me:
 *   get:
 *     summary: Fetch donation made by the current user
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's donation
 *       401:
 *         description: Unauthorized
 */
router.get("/me", accessTokenValidator, donationController.fetchMyDonation);

/**
 * @swagger
 * /donation/{id}:
 *   get:
 *     summary: Fetch donation details
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation details
 *       404:
 *         description: Donation not found
 */
router.get(
	"/:id",
	accessTokenValidator,
	validationMiddleware(getDonationRequestSchema),
	donationController.fetchDonationDetails,
);

/**
 * @swagger
 * /donation/{id}:
 *   post:
 *     summary: Update a donation
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Donation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Food, Cloth, Books, Money]
 *               amount:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Donation updated successfully
 *       400:
 *         description: Validation error
 */
router.post(
	"/:id",
	accessTokenValidator,
	validationMiddleware(updateDonationRequestSchema),
	donationController.updateDonation,
);

/**
 * @swagger
 * /donation/{id}:
 *   delete:
 *     summary: Delete a donation
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation deleted successfully
 *       404:
 *         description: Donation not found
 */
router.delete(
	"/:id",
	accessTokenValidator,
	validationMiddleware(getDonationRequestSchema),
	donationController.deleteDonation,
);

export default router;
