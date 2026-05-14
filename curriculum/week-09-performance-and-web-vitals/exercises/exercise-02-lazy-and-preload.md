# Exercise 2 — Lazy-loading, Preload, and fetchpriority

> Estimated time: 60 minutes.
> Prerequisite: Lecture 3 read. A local Vite project or just an empty folder with a static `index.html`.

---

## Goal

Take a deliberately-slow static page, apply three named image fixes — `loading="lazy"` for below-the-fold images, `fetchpriority="high"` for the LCP image, and `<link rel="preload">` for the LCP resource — and measure the LCP before and after each fix.

The point is the **per-fix measurement**: one change, one re-profile. By the end you should be able to defend each attribute's contribution in milliseconds.

---

## Setup

Create a folder `exercise-02/` and add the starter files below.

**`index.html`** — the unoptimized starting point:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Exercise 2 — Image performance</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Photo gallery</h1>
    <p>A small below-the-fold-heavy page for the image-perf exercise.</p>
  </header>

  <main>
    <!-- The LCP candidate: a large above-the-fold hero -->
    <img src="https://picsum.photos/1200/600?random=1" alt="Hero" class="hero">

    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

    <!-- Twelve below-the-fold images -->
    <section class="grid">
      <img src="https://picsum.photos/600/400?random=2"  alt="">
      <img src="https://picsum.photos/600/400?random=3"  alt="">
      <img src="https://picsum.photos/600/400?random=4"  alt="">
      <img src="https://picsum.photos/600/400?random=5"  alt="">
      <img src="https://picsum.photos/600/400?random=6"  alt="">
      <img src="https://picsum.photos/600/400?random=7"  alt="">
      <img src="https://picsum.photos/600/400?random=8"  alt="">
      <img src="https://picsum.photos/600/400?random=9"  alt="">
      <img src="https://picsum.photos/600/400?random=10" alt="">
      <img src="https://picsum.photos/600/400?random=11" alt="">
      <img src="https://picsum.photos/600/400?random=12" alt="">
      <img src="https://picsum.photos/600/400?random=13" alt="">
    </section>
  </main>

  <footer>
    <p>End of gallery.</p>
  </footer>
</body>
</html>
```

**`styles.css`**:

```css
:root { color-scheme: light dark; font-family: system-ui, sans-serif; }
body { max-width: 80ch; margin: 0 auto; padding: 1rem; }
header h1 { margin-bottom: 0.25rem; }
.hero { width: 100%; height: auto; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}
.grid img { width: 100%; height: auto; display: block; }
footer { margin: 2rem 0; text-align: center; opacity: 0.7; }
```

Serve the folder locally:

```bash
# Inside exercise-02/
npx http-server -p 5500 -c-1
```

(Or use VS Code's Live Server extension on port 5501.)

---

## Step 0 — Baseline

Open the page in Chrome with the URL `http://localhost:5500/`.

Open DevTools → **Performance Insights** → Throttle: Slow 4G + 4x CPU → Record → Reload → Stop.

Read the LCP insight. Record in your notes:

| Run | LCP (ms) | Element | Biggest phase |
|-----|---------:|---------|---------------|
| Baseline | | | |

Also run Lighthouse on Mobile and note the Performance score and LCP.

---

## Step 1 — Add `loading="lazy"` to below-the-fold images

Add `loading="lazy"` to every `<img>` in the `.grid` section. **Do not** add it to the hero `<img>`.

```html
<img src="https://picsum.photos/600/400?random=2" alt="" loading="lazy">
<!-- and so on for all twelve grid images -->
```

Reload. Re-profile. Record:

| Run | LCP (ms) | Total requests in first 3 s | Biggest phase |
|-----|---------:|----------------------------:|---------------|
| After loading="lazy" | | | |

You should see:

- **Total requests in the first 3 s drops** (the grid images are not requested up-front).
- **LCP may improve slightly**. The improvement is indirect — the bandwidth that was being spent on the grid is now available for the hero.

Write one sentence: what is the actual *direct* benefit of `loading="lazy"`, and what is the *indirect* benefit you observed?

Reference: <https://web.dev/articles/browser-level-image-lazy-loading>.

---

## Step 2 — Add `fetchpriority="high"` and `width`/`height` to the hero

Add `fetchpriority="high"` to the hero. While you are there, add `width` and `height` attributes (they prevent CLS and are good hygiene):

