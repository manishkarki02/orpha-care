import z from "zod/v4";
import { queryValidationSchema } from "@/common/validation/query.schema";
import { Gender, Province } from "@/generated/prisma/enums";

// -- Field Schema
const genderSchema = z.enum(Gender);

const fileSchema = z.object({
	fieldname: z.string(),
	originalname: z.string(),
	encoding: z.string(),
	mimetype: z.string().refine((value) => ["image/jpeg", "image/png", "image/jpg"].includes(value), {
		message: "Invalid file type. Only JPEG, PNG, and JPG are allowed.",
	}),
	destination: z.string().optional(),
	filename: z.string(),
	path: z.string(),
	size: z.number().int().nonnegative(),
});

// -- Request Schemas
export const createKidRequestSchema = z.object({
	body: z.object({
		name: z.string().trim().nonempty("Name is required"),
		dob: z.coerce
			.date("Date of birth must be a valid date")
			.refine((value) => value <= new Date(), "Date of birth cannot be in the future."),
		gender: genderSchema,
		province: z.enum(Province),
		description: z.string().trim().max(500, "Description must be at most 500 characters long"),
	}),
	file: fileSchema.optional(),
});

export const getKidsRequestSchema = z.object({
	query: z
		.object({
			...queryValidationSchema.shape,
			sortBy: z.enum(["createdAt", "dob", "province", "name"], "Invalid sort by value").optional(),

			fromDate: z.coerce
				.date("Invalid from date")
				.transform((d) => d.toISOString())
				.optional(),
			toDate: z.coerce
				.date("Invalid to date")
				.transform((d) => d.toISOString())
				.optional(),

			gender: genderSchema.optional(),
			province: z.enum(Province).optional(),
		})
		.refine(
			(data) => !data.fromDate || !data.toDate || new Date(data.fromDate) <= new Date(data.toDate),
			"FromDate must be before or equal to toDate",
		),
});

export const getAllKidsRequestSchema = z.object({
	query: z.object({
		...getKidsRequestSchema.shape.query.shape,
		isAdopted: z.stringbool("Invalid isAdopted value").optional(),
	}),
});

export const getKidDetailRequestSchema = z.object({
	params: z.object({
		id: z.uuidv4("Invalid kid id"),
	}),
});

export const updateKidDetailsRequestSchema = z.object({
	params: getKidDetailRequestSchema.shape.params,
	body: createKidRequestSchema.shape.body.partial(),
	file: createKidRequestSchema.shape.file,
});

// -- Type Exports
export type CreateKidRequestSchema = z.infer<typeof createKidRequestSchema>;
export type GetKidsRequestSchema = z.infer<typeof getKidsRequestSchema>;
export type GetAllKidsRequestSchema = z.infer<typeof getAllKidsRequestSchema>;
export type GetKidDetailRequestSchema = z.infer<typeof getKidDetailRequestSchema>;
export type UpdateKidDetailsRequestSchema = z.infer<typeof updateKidDetailsRequestSchema>;
