# Lecture 1 — The Cascade, Specificity, Inheritance

> **Outcome:** You can explain how the browser resolves competing CSS rules, calculate specificity by hand, predict which properties inherit, diagram the box model, and explain why `box-sizing: border-box` is the default every project deserves.

## 1. CSS is a contract with the browser

Last week, the browser parsed your HTML into a tree. CSS is the second pass. It says, in effect: *for every node in this tree, what should it look like?*

A CSS rule has two parts:

```css
selector {
  property: value;
}
```

The selector picks nodes in the DOM. The declaration block says what to set on each one. That is the entire surface area of the language. The interesting parts — what makes CSS hard to learn well and easy to learn poorly — are the rules the browser uses when **more than one rule applies** to the same node, and **which properties flow from a parent to its children automatically**. Those rules have names: the **cascade**, **specificity**, and **inheritance**. We will take each one in order.

A small framing: CSS is not imperative. You do not tell the browser "make this paragraph red." You tell the browser "paragraphs that match this selector have `color: red` as one of their declarations." The browser then runs the cascade for every paragraph and decides what `color` to use. The mental shift, parallel to last week's mental shift about HTML, is this: **CSS is a description of styles you would like to be true; the browser is the engine that computes which ones actually are**.

---

## 2. The C in CSS — the cascade in three sentences

> When two rules set the same property on the same element, the browser compares them in three rounds: **origin and importance**, then **specificity**, then **source order**. The first round that has a clear winner ends the comparison.

That is the whole cascade. Everything below is detail on what each round means.

### Round one — origin and importance

A CSS rule arrives at the browser from one of three places, called **origins**:

1. **User-agent stylesheet.** The browser's own defaults. `<h1>` is bold and large because of this. `<a>` is blue and underlined because of this.
2. **User stylesheet.** Rules the user injected via accessibility settings or a browser extension. Rare. Important when they exist — these are how a low-vision user sets a minimum font size, for instance.
3. **Author stylesheet.** Your CSS. The file you wrote.

The default ordering is: **author beats user beats user-agent**. Your stylesheet wins over the browser defaults, which is the entire reason CSS exists.

Now add **`!important`**. When a declaration is marked `!important`, the ordering inverts: **user-agent `!important` beats user `!important` beats author `!important`**, and then **all `!important` declarations beat all normal declarations**. This is so a user with a strong accessibility need (a screen-magnifier user requiring 24 px minimum) can override a stylesheet author who declared 12 px.

For 95 percent of the CSS you write this week, every rule lives in the author origin, and `!important` is absent. The cascade collapses to specificity and source order. We will get to `!important` as an antipattern in section 5.

### Round two — specificity

When two declarations come from the same origin (almost always: yours), the more specific selector wins. We will calculate specificity by hand in section 3.

### Round three — source order

When two declarations come from the same origin **and** have the same specificity, **the one written later wins**. This is why `style.css` linked at the bottom of `<head>` overrides any earlier stylesheet at equal specificity, and why a `<style>` block at the end of the document beats one at the top.

A tiny example:

```css
p { color: navy; }
p { color: crimson; }
```

Both rules are author-origin. Both have identical specificity (one type selector). The second rule wins; paragraphs render crimson. Move the navy rule down and paragraphs become navy. Source order is the final tiebreaker, and a quiet one — it makes refactoring a stylesheet a surprisingly geometric task.

---

## 3. Specificity, calculated by hand

The browser computes specificity as a **four-tuple**: `(a, b, c, d)`. You compare tuples lexicographically — `a` first, then `b`, then `c`, then `d`. Bigger wins.

| Slot | Counts                                                                       |
|------|------------------------------------------------------------------------------|
| `a`  | Is the declaration in a `style="..."` attribute? Zero or one.                |
| `b`  | Number of ID selectors in the selector (`#main`, `#hero`).                   |
| `c`  | Number of class, attribute, and pseudo-class selectors (`.btn`, `[type="email"]`, `:hover`). |
| `d`  | Number of type and pseudo-element selectors (`p`, `h1`, `::before`).         |

The universal selector `*` and combinators (`>`, `+`, `~`, descendant space) **do not** count toward specificity. Pseudo-classes count as classes; pseudo-elements count as types. `:not(...)` itself does not count, but the selector inside `:not()` does.

