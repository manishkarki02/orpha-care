import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generic silhouette shown when a record has no uploaded picture.
export const PLACEHOLDER_AVATAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#E5E7EB"/><circle cx="100" cy="80" r="35" fill="#9CA3AF"/><path d="M40 180c0-40 27-65 60-65s60 25 60 65" fill="#9CA3AF"/></svg>'
  );

const CARD_PALETTE = [
  "#F3EAD8",
  "#FCA5A5",
  "#A7F3D0",
  "#FDBA74",
  "#FDE68A",
  "#E5E7EB",
  "#C4B5FD",
  "#FBCFE8",
];

// Deterministic cosmetic color for cards that have no backend-provided color.
export function colorFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return CARD_PALETTE[hash % CARD_PALETTE.length];
}
