# Exercise 2 — Routes and Loaders

> Estimated time: 90–120 minutes.
> Prerequisite: Lecture 2 read. A Vite + React project running.

---

## Goal

Build a small four-route React Router v6 application with a shared layout, a nested route, one route loader that fetches data, one programmatic navigation, and one lazy-loaded route. By the end you should be able to:

- Configure `createBrowserRouter` with nested routes.
- Render `<Outlet />` inside a layout.
- Read params with `useParams`.
- Fetch data in a route loader and consume it with `useLoaderData`.
- Lazy-load a route component with `React.lazy` + `<Suspense>` and verify the chunk in DevTools.

The data source is a free, no-auth API: **JSONPlaceholder** at <https://jsonplaceholder.typicode.com>. We use the `/users` endpoint and the `/users/:id` endpoint.

---

## Setup

```bash
npm create vite@latest routes-and-loaders -- --template react
cd routes-and-loaders
npm install
npm install react-router-dom
```

In `src/main.jsx`:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## Step 1 — The router skeleton

Create `src/router.jsx`:

```jsx
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";
import Home from "./pages/Home.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
    ],
  },
]);
```

Create `src/App.jsx`:

```jsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router.jsx";

export default function App() {
  return <RouterProvider router={router} />;
}
```

Create `src/layouts/RootLayout.jsx`:

```jsx
import { NavLink, Outlet, ScrollRestoration } from "react-router-dom";

const navStyle = ({ isActive }) => ({
  fontWeight: isActive ? "bold" : "normal",
  marginRight: "1rem",
});

export default function RootLayout() {
  return (
    <>
      <header>
        <nav aria-label="Primary">
          <NavLink to="/" end style={navStyle}>Home</NavLink>
          <NavLink to="/users" style={navStyle}>Users</NavLink>
          <NavLink to="/admin" style={navStyle}>Admin</NavLink>
        </nav>
      </header>
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  );
}
```

Create `src/pages/Home.jsx`:

```jsx
export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <p>Welcome. Open the Users tab to see a list.</p>
    </>
  );
}
```

Run `npm run dev`. You should have a navigable, single-route page with placeholder links to `/users` and `/admin` that 404 silently for now.

---

## Step 2 — Nested routes

Add a `users` route group with an index list page and a detail page. The list and detail share a `UsersLayout` that displays a sidebar.

Create `src/layouts/UsersLayout.jsx`:

```jsx
import { Link, Outlet, useMatch } from "react-router-dom";

export default function UsersLayout() {
  const onIndex = !!useMatch("/users");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "1rem" }}>
      <aside>
        <h2>Users</h2>
        <p>
          <Link to="/users">All users</Link>
        </p>
        {!onIndex && <p><Link to="/users">← Back to list</Link></p>}
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
```

Create `src/pages/UsersIndex.jsx`:

```jsx
import { Link, useLoaderData } from "react-router-dom";

export default function UsersIndex() {
  const users = useLoaderData();
  return (
    <>
      <h2>All users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <Link to={String(u.id)}>{u.name}</Link>{" "}
            <small>({u.email})</small>
          </li>
        ))}
      </ul>
    </>
  );
}
```

Create `src/pages/UserDetail.jsx`:

```jsx
import { useLoaderData, useNavigate } from "react-router-dom";

export default function UserDetail() {
  const user = useLoaderData();
  const navigate = useNavigate();
  return (
    <article>
      <h2>{user.name}</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Company:</strong> {user.company?.name}</p>
      <p><strong>Website:</strong> {user.website}</p>
      <button type="button" onClick={() => navigate(-1)}>Back</button>
    </article>
  );
}
```

Now register these in `src/router.jsx`:

```jsx
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";
import UsersLayout from "./layouts/UsersLayout.jsx";
import Home from "./pages/Home.jsx";
import UsersIndex from "./pages/UsersIndex.jsx";
import UserDetail from "./pages/UserDetail.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

async function usersLoader({ request }) {
  const response = await fetch("https://jsonplaceholder.typicode.com/users", {
    signal: request.signal,
  });
  if (!response.ok) throw new Response("Failed to load users", { status: response.status });
  return response.json();
}

async function userLoader({ params, request }) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${params.userId}`,
    { signal: request.signal },
  );
  if (!response.ok) throw new Response("User not found", { status: 404 });
  return response.json();
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "users",
        element: <UsersLayout />,
        children: [
          { index: true, loader: usersLoader, element: <UsersIndex /> },
          { path: ":userId", loader: userLoader, element: <UserDetail /> },
        ],
      },
    ],
  },
]);
```

Create `src/pages/ErrorPage.jsx`:

```jsx
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error?.message ?? "Unknown error";

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Something went wrong</h1>
      <p role="alert">{message}</p>
      <p><Link to="/">Go home</Link></p>
    </main>
  );
}
```

Run `npm run dev` again. Click "Users." The list should load. Click a user. The detail should load. Click "Back." The list should still be there. Notice that:

- The sidebar in `UsersLayout` did not flash or remount when you clicked into a user.
- The URL changed from `/users` to `/users/3`.
- The browser back button works.

---

## Step 3 — A lazy-loaded admin route

Create `src/pages/Admin.jsx`:

```jsx
import { useState } from "react";

