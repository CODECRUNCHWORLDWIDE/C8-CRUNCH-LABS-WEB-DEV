# Week 8 — State Management and Routing

> *Seven weeks in, you can scaffold a Vite project, write Astro pages, and embed a React island that hydrates only when it scrolls into view. The static-site mental model is doing its job. This week the shape changes. We move from "a fast site with a few interactive islands" to "a single-page application with multiple routes, server-derived data, and state shared across components." You will learn the three layers of state (server state, URL state, and local UI state); you will pick the right tool for each layer; you will install **React Router v6** to handle the URL; you will install **TanStack Query** to handle the server; and you will install **Zustand** to handle global UI state that does not belong in the URL. By Sunday, you will have built a small SPA with nested routes, route loaders, lazy-loaded code chunks, and a global store, and you will be able to defend each architectural choice with a doc citation.*

Welcome back. Through Week 7 your portfolio shipped as a four-page Astro site with a single React island. Every navigation was a full page request; every page's HTML was static; the JavaScript on each page was small enough to fit in a tweet. That model is the right model for content. **It stops being the right model the moment the user spends most of their time inside a single workflow.** A dashboard that loads server data, lets the user filter and sort and drill in, and only navigates between distinct workflows once or twice a session — that is a single-page application, and the static-site mental model does not describe it.

The single-page application replaces the browser's navigation with its own. Instead of the browser fetching a new HTML document on each link click, JavaScript intercepts the click, updates the URL via `history.pushState`, fetches the data the new view needs, and renders the new view into the existing DOM. The browser thinks it never left the page. The user sees a navigation. **The router** is the JavaScript that mediates this dance — it watches the URL, matches it to a component tree, and renders the right tree.

The router brings two new problems with it. **First**, what was once "a page-worth of state in the URL" — `?search=foo&page=3&sort=date` — now has to live in the JavaScript memory of the running app, *or* in the URL where it can be bookmarked and shared, *and* the two have to stay in sync. **Second**, the server data the page used to fetch in its `<script>` tag now has to be fetched by some JavaScript on every "navigation," and the natural place to put that fetch — inside a React component's `useEffect` — produces a class of bugs (race conditions, stale data, retry storms, missing loading states) that the framework cannot fix on its own. The fix, in 2026, is **TanStack Query** for the server data and **a small URL- and component-state strategy** for everything else.

We will also confront the question every React team confronts at some point: **where does shared state live when it is not local, not URL-shaped, and not server-derived?** The local component answer is `useState`. The shared-with-children answer is **lifting state up** (the React docs name). The shared-with-cousins answer is **Context**. The shared-with-the-whole-app answer is **a store** — and the lightweight store in 2026 is **Zustand**. We will mention Redux Toolkit (the established library, still ubiquitous in industry) but we will not use it; the mental overhead is wrong for the shape of app we are building.

By Sunday, the deliverable is a multi-route SPA — a small "Crunch Library" app with a home page, a books index, a book detail page, and a small admin form — that uses React Router for the URL, TanStack Query for the server data, and Zustand for one piece of global UI state (the current theme). You will have read the three docs sites end to end at least once, and you will be able to defend "TanStack Query for server, Zustand for global UI, URL for shareable state, `useState` for everything else" as a coherent architecture.

---

## Learning objectives

By the end of this week, you will be able to:

- **Distinguish** the three layers of application state — **server state** (data that lives on a server, is fetched, can be stale, must be invalidated), **URL state** (data that should be bookmarkable and shareable — search filters, page numbers, the current route), and **local UI state** (transient state internal to one component — input drafts, hover, expand/collapse) — and pick the right tool for each. The taxonomy is borrowed from Tanner Linsley's TanStack Query talks and is the most useful mental model in modern React.
- **Trace** the progression of React state-management tools from local to global: `useState` (one component) → lifted `useState` (parent owns, passes down) → `useReducer` (one component with complex transitions) → React Context (a value passed deep through the tree) → an external store (state truly global, shared across unrelated subtrees). Each step is appropriate for a specific shape of problem; no step is "better" than another.
- **Configure** React Router v6 — `createBrowserRouter`, `RouterProvider`, `Route`, the children prop for nested routes, the `<Outlet />` element, the `useParams`, `useNavigate`, and `useLocation` hooks. Read the React Router v6 documentation at <https://reactrouter.com/en/main>.
- **Implement** nested routes — a parent layout route (e.g. `/books`) that wraps multiple child routes (`/books`, `/books/:id`, `/books/new`) using `<Outlet />`. Understand why the layout component renders once when navigating between siblings rather than re-rendering from the root.
- **Use** route loaders — the `loader` function attached to a route that fetches data before the component renders, exposed via the `useLoaderData` hook. Recognize when a loader is the right tool versus when a `useQuery` inside the component is better.
- **Guard** routes with the "protected route" pattern — a wrapper that checks an auth condition and either renders the child or redirects to `/login`. Implement both with a wrapper component and with React Router's `loader` returning a `redirect()`.
- **Code-split** routes with `React.lazy` and `Suspense`, producing route chunks that load on first navigation rather than on initial bundle load. Verify in DevTools' Network panel that the chunk for `/admin` does not download until the user visits `/admin`.
- **Install and use TanStack Query** (`@tanstack/react-query`) — `QueryClient`, `QueryClientProvider`, `useQuery`, `useMutation`, the cache, query keys, the `staleTime` and `gcTime` options, the `enabled` option for dependent queries. Read the TanStack Query documentation at <https://tanstack.com/query/latest>.
- **Explain** the staleness model of TanStack Query — fresh, stale, inactive, garbage-collected — and how it differs from "refetch on mount" frameworks. Trace what happens on window focus, on network reconnection, and on a manual `queryClient.invalidateQueries()` call.
- **Install and use Zustand** — `create`, the store hook, selectors, the `useShallow` helper, and the rule that the store hook returns whatever the selector returns. Read the Zustand README at <https://github.com/pmndrs/zustand>.
- **Author** a Zustand store with typed actions (TypeScript optional) and selector-based subscriptions. Recognize when Zustand is right (truly global UI state) and when it is wrong (server data that wants caching; URL state that wants the URL).
- **Compose** a small but realistic app — a multi-route React SPA with route-level data loading via TanStack Query, global theme state via Zustand, and code-split admin routes — and defend each architectural choice by docs URL.
- **Audit** which state goes where in a small spec, with the rule of thumb: *if the user expects to bookmark or share it, it lives in the URL; if it came from a server, it lives in TanStack Query; if it is global UI sugar, it lives in Zustand; otherwise it is `useState` in the component that needs it.*

---

## Prerequisites

You finished **Week 7 — Build Tools and Components**. Concretely:

- A working Astro + React + Vite portfolio site that ships under 50 KB compressed of JavaScript on its busiest page.
- You can write a React function component, use `useState` and `useEffect`, pass props, and read the rules of hooks without consulting the documentation each time.
- You have **Node.js 20+** and **npm 10+** installed (`node --version`, `npm --version`).
- You have read or are comfortable returning to the React docs at <https://react.dev/learn>.

If any of those is shaky, return to Week 7's lecture 3 and exercise 3 before starting this week. The state-management progression in lecture 1 of this week assumes the React mental model is in place.

---

## Topics covered

- The taxonomy of state — server state vs. URL state vs. local UI state. The architectural question "where does this piece of data live?" and the heuristics for answering it.
- The React state ladder — `useState`, `useReducer`, lifting state, prop drilling, React Context, and where each tool fits. Why each step exists and the trade-off it solves.
- React Router v6 — `createBrowserRouter`, `RouterProvider`, route objects, the children prop for nested routes, `<Outlet />`, the path matching algorithm, `index` routes, `useParams`, `useNavigate`, `useLocation`, `useSearchParams`, `<Link>` and `<NavLink>` (the active-state-aware version), the `to` prop, `redirect()` returned from a loader.
- Route loaders — the `loader: async ({ params, request }) => ...` function on a route definition; data fetching that happens *before* the component renders; `useLoaderData` to read the loaded value; error boundaries via `errorElement`; the relationship between route loaders and TanStack Query.
- Protected routes — wrapping a route in a component that checks auth and either renders or redirects; the loader-based variant that returns `redirect("/login")`; how to preserve the intended destination so the user lands where they tried to go after signing in.
- Code splitting — `const Admin = React.lazy(() => import("./Admin.jsx"))`, `<Suspense fallback={...}>`, the Vite chunk that gets created for each `React.lazy` import, verifying in the Network tab that the chunk does not download until needed.
- TanStack Query — the cache model (fresh vs. stale vs. inactive), `useQuery` (`queryKey`, `queryFn`, `staleTime`, `gcTime`, `enabled`), `useMutation` (`mutationFn`, `onSuccess` invalidating queries), `queryClient.invalidateQueries`, `queryClient.setQueryData` (for optimistic updates), the devtools (`<ReactQueryDevtools />`).
- Why server state is different — the asynchronous loading lifecycle, the cache-then-refetch flow, race conditions, deduplication of in-flight requests, retry/backoff defaults, the `enabled` flag for dependent queries.
- Zustand — `create((set, get) => ...)`, store hooks, selectors, the `useShallow` helper to subscribe to multiple slices, the middleware pattern (`persist`, `devtools`), how Zustand differs from Redux and Context.
- Briefly: Redux Toolkit — the modern Redux API (`configureStore`, `createSlice`, `createAsyncThunk`, RTK Query), why it is still ubiquitous in industry, the cases where its ceremony is worth the cost. We do not use it this week, but it is on the table when you join a team that does.
- Vue 3 + Vue Router (sidebar) — the equivalent vocabulary in the other major framework: `<RouterView>` (≈ `<Outlet />`), `useRoute`, `useRouter`, Pinia as the Zustand-equivalent store. Brief, comparative, not the main thread.

