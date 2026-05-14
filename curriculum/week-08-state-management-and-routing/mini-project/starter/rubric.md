# Mini-Project Rubric

> A 100-point scoring rubric for the Crunch Library mini-project. Self-grade after submission. Each criterion has three levels (Excellent, Passing, Below). Total at the bottom.

---

## 1. Routing (25 points)

| Level     | Description                                                                          | Points |
|-----------|--------------------------------------------------------------------------------------|-------:|
| Excellent | All five routes work. Nested routes use `<Outlet />`. The `BooksLayout` mounts once and stays mounted across `/books` → `/books/:id` navigations. Browser back/forward works. The 404 route shows a useful page. | 25     |
| Passing   | All five routes navigable. Nested routing in place. Browser back/forward works.       | 18     |
| Below     | Some routes missing, or all routes flat (no nesting), or back/forward broken.         | 10 or fewer |

---

## 2. URL state (15 points)

| Level     | Description                                                                          | Points |
|-----------|--------------------------------------------------------------------------------------|-------:|
| Excellent | Search and category filters live in the URL via `useSearchParams`. Pasting a filtered URL into a new tab lands on the same filtered view. Debounce works (200 ms). `setSearchParams({}, { replace: true })` is used for keystroke-rate updates. | 15     |
| Passing   | Search query in URL. Pasting URL works. Debounce may or may not be implemented.       | 10     |
| Below     | Filter state lives in `useState`. URL does not reflect filters.                       | 5 or fewer |

---

## 3. TanStack Query (20 points)

| Level     | Description                                                                          | Points |
|-----------|--------------------------------------------------------------------------------------|-------:|
| Excellent | `useQuery` is used for the list, the detail, and the user. Query keys follow a stable convention. The book detail's route loader prefetches into the cache; the component reads from the cache and renders without a spinner on the first paint. Mutation invalidates the relevant queries. | 20     |
| Passing   | `useQuery` is used everywhere; loaders may or may not prefetch.                       | 14     |
| Below     | Components use `useEffect` + `fetch` instead.                                         | 7 or fewer |

---

## 4. Lazy-loaded admin route (10 points)

| Level     | Description                                                                          | Points |
|-----------|--------------------------------------------------------------------------------------|-------:|
| Excellent | The `Admin` component is `React.lazy`'d and wrapped in `<Suspense>`. The Network tab confirms the `Admin-*.js` chunk does NOT load until the user visits `/admin`. The chunk is small (under 50 KB compressed). | 10     |
| Passing   | The admin component is in a separate file but the chunk loads on initial load.        | 6      |
| Below     | The admin component is statically imported and bundled into the main chunk.           | 2 or fewer |

---

## 5. Protected route (10 points)

| Level     | Description                                                                          | Points |
|-----------|--------------------------------------------------------------------------------------|-------:|
| Excellent | The `/admin` route uses a loader-level `redirect`. Visiting `/admin` while signed out lands on `/login?from=/admin` with no flash of the protected UI. After login, the user lands on `/admin`, not on `/`. | 10     |
| Passing   | A wrapper component (`<RequireAuth>`) handles the redirect; the round-trip works.     | 7      |
| Below     | No protection; or the protection only works on initial visit and not after sign-out.  | 2 or fewer |

---

## 6. Global state (Zustand) (10 points)

| Level     | Description                                                                          | Points |
|-----------|--------------------------------------------------------------------------------------|-------:|
| Excellent | A Zustand store for the theme uses the `persist` middleware. The theme survives a refresh. The store is read with a selector (`useThemeStore((s) => s.theme)`), not with the entire-state-object pattern. No theme state is in Context or in `useState`. | 10     |
| Passing   | Theme is in a Zustand store and works, but does not persist; or uses the entire-state-object pattern (a perf footgun). | 7      |
| Below     | Theme is in Context or in `useState`. Survives refresh: no.                            | 2 or fewer |

---

## 7. Accessibility (5 points)

| Level     | Description                                                                          | Points |
|-----------|--------------------------------------------------------------------------------------|-------:|
| Excellent | Every page passes axe DevTools (no critical or serious issues). Every interactive element is keyboard-reachable. Skip-to-content link exists. Filter inputs are labeled. Loading uses `aria-busy`; errors use `role="alert"`. | 5      |
| Passing   | Most pages pass; one or two issues remain.                                            | 3      |
| Below     | Multiple critical or serious axe issues across pages.                                 | 1 or fewer |

---

## 8. Deployed (5 points)

| Level     | Description                                                                          | Points |
|-----------|--------------------------------------------------------------------------------------|-------:|
| Excellent | Deployed to a public URL. Deep links work (refreshing `/books/3` does not 404). README contains the URL.| 5      |
| Passing   | Deployed but deep links 404 (SPA fallback missing).                                   | 3      |
| Below     | Not deployed.                                                                         | 0      |

---

## Architecture defense (no points, but required)

The README's "Architecture" section is a written check on your understanding. It is **required to pass** regardless of the point total.

A passing architecture paragraph:

- Names each of the three layers (server / URL / local UI) and the tool used for each.
- Cites at least three doc URLs (React Router, TanStack Query, Zustand).
- Defends the choice not to use Context for global state (or, if you did use Context, defends why).
- Defends the choice not to use Redux Toolkit (or, if you did use RTK, defends why).

A failing architecture paragraph waves at the tools without explaining what each one is doing.

---

## Total

| Section                                  | Earned | Max |
|------------------------------------------|-------:|----:|
| 1. Routing                               |        |  25 |
| 2. URL state                             |        |  15 |
| 3. TanStack Query                        |        |  20 |
| 4. Lazy-loaded admin route               |        |  10 |
| 5. Protected route                       |        |  10 |
| 6. Global state (Zustand)                |        |  10 |
| 7. Accessibility                         |        |   5 |
| 8. Deployed                              |        |   5 |
| **Architecture defense (required)**      |        |   — |
| **Total**                                |        | 100 |

**Passing:** 70.
**Excellent:** 90.

If you score below 70, do not advance to Week 9 yet. The Week 9 material assumes you can read and write this stack. Re-do the weak sections; the cost of compounding gaps grows quickly from here.
