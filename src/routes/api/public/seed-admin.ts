import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "admin@genz-s.com";
        const password = "admin";

        let page = 1;
        let existingId: string | null = null;
        while (true) {
          const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
          if (error) return Response.json({ step: "list", error: error.message }, { status: 500 });
          const match = data.users.find((u) => (u.email ?? "").toLowerCase() === email);
          if (match) { existingId = match.id; break; }
          if (data.users.length < 200) break;
          page++;
        }

        if (existingId) {
          const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(existingId);
          if (delErr) return Response.json({ step: "delete", error: delErr.message }, { status: 500 });
        }

        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (createErr) return Response.json({ step: "create", error: createErr.message }, { status: 500 });

        return Response.json({ ok: true, id: created.user?.id, deletedPrevious: !!existingId });
      },
    },
  },
});
