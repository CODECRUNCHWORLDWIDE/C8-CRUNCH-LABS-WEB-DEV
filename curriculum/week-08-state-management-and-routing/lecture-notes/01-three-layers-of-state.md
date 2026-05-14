# Lecture 1 — The Three Layers of State

> Reading time: ~50 minutes. Cite the **React documentation at react.dev** by chapter, the **TanStack Query documentation** for the server-state framing, and the **Zustand README** for the global-store framing. The lecture's central claim is that the question "where does this state live?" is more important than "which hook do I call?", and that the answer factors cleanly into three buckets. We end with a state ladder from `useState` to an external store, with a rule for stepping up.

---

## 1. The wrong question, asked first

The first question most React tutorials answer is **how**: how to declare state with `useState`, how to share state with Context, how to install Redux. That is a useful first question if your app fits on one screen. It is the wrong first question once the app fits on five.

The right first question is **where**. Specifically: of all the data your application touches, which piece lives where? Pose this question of an existing piece of state — say, the current page of a paginated list — and you have to answer:

- Should the page number survive a hard refresh of the browser? If yes, it cannot live only in a JavaScript variable.
- Should pasting the URL into a co-worker's browser show them the same page? If yes, it must live in the URL.
- Is the page number a piece of input from the user, or is it a property of a server response? Both, in a sense. The list is on the server. The current page selection is the user's.
- If the user clicks "next page," is the new data already in memory, or do we need to fetch it? If we fetch, what shows during the fetch?

Notice none of these questions are about React. They are about the **information architecture** of the application. The hook calls are a downstream consequence of those answers. **A senior frontend engineer can answer the where question for any feature in fifteen seconds and writes the hook calls in two minutes; a junior engineer reverses the ratio.** This lecture is about getting the ratio right.

---

## 2. The taxonomy

There are three places state can live in a modern client-rendered React application. The names are not yet universal, but the categories are.

**Layer 1 — Server state.** Data that originates on a server. Examples: the current user's profile, the list of products, the inventory count, the comments on a post. The defining property of server state is that **the source of truth is not in your application's memory.** Your application has a *cache* of the truth; the cache can be stale; the cache must be invalidated when the user does something that changes the truth. Server state has a network round-trip on the critical path, can fail, can race with itself, and changes outside of your application's control. Server state is **shared with other clients** — you might be looking at a list while a colleague edits an item on a different machine.

**Layer 2 — URL state.** Data that lives in the URL. The path (`/products/42`), the query string (`?search=red&page=3`), and sometimes the hash (`#reviews`). URL state has two crucial properties that no other layer has: it is **bookmarkable** (the user can save the URL and return to the same view) and it is **shareable** (the user can paste the URL into a chat and the recipient lands in the same view). If a piece of state must be bookmarkable or shareable, it has to live in the URL or there is no other plausible place for it.

**Layer 3 — Local UI state.** Data that lives only in the running React app's memory and is internal to one or a few components. Examples: the current value of an input the user is typing, whether a dropdown is open, whether a hover state is engaged, the index of the currently focused tab. Local UI state does not survive a refresh, does not need to be shared with a colleague, and rarely needs to be shared between unrelated components.

**The three layers do not overlap.** A piece of state is in one of them. The question "which layer?" answers itself most of the time once you ask the three diagnostic questions:

1. Does this come from a server? → Server state. Use TanStack Query.
2. Should the user be able to bookmark or share it? → URL state. Use the router's params and search params.
3. Otherwise → Local UI state. Use `useState` (or `useReducer` for complex transitions, or Zustand for cross-cutting global UI).

Examples to ground the rule:

| Data                                    | Layer        | Why                                                          |
|-----------------------------------------|--------------|--------------------------------------------------------------|
| The list of products                    | Server       | Origin is the products API; the app has a cache              |
| The current page number of that list    | URL          | The user pastes `?page=3` and lands on page 3                |
| The "filter by category" selection      | URL          | Same: shareable, bookmarkable                                |
| Whether the filter panel is expanded    | Local UI     | Refresh, the panel can be closed again — no harm             |
| The draft text in a comment input       | Local UI     | Personal, transient; mid-sentence is not a shareable state   |
| The currently logged-in user's profile  | Server       | Origin is the auth API                                       |
| Whether the user is logged in (boolean) | Derived      | A function of the server state above; do not store separately |
| The current theme (dark/light)          | Local UI + persisted | Global, not on the server; Zustand with persist middleware |
| The currently focused tab               | URL or Local | URL if the user might link to "the third tab"; local otherwise |