Worked examples, ordered low to high:

| Selector                                    | a | b | c | d | Tuple        |
|---------------------------------------------|--:|--:|--:|--:|--------------|
| `*`                                         | 0 | 0 | 0 | 0 | `(0,0,0,0)`  |
| `p`                                         | 0 | 0 | 0 | 1 | `(0,0,0,1)`  |
| `p::first-line`                             | 0 | 0 | 0 | 2 | `(0,0,0,2)`  |
| `.lede`                                     | 0 | 0 | 1 | 0 | `(0,0,1,0)`  |
| `p.lede`                                    | 0 | 0 | 1 | 1 | `(0,0,1,1)`  |
| `a:hover`                                   | 0 | 0 | 1 | 1 | `(0,0,1,1)`  |
| `input[type="email"]:focus`                 | 0 | 0 | 2 | 1 | `(0,0,2,1)`  |
| `nav a.active`                              | 0 | 0 | 1 | 2 | `(0,0,1,2)`  |
| `#main`                                     | 0 | 1 | 0 | 0 | `(0,1,0,0)`  |
| `#main p.lede`                              | 0 | 1 | 1 | 1 | `(0,1,1,1)`  |
| `style="color: red"` (inline)               | 1 | 0 | 0 | 0 | `(1,0,0,0)`  |

Read the table from the top down. A single ID beats any number of classes — `#main` (1, 0, 0) beats `.a.b.c.d.e.f.g.h.i.j.k` (0, 11, 0). An inline style beats everything (short of `!important`).

That is the rule that bites everyone the first time. Your stylesheet says `p { color: navy; }`. Somebody else's old code says `#main p { color: crimson; }`. Your rule loses, and you think the browser is broken. It is not; it is doing exactly what the spec says.

The practical takeaway: **keep specificity flat**. The healthier a stylesheet, the closer most of its selectors are to `(0, 0, 1, 0)` — a single class — with the occasional descendant or pseudo-class. Selectors stacked like `#hero .container > article.post .byline a:hover` are a code smell. Refactor toward classes.

A quick mental check: there are exactly seven kinds of CSS selector you reach for daily, and you should be able to score each one without thinking.

| Selector kind                | Example              | Specificity   |
|------------------------------|----------------------|---------------|
| Type                         | `h1`                 | `(0,0,0,1)`   |
| Class                        | `.byline`            | `(0,0,1,0)`   |
| Attribute                    | `[disabled]`         | `(0,0,1,0)`   |
| Pseudo-class                 | `:hover`, `:focus`   | `(0,0,1,0)`   |
| Pseudo-element               | `::before`           | `(0,0,0,1)`   |
| ID                           | `#main`              | `(0,1,0,0)`   |
| Inline `style=""`            | (the attribute)      | `(1,0,0,0)`   |

Memorize that, and a remarkable number of "why is my CSS not applying?" mysteries dissolve.

---

## 4. The DevTools confession booth

The fastest way to stop being confused by the cascade is to ask the browser. Every browser ships a panel that tells you **which rule won, and which rules lost**.

In Chrome and Firefox, open DevTools (`F12` / `Cmd+Opt+I`), then:

- **Elements panel → Styles tab.** Lists every rule that targets the selected element, in cascade order, with stricken-through declarations for the ones that lost. The winning declaration is at the top of its property.
- **Elements panel → Computed tab.** The final, resolved value for every property, with the source file and line of the winning rule.

The Computed tab is the cascade's confession booth. If you are not sure why a paragraph is red, click it, open Computed, expand `color`, and the browser will name the file, line, and selector of the rule that set it. Use this every time CSS surprises you. Reading the cascade by hand is a skill; reading it via DevTools is the daily habit that makes the skill stick.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    https://example.test/                     │
├──────────────────────────────────────────────────┤
│ Elements   Console   Sources   Network   ...     │
│ ┌────────────────────┬─────────────────────────┐ │
│ │ <p class="lede">   │ Styles    Computed      │ │
│ │   Hello, world.    │ ──────────────────────  │ │
│ │ </p>               │ color: crimson          │ │
│ │                    │   ↳ from style.css:14   │ │
│ │                    │      p.lede { color: …} │ │
│ │                    │ ─ overridden ─          │ │
│ │                    │ color: navy             │ │
│ │                    │   ↳ from style.css:8    │ │
│ │                    │      p { color: navy }  │ │
│ └────────────────────┴─────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 5. `!important` — the antipattern with a narrow legitimate use

