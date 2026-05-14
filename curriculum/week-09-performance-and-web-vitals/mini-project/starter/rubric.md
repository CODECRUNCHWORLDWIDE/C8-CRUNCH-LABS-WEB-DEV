# Slow-Page Audit — Grading Rubric

> This rubric defines what a passing submission looks like. Self-score honestly before submitting.

---

## The scoring breakdown

| Criterion | Weight | What it looks like |
|-----------|-------:|--------------------|
| **Baseline measurements complete** | 10% | The report has a baseline table with all six metrics filled in: Lighthouse Performance score, LCP, TBT, CLS, FCP, INP-on-load-more. The baseline was measured with Slow 4G + 4x CPU throttle on a local HTTP server (not `file://`). |
| **Fix log has six or more rows** | 15% | The fix log table has at least six rows. Each row names a specific fix (not a vague "improved images") and the after-numbers for the three vitals. |
| **Every fix cites web.dev or MDN** | 10% | Each fix-log row has a URL in the citation column pointing at the canonical article that recommends the fix. Generic citations ("Lecture 3") count for half-credit. |
| **One fix per row, measured** | 10% | Each row reflects a single change. A row that says "added preload, lazy-loading, and AVIF" has bundled three fixes and forfeits this credit. |
| **Final LCP under 2.5 s** | 15% | A Lighthouse mobile audit on the final page reports LCP under 2.5 s, in at least two of three runs. |
| **Final CLS under 0.1** | 10% | Same audit reports CLS under 0.1. |
| **Final INP (load-more button) under 200 ms** | 10% | Performance Insights trace on the final page reports the load-more interaction at under 200 ms total. |
| **Final Lighthouse Performance ≥ 90** | 10% | The median of three Lighthouse runs is ≥ 90 on mobile. |
| **Reflection answers four questions** | 10% | The reflection paragraph answers the four required questions (biggest fix, smallest fix, two-hour ship list, what to measure differently). |

**Total: 100%.**

**Passing:** 70% or above.
**Excellent:** 90% or above. The reflection reads like a senior engineer's incident-postmortem note.

---

## Per-fix expectations

A "fix" in this rubric is a **named intervention from Lecture 3** with a measurable impact. Acceptable examples:

- Add `loading="lazy"` to below-the-fold images.
- Remove `loading="lazy"` from the hero.
- Add `fetchpriority="high"` to the hero.
- Add `width` and `height` attributes to every image.
- Add `<link rel="preload">` for the hero.
- Add `<link rel="preconnect">` for the font origin.
- Convert images to AVIF or WebP.
- Add `aspect-ratio` to the ad slot.
- Add `aspect-ratio` to the iframe.
- Self-host fonts with `font-display: swap`.
- Change `font-display: swap` to `font-display: optional`.
- Defer the analytics script.
- Remove the busy-wait inline script.
- Chunk the load-more handler with `requestIdleCallback`.
- Remove the unused CSS rules (or split critical/non-critical).

Unacceptable "fixes":

- "Made the page faster" (no specific change).
- "Followed best practices" (no citation, no metric).
- "Refactored the code" (no measurable performance link).

---

## What a strong reflection looks like

> The single biggest fix on this page was removing `loading="lazy"` from the hero and adding `fetchpriority="high"`. The two together moved LCP from 4.1 s to 2.1 s — a 2-second gain from two HTML tokens. That matched my prediction; the LCP element being lazy was the first thing the lecture flagged, and the per-phase breakdown showed resource-load-delay dominating the baseline.
>
> The smallest fix was adding `<link rel="preconnect">` for `fonts.gstatic.com`. The savings was about 80 ms, well below the variance in my measurements; I cannot prove the change was even responsible. In retrospect, self-hosting the fonts (which I did next) made the preconnect redundant. The lecture warned about this and I ignored the warning.
>
> If I had two hours to ship this page, I would do three things: remove the hero's `loading="lazy"` and add `fetchpriority="high"`; add `width` and `height` to every image; and defer the analytics script. Those three lines alone bring LCP under 3 s and CLS under 0.1. Everything else is improvement on a page that is already good enough.
>
> Next time, I would measure each fix with the median of three runs from the start, not from the final round. Two of my middle rows had numbers within Lighthouse's noise band; I should have noticed and re-run rather than concluding the fix did nothing.

---

## Honesty notes

- **Cache.** If your "after" run was served from cache, the number is fiction. Always Disable cache or use the hard-reload pattern.
- **Three-run median.** Lighthouse is noisy by 5–10 points. Reporting a single great run is misleading. The rubric values the median.
- **One fix per row.** It is tempting to bundle fixes to keep the table shorter. Resist. The single-fix discipline is what is being graded.

---

## Reference

- web.dev — Optimize LCP: <https://web.dev/articles/optimize-lcp>
- web.dev — Optimize INP: <https://web.dev/articles/optimize-inp>
- web.dev — Optimize CLS: <https://web.dev/articles/optimize-cls>
- Chrome DevTools — Performance Insights: <https://developer.chrome.com/docs/devtools/performance/insights>
- Lighthouse scoring: <https://developer.chrome.com/docs/lighthouse/performance/performance-scoring>
