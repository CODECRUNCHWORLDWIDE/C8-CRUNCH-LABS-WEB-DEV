# Week 8 — Quiz

> Ten multiple-choice questions. Answers and explanations at the bottom. Aim for 7 or above. If you score under 7, re-read the relevant lecture before moving on.

---

## Questions

**1.** Lecture 1 frames application state in three layers. Which is **not** one of them?

- A. Server state — data fetched from a remote API.
- B. URL state — data bookmarkable and shareable via the address bar.
- C. Local UI state — data internal to one or a few components.
- D. Session state — data stored only in `sessionStorage`.

**2.** Which piece of state most clearly belongs in the **URL**?

- A. The draft text of an unsent comment.
- B. Whether a tooltip is currently visible.
- C. The current page number of a paginated list the user might bookmark.
- D. The current user's profile, fetched from `/api/me`.

**3.** What does `<Outlet />` do in a React Router v6 layout component?

- A. Renders a portal target for arbitrary DOM injection.
- B. Marks the location where the matched child route's element should appear.
- C. Reserves space for a lazy-loaded chunk.
- D. Defers rendering until the loader's promise resolves.

**4.** A route loader throws `redirect("/login")`. What does the router do?

- A. Renders the route's component with an error prop.
- B. Catches the redirect, navigates to `/login`, and never renders the original route.
- C. Logs a warning and renders nothing.
- D. Calls `window.location.href = "/login"`, forcing a full page reload.

**5.** What is the difference between `useQuery`'s `isPending` and `isFetching`?

- A. They are synonyms.
- B. `isPending` means "no cached data yet"; `isFetching` means "any fetch in flight, including background refetches."
- C. `isPending` is for mutations; `isFetching` is for queries.
- D. `isPending` is true only on the first render of the component; `isFetching` is true on every render.

**6.** Which TanStack Query default is the most surprising for new users?

- A. `gcTime: 5 minutes` — unobserved queries are garbage-collected.
- B. `retry: 3` — failed queries are retried three times.
- C. `refetchOnWindowFocus: true` — queries refetch when the tab regains focus.
- D. `staleTime: 0` — data is stale immediately.

**7.** A Zustand store hook is used like `const x = useStore((state) => state.x)`. Why is the selector function important?

- A. It is required by the Zustand API; calls without a selector throw.
- B. It causes the component to re-render only when the selected slice changes, not on every store update.
- C. It returns a Promise; the value is read with `await`.
- D. It runs only once, at mount; subsequent updates are ignored.

**8.** When should you reach for `React.lazy` plus `<Suspense>` for a route?

- A. Whenever a component is more than 100 lines.
- B. When you want the route's JavaScript chunk to download on first visit to that route rather than on initial app load.
- C. When the route uses any third-party library.
- D. To avoid writing a `loader` function.

**9.** The optimistic-update pattern with `useMutation` involves `onMutate`, `onError`, and `onSettled`. What is the role of `onSettled`?

- A. It runs only on success and is where you typically navigate after a save.
- B. It runs after the mutation completes (success or error) and is where you typically invalidate queries to reconcile with the server.
- C. It runs only on error and is where you display the error message.
- D. It runs before the mutation and is where you snapshot the cache.

**10.** Mark Erikson (Redux maintainer) wrote that **React Context is not a state-management tool**. What is his point?

- A. Context cannot store any state.
- B. Context is a delivery mechanism for values; the values still live in some other state primitive (`useState`, a reducer, a store), and Context only avoids prop-drilling.
- C. Context only works for theme values.
- D. Context is deprecated.

---

## Answer key

1. **D.** Lecture 1 frames three layers — server, URL, local UI. `sessionStorage` is one possible backing for some local UI state (or for transient cached server state), but it is not the layer name. The taxonomy is "where does the data conceptually live?", not "which browser API stores it?"

2. **C.** Pagination state is the classic URL example: the user expects to bookmark "the third page of products" and have a coworker land on the same view from a shared link. (A) is a draft — local UI state. (B) is transient UI — local. (D) is server state — TanStack Query cache. Reference: Lecture 1 §2 and §8.

3. **B.** `<Outlet />` is the placeholder element that React Router fills with the matched child route's element. The parent component renders once on entering the subtree; the outlet's contents swap on child-level navigation. Reference: <https://reactrouter.com/en/main/components/outlet>.

4. **B.** `redirect` returns a special `Response`; the router catches it, navigates to the destination, and never renders the original route. The user sees no flash of the protected UI. Reference: <https://reactrouter.com/en/main/fetch/redirect>.

5. **B.** `isPending` is "we have no data yet, this is the first attempt." `isFetching` is "a network request is currently in flight, which includes background refetches of already-cached data." A component navigating back to a previously-visited resource has `isPending: false` (cache hit, renders immediately) and `isFetching: true` (background revalidation). Reference: <https://tanstack.com/query/latest/docs/framework/react/reference/useQuery>.

6. **C.** `refetchOnWindowFocus: true` surprises new users because tabbing away and coming back triggers refetches they did not request. The behavior is desirable for chat-like apps; it is sometimes too aggressive for slow-changing data. Disable per-query or globally. Reference: <https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults>.

7. **B.** Zustand's selector pattern is its key performance feature. The store hook re-renders the component **only when the selected value changes**, not on every store update. Without a selector, the component re-renders on every store mutation. Reference: <https://github.com/pmndrs/zustand#selecting-multiple-state-slices>.

8. **B.** `React.lazy` produces a separate chunk (Vite splits at the dynamic `import()`); the chunk downloads when the lazy component first renders. The right time to lazy-load a route is when it is not on the critical first-paint path (admin pages, settings, rarely-visited routes). Reference: <https://react.dev/reference/react/lazy>.

9. **B.** `onSettled` runs after success or error. The canonical pattern is to invalidate the relevant queries here, so a final refetch from the server reconciles the cache. `onMutate` does the optimistic write; `onError` does the rollback; `onSettled` does the reconciliation. Reference: <https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates>.

10. **B.** Context is a delivery mechanism. The data still lives in a `useState`, a reducer, or an external store; Context only avoids passing it as a prop through intermediate components. Conflating "Context" with "state management" produces architectures that re-render the world on every change and miss the actual ergonomics of a real store. Reference: <https://blog.isquaredsoftware.com/2021/01/context-redux-differences/>.

---

## How to interpret your score

- **10/10** — Excellent. Move to the challenges and mini-project.
- **8–9/10** — Solid. Re-read the explanations for the questions you missed.
- **5–7/10** — Re-read the lecture corresponding to each wrong answer.
- **Under 5** — Re-read all three lectures from the start. The mini-project requires a working mental model; do not push forward without it.
