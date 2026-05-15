# Lecture Note 01 — From `localhost` to Production

> *Localhost is a laboratory. Production is a market. The two environments share a programming language and a transport protocol; everything else differs.*

There is a distance, measurable in days of work, between a Vite app that runs on `npm run dev` at `localhost:5173` and the same app at `your-spa.vercel.app`. The distance is not "deployment" in the lazy sense of "push to GitHub and run a build command." The distance is a real set of architectural facts that change underneath you the moment the laptop's network adapter is replaced by a multi-tenant CDN, the IdP's redirect URI flips from `127.0.0.1` to a public hostname, and the bundle that was 3.2 MB unminified suddenly serves as a 187 KB gzipped chunk through HTTP/2 multiplex. This first lecture catalogs the differences, explains why each one matters, and gives you a sequence of decisions to make on Monday and Tuesday so that the **deploy is working by Tuesday evening** and the rest of the week becomes about content rather than plumbing.

The thesis to take into this week is simple: **deploy first; iterate on a deployed surface.** Do not save the deploy for Sunday. The capstones that fail are almost always the ones that wait until Sunday afternoon to attempt the first deploy, discover that the SPA-fallback rewrite is missing, that the IdP callback URL is wrong, that the build script reads an environment variable that does not exist on the deploy platform, and that the Lighthouse score is 14 points lower than on localhost. The capstones that succeed deploy the empty Vite scaffold on Tuesday morning, then iterate against the public URL for the remaining five days.

---

## What changes when you leave `localhost`

There are roughly twelve facts about the environment that change. Memorize this list; you will check every one of them at least once during the week.

### 1. The host name

