# Lecture 3 — React Components Without the Religion

> Reading time: ~50 minutes. Cite the **React documentation at react.dev** by chapter and the **ECMAScript specification** for JSX-adjacent claims. React is a JavaScript library, not a worldview. By the end of this lecture you will be able to read a function component, predict what it renders, distinguish props from state, write `useState` correctly, write `useEffect` rarely and correctly, and explain to a colleague why the lowercase-vs-capitalized convention for components is enforced by the JSX transform.

---

## 1. The two-sentence definition

**A React component is a JavaScript function that returns JSX. React calls the function whenever the component's props or state change, takes the returned JSX, and updates the DOM to match.** That is the whole library, give or take.

Every other React concept — hooks, context, Suspense, server components — is an elaboration on this two-sentence core. If you understand the core, the elaborations all start in the same place.

There is no special object model. There is no inheritance hierarchy you must learn. There is no template language with directives. There is JavaScript, with a syntactic dialect (JSX) that lets you write HTML-like trees inside function returns. The dialect compiles to function calls. We will demonstrate the compilation in §3.

---

## 2. The first component

The smallest React component:

```jsx
function Greeting() {
  return <h1>Hello, world.</h1>;
}
```

Three things to notice:

- **It is a regular JavaScript function.** No `class`, no `extends`, no decorator.
- **It returns JSX** — the `<h1>...</h1>` syntax. JSX is not HTML; it is JavaScript with an HTML-flavored expression syntax. It compiles down to plain JavaScript before it runs.
- **The function name is capitalized.** This is not a style preference; it is **syntactically significant** in JSX. A lowercase tag (`<button />`) is treated as an HTML element; a capitalized tag (`<Button />`) is treated as a reference to a JavaScript variable named `Button`. We will explain this in §3.

To render the component, you import it into another file (or use it inside another component):

```jsx
// main.jsx — the entry point of a Vite + React app
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Greeting from "./Greeting.jsx";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Greeting />
  </StrictMode>
);
```

The Astro equivalent — the one you will actually use this week — does not need this bootstrap; Astro handles `createRoot` for you when you mark an island `client:load`. But the underlying mechanism is the same: React takes a tree of components, walks them, calls each component function, and renders the result.

---

## 3. JSX, demystified

Take this fragment:

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

