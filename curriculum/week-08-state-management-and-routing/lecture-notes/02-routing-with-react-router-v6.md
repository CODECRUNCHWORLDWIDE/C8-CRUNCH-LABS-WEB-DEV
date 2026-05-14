# Lecture 2 — Routing with React Router v6

> Reading time: ~50 minutes. Cite the **React Router v6 documentation** at <https://reactrouter.com/en/main> by chapter. The lecture covers `createBrowserRouter`, nested routes, the `<Outlet />` element, route loaders, protected routes, and lazy-loaded route chunks. We assume Lecture 1 is read and the three-layer state taxonomy is in place.

---

## 1. What a client-side router actually does

The browser has a built-in router. When the user clicks a link to `/products`, the browser sends an HTTP `GET /products` to the server, receives an HTML document, and replaces the current document with the new one. The page repaints from scratch. The user's scroll position resets. Any JavaScript state in the previous page is discarded. The new page's JavaScript boots fresh.

This is the **multi-page application** model. It is the default the web is designed around. It is what Astro produced in Week 7. For content sites with occasional interactivity, it is the right tool.

A **single-page application** opts out of this. Instead of the browser fetching a new HTML document, JavaScript intercepts link clicks, updates the URL via `history.pushState`, fetches just the data the new view needs, and renders the new view by swapping components in the existing DOM. The browser thinks no navigation happened. The user sees a navigation.

The piece of JavaScript that does this dance is called the **router**. Its job is to:

1. **Listen to the URL.** Subscribe to `popstate` events (back/forward), intercept clicks on internal links, and read the current `window.location`.
2. **Match the URL to a component tree.** Given the path `/products/42`, decide what to render — typically a layout component (the app shell) with a child component for the matched route (the product detail).
3. **Manage transitions.** Push history entries on navigation. Fire data fetches when needed. Show pending UI. Handle errors. Restore scroll position on back-navigation.

You could write this yourself. You did, in essence, in Week 4 when you wrote a tiny single-page demo that swapped views on a click. For real apps, you use a library. The dominant React library is **React Router** (currently v6); the dominant alternative is **TanStack Router**. We will use React Router v6 because the API is mature, the docs are good, and it is the library you will most often encounter in industry code.

The normative documentation is at <https://reactrouter.com/en/main>. The lecture cites it by section.

---

## 2. The data router: `createBrowserRouter`

React Router has two flavors of router: the original component-tree style (`<BrowserRouter>` wrapping `<Routes>` and `<Route>` elements) and the newer **data router** style (`createBrowserRouter` with a route-object tree, paired with `<RouterProvider>`). The data router is the recommended API as of v6.4 and is what we use throughout this week. The doc page is at <https://reactrouter.com/en/main/routers/create-browser-router>.

The shape:

```jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./RootLayout.jsx";
import Home from "./Home.jsx";
import About from "./About.jsx";
import NotFound from "./NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

What is in this snippet:

- **`createBrowserRouter(routes)`** takes an array of route objects and returns a router instance. The router is created **once**, at module scope, outside any component. (It can be created inside a component, but the route definitions then re-evaluate on every render — a subtle source of bugs.)
- **A route object** has `path`, `element`, optional `children`, optional `loader`, optional `action`, optional `errorElement`, optional `lazy`. All other keys are advanced.
- **`<RouterProvider router={router} />`** is the single React element you render at the root of your tree. It owns the URL subscription and re-renders the matching subtree on every navigation.
- **`index: true`** marks a child route as the **index** — what to render when the parent's path matches exactly. `path: "/"` with `index: true` child means "when the URL is `/`, render `<RootLayout>` and `<Home>` inside its outlet."
- **`errorElement`** is what renders when the matched route (or any of its loaders) throws. It catches 404s, loader errors, render errors. You can have one per route; the nearest ancestor's `errorElement` catches errors thrown below.

The history before v6.4 was: routes were JSX, the components nested inside `<Routes>`, and data fetching was a tangled use of `useEffect` plus parent-child communication. The data router consolidates the data lifecycle into the route object itself. We will exploit this consolidation in §4.

---

## 3. Nested routes and `<Outlet />`

The single most important React Router primitive is **`<Outlet />`**. The doc page is at <https://reactrouter.com/en/main/components/outlet>.

A nested route is a route whose `children` are themselves routes. The parent's `element` typically defines the layout (header, navigation, footer, side bars), and the parent renders `<Outlet />` in the spot where the child route's element should appear. When the URL matches a child, the router fills the outlet with that child's element.

```jsx
// RootLayout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="app">
      <header>
        <h1>Crunch Library</h1>
        <nav aria-label="Primary">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/books">Books</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <small>Built with React Router v6.</small>
      </footer>
    </div>
  );
}
```

What this gives you:

- **The header and footer render once.** When the user navigates from `/` to `/about`, the layout component does not re-mount; only the outlet's contents change. State held in the layout (a dropdown's open/closed, the currently-focused element) is preserved across navigation.
- **The navigation can use `<NavLink>`.** This is a `<Link>` variant that adds an `aria-current="page"` attribute and an `.active` class when its `to` matches the current URL. It is the right tool for top-level navigation menus. The doc page is at <https://reactrouter.com/en/main/components/nav-link>. The `end` prop tells `<NavLink to="/">` to match `/` exactly (otherwise every URL would match `/` as a prefix).
- **The matching algorithm** walks the route tree, picks the leaf with the most specific match, and renders the chain from root to leaf. `/books/42` matches the route tree `["/", "books", "42"]` and the renderer instantiates `RootLayout → BooksLayout → BookDetail`, with each parent's outlet filled by its child.

Nested routes scale to several levels. A typical pattern:

```jsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "books",
        element: <BooksLayout />, // sidebar + outlet for the active book
        children: [
          { index: true, element: <BooksIndex /> },
          { path: ":bookId", element: <BookDetail /> },
          { path: "new", element: <NewBookForm /> },
        ],
      },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
