import { Router } from "express";
import { accessTokenValidator } from "@/common/middlewares/token.middleware";
import { validationMiddleware } from "@/common/middlewares/validator.middleware";
import { upload } from "@/config/multer.config";
import * as reportController from "@/features/report/report.controller";
import {
	createReportRequestSchema,
	fetchReportDetailsRequestSchema,
	updateReportRequestSchema,
} from "@/features/report/report.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Missing persons report API
 */

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Create a new missing person report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - lastSeenAddress
 *               - lastSeenTime
 *               - age
 *               - remarks
 *               - longitude
 *               - latitude
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               lastSeenAddress:
 *                 type: string
 *               lastSeenTime:
 *                 type: string
 *               age:
 *                 type: number
 *               remarks:
 *                 type: string
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
	"/",
	accessTokenValidator,
	upload.single("image"),
	validationMiddleware(createReportRequestSchema),
	reportController.createMissingReport,
);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Fetch all missing persons reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 *       401:
 *         description: Unauthorized
 */
router.get("/", accessTokenValidator, reportController.fetchAllMissingReports);

/**
 * @swagger
 * /reports/me:
 *   get:
 *     summary: Fetch reports created by the current user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reports
 *       401:
 *         description: Unauthorized
 */
router.get("/me", accessTokenValidator, reportController.fetchMyMissingReports);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Fetch report details
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *       404:
 *         description: Report not found
 */
router.get(
	"/:id",
	accessTokenValidator,
	validationMiddleware(fetchReportDetailsRequestSchema),
	reportController.fetchMissingReportDetails,
);

/**
 * @swagger
 * /reports/{id}:
 *   patch:
 *     summary: Update a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastSeenAddress:
 *                 type: string
 *               lastSeenTime:
 *                 type: string
 *               age:
 *                 type: number
 *               remarks:
 *                 type: string
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       400:
 *         description: Validation error
 */
router.patch(
	"/:id",
	accessTokenValidator,
	validationMiddleware(updateReportRequestSchema),
	reportController.updateMissingReport,
);

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 */
router.delete(
	"/:id",
	accessTokenValidator,
	validationMiddleware(fetchReportDetailsRequestSchema),
	reportController.deleteMissingReport,
);

export default router;
