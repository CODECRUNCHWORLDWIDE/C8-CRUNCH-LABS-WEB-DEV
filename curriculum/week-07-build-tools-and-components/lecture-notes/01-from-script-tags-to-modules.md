# Lecture 1 — From Script Tags to Modules: A Working History of the Front-End Build Step

> Reading time: ~45 minutes. Cite the **ECMA-262 §16 (Modules)** specification, the **HTML Living Standard §8.1 (Scripting)** integration, and the **Vite documentation** by section. The history matters not because we are nostalgic but because each tool's existence is the answer to a problem the previous tool could not solve. Knowing why tells you when to reach for which.

---

## 1. Why a build step exists at all

A web page is a tree of `<script>` tags pointing at JavaScript files served over HTTP. That is the contract. The browser fetches each script, parses it, and runs it. **Nothing about that contract requires a build step.** A page with `<script src="./main.js"></script>` runs perfectly well without webpack, Vite, Rollup, esbuild, or any of the tools we are about to discuss. The first 25 years of the web ran on exactly this shape, and your portfolio through Week 6 has been built on exactly this shape.

So what changed?

Three things, roughly in this order:

1. **Code volume grew.** A 1998 web page was ~10 KB of JavaScript. A 2008 web page was ~50 KB. A 2018 web page was often **over 1 MB** of JavaScript. As the volume grew, the cost of loading every file individually — one HTTP request per `<script>` tag — became prohibitive. Bundlers concatenate many source files into one (or a small handful of) output files, reducing request count and improving caching behavior.

2. **Languages diverged from what the browser runs.** TypeScript, JSX, SCSS, PostCSS, MDX, CoffeeScript (briefly, in 2011), Babel-flavored ES2018 (before the browser caught up), CSS modules, vendor-prefixed CSS — each is a source format the browser cannot run as-is. A **transformer** must translate the source into something the browser understands. That transformer is part of every modern build tool.

3. **Module systems happened.** The Node.js community standardized **CommonJS** modules in 2009 (`require("foo")` and `module.exports`). The TC39 committee shipped **ECMAScript modules** in **ES2015** (`import` and `export`). For most of the 2010s, neither module system worked natively in the browser. **Bundlers existed to bridge that gap** — to take a module graph defined with `require` or `import` and emit a single bundle the browser could load.

The first of those three is now partly obsolete (HTTP/2 multiplexing made many-small-requests cheap again). The second still applies (TypeScript and JSX are still source formats the browser cannot run directly). The third has flipped: **ECMAScript modules work natively in every modern browser** as of ~2018. A modern build tool — and this is the key thesis of the lecture — is a tool that uses the browser's native module support in development and packs the modules into chunks for production. **Vite is the canonical example.** We will spend the rest of the lecture justifying that sentence.

---

## 2. The pre-bundler era (1995–2010): script tags and globals

In the early web, JavaScript files communicated by polluting the global object.

```html
<!-- 2002 -->
<script src="jquery.js"></script>
<script src="jquery.validate.js"></script>
<script src="my-page-code.js"></script>
```

`jquery.js` defines a global `$`. `jquery.validate.js` extends the global `$` with a `validate()` method. `my-page-code.js` calls `$("#form").validate(...)`. The order of the `<script>` tags is the order of execution; if `my-page-code.js` is loaded before `jquery.js`, the page errors with `$ is not defined`. There is no way to express the dependency from the file itself; you express it by hand in the HTML.

This works at small scale and breaks at any other scale. The breakages are silent (a global is undefined; the page does nothing) or noisy (two scripts both define a global named `User`; the second one wins; bugs appear three pages downstream).

**The community's first response was a convention, not a tool.** It was the **Immediately Invoked Function Expression** (IIFE) pattern:

```javascript
(function () {
  // private variables and functions live here
  var version = "1.0.0";
  function helper() { /* ... */ }

  // expose just one thing to the global scope
  window.MyLibrary = {
    version: version,
    publicMethod: function () { /* ... */ }
  };
})();
```

The IIFE creates a function scope; everything inside it is private; only what you assign to `window` leaks out. This is the **module pattern** of the pre-2009 era. Every major library — jQuery, Underscore, Backbone — was published as an IIFE.

