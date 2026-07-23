import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import useCustomQuery from "@/hooks/useCustomQuery";
import { getMyReports } from "@/features/reports/api";
import { getMyDonation } from "@/features/donation/api";
import { getMyAdoptionRequests } from "@/features/adoption/api";

export default function UserDashboard() {
  const { data: reports, isLoading: reportsLoading } = useCustomQuery({
    key: ["reports", "me"],
    queryFn: getMyReports,
  });
  const { data: donation, isLoading: donationLoading } = useCustomQuery({
    key: ["donation", "me"],
    queryFn: getMyDonation,
  });
  const { data: requests, isLoading: requestsLoading } = useCustomQuery({
    key: ["adoptions", "requests", "me"],
    queryFn: getMyAdoptionRequests,
  });

  return (
    <div className="py-12 px-6 max-w-[1200px] mx-auto min-h-screen flex flex-col gap-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark tracking-tight">
          My Dashboard
        </h1>
        <p className="text-text-muted mt-2 text-lg">
          Track your reports, donation, and adoption requests.
        </p>
      </div>

      <Section
        title="My Missing Child Reports"
        isLoading={reportsLoading}
        isEmpty={!reports?.length}
        emptyText="You haven't submitted any reports yet."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports?.map((report) => (
            <Link
              key={report.id}
              to="/reports/$reportId"
              params={{ reportId: report.id }}
              className="p-4 rounded-xl border border-border bg-white dark:bg-bg-card hover:shadow-md transition-shadow"
            >
              <p className="font-bold text-text-dark">
                {report.name ?? "Unknown Name"}
              </p>
              <p className="text-sm text-text-muted">
                {report.lastSeenAddress}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="My Donation"
        isLoading={donationLoading}
        isEmpty={!donation?.length}
        emptyText="You haven't made any donation yet."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donation?.map((donation) => (
            <div
              key={donation.id}
              className="p-4 rounded-xl border border-border bg-white dark:bg-bg-card"
            >
              <p className="font-bold text-text-dark">{donation.type}</p>
              <p className="text-sm text-text-muted">
                {donation.type === "Money"
                  ? `$${donation.amount}`
                  : `${donation.weight} kg`}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="My Adoption Requests"
        isLoading={requestsLoading}
        isEmpty={!requests?.length}
        emptyText="You haven't requested to adopt any child yet."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests?.map((request) => (
            <Link
              key={request.kidId}
              to="/children/$childId"
              params={{ childId: request.kidId }}
              className="p-4 rounded-xl border border-border bg-white dark:bg-bg-card hover:shadow-md transition-shadow"
            >
              <p className="font-bold text-text-dark">
                {request.kid.name} {request.kid.surname}
              </p>
              <p className="text-sm text-text-muted">
                {request.kid.isAdopted ? "Already adopted" : "Pending review"}
              </p>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  isLoading,
  isEmpty,
  emptyText,
  children,
}: {
  title: string;
  isLoading: boolean;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-text-dark border-b border-border pb-2">
        {title}
      </h2>
      {isLoading ? (
        <p className="text-text-muted">Loading...</p>
      ) : isEmpty ? (
        <p className="text-text-muted">{emptyText}</p>
      ) : (
        children
      )}
    </section>
  );
}