The mixed cases — "should this be in the URL?" — are the cases that improve with practice. A useful question: **would a customer-support reply ever say "click on this link to land on the screen you are seeing"?** If yes, URL.

---

## 3. The state ladder for local UI state

Local UI state is the layer with the most React-specific tooling. It also has the most progression: as the state's audience widens, you step up the ladder. Each step exists to solve a specific shape of problem. Knowing why each step exists lets you skip the steps that do not apply to your case.

### Step 1 — `useState` in one component

A single piece of state used by a single component. Most of the state in a typical React app lives here.

```jsx
import { useState } from "react";

function Disclosure({ summary, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="disclosure">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {summary}
      </button>
      {open && <div className="disclosure-body">{children}</div>}
    </div>
  );
}
```

`open` is used only by `Disclosure`. It belongs in `Disclosure`. There is no further question.

### Step 2 — `useState` lifted to a parent

When two siblings need to read or change the same piece of state, the state is **lifted up** to their nearest common parent. The parent owns the state. It passes the value down via props. It passes a setter or a callback down via props so the children can update it.

```jsx
function TabsExample() {
  const [activeTab, setActiveTab] = useState("home");
  return (
    <div className="tabs">
      <TabList active={activeTab} onSelect={setActiveTab} />
      <TabPanel name="home" active={activeTab}>
        <HomeContent />
      </TabPanel>
      <TabPanel name="settings" active={activeTab}>
        <SettingsContent />
      </TabPanel>
    </div>
  );
}
```

The React documentation calls this pattern **lifting state up** and devotes a chapter to it at <https://react.dev/learn/sharing-state-between-components>. It is the right pattern most of the time; you should reach for it before reaching for anything more complex. It has two costs:

- **Prop drilling.** If `TabList` is wrapped in three intermediate components before it reaches the actual button that needs `onSelect`, every intermediate has to pass the prop through. The intermediate components do not use the prop themselves, but they have to declare it.
- **Re-render scope.** The state-owning parent re-renders on every state change, and React's default rendering re-renders all of its children. For small trees this is fine; for deep trees it occasionally requires `React.memo` or `useMemo` to keep performance acceptable.

For most local UI state, neither cost is large enough to warrant escaping the pattern. The pattern stays simple, and the data flow stays one-way (props down, callbacks up).

### Step 3 — `useReducer` for complex transitions

When a single component has five `useState` calls and they all change together in response to user events, you have implicitly built a state machine. Make it explicit. `useReducer` is React's primitive for "this component has a state and a set of named transitions on it."

```jsx
import { useReducer } from "react";

const initialState = {
  status: "idle", // 'idle' | 'submitting' | 'success' | 'error'
  values: { name: "", email: "" },
  errors: {},
};

function formReducer(state, action) {
  switch (action.type) {
    case "change":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      };
    case "submitStart":
      return { ...state, status: "submitting", errors: {} };
    case "submitSuccess":
      return { ...state, status: "success" };
    case "submitError":
      return { ...state, status: "error", errors: action.errors };
    default:
      return state;
  }
}

function SignupForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  // ...handlers call dispatch({ type: "change", field: "name", value: e.target.value })
}
```

What `useReducer` gives you over multiple `useState`s:

- **Atomic transitions.** "Start submitting" is one dispatch that sets status, clears errors, and (if you wanted) disables fields. With separate `useState`s, you have three separate `setX` calls and risk one rendering between the others.
- **Centralized logic.** The reducer is a pure function. It is easy to unit-test. It is easy to extend. The component body becomes a thin shell that dispatches actions.
- **Debuggability.** Every transition has a name. When you log `action.type` you can read the user's behavior as a sequence of named events.

The React docs at <https://react.dev/learn/extracting-state-logic-into-a-reducer> walk through the conversion. The rule of thumb: when three or more `useState`s in one component update together in response to the same events, convert to `useReducer`.

