# Lecture 3 — Server State with TanStack Query

> Reading time: ~50 minutes. Cite the **TanStack Query documentation** at <https://tanstack.com/query/latest> by section. The lecture covers the cache model, `useQuery`, `useMutation`, query invalidation, optimistic updates, and the reasons "useEffect plus fetch" is not the right tool for server data. We assume Lectures 1 and 2 are read.

---

## 1. The case for a separate tool

In Week 7 we wrote React components that used `useEffect` plus `fetch` to load data:

```jsx
function BookDetail({ id }) {
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/books/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setBook(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} />;
  return <article>{book.title}</article>;
}
```

This works. It has approximately twelve lines of plumbing for one fetch. It has the following bugs and missing features, all of which we discover the hard way over time:

- **No caching.** If the user navigates away and comes back, the fetch runs again from scratch. The previous data was thrown away.
- **No deduplication.** If two components mount at the same time both fetching `/api/books/42`, the network sees two requests. The browser may dedupe at the HTTP layer (if caching headers cooperate), but the React side does not know.
- **No invalidation.** If a sibling component mutates the book, this component does not know to refetch.
- **Stale closure on `id`.** If `id` changes mid-fetch, the cleanup function runs, but the in-flight `fetch` is not actually cancelled — the network request continues until completion, then `setBook` is skipped because `cancelled` is true. The request still consumed bandwidth and server resources.
- **No retry.** If the network blips, the user sees an error. There is no automatic retry.
- **No "refetch on window focus."** If the user tabs away for an hour and comes back, the data is an hour stale. The component does not know.
- **Loading state lives in the component.** Every component that fetches needs its own `loading`, `error`, `data` triple. The boilerplate multiplies linearly with the number of components.

Each of these is fixable. Fixing all of them is a small library. The library exists. It is **TanStack Query** (formerly React Query). The maintainer is Dominik Dorfmeister (TkDodo); the project lead is Tanner Linsley. The library is free, open source, and the de-facto standard for server state in React. The doc URL is <https://tanstack.com/query/latest>.

The mental shift is: **server data is not stored in your component's state. It is stored in a cache. Components read from the cache; the cache fetches when it needs to.** Once you have the mental model, the API is small.

---

## 2. Installing and providing the client

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

At the root of your app:

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds; see §5
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

What this gives you:

- **`new QueryClient()`** creates the cache. One client per app; instantiated once at module scope (not inside a component, or the cache resets on every render).
- **`<QueryClientProvider client={queryClient}>`** makes the client available to descendants via React context. Every `useQuery` and `useMutation` call reads the client from this provider.
- **`<ReactQueryDevtools />`** mounts a floating button in the corner that, when clicked, opens the cache inspector. Keep this in dev; it shows every active query, its key, its data, its staleness, its observers. The doc URL is <https://tanstack.com/query/latest/docs/framework/react/devtools>.

---

## 3. `useQuery`: the read path

The core hook. The doc page is at <https://tanstack.com/query/latest/docs/framework/react/guides/queries>.

```jsx
import { useQuery } from "@tanstack/react-query";

function BookDetail({ id }) {
  const { data, error, isPending, isFetching } = useQuery({
    queryKey: ["book", id],
    queryFn: ({ signal }) =>
      fetch(`/api/books/${id}`, { signal }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      }),
  });

  if (isPending) return <Spinner />;
  if (error) return <ErrorState error={error} />;
  return (
    <article aria-busy={isFetching}>
      <h2>{data.title}</h2>
      <p>by {data.author}</p>
    </article>
  );
}
```

The pieces:

- **`queryKey`** is an array. TanStack Query uses it as a cache key. `["book", 42]` and `["book", 43]` are separate cache entries. `["book", 42]` is stable across renders (TanStack Query deep-compares the array); two components asking for `["book", 42]` share the same cache entry.
- **`queryFn`** is the async function that fetches the data. It receives an object with a `signal` (an `AbortSignal` you should pass to `fetch`) and the query key. It returns the data (or throws to indicate an error).
- **`data`** is the cached value. `undefined` until the first successful fetch, then the most recently fetched value.
- **`error`** is the error from the last failed attempt, or `null`.
- **`isPending`** is true on the first fetch (no cached data yet). It is `false` once `data` exists.
- **`isFetching`** is true any time a fetch is in flight, including background refetches after the data is already in the cache.

