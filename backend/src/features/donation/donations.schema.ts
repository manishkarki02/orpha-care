import z from "zod/v4";
import { DonationType } from "@/generated/prisma/enums";

// Field Schemas
const typeSchema = z.enum(DonationType, "Invalid Donation Type");

const amountSchema = z
	.number("Amount must be a number")
	.min(1, "Amount must be at least 1")
	.max(1000000, "Amount must be at most 1,000,000");

const weightSchema = z.number("Weight must be a number").min(0.1, "Weight must be at least 0.1 kg");

// Request Schemas
export const createDonationRequestSchema = z.object({
	body: z
		.object(
			{
				amount: amountSchema.optional(),
				weight: weightSchema.optional(),
				type: typeSchema,
			},
			"Request Body is required",
		)
		.refine(
			(data) => {
				if (data.type === DonationType.Money) {
					return data.amount !== undefined && data.weight === undefined;
				} else {
					return data.weight !== undefined && data.amount === undefined;
				}
			},
			{
				message:
					"For 'money' type, 'amount' must be provided and 'weight' must not be provided. For 'other' type, 'weight' must be provided and 'amount' must not be provided.",
			},
		),
});

export const updateDonationRequestSchema = z.object({
	params: z.object({
		id: z.uuidv4("Invalid donation ID"),
	}),
	body: z
		.object({
			type: typeSchema,
			weight: weightSchema,
		})
		.refine((data) => data.type !== DonationType.Money, "Donation amount cannot be updated."),
});

export const fetchDonationDetailRequestSchema = z.object({
	params: z.object({
		id: z.uuidv4("Invalid donation ID"),
	}),
});

export type CreateDonationRequestSchema = z.infer<typeof createDonationRequestSchema>;
export type UpdateDonationRequestSchema = z.infer<typeof updateDonationRequestSchema>;
export type FetchDonationDetailRequestSchema = z.infer<typeof fetchDonationDetailRequestSchema>;