This is not what runs in the browser. The build tool (esbuild, Babel, or in Astro's case esbuild via Vite) **transforms** this JSX into plain JavaScript function calls. The transformed version, roughly:

```javascript
import { jsx } from "react/jsx-runtime";

function Welcome({ name }) {
  return jsx("h1", { children: ["Hello, ", name, "!"] });
}
```

(The older transform produced `React.createElement("h1", null, "Hello, ", name, "!")`; the modern automatic-runtime transform uses `jsx` directly. Both are equivalent.)

So a JSX element is **a function call** at runtime. The output of a component function is **a tree of these function-call results** — plain JavaScript objects that describe the desired DOM. React calls these objects "elements." React's job is to take this tree, compare it to the previous tree (the "virtual DOM" diff), and apply the minimal set of changes to the real DOM.

Three consequences worth internalizing:

**One.** JSX is **not part of the ECMAScript specification**. There is no `<` in the JavaScript grammar. A file containing JSX cannot run in `node`, in a `<script>` tag, or in any vanilla JavaScript context without first being transformed. The transformer is a build-time tool. Browsers will never run JSX directly.

**Two.** A lowercase tag (`<button>`) compiles to `jsx("button", ...)` — a string. React treats string tags as **HTML element names** and creates real DOM elements. A capitalized tag (`<Button>`) compiles to `jsx(Button, ...)` — a reference to a JavaScript variable named `Button`. React treats variable references as **component functions** and calls them. This is why the convention is enforced: `<button />` would mean "render a `<button>` HTML element," not "render the `Button` component I just defined." Mistake the case and your component silently becomes an unknown HTML element.

**Three.** Because JSX is JavaScript, you can use JavaScript expressions inside `{}`:

```jsx
function ItemCount({ items }) {
  return (
    <p>
      You have {items.length} item{items.length === 1 ? "" : "s"}
      {items.length > 0 && ", neatly arranged"}.
    </p>
  );
}
```

The `{items.length}`, `{... ? "" : "s"}`, and `{items.length > 0 && "..."}` are all plain JavaScript. There is no template language. There are no directives like `v-if` (Vue) or `{#if}` (Svelte). JSX uses the host language's control flow.

The catch is that JavaScript's `if` statement and `for` loop are **statements**, not expressions, and you cannot put statements inside an expression slot. The patterns to express conditional and iterative rendering are:

```jsx
// Conditional: ternary
{isLoggedIn ? <Dashboard /> : <LoginForm />}

// Conditional: && (renders nothing when the left side is false)
{hasErrors && <ErrorBanner />}

// Conditional: extract to a variable above the return
let content;
if (status === "loading") content = <Spinner />;
else if (status === "error") content = <Error />;
else content = <Data data={data} />;
return <main>{content}</main>;

// Iteration: .map() — NOT a for loop
<ul>
  {items.map((item) => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>
```

The `key` prop on a list item is React-specific: it tells React how to match items between renders so it can update the DOM efficiently when the list changes order. The value must be **stable** (the same item gets the same key across renders) and **unique within the list**. The React docs at <https://react.dev/learn/rendering-lists> explain the rules; the most common mistake is using the array index as the key, which breaks when items reorder. Use a real ID.

---

## 4. Props are the inputs to a component

A component receives data through **props** — a single object passed as its first argument. The component reads what it needs by destructuring.

```jsx
// Parent
function App() {
  return <Welcome name="Brian" greeting="Welcome to Week 7" />;
}

// Child
function Welcome({ name, greeting = "Hello" }) {
  return <h1>{greeting}, {name}.</h1>;
}
```

Things to know:

- **Props are read-only.** A component never modifies its own props. If you write `props.name = "Carlos"` inside a component, React will (in development) warn you and (in production) silently fail. The mental model: props are a function's arguments; functions do not change their arguments' values from inside.
- **Props can be any value** — strings, numbers, objects, arrays, functions, even other JSX (`children`):

```jsx
// Passing JSX as a prop
function Card({ title, children }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </article>
  );
}

// Usage
<Card title="Weekly Reading">
  <p>Read both lectures end-to-end.</p>
  <p>Then do the exercises.</p>
</Card>
```

The `children` prop is automatically populated with whatever JSX you place between the opening and closing tags of the component. This is how `<Layout><h1>...</h1></Layout>` works.

- **Functions are values you can pass as props** — the canonical way to communicate "upward" from child to parent. The child calls the function; the parent has registered behavior in the function body:

```jsx
function ConfirmDialog({ onConfirm, onCancel, message }) {
  return (
    <div className="dialog">
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

function App() {
  return (
    <ConfirmDialog
      message="Delete this item?"
      onConfirm={() => console.log("confirmed")}
      onCancel={() => console.log("cancelled")}
    />
  );
}
```

Convention: callback props are named `on<Event>` (e.g. `onConfirm`, `onSubmit`, `onSelect`). The matching React event handlers on real DOM elements (`onClick`, `onChange`, `onSubmit`) are also `on<Event>`; the consistency is intentional.

---

## 5. State, with `useState`

A component's **state** is data that the component owns and can change. State is local to the component instance; two `<Counter />` components rendered in the same tree have independent state.

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

The pieces:

- **`useState(initialValue)`** returns a two-element array: the current value of the state, and a function to update it. The destructuring naming is convention: `const [count, setCount] = ...`. Re-pair every `useState` with a `setX` named for the value it updates.
- **Calling `setCount(newValue)` schedules a re-render.** React notes that the state changed, queues a re-render of the component, and on the next render the function runs again, the destructured `count` reflects the new value, and the returned JSX is reconciled with the previous JSX.
- **The component function runs every time state changes.** This is important: variables declared inside the function are recreated on every render. The `useState` hook tracks the value across these recreations.

The most common mistake with `useState`: updating state based on the previous state without using the updater function form.

```jsx
// Wrong: uses stale `count` if multiple increments queue up
const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1); // still uses the OLD count
};

// Right: use the updater function form
const handleClick = () => {
  setCount((c) => c + 1);
  setCount((c) => c + 1); // applied to the result of the previous update
};
```

The React docs at <https://react.dev/learn/queueing-a-series-of-state-updates> explain the queue mechanics with worked examples. Read once; the rule "if your new state depends on the old, use the updater function" is the right mnemonic.

---

## 6. Side effects, with `useEffect`

A **side effect** is anything a component does that is not "render JSX from props and state." Fetching data, setting up a subscription, manipulating the DOM directly, setting a timer — those are side effects.

The hook is `useEffect`:

```jsx
import { useEffect, useState } from "react";

function NowTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id); // cleanup function
  }, []);

  return <time dateTime={now.toISOString()}>{now.toLocaleTimeString()}</time>;
}
```

The pieces:

- **The first argument is a function** — the effect itself. It runs after React has committed the render to the DOM.
- **The (optional) returned function is the cleanup.** It runs before the effect runs again on a re-render, and when the component unmounts. Always clean up subscriptions, intervals, event listeners.
- **The second argument is the dependency array.** React re-runs the effect when any value in the array has changed since the last render. An empty array `[]` means "run once on mount, clean up on unmount."

The React docs treat `useEffect` with caution — <https://react.dev/learn/you-might-not-need-an-effect> is, in this author's opinion, the single most-important chapter in the docs. The summary: `useEffect` is for **synchronizing with external systems** (a server, a timer, a non-React library, the browser's APIs). It is **not** for:

- Transforming data for rendering (do that in the body of the component, or with `useMemo` if expensive).
- Handling user events (do that in the event handler, not in an effect that watches state).
- Resetting state when a prop changes (do that with the `key` prop on the component).
- Notifying parents about state changes (do that in the event handler that caused the change).

The most common React anti-pattern is **using `useEffect` to derive a value**:

```jsx
// Anti-pattern: a useEffect that just sets state from props
function GreetingBad({ user }) {
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    setGreeting(`Hello, ${user.name}`);
  }, [user.name]);
  return <h1>{greeting}</h1>;
}

// Correct: just compute the value during render
function GreetingGood({ user }) {
  const greeting = `Hello, ${user.name}`;
  return <h1>{greeting}</h1>;
}
```

The corrected version is simpler, runs faster, and never has the off-by-one-render bug the first version has (where the greeting briefly shows the previous value during the re-render). **When you reach for `useEffect`, pause and ask: am I synchronizing with something outside React?** If not, you probably do not need an effect.

---

## 7. The rules of hooks

There are exactly two rules. They are enforced by ESLint's `react-hooks` plugin and by the React runtime itself (which throws in development if you break them).

**Rule one: only call hooks at the top level of a component.** Not inside `if` statements, not inside loops, not inside nested functions. Always at the top of the component, in the same order on every render.

```jsx
// Wrong: a conditional hook
function Bad({ user }) {
  if (user) {
    const [name, setName] = useState(user.name); // RULE VIOLATION
  }
  return <p>Hi</p>;
}

// Right: hook at the top, conditional logic inside
function Good({ user }) {
  const [name, setName] = useState(user ? user.name : "");
  // ...or use the early-return pattern with the hook still at the top:
  if (!user) return <p>No user</p>;
  return <p>Hi, {name}</p>;
}
```

The reason is mechanical: React tracks which `useState` is which by *the order in which it was called*. If a conditional skips a hook on one render and includes it on the next, the index shifts and React returns the wrong state. The rule exists so React's internal hook table stays consistent.

**Rule two: only call hooks from React function components or from custom hooks.** Not from regular JavaScript functions, not from event handlers, not from utility code.

```jsx
// Wrong: a regular function calling a hook
function getCurrentUser() {
  const [user, setUser] = useState(null); // RULE VIOLATION
  return user;
}

// Right: encapsulate hook logic in a "custom hook"
// (a function whose name starts with `use`, by convention)
function useCurrentUser() {
  const [user, setUser] = useState(null);
  return user;
}

function Profile() {
  const user = useCurrentUser(); // legal
  return <p>{user?.name}</p>;
}
```

A "custom hook" is just a function whose name starts with `use` and which calls other hooks. The naming convention is what lets ESLint enforce the rules; it has no runtime meaning. The pattern is the right way to share stateful logic between components.

The React docs at <https://react.dev/reference/rules/rules-of-hooks> are the normative source. Read once.

---

## 8. A complete, realistic component

Putting the pieces together. This is the kind of component you might write for the Week 7 mini-project: a search box that filters a list of items, with debouncing.

```jsx
import { useEffect, useMemo, useState } from "react";

export default function SearchableList({ items, placeholder = "Search..." }) {
  // State: the current input value, and a debounced version of it.
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Effect: debounce the query — after 200ms of no typing, update the debounced version.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  // Derived value: the filtered list. Computed every render; memoized
  // so we do not refilter on unrelated re-renders.
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }, [items, debouncedQuery]);

  return (
    <div className="searchable-list">
      <label htmlFor="searchable-list-input">{placeholder}</label>
      <input
        id="searchable-list-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      <p className="result-count">
        {filtered.length} result{filtered.length === 1 ? "" : "s"}
      </p>
      <ul>
        {filtered.map((item) => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && debouncedQuery && (
        <p className="empty">No matches for "{debouncedQuery}".</p>
      )}
    </div>
  );
}
```

What is in this component:

- **Two pieces of state** (`query`, `debouncedQuery`). Local to this component instance.
- **One effect** (the debounce timer). External-system synchronization: a timer is outside React.
- **One memoized derivation** (`filtered`). Pure computation from props and state. `useMemo` skips recomputation on renders where the inputs have not changed.
- **One input handler** (`onChange`). Calls `setQuery`. Lives inline; the function is created fresh every render, which is fine for handlers like this.
- **One ID + label pair** (`htmlFor="searchable-list-input"`). Accessibility carries over from Week 6: every input has a label, even inside a React component.

Every concept used here was introduced earlier in the lecture. There is nothing else you need to know to read or write this kind of component. The job-interview-grade question "implement a search box that filters a list with a 200ms debounce" is a one-component, ~30-line answer.

---

## 9. Where React stops, and what we are not doing this week

React, the rendering library, ends here. The things you might have heard about that we are **deliberately not covering**:

- **Context.** A way to pass data through the tree without prop-drilling. Useful at scale; over-used at small scale. Read <https://react.dev/learn/passing-data-deeply-with-context> when you actually need it.
- **Reducers (`useReducer`).** Complex state machines. Read <https://react.dev/learn/extracting-state-logic-into-a-reducer> if you find yourself with five `useState` calls that all change together.
- **Refs (`useRef`).** Imperative access to a DOM node or a mutable value that does not trigger re-renders. Used for focus management, measuring elements, integrating with non-React libraries.
- **Memoization (`useMemo`, `useCallback`, `React.memo`).** Performance optimization. Use only after measurement says you need it. The mini-project does not.
- **Suspense, Server Components, the use() hook, Actions.** New surfaces React added in 2023–2025. Useful in Next.js and other server-rendering frameworks. Out of scope for Astro islands this week.
- **State management libraries** (Redux, Zustand, Jotai, MobX). Each has a thesis; each is over-applied. Avoid until the prop-drilling becomes painful, then evaluate honestly.

The reading list at the end of this lecture points to the React docs section for each of these when you need them. **For everything we build in C8 W7, hooks one and two (`useState`, `useEffect`) and props are sufficient.**

---

## 10. The JSX-vs-template-language trade-off

This is a short tangent, because it comes up in interviews and code reviews.

React's choice was to embed an HTML-flavored expression syntax (JSX) into JavaScript and let the host language handle control flow. Vue's choice (in its single-file-component flavor) was to embed expressions inside an HTML-like template with directives (`v-if`, `v-for`). Svelte made a similar choice. Both approaches have real trade-offs.

JSX (React):

- Plus: control flow is JavaScript you already know. No new syntax for conditionals, loops, or function calls.
- Plus: refactor tools (renames, find-all-references) work because everything is JavaScript.
- Minus: simple iteration is more verbose (`.map((item) => <li>{item}</li>)` versus `<li v-for="item in items">{{ item }}</li>`).
- Minus: HTML-like syntax in a JavaScript file is unfamiliar at first.

Templates (Vue/Svelte):

- Plus: simple iteration and conditionals read like enriched HTML.
- Plus: the framework can optimize the template (Vue's compiler emits specialized code for each directive).
- Minus: the directives are a new language to learn.
- Minus: refactor tools work less well because the templates are mini-languages, not JavaScript.

Neither is objectively right. The 2026 ecosystem is roughly split: React + JSX is dominant in North America and at large tech companies; Vue is dominant in parts of Asia and Europe; Svelte has the most enthusiastic community; Astro can render all three. **Learn JSX because the job market for it is large.** Then learn one other template language because it broadens your range. Both are syntax over the same underlying ideas (props in, declarative output, reactive state).

---

## 11. React in Astro: the specific incantation

Putting Lectures 2 and 3 together. To use React inside an Astro project:

1. Install the integration: `npm install @astrojs/react react react-dom`.
2. Add it to `astro.config.mjs`:
   ```javascript
   import { defineConfig } from "astro/config";
   import react from "@astrojs/react";
   export default defineConfig({ integrations: [react()] });
   ```
3. Write your component in `src/components/Foo.jsx` (or `.tsx` if you want TypeScript).
4. Import it into an `.astro` page and render it. Add a `client:*` directive to make it interactive:
   ```astro
   ---
   import Foo from "../components/Foo.jsx";
   ---
   <Foo client:visible />
   ```

That is the whole bridge. The React component is a real React component — same JSX, same hooks, same rules. It just renders inside Astro's pages, with the hydration directives controlling when the JavaScript loads.

A subtle point worth being explicit about: when you write `<Foo client:visible />` in an Astro page, Astro **server-renders** the Foo component to HTML at build time (so the page can ship a complete HTML snapshot). Then, separately, Astro ships the Foo component's JavaScript, which the browser hydrates onto the existing HTML when Foo becomes visible. **The server render and the hydration must produce the same initial output**, or React will throw a hydration mismatch error and re-render from scratch. The most common cause: using `Date.now()`, `Math.random()`, or `localStorage` in the initial render — the server and client see different values. The fix: move that logic into a `useEffect` (which runs only on the client) or pass the initial value as a prop from Astro.

---

## 12. What to take away

Three things.

**One.** A React component is a function from props (and state) to JSX. JSX is a syntactic dialect that compiles to function calls. There is no magic. There is no class hierarchy. There is no template language.

**Two.** `useState` is for memory; `useEffect` is for synchronizing with external systems. If you reach for `useEffect` and you are not synchronizing with a server, a timer, an event source, a non-React library, or a browser API, stop and check if you actually need it.

**Three.** The rules of hooks (top-level only; React functions or custom hooks only) are mechanical, not arbitrary. Break them and the React runtime breaks. Follow them and the linter will catch every common mistake before runtime ever sees it.

Now read [`exercise-03-react-counter-and-list.jsx`](../exercises/exercise-03-react-counter-and-list.jsx) and finish the TODO markers. Then assemble the mini-project.

---

## Further reading

- React — Your First Component — <https://react.dev/learn/your-first-component>
- React — Passing Props to a Component — <https://react.dev/learn/passing-props-to-a-component>
- React — State: A Component's Memory — <https://react.dev/learn/state-a-components-memory>
- React — Queueing a Series of State Updates — <https://react.dev/learn/queueing-a-series-of-state-updates>
- React — Synchronizing with Effects — <https://react.dev/learn/synchronizing-with-effects>
- React — You Might Not Need an Effect — <https://react.dev/learn/you-might-not-need-an-effect>
- React — Rules of Hooks — <https://react.dev/reference/rules/rules-of-hooks>
- React — Rendering Lists — <https://react.dev/learn/rendering-lists>
- React — Thinking in React — <https://react.dev/learn/thinking-in-react>
- React — `useState` reference — <https://react.dev/reference/react/useState>
- React — `useEffect` reference — <https://react.dev/reference/react/useEffect>
- React — `useMemo` reference — <https://react.dev/reference/react/useMemo>
- MDN — JSX — <https://developer.mozilla.org/en-US/docs/Glossary/JSX>
