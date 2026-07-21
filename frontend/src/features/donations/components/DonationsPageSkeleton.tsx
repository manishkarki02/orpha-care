import { Skeleton } from "@/components/ui/skeleton";

export default function DonationPageSkeleton() {
  return (
    <div className="py-12 md:py-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <div className="text-center mb-12 flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-64 md:w-96" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <div className="flex-1 p-4">
                <Skeleton className="h-6 w-24 mx-auto" />
              </div>
              <div className="flex-1 p-4">
                <Skeleton className="h-6 w-24 mx-auto" />
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              {/* Amount Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              {/* Payment Placeholder */}
              <Skeleton className="h-20 w-full rounded-lg" />

              {/* Button */}
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column: Impact/Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-bg-card rounded-2xl p-6 shadow-lg border border-border flex flex-col gap-4">
            <Skeleton className="h-8 w-48 mb-2" />
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