```

Now `/books` renders `RootLayout → BooksLayout → BooksIndex`. `/books/42` renders `RootLayout → BooksLayout → BookDetail` with `bookId=42`. `/books/new` renders the form. **`BooksLayout` mounts once** and stays mounted as the user navigates between sibling book routes; its outlet swaps.

The `path: "*"` catch-all is the canonical 404 route. Any URL not matched by a more specific route falls through to it.

---

## 4. Route loaders: data before render

The data-router's headline feature is **route loaders**. A loader is an `async` function attached to a route that runs *before* the route's component renders. The component reads the loaded value via `useLoaderData`. The doc page is at <https://reactrouter.com/en/main/route/loader>.

```jsx
import { useLoaderData } from "react-router-dom";

async function bookLoader({ params, request }) {
  const response = await fetch(`/api/books/${params.bookId}`, {
    signal: request.signal,
  });
  if (!response.ok) {
    throw new Response("Book not found", { status: 404 });
  }
  return response.json();
}

function BookDetail() {
  const book = useLoaderData();
  return (
    <article>
      <h2>{book.title}</h2>
      <p>by {book.author}</p>
    </article>
  );
}

const router = createBrowserRouter([
  {
    path: "books/:bookId",
    loader: bookLoader,
    element: <BookDetail />,
  },
]);
```

What the loader gives you:

- **The component never renders without data.** No "loading" branch in the component itself. The loader awaits the fetch; the component renders only after the loader resolves. If the loader is slow, the router shows the previous route's UI until the loader completes (or you opt into a pending state with `useNavigation`).
- **The loader has access to params and the request.** `params.bookId` matches the `:bookId` in the path; `request.signal` is an `AbortSignal` you pass to `fetch` so the request cancels if the user navigates away mid-fetch.
- **Throwing a `Response` is the error API.** A loader that throws a `Response` (e.g. `throw new Response("Not found", { status: 404 })`) routes the error to the nearest `errorElement`. The component never renders; the error UI renders instead.

Loaders run **in parallel** across the matched route tree. If `/books/:bookId/reviews` has a loader for the book and a loader for the reviews, the router fires both at the same time, waits for both, then renders. This is a significant performance improvement over chained `useEffect` fetches.

### Loaders versus TanStack Query

A reasonable question: if I am using TanStack Query for server data (lecture 3), do I still need loaders? Three answers, all true:

- **Loaders defer rendering until data is ready.** Without a loader, the component renders with `data: undefined` and you show a spinner; with a loader, the component renders with the data. Different UX trade-offs.
- **Loaders trigger TanStack Query prefetches.** A common pattern is `loader: ({ params, queryClient }) => queryClient.fetchQuery(["book", params.bookId], fetchBook)`. The loader populates the cache; the component then calls `useQuery` and gets the data instantly from the cache.
- **Loaders integrate with the router's pending state.** `useNavigation()` returns `"loading"` while loaders are running. You can show a top-of-page progress bar without per-component spinner logic.

For this week's mini-project we use **both**: a loader on the book-detail route that prefetches into the cache, and `useQuery` inside the component for live updates. The loader handles the first paint; the query handles refetches, mutations, and invalidation. The pattern is documented at <https://tanstack.com/query/latest/docs/framework/react/guides/react-router-integration>.

---

## 5. Programmatic navigation: `useNavigate` and `redirect`

Sometimes you need to navigate without a click — after a form submits successfully, after a logout, after an auth check fails. React Router has two tools.

**`useNavigate`** — a hook that returns a function:

```jsx
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    navigate("/login");
  };
  return <button onClick={handleLogout}>Log out</button>;
}
```

`navigate("/somewhere")` pushes a new history entry and navigates. `navigate(-1)` is "back." `navigate("/somewhere", { replace: true })` replaces the current entry without adding to history. `navigate("/somewhere", { state: { foo: 1 } })` attaches arbitrary state to the entry that the destination can read via `useLocation().state`.

**`redirect`** — a function that returns a special `Response` you `throw` (or return) from a loader or action:

```jsx
import { redirect } from "react-router-dom";

