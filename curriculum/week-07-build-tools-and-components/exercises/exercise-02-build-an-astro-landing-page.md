# Exercise 2 — Build an Astro Landing Page

> Estimated time: 90–120 minutes. By the end you will have a working Astro project on your machine, one shared layout, two pages (home + about), one reusable component, and you will know how file-based routing works in practice.

---

## Goal

Scaffold an Astro project. Build a homepage and an about page that both use a shared `BaseLayout`. Build a reusable `Card` component for project entries. Practice the frontmatter / template split. Read your build output to confirm Astro shipped only static HTML (no JavaScript by default).

---

## Prerequisites

- Exercise 1 complete (you have Node 20+, npm 10+, and you understand the Vite project shape — Astro builds on Vite).

---

## Step 1 — Scaffold the project

```bash
npm create astro@latest crunch-astro-tour
cd crunch-astro-tour
```

The Astro scaffolder asks several questions interactively. Answer them as follows:

- **How would you like to start?** → "Include sample files" (or "Empty" — either is fine).
- **Install dependencies?** → Yes.
- **Initialize a git repo?** → Yes (we will commit as we go).
- **Use TypeScript?** → No (or "Relaxed" if you want JSDoc — we'll use plain JS this week).

When it finishes, start the dev server:

```bash
npm run dev
```

You should see:

```
  astro  v4.x.x ready in 412 ms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

Open <http://localhost:4321/>. The default Astro page loads.

---

## Step 2 — Inventory the files

The default scaffold looks roughly like this:

```
crunch-astro-tour/
├── astro.config.mjs
├── package.json
├── tsconfig.json            (present even without TS — Astro uses it internally)
├── public/
│   └── favicon.svg
└── src/
    ├── assets/
    │   ├── astro.svg
    │   └── background.svg
    ├── components/
    │   └── Welcome.astro
    ├── layouts/
    │   └── Layout.astro
    └── pages/
        └── index.astro
```

Compare with the Vite scaffold from Exercise 1. The major differences:

- **`src/pages/`** — Astro's routing root. Every file here becomes a URL.
- **`src/layouts/`** — a convention for shared page wrappers. Not magic; just a folder name Astro recommends.
- **`src/components/`** — a convention for reusable `.astro` (or `.jsx`, `.vue`, `.svelte`) components.
- **`astro.config.mjs`** — like `vite.config.js` but for Astro. The `.mjs` extension explicitly marks the file as an ES module.

Open `src/pages/index.astro`. Notice the frontmatter fence (`---`) at the top, the imports, and the JSX-like template. This is the structure described in Lecture 2.

---

## Step 3 — Build a shared `BaseLayout`

Open `src/layouts/Layout.astro` (or create one at `src/layouts/BaseLayout.astro`). Replace its contents with:

```astro
---
// src/layouts/BaseLayout.astro
const { title = "Crunch Web Portfolio", description = "Web development portfolio." } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <nav aria-label="Primary">
        <a href="/" class="site-name">Crunch Portfolio</a>
        <ul role="list">
          <li><a href="/">Home</a></li>
          <li><a href="/about/">About</a></li>
        </ul>
      </nav>
    </header>

    <main id="main">
      <slot />
    </main>

    <footer class="site-footer">
      <p>&copy; {new Date().getFullYear()} Your Name. Built with Astro.</p>
    </footer>

    <style is:global>
      :root {
        --c-bg: #ffffff;
        --c-fg: #16161a;
        --c-muted: #64748b;
        --c-accent: #2563eb;
        --max-width: 64rem;
        --space: 1rem;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      }
      * { box-sizing: border-box; }
      body { margin: 0; color: var(--c-fg); background: var(--c-bg); line-height: 1.5; }
      a { color: var(--c-accent); }
      .skip-link {
        position: absolute; left: -9999px;
      }
      .skip-link:focus {
        position: static; padding: 0.5rem 1rem; background: var(--c-fg); color: var(--c-bg);
      }
      main { max-width: var(--max-width); margin: 0 auto; padding: 2rem var(--space); }
      .site-header, .site-footer {
        max-width: var(--max-width); margin: 0 auto; padding: 1rem var(--space);
      }
      .site-header nav { display: flex; justify-content: space-between; align-items: center; }
      .site-header ul { list-style: none; display: flex; gap: 1.5rem; padding: 0; margin: 0; }
    </style>
  </body>
</html>
```

What is interesting here:

- The component declares two props (`title`, `description`) with defaults. The parent page can override either.
- `<slot />` is the canonical "child content goes here" element (HTML Living Standard, the `<slot>` element).
- The `<style is:global>` block applies its CSS to the whole document, not just this component. Astro scopes styles by default; `is:global` opts out. Use sparingly — for layout-level rules only.

---

## Step 4 — Build the homepage

Replace `src/pages/index.astro` with:

```astro
---
// src/pages/index.astro
import BaseLayout from "../layouts/BaseLayout.astro";

const projects = [
  { slug: "todo", title: "Todo with persistence", description: "A todo app whose state survives reloads. Built in plain JS for Week 4." },
  { slug: "weather", title: "Weather Dashboard", description: "Three-city weather. Async/await, error states. Week 8." },
  { slug: "form", title: "Multi-step Signup Form", description: "Three steps, ten fields, accessible inline errors. Week 6." },
];
---

<BaseLayout title="Crunch Portfolio — Home" description="A student web-development portfolio.">
  <section class="hero">
    <h1>Hello, I am building things on the web.</h1>
    <p class="lede">
      This portfolio is the running deliverable of <a href="https://github.com/CODECRUNCHWORLDWIDE">Code Crunch Worldwide's</a> C8 web-development curriculum.
      Each project below was shipped at the end of a course week.
    </p>
  </section>

  <section class="projects" aria-labelledby="projects-heading">
    <h2 id="projects-heading">Recent projects</h2>
    <ul role="list" class="project-list">
      {projects.map((project) => (
        <li class="project">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </li>
      ))}
    </ul>
  </section>

  <style>
    .hero h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }
    .lede { color: var(--c-muted); max-width: 50ch; }
    .projects { margin-top: 3rem; }
    .project-list { list-style: none; padding: 0; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); }
    .project { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
    .project h3 { margin: 0 0 0.25rem; }
    .project p { margin: 0; color: var(--c-muted); }
  </style>
</BaseLayout>
```

Save. The browser reloads. You should see the new homepage with three project cards.

---

## Step 5 — Build the about page

Create `src/pages/about.astro`:

```astro
---
// src/pages/about.astro
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="About — Crunch Portfolio" description="About the author.">
  <h1>About</h1>
  <p>
    I am a student at <a href="https://www.codecrunchworldwide.org">Code Crunch Worldwide</a>'s open-source web-development academy.
    This site is built with <a href="https://astro.build">Astro</a> and styled with custom-property CSS.
  </p>

  <h2>What this site is</h2>
  <p>
    Four pages of static HTML, built at deploy time, with one small React-powered
    interactive island. Total JavaScript shipped to the browser: under 50 kilobytes
    compressed. Total HTML and CSS: a few kilobytes each.
  </p>

  <h2>What I am learning</h2>
  <ul>
    <li>Semantic HTML, modern CSS, and accessible interaction patterns.</li>
    <li>JavaScript modules, build tools (Vite, esbuild, Rollup), and the trade-offs each represents.</li>
    <li>Component-thinking, with Astro for static composition and React for the interactive bits.</li>
  </ul>
</BaseLayout>
```

Navigate to <http://localhost:4321/about/>. The page loads. Notice the URL: `/about/` (with a trailing slash by default, configurable in `astro.config.mjs`). The nav link in the header now matches; the back button works because each navigation is a real page load.

---

## Step 6 — Extract the project card into a component

Inside `src/pages/index.astro`, the project items are inline. Extract them into a reusable component.

Create `src/components/Card.astro`:

```astro
---
// src/components/Card.astro
const { title, description, href } = Astro.props;
---

<article class="card">
  {href ? (
    <h3><a href={href}>{title}</a></h3>
  ) : (
    <h3>{title}</h3>
  )}
  <p>{description}</p>
</article>

<style>
  .card { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
  .card h3 { margin: 0 0 0.25rem; }
  .card p { margin: 0; color: var(--c-muted); }
</style>
```

Update `src/pages/index.astro` to use it:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Card from "../components/Card.astro";

const projects = [
  { slug: "todo", title: "Todo with persistence", description: "..." },
  { slug: "weather", title: "Weather Dashboard", description: "..." },
  { slug: "form", title: "Multi-step Signup Form", description: "..." },
];
---

<BaseLayout title="Crunch Portfolio — Home">
  <section class="hero">
    <h1>Hello, I am building things on the web.</h1>
  </section>

  <section class="projects" aria-labelledby="projects-heading">
    <h2 id="projects-heading">Recent projects</h2>
    <ul role="list" class="project-list">
      {projects.map((project) => (
        <li><Card title={project.title} description={project.description} /></li>
      ))}
    </ul>
  </section>

  <style>
    .project-list { list-style: none; padding: 0; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); }
  </style>
</BaseLayout>
```

Save. The page should render identically — but now the card markup lives in one place.

---

## Step 7 — Produce the production build

Stop the dev server. Run:

```bash
npm run build
```

Output similar to:

```
  ▶ Collecting build info...
  ▶ Building static entrypoints...
  ▶ Building dynamic entrypoints...
  ✓ Completed in 1.23s.

  ▶ Bundling assets...
  ✓ Completed in 0.45s.

   building client (vite)
   ✓ built in 612ms

  ▶ Routing
  ┃ /
  ┃ /about/

  ✓ Completed in 0.18s.

  Result (2 pages):
  - /index.html (gzip: 1.3 KB)
  - /about/index.html (gzip: 0.9 KB)
```

Open the `dist/` folder. Notice:

```
dist/
├── index.html
├── about/
│   └── index.html
├── favicon.svg
└── _astro/
    └── <a few hashed asset files>
```

There is **no `client.js`**. There is **no React bundle**. The pages are pure HTML. That is the islands architecture's promise made concrete: zero JavaScript by default.

Open `dist/index.html` in a text editor. You will see:

- The full HTML you wrote, with all the `{expressions}` resolved.
- The CSS from your `<style>` blocks, inlined into a `<style>` tag in `<head>` (Astro inlines small stylesheets; large ones are split into separate files).
- A small `<link rel="modulepreload">` or `<link rel="stylesheet">` for any extracted asset.

Preview it locally:

```bash
npm run preview
```

Open <http://localhost:4321/>. The site looks identical to dev. Now open DevTools' Network tab and refresh. Confirm: **only HTML, CSS, and the favicon are fetched.** No JavaScript files.

---

## Step 8 — Add a third page

Create `src/pages/contact.astro`. Reuse `BaseLayout`. Add a few paragraphs. Add a link to it in `BaseLayout.astro`'s nav.

This step is intentionally open-ended. Decide what should be on a contact page that ships zero JavaScript. (A static mailto link? An embedded form whose `action` posts somewhere?) For this exercise, a static page is sufficient; we will revisit forms-with-action in Week 8.

---

## Reflection questions

1. The path `src/pages/about.astro` maps to the URL `/about/`. What URL would `src/pages/blog/2026/may.astro` map to?
2. Why does Astro put the homepage at `dist/index.html` and the about page at `dist/about/index.html` (rather than `dist/about.html`)? (Hint: search "Astro trailingSlash" — the answer involves URL conventions and CDN routing.)
3. The `<style>` block at the bottom of `index.astro` only affects elements in that page, but the `<style is:global>` in `BaseLayout.astro` affects every page. How does Astro implement this?
4. If you renamed `src/layouts/BaseLayout.astro` to `src/layouts/SiteShell.astro`, what would break? Walk through the import statements.
5. In the project's production build, count the bytes of HTML + CSS + JavaScript shipped for a single homepage view. (Hint: gzipped HTML + CSS only; there is no JavaScript yet.) Why is this number an order of magnitude smaller than a default Next.js page?
6. Could you reproduce this site without Astro — just hand-writing two HTML files? What would you lose?

---

## Stretch (optional)

- Add a fourth page that lists blog posts. Add two Markdown files under `src/pages/blog/` with frontmatter. Read the Astro docs on Markdown at <https://docs.astro.build/en/guides/markdown-content/>.
- Configure `astro.config.mjs` to set `site: "https://my-portfolio.example.com"`. Then enable the sitemap integration: `npx astro add sitemap`. Rebuild and find the generated `sitemap-index.xml` and `sitemap-0.xml` files.
- Read the Astro **Content Collections** guide at <https://docs.astro.build/en/guides/content-collections/>. If you intend to grow this site to a blog with more than five posts, content collections are the right shape.

---

## Done when

- [ ] Your Astro project has a homepage and an about page sharing a layout.
- [ ] You have extracted at least one reusable `.astro` component.
- [ ] You can produce a production build and confirm zero JavaScript is shipped.
- [ ] You have answered the six reflection questions in your notes.
