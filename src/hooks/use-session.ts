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

// Stable, frozen snapshot returned during SSR so concurrent server requests
// never share or leak a mutable session store.
const SERVER_SNAPSHOT: SessionState = Object.freeze({
  session: null,
  user: null,
  role: null,
  loading: true,
});

const isBrowser = typeof window !== "undefined";

// Browser-only mutable state. On the server we return SERVER_SNAPSHOT.
let browserState: SessionState = {
  session: null,
  user: null,
  role: null,
  loading: true,
};

const listeners = new Set<() => void>();
let initialized = false;

function setState(next: Partial<SessionState>) {
  browserState = { ...browserState, ...next };
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

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    await supabase.auth.signOut();
    setState({ session: null, user: null, role: null, loading: false });
    return;
  }

  const role = await fetchRole(userData.user.id);
  if (!role) {
    await supabase.auth.signOut();
    setState({ session: null, user: null, role: null, loading: false });
    return;
  }

  setState({ session, user: userData.user, role, loading: false });
}

function ensureInitialized() {
  if (!isBrowser || initialized) return;
  initialized = true;
  supabase.auth.getSession().then(({ data }) => hydrate(data.session));
  supabase.auth.onAuthStateChange((_event, session) => {
    hydrate(session);
  });
}

function subscribe(cb: () => void) {
  ensureInitialized();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return isBrowser ? browserState : SERVER_SNAPSHOT;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export const sessionStore = {
  get: () => (isBrowser ? browserState : SERVER_SNAPSHOT),
  signOut: async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will fire and update state via hydrate().
  },
};

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
