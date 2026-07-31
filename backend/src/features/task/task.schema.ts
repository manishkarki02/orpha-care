import { z } from "zod";
import { filterDateSchema } from "@/common/validation/common.schema";
import { queryValidationSchema } from "@/common/validation/query.schema";
import { TaskStatus, TaskType } from "@/generated/prisma/client";

const MAX_TASK_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Multipart/form-data commonly sends empty optional fields as ""
const emptyStringToUndefined = (value: unknown) => {
	if (typeof value === "string" && value.trim() === "") {
		return undefined;
	}

	return value;
};

// -- Field schemas

const requiredText = (field: string, maxLength: number) =>
	z
		.string({
			error: (issue) =>
				issue.input === undefined ? `${field} is required` : `${field} must be a string`,
		})
		.trim()
		.min(1, `${field} is required`)
		.max(maxLength, `${field} must not exceed ${maxLength} characters`);

const optionalText = (field: string, maxLength: number) =>
	z.preprocess(
		emptyStringToUndefined,
		z
			.string({
				error: `${field} must be a string`,
			})
			.trim()
			.max(maxLength, `${field} must not exceed ${maxLength} characters`)
			.nullish(),
	);

const optionalUuid = (field: string) =>
	z.preprocess(
		emptyStringToUndefined,
		z
			.uuid({
				error: `${field} must be a valid UUID`,
			})
			.nullish(),
	);

const optionalDate = z.preprocess(
	emptyStringToUndefined,
	z.iso
		.datetime({
			offset: true,
			error: "Due date must be a valid ISO datetime",
		})
		.transform((value) => new Date(value))
		.nullish(),
);

const fileSchema = z.object({
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

// -- Request schema
export const createTaskRequestSchema = z.object({
	body: z
		.object({
			title: requiredText("Title", 150),

			description: optionalText("Description", 2_000),

			type: z.enum(TaskType, {
				error: "Invalid task type",
			}),

			dueDate: optionalDate,

			volunteerId: z.uuidv4({
				error: "Assigned volunteer must be a valid UUID",
			}),

			adoptionRequestId: optionalUuid("Adoption request ID"),

			missingReportId: optionalUuid("Missing report ID"),
		})
		.refine(
			(data) => {
				if (
					(data.type === TaskType.AdoptionHomeSurvey &&
						(!data.adoptionRequestId || data.missingReportId)) ||
					(data.type === TaskType.MissingChildFollowUp &&
						(!data.missingReportId || data.adoptionRequestId))
				) {
					return false;
				}

				return true;
			},
			{
				error: "Invalid Request. Either send missing report Id",
			},
		),
	files: z
		.array(fileSchema)
		.max(MAX_TASK_IMAGES, `A task can contain at most ${MAX_TASK_IMAGES} images`)
		.optional()
		.default([]),
});

export const getMyTaskRequestSchema = z.object({
	query: z.object({
		...queryValidationSchema.shape,

		// Filter Schema
		type: z.enum(TaskType).optional(),
		status: z.enum(TaskStatus).optional(),

		// Date filter schema
		fromDate: filterDateSchema("From date"),
		toDate: filterDateSchema("To date"),
	}),
});

export const getAllTaskRequestSchema = z.object({
	query: z.object({
		...getMyTaskRequestSchema.shape.query.shape,

		volunteer: optionalUuid("Volunteer Id"),
	}),
});

export const getTaskDetailsRequestSchema = z.object({
	params: z.object({
		id: z.uuidv4("Id is invalid"),
	}),
});

// -- Type Export
export type CreateTaskRequestSchema = z.infer<typeof createTaskRequestSchema>;
export type GetMyTaskRequestSchema = z.infer<typeof getMyTaskRequestSchema>;
export type GetAllTasksRequestSchema = z.infer<typeof getAllTaskRequestSchema>;
export type GetTaskDetailRequestSchema = z.infer<typeof getTaskDetailsRequestSchema>;