The IIFE solved the **encapsulation** problem (private variables) but not the **dependency** problem (which file goes first?). For dependencies, the answer remained "load order in HTML." This is the world the first generation of build tools was designed to fix.

---

## 3. Task runners: Grunt (2012) and Gulp (2013)

The first front-end build tools were not bundlers. They were **task runners** — programs that ran a series of shell-like operations against a project (minify CSS, concatenate JS, compile SCSS, copy files to a `dist/` folder).

**Grunt** (launched 2012, by Ben Alman) used a JSON-like configuration file (`Gruntfile.js`) where you registered tasks declaratively. A typical Grunt config from 2013 looked like:

```javascript
// Gruntfile.js — 2013 vintage
module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      dist: {
        src: ["src/header.js", "src/jquery.js", "src/main.js"],
        dest: "dist/bundle.js"
      }
    },
    uglify: {
      dist: { src: "dist/bundle.js", dest: "dist/bundle.min.js" }
    },
    sass: {
      dist: { files: { "dist/style.css": "src/style.scss" } }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-sass");

  grunt.registerTask("default", ["concat", "uglify", "sass"]);
};
```

**Gulp** (launched 2013, by Eric Schoffstall) used a stream-based, code-first API:

```javascript
// gulpfile.js — 2014 vintage
const gulp = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass");

gulp.task("scripts", function () {
  return gulp.src("src/*.js")
    .pipe(concat("bundle.js"))
    .pipe(uglify())
    .pipe(gulp.dest("dist"));
});

gulp.task("styles", function () {
  return gulp.src("src/*.scss")
    .pipe(sass())
    .pipe(gulp.dest("dist"));
});

gulp.task("default", ["scripts", "styles"]);
```

Both tools concatenated files in a defined order. Neither understood JavaScript modules. **The order was still expressed by the developer**, in the config file rather than in the HTML. The tools made the build deterministic but did not understand the *meaning* of the code; they just shuffled files around.

You may still encounter Grunt and Gulp in older codebases. They are not the wrong tool for every job; they are the wrong tool for **most** new front-end work in 2026, because they do not handle modules. Read them if you find them; do not start a new project with them.

---

## 4. Bundlers: Browserify (2011), webpack (2012), Rollup (2015), Parcel (2017)

The bundler is the tool that understands modules. The first browser-targeting bundler was **Browserify**, launched in 2011 by James Halliday. Browserify let you write `require("foo")` in a browser script — the Node.js syntax — and would produce a single bundle that resolved every `require` call at build time.

```javascript
// 2014: a Browserify entry file
var $ = require("jquery");
var validate = require("jquery-validate");

$(document).ready(function () {
  $("#form").validate({ /* ... */ });
});
```

`browserify entry.js > bundle.js` produced a single `bundle.js` you could include with one `<script>` tag. **No more load-order bugs.** No more globals. Files declared their own dependencies.

**webpack** launched in 2012 (by Tobias Koppers) with a more ambitious thesis: **everything is a module** — JavaScript, CSS, images, fonts, JSON, even HTML. You could `import` a CSS file from JavaScript; webpack would extract it, process it (running PostCSS, SASS, or a loader of your choice), and emit it as a separate stylesheet or inline it into the JavaScript. Webpack's "loader" architecture made it infinitely extensible and infinitely complex.

A minimal 2018-era webpack config:

```javascript
// webpack.config.js
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.jsx?$/, exclude: /node_modules/, use: "babel-loader" }
    ]
  }
};
```

Webpack dominated the bundler ecosystem for most of the 2010s. Create React App, Vue CLI, the Angular CLI, and Next.js all used webpack under the hood for years. Its market share was over 80% at peak. Its weaknesses — slow cold starts, expensive rebuilds on every save, configuration complexity — became the opening that Vite would walk through.

**Rollup** launched in 2015 (by Rich Harris) with a narrower thesis: a bundler optimized for **ES modules** specifically, with **tree shaking** as a first-class feature. "Tree shaking" is the bundler's ability to drop unused exports from the final bundle: if your code imports `{ map }` from a 50-function utility library, Rollup ships only `map`. The optimization requires that the source code be authored in static `import`/`export` syntax (which is statically analyzable), not the dynamic `require()` syntax of CommonJS.

