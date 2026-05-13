# Week 2 — Quiz

Ten questions. Lecture notes closed. Aim for 9/10.

---

**Q1.** Two author-origin CSS rules set `color` on the same paragraph. They have identical specificity. Which one wins?

- A) The one declared first in the file.
- B) The one declared later in the file.
- C) Whichever one uses `!important`.
- D) The one whose selector is alphabetically earlier.

---

**Q2.** What is the specificity of the selector `nav ul li a.active:hover`?

- A) `(0, 0, 1, 4)`
- B) `(0, 0, 2, 3)`
- C) `(0, 1, 2, 3)`
- D) `(0, 0, 2, 4)`

---

**Q3.** Which of the following properties **does not** inherit by default from a parent element to its children?

- A) `color`
- B) `font-family`
- C) `padding`
- D) `line-height`

---

**Q4.** A `<div>` has `width: 300px`, `padding: 20px`, `border: 2px solid`. With the default `box-sizing: content-box`, what is the total rendered width of the box?

- A) 300 px
- B) 322 px
- C) 342 px
- D) 344 px

---

**Q5.** Which statement about CSS custom properties is true?

- A) They are resolved at compile time, like Sass variables.
- B) They do not inherit; each element needs its own declaration.
- C) They participate in the cascade and can be overridden by more-specific selectors.
- D) They can only be declared on `:root`.

---

**Q6.** You want to derive a hover state that is 25% darker than your brand color, in a perceptually uniform color space. Which call is correct?

- A) `color-mix(in srgb, var(--brand), black 25%)`
- B) `color-mix(in oklch, var(--brand), black 25%)`
- C) `darken(var(--brand), 25%)`
- D) `hsl(var(--brand) -25%)`

---

**Q7.** Which `clamp()` expression produces a font size that is at least 1.5 rem, scales with viewport width, and caps at 2.25 rem?

- A) `clamp(1.5rem, 2.25rem, 1.2rem + 1.5vw)`
- B) `clamp(2.25rem, 1.2rem + 1.5vw, 1.5rem)`
- C) `clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)`
- D) `clamp(1.2rem + 1.5vw, 1.5rem, 2.25rem)`

---

**Q8.** Which media query reflects the user's OS-level light/dark preference?

- A) `@media (color-scheme: dark)`
- B) `@media (prefers-color-scheme: dark)`
- C) `@media (theme: dark)`
- D) `@media (dark-mode)`

---

**Q9.** What is the WCAG 2.2 AA minimum contrast ratio for normal-size body text against its background?

- A) 3:1
- B) 4.5:1
- C) 7:1
- D) 21:1

---

**Q10.** Why is `!important` considered an antipattern in author stylesheets?

- A) It does not work in modern browsers.
- B) It cannot be combined with custom properties.
- C) It bypasses normal specificity, which hides the underlying selector disagreement instead of fixing it.
- D) It only applies to the first occurrence in the file.

---

## Answer key

<details>
<summary>Click to reveal</summary>

1. **B** — Source order is the third and final tiebreaker in the cascade. When origin and specificity match, the later rule wins.
2. **D** — Four type selectors (`nav`, `ul`, `li`, `a`) and two class-level selectors (`.active`, `:hover`). Tuple: `(0, 0, 2, 4)`. A common mistake is to forget that pseudo-classes like `:hover` count at the class level.
3. **C** — `padding` is a layout property and does not inherit. `color`, `font-family`, and `line-height` are all text properties and inherit by default.
4. **D** — `300 + 20 + 20 + 2 + 2 = 344 px`. With `content-box`, declared `width` is the content; padding and border are added outside.
5. **C** — Custom properties live in the cascade, inherit by default, and can be overridden by more-specific selectors. That is the entire reason they replace Sass variables for runtime theming.
6. **B** — `color-mix(in oklch, var(--brand), black 25%)`. `oklch` is the perceptually uniform space; the 25% black mix darkens by a perceptually flat amount.
7. **C** — `clamp(min, preferred, max)`. The preferred value is the linear `1.2rem + 1.5vw`; the floor is 1.5 rem; the ceiling is 2.25 rem.
8. **B** — `prefers-color-scheme`. The other media features do not exist as written.
9. **B** — 4.5:1 for normal body text. 3:1 applies to large text (18 pt / 24 px, or 14 pt / 18.66 px bold) and to non-text UI components. 7:1 is the AAA threshold.
10. **C** — `!important` overrides normal specificity. The right fix for "my rule does not apply" is almost always a better selector, not an importance flag. The flag tends to cascade into the rest of the codebase.

</details>

If under 7, re-read [Lecture 1](./lecture-notes/01-the-cascade-specificity-inheritance.md) and [Lecture 2](./lecture-notes/02-custom-properties-color-typography.md). If 9 or above, you are ready for the [homework](./homework.md).
