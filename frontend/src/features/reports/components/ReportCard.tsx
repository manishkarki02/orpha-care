import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { PLACEHOLDER_AVATAR } from "@/lib/utils";
import type { MissingReport } from "@/features/reports/types";

interface ReportCardProps {
  report: MissingReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  const { id, name, age, lastSeenAddress, lastSeenTime, image } = report;

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-bg-card rounded-[20px] p-4 shadow-sm border border-border">
      <div className="aspect-[4/5] w-full rounded-[16px] overflow-hidden bg-gray-100">
        <img
          src={image ?? PLACEHOLDER_AVATAR}
          alt={name ?? "Missing child"}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-text-dark">{name ?? "Unknown Name"}</h3>
        <p className="text-sm text-text-muted font-medium">
            Estimated Age: <span className="text-text-dark">{age}</span>
        </p>

        <div className="flex gap-2 items-start mt-1">
            <MapPin className="size-4 text-brand shrink-0 mt-0.5" />
            <p className="text-sm text-text-muted leading-tight">
                Last seen at <span className="text-text-dark font-medium">{lastSeenAddress}</span>, on {new Date(lastSeenTime).toLocaleString()}
            </p>
        </div>

        <Link to={`/reports/${id}`} className="mt-4 w-full">
            <Button className="w-full bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold rounded-lg shadow-md">
                View Detail Page
            </Button>
        </Link>
      </div>
    </div>
  );
}
