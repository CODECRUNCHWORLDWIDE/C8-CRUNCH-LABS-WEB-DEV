# Week 11 Homework

> *Six practice problems. Each builds on the lectures and exercises. Time budget: 5 hours total, spread across Thursday–Saturday. Submit as a single markdown file with each answer numbered and clearly labeled. Cite at least one URL per answer where the source is non-obvious.*

---

## Problem 1 — Rewrite a brittle test (45 minutes)

The following test passes today but will break on any refactor of the component's internal structure:

```ts
test('the user card displays the user', () => {
  const { container } = render(<UserCard userId="u1" />)
  const card = container.querySelector('.user-card-wrapper > div.user-card-inner')
  expect(card?.children[1]?.textContent).toBe('Ada Lovelace')
  expect(card?.children[2]?.textContent).toBe('ada@example.com')
})
```

**Your task:**

1. List every reason this test is bad. (Aim for at least four reasons.)
2. Rewrite the test using the Testing Library priority list. The rewritten test should pass on the component shown in `challenge-01-msw-and-async-component.md` and survive a refactor that renames the wrapper classes.
3. Explain in one paragraph why your rewrite is more robust.

---

## Problem 2 — Choose the tier (30 minutes)

For each of the following test scenarios, decide which tier of the pyramid (unit / component / e2e) is the right home, and justify in 1–2 sentences. Be specific about cost-benefit.

1. The `formatRelativeTime` helper returns "1 minute ago" exactly at the 60-second boundary.
2. The "Sign in" button on the home page shows the user's name after authentication.
3. The `useReducer`-backed shopping cart correctly handles ADD, REMOVE, and CLEAR actions.
4. The full checkout flow (cart → shipping → payment → confirmation) succeeds end-to-end.
5. The validation message under the email field appears when an invalid email is submitted.
6. The `Authorization: Bearer` header is attached to every API request when the user is signed in.

---

## Problem 3 — MSW vs. fetch stub comparison (45 minutes)

Take any async component you have written. Show **both** ways of testing it:

1. A test using `vi.fn().mockResolvedValue(...)` to stub `global.fetch` directly.
2. A test using MSW with `http.get` to intercept the request.

Compare the two in a table:

| Aspect | `vi.fn` stub | MSW |
|--------|--------------|-----|
| Lines of setup code | ? | ? |
| Realism of the response object | ? | ? |
| What happens if the component starts sending a header you did not anticipate | ? | ? |
| What happens if you add a second async call to a different URL | ? | ? |
| Reusability across tests | ? | ? |

Conclude with a paragraph on which you would use in your real codebase and why.

---

## Problem 4 — Design an e2e test budget (45 minutes)

You join a team with an SPA that has 50 pages, 200 components, and 12 user flows. The team currently has 150 unit tests, 30 component tests, and **120 end-to-end tests** — and the suite takes 35 minutes to run on CI. The lead engineer asks you to propose a target distribution.

Answer:

1. What target distribution would you propose (numbers across all three tiers)?
2. How would you decide which of the 120 e2e tests to keep, and which to delete or convert to component tests? Give the criteria, not the per-test verdict.
3. Estimate the new CI runtime if your proposal were adopted, assuming 5 ms / unit test, 50 ms / component test, 3 s / e2e test, and 4 parallel workers.
4. What is the first test you would ask the team to write that they do not currently have?

---

## Problem 5 — Read the Kent C. Dodds essays (60 minutes)

Read these three essays end to end. For each, write one paragraph (4–6 sentences) summarizing the argument and citing the most-quoted line.

1. **"Write tests. Not too many. Mostly integration."** <https://kentcdodds.com/blog/write-tests>
2. **"Testing Implementation Details"** <https://kentcdodds.com/blog/testing-implementation-details>
3. **"Common mistakes with React Testing Library"** <https://kentcdodds.com/blog/common-mistakes-with-react-testing-library>

Then write a fourth paragraph: name one mistake from the third essay that you have made in your own code (be honest), and how you would refactor.

---

## Problem 6 — CI YAML walkthrough (45 minutes)

Take the GitHub Actions workflow from lecture 3 (or the one in `mini-project/starter/.github/workflows/test.yml`). Annotate **every step** in your own words. The annotation should:

- Explain what the step does.
- Explain why it is in this position (could it be moved earlier or later?).
- Identify any step that could be cached, parallelized, or removed.

Submit the annotated YAML as a code block. The annotations go in YAML comments above each step.

Then answer:

1. The "Install Playwright browsers" step is `npx playwright install --with-deps`. What does `--with-deps` add? Cite the docs.
2. The artifact upload uses `if: always()`. Why is this important?
3. Suppose the suite grows to 25 minutes. How would you shard it? Give the workflow YAML diff.

---

## Submission

A single Markdown file at `homework/week-11.md` in your fork. Push to your branch and link the file in the assignment.

## Grading rubric

| Criterion | Weight |
|-----------|--------|
| Problem 1: rewrite is robust, four+ reasons identified | 15% |
| Problem 2: tier choices are correct and justified | 15% |
| Problem 3: side-by-side comparison shows understanding | 15% |
| Problem 4: e2e budget is defensible | 20% |
| Problem 5: essay summaries are accurate, self-reflection is honest | 15% |
| Problem 6: YAML annotations show understanding of every step | 20% |

A 90%+ grade requires explicit citations (URLs to docs or essays) on every answer where it is appropriate.
