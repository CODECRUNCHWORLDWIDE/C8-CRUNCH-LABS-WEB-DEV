# Week 7 — Build Tools and Components

> *Six weeks in, your portfolio collects input through a multi-step form whose error messages a screen reader can announce, whose autofill fills correctly, and whose submission you watched cross the Network panel as a `FormData` body. This week the workflow changes. You will stop loading hand-written `<script>` tags one at a time and start running a **dev server** — **Vite** — that reads `import` statements, walks the module graph, transforms files on demand, and hot-replaces a component the moment you save the file. You will scaffold a static site with **Astro**, learn what file-based routing is, and understand the "islands architecture" that ships zero JavaScript by default and rehydrates only the pieces that need it. And you will write your first **React** component — `useState`, `useEffect`, props, JSX — without the religion that the framework demands you build everything inside of it.*

Welcome back. Through Week 6 your portfolio has been a folder of `.html` files served by Live Server: one `<script src="./main.js">` per page, every dependency loaded by a `<script>` tag in `<head>`, every CSS file linked by hand, and every refresh of the browser a full page reload. This works. For a portfolio that ships fewer than ten pages it is the **right** tool. The web's first three decades ran on exactly this shape.

But somewhere around the second hundred files, the seams of the static-folder approach start to show. The `<script>` order matters and breaks silently when it does not. Two pages duplicate the same nav markup with one small drift between them. A change to the design tokens requires opening fourteen files. A new dependency is a new `<script>` tag and a new global, and the global collides with a global the page already had. **The hand-written workflow scales linearly with file count; we need a workflow that scales with idea count.**

That workflow has a name. It is called **a module bundler with a dev server**, and the modern version of it — the one you will use for the rest of your career as a frontend engineer — is called **Vite**. Vite was created by Evan You (the author of Vue.js) in 2020. It reads ECMAScript module imports natively in dev, transforms TypeScript and JSX with **esbuild** (a Go-language bundler that is roughly 100× faster than its JavaScript predecessors), and uses **Rollup** for production builds. The Vite docs at <https://vitejs.dev> are unusually well-written; we will cite them by section.

Above Vite sits **Astro**, a static-site framework whose central insight is that **most of a website is content, not interaction**. A blog post is HTML with a sentence here and there that needs JavaScript. A landing page is HTML with one signup form. A documentation site is HTML with a search box. Astro renders every page to static HTML at build time and ships **zero JavaScript** by default. When a region of the page does need JavaScript — a counter, a search box, a carousel — you mark that region as an **island** and Astro generates the hydration code for just that piece. The pattern was popularized by Astro and is now adopted by Next.js, Remix, and SolidStart. The Astro docs at <https://astro.build> describe the architecture clearly.

And inside an island, you will write your first **React** component. Not React the framework. Not React the architectural commitment. **React the rendering library**: a function that takes props, returns JSX, and re-renders when state changes. Two hooks (`useState`, `useEffect`), one mental model (the component is a function of its props), and one small interactive piece — a counter that increments, a list that filters as you type. We will not build a single-page application this week. We will build a fast, mostly-static site with a few interactive islands, and the islands will be written in React because React is the lingua franca of frontend job postings in 2026 and the syntax is worth being fluent in.

By Sunday, the portfolio you have grown for six weeks lives in a new repository — a **4-page Astro site** with one **React-powered interactive island** — and you understand, finally, what the words "build step," "module graph," "hot module replacement," and "component" actually mean.

---

## Learning objectives

By the end of this week, you will be able to:

- **Explain** what a module bundler does and why one is needed: the ECMAScript module specification (ECMA-262 §16, §17) defines `import` and `export` syntax, but production deployment requires resolving the graph, eliminating dead code, splitting chunks, fingerprinting filenames for caching, and shipping a single (or small handful of) JavaScript files to the browser. Walk the history from `<script>` concatenation to **Grunt** (2012), **Gulp** (2013), **Browserify** (2011), **webpack** (2012), **Rollup** (2015), **Parcel** (2017), **esbuild** (2020), and **Vite** (2020).
- **Scaffold** a Vite project with `npm create vite@latest`, recognize the project shape (`index.html` at the root, `src/`, `public/`, `vite.config.js`), explain why `index.html` lives at the project root (the spec answer: Vite treats the HTML file as the **entry point** and the module graph starts at its `<script type="module">` tag), and run the dev server (`npm run dev`) and production build (`npm run build`).
- **Read** an `import` and an `export` statement and trace what the bundler does with each: bare specifier (`import { html } from "lit-html"`) → node_modules lookup; relative specifier (`import { format } from "./utils.js"`) → filesystem lookup; URL specifier (`import "https://esm.sh/lodash-es"`) → remote fetch. Per ECMA-262 §16.2 (Modules) and the HTML spec's "module map" algorithm.
- **Describe** Hot Module Replacement (HMR) as it is implemented in Vite: when a file changes, the dev server identifies the affected module via the import graph, sends a WebSocket message to the page, the page swaps the module without reloading. Read the Vite HMR API docs at <https://vitejs.dev/guide/api-hmr.html> and recognize `import.meta.hot`.
- **Scaffold** an Astro project with `npm create astro@latest`, recognize the project shape (`src/pages/`, `src/components/`, `src/layouts/`, `astro.config.mjs`), explain **file-based routing** (a `src/pages/about.astro` file is served at the `/about` URL — no `app.get("/about", ...)` required), and run the dev server and production build.
- **Write** an Astro component (`.astro` file): the frontmatter fence (`---`) at the top contains JavaScript that runs at build time; the body contains JSX-like markup with `{expressions}`; nothing in the frontmatter ships to the browser unless explicitly imported in client code.
- **Compose** Astro pages with layouts and slot content (`<slot />` is the spec-defined hole where child content lands, per the [Web Components Slot specification](https://html.spec.whatwg.org/multipage/scripting.html#the-slot-element)) — Astro's slot semantics mirror the platform's.
- **Apply** the **islands architecture**: a static Astro page that contains zero client JavaScript by default, with isolated regions marked `client:load`, `client:idle`, or `client:visible` that ship and hydrate JavaScript only for that island. Read the Astro Islands documentation at <https://docs.astro.build/en/concepts/islands/>.
- **Author** a React component as a function that takes props, returns JSX, and uses `useState` and `useEffect` for state and side effects. Read the React documentation at <https://react.dev> — specifically "Your First Component," "Passing Props to a Component," and "State: A Component's Memory."
- **Distinguish** between *what JSX is* (a syntactic sugar over `React.createElement` calls, transformed at build time by Babel or esbuild — JSX is **not** part of the ECMAScript spec) and *what React is* (a runtime library that renders trees of elements and reconciles changes). One is a compiler concern; the other is a runtime concern. Conflating them makes the framework feel mystical when it should not.
- **Compose** an Astro page that embeds a React island and pass props from the Astro frontmatter to the React component. Add the `@astrojs/react` integration; mark the React component `client:visible`; verify in DevTools that the JavaScript only loads when the island enters the viewport.
- **Audit** a Vite-built bundle with **rollup-plugin-visualizer**: read the treemap, identify the largest dependencies, propose three ways to shrink the bundle (dynamic `import()`, replacing a dependency with a lighter alternative, dropping the dependency entirely).
- **Cite** the Vite documentation by section, the Astro documentation by section, and the React documentation by page when defending an architectural decision.

---

## Prerequisites

You finished **Week 6 — Forms and Validation**. Concretely:

- A working portfolio whose multi-step form passes the W3C HTML validator, passes axe DevTools, and was tested with a screen reader.
- You can read and write ES module syntax — `import`, `export`, `export default` — from Week 4.
- You can use `async/await` and `Promise` from Week 5.
- You have **Node.js 20 or later** installed on your machine (`node --version` reports `v20.x.x` or higher). If you do not, install it from <https://nodejs.org> before Monday — pick the LTS version. The Node releases page at <https://nodejs.org/en/about/previous-releases> lists which versions are currently in active support; pick one of those.
- You have a working `npm` (it ships with Node) — `npm --version` reports `10.x.x` or higher.
- You are comfortable opening a terminal in your project folder. (`pwd` to see where you are; `cd` to move; `ls` on macOS/Linux or `dir` on Windows PowerShell to list.)

If `node --version` errors with "command not found," install Node first. The rest of this week assumes a working Node and npm.

---

## Topics covered

- The ECMAScript module specification (ECMA-262 §16, §17) — `import`, `export`, `export default`, named exports, namespace imports, dynamic `import()`, top-level `await`. The module specifier categories: relative (`./`), absolute (`/`), bare (`react`), URL (`https://`).
- The HTML module integration — `<script type="module">`, the module map algorithm, the deferred-by-default loading behavior, the CORS requirements for cross-origin module loading.
- The history of front-end build tools — Grunt (2012, task runner), Gulp (2013, stream-based task runner), Browserify (2011, CommonJS bundler), webpack (2012, "everything is a module" bundler), Rollup (2015, ES-module-native bundler with tree shaking), Parcel (2017, zero-config bundler), esbuild (2020, Go-based bundler ~100× faster than JS predecessors), Vite (2020, esbuild-in-dev + Rollup-in-prod combination).
- Vite — project structure, `vite.config.js`, the dev server, Hot Module Replacement, the production build, environment variables (`import.meta.env.MODE`, `import.meta.env.DEV`, `import.meta.env.PROD`), asset handling (`import url from "./img.png"`), public-directory semantics.
- esbuild — the Go-language bundler Vite uses for dev-time transformation of TypeScript, JSX, and JSON. Why "transform" and "bundle" are different operations.
- Rollup — the production bundler Vite delegates to. Tree shaking, chunk splitting, the `manualChunks` option, the visualizer plugin.
- Astro — the static-site framework. The `.astro` file format, the frontmatter fence, expressions in markup, component composition, layouts, slots, file-based routing under `src/pages/`, the `getStaticPaths` function for dynamic routes, **content collections** for type-safe Markdown.
- MDX — Markdown with JSX expressions in it. The `@astrojs/mdx` integration. When MDX is the right tool versus when plain Markdown plus a layout is enough.
- The islands architecture — what an island is, the `client:*` directives (`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`), why "ship zero JavaScript by default" matters for Core Web Vitals.
- React — the rendering library. JSX as a syntactic transformation. Function components. Props. The `useState` hook for local state. The `useEffect` hook for synchronizing with external systems. The mental model that a component is a function of its props.
- The React rules — components must be capitalized (a lowercase tag is interpreted as an HTML element); hooks must be called at the top level of a component, never inside conditionals or loops; the rules are enforced by ESLint's `react-hooks` plugin.
- Bundle analysis — `rollup-plugin-visualizer`, treemaps, identifying the heaviest dependencies, the difference between a bundle's *parsed* size and its *gzipped* size (the latter is what crosses the network).
- The Core Web Vitals as they relate to the bundle — Largest Contentful Paint, First Input Delay (now Interaction to Next Paint), Cumulative Layout Shift. Why a 200 KB JavaScript bundle is invisible to LCP but lethal to INP on a low-end Android device.

## Tools you will need

| Tool                                  | Role                                                  | Cost |
| ------------------------------------- | ----------------------------------------------------- | ---- |
| **Node.js 20+**                       | The JavaScript runtime that runs Vite and Astro       | Free |
| **npm 10+**                           | The package manager that ships with Node              | Free |
| **VS Code**                           | Editor                                                | Free |
| **Astro VS Code extension**           | Syntax highlighting and IntelliSense for `.astro` files | Free |
| **ESLint** (project-local)            | Linter; catches React-hook rule violations            | Free |
| **A current Chrome or Firefox**       | Dev server target; DevTools is your friend this week  | Free |
| **DevTools — Network panel**          | Confirm islands hydrate only when they should         | Free |
| **DevTools — Performance panel**      | Understand what HMR does without a full reload        | Free |
| **rollup-plugin-visualizer**          | Treemap of the production bundle                      | Free |
| **The Vite documentation**            | The normative reference for the dev server and build  | Free |
| **The Astro documentation**           | The normative reference for `.astro` and the islands  | Free |
| **The React documentation (react.dev)** | The normative reference for components and hooks   | Free |

No paid services. No frameworks beyond the three above. No Tailwind, no UI library. The components you ship this week are CSS the way Week 2 taught you and JSX the way React documents.

---

## Weekly schedule

The schedule below adds up to approximately **36 hours**. Treat it as a target. The shift from "I edit HTML files" to "I run a dev server" takes some adjustment; budget extra hours to Monday and Tuesday for the new mental model.

| Day       | Focus                                            | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|--------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | Module history, Vite scaffolding, dev server     |    3h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Tuesday   | Astro pages, file-based routing, MDX             |    2h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     6h      |
| Wednesday | React: components, props, state, hooks           |    2h    |    2h     |     1h     |    0.5h   |   1h     |     1h       |    0h      |     7.5h    |
| Thursday  | Islands, hydration directives, bundle analysis   |    0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Friday    | Mini-project — build the four-page Astro site    |    0h    |    1h     |     0h     |    0.5h   |   1h     |     2h       |    0.5h    |     5h      |
| Saturday  | Mini-project deep work + React island            |    0h    |    0h     |     0h     |    0h     |   1h     |     2h       |    0h      |     3h      |
| Sunday    | Quiz, polish, bundle audit, deploy               |    0h    |    0h     |     0h     |    0.5h   |   0h     |     1h       |    0h      |     1.5h    |
| **Total** |                                                  | **7h**   | **8h**    | **2h**     | **3h**    | **6h**   | **8h**       | **2h**     | **36h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | Vite docs, Astro docs, react.dev, MDN, web.dev, the ECMAScript module spec |
| [lecture-notes/01-from-script-tags-to-modules.md](./lecture-notes/01-from-script-tags-to-modules.md) | The history of front-end build tools; ECMAScript modules; what a bundler does; introducing Vite |
| [lecture-notes/02-astro-pages-and-islands.md](./lecture-notes/02-astro-pages-and-islands.md) | Astro's `.astro` files; file-based routing; layouts and slots; the islands architecture; MDX |
| [lecture-notes/03-react-components-without-the-religion.md](./lecture-notes/03-react-components-without-the-religion.md) | What a component is; JSX as syntactic transformation; props; `useState`; `useEffect`; the rules |
| [exercises/exercise-01-bootstrap-a-vite-app.md](./exercises/exercise-01-bootstrap-a-vite-app.md) | Scaffold a vanilla Vite app; walk the structure; recognize HMR; read `vite.config.js` |
| [exercises/exercise-02-build-an-astro-landing-page.md](./exercises/exercise-02-build-an-astro-landing-page.md) | Scaffold an Astro project; build a landing page with a layout and a slot |
| [exercises/exercise-03-react-counter-and-list.jsx](./exercises/exercise-03-react-counter-and-list.jsx) | Starter JSX: a counter, a filtered list. Fill in the `TODO` markers and explain each. |
| [exercises/SOLUTIONS.md](./exercises/SOLUTIONS.md) | Reference solutions with annotated explanations |
| [challenges/challenge-01-bundle-size-budget.md](./challenges/challenge-01-bundle-size-budget.md) | Audit a real Vite build with `rollup-plugin-visualizer`; set a 50 KB budget; propose three cuts |
| [challenges/challenge-02-astro-with-react-island.md](./challenges/challenge-02-astro-with-react-island.md) | Embed a React island in an Astro page; verify it only hydrates `client:visible` |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | A four-page Astro site with one React-powered interactive island |

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

- Read the **Vite docs end-to-end** at <https://vitejs.dev/guide/>. The "Why Vite" section explains the design philosophy; the "Features" section is the reference; the "Build for Production" section is where you go when the bundle gets too big.
- Read the **Astro docs "Concepts" section** at <https://docs.astro.build/en/concepts/>. The five short pages — "Astro Islands," "Why Astro," "MPA vs SPA," and the rendering modes — answer "what is this framework for" thoroughly.
- Read **"Your First Component" through "State: A Component's Memory"** at <https://react.dev/learn> — six chapters, each five to ten minutes. The react.dev tutorial is the best framework documentation on the web; treat it as a textbook.
- Read **Lin Clark's "A cartoon intro to WebAssembly"** at <https://hacks.mozilla.org/2017/02/a-cartoon-intro-to-webassembly/>. Adjacent topic; explains why esbuild can be so much faster than its JavaScript predecessors (esbuild is Go, not Wasm, but the performance lesson is the same).
- Read **"The cost of JavaScript in 2023"** by Addy Osmani at <https://web.dev/articles/the-cost-of-javascript-in-2023>. The single best read on why "ship less JavaScript" is the most reliable performance win on the web.
- Watch **"How web frameworks render: islands, server components, and resumability" by Misko Hevery** (the creator of Qwik, framed as a survey, not a sales pitch). YouTube. Thirty minutes; the architecture comparison is illuminating.
- Read **the ECMAScript Modules HTML integration spec** at <https://html.spec.whatwg.org/multipage/webappapis.html#integration-with-the-javascript-module-system>. Dense, but it is the actual contract between your `<script type="module">` and the browser.

---

## What this week is NOT

A few things to set expectations:

- **Not a deep dive into React.** We touch React the way an architect touches a hammer: enough to use it well, not enough to teach a workshop on it. The React docs at react.dev are the source you return to when you need more.
- **Not a server-side rendering week.** Astro can render at request time; we are using its **static** mode this week. The server-rendering modes (`output: 'server'`, `output: 'hybrid'`) belong with the backend material in Week 13.
- **Not a TypeScript week.** Astro and Vite both support TypeScript natively; the starter templates include it; we are not requiring it. TypeScript joins the curriculum in C8 Week 10. This week, JavaScript with JSDoc comments where helpful.
- **Not a Tailwind week.** No CSS framework. The components you write use the same custom-property system Week 2 introduced.
- **Not a state-management week.** No Redux, no Zustand, no React Context beyond a single illustrative example. Local component state with `useState` is sufficient for everything we build.
- **Not a Single-Page-Application week.** Astro is multi-page-application by default; every navigation is a full page request. The MPA-vs-SPA discussion is in Lecture 2; we are squarely on the MPA side. Single-page applications, when they are the right tool, get their own week in C8 W11.
- **Not a Next.js week.** Next is the most popular React-based framework in industry, and you should read about it eventually; this week we use Astro because its mental model is simpler and the "ship nothing by default" philosophy matches what you have built so far.

---

## A word on the editorial voice

You will notice this week's lecture notes treat the **build step** as something to understand, not something to fear. The folklore around build tools — that they are slow, that they are complicated, that they are a treadmill of new tools every six months — is mostly outdated. Vite's dev server starts in under a second. Astro's build output is plain HTML. The tools in 2026 are the best the field has ever had. The "JavaScript fatigue" essays that defined 2016 are no longer the right reference; the same tooling churn that exhausted that generation has substantially settled.

You will also notice we are deliberate about distinguishing **what is a language feature** (ECMAScript modules) from **what is a tool feature** (the bundler's optimizations) from **what is a runtime library** (React). Conflating these three is the single most common source of confusion when a learner first encounters modern front-end work. A senior engineer can tell you which layer each behavior lives in; this week we try to give you the same ability.

A final note: this is the **first week** in the course where the deliverable does not run by double-clicking an HTML file. It runs through a dev server. That is a meaningful shift, and it is the shift the rest of the industry has lived in for ten years. The forms work, the DOM work, and the accessibility work you have already done all transfer; you are not starting over. You are putting the same craft on top of a workflow that scales.

---

## Up next

Continue to [Week 8 — Asynchronous JavaScript and Fetch](../week-08/) once you have shipped the four-page Astro site, your React island hydrates only when it enters the viewport, your bundle is under 50 KB of compressed JavaScript, you have read all three lectures end-to-end at least twice, and your homework answers are written in the words you would use to defend them in a code review.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
