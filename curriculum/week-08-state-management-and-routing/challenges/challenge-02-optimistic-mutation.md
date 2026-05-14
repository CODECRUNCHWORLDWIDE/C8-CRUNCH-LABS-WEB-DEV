# Challenge 2 — Optimistic Mutation with Rollback

> Estimated time: 60–90 minutes.
> Difficulty: Moderate.
> Prerequisite: Exercise 3 finished (TanStack Query installed and working).

---

## The brief

Implement a todo list with a `toggle done` mutation that updates the UI **instantly** when the user clicks a checkbox, then quietly reconciles with the server. If the server rejects the update, the UI rolls back to the previous state and surfaces an error.

The pattern is **optimistic update with rollback**. It is the canonical UX for fast-feeling client apps and is documented at <https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates>.

You will simulate a server with a small Vite-plugin mock or a tiny Express server. To keep dependencies minimal, this challenge uses **a fake fetch that fails randomly 30% of the time**, so you can observe both the success path and the rollback path without leaving the browser.

---

## Setup

Start from your Exercise 3 project (TanStack Query installed). Create a new component file: `src/components/Todos.jsx`.

The "API" is two functions, declared at the top of the file:

```js
const FAILURE_RATE = 0.3;

// Pretend this is a real network call. Half the time succeeds; the other
// thirty percent fails after a 600 ms delay.
function fakeUpdate({ id, done }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error("Server rejected the update (simulated)."));
      } else {
        resolve({ id, done });
      }
    }, 600);
  });
}

// The "initial" todos. In a real app this would come from a /api/todos
// fetch via useQuery. For the challenge we hand-code them.
const INITIAL_TODOS = [
  { id: 1, text: "Read Lecture 1", done: true },
  { id: 2, text: "Read Lecture 2", done: true },
  { id: 3, text: "Read Lecture 3", done: false },
  { id: 4, text: "Do Exercise 1", done: false },
  { id: 5, text: "Do Exercise 2", done: false },
];
```

We seed the cache directly. The `Todos` component reads `["todos"]` from the cache; the seed happens once in `main.jsx`:

```jsx
queryClient.setQueryData(["todos"], INITIAL_TODOS);
```

(In a real app, a `useQuery(["todos"], fetchTodos)` would do this for you; we are taking a shortcut to focus on the mutation pattern.)

---

## Step 1 — The naïve mutation

