# Lecture 3 — The Fix Menu: Images, Fonts, Bundles, and Shifts

> Reading time: ~55 minutes. Cite the **web.dev guides** for each fix (linked inline), **MDN** for the HTML and CSS attribute references, and the **React documentation on `lazy` and `Suspense`** at <https://react.dev/reference/react/lazy>. The lecture's central claim is that **the fixes are a known menu**. You do not have to invent them. You have to pick the right one for the diagnosis Lecture 2 produced.

---

## 1. The menu, in one paragraph

Once you have profiled a page and identified the worst vital and the worst phase within it, the fix is almost always one of: **lazy-load below-the-fold images** (helps LCP indirectly, INP slightly), **set `fetchpriority="high"` on the LCP image** (helps LCP directly), **preload the LCP resource** (helps LCP directly when load delay dominates), **preconnect to third-party origins** (helps LCP when third-party assets are critical-path), **prefetch resources for the next likely navigation** (helps the next page's LCP, not the current one), **self-host fonts and apply `font-display: swap` or `optional`** (helps LCP and CLS), **preload the critical web font** (helps LCP when text is the LCP), **add `width` and `height` to images** (helps CLS), **add `aspect-ratio` containers around embeds** (helps CLS), **code-split routes with `React.lazy`** (helps LCP by shrinking the initial bundle, and helps INP by reducing the parse-and-compile burden), **break up long tasks with `scheduler.yield()` or `useDeferredValue`** (helps INP), and **apply `content-visibility: auto` to offscreen sections** (helps INP by skipping render work). Twelve interventions. Most pages need three or four of them.

The rest of the lecture is the per-fix detail.

---

## 2. The image fixes

Images are the single largest category of fixes on most pages. They are the largest network payload, the LCP candidate on most page templates, and the most common CLS offender. Optimize images well and you have addressed maybe half of a typical performance budget.

### 2.1 `loading="lazy"` for below-the-fold images

The native lazy-loading attribute:

```html
<img src="/avatars/user-42.jpg" alt="" width="64" height="64" loading="lazy">
```

The `loading="lazy"` attribute tells the browser to defer the image fetch until the image is close to entering the viewport. "Close" is a browser-defined threshold; in Chrome it is roughly two viewport-heights below the fold, calibrated to balance "load eagerly so the user does not see a placeholder when they scroll" against "save bandwidth on images they never reach."

The rule of thumb: **every image below the fold should be `loading="lazy"`. No image above the fold should be `loading="lazy"`.** The LCP image in particular must never be lazy — a lazy LCP image is deprioritized by the browser and the LCP suffers.

The attribute is supported in every modern browser. The fallback in older browsers is "load the image eagerly," which is the same as not having the attribute. **There is no downside to adding it.** Reference: <https://web.dev/articles/browser-level-image-lazy-loading>.

Common mistakes:

- **Lazy-loading the LCP image.** The browser will not fetch it until the user is near it; but the user is *already at it* on first load, so the lazy hint just delays the fetch the browser would otherwise prioritize. Inspect Lighthouse's "Largest Contentful Paint element" highlight; if it is `loading="lazy"`, that is your first fix.
- **Forgetting `width` and `height` alongside `loading="lazy"`.** A lazy image still arrives; if its dimensions are not declared, it still shifts content. Lazy and dimensions are independent decisions and both matter.

### 2.2 `fetchpriority="high"` on the LCP image

The `fetchpriority` attribute is the browser-level priority hint:

```html
<img src="/hero.jpg" alt="" width="1200" height="600" fetchpriority="high">
```

Three values: `high`, `low`, `auto`. The browser already prioritizes the first viewport's worth of images, but it does so heuristically; `fetchpriority="high"` is the explicit signal that this image is the LCP and should be at the front of the line. On the Chrome team's own benchmarks, adding `fetchpriority="high"` to the LCP image saves on the order of 100–300 ms in LCP across the typical page. Reference: <https://web.dev/articles/fetch-priority>.

The companion lesson: do not put `fetchpriority="high"` on every image. The whole point is that one image is prioritized over the others.

### 2.3 `decoding="async"`

```html
<img src="/photo.jpg" alt="" width="800" height="600" decoding="async">
```

The `decoding="async"` attribute tells the browser to decode the image off the main thread, so the decoding work does not block the paint. Useful for any image that is not contributing to the LCP. The LCP image should be `decoding="sync"` (or omit the attribute) so the browser does not introduce a one-frame delay decoding it after download.

The interaction:

| LCP image attributes | Why |
|----------------------|-----|
| `fetchpriority="high"` | Front of the queue |
| **no** `loading="lazy"` | Do not defer |
| **no** `decoding="async"` | Decode synchronously to paint in the same frame |
| `width` and `height` | No layout shift |

| Non-LCP image attributes | Why |
|--------------------------|-----|
| `loading="lazy"` | Defer if below fold |
| `decoding="async"` | Do not block paint on decode |
| `width` and `height` | No layout shift |

### 2.4 Responsive images with `srcset` and `sizes`

The single largest image-payload reduction on most sites is **serving the right resolution for the device**. A 2400-pixel-wide JPEG on a phone with a 360-pixel-wide viewport is a four-times waste. The `srcset` and `sizes` attributes let you offer multiple resolutions and let the browser pick:

```html
<img
  src="/hero-1200.jpg"
  srcset="
    /hero-400.jpg  400w,
    /hero-800.jpg  800w,
    /hero-1200.jpg 1200w,
    /hero-2400.jpg 2400w"
  sizes="(min-width: 1024px) 1200px, 100vw"
  alt=""
  width="1200"
  height="600"
  fetchpriority="high">
```

The `srcset` declares the available sources with their widths. The `sizes` declares the displayed width at each viewport size. The browser picks the smallest source whose width is at least the displayed width times the device pixel ratio. Reference: <https://developer.mozilla.org/en-US/docs/Web/HTML/Responsive_images>.

### 2.5 Modern image formats: AVIF and WebP

The format axis is roughly: PNG > JPEG > WebP > AVIF, where ">" means "larger at the same visual quality." Switching from JPEG to WebP typically cuts file size by 30%; switching from JPEG to AVIF typically cuts by 50%. The `<picture>` element provides format fallback:

```html
<picture>
  <source type="image/avif" srcset="/hero.avif">
  <source type="image/webp" srcset="/hero.webp">
  <img src="/hero.jpg" alt="" width="1200" height="600" fetchpriority="high">
</picture>
```

Every modern browser supports WebP. AVIF support is universal on the major engines as of late 2023; treat it as the new default. Reference: <https://web.dev/articles/uses-webp-images> and <https://web.dev/articles/compress-images-avif>.

### 2.6 The image-fix checklist

A pre-flight check before shipping a page:

- [ ] LCP image identified (Lighthouse or DevTools).
- [ ] LCP image: no `loading="lazy"`; `fetchpriority="high"`; correct `width`/`height`; ideally `<link rel="preload">` in the head.
- [ ] Every below-the-fold image: `loading="lazy"`; correct `width`/`height`; `decoding="async"`.
- [ ] Every image: a `srcset` if it is displayed at varying widths.
- [ ] Every image: a modern format (AVIF or WebP) with a `<picture>` fallback if you serve legacy browsers.
- [ ] No image larger than 200 KB (rule of thumb; tune for your case).

---

## 3. The JavaScript-bundle fixes

JavaScript is the second-largest performance budget on most pages. It is also the most affected by your framework choices, your build configuration, and your discipline about third-party scripts.

### 3.1 Code splitting with `React.lazy`

You did this in Week 8 for the `/admin` route. The pattern, restated:

```jsx
import { lazy, Suspense } from "react";

const Admin = lazy(() => import("./pages/Admin.jsx"));

function App() {
  return (
    <Suspense fallback={<RouteSpinner />}>
      {/* router rendering Admin somewhere */}
    </Suspense>
  );
}
```

The dynamic `import()` is a syntax the bundler (Vite, in our case) understands as a **code split boundary**: the module and its dependencies become a separate chunk that downloads on first need. `React.lazy` wraps a function returning the dynamic import in a React-compatible component; `<Suspense>` provides the fallback UI shown while the chunk is loading.

The effect on LCP: the **initial** bundle shrinks by whatever the lazy chunk's transitive dependency tree weighs. On a typical SPA, route-level splitting cuts the initial bundle by 30–60%. That is parse, compile, and execute time you do not spend on first paint. Reference: <https://react.dev/reference/react/lazy> and <https://web.dev/articles/reduce-javascript-payloads-with-code-splitting>.

### 3.2 The `defer` and `async` script attributes

For non-module scripts loaded via `<script src="...">`, the default behavior is **parser-blocking**: the browser pauses HTML parsing while the script is fetched and executed. Two opt-outs:

- `defer` — the script is fetched in parallel and executed after the HTML is fully parsed, before `DOMContentLoaded`. Scripts with `defer` execute in document order.
- `async` — the script is fetched in parallel and executed as soon as it is downloaded, in whatever order they finish. No guarantee of order.

The recommendation: **`defer` everything that is not part of the critical path**. `async` is for scripts that have no dependencies on the DOM and no ordering requirements with other scripts (analytics beacons, ads — though see Section 6 on third-party scripts).

```html
<!-- Parser-blocking. Bad. -->
<script src="/app.js"></script>

<!-- Deferred. Good. -->
<script src="/app.js" defer></script>

<!-- Async. Good for fire-and-forget telemetry. -->
<script src="/analytics.js" async></script>
```

ES modules (`<script type="module">`) are deferred by default; no `defer` attribute needed.

Reference: <https://web.dev/articles/efficiently-load-third-party-javascript>.

### 3.3 Reducing JavaScript at the source

The cheapest JavaScript is the JavaScript you do not ship. Three knobs:

- **Tree-shake.** Use ES modules and named imports. `import { useState } from "react"` (named) is tree-shakable; `import * as React from "react"; React.useState` (namespace) is not.
- **Code-split.** As above; route-level splits are the easy 30–60% win.
- **Audit your dependencies.** A common 200 KB+ offender is `moment.js` (use `date-fns` or `dayjs`); another is `lodash` imported wholesale (`import _ from "lodash"`) instead of cherry-picked (`import debounce from "lodash/debounce"`); another is a charting library that ships every chart type when you use one.

The **bundle analyzer** is the tool that surfaces these. For Vite:

```bash
npm install --save-dev vite-bundle-visualizer
npx vite-bundle-visualizer
```

The output is an interactive treemap of every module in every chunk. The first time you run it on a real app is illuminating; the second-largest entry is usually something you did not intend to ship.

---

## 4. Resource hints — preconnect, preload, prefetch

The `<link>` element with various `rel` values is the browser's interface for "I know something about future network needs; act on it." Three of the values matter most.

### 4.1 `preconnect`

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

`preconnect` opens the TCP+TLS handshake to a known third-party origin early, so when a later resource references that origin the handshake is already done. The savings are typically 100–500 ms on the first resource from that origin. The cost is the handshake's resources (a small connection slot).

Use `preconnect` for any third-party origin that hosts a resource on the critical path:

- Your font provider (`fonts.gstatic.com` for Google Fonts).
- Your image CDN.
- Your video CDN.
- Your analytics endpoint (if it loads a script).

The `crossorigin` attribute is required for origins serving credentialed resources (fonts are credentialed). For CORS-anonymous origins (most image CDNs) you omit it.

**Rule:** preconnect to **no more than three** distinct origins. More than that and you are using more handshake slots than the browser wants to allocate, with diminishing returns. Reference: <https://web.dev/articles/preconnect-and-dns-prefetch>.

### 4.2 `preload`

```html
<link rel="preload" href="/hero.jpg" as="image" fetchpriority="high">
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/critical.css" as="style">
```

`preload` instructs the browser to start downloading a resource **immediately** at the priority of the resource type, before the browser would otherwise discover it. The most useful applications:

- **The LCP image.** Saves the time between "head finishes parsing" and "img tag discovered." Often the single biggest LCP improvement on a page.
- **A critical web font.** Avoids the second-paint flash when the font finally arrives.
- **A critical script** in the head that needs to execute as soon as possible.

The `as` attribute is **required**. The `type` attribute is recommended (so the browser can skip preloads for unsupported MIME types). The `crossorigin` attribute is required for fonts and for CORS resources.

**Rule:** preload **no more than three** resources. The point of preload is to elevate three resources above all the others; preloading everything elevates nothing. Reference: <https://web.dev/articles/preload-critical-assets>.

### 4.3 `prefetch`

```html
<link rel="prefetch" href="/next-page-bundle.js">
```

`prefetch` instructs the browser to download a resource at **low priority**, for use on a future navigation. The classic case is "the user is on the home page; the next likely click is the search page; prefetch the search-page bundle so when the user clicks it is already cached."

`prefetch` is cooperative. The browser does it on idle time, after critical resources are done. Reference: <https://web.dev/articles/link-prefetch>.

In React Router v6, the official lazy-route mechanism includes a `prefetch` option that fires on hover or on visible — a small, useful UX win without you having to write the link tags. Reference: <https://reactrouter.com/en/main/route/lazy>.

### 4.4 `dns-prefetch` and `modulepreload`

Two niche but useful hints:

- **`dns-prefetch`.** Resolves DNS only (no TCP, no TLS). Cheaper than `preconnect`; useful when you have many origins to hint at. The interaction: include `dns-prefetch` as a fallback for `preconnect` when the third-party origin is not yet supported by every browser's `preconnect`.
- **`modulepreload`.** The ES-module-aware version of `preload`. Preloads a module and its dependency graph. Vite emits these automatically for the modules in its initial chunk; you rarely write them by hand.

### 4.5 The hint cheat sheet

| Hint | When |
|------|------|
| `preconnect` | Open early handshake to a known third-party origin (font CDN, image CDN, analytics) |
| `dns-prefetch` | Cheap DNS-only hint to many origins; fallback for browsers without preconnect |
| `preload` | The LCP image, a critical font, a critical script — at most three |
| `modulepreload` | ES modules; usually automatic via your bundler |
| `prefetch` | A resource for the **next** navigation, downloaded at low priority |

The three rules:

1. **No more than three preconnects.** Handshake budget is finite.
2. **No more than three preloads.** Priority budget is finite.
3. **Preload is for *this* page. Prefetch is for the *next* page.** They are not interchangeable.

---

## 5. Font loading

Fonts are the second-most-common cause of CLS after un-sized images, and they contribute to LCP whenever text is the LCP element. The right font strategy is a one-time setup that pays back on every page.

### 5.1 The four FOIT/FOUT states

When a page declares `font-family: "Inter", sans-serif` and the browser does not yet have Inter, the browser is in one of four states for that text:

- **Block.** Render no text at all until the web font arrives. The user sees blank space where the text should be.
- **Swap.** Render the fallback (`sans-serif`) immediately; swap to Inter when it arrives. The user sees fallback text first, then a visible swap.
- **Fallback.** Block for 100 ms; then swap if the font arrives within a 3-second period; otherwise stay on fallback.
- **Optional.** Block for 100 ms; if the font has not arrived, give up and use the fallback for this load. (The font is still cached for the next load.)

The default behavior, in most browsers, is `block` for up to 3 seconds before falling back. The default is bad. The user sees nothing.

### 5.2 `font-display`

The CSS at-rule descriptor controls the behavior:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter.woff2") format("woff2");
  font-display: swap;
}
```

The four values, with their trade-offs:

| Value | Initial render | If font arrives | Trade-off |
|-------|---------------|-----------------|-----------|
| `block` | Blank (up to 3 s) | Renders | Bad for LCP, worst for users |
| `swap` | Fallback | Swaps to web font | Causes CLS at swap time |
| `fallback` | 100 ms blank, then fallback | Swaps if within 3 s | Hybrid; less swap-shift than `swap`, less blank than `block` |
| `optional` | 100 ms blank, then fallback | **Does not swap** this load | No swap-shift; "see the web font next time" |

**The recommendation for most pages: `swap` for text that is okay with a brief style change; `optional` for text where avoiding CLS matters more than aesthetic consistency.** Reference: <https://web.dev/articles/font-display>.

### 5.3 Self-host vs. Google Fonts

The two delivery models:

- **Google Fonts CSS API.** `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">`. The browser fetches a stylesheet from Google's CDN, which references the font files at `fonts.gstatic.com`. **Two extra origin handshakes** on top of your own origin's. **One extra critical CSS request** that must finish before the browser knows about the font URLs.
- **Self-host woff2.** Copy the woff2 file into your project. Reference it in your own `@font-face` rule. **No extra origins.** Same-origin caching.

