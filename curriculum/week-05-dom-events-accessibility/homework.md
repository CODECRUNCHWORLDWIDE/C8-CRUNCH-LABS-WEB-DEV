# Week 5 Homework

Six problems, ~6 hours total. Commit each in your Week 5 repo under a `homework/` folder.

---

## Problem 1 — The Authoring Practices tour (45 min)

Open the **WAI-ARIA Authoring Practices** patterns index: <https://www.w3.org/WAI/ARIA/apg/patterns/>. Pick **three** patterns you have not built yet. Read each pattern's page end-to-end: the role, the states and properties, the keyboard interactions, and the example markup.

In `homework/01-apg-tour.md`, for each of the three patterns:

- A one-paragraph summary of what the pattern is for.
- The keyboard contract in a short table — every key, what it does.
- One platform-native HTML element you could use instead, if any, and the trade-off.
- A link to one of the "Example Implementations" on that pattern's page.

**Acceptance.** A short file with three short answers. The three patterns should be drawn from: Combobox, Tabs, Dialog, Switch, Menu Bar, Accordion, Carousel, Slider, Tree View. Do not pick Disclosure or Listbox (we covered those).

---

## Problem 2 — Refactor for delegation (45 min)

Take a small toy implementation (or write your own) of a card grid with ten cards, each card having three buttons: "Like," "Share," "Hide." The naive implementation attaches 30 listeners. Refactor to one listener on the grid, routed on `data-action`.

Save both versions in `homework/02-delegation/before.js` and `homework/02-delegation/after.js`.

In `homework/02-delegation/notes.md`:

- Confirm with DevTools that the `before.js` version attaches 30 listeners and the `after.js` version attaches 1.
- Add a card at runtime. Confirm that the `before.js` new card has no working buttons (because no listener was attached to it). Confirm that the `after.js` new card works immediately.
- A 5-sentence reflection on which version you would rather maintain, and why.

**Acceptance.**

- Two working implementations, identical UX, listener-count difference verified.
- `notes.md` answers all three points.

---

## Problem 3 — The keyboard audit (1 h)

Pick one site you use daily — a news site, an e-commerce site, your school portal, anything. Open it in your browser. Close your trackpad. Try to use the site with the keyboard alone for ten minutes.

In `homework/03-keyboard-audit.md`:

- The site you chose. The date.
- Three concrete failures you encountered, with the page URL and what you were trying to do. For each, cite the WCAG 2.2 Success Criterion the failure violates (almost certainly SC 2.1.1 Keyboard, SC 2.4.7 Focus Visible, or SC 2.4.3 Focus Order).
- One thing the site did well.
- A short reflection on whether the experience would be tolerable for a person who navigated with the keyboard every day.

**Acceptance.** A short report. The point is not to file a bug; the point is to internalize what keyboard accessibility *feels* like when it is missing.

---

## Problem 4 — Screen reader, first contact (1 h)

Turn on a screen reader. On macOS: `Cmd+F5` for VoiceOver, then read the **30-minute tutorial** at <https://webaim.org/articles/voiceover/>. On Windows: download **NVDA** (free) from <https://www.nvaccess.org/> and read <https://webaim.org/articles/nvda/>. On Linux: turn on **Orca** (`Alt+Super+S`) and skim <https://help.gnome.org/users/orca/stable/>.

Then close your eyes. (Really. Or put a piece of paper over your screen.) Navigate this week's README with the screen reader, from the top. Take notes on what you hear.

In `homework/04-screen-reader.md`:

- Which screen reader, on which OS.
- A summary of how you navigate headings (`H` or `VO+Cmd+H`), landmarks (`R` or `VO+U → Landmarks`), and links (`K` or `VO+U → Links`).
- The first three landmarks the screen reader announced when entering the README.
- One thing the README did well (e.g., the heading hierarchy is clean).
- One thing the README did poorly that you would fix (e.g., a missing skip link, or a code block that read awkwardly).

**Acceptance.** A short report. The point is to feel the rhythm of a screen-reader navigation pass once, so that when you build a component for one to consume, you have a memory of what it sounds like.

---

## Problem 5 — Build a disclosure-pair (1 h)

Build `homework/05-disclosure/index.html`, `homework/05-disclosure/styles.css`, and `homework/05-disclosure/script.js`. The page has two disclosures, side by side: an FAQ-style "How does it work?" and a settings-style "Advanced options."

Both follow the **Disclosure** pattern from the Authoring Practices: a `<button aria-expanded="false" aria-controls="...">` toggles the visibility of a region with `hidden`.

- The first disclosure uses a plain `<button>` + JavaScript.
- The second uses the native `<details>` / `<summary>` element. **No JavaScript at all** for the second one.

In a `notes.md`, write 100 words on the trade-offs: what does the JavaScript version let you do that `<details>` does not? What does `<details>` give you for free that the JavaScript version had to implement?

**Acceptance.**

- Both disclosures work end-to-end with the keyboard.
- The JavaScript version has a visible `:focus-visible` outline on its button.
- The native version is styled to match.
- The page passes the validator and axe DevTools cleanly.

---

## Problem 6 — Reflection (30 min)

Write `homework/06-reflection.md` (300–400 words) answering:

1. Which DOM or event concept from Week 5 changed your mental model the most — and why? Be specific (which lecture section, which spec citation).
2. Pick one keyboard interaction or ARIA attribute whose intended behavior surprised you. Where will you reach for it next?
3. Name one decision you made this week that you would defend in a code review. Cite a spec section or a WCAG 2.2 Success Criterion by number.
4. What is one habit you will keep from Week 5, for the rest of your career? Plausible candidates: "test every component with the keyboard before declaring it done"; "delegate, don't decorate"; "never set `outline: none` without `:focus-visible` replacing it"; "ask `closest(selector)`, not `parentElement.parentElement`."

---

## How to submit

- Create a folder `homework/` in your Week 5 repo.
- Save each problem's output with the filename suggested above.
- One commit per problem is ideal; one big commit at the end is acceptable.
- In your final commit message, link to the file(s) you spent the most time on.

## Grading guide

This homework is graded on completion, not perfection. The rubric:

| Problem | What "complete" means |
| ------- | --------------------- |
| 1 | Three patterns summarized; keyboard contracts tabled; native alternatives noted. |
| 2 | Two working implementations; listener counts verified in DevTools; notes complete. |
| 3 | One site audited; three concrete failures cited against WCAG; one thing done well. |
| 4 | One screen reader used; tutorial completed; report describes the experience. |
| 5 | Two disclosures built; both keyboard-clean; trade-offs documented. |
| 6 | 300–400 word reflection answering all four questions. |

If you finish a problem and are uncertain whether it counts as "complete," ask in the cohort channel. Future-you reads better notes than nobody-you.

## Time budget

| Problem | Time |
| ------: | ---: |
| 1 | 45 min |
| 2 | 45 min |
| 3 | 1 h |
| 4 | 1 h |
| 5 | 1 h |
| 6 | 30 min |
| **Total** | **~5 h** |

When done, push your Week 5 repo and ship the [mini-project](./mini-project/README.md).
