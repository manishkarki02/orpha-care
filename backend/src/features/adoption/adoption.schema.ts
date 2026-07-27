import z from "zod/v4";
import { queryValidationSchema } from "@/common/validation/query.schema";
import { AdoptionRequestStatus } from "@/generated/prisma/enums";

// -- Request Schema
export const createAdoptionRequestSchema = z.object({
	body: z.object({
		kidId: z.uuidv4("Invalid Kid Id"),
	}),
});

export const getMyAdoptionRequestsSchema = z.object({
	query: z.object({
		...queryValidationSchema.shape,
		status: z.enum(AdoptionRequestStatus).optional(),
	}),
});

export const getAllAdoptionRequestSchema = z.object({
	query: z
		.object({
			...getMyAdoptionRequestsSchema.shape.query.shape,
			sortBy: z.enum(["createdAt", "status"], "Invalid sort by value").optional(),

			fromDate: z.coerce
				.date("Invalid from date")
				.transform((d) => d.toISOString())
				.optional(),
			toDate: z.coerce
				.date("Invalid to date")
				.transform((d) => d.toISOString())
				.optional(),

			kidId: z.uuidv4("Invalid Kid Id").optional(),
			adopterId: z.uuidv4("Invalid Adopter Id").optional(),
		})
		.refine(
			(data) => !data.fromDate || !data.toDate || new Date(data.fromDate) <= new Date(data.toDate),
			"FromDate must be before or equal to toDate",
		),
});

export const getAdoptionRequestDetailsSchema = z.object({
	params: z.object({
		id: z.uuid("Invalid adoption request ID"),
	}),
});

export const updateAdoptionRequestSchema = z.object({
	params: z.object({
		id: z.uuidv4("Invalid ID"),
	}),
	body: z.object({
		status: z.enum(AdoptionRequestStatus, "Invalid Adoption Status Value"),
	}),
});

// -- Type Exports
export type CreateAdoptionRequestSchema = z.infer<typeof createAdoptionRequestSchema>;
export type GetMyAdoptionRequestsSchema = z.infer<typeof getMyAdoptionRequestsSchema>;
export type GetAllAdoptionRequestSchema = z.infer<typeof getAllAdoptionRequestSchema>;
export type GetAdoptionRequestDetailsSchema = z.infer<typeof getAdoptionRequestDetailsSchema>;
export type UpdateAdoptionRequestSchema = z.infer<typeof updateAdoptionRequestSchema>;