Adding `!important` to a declaration boosts it above all normal declarations in the same origin:

```css
.btn-primary {
  background: var(--page-sky) !important;
}
```

The rule then beats any other author rule that does not also use `!important`, regardless of specificity. It is tempting. It is, almost always, a mistake.

The reason: `!important` does not fix the problem. It hides it. The underlying problem is usually that two rules disagree about which one should win, and the right resolution is to **fix the selectors** — make the intended winner more specific, or refactor the loser so it does not target the same element. `!important` short-circuits that conversation. Worse, the next person to hit a similar problem reaches for `!important` too, and a few months later your stylesheet has a dozen of them, none of which can be safely removed because none of them documents *why* the override exists.

Two legitimate uses:

1. **Utility classes you want to be the last word.** `.sr-only { ... !important; }` for an always-visually-hidden screen-reader helper, so a misplaced `display: block` somewhere else does not accidentally reveal it.
2. **Overriding third-party CSS you cannot edit** (a CMS theme, a vendor widget) when refactoring is not an option.

That is roughly it. In your own work, this week and for the rest of the course, the rule is: **if you find yourself typing `!important`, stop and re-read the cascade**. The answer is almost always a better selector.

---

## 6. Inheritance — the quiet half of the language

Some CSS properties **inherit** automatically from a parent element to its children. Others do not. Which is which is not arbitrary — it follows a rule the spec states plainly.

> **Properties that affect the rendering of text inherit. Properties that affect layout do not.**

The intuition: if you set `color: navy` on `<body>`, you want every paragraph, every link, every list item to be navy too. You do not want to write `body, p, a, li, h1, h2 { color: navy }`. So `color` inherits.

But if you set `margin: 1rem` on `<body>`, you do not want every paragraph and every list item to also have a 1 rem margin — that would explode the page. So `margin` does not inherit.

A practical table of the properties you will touch this week:

| Property         | Inherits? |
|------------------|:---------:|
| `color`          | Yes       |
| `font-family`    | Yes       |
| `font-size`      | Yes       |
| `font-weight`    | Yes       |
| `font-style`     | Yes       |
| `line-height`    | Yes       |
| `letter-spacing` | Yes       |
| `text-align`     | Yes       |
| `visibility`     | Yes       |
| `cursor`         | Yes       |
| `background`    *(and all `background-*`)* | No |
| `margin`        *(and all `margin-*`)*     | No |
| `padding`       *(and all `padding-*`)*    | No |
| `border`        *(and all `border-*`)*     | No |
| `width`, `height`                          | No |
| `display`                                  | No |
| `position`, `top`, `left`, ...             | No |

When in doubt, look it up on MDN — every CSS property page has an "Inherited?" row at the top.

You can override the default with four keywords:

- **`inherit`** — take the parent's computed value, even for a property that does not normally inherit. Useful for "make this button's color the same as the surrounding text."
- **`initial`** — reset to the spec's initial value. Note this is *not* the user-agent's default — for `color`, the initial value is `canvastext` (per the spec), not the browser's default text color.
- **`unset`** — inherit if the property normally inherits; otherwise reset to initial. The most useful of the four.
- **`revert`** — reset to whatever the user-agent or user stylesheet says, ignoring all author rules. Useful for "undo my CSS reset on this one element."

You will reach for `inherit` and `unset` a few times a week. `initial` and `revert` are situational.

---

## 7. The box model — the geometry every browser draws around every element

Every box the browser lays out has four concentric rectangles around it: **content**, **padding**, **border**, and **margin**.

