import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — GenZ's" },
      { name: "description", content: "Choose a new password for your GenZ's account." },
      { property: "og:title", content: "Reset Password — GenZ's" },
      { property: "og:description", content: "Choose a new password for your GenZ's account." },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });
type FormValues = z.infer<typeof schema>;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase places the recovery session in the URL hash on landing.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Also check if a session already exists (e.g. after hash processed).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    // Fallback: if hash is missing entirely, show an error.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash.includes("access_token") && !hash.includes("type=recovery")) {
      setTimeout(() => {
        if (!ready) setLinkError("This reset link is invalid or has expired. Request a new one.");
      }, 1500);
    }
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password: data.password });
    if (err) {
      setError(err.message);
      return;
    }
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    navigate({ to: "/signin" });
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
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Reset Password</h1>
            <p className="mt-3 text-sm text-muted-foreground">Choose a new password for your account.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-10"
          >
            {linkError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {linkError}
              </p>
            ) : !ready ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying reset link…
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <FloatingField
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <FloatingField
                  label="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.confirm?.message}
                  {...register("confirm")}
                />

                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-full text-base">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating…
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}

function FloatingField({
  label,
  type = "text",
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="relative">
      <input
        {...props}
        type={type}
        placeholder=" "
        className={cn(
          "peer block w-full rounded-xl border bg-background px-4 pt-6 pb-2 text-sm text-foreground shadow-sm outline-none transition-all",
          "placeholder-transparent focus:border-primary focus:ring-2 focus:ring-primary/15",
          error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "border-input",
        )}
      />
      <label className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary">
        {label}
      </label>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
