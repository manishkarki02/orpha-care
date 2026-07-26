import type { AdoptionRequestStatus } from "@/generated/prisma/enums";

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
