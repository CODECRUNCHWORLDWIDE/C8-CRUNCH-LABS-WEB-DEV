# Week 8 — Mini-Project: Crunch Library (a multi-route SPA)

> The week's deliverable. A multi-route React SPA that uses **React Router v6** for navigation, **TanStack Query** for server data, and **Zustand** for one piece of global UI state. The app ships a lazy-loaded admin route, a protected route, and an optimistic mutation. By Sunday, the app is deployed to a public URL and your repo README has the URL, a Lighthouse screenshot, and a one-paragraph architecture defense.

---

## The brief

You will build **Crunch Library**: a small library-of-books app. The data comes from a free, no-auth public API — JSONPlaceholder's `/posts` and `/users` endpoints, which we will treat as our "books" and "members" for the purposes of this exercise. The pretense is thin; the architecture is the point.

The app has five routes:

| URL                      | Description                                                            |
|--------------------------|------------------------------------------------------------------------|
| `/`                      | Home — a welcome page with a featured book                             |
| `/books`                 | Books index — list of all books with search and category filters       |
| `/books/:bookId`         | Book detail — read the book, see other books by the same author        |
| `/admin`                 | Admin (protected, lazy-loaded) — create a new book                     |
| `/login`                 | Login form (mock; any name works)                                      |

The architecture uses exactly the three tools from this week:

- **React Router v6** — `createBrowserRouter`, nested routes, a loader for the book-detail route, a loader-level auth redirect on `/admin`, and `React.lazy` for the `/admin` route's chunk.
- **TanStack Query** — `["books"]` for the list, `["book", id]` for the detail, `["user"]` for the auth user. The `/admin` form uses `useMutation` to create a book.
- **Zustand** — one store for the global theme (light / dark / system). The store uses the `persist` middleware so the theme survives a refresh.

---

## Functional requirements

**1. Home page (`/`)**

- A welcome message and a featured-book card that links to `/books/:id`.
- The featured book is the first book in the books list (the page reads from the same TanStack Query cache key as `/books`).
- Static; ships React + the query client; otherwise no special interactivity.

**2. Books index (`/books`)**

