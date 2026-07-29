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

// Shape loaded before a status update, holding everything the rules need to decide.
export type AdoptionRequestData = {
	id: string;
	status: AdoptionRequestStatus;
	kidId: string;
	adopterId: string;
	kid: {
		name: string;
	};
	adopter: {
		email: string;
	};
	tasks: {
		type: TaskType;
		status: TaskStatus;
		result: TaskResult | null;
	}[];
};
