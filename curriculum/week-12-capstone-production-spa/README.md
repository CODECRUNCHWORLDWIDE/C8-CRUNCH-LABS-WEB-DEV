# Week 12 — Capstone: Production-Grade SPA, Shipped

> *Eleven weeks ago you wrote your first `<main>` tag and asked why the `<h1>` had to come before the `<h2>`. Last week you wrote a Playwright test that drives Chromium, Firefox, and WebKit through an OAuth 2.1 + PKCE flow and uploads a `trace.zip` to GitHub Actions when it fails. The distance between those two moments is the entire C8 track, compressed into a quarter, and the only thing left is to prove the trip happened. Week 12 is **the capstone** — one application, built and deployed by you, that exercises every skill from W1 through W11 in production. The deliverable is not a Codepen, not a localhost screenshot, and not a private repo with no CI. It is a **live URL** at a free hosting provider (Vercel or Netlify), backed by a public GitHub repo with a green CI badge, behind a custom path with security headers and an SPA-redirect rule, served at a Lighthouse score north of 90 on all four categories, authenticated against a real identity provider (Auth0 free tier, Keycloak Cloud, or GitHub OAuth), tested end-to-end by Playwright on every push, and writeable about in 600 words for a portfolio README that explains both what it does and how it was built. By Sunday you will have something to point at when an interviewer asks "what have you shipped lately" — and the answer will be a URL, not a screenshot.*

Welcome to the last week. The eleven weeks behind you were each a single concept, drilled until the muscle memory took hold: semantic markup, accessible CSS, responsive layout, modern JavaScript, the DOM and events, forms and validation, build tools and components, state and routing, performance and the Core Web Vitals, auth and identity, testing. Each week shipped a working artifact, but each artifact was scoped to a single concern. The capstone is the **integration test** — the proof that you can take the eleven concerns, weave them into a single application with consistent decisions, ship it past every linter and test gate in the pipeline, and operate it on a public URL that anyone with the link can load. The job market does not pay for the eleven artifacts. It pays for the integration.

There is a real **anti-pattern** in capstone weeks that this track refuses to honor: the *"clone the Twitter homepage"* capstone, where students copy a famous design, host it as a static site, and call it shipped. The exercise produces a portfolio piece with no original thinking, no architectural choices, no learning visible to the reviewer, and no defensible writeup. The opposite anti-pattern — *"build whatever you want, here is twelve weeks"* — is equally bad: students paralyze on choice, ship nothing, and arrive at Sunday with a half-finished idea and no URL. The capstone designed in this week splits the difference: **a curated menu of four project archetypes**, each scoped to fit a week, each requiring the full eleven-week stack, and each leaving room for a personal twist (your data, your domain, your color palette) that makes the resulting URL yours and not your classmate's. Pick one of the four. Build it for real. Ship it.

The five ideas that organize the capstone — and that you should be able to defend in a 10-minute portfolio walkthrough at the end of the week — are:

1. **Production is a different game than localhost.** The same code that scores 100 on Lighthouse at `localhost:5173` can score 62 at `your-spa.vercel.app`, and the cause is almost never "the code got worse." The cause is that production runs over HTTP/2 with TLS, behind a CDN with a geographically variable cache, serving real ad-block-style request mixes, against a real OAuth issuer with real round-trip latency, on real devices that the dev machine has never simulated. The mature engineer's habit is to **always test on the deployed URL**, not on localhost, before declaring a feature done. Vercel and Netlify both make the deployed URL free; you have no excuse not to use it.
2. **The deploy is part of the architecture.** Where the SPA lives, how its routes resolve, how it sets security headers, and how it handles a refresh on `/profile` (instead of `/`) are not "ops problems for later" — they are first-class architectural choices that determine whether the app works at all. A React SPA deployed without the SPA-fallback rewrite at the hosting layer will 404 on every route refresh; an SPA without a `Content-Security-Policy` header will silently allow any third-party script to read its tokens; an SPA without `Strict-Transport-Security` will be downgrade-attackable on a coffee-shop Wi-Fi. Free hosting (Vercel and Netlify both) gives you all of these in a configuration file. Use them.
3. **The repo is the resume.** A hiring manager who has 200 candidates and 20 minutes will not run `npm install` on your project. They will open the GitHub repo, glance at the README, click the live URL, hit Lighthouse, scroll the file tree to see the test folders, look for a green CI badge, and form a verdict in under 90 seconds. The technical work is necessary but not sufficient; the **README** must be excellent, the **live URL** must work on first click, the **CI badge** must be green, and the **commit history** must show real iteration (50+ commits over the week, not three force-pushed "final" commits). The writeup in `mini-project/README.md` walks through every one of these.
4. **Every week paid you a dividend; the capstone is the compounding.** W1 gave you the semantic skeleton; W2 gave you accessible styling on top of it; W3 made it work on a phone; W4 and W5 gave you the JavaScript and DOM layer; W6 added form validation; W7 introduced the bundler; W8 unlocked routing and state; W9 hardened the performance; W10 added auth; W11 wrapped it in tests. None of those are optional in the capstone. The rubric in `mini-project/starter/rubric.md` is explicit: each of the eleven weeks contributes between 5 and 10 points to the total of 100, and a submission missing any one week's contribution caps at 90.
5. **Shipped beats perfect.** The Pareto principle applies brutally to capstones: 80% of the value comes from 20% of the polish, and the last 20% of polish (animations, theme switcher, dark-mode parity, fancy 404 page, custom domain) almost never moves the portfolio needle. The advice from every senior engineer who has reviewed bootcamp work — Cassidy Williams, Chris Coyier, Sara Soueidan, Lin Clark, every one of them on record on their blog — converges on the same thing: **ship a small thing that works end-to-end** over **a big thing that almost works**. Pick the smaller of two ambitions on Monday and finish it on Sunday. There is no extra credit for a 70%-complete bigger app.

By Sunday the deliverable is one **live URL** on Vercel or Netlify, one **public GitHub repo** with a green CI badge, one **portfolio writeup** in the repo's `README.md`, and one **10-minute Loom or YouTube walkthrough** linked from the README. The grading rubric in `mini-project/starter/rubric.md` is graded against the live URL, not the local checkout. If `git clone` plus `npm install` plus `npm run dev` is the only way to see your work, the rubric scores zero on the deployment row, which puts the ceiling at 90. **Deploy early; deploy often.**

---

## Track wrap-up — what every week of C8 contributed

This is the integration sidebar. Use it as a self-checklist during the build week: every row below must be visibly present in the capstone repository. The right-hand column points at the specific file or fact your reviewer will look for.

