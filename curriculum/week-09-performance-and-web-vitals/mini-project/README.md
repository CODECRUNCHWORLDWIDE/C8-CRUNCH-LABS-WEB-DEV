# Week 9 — Mini-Project: The Slow-Page Audit

> The week's deliverable. You are given a deliberately-slow static page — every common performance offender is in it on purpose. Your job is to **profile it, identify the bottlenecks, apply the named fixes from the lectures, and re-profile**. The submission is a markdown report with before/after numbers for all three vitals and a one-paragraph defense per fix. By Sunday, the optimized page has LCP under 2.5 s mobile-throttled, CLS under 0.1, and an INP under 200 ms on the deliberately-slow button.

---

## The brief

The `starter/` folder contains a single-page HTML site — `index.html`, `styles.css`, `app.js` — that has been engineered to fail every Core Web Vital. The page renders a small photo-gallery layout with a hero image, a grid of below-the-fold thumbnails, an embedded video iframe, an ad slot, and a "Load 1000 more" button.

Every visible performance offender from Lecture 3 is in the starter. Your job is to find them, name them, and fix them. The page does not need to look any prettier when you are done; it needs to be **fast**. Treat the starter as a customer's broken page that has landed in your queue.

The deliverable is **a report**. The report is graded, not the page. A well-measured 80-point Lighthouse run with a written rationale is worth more than a 95-point run you cannot reproduce or explain.

---

## What is wrong with the starter (no peeking until you have profiled)

The starter is deliberately broken. Before reading the list below, **profile the page first** in Performance Insights and write down what you observe. Then check your list against this one.

Click to expand once you have profiled:

<details>
<summary>The intended offenders</summary>

1. **The LCP image (the hero) is `loading="lazy"`.** It should be eager, with `fetchpriority="high"`.
2. **The LCP image has no `width` or `height`.** It causes a large layout shift when it arrives.
3. **No `<link rel="preload">` for the LCP image.** The browser discovers it late.
4. **The stylesheet is a 1500-line file with most rules unused.** Render-blocking and oversized.
5. **A synchronous `<script>` tag in the head** blocks parsing while it executes for ~400 ms (a deliberate busy-wait).
6. **The page uses Google Fonts with `display=swap`** and no preload. Causes font-swap shift.
7. **Every grid image is eager** when it should be lazy.
8. **The grid images are 1600×1200 originals** but displayed at 280×210. Massive bandwidth waste.
9. **The video iframe has no aspect ratio reservation.** Shifts content when it loads.
10. **The ad slot is empty at first paint** and fills 1.5 s later, pushing content.
11. **The "Load 1000 more" button's handler synchronously creates 1000 DOM nodes** in a single tight loop. INP ~800 ms.
12. **A 200 KB analytics script** is loaded synchronously in the head.

You should find at least 8 of these by inspection. The other 4 will surface in the trace.

</details>

---

## The required workflow

The discipline this week is **measure → fix one thing → re-measure**. Resist the temptation to fix everything in one PR.

### Phase 1 — Baseline measurement (30 min)

1. Open `starter/index.html` via a local HTTP server (`npx http-server` or VS Code Live Server). Static-file `file://` URLs disable some browser optimizations and skew measurements; always serve via HTTP.
2. Open in Chrome. DevTools → Performance Insights → Throttle: Slow 4G + 4x CPU.
3. Record + reload + stop. Read the LCP, Long Tasks, and Layout Shifts insights.
4. Run Lighthouse (Mobile, Performance only). Note the score and all six metrics.
5. Click the "Load 1000 more" button. The INP for that interaction is your baseline INP.

Record in the report:

```markdown
## Baseline (before fixes)

| Metric | Value | Rating |
|--------|------:|--------|
| Lighthouse Performance score | | |
| LCP | | |
| TBT | | |
| CLS | | |
| INP (load-more button) | | |
```

### Phase 2 — Identify the worst vital (10 min)

