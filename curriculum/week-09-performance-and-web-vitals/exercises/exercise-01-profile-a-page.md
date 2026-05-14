# Exercise 1 — Profile a Page in Three Tools

> Estimated time: 60–90 minutes.
> Prerequisite: Lecture 2 read. Chrome installed. A public URL to profile (your Week 8 mini-project deployment is the recommended target; if you do not have one, use <https://news.ycombinator.com> as a benchmark target).

---

## Goal

Walk the **measure** half of the measure-then-fix workflow on a real, deployed page. You will profile the same page in three tools — Chrome DevTools Performance Insights, Lighthouse, and PageSpeed Insights — and produce a one-page report comparing the numbers.

The point is not to fix the page. The point is to feel the tools, see where they agree and disagree, and produce numbers you can defend.

---

## Setup

Pick a public URL. The recommended choices in priority order:

1. **Your own Crunch Library deployment** from Week 8. Most useful — you wrote the code, so you can change it next week.
2. **Your personal portfolio** from Week 7.
3. **<https://news.ycombinator.com>**. Benchmark target — extremely fast, very few resources. A useful "what does great look like?"
4. **<https://www.bbc.com>**. A real news site. Will have a mix of strengths and weaknesses.

Open the URL in Chrome. Open DevTools.

---

## Step 1 — Lighthouse baseline (15 min)

Run the Lighthouse panel.

1. DevTools → **Lighthouse** tab.
2. **Mode**: Navigation (default).
3. **Device**: Mobile.
4. **Categories**: check Performance only (uncheck the others for now).
5. Click **Analyze page load**.

When the run finishes, screenshot the four-bar score circle. Record the following in a markdown table:

| Metric | Value | Rating |
|--------|------:|--------|
| Performance score | | |
| First Contentful Paint | | |
| Largest Contentful Paint | | |
| Total Blocking Time | | |
| Cumulative Layout Shift | | |
| Speed Index | | |

The "Rating" is `good` / `needs improvement` / `poor` from the thresholds in Lecture 1 §3.1, §4.2, §5.1.

In a second table, copy the top **three Opportunities** from the report (the named-fix suggestions Lighthouse surfaces under the score), with each opportunity's estimated savings:

| Opportunity | Estimated savings |
|-------------|-------------------|
| | |

---

## Step 2 — DevTools Performance Insights trace (25 min)

Switch to the **Performance Insights** panel.

1. DevTools → click the three-dot menu in the top right → **More tools** → **Performance insights**. (If it is not listed, enable it in DevTools Settings → Experiments.)
2. Click the throttle icon and set:
   - **CPU**: 4x slowdown.
   - **Network**: Slow 4G.
3. Click the circular **Record** button.
4. Reload the page (Cmd-R / Ctrl-R).
5. Wait until the page is visibly settled (no more loading spinners). Then click **Stop**.

Open the **Insights** sidebar on the left of the panel.

### 2a — Read the LCP insight

Click the **Largest Contentful Paint** insight. Record:

- The **LCP element**. Copy the element's outer HTML (truncated to 200 chars).
- The **four-phase breakdown** with each phase's millisecond value and percentage:

| Phase | Time (ms) | % of LCP |
|-------|----------:|---------:|
| TTFB | | |
| Resource load delay | | |
| Resource load time | | |
| Element render delay | | |

- Identify the **single biggest phase**. Name it.

### 2b — Read the Long Tasks insight

Click the **Long tasks** insight (the list of main-thread tasks over 50 ms).

Record:

- The number of long tasks during page load.
- The duration of the longest single task.
- The function name (or `eval` / `script` source) the longest task bottomed out in.

### 2c — Read the Layout shifts insight

Click the **Layout shifts** insight.

Record each individual layout shift larger than 0.01 score:

| Shift score | Moved element (truncated) |
|------------:|---------------------------|
| | |
| | |

The total CLS for the trace is the sum of the individual shift scores within the windowing rules. Lighthouse's CLS (from Step 1) is a different measurement (over the page's full lifetime, not just the page-load window) — note any disagreement.

---

## Step 3 — PageSpeed Insights field data (10 min)

Go to <https://pagespeed.web.dev/>. Paste your URL. Click **Analyze**.

PSI has two top-level views: **Mobile** and **Desktop**. Read the **Mobile** view.

### 3a — The CrUX panel (field data)

Record the 75th-percentile values from the "Core Web Vitals Assessment" panel:

| Metric | 75th percentile | Distribution (good / NI / poor) | Rating |
|--------|----------------:|---------------------------------|--------|
| LCP | | | |
| INP | | | |
| CLS | | | |

If PSI shows "Insufficient real-world speed data," note that. CrUX requires a minimum traffic threshold; small sites fall below it.

