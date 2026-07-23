import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/layouts/SiteLayout";
import { BackgroundShapes } from "@/components/BackgroundShapes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — GenZ's" },
      { name: "description", content: "Reset your GenZ's account password." },
      { property: "og:title", content: "Forgot Password — GenZ's" },
      { property: "og:description", content: "Reset your GenZ's account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(data.email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent — check your inbox.");
  };

  return (
    <SiteLayout>
      <section className="relative">
        <BackgroundShapes />
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">GenZ's</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Forgot Password</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-10"
          >
            {sent ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  If an account exists for that email, a reset link is on its way.
                </p>
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link to="/signin">Back to Sign In</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="relative">
                  <input
                    {...register("email")}
                    type="email"
                    autoComplete="email"
                    placeholder=" "
                    className={cn(
                      "peer block w-full rounded-xl border bg-background px-4 pt-6 pb-2 text-sm text-foreground shadow-sm outline-none transition-all",
                      "placeholder-transparent focus:border-primary focus:ring-2 focus:ring-primary/15",
                      errors.email
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : "border-input",
                    )}
                  />
                  <label className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary">
                    Email
                  </label>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-full text-base">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Remembered it?{" "}
                  <Link to="/signin" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
