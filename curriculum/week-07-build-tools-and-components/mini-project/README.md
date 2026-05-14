# Week 7 — Mini-Project: A 4-Page Astro Site with One React Island

> The week's deliverable. A four-page site built with Astro, with one React-powered interactive island, that ships under 50 KB of compressed JavaScript total, deploys to a free static host (Vercel, Netlify, or Cloudflare Pages — your choice), and passes basic Lighthouse audits without performance work.

---

## The brief

You will build a small public site that **could plausibly be a developer portfolio's MVP**. The site has four pages connected by a single shared layout, one piece of real interactivity (the React island), and a credible content shape. You will not invent the design from scratch — a minimum visual is fine — but the site should be coherent, accessible, and fast.

By Sunday, the site is deployed to a public URL. You will share the URL in your portfolio repo's README.

---

## Functional requirements

The site has **exactly four pages**, each a separate file under `src/pages/`:

1. **`index.astro`** — **Home.** A hero section, a short bio, and a list of three to five recent projects (titles + one-sentence descriptions). Static; ships zero JavaScript.

2. **`about.astro`** — **About.** A longer biographical section. Static; ships zero JavaScript.

3. **`projects.astro`** — **Projects.** A list of projects (six or more), each with title, description, link, and one or two tags. **This page contains the React island** — a search/filter widget that filters the project list as the user types. The widget hydrates with `client:visible`.

