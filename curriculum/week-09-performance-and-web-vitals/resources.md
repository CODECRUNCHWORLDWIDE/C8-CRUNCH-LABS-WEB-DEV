# Week 9 — Resources

Every resource here is **free** and **publicly accessible**.

## Primary sources

- **web.dev — Core Web Vitals overview** — the canonical definition of LCP, INP, and CLS and the thresholds the rest of the ecosystem agrees on. <https://web.dev/articles/vitals>
- **web.dev — Optimize Largest Contentful Paint** — the fully-enumerated guide to lowering LCP. Read end to end once. <https://web.dev/articles/optimize-lcp>
- **web.dev — Optimize Interaction to Next Paint** — the post-March-2024 guide to the responsiveness vital. <https://web.dev/articles/optimize-inp>
- **web.dev — Optimize Cumulative Layout Shift** — the diagrams alone are worth the read. <https://web.dev/articles/optimize-cls>
- **web.dev — "INP is now a Core Web Vital"** — the March 2024 announcement that retired FID. <https://web.dev/blog/inp-cwv-march-12>
- **web.dev — The performance score** — how Lighthouse weights each metric into the single 0-to-100 number. <https://developer.chrome.com/docs/lighthouse/performance/performance-scoring>
- **web.dev — Critical rendering path** — the parse → CSSOM → layout → paint → composite sequence the rest of the week builds on. <https://web.dev/articles/critical-rendering-path>
- **web.dev — Render-blocking resources** — what counts as render-blocking and how to defer or eliminate it. <https://web.dev/articles/render-blocking-resources>
- **web.dev — Reduce JavaScript payloads with code splitting** — the general case for dynamic `import()`. <https://web.dev/articles/reduce-javascript-payloads-with-code-splitting>
- **web.dev — Browser-level image lazy-loading** — the `loading="lazy"` attribute, the heuristic, the gotchas. <https://web.dev/articles/browser-level-image-lazy-loading>
- **web.dev — preconnect and dns-prefetch** — the cheaper resource hints and when to use which. <https://web.dev/articles/preconnect-and-dns-prefetch>
- **web.dev — Preload critical assets** — the `<link rel="preload">` family. The "do not preload more than three things" rule. <https://web.dev/articles/preload-critical-assets>
- **web.dev — Prefetch resources** — `<link rel="prefetch">` for the next likely navigation. <https://web.dev/articles/link-prefetch>
- **web.dev — Best practices for fonts** — `font-display`, self-hosting woff2, preloading fonts, the unicode-range trick. <https://web.dev/articles/font-best-practices>
- **web.dev — `font-display`** — the four values (`block`, `swap`, `fallback`, `optional`) and the trade-off each makes. <https://web.dev/articles/font-display>
- **web.dev — Optimize CLS — anatomy of a layout shift** — the impact-fraction-times-distance-fraction formula. <https://web.dev/articles/cls>
- **web.dev — `content-visibility`** — the CSS property that skips rendering work for offscreen sections. <https://web.dev/articles/content-visibility>

## Chrome DevTools docs

- **Chrome DevTools — Performance Insights overview** — the 2024-rewrite profiler, now Chrome's recommended starting point. <https://developer.chrome.com/docs/devtools/performance/insights>
- **Chrome DevTools — Performance panel reference** — the legacy detailed profiler. Still where you go for flame charts. <https://developer.chrome.com/docs/devtools/performance>
- **Chrome DevTools — Lighthouse overview** — how to run the audit and read the report. <https://developer.chrome.com/docs/lighthouse/overview>
- **Chrome DevTools — Network panel** — request waterfall, timing breakdown, throttling. <https://developer.chrome.com/docs/devtools/network>
- **Chrome DevTools — Coverage tab** — find unused CSS and JavaScript at runtime. <https://developer.chrome.com/docs/devtools/coverage>
- **Chrome DevTools — Throttling** — simulate slow CPU and slow network. The "mid-tier mobile" CPU throttle is 4x; the "Slow 4G" network throttle is the default. <https://developer.chrome.com/docs/devtools/performance/reference#throttle>
- **Chrome for Developers — Diagnosing long tasks** — the LongTasks API and how to find the offenders in DevTools. <https://developer.chrome.com/docs/devtools/performance/reference#main>

## The measurement libraries

- **`web-vitals` on GitHub** — the official Chrome-team library for measuring the three vitals (plus FCP and TTFB) from real users in production. <https://github.com/GoogleChrome/web-vitals>
- **`web-vitals` on npm** — `npm install web-vitals`. <https://www.npmjs.com/package/web-vitals>
- **`web-vitals` — Attribution build** — the build that ships extra diagnostic info (which element was the LCP, which interaction was the worst INP). <https://github.com/GoogleChrome/web-vitals#attribution-build>
- **PageSpeed Insights** — paste a URL, get the field data (CrUX) plus the lab data (Lighthouse) in one report. <https://pagespeed.web.dev/>
- **The Chrome User Experience Report (CrUX)** — the public dataset of real-user Core Web Vitals data, updated monthly. <https://developer.chrome.com/docs/crux>
- **CrUX on BigQuery** — query the raw dataset. Free up to BigQuery's monthly free tier. <https://developer.chrome.com/docs/crux/bigquery>
- **CrUX Dashboard (Looker Studio template)** — a one-click dashboard for any public origin. <https://developer.chrome.com/docs/crux/dashboard>
- **WebPageTest** — the alternative synthetic audit, with deeper network and connection options. <https://www.webpagetest.org/>

## MDN reference

