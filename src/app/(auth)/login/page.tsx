"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, LoginInput } from "@/lib/validations/auth.schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isDemoLoading, setIsDemoLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      if (res?.error) {
        toast.error("Authentication Failed", {
          description: "Invalid email or password. Please try again.",
        });
        return;
      }

      toast.success("Welcome back!", {
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred during sign in");
    }
  };

  // Demo user quick login / register helper
  const handleQuickDemo = async () => {
    try {
      setIsDemoLoading(true);
      const demoEmail = "demo@apexfinance.io";
      const demoPassword = "DemoPassword123!";

      // Try signing in
      const res = await signIn("credentials", {
        redirect: false,
        email: demoEmail,
        password: demoPassword,
      });

      if (res?.error) {
        // If demo user does not exist yet, auto-register it!
        const regRes = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Major Project Evaluator",
            email: demoEmail,
            password: demoPassword,
            confirmPassword: demoPassword,
          }),
        });

        if (regRes.ok) {
          // Now sign in
          await signIn("credentials", {
            redirect: false,
            email: demoEmail,
            password: demoPassword,
          });

          // Seed sample data for the newly registered demo user
          await fetch("/api/seed", { method: "POST" });
        }
      }

      toast.success("Signed in with Demo Account");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Demo login failed");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 shadow-lg shadow-blue-500/25 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            ApexFinance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intelligent Personal Expense Tracker & Financial Analytics
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/80 shadow-xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access your financial dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* One-click Demo Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleQuickDemo}
              disabled={isDemoLoading || isSubmitting}
              className="w-full border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/50 text-xs font-semibold h-10"
            >
              <ShieldCheck className="h-4 w-4 mr-2 text-blue-600" />
              {isDemoLoading ? "Setting up Demo..." : "Quick Demo Login (One-Click)"}
            </Button>

            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              <span className="absolute bg-white px-2 text-[10px] font-bold uppercase text-slate-400 dark:bg-slate-900">
                Or Continue With Email
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isDemoLoading}
                className="w-full text-xs sm:text-sm font-semibold h-10 mt-2"
              >
                {isSubmitting ? "Authenticating..." : "Sign In"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800/60 pt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Create one now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
