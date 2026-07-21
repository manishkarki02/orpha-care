import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export default function JoinUsCTA() {
  return (
    <section className="py-12 mt-8">
      <div className="bg-[#6366F1] rounded-[2rem] p-8 md:p-16 text-center text-white flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden isolate">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)] -z-10" />

        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Join Us in Making a Difference
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/donation" className="w-full sm:w-auto">
            <Button className="bg-white text-[#6366F1] hover:bg-gray-100 font-bold py-6 px-10 text-lg rounded-xl shadow-lg w-full">
              Donate Now
            </Button>
          </Link>
          <Link to="/volunteers" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 hover:text-white bg-transparent font-bold py-6 px-10 text-lg rounded-xl shadow-lg w-full"
            >
              Become a Volunteer
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
