
import Modal from "@/common/components/Modal";
import ReportCard from "@/features/reports/components/ReportCard";
import ReportCardSkeleton from "@/features/reports/components/ReportCardSkeleton";
import { fetchReports } from "@/features/reports/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, MapPin, Plus, Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(features)/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: reports, isLoading } = useCustomQuery({
    key: ["reports"],
    queryFn: fetchReports,
  });

  return (
    <div className="py-12 px-6 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-dark tracking-tight">
            Missing Child Reports
          </h1>
          <p className="text-text-muted mt-2 text-lg">
            Help us reunite children with their families.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold py-6 px-6 rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Report Missing Child
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ReportCardSkeleton key={i} />
            ))
          : (reports ?? []).map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 md:p-8 w-full max-w-lg mx-auto bg-white dark:bg-bg-card rounded-2xl relative">
            <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-dark transition-colors"
            >
                <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-text-dark mb-6">Report a Missing Child</h2>
            
            <form className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-dark">Child's Name</label>
                    <input type="text" className="w-full border border-border rounded-lg px-4 py-3 bg-bg-body focus:ring-2 focus:ring-[#6366F1]/50 outline-none" placeholder="Enter full name" />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-dark">Estimated Age</label>
                    <input type="number" className="w-full border border-border rounded-lg px-4 py-3 bg-bg-body focus:ring-2 focus:ring-[#6366F1]/50 outline-none" placeholder="e.g. 10" />
                </div>
                
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-text-dark">Photo</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-text-muted hover:bg-bg-body transition-colors cursor-pointer">
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm font-medium">Click to upload photo</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <label className="text-sm font-bold text-text-dark">Last Seen Location</label>
                         <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input type="text" className="w-full border border-border rounded-lg pl-10 pr-4 py-3 bg-bg-body focus:ring-2 focus:ring-[#6366F1]/50 outline-none" placeholder="City, Area" />
                         </div>
                    </div>
                     <div className="space-y-2">
                         <label className="text-sm font-bold text-text-dark">Last Seen Time</label>
                         <div className="relative">
                             <input type="datetime-local" className="w-full border border-border rounded-lg px-4 py-3 bg-bg-body focus:ring-2 focus:ring-[#6366F1]/50 outline-none" />
                             <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted size-5 pointer-events-none" />
                         </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-dark">Remarks</label>
                    <textarea className="w-full border border-border rounded-lg px-4 py-3 bg-bg-body focus:ring-2 focus:ring-[#6366F1]/50 outline-none min-h-[100px]" placeholder="Any distinguishing features, clothing, etc." />
                </div>
                
                <Button className="w-full bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold py-6 rounded-xl shadow-lg mt-4">
                    Submit Report
                </Button>
            </form>
        </div>
      </Modal>
    </div>
  );
}
