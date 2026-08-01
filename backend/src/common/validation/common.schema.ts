import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// -- File Schema for req.file or req.files
export const fileSchema = z.object({
	fieldname: z.literal("images", {
		error: "Invalid file field",
	}),

	originalname: z.string().min(1),

	encoding: z.string(),

	mimetype: z.enum(["image/jpeg", "image/png"], {
		error: "Only JPEG and PNG images are allowed",
	}),

	destination: z.string().min(1),

	filename: z.string().min(1),

	path: z.string().min(1),

	size: z.number().int().positive().max(MAX_FILE_SIZE, "Each image must not exceed 5 MB"),
});

export const filterDateSchema = (fieldName: string) =>
	z.coerce
		.date(`Invalid ${fieldName}`)
		.transform((d) => d.toISOString())
		.optional();

export const withValidDateRange = <T extends z.ZodObject>(schema: T) =>
	schema.refine(
		(query: { fromDate?: string; toDate?: string }) =>
			!query.fromDate || !query.toDate || new Date(query.fromDate) <= new Date(query.toDate),
		"FromDate must be before or equal to toDate",
	);
