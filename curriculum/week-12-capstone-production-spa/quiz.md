# Week 12 — Final Exam (Track-Wide Review)

This is the **C8 final exam** — 25 questions covering every week of the track plus the production-deploy topics introduced in W12. Take it once, alone, with no tabs open, with no AI assistant, in a single sitting. Aim for 20 of 25 correct. The exam doubles as **interview prep**: every question maps to a question you may be asked in a junior or mid-level frontend interview.

Time budget: **45 minutes**. If you finish in 30, slow down and review your answers. If you exceed 60, stop, write your raw score, and review the answer key at the bottom.

---

## Week 1 — Semantic HTML

**Q1.** A page has the structure below. Identify the **two** accessibility problems an automated audit will flag.

```html
<body>
  <div class="header">
    <h1>My Site</h1>
    <h1>About</h1>
  </div>
  <div class="content">
    <p>Welcome.</p>
  </div>
  <div class="footer">
    <p>2026</p>
  </div>
</body>
```

A. Missing `<main>` landmark and two `<h1>` elements
B. Missing `aria-label` on the outer `<body>` and the heading order is reversed
C. `<p>` cannot contain text directly and `<div>` is deprecated
D. The `<h1>` should be inside a `<section>`, and `<body>` requires a `lang` attribute

---

**Q2.** Which of the following is the most semantically correct way to mark up a primary site navigation containing five links?

A. `<div role="navigation"><ul>...</ul></div>`
B. `<nav><ul><li><a>...</a></li></ul></nav>`
C. `<nav aria-label="Primary"><div><a>...</a></div></nav>`
D. `<header><a>...</a><a>...</a></header>`

---

## Week 2 — Modern CSS and Accessibility

**Q3.** The CSS rule `*:focus { outline: none; }` ships in a stylesheet. State the accessibility consequence in one sentence and propose the correct replacement.

(Free response — answer key below grades on whether you identified the keyboard-user impact and proposed a `:focus-visible` ruleset.)

---

**Q4.** A designer specifies the text color `#777` on a `#FFFFFF` background. Compute or look up the contrast ratio and state whether it passes WCAG 2.2 AA for body text (which requires 4.5:1).

A. 2.85:1 — fails
B. 4.48:1 — fails (marginally)
C. 4.51:1 — passes (marginally)
D. 7.2:1 — passes comfortably

---

## Week 3 — Layout and Responsiveness

**Q5.** A three-column card grid should reflow to two columns at tablet width and one column at phone width. Which CSS expression accomplishes this in modern CSS Grid with **no media queries**?

A. `grid-template-columns: 1fr 1fr 1fr;` plus separate media queries
B. `grid-template-columns: repeat(3, 1fr);` plus separate media queries
C. `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));`
D. `display: flex; flex-wrap: wrap;` and fixed widths on cards

---

**Q6.** The `<meta name="viewport">` tag has been omitted from a mobile page. Describe the symptom a user will see on an iPhone.

(Free response — the answer key checks for: page renders at desktop width and is zoomed out to fit, text is unreadable without manual zoom.)

---

## Week 4 — Modern JavaScript

**Q7.** Given the code below, what is logged?

```js
const arr = [1, 2, 3];
const result = arr.map(n => n * 2).filter(n => n > 2);
console.log(result);
```

A. `[2, 4, 6]`
B. `[4, 6]`
C. `[2, 4]`
D. `[6]`

---

**Q8.** What is the difference between `==` and `===` in JavaScript, in one sentence?

(Free response — the answer key checks for: `===` checks type and value, `==` performs type coercion before comparison, and the project convention is `===` always.)

---

## Week 5 — DOM, Events, Accessibility

**Q9.** A `<div onClick={handleClick}>Submit</div>` is in the JSX of a React component. Identify the **three** accessibility problems and write the corrected JSX.

(Free response — answer key checks for: not keyboard reachable, no `role`, no `tabindex`, screen reader does not announce as actionable. Correct fix: use `<button type="button" onClick={handleClick}>`.)

---

**Q10.** What is event delegation, and why is attaching a single click listener to a `<ul>` better than attaching one to each `<li>` for a long list?

(Free response — answer key checks for: one listener instead of N, works for dynamically added items, memory and setup-cost wins.)

---

## Week 6 — Forms and Validation

**Q11.** Which HTML attribute on an `<input>` is the single most-effective accessibility win for error messages on form submission?

A. `aria-invalid="true"` set when the field has an error
B. `aria-describedby` pointing at the error `<span>`'s id
C. `required`
D. `pattern` with a regex

---

**Q12.** The form below submits successfully even when `email` is empty. Identify the bug.

```html
<form onsubmit="return submit()">
  <input type="email" name="email">
  <button>Send</button>
</form>
```

A. The `<input>` is missing `required`
B. The `<button>` is missing `type="submit"`
C. The `<form>` is missing `method`
D. The handler returns `undefined`, which is truthy

---

## Week 7 — Build Tools and Components