Self-hosting is faster, period, for the first visit. The Google CDN advantage of "the user might already have this font cached from another site" was meaningful pre-2020 when cross-origin cache sharing existed; it was killed in 2020 when browsers partitioned the HTTP cache per top-level origin. Today, the Google Fonts cache hit is essentially never. Reference: <https://web.dev/articles/font-best-practices>.

**The minimum viable self-host setup:**

1. Download the woff2 files from <https://gwfh.mranftl.com/fonts> (a free Google-fonts-mirror service) or directly from the Google Fonts page.
2. Place the files in `public/fonts/` in your project.
3. Add the `@font-face` rule to your CSS.
4. Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` in the head for the font weight/style your LCP text uses.

```html
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

The preload kicks the font fetch off as soon as the head is parsed. The `font-display: swap` ensures text renders immediately with the fallback. The combination is the standard "fast fonts" pattern.

### 5.4 Reducing CLS from font swap

`font-display: swap` causes a layout shift when the web font replaces the fallback — typically because the two fonts have slightly different x-heights or character widths. Two strategies:

- **`font-display: optional`.** No swap; no shift. Trade-off: the web font is not applied on first load, only on subsequent loads (after it is cached).
- **The `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` descriptors.** Match the metrics of the fallback to the web font, so the swap is imperceptible. The `f-mods` tool generates these for any web-font / fallback pair: <https://deploy-preview-15--upbeat-shirley-608546.netlify.app/perfect-ish-font-fallback/?font=Inter>. Reference: <https://web.dev/articles/css-size-adjust>.

