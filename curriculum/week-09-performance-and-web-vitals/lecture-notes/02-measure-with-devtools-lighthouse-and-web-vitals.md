# Lecture 2 — Measure: DevTools, Lighthouse, and web-vitals.js

> Reading time: ~50 minutes. Cite the **Chrome DevTools Performance Insights** docs at <https://developer.chrome.com/docs/devtools/performance/insights>, the **Lighthouse overview** at <https://developer.chrome.com/docs/lighthouse/overview>, the **`web-vitals` README** at <https://github.com/GoogleChrome/web-vitals>, **PageSpeed Insights** at <https://pagespeed.web.dev/>, and the **CrUX overview** at <https://developer.chrome.com/docs/crux>. The lecture's central claim is that one tool is not enough — you need a lab profiler for diagnosing, a synthetic audit for the CI gate, and a real-user library for the truth. We walk all three, with the workflow of how they fit together.

---

## 1. The tools, in one sentence each

Before the details, the map:

- **Chrome DevTools — Performance Insights panel.** Lab profiler. Open the panel, click record, reload the page; the panel shows the rendering pipeline frame by frame, names the LCP element, and lists each layout shift. Where you diagnose a specific page on your own machine.
- **Chrome DevTools — Lighthouse panel.** Synthetic audit. Open the panel, click "Analyze page load"; Lighthouse opens a fresh tab, loads the page on a simulated slow network and slow CPU, runs every audit, and produces a four-bar score (Performance, Accessibility, Best Practices, SEO). The thing your CI runs.
- **`web-vitals` JavaScript library.** Real-user measurement. Install `web-vitals` from npm, wire `onLCP`, `onINP`, `onCLS` callbacks at boot, ship the data to your analytics endpoint. The truth about real users on real devices, with a 28-day lag in CrUX or with whatever lag your analytics pipeline has.
- **PageSpeed Insights.** Combined report on any public URL. Pastes CrUX's field data (real users, last 28 days) and Lighthouse's lab data (a fresh synthetic run) into one page. Where you go when someone asks "is this page fast?" and you do not have access to its source.
- **CrUX (Chrome User Experience Report).** The public dataset of real-user Core Web Vitals data from Chrome users who opted into reporting. Updated monthly. Queryable in BigQuery; visualized in PageSpeed Insights; charted in the CrUX dashboard. The closest thing the web has to a public-utility performance dataset.

Each tool sees a different slice of the truth. The discipline is knowing which tool to reach for when.

---

## 2. Chrome DevTools — Performance Insights

The **Performance Insights** panel is Chrome DevTools' 2024-rewrite profiler. It replaces the legacy Performance panel as Chrome's recommended starting point for diagnosing a slow page. The legacy panel still exists (and is still richer for advanced flame-chart work), but Performance Insights is faster to read, opinionated about what matters, and presents the three Core Web Vitals as first-class panels. Reference: <https://developer.chrome.com/docs/devtools/performance/insights>.

### 2.1 Opening the panel

In Chrome:

1. Open the page you want to profile.
2. Open DevTools (Cmd-Option-I on Mac, Ctrl-Shift-I on Windows/Linux, or right-click → Inspect).
3. Click the **three dots** in the top-right of DevTools → More tools → **Performance insights**. Or click the gear → More tools and check "Performance insights" if it is hidden.
4. Set the **CPU** throttle to "4x slowdown" (the "mid-tier mobile" default) and the **Network** throttle to "Slow 4G". These are the defaults that mirror what real users on average mobile devices experience.

The panel opens with two main areas: the **Insights** sidebar on the left (a list of named issues Chrome detected on the trace) and the **timeline** on the right (the frame-by-frame view of what the browser did).

### 2.2 Recording a trace

To record:

1. Click the circular **Record** button.
2. Reload the page (Cmd-R / Ctrl-R) or perform the interaction you want to measure.
3. Click **Stop**.

The panel shows the trace immediately. Two key elements appear:

