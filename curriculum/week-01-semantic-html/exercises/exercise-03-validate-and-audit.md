# Exercise 3 — Validate and audit

**Time:** ~40 minutes.

## Problem statement

Take the page you wrote for Exercise 1 (or Exercise 2 — pick whichever you are more proud of). Run it through two tools and fix every problem either tool reports.

You will use:

1. The **Nu HTML Checker** at <https://validator.w3.org/nu/>.
2. **axe DevTools** as a browser extension.

This exercise is about workflow. By the end of Week 1 you should be running both tools on every page you ship, the same way you run a linter on every commit.

## Setup

If you have not installed axe DevTools yet:

- Chrome: <https://chromewebstore.google.com/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd>
- Firefox: <https://addons.mozilla.org/firefox/addon/axe-devtools/>

It installs as a new tab inside the regular DevTools panel.

## Part 1 — W3C validation

1. Open your page locally with Live Server.
2. Go to <https://validator.w3.org/nu/>.
3. Choose **"Check by uploading"** and pick your `index.html`. Or paste the source into the **"Check by direct input"** tab.
4. Read every error and warning.

For each issue:

- **Read the message carefully.** The validator's messages are precise, sometimes terse. The phrase "Element X is not allowed as child of element Y" means the spec's content model rejects your nesting.
- **Find the offending line in your source.** The validator gives a line and column.
- **Fix it.** Re-run. Repeat until you see *"Document checking completed. No errors or warnings to show."*

Common issues you might see:

| Message | What it usually means |
| ------- | --------------------- |
| "An `img` element must have an `alt` attribute" | You forgot `alt`. Add `alt="..."` or `alt=""`. |
| "Element `h1` not allowed as child of element `header` in this context" | You nested an `<h1>` somewhere unexpected. Re-read the section. |
| "Bad value `X` for attribute `Y`" | Typo in an attribute value (`type="emial"`). |
| "Stray end tag" | A closing tag without a matching open. |
| "Section lacks heading" | Your `<section>` has no heading inside. Add one or change to `<div>`. |
| "Duplicate ID `X`" | Two elements with the same `id`. IDs must be unique. |
| "The `for` attribute of the `label` element must refer to a form control" | Mismatched `for` and `id`. |

## Part 2 — axe DevTools audit

1. Open your page in the browser.
2. Open DevTools (`F12` or `Cmd+Opt+I`).
3. Click the **axe DevTools** tab.
4. Click **"Scan ALL of my page."**

axe will report issues at four levels: **critical**, **serious**, **moderate**, **minor**. Address all critical and serious. Address moderate when feasible.

For each issue:

- Click into it. axe shows you the offending element in the DOM and explains the WCAG criterion it violates.
- Click **"Inspect node"** to jump to the element in the Elements panel.
- Read the **"More info"** link. axe's docs are written by accessibility specialists; they are worth reading.
- Fix the HTML. Re-scan.

Common issues you might see:

| Issue | What it means |
| ----- | ------------- |
| "Page must have a level-one heading" | No `<h1>` on the page. Add one inside `<main>`. |
| "Document does not have a `<title>`" | `<title>` missing or empty in `<head>`. |
| "`<html>` element must have a `lang` attribute" | Add `<html lang="en">`. |
| "Form elements must have labels" | An `<input>` with no `<label>` and no `aria-label`. |
| "Images must have alternate text" | An `<img>` with no `alt` attribute. |
| "Links must have discernible text" | An empty `<a>` or one with only an icon and no `aria-label`. |

## Acceptance criteria

- [ ] You saved a screenshot of the Nu HTML Checker showing zero errors and zero warnings on your page. Commit it as `exercises/exercise-03/validator-clean.png` (PNG, JPG, or even a copy-pasted text result is fine).
- [ ] You saved a screenshot of axe DevTools showing zero critical and zero serious issues on your page. Commit it as `exercises/exercise-03/axe-clean.png`.
- [ ] You wrote a short `exercises/exercise-03/notes.md` describing the three biggest issues you had to fix, and what you learned from each.

## Stretch

- Run the same audit with **Lighthouse** (Chrome DevTools → "Lighthouse" tab → "Accessibility" category). Compare its findings with axe's. They overlap by ~70 percent.
- Run the same audit with **WAVE** (<https://wave.webaim.org/>). Compare a third opinion.
- Open the page in a browser with CSS disabled and tab through it with the keyboard only. Note any place the focus order is surprising.

## Why this workflow matters

Most accessibility bugs are *cheap* to fix at the source — adding a missing `alt`, adding a `<label>`, picking the right element — and *expensive* to fix six months later, after the design and the data layer have been built on top of the broken markup. Running validator.w3.org and axe DevTools on every page, every time, is the cheapest insurance you can buy. After a few weeks of doing it, you will not skip it. It will become as automatic as saving the file.

A working frontend engineer in 2026 runs these checks before every pull request the way a Python developer runs `ruff` or a Go developer runs `go vet`. They are not "extra"; they are the baseline.

## Submission

Commit your `validator-clean.png`, `axe-clean.png`, and `notes.md` to your Week 1 repo. In your commit message, name the WCAG criterion you found easiest to violate and the one you found easiest to satisfy.
