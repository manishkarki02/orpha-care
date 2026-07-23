import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type {
  CreateDonationPayload,
  Donation,
} from "@/features/donation/types";

export const createDonation = async (
  payload: CreateDonationPayload,
): Promise<Donation> => {
  const res = await api.post<ApiResponse<Donation>>("/donation", payload);
  return res.data.data;
};

export const getMyDonation = async (): Promise<Donation[]> => {
  const res = await api.get<ApiResponse<Donation[]>>("/donation/me");
  return res.data.data;
};

export const getAllDonation = async (): Promise<Donation[]> => {
  const res = await api.get<ApiResponse<Donation[]>>("/donation");
  return res.data.data;
};
