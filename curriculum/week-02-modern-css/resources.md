# Week 2 — Resources

Every resource here is **free** and **publicly accessible**.

## Primary sources

- **CSS Cascading and Inheritance Level 5** — the normative spec for the cascade, specificity, and inheritance. Surprisingly readable.
  <https://www.w3.org/TR/css-cascade-5/>
- **CSS Color Module Level 4** — defines `hsl()`, `oklch()`, `color-mix()`, and the syntax you will use this week.
  <https://www.w3.org/TR/css-color-4/>
- **CSS Custom Properties for Cascading Variables Module Level 1** — the spec for `--variables` and `var()`.
  <https://www.w3.org/TR/css-variables-1/>
- **CSS Values and Units Module Level 4** — covers `clamp()`, `min()`, `max()`, and viewport units.
  <https://www.w3.org/TR/css-values-4/>
- **MDN — CSS reference** — the day-to-day lookup. Every property, every value.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference>

## The cascade, specificity, inheritance

- **MDN — Cascade, specificity, and inheritance** — the canonical tutorial.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade>
- **MDN — Specificity** — with the four-tuple worked examples.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity>
- **Specificity Calculator** — paste a selector, see the score.
  <https://specificity.keegan.st/>
- **CSS Tricks — The Cascade, Specificity, and Inheritance** — a friendly walkthrough.
  <https://css-tricks.com/the-cascade-specificity-and-inheritance/>
- **Andy Bell — Be the browser's mentor, not its micromanager** — short, opinionated essay on writing CSS with the cascade rather than against it.
  <https://buildexcellentwebsit.es/>

## Custom properties and color

- **MDN — Using CSS custom properties** — start here, with worked examples.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties>
- **MDN — `color-mix()`** — the function reference, with browser-support notes.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix>
- **MDN — `oklch()`** — the perceptually-uniform color space worth your time.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch>
- **OKLCH Color Picker & Converter** — drag the sliders, watch what changes.
  <https://oklch.com/>
- **Evil Martians — OKLCH in CSS** — the deep dive that converted most senior frontend engineers to oklch in 2023.
  <https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl>

## Typography

- **Smashing Magazine — Modern Fluid Typography Using CSS `clamp()`** — derive the formula, then use the formula.
  <https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/>
- **Utopia — Fluid type & space calculator** — a tool that emits `clamp()` values for a full type scale.
  <https://utopia.fyi/>
- **CSS Tricks — System font stack** — copy-paste-quality reference.
  <https://css-tricks.com/snippets/css/system-font-stack/>
- **MDN — `font-family`** — the property, plus the `system-ui` keyword.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/font-family>
- **Practical Typography by Matthew Butterick** — free online book. Read the chapter "Type composition" this week.
  <https://practicaltypography.com/>

## Dark mode and color contrast

- **MDN — `prefers-color-scheme`** — the media query reference.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme>
- **WebAIM — Contrast Checker** — paste a foreground and background; get the WCAG ratio.
  <https://webaim.org/resources/contrastchecker/>
- **WCAG 2.2 Success Criterion 1.4.3 — Contrast (Minimum)** — the normative source for 4.5:1 and 3:1.
  <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>
- **Chrome DevTools — Color contrast in the picker** — built-in, no extension needed.
  <https://developer.chrome.com/docs/devtools/accessibility/contrast>

## Box model

- **MDN — The box model** — the canonical explainer.
  <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model>
- **CSS Tricks — `box-sizing`** — short, useful.
  <https://css-tricks.com/box-sizing/>
- **Paul Irish — `* { box-sizing: border-box; }` FTW** — the 2012 post that changed how everyone writes resets.
  <https://www.paulirish.com/2012/box-sizing-border-box-ftw/>

## Free books and longer reads

- **"Resilient Web Design" by Jeremy Keith** — Chapter 4 (Layouts) covers the philosophy of CSS layout. Free online.
  <https://resilientwebdesign.com/chapter4/>
- **"Every Layout" by Heydon Pickering & Andy Bell** — most chapters are paywalled but the [first three](https://every-layout.dev/) are free and worth reading.
- **"CSS for JavaScript Developers" — free samples** — Josh Comeau's course has several free chapters worth reading.
  <https://css-for-js.dev/>

## Videos (free)

- **"Learn CSS" — web.dev (Google Chrome team)** — full free course; the cascade and color modules pair with this week.
  <https://web.dev/learn/css/>
- **"The CSS Cascade — Una Kravets"** — talk from CSS Day; thirty minutes well spent.
  <https://www.youtube.com/results?search_query=una+kravets+css+cascade>
- **"Modern CSS in Real Life" — Chris Coyier** — a tour of the parts that earned their keep.
  <https://www.youtube.com/results?search_query=chris+coyier+modern+css>

## Tools you will use this week

- **VS Code** — your editor. Install the **CSS Peek** extension if you want jump-to-definition for selectors.
- **Chrome / Firefox DevTools — Elements panel + Styles pane** — every rule, every override, every source line.
- **DevTools — Computed panel** — what the browser actually decided, and which rule won.
- **DevTools — Color picker with contrast readout** — pass / fail / AAA right in the picker.
- **axe DevTools** — still required. Contrast violations show up here.
- **validator.w3.org** — yes, still. CSS does not make your HTML pass; you still ran the validator.

## Glossary

| Term | One-line definition |
|------|---------------------|
| **Cascade** | The algorithm the browser uses to resolve which rule wins when more than one applies. |
| **Specificity** | A four-tuple score (inline, ID, class, element) that breaks ties in the cascade. |
| **Origin** | Whose stylesheet a rule came from: user-agent, user, or author. Author wins, usually. |
| **Inheritance** | The mechanism by which a parent's value flows to its children for inheritable properties. |
| **Custom property** | A user-defined property whose name starts with `--`, set with `--name: value;` and read with `var(--name)`. |
| **Box model** | The four boxes around every element: content, padding, border, margin. |
| **`box-sizing: border-box`** | Make `width` and `height` include padding and border. The sane default. |
| **`clamp(min, preferred, max)`** | A function that returns the preferred value, bounded by the min and max. |
| **`color-mix()`** | A function that interpolates between two colors in a chosen color space. |
| **`oklch()`** | A perceptually uniform color space — lightness changes look like lightness changes. |
| **`prefers-color-scheme`** | A media query reflecting the user's OS-level light/dark preference. |
| **System font stack** | A `font-family` list that resolves to whatever font the user's OS uses for UI. |
