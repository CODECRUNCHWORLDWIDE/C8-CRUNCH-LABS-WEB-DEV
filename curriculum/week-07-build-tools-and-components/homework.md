# Week 7 — Homework

> Six practice problems. Each is meant to take 20–45 minutes. Write your answers in your own words; the act of writing the answer is the learning. Cite specs and documentation where the lectures asked you to.

---

## Problem 1 — The module specifier walk

For each of the following `import` statements, describe in your own words:

- Which specifier category it is (relative, absolute, bare, URL).
- What the **browser** does with it natively (does it work? if not, why not?).
- What the **bundler** (Vite, in this case) does with it.

```javascript
import { format } from "./helpers.js";
import config from "/config/settings.js";
import React from "react";
import { html } from "https://esm.sh/lit-html@3";
import("./lazy-page.js");
```

Reference: Lecture 1 §7 and ECMA-262 §16 (Modules). Cite the spec section in your answer.

---

## Problem 2 — Reading a real `vite.config.js`

Find a real, open-source Vite project on GitHub. Suggestions:

- The Vite documentation site itself: <https://github.com/vitejs/vite/tree/main/docs>
- VueUse: <https://github.com/vueuse/vueuse>
- The Astro starter blog template
- Any project you find on <https://github.com/topics/vite>

Open its `vite.config.js` (or `.ts`). Identify and explain **three** non-trivial configuration choices. For each, answer:

- What does the option do?
- Why might the maintainers have set it that way?
- What would change if you removed it?

A "non-trivial" choice means something beyond `plugins: [react()]`. Look for `build.rollupOptions`, custom `resolve.alias` entries, `server.proxy`, `define`, `optimizeDeps`, or a custom plugin.

---

## Problem 3 — The MPA versus SPA case for one real site

Pick a website you use regularly. Open it in your browser. Open DevTools' Network tab. Click a navigation link in the site's main nav.

Answer in your notes:

- Does the browser request a new HTML document, or does the URL change with no full page navigation?
- What is the size of the JavaScript bundle loaded on first visit?
- If you turn JavaScript off in DevTools (Cmd-Shift-P → "Disable JavaScript"), does the site still navigate? Does any content disappear?

Then make the case: **should this site have been built as an MPA or as an SPA?** Be honest — many sites that are SPAs would have been faster, more accessible, and easier to maintain as MPAs; many that are MPAs would benefit from being SPAs. Pick one and defend it in three sentences. Cite **Astro's MPA-vs-SPA** docs at <https://docs.astro.build/en/concepts/mpa-vs-spa/> in your answer.

---

## Problem 4 — A React component, written from scratch

Write a React component called `TodoList` from scratch. Requirements:

- Accepts a `todos` prop — an array of `{ id, text, done }` objects.
- Renders the list as an unordered list. Each item has a checkbox showing the `done` state and the text next to it.
- Maintains internal state for **a draft new-todo text** — what the user is typing in the input field.
- Has an `<input>` for typing a new todo and a button to add it. When the button is clicked, the component appends a new todo to local state and clears the input.
- Has a callback prop `onToggle(id)` that fires when a checkbox is clicked.
- The list items use `item.id` as the React `key`.

Write the component in JSX. Verify it parses (by dropping it into a Vite + React project and running `npm run dev`).

Then answer:

- Which pieces of data are **props** (passed in from outside)?
- Which pieces are **state** (owned by the component)?
- Why is the draft-text in state and not in a ref or a global?

---

## Problem 5 — When `useEffect` is wrong

Consider the following React component. It has a bug that is also an anti-pattern.

```jsx
function UserCard({ user }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(`Hello, ${user.firstName} ${user.lastName}`);
  }, [user]);

  return <h2>{greeting}</h2>;
}
```

Answer:

- **Why** is this an anti-pattern? Cite the React docs page that addresses it.
- **Rewrite** the component without `useEffect`. Show both versions.
- **What user-facing bug** does the original version have that the corrected version does not? (Hint: think about what `greeting` is on the very first render.)

Reference: <https://react.dev/learn/you-might-not-need-an-effect>.

---

## Problem 6 — Reading a real Astro page

Visit the Astro Blog Tutorial example or any real-world Astro site (the **Astro website itself** at <https://astro.build> is built with Astro; look at the page source). View the source of any page.

Answer:

- How many `<script>` tags are in the document?
- How much JavaScript is in `<head>` versus at the bottom of `<body>`?
- Find a Markdown blog post; look at how the surrounding HTML structure works. Is the layout HTML different from the post HTML, or is it all in one document?

Then build your own equivalent page in your local Astro project, copying the **layout pattern** (not the content, not the styling) of one page you inspect. Cite the URL of the page you copied from.

---

## Stretch problems (optional, but recommended)

### Problem 7 — Bundle audit for a real npm package

Pick a popular npm package — `moment`, `lodash`, `react-router-dom`, `axios`, `tailwindcss`. Go to <https://bundlephobia.com/> and look it up. In your notes, record:

- The minified + gzipped size.
- The number of dependencies it pulls in.
- Whether it is "tree-shakeable" (Bundlephobia indicates this).
- A lighter alternative, if one exists.

For at least one package, describe a scenario in which you would prefer the heavier package despite its size. (Hint: features the lighter alternative lacks, ecosystem support, your team's familiarity.)

### Problem 8 — File-based routing without Astro

Without using Astro, set up a tiny **file-based router** in plain JavaScript. The structure:

```
my-tiny-router/
├── index.html
├── main.js
└── routes/
    ├── home.js          // exports a function returning HTML for "/"
    ├── about.js         // exports a function returning HTML for "/about"
    └── contact.js       // exports a function returning HTML for "/contact"
```

`main.js` reads the current URL, dynamically imports the matching `routes/*.js`, calls its exported function, and inserts the HTML into a `<main>` element. Use `window.addEventListener("popstate", ...)` for back/forward; use `<a>` tags with click handlers that call `history.pushState`.

The point of the exercise is to **build the thing Astro builds at scale**. Doing it once by hand makes the framework's value concrete.

---

## How to submit

Save your answers as `homework.md` in your portfolio repo (or in a private notes folder). The act of writing in your own words is the work; do not paste AI-generated text. The exercises and homework are graded by you, against your understanding three months from now when you reach for one of these tools at work.
