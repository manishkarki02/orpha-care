import { useState } from "react";
import ChildCard from "./ChildCard";
import ChildCardSkeleton from "./ChildCardSkeleton";
import { cn } from "@/lib/utils";
import useCustomQuery from "@/hooks/useCustomQuery";
import { getChildren } from "@/features/children/api";
import { PROVINCES } from "@/features/children/types";

const FILTERS = ["All", ...PROVINCES] as const;

export default function ChildrenGrid() {
  const [activeProvince, setActiveProvince] = useState<string>("All");
  const { data: children, isLoading } = useCustomQuery({
    key: ["adoptions"],
    queryFn: getChildren,
  });

  const filteredChildren =
    activeProvince === "All"
      ? (children ?? [])
      : (children ?? []).filter((child) => child.province === activeProvince);

  return (
    <section className="py-12 md:py-20 px-6 max-w-[1400px] mx-auto" id="children-grid">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-dark tracking-tight">
            Waiting for a Family
          </h2>
          <p className="text-text-muted mt-2 text-lg">
            Meet the wonderful children looking for a forever home.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((province) => (
            <button
              key={province}
              onClick={() => setActiveProvince(province)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeProvince === province
                  ? "bg-text-dark text-white shadow-lg scale-105"
                  : "bg-white text-text-muted hover:bg-gray-100 border border-border"
              )}
            >
              {province}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ChildCardSkeleton key={i} />
            ))
          : filteredChildren.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
      </div>

      {!isLoading && filteredChildren.length === 0 && (
        <p className="text-center text-text-muted py-12">
          No children found for this province.
        </p>
      )}
    </section>
  );
}