Rollup became the bundler of choice for **library** authors (the static analysis pays off most when shipping reusable code). Webpack remained the bundler of choice for **application** authors (the loader ecosystem and configurability won). Most major JavaScript libraries — React, Vue, Three.js, D3 — have shipped Rollup-built distributions for years.

**Parcel** launched in 2017 (by Devon Govett) with a zero-config thesis: point Parcel at an `index.html` and it figures out the rest. Parcel was the first major bundler to abandon explicit configuration for most projects. Vite would later adopt the same philosophy.

---

## 5. esbuild (2020) — the speed inflection

In 2020, **Evan Wallace** released **esbuild**, a JavaScript bundler written in **Go**. The README's claim was that esbuild was **100× faster** than its JavaScript-written predecessors. The benchmark numbers, reproducible from the project's GitHub repository, were not exaggerated: a bundle that took webpack ~30 seconds took esbuild ~0.3 seconds.

The "Why is esbuild fast?" section of the esbuild documentation at <https://esbuild.github.io/faq/#why-is-esbuild-fast> is excellent engineering writing. The short answer is four things:

1. **Native code.** Go compiles to a native binary; JavaScript bundlers run on Node.js and pay for JIT warm-up, garbage collection, and interpreted-then-compiled overhead.
2. **Parallelism.** esbuild uses all cores of the machine. Most JavaScript bundlers run single-threaded.
3. **Minimal allocations.** esbuild avoids creating intermediate objects (an AST node tree, a token stream) where possible; it streams.
4. **A single integrated tool.** esbuild parses, transforms, bundles, minifies, and emits in one pass. Other tools chain several separate processes (TypeScript compiler → Babel → webpack → terser), each with its own parse-and-emit cost.

esbuild did not displace webpack overnight. Its plugin ecosystem was smaller, its TypeScript support was incomplete in early versions, and large codebases had webpack-specific configs that would not transfer. But esbuild raised the **speed expectation** of the ecosystem, and that pressure was what made Vite possible.

---

## 6. Vite (2020) — what we actually use

**Vite** (pronounced "veet" — French for "fast") was released in 2020 by Evan You. Its core insight was that **the bundler does not need to bundle in development.** Every modern browser supports native ECMAScript modules via `<script type="module">`. The browser can resolve `import` statements directly, fetching each module file as a separate HTTP request. With HTTP/2 multiplexing, the cost of those requests is small. **Vite's dev server serves the source files directly, transforming them on demand.**

What "transforming on demand" means in practice:

- A request for `/src/App.jsx` arrives at the dev server.
- The server reads `App.jsx` from disk.
- esbuild transforms the JSX into plain JavaScript (~5 ms for a typical file).
- The server rewrites bare specifiers (`import React from "react"`) into URLs Vite can resolve (`import React from "/node_modules/.vite/deps/react.js"`).
- The transformed code is served to the browser.

The browser sees a plain `<script type="module">` and a tree of `import` statements; it fetches each module; Vite transforms each on the way out the door. There is no "bundle the whole project" step in dev. **A 10,000-file project starts in under a second** because Vite only transforms the files the browser asks for.

Production is different. The browser cannot fetch 10,000 individual module files efficiently (HTTP/2 helps, but per-request overhead is still real, and the lack of inter-module optimizations — tree shaking across the graph — is significant). For production, Vite delegates to **Rollup**, which produces optimized chunked bundles. The dev server is fast and unbundled; the production build is fast (esbuild for transform) and bundled (Rollup for output).

The architecture, in three lines:

| Mode  | Transform | Bundle      |
|-------|-----------|-------------|
| Dev   | esbuild   | None — native ESM in the browser |
| Prod  | esbuild   | Rollup      |

The Vite documentation at <https://vitejs.dev/guide/why.html> presents this same architecture in its own words. Read that page before Tuesday.

---

## 7. ECMAScript modules: the contract underneath

Before we go further, let's pin down what a module **is**. The spec is **ECMA-262 §16 (Modules)** and **§17 (Modules — Semantics)**. The HTML integration is **HTML Living Standard §8.1 (Scripting)** and the module-map section under "Integration with the JavaScript module system."

A **module** is a file with at least one `import` or `export` statement. The module has:

- **Its own scope.** Variables declared at the top level of a module are not globals. Two modules can both declare `const config = {...}` without colliding.
- **Strict mode by default.** No `with` statements; no octal literals; no implicit globals.
- **A module record.** The runtime maintains an internal record of every module that has been loaded: its source code, its dependencies, its resolved state.
- **Static `import` and `export` statements at the top level.** These are syntax, not function calls. The runtime can analyze them before running the module's body.

The forms of `import` and `export` you should know cold:

```javascript
// Named exports
export const PI = 3.14159;
export function add(a, b) { return a + b; }

// Default export (one per module)
export default function () { /* ... */ }

// Re-export from another module
export { someFunction } from "./helpers.js";

// Named import
import { add } from "./math.js";

// Default import
import myFn from "./math.js";

// Combined
import myFn, { add, PI } from "./math.js";

// Namespace import (everything as an object)
import * as Math from "./math.js";

// Side-effect-only import (run the module for its effects, ignore exports)
import "./polyfill.js";

// Dynamic import (returns a Promise; code-split-friendly)
const module = await import("./lazy.js");
```

The **specifier** in an `import` statement — the string after `from` — has three categories:

1. **Relative specifier.** Begins with `./` or `../`. Resolved relative to the importing module's URL. `import "./helper.js"` looks for `helper.js` in the same directory.
2. **Absolute specifier.** Begins with `/`. Resolved relative to the site root. `import "/lib/helper.js"` looks for `/lib/helper.js` on the server.
3. **Bare specifier.** No leading `/` or `./`. `import React from "react"`. **The browser cannot resolve a bare specifier on its own** — there is no built-in package registry. The bundler resolves bare specifiers by walking `node_modules/`. The browser specification permits an **import map** (`<script type="importmap">`) that maps bare specifiers to URLs, but most projects let the bundler handle the resolution.

A fourth category, **URL specifiers** (`import { html } from "https://esm.sh/lit-html"`), works natively in browsers but is rare in production projects (network latency and version pinning concerns).

When Vite transforms a module for the dev server, it rewrites bare specifiers into resolved URLs the browser can fetch directly. This is what enables the "no bundling in dev" architecture: the browser asks for `App.jsx`, gets a transformed version with bare specifiers rewritten, asks for each of those next, and so on. The module graph unrolls one fetch at a time.

---

## 8. The HTML module integration

You have used `<script type="module">` casually in earlier weeks. Here is what the spec says it does (HTML Living Standard §8.1).

A `<script type="module">` tag:

1. **Is deferred by default.** The browser does not execute it until the document has finished parsing. There is no need to write `<script type="module" defer>` — `defer` is implied.
2. **Is fetched with CORS.** Cross-origin module loads require CORS headers (`Access-Control-Allow-Origin`) on the response. This is stricter than classic scripts, which can be loaded cross-origin without CORS (but execute opaque-ly).
3. **Triggers the module map algorithm.** The browser maintains a **module map** — a cache keyed by URL of every module that has been loaded. If the same URL is imported twice, the second import returns the same module instance; the source is parsed and the body executed only once.
4. **Resolves relative specifiers against the script's URL.** `import "./helper.js"` from `https://example.com/lib/main.js` resolves to `https://example.com/lib/helper.js`.
5. **Runs in strict mode** and has its top-level scope **isolated**. Top-level `this` is `undefined`, not `window`.

A few minor traps:

- `<script type="module">` cannot use `document.write()` (the spec disallows it).
- A module with a syntax error fails silently in the browser console — silent, that is, until you read the error message there; the page does not error visibly.
- Modules can use **top-level `await`**, a feature added to the spec in 2022. `import db from "./db.js"; await db.connect();` is legal at the top of a module file. The module's evaluation pauses until the await settles. Use sparingly; top-level await delays *every* module that imports this one.

---

## 9. Hot Module Replacement, demystified

The single most-loved feature of modern dev tools is **Hot Module Replacement** (HMR). The premise: you save a file; the browser updates without losing the page's state (form input, selected tab, scroll position).

The mechanism, in Vite specifically:

1. The dev server watches the filesystem.
2. When `App.jsx` changes, the server identifies the affected modules from the import graph.
3. The server sends a WebSocket message to the page: "module `/src/App.jsx` updated; here is the new source."
4. The page's HMR runtime, injected by Vite, replaces the old module's exports with the new ones.
5. If the changed module subscribes to HMR explicitly — via `import.meta.hot.accept(callback)` — it runs the callback to re-render. Otherwise, the runtime propagates up the import graph until it finds an "accepting" module.

