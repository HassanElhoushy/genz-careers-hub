import { useSyncExternalStore } from "react";
import type { Session as SupabaseSession, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "applicant";

export type SessionState = {
  session: SupabaseSession | null;
  user: User | null;
  role: Role | null;
  loading: boolean;
};

let state: SessionState = {
  session: null,
  user: null,
  role: null,
  loading: true,
};

const listeners = new Set<() => void>();

function setState(next: Partial<SessionState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

async function fetchRole(userId: string): Promise<Role | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.role as Role;
}

async function hydrate(session: SupabaseSession | null) {
  if (!session?.user) {
    setState({ session: null, user: null, role: null, loading: false });
    return;
  }
  const role = await fetchRole(session.user.id);
  setState({ session, user: session.user, role, loading: false });
}

if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data }) => hydrate(data.session));
  supabase.auth.onAuthStateChange((_event, session) => {
    hydrate(session);
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return state;
}

export const sessionStore = {
  get: () => state,
  signOut: async () => {
    await supabase.auth.signOut();
    setState({ session: null, user: null, role: null, loading: false });
  },
};

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

