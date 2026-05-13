# Lecture 2 — Custom Properties, Color, Typography

> **Outcome:** You can build a token-driven theme using CSS custom properties, mix colors predictably with `color-mix()`, pick between `hsl()` and `oklch()` based on what you are trying to do, write fluid typography with `clamp()`, use a system font stack on purpose, and ship a dark mode that does not double your stylesheet.

Lecture 1 ended with the cascade and the box model — the rules of the road. This lecture is the actual driving. We will look at five capabilities the platform now ships that, taken together, replace most of what people used to reach for Sass or a UI framework for: custom properties, `color-mix()`, perceptually-uniform color spaces, `clamp()`-based typography, and `prefers-color-scheme`. Together, in a few hundred lines of hand-written CSS, you can produce a site that holds up next to anything that ships from a framework.

## 1. Custom properties — and why they are not Sass variables

A **custom property** in CSS looks like any other property except the name begins with two dashes:

```css
:root {
  --ink: #1a1a1a;
  --parchment: #faf7f0;
  --page-sky: #0ea5e9;
  --rule: #d4cfc0;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;

  --type-base: 1rem;
  --type-lede: 1.125rem;
  --type-h1: clamp(2rem, 1.4rem + 3vw, 3.5rem);
  --type-h2: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
}
```

You read them back with `var()`:

```css
body {
  background: var(--parchment);
  color: var(--ink);
}

.byline {
  color: var(--ink);
  font-size: var(--type-base);
  margin-bottom: var(--space-4);
}

a {
  color: var(--page-sky);
}
```

That much looks like Sass variables. The difference begins with two facts you have to internalize.

### Custom properties live in the cascade

A Sass variable is resolved at compile time. By the time the CSS reaches the browser, every `$primary` has been replaced with a literal value. The browser never sees the variable.

A CSS custom property is resolved at *render* time, **inside the cascade**. The browser computes a value for `--page-sky` on every element, the same way it computes a value for `color`. Custom properties inherit (by default). Custom properties can be overridden by more-specific selectors. Custom properties can change at runtime — via JavaScript, via a media query, via a `:hover` rule — and every `var()` that depends on them updates immediately.

That last point is the unlock. Consider:

```css
:root {
  --bg: var(--parchment);
  --fg: var(--ink);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: var(--ink);
    --fg: var(--parchment);
  }
}

body {
  background: var(--bg);
  color: var(--fg);
}
```

The dark-mode block re-assigns two custom properties at `:root`. Every selector downstream that used `var(--bg)` and `var(--fg)` — there could be a hundred of them — flips automatically. You did not duplicate a single rule. You did not write a second stylesheet. You changed two values at the root, and the cascade did the work.

A Sass variable could not do this. A Sass `$bg` is gone by the time the browser sees the CSS. Custom properties are the *only* way to express "this value should change based on a media query, and everything that uses it should follow." That is why they are not Sass variables — they are a runtime mechanism, not a compile-time convenience.

### Custom properties have fallbacks

`var()` takes a second argument: the fallback if the property is not defined.

```css
.btn {
  background: var(--page-sky, #0ea5e9);
  color: var(--parchment, white);
}
```

Useful in two cases: when you are publishing a component that may be embedded in pages where your design tokens are not loaded, and when you are gradually migrating an old stylesheet — the fallback lets the styles work before the tokens land.

### Where to declare your tokens

The convention: declare your global tokens on `:root`. This is the same as `<html>` (a pseudo-class with specificity `(0,0,1,0)`, slightly higher than the type selector `html` to make overrides slightly easier). Custom properties inherit, so any value set on `:root` is available everywhere by default.

A component can declare its *own* tokens scoped to its selector:

```css
.alert {
  --alert-bg: color-mix(in oklch, var(--page-sky) 10%, var(--parchment));
  --alert-fg: var(--page-sky-deep);

  background: var(--alert-bg);
  color: var(--alert-fg);
  padding: var(--space-3);
  border-radius: 0.25rem;
}
```

Now `.alert` has its own little namespace. Nothing outside the alert can read `--alert-bg`. This pattern scales remarkably well — you end up with a small global token set plus per-component token sets.

---

## 2. Color, the platform way: `color-mix()`, `hsl()`, `oklch()`

For twenty years, CSS gave you three color syntaxes: named colors (`crimson`), hex (`#0ea5e9`), and `rgb()`. They all work. None of them lets you say what you actually want, which is usually some variation of *the same color, slightly lighter* or *a tint of the brand color over the page background*. So designers shipped Sass `mix()` functions and Photoshop swatches. The browser now ships both natively.

