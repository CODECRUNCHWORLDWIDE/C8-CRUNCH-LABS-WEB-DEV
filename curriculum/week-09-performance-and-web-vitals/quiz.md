# Week 9 — Quiz

> Ten multiple-choice questions. Answers and explanations at the bottom. Aim for 7 or above. If you score under 7, re-read the relevant lecture before moving on.

---

## Questions

**1.** Which of the following is **not** a stage in the classical browser rendering pipeline?

- A. Parse HTML into DOM.
- B. Parse CSS into CSSOM.
- C. Compute layout.
- D. Hydrate React components.

**2.** Largest Contentful Paint (LCP) measures the render time of which element?

- A. The first element painted in the document.
- B. The largest element ever rendered on the page at any time.
- C. The largest in-viewport element painted before the first user interaction.
- D. The element with the largest file size.

**3.** The "good" threshold for LCP at the 75th percentile of real users is:

- A. 1.0 second.
- B. 2.5 seconds.
- C. 4.0 seconds.
- D. 10 seconds.

**4.** INP (Interaction to Next Paint) replaced which earlier metric as a Core Web Vital in March 2024?

- A. First Contentful Paint (FCP).
- B. Time to First Byte (TTFB).
- C. First Input Delay (FID).
- D. Total Blocking Time (TBT).

**5.** A layout shift counts toward CLS **except** when:

- A. The shift is smaller than 5 pixels.
- B. The shift happens within 500 ms of a user input.
- C. The shifted element is below the fold.
- D. The page is in a background tab.

**6.** Lighthouse cannot directly measure INP. Which metric does it use as a lab proxy?

- A. First Input Delay.
- B. Total Blocking Time.
- C. Time to Interactive.
- D. Cumulative Layout Shift.

**7.** Which attribute, when added to the LCP image, has been shown to improve LCP by 100–300 ms on typical pages?

- A. `loading="lazy"`.
- B. `decoding="async"`.
- C. `fetchpriority="high"`.
- D. `crossorigin`.

**8.** What is the recommended **maximum** number of resources to add `<link rel="preload">` for on a single page?

- A. One.
- B. Three.
- C. Ten.
- D. There is no maximum.

**9.** The `font-display: optional` value differs from `font-display: swap` in which way?

- A. `optional` always blocks rendering until the font arrives; `swap` never does.
- B. `optional` does not swap to the web font on the current load if it has not arrived in time; `swap` always swaps when the font arrives.
- C. `optional` is the default; `swap` is the explicit opt-in.
- D. They are synonyms.

**10.** Which React API is the recommended fix for an INP problem dominated by a slow synchronous filter running on every keystroke?

- A. `useEffect` with `setTimeout`.
- B. `useMemo` alone.
- C. `useDeferredValue` (and/or `useTransition`).
- D. `useState` with a `flushSync` wrapper.

---

## Answer key

1. **D.** The classical pipeline is parse → CSSOM → layout → paint → composite. "Hydrate" is a React-specific concept that runs entirely as JavaScript on top of the pipeline; it is not a pipeline stage. Reference: Lecture 1 §2; <https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work>.

2. **C.** LCP measures the **largest in-viewport** content element's render time, and the measurement stops at the **first user interaction** because subsequent rendering is no longer about "when did the main content appear?" Largest by render size (width × height), not file size. Reference: Lecture 1 §3; <https://web.dev/articles/lcp>.

3. **B.** Under 2.5 s at the 75th percentile is "good." 2.5 s to 4.0 s is "needs improvement." Over 4.0 s is "poor." The threshold is from web.dev's Core Web Vitals overview. Reference: Lecture 1 §3.1; <https://web.dev/articles/vitals>.

4. **C.** INP replaced **First Input Delay** as the responsiveness vital on March 12, 2024. FID measured only the delay before the handler started; INP measures the full input-to-paint latency, which is what users actually experience. Reference: Lecture 1 §4; <https://web.dev/blog/inp-cwv-march-12>.

5. **B.** The CLS spec has a carve-out for **user-initiated shifts**: any layout shift that happens within 500 ms of a user input (click, keypress) is excluded from the score, because the user asked for the change. Reference: Lecture 1 §5.3; <https://web.dev/articles/cls>.

6. **B.** Lighthouse cannot generate user input in a synthetic audit, so it uses **Total Blocking Time** as a lab proxy for INP. TBT measures the time the main thread was blocked by long tasks during page load. It correlates with INP imperfectly but is the best lab signal we have. Reference: Lecture 2 §3.2.

7. **C.** `fetchpriority="high"` on the LCP image elevates it to the front of the browser's network queue. The Chrome team's benchmarks show 100–300 ms typical LCP improvement from this single change on pages where the LCP candidate is an image. `loading="lazy"` is the opposite (deprioritizing); `decoding="async"` decouples decode from paint but does not change network priority. Reference: Lecture 3 §2.2; <https://web.dev/articles/fetch-priority>.

8. **B.** The web.dev guidance is **no more than three preloads** per page. Preload is a priority hint; preloading too many things means none is prioritized. The same rule applies to preconnects. Reference: Lecture 3 §4.5; <https://web.dev/articles/preload-critical-assets>.

9. **B.** `font-display: optional` blocks for ~100 ms, then uses the fallback for **this load**, and does **not** swap to the web font even if it arrives later in the load. The web font is still cached for the next load. `font-display: swap` uses the fallback initially and swaps to the web font as soon as it arrives, causing a visible swap and often a layout shift. `optional` is the CLS-safe choice; `swap` is the visually-consistent choice. Reference: Lecture 3 §5.2; <https://web.dev/articles/font-display>.

10. **C.** `useDeferredValue` (and the related `useTransition`) marks the expensive UI work as low-priority, so the input handler is no longer blocked by the filter. The input updates immediately; the filtered list updates a moment later, interruptibly. `useMemo` alone does nothing here because the filter still runs on every render. `flushSync` is the opposite of what you want — it forces synchronous flushing, which would make INP worse. Reference: Lecture 3 §7.2; <https://react.dev/reference/react/useDeferredValue>.

---

## How to interpret your score

- **10/10** — Excellent. Move to the challenges and mini-project.
- **8–9/10** — Solid. Re-read the explanations for the questions you missed.
- **5–7/10** — Re-read the lecture corresponding to each wrong answer.
- **Under 5** — Re-read all three lectures from the start. The mini-project asks you to apply this vocabulary; do not push forward without it.
