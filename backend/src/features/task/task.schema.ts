import z from "zod/v4";
import {
	fileSchema,
	filterDateSchema,
	withValidDateRange,
} from "@/common/validation/common.schema";
import { queryValidationSchema } from "@/common/validation/query.schema";
import { TaskStatus, TaskType } from "@/generated/prisma/enums";

const MAX_TASK_IMAGES = 5;

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
			.uuidv4({
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
			(data) =>
				data.type === TaskType.AdoptionHomeSurvey
					? Boolean(data.adoptionRequestId)
					: !data.adoptionRequestId,
			{
				error:
					"Adoption request ID is required for adoption home survey tasks and must be omitted for any other type",
				path: ["adoptionRequestId"],
			},
		)
		.refine(
			(data) =>
				data.type === TaskType.MissingChildFollowUp
					? Boolean(data.missingReportId)
					: !data.missingReportId,
			{
				error:
					"Missing report ID is required for missing child follow-up tasks and must be omitted for any other type",
				path: ["missingReportId"],
			},
		),
	files: z
		.array(fileSchema)
		.max(MAX_TASK_IMAGES, `A task can contain at most ${MAX_TASK_IMAGES} images`)
		.optional()
		.default([]),
});

export const getMyTaskRequestSchema = z.object({
	query: withValidDateRange(
		z.object({
			...queryValidationSchema.shape,
			sortBy: z.enum(["title", "createdAt", "dueDate", "status"]).optional(),

			// Filter Schema
			type: z.enum(TaskType).optional(),
			status: z.enum(TaskStatus).optional(),

			// Date filter schema
			fromDate: filterDateSchema("From date"),
			toDate: filterDateSchema("To date"),
		}),
	),
});

export const getAllTaskRequestSchema = z.object({
	query: withValidDateRange(
		z.object({
			...getMyTaskRequestSchema.shape.query.shape,
			sortBy: z.enum(["dueDate", "createdAt", "updatedAt", "status", "title"]).optional(),

			volunteerId: z.uuidv4("Volunteer Id must be a valid UUID").optional(),
		}),
	),
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
