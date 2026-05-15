# Week 12 — Resources

Every link below is free to read. None require a paid account. Bookmark this file; you will return to it during the walkthrough recording when an interviewer asks "where did you learn that?"

---

## Deployment — Vercel free tier

- **Deploying a Vite project to Vercel** — the canonical end-to-end guide: <https://vercel.com/docs/frameworks/vite>
- **Vercel project configuration (`vercel.json`)** — the schema for rewrites, redirects, headers, and trailing-slash policy: <https://vercel.com/docs/projects/project-configuration>
- **Vercel rewrites and redirects** — the SPA-fallback recipe is the example on this page: <https://vercel.com/docs/projects/project-configuration#rewrites>
- **Vercel custom headers** — the syntax for the security headers section in `vercel.json`: <https://vercel.com/docs/projects/project-configuration#headers>
- **Vercel environment variables** — production, preview, and development scopes; the `VITE_` prefix gotcha: <https://vercel.com/docs/projects/environment-variables>
- **Vercel free plan limits** — bandwidth, build minutes, serverless invocations, what counts toward the 100 GB: <https://vercel.com/docs/limits>
- **Vercel preview deployments** — every PR gets a unique preview URL: <https://vercel.com/docs/deployments/preview-deployments>
- **Vercel deployment protection** — keep preview URLs private if your repo is public: <https://vercel.com/docs/deployment-protection>
- **Vercel custom domains** — point a CNAME and the SSL auto-provisions: <https://vercel.com/docs/projects/domains/add-a-domain>
- **Vercel `gh` integration** — connect a GitHub repo and never touch the dashboard again: <https://vercel.com/docs/git/vercel-for-github>

## Deployment — Netlify free tier

- **Deploying a Vite project to Netlify** — the Vite-specific recipe: <https://docs.netlify.com/frameworks/vite/>
- **Netlify file-based configuration (`netlify.toml`)** — the canonical schema: <https://docs.netlify.com/configure-builds/file-based-configuration/>
- **Netlify redirect and rewrite rules** — the SPA-fallback rule is the first example: <https://docs.netlify.com/routing/redirects/rewrites-proxies/>
- **Netlify custom headers** — the `[[headers]]` block in `netlify.toml`: <https://docs.netlify.com/routing/headers/>
- **Netlify environment variables** — scoped per context (production, deploy preview, branch deploy): <https://docs.netlify.com/configure-builds/environment-variables/>
- **Netlify free plan limits** — bandwidth, build minutes, function invocations: <https://www.netlify.com/pricing/>
- **Netlify deploy previews** — every PR gets a preview URL: <https://docs.netlify.com/site-deploys/deploy-previews/>
- **Netlify Forms (free up to 100 submissions/month)** — useful for contact-form capstones: <https://docs.netlify.com/forms/setup/>
- **Netlify custom domains and SSL** — point a CNAME or apex A record: <https://docs.netlify.com/domains-https/custom-domains/>
- **Netlify GitHub integration** — auto-deploy on push, status checks on PR: <https://docs.netlify.com/configure-builds/repo-permissions-linking/>

## SPA routing and the refresh-on-deep-link problem

- **Why SPAs need a server-side rewrite** — Vue Router's docs explain the problem clearly, applies equally to React Router: <https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations>
- **React Router — file-based vs. data-router APIs in 2026** — the modern default: <https://reactrouter.com/start/declarative/installation>
- **React Router — `createBrowserRouter`** — the data-router setup: <https://reactrouter.com/start/library/routing>
- **History API on MDN** — the underlying browser primitive: <https://developer.mozilla.org/en-US/docs/Web/API/History_API>

## Security headers

- **OWASP Secure Headers Project** — the master list of recommended headers and why each one matters: <https://owasp.org/www-project-secure-headers/>
- **OWASP Cheat Sheet — HTTP headers** — the same list, formatted as a cheat sheet: <https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html>
- **MDN — `Strict-Transport-Security`** — the canonical reference: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security>
- **MDN — `Content-Security-Policy`** — the long, careful reference: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy>
- **`content-security-policy.com`** — an interactive CSP builder that explains each directive: <https://content-security-policy.com/>
- **MDN — `X-Content-Type-Options`** — kills MIME-type confusion: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options>
- **MDN — `Referrer-Policy`** — controls what `Referer` headers your app sends: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy>
- **MDN — `Permissions-Policy`** — declares which browser features your origin uses: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy>
- **Mozilla Observatory** — a free scanner that grades your deployed URL's headers: <https://observatory.mozilla.org/>
- **SecurityHeaders.com (Scott Helme)** — alternative scanner, slightly different scoring: <https://securityheaders.com/>

## Lighthouse and Core Web Vitals (carry-over from W9)

