import { createFileRoute } from "@tanstack/react-router";
import ReportDetails from "@/features/reports/components/ReportDetails";
import ReportDetailsSkeleton from "@/features/reports/components/ReportDetailsSkeleton";
import useCustomQuery from "@/hooks/useCustomQuery";
import { getReportById } from "@/features/reports/api";

export const Route = createFileRoute("/reports/$reportId")({
  component: ReportDetailsPage,
});

function ReportDetailsPage() {
  const { reportId } = Route.useParams();
  const { data: report, isLoading, isError } = useCustomQuery({
    key: ["reports", reportId],
    queryFn: () => getReportById(reportId),
  });

  if (isLoading) {
    return <ReportDetailsSkeleton />;
  }

  if (isError || !report) {
    return <div className="p-12 text-center text-xl">Report not found</div>;
  }

  return <ReportDetails report={report} />;
}