First, implement the mutation **without** optimistic updates. The UI shows a spinner while the request is in flight; the cache updates on success.

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function Todos() {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const todos = queryClient.getQueryData(["todos"]) ?? [];

  const toggle = useMutation({
    mutationFn: fakeUpdate,
    onSuccess: ({ id, done }) => {
      queryClient.setQueryData(["todos"], (prev) =>
        prev.map((t) => (t.id === id ? { ...t, done } : t))
      );
      setError(null);
    },
    onError: (err) => setError(err.message),
  });

  return (
    <main>
      <h2>Todos</h2>
      {error && <p role="alert">Error: {error}</p>}
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                disabled={toggle.isPending}
                onChange={(e) => toggle.mutate({ id: t.id, done: e.target.checked })}
              />
              {t.text}
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

Try it. You will notice:

- Clicking a checkbox **delays** by ~600 ms before the visual changes (because the cache update happens in `onSuccess`).
- When the simulated failure happens, the checkbox stays in its original state, and the error message appears.

This is the "honest" UX. It is correct but slow-feeling. Real apps want the checkbox to flip **immediately**.

---

## Step 2 — Optimistic update

Convert the mutation to an optimistic update with three lifecycle hooks: `onMutate`, `onError`, `onSettled`.

```jsx
const toggle = useMutation({
  mutationFn: fakeUpdate,

  // 1. Before the request fires, snapshot the cache and apply the
  //    speculative update.
  onMutate: async ({ id, done }) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previousTodos = queryClient.getQueryData(["todos"]);
    queryClient.setQueryData(["todos"], (prev) =>
      prev.map((t) => (t.id === id ? { ...t, done } : t))
    );
    return { previousTodos };
  },

  // 2. On error, roll back to the snapshot.
  onError: (err, _vars, context) => {
    if (context?.previousTodos) {
      queryClient.setQueryData(["todos"], context.previousTodos);
    }
    setError(err.message);
  },

  // 3. After success or failure, settle. In a real app you would
  //    invalidate the query to reconcile with the server's canonical
  //    response. Here, with a fake API, there is no "real" server, so
  //    we leave the cache as-is on success.
  onSettled: () => {
    // In a real app:
    // queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

Also remove the `disabled={toggle.isPending}` on the checkbox — the optimistic update means the checkbox should respond instantly, not wait.

Try it again. Now:

- Clicking a checkbox **flips immediately**.
- On a successful response, the cache already has the right value; nothing visible changes.
- On a failure, the checkbox briefly stays flipped (the optimistic value), then the rollback reverts it, and the error message appears.

The latency the user perceives is zero. The latency the server sees is still ~600 ms; the optimistic update hides it.

---

## Step 3 — Observability

Open the React Query Devtools (the floating logo bottom-left). Click on `["todos"]`. You can see:

- The "Data" tab shows the current cache.
- The "Mutations" tab shows in-flight mutations, their variables, and their lifecycle.

Watch the cache change in real time as you click checkboxes. The optimistic update writes to the cache synchronously; the rollback (on failure) writes again. Both write events appear in the devtools.

---

## Step 4 — Concurrent clicks

Click two checkboxes in quick succession. With optimistic updates, both visually flip immediately. The two mutations run in parallel; each has its own `onMutate` snapshot.

**There is a subtle race.** If the first mutation fails after the second mutation has already applied, the rollback could overwrite the second mutation's optimistic value. Try clicking two checkboxes within 100 ms and observe.

In a production app you would:

- **Snapshot per-mutation context.** Each mutation's `onMutate` snapshots the cache *at that moment*; the rollback restores *that snapshot*. If snapshot 1 was taken before mutation 2 ran, restoring snapshot 1 reverts mutation 2.
- **Make snapshots scope-aware.** Instead of `previousTodos: queryClient.getQueryData(["todos"])`, capture `previousValue: prev.find((t) => t.id === id)?.done` — restore only the changed field, not the whole list.

Refactor:

```jsx
onMutate: async ({ id, done }) => {
  await queryClient.cancelQueries({ queryKey: ["todos"] });
  const todos = queryClient.getQueryData(["todos"]) ?? [];
  const previousDone = todos.find((t) => t.id === id)?.done ?? false;
  queryClient.setQueryData(["todos"], (prev) =>
    prev.map((t) => (t.id === id ? { ...t, done } : t))
  );
  return { id, previousDone };
},
onError: (err, _vars, context) => {
  if (context) {
    queryClient.setQueryData(["todos"], (prev) =>
      prev.map((t) => (t.id === context.id ? { ...t, done: context.previousDone } : t))
    );
  }
  setError(err.message);
},
```

Now each mutation rolls back **only its own field**, leaving concurrent mutations' fields intact.

This is the kind of detail that distinguishes a "works in the demo" optimistic update from a "works under user load" one. The TkDodo post at <https://tkdodo.eu/blog/mastering-mutations-in-react-query> is the canonical reference for these edge cases.

---

## Done when

- [ ] The naïve version works and you can describe (in writing) why it feels slow.
- [ ] The optimistic version works and the checkbox flips instantly.
- [ ] When the simulated failure happens, the rollback reverts the visual change and surfaces an error.
- [ ] Concurrent clicks do not stomp on each other's rollback context.
- [ ] You have read the TanStack Query optimistic-updates doc end to end: <https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates>.

---

## Reflection

Write your answers in notes.

1. **When is the optimistic-update pattern the right tool, and when is it wrong?** Hint: think about the user's expectation if the mutation rolls back. A like button rolling back is fine; a checkout-confirmation rolling back is catastrophic.
2. **What does `cancelQueries` in `onMutate` do, and why is it necessary?** Read <https://tanstack.com/query/latest/docs/framework/react/reference/QueryClient#queryclientcancelqueries> if not clear.
3. **The fake API has a 30% failure rate. In production, an optimistic update with a 30% rollback rate would be a bad user experience.** What failure rate is acceptable for optimistic updates? What instrumentation would tell you in production?

---

## Stretch

- Replace the in-memory `["todos"]` with a real `useQuery` that calls a real backend (or JSONPlaceholder's `/todos` endpoint, which also does not persist but accepts PATCH requests). The optimistic pattern works identically.
- Add **persisted optimistic state** with TanStack Query's persist plugin (<https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient>). The optimistic value survives a hard refresh; the mutation is replayed on next mount.
- Implement an "undo" toast that appears for 5 seconds after a successful mutation. Clicking "undo" fires the reverse mutation. The pattern is straightforward; the engineering is in the toast UI.

---

## Further reading

- TanStack Query — Optimistic Updates — <https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates>
- TanStack Query — Mutations — <https://tanstack.com/query/latest/docs/framework/react/guides/mutations>
- TanStack Query — `useMutation` reference — <https://tanstack.com/query/latest/docs/framework/react/reference/useMutation>
- TkDodo — Mastering Mutations in React Query — <https://tkdodo.eu/blog/mastering-mutations-in-react-query>
- TkDodo — Practical React Query — <https://tkdodo.eu/blog/practical-react-query>
