# Week 9 — Performance and Web Vitals

> *Eight weeks in, you can ship a multi-route React SPA with route-level data loading, code-split admin chunks, and a Zustand store that survives a refresh. The architecture is sound. This week is about how it feels to the user on a real device on a real network. We move from "the app works" to "the app feels instant," and we do it with the only set of numbers that Google's search ranking, Chrome's UX team, and every modern performance engineer agree on: **Core Web Vitals**. You will learn the browser's rendering pipeline well enough to predict where time is spent, you will measure **Largest Contentful Paint**, **Interaction to Next Paint**, and **Cumulative Layout Shift** in three different tools (Chrome DevTools' Performance Insights panel, Lighthouse, and the `web-vitals` JavaScript library), and you will run the measure-then-fix workflow on a deliberately-slow page. By Sunday, you will be able to look at a page and predict its three vitals within a band, name the single biggest contributor to each, and fix it.*

Welcome back. Through Week 8 you built Crunch Library — a multi-route SPA with React Router, TanStack Query, and Zustand. The architecture is right. The site, on a fast laptop on home Wi-Fi, feels fine. **It will not feel fine on a mid-range Android phone on a flaky 4G connection in the back of a coffee shop**, and that is the device and the network that most of your users actually browse from. This week is about closing that gap.

Performance is the second-most cited reason a user abandons a page, behind only "I changed my mind about clicking that link." The web.dev team's own data, drawn from the Chrome User Experience Report dataset, puts the bailout cliff somewhere between two and four seconds of perceived load time, with sharp drop-offs after every additional second. Google's search ranking has used Core Web Vitals as a signal since 2021, with the **Interaction to Next Paint** metric replacing First Input Delay in March 2024 as the responsiveness vital. The conversation has moved from "make it fast" — too vague to be useful — to "hit a green LCP, a green INP, and a green CLS on the 75th-percentile real-user load." This week is the vocabulary, the toolchain, and the workflow for doing that.

The four ideas that organize the week are:

1. **The browser's rendering pipeline is observable.** Parse the HTML, build the DOM. Parse the CSS, build the CSSOM. Run the layout algorithm. Paint each layer. Composite the layers. Every one of those stages takes time you can measure. Every one of them has a known set of failure modes. The Chrome DevTools Performance panel surfaces them by name; the rest of the week's tooling is a higher-level read on the same primitives.
2. **Three numbers describe most of what users feel.** Largest Contentful Paint (LCP) for "when did the main content appear?", Interaction to Next Paint (INP) for "when I tapped, when did the page respond?", and Cumulative Layout Shift (CLS) for "did things jump around while I was reading?" The web.dev framing of these as **loading, interactivity, and visual stability** is the framing your performance reviews will use.
3. **The measure-then-fix workflow is the workflow.** You do not optimize blindly. You profile, you find the bottleneck, you fix it, you profile again. Profiling in Chrome DevTools' Performance Insights panel (the 2024-rewrite of the legacy Performance panel) is the single most learnable skill in this discipline.
4. **The high-leverage fixes are a known menu.** Lazy-load images that are below the fold (`loading="lazy"`). Self-host or `preconnect` to your font origin and apply `font-display: swap`. Split routes with `React.lazy` (you did this in Week 8). Reserve space for media with `width` and `height` attributes so layout does not shift. Use `<link rel="preload">` for fonts, `<link rel="preconnect">` for third-party origins, `<link rel="prefetch">` for the next likely navigation. None of these are exotic; all of them are reading material on web.dev.

By Sunday, the deliverable is a **measure-then-fix report** on a deliberately-slow page provided in this week's mini-project. You will profile the page in three tools, identify the three biggest contributors to each vital, apply the fixes named in the lectures, re-profile, and submit before/after numbers. The point of the deliverable is the workflow, not the score: a 95-point Lighthouse run that you cannot reproduce is worth less than a 70-point run you can explain.

---

## Learning objectives

By the end of this week, you will be able to:

- **Describe** the five stages of the browser rendering pipeline — parse HTML into the DOM, parse CSS into the CSSOM, compute layout, paint each layer, composite the layers — and name a common bottleneck for each stage. Reference: <https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work> and <https://web.dev/articles/rendering-performance>.
- **Define** the three Core Web Vitals with their thresholds: **LCP** (good is under 2.5 s at the 75th percentile), **INP** (good is under 200 ms at the 75th percentile), **CLS** (good is under 0.1 at the 75th percentile). Cite the canonical reference at <https://web.dev/articles/vitals>.
- **Explain** what each vital actually measures: LCP is the render time of the largest in-viewport element; INP is the latency from the user's input to the next visible frame, taken at the 98th percentile of the session's interactions; CLS is the sum of unexpected layout-shift scores during the page's lifetime.
- **Measure** the three vitals in three different tools — **Chrome DevTools Performance Insights** (lab data, on your machine), **Lighthouse** (the synthetic audit), and the **`web-vitals` JavaScript library** (real-user measurement, which you wire to `console.log` for development and to an analytics endpoint for production). Read the docs at <https://developer.chrome.com/docs/devtools/performance/insights>, <https://developer.chrome.com/docs/lighthouse/overview>, and <https://github.com/GoogleChrome/web-vitals>.
- **Interpret** the **CrUX (Chrome User Experience Report)** dataset for any public URL via **PageSpeed Insights**, and distinguish the three numbers it reports: **field data** (real users, last 28 days, via CrUX), **lab data** (Lighthouse run in a synthetic environment), and **diagnostics** (specific opportunities Lighthouse spotted). Reference: <https://pagespeed.web.dev/> and the CrUX overview at <https://developer.chrome.com/docs/crux>.
- **Apply** native lazy-loading for images with `loading="lazy"`, understand the rules (offscreen images, the browser's heuristic for when to load, the interaction with `srcset` and `sizes`), and recognize when **eager** loading is the right call (the hero image, the LCP candidate). Reference: <https://web.dev/articles/browser-level-image-lazy-loading>.
- **Split** a React bundle with `React.lazy` plus `Suspense` plus dynamic `import()` (you did this in Week 8; this week you measure its effect on LCP and on the initial JS budget). Reference: <https://react.dev/reference/react/lazy>.
- **Use** the resource-hint family — `<link rel="preconnect">`, `<link rel="preload">`, `<link rel="prefetch">`, `<link rel="dns-prefetch">`, `<link rel="modulepreload">` — knowing which hint solves which delay. Reference: <https://web.dev/articles/preconnect-and-dns-prefetch> and <https://web.dev/articles/preload-critical-assets>.
- **Pick** a font-loading strategy — `font-display: swap` to avoid the invisible-text problem, self-hosted woff2 vs. the Google Fonts CSS API, the `<link rel="preload" as="font" crossorigin>` pattern that eliminates the second-paint flash — and apply it to the mini-project. Reference: <https://web.dev/articles/font-display> and <https://web.dev/articles/font-best-practices>.
- **Eliminate** layout shift caused by images, ads, embeds, and dynamically-injected content by reserving space with the `width` and `height` HTML attributes (the browser computes `aspect-ratio` from them), by using the `aspect-ratio` CSS property, and by reserving space for above-the-fold third-party content. Reference: <https://web.dev/articles/cls>.
- **Use** the `content-visibility` and `contain` CSS properties to skip layout and paint work on offscreen sections of the page. Recognize the trade-off (the browser may compute zero height for the section until it is needed, which itself can cause shift if you do not pair it with `contain-intrinsic-size`). Reference: <https://web.dev/articles/content-visibility>.
- **Run** the **measure-then-fix workflow**: profile the page, identify the single biggest contributor to the worst vital, apply the named fix, re-profile, repeat. Write the before/after numbers in a report. The discipline is what separates senior performance work from cargo-culted "best practices."
- **Defend** your performance decisions in the language of the docs. "The LCP image is now `<img fetchpriority='high'>` with a `<link rel='preload'>` because the LCP candidate is known at parse time" reads like an engineer who has done this before; "I added some preloads" does not.

---

## Prerequisites

You finished **Week 8 — State Management and Routing**. Concretely:

- A working multi-route React SPA, deployed to a public URL.
- You can read a `vite.config.js` and have built a production bundle (`npm run build`).
- You can open Chrome DevTools, find the Network tab, find the Performance tab, and find the Lighthouse tab. (If "find the Performance Insights panel" is new, that is fine; the lecture walks through opening it.)
- You have **Node.js 20+** and **npm 10+** installed. The mini-project uses Vite as a static-file server; you will not need to write a backend.

If any of those is shaky, return to Week 8 and finish the deploy step. The measurements this week assume a running site on a public URL.

---

## Topics covered

- The browser rendering pipeline — parse HTML, build the DOM, parse CSS, build the CSSOM, compute layout, paint, composite. What "render-blocking" means and which resources are render-blocking by default. The critical rendering path. Reference: <https://web.dev/articles/critical-rendering-path>.
- The three Core Web Vitals — LCP, INP, CLS — their definitions, their thresholds (2.5 s / 200 ms / 0.1 at the 75th percentile), and the metrics they replace or supplement (FCP, TTFB, TBT for lab use; FID for INP). Reference: <https://web.dev/articles/vitals>.
- The two kinds of data — **field** (real-user measurement via CrUX or via your own `web-vitals` shipping) and **lab** (Lighthouse, WebPageTest, DevTools' simulated throttle). Why they disagree and which one Google ranks on.
- The diagnostic toolchain — Chrome DevTools' **Performance Insights** panel (the 2024 rewrite that is now Chrome's recommended profiler), the legacy **Performance** panel, **Lighthouse** for synthetic audits, **PageSpeed Insights** for the public CrUX-plus-Lighthouse combined report, and the **`web-vitals.js`** library for real-user measurement.
- Image performance — `loading="lazy"`, `decoding="async"`, `fetchpriority="high"` for the LCP image, the `srcset` and `sizes` attributes for responsive images, modern formats (AVIF, WebP) and the `<picture>` element, the rule that **the LCP image must not be lazy**. Reference: <https://web.dev/articles/optimize-lcp> and <https://web.dev/articles/browser-level-image-lazy-loading>.
- JavaScript bundle strategy — code splitting with `React.lazy` plus dynamic `import()`, route-level chunks, the Vite `build.rollupOptions.output.manualChunks` knob for fine-grained control, the `import.meta.glob` API for batched imports, the difference between **defer** and **async** on `<script>` tags. Reference: <https://web.dev/articles/reduce-javascript-payloads-with-code-splitting>.
- Resource hints — `preconnect` (open the TCP/TLS handshake early to a known third-party origin), `dns-prefetch` (resolve DNS only — cheaper, useful for many origins), `preload` (download a resource that will be needed soon — fonts, hero images, critical CSS), `prefetch` (download a resource for the **next** navigation), `modulepreload` (the ES-module-aware version of preload). The rule "preconnect is cheap; preload is expensive — never preload more than three things." Reference: <https://web.dev/articles/preconnect-and-dns-prefetch>.
- Font loading — the four-stage FOIT/FOUT problem (block → swap → invisible-text fallback → final font), `font-display: swap` and its siblings (`block`, `fallback`, `optional`), self-hosting woff2 vs. the Google Fonts CSS API, the `<link rel="preload" as="font" type="font/woff2" crossorigin>` pattern, the `unicode-range` trick for subsetting. Reference: <https://web.dev/articles/font-best-practices>.
- Layout shift — what counts (an element that already painted moves to a new position), what does not count (user-initiated input within 500 ms), the score (impact fraction times distance fraction), the worst offenders (un-sized images, late-rendered ads, late-rendered embeds, font-swap that resizes the line box, content injected above the user's scroll position). Reference: <https://web.dev/articles/cls>.
- Defensive CSS — `aspect-ratio`, the implicit `aspect-ratio` derived from `width` and `height` HTML attributes on images, the `contain` family (`contain: layout`, `contain: paint`, `contain: content`), `content-visibility: auto` and its companion `contain-intrinsic-size`. Reference: <https://web.dev/articles/content-visibility>.
- The **measure-then-fix** workflow — profile, identify the worst vital, identify the single biggest contributor to it, apply the named fix, re-profile, compare. The discipline of writing the numbers down. The anti-pattern of changing five things at once.
- INP specifically — what makes a slow interaction (a long task on the main thread between the input event and the next paint), the **scheduler.yield()** API and the older `setTimeout(0)` trick to break up long tasks, the role of React's concurrent renderer in INP (`useTransition` and `useDeferredValue`), the role of input handlers that touch the DOM synchronously. Reference: <https://web.dev/articles/inp> and the INP announcement at <https://web.dev/blog/inp-cwv-march-12>.

---

## Tools you will need

| Tool                                  | Role                                                          | Cost |
| ------------------------------------- | ------------------------------------------------------------- | ---- |
| **Chrome** (current stable)           | The browser whose DevTools we will live in                    | Free |
| **Chrome DevTools — Performance Insights panel** | The 2024-rewrite profiler; the week's primary tool | Free |
| **Chrome DevTools — Lighthouse panel**| The synthetic audit                                           | Free |
| **Chrome DevTools — Network panel**   | Confirm chunk loading, see request timing                     | Free |
| **Chrome DevTools — Coverage panel**  | Find unused CSS and JavaScript                                | Free |
| **PageSpeed Insights**                | CrUX field data plus Lighthouse on a public URL               | Free |
| **the `web-vitals` npm package**      | Real-user measurement library from the Chrome team            | Free |
| **the CrUX dashboard (BigQuery / Looker Studio)** | Real-user data for any public origin                | Free |
| **Vite**                              | The dev server and bundler from Week 7                        | Free |
| **WebPageTest** (optional)            | A second synthetic audit tool with deeper network options     | Free |

No paid services. No paid tutorial platforms. The three doc sites — **web.dev/articles**, **developer.chrome.com/docs/devtools**, and **MDN's Performance reference** — are the canonical references for this week and the lectures cite them by page.

---

## Weekly schedule

The schedule below adds up to approximately **36 hours**. Treat it as a target. The rendering-pipeline lecture is the densest read; budget time for it Monday.

| Day       | Focus                                                  | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|--------------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | Rendering pipeline, the three vitals                   |    3h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Tuesday   | DevTools Performance Insights, Lighthouse, web-vitals  |    2h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     6h      |
| Wednesday | Image, font, and bundle fixes                          |    2h    |    2h     |     1h     |    0.5h   |   1h     |     1h       |    0h      |     7.5h    |
| Thursday  | INP and layout-shift; mini-project profiling pass      |    1h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     7h      |
| Friday    | Mini-project — apply fixes, measure each one           |    0h    |    0h     |     0h     |    0.5h   |   1h     |     3h       |    0.5h    |     5h      |
| Saturday  | Mini-project — write the report                        |    0h    |    0h     |     0h     |    0h     |   1h     |     2h       |    0h      |     3h      |
| Sunday    | Quiz, polish, re-profile, submit                       |    0h    |    0h     |     0h     |    0.5h   |   0h     |     1h       |    0h      |     1.5h    |
| **Total** |                                                        | **8h**   | **7h**    | **2h**     | **3h**    | **6h**   | **9h**       | **2h**     | **37h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | web.dev, MDN, Chrome DevTools docs, the INP announcement |
| [lecture-notes/01-rendering-pipeline-and-the-three-vitals.md](./lecture-notes/01-rendering-pipeline-and-the-three-vitals.md) | Parse → CSSOM → layout → paint → composite. LCP, INP, CLS defined. |
| [lecture-notes/02-measure-with-devtools-lighthouse-and-web-vitals.md](./lecture-notes/02-measure-with-devtools-lighthouse-and-web-vitals.md) | Performance Insights, Lighthouse, the `web-vitals` library, PageSpeed Insights, CrUX |
| [lecture-notes/03-the-fix-menu-images-fonts-bundles-shifts.md](./lecture-notes/03-the-fix-menu-images-fonts-bundles-shifts.md) | The named fixes: lazy images, code splitting, preconnect/preload/prefetch, font-display, width/height, contain |
| [exercises/exercise-01-profile-a-page.md](./exercises/exercise-01-profile-a-page.md) | Profile a public site (your portfolio or a chosen target) in three tools; submit the numbers |
| [exercises/exercise-02-lazy-and-preload.md](./exercises/exercise-02-lazy-and-preload.md) | Apply `loading="lazy"`, `fetchpriority="high"`, and `<link rel="preload">` to a static page; measure before and after |
| [exercises/exercise-03-web-vitals-instrumentation.md](./exercises/exercise-03-web-vitals-instrumentation.md) | Wire the `web-vitals` library into a Vite project; log to console and to a stub analytics endpoint |
| [exercises/SOLUTIONS.md](./exercises/SOLUTIONS.md) | Reference solutions with annotated explanations |
| [challenges/challenge-01-inp-budget.md](./challenges/challenge-01-inp-budget.md) | Diagnose and fix a deliberately-slow input handler; bring INP under 200 ms |
| [challenges/challenge-02-cls-zero.md](./challenges/challenge-02-cls-zero.md) | Take a page with CLS over 0.25 and reduce it to under 0.1 with `width`, `height`, and `aspect-ratio` |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | The slow-page audit: a deliberately-slow page that you profile and optimize |
| [mini-project/starter/index.html](./mini-project/starter/index.html) | The intentionally-slow starter page |
| [mini-project/starter/styles.css](./mini-project/starter/styles.css) | The starter styles (with one render-blocking choice on purpose) |
| [mini-project/starter/app.js](./mini-project/starter/app.js) | The starter JavaScript (with one long task on purpose) |
| [mini-project/starter/rubric.md](./mini-project/starter/rubric.md) | The grading rubric for the audit report |

The recommended order:

1. Read all three lectures (Monday–Wednesday).
2. Do the three exercises (Monday–Wednesday).
3. Take the quiz (Wednesday evening). If you score under 7, re-read.
4. Pick a challenge (Thursday).
5. Work through the homework problems alongside the mini-project (Thursday–Saturday).
6. Ship the mini-project audit (Friday–Sunday).

---

## Stretch goals

If you finish early and want to push further, try any of these:

- Read **web.dev — "Optimize LCP"** end to end at <https://web.dev/articles/optimize-lcp>. The article enumerates every contributing factor in the order the team prioritizes them; the diagram alone is worth the read.
- Read **web.dev — "Optimize INP"** at <https://web.dev/articles/optimize-inp>. The 2024 series is the single best source on the metric Google added in March 2024.
- Read **web.dev — "Optimize CLS"** at <https://web.dev/articles/optimize-cls>. The "anatomy of a layout shift" diagrams will save you in your first real CLS investigation.
- Read **Chrome for Developers — Performance Insights overview** at <https://developer.chrome.com/docs/devtools/performance/insights>. The panel was rewritten in 2024 and the new docs are short.
- Run **WebPageTest** (<https://www.webpagetest.org/>) on the same URL you tested in PageSpeed Insights. Compare the waterfall and the filmstrip. WebPageTest's "Connection: 4G" trace shows you the same page on a slower simulated network.
- Read **MDN — "How browsers work"** at <https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work>. The browser-internals view of the same pipeline our lectures walk.
- Read **Addy Osmani — "The Three Pillars of a Fast Site"** on web.dev or his blog. Addy leads Chrome's UX engineering and the writing is the practitioner's view.
- Browse **<https://httparchive.org/reports/state-of-the-web>** to see the real-world distribution of the three vitals across millions of sites. The "what does a typical site look like?" baseline calibrates your judgment.

---

## What this week is NOT

A few things to set expectations:

- **Not a backend-performance week.** TTFB (Time to First Byte) is a piece of LCP, and we will name it, but server-side render-time, database query optimization, and CDN configuration are out of scope. Those land in C8 W12 (Next.js + SSR) and partly in C14 (backend track).
- **Not a CSS-animation-performance week.** GPU compositing, the `will-change` property, and `transform`-based 60fps animation are mentioned in the rendering-pipeline lecture and the resources, but the deep dive on jank lives in a future module.
- **Not a service-worker / offline week.** Service workers, PWAs, and the Cache Storage API are scheduled for C8 W11 (PWA module). Some performance discussion of service-worker caching is unavoidable; we point at it and move on.
- **Not a JavaScript-language-performance week.** Microbenchmarks of `forEach` vs. `for` loops are not the level of this week. The level of this week is "long tasks block INP; here is how to find them."
- **Not a bundle-analyzer deep dive.** We will name `rollup-plugin-visualizer` and `vite-bundle-visualizer` and use them; we will not spend a lecture on Webpack module federation or esbuild plugin authoring.

---

## A word on the editorial voice

Performance writing on the web is split between two camps. The **synthetic-audit camp** chases Lighthouse scores, fixes whatever Lighthouse complains about, and ships when the bar goes green. The **field-data camp** instruments real users with `web-vitals`, ships to production, and waits for the 28-day CrUX window to fill. **Both are right, partially.** Lighthouse is a fast, repeatable signal you can run in CI; it does not see the user on a budget Android phone in Lagos. CrUX sees the user in Lagos but it is 28 days behind your last deploy. This week treats lab and field as complementary, not competing, and the homework asks you to read both for the same page.

You will also notice the lectures take a position on the **order** of fixes. The order is: (1) measure first, (2) fix the largest single contributor to the worst vital, (3) measure again, (4) repeat. The anti-pattern of "I added preloads, lazy-loading, and a service worker in one PR" is what the week is partly designed to inoculate against. A single fix per change, measured before and after, is the workflow that scales to a team.

---

## Up next

Continue to [Week 10 — TypeScript](../week-10-typescript/) once you have shipped the mini-project audit report, your LCP on the optimized page is under 2.5 s in Lighthouse mobile-throttled mode, your CLS is under 0.1, your INP — measured with a slow interaction you deliberately wrote — is under 200 ms, and your homework answers cite three or more web.dev or DevTools docs URLs.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
