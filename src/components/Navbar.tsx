import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sessionStore, useSession } from "@/hooks/use-session";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin = session?.role === "admin";
  const isApplicant = session?.role === "applicant";
  const authed = isAdmin || isApplicant;

  const authedHome: "/admin" | "/my-application" = isAdmin ? "/admin" : "/my-application";
  const authedLabel = isAdmin ? "Admin Panel" : "My Application";

  const publicLinks: { to: "/" | "/apply" | "/signin"; label: string }[] = [
    { to: "/", label: "Home" },
    { to: "/apply", label: "Apply Now" },
    { to: "/signin", label: "Sign In" },
  ];

  const handleSignOut = () => {
    sessionStore.signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={authed ? authedHome : "/"} className="flex items-center gap-2.5 shrink-0">
          <Logo className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-tight">GenZ</span>
        </Link>

        {authed ? (
          <nav className="hidden md:flex flex-1 items-center justify-center">
            <Link
              to={authedHome}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "bg-accent text-foreground hover:bg-primary/10" }}
              className="rounded-full px-10 py-2.5 text-sm font-semibold tracking-wide transition-colors min-w-[220px] text-center"
            >
              {authedLabel}
            </Link>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-1">
            {publicLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-foreground bg-accent" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {authed ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSignOut}
              className="hidden sm:inline-flex rounded-full"
            >
              <LogOut className="mr-1 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex rounded-full">
              <Link to="/apply">Apply Now</Link>
            </Button>
          )}
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {authed ? (
              <Link
                to={authedHome}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold bg-accent"
              >
                {authedLabel}
              </Link>
            ) : (
              publicLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "bg-accent text-foreground" }}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  {l.label}
                </Link>
              ))
            )}
            {authed && (
              <button
                onClick={handleSignOut}
                className="mt-2 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