```text
┌─────────────── margin ────────────────┐
│  ┌─────────── border ──────────────┐  │
│  │ ┌───────── padding ───────────┐ │  │
│  │ │                             │ │  │
│  │ │          content            │ │  │
│  │ │                             │ │  │
│  │ └─────────────────────────────┘ │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

A definition for each:

- **Content** — the text, image, or child boxes inside the element.
- **Padding** — space between the content and the border. Padding has the element's background.
- **Border** — the border itself: width, style, color.
- **Margin** — space outside the border, between this box and its neighbors. Margins are transparent.

You can set each of the four independently:

```css
.card {
  padding: 1rem;                    /* all four sides */
  border: 1px solid var(--rule);
  margin: 1.5rem 0;                 /* top/bottom 1.5rem, left/right 0 */
}
```

### Margin collapse — the one gotcha worth memorizing

Adjacent **vertical** margins between **block** elements *collapse*: they become the larger of the two, not their sum. This is intentional — without it, a stack of paragraphs each with `margin-bottom: 1rem` and `margin-top: 1rem` would have 2 rem between them; with collapse, you get 1 rem. The page reads as designed.

But it surprises you the first time. If you have a `<section>` with `margin-top: 2rem` and its first child has `margin-top: 1rem`, you do not get 3 rem — you get 2 rem, and the child's margin "escapes" upward through the parent. Knowing this exists is enough to start; you will hit it eventually and recognize it.

A few rules that break collapse: padding, border, `overflow` other than `visible`, and flex / grid contexts all prevent the parent and the child from collapsing.

### `box-sizing: border-box` — set once, set right

By default (`box-sizing: content-box`), the `width` and `height` you set apply to the **content** box only. Then padding and border are added on top. So `.card { width: 300px; padding: 1rem; border: 1px solid; }` produces a card that is actually 300 + 16 + 16 + 1 + 1 = 334 px wide.

This is, to put it gently, a bad default. It dates from 1996 and almost nobody actually wants it.

`box-sizing: border-box` says: include padding and border in the declared `width`. The card above renders 300 px wide, with the content box squeezed to 266 px to make room. This is what every layout you will ever write actually expects.

The fix is universal. Every CSS file you write from this week forward should start with:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

You will see this exact incantation in every stylesheet in the wild. There is no debate about it any more — the only debate is whether to put it in a reset stylesheet or inline it at the top of your own. The result is the same.

---

## 8. A small worked example

Here is the full cascade in motion. The HTML:

```html
<main id="main">
  <article class="post">
    <p class="lede">A first paragraph.</p>
    <p>A second paragraph.</p>
  </article>
</main>
```

And the CSS:

```css
body { color: var(--ink, #1a1a1a); font-family: Lora, Georgia, serif; }
p { color: navy; line-height: 1.6; }
.lede { color: crimson; font-weight: 600; }
#main .lede { color: forestgreen; }
```

What is the color of the first paragraph?

Trace it:

- `body { color: ...; }` sets the inherited base color on `<body>`. `<p>` would inherit this — but `<p>` has its own `color` rule.
- `p { color: navy; }` applies. Specificity `(0,0,0,1)`.
- `.lede { color: crimson; }` applies to the first `<p>` because it has `class="lede"`. Specificity `(0,0,1,0)`. Beats `p`.
- `#main .lede { color: forestgreen; }` also applies. Specificity `(0,1,1,0)`. Beats `.lede`.

The first paragraph is `forestgreen`.

The second paragraph has no `lede` class. Only `p { color: navy; }` applies; specificity `(0,0,0,1)`. The body's `color` inherits, but `p`'s own rule overrides it. The second paragraph is `navy`.

Open DevTools and click each paragraph. The Styles pane should match this analysis exactly. If it does not, read the Styles pane and figure out what part of your model is wrong before re-reading the lecture.

---

## 9. Self-check

Without re-reading:

1. Name the three rounds of the cascade in order.
2. What is the specificity of `nav ul li a.active:hover`?
3. Which of the following properties inherits: `color`, `padding`, `font-family`, `border`, `text-align`?
4. What does `box-sizing: border-box` change about how `width` is computed?
5. Why is `!important` an antipattern, and what is its one legitimate use?
6. What is margin collapse, and when does it not happen?

---

## Further reading

- **CSS Cascading and Inheritance Level 5**: <https://www.w3.org/TR/css-cascade-5/>
- **MDN — Cascade, specificity, and inheritance**: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade>
- **MDN — Specificity**: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity>
- **MDN — Introduction to the CSS box model**: <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model>
- **Paul Irish — `* { box-sizing: border-box; }` FTW**: <https://www.paulirish.com/2012/box-sizing-border-box-ftw/>

Next: [Lecture 2 — Custom Properties, Color, Typography](./02-custom-properties-color-typography.md).
