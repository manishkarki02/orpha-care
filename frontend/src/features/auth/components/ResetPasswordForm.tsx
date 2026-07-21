import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Depending on how routing is set up, search parameters might need configuration
  // For now we assume a basic search reading if possible, or we parse window.location
  // const search = useSearch({ strict: false }); // Tanstack router specific
  // Let's use window.location.search for simplicity if we are not sure about route def
  const searchParams = new URL(window.location.href).searchParams;
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema as any),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token || !email) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);
    try {
      const resetUrl = `/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

      await api.post(resetUrl, {
        newPassword: data.password,
        confirmNewPassword: data.confirmPassword,
      });
      toast.success("Password reset successfully. Please sign in.");
      navigate({ to: "/signin" });
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to reset password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center text-red-500">
          Invalid Request: Missing Token
        </CardContent>
        <CardFooter className="justify-center hover:underline">
          <Link to="/signin">Back to Sign In</Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
          <div className="text-center text-sm">
            <Link to="/signin" className="underline">
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