The HMR API, in code:

```javascript
// src/state.js
export const counter = { value: 0 };

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // The new module replaces this one. Migrate state here.
    newModule.counter.value = counter.value;
  });
}
```

In React and Vue and Astro, you almost never write this code directly. The framework integration (Vite's `@vitejs/plugin-react`, Astro's built-in HMR) handles it. You just save the file and watch the component re-render with state preserved.

The Vite HMR docs at <https://vitejs.dev/guide/api-hmr.html> describe every method on `import.meta.hot`. Skim them once; treat the framework integrations as the production interface.

**HMR vs live reload.** Live reload (the Live Server extension's behavior) refreshes the whole page when a file changes. HMR replaces individual modules without a refresh. The difference matters most in forms (a live reload loses what you typed; HMR preserves it) and in stateful UIs (a multi-step form's current step survives an HMR update).

---

## 10. The project shape Vite gives you

Run `npm create vite@latest my-app -- --template vanilla` and you get this shape:

```
my-app/
├── index.html                 ← entry point
├── package.json
├── vite.config.js             ← optional configuration
├── public/                    ← static assets served as-is
│   └── vite.svg
└── src/
    ├── main.js                ← the JS entry, referenced from index.html
    ├── style.css
    └── counter.js
```

Three things about this shape that surprise developers from a webpack background:

1. **`index.html` is at the root, not in `public/`.** Vite treats `index.html` as the **entry point**. Vite reads it, finds the `<script type="module" src="/src/main.js">` tag, and walks the import graph from there. This is unusual and load-bearing: the HTML file is part of the build graph, which means Vite can transform it (inject preload links for code-split chunks, fingerprint asset URLs).

2. **`public/` serves static assets unchanged.** Anything in `public/` is served at the root URL with no transformation. `public/robots.txt` becomes `/robots.txt`. `public/img/logo.png` becomes `/img/logo.png`. The directory exists because there are some assets you do *not* want fingerprinted (favicons, social-media share images, well-known files).

3. **No `webpack.config.js`-equivalent is required.** `vite.config.js` is optional. If you do not create one, Vite uses sensible defaults. When you do create one, it looks like this:

```javascript
// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: {
    sourcemap: true,
    rollupOptions: {
      output: { manualChunks: { vendor: ["lodash-es", "date-fns"] } }
    }
  }
});
```

The `defineConfig` wrapper is for TypeScript intellisense; it does nothing at runtime. The `base` option matters if you deploy under a subpath (`/my-app/` instead of `/`). The `build.rollupOptions` escape hatch lets you reach the Rollup config when Vite's defaults are not enough.

The Vite docs' "Project Structure" page at <https://vitejs.dev/guide/#index-html-and-project-root> explains every file in the scaffold. Read it once on Monday.

---

## 11. `import.meta.env` and the environment-variable model

The other Vite feature you will use immediately is **environment variables exposed at build time**.

```javascript
// src/main.js
console.log(import.meta.env.MODE);        // "development" or "production"
console.log(import.meta.env.DEV);         // true in dev, false in build
console.log(import.meta.env.PROD);        // false in dev, true in build
console.log(import.meta.env.VITE_API_URL); // anything from .env starting with VITE_
```

Vite reads `.env` files (`.env`, `.env.local`, `.env.production`, etc.) at build time and inlines variables that start with `VITE_` into the source. Everything else is filtered out so secrets that leak into `.env` cannot accidentally ship to the browser. The Vite docs at <https://vitejs.dev/guide/env-and-mode.html> document the precedence rules.

Compare this to the Apps Script `cc-api-keys-url.js` pattern you have used through Week 6: that pattern hard-codes the URL into the source. The Vite approach lets the URL differ between dev and prod without editing the source. We are not switching the C8 portfolio over to environment variables yet — that is a Week 8 conversation when the portfolio starts hitting real APIs — but the mechanism is here.

---

## 12. What you have not had to learn (and probably never will)

Two things that take 30 minutes here that used to take a week.

### TypeScript and JSX in a vanilla project