The difference between `isPending` and `isFetching` matters: when you navigate to a book you have viewed before, the cached data renders immediately (`isPending: false`), and a background refetch starts (`isFetching: true`). The UI does not flash a spinner; it shows stale data and updates when the refetch resolves. This is the "stale-while-revalidate" pattern; it is the default; it is excellent UX.

A second example, for lists:

```jsx
function BooksIndex() {
  const { data: books = [], isPending } = useQuery({
    queryKey: ["books"],
    queryFn: ({ signal }) =>
      fetch("/api/books", { signal }).then((r) => r.json()),
  });

  if (isPending) return <Spinner />;
  return (
    <ul>
      {books.map((b) => (
        <li key={b.id}>
          <Link to={`/books/${b.id}`}>{b.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

Notice **how much is gone** compared to the `useEffect` version in §1: no `useState`, no `useEffect`, no manual cleanup, no manual loading state, no manual error state. The component declares "I need `["books"]`; here is how to fetch it" and the hook handles the rest.

---

## 4. Query keys: the cache's identity rule

A query key uniquely identifies a query in the cache. Two components asking for the same key share the same cache entry; two components asking for different keys have independent entries.

The convention, documented at <https://tkdodo.eu/blog/effective-react-query-keys>, is:

- **Start with a resource name.** `["books"]` for the books list, `["book"]` for the detail.
- **Append distinguishing parameters in order from broad to narrow.** `["book", id]`, `["books", { page: 1, search: "ts" }]`.
- **Treat the array as a hierarchy.** `["books"]` is a prefix of `["book", 42]` only in the sense of the cache invalidation: you can invalidate by prefix (`queryClient.invalidateQueries({ queryKey: ["book"] })` invalidates every `["book", *]`).

A common pattern at scale is to extract key factories:

```js
// queryKeys.js
export const queryKeys = {
  books: {
    all: ["books"],
    list: (filters) => ["books", "list", filters],
    detail: (id) => ["books", "detail", id],
  },
  users: {
    me: ["users", "me"],
  },
};
```

Then in components: `useQuery({ queryKey: queryKeys.books.detail(id), queryFn: ... })`. The factory pattern eliminates typos and makes invalidation rules ergonomic: `queryClient.invalidateQueries({ queryKey: queryKeys.books.all })` invalidates everything under `["books", ...]`.

---

## 5. The cache lifecycle: fresh, stale, inactive

The most-asked TanStack Query question is "why did my data refetch?" The answer is in the cache lifecycle, documented in detail at <https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults>.

A cached query is in one of four states:

- **Fresh.** The data was fetched recently. TanStack Query does **not** refetch on remount, on window focus, or on reconnection. The data is considered current. The duration is set by `staleTime` (default: 0 ms).
- **Stale.** The data exists but is past `staleTime`. TanStack Query **does** refetch automatically — on remount, on window focus, on reconnection. The component still gets the stale data immediately; the refetch happens in the background and the UI updates when it resolves.
- **Inactive.** No component is currently subscribed to the query. The data stays in the cache for `gcTime` (default: 5 minutes) in case a component re-subscribes.
- **Garbage-collected.** After `gcTime` with no observers, the entry is removed. The next subscriber starts fresh.

The defaults are aggressive on purpose:

- `staleTime: 0` means every refocus triggers a refetch. Good for chat-like apps; sometimes too aggressive for slow-changing data. Bump to `30_000` (30 s) or `5 * 60_000` (5 min) as the data warrants.
- `gcTime: 5 * 60 * 1000` (5 min) is usually fine. Bump up to hold rarely-changing data longer; bump down to free memory in long-lived apps.
- `refetchOnWindowFocus: true` is the most surprising default. Tab away and come back, and queries refetch. It is the right default for most apps but worth disabling for queries where the data does not change client-side (e.g. a list of currencies).
- `retry: 3` means a failed query is retried three times with exponential backoff before surfacing the error. This hides transient network blips; it also delays the "this is genuinely broken" signal by several seconds. Reduce to 1 for endpoints you control and where you want fast failure.

You set these globally on the `QueryClient` or per-query in the `useQuery` options. The doc page at <https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults> walks through every default with examples; read once and revisit when something surprises you.

---

## 6. `useMutation`: the write path

For requests that change server state — `POST`, `PUT`, `DELETE` — use `useMutation`. The doc page is at <https://tanstack.com/query/latest/docs/framework/react/guides/mutations>.

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function NewBookForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (newBook) =>
      fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    onSuccess: (createdBook) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      navigate(`/books/${createdBook.id}`);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutation.mutate({
      title: formData.get("title"),
      author: formData.get("author"),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Title <input name="title" required /></label>
      <label>Author <input name="author" required /></label>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create"}
      </button>
      {mutation.error && <p role="alert">{mutation.error.message}</p>}
    </form>
  );
}
```

