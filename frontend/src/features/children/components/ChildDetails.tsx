import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { PLACEHOLDER_AVATAR } from "@/lib/utils";
import type { Child } from "@/features/children/types";
import { useAuthStore } from "@/store/auth-store";
import useCustomMutation from "@/hooks/useCustomMutation";
import { requestAdoption } from "@/features/adoption/api";

interface ChildDetailsProps {
  child: Child;
}

export default function ChildDetails({ child }: ChildDetailsProps) {
  const { id, name, age, gender, province, description, picture, isAdopted } =
    child;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: sendRequest, isPending, isSuccess } = useCustomMutation({
    api: requestAdoption,
    success: "Adoption request sent successfully.",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptions", "requests", "me"] });
    },
  });

  const handleInquire = () => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    sendRequest(id);
  };

  const requestSent = isSuccess;

  return (
    <div className="py-8 md:py-12 px-6 max-w-[1200px] mx-auto min-h-screen">
      {/* Breadcrumb / Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-text-muted hover:text-brand mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left Column: Image */}
        <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 shadow-xl border border-border relative group">
          <img
            src={picture ?? PLACEHOLDER_AVATAR}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold text-text-dark shadow-sm">
            ID: {id}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark tracking-tight mb-2">
              {name}
            </h1>
            {isAdopted ? (
              <div className="flex items-center gap-2 text-text-muted font-bold bg-gray-100 px-3 py-1 rounded-full w-fit">
                <span className="text-sm uppercase tracking-wider">Already Adopted</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full w-fit">
                <CheckCircle2 size={16} />
                <span className="text-sm uppercase tracking-wider">Available for Adoption</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <DetailRow label="Age" value={`${age} years old`} />
            <DetailRow label="Gender" value={gender} />
            <DetailRow label="Province" value={province} />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-text-dark border-b border-border pb-2">About {name}</h3>
            <p className="text-lg text-text-muted leading-relaxed whitespace-pre-line text-balance">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button
              disabled={isAdopted || isPending || requestSent}
              onClick={handleInquire}
              className="flex-1 bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold py-6 px-8 text-lg rounded-xl shadow-lg shadow-indigo-500/20"
            >
              {isAdopted
                ? "Already Adopted"
                : requestSent
                  ? "Request Sent"
                  : isPending
                    ? "Sending Request..."
                    : "Inquire about Adoption"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-4 last:border-0">
      <span className="text-text-muted font-medium">{label}</span>
      <span className="text-lg font-bold text-text-dark">{value}</span>
    </div>
  );
}
