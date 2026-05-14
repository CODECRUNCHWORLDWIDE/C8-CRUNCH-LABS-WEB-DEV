# Exercise Solutions — Week 9

> Reference answers and the reasoning behind them. Read after you have attempted the exercises, not before. The numbers in the example traces are illustrative; your actual numbers will differ depending on your machine, your network, and the URL you profiled.

---

## Exercise 1 — Profile a page in three tools

### Reference report (example)

For the Crunch Library deployment at `https://crunch-library.vercel.app` (illustrative URL).

```markdown
# Performance Audit — crunch-library.vercel.app

Date: 2026-05-14
Device profile: Mobile (Slow 4G + 4x CPU throttle for lab; CrUX field data unfiltered)

## Field data (CrUX 28-day, via PageSpeed Insights)

| Metric | 75th percentile | Rating |
|--------|----------------:|--------|
| LCP | Insufficient data — site too new | — |
| INP | Insufficient data | — |
| CLS | Insufficient data | — |

## Lab data (Lighthouse via DevTools, Mobile)

| Metric | Value | Rating |
|--------|------:|--------|
| Performance score | 78 | needs improvement |
| LCP | 2.9 s | needs improvement |
| TBT | 240 ms | needs improvement |
| CLS | 0.04 | good |

## DevTools Performance Insights — LCP phase breakdown

| Phase | Time (ms) | % of LCP |
|-------|----------:|---------:|
| TTFB | 280 | 10% |
| Resource load delay | 1430 | 49% |
| Resource load time | 940 | 32% |
| Element render delay | 250 | 9% |

**LCP element:** `<img src="/featured.jpg" alt="featured" class="featured-book">`
**Biggest phase:** Resource load delay

## The single biggest opportunity

The worst vital is LCP at 2.9 s, just over the 2.5 s "good" threshold. The biggest phase is resource load delay at 1430 ms — the browser does not start fetching the featured-book image until the React bundle has parsed and the component has rendered the `<img>` tag. The recommended fix is `<link rel="preload" as="image" href="/featured.jpg" fetchpriority="high">` in the head of `index.html`, plus `fetchpriority="high"` on the `<img>` itself. Reference: <https://web.dev/articles/optimize-lcp>. Expected savings: 800–1100 ms off the load-delay phase, bringing LCP to ~2.0 s.

## Field-vs-lab disagreement

CrUX is reporting insufficient data because the site is too new and has too few Chrome users opted into reporting. The lab number is therefore the only signal available. In a few weeks, after the site has accumulated traffic, CrUX should populate and we can confirm the lab improvement matches the field reality. Until then, treat the Lighthouse number as a directional signal, not the truth.
```

### Reasoning notes

- The "biggest phase" answer drives the fix. Different phases produce different fixes; the four-phase breakdown is the diagnostic shortcut. If your trace shows TTFB dominating, the fix is server-side (caching, CDN, faster origin), not client-side.
- The "Insufficient data" outcome is common for new sites. Do not treat it as failure; the field data accumulates over the 28-day window.
- The recommended one-paragraph defense should name the metric, the phase, the fix, the citation, and the expected savings. Senior performance writing looks like this.

---

## Exercise 2 — Lazy-loading, preload, and fetchpriority

### Reference table (example)

| Step | LCP (ms) | Delta from previous | Why |
|------|---------:|--------------------:|-----|
| Baseline | 3450 | — | Hero discovered late; twelve grid images compete for bandwidth |
| + loading="lazy" on below-fold | 3120 | -330 | Bandwidth that was being spent on grid images is now available for hero |
| + fetchpriority="high" + dims on hero | 2480 | -640 | Browser elevates hero to top of fetch queue; dims prevent CLS as side benefit |
| + preload on hero | 1820 | -660 | Hero fetch starts at head-parse time, before `<img>` is discovered |

### Per-step rationale

**Step 1 — `loading="lazy"` on below-the-fold images.** The direct benefit is **bandwidth saved**: the twelve grid images are not requested up-front, so the user only downloads what they actually scroll to. The indirect benefit measured here is **LCP improvement**: the bandwidth no longer spent on grid images is available for the hero, so the hero downloads faster. On a fast network with no contention, the indirect LCP benefit would be smaller.

**Step 2 — `fetchpriority="high"` and dimensions on the hero.** The `fetchpriority` attribute moves the hero to the front of the network queue. The browser already prioritizes first-viewport images heuristically; the attribute is the explicit signal. The `width` and `height` attributes provide an aspect ratio and prevent layout shift when the hero lands — a CLS fix that also makes the page feel more polished. If `fetchpriority="high"` were added to **every** image, the prioritization would be neutralized: priority is only meaningful relative to other resources.

