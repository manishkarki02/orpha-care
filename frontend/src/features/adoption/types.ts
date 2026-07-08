import type { Child } from "@/features/children/types";

export interface AdoptionRequestItem {
  kidId: string;
  adopterId: string;
  kid: Child;
}

export interface PendingAdoptionRequestItem extends AdoptionRequestItem {
  adopter: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}