**Q13.** Which Vite config option produces a production build with source maps enabled?

A. `build: { sourcemap: true }`
B. `build: { sourceMaps: 'inline' }`
C. `optimizeDeps: { sourcemap: true }`
D. `define: { __SOURCEMAP__: true }`

---

**Q14.** Why does Vite use **native ES modules** in dev mode and a **rolled-up bundle** in production? Answer in two sentences.

(Free response — answer key checks for: ESM in dev is faster because there's no bundle step; production bundles for fewer requests and better caching.)

---

## Week 8 — State and Routing

**Q15.** A React Router app deployed to Vercel works perfectly on `/`, but refreshing on `/profile` returns a 404. Identify the cause and the fix.

A. The router is misconfigured; switch to `HashRouter`
B. The hosting layer does not have an SPA-fallback rewrite; add one to `vercel.json`
C. The route is misnamed; `/profile` should be `/Profile`
D. The Auth0 callback is wrong; reconfigure the redirect URI

---

**Q16.** Identify one valid reason to choose a Zustand store over React Context for shared state.

A. Zustand is faster on every read/write
B. Context cannot hold objects
C. Zustand avoids re-rendering every consumer when any slice changes
D. Context is being deprecated in React 19

---

## Week 9 — Performance and Core Web Vitals

**Q17.** Which Core Web Vital replaced FID in March 2024?

A. LCP (Largest Contentful Paint)
B. INP (Interaction to Next Paint)
C. TTI (Time to Interactive)
D. TBT (Total Blocking Time)

---

**Q18.** The deployed SPA has an LCP of 4.2 s. Name the **three** highest-leverage techniques to bring it under 2.5 s, in priority order.

(Free response — answer key checks for: identify the LCP element (usually the hero image or a heading); preload it or self-host the font; eliminate render-blocking JS or split the bundle; serve the image at the right size with `srcset`.)

---

## Week 10 — Authentication and Identity

**Q19.** Why does an SPA use OAuth 2.1 with **PKCE** instead of the implicit flow?

A. Implicit flow does not exist in the spec
B. PKCE prevents authorization-code interception attacks, especially on mobile
C. PKCE is faster
D. Implicit flow requires a backend server, PKCE does not

---

**Q20.** Where should the access token and the refresh token live in an SPA — and where must they **never** live?

A. Both in `localStorage`; never in cookies
B. Both in memory; access tokens may go in `sessionStorage`; never in `localStorage`
C. Both in `localStorage`; the refresh token may go in a cookie
D. The access token in `localStorage`, the refresh token in a Secure HttpOnly cookie managed by a backend

---

## Week 11 — Testing

**Q21.** Order the Testing Library query priority list from most-preferred to least-preferred (pick the correct order).

A. `getByTestId` > `getByText` > `getByRole`
B. `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
C. `getByText` > `getByRole` > `getByLabelText` > `getByTestId`
D. `getByRole` > `getByTestId` > `getByText` > `getByLabelText`

---

**Q22.** What does Playwright's `trace: 'on-first-retry'` config do, and why is it the canonical CI choice?

(Free response — answer key checks for: captures a full step-by-step replay on the first retry, used to debug flakes without re-running locally, traded off for run time.)

---

## Week 12 — Production deploy, the new material

**Q23.** A `vercel.json` ships the rewrite below. State, in one sentence, what it does, and identify one site behavior it enables.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

(Free response — answer key checks for: every request URL serves `index.html`, so the client-side router can handle refresh-on-deep-link without a 404.)

---

**Q24.** Which security header forces the browser to upgrade `http://` to `https://` for the next two years, and what is the minimum-recommended value of its `max-age` directive?

A. `X-Frame-Options: DENY`, no `max-age`
B. `Strict-Transport-Security: max-age=31536000; includeSubDomains` (one year)
C. `Content-Security-Policy: upgrade-insecure-requests`, no `max-age`
D. `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (two years)

---

**Q25.** Your deployed capstone scores 88 on Lighthouse Performance and 92 on Accessibility. To pass the rubric's 90+ Performance requirement, name the **one** technique most likely to gain the two points cheapest.

A. Convert all images to AVIF
B. Self-host the web font and add `<link rel="preload">` for it
C. Move all `<script>` tags to the `<head>` without `defer`
D. Enable HTTP/3 on Vercel (already enabled by default)

---

## Answer key (read after self-grading)

**Q1.** A. Two `<h1>` and missing `<main>` are the two structural problems. WCAG and the HTML5 outline algorithm both call this out.

**Q2.** B. `<nav>` is the right landmark; the inner `<ul>`/`<li>` is the canonical list pattern for a set of links.

**Q3.** Consequence: keyboard users cannot see which element has focus, which fails WCAG 2.2 SC 2.4.7. Fix: replace with `:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }` so mouse focus stays clean but keyboard focus is visible.

**Q4.** B. The ratio is approximately 4.48:1 and fails AA (4.5:1) by a hair. The standard fix is to deepen to `#767676` (4.5:1 exactly) or `#717171`.

