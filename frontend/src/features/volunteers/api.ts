import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type { Volunteer } from "@/features/volunteers/types";

export const fetchVolunteers = async (): Promise<Volunteer[]> => {
  const res = await api.get<ApiResponse<Volunteer[]>>("/volunteers");
  return res.data.data;
};
