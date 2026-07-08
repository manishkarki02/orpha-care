import { Router } from "express";
import * as adoptionController from "@/features/adoption/adoption.controller";
import { accessTokenValidator } from "@/common/middlewares/token.middleware";
import { requireRole } from "@/common/middlewares/role.middleware";
import { validationMiddleware } from "@/common/middlewares/validator.middleware";
import {
  adoptionRequestIdSchema,
  createAdoptionRequestSchema,
  fetchAdoptionRequestsSchema,
  updateAdoptionRequestSchema,
} from "@/features/adoption/adoption.schema";
import { upload } from "@/config/multer.config";
import { Role } from "@/common/types/enums";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Adoption
 *   description: Children adoption API
 */

/**
 * @swagger
 * /adoption:
 *   post:
 *     summary: Create a new adoption record
 *     tags: [Adoption]
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
 *               - surName
 *               - age
 *               - gender
 *               - province
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               surName:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               province:
 *                 type: string
 *                 enum: [Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, SudurPachim]
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Child record created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/",
  accessTokenValidator,
  upload.single("image"),
  validationMiddleware(createAdoptionRequestSchema),
  adoptionController.createAdoptionKid
);

/**
 * @swagger
 * /adoption:
 *   get:
 *     summary: Fetch all children available for adoption
 *     tags: [Adoption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female, Other]
 *     responses:
 *       200:
 *         description: List of children fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  accessTokenValidator,
  validationMiddleware(fetchAdoptionRequestsSchema),
  adoptionController.fetchAllKids
);

/**
 * @swagger
 * /adoption/requests/me:
 *   get:
 *     summary: Fetch the current user's own adoption requests
 *     tags: [Adoption]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the current user's adoption requests
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/requests/me",
  accessTokenValidator,
  adoptionController.fetchMyAdoptionRequests
);

/**
 * @swagger
 * /adoption/requests/pending:
 *   get:
 *     summary: Fetch all pending adoption requests (ADMIN only)
 *     tags: [Adoption]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending adoption requests
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN role required
 */
router.get(
  "/requests/pending",
  accessTokenValidator,
  requireRole(Role.ADMIN),
  adoptionController.fetchPendingAdoptionRequests
);

/**
 * @swagger
 * /adoption/{id}:
 *   get:
 *     summary: Fetch a specific child's details
 *     tags: [Adoption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Child ID
 *     responses:
 *       200:
 *         description: Child details fetched successfully
 *       404:
 *         description: Child not found
 */
router.get(
  "/:id",
  accessTokenValidator,
  validationMiddleware(adoptionRequestIdSchema),
  adoptionController.fetchAdoptionKidDetails
);

/**
 * @swagger
 * /adoption/{id}:
 *   patch:
 *     summary: Update a child's record
 *     tags: [Adoption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Child ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surName:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               province:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Child record updated successfully
 *       400:
 *         description: Validation error
 */
router.patch(
  "/:id",
  accessTokenValidator,
  upload.single("image"),
  validationMiddleware(updateAdoptionRequestSchema),
  adoptionController.updateAdoptionKid
);

/**
 * @swagger
 * /adoption/{id}:
 *   delete:
 *     summary: Delete a child's record
 *     tags: [Adoption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Child ID
 *     responses:
 *       200:
 *         description: Child record deleted successfully
 *       404:
 *         description: Child not found
 */
router.delete(
  "/:id",
  accessTokenValidator,
  validationMiddleware(adoptionRequestIdSchema),
  adoptionController.deleteAdoptionKid
);

/**
 * @swagger
 * /adoption/request/{id}:
 *   post:
 *     summary: Submit an adoption request for a child
 *     tags: [Adoption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kid ID
 *     responses:
 *       200:
 *         description: Adoption request submitted successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/request/:id",
  accessTokenValidator,
  validationMiddleware(adoptionRequestIdSchema),
  adoptionController.requestForAdoption
);

export default router;
