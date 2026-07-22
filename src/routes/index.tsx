import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Crown,
  Lightbulb,
  Users,
  Heart,
  Award,
} from "lucide-react";
import { SiteLayout } from "@/layouts/SiteLayout";
import { BackgroundShapes } from "@/components/BackgroundShapes";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Join the GenZ Team — Careers at GenZ" },
      {
        name: "description",
        content:
          "Build your future with one of Egypt's leading local streetwear brands. Explore roles and apply online.",
      },
      { property: "og:title", content: "Join the GenZ Team — Careers at GenZ" },
      {
        property: "og:description",
        content: "Egyptian streetwear culture. Premium, minimal, made in Cairo.",
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
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium tracking-wide text-primary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Now hiring in Cairo
            </motion.span>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl"
            >
              Join the{" "}
              <span className="relative inline-block">
                <span className="text-primary">GenZ</span>
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-primary/30" />
              </span>{" "}
              Team
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              Build your future with one of Egypt's leading local fashion brands.
              Design, create, and shape the next wave of streetwear culture.
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
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-7 border-foreground/15"
              >
                <Link to="/signin">Sign In</Link>
              </Button>
            </motion.div>
          </motion.div>
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
            More than a job. A culture.
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              Icon: Sparkles,
              title: "Creative Culture",
              body: "Work with designers, stylists, and creators who push Egyptian streetwear forward every day.",
            },
            {
              Icon: TrendingUp,
              title: "Career Growth",
              body: "Real ownership from day one. Learn fast, ship fast, and grow into the role you want.",
            },
            {
              Icon: Crown,
              title: "Premium Fashion Brand",
              body: "Join a brand shaping how a generation dresses — from Cairo to the region.",
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

      {/* Values */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Our Values
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                What we stand for.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Four principles guide every collection, every hire, every decision.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { Icon: Lightbulb, title: "Innovation", body: "We prototype, iterate, and ship." },
                { Icon: Users, title: "Teamwork", body: "Small teams, big trust, sharper output." },
                { Icon: Heart, title: "Customer Experience", body: "Every stitch, every DM, treated with care." },
                { Icon: Award, title: "Excellence", body: "Premium quality is the baseline, not the ceiling." },
              ].map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30"
                >
                  <v.Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-center text-primary-foreground sm:p-16">
          <div aria-hidden className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 400 200" className="h-full w-full">
              <circle cx="80" cy="100" r="90" fill="white" opacity="0.15" />
              <circle cx="340" cy="60" r="60" fill="white" opacity="0.1" />
            </svg>
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Ready to join?</h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
              Applications take under two minutes. We reply within a week.
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
