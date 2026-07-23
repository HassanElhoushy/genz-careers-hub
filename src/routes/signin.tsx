import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — GenZ's" },
      { name: "description", content: "Sign in to track your GenZ's application or manage the team." },
      { property: "og:title", content: "Sign In — GenZ's" },
      { property: "og:description", content: "Applicant and admin sign-in for GenZ's." },
      { property: "og:url", content: "/signin" },
    ],
    links: [{ rel: "canonical", href: "/signin" }],
  }),
  component: SignInPage,
});

const ADMIN_EMAIL = "admin@genz-s.com";
const schema = z
  .object({
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
  })
  .superRefine((val, ctx) => {
    const min = val.email.trim().toLowerCase() === ADMIN_EMAIL ? 5 : 6;
    if (val.password.length < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: min,
        type: "string",
        inclusive: true,
        path: ["password"],
        message: `Password must be at least ${min} characters`,
      });
    }
  });

type FormValues = z.infer<typeof schema>;

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
      <label
        className={cn(
          "pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all",
          "peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal",
          "peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary",
        )}
      >
        {label}
      </label>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SignInPage() {
  const navigate = useNavigate();
  const session = useSession();

  useEffect(() => {
    if (session?.role === "admin") navigate({ to: "/admin" });
    else if (session?.role === "applicant") navigate({ to: "/my-application" });
  }, [session, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    });
    if (signInErr) {
      const code = (signInErr as { code?: string }).code;
      if (code === "invalid_credentials" || /invalid/i.test(signInErr.message)) {
        setError("Wrong email or password.");
      } else if (code === "email_not_confirmed") {
        setError("Please confirm your email first, then try again.");
      } else {
        setError(signInErr.message);
      }
      return;
    }
    toast.success("Signed in.");
    // Redirect happens via the useEffect above once role loads.
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
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Sign In</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Welcome back. Sign in to see your application.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-10"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <FloatingField
                label="Email"
                autoComplete="username"
                error={errors.email?.message}
                {...register("email")}
              />
              <FloatingField
                label="Password"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
              />


              {error && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full rounded-full text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/apply" className="font-medium text-primary hover:underline">
                  Apply now
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