| Week | Concept                                  | What the capstone must demonstrate                                                                                              | Where in the repo                                                  |
| ---- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| W1   | Semantic HTML and document outline       | Every page uses `<header>`, `<main>`, `<nav>`, `<footer>`. Exactly one `<h1>` per route. Skip-link in the `<body>`'s first child. | `index.html`, every route component                                |
| W2   | Modern CSS and accessibility             | Custom properties for theme tokens. Focus visible on every interactive element. WCAG AA contrast on text. No `outline: none`.   | `src/styles/`, the focus-visible CSS rules                         |
| W3   | Layout and responsiveness                | Flexbox or Grid for layout, never floats. Three breakpoints minimum. Mobile-first media queries. No horizontal scroll at 320px. | `src/styles/layout.css`, `<meta name="viewport">` in `index.html`  |
| W4   | Modern JavaScript                        | ES modules. `const`/`let`, never `var`. Strict equality. No global mutable state. Optional chaining where it pays for itself.   | All `.ts`/`.tsx` files; ESLint config catches violations           |
| W5   | DOM, events, and accessibility           | Keyboard reachable: every action available without a mouse. ARIA live region for status updates. No `onClick` on a `<div>`.      | The login, profile, and main-feature routes                        |
| W6   | Forms and validation                     | Native HTML validation as the baseline; JS validation on submit; accessible error messages tied to inputs via `aria-describedby`. | At least one real form route                                       |
| W7   | Build tools and components               | Vite as the bundler. Reusable components in a `components/` folder. CSS modules or scoped styles. No `<script>` tag in HTML.    | `vite.config.ts`, `src/components/`                                |
| W8   | State and routing                        | React Router (or your chosen client router) with 4+ routes. Shared state in a context or Zustand/Redux store, not prop-drilling. | `src/routes/`, `src/store/`                                        |
| W9   | Performance and Core Web Vitals          | Lighthouse mobile score 90+ on Performance, Accessibility, Best Practices, SEO. LCP under 2.5 s. No layout shifts on first load. | The deployed URL; CI runs Lighthouse on every PR                   |
| W10  | Authentication and identity              | Real OAuth 2.1 + PKCE against a real IdP (Auth0 free tier, GitHub, Keycloak Cloud). No password fields you wrote yourself.       | The login route, the auth library, the IdP config                  |
| W11  | Testing                                  | Vitest unit + component tests. Playwright e2e across at least Chromium and Firefox. CI gates merge on test failure.            | `tests/`, `.github/workflows/`, the green CI badge                 |
| W12  | Production deployment and writeup        | Live URL. Custom security headers. SPA-fallback rewrite. README with the track-wrap-up checklist completed. 10-minute walkthrough. | The deployed site, `vercel.json` or `netlify.toml`, `README.md`    |

Every row is a five-to-ten-point line on the rubric. Every missing row is points the reviewer must subtract.

---

## Learning objectives

By the end of this week, you will be able to:

- **Choose** a capstone scope from the four-archetype menu (task tracker, reading list, expense splitter, micro-CMS) and write a one-paragraph project brief that names the data model, the four routes, the auth provider, and the deploy target. Reference: <https://www.atlassian.com/agile/project-management/project-brief>.
- **Deploy** a Vite-built React SPA to **Vercel free tier** via the GitHub integration — push to `main`, Vercel detects the framework, runs `npm run build`, serves `dist/` on a `*.vercel.app` URL. Reference: <https://vercel.com/docs/frameworks/vite>.
- **Deploy** the same SPA to **Netlify free tier** as the alternative — `netlify.toml` declares the build command, the publish directory, and the redirects; the GitHub integration triggers a deploy on every push to `main`. Reference: <https://docs.netlify.com/frameworks/vite/>.
- **Configure** the SPA-fallback rewrite — on Vercel the `rewrites` block in `vercel.json` maps `/(.*)` to `/index.html`; on Netlify the `[[redirects]]` block with `from = "/*"` and `to = "/index.html"` and `status = 200`. Reference: <https://vercel.com/docs/projects/project-configuration#rewrites> and <https://docs.netlify.com/routing/redirects/rewrites-proxies/>.
- **Set** production-grade security headers — `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and a real `Content-Security-Policy` that allows your own origin and the IdP and nothing else. Reference: <https://owasp.org/www-project-secure-headers/>.
- **Audit** the deployed URL with Lighthouse — the report should show Performance, Accessibility, Best Practices, and SEO all 90+ on the mobile profile. Identify the top three improvement opportunities and apply at least the cheapest two. Reference: <https://developer.chrome.com/docs/lighthouse>.
- **Verify** the deployed URL against the four Core Web Vitals thresholds — LCP under 2.5 s, INP under 200 ms, CLS under 0.1, FCP under 1.8 s — using PageSpeed Insights and the field data from CrUX when available. Reference: <https://web.dev/articles/vitals>.
- **Wire** OAuth 2.1 + PKCE against a free hosted IdP — Auth0 free tier (7,000 active users), GitHub OAuth (unlimited public, free), or a Keycloak instance you self-host on Fly.io free tier or Render free tier. Configure the redirect URI for both `localhost:5173` and the production URL. Reference: <https://auth0.com/docs/quickstart/spa/react>.
- **Configure** the GitHub Actions CI workflow that gates the deploy — run Vitest, run Playwright, run a Lighthouse check on the preview URL, fail the workflow on any red status, and block the merge button on a failing required check. Reference: <https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/deploying-with-github-actions>.
- **Write** a portfolio README in the project repo that explains in 400 to 600 words what the project does, what stack it uses, how the live URL works, and how to run it locally — written for a hiring manager skimming, not for an engineer copy-pasting. Reference: <https://www.makeareadme.com/> and <https://github.com/matiassingers/awesome-readme>.
- **Record** a 10-minute Loom or unlisted YouTube walkthrough — first 2 minutes on the deployed product as a user, next 5 minutes on the repo structure and one architectural decision, last 3 minutes on what you would build next. Reference (recording etiquette): <https://www.loom.com/blog/how-to-record-a-good-video>.
- **Defend** the production architecture in a 15-minute portfolio review — be able to point at the live URL, the security headers (via `curl -I` or the browser network tab), the green CI badge, and the rubric checklist, and explain each choice in your own words.
- **Recognize** the capstone failure modes — scope creep (week 1: "I'll build a Twitter clone"), late deploy (week 6: "deploy on Sunday after everything is done"), brittle CI (CI uses `--no-verify` to bypass failing tests), shallow auth ("the login button is a `<a href="/profile">`"), and write commits that show real iteration rather than three "final" pushes.
- **Plan** the next four projects on the roadmap after C8 — a real-time chat app (introduces WebSockets), a PWA with offline support (introduces service workers), a static-export SSG (introduces Astro or Next.js), and a full-stack feature (introduces a backend and a database). Reference: <https://roadmap.sh/frontend>.

---

## Prerequisites

You finished **Weeks 1 through 11**. Concretely:

- A working Week 11 codebase with passing Vitest and Playwright tests on at least one machine.
- A GitHub account with `gh` CLI signed in. Public repos are free; private repos with Actions are free up to 2,000 minutes per month, which is more than enough for a capstone week.
- A free Vercel account (sign up with GitHub at <https://vercel.com>) **or** a free Netlify account (sign up with GitHub at <https://app.netlify.com>). Pick one for the capstone; you can switch later if you want.
- A free identity provider: Auth0 (sign up at <https://auth0.com>), or a registered GitHub OAuth App (free, unlimited at <https://github.com/settings/developers>), or a Keycloak instance you can self-host on a free tier.
- Node.js 20+ and npm 10+ on the path.
- A laptop with at least 8 GB of RAM (Playwright across three browsers in CI is fine, but locally the install plus the dev server plus VS Code plus a Lighthouse run can pinch under 8 GB).

If you did not finish Week 11, the starter under `mini-project/starter/` is a copy of the Week 11 ending state — Vitest, Playwright, MSW, and the Keycloak Docker compose file are already wired. Begin from there.

---

## Topics covered

- **Production vs. localhost.** Why the same code performs differently. The CDN cache. The geographic distribution of edge nodes. TLS handshake costs. HTTP/2 multiplexing and how it changes the bundler's job (no more "many small chunks" assumption — modern servers prefer fewer, larger chunks). The `User-Agent` distribution in real traffic vs. the single Chrome instance on your laptop. Reference: <https://web.dev/articles/optimizing-content-efficiency>.
- **Vercel free tier in 2026 — what you get.** 100 GB of bandwidth per month, unlimited static deployments, 100 hours of serverless function invocations, automatic preview URLs for every PR, custom domains, automatic SSL via Let's Encrypt, and a clean log viewer. The platform-as-a-service category leader for SPAs. Reference: <https://vercel.com/docs/limits>.
- **Netlify free tier in 2026 — what you get.** 100 GB of bandwidth per month, 300 build minutes, deploy previews for every PR, custom domains, automatic SSL, redirect and rewrite rules in `netlify.toml`, edge functions on the Pro plan but not free. The original Jamstack pioneer; still excellent for static SPAs. Reference: <https://www.netlify.com/pricing/>.
- **Why pick Vercel vs. Netlify.** Both are excellent for an SPA capstone. Vercel has slightly better Next.js integration (irrelevant here) and a slightly cleaner GitHub PR comment with the preview URL. Netlify has slightly better redirect-rule expressiveness and the original Forms feature (free up to 100 submissions per month — handy for a contact-form capstone). The decision is reversible; pick one and move on.
- **The SPA-fallback rewrite.** When a user refreshes on `/profile`, the browser asks the server for `/profile`. The server has no such file (only `/index.html`). Without a rewrite rule, the response is a 404. With the rewrite rule, the response is the contents of `/index.html`, the React app boots, the router reads `window.location.pathname`, and the profile route renders. Both Vercel and Netlify give you this in a one-line config; getting it wrong is the most common capstone bug. Reference: <https://vercel.com/docs/projects/project-configuration#rewrites>.
- **Security headers — the modern minimum.** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (forces HTTPS), `X-Content-Type-Options: nosniff` (kills MIME-type confusion attacks), `Referrer-Policy: strict-origin-when-cross-origin` (no token leakage via `Referer`), `Permissions-Policy: camera=(), microphone=(), geolocation=()` (deny features you do not use), and a `Content-Security-Policy` that whitelists your origin, your IdP, and nothing else. Reference: <https://owasp.org/www-project-secure-headers/ci/headers_add.html>.
- **CSP without breaking your app.** The mistake is to drop a `Content-Security-Policy: default-src 'self'` header and watch the whole app break — inline `<style>` tags from CSS-in-JS, the `data:` URLs for SVG, the fetched IdP. The fix is to author the CSP **iteratively**: deploy in `Content-Security-Policy-Report-Only` mode first, watch the browser report what it would block, add the necessary origins one at a time, then promote the header to enforcing mode. Reference: <https://content-security-policy.com/>.
- **Lighthouse — running it for real.** Open the deployed URL in an incognito Chrome window with extensions disabled, open DevTools, pick the Lighthouse tab, select Mobile, select all four categories, click Analyze. The report grades against the same four Core Web Vitals thresholds as Week 9. The categories below 90 are the priority. Reference: <https://developer.chrome.com/docs/lighthouse/overview>.
- **Lighthouse CI.** The same engine, scripted into GitHub Actions, against the Vercel or Netlify preview URL on every pull request. The workflow file lives at `.github/workflows/lighthouse.yml`; the `lhci` CLI is the runner; the budget file at `lighthouserc.json` declares the thresholds. A score drop fails the CI and blocks the merge. Reference: <https://github.com/GoogleChrome/lighthouse-ci>.
- **Auth0 free tier for the capstone IdP.** 7,000 monthly active users, social and database connections, free custom domain on the paid tier (not free). The React Quickstart walks through the same OAuth 2.1 + PKCE flow you implemented locally against Keycloak in Week 10 — the difference is that the issuer is hosted and the callback URL must be set on the Auth0 dashboard for both `localhost` and your production URL. Reference: <https://auth0.com/docs/quickstart/spa/react>.
- **GitHub OAuth as the simpler alternative.** Register an OAuth App at <https://github.com/settings/developers>, copy the Client ID, do not use the Client Secret in the SPA (use the device-flow or hosted-flow proxy), and the user signs in with their GitHub account. The downside is that every user of your app must already have a GitHub account; the upside is no monthly active user limit. Reference: <https://docs.github.com/en/apps/oauth-apps>.
- **Environment variables and secrets in production.** Vercel and Netlify both let you set environment variables in the dashboard, scoped to the production / preview / development environments. The variables prefixed `VITE_` are bundled into the client JS at build time and are **visible to every user** — never put a secret there. The variables not prefixed `VITE_` are available only at build time (used by, e.g., a build script that calls an API to generate static data). Reference: <https://vitejs.dev/guide/env-and-mode>.
- **The deploy preview.** Both providers create a unique URL for every PR (e.g. `your-spa-git-feature-branch-yourname.vercel.app`). Reviewers click the URL, exercise the change, and approve. The preview URL is the right target for the Lighthouse CI run — not the production URL, because the production URL has not yet seen the change.
- **Custom domains.** Free if you already own one and just point a CNAME at `cname.vercel-dns.com` or `apex-loadbalancer.netlify.com`. The DNS propagation is usually under five minutes; the SSL provisioning is automatic via Let's Encrypt. The capstone does not require a custom domain — `your-spa.vercel.app` is sufficient — but it is a 30-minute polish that levels up the portfolio impression. Reference: <https://vercel.com/docs/projects/domains/add-a-domain>.
- **Portfolio README structure.** Three sections, in order: (1) the one-paragraph elevator pitch with the live URL on the first line; (2) the screenshot or animated GIF (use [`peek`](https://github.com/phw/peek) on Linux or QuickTime on Mac); (3) the "Run it locally" snippet, the "Stack" bullet list, the "Track wrap-up" checklist mirroring the C8 sidebar, and the "What I would build next" section. The reader's attention budget is 60 seconds. Respect it.
- **The recorded walkthrough.** The portfolio-review video. 10 minutes, three sections, single take, no edits required. Tools: Loom (free for 25 videos under 5 min on the free plan, longer on the Education plan with .edu email), or OBS Studio plus YouTube unlisted, or QuickTime plus Vimeo. Upload the link to the README. The recording will be watched at 1.5x speed by a hiring manager who has 200 candidates. Optimize for that audience.
- **Failure-mode patterns and rescue.** If by Thursday you have not deployed once, deploy now even if the app is broken — getting the deploy pipeline working is the hardest part, and broken-but-deployed beats perfect-but-localhost. If by Friday the auth flow does not work, swap to GitHub OAuth (the simplest of the three options) and ship. If by Saturday a Playwright test is flaking in CI, mark it `.skip()` with a TODO comment and move on — a known-skipped test is better than a red CI badge. Reference: Cassidy Williams's "shipping is the skill" essay <https://cassidoo.co/post/why-i-ship/>.
- **What comes after C8.** The graduate roadmap. Three recommended next moves: (1) **a real-time feature** — add a WebSocket-backed live update to the capstone (chat, presence, collaborative cursor), which introduces `socket.io` or native WebSockets; (2) **a PWA** — add a service worker, an installable manifest, and offline support, which introduces `vite-plugin-pwa` and the cache-first/network-first patterns; (3) **a full-stack feature** — add a real backend (Fastify or Hono on Cloudflare Workers free tier) and a real database (Turso, Neon, or Supabase free tier), which introduces server-side concerns the C8 track did not cover. Reference: <https://roadmap.sh/frontend>.

---

## Tools you will need

| Tool                                  | Role                                                                 | Cost                                    |
| ------------------------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| **Node.js 20+**                       | Build and run the SPA locally                                        | Free                                    |
| **Vite 5+**                           | Bundler from W7                                                      | Free                                    |
| **React 18+** (or your chosen framework) | UI library from W4-W8                                             | Free                                    |
| **Vitest + Playwright**               | The test suites from W11                                             | Free                                    |
| **Vercel free account**               | The deploy target (option A)                                         | Free — 100 GB bw/mo                     |
| **Netlify free account**              | The deploy target (option B)                                         | Free — 100 GB bw/mo, 300 build min/mo   |
| **Auth0 free tier**                   | Identity provider option A                                           | Free — 7,000 MAU                        |
| **GitHub OAuth App**                  | Identity provider option B                                           | Free — unlimited                        |
| **GitHub Actions**                    | CI runner                                                            | Free — 2,000 min/mo on public repos     |
| **Lighthouse CI**                     | Automated Lighthouse on every PR                                     | Free — runs on your CI minutes          |
| **Chrome DevTools**                   | Lighthouse, performance, accessibility audits                        | Free                                    |
| **Loom or OBS + YouTube**             | Recording the 10-minute walkthrough                                  | Free                                    |
| **`gh` CLI**                          | Push, PR, and CI inspection from the terminal                        | Free                                    |

No paid SaaS is required. Every link in `resources.md` resolves to a free document or a free-tier service.

---

## Weekly schedule

This is the most ambitious week of the track. Plan for **15 to 20 hours** of focused work spread across all seven days. The day-by-day cadence is calibrated so that **the deploy happens on Tuesday**, not Sunday — getting the pipeline working early is what unblocks everything else.

### Monday — pick the project, scaffold the repo (2-3 hours)

- Read this README cover to cover, including the wrap-up table.
- Open `mini-project/README.md` and read the four project archetypes. Pick one.
- Write a one-paragraph project brief in your own README: the data model, the four routes, the auth provider, the deploy target.
- Create a new public GitHub repo: `gh repo create my-c8-capstone --public --clone`.
- Scaffold the Vite + React + TypeScript template: `npm create vite@latest . -- --template react-ts`.
- First commit: empty scaffold. Push to `main`.

### Tuesday — deploy the empty shell (2-3 hours)

- Connect the repo to Vercel (or Netlify). Confirm the deploy succeeds and the URL renders the Vite logo.
- Add `vercel.json` (or `netlify.toml`) with the SPA-fallback rewrite and the five security headers.
- Add `<meta name="viewport">`, the favicon, and the first `<h1>` with the project name.
- Re-deploy. Confirm `your-spa.vercel.app/anything-here` returns the React app, not a 404.
- Run Lighthouse on the deployed URL. Note the baseline scores (likely all 90+ already on an empty app).

### Wednesday — implement the four routes and the navigation (3-4 hours)

- Set up React Router (or your chosen router) with the four routes from your project brief.
- Each route has a real `<h1>` and a real first-paragraph copy block — no Lorem ipsum.
- Add the `<header>` with the site name and the `<nav>` with the four route links.
- Add the `<footer>` with one line of copy and the GitHub repo link.
- Re-deploy. Confirm every route works on refresh, on direct URL paste, and on the back/forward button.

### Thursday — wire the auth provider (3-4 hours)

- Pick the IdP: Auth0 free tier, GitHub OAuth, or self-hosted Keycloak.
- Register the SPA with the IdP. Note the Client ID, the issuer URL, the redirect URIs (one for `localhost:5173`, one for the deployed URL).
- Use the same `oidc-client-ts` or `@auth0/auth0-react` library from W10. Wire login, logout, and the post-login profile route.
- The profile route reads claims from the ID token; do not invent profile data.
- Re-deploy. Confirm the full login round-trip works on the deployed URL, not just on localhost.

### Friday — performance pass and accessibility pass (3-4 hours)

- Run Lighthouse mobile on the deployed URL. Address every issue in the Performance and Accessibility sections.
- The targets: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 90+.
- Add the `<meta name="description">`, the `og:image`, and the `og:title`. Set the page `<title>` per route.
- Run `npm run build` and inspect the output: total JS under 200 KB gzipped, total CSS under 50 KB gzipped, one font file maximum.
- Run an accessibility scan with axe-core (Chrome extension or `vitest-axe`). Resolve every violation.

### Saturday — testing and CI (3-4 hours)

- Carry forward the Vitest unit tests and the Playwright e2e tests from W11. Adapt the selectors to the new project.
- Add at least 10 Vitest unit/component tests and at least 5 Playwright e2e tests across Chromium and Firefox.
- Wire `.github/workflows/test.yml` to run on every push and PR; require it to pass before merging via branch protection.
- Wire `.github/workflows/lighthouse.yml` to run Lighthouse CI against the Vercel preview URL.
- The README gets the green CI badge from the Actions tab.

### Sunday — polish, README, recording, submission (2-3 hours)

- Write the portfolio README in the repo root. Include the live URL on the first line, a screenshot or GIF, the elevator pitch, the stack list, the track-wrap-up checklist, and the "what I would build next" section.
- Record the 10-minute Loom or YouTube walkthrough. Single take. No edits.
- Final deploy. Verify everything one last time on the production URL.
- Submit the **deployed URL** + the **GitHub repo URL** + the **walkthrough URL** to the cohort channel.

If by Saturday morning the auth flow does not work, swap to GitHub OAuth. If by Sunday morning a route is broken, hide it behind a `<a href="/">Back home</a>` and document the gap in the README. **Shipped beats perfect.**

---

## Deliverables

By Sunday at 23:59 local time, you submit:

1. **The live URL** — `your-spa.vercel.app` or `your-spa.netlify.app`. The reviewer will click it. It must load in under 3 seconds on a mid-tier mobile connection.
2. **The public GitHub repo URL** — `github.com/your-handle/my-c8-capstone`. The reviewer will browse it. The CI badge must be green. The README must be excellent.
3. **The 10-minute walkthrough URL** — a Loom or unlisted YouTube link in the README. The reviewer will watch it at 1.5x. The first 2 minutes are the deployed product as a user.
4. **The rubric self-assessment** — a copy of `mini-project/starter/rubric.md` filled in by you, with your own score on each row and a one-line note for any row you scored below the maximum.

---

## Assessment

This week's grade is **the rubric in `mini-project/starter/rubric.md`**, graded against the deployed URL and the repo. The rubric is 100 points across 12 rows; one row per week. The cohort lead grades on the same Sunday-night cadence as every prior week. There is no separate quiz score gating the rubric; the **`quiz.md` in this folder is the final exam**, a 25-question all-track review intended for self-assessment and as a portfolio interview prep tool. Take it on Sunday before the walkthrough recording.

---

## What's next — life after C8

There is no W13. The track ends here. The recommended next moves, in order, for the engineer who finishes C8 with a 90+ rubric and a clean live URL:

1. **C9 — Crunch Mobile (iOS + Android).** If your interest is consumer products, the natural follow-on is SwiftUI on iOS or Jetpack Compose on Android. The mental model of components and state transfers. The deploy model (App Store and Play Store) does not.
2. **C7 — Crunch Wire (cybersecurity).** If your interest is the security layer your capstone touched briefly — CSP, HSTS, OAuth — the deep dive is C7, which is a 24-week semester through web app security, network security, and red-team exercises.
3. **C20 — Crunch Swift, or C21 — Crunch Droid.** Single-platform deep dives, narrower than C9.
4. **A second capstone, scoped bigger.** Three months from now, return to this repo, swap the auth provider, add a real-time WebSocket feature, ship to a custom domain, and write a second 600-word portfolio entry comparing the two. The second capstone is when the real engineering judgment shows.
5. **An open-source contribution to one of the libraries C8 used.** Vite, Vitest, Playwright, React Router, Auth0 SDKs — all of them have open issues tagged `good-first-issue` and welcome external contributions. A merged PR to a real OSS project is the strongest possible signal in a portfolio.

The track is over. The work is just starting. Ship.

---

## How to ask for help this week

The capstone is **the hardest week of the track**. You will hit a wall — a deploy that 404s on refresh, an Auth0 callback that loops, a Lighthouse score that will not budge past 78, a Playwright test that flakes only in CI. The cohort channel exists for this.

When you ask, include four things, in order: (1) the **live URL** so the helper can reproduce the issue in the deployed environment; (2) the **repo URL** or the commit hash so the helper can read the code; (3) the **error message** verbatim — copy-paste, not paraphrase, not a screenshot of a screenshot; (4) **what you have already tried** in two sentences. Posts with all four get answered in under an hour. Posts with two or fewer get ignored.

The standard escalation: ask the cohort channel first, search the project's GitHub issues second, search the docs third, and ask the cohort lead in office hours fourth. The order matters — the cohort lead's time is the most expensive resource, and most questions are answerable upstream.

Welcome to the last week. Make it count.
