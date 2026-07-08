import { Link } from "@tanstack/react-router";
import { PLACEHOLDER_AVATAR, colorFromId } from "@/lib/utils";
import type { Child } from "@/features/children/types";

interface ChildCardProps {
  child: Child;
}

export default function ChildCard({ child }: ChildCardProps) {
  const { id, name, age, province, picture } = child;

  return (
    <div className="flex flex-col gap-3 group">
      <div
        className="aspect-[4/5] w-full rounded-[20px] overflow-hidden relative flex items-end justify-center"
        style={{ backgroundColor: colorFromId(id) }}
      >
        <img
          src={picture ?? PLACEHOLDER_AVATAR}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="font-bold text-lg text-text-dark">{name}</h3>
        <p className="text-sm text-text-muted">
          Age: {age}, {province}
        </p>
        <Link
          to={`/children/${id}`}
          className="text-brand font-medium text-sm hover:underline mt-0.5"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
