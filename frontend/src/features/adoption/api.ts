import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type {
  AdoptionRequestItem,
  PendingAdoptionRequestItem,
} from "@/features/adoption/types";

export const requestAdoption = async (
  kidId: string
): Promise<AdoptionRequestItem> => {
  const res = await api.post<ApiResponse<AdoptionRequestItem>>(
    `/adoptions/request/${kidId}`
  );
  return res.data.data;
};

export const fetchMyAdoptionRequests = async (): Promise<
  AdoptionRequestItem[]
> => {
  const res = await api.get<ApiResponse<AdoptionRequestItem[]>>(
    "/adoptions/requests/me"
  );
  return res.data.data;
};

export const fetchPendingAdoptionRequests = async (): Promise<
  PendingAdoptionRequestItem[]
> => {
  const res = await api.get<ApiResponse<PendingAdoptionRequestItem[]>>(
    "/adoptions/requests/pending"
  );
  return res.data.data;
};