On localhost the app runs at `http://localhost:5173` (Vite's default). The hostname is `localhost`; the protocol is `http://`; the port is non-default. In production the app runs at `https://your-spa.vercel.app` or `https://your-spa.netlify.app`. The hostname is a public DNS name; the protocol is HTTPS; the port is implicit (443). Three of those four facts have downstream consequences.

The IdP's redirect URI must be configured for **both** hostnames. Most capstone bugs trace back to the developer who configured `http://localhost:5173/callback` on the Auth0 dashboard, deployed the app, clicked "Sign in," watched the IdP redirect to `https://your-spa.vercel.app/callback`, and saw the IdP refuse the request because the redirect URI is not on the allowlist. The fix is to add the production URL to the allowlist before deploying — not after the first failed login.

The cookie `Secure` flag now matters. Cookies set without `Secure` will refuse to send on HTTPS in modern browsers. The fix: always set `Secure` and `SameSite=Lax` (or `Strict`) on any cookie you create.

### 2. The TLS handshake

Localhost uses HTTP. Production uses HTTPS. The TLS handshake adds roughly 100-200 ms of latency to the first request to a new origin. The handshake is amortized across the connection (subsequent requests on the same connection reuse the session), and HTTP/2 lets you multiplex many requests on one connection — but the first request to a new origin (the IdP, the analytics provider, the CDN-hosted font, the third-party API) each pay the handshake cost individually.

The consequence: **the cost of using a third-party domain is real**, and self-hosting the few assets you can self-host (the font, the favicon, the inline analytics snippet) pays in measurable LCP. Hosting providers do this for you on the same connection that serves the HTML.

### 3. The CDN and the cache layer

Localhost has no CDN. Vite serves files directly from your disk. Production traffic hits a CDN edge node (Vercel uses Cloudflare and its own infra; Netlify uses its own edge). The CDN caches static assets by URL with a TTL governed by the `Cache-Control` header. Two consequences:

- **Cache headers matter.** Vite's default production build emits filenames with content hashes (`app-9a3b2c.js`); the bundler intends those files to be cached forever (`Cache-Control: public, max-age=31536000, immutable`). The HTML file, by contrast, must be cached briefly or not at all (`Cache-Control: public, max-age=0, must-revalidate`) because it references the hashed filenames and must be re-fetched to learn the new hashes. Both Vercel and Netlify get this right by default; the only way to break it is to override the headers explicitly.
- **Cache invalidation is not free.** When you redeploy, the CDN must propagate the new bundle to every edge node. Vercel and Netlify both do this within seconds, but the in-flight requests during the propagation window can serve a mix of old HTML referencing new chunks (404) or new HTML referencing old chunks (cache-hit, fine). The mitigation is the hashed filenames in the JS and CSS — old HTML references old hashed files, which are cached; new HTML references new hashed files, which are uploaded by the deploy. Both old and new keep working.

### 4. Routing — the SPA-fallback problem

This is the single most common production bug. On localhost, Vite's dev server is itself an SPA-aware server: a request for `/profile` is served by re-serving `/index.html` and letting the client-side router handle the route. In production, the hosting layer is **not** SPA-aware by default. A request for `/profile` is served by looking for `dist/profile.html` or `dist/profile/index.html`, finding neither, and returning a 404.

The fix is one of two configurations:

- **Vercel** — add a `rewrites` block to `vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
  The `source` is the request path; the `destination` is the file the hosting layer serves in response. Every URL serves `index.html`; the client-side router takes it from there.

- **Netlify** — add a redirect rule to `netlify.toml`:
  ```toml
  [[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  ```
  Status 200 is what makes this a **rewrite** rather than a **redirect** — the URL bar still shows `/profile`, but the response body is `index.html`.

You verify the rewrite by visiting `your-spa.vercel.app/genuinely-random-path` in an incognito window. If the React app loads (and the router probably shows a 404 page), the rewrite works. If the hosting layer's 404 page loads, the rewrite is missing or misconfigured.

Reference: <https://vercel.com/docs/projects/project-configuration#rewrites> and <https://docs.netlify.com/routing/redirects/rewrites-proxies/>.

### 5. The environment variables

Localhost reads `.env` from the repo root. Vite exposes any variable prefixed `VITE_` to the client-side code as `import.meta.env.VITE_FOO`. The variable is replaced at build time by string substitution.

Production reads environment variables from the deploy platform's dashboard (Vercel: Settings → Environment Variables; Netlify: Site Settings → Build & Deploy → Environment). The variables are scoped per environment (Production, Preview, Development). The variable must be set in the dashboard **before** the deploy that needs it; setting it after triggers another deploy.

Three facts you must internalize:

- Variables prefixed `VITE_` are **public**. They are bundled into the client JS, are visible to anyone who clicks "View Source" or reads the network tab, and **must not be secrets**. Auth0 Client ID? Public. Auth0 Client Secret? Never use one in an SPA. Stripe Publishable Key? Public. Stripe Secret Key? Never on the client.
- Variables not prefixed `VITE_` are available at **build time only** to the Node process running `npm run build`. A build script can read them, generate static files from them, and the runtime never sees them.
- The same variable name can have different values per environment. The Auth0 callback URL must point to `localhost:5173` in development and to `your-spa.vercel.app` in production. Both providers' dashboards let you set per-environment values.

Reference: <https://vitejs.dev/guide/env-and-mode>.

### 6. The bundle size

Localhost serves source files. Production serves a Rollup bundle. The bundle is a fundamentally different artifact: tree-shaken, minified, split into chunks by route or by dynamic import, and content-hashed for caching.

The capstone's bundle must be **small**. The targets, from the W9 lecture notes:

- Total JS: **under 200 KB gzipped** on the home route.
- Total CSS: **under 50 KB gzipped** on the home route.
- Largest single chunk: **under 100 KB gzipped**.

Vite emits a bundle report at the end of `npm run build` listing every chunk and its gzipped size. Open it, audit it, install `rollup-plugin-visualizer` if you want a treemap, and **delete** the unused dependencies. The single fastest way to blow the budget is to import a 200 KB date library when you needed three functions from it; the fix is to import the three functions, not the whole library.

Reference: <https://vitejs.dev/guide/build.html> and `bundlephobia.com` (<https://bundlephobia.com/>) for pre-install size checks.

### 7. The third-party origins

Localhost calls localhost. Production calls real third parties: the IdP, the API backend (if any), the analytics provider (if any), the font CDN (if any), the image CDN (if any). Each is a real DNS lookup, real TLS handshake, real HTTP round trip. Each can be slow, down, or rate-limited.

The mitigations are well-rehearsed:

- **DNS preconnect** — `<link rel="preconnect" href="https://accounts.your-idp.com">` in the `<head>` tells the browser to start the DNS lookup and TLS handshake before the code that actually needs the connection runs. Saves 50-200 ms on the first auth call.
- **Self-hosting** — pull the font file into the repo (`fonts/Inter.woff2`) and load it from your own origin instead of `fonts.googleapis.com`. Removes one third-party connection entirely.
- **The CSP origin list** — your `Content-Security-Policy` header must include every third-party origin you actually use. Forgetting to list the IdP is the most common CSP bug.

### 8. The performance characteristics

Localhost runs on your laptop's CPU. Production users run on a wider distribution — old phones, throttled tabs, slow CPUs, slow networks. Lighthouse mobile simulates this with a 4x CPU throttle and a Slow 4G network profile. The **Lighthouse score on the deployed URL** is therefore lower than the score on localhost by 5 to 25 points on a non-trivial app. You design for the deployed score.

Reference: <https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/>.

### 9. The security headers

Localhost has no security headers (Vite's dev server emits none). Production must have them. The minimum set, with the recommended value of each:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — forces HTTPS for two years, locks in the policy for the apex and subdomains, and qualifies the domain for the browser preload list (Chrome and Firefox both maintain one).
- `X-Content-Type-Options: nosniff` — prevents the browser from guessing the MIME type of a response, which kills a category of MIME-confusion attacks.
- `Referrer-Policy: strict-origin-when-cross-origin` — sends only the origin (not the full URL) in the `Referer` header on cross-origin navigations, so query strings with tokens are not leaked.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` — explicitly denies browser features your app does not use, including the FLoC/Topics cohort.
- `Content-Security-Policy` — the long header. Whitelists exactly the origins your app loads from. Author this iteratively.

Reference: <https://owasp.org/www-project-secure-headers/>.

### 10. The Content-Security-Policy specifically

CSP deserves its own paragraph because it is the most likely header to **break your app** if you write it wrong on the first try. The professional pattern, used by every team that ships CSP successfully:

1. Deploy the header as **report-only** first: `Content-Security-Policy-Report-Only: default-src 'self'; ...`. The browser logs what it would have blocked but lets it through.
2. Watch the browser console (in dev tools' Network tab, filter for "CSP" or check the Issues panel). The browser reports every blocked resource with the directive that blocked it.
3. Add origins to the directives until the report is clean.
4. Promote to enforcing: rename the header to `Content-Security-Policy`. Redeploy.

A starting policy for a typical capstone with Auth0 and a self-hosted font:

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
font-src 'self';
img-src 'self' data: https:;
connect-src 'self' https://your-tenant.auth0.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

`'unsafe-inline'` on `style-src` is the common compromise because every CSS-in-JS library and most build pipelines emit inline `<style>` tags. The clean alternative is to use [nonces](https://content-security-policy.com/nonce/) or [hashes](https://content-security-policy.com/hash/), but both require build-pipeline integration that is out of scope for the capstone.

Reference: <https://content-security-policy.com/>.

### 11. The CI gate

Localhost has no CI. Production has a CI. The CI runs on every push and PR; the merge is blocked on failing checks; the deploy on Vercel/Netlify happens only after the CI passes (or in parallel, with the option to roll back).

The capstone CI workflow runs:

- `npm install` (cached via `actions/cache`).
- `npm run lint`.
- `npm run typecheck` (if TypeScript).
- `npm run test` (Vitest).
- `npm run test:e2e` (Playwright across Chromium and Firefox).
- `lhci autorun` (Lighthouse CI against the Vercel/Netlify preview URL).

Reference: <https://playwright.dev/docs/ci-intro> and <https://github.com/GoogleChrome/lighthouse-ci>.

### 12. The deploy frequency

Localhost rebuilds on save. Production rebuilds on push. The cycle is slower (Vercel takes 30-90 seconds for a typical Vite build; Netlify takes 45-120 seconds), but the cycle is also **more committed**: every deploy is a commit on `main` (or a PR branch with a preview URL), every deploy is a public artifact, every deploy is something to be proud of or to roll back.

The discipline this enforces is good: you stop running `npm run dev` and start running the deployed URL through Lighthouse. The discipline is also a tax: a typo in a CSS variable takes 90 seconds to verify in production vs. 90 milliseconds to verify on localhost. The mitigation is to keep using localhost for the inner-loop iteration (the typo) and to use the deploy for the outer-loop verification (the Lighthouse score, the security headers, the IdP round trip).

---

## The decision sequence — Monday and Tuesday

Make these decisions in order. Each downstream decision is constrained by the upstream one.

### Decision 1 — Vercel or Netlify

Pick one. The decision is **reversible** later; both have similar feature sets for an SPA capstone. Default to **Vercel** if you have no preference; the GitHub PR comment with the preview URL is slightly cleaner. Pick **Netlify** if you want the free Forms feature (handy for contact-form archetypes) or the slightly more powerful redirect rules.

What you cannot do: deploy to both during the capstone. Pick one and commit. Switching mid-week loses you a day to environment-variable re-entry and IdP-callback re-configuration.

### Decision 2 — The IdP

Three options, ranked from easiest to hardest:

- **GitHub OAuth** — easiest. Register at <https://github.com/settings/developers>. Free. Unlimited. Every dev has a GitHub account. The catch: every **user** of your app must have a GitHub account, which limits the consumer use case.
- **Auth0 free tier** — most flexibility. Free up to 7,000 MAU. Social login, database login, magic links, MFA. The catch: the configuration surface is larger; expect 30 minutes on the dashboard.
- **Self-hosted Keycloak** — most engineering work. Deploy Keycloak Cloud (free tier) or run Keycloak on Fly.io (free tier) or Render (free tier). Maximum control; maximum operational burden.

Default to **Auth0** unless you have a reason to differ. The W10 patterns transfer directly via the `@auth0/auth0-react` SDK.

### Decision 3 — The project archetype

Pick one of the four from `mini-project/README.md`. Each is sized for one week of full-time work and exercises all eleven prior weeks.

- **Task tracker** — the canonical capstone. Add, edit, mark complete, filter, persist. Auth-protected list per user.
- **Reading list** — save URLs, tag them, mark as read. Auth-protected per user. Slight twist on the task tracker, slightly more interesting data model.
- **Expense splitter** — record expenses with a group, split, settle. Slightly more complex data model; great form-validation territory.
- **Micro-CMS** — author markdown posts, render them, list them, delete them. Auth-protected admin route, public read route.

Resist the temptation to pick a fifth project. The four are sized correctly for a week; a fifth is almost certainly out of scope.

### Decision 4 — The framework

Default: **React + TypeScript** carrying forward from W7-W11. The track was built around this stack and the lecture notes and exercises assume it.

Alternative defaults that are also acceptable:

- **React + plain JavaScript** — slightly less work; loses the type-safety win.
- **Vue 3 + TypeScript** — works equivalently with `vite-plugin-vue`. The W11 testing stack changes slightly (use `@vue/test-utils` instead of `@testing-library/react`).
- **Svelte + TypeScript** — works equivalently with `svelte-vite`. Smallest bundle. Smallest community.

If you pick anything other than React + TypeScript, the lecture notes' code examples will need translation. Plan for the extra time.

### Decision 5 — The state management

For the capstone scope, **React Context plus `useReducer`** is sufficient. A second-tier option is **Zustand** (3 KB, simple API), which is what you used in W8. Avoid: Redux Toolkit (overkill for the capstone), Recoil (sunset), MobX (philosophical mismatch with the rest of the stack).

### Decision 6 — The data persistence

You have three honest options for where the data lives:

- **`localStorage`** — the cheapest option. No backend needed. The data is scoped to the browser. Acceptable for the capstone if you do not need cross-device sync.
- **A free-tier serverless DB** — Supabase free tier (Postgres + auth), Turso free tier (SQLite), or Neon free tier (Postgres). Each gives you a free backend in 15 minutes. Acceptable for the capstone but adds a day.
- **A JSON file checked into the repo** — for static-CMS archetypes only. The data is not editable at runtime.

Default to **`localStorage`** for the first capstone unless cross-device sync is a hard requirement.

---

## The first-deploy checklist

By Tuesday end-of-day, every line below should be true:

- [ ] The repo exists on GitHub and is **public**.
- [ ] The `main` branch contains a Vite + React + TS scaffold.
- [ ] The repo is connected to Vercel (or Netlify); the first deploy is green.
- [ ] `vercel.json` (or `netlify.toml`) contains the SPA-fallback rewrite.
- [ ] `vercel.json` (or `netlify.toml`) contains four security headers (`HSTS`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- [ ] The CSP header is set in **report-only** mode (you'll promote on Friday).
- [ ] `your-spa.vercel.app/random-path` returns the React app, not a 404.
- [ ] `your-spa.vercel.app` scores 90+ on Lighthouse mobile across all four categories (the empty Vite scaffold should already).
- [ ] The README has the live URL on the first line and a one-paragraph project brief.

If any line is unchecked by Tuesday evening, prioritize fixing it before any other work. The deploy is the foundation; everything else lives on top.

---

## Common Tuesday bugs

Three bugs eat days of capstone time. Each has a one-line diagnosis and a one-line fix.

### Bug 1 — The deploy succeeds but the URL shows a 404

**Diagnosis:** Vercel inferred the wrong framework, or `npm run build` did not produce `dist/`, or the publish directory is wrong on Netlify.

**Fix:** On Vercel, Project Settings → General → Framework Preset → set to "Vite." On Netlify, Site Settings → Build & Deploy → Publish directory → set to `dist`.

### Bug 2 — Refresh on a non-root route returns a 404

**Diagnosis:** SPA-fallback rewrite is missing or misconfigured.

**Fix:** Add the rewrite rule from §4 above. Redeploy. Verify with `your-spa.vercel.app/random-path`.

### Bug 3 — The deploy succeeds but the IdP login redirects to the wrong URL

**Diagnosis:** The IdP's redirect URI is configured for `localhost:5173` only.

**Fix:** Go to the IdP dashboard (Auth0 → Applications → your app → Settings → Allowed Callback URLs). Add `your-spa.vercel.app/callback`. Save. Re-test.

Past these three, the deploy is mostly stable. Move to the routing and the auth on Wednesday and Thursday.

---

## Reading

- Vercel docs, "Deploying a Vite project": <https://vercel.com/docs/frameworks/vite>
- Netlify docs, "Deploying a Vite project": <https://docs.netlify.com/frameworks/vite/>
- OWASP Secure Headers Project: <https://owasp.org/www-project-secure-headers/>
- web.dev, "Optimize content efficiency": <https://web.dev/articles/optimizing-content-efficiency>
- MDN, "Content-Security-Policy": <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy>

Read these Monday or Tuesday. The rest of the week is execution.

---

## Closing

The lecture is a list, not a story. That is intentional. Production deployment is a list of facts you must check, not a narrative arc. The seniority signal an interviewer is reading for is "this person has shipped before and knows which checkboxes matter." The capstone is your first opportunity to acquire that signal.

Tuesday evening, the deploy works. Wednesday, you implement four routes. Thursday, the auth round-trips. Friday, the Lighthouse score is 90+. Saturday, the CI is green. Sunday, the README is written and the walkthrough is recorded. The week breaks down into eleven small problems, each with a known solution. You have done eleven weeks of preparation. Trust that work; ship the capstone.