**Step 3 — `<link rel="preload">` for the hero.** The preload moves the fetch earlier in the timeline: the browser starts the request as soon as it parses the preload tag in the head, before the `<img>` tag is discovered. The savings is the time the browser would otherwise have spent parsing the rest of the head, the stylesheet, and the body up to the `<img>`. The upper limit on preloads is roughly **three per page**: the browser only has so many high-priority slots, and preloading everything elevates nothing.

### Wrap-up reflection

- The **single biggest fix** is the preload, with `fetchpriority="high"` a close second. The preload moves the fetch earlier *in the timeline*; `fetchpriority` moves it earlier *in the queue*. Both target the resource-load-delay phase but at different layers.
- The **largest collateral benefit** is CLS, which drops to zero once the hero has `width` and `height`. This is a strong argument for never shipping an `<img>` without dimensions, even when LCP is not the concern.
- If you could ship **only one** of the three fixes, ship `fetchpriority="high"` plus dimensions on the hero. The attribute is one HTML token; the dimensions are two more; the combined benefit is LCP plus CLS. Preload is also one tag, but it requires you to know the LCP URL at parse time, which is not always the case in a JS-heavy SPA where the LCP candidate is rendered late.

---

## Exercise 3 — web-vitals instrumentation

### Reference `src/lib/vitals.js`

The starter is in the exercise. The four points to verify are correct:

1. The import is from `web-vitals/attribution` (not `web-vitals`), so the attribution fields are populated.
2. The dev branch logs to console with `value.toFixed(1)` and the rating.
3. The production branch uses `navigator.sendBeacon` first, falls back to `fetch` with `keepalive: true`.
4. The reported body includes `name`, `value`, `rating`, `id`, `page`, and an attribution snippet.

### Reflection answers

**1. The reporting cadence.** The library fires the callback at strategic moments — for LCP, once the metric is "final" (the user interacts or the page is hidden); for INP, when the metric updates with a worse value; for CLS, when the metric updates with new shifts. The cadence is **debounced and final** so the analytics endpoint is not hammered with one event per shift. If the user navigates away after one INP interaction, the library fires a final report on `visibilitychange: hidden`; the second interaction's data is lost because there is no second interaction. The model is "ship the worst we have seen, when the page is leaving."

**2. The `sendBeacon` choice.** `navigator.sendBeacon` is designed for unload-time telemetry: the browser guarantees the request fires even if the page is being closed. `fetch` without `keepalive` is cancelled when the document unloads, so a vital reported in `visibilitychange: hidden` via `fetch` is often lost. `fetch` with `keepalive: true` is the modern equivalent of `sendBeacon` and is the right fallback when `sendBeacon` returns `false` (rare; usually means the body exceeds the browser's beacon size cap, default 64 KB).

**3. The attribution-build cost.** The basic build is ~2 KB compressed; the attribution build is ~4 KB compressed. The extra 2 KB is the diagnostic data — which element, which interaction, which shift. For **production**, the attribution build is almost always worth the cost: without attribution, you have a number but no idea which page or element caused it. For a **tiny project** without a debug workflow, or for a project where you trust your test traces and only need the aggregate number, the basic build is enough. The default recommendation in 2026 is attribution.

**4. The privacy posture.** Element HTML can leak content — a user's draft comment, a private name, a session ID embedded in an attribute. The right policy is to **truncate** the HTML (the example uses `.slice(0, 200)`) and to **strip** anything that looks like a PII attribute (`data-user-id`, `data-email`) on a deny-list. For some pages — a logged-in dashboard with personal data in every element — the safer default is to ship the **selector** rather than the HTML: `metric.attribution.element?.tagName + "." + Array.from(metric.attribution.element.classList).join(".")`. The web.dev attribution guide notes the privacy concern; reference: <https://github.com/GoogleChrome/web-vitals#attribution-build>.

---

## Common cross-exercise themes

The three exercises rehearse the **measure-then-fix** workflow on three slices of the same problem. Exercise 1 builds the muscle of "read three tools, write the numbers down." Exercise 2 builds the muscle of "one fix per change, measure before and after." Exercise 3 builds the muscle of "instrument production so the numbers come back without a manual run."

A senior performance engineer does all three on a normal Tuesday. The instrumentation is in place; the new feature ships behind a flag; the engineer profiles the feature, reads the vitals, fixes the regression, and re-measures. The instrumentation closes the loop from production back to the next PR.

---

## Reference

- web.dev — Optimize LCP: <https://web.dev/articles/optimize-lcp>
- web.dev — Optimize INP: <https://web.dev/articles/optimize-inp>
- web.dev — Optimize CLS: <https://web.dev/articles/optimize-cls>
- Chrome DevTools — Performance Insights: <https://developer.chrome.com/docs/devtools/performance/insights>
- web-vitals — Attribution build: <https://github.com/GoogleChrome/web-vitals#attribution-build>
