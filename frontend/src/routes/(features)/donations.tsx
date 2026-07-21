import DonationForm from "@/features/donation/components/DonationForm";
import DonationPageSkeleton from "@/features/donation/components/DonationPageSkeleton";
import ImpactSidebar from "@/features/donation/components/ImpactSidebar";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/(features)/donation")({
  component: DonationPage,
});

function DonationPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DonationPageSkeleton />;
  }

  return (
    <div className="py-12 md:py-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <div className="text-center mb-12 flex flex-col items-center gap-4">
        <h1 className="text-4xl md:text-5xl font-bold text-text-dark tracking-tight">
          Make a Difference Today
        </h1>
        <p className="text-lg md:text-xl text-text-muted max-w-2xl text-balance">
          Your contribution directly supports the health, education, and
          well-being of children in need.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
        {/* Left Column: Donation Form */}
        <div className="lg:col-span-2">
          <DonationForm />
        </div>

        {/* Right Column: Impact & Trust */}
        <div className="lg:col-span-1 space-y-6">
          <ImpactSidebar />
        </div>
      </div>
    </div>
  );
}
