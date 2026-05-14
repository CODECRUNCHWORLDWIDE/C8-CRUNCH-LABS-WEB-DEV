# Lecture 1 — The Rendering Pipeline and the Three Vitals

> Reading time: ~55 minutes. Cite the **web.dev Core Web Vitals overview** at <https://web.dev/articles/vitals>, the **MDN "How browsers work"** article at <https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work>, the **web.dev critical-rendering-path** article at <https://web.dev/articles/critical-rendering-path>, and the **W3C LCP spec** at <https://www.w3.org/TR/largest-contentful-paint/>. The lecture's central claim is that the three vitals are not arbitrary marketing numbers — they correspond to specific, observable stages in the browser's rendering pipeline. Once you can name the stage, you can name the fix.

---

## 1. Why measure at all

There is a temptation, after eight weeks of building, to call a site "fast" because it loads in 800 milliseconds on the developer's laptop. That number is real. It is also, for almost any user, irrelevant. The user is on a mid-range Android phone, three years old, on a flaky 4G connection at the back of a coffee shop. The CPU is two to four times slower than a developer machine. The network round-trip is ten times slower. The same site that loads in 800 ms on your laptop takes 4.6 seconds on that phone, and the user has already closed the tab.

The performance discipline answers a single uncomfortable question: **how does the site feel to the user who is not me?** The only honest answer is data. **Field data** — what real users on real devices on real networks actually experienced — is the ground truth. **Lab data** — what a synthetic audit observes under controlled conditions — is the reproducible signal you can use in a code review and in a CI gate. Neither is sufficient alone. Both are cheap to collect.

