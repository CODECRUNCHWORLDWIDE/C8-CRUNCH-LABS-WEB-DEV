# Challenge 2 — CLS Under 0.1

> Estimated time: 60 minutes.
> Difficulty: Easy to moderate.
> Prerequisite: Lecture 3 read.

---

## The brief

Take a deliberately-shifty page — one that has every common CLS offender — and bring CLS **under 0.1** using only the HTML and CSS techniques from Lecture 3 §6.

The point is to feel which fixes contribute how much to the score. Some fixes are dramatic (sizing the hero image). Some are subtle (matching font metrics).

---

## Setup

Create `challenge-02/index.html` with the deliberately-shifty starter:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CLS challenge — the shifty page</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap">
  <style>
    :root { font-family: "Playfair Display", Georgia, serif; }
    body { max-width: 70ch; margin: 0 auto; padding: 1rem; line-height: 1.5; }
    .ad-slot { background: #eef; padding: 1rem; margin: 1rem 0; }
    img { max-width: 100%; }
    .banner {
      background: #fee;
      color: #900;
      padding: 0.75rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <h1>The Shifty Times</h1>
  </header>

  <main>
    <article>
      <h2>An exemplary news article</h2>

      <!-- LCP candidate: a hero image with no dimensions -->
      <img src="https://picsum.photos/1200/600?random=21" alt="Hero">

      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

      <!-- An ad slot that will be filled by JS after a delay -->
      <div class="ad-slot" id="ad-slot-1">Loading ad...</div>

      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

      <!-- An embedded image with no dimensions -->
      <img src="https://picsum.photos/800/400?random=22" alt="">

      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>

      <!-- A YouTube-like iframe with no aspect ratio -->
      <iframe id="video" src="about:blank"></iframe>

      <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </article>
  </main>

  <script>
    // Simulate three layout-shifting actions:
    // 1. An ad arrives and fills the ad-slot 1.5 s after load.
    setTimeout(() => {
      const slot = document.getElementById("ad-slot-1");
      slot.innerHTML = '<img src="https://picsum.photos/728/250?random=99" alt="">';
    }, 1500);

    // 2. A banner is injected at the top of the page 2 s after load.
    setTimeout(() => {
      const banner = document.createElement("div");
      banner.className = "banner";
      banner.textContent = "Cookies! We use them. Click somewhere to agree.";
      document.body.prepend(banner);
    }, 2000);

    // 3. The video iframe loads its src after 2.5 s.
    setTimeout(() => {
      const video = document.getElementById("video");
      video.src = "https://example.com/video";
      video.width = 560;
      video.height = 315;
    }, 2500);
  </script>
</body>
</html>
```

Serve locally (`npx http-server` from the folder). Open in Chrome.

---

## Step 0 — Baseline CLS

DevTools → Performance Insights → Throttle: Slow 4G + 4x CPU → Record → Reload → wait until the page is fully settled (after the 2.5 s video iframe injection) → Stop.

Open the **Layout shifts** insight. Record every individual shift:

| Shift | Score | Element |
|-------|------:|---------|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

Sum the scores. This is your baseline CLS. It should be well over 0.25.

---

## Step 1 — Size every image

Add `width` and `height` HTML attributes to every `<img>`. The dimensions are the **source** dimensions, not the displayed dimensions; the existing `max-width: 100%` keeps them responsive.

```html
<img src="https://picsum.photos/1200/600?random=21" alt="Hero" width="1200" height="600">
<img src="https://picsum.photos/800/400?random=22" alt="" width="800" height="400">
```

The CSS rule `img { max-width: 100%; height: auto; }` should be in place — without `height: auto`, the explicit `height="400"` would force the image to 400 pixels tall instead of scaling proportionally.

Re-record. Re-read the Layout shifts insight. Compare:

| Run | CLS | Shifts that remain |
|-----|----:|-------------------:|
| + image dimensions | | |

The image shifts should be gone. The ad, the banner, and the iframe still shift.

---

## Step 2 — Reserve space for the ad slot

The ad slot starts empty (`Loading ad...`) and fills with an image. The image has dimensions 728×250 (a standard ad size). Reserve the space:

```html
<div class="ad-slot" id="ad-slot-1" style="min-height: 250px; display: grid; place-items: center;">
  Loading ad...
</div>
```

Or, using CSS, set the slot's `aspect-ratio`:

```css
.ad-slot {
  aspect-ratio: 728 / 250;
  max-width: 728px;
  width: 100%;
}
```

Re-record. The ad shift should be gone.

---

## Step 3 — Reserve space for the video iframe

The iframe gets `width=560 height=315` set via JavaScript. Set them in the HTML attributes (or with `aspect-ratio` in CSS) so the space is reserved from first paint:

```html
<iframe id="video" src="about:blank" width="560" height="315" style="max-width: 100%; aspect-ratio: 16 / 9;"></iframe>
```

The `aspect-ratio: 16 / 9` keeps the iframe responsive. The `width`/`height` give a sizing hint to the browser before CSS loads.

Re-record. The iframe shift should be gone.

---

## Step 4 — Handle the banner

The injected banner shifts everything below it down. Two options:

**Option A** — reserve space at the top of the body:

```html
<body>
  <div id="banner-slot" style="min-height: 48px;"></div>
  <header>...</header>
</body>
```

And update the JS to fill the slot rather than `prepend` a new element:

```js
const slot = document.getElementById("banner-slot");
slot.innerHTML = '<div class="banner">Cookies! ...</div>';
```

**Option B** — render the banner at fixed positioning so it does not affect layout:

```css
.banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
```

This is the cookie-bar pattern. Combine with a body `padding-top` if you do not want the banner to overlay content.

Pick one. Re-record. The banner shift should be gone.

---

## Step 5 — Handle font swap

`Playfair Display` is loaded from Google Fonts with `display=swap`. When it arrives (typically 100–300 ms in), it replaces the fallback (`Georgia, serif`), and the line-height changes slightly. The font shift is usually small but visible in the Layout shifts insight.

Three options, in increasing aggressiveness:

**Option A** — `font-display: optional`. The browser uses the fallback for the first load entirely; the web font is applied on subsequent loads. No swap, no shift. Replace the Google Fonts URL:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=optional">
```

**Option B** — match the fallback metrics. Use a tool like <https://screenspan.net/fallback> to generate `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` for a Georgia → Playfair Display swap. The visual jump becomes imperceptible.

**Option C** — preload the font and self-host it. Move it earlier in the timeline so it arrives before first paint, eliminating the swap window. (See Lecture 3 §5.3.)

Pick one. Re-record. The font shift should be gone or negligible.

---

## Step 6 — Verify and report

Run Lighthouse on the page (Mobile, Performance only). CLS should be **0** or very close.

Record the final table:

| Step | CLS | What changed |
|------|----:|--------------|
| Baseline | | All four offenders shifting |
| + image dimensions | | Hero and inline image fixed |
| + ad slot reservation | | Ad fixed |
| + iframe sizing | | Video fixed |
| + banner handling | | Banner fixed |
| + font-display option | | Font swap fixed |

Write a one-paragraph reflection. The web.dev "Optimize CLS" article enumerates five common causes; your page had four of them. Which fix contributed the most to the CLS reduction? Were any of the fixes harder than expected?

---

## Done when

- [ ] CLS in the final Lighthouse run is **under 0.1**.
- [ ] The before/after table is filled in.
- [ ] The reflection paragraph is written.

---

## Common pitfalls

**1. `height` without `width` (or vice versa).** The implicit `aspect-ratio` only computes when both attributes are present. Half the pair does nothing.

**2. CSS `height: auto` overridden.** A common reset like `img { height: auto; }` is required so the explicit `height="600"` does not force a fixed pixel height. Without `height: auto`, your responsive image becomes a fixed-height image that overflows or distorts.

**3. The banner is "expected."** If the banner appears within 500 ms of a user input (a click), it does not count toward CLS. The shifts in this challenge happen on `setTimeout` with no user input; they all count.

**4. Performance Insights does not show CLS-after-input.** Layout shifts that happen 500 ms after any user input are excluded from CLS by the spec. If you are clicking around while recording, you may not see expected shifts. Reload without clicking, then stop recording.

---

## Stretch (optional)

- Use **`content-visibility: auto` + `contain-intrinsic-size`** on the article's lower sections. Measure whether CLS changes (it can subtly affect the shift score on long pages).
- Run the challenge with the **`web-vitals` CLS attribution** logged. The `largestShiftTarget` field will name the element causing each shift. Compare with the DevTools Layout shifts insight.
- Apply the same fixes to **your Week 8 mini-project** if its CLS is non-zero. The same techniques transfer.

---

## Reference

- web.dev — Optimize CLS: <https://web.dev/articles/optimize-cls>
- web.dev — Anatomy of a layout shift: <https://web.dev/articles/cls>
- MDN — `aspect-ratio`: <https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio>
- web.dev — `font-display`: <https://web.dev/articles/font-display>
- web.dev — Fallback font metrics: <https://web.dev/articles/css-size-adjust>
