export const PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "SudurPachim",
] as const;
export type Province = (typeof PROVINCES)[number];

export type Gender = "Male" | "Female" | "Other";

export interface Child {
  id: string;
  picture: string | null;
  name: string;
  surname: string;
  age: number;
  gender: Gender;
  province: Province;
  description: string;
  isAdopted: boolean;
  adopterId: string | null;
}