- **MDN — How browsers work** — the browser-internals view of the rendering pipeline. <https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work>
- **MDN — Performance API** — the in-page measurement primitives (`PerformanceObserver`, `performance.now()`, the navigation and resource entries). <https://developer.mozilla.org/en-US/docs/Web/API/Performance_API>
- **MDN — Largest Contentful Paint API** — the underlying API the `web-vitals` library wraps. <https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint>
- **MDN — Event Timing API** — the underlying API for INP measurement. <https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEventTiming>
- **MDN — Layout Instability API** — the underlying API for CLS measurement. <https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift>
- **MDN — `<img>` loading attribute** — the spec-level reference for `loading="lazy"` and `loading="eager"`. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading>
- **MDN — `<img>` `decoding` attribute** — `decoding="async"` for off-thread image decode. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#decoding>
- **MDN — `<img>` `fetchpriority` attribute** — the `high` value for the LCP image. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#fetchpriority>
- **MDN — Responsive images** — `srcset`, `sizes`, the `<picture>` element. <https://developer.mozilla.org/en-US/docs/Web/HTML/Responsive_images>
- **MDN — `<link>` `rel` values** — every link rel including `preconnect`, `preload`, `prefetch`, `dns-prefetch`, `modulepreload`. <https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel>
- **MDN — `<link rel="preload">`** — the per-as reference (`as="font"`, `as="image"`, `as="script"`, `as="style"`). <https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload>
- **MDN — `font-display`** — the CSS at-rule descriptor and its four values. <https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display>
- **MDN — `aspect-ratio`** — the CSS property and the implicit aspect ratio from `width` and `height` attributes. <https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio>
- **MDN — `contain`** — the CSS containment property and its values. <https://developer.mozilla.org/en-US/docs/Web/CSS/contain>
- **MDN — `content-visibility`** — the property that skips rendering work for offscreen content. <https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility>
- **MDN — Long Tasks API** — the API that surfaces tasks over 50 ms. <https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API>
- **MDN — `requestIdleCallback`** — the cooperative scheduling primitive used to break up long tasks. <https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback>

## Practical writing

- **Addy Osmani — "The Three Pillars of a Fast Site"** on web.dev. The practitioner overview. Search the title; Addy leads Chrome's UX engineering team.
- **web.dev — "Largest Contentful Paint, in depth"** — the talk-style follow-up to the LCP guide. <https://web.dev/articles/lcp>
- **web.dev — "Find slow interactions in the field"** — the field-debugging companion to "Optimize INP." <https://web.dev/articles/find-slow-interactions-in-the-field>
- **web.dev — "Debug INP in the lab"** — the lab-debugging companion. <https://web.dev/articles/debug-performance-in-the-field>
- **web.dev — "What's new in DevTools"** — the changelog that lets you keep up with the Performance Insights panel. <https://developer.chrome.com/blog/new-in-devtools>
- **web.dev — "A new way to slow down the CPU in DevTools"** — the calibrated CPU throttle from the 2023 redesign. <https://developer.chrome.com/blog/new-in-devtools-115>

## Specs cited this week

- **W3C — Largest Contentful Paint** specification. <https://www.w3.org/TR/largest-contentful-paint/>
- **W3C — Event Timing API** specification (the INP backing API). <https://www.w3.org/TR/event-timing/>
- **W3C — Layout Instability API** specification (the CLS backing API). <https://www.w3.org/TR/layout-instability/>
- **WHATWG — Loading and rendering algorithm in the HTML standard** — what the browser does when it parses an HTML document. <https://html.spec.whatwg.org/multipage/parsing.html>
- **W3C — CSS Containment Module Level 2** — the `contain` and `content-visibility` properties. <https://www.w3.org/TR/css-contain-2/>

## Documentation for the packages and tools you will install or use

- **`web-vitals`** — `npm install web-vitals`. <https://www.npmjs.com/package/web-vitals>
- **`vite-bundle-visualizer`** — `npm install --save-dev vite-bundle-visualizer`. The optional bundle analyzer for the homework. <https://www.npmjs.com/package/vite-bundle-visualizer>
- **`rollup-plugin-visualizer`** — the lower-level visualizer Vite wraps. <https://www.npmjs.com/package/rollup-plugin-visualizer>
- **`@unhead/vue`** / **`react-helmet-async`** — the head-management libraries for adding `<link rel="preload">` in a SPA. <https://github.com/staylor/react-helmet-async>

## Optional: the deeper performance reading

- **Smashing Magazine — "Front-End Performance Checklist 2024"** — the encyclopedic checklist, updated yearly. Free. <https://www.smashingmagazine.com/2024/02/front-end-performance-checklist-2024-pdf-pages/>
- **MDN — Performance** index — a clearinghouse of all MDN performance articles. <https://developer.mozilla.org/en-US/docs/Web/Performance>
- **Web Almanac (HTTP Archive) — Performance chapter** — the annual real-world report on what the web actually ships. <https://almanac.httparchive.org/en/2024/performance>
- **Calibre — Performance metric guides** — Calibre is a paid product; their free metric explainers are excellent. <https://calibreapp.com/docs/metrics>

---

If you read **only three things** this week, read:

1. **web.dev — Core Web Vitals overview** — the four-paragraph framing of what we are optimizing for and why. <https://web.dev/articles/vitals>
2. **Chrome DevTools — Performance Insights overview** — the panel you will use every day this week. <https://developer.chrome.com/docs/devtools/performance/insights>
3. **web.dev — Optimize LCP** — the most consequential vital and the article that names every fix we apply. <https://web.dev/articles/optimize-lcp>

Everything else here is reference. Return to it when the report says your INP is 380 ms and you do not yet know why.