- A **filmstrip** at the top — screenshots at regular intervals, so you can see what the user saw.
- A **timeline** below — the actual rendering pipeline, with categories for "Network," "Frames," "Main thread," and "GPU."

### 2.3 The Insights sidebar

The Insights sidebar is the value of the rewrite. Chrome runs a set of detectors on the trace and surfaces the named problems. Examples of insights:

- **Largest Contentful Paint by phase.** A bar chart of the four LCP phases (TTFB, resource load delay, resource load time, element render delay), color-coded by which is the biggest contributor. Clicking the insight scrolls the timeline to the relevant frames and highlights the LCP element.
- **Render-blocking requests.** A list of scripts and stylesheets that blocked the first paint. Clicking each one names the request and shows when it loaded.
- **Long tasks.** Tasks on the main thread over 50 ms. Each one is a potential INP offender if the user interacts during it. The insight links to the task's call stack so you can see the offending function.
- **Layout shifts.** Each individual shift recorded on the page, with its score, its prior position, and its new position. Clicking the shift highlights the moved element in the page screenshot.
- **Forced reflows.** Times when JavaScript forced the layout algorithm to run synchronously (a read-after-write on `offsetHeight`, for instance). Common cause of jank.

For the LCP insight specifically, the panel surfaces the answer to "why is my LCP slow?" in one chart. **This is the single most useful view in the entire toolchain.** Spend ten minutes the first time you open it; the time pays back the next ten times you use it.

### 2.4 Reading the LCP insight

When you click the LCP insight, the panel shows:

> **LCP — 3.2 s**
>
> Largest Contentful Paint element: `<img class="hero" src="/hero.jpg">`
>
> Phases:
> - TTFB: 380 ms (12%)
> - Resource load delay: 1620 ms (51%)
> - Resource load time: 980 ms (31%)
> - Element render delay: 220 ms (7%)

The phase breakdown points at the fix. Here the load delay is 51% of LCP — that is the "the browser did not start fetching the image until late" phase, and the fix is `<link rel="preload" as="image">` or moving the `<img>` earlier in the HTML so the parser discovers it sooner.

### 2.5 Reading the INP insight

Performance Insights includes a panel for **Interactions**. Each click, tap, or keypress recorded during the trace appears as a horizontal bar. The bar's color and length indicate the latency. Clicking an interaction shows its three phases:

- **Input delay** (yellow) — main thread busy when the input arrived.
- **Processing time** (red) — the event handler's execution.
- **Presentation delay** (blue) — the post-handler style/layout/paint.

The interaction with the worst total is the one your INP reflects. The panel will name the listener that ran, the lines of code (sourcemapped if available), and the next frame's paint event.

### 2.6 Reading the CLS insight

The Layout shifts insight lists each individual shift. For each one:

- The **shift score** (the contribution to CLS).
- The **moved element** — clicking highlights it in the page screenshot.
- The **prior position** and **new position**.

The most common offenders this insight surfaces: an `<img>` without dimensions arriving, a font swapping after first paint, an ad slot filling, a banner being injected.

### 2.7 Throttling

The default DevTools throttle settings are:

- **CPU: 4x slowdown.** Simulates a mid-tier mobile CPU. This is the "Moto G4-ish" baseline.
- **Network: Slow 4G.** ~400 Kbps down, ~400 Kbps up, 400 ms RTT.

These are deliberately worse than what a developer machine experiences on home Wi-Fi. Profiling on the fast laptop, on home Wi-Fi, with no throttle, will produce numbers that have nothing to do with the user's reality. **Always throttle.** The web.dev team has been explicit on this since 2018.

For a sanity check, "No throttling" is useful once — to see the absolute floor of what is possible. The optimization work happens at "Slow 4G + 4x CPU."

---

## 3. Lighthouse

Lighthouse is a **synthetic audit**. It loads your page in a controlled environment — a fresh Chrome instance, an empty cache, a simulated slow network, a throttled CPU — runs a battery of audits, and produces a single 0-to-100 Performance score plus the diagnostic breakdown.

