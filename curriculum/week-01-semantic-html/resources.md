# Week 1 — Resources

Every resource here is **free** and **publicly accessible**.

## Primary sources

- **WHATWG HTML Living Standard** — the spec. This is the normative reference. Bookmark it.
  <https://html.spec.whatwg.org/multipage/>
- **MDN — HTML element reference** — the day-to-day lookup. Every element, every attribute.
  <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements>
- **MDN — HTML attribute reference** — for when you forget which attributes a tag accepts.
  <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes>
- **W3C Web Content Accessibility Guidelines (WCAG) 2.2** — the standard real websites are audited against.
  <https://www.w3.org/TR/WCAG22/>
- **WCAG 2.2 Quick Reference** — the same material, ordered by what to do.
  <https://www.w3.org/WAI/WCAG22/quickref/>

## Validation and audit tools (free)

- **The W3C Markup Validation Service** — paste your HTML, get a list of errors. Run this on every page.
  <https://validator.w3.org/>
- **Nu HTML Checker** — the same engine, modern UI, lets you paste source or upload a file.
  <https://validator.w3.org/nu/>
- **axe DevTools (browser extension)** — runs an accessibility audit in your browser. Catches roughly half of real WCAG issues automatically; the rest you find by hand.
  <https://www.deque.com/axe/devtools/>
- **Lighthouse (built into Chrome DevTools)** — broader audit. Includes an accessibility pass. We use it in Week 10.
  <https://developer.chrome.com/docs/lighthouse/overview>
- **WAVE — Web Accessibility Evaluation Tool** — a second opinion alongside axe.
  <https://wave.webaim.org/>

## Accessibility deep readings

- **The A11Y Project — Checklist** — practical, beginner-friendly accessibility checklist.
  <https://www.a11yproject.com/checklist/>
- **WebAIM — Introduction to Web Accessibility** — the canonical free explainer.
  <https://webaim.org/intro/>
- **MDN — Accessibility learning path** — short structured walk through the basics.
  <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility>
- **Inclusive Components by Heydon Pickering** — free, in-browser book. The chapters on cards, menus, and headings inform every UI you will ever build.
  <https://inclusive-components.design/>
- **WAI-ARIA Authoring Practices 1.2** — when to use ARIA, when NOT to use ARIA. Read the introduction even if you skip the rest.
  <https://www.w3.org/WAI/ARIA/apg/>

## Free books and write-ups

- **MDN — Structuring the web with HTML** — full free curriculum, identical-ish coverage to this week.
  <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content>
- **HTML5 Doctor — Element Index** — older but still excellent; one-page-per-element with "when to use, when not to use."
  <http://html5doctor.com/element-index/>
- **"Resilient Web Design" by Jeremy Keith** — free online book. Read at least the first three chapters this week.
  <https://resilientwebdesign.com/>

## Specifications worth bookmarking

- **HTML Living Standard — Sections** (the chapter on landmarks):
  <https://html.spec.whatwg.org/multipage/sections.html>
- **HTML Living Standard — Forms**:
  <https://html.spec.whatwg.org/multipage/forms.html>
- **HTML Living Standard — Text-level semantics** (the chapter on inline elements):
  <https://html.spec.whatwg.org/multipage/text-level-semantics.html>
- **HTML Living Standard — The `lang` attribute and language tags**:
  <https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes>

## Videos (free)

- **"HTML Crash Course for Absolute Beginners" — Traversy Media** — fine as a primer.
  <https://www.youtube.com/results?search_query=traversy+html+crash+course>
- **"Web Accessibility Perspectives" — W3C Web Accessibility Initiative** — short videos showing why semantics matter.
  <https://www.w3.org/WAI/perspective-videos/>
- **"Semantics and how to get it right" — Google Chrome Developers** — short, focused.
  <https://www.youtube.com/results?search_query=semantic+html+google+chrome+developers>

## Tools you will use this week

- **VS Code** — your editor. The HTML language server is built in.
- **Live Server** (VS Code extension) — open `index.html` and watch it reload on save.
- **Chrome DevTools** — the Elements panel shows you the parsed DOM. Open it with `F12` or `Cmd+Opt+I`.
- **axe DevTools** — accessibility audit, as a browser extension.
- **NVDA** (Windows, free) or **VoiceOver** (macOS, built-in, `Cmd+F5`) — screen readers. Try them.

## Glossary

| Term | One-line definition |
|------|---------------------|
| **HTML** | HyperText Markup Language. The structured-document format browsers read. |
| **WHATWG** | Web Hypertext Application Technology Working Group. Maintains the HTML Living Standard. |
| **W3C** | World Wide Web Consortium. Publishes WCAG and many other web standards. |
| **DOM** | Document Object Model. The in-memory tree the browser builds from your HTML. |
| **Element** | A node in the document tree, written `<tag>content</tag>`. |
| **Attribute** | A name/value on an element, like `lang="en"` or `alt="..."`. |
| **Tag** | The text that opens or closes an element, e.g. `<p>` or `</p>`. Often used loosely as a synonym for element. |
| **Semantic HTML** | HTML where the element you chose reflects the meaning of the content, not its appearance. |
| **Landmark** | A semantic region of the page: `header`, `nav`, `main`, `aside`, `footer`. Screen readers expose these for navigation. |
| **WCAG** | Web Content Accessibility Guidelines. WCAG 2.2 AA is the practical compliance target. |
| **ARIA** | Accessible Rich Internet Applications. An attribute set for telling assistive tech things HTML cannot. Use sparingly. |
| **Alt text** | The `alt` attribute on `<img>`. Describes the image for users who cannot see it. |
