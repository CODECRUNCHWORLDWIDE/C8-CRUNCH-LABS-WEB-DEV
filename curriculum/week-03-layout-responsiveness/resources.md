# Week 3 — Resources

Every resource here is **free** and **publicly accessible**.

## The two essential guides

The CSS-Tricks "complete guide" pair is the canonical reference for Flexbox and Grid. Read both end-to-end this week. They are free, illustrated, and updated for the current spec.

- **A Complete Guide to Flexbox** — every property, every value, every diagram. Bookmark it; you will return to it for years.
  <https://css-tricks.com/snippets/css/a-guide-to-flexbox/>
- **A Complete Guide to CSS Grid** — the same treatment for Grid. The "named areas" section alone is worth the read.
  <https://css-tricks.com/snippets/css/complete-guide-grid/>

## Primary sources

- **CSS Flexible Box Layout Module Level 1** — the normative spec for `display: flex`. Drier than the CSS-Tricks guide; canonical when the guides disagree with the browsers.
  <https://www.w3.org/TR/css-flexbox-1/>
- **CSS Grid Layout Module Level 2** — the spec for `display: grid`, with subgrid in Level 2.
  <https://www.w3.org/TR/css-grid-2/>
- **CSS Containment Module Level 3 — Container Queries** — the spec for `@container` and the container types.
  <https://www.w3.org/TR/css-contain-3/>
- **MDN — CSS layout** — the landing page; a good place to recall which guide covers what.
  <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout>

## Flexbox

- **MDN — Basic concepts of flexbox** — the canonical tutorial.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox>
- **Flexbox Froggy** — a free browser game; finish all 24 levels in under an hour.
  <https://flexboxfroggy.com/>
- **Flexbox Defense** — same idea, tower-defense style.
  <http://www.flexboxdefense.com/>
- **Flexbox Patterns** — twelve real-world patterns, each with the CSS to build them.
  <https://www.flexboxpatterns.com/>

## Grid

- **MDN — Basic concepts of grid layout** — start here.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout>
- **Grid Garden** — the Froggy of Grid; 28 levels.
  <https://cssgridgarden.com/>
- **Grid by Example by Rachel Andrew** — Rachel led much of the Grid spec work. Her examples are the canonical demonstrations.
  <https://gridbyexample.com/>
- **Learn CSS Grid by Jen Simmons** — short videos from a member of the Web Platform team at Apple.
  <https://www.youtube.com/playlist?list=PLbSquHt1VCf1kpv9WRGMCA9_Nn4vCLZ9Y>

## Responsive design

- **MDN — Responsive design** — the tutorial; includes `srcset` and `<picture>`.
  <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design>
- **Ethan Marcotte — "Responsive Web Design"** — the 2010 A List Apart article that named the practice. Still worth a read.
  <https://alistapart.com/article/responsive-web-design/>
- **web.dev — Responsive design patterns** — short, current, with code samples.
  <https://web.dev/learn/design>
- **MDN — Using media queries** — the syntax reference for `@media`.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries>

## Container queries

- **MDN — CSS container queries** — start here; container queries shipped in every browser in 2023.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries>
- **Ahmad Shadeed — Container Queries — A Quick Start** — the friendliest explainer.
  <https://ishadeed.com/article/container-queries/>
- **web.dev — Container queries land in stable** — what changed and when.
  <https://web.dev/blog/cq-stable>

## Responsive images

- **MDN — Responsive images** — `srcset`, `sizes`, `<picture>`, `loading`, and how the browser picks.
  <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_images>
- **Eric Portis — Srcset and sizes** — the article that finally made `srcset` click for an entire generation of developers.
  <https://ericportis.com/posts/2014/srcset-sizes/>
- **Squoosh** — Google's free in-browser image optimizer. No upload required; runs locally.
  <https://squoosh.app/>

## Layout accessibility

- **WCAG 2.2 Success Criterion 1.4.10 — Reflow** — content must reflow at 320 CSS px without horizontal scrolling.
  <https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>
- **WCAG 2.2 Success Criterion 1.4.4 — Resize text** — text must be resizable up to 200% without loss of content or function.
  <https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html>
- **WAI — Designing for Web Accessibility** — short, practical, includes layout considerations.
  <https://www.w3.org/WAI/tips/designing/>
- **Adrian Roselli — Keyboard-only scrolling areas** — the gotcha where a scrollable region is not keyboard-reachable.
  <https://adrianroselli.com/2022/06/keyboard-only-scrolling-areas.html>

## Free books and longer reads

- **"Every Layout" by Heydon Pickering & Andy Bell** — the first three chapters are free and teach the layout-primitives mindset (the Stack, the Cluster, the Switcher).
  <https://every-layout.dev/>
- **"Resilient Web Design" by Jeremy Keith** — Chapter 4 (Layouts) covers the philosophy; Chapter 5 (Layouts) the practice. Free online.
  <https://resilientwebdesign.com/chapter4/>
- **Rachel Andrew's blog** — the Grid spec editor; her archives are essentially free office hours.
  <https://rachelandrew.co.uk/archives/>

## Videos (free)

- **"Learn CSS" — web.dev (Google Chrome team)** — the Flexbox and Grid modules pair with this week.
  <https://web.dev/learn/css/flexbox/>
- **"Flexbox Crash Course" by Wes Bos** — 20-part free series, project-based.
  <https://flexbox.io/>
- **"CSS Grid Crash Course" by Wes Bos** — the Grid counterpart, equally free.
  <https://cssgrid.io/>

## Tools you will use this week

- **VS Code** — your editor. The **CSS Flexbox Cheatsheet** extension is useful but optional.
- **Chrome / Firefox DevTools — Device toolbar** (`Cmd+Shift+M` / `Ctrl+Shift+M`) — drag-to-resize, preset devices, network throttling.
- **DevTools — Layout panel** — overlay grid tracks and flex axes on a real page.
- **Polypane** *(free trial, then paid)* — a multi-viewport browser for designers. Optional; DevTools alone is enough.
- **Responsively App** *(free, open source)* — a free alternative to Polypane.
  <https://responsively.app/>

## Glossary

| Term | One-line definition |
|------|---------------------|
| **Flexbox** | A one-dimensional layout engine; arranges items along a main axis. |
| **Grid** | A two-dimensional layout engine; arranges items in rows and columns simultaneously. |
| **Main axis** | The axis along which flex items are laid out — horizontal by default. |
| **Cross axis** | The perpendicular axis; controls alignment of items across rows. |
| **`fr`** | A grid unit that consumes one fraction of available space. `1fr 2fr` splits 1:2. |
| **`minmax(a, b)`** | A grid value that means "at least `a`, at most `b`". |
| **`auto-fit`** | A `repeat()` mode that collapses empty tracks; pairs with `minmax()` for fluid grids. |
| **`auto-fill`** | A `repeat()` mode that keeps empty tracks; useful when you want the slot pattern visible. |
| **Breakpoint** | A viewport width at which a layout changes. Chosen by content, not by device. |
| **Mobile-first** | A CSS authoring style: declare the small-screen case first, layer on `@media (min-width: ...)`. |
| **Container query** | A media query whose condition is the size of an ancestor element, not the viewport. |
| **`clamp(min, preferred, max)`** | A function that returns the preferred value, bounded by min and max — often replaces a breakpoint. |
| **`srcset`** | An `<img>` attribute that lists candidate image files at different resolutions. |
| **`sizes`** | An `<img>` attribute that tells the browser how wide the image will render at each breakpoint. |
| **Reflow** | The WCAG term for content adapting to the viewport without horizontal scroll. |
