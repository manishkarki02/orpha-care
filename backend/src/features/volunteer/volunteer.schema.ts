import z from "zod/v4";

// Field Schema
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

// Volunteer Request Schema
export const createVolunteerRequestSchema = z.object({
	body: z.object({
		name: z.string().trim().nonempty("Name is required"),
		age: z
			.number()
			.min(16, "Age must be at least 16")
			.max(123, "Age must be less than or equal to 123"),
	}),
	file: fileSchema.optional(),
});

export const volunteerRequestIdSchema = z.object({
	params: z.object({
		id: z.uuid("Invalid volunteer request ID"),
	}),
});

export const updateVolunteerRequestSchema = z.object({
	params: volunteerRequestIdSchema.shape.params,
	body: createVolunteerRequestSchema.shape.body.partial(),
	file: createVolunteerRequestSchema.shape.file,
});

// Type Exports
export type CreateVolunteerRequestSchema = z.infer<typeof createVolunteerRequestSchema>;
export type VolunteerRequestIdSchema = z.infer<typeof volunteerRequestIdSchema>;
export type UpdateVolunteerRequestSchema = z.infer<typeof updateVolunteerRequestSchema>;
