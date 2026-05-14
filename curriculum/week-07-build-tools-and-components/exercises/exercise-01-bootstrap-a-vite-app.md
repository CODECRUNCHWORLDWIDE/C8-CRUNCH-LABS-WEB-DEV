# Exercise 1 — Bootstrap a Vite App

> Estimated time: 60–90 minutes. By the end you will have a working vanilla Vite project on your machine, you will understand what every file in the scaffold is for, you will have experienced HMR firsthand, and you will be able to read a `vite.config.js` file confidently.

---

## Goal

Scaffold a Vite project from the official template, walk the project structure, identify every generated file, run the dev server, modify a file, and observe Hot Module Replacement updating the page without a full reload. Then produce a production build and inspect the output.

---

## Prerequisites

- Node.js 20 or later installed (`node --version` reports v20 or higher). If not, install from <https://nodejs.org>.
- npm 10 or later (`npm --version` reports v10 or higher).
- A terminal — Terminal.app on macOS, Windows Terminal or PowerShell on Windows, your shell of choice on Linux.

---

## Step 1 — Scaffold the project

In your terminal, in a folder where you keep coding projects:

```bash
npm create vite@latest crunch-vite-tour -- --template vanilla
cd crunch-vite-tour
npm install
```

Three things to notice:

- `npm create vite@latest` runs the `create-vite` package directly without globally installing it. The `@latest` ensures you get the current version of the scaffolder.
- The `--` separator passes the following arguments to `create-vite` itself (npm would otherwise interpret them as its own flags). The `--template vanilla` flag picks the plain-JavaScript template — no framework, no TypeScript. Other templates: `react`, `react-ts`, `vue`, `svelte`, `lit`, `preact`, plus their `-ts` variants.
- `npm install` downloads the dependencies listed in `package.json` into a `node_modules/` folder. The first install takes 10–30 seconds.

---

## Step 2 — Inventory the files

Open the project folder in VS Code. List its contents:

```
crunch-vite-tour/
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── node_modules/
├── public/
│   └── vite.svg
└── src/
    ├── counter.js
    ├── javascript.svg
    ├── main.js
    └── style.css
```

Open each file and write down, in your own notes, what you think each one does. The expected answers — check against your notes:

- **`index.html`** — the HTML entry point. Vite reads it, finds the `<script type="module">`, and walks the module graph from there. **This file lives at the project root, not in `public/`.** That is unusual and deliberate; see Lecture 1, §10.
- **`package.json`** — the npm manifest. Lists dependencies (`vite` in `devDependencies`) and the scripts (`npm run dev`, `npm run build`, `npm run preview`).
- **`package-lock.json`** — the exact version graph npm resolved. Commit this; it makes installs reproducible.
- **`node_modules/`** — the installed packages. **Never commit this.** The default `.gitignore` excludes it.
- **`public/vite.svg`** — a static asset. Anything in `public/` is served at the URL root with no transformation: `public/vite.svg` is reachable at `http://localhost:5173/vite.svg`.
- **`src/main.js`** — the JavaScript entry. Referenced by `index.html` via `<script type="module" src="/src/main.js">`. Imports the other source files.
- **`src/counter.js`** — a sample module exporting a `setupCounter` function. Demonstrates ES-module exports.
- **`src/style.css`** — the global stylesheet. Imported from `main.js` with `import "./style.css"`.
- **`src/javascript.svg`** — another asset. Imported from `main.js` as a URL (`import javascriptLogo from "./javascript.svg"`); Vite resolves the import to the asset's final URL.

---

## Step 3 — Run the dev server

In the project folder:

```bash
npm run dev
```

You should see output similar to:

```
  VITE v5.x.x  ready in 312 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open <http://localhost:5173/> in your browser. You should see the default Vite logo + counter page.

Two things to verify:

1. **In the browser DevTools Network panel, refresh the page.** You should see *many* small JavaScript files being fetched (not one big bundle): `main.js`, `counter.js`, plus the dependency files Vite serves out of `node_modules/.vite/`. This is the "no bundling in dev" architecture from Lecture 1, §6.
2. **In the DevTools Sources panel, open `src/main.js`.** You should see your original source, not a minified or transformed version (well, you will see the JSX/TS transforms in templates that have them; vanilla JS will be untransformed).

---

## Step 4 — Experience HMR

With the dev server running, open `src/style.css` in VS Code. Find any color value — for example, the `--vite-color-link` custom property or a `color` rule. Change it. Save the file.

**Watch the browser. The color updates. The page does not reload.** No flicker, no scroll-to-top, no loss of any state. That is HMR.

Now do the same in `src/main.js`. Change the text content of the counter button. Save. The button updates. (Depending on the exact change, Vite may "edit-reload" the whole module's effect — in vanilla JS without an HMR `accept` hook, Vite does a full page reload for unstructured JS changes. The CSS HMR is more visibly preserved.)

If you have time: look at the browser DevTools Console. With every save, Vite logs an HMR update message (`[vite] hot updated: /src/style.css`) — that is the WebSocket message from Lecture 1, §9 in action.

---

## Step 5 — Read `package.json`

Open `package.json`:

```json
{
  "name": "crunch-vite-tour",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

Things to internalize:

- **`"type": "module"`** — tells Node.js to treat `.js` files in this project as ES modules. Without it, `import` syntax in a `.js` file would fail when Vite or any tool runs it under Node. With it, `import` is the default and `require` is the exception.
- **`"private": true`** — prevents `npm publish` from accidentally publishing this project to the npm registry. Always present for application projects; absent for library projects.
- **`scripts.dev` runs `vite`** — the Vite CLI binary, installed in `node_modules/.bin/`. npm runs it from there without requiring a global install.
- **`scripts.build` runs `vite build`** — the production build.
- **`scripts.preview` runs `vite preview`** — a small server that serves the `dist/` folder as it would be served in production. Useful for testing the build output before deploy.

---

## Step 6 — Produce a production build

Stop the dev server (Ctrl-C in the terminal). Then:

```bash
npm run build
```

You should see output similar to:

```
vite v5.x.x building for production...
✓ 5 modules transformed.
dist/index.html                  0.46 kB │ gzip: 0.30 kB
dist/assets/index-Be8AnZw5.css   1.25 kB │ gzip: 0.68 kB
dist/assets/index-DLB3D8B6.js    1.78 kB │ gzip: 0.91 kB
✓ built in 318ms
```

Open the `dist/` folder. Notice:

- **`dist/index.html`** — the same HTML you started with, rewritten so the script and stylesheet tags point at the fingerprinted asset URLs.
- **`dist/assets/index-Be8AnZw5.css`** — your CSS, minified, with a content hash in the filename. The hash changes if the content changes; clients can cache it indefinitely (RFC 8246-style immutable caching).
- **`dist/assets/index-DLB3D8B6.js`** — your JavaScript, bundled (Rollup did this), tree-shaken, minified, with a content hash.

The hash in the filename is the **fingerprint**. Servers can serve `dist/` with a `Cache-Control: public, max-age=31536000, immutable` header — one year, immutable — because if the content changes, the URL changes, so the cache is automatically invalidated. This pattern is the cornerstone of modern web performance.

Preview the production build:

```bash
npm run preview
```

The preview server (on a different port — usually 4173) serves the `dist/` folder. Open the URL it prints. The page should look identical to the dev mode, but DevTools' Network panel should now show **one CSS file and one JS file** rather than many module files.

---

## Step 7 — Add a `vite.config.js`

Create a new file at the project root:

```javascript
// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,        // change the dev-server port
    open: true,        // open the browser when starting
  },
  build: {
    sourcemap: true,   // emit source maps in production
    outDir: "dist",    // (default; explicit for clarity)
  }
});
```

Stop the dev server and re-run `npm run dev`. The dev server now starts on port 3000, and your default browser opens to it automatically.

Rebuild (`npm run build`) and notice the `dist/assets/index-*.js.map` files — those are the source maps. The Vite docs at <https://vitejs.dev/config/> list every option.

---

## Reflection questions

Write a short answer to each in your notes. There are no automated graders; the act of writing the answer is the exercise.

1. Why does Vite serve many small JavaScript files in dev but bundle them into one in production?
2. What is in `node_modules/.vite/deps/`? Why does that directory exist? (Hint: look at Lecture 1, §6 — the "pre-bundling" step Vite runs once on first dev-server start.)
3. What is the difference between `public/` and `src/` for static assets? When would you put a file in each?
4. Why does the production build's CSS file have a hash in its name?
5. If you change the line `<title>Vite + Vanilla JS</title>` in `index.html`, do you need to restart the dev server, or does HMR update the title bar without a refresh? Try it and explain the answer.
6. What does the `"type": "module"` field in `package.json` change about how Node.js interprets the project's JavaScript files?

---

## Stretch (optional)

- Install the **`vite-plugin-inspect`** package (`npm install -D vite-plugin-inspect`), add it to your `vite.config.js`, and visit `/__inspect/` while the dev server is running. The plugin shows every transformation Vite applies to every file — useful when something surprising happens to a build.
- Try the `--template react` scaffolder in a new folder. Note the differences in `package.json` (the new `react`, `react-dom`, and `@vitejs/plugin-react` dependencies) and in the project shape (`.jsx` files, a `main.jsx` entry).
- Read the **Vite "Build for Production"** docs at <https://vitejs.dev/guide/build.html>. Pay attention to the section on `build.rollupOptions.output.manualChunks`.

---

## Done when

- [ ] You can scaffold a Vite project with one command and run it.
- [ ] You can name every file in the default scaffold and explain its role.
- [ ] You have observed HMR update the browser without a full reload.
- [ ] You have produced a production build and inspected the `dist/` folder.
- [ ] You have answered the six reflection questions in your notes.