- **Lighthouse documentation** — the entry point: <https://developer.chrome.com/docs/lighthouse/>
- **Lighthouse scoring** — how the four category scores are computed: <https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/>
- **Lighthouse CI** — the GitHub Actions integration: <https://github.com/GoogleChrome/lighthouse-ci>
- **Lighthouse CI on GitHub Actions — the official tutorial** — copy-paste-ready: <https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md>
- **PageSpeed Insights** — Lighthouse plus real-world CrUX field data: <https://pagespeed.web.dev/>
- **web.dev — Core Web Vitals overview** — the thresholds for LCP, INP, CLS: <https://web.dev/articles/vitals>
- **web.dev — optimize LCP** — the biggest single performance lever: <https://web.dev/articles/optimize-lcp>
- **web.dev — optimize INP** — the new responsiveness metric (replaced FID in March 2024): <https://web.dev/articles/optimize-inp>
- **web.dev — optimize CLS** — the layout-stability metric: <https://web.dev/articles/optimize-cls>

## Authentication

- **OAuth 2.1 draft (the unified successor)** — the spec the modern best practices target: <https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1>
- **RFC 7636 — PKCE** — the proof-key extension that makes SPA OAuth safe: <https://datatracker.ietf.org/doc/html/rfc7636>
- **OWASP — Authentication Cheat Sheet** — the master list of auth pitfalls: <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
- **OWASP — OAuth 2.0 Security Best Current Practice** — the long version: <https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics>
- **Auth0 — React SPA quickstart** — the recommended IdP for the capstone: <https://auth0.com/docs/quickstart/spa/react>
- **Auth0 — `@auth0/auth0-react` SDK** — the React-friendly wrapper: <https://github.com/auth0/auth0-react>
- **Auth0 — free plan limits** — 7,000 MAU, social and database connections: <https://auth0.com/pricing>
- **GitHub OAuth Apps** — the simplest IdP for a dev-facing capstone: <https://docs.github.com/en/apps/oauth-apps>
- **GitHub OAuth device flow** — the SPA-safe variant that avoids a backend: <https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow>
- **Keycloak Cloud (Red Hat-hosted)** — the free tier for self-hosted alternatives: <https://www.keycloak.org/server/getting-started>

## CI/CD and GitHub Actions

- **GitHub Actions quickstart** — the entry point: <https://docs.github.com/en/actions/quickstart>
- **Workflow syntax** — the YAML reference: <https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions>
- **GitHub Actions free minutes** — 2,000/month on public repos, 500 on private: <https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions>
- **Branch protection rules** — block merge on failing CI: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule>
- **Playwright on CI (carry-over from W11)** — the official guide: <https://playwright.dev/docs/ci-intro>
- **Vitest in CI** — the official guide: <https://vitest.dev/guide/cli.html>
- **`actions/checkout`** — the standard first step: <https://github.com/actions/checkout>
- **`actions/setup-node`** — Node install with cache: <https://github.com/actions/setup-node>
- **`actions/cache`** — cache `node_modules` to speed up subsequent runs: <https://github.com/actions/cache>

## Portfolio and writeup

- **`makeareadme.com`** — a guided README template generator: <https://www.makeareadme.com/>
- **`awesome-readme`** — a curated list of exemplary READMEs: <https://github.com/matiassingers/awesome-readme>
- **Shields.io** — the badge generator for the CI badge and the version badge: <https://shields.io/>
- **Carbon.now.sh** — beautiful code screenshots for the README: <https://carbon.now.sh/>
- **`peek`** — Linux animated-GIF screen recorder for README hero images: <https://github.com/phw/peek>
- **Cleanshot or QuickTime** — macOS native equivalents (QuickTime is built in and free): <https://support.apple.com/guide/quicktime-player/welcome/mac>
- **Loom** — 5-minute videos free on the basic plan, 25 video limit; longer with .edu email: <https://www.loom.com/pricing>
- **OBS Studio** — free, unlimited, more setup than Loom: <https://obsproject.com/>
- **YouTube unlisted upload** — the free hosting tier; the video is searchable only via the link: <https://support.google.com/youtube/answer/157177>
- **Cassidy Williams — "Why I ship"** — the canonical shipped-beats-perfect essay: <https://cassidoo.co/post/why-i-ship/>

## What comes after the capstone

- **roadmap.sh — Frontend** — the community-maintained map of where to go next: <https://roadmap.sh/frontend>
- **roadmap.sh — React** — the deeper React-specific path: <https://roadmap.sh/react>
- **roadmap.sh — Backend** — for the natural next step after a frontend capstone: <https://roadmap.sh/backend>
- **The PWA primer (web.dev)** — service workers and offline support: <https://web.dev/articles/progressive-web-apps>
- **`vite-plugin-pwa`** — the easiest path to a PWA in a Vite project: <https://vite-pwa-org.netlify.app/>
- **Astro** — if your interest is the static-site-generator side of the spectrum: <https://docs.astro.build/>
- **Next.js** — the React-first SSR/SSG framework: <https://nextjs.org/docs>
- **Remix** — React Router's full-stack sibling: <https://remix.run/docs>
- **Cloudflare Workers free tier** — for the backend half of the next capstone: <https://developers.cloudflare.com/workers/platform/limits>
- **Supabase free tier** — for the database half: <https://supabase.com/pricing>
- **Turso free tier** — SQLite at the edge, generous free quota: <https://turso.tech/pricing>
- **Neon free tier** — serverless Postgres, free for hobby projects: <https://neon.tech/pricing>