Lighthouse is the easiest way to get a baseline number you can reproduce. It is also the metric the world (PageSpeed Insights' lab score, Chrome's "Lighthouse" badge in DevTools) reports on a public URL. Reference: <https://developer.chrome.com/docs/lighthouse/overview>.

### 3.1 Running Lighthouse

In Chrome:

1. Open the page.
2. Open DevTools → **Lighthouse** panel.
3. Pick the **Mobile** device and the **Performance** category (uncheck the others for now).
4. Click **Analyze page load**.

Lighthouse opens a new tab, loads the page from scratch (cache cleared), waits for it to settle, runs the audits, and produces the report.

### 3.2 Reading the Performance score

The Performance score is a weighted combination of six metrics:

| Metric | Weight (Lighthouse 10+) |
|--------|-------------------------|
| First Contentful Paint (FCP) | 10% |
| Speed Index | 10% |
| Largest Contentful Paint (LCP) | 25% |
| Total Blocking Time (TBT) | 30% |
| Cumulative Layout Shift (CLS) | 25% |
| (legacy) Time to Interactive (TTI) | 0% (removed in v10) |

Each metric is scored 0–100 against a curve calibrated on real-world data. The weighted sum is the Performance number. Reference: <https://developer.chrome.com/docs/lighthouse/performance/performance-scoring>.

**TBT (Total Blocking Time)** is Lighthouse's proxy for INP. Lighthouse cannot measure INP directly — there is no user to interact during a synthetic audit — so it instead measures how much time during page load the main thread was blocked by long tasks. A page with no long tasks during load has TBT 0 and (typically) low INP in the field. A page with lots of blocking work has high TBT and almost-always has problematic INP. The correlation is imperfect; TBT is the best lab signal we have.

A Lighthouse score of **90+** on mobile is "good." **50–89** is "needs improvement." **Under 50** is "poor." These are the same colored bands you see in the score circle.

### 3.3 Reading the diagnostic opportunities

Below the score, Lighthouse lists **Opportunities** (named fixes with estimated savings) and **Diagnostics** (named problems without a confident savings estimate). The top opportunities for a typical "needs improvement" page:

- **Eliminate render-blocking resources.** Names every `<link rel="stylesheet">` and `<script>` (without `async`/`defer`) that blocked first paint. Estimated savings in ms.
- **Properly size images.** Names images served at a larger resolution than they display. Estimated savings in KB.
- **Defer offscreen images.** Names below-the-fold images that should have `loading="lazy"`.
- **Serve images in next-gen formats.** Names JPEGs and PNGs that should be AVIF or WebP.
- **Reduce unused JavaScript.** Names bundles where a large fraction was downloaded but never executed.
- **Avoid enormous network payloads.** Total page weight over 4 MB triggers this.
- **Minimize main-thread work.** Total main-thread time over 4 s triggers this.

Each opportunity links to a web.dev article with the named fix.

### 3.4 Lighthouse limitations

Lighthouse is reproducible, fast, and free. It is not, however, the truth about real users. Reasons:

- **Single environment.** Lighthouse runs on one network profile, one CPU profile, one geography. Real users span all three.
- **Cold cache only.** Every Lighthouse run starts with an empty cache. Real users return.
- **No interactions.** Lighthouse cannot measure INP. TBT is a proxy.
- **The audits are imperfect.** Some "opportunities" are not worth chasing (the estimated savings can be wildly off). Some real problems Lighthouse does not detect.

Use Lighthouse for **the reproducible CI gate**, for **the synthetic audit on a PR**, and for **the initial diagnosis on a page you have just loaded for the first time**. Use field data — `web-vitals` or CrUX — for the truth.

### 3.5 Lighthouse on the command line

Lighthouse runs in DevTools, in CI, and from the command line:

```bash
npm install -g lighthouse
lighthouse https://example.com --view --preset=desktop
lighthouse https://example.com --view --form-factor=mobile --throttling-method=simulate
```

