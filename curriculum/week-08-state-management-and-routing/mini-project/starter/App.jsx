/*
 * Crunch Library — starter App.jsx
 *
 * This file wires the three providers — QueryClientProvider, the router,
 * and a theme-applier — and exports the root <App />. Copy into your
 * src/App.jsx as the starting point. The route definitions are stubbed
 * with placeholders; replace each placeholder with the real page.
 *
 * Dependencies (install with npm):
 *   react react-dom
 *   react-router-dom
 *   @tanstack/react-query @tanstack/react-query-devtools
 *   zustand
 *
 * What's wired here, with doc references:
 *   - QueryClient at module scope (not inside the component) so the cache
 *     survives React StrictMode's double-mount in dev. Reference:
 *     https://tanstack.com/query/latest/docs/framework/react/typescript
 *   - createBrowserRouter with a factory function that takes the
 *     queryClient. The factory pattern lets route loaders call
 *     queryClient.fetchQuery without smuggling the client through context.
 *     Reference: https://tanstack.com/query/latest/docs/framework/react/guides/react-router-integration
 *   - A ThemeApplier component that subscribes to the Zustand theme store
 *     and writes document.documentElement.dataset.theme. The component
 *     renders nothing; it is a side-effect bridge between the store and
 *     the DOM.
 *
 * What is NOT here:
 *   - The actual loaders. Stubs are commented inline; fill them in as
 *     you implement BookDetail and Admin.
 *   - The components for each route. Build them under src/pages/.
 *   - The auth store. Sketch is in store.js (next file).
 */

"use strict";

import { lazy, Suspense, useEffect } from "react";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useThemeStore } from "./store/themeStore.js";
import { authStore } from "./store/authStore.js";

// Page stubs (replace these with real imports as you build each page)
function Home() {
  return <h1>Home — replace with the real Home page</h1>;
}
function BooksIndex() {
  return <h1>Books — replace with the real BooksIndex page</h1>;
}
function BookDetail() {
  return <h1>Book detail — replace with the real BookDetail page</h1>;
}
function Login() {
  return <h1>Login — replace with the real Login page</h1>;
}
function ErrorPage() {
  return <h1>Something went wrong</h1>;
}

// The admin page is lazy-loaded so its JS chunk does not ship in the main
// bundle. The Network tab should show the chunk loading on first visit.
const Admin = lazy(() => import("./pages/Admin.jsx"));

// One QueryClient instance for the whole app, at module scope so it
// survives StrictMode's double-render in development.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 30s of "fresh" — refetches do not fire on every focus while
      // the user is actively using the app.
      staleTime: 30_000,
      retry: 1,
    },
  },
});

// API helpers — these would normally live in src/api/ but are inlined
// here so the starter is self-contained. JSONPlaceholder is a free,
// no-auth public API.
const API = "https://jsonplaceholder.typicode.com";

async function fetchBooks({ signal }) {
  const r = await fetch(`${API}/posts`, { signal });
  if (!r.ok) throw new Error("Failed to fetch books");
  return r.json();
}

async function fetchBook({ signal }, id) {
  const r = await fetch(`${API}/posts/${id}`, { signal });
  if (!r.ok) throw new Response("Book not found", { status: 404 });
  return r.json();
}

// The router is built by a factory function so loaders can access the
// queryClient. Build the router once, at module scope.
function makeRouter(qc) {
  return createBrowserRouter([
    {
      path: "/",
      element: <RootLayoutPlaceholder />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <Login /> },
        {
          path: "books",
          children: [
            {
              index: true,
              loader: async ({ request }) => {
                // Prefetch the books list into the cache so the
                // component renders with data on the first paint.
                await qc.prefetchQuery({
                  queryKey: ["books"],
                  queryFn: ({ signal }) => fetchBooks({ signal }),
                });
                return null;
              },
              element: <BooksIndex />,
            },
            {
              path: ":bookId",
              loader: async ({ params }) => {
                await qc.prefetchQuery({
                  queryKey: ["book", params.bookId],
                  queryFn: ({ signal }) =>
                    fetchBook({ signal }, params.bookId),
                });
                return null;
              },
              element: <BookDetail />,
            },
          ],
        },
        {
          path: "admin",
          loader: async ({ request }) => {
            // Auth check before rendering: if no user, redirect to login
            // with a `from` query param so login can navigate back.
            const user = authStore.getState().user;
            if (!user) {
              const url = new URL(request.url);
              throw redirect(
                `/login?from=${encodeURIComponent(url.pathname)}`,
              );
            }
            return user;
          },
          element: (
            <Suspense fallback={<p>Loading admin...</p>}>
              <Admin />
            </Suspense>
          ),
        },
        { path: "*", element: <ErrorPage /> },
      ],
    },
  ]);
}

const router = makeRouter(queryClient);

// RootLayoutPlaceholder — minimal layout with a nav and an outlet.
// Replace with a real RootLayout that has accessibility (skip-link,
// keyboard-reachable nav, etc.) and a theme toggle.
function RootLayoutPlaceholder() {
  return (
    <>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <nav aria-label="Primary">
          <a href="/" style={{ marginRight: "1rem" }}>Home</a>
          <a href="/books" style={{ marginRight: "1rem" }}>Books</a>
          <a href="/admin">Admin</a>
        </nav>
      </header>
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
}

// ThemeApplier — subscribes to the Zustand theme store and writes the
// current value to the document. Renders nothing.
function ThemeApplier() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeApplier />
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
