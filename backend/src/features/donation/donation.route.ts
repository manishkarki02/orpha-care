import { Router } from "express";
import { requireRole } from "@/common/middlewares/role.middleware";
import { accessTokenValidator } from "@/common/middlewares/token.middleware";
import { validationMiddleware } from "@/common/middlewares/validator.middleware";
import * as donationController from "@/features/donation/donation.controller";
import { Role } from "@/generated/prisma/enums";
import {
  createDonationRequestSchema,
  fetchDonationDetailRequestSchema,
  fetchDonationsRequestSchema,
  updateDonationRequestSchema,
} from "./donations.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Donation
 *   description: |
 *     Donation management API.
 *
 *     Authorization model:
 *     - A donor may create, read, update and cancel **their own** donations.
 *     - An admin may list all donations and read any donation.
 *     - An admin may **not** update or delete another user's donation; admins
 *       only change `status`, through the admin status endpoint.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DonationType:
 *       type: string
 *       enum: [Food, Cloth, Books, Money]
 *     DonationStatus:
 *       type: string
 *       enum: [Pending, Received, Rejected, Distributed]
 *     UserSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *     DonationListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         type:
 *           $ref: '#/components/schemas/DonationType'
 *         amount:
 *           type: string
 *           nullable: true
 *           description: Decimal serialized as a string. Set only when type is Money.
 *           example: "500.00"
 *         weight:
 *           type: string
 *           nullable: true
 *           description: Decimal (kg) serialized as a string. Set only when type is not Money.
 *           example: "12.50"
 *         donor:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     DonationDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         type:
 *           $ref: '#/components/schemas/DonationType'
 *         amount:
 *           type: string
 *           nullable: true
 *           example: "500.00"
 *         weight:
 *           type: string
 *           nullable: true
 *           example: "12.50"
 *         donor:
 *           $ref: '#/components/schemas/UserSummary'
 *         createdBy:
 *           $ref: '#/components/schemas/UserSummary'
 *         updatedBy:
 *           allOf:
 *             - $ref: '#/components/schemas/UserSummary'
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *   responses:
 *     Unauthorized:
 *       description: Missing or invalid access token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     Forbidden:
 *       description: Authenticated but not allowed to perform this action
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     NotFound:
 *       description: Donation not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *     ValidationError:
 *       description: Request failed schema validation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /donation:
 *   post:
 *     summary: Create a new donation
 *     description: |
 *       Creates a donation owned by the authenticated user.
 *
 *       Exactly one of `amount` or `weight` must be sent:
 *       - `type: Money` requires `amount` and forbids `weight`.
 *       - Any other type requires `weight` and forbids `amount`.
 *
 *       New donations always start with status `Pending`.
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 $ref: '#/components/schemas/DonationType'
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 1000000
 *                 description: Required if type is Money, forbidden otherwise.
 *               weight:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 150
 *                 description: Weight in kg. Required if type is NOT Money, forbidden otherwise.
 *           examples:
 *             money:
 *               summary: Monetary donation
 *               value: { type: Money, amount: 500 }
 *             goods:
 *               summary: Goods donation
 *               value: { type: Food, weight: 12.5 }
 *     responses:
 *       201:
 *         description: Donation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Donation created successfully.
 *                 data:
 *                   $ref: '#/components/schemas/DonationDetail'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *     summary: Fetch all donations (admin only)
 *     description: Returns every non-deleted donation. Requires the `Admin` role.
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of donations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All donation shown successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DonationListItem'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/",
  accessTokenValidator,
  requireRole(Role.Admin),
  validationMiddleware(fetchDonationsRequestSchema),
  donationController.fetchDonations
);

/**
 * @swagger
 * /donation/me:
 *   get:
 *     summary: Fetch donations made by the current user
 *     description: Returns the authenticated user's own non-deleted donations.
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's donations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Donation fetched successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DonationListItem'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/me",
  accessTokenValidator,
  validationMiddleware(fetchDonationsRequestSchema),
  donationController.fetchMyDonations,
);

/**
 * @swagger
 * /donation/{id}:
 *   get:
 *     summary: Fetch donation details
 *     description: Readable by the donation's owner or by an admin. Anyone else receives 403.
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Donation detail fetched successfully.
 *                 data:
 *                   $ref: '#/components/schemas/DonationDetail'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id",
  accessTokenValidator,
  validationMiddleware(fetchDonationDetailRequestSchema),
  donationController.fetchDonationDetails,
);

/**
 * @swagger
 * /donation/{id}:
 *   patch:
 *     summary: Update a donation
 *     description: |
 *       Partially updates a donation. Only the donation's own donor may call this —
 *       admins receive 404 for donations they do not own.
 *
 *       Constraints:
 *       - At least one of `type` or `weight` must be sent.
 *       - `type` cannot be set to `Money`, and a donation that is already `Money`
 *         cannot be updated at all (400).
 *       - `amount` can never be updated.
 *       - Only donations with status `Pending` can be updated (400 otherwise).
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Donation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Food, Cloth, Books]
 *                 description: Money is not accepted here.
 *               weight:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 150
 *                 description: Weight in kg.
 *           examples:
 *             weightOnly:
 *               summary: Correct a weight
 *               value: { weight: 8 }
 *             retype:
 *               summary: Change the goods category
 *               value: { type: Books, weight: 8 }
 *     responses:
 *       200:
 *         description: Donation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Donation updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/DonationDetail'
 *       400:
 *         description: Validation error, money donation, or donation is no longer pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id",
  accessTokenValidator,
  validationMiddleware(updateDonationRequestSchema),
  donationController.updateDonation,
);

/**
 * @swagger
 * /donation/{id}:
 *   delete:
 *     summary: Cancel a donation
 *     description: |
 *       Soft-deletes the donation (sets `deletedAt`). Only the donation's own donor
 *       may call this — admins receive 404 for donations they do not own.
 *       Only donations with status `Pending` can be cancelled.
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Donation deleted successfully.
 *       400:
 *         description: Donation is no longer pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  "/:id",
  accessTokenValidator,
  validationMiddleware(fetchDonationDetailRequestSchema),
  donationController.deleteDonation,
);

export default router;