The `--view` flag opens the HTML report in your browser. The CLI is the right tool when you want to script audits, or want to compare two URLs head to head, or want to integrate Lighthouse into a CI pipeline. The **Lighthouse CI** project (<https://github.com/GoogleChrome/lighthouse-ci>) is the production-ready CI integration; we will not install it this week, but it is on the menu for a real project.

---

## 4. The `web-vitals` library

`web-vitals` is the official JavaScript library from the Chrome team for measuring the three Core Web Vitals (plus FCP and TTFB) in real-user code. Install with `npm install web-vitals`. The library wraps the underlying browser APIs — `LargestContentfulPaint`, `LayoutShift`, `PerformanceEventTiming` — and produces a single callback-per-metric API. Reference: <https://github.com/GoogleChrome/web-vitals>.

### 4.1 The minimum integration

The four-line integration:

```js
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP((metric) => console.log("LCP:", metric.value, metric));
onINP((metric) => console.log("INP:", metric.value, metric));
onCLS((metric) => console.log("CLS:", metric.value, metric));
```

Wire this into your app's entry point (`src/main.jsx` in a Vite + React project). Open the page. Open DevTools' Console. You will see the LCP and CLS reported within a few seconds; the INP reports as the user interacts.

Each callback receives a `metric` object with:

- `name` — `"LCP"`, `"INP"`, `"CLS"`, `"FCP"`, `"TTFB"`.
- `value` — the metric value (in milliseconds for LCP/INP/FCP/TTFB; dimensionless for CLS).
- `rating` — `"good"`, `"needs-improvement"`, or `"poor"`, computed against the published thresholds.
- `delta` — the change since the last callback. CLS and INP can update multiple times; `delta` is what changed.
- `id` — a unique id for this metric measurement; useful when shipping to analytics so you can dedupe.
- `entries` — the underlying browser API entries that produced the value. The LCP entry, for instance, has the actual DOM element that was the LCP candidate.

### 4.2 The attribution build

The standard `web-vitals` build gives you the metric values. The **attribution build** gives you the diagnostic information: which element was the LCP, which interaction was the worst INP, which layout shift contributed the most to CLS. Use it whenever you are trying to debug a real-user problem from real-user data.

```js
import { onLCP, onINP, onCLS } from "web-vitals/attribution";

onLCP((metric) => {
  const { element, url, timeToFirstByte, resourceLoadDelay, resourceLoadDuration, elementRenderDelay } = metric.attribution;
  console.log("LCP:", metric.value, { element, url });
  console.log("LCP phases:", { timeToFirstByte, resourceLoadDelay, resourceLoadDuration, elementRenderDelay });
});
```

The attribution build is slightly larger (about 4 KB instead of 2 KB minified+gzipped). For production, the trade-off is almost always worth it: the diagnostic information is the entire point of shipping field data.

Reference: <https://github.com/GoogleChrome/web-vitals#attribution-build>.

### 4.3 Shipping the data

In production you do not `console.log` the metrics. You ship them to an analytics endpoint. The Chrome team's recommended pattern uses `navigator.sendBeacon` (or `fetch` with `keepalive: true`) so the request survives page unload:

```js
import { onLCP, onINP, onCLS } from "web-vitals/attribution";

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    page: location.pathname,
    // attribution fields if you want them
    element: metric.attribution?.element?.outerHTML?.slice(0, 200),
  });

  // Prefer sendBeacon; fall back to fetch with keepalive
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/_analytics/web-vitals", body);
  } else {
    fetch("/_analytics/web-vitals", { body, method: "POST", keepalive: true });
  }
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

`sendBeacon` is the right tool for telemetry on page unload — the browser guarantees the request fires even if the page is closing. The `keepalive` option on `fetch` is the same behavior. Either is fine.

### 4.4 The reporting cadence

A subtle thing about the library: **CLS and INP report multiple times.** The values are cumulative, so each callback says "here is the current value, which is the running total or the worst-yet." The library's design is that you ship to your endpoint at strategic moments — typically on `visibilitychange` going to `"hidden"`, which fires when the user backgrounds the tab or navigates away.

The `web-vitals` library handles this for you when you use the simple `onLCP` / `onINP` / `onCLS` API: each callback is debounced and final values are sent when the page is about to unload. The internal logic is correct out of the box; you do not need to add your own debounce. Trust it.

### 4.5 What `web-vitals` is and is not

`web-vitals` is the **client-side** instrumentation. It tells you, for the current user, what their LCP/INP/CLS values are. It does **not** aggregate across users — you ship the data to your analytics, and your analytics aggregates.

For aggregated data **across the entire web**, see CrUX (next section). For aggregated data **for your own domain**, ship `web-vitals` data to your own analytics or use a service that does it for you (Vercel Speed Insights, Cloudflare Analytics, Calibre, SpeedCurve — most have free tiers; we are not going to choose one this week, but you should know they exist).

---

## 5. PageSpeed Insights

**PageSpeed Insights** is the free Google-hosted tool that combines field data (CrUX) with lab data (Lighthouse) for any public URL. Paste a URL, get a report. <https://pagespeed.web.dev/>.

The report has two top-level sections, one for **Mobile** and one for **Desktop**, each with:

1. **Core Web Vitals Assessment.** The field-data verdict for the page (or origin) from the last 28 days of CrUX. The three metrics are displayed with their distribution (the share of users in green / yellow / red) and the 75th-percentile value. A page passes when LCP, INP, and CLS are all in the green at the 75th percentile.
2. **Diagnose performance issues.** A fresh Lighthouse run. Same Performance score and same opportunities you see in DevTools' Lighthouse panel. The number can disagree with the field-data number; the page reports both.

PSI is the right tool when:

- You want to check a page you do not own. (You cannot run `web-vitals` on a competitor's page; you can paste their URL into PSI.)
- You want a quick, public report you can share in a Slack message.
- You want CrUX field data without running BigQuery yourself.

PSI is not the right tool when:

- You want to drill into the trace of why a specific frame on your own page was slow. (Use DevTools Performance Insights.)
- You want field data segmented by your own dimensions (page type, user country, A/B variant). (Use your own analytics pipeline with `web-vitals`.)

### 5.1 Reading the CrUX panel in PSI

PSI's CrUX panel reports, for each of the three vitals:

> **LCP**
>
> 2.8 s (75th percentile)
>
> Distribution: 62% good (under 2.5 s), 26% needs improvement, 12% poor.

The 2.8 s number says "75% of real users had an LCP of 2.8 s or better; the worst 25% had LCP above 2.8 s." A "good" rating requires the 75th percentile to be under 2.5 s. The distribution bar makes the long tail visible — a 95th-percentile LCP of 8 s is invisible in the single 75th-percentile number, but it shows up in the red slice.

CrUX has a minimum traffic threshold. If your URL or origin does not have enough Chrome users opted into the report, PSI shows "Insufficient data." Below that threshold, you fall back to your own `web-vitals` instrumentation.

### 5.2 Reading the Lighthouse panel in PSI

Identical to the Lighthouse panel in DevTools. Same six metrics, same Performance score, same opportunities. The only difference is the environment — PSI runs Lighthouse from Google's data centers, not from your laptop, so the numbers can shift slightly run to run. **Lighthouse scores are noisy by 5–10 points run to run.** Treat a single Lighthouse number with skepticism; treat a median of three runs as solid.

---

## 6. The Chrome User Experience Report (CrUX)

CrUX is the public dataset behind PageSpeed Insights' field data. It collects Core Web Vitals from real Chrome users who opted into anonymous reporting (a fraction of the global Chrome population, large enough to be statistically useful for most public origins). The dataset is **public**, **free**, and **updated monthly**. Reference: <https://developer.chrome.com/docs/crux>.

Three ways to consume CrUX:

- **PageSpeed Insights.** The one-click report. Already covered above.
- **CrUX Dashboard.** A free Looker Studio template that visualizes CrUX data for any public origin you point it at. Trends over time. <https://developer.chrome.com/docs/crux/dashboard>.
- **CrUX on BigQuery.** The raw dataset, queryable in SQL. Useful for custom analyses (your origin segmented by country, by device class, by connection type). Free up to BigQuery's monthly free tier. <https://developer.chrome.com/docs/crux/bigquery>.

The CrUX Dashboard is the right starting point if you have a public site with traffic. Five minutes of setup, an evergreen view of your three vitals' 75th-percentile values over time, and the distribution segmentation. The 2024 redesign of the dashboard added per-vital trend lines and the green/yellow/red distribution bars.

---

## 7. The workflow: which tool when

Putting it together. The workflow for a specific performance problem on a specific page:

**1. Establish the baseline.**

- Run **PageSpeed Insights** on the public URL. Note the field-data 75th percentiles (LCP, INP, CLS) and the lab score.
- If the field data shows "Insufficient data," skip to lab.

**2. Identify the worst vital.**

- The one farthest from the "good" threshold is the one to fix.
- If two are equally bad, prioritize LCP (most-cited; usually the largest single perception gain).

**3. Diagnose in DevTools Performance Insights.**

- Open the page in Chrome.
- Throttle to "Slow 4G" + "4x CPU."
- Record a trace.
- Open the insight for the worst vital. Read the phase breakdown.

**4. Apply one named fix.**

- One fix per change. Not three.
- Cite the web.dev article that prescribes the fix in the PR description.

**5. Re-profile in DevTools.**

- Same throttle settings.
- Same interaction.
- Note the new value.

**6. Confirm with Lighthouse.**

- Run the Lighthouse panel.
- The metric you fixed should have moved.

**7. Ship and watch CrUX.**

- The change deploys.
- Wait 28 days for the CrUX window to roll over.
- Check PageSpeed Insights again.
- Confirm the field number moved in the same direction the lab number did.

The last step — the field-data confirmation — is the one teams skip and live to regret. The lab number can move because the change actually helped, or it can move because Lighthouse's emulation happened to land on a slightly different code path that week. CrUX is the truth.

### 7.1 What goes wrong when you skip the workflow

Three common failure modes:

- **"I added a preload and CLS got worse."** You preloaded the hero image so it arrives faster, but the LCP element changed — now a different, un-sized image is the LCP, and it shifts. Single-fix discipline would have caught this on the first re-profile.
- **"Lighthouse went from 78 to 92 but users still complain."** Lighthouse measures a specific synthetic environment. Real users on real devices may not have seen the improvement. CrUX in 28 days will tell you.
- **"INP looked fine in DevTools."** INP is a session-level metric. DevTools shows you the worst interaction during your trace; the user's worst interaction may not have happened during your three-second recording. The field signal is what counts for INP.

The workflow is slow on purpose. Cargo-culting "best practices" without measuring is faster in the short term and worse in the long term.

---

## 8. A walkthrough: profiling a deliberately-slow page

To make the workflow concrete, here is a six-minute walkthrough on a small example page. (The mini-project's starter is built on the same pattern; this section is the rehearsal.)

The page: a single-file HTML with:

- A `<link rel="stylesheet" href="/blocking.css">` in the head (render-blocking).
- A 250 KB hero JPEG, `<img src="/hero.jpg">`, no `width` or `height`.
- A `<script src="/heavy.js"></script>` synchronously (parser-blocking).
- A web font from Google Fonts, no `font-display`.
- A click handler on a "load more" button that synchronously appends 5000 list items.

**Step 1: Baseline.** Open the page in Chrome. Open DevTools → Lighthouse → Mobile → Analyze. The score: 42. LCP: 4.8 s. CLS: 0.34. TBT: 920 ms.

**Step 2: Diagnose LCP.** Open Performance Insights. Set throttle to Slow 4G + 4x CPU. Record + reload + stop. Open the LCP insight. Phases:

- TTFB: 350 ms.
- Resource load delay: 2400 ms. ← biggest contributor.
- Resource load time: 1850 ms.
- Element render delay: 200 ms.

The load delay is dominant: the browser did not start fetching the hero image until late. Why? The `<link rel="stylesheet">` blocked rendering; the `<script>` blocked parsing; both completed before the parser reached the `<img>`.

**Step 3: Apply one named fix.** Add `<link rel="preload" as="image" href="/hero.jpg" fetchpriority="high">` in the head, **before** the stylesheet. The preload kicks off the image request as soon as the head is parsed, in parallel with the stylesheet fetch.

**Step 4: Re-profile.** Reload + record + stop. New LCP: 3.1 s. Load delay: 600 ms (was 2400 ms). The fix worked.

**Step 5: Diagnose CLS.** Open the Layout shifts insight. One big shift: the hero image arrived (height 400 px) and pushed the headline down. Shift score: 0.28.

**Step 6: Apply one named fix.** Add `width="600" height="400"` attributes to the `<img>`. Reload. CLS: 0.06. Done.

**Step 7: Diagnose INP.** Click "load more." Open the Interactions insight. The interaction is 480 ms total. Processing time: 410 ms (the synchronous append). Fix: chunk the append into 500-item batches inside `requestIdleCallback`.

**Step 8: Re-profile.** Click "load more" again. New INP: 180 ms.

**Step 9: Lighthouse confirmation.** Re-run. Score: 88. LCP 3.1 s, CLS 0.06, TBT 320 ms. Three named fixes; the score moved from 42 to 88.

This is the workflow. Repeated, on a real page, in a code review, twice a sprint.

---

## 9. The companion APIs

For completeness, the underlying browser APIs the `web-vitals` library wraps. You will not call these directly in normal work; you will when `web-vitals` is doing something unexpected or when you want a custom measurement.

- **`PerformanceObserver`** with `entryTypes: ["largest-contentful-paint"]` — surfaces LCP candidates as they arrive. Each entry has `startTime` (the candidate's render time), `size` (its width-times-height), and `element` (the actual DOM node).
- **`PerformanceObserver`** with `entryTypes: ["event"]` and `durationThreshold: 16` — surfaces interaction events with their full timing. Used by `web-vitals` for INP.
- **`PerformanceObserver`** with `entryTypes: ["layout-shift"]` — surfaces each `LayoutShift` entry with its `value` (shift score), `sources` (the moved elements), and `hadRecentInput` (the carve-out for user-initiated shifts).
- **`PerformanceObserver`** with `entryTypes: ["longtask"]` — surfaces tasks on the main thread over 50 ms. Useful for diagnosing what's blocking INP at boot.

Reference: <https://developer.mozilla.org/en-US/docs/Web/API/Performance_API> and the specific specs at <https://www.w3.org/TR/largest-contentful-paint/>, <https://www.w3.org/TR/event-timing/>, and <https://www.w3.org/TR/layout-instability/>.

---

## 10. Recap and what comes next

Three tools, three roles. **DevTools Performance Insights** is your lab profiler — open it whenever you want to know why a specific page is slow on your machine. **Lighthouse** is your synthetic audit — run it in CI, paste the score into the PR. **`web-vitals`** is your real-user library — install it in production, ship the metrics to analytics, trust the result. **PageSpeed Insights** combines field and lab for any public URL; **CrUX** is the public dataset under it.

The workflow is: baseline in PSI, diagnose in DevTools, fix one thing, re-profile in DevTools, confirm in Lighthouse, ship, wait for CrUX. **One fix per change.** The discipline is the work.

Lecture 3 walks the fix menu — the named interventions for the common causes of slow LCP, slow INP, and high CLS. Lazy-loading images, code splitting, the resource-hint family, font-loading strategies, and the layout-shift toolkit. By the end of that lecture you will be able to look at a Performance Insights trace and pick the fix in twenty seconds.

---

*Lecture 2 ends. Lecture 3 next.*
