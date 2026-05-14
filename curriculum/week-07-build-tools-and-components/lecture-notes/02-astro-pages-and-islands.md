# Lecture 2 — Astro Pages and Islands: File-Based Routing and Partial Hydration

> Reading time: ~40 minutes. Cite the **Astro documentation** by section, the **HTML Living Standard** for any platform behavior, and **Jason Miller's "Islands Architecture"** (2019) for the term's origin. This lecture is the bridge between vanilla Vite and a real multi-page site. By the end you will know what an `.astro` file is, why "ship zero JavaScript by default" is a design stance and not just a slogan, and when an island is the right hammer.

---

## 1. The framework's one-sentence pitch

Astro renders pages to static HTML at build time and ships **zero JavaScript by default**. When a region of the page needs JavaScript, you mark that region as an **island**, and Astro generates the hydration code for just that region. The rest of the page stays plain HTML.

That is the entire framework. Everything else — content collections, MDX, View Transitions, the integration system — is convenience around the same core. The Astro documentation phrases it almost identically at <https://docs.astro.build/en/concepts/why-astro/>; we are not paraphrasing creatively, we are matching the docs.

The contrast worth holding in your head:

- A **Next.js** page (the React framework) ships, by default, the React runtime, your component tree as JavaScript, and a hydration step that wires interactivity into the rendered HTML. Even a static blog post page ships a non-trivial amount of JavaScript.
- An **Astro** page ships, by default, **nothing** — no runtime, no framework code, just HTML and CSS. The same blog post page is plain HTML. If you embed a comment widget that needs JavaScript, only the comment widget ships JavaScript. The rest of the page is inert (in the good sense: it cannot break, cannot be slow, and cannot be uninteractive — because there is no script).

For a portfolio, a documentation site, a marketing landing page, a blog, or a small e-commerce catalog — the categories most students of this course are building — Astro is often the right tool. For an interactive application like a spreadsheet or a chat client, it is not. We will draw that line carefully in §11.

---

## 2. The `.astro` file format

An `.astro` file has two parts separated by a frontmatter fence — three dashes (`---`) at the top:

```astro
---
// This is JavaScript. It runs at BUILD time, on the Astro server.
// Anything declared here is available to the template below.
const name = "Crunch Web Portfolio";
const posts = await fetch("https://api.example.com/posts").then(r => r.json());
const greeting = `Hello, ${name}`;
---

<!-- This is the template. It looks like JSX but is plain HTML
     with {expressions} where you'd interpolate values. -->
<html lang="en">
  <head>
    <title>{name}</title>
  </head>
  <body>
    <h1>{greeting}</h1>
    <ul>
      {posts.map((post) => (
        <li><a href={`/posts/${post.slug}`}>{post.title}</a></li>
      ))}
    </ul>
  </body>
</html>
```

The frontmatter runs **at build time**. The variables it declares are interpolated into the template. **Nothing in the frontmatter ships to the browser unless you explicitly import it into a `<script>` block.** A `fetch()` in the frontmatter runs on Astro's server, the response gets baked into the static HTML, and the browser sees only the rendered list of posts — no `fetch`, no client-side data fetching, no loading spinner.

This is the part that confuses developers coming from React: in a React component, code runs in the browser at request time (or at server-render time if you use SSR). In an Astro component, the frontmatter runs on Astro's machine when you run `npm run build`, and the result is a static HTML file. **If you want code to run in the browser, you must explicitly say so** — by adding a `<script>` tag in the template, or by importing a React/Vue/Svelte component and marking it as an island.

A second example, with the template features that distinguish `.astro` from raw HTML:

```astro
---
// Frontmatter: imports, data, helper functions.
import Layout from "../layouts/BaseLayout.astro";
import Card from "../components/Card.astro";

const items = [
  { title: "Vite", url: "https://vitejs.dev" },
  { title: "Astro", url: "https://astro.build" },
  { title: "React", url: "https://react.dev" },
];

// Props: this component receives a `pageTitle` from its parent.
const { pageTitle = "Default Title" } = Astro.props;
---

<Layout title={pageTitle}>
  <h1>{pageTitle}</h1>

  <!-- JSX-like attribute interpolation -->
  <p class={items.length > 0 ? "list-populated" : "list-empty"}>
    {items.length} items
  </p>

  <!-- Mapping over an array -->
  <ul>
    {items.map((item) => (
      <li><Card title={item.title} url={item.url} /></li>
    ))}
  </ul>

  <!-- Conditional rendering with the && pattern -->
  {items.length === 0 && <p>No items yet.</p>}

  <!-- A scoped style block — styles only apply to this component -->
  <style>
    h1 { font-size: 2rem; }
    .list-empty { color: var(--c-muted, gray); }
  </style>

  <!-- A client-side script (runs in the browser) -->
  <script>
    console.log("This runs in the browser, not at build time.");
  </script>
</Layout>
```

A few things worth knowing:

- **Attribute interpolation uses `{}` like JSX**, not `{{}}` like Vue or Handlebars.
- **Top-level `await` is supported** in the frontmatter — the page wait for it during build.
- **The `<style>` block is scoped to the component by default.** Astro injects a hashed class name into your elements so a `h1` rule inside one component does not leak to another. Use `<style is:global>` to opt out. This is the same approach Vue's SFCs took and that web components do with shadow DOM, but Astro implements it with build-time class hashing.
- **The `<script>` block runs in the browser** — Astro emits it as a separate module that the browser fetches. It does not have access to the frontmatter variables; pass data via `data-*` attributes on a DOM element instead.

---

## 3. File-based routing

Astro's router is the filesystem. The folder `src/pages/` is the routing root. Every file in it becomes a URL.

```
src/pages/
├── index.astro              → /
├── about.astro              → /about
├── projects.astro           → /projects
├── blog/
│   ├── index.astro          → /blog
│   ├── first-post.md        → /blog/first-post
│   └── second-post.mdx      → /blog/second-post
└── contact.astro            → /contact
```

There is **no routing config file**. There is no `app.get("/about", ...)`. The URL is the path.

Dynamic routes use bracket notation:

```
src/pages/
└── projects/
    └── [slug].astro         → /projects/:slug (any slug)
```

The `[slug].astro` file must export a `getStaticPaths()` function that returns every concrete path the dynamic route should generate at build time:

```astro
---
// src/pages/projects/[slug].astro
export async function getStaticPaths() {
  const projects = [
    { slug: "todo-app", title: "Todo App" },
    { slug: "weather-app", title: "Weather App" },
    { slug: "portfolio", title: "Portfolio v2" },
  ];

  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project }
  }));
}

const { project } = Astro.props;
---

<h1>{project.title}</h1>
```

`getStaticPaths` runs at build time. The three paths above produce three static HTML files: `dist/projects/todo-app/index.html`, `dist/projects/weather-app/index.html`, `dist/projects/portfolio/index.html`. The URLs are stable, the files are pre-rendered, the browser fetches HTML directly with no JavaScript involved.

Compare to a Node-based router (Express, Hono, Fastify), where you register a function for every route and the framework matches incoming requests against the registered routes. The Astro model bakes the routing decision into the filesystem at build time; the production server is just a static file host (or a CDN). Both models work; Astro's is dramatically simpler when the site fits the static-by-default shape.

The Astro routing docs at <https://docs.astro.build/en/basics/astro-pages/> are worth a single read.

---

## 4. Layouts and slots

