# Week 7 — Resources

Every resource here is **free** and **publicly accessible**.

## Primary sources

- **Vite — Official documentation** — the normative reference for the dev server, the build, and every plugin hook. Start at "Why Vite" then read "Features" linearly. <https://vitejs.dev/guide/>
- **Vite — "Why Vite"** — the design philosophy: native ES modules in dev, Rollup for prod, esbuild for transformation. Five-minute read; sets the mental model. <https://vitejs.dev/guide/why.html>
- **Vite — Features reference** — the complete feature index: HMR, asset handling, CSS modules, environment variables, glob imports. <https://vitejs.dev/guide/features.html>
- **Vite — HMR API** — how to subscribe a module to hot updates with `import.meta.hot`. The pattern every framework adapter wraps. <https://vitejs.dev/guide/api-hmr.html>
- **Vite — Build for production** — the production build pipeline, code splitting, asset inlining, the `build.rollupOptions` escape hatch. <https://vitejs.dev/guide/build.html>
- **Astro — Official documentation** — the normative reference for `.astro` files, file-based routing, and the islands architecture. <https://docs.astro.build/>
- **Astro — Concepts: Astro Islands** — the canonical explanation of partial hydration. Required reading; cited everywhere this week. <https://docs.astro.build/en/concepts/islands/>
- **Astro — Concepts: Why Astro** — the framework's pitch in 800 words. Read once. <https://docs.astro.build/en/concepts/why-astro/>
- **Astro — Pages** — the file-based router. Every `.astro` or `.md` file in `src/pages/` becomes a route. <https://docs.astro.build/en/basics/astro-pages/>
- **Astro — Components** — the `.astro` file format: frontmatter fence, expressions in markup, props. <https://docs.astro.build/en/basics/astro-components/>
- **Astro — Layouts** — how to share a wrapper across pages. <https://docs.astro.build/en/basics/layouts/>
- **Astro — Framework Components (React, Vue, Svelte, Solid)** — how to embed a React component in an Astro page. The `client:*` directives are documented here. <https://docs.astro.build/en/guides/framework-components/>
- **Astro — Markdown and MDX** — when to use plain `.md`, when to use `.mdx`, what the difference is. <https://docs.astro.build/en/guides/markdown-content/>
- **Astro — Content Collections** — type-safe Markdown with a Zod schema. The right way to organize a blog. <https://docs.astro.build/en/guides/content-collections/>
- **React — Official documentation (react.dev)** — the best framework documentation on the web. Treat it as a textbook. <https://react.dev/learn>
- **React — Your First Component** — the entry point. Function components, JSX, what a component is. <https://react.dev/learn/your-first-component>
- **React — Passing Props to a Component** — props as the inputs to a function. <https://react.dev/learn/passing-props-to-a-component>
- **React — State: A Component's Memory** — `useState` introduced. <https://react.dev/learn/state-a-components-memory>
- **React — Synchronizing with Effects** — `useEffect` introduced. When to use it (rare!) and when not to. <https://react.dev/learn/synchronizing-with-effects>
- **React — You Might Not Need an Effect** — the chapter that prevents the most common React mistake. Read twice. <https://react.dev/learn/you-might-not-need-an-effect>
- **React — Rules of Hooks** — the two rules the linter enforces. <https://react.dev/reference/rules/rules-of-hooks>
- **ECMA-262 — ECMAScript Language Specification, §16 (Modules)** — the normative spec for `import` and `export`. Dense but the source of truth. <https://tc39.es/ecma262/#sec-modules>
- **WHATWG HTML Living Standard — §8.1 The HTML script element with `type="module"`** — the integration between ECMAScript modules and the browser. The module map algorithm lives here. <https://html.spec.whatwg.org/multipage/webappapis.html#integration-with-the-javascript-module-system>

## MDN reference (the friendly index)

- **MDN — JavaScript modules** — the friendly tour of `import`/`export`. Start here if the spec sections above are too dense. <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules>
- **MDN — `<script>` element** — every attribute, including `type="module"`, `defer`, `async`, `nomodule`. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script>
- **MDN — `import` statement** — every form (named, default, namespace, side-effect, dynamic). <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import>
- **MDN — `export` statement** — every form (named, default, re-export). <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export>
- **MDN — `import.meta`** — the module-local metadata object. Vite extends it with `import.meta.env` and `import.meta.hot`. <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta>
- **MDN — Dynamic imports** — `import(specifier)` returns a Promise; the canonical way to code-split. <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import>

