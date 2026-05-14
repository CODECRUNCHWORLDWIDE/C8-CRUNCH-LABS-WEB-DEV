# Week 8 — Resources

Every resource here is **free** and **publicly accessible**.

## Primary sources

- **React Router v6 — Official documentation** — the normative reference for the router. The "Main Concepts" page is the right place to start. <https://reactrouter.com/en/main>
- **React Router v6 — Tutorial** — a six-chapter walk-through that builds a small contacts app. Read end to end at least once. <https://reactrouter.com/en/main/start/tutorial>
- **React Router v6 — `createBrowserRouter`** — the modern data-API router. The route-object syntax used throughout this week. <https://reactrouter.com/en/main/routers/create-browser-router>
- **React Router v6 — `<Outlet />`** — the element that renders the matching child route. The mechanic that makes nested routes work. <https://reactrouter.com/en/main/components/outlet>
- **React Router v6 — Route loaders** — `loader: async ({ params }) => ...` and the `useLoaderData` hook. <https://reactrouter.com/en/main/route/loader>
- **React Router v6 — `redirect`** — return `redirect("/login")` from a loader to navigate before the component renders. <https://reactrouter.com/en/main/fetch/redirect>
- **React Router v6 — `<NavLink>`** — the link that knows its active state. <https://reactrouter.com/en/main/components/nav-link>
- **React Router v6 — Hooks reference** — `useParams`, `useNavigate`, `useLocation`, `useSearchParams`, `useLoaderData`, `useRouteError`. <https://reactrouter.com/en/main/hooks/use-params>
- **TanStack Query — Official documentation** — the normative reference for the server-state cache. <https://tanstack.com/query/latest>
- **TanStack Query — Overview** — the framework's pitch in 600 words. Read once before installing. <https://tanstack.com/query/latest/docs/framework/react/overview>
- **TanStack Query — Important Defaults** — the four numbers (`staleTime`, `gcTime`, retry, refetch on focus) that explain 90% of the framework's behavior. <https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults>
- **TanStack Query — Queries** — `useQuery`, query keys, the lifecycle states (`pending`, `error`, `success`). <https://tanstack.com/query/latest/docs/framework/react/guides/queries>
- **TanStack Query — Mutations** — `useMutation`, `onMutate`, `onSuccess`, `onError`, optimistic updates. <https://tanstack.com/query/latest/docs/framework/react/guides/mutations>
- **TanStack Query — Query Invalidation** — how the cache is told a query is stale and needs refetching. <https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation>
- **TanStack Query — Optimistic Updates** — the recipe for "update the UI before the server confirms." <https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates>
- **TanStack Query — DevTools** — `<ReactQueryDevtools />`; mount once and leave on in dev. <https://tanstack.com/query/latest/docs/framework/react/devtools>
- **Zustand — Official README** — the canonical introduction. Two-minute read. <https://github.com/pmndrs/zustand>
- **Zustand — Documentation** — recipes, patterns, middleware. <https://docs.pmnd.rs/zustand/getting-started/introduction>
- **Zustand — Practice with selectors** — the rules for `useStore(state => ...)`. <https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions>
- **Zustand — TypeScript guide** — typed stores; useful even if you write JavaScript, as the shapes are educational. <https://docs.pmnd.rs/zustand/guides/typescript>
- **Zustand — Persist middleware** — saving store state to localStorage. <https://docs.pmnd.rs/zustand/integrations/persisting-store-data>
- **React — Choosing the State Structure** — the framework-agnostic chapter that informs every state decision this week. <https://react.dev/learn/choosing-the-state-structure>
- **React — Sharing State Between Components (lifting state up)** — the step before "do I need a store?" <https://react.dev/learn/sharing-state-between-components>
- **React — Passing Data Deeply with Context** — the API and the disclaimer that Context is not a state-management library on its own. <https://react.dev/learn/passing-data-deeply-with-context>
- **React — Extracting State Logic into a Reducer** — `useReducer` introduced. <https://react.dev/learn/extracting-state-logic-into-a-reducer>
- **React — Scaling Up with Reducer and Context** — the official pattern when you need a shared reducer without an external library. <https://react.dev/learn/scaling-up-with-reducer-and-context>
- **React — `React.lazy`** — the lazy-loading primitive. <https://react.dev/reference/react/lazy>
- **React — `Suspense`** — the boundary that shows a fallback while a lazy component or query loads. <https://react.dev/reference/react/Suspense>

## MDN reference (the friendly index)

- **MDN — History API** — `history.pushState`, `history.replaceState`, the `popstate` event. The browser primitive every router wraps. <https://developer.mozilla.org/en-US/docs/Web/API/History_API>
- **MDN — `URL` and `URLSearchParams`** — the building blocks of URL-state work. <https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams>
- **MDN — `fetch`** — the network primitive. We still call `fetch` inside TanStack Query's `queryFn`. <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch>
- **MDN — `AbortController`** — cancel an in-flight `fetch`. TanStack Query passes an `AbortSignal` into `queryFn` automatically. <https://developer.mozilla.org/en-US/docs/Web/API/AbortController>
- **MDN — `Storage` (localStorage, sessionStorage)** — the persist-middleware target. <https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage>

## Practical writing

