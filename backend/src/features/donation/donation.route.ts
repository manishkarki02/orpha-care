import { Router } from "express";
import { requireRole } from "@/common/middlewares/role.middleware";
import { accessTokenValidator } from "@/common/middlewares/token.middleware";
import { validationMiddleware } from "@/common/middlewares/validator.middleware";
import * as donationController from "@/features/donation/donation.controller";
import { Role } from "@/generated/prisma/enums";
import {
	createDonationRequestSchema,
	getDonationDetailRequestSchema,
	getDonationsRequestSchema,
	updateDonationRequestSchema,
	updateDonationStatusRequestSchema,
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
 *
 *     Every response uses the shared envelope: `{ status, message, data }` for
 *     single resources, `{ status, statusCode, message, data, pagination }` for
 *     lists and `{ status, message, errors }` for failures.
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
 *     DonationRecord:
 *       type: object
 *       description: Full donation row, returned by the create and update endpoints.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         type:
 *           $ref: '#/components/schemas/DonationType'
 *         status:
 *           $ref: '#/components/schemas/DonationStatus'
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
 *         donorId:
 *           type: string
 *           format: uuid
 *         createdById:
 *           type: string
 *           format: uuid
 *         updatedById:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         deletedById:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
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
 *       description: Projection returned by the detail endpoint. It does not include `status`.
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
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 42
 *         totalPages:
 *           type: integer
 *           example: 5
 *         hasNext:
 *           type: boolean
 *           example: true
 *         hasPrev:
 *           type: boolean
 *           example: false
 *     ApiError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Validation error
 *         errors:
 *           type: object
 *           nullable: true
 *           description: |
 *             Field-keyed validation details, grouped by request part
 *             (`body`, `params`, `query`). `__self` holds an object-level message.
 *             Null for non-validation failures.
 *           additionalProperties:
 *             type: object
 *             additionalProperties:
 *               type: string
 *           example:
 *             body:
 *               weight: Weight must be at least 0.1 kg
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
 * /donations:
 *   post:
 *     summary: Create a new donation
 *     description: |
 *       Creates a donation owned by the authenticated user.
 *
 *       Exactly one of `amount` or `weight` must be sent:
 *       - `type: Money` requires `amount` and forbids `weight`.
 *       - Any other type requires `weight` and forbids `amount`.
 *
 *       New donations always start with status `Pending`. The full donation row
 *       is returned.
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
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Donation created successfully.
 *                 data:
 *                   $ref: '#/components/schemas/DonationRecord'
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
 * /donations:
 *   get:
 *     summary: Get all donations (admin only)
 *     description: |
 *       Returns a paginated list of every non-deleted donation. Requires the `Admin` role.
 *
 *       Sorting falls back to `createdAt desc` when `sortBy` is omitted.
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 150
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 5
 *           maximum: 100
 *           default: 10
 *         description: Must be a multiple of 5
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, amount, weight, status]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Case-insensitive search on the donor's name
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/DonationType'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/DonationStatus'
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Only donations created on or after this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Only donations created on or before this date. Must not be earlier than `fromDate`.
 *     responses:
 *       200:
 *         description: Paginated list of donations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: All donation shown successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DonationListItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
	"/",
	accessTokenValidator,
	requireRole(Role.Admin),
	validationMiddleware(getDonationsRequestSchema),
	donationController.getDonations,
);

/**
 * @swagger
 * /donations/me:
 *   get:
 *     summary: Get donations made by the current user
 *     description: |
 *       Returns a paginated list of the authenticated user's own non-deleted donations.
 *
 *       Free-text search is disabled on this endpoint: `q` is accepted by validation
 *       but ignored. Sorting falls back to `createdAt desc` when `sortBy` is omitted.
 *     tags: [Donation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 150
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 5
 *           maximum: 100
 *           default: 10
 *         description: Must be a multiple of 5
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, amount, weight, status]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/DonationType'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/DonationStatus'
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Only donations created on or after this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Only donations created on or before this date. Must not be earlier than `fromDate`.
 *     responses:
 *       200:
 *         description: Paginated list of the user's donations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Donation retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DonationListItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
	"/me",
	accessTokenValidator,
	validationMiddleware(getDonationsRequestSchema),
	donationController.getMyDonations,
);

/**
 * @swagger
 * /donations/{id}:
 *   get:
 *     summary: Get donation details
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
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Donation detail retrieved successfully.
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
	validationMiddleware(getDonationDetailRequestSchema),
	donationController.getDonationDetails,
);

/**
 * @swagger
 * /donations/{id}:
 *   patch:
 *     summary: Update a donation
 *     description: |
 *       Partially updates a donation and returns the full updated row. Only the
 *       donation's own donor may call this — admins receive 404 for donations they
 *       do not own.
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
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Donation updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/DonationRecord'
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
 * /donations/{id}/status:
 *   patch:
 *     summary: Update a donation's status (admin only)
 *     description: |
 *       Changes the `status` of a donation and returns the full updated row.
 *       Requires the `Admin` role.
 *
 *       Constraints:
 *       - The status may **not** be set back to `Pending` (400).
 *       - Soft-deleted donations are treated as not found (404).
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
 *             required: [status]
 *             properties:
 *               status:
 *                 allOf:
 *                   - $ref: '#/components/schemas/DonationStatus'
 *                 description: New status. `Pending` passes validation but is rejected with 400.
 *           examples:
 *             receive:
 *               summary: Mark as received
 *               value: { status: Received }
 *             reject:
 *               summary: Reject the donation
 *               value: { status: Rejected }
 *     responses:
 *       200:
 *         description: Donation status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Donation status updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/DonationRecord'
 *       400:
 *         description: Validation error, or status was set back to Pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
	"/:id/status",
	accessTokenValidator,
	requireRole(Role.Admin),
	validationMiddleware(updateDonationStatusRequestSchema),
	donationController.updateDonationStatus,
);

/**
 * @swagger
 * /donations/{id}:
 *   delete:
 *     summary: Cancel a donation
 *     description: |
 *       Soft-deletes the donation (sets `deletedAt`). Only the donation's own donor
 *       may call this — admins receive 404 for donations they do not own.
 *       Only donations with status `Pending` can be cancelled. No donation payload
 *       is returned; `data` is null.
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
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Donation deleted successfully.
 *                 data:
 *                   nullable: true
 *                   example: null
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
	validationMiddleware(getDonationDetailRequestSchema),
	donationController.deleteDonation,
);

export default router;
