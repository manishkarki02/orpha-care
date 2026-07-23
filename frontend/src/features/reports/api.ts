import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type { MissingReport } from "@/features/reports/types";

export const getReports = async (): Promise<MissingReport[]> => {
  const res = await api.get<ApiResponse<MissingReport[]>>("/reports");
  return res.data.data;
};

export const getMyReports = async (): Promise<MissingReport[]> => {
  const res = await api.get<ApiResponse<MissingReport[]>>("/reports/me");
  return res.data.data;
};

export const getReportById = async (id: string): Promise<MissingReport> => {
  const res = await api.get<ApiResponse<MissingReport>>(`/reports/${id}`);
  return res.data.data;
};
