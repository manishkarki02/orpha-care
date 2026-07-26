import { Router } from "express";
import { requireRole } from "@/common/middlewares/role.middleware";
import { accessTokenValidator } from "@/common/middlewares/token.middleware";
import { validationMiddleware } from "@/common/middlewares/validator.middleware";
import * as adoptionController from "@/features/adoption/adoption.controller";
import {
	createAdoptionRequestSchema,
	getAdoptionRequestDetailsSchema,
	getAllAdoptionRequestSchema,
	getMyAdoptionRequestsSchema,
} from "@/features/adoption/adoption.schema";
import { Role } from "@/generated/prisma/enums";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Adoption Requests
 *   description: Adoption request API
 */

/**
 * @swagger
 * /adoption-requests:
 *   post:
 *     summary: Create an adoption request
 *     description: Creates a pending adoption request for the authenticated user. A user cannot create a new request while another request is pending or under review.
 *     tags: [Adoption Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kidId
 *             properties:
 *               kidId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Adoption request created successfully
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
 *                   example: Adoption request created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [Pending, UnderReview, Approved, Rejected, Cancelled]
 *                     kid:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                     adopter:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     createdBy:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — User role required
 *       404:
 *         description: Kid not found
 *       409:
 *         description: Kid is already adopted or adopter already has a conflicting request
 */

router.post(
	"/",
	accessTokenValidator,
	requireRole(Role.User),
	validationMiddleware(createAdoptionRequestSchema),
	adoptionController.createAdoptionRequest,
);

/**
 * @swagger
 * /adoption-requests:
 *   get:
 *     summary: Get all adoption requests
 *     description: Admin-only paginated list of non-deleted adoption requests.
 *     tags: [Adoption Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 150
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 5
 *           maximum: 100
 *         description: Must be a multiple of 5
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by kid name or adopter name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, status]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, UnderReview, Approved, Rejected, Cancelled]
 *       - in: query
 *         name: kidId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter requests for a specific kid
 *       - in: query
 *         name: adopterId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter requests from a specific adopter
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter requests created on or after this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter requests created on or before this date
 *     responses:
 *       200:
 *         description: Paginated adoption requests retrieved successfully
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
 *                   example: Adoption Requests fetched successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                         enum: [Pending, UnderReview, Approved, Rejected, Cancelled]
 *                       kid:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           image:
 *                             type: string
 *                             nullable: true
 *                       adopter:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           image:
 *                             type: string
 *                             nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       updatedBy:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrev:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin role required
 */
router.get(
	"/",
	accessTokenValidator,
	requireRole(Role.Admin),
	validationMiddleware(getAllAdoptionRequestSchema),
	adoptionController.getAllAdoptionRequests,
);

/**
 * @swagger
 * /adoption-requests/me:
 *   get:
 *     summary: Get my adoption requests
 *     description: Returns a paginated list of non-deleted adoption requests created by the authenticated user.
 *     tags: [Adoption Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 150
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 5
 *           maximum: 100
 *         description: Must be a multiple of 5
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by kid name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, UnderReview, Approved, Rejected, Cancelled]
 *     responses:
 *       200:
 *         description: Paginated adoption requests retrieved successfully
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
 *                   example: Adoption requests fetched successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                         enum: [Pending, UnderReview, Approved, Rejected, Cancelled]
 *                       kid:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           image:
 *                             type: string
 *                             nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       updatedBy:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 3
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     hasNext:
 *                       type: boolean
 *                       example: false
 *                     hasPrev:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — User role required
 */
router.get(
	"/me",
	accessTokenValidator,
	requireRole(Role.User),
	validationMiddleware(getMyAdoptionRequestsSchema),
	adoptionController.getMyAdoptionRequests,
);

/**
 * @swagger
 * /adoption-requests/{id}:
 *   get:
 *     summary: Get adoption request details
 *     description: Returns one non-deleted adoption request. Users can only access their own request; volunteers can only access requests assigned to them; admins receive full operational details.
 *     tags: [Adoption Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Adoption request detail retrieved successfully
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
 *                   example: Adoption request detail fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [Pending, UnderReview, Approved, Rejected, Cancelled]
 *                     kid:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         image:
 *                           type: string
 *                           nullable: true
 *                         dob:
 *                           type: string
 *                           format: date-time
 *                         gender:
 *                           type: string
 *                           enum: [Male, Female, Other]
 *                         province:
 *                           type: string
 *                           enum: [Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, SudurPachim]
 *                         description:
 *                           type: string
 *                     adopter:
 *                       type: object
 *                       nullable: true
 *                       description: Included for admins and assigned volunteers. Admins also receive image and email.
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         image:
 *                           type: string
 *                           nullable: true
 *                           description: Included for admins only
 *                         email:
 *                           type: string
 *                           format: email
 *                           description: Included for admins only
 *                         phone:
 *                           type: string
 *                         address:
 *                           type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     updatedBy:
 *                       type: object
 *                       nullable: true
 *                       description: Included for admins only
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         image:
 *                           type: string
 *                           nullable: true
 *                     tasks:
 *                       type: array
 *                       nullable: true
 *                       description: Admins receive all tasks with volunteer details; assigned volunteers receive only their own task without volunteer details.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           volunteer:
 *                             type: object
 *                             nullable: true
 *                             description: Included for admins only
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               image:
 *                                 type: string
 *                                 nullable: true
 *                           status:
 *                             type: string
 *                             enum: [Pending, InProgress, Submitted, Completed]
 *                           result:
 *                             type: string
 *                             nullable: true
 *                             enum: [Suitable, NeedsReview, NotSuitable, PossibleMatch, NotFound, Found]
 *                           remarks:
 *                             type: string
 *                             nullable: true
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Adoption request not found or not accessible to the authenticated user
 */
router.get(
	"/:id",
	accessTokenValidator,
	validationMiddleware(getAdoptionRequestDetailsSchema),
	adoptionController.getAdoptionRequestDetails,
);

export default router;