## web.dev (Google's Web Fundamentals)

- **web.dev — Learn Performance** — a complete course on web performance. The first six modules apply directly to a Vite/Astro build. <https://web.dev/learn/performance>
- **web.dev — Core Web Vitals** — the three metrics Google uses to grade real-world performance. LCP, INP, CLS. <https://web.dev/articles/vitals>
- **web.dev — The cost of JavaScript in 2023** by Addy Osmani — the most-cited modern piece on why JavaScript bundle size matters. <https://web.dev/articles/the-cost-of-javascript-in-2023>
- **web.dev — Reduce JavaScript payloads with tree shaking** — what tree shaking is, when it works, when it does not. <https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking>
- **web.dev — Reduce JavaScript payloads with code splitting** — the case for dynamic `import()`. <https://web.dev/articles/reduce-javascript-payloads-with-code-splitting>
- **web.dev — Defer non-critical CSS** — the CSS counterpart to JS code splitting. <https://web.dev/articles/defer-non-critical-css>
- **web.dev — Patterns for building JavaScript websites in 2022** — the survey piece that named the "islands" pattern at scale. <https://web.dev/articles/rendering-on-the-web>

## The bundler family tree

- **Browserify (2011)** — the first CommonJS-to-browser bundler. Largely historical now, but the project page reads like a primer on what a bundler does. <https://browserify.org/>
- **webpack** — still the dominant bundler at large companies. The "Concepts" section explains what every bundler does. <https://webpack.js.org/concepts/>
- **Rollup** — the bundler Vite uses for production. Tree shaking was popularized here. <https://rollupjs.org/introduction/>
- **Parcel** — the zero-config bundler. The "Production" docs are a useful comparison point with Vite. <https://parceljs.org/>
- **esbuild** — the Go-language bundler. The README's "Why is it fast" section is excellent engineering writing. <https://esbuild.github.io/faq/#why-is-esbuild-fast>
- **Turbopack** — the Rust-based bundler being built by Vercel (the company behind Next.js). Not in Vite, but worth knowing it exists. <https://turbo.build/pack>
- **Rolldown** — a Rust port of Rollup, in development to eventually replace Rollup in Vite for production builds. <https://rolldown.rs/>

## Bundle analysis

- **rollup-plugin-visualizer** — the npm package that emits a treemap of a Rollup (or Vite) build. The visual everyone uses to find bloat. <https://github.com/btd/rollup-plugin-visualizer>
- **Bundlephobia** — paste an npm package name; see its compressed size and dependency footprint. Use *before* you `npm install` something. <https://bundlephobia.com/>
- **Import Cost (VS Code extension)** — shows the bundle weight of each `import` inline as you type. <https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost>
- **Source Map Explorer** — analyze production bundles using their source maps. <https://github.com/danvk/source-map-explorer>

## React supporting reading

- **React — Quick Start** — the 10-minute speedrun through components, JSX, props, and `useState`. <https://react.dev/learn>
- **React — Thinking in React** — the design exercise: how to translate a mockup into a component tree. The canonical onboarding read. <https://react.dev/learn/thinking-in-react>
- **React — Render and Commit** — what React actually does on each state change. <https://react.dev/learn/render-and-commit>
- **React — Choosing the State Structure** — the rules for good `useState` shapes. <https://react.dev/learn/choosing-the-state-structure>
- **React — Lifting State Up** — the pattern for sharing state between siblings. <https://react.dev/learn/sharing-state-between-components>
- **React — Conditional Rendering** — `if`, ternary, `&&`, when each is the right tool. <https://react.dev/learn/conditional-rendering>
- **React — Rendering Lists** — `.map()`, the `key` prop, why React needs it. <https://react.dev/learn/rendering-lists>

## The history of the "build step"