The most important shift in the last decade of performance work is that the industry agreed on a small set of numbers. Before 2018 or so, "make it fast" meant whatever the engineer who said it wanted it to mean. Some teams optimized DOMContentLoaded; some optimized "first meaningful paint" (a metric Chrome's own team later retracted as unreliable); some optimized perceived rather than measured speed. Google's **Web Vitals** initiative, launched in 2020 and refined since, settled the question for the mainstream of the web. The three numbers Google uses — and ranks search results by, partly — are **Largest Contentful Paint**, **Interaction to Next Paint** (which replaced First Input Delay in March 2024), and **Cumulative Layout Shift**. They are not perfect. They are good enough that the entire ecosystem has stopped arguing about which numbers to chase, which lets engineers spend that energy on the fixing instead. Reference: <https://web.dev/articles/vitals>.

---

## 2. The pipeline

Before we talk about the numbers, we need a picture of what the browser is actually doing between "user clicked a link" and "user sees content." Everything downstream — every metric, every fix — is a particular intervention in this pipeline.

The classical pipeline has five named stages, in order:

1. **Parse the HTML, build the DOM.** The browser receives the HTML response and parses it into the Document Object Model — a tree of nodes corresponding to elements, text, comments. The parser is **streaming**: it does not wait for the entire response to arrive before starting. It also reacts to certain elements as it sees them. A `<script>` tag without `async` or `defer` **blocks** parsing while the script is fetched and executed. A `<link rel="stylesheet">` blocks **rendering** (not parsing) until the stylesheet arrives. An `<img>` tag with a `src` kicks off an image request that runs in parallel to parsing.
2. **Parse the CSS, build the CSSOM.** Every stylesheet (external or inline) is parsed into the **CSS Object Model**, a tree mirroring the DOM with computed style values. The CSSOM is **render-blocking**: the browser cannot paint until it knows the styles for what it would paint, because partial styling would produce visible flashes of unstyled content (FOUC) and the spec forbids them. The "render-blocking" reputation of `<link rel="stylesheet">` originates here.
3. **Compute layout.** Combine DOM and CSSOM into a **render tree** (only the nodes that will be displayed — `<head>`, `display: none` elements, etc. are excluded), then run the layout algorithm: for each node in the tree, compute its position and dimensions on the screen given the box model, the viewport size, the writing direction, and the entire CSS specification's worth of rules. Layout is the single most expensive deterministic step the browser does on most pages. It is also the step that **layout shift** lives in: anything that triggers a re-layout (a new image arriving, a font swapping, an element resizing) can shift content that was already painted.
4. **Paint each layer.** The browser turns the laid-out tree into pixel commands ("draw a red rectangle here," "draw the letter A in this font at this position"). Some elements are promoted to their own **layer** for optimization — typically elements that will be transformed or that are likely to change independently. The browser may use the GPU here; most modern hardware does.
5. **Composite the layers.** The browser combines the painted layers into the final pixel buffer that goes to the display. Compositing is cheap. It is the reason `transform: translate()` and `opacity` are recommended for animations: they only affect compositing, not layout or paint.

The pipeline runs **on every frame** at 60 frames per second (16.6 ms per frame) when something is changing — a scroll, an animation, a new element appearing. On a static page, it runs once on load and then stays quiet until the user interacts. The pipeline runs **on the main thread**, except for compositing, which can run on a separate compositor thread. The main thread is shared with JavaScript execution, which is why a single long JavaScript task can stall the entire pipeline and produce dropped frames. Reference: <https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work>.

A useful mental shortcut: **everything we will measure this week is a delay in one specific stage of this pipeline.** The fixes are interventions targeted at the slow stage. If you cannot name the stage that is slow, the "fix" is a guess.

### 2.1 The critical rendering path

The web.dev framing of the same pipeline puts the spotlight on **what must happen before the browser can paint the first pixel**. The critical rendering path is:

> Receive HTML → parse HTML into DOM → discover linked stylesheets → fetch stylesheets → parse CSS into CSSOM → combine DOM + CSSOM into render tree → layout → paint.

Anything that delays any step in that chain delays the first paint. The two classical render-blockers are:

- **External CSS** (`<link rel="stylesheet" href="...">`). Render-blocking by default. The browser will not paint until the stylesheet is fetched, parsed, and merged into the CSSOM. There is a way to opt out (`media` attribute set to a non-matching value, or `disabled` then enabled by JS), but it is rarely the right tool.
- **Synchronous external JavaScript** (`<script src="..."></script>`). Parser-blocking by default. The browser will pause HTML parsing while the script is fetched and executed. `async` and `defer` change this; the recommendation since 2018 is to put `defer` on every script in the `<head>` that is not strictly required before first paint.

Reference: <https://web.dev/articles/critical-rendering-path> and <https://web.dev/articles/render-blocking-resources>.

---

## 3. Largest Contentful Paint (LCP)

**LCP measures the render time of the largest content element visible in the viewport.** Specifically, it is the time from **navigation start** (the moment the browser begins loading the new document) to the moment the largest in-viewport element finishes painting. "Largest" is measured by the element's render size (width times height), not by its file size. Reference: <https://web.dev/articles/lcp>.

The "candidate" elements LCP considers are:

- `<img>` elements.
- `<image>` elements inside `<svg>`.
- `<video>` elements (the poster frame).
- Elements with a background image (loaded via `url()`).
- Block-level elements containing text nodes.

Notably **not** in the list: inline SVGs that are not inside the candidate set, content rendered into iframes, anything outside the initial viewport.

The reported LCP value is the **last** LCP candidate's render time. As the page loads, new elements may arrive that are larger than the current candidate; each one updates the candidate. The metric stops being reported the moment the user interacts with the page (a click, a keypress, a scroll). The reasoning: once the user has engaged with the page, their perception is no longer about "when did the main content appear."

### 3.1 The thresholds

The web.dev team publishes the LCP thresholds as:

| LCP value | Rating |
|-----------|--------|
| Under 2.5 s | Good |
| 2.5 s to 4.0 s | Needs improvement |
| Over 4.0 s | Poor |

The numbers are at the **75th percentile** of the user's experience. A page with a 2.0 s median LCP and a 5.0 s 95th-percentile LCP is **not** a "good LCP" page in this framework, because the long tail is what people abandon over. Reference: <https://web.dev/articles/vitals>.

### 3.2 The four phases of LCP

The optimize-LCP guide on web.dev decomposes the LCP measurement into four constituent phases, which is the single most useful diagnostic frame you can hold. From earliest to latest:

1. **TTFB (Time to First Byte).** The time from navigation start to the first byte of the HTML response. This is server-side latency plus network round-trip. Dominated by your hosting choice and your TLS configuration. Typical contribution: 100 ms to 600 ms.
2. **Resource load delay.** The time from TTFB to the moment the LCP resource **starts** loading. If the LCP element is an image, this is "how long until the browser even knew to fetch the image" — which is bounded by HTML parsing reaching the `<img>` tag, or by a `<link rel="preload">` if you added one. Typical contribution: 100 ms to 1000 ms; the single most common big number on real pages.
3. **Resource load time.** The time the LCP resource is actually downloading. For an image, this is image size divided by effective bandwidth. For a text LCP, this is zero (text comes with the HTML). Typical contribution: 200 ms to 2000 ms.
4. **Element render delay.** The time from when the LCP resource finished downloading to when the element actually painted. Usually small — a few tens of milliseconds — except when a render-blocking JavaScript or stylesheet is still blocking the paint, in which case it dominates. Typical contribution: 50 ms to 500 ms.

Reference: <https://web.dev/articles/optimize-lcp#lcp-breakdown>.

When you profile a real LCP problem, the question is "which of the four phases is the largest?" The answer pins the fix:

| Worst phase | Likely fix |
|-------------|------------|
| TTFB | Better hosting; CDN; cache the HTML at the edge; cut server-side compute |
| Resource load delay | Add `<link rel="preload" as="image">` for the LCP image; lift the image earlier in the HTML; set `fetchpriority="high"` |
| Resource load time | Smaller image (right-size, AVIF or WebP); responsive `srcset`; CDN closer to the user |
| Element render delay | Remove render-blocking JS/CSS that runs before the LCP element paints |

The most common single fix on real pages is **adding `fetchpriority="high"` to the LCP image and removing `loading="lazy"` from it**. The image was being lazy-loaded by mistake; the browser deprioritized it; the LCP suffered. The web.dev team estimates this single fix accounts for a measurable LCP improvement on something like a third of poor-LCP pages.

### 3.3 What the LCP element actually is on common page templates

| Page type | Typical LCP element |
|-----------|---------------------|
| News article | The article headline (a large `<h1>`) or the hero image |
| Product detail page | The product image |
| Landing page | The hero image or hero background |
| Search results | The first result's image (if any) or the page heading |
| Dashboard | The first chart or table cell, if it dominates the viewport |

A quick exercise: open your portfolio in Chrome, run a Lighthouse audit, and find the "Largest Contentful Paint element" highlight in the report. It will name the element. The first time you see this is usually clarifying — the LCP element is often not what you would have guessed.

---

## 4. Interaction to Next Paint (INP)

**INP measures the latency from a user's input — click, tap, keypress — to the next frame the browser paints.** It captures the full path: the input event arriving, any event handlers running, the resulting DOM mutations, the new style/layout/paint, and the frame appearing on screen. Reference: <https://web.dev/articles/inp>.

INP is the **2024 replacement** for First Input Delay (FID). FID measured only the time the browser sat on the input event before dispatching it — useful for "is the page busy?" but blind to "is the response to my tap actually slow?" INP fixes the blindness by measuring the **full** interaction latency, end to end. The replacement happened on **March 12, 2024**; the announcement is at <https://web.dev/blog/inp-cwv-march-12>.

### 4.1 What counts as an interaction

INP considers three kinds of interaction:

- **Click** or **tap** (pointer interactions).
- **Keypress** (keyboard interactions).
- **Anything dispatched via `input` events** that the browser tracks as interactive.

It does **not** count:

- Scrolling (scroll has its own metric and budget).
- Hover (no committed interaction).
- Programmatic events your JavaScript dispatches.

A page may have hundreds of interactions in a session. The reported INP is, broadly, the **worst** interaction — specifically, the 98th-percentile interaction latency for the session (the exact algorithm includes a small adjustment to ignore the worst few interactions on long sessions, but "the worst typical interaction" is the spirit of the metric). The point is that a single very-slow click ruins the session's INP, the same way a single slow click ruins the user's mood.

### 4.2 The thresholds

| INP value | Rating |
|-----------|--------|
| Under 200 ms | Good |
| 200 ms to 500 ms | Needs improvement |
| Over 500 ms | Poor |

Threshold reference: <https://web.dev/articles/inp>.

### 4.3 The three phases of INP

Like LCP, INP decomposes:

1. **Input delay.** The time from the user's input until the corresponding event handler starts running. Dominated by the main thread being busy with something else (a long task). If JavaScript is parsing or executing when the click arrives, the click waits.
2. **Processing time.** The time the event handler is running, plus any code synchronously triggered by it. Dominated by what the handler does — a slow handler that filters a 50,000-row table will be slow here.
3. **Presentation delay.** The time from the handler finishing to the next frame being painted. Includes the style/layout/paint/composite work the DOM mutation produced. Dominated by big style recalculations (a layout that affects half the page).

Reference: <https://web.dev/articles/optimize-inp>.

The diagnostic is the same as LCP: which phase is biggest, what fix applies.

| Worst phase | Likely fix |
|-------------|------------|
| Input delay | Break up long tasks; defer non-critical JS; use `scheduler.yield()` |
| Processing time | Move expensive work off the main thread (Web Worker), virtualize the list, debounce, use `useDeferredValue` |
| Presentation delay | Avoid synchronous layout-thrashing reads; use CSS containment; reduce DOM size in the affected region |

The single most common INP problem on React pages is a **non-memoized expensive render** triggered by a small input change — a search input that filters a 10,000-item list, with the filter running synchronously inside `useState`'s setter on every keystroke. The fix is `useDeferredValue` (mark the filtered list as low-priority) or virtualization (only render the visible rows). The lecture on lab measurement walks through finding this in Performance Insights.

---

## 5. Cumulative Layout Shift (CLS)

**CLS measures how much content unexpectedly moved during the page's lifetime.** A layout shift happens when an element that was already painted in the viewport changes its position — typically because a later-arriving resource pushed it. CLS is the sum of all "shift scores" recorded between the start of page load and the page's lifetime end, with a windowing rule that limits how shifts accumulate over very long sessions. Reference: <https://web.dev/articles/cls>.

### 5.1 The thresholds

| CLS value | Rating |
|-----------|--------|
| Under 0.1 | Good |
| 0.1 to 0.25 | Needs improvement |
| Over 0.25 | Poor |

CLS is a **dimensionless** number. Unlike LCP and INP, it is not a duration. The value is the score, with thresholds calibrated by Google's own field data on what users perceive as "stable" vs. "annoying" vs. "infuriating."

### 5.2 The formula

Every individual shift gets a score:

> shift score = **impact fraction** × **distance fraction**

where:

- **Impact fraction** is the fraction of the viewport that the union of the moved element's prior and current position covers. A shift that affects 30% of the screen has an impact fraction of 0.3.
- **Distance fraction** is the largest distance the element moved (horizontally or vertically), divided by the viewport's largest dimension. A 100-pixel move on an 800-pixel-tall viewport has a distance fraction of 0.125.

So a 30%-of-screen, 100-pixel shift on an 800-pixel-tall viewport scores `0.3 × 0.125 = 0.0375`. Three such shifts in one session score `0.1125` — already over the "good" threshold.

The cumulative score is the sum of shift scores **within a 5-second window of activity**, plus a session-windowed maximum that keeps a single bad period from being averaged away by hours of clean usage. Practically: a single big shift dominates the score.

### 5.3 What counts and what does not

**Counts:**

- An image arriving and pushing the text below it down.
- A font swapping from fallback to web font, changing the line-height and pushing content.
- An ad slot being filled and pushing content.
- A late-rendered React component appearing above already-painted content.
- A banner injected at the top of the page after first paint.

**Does not count:**

- A shift that happens **within 500 ms of a user input**. The reasoning: if the user clicked "show details," the content rearranging in response is intentional, not surprising. This is the "expected" shift carve-out, and it is the reason a route navigation does not blow up your CLS as long as the new content arrives quickly enough.
- A shift caused by elements with `transform` (transform moves do not count — the element's layout position has not actually changed).
- A shift caused by elements that have never been on screen (a hidden element shifting in the document tree).

The carve-out for user-initiated shifts is the single most common source of confusion. If you click a "load more" button and the page jumps slightly, that does not count toward CLS — the user asked for it. If the page jumps slightly while the user is reading and they did not ask, that counts.

### 5.4 The named fixes

The web.dev "Optimize CLS" article enumerates the common causes and their fixes in a single table that you should commit to memory:

| Cause | Fix |
|-------|-----|
| Image without dimensions | Add `width` and `height` HTML attributes; the browser derives `aspect-ratio` automatically |
| Embed (iframe, ad, social) without reserved space | Set explicit `width` and `height` on the container, or use `aspect-ratio` |
| Font swap | `font-display: optional` (no swap at all), or `font-display: swap` with `size-adjust` to match metrics |
| Content injected above existing content | Reserve space, or use `position: fixed` for headers |
| Animations that change layout properties | Use `transform` instead of `top`/`left`/`width`/`height` |

Reference: <https://web.dev/articles/optimize-cls>.

---

## 6. The three together: a page's vitals "shape"

LCP, INP, and CLS measure three different things about the user's experience:

- **LCP** — "did the main content appear quickly?" — loading performance.
- **INP** — "when I interacted, did it respond?" — interactivity performance.
- **CLS** — "did the page stay still while I was reading?" — visual stability.

A page is "good" by Google's framework when **all three** vitals are in the green at the 75th percentile of real-user data. A page with a 2.0 s LCP, a 50 ms INP, and a 0.4 CLS is **not** a good page — the CLS sinks it.

The vitals are deliberately uncorrelated. A page can have a fast LCP and a poor INP (the initial render is quick, but a heavy interaction handler then blocks). A page can have a slow LCP and a great CLS (the hero image takes 4 seconds to arrive but it arrives into a properly-sized box, so nothing shifts). Optimizing one does not, in general, help the others. The discipline is to track all three and fix the worst one.

### 6.1 The companion metrics

The vitals are the three Google ranks on. They are not the only numbers worth tracking. Three companions:

- **TTFB (Time to First Byte).** The server-side number; a piece of LCP. Worth tracking separately because the fix is server-side, not client-side.
- **FCP (First Contentful Paint).** The time to the first text or image — any content — appearing. A precursor to LCP; useful when LCP is too noisy to optimize directly.
- **TBT (Total Blocking Time).** The lab-only proxy for INP. Sums the time the main thread was blocked by long tasks during page load. Used in Lighthouse because INP cannot be measured in a synthetic audit (no real user interactions happen).

You will see these in Lighthouse and in DevTools. The `web-vitals` library reports them too. Track LCP/INP/CLS as the primary trio; reach for TTFB/FCP/TBT when diagnosing.

---

## 7. The pipeline-to-metric map

The whole point of the pipeline framing is that each metric maps to specific stages.

| Vital | Pipeline stages it depends on |
|-------|-------------------------------|
| LCP   | Parse → CSSOM → layout → paint (for the LCP candidate). The TTFB part precedes parse. |
| INP   | The main thread between the input event and the next frame: JS execution, style recalc, layout, paint, composite for the affected region. |
| CLS   | Layout — specifically, re-layouts triggered after first paint. |

This map is the diagnostic shortcut. A slow LCP means the parse-to-paint sequence for the largest element is slow; the four-phase breakdown above pins which step. A slow INP means the main thread is blocked or the post-handler layout is expensive; the three-phase breakdown pins it. A high CLS means one or more re-layouts moved content; the layout-shift events in DevTools name the offenders.

---

## 8. Field vs. lab: why they disagree

Two of the metrics — INP and CLS — are **session-cumulative**. They make no sense in a synthetic audit because a synthetic audit does not interact with the page (no INP) and only loads the page once (limited CLS exposure; CLS is over the lifetime, and a brief audit only sees part of it). Lighthouse approximates them — it reports TBT as a proxy for INP, and it reports a load-time CLS — but the **real** numbers come only from real users, via either CrUX or your own `web-vitals` instrumentation.

The third metric — LCP — is measurable in both. Lighthouse can simulate a slow connection and slow CPU, navigate to your page, and report the LCP it observed. CrUX reports the 75th-percentile LCP across all real users in the last 28 days.

The two often disagree. Reasons:

- **Network.** Lighthouse simulates "Slow 4G"; real users are on a distribution from fiber to flaky 3G.
- **CPU.** Lighthouse simulates a 4x slowdown on a desktop CPU; real users span phones from a 2018 budget Android to a 2024 flagship.
- **Geography.** Your CDN is fast from where your CI runs; it is slow from rural Indonesia.
- **Cache.** Lighthouse runs cold every time; real users have a long-tail distribution of cache states.

Treat **field data** as the truth about real user experience, and **lab data** as the reproducible signal you use to test changes. The fix you ship has to move both, but you read them differently.

Reference: <https://developer.chrome.com/docs/crux> and <https://web.dev/articles/lab-and-field-data-differences>.

---

## 9. A canonical example: the news article

To make the abstractions concrete, walk through a generic news article page in the framework:

> A page at `news.example.com/article/something`. Server is in Virginia; user is in Sydney. The page has a top nav (logo + nav links), a 600x400 hero image, an `<h1>` headline, three paragraphs of text, a sidebar with related-articles thumbnails, an embedded tweet, and the comments section.

**LCP candidate:** the hero image, at 600x400 pixels — likely the largest in-viewport element.

**LCP breakdown:**

- TTFB: 350 ms (Sydney to Virginia, then the server's render time).
- Resource load delay: 1100 ms — the HTML parsed and discovered the `<img>` only after the head's stylesheet (`<link rel="stylesheet" href="/styles.css">`) had been waiting for its response.
- Resource load time: 800 ms — the image is a 200 KB JPEG, the network is mid-tier 4G.
- Element render delay: 150 ms — a render-blocking inline script in the head finished just before paint.

**LCP total:** 2400 ms. Just under the 2.5 s "good" threshold, but the resource load delay is the biggest contributor. The fix menu:

- Add `<link rel="preload" as="image" href="/hero.jpg" fetchpriority="high">` in the head. The browser starts the image fetch as soon as it parses the preload, before discovering the `<img>`. Expected savings: 600–900 ms off the load delay.
- Convert the image to AVIF or WebP. A 200 KB JPEG often becomes a 60 KB AVIF. Expected savings: 500 ms off load time.
- Move the inline script out of the head, or defer it. Expected savings: 100–150 ms off render delay.

**INP:** when the user clicks "show more comments," a synchronous handler appends 50 comment nodes. The handler runs in 120 ms; the resulting layout takes 80 ms; the paint takes 40 ms. INP for that interaction: 240 ms. **Slightly worse than the 200 ms "good" threshold.** The fix: virtualize the comments list, or render only the next 10 comments, or move the comment-load work into a deferred microtask using `scheduler.yield()`.

**CLS:** the hero image is `<img src="/hero.jpg">` with no `width` or `height` attributes. It arrives and pushes the headline down by 400 pixels — a shift of `0.5 × 0.5 = 0.25` (50% of viewport impact, 50% of viewport distance). Then a font swaps from a fallback to the web font; the line-height changes; another 100-pixel shift of the same 50% of viewport: `0.5 × 0.125 = 0.0625`. **CLS total: 0.31. Well into "poor" territory.** The fix:

- Add `width="600" height="400"` to the `<img>`. The browser derives the aspect ratio and reserves the space. Shift score from the image: 0.
- `font-display: optional` (no swap) or preload the font with `<link rel="preload" as="font" type="font/woff2" crossorigin>` so the web font arrives before first paint.

The diagnosis took five minutes. The fixes are three lines of HTML and one CSS property. **This is the work.** The mini-project this week walks you through doing it on a deliberately-slow page.

---

## 10. Recap and what comes next

The three Core Web Vitals are not arbitrary. **LCP** measures the slowest stage of the rendering pipeline for the page's largest element. **INP** measures the main thread's responsiveness during an interaction. **CLS** measures re-layouts that move content after first paint. Each maps to specific pipeline stages, each has a four- or three-phase breakdown that pins the bottleneck, and each has a menu of named fixes.

Lecture 2 walks the toolchain: **Chrome DevTools Performance Insights** for in-depth lab profiling, **Lighthouse** for the synthetic audit, **PageSpeed Insights** for the combined field-and-lab report, and the **`web-vitals`** library for real-user measurement in production. Lecture 3 walks the named fixes: lazy-loading images, code splitting, preconnect/preload/prefetch, font-loading strategies, and the CLS-elimination toolkit.

The discipline this week is **measure first, then fix**. Read a number, name the phase it lives in, apply the named fix, read the number again. Three months from now, when a product manager asks "why is the page slow?", the answer should not be "I don't know, let me guess." The answer should be "LCP is 3.2 s on mobile, the resource-load-delay phase accounts for 1800 ms of it, and the fix is preload plus AVIF on the hero. I'll have a PR up tomorrow."

---

*Lecture 1 ends. Lecture 2 next.*