### Step 4 — Context for "ambient" values

Sometimes a value is needed deep in the tree, but the intermediate components have no business knowing about it. The user's theme. The current locale. A feature-flag object. Prop-drilling these is annoying and wrong: the intermediate components do not care, but they have to declare props for the inner consumers.

React's primitive is `Context`. A provider near the root supplies the value; a `useContext` call anywhere below reads it.

```jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  // useMemo is omitted here for clarity; in real code, memoize the value
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

What Context does well: it eliminates prop-drilling for **values that change rarely** — themes, locales, the auth user. It is part of the React core; no library required.

What Context does badly: it triggers re-renders of **every consumer** when the provider's value changes. If you put a frequently-changing value in a single context — say, a counter that increments every second — every component that calls `useContext` on it re-renders every second, whether or not it actually depends on the changing piece. There are workarounds (split contexts, use a store, useSyncExternalStore-based tools), but they accumulate complexity quickly.

The React docs are explicit at <https://react.dev/learn/passing-data-deeply-with-context>: Context is for passing data through the tree; it is **not** a state-management library. Mark Erikson (Redux maintainer) wrote a clear, even-handed essay on the distinction at <https://blog.isquaredsoftware.com/2021/01/context-redux-differences/>. The summary: Context is a delivery mechanism. The data still has to live somewhere — in a `useState` in the provider, in a reducer, or in an external store you read into the provider value.

### Step 5 — An external store (Zustand)

When the state is **truly global** — read and written from unrelated subtrees, possibly outside React entirely — an external store is the right tool. The store is a JavaScript object that owns the state and notifies subscribers when the state changes. React subscribes via a hook.

Zustand is the smallest popular option. The entire API fits in this snippet:

```js
// store.js
import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
  toggle: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));
```

```jsx
// component.jsx
import { useThemeStore } from "./store.js";

