import z from "zod/v4";

// Field Schemas
const lastSeenAddressSchema = z.string().min(1, "Last seen address is required");
const remarksSchema = z.string().min(1, "Remarks is required");
const ageSchema = z.number().positive("Age must be a non-negative number");
const lastSeenTimeSchema = z.string().min(1, "Last seen time is required");
const coordinatesSchema = (coordinateFor: string) =>
	z
		.number()
		.min(-180, `${coordinateFor} must be between -180 and 180`)
		.max(180, `${coordinateFor} must be between -180 and 180`);
const fileSchema = z.object({
	fieldname: z.string(),
	originalname: z.string(),
	encoding: z.string(),
	mimetype: z.string().refine((value) => ["image/jpeg", "image/png", "image/jpg"].includes(value), {
		message: "Invalid file type. Only JPEG, PNG, and JPG are allowed.",
	}), // narrows to allowed values
	destination: z.string().optional(), // present for diskStorage
	filename: z.string(),
	path: z.string(),
	size: z.number().int().nonnegative(),
});

// Reports Schema
export const createReportRequestSchema = z.object({
	body: z.object({
		name: z.string().optional(),
		lastSeenAddress: lastSeenAddressSchema,
		lastSeenTime: lastSeenTimeSchema,
		age: ageSchema,
		remarks: remarksSchema,
		longitude: coordinatesSchema("Longitude"),
		latitude: coordinatesSchema("Latitude"),
	}),
	file: fileSchema,
});

export const updateReportRequestSchema = z.object({
	params: z.object({
		id: z.uuid("Invalid report ID"),
	}),
	body: createReportRequestSchema.shape.body.partial(),
	file: createReportRequestSchema.shape.file.optional(),
});

export const fetchReportDetailsRequestSchema = z.object({
	params: z.object({
		id: z.uuid("Invalid report ID"),
	}),
});

export type CreateReportRequestSchema = z.infer<typeof createReportRequestSchema>;
export type UpdateReportRequestSchema = z.infer<typeof updateReportRequestSchema>;
export type FetchReportDetailsRequestSchema = z.infer<typeof fetchReportDetailsRequestSchema>;
