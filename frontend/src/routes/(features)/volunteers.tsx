import VolunteerCard from "@/features/volunteers/components/VolunteerCard";
import VolunteerCardSkeleton from "@/features/volunteers/components/VolunteerCardSkeleton";
import { fetchVolunteers } from "@/features/volunteers/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(features)/volunteers")({
  component: VolunteersPage,
});

function VolunteersPage() {
  const { data: volunteers, isLoading } = useCustomQuery({
    key: ["volunteers"],
    queryFn: fetchVolunteers,
  });

  return (
    <div className="py-12 px-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="text-center mb-16 max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-4xl md:text-5xl font-bold text-text-dark tracking-tight">
          Meet Our Heroes
        </h1>
        <p className="text-lg md:text-xl text-text-muted text-balance">
          The dedicated individuals who generously give their time and hearts to make a difference in the lives of our children.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <VolunteerCardSkeleton key={i} />
            ))
          : (volunteers ?? []).map((volunteer) => (
              <VolunteerCard key={volunteer.id} volunteer={volunteer} />
            ))}
      </div>
    </div>
  );
}
