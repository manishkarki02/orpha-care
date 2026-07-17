import { create } from "domain";
import { Router } from "express";
import { accessTokenValidator } from "@/common/middlewares/token.middleware";
import { validationMiddleware } from "@/common/middlewares/validator.middleware";
import * as volunteerController from "@/features/volunteer/volunteer.controller";
import {
	createVolunteerRequestSchema,
	updateVolunteerRequestSchema,
	volunteerRequestIdSchema,
} from "@/features/volunteer/volunteer.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Volunteers
 *   description: Volunteer management API
 */

/**
 * @swagger
 * /volunteer:
 *   post:
 *     summary: Register as a volunteer
 *     tags: [Volunteers]
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
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Volunteer registered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post(
	"/",
	accessTokenValidator,
	validationMiddleware(createVolunteerRequestSchema),
	volunteerController.createVolunteer,
);

/**
 * @swagger
 * /volunteer:
 *   get:
 *     summary: Fetch all volunteers
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of volunteers
 *       401:
 *         description: Unauthorized
 */
router.get("/", accessTokenValidator, volunteerController.fetchAllVolunteers);

/**
 * @swagger
 * /volunteer/{id}:
 *   get:
 *     summary: Fetch volunteer details
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Volunteer ID
 *     responses:
 *       200:
 *         description: Volunteer details
 *       404:
 *         description: Volunteer not found
 */
router.get(
	"/:id",
	accessTokenValidator,
	validationMiddleware(volunteerRequestIdSchema),
	volunteerController.fetchVolunteerDetail,
);

/**
 * @swagger
 * /volunteer/{id}:
 *   post:
 *     summary: Update a volunteer
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Volunteer ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Volunteer updated successfully
 *       400:
 *         description: Validation error
 */
router.post(
	"/:id",
	accessTokenValidator,
	validationMiddleware(updateVolunteerRequestSchema),
	volunteerController.updateVolunteer,
);

/**
 * @swagger
 * /volunteer/{id}:
 *   delete:
 *     summary: Delete a volunteer
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Volunteer ID
 *     responses:
 *       200:
 *         description: Volunteer deleted successfully
 *       404:
 *         description: Volunteer not found
 */
router.delete(
	"/:id",
	accessTokenValidator,
	validationMiddleware(volunteerRequestIdSchema),
	volunteerController.deleteVolunteer,
);

export default router;
