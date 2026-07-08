import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }), // Relax min length for login?
});

type SignInValues = z.infer<typeof signInSchema>;

export const SignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleResendVerification = async () => {
      const email = getValues("email");
      if(!email) {
          toast.error("Please enter your email to resend verification.");
          return;
      }
      
      setIsLoading(true);
      try {
          await api.get(`/auth/resend-verification?email=${email}`);
          toast.success("Verification email sent successfully.");
      } catch (error: any) {
           console.error(error);
           toast.error(error.response?.data?.message || "Failed to resend verification email.");
      } finally {
          setIsLoading(false);
      }
  }

  const onSubmit = async (data: SignInValues) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/signin", data);
      const { id, name, email, role, accessToken, refreshToken } = response.data.data;

      login(
          { id: id, name: name, email: email, role: role },
          accessToken,
          refreshToken
      );
      
      toast.success("Signed in successfully");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to sign in";
      toast.error(message);
      
      if (message.includes("not verified")) {
          setError("root.serverError", { 
              type: "unverified",
              message: message 
          });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-bold text-text-dark">Email or Username</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          disabled={isLoading}
          className="w-full bg-white dark:bg-bg-card border border-border rounded-lg px-4 py-3 h-auto focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-bold text-text-dark">Password</Label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[#6366F1] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full bg-white dark:bg-bg-card border border-border rounded-lg px-4 py-3 h-auto focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button 
        className="w-full bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold py-6 text-lg rounded-xl shadow-lg" 
        type="submit" 
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-text-muted">
        Don&apos;t have an account?{" "}
        <Link to="/sign-up" className="text-[#6366F1] font-bold hover:underline">
          Sign up
        </Link>
      </div>

      {errors.root?.serverError && (
         <div className="text-center">
            {errors.root.serverError.type === "unverified" && (
                <Button
                    type="button"
                    variant="link"
                    className="text-red-500 underline"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                >
                    Resend Verification Email
                </Button>
            )}
         </div>
      )}
    </form>
  );
};
