import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/layouts/SiteLayout";
import { BackgroundShapes } from "@/components/BackgroundShapes";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { POSITIONS } from "@/lib/positions";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply — GenZ's Careers" },
      {
        name: "description",
        content: "Apply to join the GenZ's team. Two minutes and you're in the loop.",
      },
      { property: "og:title", content: "Apply — GenZ's Careers" },
      { property: "og:description", content: "Apply to join a destination for Egyptian local fashion." },
      { property: "og:url", content: "/apply" },
    ],
    links: [{ rel: "canonical", href: "/apply" }],
  }),
  component: ApplyPage,
});

const today = new Date();
const minAgeDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(\+20|0)?1[0125]\d{8}$/, "Enter a valid Egyptian phone number"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[0-9]/, "Include a number"),
  portfolioUrl: z
    .string()
    .trim()
    .max(200, "URL too long")
    .url("Enter a valid URL (include https://)")
    .optional()
    .or(z.literal("")),
  position: z.string().min(1, "Pick a position"),
  birthday: z
    .date({ required_error: "Pick your birthday" })
    .max(minAgeDate, "You must be at least 16"),
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

function ApplyPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", portfolioUrl: "", position: "" },
  });

  const birthday = watch("birthday");
  const position = watch("position");

  const onSubmit = async (data: FormValues) => {
    const portfolio = data.portfolioUrl?.trim() || undefined;
    const birthdayIso = data.birthday.toISOString().slice(0, 10);

    // 1) Create the auth user; profile + role are created by DB trigger
    const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/signin`,
        data: {
          name: data.name,
          phone: data.phone,
          birthday: birthdayIso,
          portfolio_url: portfolio ?? "",
        },
      },
    });

    if (signUpErr) {
      const msg = signUpErr.message.toLowerCase();
      if (msg.includes("registered") || msg.includes("exists")) {
        toast.error("An account with this email already exists.", {
          description: "Try signing in instead.",
        });
      } else {
        toast.error("Couldn't create your account.", { description: signUpErr.message });
      }
      return;
    }

    const userId = signUp.user?.id;
    if (!userId) {
      toast.error("Signup succeeded but no user was returned. Please try signing in.");
      return;
    }

    // 2) Insert the application row (RLS: auth.uid() = user_id, which is now set by signIn below)
    // With auto-confirm on, signUp already returns a session, so auth.uid() matches user_id.
    const { error: insertErr } = await supabase.from("applications").insert({
      user_id: userId,
      position: data.position,
      portfolio_url: portfolio ?? null,
    });

    if (insertErr) {
      toast.error("Couldn't save your application.", { description: insertErr.message });
      return;
    }

    setSuccess(true);
    toast.success("Account created!", {
      description: "Sign in to track your application.",
    });
    reset();
    // Sign out so the sign-in page becomes the next explicit step.
    await supabase.auth.signOut();
    setTimeout(() => {
      setSuccess(false);
      navigate({ to: "/signin" });
    }, 1400);
  };

  return (
    <SiteLayout>
      <section className="relative">
        <BackgroundShapes />
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Careers · GenZ's
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Apply Now</h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Tell us who you are. We'll take it from there.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative mt-10 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-10"
          >
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-card"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="h-8 w-8" strokeWidth={3} />
                  </motion.div>
                  <p className="mt-4 text-lg font-semibold">Application received</p>
                  <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <FloatingField
                label="Full name"
                autoComplete="name"
                error={errors.name?.message}
                {...register("name")}
              />
              <FloatingField
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <FloatingField
                label="Phone number"
                type="tel"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <FloatingField
                label="Password"
                type="password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <FloatingField
                label="Portfolio, LinkedIn, or any professional link (optional)"
                type="url"
                autoComplete="url"
                error={errors.portfolioUrl?.message}
                {...register("portfolioUrl")}
              />

              {/* Position combobox */}
              <div>
                <Popover open={positionOpen} onOpenChange={setPositionOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border bg-background px-4 py-4 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15",
                        errors.position ? "border-destructive" : "border-input",
                      )}
                    >
                      <span className={cn(position ? "text-foreground" : "text-muted-foreground")}>
                        {position || "Select a position"}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search positions…" />
                      <CommandList>
                        <CommandEmpty>No matches.</CommandEmpty>
                        <CommandGroup>
                          {POSITIONS.map((p) => (
                            <CommandItem
                              key={p}
                              value={p}
                              onSelect={() => {
                                setValue("position", p, { shouldValidate: true });
                                setPositionOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  position === p ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {p}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.position && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.position.message}</p>
                )}
              </div>

              {/* Birthday */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border bg-background px-4 py-4 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15",
                        errors.birthday ? "border-destructive" : "border-input",
                      )}
                    >
                      <span className={cn(birthday ? "text-foreground" : "text-muted-foreground")}>
                        {birthday ? format(birthday, "PPP") : "Birthday"}
                      </span>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthday}
                      onSelect={(d) =>
                        d && setValue("birthday", d, { shouldValidate: true })
                      }
                      captionLayout="dropdown"
                      startMonth={new Date(1950, 0)}
                      endMonth={minAgeDate}
                      defaultMonth={minAgeDate}
                      disabled={(d) => d > minAgeDate}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {errors.birthday && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.birthday.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full rounded-full text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  "Apply Now"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By applying, you agree to our terms and privacy policy.
              </p>
            </form>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
