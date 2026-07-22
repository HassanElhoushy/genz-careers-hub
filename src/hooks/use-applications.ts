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
  add: (data: Omit<Application, "id" | "submittedAt">): Application => {
    const app: Application = {
      ...data,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    setState([app, ...state]);
    return app;
  },
  remove: (id: string) => {
    setState(state.filter((a) => a.id !== id));
  },
};

type Selected<T> = T;

export function useApplications<T = {
  applications: Application[];
  add: typeof applicationsStore.add;
  remove: typeof applicationsStore.remove;
  hydrated: boolean;
  hydrate: () => void;
}>(selector?: (s: {
  applications: Application[];
  add: typeof applicationsStore.add;
  remove: typeof applicationsStore.remove;
  hydrated: boolean;
  hydrate: () => void;
}) => T): Selected<T> {
  const applications = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = {
    applications,
    add: applicationsStore.add,
    remove: applicationsStore.remove,
    hydrated: true,
    hydrate: () => {},
  };
  return (selector ? selector(value) : (value as unknown as T)) as Selected<T>;
}
