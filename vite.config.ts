// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Publishable (client-safe) Supabase values. These are used ONLY as a build-time
// fallback when the hosting platform doesn't inject VITE_SUPABASE_* env vars
// (e.g. an external deploy where .env isn't committed). Never put secret keys here.
const FALLBACK_SUPABASE_URL = "https://rvctoelfkhakgtdiiqjc.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Kx-hKl4-JHTwSk3KDHZ_0Q_kmHAl8L4";
const FALLBACK_SUPABASE_PROJECT_ID = "rvctoelfkhakgtdiiqjc";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || FALLBACK_SUPABASE_URL,
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          process.env.SUPABASE_PUBLISHABLE_KEY ||
          FALLBACK_SUPABASE_PUBLISHABLE_KEY,
      ),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
        process.env.VITE_SUPABASE_PROJECT_ID ||
          process.env.SUPABASE_PROJECT_ID ||
          FALLBACK_SUPABASE_PROJECT_ID,
      ),
    },
  },
});