### `color-mix()` — the function that replaces a swatch palette

`color-mix()` interpolates between two colors in a chosen color space. The syntax:

```css
color-mix(in <color-space>, <color> <percentage>, <color> <percentage>)
```

In practice:

```css
:root {
  --page-sky:       #0ea5e9;
  --page-sky-deep:  #0369a1;
  --page-sky-soft:  #bae6fd;
}

a {
  color: var(--page-sky);
}

a:hover {
  /* Darken by mixing 30% black in OKLCH for a perceptually-flat result. */
  color: color-mix(in oklch, var(--page-sky), black 30%);
}

.note {
  /* A 10% tint of brand on parchment — for a subtle highlight strip. */
  background: color-mix(in oklch, var(--page-sky) 10%, var(--parchment));
}
```

You no longer need three pre-mixed shades of brand. You declare the brand color once and derive hover, active, soft-tint, and disabled at the point of use.

Two notes on color space:

- **`in srgb`** matches what Sass and Photoshop have done for decades. Easy to reason about; perceptually inconsistent — a 50% mix can look closer to one input than the other.
- **`in oklch`** mixes in a perceptually uniform space. A 50% mix actually *looks* halfway. Use this by default; the result is almost always what you wanted.

### `hsl()` and `oklch()` — picking colors with words

`hsl()` says **hue, saturation, lightness**. Lightness 0% is black, 100% is white, 50% is "full saturation."

```css
:root {
  --brand-h: 199;          /* hue: a sky-blue */
  --brand-s: 89%;          /* saturation: vivid */
  --brand:   hsl(var(--brand-h) var(--brand-s) 49%);
  --brand-light: hsl(var(--brand-h) var(--brand-s) 75%);
  --brand-dark:  hsl(var(--brand-h) var(--brand-s) 32%);
}
```

The win over hex: a small lightness change is one number, not three. The loss: HSL's "lightness" is not perceptually uniform — `hsl(60 100% 50%)` (yellow) looks much brighter than `hsl(240 100% 50%)` (blue), even though both claim 50% lightness.

`oklch()` says **lightness, chroma, hue**, in a space designed to match human vision. Same lightness number; same perceived lightness, regardless of hue.

```css
:root {
  --brand: oklch(0.7 0.15 230);          /* L=0.7, C=0.15, H=230 (sky blue) */
  --brand-light: oklch(0.85 0.12 230);   /* lighter, same chroma & hue */
  --brand-dark:  oklch(0.5 0.18 230);    /* darker, more chroma */
}
```

A practical rule: **use `oklch()` when you want predictable lightness across a palette** (your three brand shades, your seven neutral grays, your full chart-color set). Use `hsl()` when you are writing a one-off color and want named human intuition.

Hex stays useful for "this exact color the brand guide gave me." All three notations interoperate inside `color-mix()`.

### What about contrast?

Color you ship has to pass **WCAG 2.2 AA — 4.5:1 for body text, 3:1 for large text and UI components**. Browsers help: open the color picker on any element in DevTools, and the picker shows the live contrast ratio against the background, with a pass/fail badge.

A small habit worth keeping: every time you pick a color this week, also pick the surface it sits on, paste them into <https://webaim.org/resources/contrastchecker/>, and check the ratio. You will internalize which lightness pairs work and which do not after a dozen rounds.

The default C8 palette — Ink `#1a1a1a` on Parchment `#faf7f0` — passes at **15.4:1**, well over AAA. The accent — Page Sky `#0ea5e9` on Parchment — only passes at 2.7:1, which means it is *not* contrast-safe for body text. Use it for links (where underline + color carries) and for non-text UI (where 3:1 is enough). For body text on a tinted background, you need the deep shade — `#0369a1` on Parchment passes at 6.4:1.

---

## 3. Typography that does not fight the system

A site has, at most, three real typographic decisions: **a typeface for display headings, a typeface for body text, and a scale that maps element to size**. C8 uses **EB Garamond for display, Lora for body, and a fluid scale built on `clamp()`**. Your Week 1 site can use exactly that, or you can pick alternates — Playfair, Crimson, Source Serif Pro for display; Inter, Source Sans, IBM Plex Sans for body — without changing any of the structure that follows.

### The system font stack — when you want the platform's voice