**Q5.** C. `repeat(auto-fit, minmax(280px, 1fr))` is the canonical responsive-grid trick from W3 — no media queries needed.

**Q6.** Without the viewport meta tag, mobile Safari renders the page at the device's nominal desktop width (typically 980 px) and scales it down to fit the screen, producing tiny, unreadable text and a horizontal-scroll-required layout.

**Q7.** B. `.map(n => n * 2)` produces `[2, 4, 6]`, then `.filter(n => n > 2)` keeps `[4, 6]`.

**Q8.** `===` checks both type and value with no coercion; `==` coerces operands to a common type before comparing (so `'1' == 1` is true). The project convention — enforced by `eqeqeq` in ESLint — is always `===`.

**Q9.** Three problems: (1) not in the tab order (no `tabindex`); (2) screen readers do not announce it as actionable (no `role="button"`); (3) the Enter and Space keys do not activate it (no `onKeyDown`). The correct fix is to replace the `<div>` with a `<button type="button">`, which provides all three for free.

**Q10.** Event delegation attaches one listener to a parent element and uses `event.target` to react to events that bubble up from descendants. For a long list, the win is constant-time setup, automatic coverage of newly-added items, and lower memory footprint.

**Q11.** B. `aria-describedby` is the strongest single win because it ties the input to its error message in the accessibility tree. `aria-invalid` is the companion attribute and a close second.

**Q12.** D. The handler is `return submit()` but `submit` is the form's own `HTMLFormElement.submit()` method (not a custom function), which submits without validation. The fix is to rename the handler and prevent default on validation failure.

**Q13.** A. `build: { sourcemap: true }` in `vite.config.ts`.

**Q14.** In dev mode, Vite serves source files as native ES modules over HTTP, so the browser fetches only what's imported and changes hot-reload in milliseconds without a full rebuild. In production, Rollup bundles for fewer HTTP requests, better minification, and better long-term caching of unchanged chunks.

**Q15.** B. The hosting layer (Vercel here, Netlify equivalently) must rewrite all paths to `/index.html` so the client-side router can pick them up; otherwise the file system tries to serve `/profile` and 404s.

**Q16.** C. Context causes every consumer of the context value to re-render when any field changes; Zustand (or Redux Toolkit, or Jotai) supports selector-based subscriptions, so only the components that read the changed slice re-render.

**Q17.** B. INP — Interaction to Next Paint. It became a stable Core Web Vital in March 2024, replacing FID, which only measured the first input.

**Q18.** Priority order: (1) identify the LCP element with PageSpeed Insights; (2) preload the LCP image with `<link rel="preload" as="image">`, or inline-load the LCP font; (3) eliminate render-blocking scripts in the head (move to `defer` or to the bottom of the body); (4) serve the image at the right size with `srcset` and a modern format (AVIF or WebP).

**Q19.** B. PKCE (Proof Key for Code Exchange) prevents an attacker from exchanging a stolen authorization code for tokens, which was the vulnerability that killed the implicit flow.

**Q20.** B. Tokens belong in memory (a JS variable inside a closure or a state manager); sessionStorage is acceptable for the access token if you accept the XSS risk; `localStorage` is the wrong answer in 2026 for either token. Option D is the OAuth-with-a-backend pattern, which is even more secure but requires a backend the C8 capstone does not assume.

**Q21.** B. Role > LabelText > PlaceholderText > Text > DisplayValue > AltText > Title > TestId.

**Q22.** Playwright captures a full step-by-step trace (DOM, network, console, screenshots) for any test that fails on its first run and triggers a retry. The trade-off is roughly a 2x slowdown on flaky runs; the win is that you can open `trace.zip` from CI artifacts and debug without re-running locally. It is the recommended default for CI.

**Q23.** Every request URL is rewritten to serve `index.html` instead of looking for a matching file. This enables the client-side router to handle deep-link refreshes (`/profile`, `/settings/account`) without the hosting layer returning a 404.

**Q24.** D. Two years (`max-age=63072000`) plus `includeSubDomains; preload` is the OWASP-recommended value. One year is the spec minimum to be eligible for the preload list.

**Q25.** B. Font-related fixes are the cheapest 2-point performance win on a typical Vite + React SPA — self-hosting the font (no DNS lookup to fonts.googleapis.com) plus preloading it commonly moves Performance by 3 to 8 points. AVIF conversion is a real win on image-heavy sites but is more work for a typical SPA.

---

## Scoring guide

- **23-25 correct** — track passed with distinction. You can defend any week's concepts in an interview.
- **20-22 correct** — track passed. Re-read the week of any miss and re-take the quiz Tuesday for review.
- **15-19 correct** — track conditionally passed. Revisit the lecture notes for the missed weeks before recording the walkthrough.
- **Under 15** — pause and review. The rubric will catch the same gaps when graded against the deployed URL.

The exam is for your own diagnostic use. The official grade is the rubric in `mini-project/starter/rubric.md`, scored against the deployed URL.