```html
<img
  src="https://picsum.photos/1200/600?random=1"
  alt="Hero"
  class="hero"
  width="1200"
  height="600"
  fetchpriority="high">
```

Reload. Re-profile. Record:

| Run | LCP (ms) | CLS | Biggest phase |
|-----|---------:|----:|---------------|
| After fetchpriority + dims | | | |

You should see:

- **LCP improves** (the browser prioritizes the hero fetch).
- **CLS goes to 0 or near-zero** (the hero's reserved space prevents the shift).

Write one sentence: why does `fetchpriority="high"` change the ordering of network requests, and what would happen if you added it to **every** image on the page?

Reference: <https://web.dev/articles/fetch-priority>.

---

## Step 3 — Add `<link rel="preload">` for the hero

Add a preload hint in the `<head>`, **before** the stylesheet:

```html
<link rel="preload" as="image" href="https://picsum.photos/1200/600?random=1" fetchpriority="high">
<link rel="stylesheet" href="styles.css">
```

Reload. Re-profile. Record:

| Run | LCP (ms) | Resource load delay (ms) | Biggest phase |
|-----|---------:|-------------------------:|---------------|
| After preload | | | |

You should see:

- **Resource load delay drops sharply** (the browser starts the hero fetch before discovering the `<img>` tag).
- **LCP improves** by approximately the load-delay savings.

Write one sentence: why does adding a preload move work earlier in the timeline, and what is the upper limit of how many things you should preload on a page?

Reference: <https://web.dev/articles/preload-critical-assets>.

---

## Step 4 — Wrap-up report

Combine your before/after table into a single summary:

| Step | LCP (ms) | Delta from previous |
|------|---------:|--------------------:|
| Baseline | | — |
| + loading="lazy" on below-fold | | |
| + fetchpriority="high" + dims on hero | | |
| + preload on hero | | |

Write a two- to three-paragraph reflection:

- Which single fix moved LCP the most? Was that the fix you expected?
- Was there any fix that moved a different metric (CLS, the number of requests) more than it moved LCP?
- If you could only ship **one** of the three fixes, which would you ship, and why?

---

## Done when

- [ ] The four-run table is filled in with measured numbers.
- [ ] Each step's one-sentence rationale is written.
- [ ] The wrap-up reflection answers the three questions.

---

## Common pitfalls

**1. Caching.** Chrome's HTTP cache will serve the second and third runs from cache and the LCP will be unrepresentatively fast. In DevTools' Network panel, check "Disable cache" while DevTools is open. Or use the Performance Insights record + reload, which bypasses cache on a clean reload.

**2. The hero is *not* lazy.** If you add `loading="lazy"` to every image including the hero, the hero gets deprioritized and LCP gets worse. The exercise tests that you keep the hero eager.

**3. Preloading non-LCP assets.** Preloading a background image, a hero video, and a font all at once means none of them is prioritized. The rule is *at most three* preloads, and only for genuinely-on-the-critical-path resources.

**4. The `picsum.photos` cache.** The `picsum.photos` placeholder service caches aggressively per URL. If you change the `?random=` query parameter between runs you will get a fresh image; if you do not, the second run will be cached. For this exercise, keep the URLs stable and Disable cache.

---

## Stretch (optional)

- Replace the JPEGs with **WebP or AVIF** equivalents (use <https://squoosh.app/> to convert). Re-measure. The load-time phase should drop sharply.
- Add a **`<picture>` element** with WebP and AVIF sources and a JPEG fallback. Test in Chrome (gets AVIF) and Safari (gets WebP or JPEG depending on version).
- Add **`srcset` and `sizes`** to the hero, with 600w / 1200w / 2400w sources. Verify in DevTools' Network panel that the browser picks the appropriate width for your device pixel ratio.

---

## Reference

- web.dev — Optimize LCP: <https://web.dev/articles/optimize-lcp>
- web.dev — Browser-level image lazy-loading: <https://web.dev/articles/browser-level-image-lazy-loading>
- web.dev — fetchpriority: <https://web.dev/articles/fetch-priority>
- web.dev — Preload critical assets: <https://web.dev/articles/preload-critical-assets>
- MDN — `<img>` loading: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading>
- MDN — `<img>` fetchpriority: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#fetchpriority>
