import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarClock, CheckCircle2, Clock3, MapPin, XCircle } from "lucide-react";

import { SiteLayout } from "@/layouts/SiteLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApplications } from "@/hooks/use-applications";
import { sessionStore, useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/my-application")({
  head: () => ({
    meta: [
      { title: "My Application — GenZ's" },
      { name: "description", content: "Track the status of your GenZ's application." },
      { property: "og:title", content: "My Application — GenZ's" },
      { property: "og:description", content: "See the current status of your GenZ's application." },
      { property: "og:url", content: "/my-application" },
    ],
    links: [{ rel: "canonical", href: "/my-application" }],
  }),
  component: MyApplicationPage,
});

function MyApplicationPage() {
  const navigate = useNavigate();
  const session = useSession();
  const { applications } = useApplications();

  useEffect(() => {
    if (!session) navigate({ to: "/signin" });
    else if (session.role === "admin") navigate({ to: "/admin" });
  }, [session, navigate]);

  const app = useMemo(
    () =>
      session?.role === "applicant"
        ? applications.find((a) => a.email.toLowerCase() === session.email.toLowerCase())
        : undefined,
    [applications, session],
  );

  if (!session || session.role !== "applicant") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">Redirecting…</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            My Application
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            {app ? `Hey, ${app.name.split(" ")[0]}` : "Welcome"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Here's the current status of your application.
          </p>
        </motion.div>

        {!app ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-lg font-semibold">No application on file.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit an application to get started.
            </p>
            <Button
              onClick={() => {
                sessionStore.signOut();
                navigate({ to: "/apply" });
              }}
              className="mt-6 rounded-full"
            >
              Apply Now
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-10 space-y-6"
          >
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Position
                  </p>
                  <p className="mt-1 text-xl font-bold">{app.position}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {format(new Date(app.submittedAt), "PPP")}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            </div>

            {app.status === "pending" && (
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold">Under review</h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Thanks for applying! Our team is reviewing your submission. You'll hear from us
                  soon — check back here for updates.
                </p>
              </div>
            )}

            {app.status === "accepted" && (
              <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold">You're moving forward!</h2>
                </div>
                {app.interview ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <InterviewRow
                      icon={<CalendarClock className="h-4 w-4" />}
                      label="Date & Time"
                      value={`${format(new Date(app.interview.date), "PPP")} · ${app.interview.time}`}
                    />
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Location
                      </div>
                      <p className="mt-1.5 text-sm font-medium">{app.interview.location}</p>
                      {app.interview.locationUrl && (
                        <a
                          href={app.interview.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                        >
                          📍 Open in Google Maps
                        </a>
                      )}
                    </div>
                    {app.interview.notes && (
                      <div className="sm:col-span-2 rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                          Additional notes
                        </p>
                        <p className="mt-1 text-sm">{app.interview.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Interview details will appear here once scheduled.
                  </p>
                )}
              </div>
            )}

            {app.status === "rejected" && (
              <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold">Application not moving forward</h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {app.rejectionReason ||
                    "Thanks for applying. Unfortunately, we won't be moving forward with your application at this time."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </section>
    </SiteLayout>
  );
}

function InterviewRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "accepted" | "rejected" }) {
  const map = {
    pending: "bg-muted text-foreground/80 border-border",
    accepted: "bg-primary/10 text-primary border-primary/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  } as const;
  const label = { pending: "Pending", accepted: "Accepted", rejected: "Rejected" }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        map[status],
      )}
    >
      {label}
    </span>
  );
}