The pieces:

- **`mutationFn`** is the async function that performs the write. It receives whatever you pass to `mutate()`.
- **`onSuccess(data, variables, context)`** runs after a successful mutation. The canonical use is to invalidate queries whose data is now stale because of the write.
- **`onError(error, variables, context)`** runs after a failed mutation. Useful for rolling back optimistic updates (§7).
- **`mutation.mutate(variables)`** kicks off the mutation. There is also `mutation.mutateAsync(variables)` which returns a promise if you need to `await` the mutation.
- **`mutation.isPending`** is true while in flight. Disable the submit button on it; show a spinner.

The `onSuccess` invalidation is the most important pattern. After creating a book, the cached `["books"]` list is missing the new book. `invalidateQueries({ queryKey: ["books"] })` marks that entry stale; any subscriber refetches; the new book appears. The user does not have to refresh the page; the cache propagates the change.

---

## 7. Optimistic updates

For mutations that should feel instant — toggling a like, marking a todo done — the cache can be updated **before the server confirms**, and rolled back if the server rejects. The doc page is at <https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates>.

```jsx
const toggleDone = useMutation({
  mutationFn: ({ id, done }) =>
    fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    }).then((r) => r.json()),

  // 1. Cancel in-flight refetches and snapshot the current value
  onMutate: async ({ id, done }) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previousTodos = queryClient.getQueryData(["todos"]);
    queryClient.setQueryData(["todos"], (old = []) =>
      old.map((t) => (t.id === id ? { ...t, done } : t))
    );
    return { previousTodos };
  },

  // 2. On error, roll back to the snapshot
  onError: (err, _vars, context) => {
    queryClient.setQueryData(["todos"], context.previousTodos);
  },

  // 3. Always refetch after the mutation settles, success or error
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

What this does:

- The UI updates **immediately** when the user toggles a todo, because `setQueryData` synchronously mutates the cache.
- If the network request fails, `onError` restores the previous cache value, the UI reverts, and the user sees the original state with an error toast.
- `onSettled` runs after success or error, refetching to confirm the cache matches the server. This catches edge cases where the optimistic update and the server diverge (e.g. the server applied additional validation).

Optimistic updates are the right tool when:

- The user expects instant feedback (toggles, drag-and-drop, likes).
- The probability of the server rejecting is low.
- The rollback UX is acceptable (a brief "this did not save, undoing").

They are the wrong tool when:

- The server is the source of truth for derived state the client cannot reproduce (the new ID, the computed total).
- The rollback would be confusing (a complex write that affects multiple visible fields).

Challenge 2 of this week walks through implementing one.

---

## 8. Dependent queries

Sometimes one query depends on another. You cannot fetch the user's books until you know the user's ID. The `enabled` option gates a query on a condition:

```jsx
function UserBooks() {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => fetch("/api/me").then((r) => r.json()),
  });

  const booksQuery = useQuery({
    queryKey: ["books", userQuery.data?.id],
    queryFn: () =>
      fetch(`/api/users/${userQuery.data.id}/books`).then((r) => r.json()),
    enabled: !!userQuery.data?.id, // do not fire until we have the user
  });

  if (userQuery.isPending) return <Spinner />;
  if (booksQuery.isPending) return <Spinner />;
  return <BookList books={booksQuery.data} />;
}
```

`enabled: false` keeps the query in a perpetual `isPending` state with no fetch. Flipping it to `true` (here, by the user query resolving) starts the fetch. The pattern composes cleanly: a third query can `enabled` on `booksQuery.data?.length > 0` and so on.

---

## 9. The router-and-query pattern: prefetching from a loader

Lecture 2 showed a route loader that calls `queryClient.fetchQuery`. The pattern is worth lingering on because it is the main route-and-query integration point.

```jsx
const router = createBrowserRouter([
  {
    path: "books/:bookId",
    loader: async ({ params }) => {
      await queryClient.fetchQuery({
        queryKey: ["book", params.bookId],
        queryFn: () =>
          fetch(`/api/books/${params.bookId}`).then((r) => r.json()),
      });
      return null;
    },
    element: <BookDetail />,
  },
]);

