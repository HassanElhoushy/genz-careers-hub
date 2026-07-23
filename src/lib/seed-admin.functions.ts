import { createServerFn } from "@tanstack/react-start";

export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = "admin@genz-s.com";
  const password = "admin";

  // Find and delete existing admin user (cascades to profiles, user_roles, applications)
  let page = 1;
  let existingId: string | null = null;
  // paginate through users to find by email
  // deno-lint-ignore no-constant-condition
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (match) {
      existingId = match.id;
      break;
    }
    if (data.users.length < 200) break;
    page++;
  }

  if (existingId) {
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(existingId);
    if (delErr) throw delErr;
  }

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) throw createErr;

  return { ok: true, id: created.user?.id, deletedPrevious: !!existingId };
});
