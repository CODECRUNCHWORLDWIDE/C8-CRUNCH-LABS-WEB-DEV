# C8 · Crunch Labs — Web Dev · Brand Guide

> **Voice:** crafted, opinionated, platform-first. The browser as a place to make beautiful, accessible things — not as a target for the latest JS framework's marketing.
> **Feel:** typography-first, page-centered, motion used sparingly.

Extends the family brand. C8-specific overrides only.

---

## Identity

- **Full name:** Crunch Labs — Web Dev
- **Program code:** C8
- **Full title in copy:** *C8 · Crunch Labs — Web Dev*
- **Tagline (short):** The browser, taught properly.
- **Tagline (long):** A free, open-source twelve-week frontend track — semantic HTML through accessible animated production-grade web apps, with the build tools that earn their keep and none that don't.
- **Canonical URL:** `codecrunchglobal.vercel.app/course-c8-webdev`
- **License:** GPL-3.0

---

## Where C8 diverges from the family palette

C8 leans into editorial. Inherits Ink/Parchment/Gold with one supplementary accent — the **Page Sky** of a perfect-day browser default link:

| Role | Name | Hex | Use |
|------|------|-----|-----|
| Accent | Page Sky | `#0EA5E9` | Active links, the C8 mark, "live preview" indicators |
| Accent deep | Page Sky deep | `#0369A1` | Hover states |
| Accent soft | Page Sky soft | `#BAE6FD` | Subtle backgrounds for "selected" state in component demos |

```css
:root {
  --page-sky:       #0EA5E9;
  --page-sky-deep:  #0369A1;
  --page-sky-soft:  #BAE6FD;
}
```

> **Why "Page Sky" specifically:** the default link blue browsers used for 20 years was about `#0000EE`. We pull a slightly warmer modernization of that color. The choice signals "we respect the platform's defaults" — exactly the message C8 should send.

### Typography

EB Garamond display, Lora body — *but* with one additional acceptance: **`system-ui` is allowed for UI chrome** when the example specifically teaches platform-native feel. Mono for code remains JetBrains Mono.

---

## Recurring page elements

### The "browser frame" component

When showing rendered HTML / CSS examples, wrap them in a stylized browser frame:

```
┌──────────────────────────────────────────────────┐
│ ●●●    https://example.test/                     │
├──────────────────────────────────────────────────┤
│                                                  │
│   <h1>The rendered content goes here</h1>        │
│                                                  │
└──────────────────────────────────────────────────┘
```

Rules:

- Frame border 1 px `--rule`.
- URL bar uses JetBrains Mono.
- Body uses whatever the lesson's CSS declares.
- Don't fake real domains — always `.test`, `.example`, or `localhost`.

### The "before / after" diff

Many CSS lessons benefit from a side-by-side "ugly default" vs "polished result." Render both inside browser frames; label clearly.

---

## Voice rules

- **Cite the spec.** "Per HTML Living Standard, the `<button>` element..." Beats "according to MDN," beats "some article said."
- **Browser-name names features, not vendor names.** "Container queries" not "Chrome 105's container queries."
- **Accessibility as feature, not afterthought.** Every component lesson has an accessibility check. Always. Not at the end.
- **Avoid "modern" as an adjective.** Everything we teach is current; saying "modern" reads as defensive.
- **No anti-React or anti-Tailwind takes.** They're tools. Pick them when they earn their keep; skip them otherwise. C8 teaches the platform; the platform comes first.
- **Motion is rationed.** Animation is a feature, not a default. Every motion lesson references `prefers-reduced-motion`.

---

## Course page conventions

The course page for C8 uses the **light parchment hero** with a stylized browser frame as the centerpiece — a working live demo of one course module embedded inline. Hover states use Page Sky. The 12-week ladder is rendered as a "page outline" — H1, H2, H3 hierarchy mirroring how the curriculum builds.

---

*GPL-3.0. Fork freely.*
