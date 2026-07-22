import z from "zod";
import { Order } from "../types/enums";

export const queryValidationSchema = z.object({
	page: z.coerce
		.number("Page number must be number")
		.positive("Page number cannot be negative")
		.min(1, "Page number cannot be less than 1")
		.max(150, "Page number cannot be more than 150")
		.optional(),

	limit: z.coerce
		.number("Limit must be a number.")
		.positive("Limit must be a positive value")
		.min(5, "Limit cannot be less than 5")
		.max(100, "Limit cannot be more than 100")
		.refine((val) => val % 5 === 0, "Limit must be multiple of 5")
		.optional(),

	order: z.enum(Order).optional(),
	q: z.string("Search value must be string").trim().optional(),
});
