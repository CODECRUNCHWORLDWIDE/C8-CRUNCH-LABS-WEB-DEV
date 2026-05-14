# Challenge 1 — Protected Routes, Two Ways

> Estimated time: 60–90 minutes.
> Difficulty: Moderate.
> Prerequisite: Exercise 2 finished (router skeleton in place).

---

## The brief

In a real app, some routes require a logged-in user. The user that visits `/admin` while signed out should be redirected to `/login`, sign in there, and then land back on `/admin` — not on `/`. This challenge asks you to implement that flow **two ways**: with a wrapper component, and with a loader-level redirect. You will then defend which one you prefer and why.

Both implementations are documented patterns in the React Router v6 docs. The point of the exercise is to feel the trade-off, not to identify "the right answer."

---

## Setup

Start from your Exercise 2 router. You should already have:

- A `RootLayout` with a `<NavLink to="/admin">` in the nav.
- An `Admin` page (currently public).
- A working `createBrowserRouter` config.

Add a **mock auth** module — a tiny store of "is the user logged in?" that you can flip from the UI.

Create `src/auth.js`:

```js
// A minimal in-memory auth. In a real app this would be a TanStack Query
// for /api/me, or a Zustand store, or both. For the challenge, a module-
// scoped boolean plus a subscribe API is enough.

let user = null;
const listeners = new Set();

export const auth = {
  getUser() {
    return user;
  },
  signIn(username) {
    user = { username };
    listeners.forEach((fn) => fn(user));
  },
  signOut() {
    user = null;
    listeners.forEach((fn) => fn(user));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

// A React hook that re-renders on auth changes.
import { useSyncExternalStore } from "react";
export function useAuth() {
  return useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser);
}
```

Create `src/pages/Login.jsx`:

```jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../auth.js";

export default function Login() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    auth.signIn(name.trim());
    navigate(from, { replace: true });
  };

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Log in</h1>
      <p>This is a mock login. Type any name and submit.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
```

Note `location.state?.from?.pathname` — the wrapper-pattern implementation passes the originally-requested URL in `location.state`, and `Login` reads it to know where to send the user after signing in. The `replace: true` ensures the back button does not return to `/login`.

Add a sign-out button to the `RootLayout`:

```jsx
import { useAuth } from "../auth.js";
import { auth } from "../auth.js";

// inside RootLayout component:
const user = useAuth();
// ... in the JSX:
{user ? (
  <span>
    Hello, {user.username}.{" "}
    <button type="button" onClick={() => auth.signOut()}>Sign out</button>
  </span>
) : (
  <NavLink to="/login">Log in</NavLink>
)}
```

Run `npm run dev`. You should have a working sign-in/sign-out flow that does not yet protect anything. Now we add the protection.

---

## Implementation A — A wrapper component

Create `src/components/RequireAuth.jsx`:

```jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth.js";

export default function RequireAuth() {
  const user = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
```

In `src/router.jsx`, wrap the protected children in a `RequireAuth` layout route (a route with no `path`, only an `element` and `children`):

```jsx
import RequireAuth from "./components/RequireAuth.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      // ... users routes ...
      {
        element: <RequireAuth />,
        children: [
          { path: "admin", element: <Admin /> },
          // any other protected routes here
        ],
      },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);
```

Test:

1. Sign out (if signed in).
2. Click "Admin" in the nav.
3. You should land on `/login` (URL changes).
4. Sign in.
5. You should land on `/admin` (URL changes again, and you see the admin page).
6. Click browser back. You should **not** return to `/login` (because of `replace: true`).

The mechanism: `RequireAuth` renders either `<Navigate>` (which performs a client-side redirect via `useEffect` internally) or `<Outlet />` (which renders the matched child). When the user is signed in, the child renders. When not, the navigation happens.

---

## Implementation B — A loader-level redirect

Now do the same thing without `RequireAuth`. The route's `loader` performs the auth check before the component renders and throws a `redirect` if no user.

Add a helper in `src/auth.js`:

```js
import { redirect } from "react-router-dom";

export function requireAuthLoader({ request }) {
  if (!auth.getUser()) {
    const url = new URL(request.url);
    throw redirect(`/login?from=${encodeURIComponent(url.pathname)}`);
  }
  return auth.getUser();
}
```

In `src/router.jsx`, attach the loader to the protected route:

```jsx
import { requireAuthLoader } from "./auth.js";

// in the children array:
{ path: "admin", loader: requireAuthLoader, element: <Admin /> },
```

Update `Login.jsx` to handle the `?from=` query parameter (in addition to the `location.state` variant):

```jsx
import { useSearchParams } from "react-router-dom";

// inside Login component:
const [searchParams] = useSearchParams();
const fromParam = searchParams.get("from");
const fromState = location.state?.from?.pathname;
const from = fromParam || fromState || "/admin";
```

Test the same way as before:

1. Sign out.
2. Click "Admin."
3. Land on `/login?from=%2Fadmin`. (URL-encoded `/admin`.)
4. Sign in.
5. Land on `/admin`.

The mechanism: when the user navigates to `/admin`, the router runs the loader first. The loader throws a `Response` produced by `redirect("/login?from=...")`. The router intercepts the response, navigates to the new URL, and **never renders the admin page**. The user does not see a flash of the protected UI.

---

## Comparison

| Aspect                                | Wrapper (A)                                  | Loader (B)                              |
|---------------------------------------|----------------------------------------------|-----------------------------------------|
| When the check happens                | During render                                | Before render                           |
| Flash of protected UI?                | Briefly possible (a render frame before Navigate fires) | No (router intercepts before render) |
| Where the auth state comes from       | A React hook (`useAuth`)                     | Direct module access (`auth.getUser()`) |
| Where the post-login destination lives | `location.state.from`                       | `?from=` query parameter                |
| Test setup                            | Wrap with `MemoryRouter` + mock user         | Same                                    |
| Reads cleanly with TanStack Query?    | Yes — `useQuery(["user"])` inside `RequireAuth` | Yes — `queryClient.fetchQuery(["user"])` inside the loader |

The loader version is **slightly preferable** in a data-router setup because:

- The check runs before any rendering, so there is no possible flash.
- The loader can also return the user object via `useLoaderData`, so the protected component reads the user without a second fetch.
- The loader integrates with React Router's pending state (`useNavigation()`).

The wrapper version is **fine for simpler cases** and is closer to how pre-v6.4 code is structured. It reads more naturally if you are already wrapping the tree with auth providers.

---

## Done when

- [ ] Both implementations work side by side (you can keep both in the same project — just attach the loader to `/admin` and put the wrapper around some other route, e.g. a hypothetical `/dashboard`).
- [ ] The sign-in flow round-trips correctly: visit protected route → land on login → sign in → land on the protected route, not on `/`.
- [ ] In your notes, you have written 100 to 200 words on which implementation you prefer and why, citing at least one doc URL.
- [ ] You have read <https://reactrouter.com/en/main/fetch/redirect> and <https://reactrouter.com/en/main/components/navigate>.

---

## Stretch

- Replace the in-memory `auth` with a TanStack Query that hits `/api/me`. The loader becomes `queryClient.fetchQuery(["user"])`; the redirect happens if that returns `null`.
- Add a **role-based** check. The admin route requires `user.role === "admin"`. Implement the role check in both the wrapper and the loader; observe that the loader-level check produces a cleaner "you are signed in but not authorized" error page.
- Read <https://reactrouter.com/en/main/route/should-revalidate> and decide: should the auth check re-run on every navigation, or only on initial entry? The default is "every navigation." For an auth check, why is that the right default?

---

## Further reading

- React Router v6 — `redirect` — <https://reactrouter.com/en/main/fetch/redirect>
- React Router v6 — `<Navigate>` — <https://reactrouter.com/en/main/components/navigate>
- React Router v6 — Tutorial chapter on auth — <https://reactrouter.com/en/main/start/tutorial>
- React — `useSyncExternalStore` — <https://react.dev/reference/react/useSyncExternalStore>