In a webpack project circa 2018, enabling TypeScript was a three-day project: install `typescript`, install `ts-loader`, write a `tsconfig.json`, configure the webpack loaders in the right order, debug the cases where the loader chain emitted JavaScript that the next loader did not understand, write declaration files for every untyped dependency, and so on. In Vite:

```bash
npm create vite@latest my-app -- --template react-ts
```

Done. TypeScript and JSX both work. The transformer is esbuild; the type-checking is a separate `tsc --noEmit` you run before commit (Vite does **not** type-check by default — it strips types and trusts you to type-check separately, which is faster).

### Source maps

A source map is a JSON file that the browser uses to map a line in the compiled output back to a line in the source. Webpack required configuration to emit source maps; webpack often emitted source maps that were broken (the line numbers were off by a few; the variable names were minified). In Vite, source maps are on by default in dev, configurable in prod (`build.sourcemap: true`), and accurate. The DevTools "Sources" panel shows your original source even though the browser ran the transformed bundle.

---

## 13. A short comparison table

| Year  | Tool        | Role               | Status in 2026                                |
|------:|-------------|--------------------|-----------------------------------------------|
| 2011  | Browserify  | CommonJS bundler   | Largely historical                            |
| 2012  | Grunt       | Task runner        | Legacy; still in CMS / WordPress ecosystems   |
| 2012  | webpack     | Module bundler     | Production-grade; still dominant at Meta, large enterprises |
| 2013  | Gulp        | Task runner        | Legacy; surviving in design-system pipelines  |
| 2015  | Rollup      | ESM bundler        | Production; what Vite uses for prod builds    |
| 2017  | Parcel      | Zero-config bundler| Niche; production-ready but smaller community |
| 2020  | esbuild     | Fast bundler/transformer | Used internally by Vite, tsup, Bun, etc.|
| 2020  | Vite        | Dev server + builder | **The default choice for new projects in 2026** |
| 2022  | Turbopack   | Rust bundler (by Vercel) | In Next.js dev mode; production not yet stable as of early 2026 |
| 2024  | Rolldown    | Rust port of Rollup | In development; will replace Rollup in Vite when ready |

When you see a job listing that says "Experience with modern build tools — webpack, Vite, or similar," it means: **you should be able to read and modify a config, you should be able to add a plugin, you should know what HMR is, you should know what tree shaking is, you should know what code splitting is.** This lecture is the entry point to all of those.

---

## 14. What to take away

Three things.

**One.** A modern build tool is not a magic black box. It is a transformer (esbuild, in Vite's case) plus a bundler (Rollup, in Vite's production case) plus a dev server with HMR. Each piece does one thing. You can read the source of all three; the codebases are well-organized.

**Two.** ECMAScript modules are the contract underneath. `import` and `export` are spec syntax. The browser implements them. The build tool's job is to make modules work the way the spec describes, while adding the optimizations (tree shaking, code splitting, asset fingerprinting) the spec does not address.

**Three.** Vite is not the last tool you will use, but it is a faithful representation of where the field has converged. Learning Vite teaches you concepts that transfer to every tool that comes after: a dev server using native modules, a transformer for non-JavaScript inputs, a production bundler optimized for ES modules, an HMR protocol. The names will change; the architecture will not.

Now go scaffold a Vite app, walk through the project shape, and read [`exercise-01-bootstrap-a-vite-app.md`](../exercises/exercise-01-bootstrap-a-vite-app.md).

---

## Further reading

- Vite — "Why Vite" — <https://vitejs.dev/guide/why.html>
- Vite — Features reference — <https://vitejs.dev/guide/features.html>
- esbuild — "Why is esbuild fast?" — <https://esbuild.github.io/faq/#why-is-esbuild-fast>
- Lin Clark — "ES modules: A cartoon deep-dive" — <https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/>
- ECMA-262 §16 (Modules) — <https://tc39.es/ecma262/#sec-modules>
- HTML Living Standard §8.1 (Scripting), module integration — <https://html.spec.whatwg.org/multipage/webappapis.html#integration-with-the-javascript-module-system>
- Tom Dale — "Compilers are the new frameworks" (a foundational essay) — <https://tomdale.net/2017/09/compilers-are-the-new-frameworks/>