### 5.5 The font-fix checklist

- [ ] Self-hosted woff2, not Google Fonts CSS API.
- [ ] `font-display: swap` (or `optional` for CLS-sensitive text).
- [ ] `<link rel="preload">` for the LCP-text font weight, with `crossorigin`.
- [ ] If using `swap`, the fallback font's metrics matched via `size-adjust` or the override descriptors.

---

## 6. Eliminating layout shift

The CLS toolbox is the smallest of the four — three or four interventions cover almost every case.

### 6.1 `width` and `height` HTML attributes on images and videos

```html
<img src="/photo.jpg" alt="" width="800" height="600">
```

The browser computes an implicit `aspect-ratio: 800 / 600` from the attributes, reserves the right amount of space, and avoids the shift when the image arrives. The unit-less width and height are not the rendered size — they are the source size, used only to compute the aspect ratio. CSS (`max-width: 100%; height: auto`) still sizes the image responsively.

The single most impactful CSS rule for unsized-image CLS is:

```css
img, video {
  max-width: 100%;
  height: auto;
}
```

Combined with `width` and `height` attributes on every image, this eliminates almost all image-driven CLS. Reference: <https://web.dev/articles/optimize-cls#sized-images>.

### 6.2 `aspect-ratio` for embeds and ads

For things you cannot put `width` and `height` on directly — third-party embeds, ad slots, iframes — the `aspect-ratio` CSS property reserves space:

```css
.video-embed {
  aspect-ratio: 16 / 9;
  width: 100%;
}
.ad-slot {
  aspect-ratio: 4 / 1;
  width: 100%;
  min-height: 80px;
}
```

The element is sized to maintain the ratio. When the iframe or the ad loads, it fills the reserved space — no shift. Reference: <https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio>.

### 6.3 Reserve space for content that will be injected

If your application injects a banner (a cookie notice, an announcement bar, an error message) at the top of the page after first paint, **reserve space for it**. The cheapest way: render the banner's container empty at first paint, with a `min-height` matching the banner's height, then fill it.

```html
<div id="announcement-slot" style="min-height: 48px;"></div>
```

Filling the empty `<div>` later does not cause a shift; the layout was already committed.

### 6.4 `contain` and `content-visibility`

For long pages with many independent sections, the `contain` family lets the browser skip layout and paint work on sections that have not changed or are not visible. Two useful values:

- **`contain: layout style paint`** on a section means "changes inside this section do not affect the rest of the page." The browser can re-layout the section in isolation. This helps **INP** by reducing the cost of post-handler layout work; it can also help reduce unrelated CLS by isolating shifts.
- **`content-visibility: auto`** on a section means "skip rendering work entirely while this is offscreen." The browser does not lay out or paint the contents until the section is near the viewport. Massive speedup on long pages.

