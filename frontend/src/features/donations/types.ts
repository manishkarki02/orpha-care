export type DonationType = "Food" | "Cloth" | "Books" | "Money";

export interface CreateDonationPayload {
  type: DonationType;
  amount?: number;
  weight?: number;
}

export interface Donation {
  id: string;
  type: DonationType;
  amount: number | null;
  weight: number | null;
  donorId: string;
}
