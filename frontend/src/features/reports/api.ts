import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type { MissingReport } from "@/features/reports/types";

export const fetchReports = async (): Promise<MissingReport[]> => {
  const res = await api.get<ApiResponse<MissingReport[]>>("/reports");
  return res.data.data;
};

export const fetchMyReports = async (): Promise<MissingReport[]> => {
  const res = await api.get<ApiResponse<MissingReport[]>>("/reports/me");
  return res.data.data;
};

export const fetchReportById = async (id: string): Promise<MissingReport> => {
  const res = await api.get<ApiResponse<MissingReport>>(`/reports/${id}`);
  return res.data.data;
};
