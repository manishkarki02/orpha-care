import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export default function AboutHero() {
  return (
    <section className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20 py-12 lg:py-20">
      <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-dark tracking-tight text-balance">
          Building Brighter Futures, One Child at a Time
        </h1>
        <p className="text-lg text-text-muted text-balance max-w-2xl lg:max-w-none mx-auto">
          Learn about our journey, our mission, and the incredible community
          dedicated to providing a safe and nurturing home for every child.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
          <Link to="/donation">
            <Button className="bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold py-6 px-8 text-lg rounded-xl shadow-lg w-full sm:w-auto">
              Donate Now
            </Button>
          </Link>
          <Link to="/volunteers">
            <Button
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-text-dark font-bold py-6 px-8 text-lg rounded-xl w-full sm:w-auto"
            >
              Get Involved
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 w-full max-w-lg lg:max-w-none">
        <div className="relative aspect-square lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white dark:bg-bg-card shadow-xl border border-border p-4">
          <div className="w-full h-full rounded-[2rem] overflow-hidden bg-amber-50 relative">
            {/* Illustration Placeholder - Using a friendly group photo as proxy */}
            <img
              src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2670&auto=format&fit=crop"
              alt="Happy children group"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