## Reference reads from earlier in the track (review before the final exam)

- **W1 — MDN HTML element reference** — the master list: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element>
- **W2 — WCAG 2.2 quick reference** — the accessibility rulebook: <https://www.w3.org/WAI/WCAG22/quickref/>
- **W3 — MDN responsive design** — viewport, media queries, flexible images: <https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design>
- **W4 — MDN JavaScript guide** — the canonical language reference: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide>
- **W5 — MDN DOM events** — the event model: <https://developer.mozilla.org/en-US/docs/Web/API/Event>
- **W6 — MDN form validation** — both native HTML and JS-based: <https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation>
- **W7 — Vite guide** — the bundler that powers the capstone: <https://vitejs.dev/guide/>
- **W8 — React Router docs** — the router you wired in W8: <https://reactrouter.com/>
- **W9 — web.dev performance** — the field guide: <https://web.dev/learn/performance>
- **W10 — `oidc-client-ts`** — the OIDC client you wired in W10: <https://github.com/authts/oidc-client-ts>
- **W11 — Playwright + Vitest** — the test stack: <https://playwright.dev/> and <https://vitest.dev/>

## Books (free to read online, or cheap)

- **"Resilient Web Design" by Jeremy Keith** — free online, the foundational philosophy of progressive enhancement: <https://resilientwebdesign.com/>
- **"Inclusive Components" by Heydon Pickering** — read the chapter previews free, then buy if you want: <https://inclusive-components.design/>
- **"Refactoring UI" by Adam Wathan and Steve Schoger** — paid; the most influential modern visual-design book for engineers: <https://www.refactoringui.com/>
- **"You Don't Know JS Yet" by Kyle Simpson (2nd edition)** — free on GitHub, the deepest JS dive available for free: <https://github.com/getify/You-Dont-Know-JS>
- **"Eloquent JavaScript" by Marijn Haverbeke** — free online, a complete intro-to-deep treatment: <https://eloquentjavascript.net/>

## Newsletters and ongoing reading

- **CSS-Tricks (now Frontend Masters Blog)** — the original deep frontend blog: <https://frontendmasters.com/blog/>
- **Smashing Magazine** — long-form frontend articles, free tier: <https://www.smashingmagazine.com/>
- **web.dev blog** — Google's first-party reference: <https://web.dev/blog/>
- **MDN Blog** — Mozilla's first-party reference: <https://developer.mozilla.org/en-US/blog/>
- **Frontend Focus newsletter** — weekly digest, free: <https://frontendfoc.us/>
- **JavaScript Weekly** — weekly digest, free: <https://javascriptweekly.com/>
- **Bytes.dev** — weekly digest with personality, free: <https://bytes.dev/>

## Free tools you will use during the build

- **Vite** — the bundler: <https://vitejs.dev/>
- **Vitest** — the unit test runner: <https://vitest.dev/>
- **Playwright** — the e2e test runner: <https://playwright.dev/>
- **ESLint** — the linter: <https://eslint.org/>
- **Prettier** — the formatter: <https://prettier.io/>
- **TypeScript** — the type checker: <https://www.typescriptlang.org/>
- **PostCSS** — the CSS toolchain: <https://postcss.org/>
- **Bundlephobia** — find the size cost of any npm package before you install: <https://bundlephobia.com/>
- **WAVE accessibility checker** — paste a URL, get an accessibility report: <https://wave.webaim.org/>
- **axe DevTools** — Chrome extension, free: <https://www.deque.com/axe/browser-extensions/>
- **WebPageTest** — the most thorough free performance test: <https://www.webpagetest.org/>

## The "I am stuck" escape hatches

When you have been stuck for more than 30 minutes on a single thing, escape:

- **The official Discord for the tool** — Vite, Vitest, Playwright, React Router, Auth0 all have active Discords where maintainers answer.
- **GitHub Discussions on the tool's repo** — usually pinned in the README.
- **Stack Overflow with the right tags** — `[reactjs]` plus `[vercel]` plus your error message is a strong search.
- **The cohort channel** — paste the live URL, the repo URL, the verbatim error, and what you tried.
- **The cohort lead's office hours** — listed in the C8 README's schedule section.

Avoid: copy-pasting an error into ChatGPT without first searching the official docs. The official docs are usually faster, are definitely correct, and will earn you the muscle memory of where to look next time.

---

That is the resource list. Open the four most-relevant ones (the deploy provider, the IdP, the OWASP headers, and the Lighthouse CI guide) in tabs on Monday morning and keep them open all week. Close them on Sunday night when you submit.