For UI chrome — buttons, form inputs, navigation — there is a case for **not** loading a webfont at all. The system font stack picks whichever font the user's OS uses for its native interface: San Francisco on macOS / iOS, Segoe UI on Windows, Roboto on Android, the user-configured default on Linux.

```css
:root {
  --font-system: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                 "Helvetica Neue", Arial, sans-serif;
}

button,
input,
select,
textarea {
  font-family: var(--font-system);
}
```

You can also use the keyword `system-ui` in modern browsers, which resolves to the same thing more concisely:

```css
button { font-family: system-ui, sans-serif; }
```

The win: zero network requests, zero layout shift from font swap, and form controls that look at home on every platform. The C8 brand explicitly permits `system-ui` for UI chrome on these grounds.

For long-form prose, a chosen webfont still earns its keep — Garamond and Lora make essays read differently than Arial does. The compromise we will use this week: webfont for body and headings; system font for forms, buttons, and the URL bar of our browser-frame component.

### Fluid typography with `clamp()`

Until recently, "responsive typography" meant a media query for every breakpoint:

```css
h1 { font-size: 2rem; }

@media (min-width: 600px) {
  h1 { font-size: 2.5rem; }
}

@media (min-width: 1024px) {
  h1 { font-size: 3.5rem; }
}
```

That works. It also produces three discrete sizes with awkward jumps at the breakpoints. Today, you use **`clamp(min, preferred, max)`** instead:

```css
h1 {
  font-size: clamp(2rem, 1.4rem + 3vw, 3.5rem);
}
```

The function returns the preferred value (`1.4rem + 3vw`) clamped between the min (`2rem`) and the max (`3.5rem`). The preferred value uses **viewport units** (`vw` = 1% of viewport width) so the size scales continuously with the window. The min and max bracket the scaling so the heading never collapses to unreadable or balloons to a billboard.

How to pick the numbers: at 320 px wide (a small phone), `1.4rem + 3vw` resolves to `1.4 + 3·(320/100·1/16)` rem = roughly 2 rem (clamped at the min). At 1440 px (a laptop), it resolves to `1.4 + 3·9` rem = 3.1 rem (under the max). The transition is smooth, with no breakpoint snap.

You only need a small number of these per project. The C8 default scale:

```css
:root {
  --type-base: 1rem;                                /* body */
  --type-small: clamp(0.875rem, 0.85rem + 0.1vw, 0.95rem);  /* meta, captions */
  --type-lede:  clamp(1.05rem, 1rem + 0.25vw, 1.2rem);      /* first paragraph */
  --type-h3:    clamp(1.15rem, 1.05rem + 0.4vw, 1.4rem);
  --type-h2:    clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  --type-h1:    clamp(2rem, 1.4rem + 3vw, 3.5rem);
}
```

Pair it with a generous, inherited line-height for reading:

```css
body {
  font-size: var(--type-base);
  line-height: 1.6;
}

h1, h2, h3 {
  line-height: 1.2;            /* tighter for display */
  text-wrap: balance;          /* prevent orphan words */
}

p {
  max-width: 65ch;             /* readable line length */
}
```

`text-wrap: balance` is a one-line investment that pays off on every heading on every site you ever ship. `max-width: 65ch` keeps lines of text inside the 45–75 character range that reading-comprehension research says is comfortable.

---

## 4. Dark mode — one media query, two redeclarations

Almost every operating system in 2026 ships a light/dark toggle. The browser exposes the user's choice via the `prefers-color-scheme` media feature. Your stylesheet should honor it.

The pattern:

```css
:root {
  --bg: #faf7f0;     /* parchment */
  --fg: #1a1a1a;     /* ink */
  --rule: #d4cfc0;
  --accent: #0ea5e9; /* page sky */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a1a;
    --fg: #e8e4d8;
    --rule: #3a3833;
    --accent: #38bdf8;  /* slightly lighter for dark backgrounds */
  }
}

body {
  background: var(--bg);
  color: var(--fg);
}

hr {
  border-top: 1px solid var(--rule);
}

a {
  color: var(--accent);
}
```

Everything depends on the four tokens. The body's `background` and `color` are not hard-coded to a hex — they read from the tokens, which the cascade resolves based on the user's preference. The result, in one media query and a handful of overrides:

- A light theme that uses parchment, ink, and Page Sky.
- A dark theme that swaps to dark background, light foreground, and a brightened accent.

