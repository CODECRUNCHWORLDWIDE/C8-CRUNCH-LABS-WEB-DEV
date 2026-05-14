# Week 9 — Homework

> Six practice problems. Each is meant to take 20–45 minutes. Write your answers in your own words; the act of writing the answer is the learning. Cite web.dev, MDN, or Chrome DevTools docs where the lectures asked you to.

---

## Problem 1 — Diagnose a real public site

Pick a real, public site you use. Suggestions:

- A news site (`nytimes.com`, `bbc.com`, `theverge.com`).
- A retail site (`amazon.com`, the homepage of any major store).
- A social platform's logged-out homepage (`reddit.com`, `linkedin.com`).
- Your school's website.

Run **PageSpeed Insights** (<https://pagespeed.web.dev/>) on it. Read the **mobile** report.

Write a one-page diagnosis with:

1. The **field-data 75th-percentile** values for LCP, INP, CLS (or "Insufficient data" if CrUX has not seen enough traffic).
2. The **lab Lighthouse Performance score** and the three vital values from the lab run.
3. The **single biggest opportunity** Lighthouse names, with its estimated savings.
4. **One paragraph** on whether the page is "good" by the Core Web Vitals framework, and which vital is closest to failing.
5. **One sentence** on the field-vs-lab disagreement (or agreement) you observed.

Reference: Lecture 2 §5; <https://web.dev/articles/vitals>.

---

## Problem 2 — Apply two fixes to your Week 8 deployment

Take your **Crunch Library** deployment from Week 8.

Run a Lighthouse audit on the books page. Note the LCP and the Performance score.

Apply **two** named fixes from Lecture 3 to the page. Suggestions:

- Add `loading="lazy"` to every book-image below the fold.
- Add `width` and `height` attributes to every book-image.
- Add `<link rel="preconnect">` to JSONPlaceholder's origin if it is the data source.
- Convert any hero or banner image to AVIF or WebP.
- Add `<link rel="preload">` for the LCP image (if there is one).

Deploy the changes. Re-run Lighthouse. Note the new LCP and Performance score.

Submit:

- A one-paragraph description of the two fixes you applied and why.
- The before and after numbers in a small table.
- **One sentence** on whether the change in the score matched your expectation. If it did not, **one sentence** on why you think it did not.

Cite the web.dev article that recommends each fix.

---

## Problem 3 — Read the LCP optimize guide

Read **web.dev — Optimize Largest Contentful Paint** end to end at <https://web.dev/articles/optimize-lcp>. It is about 4,000 words and takes 25–35 minutes.

Then, in your own words:

1. List the **four phases of LCP** with one sentence describing what each measures.
2. Pick **one fix** from the article that was new to you. Write a paragraph (4–6 sentences) on what the fix does and when you would use it. Include the URL of the section in the article.
3. The article says, "An overwhelming majority of LCP issues occur for one of two reasons: the LCP element does not start loading early enough, or the LCP element takes too long to load." Identify which of the two is more common on **your** Crunch Library deployment, with evidence from a Performance Insights trace.

---

## Problem 4 — INP audit

Pick **one interaction** on a site you use. Examples:

- Typing in the Twitter / X compose box.
- Clicking a product on Amazon.
- Filtering search results on any e-commerce site.
- Submitting a form on your bank's site.

Profile the interaction in **Chrome DevTools Performance Insights**:

1. Open the site. Throttle to Slow 4G + 4x CPU.
2. Open Performance Insights. Click **Record**.
3. Perform the interaction.
4. Stop recording.

Find the **Interactions** insight. Note:

- The **INP** for the interaction.
- The breakdown into **input delay**, **processing time**, and **presentation delay**.
- The longest single function call in the call stack of the handler.

Write a one-paragraph diagnosis (3–5 sentences):

- Which phase dominates?
- What named fix from Lecture 3 §7 would you apply if this were your code?
- Why?

Cite web.dev — Optimize INP at <https://web.dev/articles/optimize-inp>.

---

## Problem 5 — A CLS hunt

Open three different content sites (news, blog, school site) and quickly profile each one's CLS in Lighthouse.

For each site:

- Record the CLS value.
- Open Performance Insights and identify the **single largest layout shift** (in score). Note the moved element type (image, ad, banner, font swap, late-rendered content).

Then write a 200-word note titled "**Three patterns of CLS in the wild**":

- The most common cause across the three sites.
- The most surprising cause you found.
- The fix you would propose for the worst-CLS site, with citation to web.dev — Optimize CLS at <https://web.dev/articles/optimize-cls>.

---

## Problem 6 — A performance budget

Write a **performance budget** for a hypothetical "Crunch Library" landing page. The budget should specify:

- Maximum HTML weight (compressed).
- Maximum CSS weight (compressed).
- Maximum JavaScript weight, initial bundle (compressed).
- Maximum image weight, above the fold (compressed).
- Maximum total page weight on first load (compressed).
- Maximum LCP, INP, CLS targets.
- Maximum Lighthouse Performance score target.

For each line item, defend the number in one sentence. Cite at least one web.dev or HTTP Archive resource (<https://almanac.httparchive.org/en/2024/performance>) where you got the typical value.

Then write **one sentence** on how the budget would be enforced — manually in PR review, automatically in CI via Lighthouse CI (<https://github.com/GoogleChrome/lighthouse-ci>), or some combination.

---

## Stretch problems (optional, but recommended)

### Problem 7 — Trace a real production INP problem

Read **web.dev — Find slow interactions in the field** at <https://web.dev/articles/find-slow-interactions-in-the-field>.

Pick a deployed site of your own (Week 7 portfolio or Week 8 Crunch Library). Wire the `web-vitals` **attribution build** to log INP attribution to console. Browse the site, perform every interaction you can think of, and identify the worst single INP. Write a 200-word note on what the slow interaction was and how you would fix it.

### Problem 8 — Read the web.dev Core Web Vitals announcement timeline

Read these three posts in chronological order:

1. **Web Vitals — Essential metrics for a healthy site** (2020): <https://web.dev/articles/vitals>
2. **A new Core Web Vital — Interaction to Next Paint** (2022): <https://web.dev/blog/inp>
3. **INP is now a Core Web Vital** (March 2024): <https://web.dev/blog/inp-cwv-march-12>

Write a 300-word essay on **how the Core Web Vitals framework has evolved**, and what the INP replacement says about how Google measures "good." Cite each post by URL.

---

## How to submit

Save your answers as `homework.md` in your portfolio repo (or a private notes folder). The act of writing in your own words is the work; do not paste AI-generated text. The exercises and homework are graded by you, against your understanding three months from now when you reach for one of these tools at work.

---

## Rubric

A passing answer:

- **Cites doc URLs** for non-obvious claims. (LCP threshold? Cite Lecture 1 §3.1 or <https://web.dev/articles/vitals>.)
- **Distinguishes lab vs. field data** consistently. If you write "the page's LCP is 2.4 s," say which source.
- **Names specific tools** (Performance Insights, Lighthouse, PageSpeed Insights, `web-vitals`) rather than vague terms ("DevTools," "analytics").
- **Includes measured numbers** for problems 1, 2, 4, 5.
- **Explains the trade-off** when one is asked for, not just the choice.

A failing answer:

- Treats every performance question as "make it faster."
- Skips the doc citations.
- Pastes AI-generated prose without engaging with the actual measured data.
- Submits "fixes" that were not measured before and after.

The work is the measurement. Three months from now, the numbers you wrote down are the numbers you reach for in a code review.
