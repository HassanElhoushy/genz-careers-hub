import { useSyncExternalStore } from "react";

export type Session =
  | { role: "admin"; email: string }
  | { role: "applicant"; email: string }
  | null;

const STORAGE_KEY = "genz_session";

function load(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.role === "admin" || parsed.role === "applicant")) {
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}

let state: Session = typeof window !== "undefined" ? load() : null;
const listeners = new Set<() => void>();

function setState(next: Session) {
  state = next;
  if (typeof window !== "undefined") {
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const sessionStore = {
  get: () => state,
  signInAdmin: () => setState({ role: "admin", email: "admin@genz-s.com" }),
  signInApplicant: (email: string) =>
    setState({ role: "applicant", email: email.trim().toLowerCase() }),
  signOut: () => setState(null),
};

export function useSession(): Session {
  return useSyncExternalStore(subscribe, () => state, () => null);
}
