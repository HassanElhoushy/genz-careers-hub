import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Target,
  Compass,
} from "lucide-react";
import { SiteLayout } from "@/layouts/SiteLayout";
import { BackgroundShapes } from "@/components/BackgroundShapes";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Join the GenZ's Team — Careers at GenZ's" },
      {
        name: "description",
        content:
          "Join GenZ's, a destination for Egyptian local fashion. Explore roles bringing together fashion, creativity, community, and technology.",
      },
      { property: "og:title", content: "Join the GenZ's Team — Careers at GenZ's" },
      {
        property: "og:description",
        content:
          "Build your career with GenZ's, a home for Egyptian local fashion, creators, and community.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),

  component: Index,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function Index() {
  // Scroll to hash target on mount (for /#about arrivals)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <BackgroundShapes />
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Careers at GenZ's
            </motion.span>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl"
            >
              Join the{" "}
              <span className="relative inline-block">
                <span className="text-primary">GenZ's Team</span>
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-primary/30" />
              </span>

            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              Join a team bringing together fashion, creativity, community, and technology
              to help Egyptian brands grow and give the next generation new ways to
              express themselves.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Button asChild size="lg" className="rounded-full px-7 group">
                <Link to="/apply">
                  Apply Now
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Us */}
      <section
        id="about"
        className="scroll-mt-24 border-t border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                About GenZ's
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Built for the Next Generation of Fashion
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  GenZ's was created with one mission: to redefine fashion for the next
                  generation.
                </p>
                <p>
                  What began as a simple question about why people choose the clothes they
                  wear has grown into one of Egypt's destinations for local fashion. We
                  believe style is more than clothing — it is a way to express identity,
                  creativity, and confidence.
                </p>
                <p>
                  By bringing Egyptian local brands together in one place, GenZ's makes it
                  easier for customers to discover distinctive, high-quality products
                  while supporting local designers, creators, and manufacturers.
                </p>
                <p>
                  Today, we continue to grow while staying connected to our roots through
                  local manufacturing, meaningful partnerships, and a commitment to
                  empowering young creators.
                </p>
              </div>
            </motion.div>

            <div className="flex flex-col gap-5 lg:pt-16">
              {[
                {
                  Icon: Target,
                  title: "Our Mission",
                  body: "To make high-quality local fashion more accessible, inspire self-expression, and support the growth of Egyptian brands.",
                },
                {
                  Icon: Compass,
                  title: "Our Vision",
                  body: "To become a leading fashion destination for Gen Z across the Middle East, connecting people with brands that reflect their identity, creativity, and culture.",
                },
              ].map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-border bg-card p-7 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-soft)]"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <c.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Why Join Us
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Create Meaningful Work With Local Impact
          </h2>
          <p className="mt-4 text-muted-foreground">
            At GenZ's, your work contributes to a growing ecosystem of Egyptian brands,
            creators, and fashion communities.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              Icon: Sparkles,
              title: "Create Local Impact",
              body: "Help Egyptian brands and creators reach new audiences and grow within a platform built to support local talent.",
            },
            {
              Icon: TrendingUp,
              title: "Grow With the Brand",
              body: "Develop your skills while contributing to a fast-moving company working across fashion, retail, content, community, and technology.",
            },
            {
              Icon: Lightbulb,
              title: "Bring Ideas to Life",
              body: "Work in a collaborative environment where creativity, individuality, ownership, and new ideas are encouraged.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ready to Join CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-center text-primary-foreground sm:p-16">
          <div aria-hidden className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 400 200" className="h-full w-full">
              <circle cx="80" cy="100" r="90" fill="white" opacity="0.15" />
              <circle cx="340" cy="60" r="60" fill="white" opacity="0.1" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">
              Ready to Join?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Bring Your Ideas to GenZ's
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
              Explore our available roles and become part of a team shaping the future of
              local fashion.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-8 rounded-full px-8 bg-white text-primary hover:bg-white/90"
            >
              <Link to="/apply">
                Apply Now <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