A small note on the accent: pure `#0ea5e9` on a dark background still passes WCAG AA for non-text UI (it is a 3.7:1 ratio against `#1a1a1a`), but it can feel harsh. The lighter Sky `#38bdf8` reads more comfortably for the same role. This is the kind of judgment call you make once per site and then commit to.

### Letting the user override

A small refinement many sites ship: a toggle in the UI that overrides `prefers-color-scheme`. The pattern is to set a `data-theme` attribute on `<html>` from a tiny script and respect it ahead of the media query:

```css
:root { --bg: ...; --fg: ...; }

@media (prefers-color-scheme: dark) {
  :root { --bg: ...; --fg: ...; }
}

:root[data-theme="light"] { --bg: ...; --fg: ...; }
:root[data-theme="dark"]  { --bg: ...; --fg: ...; }
```

We will not ship that toggle this week (it needs JavaScript, which is Week 4). For Week 2, we honor the OS preference and stop there.

---

## 5. A small worked stylesheet

Putting it all together — here is the start of a Week-2 stylesheet that could honestly style your Week-1 personal site, in about 80 lines:

```css
/* === reset === */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

img {
  max-width: 100%;
  display: block;
}

/* === tokens === */
:root {
  --ink:       #1a1a1a;
  --parchment: #faf7f0;
  --rule:      #d4cfc0;
  --page-sky:       #0ea5e9;
  --page-sky-deep:  #0369a1;

  --bg: var(--parchment);
  --fg: var(--ink);
  --accent: var(--page-sky-deep);

  --font-display: "EB Garamond", Georgia, serif;
  --font-body:    "Lora", Georgia, serif;
  --font-system:  system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  --type-base:  1rem;
  --type-small: clamp(0.875rem, 0.85rem + 0.1vw, 0.95rem);
  --type-lede:  clamp(1.05rem, 1rem + 0.25vw, 1.2rem);
  --type-h3:    clamp(1.15rem, 1.05rem + 0.4vw, 1.4rem);
  --type-h2:    clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  --type-h1:    clamp(2rem, 1.4rem + 3vw, 3.5rem);

  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: var(--ink);
    --fg: #e8e4d8;
    --rule: #3a3833;
    --accent: #38bdf8;
  }
}

/* === typography === */
body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-body);
  font-size: var(--type-base);
  line-height: 1.6;
}

h1, h2, h3 {
  font-family: var(--font-display);
  line-height: 1.2;
  text-wrap: balance;
  margin-block: var(--space-5) var(--space-3);
}

h1 { font-size: var(--type-h1); }
h2 { font-size: var(--type-h2); }
h3 { font-size: var(--type-h3); }

p { max-width: 65ch; }

p.lede { font-size: var(--type-lede); }

a {
  color: var(--accent);
}

a:hover {
  color: color-mix(in oklch, var(--accent), black 25%);
}

button,
input,
select,
textarea {
  font-family: var(--font-system);
  font-size: var(--type-base);
}
```

Eighty lines. No framework. Three tokens (`--bg`, `--fg`, `--accent`) carry the entire color scheme. The dark-mode override swaps four values. Every heading uses fluid type and balances its wrap. Every paragraph caps at 65ch. Buttons use the system stack. Links derive their hover state from `color-mix()`.

That is the floor of a real design system. Week 3 adds layout. Week 9 adds motion. The tokens you declared today get reused every week from now on.

---

## 6. Self-check

Without re-reading:

1. Name two ways a CSS custom property differs from a Sass variable.
2. Give the `color-mix()` call that produces "Page Sky, but 25% darker."
3. Why does `oklch()` give more predictable lightness across hues than `hsl()`?
4. Write a `clamp()` value for an `h2` that should be at least 1.5 rem, scale with viewport width, and cap at 2.25 rem.
5. How does the four-token dark-mode pattern avoid duplicating the stylesheet?
6. What is the WCAG 2.2 AA contrast ratio for normal-size body text, and for large text or UI?

---

## Further reading

- **MDN — Using CSS custom properties**: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties>
- **MDN — `color-mix()`**: <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix>
- **MDN — `oklch()`**: <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch>
- **Smashing Magazine — Modern Fluid Typography Using CSS `clamp()`**: <https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/>
- **Evil Martians — OKLCH in CSS**: <https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl>
- **CSS Tricks — System font stack**: <https://css-tricks.com/snippets/css/system-font-stack/>

Next: the [exercises](../exercises/README.md). Type, don't paste.
