import { createFileRoute } from "@tanstack/react-router";
import ChildDetails from "@/features/children/components/ChildDetails";
import ChildDetailsSkeleton from "@/features/children/components/ChildDetailsSkeleton";
import useCustomQuery from "@/hooks/useCustomQuery";
import { fetchChildById } from "@/features/children/api";

export const Route = createFileRoute("/children/$childId")({
  component: ChildDetailsPage,
});

function ChildDetailsPage() {
  const { childId } = Route.useParams();
  const { data: child, isLoading, isError } = useCustomQuery({
    key: ["adoptions", childId],
    queryFn: () => fetchChildById(childId),
  });

  if (isLoading) {
    return <ChildDetailsSkeleton />;
  }

  if (isError || !child) {
    return <div className="p-12 text-center text-xl">Child not found</div>;
  }

  return <ChildDetails child={child} />;
}
