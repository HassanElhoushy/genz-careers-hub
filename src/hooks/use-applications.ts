import { useSyncExternalStore } from "react";
import type { Application } from "@/types/application";

const STORAGE_KEY = "genz_applications";

function load(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: Application[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let state: Application[] = typeof window !== "undefined" ? load() : [];
const listeners = new Set<() => void>();

function setState(next: Application[]) {
  state = next;
  save(next);
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const getSnapshot = () => state;
const getServerSnapshot = () => [] as Application[];

export const applicationsStore = {
  get: () => state,
  add: (
    data: Omit<Application, "id" | "submittedAt" | "status">,
  ): { ok: true; app: Application } | { ok: false; reason: "duplicate" } => {
    const email = data.email.trim().toLowerCase();
    if (state.some((a) => a.email.toLowerCase() === email)) {
      return { ok: false, reason: "duplicate" };
    }
    const app: Application = {
      ...data,
      email,
      id: crypto.randomUUID(),
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    setState([app, ...state]);
    return { ok: true, app };
  },
  update: (id: string, patch: Partial<Application>) => {
    setState(state.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  },
  remove: (id: string) => {
    setState(state.filter((a) => a.id !== id));
  },
  findByCredentials: (email: string, password: string) => {
    const e = email.trim().toLowerCase();
    return state.find((a) => a.email.toLowerCase() === e && a.password === password);
  },
  findByEmail: (email: string) => {
    const e = email.trim().toLowerCase();
    return state.find((a) => a.email.toLowerCase() === e);
  },
};

type Store = {
  applications: Application[];
  add: typeof applicationsStore.add;
  update: typeof applicationsStore.update;
  remove: typeof applicationsStore.remove;
  findByCredentials: typeof applicationsStore.findByCredentials;
  findByEmail: typeof applicationsStore.findByEmail;
  hydrated: boolean;
  hydrate: () => void;
};

export function useApplications<T = Store>(selector?: (s: Store) => T): T {
  const applications = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value: Store = {
    applications,
    add: applicationsStore.add,
    update: applicationsStore.update,
    remove: applicationsStore.remove,
    findByCredentials: applicationsStore.findByCredentials,
    findByEmail: applicationsStore.findByEmail,
    hydrated: true,
    hydrate: () => {},
  };
  return (selector ? selector(value) : (value as unknown as T)) as T;
}
