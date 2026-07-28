import type {
	AdoptionRequestStatus,
	TaskResult,
	TaskStatus,
	TaskType,
} from "@/generated/prisma/enums";

export type CreatedAdoptionRequest = {
	id: string;
	kid: {
		id: string;
		name: string;
	};
	adopter: {
		id: string;
		name: string;
		email: string;
	};
	status: AdoptionRequestStatus;
	createdAt: Date;
	createdBy: {
		id: string;
		name: string;
	};
};

export type AdoptionRequestData = {
	kidId: string;
	status: AdoptionRequestStatus;
	adopterId: string;
	id: string;
	tasks: {
		type: TaskType;
		status: TaskStatus;
		id: string;
		result: TaskResult | null;
		deletedAt: Date | null;
	}[];
};
