import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, Inbox, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/layouts/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAllApplications, useUpdateApplication, useDeleteApplication } from "@/hooks/use-applications";
import { useSession } from "@/hooks/use-session";
import { POSITIONS } from "@/lib/positions";
import type { Application, ApplicationStatus } from "@/types/application";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — GenZ's Applications" },
      { name: "description", content: "Manage GenZ's team applications." },
      { property: "og:title", content: "Admin — GenZ's Applications" },
      { property: "og:description", content: "Review and manage GenZ's applications." },
      { property: "og:url", content: "/admin" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
  component: AdminPage,
});

const PAGE_SIZE = 8;

function AdminPage() {
  const navigate = useNavigate();
  const session = useSession();
  const { applications, update, remove } = useApplications();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Application | null>(null);

  useEffect(() => {
    if (!session) navigate({ to: "/signin" });
    else if (session.role !== "admin") navigate({ to: "/my-application" });
  }, [session, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      if (q && !`${a.name} ${a.email} ${a.phone}`.toLowerCase().includes(q)) return false;
      if (positionFilter !== "all" && a.position !== positionFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [applications, query, positionFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, positionFilter, statusFilter]);

  const handleDelete = (id: string, name: string) => {
    remove(id);
    toast.success(`Removed ${name}`);
  };

  const handleStatusChange = (a: Application, status: ApplicationStatus) => {
    update(a.id, { status });
    toast.success(`${a.name} → ${status}`);
    if (status !== "pending") setEditing({ ...a, status });
  };

  if (!session || session.role !== "admin") {
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
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Admin · GenZ's
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Applications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {applications.length} total {applications.length === 1 ? "submission" : "submissions"}
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_220px_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-xl pl-11"
            />
          </div>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All positions</SelectItem>
              {POSITIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold">No applications</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Try clearing your filters, or wait for new submissions.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell className="text-muted-foreground">{a.position}</TableCell>
                        <TableCell className="text-muted-foreground">{a.email}</TableCell>
                        <TableCell className="text-muted-foreground">{a.phone}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(a.submittedAt), "PP")}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={a.status}
                            onValueChange={(v) => handleStatusChange(a, v as ApplicationStatus)}
                          >
                            <SelectTrigger className="h-9 w-32 rounded-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setEditing(a)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                              aria-label="Edit details"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <DeleteButton onConfirm={() => handleDelete(a.id, a.name)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-3 lg:hidden">
                {pageItems.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">{a.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{a.email}</p>
                        <p className="mt-1 text-xs text-primary">{a.position}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditing(a)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <DeleteButton onConfirm={() => handleDelete(a.id, a.name)} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Select
                        value={a.status}
                        onValueChange={(v) => handleStatusChange(a, v as ApplicationStatus)}
                      >
                        <SelectTrigger className="h-9 rounded-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <EditDialog
        application={editing}
        onClose={() => setEditing(null)}
        onSave={(id, patch) => {
          update(id, patch);
          toast.success("Saved.");
          setEditing(null);
        }}
      />
    </SiteLayout>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete application"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this application?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the submission from your local device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditDialog({
  application,
  onClose,
  onSave,
}: {
  application: Application | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Application>) => void;
}) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!application) return;
    setDate(application.interview ? new Date(application.interview.date) : undefined);
    setTime(application.interview?.time ?? "");
    setLocation(application.interview?.location ?? "");
    setLocationUrl(application.interview?.locationUrl ?? "");
    setNotes(application.interview?.notes ?? "");
    setReason(application.rejectionReason ?? "");
  }, [application]);

  if (!application) return null;

  const isAccepted = application.status === "accepted";
  const isRejected = application.status === "rejected";

  const handleSave = () => {
    if (isAccepted) {
      if (!date || !time.trim() || !location.trim()) {
        toast.error("Fill in date, time, and location.");
        return;
      }
      const url = locationUrl.trim();
      if (url && !/^https?:\/\//i.test(url)) {
        toast.error("Location URL must start with http:// or https://");
        return;
      }
      onSave(application.id, {
        interview: {
          date: date.toISOString(),
          time,
          location: location.trim(),
          locationUrl: url || undefined,
          notes: notes.trim() || undefined,
        },
      });
    } else if (isRejected) {
      onSave(application.id, { rejectionReason: reason.trim() || undefined });
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={!!application} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isAccepted ? "Schedule interview" : isRejected ? "Rejection reason" : application.name}
          </DialogTitle>
          <DialogDescription>
            {application.name} · {application.position}
            {application.linkedinUrl && (
              <>
                {" · "}
                <a
                  href={application.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  🔗 Portfolio
                </a>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isAccepted && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "mt-1 flex w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2.5 text-sm",
                      )}
                    >
                      <span className={cn(date ? "text-foreground" : "text-muted-foreground")}>
                        {date ? format(date, "PPP") : "Pick a date"}
                      </span>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Time</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Location name</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. GenZ's HQ, Park Mall, New Cairo"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Google Maps URL (optional)
              </label>
              <Input
                type="url"
                value={locationUrl}
                onChange={(e) => setLocationUrl(e.target.value)}
                placeholder="https://maps.google.com/…"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Additional notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the applicant should know…"
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
        )}

        {isRejected && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Reason (shown to applicant)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional short explanation…"
              className="mt-1 rounded-xl"
            />
          </div>
        )}

        {!isAccepted && !isRejected && (
          <p className="text-sm text-muted-foreground">
            Change the status to Accepted or Rejected to add details.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-full">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
