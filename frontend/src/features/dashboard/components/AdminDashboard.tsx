import useCustomQuery from "@/hooks/useCustomQuery";
import { fetchPendingAdoptionRequests } from "@/features/adoption/api";
import { fetchChildren } from "@/features/children/api";
import { fetchReports } from "@/features/reports/api";
import { fetchVolunteers } from "@/features/volunteers/api";
import { fetchAllDonations } from "@/features/donations/api";

export default function AdminDashboard() {
  const { data: pendingRequests, isLoading: requestsLoading } =
    useCustomQuery({
      key: ["adoptions", "requests", "pending"],
      queryFn: fetchPendingAdoptionRequests,
    });
  const { data: children } = useCustomQuery({
    key: ["adoptions"],
    queryFn: fetchChildren,
  });
  const { data: reports } = useCustomQuery({
    key: ["reports"],
    queryFn: fetchReports,
  });
  const { data: volunteers } = useCustomQuery({
    key: ["volunteers"],
    queryFn: fetchVolunteers,
  });
  const { data: donations } = useCustomQuery({
    key: ["donations"],
    queryFn: fetchAllDonations,
  });

  return (
    <div className="py-12 px-6 max-w-[1200px] mx-auto min-h-screen flex flex-col gap-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-text-muted mt-2 text-lg">
          Overview of platform activity and pending adoption requests.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Children Listed" value={children?.length} />
        <StatCard label="Missing Reports" value={reports?.length} />
        <StatCard label="Volunteers" value={volunteers?.length} />
        <StatCard label="Donations" value={donations?.length} />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-text-dark border-b border-border pb-2">
          Pending Adoption Requests
        </h2>
        {requestsLoading ? (
          <p className="text-text-muted">Loading...</p>
        ) : !pendingRequests?.length ? (
          <p className="text-text-muted">No pending adoption requests.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((request) => (
              <div
                key={`${request.kidId}-${request.adopterId}`}
                className="p-4 rounded-xl border border-border bg-white dark:bg-bg-card flex flex-col gap-2"
              >
                <p className="font-bold text-text-dark">
                  {request.kid.name} {request.kid.surname}
                </p>
                <p className="text-sm text-text-muted">
                  Requested by {request.adopter.name} ({request.adopter.email})
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-white dark:bg-bg-card text-center">
      <p className="text-3xl font-bold text-text-dark">{value ?? "-"}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}