### 3b — The Lighthouse panel (lab data)

PSI runs its own Lighthouse audit. Record the Performance score and compare it to your local Lighthouse run from Step 1:

| Source | Performance score | LCP | CLS |
|--------|------------------:|----:|----:|
| DevTools local | | | |
| PSI cloud | | | |

The two numbers will not match. Lighthouse is **noisy by 5–10 points run to run**, and the two are running in different environments. Note the size of the disagreement.

---

## Step 4 — The comparison (15 min)

Write a one-page report. Use this template:

```markdown
# Performance Audit — <page URL>

Date: <date>
Device profile: Mobile (Slow 4G + 4x CPU throttle for lab; CrUX field data unfiltered)

## Field data (CrUX 28-day, via PageSpeed Insights)

| Metric | 75th percentile | Rating |
|--------|----------------:|--------|
| LCP | | |
| INP | | |
| CLS | | |

## Lab data (Lighthouse via DevTools, Mobile)

| Metric | Value | Rating |
|--------|------:|--------|
| Performance score | | |
| LCP | | |
| TBT | | |
| CLS | | |

## DevTools Performance Insights — LCP phase breakdown

| Phase | Time (ms) | % of LCP |
|-------|----------:|---------:|
| TTFB | | |
| Resource load delay | | |
| Resource load time | | |
| Element render delay | | |

**LCP element:** `<copy element here>`
**Biggest phase:** <phase name>

## The single biggest opportunity

The one fix that would most reduce the worst vital, with a one-paragraph defense:

> <Your paragraph here. Cite a web.dev article. The format: "The worst vital is LCP at X seconds. The biggest phase is Y at Z ms. The recommended fix is [fix] (citation). Expected savings: [estimated ms].">

## Field-vs-lab disagreement

In one to three sentences, note any disagreement between the CrUX field number and the Lighthouse lab number, and what that disagreement suggests about the user population.
```

---

## Done when

- [ ] The Lighthouse run in DevTools is complete and the metrics are recorded.
- [ ] The Performance Insights trace is complete and the LCP, long-tasks, and layout-shift insights are recorded.
- [ ] The PageSpeed Insights report is complete and both field (CrUX) and lab (Lighthouse) data are recorded.
- [ ] The one-page report is written, with the "single biggest opportunity" paragraph defending one named fix from Lecture 3.
- [ ] The report cites at least one web.dev article URL.

---

## Common pitfalls

**1. Forgetting to throttle.** A Performance Insights trace without throttling on a fast laptop reports numbers that have nothing to do with the user's mobile experience. Always Slow 4G + 4x CPU.

**2. Reading the median Lighthouse score.** Lighthouse is noisy. The first run might be 92; the second 87. The right reading is the median of three runs, or the trend over many runs. For this exercise, a single run is acceptable; in real work, run three.

**3. Conflating PSI Lighthouse with DevTools Lighthouse.** They are not the same number. PSI runs on Google's data centers; DevTools runs on your machine. Either is a defensible lab signal; do not be surprised when they differ.

**4. Treating CrUX "good" as "I am done."** A page with green CrUX vitals can still have a 3-second LCP at the 95th percentile and lose users in the long tail. The thresholds are minimums; aim for **excellent**, not "barely passing."

---

## Submission

Save the report as `exercise-01-audit.md` in your portfolio repo (or a private notes folder). Add the screenshots as `.png` files alongside.

The act of writing the report — choosing what to record, deciding which phase matters, writing the one-paragraph defense — is the learning. The numbers themselves are by-products.

---

## Stretch (optional)

- Run the same workflow on a **second URL** — the same page from a different geography. Use a VPN to compare an audit from the US with an audit from India. The TTFB difference alone will surprise you.
- Run **WebPageTest** (<https://www.webpagetest.org/>) on the same URL. Compare the waterfall view with DevTools' Network panel. WebPageTest's filmstrip across multiple runs is the most useful artifact for "how stable is this page's load?"
- Install the `web-vitals` Chrome extension (<https://chromewebstore.google.com/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma>). It overlays live LCP/INP/CLS as you browse any site. Spend ten minutes browsing sites you frequent and noting the live numbers; calibrate your intuition.

---

## Reference

- Chrome DevTools — Performance Insights: <https://developer.chrome.com/docs/devtools/performance/insights>
- Chrome DevTools — Lighthouse: <https://developer.chrome.com/docs/lighthouse/overview>
- PageSpeed Insights: <https://pagespeed.web.dev/>
- CrUX: <https://developer.chrome.com/docs/crux>
- web.dev — Lab vs. field data: <https://web.dev/articles/lab-and-field-data-differences>