function BookDetail() {
  const { bookId } = useParams();
  const { data: book } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () =>
      fetch(`/api/books/${bookId}`).then((r) => r.json()),
  });
  // book is always defined here, because the loader pre-populated the cache
  return <article>{book.title}</article>;
}
```

What you get:

- **The component renders with data on the first paint.** No spinner. The loader awaited the fetch; the cache has the entry; `useQuery` returns it synchronously on the first render.
- **The query remains "live" via the hook.** Mutations elsewhere can invalidate `["book", bookId]` and the component refetches. The loader's role was to seed the cache, not to be the cache itself.
- **Subsequent navigations skip the loader's fetch.** If the data is fresh in the cache, `queryClient.fetchQuery` returns the cached value without a network call. Navigating back to a recently-viewed book is instant.

The integration doc at <https://tanstack.com/query/latest/docs/framework/react/guides/react-router-integration> walks through a slightly more elaborate setup (the queryClient is passed via context, the queries are defined in factory functions). The pattern is worth adopting once your app has more than three or four routes.

---

## 10. Cancellation, focus, and reconnection

A few small but important behaviors:

- **Cancellation.** The `signal` argument to `queryFn` is an `AbortSignal`. Pass it to `fetch` and TanStack Query will cancel the request when the component unmounts mid-fetch or the query key changes. The MDN page at <https://developer.mozilla.org/en-US/docs/Web/API/AbortController> explains the underlying primitive.
- **Refetch on window focus.** When the browser tab regains focus, every stale query refetches. The behavior is configurable per-query (`refetchOnWindowFocus: false`) or globally on the `QueryClient`.
- **Refetch on reconnect.** When the network reconnects after going offline, every stale query refetches. Behavior is also configurable. The browser's `online` event is the trigger.
- **Refetch on mount.** When a component mounts and a query is stale, it refetches. `refetchOnMount: "always"` forces a refetch even on fresh data; `refetchOnMount: false` disables it entirely (you fall back to the cached value silently).

These behaviors come from the framework's view that "the cache is a hint; the server is the source of truth; refetch often enough that the user does not see stale data." You can dial each lever per use case; the defaults are reasonable for most apps.

---

## 11. A realistic component, end-to-end

Putting everything together. A book-detail page with read, edit, and delete:

```jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function BookDetail() {
  const { bookId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const book = useQuery({
    queryKey: ["book", bookId],
    queryFn: ({ signal }) =>
      fetch(`/api/books/${bookId}`, { signal }).then((r) => r.json()),
  });

  const update = useMutation({
    mutationFn: (patch) =>
      fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => r.json()),
    onSuccess: (updated) => {
      queryClient.setQueryData(["book", bookId], updated);
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setEditing(false);
    },
  });

  const remove = useMutation({
    mutationFn: () =>
      fetch(`/api/books/${bookId}`, { method: "DELETE" }).then((r) => {
        if (!r.ok) throw new Error("Failed to delete");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      navigate("/books");
    },
  });

  if (book.isPending) return <p>Loading...</p>;
  if (book.error) return <p role="alert">Error: {book.error.message}</p>;

  return (
    <article aria-busy={book.isFetching}>
      <h2>{book.data.title}</h2>
      <p>by {book.data.author}</p>
      <button type="button" onClick={() => setEditing(true)}>Edit</button>
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Delete this book?")) remove.mutate();
        }}
        disabled={remove.isPending}
      >
        {remove.isPending ? "Deleting..." : "Delete"}
      </button>

      {editing && (
        <EditBookDialog
          book={book.data}
          onSubmit={(patch) => update.mutate(patch)}
          onCancel={() => setEditing(false)}
          isPending={update.isPending}
        />
      )}
    </article>
  );
}
```

Every concept used here was introduced in this lecture: a `useQuery` for the read; two `useMutation`s for the writes; `setQueryData` to update the cache in place; `invalidateQueries` to mark related lists stale; navigation on delete success. The component has **one** piece of local UI state — `editing` — and the rest is server state, in the cache, where it belongs.

---

## 12. What we are not covering

A short list:

- **Infinite queries** (`useInfiniteQuery`). The right tool for "load more" pagination. <https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries>
- **Suspense mode.** Queries that throw promises and integrate with React's `<Suspense>` boundaries. Increasingly stable; out of scope this week. <https://tanstack.com/query/latest/docs/framework/react/guides/suspense>
- **Server Components and server-side queries.** TanStack Query has good support for SSR via `dehydrate`/`hydrate`. Out of scope until C8 W12.
- **Persistent caches.** A plug-in that writes the cache to `localStorage` or `IndexedDB` so it survives a refresh. <https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient>
- **The `select` option.** A way to project the cached value before returning it from the hook, with memoization. Useful for derived data without re-rendering on unrelated cache changes.

All are documented. The references above are the right place to start when you need them.

---

## 13. What to take away

Three things.

**One.** Server state is not in your component. It is in a cache. Components subscribe to keys; the cache fetches when needed; stale data is shown immediately and revalidated in the background. The `useEffect`-plus-`fetch` pattern is a small, slow re-implementation of this; let TanStack Query do it.

**Two.** Queries are keyed by an array. Two components asking for the same key share one cache entry; mutations invalidate by prefix; the cache state can be inspected in the devtools at any time. Naming is the engineering work.

**Three.** Mutations write, then invalidate. Optimistic updates write speculatively, then roll back on error. The `onSuccess`, `onError`, `onSettled` triple covers every UX shape you will need. Master the trio and the rest of the API folds out from it.

Now read [the exercises](../exercises/) and start the mini-project.

---

## Further reading

- TanStack Query — Overview — <https://tanstack.com/query/latest/docs/framework/react/overview>
- TanStack Query — Important Defaults — <https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults>
- TanStack Query — Queries — <https://tanstack.com/query/latest/docs/framework/react/guides/queries>
- TanStack Query — Mutations — <https://tanstack.com/query/latest/docs/framework/react/guides/mutations>
- TanStack Query — Query Invalidation — <https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation>
- TanStack Query — Optimistic Updates — <https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates>
- TanStack Query — Dependent Queries — <https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries>
- TanStack Query — DevTools — <https://tanstack.com/query/latest/docs/framework/react/devtools>
- TanStack Query — React Router integration — <https://tanstack.com/query/latest/docs/framework/react/guides/react-router-integration>
- TkDodo — Practical React Query — <https://tkdodo.eu/blog/practical-react-query>
- TkDodo — React Query as a State Manager — <https://tkdodo.eu/blog/react-query-as-a-state-manager>
- TkDodo — Effective React Query Keys — <https://tkdodo.eu/blog/effective-react-query-keys>
- MDN — `AbortController` — <https://developer.mozilla.org/en-US/docs/Web/API/AbortController>