- A list of books fetched via `useQuery({ queryKey: ["books"], queryFn: fetchBooks })`.
- A search input that filters the list. The search query is in the URL as `?q=...`, set via `useSearchParams`, debounced 200 ms.
- A category filter (multi-select via checkboxes — invent three to five categories based on the data, or use the book's "userId" as a stand-in category). The selected categories are in the URL as `?category=X&category=Y`.
- A live count of matching books.
- Each book item links to `/books/:bookId`.

**3. Book detail (`/books/:bookId`)**

- The route has a loader that prefetches `["book", bookId]` into the TanStack Query cache.
- The component reads from the cache via `useQuery({ queryKey: ["book", bookId] })`.
- Shows the book's title, body, and the author's name (fetched via a second `useQuery`).
- A "back to books" button that uses `useNavigate(-1)`.
- A "delete this book" button that calls `useMutation` to delete (the API will fake-succeed; the list invalidation still demonstrates the wiring).

**4. Admin (`/admin`)** — protected, lazy-loaded

- The route is `React.lazy(() => import("./pages/Admin.jsx"))` wrapped in `<Suspense>`.
- The route has a loader that checks the auth state. If the user is not signed in, the loader throws `redirect("/login?from=/admin")`.
- The admin page has a form to create a new book (title, body). On submit, `useMutation` posts and invalidates `["books"]`. On success, the user is redirected to `/books`.
- Verify in DevTools' Network tab that the `Admin` JS chunk does **not** download until the user visits `/admin`.

**5. Login (`/login`)**

- A simple form: enter any name, click submit, become signed-in.
- The auth store is a Zustand store with `setUser`, `signOut`. On submit, the form calls `setUser({ name })` and navigates to the `?from=` param if present, else to `/`.

**6. Global theme**

- A Zustand store with `theme: "light" | "dark"` and `toggle()` action.
- The store persists to `localStorage` via the `persist` middleware. The theme survives a refresh.
- A theme toggle button in the header.
- The current theme is applied via `document.documentElement.dataset.theme` (you write the CSS so the body reflects the theme via attribute selector).

---

## Non-functional requirements

**Accessibility.**

- Every page passes the **W3C HTML validator** (no errors). <https://validator.w3.org/>
- Every page passes **axe DevTools** (no critical or serious issues).
- Every interactive element is keyboard-reachable.
- The layout has a **skip-to-content link** as the first focusable element.
- The book-list filter inputs are properly labeled.
- Loading states use `aria-busy` or visible "loading" text; error states use `role="alert"`.

**Performance.**

- Initial bundle (excluding the admin chunk) **under 200 KB compressed**. React + React Router + TanStack Query + Zustand + your code should fit.
- The admin chunk loads only when the user visits `/admin`. Verify in Network tab.
- Each route navigation is **instant** after the first visit (TanStack Query cache hit).

**Build and deploy.**

- The site builds successfully (`npm run build` exits 0).
- The site is deployed to a public URL (Vercel, Netlify, or Cloudflare Pages).
- The repo includes a `README.md` describing how to run the site locally and the deployed URL.

---

## Project structure (suggested)

```
crunch-library/
├── package.json
├── vite.config.js
├── index.html
├── README.md
└── src/
    ├── main.jsx                          (boots React + providers)
    ├── App.jsx                           (renders <RouterProvider>)
    ├── router.jsx                        (the route config)
    ├── layouts/
    │   ├── RootLayout.jsx                (header, nav, footer, <Outlet />)
    │   └── BooksLayout.jsx               (sidebar, <Outlet />)
    ├── pages/
    │   ├── Home.jsx
    │   ├── BooksIndex.jsx
    │   ├── BookDetail.jsx
    │   ├── Admin.jsx                     (lazy-loaded)
    │   ├── Login.jsx
    │   └── ErrorPage.jsx
    ├── components/
    │   ├── ThemeToggle.jsx
    │   ├── SignInOutButton.jsx
    │   └── RouteSpinner.jsx
    ├── store/
    │   ├── themeStore.js                 (Zustand; persisted)
    │   └── authStore.js                  (Zustand; auth user)
    ├── api/
    │   └── books.js                      (fetch wrappers; queryFn fns)
    ├── queries/
    │   └── keys.js                       (query-key factory)
    └── styles.css
```

The two starter files (`starter/App.jsx` and `starter/store.js`) below give you the providers wired and the theme store skeleton. The rest is yours.

---

## Implementation guide

### Day 1 — Friday morning: scaffold and providers

```bash
npm create vite@latest crunch-library -- --template react
cd crunch-library
npm install
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools zustand
```

Copy `starter/App.jsx` and `starter/store.js` into your `src/` (`App.jsx` and `src/store/themeStore.js`). Confirm `npm run dev` launches without error.

### Day 1 — Friday afternoon: the router

Build `src/router.jsx` with the five routes. Stub the page components to return placeholder content. Make the navigation work top to bottom; no data yet.

### Day 2 — Saturday morning: TanStack Query for the list

Implement `BooksIndex` with `useQuery(["books"], ...)`. Add the search input wired to `useSearchParams`. Add the category filter. Verify the URL updates as the user types and clicks.

### Day 2 — Saturday afternoon: the book detail and the loader

Implement `BookDetail`. Add a route loader that uses `queryClient.fetchQuery` to prefetch `["book", bookId]`. The component reads from the cache. Verify in Devtools that the cache is populated by the time the component renders.

### Day 3 — Sunday morning: admin, lazy, and protection

Implement `Login` with the auth Zustand store. Implement `Admin` with `useMutation` to create a book. Wrap `Admin` in `React.lazy` + `<Suspense>`. Add the auth loader on the `/admin` route. Verify the chunk in Network tab.

### Day 3 — Sunday afternoon: polish, audit, deploy

Apply theme styling. Run Lighthouse on the dev build (or `npm run preview`). Fix any issues. Run axe DevTools. Deploy to Vercel.

---

## The architecture defense

When you submit, your README must include a section titled **"Architecture"**. It is one paragraph (4 to 7 sentences) that defends the choice of each tool by citing its documentation. A passing version of this paragraph reads like:

> The app uses three tools for three different state layers. **TanStack Query** caches the books and the auth user under stable query keys (`["books"]`, `["book", id]`, `["user"]`); the cache is stale-while-revalidate by default, which gives instant navigation back to a previously-viewed book (cite: <https://tanstack.com/query/latest/docs/framework/react/overview>). **Search and filter state** lives in the URL via `useSearchParams` so a customer-support reply can include the exact filtered view (cite: <https://reactrouter.com/en/main/hooks/use-search-params>). **The global theme** is a Zustand store with the `persist` middleware so a single source of truth handles cross-component reads, cross-component writes, and survives a refresh (cite: <https://docs.pmnd.rs/zustand/integrations/persisting-store-data>). **The admin route is lazy-loaded** to keep the initial bundle small; the route's loader handles the auth redirect before render (cite: <https://reactrouter.com/en/main/route/loader> and <https://reactrouter.com/en/main/fetch/redirect>). The choice **not to use Redux Toolkit** is because the app's global state is small and Zustand's three-kilobyte API is sufficient; the choice not to use Context for the theme is the standard one (Context is a delivery mechanism, not a state library — Mark Erikson's framing at <https://blog.isquaredsoftware.com/2021/01/context-redux-differences/>).

The point of writing this paragraph is that it forces you to articulate your decisions in the language of the docs. A passing answer cites three or more URLs. A failing answer waves at the tools without saying which problem each solves.

---

## Deployment

Three free options, in order of recommendation for an SPA:

**Option 1 — Vercel.** Push to GitHub. Sign in to <https://vercel.com> with GitHub. "Add New → Project." Pick the repo. Vercel detects Vite. **Important:** for an SPA, you may need to add a `vercel.json` with `"rewrites": [{ "source": "/(.*)", "destination": "/" }]` so deep links work (otherwise refreshing `/books/3` returns a 404).

**Option 2 — Netlify.** Build command `npm run build`, publish directory `dist`. Add a `_redirects` file in `public/` with `/* /index.html 200` so deep links work.

**Option 3 — Cloudflare Pages.** Build command `npm run build`, output `dist`. Cloudflare Pages handles SPA routing out of the box.

All three are free for personal projects. Pick one and move on.

---

## Submission and review

When the site is deployed:

1. Add the URL to your portfolio's `README.md`.
2. Add a "Built with" section listing React, Vite, React Router v6, TanStack Query, Zustand.
3. Add the **Architecture** paragraph described above.
4. Run Lighthouse on the deployed site one final time. Screenshot the four-bar summary and add it to the README.
5. Open a pull request against `main`. The PR description should include:
   - A one-paragraph summary of what you built.
   - The Lighthouse scores.
   - One specific thing you struggled with and how you resolved it.
   - One specific decision you would revisit if you had another week.

---

## Common pitfalls

**1. Putting the search query in `useState` instead of the URL.** The user pastes the URL to a colleague and the colleague does not see the filtered view. Always use `useSearchParams` for filter state.

**2. Inlining the auth loader's check inside the component.** The component renders briefly before the check resolves; the user sees a flash of the protected UI. Put the check in the loader (or in a `<RequireAuth>` wrapper with `useSyncExternalStore`).

**3. Static-importing the lazy component somewhere else.** A statically imported `Admin` is pulled into the main bundle and the lazy split is defeated. Verify in Network tab: the `Admin-*.js` chunk should not appear until the user visits `/admin`.

**4. Forgetting to invalidate after a mutation.** A `useMutation` that creates a book but does not call `queryClient.invalidateQueries(["books"])` leaves the list stale; the new book does not appear until a manual refresh.

**5. SPA routing on a static host.** A refresh on `/books/3` returns 404 because the static host has no file at that path. Configure the host's fallback to serve `index.html` for all paths (the `vercel.json` / `_redirects` lines above).

**6. The TanStack Query cache resets on Strict Mode double-mount.** Vite + StrictMode + a `QueryClient` instantiated inside a component causes the cache to reset on every double-render. Instantiate the `QueryClient` outside the component (at module scope) — the starter `App.jsx` shows the right pattern.

---

## Done when

- [ ] Five routes work and navigation between them does not reload the page.
- [ ] The books list reads from a TanStack Query cache. Navigation back to a visited book is instant.
- [ ] The search and category filter live in the URL. Pasting a filtered URL into a new tab lands on the same filtered view.
- [ ] The admin route is `React.lazy`'d. Network tab confirms the chunk loads only on first visit to `/admin`.
- [ ] The admin route redirects to `/login` when the user is not signed in, via a loader-level `redirect`. After signing in, the user lands on `/admin` (not on `/`).
- [ ] The admin form's mutation invalidates `["books"]` on success.
- [ ] The theme toggle works and the choice survives a refresh.
- [ ] Lighthouse Performance score 90+ on the books page.
- [ ] Every page passes axe DevTools (no critical or serious issues).
- [ ] Site is deployed to a public URL.
- [ ] Repo README contains the deployed URL, the Lighthouse screenshot, the architecture paragraph (with three or more doc citations), and the PR write-up.

---

## Rubric

| Criterion                                             | Weight |
|-------------------------------------------------------|-------:|
| All five routes implemented and navigable             |    20% |
| Filters in URL, debounced search, working back/fwd    |    15% |
| TanStack Query used correctly (queries + mutations)   |    20% |
| Lazy-loaded admin route, verified in Network tab      |    10% |
| Protected route via loader-level redirect             |    10% |
| Zustand theme store with persist middleware           |    10% |
| Deployed to a public URL                              |     5% |
| Architecture paragraph cites 3+ docs URLs             |    10% |

**Passing:** 70% or above.
**Excellent:** 90% or above, with the architecture paragraph reading like a senior engineer's PR description.

---

## Stretch (optional)

- Add **optimistic updates** to the delete-book button. The book disappears from the list instantly; rolls back on failure.
- Add an **infinite query** for the books list (`useInfiniteQuery`) with "Load more" pagination.
- Add **View Transitions** between routes (`document.startViewTransition` wrapped around the router's navigation hook).
- Persist the **search history** in a second Zustand store with `persist`; show the last five searches as quick-fill chips.
- Replace JSONPlaceholder with a real backend (a tiny Express server, or Pocketbase, or Supabase's free tier).
- Add the Vue Router 4 + Pinia equivalent as a sibling project — same five routes, same query keys, different framework — and write a short comparison.

---

## Further reading

- React Router v6 — Tutorial — <https://reactrouter.com/en/main/start/tutorial>
- TanStack Query — Overview — <https://tanstack.com/query/latest/docs/framework/react/overview>
- TanStack Query — React Router integration — <https://tanstack.com/query/latest/docs/framework/react/guides/react-router-integration>
- Zustand — README — <https://github.com/pmndrs/zustand>
- Zustand — Persist middleware — <https://docs.pmnd.rs/zustand/integrations/persisting-store-data>
- TkDodo — Practical React Query — <https://tkdodo.eu/blog/practical-react-query>