The `content-visibility: auto` interaction with CLS is subtle: an offscreen section has zero height until rendered, which is the right answer *until* you scroll near it and the contents pop in, expanding the section and shifting everything below. The fix is `contain-intrinsic-size`:

```css
.long-article-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
```

The `contain-intrinsic-size` tells the browser "treat this as 500 px tall when you have not rendered it." When you scroll near it and the actual contents are smaller or larger, the difference is the shift — but it is bounded, and you can tune the value to be close to the typical actual height.

Reference: <https://web.dev/articles/content-visibility>.

### 6.5 The CLS-fix checklist

- [ ] Every `<img>` has `width` and `height` attributes (or is a background-image with the container sized).
- [ ] Every iframe, embed, or ad slot has `aspect-ratio` or explicit dimensions.
- [ ] Fonts use `font-display: swap` with matched fallback metrics, or `font-display: optional`.
- [ ] Any banner injected after first paint has a reserved slot.
- [ ] Long pages use `content-visibility: auto` + `contain-intrinsic-size` on sections.

---

## 7. INP fixes

INP is the newest vital and the one with the least settled toolchain. The fixes break into three groups, matching the three INP phases.

### 7.1 Reducing input delay

Input delay is the gap between input event and handler start. It is caused by **the main thread being busy** when the input arrives.

