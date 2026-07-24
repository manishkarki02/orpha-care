import { Router } from "express";
import { requireRole } from "@/common/middlewares/role.middleware";
import { accessTokenValidator } from "@/common/middlewares/token.middleware";
import { validationMiddleware } from "@/common/middlewares/validator.middleware";
import { upload } from "@/config/multer.config";
import { Role } from "@/generated/prisma/enums";
import * as kidsController from "./kids.controller";
import {
	createKidRequestSchema,
	getAllKidsRequestSchema,
	getKidDetailRequestSchema,
	getKidsRequestSchema,
	updateKidDetailsRequestSchema,
} from "./kids.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Kids
 *   description: Management of kids available for adoption
 */

/**
 * @swagger
 * /kids:
 *   post:
 *     summary: Create a new kid for adoption (Admin only)
 *     tags: [Kids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dob
 *               - gender
 *               - province
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth (cannot be in the future)
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               province:
 *                 type: string
 *                 enum: [Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, SudurPachim]
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional photo (JPEG, PNG, or JPG)
 *     responses:
 *       201:
 *         description: Adoption kid created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin role required
 */
router.post(
	"/",
	accessTokenValidator,
	requireRole(Role.Admin),
	upload.single("image"),
	validationMiddleware(createKidRequestSchema),
	kidsController.createKid,
);

/**
 * @swagger
 * /kids:
 *   get:
 *     summary: Get kids available for adoption (public)
 *     description: Returns only kids that have not been adopted. No authentication required.
 *     tags: [Kids]
 *     security: []
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
 *         description: Search by name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, dob, province, name]
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter kids born on or after this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter kids born on or before this date
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female, Other]
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *           enum: [Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, SudurPachim]
 *     responses:
 *       200:
 *         description: Adoption kids retrieved successfully
 *       400:
 *         description: Validation error
 */
router.get("/", validationMiddleware(getKidsRequestSchema), kidsController.getKids);

/**
 * @swagger
 * /kids/all:
 *   get:
 *     summary: Get all kids including adopted ones (Admin only)
 *     tags: [Kids]
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
 *         description: Search by name or creator's name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, dob, province, name]
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female, Other]
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *           enum: [Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, SudurPachim]
 *       - in: query
 *         name: isAdopted
 *         schema:
 *           type: boolean
 *         description: Filter by adoption status
 *     responses:
 *       200:
 *         description: Adoption kids retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin role required
 */
router.get(
	"/all",
	accessTokenValidator,
	requireRole(Role.Admin),
	validationMiddleware(getAllKidsRequestSchema),
	kidsController.getAllKids,
);

/**
 * @swagger
 * /kids/{id}:
 *   get:
 *     summary: Get a single kid's details (public)
 *     description: Non-admin callers can only view kids that have not been adopted.
 *     tags: [Kids]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Kid ID
 *     responses:
 *       200:
 *         description: Adoption kid detail retrieved successfully
 *       400:
 *         description: Invalid kid id
 *       404:
 *         description: Kid not found
 */
router.get("/:id", validationMiddleware(getKidDetailRequestSchema), kidsController.getKidDetails);

/**
 * @swagger
 * /kids/{id}:
 *   patch:
 *     summary: Update a kid's details (Admin only)
 *     tags: [Kids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Kid ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               province:
 *                 type: string
 *                 enum: [Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, SudurPachim]
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Kid updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin role required
 *       404:
 *         description: Kid not found
 */
router.patch(
	"/:id",
	accessTokenValidator,
	requireRole(Role.Admin),
	upload.single("image"),
	validationMiddleware(updateKidDetailsRequestSchema),
	kidsController.updateKidDetails,
);

/**
 * @swagger
 * /kids/{id}:
 *   delete:
 *     summary: Delete a kid for adoption (Admin only)
 *     description: Performs a soft delete.
 *     tags: [Kids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Kid ID
 *     responses:
 *       200:
 *         description: Adoption kid deleted successfully
 *       400:
 *         description: Invalid kid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin role required
 *       404:
 *         description: Kid not found
 */
router.delete(
	"/:id",
	accessTokenValidator,
	requireRole(Role.Admin),
	validationMiddleware(getKidDetailRequestSchema),
	kidsController.deleteKid,
);

export default router;
