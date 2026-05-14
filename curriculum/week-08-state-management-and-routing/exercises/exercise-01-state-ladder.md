# Exercise 1 — Walk the State Ladder

> Estimated time: 60–90 minutes.
> Prerequisite: Lecture 1 read. Vite + React project from Week 7 working locally.

---

## Goal

Implement the same feature — a **theme toggle** that flips the page between light and dark — at five distinct points on the state ladder. The feature itself is trivial; the value is feeling the ergonomic differences between rungs.

At each step you will write the smallest possible code that works, and then write **one paragraph** in your notes explaining what the step gives you that the previous step did not, and what cost it adds.

---

## Setup

If you do not already have a Vite + React playground, create one:

```bash
npm create vite@latest state-ladder -- --template react
cd state-ladder
npm install
npm run dev
```

Then create `src/components/` and `src/store/`. Each step below lives in its own file under `src/components/`. The final `App.jsx` will import and render five `<ThemeToggleX />` components stacked vertically so you can compare side by side.

For visual feedback, add this to `src/index.css`:

```css
:root[data-theme="dark"] {
  background: #121212;
  color: #f5f5f5;
}
:root[data-theme="light"] {
  background: #ffffff;
  color: #121212;
}
section {
  border: 1px solid currentColor;
  padding: 1rem;
  margin: 0.5rem 0;
}
```

Each step's component should read or update `document.documentElement.dataset.theme` so the visual flip is obvious.

---

## Step 1 — `useState` in one component

Create `src/components/ThemeToggle1.jsx`. The component owns its own state, toggles between `"light"` and `"dark"`, and updates the document on every change.

```jsx
import { useEffect, useState } from "react";

export function ThemeToggle1() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <section aria-label="Step 1 — local useState">
      <h2>Step 1 — local useState</h2>
      <p>Current theme: {theme}</p>
      <button type="button" onClick={toggle}>Toggle</button>
    </section>
  );
}
```

**Write in your notes:** what is wrong with this implementation if there are *two* `ThemeToggle1` components on the page? Try it. What happens? Why?

---

## Step 2 — Lift the state to the parent

Create `src/components/ThemeToggle2.jsx` and `src/components/ThemeToggle2Parent.jsx`. The parent owns the theme; the toggle is a child that reads from props.

```jsx
// ThemeToggle2.jsx
export function ThemeToggle2({ theme, onToggle, label }) {
  return (
    <div>
      <p>{label} — theme: {theme}</p>
      <button type="button" onClick={onToggle}>Toggle</button>
    </div>
  );
}

// ThemeToggle2Parent.jsx
import { useEffect, useState } from "react";
import { ThemeToggle2 } from "./ThemeToggle2.jsx";

export function ThemeToggle2Parent() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <section aria-label="Step 2 — lifted state">
      <h2>Step 2 — lifted state</h2>
      <ThemeToggle2 theme={theme} onToggle={toggle} label="Toggle A" />
      <ThemeToggle2 theme={theme} onToggle={toggle} label="Toggle B" />
    </section>
  );
}
```

**Write in your notes:** the two toggles are now in sync. What changed mechanically? What is the cost if the toggle were nested four components deep?

---

## Step 3 — `useReducer` for explicit transitions

Pretend the theme can take **three** values: `"light"`, `"dark"`, `"system"` (follow the OS preference). The toggle now has three named transitions: `setLight`, `setDark`, `setSystem`. Use `useReducer`.

Create `src/components/ThemeToggle3.jsx`:

```jsx
import { useEffect, useReducer } from "react";

const initial = { theme: "light" };

function reducer(state, action) {
  switch (action.type) {
    case "setLight":  return { theme: "light" };
    case "setDark":   return { theme: "dark" };
    case "setSystem": {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return { theme: prefersDark ? "dark" : "light" };
    }
    default: return state;
  }
}

export function ThemeToggle3() {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  return (
    <section aria-label="Step 3 — useReducer">
      <h2>Step 3 — useReducer</h2>
      <p>Current theme: {state.theme}</p>
      <button type="button" onClick={() => dispatch({ type: "setLight" })}>Light</button>
      <button type="button" onClick={() => dispatch({ type: "setDark" })}>Dark</button>
      <button type="button" onClick={() => dispatch({ type: "setSystem" })}>System</button>
    </section>
  );
}
```

**Write in your notes:** what does the reducer give you over three separate `useState`s? Where would you put a unit test for this logic, and what would the test look like (in pseudocode)?

---

## Step 4 — React Context for deep consumers

Pretend the theme is needed in five different leaves of a deeply nested tree, and the intermediate components have nothing to do with theming. Lifting and prop-drilling is annoying.

Create `src/store/ThemeContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
```

Create `src/components/ThemeToggle4.jsx`:

```jsx
import { useTheme } from "../store/ThemeContext.jsx";

function DeepNestedToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      Toggle (theme: {theme})
    </button>
  );
}

function IntermediateA({ children }) { return <div className="intermediate-a">{children}</div>; }
function IntermediateB({ children }) { return <div className="intermediate-b">{children}</div>; }
function IntermediateC({ children }) { return <div className="intermediate-c">{children}</div>; }

export function ThemeToggle4() {
  return (
    <section aria-label="Step 4 — React Context">
      <h2>Step 4 — React Context</h2>
      <IntermediateA>
        <IntermediateB>
          <IntermediateC>
            <DeepNestedToggle />
          </IntermediateC>
        </IntermediateB>
      </IntermediateA>
    </section>
  );
}
```

In `App.jsx`, wrap your tree with `<ThemeProvider>` so `ThemeToggle4` can find the context.

**Write in your notes:** what does Context buy you here? What is the re-rendering cost (read <https://blog.isquaredsoftware.com/2021/01/context-redux-differences/> §3 — "Why Context Is Not 'State Management'")?

---

## Step 5 — Zustand for truly global state

Now pretend the theme should be readable and writable from anywhere — including from non-React code (an analytics module that wants to know the current theme). Install Zustand:

```bash
npm install zustand
```

Create `src/store/themeStore.js`:

```js
import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: "light",
  setTheme: (theme) => {
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
  toggle: () => set((state) => {
    const next = state.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    return { theme: next };
  }),
}));
```

Create `src/components/ThemeToggle5.jsx`:

```jsx
import { useThemeStore } from "../store/themeStore.js";

export function ThemeToggle5() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <section aria-label="Step 5 — Zustand">
      <h2>Step 5 — Zustand</h2>
      <p>Current theme: {theme}</p>
      <button type="button" onClick={toggle}>Toggle</button>
    </section>
  );
}
```

Bonus: in your browser DevTools console, type:

```js
window.__theme = (await import("./src/store/themeStore.js")).useThemeStore.getState();
window.__theme.toggle();
```

You toggled the theme from outside React. The component re-rendered. That is the property Zustand gives you: the store is not a React thing — it is a JavaScript thing that React can subscribe to.

**Write in your notes:** when is Zustand worth the extra dependency? What is the cost (a third-party library, an import, a small bundle hit)? What does it buy you that Context did not?

---

## Final wiring

Your `App.jsx`:

```jsx
import { ThemeProvider } from "./store/ThemeContext.jsx";
import { ThemeToggle1 } from "./components/ThemeToggle1.jsx";
import { ThemeToggle2Parent } from "./components/ThemeToggle2Parent.jsx";
import { ThemeToggle3 } from "./components/ThemeToggle3.jsx";
import { ThemeToggle4 } from "./components/ThemeToggle4.jsx";
import { ThemeToggle5 } from "./components/ThemeToggle5.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
        <h1>The state ladder</h1>
        <ThemeToggle1 />
        <ThemeToggle2Parent />
        <ThemeToggle3 />
        <ThemeToggle4 />
        <ThemeToggle5 />
      </main>
    </ThemeProvider>
  );
}
```

Run `npm run dev` and click around. Notice which steps stay in sync with which other steps. Notice which steps are entirely independent.

---

## Deliverable

In your notes (or your portfolio's `lecture-notes/` folder), submit:

1. The five components above, working.
2. A 200-to-400-word reflection that answers, in your own words:
   - Why did Step 1 fail when there were two instances?
   - What did Step 2 buy you, and what is the cost?
   - When would you reach for `useReducer` (Step 3) over multiple `useState`s?
   - What does Context (Step 4) solve, and what is it bad at?
   - When is Zustand (Step 5) the right answer, and when is it overkill?

A good answer cites the React docs by URL. The single most useful reference here is <https://react.dev/learn/choosing-the-state-structure>.

---

## Reflection prompt

Three closing questions worth thinking about:

1. **At which step did the code feel cleaner than the previous step?** Did any step feel like *more* work for the same benefit?
2. **If you were starting a small to-do app from scratch tomorrow, which step would you pick for the to-do list state?** Defend your choice in two sentences.
3. **The state ladder is for local UI state.** Where would the *list of theme presets fetched from a server* live? Why not in any of the five steps above?

The third question previews lecture 3. The answer is the TanStack Query cache. The state ladder does not extend in that direction; server state has its own layer.

---

## Further reading

- React — Choosing the State Structure — <https://react.dev/learn/choosing-the-state-structure>
- React — Extracting State Logic into a Reducer — <https://react.dev/learn/extracting-state-logic-into-a-reducer>
- React — Passing Data Deeply with Context — <https://react.dev/learn/passing-data-deeply-with-context>
- Mark Erikson — Why React Context Is Not a State Management Tool — <https://blog.isquaredsoftware.com/2021/01/context-redux-differences/>
- Zustand — README — <https://github.com/pmndrs/zustand>