Of LCP, INP, CLS — which is **farthest** from its "good" threshold? That is the vital you fix first. Note your choice in the report:

```markdown
## First target

The worst vital is **<LCP / INP / CLS>** at <value>, which is <delta> beyond the "good" threshold of <threshold>. The four-phase (LCP) or three-phase (INP) breakdown points at the <phase name> phase as the dominant contributor.
```

### Phase 3 — Apply fixes one at a time (3–4 hours)

For each fix, follow the same six-step protocol:

1. **Decide.** Which fix? Cite a Lecture 3 section and a web.dev URL.
2. **Predict.** What metric will move? By how much?
3. **Implement.** Edit `index.html`, `styles.css`, or `app.js`.
4. **Re-measure.** Record + reload + Lighthouse run.
5. **Record.** Add a row to the running table:

```markdown
## Fix log

| # | Fix | Citation | LCP | CLS | INP | Notes |
|---|-----|----------|----:|----:|----:|-------|
| 1 | | | | | | |
| 2 | | | | | | |
```

6. **Reflect.** One sentence on whether the change matched your prediction.

You should produce 6 to 10 rows in the fix log. The number is not the point; the per-row discipline is.

### Phase 4 — Final measurement (15 min)

Once you have hit the targets (or run out of fix ideas), do a final measurement pass:

```markdown
## Final (after all fixes)

| Metric | Baseline | Final | Delta |
|--------|---------:|------:|------:|
| Lighthouse Performance score | | | |
| LCP | | | |
| TBT | | | |
| CLS | | | |
| INP (load-more button) | | | |
```

Run Lighthouse three times and report the median for the final number (the variance is real).

### Phase 5 — Write the report (45 min)

Combine the artifacts into a single `report.md`. The structure is in the rubric below.

---

## The targets

The page should hit these numbers on a Lighthouse mobile audit:

| Target | Value |
|--------|------:|
| Performance score | ≥ 90 |
| LCP | < 2.5 s |
| TBT | < 200 ms |
| CLS | < 0.1 |
| INP (load-more button) | < 200 ms |

Hitting all five is realistic and is what the rubric asks for. Hitting four is acceptable if you can defend the miss. Hitting fewer than three is a sign that the workflow stalled; submit anyway, and the rubric will partial-credit.

---

## What is and is not allowed