async function dashboardLoader() {
  const user = await fetchCurrentUser();
  if (!user) throw redirect("/login");
  return user;
}
```

The doc page is at <https://reactrouter.com/en/main/fetch/redirect>. The router intercepts the redirect response, navigates to the destination, and never renders the route. The destination component never sees the original route at all — which matters for accessibility (the user is not briefly shown a flash of the wrong UI).

The general guidance:

- Navigating in response to a user event → `useNavigate`.
- Navigating in response to a data condition (auth, missing resource) → `redirect` from a loader.

---

## 6. Protected routes

A "protected route" is a route that requires the user to be logged in. There are two idiomatic implementations.

### Implementation A — A wrapper component

```jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

function RequireAuth() {
  const { user } = useAuth(); // your auth hook
  const location = useLocation();

  if (!user) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

// In the route config
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        element: <RequireAuth />, // no path; this is a "layout route"
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
```

The `RequireAuth` component is rendered above the protected children. It either renders `<Outlet />` (the children render normally) or a `<Navigate>` element (the router immediately navigates). The `state={{ from: location }}` passes the originally-requested URL to the login page so it can redirect back after a successful sign-in.

### Implementation B — A loader-level redirect

```jsx
async function requireAuth({ request }) {
  const user = await fetchCurrentUser();
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/login?from=${encodeURIComponent(url.pathname)}`);
  }
  return user;
}

const router = createBrowserRouter([
  {
    path: "dashboard",
    loader: requireAuth,
    element: <Dashboard />,
  },
]);
```

The loader does the auth check before the route renders. If the user is not authenticated, the loader throws a `redirect`; the router intercepts and navigates. The route component never renders.

**Which to use?** Both are correct. The loader version is preferable in a data-router setup because:

- The check happens before render — no flash of protected UI.
- The same loader can also return the user object, which the protected component reads via `useLoaderData`.
- The check is colocated with the route definition, not buried inside a wrapper.

The wrapper version is fine for simpler cases and is closer to how older React Router code is written. Both appear in the wild; both are documented patterns. Challenge 1 of this week has you implement both.

---

## 7. Lazy-loaded routes

A real app does not need every route's code on initial load. The login form does not need to download the admin dashboard's code. The home page does not need to download the rarely-visited settings page.

The solution is **code splitting** — bundling each route as a separate JavaScript file that loads on first visit. The bundler (Vite, in our case) handles the splitting; you tell it where to split with a dynamic `import()`.

React's primitive is `React.lazy`:

```jsx
import { lazy, Suspense } from "react";

const Admin = lazy(() => import("./Admin.jsx"));
const Settings = lazy(() => import("./Settings.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "admin",
        element: (
          <Suspense fallback={<RouteSpinner />}>
            <Admin />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<RouteSpinner />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
]);
```

What happens:

- **`React.lazy(() => import("./Admin.jsx"))`** returns a special component that, on first render, kicks off the dynamic import. Vite has produced a separate chunk for `Admin.jsx`; the browser fetches the chunk when the lazy component renders.
- **`<Suspense fallback={...}>`** wraps the lazy component. While the chunk is loading, React renders the fallback. When the chunk arrives, React replaces the fallback with the loaded component.
- **The chunk is cached.** A second visit to `/admin` does not re-fetch.

React Router v6.4 has a more ergonomic alternative via the `lazy` property on a route object:

```jsx
const router = createBrowserRouter([
  {
    path: "admin",
    lazy: async () => {
      const { default: Admin } = await import("./Admin.jsx");
      return { element: <Admin /> };
    },
  },
]);
```

The route-level `lazy` returns an object with any of the route fields (`element`, `loader`, `action`, etc.), so you can co-split the loader along with the component. The doc page is at <https://reactrouter.com/en/main/route/lazy>.

**Verifying the split:** Open DevTools' Network panel. Filter for "JS." Navigate from `/` to `/admin` for the first time. A new JavaScript file should appear in the network log at the moment of navigation. If everything is in the main bundle, the split did not happen. Common causes: importing the route component statically somewhere else (`import Admin from "./Admin.jsx"` defeats `React.lazy`'s split because Vite includes it in the main chunk).

---

## 8. URL state with `useSearchParams`

The router exposes the query string as state. `useSearchParams` returns a `[searchParams, setSearchParams]` pair, analogous to `useState`. The doc page is at <https://reactrouter.com/en/main/hooks/use-search-params>.

```jsx
import { useSearchParams } from "react-router-dom";

function BooksIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams);
          if (e.target.value) params.set("q", e.target.value);
          else params.delete("q");
          setSearchParams(params, { replace: true });
        }}
      />
      <select
        value={category}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams);
          params.set("category", e.target.value);
          setSearchParams(params);
        }}
      >
        <option value="all">All</option>
        <option value="fiction">Fiction</option>
      </select>
    </div>
  );
}
```

The pattern:

- **Read with `.get(name)`.** Returns the string value or `null`. Fall back with `?? "default"`.
- **Write by constructing a new `URLSearchParams`.** Mutating `searchParams` directly does nothing; you must call `setSearchParams(newParams)`.
- **`{ replace: true }` for keystroke-rate updates.** Without `replace`, every keystroke pushes a new history entry. The user hits "back" once and ends up four characters earlier. Use `replace: true` for inputs; push a new entry only for "commit-style" changes (selecting a category, clicking a page link).

The benefit, as discussed in Lecture 1 §2, is that the state is bookmarkable, shareable, and survives a refresh. The user can hit back and forward to walk through their search history. None of this requires extra plumbing.

---

## 9. Scroll restoration and `<ScrollRestoration />`

When the user navigates with the browser's back button, they expect to return to the same scroll position. The browser does this automatically for full-page navigations; client-side navigations bypass the browser, so React Router has to do the restoration manually.

The data router exposes `<ScrollRestoration />`:

```jsx
import { ScrollRestoration } from "react-router-dom";

function RootLayout() {
  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
```

`<ScrollRestoration />` should be rendered exactly once at the root. It listens to navigations and:

- **On forward navigations** scrolls to the top (or to the hash target if the URL has one).
- **On back/forward navigations** restores the scroll position the user had at that history entry.

It also exposes a `getKey` prop for customizing scroll keys per route. The doc page is at <https://reactrouter.com/en/main/components/scroll-restoration>. Add it once in the root layout; revisit only if scroll behavior surprises you.

---

## 10. A complete, realistic router

Putting the lecture's pieces together. The router for the week's mini-project:

```jsx
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";

import RootLayout from "./layouts/RootLayout.jsx";
import BooksLayout from "./layouts/BooksLayout.jsx";
import Home from "./pages/Home.jsx";
import BooksIndex from "./pages/BooksIndex.jsx";
import BookDetail from "./pages/BookDetail.jsx";
import Login from "./pages/Login.jsx";
import RouteSpinner from "./components/RouteSpinner.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

const Admin = lazy(() => import("./pages/Admin.jsx"));

export function makeRouter(queryClient) {
  return createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <Login /> },
        {
          path: "books",
          element: <BooksLayout />,
          children: [
            { index: true, element: <BooksIndex /> },
            {
              path: ":bookId",
              element: <BookDetail />,
              loader: async ({ params }) => {
                return queryClient.fetchQuery({
                  queryKey: ["book", params.bookId],
                  queryFn: () =>
                    fetch(`/api/books/${params.bookId}`).then((r) => r.json()),
                });
              },
            },
          ],
        },
        {
          path: "admin",
          loader: async () => {
            const user = await queryClient.fetchQuery({
              queryKey: ["user"],
              queryFn: () => fetch("/api/me").then((r) => r.json()),
            });
            if (!user) throw redirect("/login");
            return user;
          },
          element: (
            <Suspense fallback={<RouteSpinner />}>
              <Admin />
            </Suspense>
          ),
        },
        { path: "*", element: <ErrorPage notFound /> },
      ],
    },
  ]);
}
```

Every concept used here was introduced in this lecture: the root layout with nested children, the `:bookId` param, a loader that prefetches into the TanStack Query cache, a loader that redirects on missing auth, a `React.lazy` route wrapped in `Suspense`, and an `errorElement` for unmatched paths.

The component side stays small. Each page is a function that reads its data via `useParams`, `useLoaderData`, `useQuery`, or `useSearchParams`, and renders a tree. The router does the heavy lifting of matching, fetching, redirecting, and code-splitting.

---

## 11. What we are not covering

A short list of React Router features that exist and are worth knowing about, but are not in this week's scope:

- **`Form` and `action`.** React Router can intercept form submissions and run an `action` function before navigating. The pattern eliminates the need for `useState` on form fields and is excellent — read the docs at <https://reactrouter.com/en/main/components/form>. We use mutation hooks from TanStack Query instead (lecture 3), which is a different but valid pattern.
- **`defer` and `Await`.** Stream parts of the loader's data instead of waiting for all of it. Useful for slow APIs. <https://reactrouter.com/en/main/utils/defer>
- **`useFetcher`.** Trigger a loader or action without navigating. Useful for "like this comment" interactions. <https://reactrouter.com/en/main/hooks/use-fetcher>
- **Memory router and static router.** Alternative routers for testing (`createMemoryRouter`) and SSR (`createStaticRouter`). <https://reactrouter.com/en/main/routers/picking-a-router>
- **Custom `loaders` integration with Redux/MobX.** Use the `loader`'s argument shape to inject any global state container.

All of these are documented, all are sound, none are required to build the kind of SPA this week targets. The references above are the right place to return when you need them.

---

## 12. What to take away

Three things.

**One.** A router is the URL-to-component-tree function for a single-page application. React Router v6's data router (`createBrowserRouter`) is the recommended API; nested routes plus `<Outlet />` give you scalable layout composition without re-mounting on navigation.

**Two.** Route loaders are the canonical place to fetch data for a route. They run in parallel across the matched tree, expose `params` and an `AbortSignal`, integrate with the TanStack Query cache, and let you redirect before render.

**Three.** Lazy-loaded routes (`React.lazy` or the route-level `lazy` field) are how you keep the initial bundle small. The Network tab is the source of truth: if a route's chunk is not in the main bundle and not yet downloaded, the split is working.

Now read [lecture 3](./03-server-state-with-tanstack-query.md) for the server-state layer that pairs with the router, then start the exercises.

---

## Further reading

- React Router v6 — Main Concepts — <https://reactrouter.com/en/main>
- React Router v6 — Tutorial — <https://reactrouter.com/en/main/start/tutorial>
- React Router v6 — `createBrowserRouter` — <https://reactrouter.com/en/main/routers/create-browser-router>
- React Router v6 — `<Outlet />` — <https://reactrouter.com/en/main/components/outlet>
- React Router v6 — Route loaders — <https://reactrouter.com/en/main/route/loader>
- React Router v6 — `redirect` — <https://reactrouter.com/en/main/fetch/redirect>
- React Router v6 — `<NavLink>` — <https://reactrouter.com/en/main/components/nav-link>
- React Router v6 — `useSearchParams` — <https://reactrouter.com/en/main/hooks/use-search-params>
- React Router v6 — Route-level `lazy` — <https://reactrouter.com/en/main/route/lazy>
- React Router v6 — `<ScrollRestoration />` — <https://reactrouter.com/en/main/components/scroll-restoration>
- TanStack Query — React Router integration — <https://tanstack.com/query/latest/docs/framework/react/guides/react-router-integration>
- React — `React.lazy` — <https://react.dev/reference/react/lazy>
- React — `Suspense` — <https://react.dev/reference/react/Suspense>
- MDN — History API — <https://developer.mozilla.org/en-US/docs/Web/API/History_API>
