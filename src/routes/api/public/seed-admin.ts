import { createFileRoute } from "@tanstack/react-router";
import { seedAdmin } from "@/lib/seed-admin.functions";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      POST: async () => {
        const result = await seedAdmin();
        return Response.json(result);
      },
    },
  },
});
