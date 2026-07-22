import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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
  const [activeSection, setActiveSection] = useState<"home" | "about">("home");
  const session = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("home");
      return;
    }
    const onScroll = () => {
      const el = document.getElementById("about");
      if (!el) {
        setActiveSection("home");
        return;
      }
      const rect = el.getBoundingClientRect();
      setActiveSection(rect.top < 120 && rect.bottom > 120 ? "about" : "home");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const isAdmin = session?.role === "admin";
  const isApplicant = session?.role === "applicant";
  const authed = isAdmin || isApplicant;

  const authedHome: "/admin" | "/my-application" = isAdmin ? "/admin" : "/my-application";

  const handleSignOut = () => {
    sessionStore.signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      scrollToTop();
    }
    setOpen(false);
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("about");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  const homeActive = !authed && pathname === "/" && activeSection === "home";
  const aboutActive = !authed && pathname === "/" && activeSection === "about";


  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:grid md:grid-cols-[1fr_auto_1fr]">
        {/* Left: logo */}
        <div className="flex items-center">
          <Link
            to={authed ? authedHome : "/"}
            onClick={authed ? undefined : handleHomeClick}
            className="flex items-center gap-2.5 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo className="h-9 w-9" />
            <span className="font-display text-lg font-bold tracking-tight">GenZ's</span>
          </Link>
        </div>

        {/* Center: public nav */}
        <nav className="hidden md:flex items-center gap-1 justify-self-center">
          {!authed && (
            <>
              <Link
                to="/"
                onClick={handleHomeClick}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  homeActive
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Home
              </Link>
              <a
                href="/#about"
                onClick={handleAboutClick}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  aboutActive
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                About Us
              </a>
            </>
          )}
        </nav>


        {/* Right */}
        <div className="flex items-center gap-2 justify-self-end">
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
            <>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="hidden sm:inline-flex rounded-full border-foreground/15"
              >
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex rounded-full">
                <Link to="/apply">Apply Now</Link>
              </Button>
            </>
          )}
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {!authed && (
              <>
                <Link
                  to="/"
                  onClick={handleHomeClick}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "bg-accent text-foreground" }}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  Home
                </Link>
                <a
                  href="/#about"
                  onClick={handleAboutClick}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  About Us
                </a>
                <Link
                  to="/signin"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  Sign In
                </Link>
                <Link
                  to="/apply"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Apply Now
                </Link>
              </>
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
