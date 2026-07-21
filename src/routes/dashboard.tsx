import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Inbox,
  Search,
  Trash2,
  Users,
} from "lucide-react";
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
import { useApplications } from "@/hooks/use-applications";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GenZ Applications" },
      {
        name: "description",
        content: "Review, search, and manage submitted GenZ team applications.",
      },
      { property: "og:title", content: "Dashboard — GenZ Applications" },
      { property: "og:description", content: "Review submitted GenZ team applications." },
      { property: "og:url", content: "/dashboard" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: DashboardPage,
});

const PAGE_SIZE = 8;

type SortKey = "submittedAt-desc" | "submittedAt-asc" | "name-asc" | "name-desc";

function DashboardPage() {
  const { applications, hydrate, remove } = useApplications();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("submittedAt-desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    hydrate();
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [hydrate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = applications;
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "submittedAt-asc":
          return a.submittedAt.localeCompare(b.submittedAt);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return b.submittedAt.localeCompare(a.submittedAt);
      }
    });
    return sorted;
  }, [applications, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  const handleDelete = (id: string, name: string) => {
    remove(id);
    toast.success(`Removed ${name}`);
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Team · GenZ
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Applications</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {applications.length} total {applications.length === 1 ? "submission" : "submissions"}
            </p>
          </div>
          <Button asChild className="rounded-full self-start sm:self-auto">
            <Link to="/apply">New application</Link>
          </Button>
        </motion.div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-xl pl-11"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-12 w-full rounded-xl sm:w-56">
              <ArrowUpDown className="mr-1 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submittedAt-desc">Newest first</SelectItem>
              <SelectItem value="submittedAt-asc">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name A → Z</SelectItem>
              <SelectItem value="name-desc">Name Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState hasQuery={query.length > 0} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Birthday</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((a) => (
                      <TableRow key={a.id} className="group">
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell className="text-muted-foreground">{a.email}</TableCell>
                        <TableCell className="text-muted-foreground">{a.phone}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(a.birthday), "PP")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(a.submittedAt), "PPp")}
                        </TableCell>
                        <TableCell>
                          <DeleteButton onConfirm={() => handleDelete(a.id, a.name)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-3 md:hidden">
                {pageItems.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">{a.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{a.email}</p>
                      </div>
                      <DeleteButton onConfirm={() => handleDelete(a.id, a.name)} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block font-medium text-foreground/70">Phone</span>
                        {a.phone}
                      </div>
                      <div>
                        <span className="block font-medium text-foreground/70">Birthday</span>
                        {format(new Date(a.birthday), "PP")}
                      </div>
                      <div className="col-span-2">
                        <span className="block font-medium text-foreground/70">Submitted</span>
                        {format(new Date(a.submittedAt), "PPp")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
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

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {hasQuery ? <Search className="h-6 w-6" /> : <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="mt-5 text-xl font-bold">
        {hasQuery ? "No matches" : "No applications yet"}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {hasQuery
          ? "Try a different name, email, or phone number."
          : "Once someone applies, submissions will show up here."}
      </p>
      {!hasQuery && (
        <Button asChild className="mt-6 rounded-full">
          <Link to="/apply">
            <Users className="mr-1 h-4 w-4" />
            Submit an application
          </Link>
        </Button>
      )}
    </div>
  );
}