export default function Admin() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h2>Admin</h2>
      <p>This page is lazy-loaded. Open DevTools' Network tab and reload, then click "Admin" — a new JS chunk appears at that moment.</p>
      <p>Click count: {count}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>+1</button>
    </>
  );
}
```

Update `src/router.jsx` to lazy-import `Admin`:

```jsx
import { lazy, Suspense } from "react";

const Admin = lazy(() => import("./pages/Admin.jsx"));

// ... in the children array:
{
  path: "admin",
  element: (
    <Suspense fallback={<p>Loading admin...</p>}>
      <Admin />
    </Suspense>
  ),
},
```

Reload the dev server. Open DevTools' Network tab, clear it, then click "Admin." A `.js` file named something like `Admin-abc123.js` (or `assets/Admin-...js`) should download at the moment of click. If you do not see one, the split did not happen — check that `Admin` is **only** imported via `lazy()`, not statically anywhere else.

---

## Step 4 — Programmatic navigation

In `UserDetail.jsx`, the `Back` button already uses `navigate(-1)`. Add a second navigation: after viewing a user, the URL should support a `?from=admin` search param that the back button respects.

```jsx
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";

export default function UserDetail() {
  const user = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");

  const handleBack = () => {
    if (from === "admin") navigate("/admin");
    else navigate(-1);
  };

  return (
    <article>
      <h2>{user.name}</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <button type="button" onClick={handleBack}>Back</button>
    </article>
  );
}
```

Visit `/users/3?from=admin`. Click Back. You land on `/admin`. Without the `?from=admin`, you would have gone back in history.

---

## Step 5 — A 404 route

Add a catch-all to the router:

```jsx
{ path: "*", element: <ErrorPage /> },
```

(Place it at the end of the children array.) Visit `/nonsense`. The error page renders.

Note: the catch-all uses your `ErrorPage` component without throwing. The component handles both cases — a thrown `Response` from a loader (via `useRouteError`) and a render-time match — because `useRouteError()` returns `undefined` outside an error boundary, and the destructuring + fallback handles that.

---

## Verification checklist

- [ ] Navigating between `/`, `/users`, `/admin` does not reload the page (the URL changes, but the layout's header does not flash).
- [ ] Visiting `/users` loads the users list. The list is rendered, not a spinner — the loader awaited the fetch.
- [ ] Visiting `/users/3` loads user 3's detail. The user's name is in the document.
- [ ] Visiting `/users/9999` (a non-existent ID) shows the error page with "404 — User not found."
- [ ] Visiting `/admin` for the first time, with Network tab open, shows a new JavaScript chunk loading at the moment of the navigation.
- [ ] Visiting `/nonsense` shows the error page.
- [ ] Clicking browser back from `/users/3` returns to `/users` with the list intact (TanStack Query is not installed yet, so the list refetches; that is fine for this exercise).

---

## Reflection prompts

Write your answers in notes.

1. **Why is the `UsersLayout` component a separate route in the tree, rather than rendered inside `UsersIndex` and `UserDetail` each?** Hint: try moving it inside each leaf. What changes about its mount lifecycle?
2. **The `usersLoader` and `userLoader` both pass `request.signal` to `fetch`.** What happens if you remove `signal: request.signal`? Try it: visit `/users`, then quickly navigate to `/admin` while the fetch is in flight. Inspect Network. What changes?
3. **The error page handles two cases — thrown loader responses and unmatched paths.** What is the difference between a `errorElement` and a `path: "*"` route, and when would you reach for each?

Reference answers in [SOLUTIONS.md](./SOLUTIONS.md).

---

## Further reading

- React Router v6 — Tutorial — <https://reactrouter.com/en/main/start/tutorial>
- React Router v6 — `createBrowserRouter` — <https://reactrouter.com/en/main/routers/create-browser-router>
- React Router v6 — Route loaders — <https://reactrouter.com/en/main/route/loader>
- React Router v6 — `<Outlet />` — <https://reactrouter.com/en/main/components/outlet>
- React Router v6 — Lazy routes — <https://reactrouter.com/en/main/route/lazy>
- MDN — `AbortSignal` — <https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal>
- JSONPlaceholder — <https://jsonplaceholder.typicode.com>
