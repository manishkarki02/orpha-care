import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type {
  CreateDonationPayload,
  Donation,
} from "@/features/donations/types";

export const createDonation = async (
  payload: CreateDonationPayload
): Promise<Donation> => {
  const res = await api.post<ApiResponse<Donation>>("/donations", payload);
  return res.data.data;
};

export const fetchMyDonations = async (): Promise<Donation[]> => {
  const res = await api.get<ApiResponse<Donation[]>>("/donations/me");
  return res.data.data;
};

export const fetchAllDonations = async (): Promise<Donation[]> => {
  const res = await api.get<ApiResponse<Donation[]>>("/donations");
  return res.data.data;
};
