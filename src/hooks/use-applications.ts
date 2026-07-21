import { create } from "zustand";
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

type State = {
  applications: Application[];
  hydrated: boolean;
  hydrate: () => void;
  add: (app: Omit<Application, "id" | "submittedAt">) => Application;
  remove: (id: string) => void;
};

export const useApplications = create<State>((set, get) => ({
  applications: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ applications: load(), hydrated: true });
  },
  add: (data) => {
    const app: Application = {
      ...data,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    const next = [app, ...get().applications];
    save(next);
    set({ applications: next });
    return app;
  },
  remove: (id) => {
    const next = get().applications.filter((a) => a.id !== id);
    save(next);
    set({ applications: next });
  },
}));