4. **`contact.astro`** — **Contact.** A few paragraphs describing how to get in touch. May include a `mailto:` link, a social links list, or a static form pointing at a third-party form service (e.g. Formspree's free tier — optional). No client JavaScript required.

All four pages share a single layout (`src/layouts/BaseLayout.astro`) with:

- A `<head>` with title, description, viewport meta, and a favicon.
- A header with the site name and a navigation menu listing the four pages.
- A `<main>` with `<slot />`.
- A footer with copyright and a link to the site's source repository.
- Global CSS using custom properties (carry forward from Week 2's design tokens).

---

## Non-functional requirements

**Accessibility.**

- Every page passes the **W3C HTML validator** (no errors). <https://validator.w3.org/>
- Every page passes **axe DevTools** (no critical or serious issues). <https://www.deque.com/axe/devtools/>
- Every interactive element is keyboard-reachable. The React island's search input is labeled, focusable, and operates with the keyboard alone.
- The layout has a **skip-to-content link** as the first focusable element.
- Color contrast meets WCAG 2.2 AA (4.5:1 for body text, 3:1 for large text).

**Performance.**

- Total JavaScript shipped on the homepage: **under 5 KB compressed** (essentially Astro's island loader; no React on this page).
- Total JavaScript shipped on the projects page (with the React island): **under 50 KB compressed** including React + ReactDOM + the component.
- The page passes Lighthouse Performance with a score of **90+** on a "Mobile Slow 4G" run.

**Build and deploy.**

- The site builds successfully (`npm run build` exits 0).
- The site is deployed to a public URL.
- The repo includes a `README.md` describing how to run the site locally and the deployed URL.

---

## Project structure (suggested)

```
my-portfolio/
├── astro.config.mjs
├── package.json
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── README.md
└── src/
    ├── components/
    │   ├── Card.astro
    │   ├── Header.astro                    (optional — extract from BaseLayout)
    │   ├── Footer.astro                    (optional — extract from BaseLayout)
    │   └── ProjectFilter.jsx               (the React island)
    ├── data/
    │   └── projects.js                     (a JavaScript module exporting the project array)
    ├── layouts/
    │   └── BaseLayout.astro
    └── pages/
        ├── index.astro
        ├── about.astro
        ├── projects.astro
        └── contact.astro
```

Putting the project data in `src/data/projects.js` (rather than inline in `projects.astro`) makes it reusable across pages. The home page can `import projects from "../data/projects.js"` and show the first three; the projects page can show them all.

---

## Implementation guide

### Day 1 — Friday: scaffold and shared layout

Scaffold the project, build `BaseLayout.astro` with header/footer/nav, build `Header` and `Footer` as separate components (optional but recommended). Make sure navigation works: clicking a nav link goes to the right page.

### Day 2 — Saturday: pages and content

Build all four pages. Get the static content written and rendered. Resist the urge to over-style; structure first, decoration after. Add the projects data file.

### Day 3 — Sunday morning: the React island

Add the `@astrojs/react` integration. Build `ProjectFilter.jsx` based on your Exercise 3 `FilteredList` component. Embed it on `projects.astro` with `client:visible`. Verify the hydration deferral in DevTools.

### Day 3 — Sunday afternoon: polish, audit, deploy

Run Lighthouse on the deployed site (or `npm run preview` locally). Fix any issues that surface. Run axe DevTools on every page. Validate every page with the W3C HTML validator. Deploy.

---

## The React island spec

`ProjectFilter.jsx` receives the projects array as a prop. It renders:

- A search `<input type="search">` labeled "Filter projects."
- A "Filter by tag" set of checkboxes (one per unique tag across all projects).
- A live count of matching projects.
- The filtered list of projects, each rendered with title, description, link, and tags.
- An empty state ("No matches") when zero projects match.

Filtering is the AND of (a) the search query (case-insensitive substring match against title or description, debounced 200 ms) and (b) the set of checked tags (a project must have at least one of the checked tags, or no tags can be checked to ignore the tag filter).

The component owns no global state. It receives the project list as a prop; the parent Astro page provides it. The component uses `useState` for the query, the debounced query, and the set of checked tags. It uses `useEffect` only for the debounce timer. It uses `useMemo` for the derived filtered list.

The component is accessible:

- Every input has a `<label>` with a matching `htmlFor`.
- The result count is in an `aria-live="polite"` region so screen readers announce changes.
- The empty state is in `role="status"` so screen readers announce it without interrupting.

---

## Style guide

You are not required to match a specific design. Suggested constraints:

- **Maximum content width** of 64 rem (1024 px). Center the content.
- **Typography:** a system font stack. No web fonts this week (they cost a request and a layout shift; we'll revisit fonts in C8 W9).
- **Color palette:** two to four colors, sourced from your Week 2 design tokens. Verify contrast.
- **Spacing scale:** stick to multiples of 0.25 rem. Resist the temptation to use 13 different gap values.
- **No CSS framework.** No Tailwind, no Bootstrap. Vanilla CSS with custom properties.

---

## Deployment

Three free options, in order of recommendation for an Astro site:

**Option 1 — Vercel.** Push the project to a GitHub repo. Sign in to <https://vercel.com> with GitHub. Click "Add New → Project." Pick the repo. Vercel detects Astro automatically. Click "Deploy." Two minutes later you have a public URL like `my-portfolio-abc123.vercel.app`. Subsequent pushes to `main` redeploy automatically.

**Option 2 — Netlify.** Similar flow at <https://app.netlify.com>. The "Sites" → "Add new site" → "Import an existing project" path. Build command `npm run build`, publish directory `dist`. Free tier is generous.

**Option 3 — Cloudflare Pages.** Sign in to <https://dash.cloudflare.com>. Pages → "Create a project." Connect GitHub repo. Build command `npm run build`, output directory `dist`. Cloudflare's CDN is among the best.

All three are free for personal projects, all three have generous bandwidth, all three auto-deploy on `git push`. Pick one and move on.

---

## Submission and review

When the site is deployed:

1. Add the URL to your portfolio repo's `README.md`.
2. Add a "Built with" section listing Astro, Vite, React.
3. Run Lighthouse one final time. Screenshot the four-bar summary (Performance, Accessibility, Best Practices, SEO) and add it to the README.
4. Open a pull request against the `main` branch of your repo (even though you will merge it yourself). The PR description should include:
   - A one-paragraph summary of what you built.
   - The Lighthouse scores.
   - One specific thing you struggled with and how you resolved it.
   - One specific decision you would revisit if you had another week.

The pull-request shape forces you to articulate your work to yourself. The act is the assessment.

---

## Common pitfalls and how to avoid them

**1. Forgetting `client:visible` on the React component.** Without a `client:*` directive, Astro server-renders the component and ships zero JavaScript, so the search box does nothing. The fix is one word: add `client:visible` (or `client:load`) to the `<ProjectFilter />` JSX.

**2. Server/client hydration mismatch.** If your component uses `Date.now()`, `Math.random()`, or `localStorage` in its initial render, the server will produce different HTML than the client expects, and React will warn (in dev) or re-render from scratch (in prod). Move browser-only code into `useEffect` (which runs only on the client) or pass deterministic data as props.

**3. Imported file paths that look right but are wrong on case-sensitive deploys.** macOS's filesystem is case-insensitive by default; Linux (and most production deploys) are case-sensitive. `import Layout from "../layouts/baselayout.astro"` works locally and fails in production. Match the filename case exactly.

**4. Inline `<script>` blocks ship as separate JavaScript files.** A `<script>console.log("hi")</script>` in an Astro template gets extracted into a separate file. For one-off debug logs, this is fine; for ongoing functionality, prefer either an Astro `<script>` (which is processed) or a React island.

**5. Forgetting to set `site` in `astro.config.mjs`.** The `site` URL is used by sitemap, canonical-link, and RSS generators. Set it once early — `export default defineConfig({ site: "https://your-domain.example.com" })` — even if you don't deploy at that URL yet.

---

## Stretch (optional)

- **Add a fifth page** — a blog index — and write the first blog post as a Markdown file in `src/content/blog/`. Use Astro's content collections (`defineCollection` with a Zod schema).
- **Add View Transitions** for between-page navigation. One line in your layout (`<ViewTransitions />`) adds smooth animations on every link click.
- **Add a sitemap** with `@astrojs/sitemap`. Verify the generated file at `/sitemap-index.xml`.
- **Add an RSS feed** for the blog with `@astrojs/rss`. <https://docs.astro.build/en/recipes/rss/>

---

## Done when

- [ ] Four pages, each at its own route, sharing one layout.
- [ ] One React-powered interactive island on the projects page, hydrating with `client:visible`.
- [ ] Total JavaScript shipped under 50 KB compressed on the heaviest page.
- [ ] Every page passes the W3C HTML validator.
- [ ] Every page passes axe DevTools (no critical or serious issues).
- [ ] Lighthouse Performance score 90+ on the projects page (mobile, slow 4G).
- [ ] Site is deployed to a public URL.
- [ ] Repo README contains the deployed URL, the Lighthouse screenshot, and the PR write-up.
