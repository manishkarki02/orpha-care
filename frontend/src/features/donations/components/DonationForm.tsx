import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import useCustomMutation from "@/hooks/useCustomMutation";
import { createDonation } from "@/features/donation/api";

const PRESET_AMOUNTS = [25, 50, 100];
const GOODS_TYPES = ["Food", "Cloth", "Books"] as const;

const donationchema = z
  .object({
    type: z.enum(["Money", "Food", "Cloth", "Books"]),
    amount: z
      .number()
      .min(1, "Amount must be at least 1")
      .max(1000000, "Amount must be at most 1,000,000")
      .optional(),
    weight: z.number().min(0.1, "Weight must be at least 0.1 kg").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "Money") {
      if (data.amount === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Amount is required",
          path: ["amount"],
        });
      }
    } else if (data.weight === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Weight is required",
        path: ["weight"],
      });
    }
  });

type DonationValues = z.infer<typeof donationchema>;

export default function DonationForm() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeTab, setActiveTab] = useState<"money" | "goods">("money");

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<DonationValues>({
    resolver: zodResolver(donationchema),
    defaultValues: { type: "Money", amount: 50 },
  });

  const selectedType = watch("type");

  const { mutate: donate, isPending } = useCustomMutation({
    api: createDonation,
    success: "Thank you for your donation!",
    onSuccess: () => reset({ type: "Money", amount: 50 }),
  });

  const switchToMoney = () => {
    setActiveTab("money");
    reset({ type: "Money", amount: 50 });
  };

  const switchToGoods = () => {
    setActiveTab("goods");
    reset({ type: "Food", weight: undefined });
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-bg-card rounded-[20px] shadow-sm border border-border p-10 text-center flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-text-dark">Sign in to donate</h3>
        <p className="text-text-muted">
          Create an account or sign in to make a donation.
        </p>
        <Link to="/sign-in">
          <Button className="bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold px-8 py-6 rounded-xl">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((data) => donate(data))}
      className="bg-white dark:bg-bg-card rounded-[20px] shadow-sm border border-border overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={switchToMoney}
          className={cn(
            "flex-1 py-4 text-sm font-bold text-center transition-colors border-b-2",
            activeTab === "money"
              ? "border-[#6366F1] text-[#6366F1]"
              : "border-transparent text-text-muted hover:text-text-dark",
          )}
        >
          Donate Money
        </button>
        <button
          type="button"
          onClick={switchToGoods}
          className={cn(
            "flex-1 py-4 text-sm font-bold text-center transition-colors border-b-2",
            activeTab === "goods"
              ? "border-[#6366F1] text-[#6366F1]"
              : "border-transparent text-text-muted hover:text-text-dark",
          )}
        >
          Donate Goods
        </button>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-8">
        {activeTab === "money" ? (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-dark">
              Choose an amount
            </label>
            <p className="text-sm text-text-muted mb-2">
              Choose a preset amount or enter a custom one. Every donation
              helps.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() =>
                    setValue("amount", amount, { shouldValidate: true })
                  }
                  className={cn(
                    "py-3 rounded-lg text-sm font-bold transition-all border",
                    watch("amount") === amount
                      ? "bg-white border-[#6366F1] text-[#6366F1] shadow-sm"
                      : "bg-gray-50 dark:bg-gray-800 border-transparent text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700",
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    className="w-full bg-white dark:bg-gray-900 border border-border rounded-lg px-4 py-3 h-auto focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />
                )}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold text-text-dark">
              What are you donating?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GOODS_TYPES.map((goodsType) => (
                <button
                  key={goodsType}
                  type="button"
                  onClick={() =>
                    setValue("type", goodsType, { shouldValidate: true })
                  }
                  className={cn(
                    "py-3 rounded-lg text-sm font-bold transition-all border",
                    selectedType === goodsType
                      ? "bg-white border-[#6366F1] text-[#6366F1] shadow-sm"
                      : "bg-gray-50 dark:bg-gray-800 border-transparent text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700",
                  )}
                >
                  {goodsType}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Controller
                control={control}
                name="weight"
                render={({ field }) => (
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    className="w-full bg-white dark:bg-gray-900 border border-border rounded-lg px-4 py-3 h-auto focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />
                )}
              />
              {errors.weight && (
                <p className="text-sm text-red-500">{errors.weight.message}</p>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold py-6 text-lg rounded-xl shadow-lg mt-2"
        >
          {isPending ? "Submitting..." : "Donate"}
        </Button>
      </div>
    </form>
  );
}
