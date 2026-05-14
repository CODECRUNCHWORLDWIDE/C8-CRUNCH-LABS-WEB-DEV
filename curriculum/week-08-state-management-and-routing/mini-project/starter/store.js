/*
 * Crunch Library — starter store.js
 *
 * Two Zustand stores: the global theme (persisted to localStorage) and
 * a tiny auth user (in-memory only — in a real app this would be a
 * TanStack Query for /api/me, or a Zustand store paired with a refresh-
 * token flow).
 *
 * Split the file into two real files when copying into your project:
 *   src/store/themeStore.js  — the theme store
 *   src/store/authStore.js   — the auth store
 *
 * The split keeps cross-imports small and lets you tree-shake either
 * independently.
 *
 * Doc references:
 *   - Zustand README:           https://github.com/pmndrs/zustand
 *   - Zustand persist:          https://docs.pmnd.rs/zustand/integrations/persisting-store-data
 *   - Zustand selectors:        https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions
 */

"use strict";

/* ============================================================ *
 * src/store/themeStore.js                                      *
 * ============================================================ */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * The theme store.
 *
 * State:
 *   - theme: "light" | "dark"
 *
 * Actions:
 *   - setTheme(theme): set to a specific value
 *   - toggle():       flip between "light" and "dark"
 *
 * Persistence:
 *   The persist middleware writes the store to localStorage under the
 *   key "crunch-library-theme". On next load the saved value is
 *   rehydrated before any component renders.
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggle: () =>
        set({ theme: get().theme === "light" ? "dark" : "light" }),
    }),
    { name: "crunch-library-theme" },
  ),
);

/* ============================================================ *
 * src/store/authStore.js                                       *
 * ============================================================ */

/**
 * The auth store.
 *
 * State:
 *   - user: { name: string } | null
 *
 * Actions:
 *   - setUser(user): set to a user object
 *   - signOut():     clear the user
 *
 * No persistence: the auth is in-memory only for this exercise.
 * In a real app, you would persist a refresh token (in httpOnly
 * cookie) and use TanStack Query to fetch /api/me on every page
 * load. Do not store passwords or long-lived auth tokens in
 * localStorage.
 *
 * Note we export both the store-hook (`useAuthStore`) for use in
 * React components AND the raw store (`authStore`) for use in
 * non-React contexts like route loaders. The hook is just a wrapper
 * around the same store; both share the same state.
 */
export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signOut: () => set({ user: null }),
}));

// Expose the underlying store for non-React access (route loaders, etc.).
// Zustand's hook is callable as a hook but also has getState/setState
// methods on it. The convention is to export both names so the call site
// reads clearly.
export const authStore = useAuthStore;

/* ============================================================ *
 * Usage examples                                               *
 * ============================================================ */

/*
// In a React component — read with a selector:
import { useThemeStore } from "./store/themeStore.js";

function ThemeToggle() {
  const theme  = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  return (
    <button type="button" onClick={toggle} aria-pressed={theme === "dark"}>
      Theme: {theme}
    </button>
  );
}

// In a route loader — read directly via getState:
import { redirect } from "react-router-dom";
import { authStore } from "./store/authStore.js";

async function requireAuthLoader({ request }) {
  const { user } = authStore.getState();
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/login?from=${encodeURIComponent(url.pathname)}`);
  }
  return user;
}

// In a Login page — set state on submit:
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";

function Login() {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "/";
  const handleSubmit = (e) => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get("name");
    if (typeof name === "string" && name.trim()) {
      setUser({ name: name.trim() });
      navigate(from, { replace: true });
    }
  };
  // ... form JSX
}
*/