- **Tanner Linsley — "Server State: The Forgotten Half of React State"** — the talk that named the taxonomy. YouTube; search the title. The slides are the most-cited diagrams in the space.
- **Dominik (TkDodo) — "Practical React Query"** — Dominik maintains TanStack Query. The blog series is the best applied writing on server-state design. <https://tkdodo.eu/blog/practical-react-query>
- **Dominik — "React Query as a State Manager"** — the argument that the server cache is the canonical place for server data. <https://tkdodo.eu/blog/react-query-as-a-state-manager>
- **Dominik — "Effective React Query Keys"** — the cache-key conventions that scale. <https://tkdodo.eu/blog/effective-react-query-keys>
- **Mark Erikson — "Why React Context Is Not a State Management Tool"** — the maintainer of Redux on what Context actually does and does not do. Even-handed. <https://blog.isquaredsoftware.com/2021/01/context-redux-differences/>
- **Daishi Kato (Zustand maintainer) — "How Zustand was born"** — the design rationale for the smallest popular store. <https://blog.axlight.com/posts/how-zustand-was-born/>
- **Kent C. Dodds — "Application State Management with React"** — the now-classic argument that React state is enough for most apps. <https://kentcdodds.com/blog/application-state-management-with-react>
- **Kent C. Dodds — "Don't Sync State. Derive It!"** — the corollary that most "synchronized" state is just a derived value. <https://kentcdodds.com/blog/dont-sync-state-derive-it>

## Code splitting and lazy routes

- **web.dev — Reduce JavaScript payloads with code splitting** — the general case for dynamic `import()`. <https://web.dev/articles/reduce-javascript-payloads-with-code-splitting>
- **Vite — Build for production** — code splitting and `manualChunks` configuration. <https://vitejs.dev/guide/build.html>
- **MDN — Dynamic imports** — `import(specifier)` returns a Promise; the spec the bundlers stitch into. <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import>
- **React Router v6 — Lazy loading routes** — the official pattern for code-splitting a route. <https://reactrouter.com/en/main/route/lazy>

## Redux (for context — not the recommended path this week)

- **Redux Toolkit — Official documentation** — the modern Redux API. If you join a team using Redux today, this is what they use. <https://redux-toolkit.js.org/>
- **Redux Toolkit — `createSlice`** — the slice pattern that replaces hand-written action types and reducers. <https://redux-toolkit.js.org/api/createSlice>
- **Redux Toolkit — RTK Query** — Redux's answer to TanStack Query, bundled with the toolkit. Same problem, different API. <https://redux-toolkit.js.org/rtk-query/overview>
- **Redux — "Why Redux Toolkit Is How To Use Redux Today"** — the maintainers' own pitch. <https://redux.js.org/introduction/why-rtk-is-redux-today>

## Vue 3 + Vue Router (the sidebar)

- **Vue Router 4 — Introduction** — the Vue equivalent of React Router. Same concepts: routes, params, nested routes, programmatic navigation. <https://router.vuejs.org/introduction.html>
- **Vue Router — `<RouterView />`** — the Vue equivalent of `<Outlet />`. <https://router.vuejs.org/guide/essentials/getting-started.html>
- **Vue Router — Nested Routes** — the same pattern as React Router's children prop. <https://router.vuejs.org/guide/essentials/nested-routes.html>
- **Vue Router — Navigation Guards** — the auth-redirect pattern (`beforeEach`). <https://router.vuejs.org/guide/advanced/navigation-guards.html>
- **Pinia — Official documentation** — the Vue equivalent of Zustand and the official Vue state-management library since 2022. <https://pinia.vuejs.org/>
- **Pinia — Defining a Store** — the `defineStore` API; tiny, similar in spirit to Zustand's `create`. <https://pinia.vuejs.org/core-concepts/>
- **TanStack Query — Vue** — yes, TanStack Query has a Vue binding too. Same cache, same semantics. <https://tanstack.com/query/latest/docs/framework/vue/overview>

## Specs cited this week

- **HTML Living Standard — Session history and navigation** — the spec for `history.pushState`, `popstate`, and the navigation algorithm the router stands on. <https://html.spec.whatwg.org/multipage/nav-history-apis.html>
- **URL Living Standard** — the URL parsing algorithm the router uses. <https://url.spec.whatwg.org/>
- **WHATWG Fetch Standard** — the network primitive. <https://fetch.spec.whatwg.org/>
- **WAI-ARIA — `aria-current`** — the attribute `<NavLink>` sets on the active link. <https://www.w3.org/TR/wai-aria-1.2/#aria-current>

## Documentation for the dependencies you will install this week

- **`react-router-dom`** v6 — the package name; install with `npm install react-router-dom`. <https://www.npmjs.com/package/react-router-dom>
- **`@tanstack/react-query`** v5 — the React binding for TanStack Query. <https://www.npmjs.com/package/@tanstack/react-query>
- **`@tanstack/react-query-devtools`** — the cache inspector. <https://www.npmjs.com/package/@tanstack/react-query-devtools>
- **`zustand`** v4 — the store library. <https://www.npmjs.com/package/zustand>

## Optional: testing the router and the cache

- **React Testing Library — Router testing** — how to test components that use router hooks. Patterns for wrapping with `MemoryRouter`. <https://testing-library.com/docs/example-react-router/>
- **TanStack Query — Testing** — how to wrap a `QueryClient` in tests, how to stub `queryFn`. <https://tanstack.com/query/latest/docs/framework/react/guides/testing>

---

If you read **only three things** this week, read:

1. **TanStack Query — Overview** — the four-paragraph framing of why server state needs its own tool. <https://tanstack.com/query/latest/docs/framework/react/overview>
2. **React Router v6 — Main Concepts → Tutorial chapter 1** — gets the nested-routes mental model in place. <https://reactrouter.com/en/main/start/tutorial>
3. **Zustand README** — the entire library fits in one scroll. <https://github.com/pmndrs/zustand>

Everything else here is reference. Return to it when the cache does something surprising.