- **"The case for ES modules in production"** by Florian Rappl (2022) — survey of where the bundler-vs-native-modules debate has landed. <https://florian.codes/blog/the-case-for-esm-in-production/>
- **"Why I am switching from Gulp to Vite"** by various authors — search; the genre is illustrative. Most of these posts cite the same three reasons (HMR speed, less config, native ESM).
- **"The State of JS"** annual survey — the year-over-year industry adoption data for build tools. Treat trends, not absolute numbers, as signal. <https://stateofjs.com/>

## Talks worth your time

- **Evan You — "Vite: Next Generation Frontend Tooling"** — the original Vite introduction talk. Twenty-five minutes. The "why" is best in his own words. <https://www.youtube.com/results?search_query=evan+you+vite+jsworld>
- **Fred K. Schott — "Astro: A new kind of static site generator"** — the introduction to the islands architecture. <https://www.youtube.com/results?search_query=fred+schott+astro>
- **Dan Abramov — "React for Two Computers"** — a deeper talk on what makes React's mental model different from a templating engine. <https://overreacted.io/static-as-a-server/>

## Useful blog posts (curated, all free)

- **Jason Miller — "Islands Architecture"** — the post that named the pattern. Short, conceptually clean, and the source of the term. <https://jasonformat.com/islands-architecture/>
- **Tom MacWright — "Eleventy vs Astro"** — a working developer's framework comparison. <https://macwright.com/2024/01/03/eleventy-vs-astro>
- **Chris Coyier — "What I like about Astro"** — short positive review with screenshots. <https://chriscoyier.net/2022/04/15/im-finally-trying-astro/>
- **Lin Clark / Mozilla Hacks — "ES modules: A cartoon deep-dive"** — the best illustrated explanation of how `import` actually works at the spec level. <https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/>
- **Lin Clark / Mozilla Hacks — "ES modules in Node.js 12, from experimental to release"** — adjacent; explains the CommonJS/ESM split. <https://hacks.mozilla.org/2019/04/es-modules-a-cartoon-deep-dive-with-node-js/>
- **Surma & Jake Archibald — "JavaScript module loading"** (HTTP 203 podcast / blog) — the developer-advocate take on module loading. <https://web.dev/articles/javascript-module-loading>

## Documentation for the dependencies you will install this week

- **`@astrojs/react`** — the integration that lets Astro render React components. <https://docs.astro.build/en/guides/integrations-guide/react/>
- **`@astrojs/mdx`** — the integration that adds `.mdx` support. <https://docs.astro.build/en/guides/integrations-guide/mdx/>
- **`react` and `react-dom`** — the React runtime; ships in two packages. <https://www.npmjs.com/package/react>
- **`rollup-plugin-visualizer`** — the bundle treemap plugin. <https://www.npmjs.com/package/rollup-plugin-visualizer>

## Specs cited this week

- **ECMA-262, §16 Modules** — the syntax. <https://tc39.es/ecma262/#sec-modules>
- **ECMA-262, §17 Modules — Semantics** — the algorithms (resolution, linking, evaluation). <https://tc39.es/ecma262/#sec-modules>
- **HTML Living Standard — Scripting** — `<script type="module">` integration. <https://html.spec.whatwg.org/multipage/scripting.html>
- **HTML Living Standard — Web application APIs — Integration with the JavaScript module system** — the module map. <https://html.spec.whatwg.org/multipage/webappapis.html#integration-with-the-javascript-module-system>
- **RFC 8246 — HTTP Immutable Responses** — relevant when discussing fingerprinted bundle filenames and `Cache-Control: immutable`. <https://www.rfc-editor.org/rfc/rfc8246>
- **RFC 8615 — Well-Known URIs** — relevant when configuring a deployed Astro site's `/.well-known/` paths. <https://www.rfc-editor.org/rfc/rfc8615>

---

If you read **only three things** this week, read:

1. **Vite — "Why Vite"** — five minutes; sets the mental model. <https://vitejs.dev/guide/why.html>
2. **Astro — "Astro Islands"** — ten minutes; the architecture you are about to build on. <https://docs.astro.build/en/concepts/islands/>
3. **React — "Your First Component" through "State: A Component's Memory"** — six chapters, an hour total. The vocabulary every React job interview will assume you have. <https://react.dev/learn>

Everything else here is reference. Return to it when the build does something surprising.
