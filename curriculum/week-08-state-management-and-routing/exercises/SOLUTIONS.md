# Exercises — Reference Solutions

> Reference solutions and discussion for the three exercises. Look here **after** you have attempted each TODO yourself. The act of struggling with a missing piece is the work; reading the answer first short-circuits that. Use this file to check your reasoning, not to skip the practice.

---

## Exercise 1 — Walk the State Ladder

The five steps each correctly toggle the theme. The interesting answers are in the reflection.

### Step 1 — Why does Step 1 fail with two instances?

Each `ThemeToggle1` owns its own `theme` state. Click toggle A: state in A flips; state in B is unchanged. Both write to `document.documentElement.dataset.theme`, so the visual changes — but they overwrite each other. The two components disagree about what the theme "should" be, and the document just reflects whichever was clicked last.

The general lesson: **local component state is local.** Two instances of the same component have independent state. If a piece of data is conceptually "the theme of the page," it should not live in one specific button's state, because the page does not have a notion of "the theme of button-A versus button-B."

### Step 2 — What did Step 2 buy you?

The state is now lifted to a parent that renders both buttons. Both buttons read the same value via props; both call the same setter via a callback. The two stay in sync because they are reading the same source.

The mechanical change is the React docs' "lifting state up" pattern (<https://react.dev/learn/sharing-state-between-components>). The cost is that *the parent component must exist and own the state*. If the toggle were four levels deep, every intermediate would have to declare `theme` and `onToggle` as props and forward them. That is prop drilling. It is fine at one or two levels and noisy at four or more.

### Step 3 — Why useReducer?

`useReducer` gives you:

- **Named transitions.** `dispatch({ type: "setSystem" })` is more readable than `setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")` inline at the call site.
- **Atomic updates.** If the transition were more complex (clear errors, reset a timer, update the theme), all three updates happen in one render with a single dispatch. Three separate `useState`s would each schedule a separate update.
- **Testable logic.** The `reducer` function is pure. You can unit-test it without React. The test:

```js
import { reducer } from "./ThemeToggle3.jsx";
test("setDark sets theme to dark", () => {
  expect(reducer({ theme: "light" }, { type: "setDark" })).toEqual({ theme: "dark" });
});
```

The rule of thumb: three or more `useState`s in one component that update together → convert to `useReducer`.

### Step 4 — What does Context buy you?

Context eliminates prop drilling. The `DeepNestedToggle` reads `theme` and `setTheme` from `useTheme()`, regardless of how deep it is in the tree. The three `Intermediate*` components do not declare any theme-related props.

The cost: **every consumer re-renders when the provider's value changes.** If you put a frequently-changing value into Context — say, a counter that increments every second — every component calling `useContext` on it re-renders every second, whether they actually depend on the changing piece. Putting a stable `setTheme` function and a rarely-changing `theme` in the same context value object is usually fine; putting many values in one context is where you get into trouble.

Mark Erikson's article at <https://blog.isquaredsoftware.com/2021/01/context-redux-differences/> is the canonical reference. The summary: Context is a delivery mechanism, not a state-management library.

### Step 5 — When is Zustand worth it?

Zustand is worth it when:

- The state is **truly global** — read or written from unrelated subtrees, possibly from non-React code.
- The state changes frequently and you want **selector-based subscriptions** so unrelated components do not re-render on every change.
- You want to avoid wrapping the app in many providers.

It is overkill when:

- A single component owns the state and one or two children read it.
- The state lives naturally in a parent and prop-passing is one level deep.
- The state should be in the URL (because it should be bookmarkable) or in TanStack Query (because it is server data).

The Zustand README at <https://github.com/pmndrs/zustand> is the one-screen pitch. The library is roughly three kilobytes minified.

---

## Exercise 2 — Routes and Loaders

The router skeleton works as written. The interesting answers are the reflection prompts.

### 1. Why is UsersLayout a separate route?

When `UsersLayout` is a parent route, it is **rendered once** when the user enters the `users` subtree and stays mounted while the URL changes between `/users` and `/users/:id`. Its state (any `useState` inside it — say, a "filter panel open" toggle) survives the navigation between sibling children. The outlet swaps; the layout does not.

If you moved `UsersLayout` inside each leaf (rendering `<UsersLayout><UsersIndex /></UsersLayout>` and `<UsersLayout><UserDetail /></UsersLayout>`), each leaf would mount its own copy. Navigation between the list and the detail would unmount and remount the layout — its state would be lost, the sidebar would flash, any animation would restart. The parent-route pattern is the right one for layouts.

### 2. What happens without `signal: request.signal`?

Without the signal, the `fetch` is not cancellable from the router's side. If the user navigates to `/users` and then quickly to `/admin` before the users fetch completes:

- **With the signal:** the router aborts the in-flight fetch when the route changes. The network request shows as "cancelled" in DevTools. The server stops processing (if it respects abort), and no `setState` happens on the unmounted component.
- **Without the signal:** the fetch runs to completion. The response is received, parsed, and discarded by the router (because the route has changed). Bandwidth is wasted, the server did unnecessary work, and in some cases (where the response is large and slow) the user-visible CPU spikes when the parsing happens.

Always pass the signal. The router gives it to you for free.

### 3. `errorElement` versus `path: "*"`

- **`errorElement`** is attached to a route. It renders when **that route's loader throws**, or when **that route's component throws during render**, or when **a descendant throws and is not caught lower**. It is reached by throwing — usually a thrown `Response` from a loader.
- **`path: "*"`** is a normal route with a catch-all path. It renders when the URL does not match any other route. It is reached by visiting a non-existent URL.

Both can render the same component. The semantics are different:

| Situation                                  | Reaches                                |
|--------------------------------------------|----------------------------------------|
| `/users/9999` and loader throws 404        | `errorElement` of the user route       |
| `/nonsense` (no matching route)            | `path: "*"`                            |
| A component crashes during render          | nearest `errorElement` up the tree     |
| A loader throws a network error            | nearest `errorElement` up the tree     |

A defensive app has an `errorElement` at the root **and** a `path: "*"`. The first catches thrown errors; the second catches unmatched paths.

---

## Exercise 3 — TanStack Query: List and Detail

### TODO 1.1 — PostsList useQuery

```jsx
const { data, error, isPending, isFetching } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});
```

`fetchPosts` has the right signature (`({ signal }) => Promise<Post[]>`), so we can pass it directly. The `queryKey` is `["posts"]`; any component asking for the same key reads the same cache entry.

### TODO 2.1 — PostDetail useQuery with dependent enabled

```jsx
const { data, error, isPending, isFetching } = useQuery({
  queryKey: ["post", id],
  queryFn: ({ signal }) => fetchPost({ signal }, id),
  enabled: id != null,
});
```

Three pieces:

- The key is `["post", id]` — the cache is per-id. Visiting post 3 then post 5 then post 3 again reads from cache on the second visit to 3.
- `queryFn` is an inline arrow because `fetchPost` takes `(signalObj, id)` and `useQuery` only passes `signalObj`. The arrow adapts the shape.
- `enabled: id != null` keeps the query in a perpetual `isPending` state when no id is selected. Without it, `queryFn` would fire with `id` as `null`, the URL would be `/posts/null`, the server would respond with an error, and the component would show that error before the user has even selected anything.

### TODO 3.1 — NewPostForm useMutation

```jsx
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    setTitle("");
    setBody("");
  },
});
```

On success the list is invalidated (refetches in the background), and the form fields are cleared. `mutation.isPending` and `mutation.error` are read directly from the returned object in the JSX.

### Reflection answers

**1. Why is `selectedId` local and not in the URL?**

In this exercise, the parent is a one-screen tool and the user is unlikely to bookmark "I had post 3 open." `useState` is the simplest tool. If the app added permalinks — `/posts/3` as a real, shareable URL — then the selection should move to the URL via React Router's `:postId` param and `useParams`. The audit criterion from Lecture 1: would a customer-support reply say "click this link to land on the screen you are seeing"? If yes, URL. If no, local.

**2. Why does the detail query need `enabled: id != null`?**

Without `enabled`, the query fires unconditionally. With `id` as `null`, the URL becomes `/posts/null`, the server returns an error, the component renders the error. The user sees the error message before they have done anything wrong.

`enabled: false` keeps the query dormant with no fetch. As soon as `enabled` becomes true (the user clicks a post), the query fires once and caches the result.

**3. Why does the detail appear instantly on a second click?**

TanStack Query caches by key. First click on post 3: cache miss, fetch fires, ~300ms later the detail renders. Second click on post 3 (within `gcTime`, which is 5 minutes by default): cache hit, detail renders synchronously on the next render. A background refetch may run (if `staleTime` has elapsed), but the user sees the cached value first.

This is **stale-while-revalidate**, the central UX win of TanStack Query. The Devtools panel shows the query as "fresh" or "stale" or "inactive" depending on its lifecycle state.

**4. Why `invalidateQueries` rather than `setQueryData`?**

`setQueryData(["posts"], (old) => [newPost, ...old])` would write the new post into the cache directly. It is faster than refetching — no network round-trip — but it requires you to know exactly what the new post will look like in the list, including any derived fields the server might add (timestamps, computed columns, server-generated IDs).

`invalidateQueries` marks the list stale and lets the server be the source of truth. The next refetch returns the canonical version. The trade-off: a network round-trip for correctness.

In practice, you do both, in the right order. **Optimistic update** (write the speculative version to the cache) so the UI updates instantly; **invalidate** in `onSettled` to reconcile with the server when the mutation completes. That is the pattern in Challenge 2.

**5. The "new" post is missing from the refetch — why?**

JSONPlaceholder does not persist POSTs. The `createPost` request returns a fake response (with `id: 101`), but the server's actual `/posts` endpoint still returns the original 100 posts. The refetch hits `/posts?_limit=10`, the server returns the first ten of the original 100, and the new post is nowhere.

A real backend would persist the POST, and the refetch would return the list with the new post included (probably at the top, if the API sorts by recency). The wiring you built works; the demo backend is the limitation.

**6. The four important defaults**

Read at <https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults>. Short version:

- **`staleTime: 0`** — data is stale immediately. Every refocus/remount/reconnect triggers a refetch. Bump up to 30 s to 5 min for data that does not change moment-to-moment.
- **`gcTime: 5 * 60 * 1000`** — unobserved cache entries live for 5 minutes, then are garbage-collected. Long-lived apps may want to lower this to free memory; short-lived workflows may want higher to preserve back-navigation cache hits.
- **`retry: 3`** — failed queries retry three times with exponential backoff. Hides network blips; delays "this is genuinely broken" by several seconds. Reduce to 1 (or 0) for endpoints under your control where you want fast failure.
- **`refetchOnWindowFocus: true`** — every focus event triggers a refetch of stale queries. The most surprising default; the most consequential. Disable per-query for data that is not user-facing-time-sensitive (currency lists, country codes).

---

## How to use these solutions

- Attempt the TODOs without looking here.
- After 20 minutes of stuck, glance at the solution for the specific TODO you are stuck on. Read enough to unblock. Close the file.
- After completing the exercise, read this file in full to check your reasoning.

The exercises are graded by you, against your future self. The solutions are reference points, not answer keys to be copied.