function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggle = useThemeStore((state) => state.toggle);
  return (
    <button type="button" onClick={toggle}>
      Theme: {theme}
    </button>
  );
}
```

Three things to notice:

- **The store is defined outside React.** `create((set) => ...)` returns a hook (`useThemeStore`), but the underlying object is just JavaScript. You can read it from a non-component (`useThemeStore.getState().theme`) or write to it from one (`useThemeStore.getState().setTheme("dark")`).
- **Components subscribe with selectors.** `useThemeStore((state) => state.theme)` re-renders only when the selected slice changes. A component that selects `state.theme` does not re-render when `state.notifications` changes.
- **There is no provider.** The store is a module export. Any component in any tree that imports the hook is subscribed to the same store.

Zustand is roughly **three kilobytes minified**. The README at <https://github.com/pmndrs/zustand> fits on one screen. We treat it as the default global store for the rest of this course. We will discuss Redux Toolkit briefly in §6.

---

## 4. When to step up: a rule

The ladder is not a goal. You do not "graduate" to Context, much less to Zustand. The ladder is a tool for picking the simplest pattern that works.

**The rule:** start at the lowest step that holds the state. Step up only when a concrete pain point forces it.

| Pain point                                                          | Step up to            |
|---------------------------------------------------------------------|-----------------------|
| Two siblings need the same state                                    | Lift to common parent |
| Three or more `useState`s in one component change together          | `useReducer`          |
| A value is read by many descendants but intermediates do not use it | Context               |
| State is read or written by unrelated subtrees, possibly across pages | External store      |

The reverse is also true: if you find yourself with a Zustand store and only one component is reading or writing one slice, **demote** the slice to local `useState`. The ladder bends both ways.

A specific anti-pattern: **using Context to share state that one component owns and one (or two) descendants reads.** The right answer there is to lift the state and pass it as a prop. Context buys you nothing when the consumer is one component deep.

A second specific anti-pattern: **using an external store for server data.** The cache in §5 of this lecture and the entirety of lecture 3 are the right tool for server data. A `useState` (or a Zustand slice) cannot model staleness, invalidation, retry, or deduplication of in-flight requests; pretending it can produces a class of subtle bugs that hide for months.

---

## 5. Why server state is its own layer

We will treat server state in depth in lecture 3, but the framing belongs here.

Server state has properties that local state does not:

- **It is remote.** Reading it takes a network request that can fail, time out, or be cancelled.
- **It is shared.** Other clients may be reading the same data and may modify it.
- **It can be stale.** The value your app has in memory may no longer match the server's value.
- **It needs to be invalidated.** Some user actions on your side (creating a new item) imply the cached list is wrong; you need to refetch.
- **In-flight requests can race.** If the user clicks "page 3" then "page 4" before page 3 finishes, you must render page 4 (or cancel page 3, or ignore it on arrival).
- **It is naturally cached.** Once you have fetched `/users/42`, you can render it for free if you fetch it again within a short window.

`useState` plus `useEffect` plus `fetch` can be made to handle all of these, badly. The TanStack Query maintainer (Dominik / TkDodo) has written extensively on the bug categories that result; the canonical post is "React Query as a State Manager" at <https://tkdodo.eu/blog/react-query-as-a-state-manager>. The summary: server state needs its own tool because the cache, the lifecycle, and the invalidation model are not what local state needs. The 2026 default for the React ecosystem is **TanStack Query**.

We will install and use TanStack Query in lecture 3 and in the mini-project. For now, hold the framing: **server data does not go in `useState`. It does not go in Zustand. It goes in the TanStack Query cache, keyed by what it represents.**

---

## 6. Where Redux Toolkit fits

Redux is the established React state library. It predates hooks; the modern API (Redux Toolkit, RTK Query) is a substantial improvement over the original; RTK is still ubiquitous at large companies. It is the right tool for some teams and the wrong tool for others. Three honest summaries:

- **What RTK does well.** Single source of truth. Time-travel debugging via Redux DevTools. A mature middleware ecosystem. Predictable patterns enforced across a team of fifty engineers. RTK Query is competitive with TanStack Query for many use cases and ships in the same library.
- **What RTK costs.** Ceremony. Every piece of state requires a slice, an action type (auto-generated, but still present), a selector, a hook. The patterns are explicit; the explicitness is the feature; the explicitness is also overhead.
- **When RTK is the right call.** Large teams. Complex domain logic. Heavy use of middleware (analytics, logging, optimistic updates with strong rollback). Time-travel-debugging-as-a-debugging-strategy.

We will not install Redux Toolkit this week. Lecture 1 cites it so you know it exists and can read code that uses it. If you join a team that uses RTK, the **mental model from this lecture transfers** — RTK's slices are reducer-style state, RTK Query is server-state cache. The tools differ; the architecture does not.

The Redux maintainers have a clear "why use Redux today" page at <https://redux.js.org/introduction/why-rtk-is-redux-today> and an honest "when not to use Redux" answer in the FAQ at <https://redux.js.org/faq/general#when-should-i-learn-redux>. Both are worth ten minutes.

---

## 7. The audit exercise: where does each piece live?

A useful exercise for any feature: list every piece of state the feature touches, and assign it to a layer. Take a hypothetical "product catalog" page:

| Data                                          | Layer      | Specific tool                                  |
|-----------------------------------------------|------------|------------------------------------------------|
| Product list                                  | Server     | `useQuery(["products"], fetchProducts)`        |
| Current page number                           | URL        | `useSearchParams().get("page")`                |
| Search query                                  | URL        | `useSearchParams().get("q")`                   |
| Active filter chips                           | URL        | `useSearchParams().getAll("filter")`           |
| Sort order                                    | URL        | `useSearchParams().get("sort")`                |
| Whether the filter sidebar is open (mobile)   | Local UI   | `useState` in the page component               |
| The currently-edited filter draft             | Local UI   | `useState` in the filter sidebar               |
| The user's saved-list of bookmarks            | Server     | `useQuery(["bookmarks", userId], ...)`         |
| Whether the user is logged in                 | Derived    | `useQuery(["user"]).status === "success"`      |
| The current theme                             | Global UI  | `useThemeStore((s) => s.theme)`                |

The exercise takes ten minutes for a real feature and is the single most useful planning activity I know for a React surface. **Do this on paper before writing any hook calls.** A handful of decisions, made deliberately, save a sprint of refactoring.

---

## 8. A small worked example: the page-number question

A common mistake: putting the current page number in `useState`. Let us trace what goes wrong.

```jsx
// Wrong: page is local UI state
function ProductsPage() {
  const [page, setPage] = useState(1);
  const products = useQuery(["products", page], () => fetchProducts(page));
  return (
    <>
      <ProductList products={products.data ?? []} />
      <button onClick={() => setPage((p) => p - 1)}>Prev</button>
      <button onClick={() => setPage((p) => p + 1)}>Next</button>
    </>
  );
}
```

Three problems:

1. **The URL does not change.** If the user clicks "next" three times and then copies the URL to a colleague, the colleague lands on page 1.
2. **Browser back/forward does not work.** The user expects "back" to take them to the previous page they were viewing; instead it takes them to the previous page in their browser history (probably a different site).
3. **Refresh resets state.** A hard refresh resets `page` to 1; the cache is also lost.

The corrected version puts the page in the URL:

```jsx
import { useSearchParams } from "react-router-dom";

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const products = useQuery(["products", page], () => fetchProducts(page));
  return (
    <>
      <ProductList products={products.data ?? []} />
      <button onClick={() => setSearchParams({ page: String(page - 1) })}>Prev</button>
      <button onClick={() => setSearchParams({ page: String(page + 1) })}>Next</button>
    </>
  );
}
```

Every concern is now addressed without any new infrastructure. The URL is the source of truth. Bookmarking works. Browser back/forward works (the router pushes a new history entry on every `setSearchParams`). Refresh preserves the page.

Note also that **the `useQuery` key includes `page`**. TanStack Query caches by key; page 1 and page 2 are separately cached. Navigating between them is instant if both are in the cache. This is a free benefit of using both tools correctly.

The lesson generalizes: **state that the user would naturally describe with the word "current" — the current page, the current filter, the current sort — almost always belongs in the URL.** State that the user would describe with the word "draft" or "in-progress" — the current input value, the current draft post — almost always belongs in `useState`.

---

## 9. What to take away

Three things.

**One.** State is not one thing. There are three layers — server, URL, local — and each has a tool that fits it well. Asking "where does this live?" before "what hook do I call?" is the difference between an app that ages well and one that does not.

**Two.** The local-state ladder — `useState` → lifted `useState` → `useReducer` → Context → external store — exists because each step solves a specific problem. Start at the bottom. Step up only when a concrete pain forces it. Most state in most apps stays on the bottom rung.

**Three.** Server state has its own dedicated tool (TanStack Query) and does not belong in any local-state tool. Trying to model server state with `useState` produces a category of bugs that the framework cannot fix from the outside.

Now read [lecture 2](./02-routing-with-react-router-v6.md) for the URL layer, then [lecture 3](./03-server-state-with-tanstack-query.md) for the server layer, then start the exercises.

---

## Further reading

- React — Choosing the State Structure — <https://react.dev/learn/choosing-the-state-structure>
- React — Sharing State Between Components — <https://react.dev/learn/sharing-state-between-components>
- React — Extracting State Logic into a Reducer — <https://react.dev/learn/extracting-state-logic-into-a-reducer>
- React — Passing Data Deeply with Context — <https://react.dev/learn/passing-data-deeply-with-context>
- React — Scaling Up with Reducer and Context — <https://react.dev/learn/scaling-up-with-reducer-and-context>
- TanStack Query — Overview — <https://tanstack.com/query/latest/docs/framework/react/overview>
- Zustand — README — <https://github.com/pmndrs/zustand>
- TkDodo — React Query as a State Manager — <https://tkdodo.eu/blog/react-query-as-a-state-manager>
- Mark Erikson — Why React Context Is Not a State Management Tool — <https://blog.isquaredsoftware.com/2021/01/context-redux-differences/>
- Kent C. Dodds — Application State Management with React — <https://kentcdodds.com/blog/application-state-management-with-react>
- Kent C. Dodds — Don't Sync State. Derive It! — <https://kentcdodds.com/blog/dont-sync-state-derive-it>
- Redux — Why Redux Toolkit Is How To Use Redux Today — <https://redux.js.org/introduction/why-rtk-is-redux-today>