- **Allowed:** Any change to `index.html`, `styles.css`, `app.js`. New files. Image conversions (run images through <https://squoosh.app/>). Self-hosting fonts. Adding `<link rel="preload">` / `<link rel="preconnect">`. Inlining critical CSS. Replacing the busy-wait with `requestIdleCallback`. Splitting `app.js` into deferred chunks. Removing the deliberately-slow analytics script (consider it a third-party you have permission to remove).
- **Allowed:** Modern image formats. AVIF and WebP are both fine.
- **Allowed:** Replacing Google Fonts with self-hosted woff2. Use <https://gwfh.mranftl.com/fonts> if you do not want to download from Google directly.
- **Not allowed:** Replacing the page entirely with a different design. The fix is on the page, not a rewrite.
- **Not allowed:** Removing the "Load 1000 more" button to game INP. The button has to work; it just has to be fast.
- **Not allowed:** Pre-rendering or static-site-generating the page through Astro or Next.js. The starter is plain HTML; the fixes are plain-HTML fixes.

---

## The starter files

The `starter/` folder contains:

| File | Purpose |
|------|---------|
| `index.html` | The slow page. Edit freely. |
| `styles.css` | The slow stylesheet. Edit freely. |
| `app.js` | The slow JavaScript. Edit freely. |
| `rubric.md` | The grading rubric. Read it before starting. |

See the in-file comments — each "offender" is marked with a `// SLOW:` or `<!-- SLOW: -->` comment so you can locate them after profiling.

---

## Submission

Submit a folder containing:

1. **`index.html`, `styles.css`, `app.js`** — the optimized versions.
2. **`report.md`** — the audit report (see structure below).
3. **`screenshots/`** — at least two Lighthouse screenshots (before, after).
4. **(Optional) `images/`** — your AVIF/WebP conversions if you did them.

The `report.md` structure:

```markdown
# Slow-Page Audit Report

## Baseline (before fixes)
[table]

## First target
[paragraph identifying the worst vital]

## Fix log
[table of fixes with citations]

## Final (after all fixes)
[before/after table]

## Reflection
A two- to three-paragraph reflection answering:
- Which single fix had the biggest impact? Was that the fix you expected?
- Which fix had the smallest impact (or no impact)? Why?
- If you had to ship this page in two hours, which three fixes would you ship?
- What would you measure differently next time?

## Citations
A flat list of every web.dev / MDN / Chrome docs URL you cited in the fix log.
```

---

## Deployment (optional but recommended)

Deploy the optimized page to Vercel, Netlify, or Cloudflare Pages so you have a public URL to run PageSpeed Insights against. The CrUX field data will be "insufficient" (no traffic), but the PSI lab number is the equivalent of an off-machine Lighthouse run — useful as a sanity check that your local measurement was not an artifact of your machine.

---

## Rubric (excerpt — full version in `starter/rubric.md`)

| Criterion | Weight |
|-----------|-------:|
| Baseline measurements complete | 10% |
| Fix log has six or more rows with citations | 25% |
| Final LCP under 2.5 s | 15% |
| Final CLS under 0.1 | 10% |
| Final INP (load-more) under 200 ms | 10% |
| Final Lighthouse Performance ≥ 90 | 10% |
| Reflection answers four questions | 10% |
| Every fix cites web.dev or MDN | 10% |

**Passing:** 70% or above.
**Excellent:** 90% or above. The reflection reads like a senior engineer's incident-postmortem note.

---

## Common pitfalls

**1. Fixing five things, then measuring.** You will not know which fix did what, and you will have nothing to write in the per-row reflection. One fix per change.

**2. Reading a single Lighthouse run as truth.** Lighthouse is noisy by 5–10 points. Run three times; report the median.

**3. Skipping the throttle.** A baseline measurement on an unthrottled fast laptop is not a baseline. Slow 4G + 4x CPU is the floor.

**4. Forgetting to remove `loading="lazy"` from the hero.** It is the single most impactful fix on this page. If your final LCP is over 2.5 s, this is the first thing to check.

**5. Preloading too many things.** Three preloads max. Preloading the hero, the font, **and** every grid thumbnail neutralizes the priority signal.

**6. Cache.** Chrome's cache will serve the second run from disk, making your "after" number look better than it is. Always "Disable cache" in DevTools or use the Performance Insights record + reload pattern.

**7. Treating INP as a one-shot.** INP is the worst interaction's value. Click the load-more button **multiple times** during your trace; the worst one is what counts.

---

## Stretch (optional)

- Convert all images to **AVIF** with a JPEG fallback via `<picture>`. Measure the delta on resource load time.
- Apply **`content-visibility: auto`** to the below-the-fold sections. Measure whether INP improves.
- Add **`web-vitals`** instrumentation (from Exercise 3) and log to console. Verify your final numbers match the lab Lighthouse run.
- Run **Lighthouse from the command line** and pipe to a JSON file. Compare two JSON reports programmatically (`diff`, or a small Node script that extracts the numbers).
- Set up a **GitHub Action** that runs Lighthouse on every PR and fails the build if the Performance score drops below your target.

---

## Further reading

- web.dev — Optimize LCP: <https://web.dev/articles/optimize-lcp>
- web.dev — Optimize INP: <https://web.dev/articles/optimize-inp>
- web.dev — Optimize CLS: <https://web.dev/articles/optimize-cls>
- Chrome DevTools — Performance Insights: <https://developer.chrome.com/docs/devtools/performance/insights>
- web.dev — Performance budgets 101: <https://web.dev/articles/performance-budgets-101>