---

## Tools you will need

| Tool                                  | Role                                                          | Cost |
| ------------------------------------- | ------------------------------------------------------------- | ---- |
| **Node.js 20+**                       | The JavaScript runtime that runs Vite                         | Free |
| **npm 10+**                           | The package manager that ships with Node                      | Free |
| **VS Code**                           | Editor                                                        | Free |
| **`react-router-dom` v6**             | The router; the de-facto standard for React SPAs              | Free |
| **`@tanstack/react-query` v5**        | The server-state cache                                        | Free |
| **`@tanstack/react-query-devtools`**  | The cache inspector; mount it once and leave it in dev        | Free |
| **`zustand` v4**                      | The lightweight global store                                  | Free |
| **DevTools — Network panel**          | Confirm lazy chunks load when expected                        | Free |
| **DevTools — React extension**        | Inspect props, hooks state, and the component tree            | Free |
| **The React Router v6 documentation** | The normative reference for the router                        | Free |
| **The TanStack Query documentation**  | The normative reference for server state                      | Free |
| **The Zustand README**                | The normative reference for the store                         | Free |

No paid services. No paid tutorial platforms. The three doc sites — `reactrouter.com`, `tanstack.com/query`, and the Zustand GitHub README — are the canonical references for this week and the lectures cite them by page.

---

## Weekly schedule

The schedule below adds up to approximately **36 hours**. Treat it as a target. The state-vocabulary lecture is the longest read; budget time for it Monday.

| Day       | Focus                                                  | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|--------------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | Three layers of state, React state ladder              |    3h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Tuesday   | React Router v6 — nested routes, loaders, lazy         |    2h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     6h      |
| Wednesday | TanStack Query — useQuery, useMutation, cache          |    2h    |    2h     |     1h     |    0.5h   |   1h     |     1h       |    0h      |     7.5h    |
| Thursday  | Zustand, picking the right tool, mini-project start    |    1h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     7h      |
| Friday    | Mini-project — build the routes and the query client   |    0h    |    0h     |     0h     |    0.5h   |   1h     |     3h       |    0.5h    |     5h      |
| Saturday  | Mini-project — admin form, mutation, optimistic update |    0h    |    0h     |     0h     |    0h     |   1h     |     2h       |    0h      |     3h      |
| Sunday    | Quiz, polish, lazy-load audit, deploy                  |    0h    |    0h     |     0h     |    0.5h   |   0h     |     1h       |    0h      |     1.5h    |
| **Total** |                                                        | **8h**   | **7h**    | **2h**     | **3h**    | **6h**   | **9h**       | **2h**     | **37h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | React Router, TanStack Query, Zustand, Redux Toolkit (reference), Vue Router (sidebar) |
| [lecture-notes/01-three-layers-of-state.md](./lecture-notes/01-three-layers-of-state.md) | The state taxonomy; `useState` → `useReducer` → Context → store; which problem each solves |
| [lecture-notes/02-routing-with-react-router-v6.md](./lecture-notes/02-routing-with-react-router-v6.md) | `createBrowserRouter`, nested routes, `<Outlet />`, loaders, protected routes, lazy routes |
| [lecture-notes/03-server-state-with-tanstack-query.md](./lecture-notes/03-server-state-with-tanstack-query.md) | The cache model, `useQuery`, `useMutation`, invalidation, why this is not `useEffect` + `fetch` |
| [exercises/exercise-01-state-ladder.md](./exercises/exercise-01-state-ladder.md) | Walk the state ladder from `useState` to Zustand with one feature; explain each step |
| [exercises/exercise-02-routes-and-loaders.md](./exercises/exercise-02-routes-and-loaders.md) | Build a 4-route React Router config with nested routes and one loader |
| [exercises/exercise-03-tanstack-query-list-detail.jsx](./exercises/exercise-03-tanstack-query-list-detail.jsx) | Starter JSX: a list page and a detail page with TanStack Query. Fill in `TODO`s. |
| [exercises/SOLUTIONS.md](./exercises/SOLUTIONS.md) | Reference solutions with annotated explanations |
| [challenges/challenge-01-protected-routes.md](./challenges/challenge-01-protected-routes.md) | Build a protected-route pattern two ways: wrapper component and loader redirect |
| [challenges/challenge-02-optimistic-mutation.md](./challenges/challenge-02-optimistic-mutation.md) | Implement an optimistic update with `useMutation`'s `onMutate` and `onError` rollback |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | A multi-route SPA — Crunch Library — with routes, queries, and a Zustand store |
| [mini-project/starter/App.jsx](./mini-project/starter/App.jsx) | Starter App component with the router and providers wired |
| [mini-project/starter/store.js](./mini-project/starter/store.js) | Starter Zustand store skeleton |