The DRY (Don't Repeat Yourself) principle applies as much in HTML as anywhere else. Every page on your site shares a `<head>`, a header, a footer, a global stylesheet. Astro's pattern for this is the **layout**.

A layout is a regular `.astro` component with a `<slot />` in it:

```astro
---
// src/layouts/BaseLayout.astro
const { title = "Crunch Web Portfolio" } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <link rel="stylesheet" href="/global.css" />
  </head>
  <body>
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/projects">Projects</a>
      </nav>
    </header>

    <main>
      <slot />  <!-- child content lands here -->
    </main>

    <footer>
      <p>&copy; {new Date().getFullYear()} Your Name</p>
    </footer>
  </body>
</html>
```

A page uses it by importing the layout and wrapping its content:

```astro
---
// src/pages/about.astro
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="About — Crunch Web Portfolio">
  <h1>About me</h1>
  <p>I am learning to ship modern web applications.</p>
</BaseLayout>
```

The `<slot />` element is the same `<slot>` defined in the HTML Living Standard for Web Components (<https://html.spec.whatwg.org/multipage/scripting.html#the-slot-element>). Astro borrowed the name and the semantics deliberately. **Named slots** work the same way:

```astro
<!-- BaseLayout.astro -->
<header>
  <slot name="hero" />
</header>
<main>
  <slot />
</main>
```

```astro
<!-- about.astro -->
<BaseLayout>
  <h1 slot="hero">A big hero image</h1>
  <p>The main content (default slot).</p>
</BaseLayout>
```

Read **<https://docs.astro.build/en/basics/layouts/>** once. The pattern is small and load-bearing.

---

## 5. Component composition and props

Astro components compose. Inside a page, you can render other Astro components. Inside an Astro component, you can render React components (with the right integration; see §8). Inside a React component, you can render more React components. The composition rules are:

- Astro components can render Astro, HTML, and any framework component.
- Framework components (React, Vue, Svelte) can render their own framework's components and HTML, but **not** Astro components — Astro components only exist at build time and have no client-side equivalent.
- Astro can pass props to framework components, but those props must be **serializable** (no functions, no DOM nodes, no class instances) — Astro serializes them as JSON to ship across the build-time/run-time boundary.

Props in Astro look like this:

```astro
---
// src/components/Card.astro
interface Props {
  title: string;
  url: string;
  description?: string;
}

const { title, url, description } = Astro.props;
---

<article class="card">
  <h3><a href={url}>{title}</a></h3>
  {description && <p>{description}</p>}
</article>
```

The `interface Props` declaration is optional but recommended — Astro's TypeScript integration uses it for autocomplete on the parent's `<Card />` usage. The destructuring with `Astro.props` is the universal pattern; every Astro component reads its inputs this way.

---

## 6. Markdown and MDX

Astro's `src/pages/` directory accepts `.md` and `.mdx` files as routes alongside `.astro` files. A blog post can be written in Markdown and shipped without ever opening an Astro file:

````markdown
---
# src/pages/blog/first-post.md
layout: ../../layouts/PostLayout.astro
title: "Building my first Vite app"
pubDate: 2026-05-10
description: "Notes from scaffolding a Vite project for the first time."
---

This is my first blog post. The frontmatter above defines metadata
that the layout can read; the body is plain Markdown.

## A heading

Some **bold** text with `inline code` and a [link](https://vitejs.dev).

```javascript
// fenced code blocks become syntax-highlighted
console.log("hello");
```
````

The `layout:` field in the frontmatter tells Astro which layout to wrap the Markdown in. The layout receives the parsed Markdown as its slot content and the rest of the frontmatter as props:

```astro
---
// src/layouts/PostLayout.astro
const { frontmatter } = Astro.props;
---

<article>
  <h1>{frontmatter.title}</h1>
  <time datetime={frontmatter.pubDate}>{frontmatter.pubDate}</time>
  <slot />  <!-- the Markdown body lands here -->
</article>
```

`.mdx` is Markdown plus JSX — you can `import` components inside an `.mdx` file and use them inline:

```mdx
---
# src/pages/blog/with-charts.mdx
layout: ../../layouts/PostLayout.astro
title: "A post with an interactive chart"
---

import Chart from "../../components/Chart.jsx";

This is a Markdown blog post. Below the paragraph, an actual React
component renders inline:

<Chart client:visible data={[1, 2, 3, 5, 8, 13]} />

More Markdown after.
```

MDX requires the `@astrojs/mdx` integration (`npm install @astrojs/mdx` and add to `astro.config.mjs`). The docs at <https://docs.astro.build/en/guides/integrations-guide/mdx/> walk through setup.

When to use `.md`, `.mdx`, or `.astro`:

| File | Use when |
|------|----------|
| `.md` | Pure content. No interactivity. Most blog posts. |
| `.mdx` | Content with the occasional interactive component inline. Documentation pages with live code demos. |
| `.astro` | Anywhere a `.md` does not fit. Marketing pages, app shells, pages with non-content layout. |

---

## 7. Content collections

Astro 2.0 added **content collections** — type-safe Markdown with a Zod schema. The pattern is the right one for any site with more than five blog posts.

You declare the schema in `src/content/config.ts`:

```typescript
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  })
});

export const collections = { blog: blogCollection };
```

You place your posts under `src/content/blog/*.md`. Astro validates each post's frontmatter against the schema at build time — a typo in a date or a missing required field is a build error, not a runtime surprise.

You query the collection from a page:

```astro
---
// src/pages/blog/index.astro
import { getCollection } from "astro:content";

const posts = (await getCollection("blog", ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<ul>
  {posts.map((post) => (
    <li>
      <a href={`/blog/${post.slug}`}>{post.data.title}</a>
      <time datetime={post.data.pubDate.toISOString()}>
        {post.data.pubDate.toLocaleDateString()}
      </time>
    </li>
  ))}
</ul>
```

The docs at <https://docs.astro.build/en/guides/content-collections/> cover the full API. We are not using content collections in the Week 7 mini-project (four pages is too small for the abstraction to earn its keep) but you should know it exists; the moment you have ten or more pieces of content with structured frontmatter, it is the correct pattern.

---

## 8. Framework components (React, Vue, Svelte)

Astro can render components from React, Preact, Vue, Svelte, Solid, Lit, and AlpineJS. Each is an **integration** — an npm package you install and add to `astro.config.mjs`:

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [react()]
});
```

After the integration is added, any `.jsx` or `.tsx` file in your project is rendered by React. You import it into an Astro component like any other:

```astro
---
// src/pages/projects.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Counter from "../components/Counter.jsx";
---

<BaseLayout title="Projects">
  <h1>My Projects</h1>

  <!-- A React component, rendered on the server, NOT hydrated -->
  <Counter initial={0} />

  <!-- A React component, rendered AND hydrated on the client -->
  <Counter initial={5} client:load />
</BaseLayout>
```

The first `<Counter />` renders to HTML at build time (React runs server-side) and ships no client JavaScript — it is a static HTML snapshot. The second `<Counter client:load />` also renders at build time, but Astro additionally ships React, ReactDOM, and the component's source, and hydrates it in the browser as soon as the page loads.

**Hydration is the act of attaching event listeners and reactive state to already-rendered HTML.** It is the step that turns a static HTML snapshot of a React component into an interactive instance of the component. The hydration directives (`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`) control *when* hydration happens:

| Directive | Hydrate when |
|-----------|--------------|
| `client:load` | Page load, immediately. Use for above-the-fold interactivity. |
| `client:idle` | The browser hits `requestIdleCallback` (i.e., the main thread is idle). Use for nice-to-have interactivity below the fold. |
| `client:visible` | The component scrolls into the viewport (uses `IntersectionObserver`). Use for everything below the fold. |
| `client:media="(max-width: 768px)"` | The given media query matches. Use for mobile-only or desktop-only widgets. |
| `client:only="react"` | Skip server rendering entirely; render only in the browser. Use for components that depend on `window` or `document` from the start. |

The Astro Islands docs at <https://docs.astro.build/en/concepts/islands/> walk through each directive with examples. Read that page once on Tuesday or Wednesday.

The win is real and measurable: a marketing page with three interactive widgets ships ~5 KB of JavaScript per widget (the React runtime gets shared across all islands), not ~150 KB of JavaScript for the whole React app. The First Contentful Paint stays under a second on a 4G connection. Lighthouse scores stay in the 90s without performance work.

---

## 9. A worked example: a static page with one island

Putting the pieces together. We will build a project listing page with a search box that filters the list as you type — but only the search box ships JavaScript; the rest is static.

**File:** `src/components/ProjectSearch.jsx`

```jsx
// A React component. JSX. Two hooks.
import { useMemo, useState } from "react";

export default function ProjectSearch({ projects }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [projects, query]);

  return (
    <div className="project-search">
      <label htmlFor="project-search-input">Search projects</label>
      <input
        id="project-search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. weather, todo"
      />
      <ul>
        {filtered.map((p) => (
          <li key={p.slug}>
            <h3><a href={`/projects/${p.slug}`}>{p.title}</a></h3>
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p>No matches for "{query}".</p>}
    </div>
  );
}
```

**File:** `src/pages/projects.astro`

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import ProjectSearch from "../components/ProjectSearch.jsx";

const projects = [
  { slug: "todo-app", title: "Todo App", description: "A todo with persistence" },
  { slug: "weather", title: "Weather Dashboard", description: "Three-city weather" },
  { slug: "portfolio", title: "Portfolio v2", description: "This site, in fact" },
  { slug: "form-validator", title: "Form Validator", description: "Week 6 mini-project" },
];
---

<BaseLayout title="Projects">
  <h1>Projects</h1>
  <p>Each project ships as a small artifact in this portfolio.</p>

  <ProjectSearch projects={projects} client:visible />
</BaseLayout>
```

When Astro builds this page:

1. The React component renders on the server with `query = ""` (the initial state). The output is HTML — the input box, the unfiltered list, no "no matches" message.
2. The HTML is embedded in `projects.astro`'s output.
3. The page is written to `dist/projects/index.html` as static HTML.
4. Separately, Astro emits `dist/_astro/ProjectSearch.[hash].js` — the JavaScript bundle containing React + the component, ready to hydrate.

When the browser loads `/projects`:

1. The HTML arrives. The list renders immediately. **No JavaScript has executed yet.** The search box is in the DOM but does nothing.
2. As the user scrolls and the component enters the viewport, the `IntersectionObserver` fires. Astro fetches `ProjectSearch.[hash].js`. React hydrates the component, attaches the `onChange` handler, and the search box becomes interactive.

If the user never scrolls to the search box, **the JavaScript never loads.** That is the islands architecture, in concrete terms.

---

## 10. View Transitions (briefly)

Astro 3.0 added **View Transitions** — a wrapper around the [browser's View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API). With one line in your layout, navigation between Astro pages animates smoothly instead of full-page-reloading:

```astro
---
import { ViewTransitions } from "astro:transitions";
---
<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

We are not making heavy use of View Transitions this week — the four-page mini-project does not call for it — but you should know the feature exists. The Astro docs at <https://docs.astro.build/en/guides/view-transitions/> are the reference; the underlying browser API is at <https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API>.

The relevant trade-off: View Transitions are progressive — older browsers fall back to normal navigation. The animation is purely visual. It does not change what your application is or what JavaScript ships. Use sparingly; do not over-engineer.

---

## 11. When Astro is not the right tool

Astro is intentional about its boundaries. The framework's own documentation, at <https://docs.astro.build/en/concepts/why-astro/>, lists the cases it is **not** for:

- **Highly interactive single-page applications.** A spreadsheet, a chat interface, an in-browser code editor — anywhere the user spends most of their session on one page and the page is constantly updating — wants the SPA model, with one heavy initial JavaScript load and zero subsequent navigation. Astro's per-navigation full HTML load is wrong for that.
- **Real-time, stateful, multi-user surfaces.** A game lobby, a collaborative whiteboard, a live document editor — anything where the server pushes state to many clients simultaneously — needs a different architecture (WebSockets, server-sent events, a state-syncing library). You can *include* such a surface inside an Astro site as an island, but the architecture is not what Astro is optimizing for.
- **Apps with a hot product-feedback loop where build times matter more than runtime performance.** If you are A/B testing fifty variations a day, a rebuild-and-deploy cycle is slower than a client-rendered SPA's "edit and refresh" loop. The trade-off is real.

For everything else — landing pages, blogs, documentation sites, portfolios, marketing sites, small e-commerce — Astro is often the right tool. It ships less, breaks less, scores higher on Core Web Vitals, and the development experience is the simplest among the modern frameworks. **The C8 portfolio is in the right shape for Astro**; we are deliberately not switching it to Next.js, Remix, or SvelteKit, because the simpler tool is the correct tool here.

---

## 12. The MPA vs SPA distinction, made concrete

The Astro docs spend an entire page on this distinction at <https://docs.astro.build/en/concepts/mpa-vs-spa/>. The summary:

A **Multi-Page Application (MPA)** does a full page navigation on every link click. The browser fetches a new HTML document; the previous document is discarded; the new one is parsed and rendered. This is the default web; this is what every site did for the web's first 20 years; this is what Astro builds.

A **Single-Page Application (SPA)** does *not* do a full page navigation. The first request loads a JavaScript application; subsequent "navigations" are simulated — the URL changes via `history.pushState`, the JavaScript fetches data, the JavaScript re-renders the page contents. The browser never fetches a new HTML document. This is what Create React App, Vue's vanilla `vue create`, and historically Angular built.

Which is correct depends on the application:

| MPA (Astro, plain HTML, server-rendered Rails/Django) | SPA (Vue with vue-router, classic React with React Router) |
|---|---|
| First load fast. Per-navigation re-load. | First load slower. Per-navigation faster. |
| Full HTML by default; SEO-friendly trivially. | Has to handle SEO carefully; "view source" shows an empty `<div id="root">`. |
| State is in the URL or in the server. | State is in JavaScript; URL is a hint. |
| Refresh is free; back button is free. | Refresh re-bootstraps the app; back button needs JS routing. |

The 2010s consensus that "everything is an SPA" has reversed. The 2026 consensus is roughly "MPA by default; SPA only when the app shape demands it." Astro is in the middle of that reversal.

---

## 13. What to take away

Three things.

**One.** An Astro page is HTML at build time and HTML at runtime. The frontmatter is build-time JavaScript; the template is HTML with interpolated values; the output is static. The dev server adds HMR on top of this model so you can iterate as if it were dynamic.

**Two.** The islands architecture is the answer to "I want React for this widget but not for the whole site." You mark the widget `client:visible` and only that region ships JavaScript. The rest is plain HTML that cannot break and cannot be slow.

**Three.** File-based routing is a simplification, not a constraint. Every URL is a file; every file is a URL; dynamic routes use `[bracket]` syntax with `getStaticPaths`. The router is the filesystem; you cannot misconfigure something that is not configured.

Now read [`03-react-components-without-the-religion.md`](./03-react-components-without-the-religion.md) and then go scaffold the Astro project in [`exercise-02-build-an-astro-landing-page.md`](../exercises/exercise-02-build-an-astro-landing-page.md).

---

## Further reading

- Astro docs — "Why Astro" — <https://docs.astro.build/en/concepts/why-astro/>
- Astro docs — "Astro Islands" — <https://docs.astro.build/en/concepts/islands/>
- Astro docs — "MPA vs SPA" — <https://docs.astro.build/en/concepts/mpa-vs-spa/>
- Astro docs — Pages — <https://docs.astro.build/en/basics/astro-pages/>
- Astro docs — Components — <https://docs.astro.build/en/basics/astro-components/>
- Astro docs — Layouts — <https://docs.astro.build/en/basics/layouts/>
- Astro docs — Markdown and MDX — <https://docs.astro.build/en/guides/markdown-content/>
- Astro docs — Framework components — <https://docs.astro.build/en/guides/framework-components/>
- Jason Miller — "Islands Architecture" (2019, the term's origin) — <https://jasonformat.com/islands-architecture/>
- HTML Living Standard — `<slot>` element — <https://html.spec.whatwg.org/multipage/scripting.html#the-slot-element>
- MDN — View Transition API — <https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API>