The fixes:

- **Defer non-critical scripts.** A script that runs at boot and blocks the main thread for 800 ms means clicks during that 800 ms have at least 800 ms of input delay. Use `defer` and `async`; consider whether the script needs to run at boot at all.
- **Code-split.** Smaller initial bundles parse faster.
- **Avoid third-party scripts that take over the main thread.** A chat-widget SDK that runs 1.5 s of JavaScript at boot is making your INP much worse. Lazy-load it on first interaction with the widget's launcher.

### 7.2 Reducing processing time

Processing time is the time the handler runs. Caused by **the handler doing too much work synchronously**.

The fixes:

- **`useDeferredValue`** in React. Mark expensive UI work as low-priority. The handler updates the state immediately; the expensive re-render happens at a lower priority and does not block the input.
- **`useTransition`**. Similar; explicitly mark a state transition as non-urgent.
- **Virtualize lists.** A 10,000-row table that re-renders all 10,000 rows on every keystroke is the canonical INP killer. Use `@tanstack/react-virtual` or `react-window` to render only the visible rows.
- **`scheduler.yield()`**. The 2024 API for cooperatively yielding to the main thread inside a long task. `await scheduler.yield()` in a long synchronous loop gives the browser a chance to handle queued events before continuing.
- **Web Worker.** For computation that does not need the main thread (parsing, formatting, image processing), move it to a worker.

Reference: <https://web.dev/articles/optimize-inp>.

### 7.3 Reducing presentation delay

Presentation delay is the time from handler end to frame paint. Caused by **expensive post-handler style, layout, or paint**.

The fixes:

- **Avoid layout thrashing.** A handler that reads `offsetHeight` then sets a `style.height` then reads `offsetTop` then sets `style.top` forces three synchronous layouts. Read all values first, then write all values.
- **`contain` on the affected region.** The browser only needs to re-layout the contained subtree.
- **Reduce DOM size.** A handler that mutates one element inside a 10,000-node DOM is slower than the same mutation in a 1,000-node DOM, because style recalc and layout scale with DOM size.

---

## 8. The defer non-critical CSS pattern

A small fix worth knowing. If your page has CSS that styles below-the-fold content (a footer, a modal, a print stylesheet), you can mark it non-critical:

```html
<link rel="preload" href="/non-critical.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/non-critical.css"></noscript>
```

The `preload` + `onload` swap-to-stylesheet trick downloads the CSS without render-blocking; the `<noscript>` fallback keeps it working for no-JS users. The Filament Group originated the pattern; it is now standard.

The cleaner alternative is to split your CSS into a critical chunk (inlined in the head) and a non-critical chunk (loaded via the pattern above). Tools like Critters and Critical do this at build time. Reference: <https://web.dev/articles/extract-critical-css>.

---

## 9. The third-party-script problem

A real production page typically includes scripts you did not write: an analytics script (Google Analytics, Plausible, Fathom), a chat widget (Intercom, Drift), an ad SDK (Google AdSense), a tag manager (Google Tag Manager, Segment), a video embed (YouTube, Vimeo), a social embed (Twitter, Facebook). Each one is a network request, a parse-and-compile, and an execution slice on the main thread.

The named fixes:

- **`async` or `defer` on every third-party `<script>`.** Always.
- **Preconnect to the third-party origin.** Saves the handshake.
- **Lazy-load on interaction.** A chat widget that loads only when the user clicks the launcher icon does not contribute to LCP, INP, or initial CLS.
- **Use a facade.** A facade is a lightweight placeholder that visually resembles the embed but does nothing until clicked. The classic example: a YouTube facade that shows the video's poster image and a play button; clicking the play button loads the real YouTube embed. Reference: <https://web.dev/articles/third-party-facades>.

Third-party scripts are often the **single largest INP contributor** in real-world traces. The diagnostic shortcut: open Performance Insights, find the "Long tasks" insight, look at the call stacks — if they bottom out in `gtm.js` or `intercom.js`, the third party is the offender.

---

## 10. The performance budget

A performance budget is a written commitment: "this page will ship under X KB of JavaScript, Y KB of images, Z KB total." It is enforced in CI by running Lighthouse (or `bundlesize`, or `size-limit`) on every PR and failing the build if the budget is exceeded.

A starter budget for a typical landing page:

| Resource | Budget (compressed) |
|----------|---------------------|
| HTML | 30 KB |
| CSS | 30 KB |
| JavaScript (initial) | 150 KB |
| Images (above the fold) | 200 KB |
| Total (above the fold) | 500 KB |
| Total (full page) | 1.5 MB |

The numbers come from web.dev's published guidance and from the HTTP Archive's "median real-world page" data. For a richer page (a dashboard, a video site), the numbers are larger; for a content-marketing page, they should be smaller.

The budget is a forcing function. Without one, every developer adds 10 KB of their favorite library, and the page is 4 MB by Christmas. With one, every addition has to either fit, displace something else, or get a deliberate exception.

Reference: <https://web.dev/articles/performance-budgets-101>.

---

## 11. The fix-menu summary

| Symptom | Likely fix |
|---------|-----------|
| LCP image is `loading="lazy"` | Remove it; add `fetchpriority="high"` |
| LCP > 2.5 s, load delay dominant | `<link rel="preload" as="image">` for the LCP image |
| LCP > 2.5 s, load time dominant | Convert to AVIF/WebP; right-size with `srcset` |
| LCP > 2.5 s, render delay dominant | Remove render-blocking JS/CSS before the LCP element paints |
| INP > 200 ms, input delay dominant | Break up long tasks at boot; defer third-party scripts |
| INP > 200 ms, processing dominant | `useDeferredValue`; virtualize lists; move work to a worker |
| INP > 200 ms, presentation dominant | Avoid layout thrashing; apply `contain` |
| CLS > 0.1, image-driven | `width`/`height` attributes; `max-width: 100%; height: auto` |
| CLS > 0.1, font-swap-driven | `font-display: optional` or matched fallback metrics |
| CLS > 0.1, late-content-driven | Reserve space; use `aspect-ratio` |
| Big initial bundle | Code-split with `React.lazy`; audit with `vite-bundle-visualizer` |
| Third-party scripts dominating main thread | `async`/`defer`; lazy-load on interaction; use a facade |

Twelve symptoms; twelve fixes. The week's mini-project lines up the diagnoses and the fixes; the homework asks you to walk the same workflow on a real public page.

---

## 12. Recap and what comes next

The fixes are a known menu. Lazy-load below-the-fold images; `fetchpriority="high"` on the LCP image; preload the LCP resource; preconnect to third-party origins; prefetch the next navigation's resources; self-host fonts with `font-display: swap`; preload the critical web font; `width` and `height` on every image; `aspect-ratio` on every embed; code-split routes with `React.lazy`; break up long tasks; `content-visibility: auto` for offscreen sections. Twelve interventions, three or four per page in practice.

The discipline from Lecture 2 carries: **one fix per change, measured before and after**. The temptation, having read this lecture, is to apply all twelve at once. Resist. The measure-then-fix workflow is what separates senior performance work from cargo-culted "best practices," and the practice is what scales to a team that did not read your changes line by line.

The mini-project this week ships a deliberately-slow page. Your job is the workflow: profile, diagnose, apply one fix, re-profile, write the numbers down, repeat. By Sunday, your report has before/after numbers for all three vitals and citations to web.dev for each fix you applied.

---

*Lecture 3 ends. The exercises begin.*