The recommended order:

1. Read all three lectures (Monday–Wednesday).
2. Do the three exercises (Monday–Wednesday).
3. Take the quiz (Wednesday evening). If you score under 7, re-read.
4. Pick a challenge (Thursday).
5. Work through the homework problems alongside the mini-project (Thursday–Saturday).
6. Ship the mini-project (Friday–Sunday).

---

## Stretch goals

If you finish early and want to push further, try any of these:

- Read the **React Router v6 "Tutorial"** end to end at <https://reactrouter.com/en/main/start/tutorial>. It is six chapters; it touches everything we touch this week and a few things we do not (form actions, defer, mutations from `<Form>`).
- Read the **TanStack Query "Important Defaults"** at <https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults>. Internalize the four numbers (`staleTime: 0`, `gcTime: 5min`, retry 3, refetch on focus). They are the most surprising and the most consequential.
- Read the **Zustand "Recipes"** page at <https://docs.pmnd.rs/zustand/recipes/recipes>. The "slices pattern" and the "persist middleware" recipes are the two most useful patterns for real apps.
- Read **Tanner Linsley — "Practical React Query"** at <https://tkdodo.eu/blog/practical-react-query>. Dominik (the TanStack Query maintainer) wrote this series; it is the best applied writing on server state in React.
- Read **Mark Erikson — "Why React Context Is Not a State Management Tool"** at <https://blog.isquaredsoftware.com/2021/01/context-redux-differences/>. Mark maintains Redux. The article is fair, technically precise, and corrects a common misunderstanding.
- Watch **Tanner Linsley — "Server State: The Forgotten Half of React State"** on YouTube. The talk that named the taxonomy.
- Read **the Vue Router 4 introduction** at <https://router.vuejs.org/introduction.html> for the comparative version. Same concepts, different vocabulary.

---

## What this week is NOT

A few things to set expectations:

- **Not a Redux week.** Redux Toolkit is mentioned in lecture 1 and resources for context; it is not the tool we install. The lightweight Zustand path is the one we build on. If you join a team using Redux Toolkit, the mental model from this week transfers directly — RTK is just Redux with ergonomic defaults.
- **Not a server-side rendering week.** No Next.js, no Remix-as-framework. We are building a client-rendered SPA on top of Vite. The SSR conversations are in C8 W12 (Next.js) and C8 W13 (server-rendered Astro).
- **Not a TypeScript week.** JavaScript with JSDoc where helpful. TypeScript joins in C8 W10. The TanStack Query and Zustand examples use TypeScript-friendly patterns but compile cleanly as `.jsx`.
- **Not a forms week.** Forms came in Week 6 and the patterns transfer. We use forms here, but the validation conversation is settled.
- **Not a styling week.** No new CSS framework. Custom-properties from Week 2 are still the recommended approach.
- **Not a CSR-vs-SSR debate week.** We are doing CSR on purpose because it is the simplest expression of the routing/state/server-state ideas this week is about. The trade-off lecture lives in C8 W12.

---

## A word on the editorial voice

The router-and-state stack of 2026 is the result of about ten years of trial and error in the React community. Many older tutorials show patterns — `react-router` v3/v4/v5 with class components, `redux-thunk` with hand-written action types, `useEffect`-plus-`fetch` for server data — that are no longer recommended by their own maintainers. We will name the older patterns where they are likely to come up in interviews or in legacy codebases, but the recommended stack this week is the **2026 default**: React Router v6, TanStack Query v5, Zustand v4. The lecture material cites the doc URLs you should return to when memory fades.

You will also notice the lectures emphasize the **architectural question** before the **API question**. "Where does this state live?" comes before "what hook do I call?" The wrong tool for state is the most common cause of React app rot; the right tool with imperfect API knowledge is a recoverable mistake.

---

## Up next

Continue to [Week 9 — Performance and Web Vitals](../week-09-performance-and-web-vitals/) once you have shipped the multi-route Crunch Library SPA, your `/admin` chunk is lazy-loaded (verify in Network tab), your TanStack Query cache survives a route navigation, your Zustand theme persists across refresh, your protected route correctly redirects to `/login` and back, and your homework answers are written in the words you would use to defend them in a code review.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
