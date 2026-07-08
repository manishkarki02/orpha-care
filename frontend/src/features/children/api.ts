import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type { Child } from "@/features/children/types";

export const fetchChildren = async (): Promise<Child[]> => {
  const res = await api.get<ApiResponse<Child[]>>("/adoptions");
  return res.data.data;
};

export const fetchChildById = async (id: string): Promise<Child> => {
  const res = await api.get<ApiResponse<Child>>(`/adoptions/${id}`);
  return res.data.data;
};
