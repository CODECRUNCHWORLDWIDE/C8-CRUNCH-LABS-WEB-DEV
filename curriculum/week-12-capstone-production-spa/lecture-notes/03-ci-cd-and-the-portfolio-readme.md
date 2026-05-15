# Lecture Note 03 — CI/CD and the Portfolio README

> *Continuous integration is the practice of running every check on every push. Continuous deployment is the practice of shipping every passing commit to production. The two together — CI/CD — are what separates a hobbyist's portfolio from an employable engineer's portfolio.*

The capstone repo has two CI surfaces and one portfolio surface. The CI surfaces are GitHub Actions workflows that run on every push and PR; the portfolio surface is the README that a hiring manager reads first. This lecture covers both, in the order you should set them up: CI on Saturday morning, README on Sunday morning, walkthrough recording on Sunday afternoon.

The thesis: **the README is the resume; the green CI badge is the cover letter.** A reviewer with 200 candidates and 20 minutes will not run `npm install`. They will open the live URL, browse the repo, read the README, look for the badge, and form a verdict. Your job this week is to ensure every one of those four signals is honest and excellent.

---

## Part 1 — The CI workflows

GitHub Actions is free on public repos up to 2,000 minutes per month. The capstone uses maybe 50 minutes per week. The CI cost is zero in dollars and roughly two hours in setup time on Saturday.

The capstone has two workflow files:

- `.github/workflows/test.yml` — runs Vitest + Playwright on every push and PR.
- `.github/workflows/lighthouse.yml` — runs Lighthouse CI against the Vercel preview URL on every PR.

Both files live in the same directory and are written in YAML. Both rely on a small set of well-known actions from the `actions/` and `lhci/` GitHub orgs.

### The `test.yml` workflow

The workflow runs on every push to `main` and on every PR. It installs Node, installs dependencies (cached), runs Vitest, installs Playwright browsers (cached), runs Playwright, and uploads the Playwright HTML report on failure.

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:

jobs:
  vitest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: vitest-coverage
          path: coverage/

  playwright:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium firefox
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

Save this as `.github/workflows/test.yml`. The two jobs run in parallel; Vitest takes 30-60 seconds, Playwright takes 3-8 minutes for the capstone's test count. Total wall time is gated by Playwright.

Three details to internalize:

- **`npm ci`** instead of `npm install`. The `ci` variant installs from `package-lock.json` exactly, refuses to update it, and is the right choice for CI. It is also slightly faster.
- **`if: always()`** on the artifact upload. The artifact uploads even when the test step fails, so you can download the report and debug.
- **`timeout-minutes: 30`** on the Playwright job. A flaky test that hangs forever costs you the same number of CI minutes; the timeout caps the damage.

Reference: <https://playwright.dev/docs/ci-intro>.

### The `lighthouse.yml` workflow

The second workflow runs Lighthouse against the Vercel (or Netlify) preview URL on every PR. It fails the PR if the Performance or Accessibility score drops below the thresholds in `lighthouserc.json`.

```yaml
name: Lighthouse

on:
  pull_request:

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Wait for Vercel preview
        id: preview
        uses: zentered/vercel-preview-url@v1
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        with:
          vercel_project_id: ${{ secrets.VERCEL_PROJECT_ID }}
      - name: Run Lighthouse CI
        run: npx @lhci/cli@0.13.x autorun --collect.url="https://${{ steps.preview.outputs.preview_url }}"
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

The companion config in `lighthouserc.json` at the repo root:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

The `assertions` block is the gate: scores below those thresholds fail the workflow and block the merge.

`numberOfRuns: 3` runs Lighthouse three times and takes the median, which smooths over the variance you would otherwise see between runs.

`upload.target: temporary-public-storage` uploads the full report to a Google-hosted URL the PR comment links to. The "temporary" qualifier means the URL expires after 7 days. For permanent storage, use the [LHCI Server](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/server.md) (self-hosted, free) — out of scope for the capstone.

Reference: <https://github.com/GoogleChrome/lighthouse-ci>.

### Branch protection — the gate that matters

The workflows running is necessary but not sufficient. The workflows must also **block the merge** when they fail. Configure this in GitHub:

1. Go to the repo's Settings → Branches.
2. Click "Add branch protection rule."
3. Branch name pattern: `main`.
4. Check "Require status checks to pass before merging."
5. Search for and add: `vitest`, `playwright`, `lighthouse` (or whatever names your jobs use).
6. Check "Require branches to be up to date before merging."
7. Save.

Now a PR with a red CI cannot be merged. The rubric checks this — open a PR, push a deliberately failing test, and confirm the merge button is disabled.

Reference: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule>.

### The CI badge in the README

Once the workflow is running, GitHub generates a badge URL you can paste into the README:

```markdown
[![Test](https://github.com/your-handle/my-c8-capstone/actions/workflows/test.yml/badge.svg)](https://github.com/your-handle/my-c8-capstone/actions/workflows/test.yml)
```

The badge auto-updates: green when the workflow passes on `main`, red when it fails, gray when it has not run. Paste it as the **first** line of the README, under the title.

Reference: <https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge>.

### Secrets — what goes where

The workflows above reference three secrets:

- `VERCEL_TOKEN` — a personal access token from <https://vercel.com/account/tokens>. Used by the `vercel-preview-url` action to look up the preview URL for the current PR.
- `VERCEL_PROJECT_ID` — the project ID from Vercel's project Settings → General. Tells the action which project to look up.
- `LHCI_GITHUB_APP_TOKEN` — only needed if you install the [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) for status checks. Optional.

Set the secrets in the GitHub repo's Settings → Secrets and variables → Actions. The values are never visible after creation, are encrypted at rest, and are available to workflow runs as `${{ secrets.VERCEL_TOKEN }}`.

**Never commit secrets to the repo.** A leaked token can be detected by GitHub's secret scanning and revoked, but the leak is real and embarrassing. Use the Actions secrets feature.

---

## Part 2 — The portfolio README

The README is the single document the reviewer reads before deciding whether to spend more time. The cohort lead grades the capstone against this README. A hiring manager scrolling LinkedIn opens this README. An interviewer asks "tell me about a project" and you point them at this README.

The cost-benefit math: 90 minutes of writing this README on Sunday morning pays for itself within the first two interview slots. Treat it as the most important deliverable after the live URL.

### Structure

The README is short. The standard structure, in order:

1. **Title** — the project name.
2. **CI badge** — green if all is well.
3. **Hero image or GIF** — a screenshot or animated capture of the deployed app.
4. **One-paragraph elevator pitch** — 50 to 80 words. What it does, who it is for, why it exists.
5. **Live URL** — link, formatted prominently.
6. **Walkthrough video** — link to the 10-minute Loom or YouTube.
7. **Stack** — bullet list of every tool with a one-line "why we picked it" beside each.
8. **Track wrap-up** — the W1-W12 table from the C8 Week 12 README, with checkboxes.
9. **Run it locally** — three commands, no more.
10. **What I would build next** — three bullet points.
11. **License** — usually MIT.

Total length: 400 to 600 words plus a code block and a table. Anything longer and the reader skims; anything shorter and the reader doubts the seriousness.

### A complete README example

Here is a complete, real-shape README for a hypothetical capstone:

```markdown
# Readlist — a personal reading queue

[![Test](https://github.com/your-handle/readlist/actions/workflows/test.yml/badge.svg)](https://github.com/your-handle/readlist/actions/workflows/test.yml)
[![Lighthouse](https://img.shields.io/badge/lighthouse-95%2F100-brightgreen)](https://pagespeed.web.dev/analysis?url=https://readlist.vercel.app)

![Readlist screenshot](./docs/hero.gif)

Readlist is a personal reading-queue SPA. Paste a URL, tag it, mark it read, search it later, export the lot as JSON. Built as the final capstone for the Code Crunch Web Dev track. Auth-protected per user.

**Live URL:** <https://readlist.vercel.app>
**10-minute walkthrough:** <https://youtu.be/your-unlisted-id>

## Stack

- **Vite + React + TypeScript** — the bundler, the UI library, the type system.
- **React Router 6** — four routes; the SPA-fallback rewrite is in `vercel.json`.
- **Auth0** — OAuth 2.1 + PKCE against a free-tier tenant.
- **Zustand** — 3 KB store for the reading list, selectors prevent unnecessary re-renders.
- **localStorage** — persistence; cross-device sync is planned but not built.
- **Vitest + Testing Library** — unit and component tests.
- **Playwright** — end-to-end tests across Chromium and Firefox.
- **Vercel** — free-tier hosting, automatic preview URLs.
- **GitHub Actions** — CI gates merge on test failure; Lighthouse CI runs on every PR.

## Track wrap-up

| Week | Concept                          | Where in this repo                     |
| ---- | -------------------------------- | -------------------------------------- |
| W1   | Semantic HTML                    | `src/routes/*.tsx`                     |
| W2   | Accessible CSS                   | `src/styles/`                          |
| W3   | Responsive layout                | `src/styles/layout.css`                |
| W4   | Modern JavaScript                | All `.ts`/`.tsx` files                 |
| W5   | DOM and events                   | `src/routes/AddItem.tsx`               |
| W6   | Forms and validation             | `src/routes/AddItem.tsx`               |
| W7   | Build tools                      | `vite.config.ts`                       |
| W8   | State and routing                | `src/store/`, `src/router.ts`          |
| W9   | Performance                      | Lighthouse 95/97/100/95 mobile         |
| W10  | Auth                             | `src/auth/`, the `<Auth0Provider>`     |
| W11  | Testing                          | `tests/`, the green badge above        |
| W12  | Production deploy                | `vercel.json`, this README             |

## Run it locally

    npm ci
    cp .env.example .env       # fill in your Auth0 credentials
    npm run dev

Then open <http://localhost:5173>.

## What I would build next

- **Offline support** — service worker + IndexedDB for offline article reading.
- **A real backend** — Cloudflare Workers + Turso (SQLite) for cross-device sync.
- **A browser extension** — a button on every page that adds the URL to Readlist with one click.

## License

MIT. See `LICENSE`.
```

That is 350 words plus a table plus a code block. It tells a hiring manager everything they need in 90 seconds.

### What makes a README excellent

Three patterns separate the strong READMEs from the weak ones:

- **The live URL is on the first scroll.** Not buried at the bottom. Not behind a "Demo" link with a question mark. The first link a reader sees.
- **The screenshot looks like real software.** Not the Vite logo. Not a wireframe. A real screenshot of the real deployed product. Loom and QuickTime can record an animated GIF in 30 seconds; spend that 30 seconds.
- **The "stack" list explains WHY, not just WHAT.** "Zustand for state" tells me nothing. "Zustand — 3 KB store with selectors that prevent unnecessary re-renders" tells me you considered the alternatives and made a defensible choice. The interviewer reads the difference.

What weakens a README:

- **Lorem ipsum.** Replace every word of placeholder copy before the submission deadline.
- **A list of features that does not match the deployed URL.** If the README claims a search feature and the search field is missing, the credibility loss is total.
- **Build instructions that do not work.** Test them on a clean clone before submitting. `npm ci` then `npm run dev` should produce a running app on a fresh machine.
- **Emoji-heavy copy.** Avoid for this submission per the cohort style guide. Plain text is more legible at portfolio-review pace.
- **AI-generated copy that nobody read.** A hiring manager can spot it within two sentences. Write the README yourself.

---

## Part 3 — The 10-minute walkthrough

The walkthrough is the artifact that proves you understand your own code. The video has three sections:

### Minutes 0-2 — the product demo

Open the **deployed URL** in a fresh browser window. Walk through the user-facing flow:

- Land on the home route. Read the heading.
- Click "Sign in." Watch the IdP redirect.
- Sign in with your account.
- Land on the post-login route. Show the profile data.
- Use the main feature (add an item, mark it complete, whatever the archetype is).
- Sign out.

No code. No editor open. Just the deployed product. 2 minutes flat.

### Minutes 2-7 — the architecture tour

Switch to VS Code. Open the repo.

- Show the route file structure (`src/routes/`).
- Open one route and walk through it for 60 seconds.
- Open the state-management file. Explain one slice.
- Open `vercel.json`. Read the rewrite and the headers aloud.
- Open the workflow file. Show the CI is green on `main`.
- Open one test file. Read one test aloud and explain why it tests what it tests.

5 minutes total. Pick the parts of the code you are proudest of; do not try to cover everything.

### Minutes 7-10 — the reflection

Stop sharing the editor. Talk to the camera.

- What was the hardest part of the week, and how did you solve it.
- What you would build next, and why.
- One technical decision you would revisit if you had another week.

3 minutes. Conversational, not scripted. A hiring manager who watches this is reading for the same signals an interviewer reads for: clarity of thought, ownership of decisions, growth mindset.

### Recording mechanics

- **Loom** — easiest. Free plan: 25 videos under 5 minutes (longer with an .edu email and the Education plan). Pro plan: unlimited 10-minute videos. The capstone needs one 10-minute video; either pay the $8 for one month of Pro or split into two 5-minute videos.
- **OBS Studio + YouTube unlisted** — free, no time limit. The setup is more involved (microphone selection, screen-capture region, scene composition), but the result is a real video you own forever. Recommended for engineers who plan to record more than one walkthrough.
- **QuickTime (macOS) + Vimeo or YouTube** — built-in screen recorder; export to MP4; upload as unlisted. Free, no time limit, slightly less polished than Loom or OBS.
- **`asciinema` for the code-tour section** — not appropriate for a portfolio video. Use a real screen recording.

Record in **one take**. Do not edit. A small fumble is fine; a polished, edited video signals more time on production than on engineering. The hiring manager wants to see how you think in real time.

Watch the video back at 1.5x speed once. If it is watchable at 1.5x, ship it. If it is not, re-record.

Upload to YouTube as **unlisted** (not private; not public). Unlisted means the video is accessible to anyone with the link but does not appear in search. Paste the link at the top of the README.

Reference: <https://support.google.com/youtube/answer/157177>.

---

## The full Saturday/Sunday checklist

The two days together are roughly 4-6 hours of work. The sequence:

### Saturday

- [ ] `.github/workflows/test.yml` — push, watch it pass.
- [ ] `.github/workflows/lighthouse.yml` — push, watch it pass.
- [ ] Branch protection on `main` — every workflow required.
- [ ] CI badge in the README.
- [ ] One deliberately failing PR — confirm the merge button is disabled.
- [ ] Close the failing PR.

### Sunday morning

- [ ] Hero screenshot or animated GIF — recorded with QuickTime or Peek.
- [ ] README — written, 400-600 words, structure above.
- [ ] Track wrap-up table — checkboxes filled in honestly.
- [ ] `Run it locally` snippet — tested on a fresh clone.

### Sunday afternoon

- [ ] Walkthrough recorded — single take.
- [ ] Walkthrough uploaded — unlisted YouTube or Loom.
- [ ] Walkthrough linked in the README.
- [ ] Rubric self-assessed in `rubric.md`.
- [ ] Submit to the cohort channel — four URLs.

The week ends here. Close the laptop. The track is over.

---

## Closing

The CI gate makes your code trustworthy. The README makes your work readable. The walkthrough makes your thinking visible. Each of the three is necessary; none is sufficient alone. The three together — green badge, clean README, articulate video — are what a hiring manager pattern-matches as a candidate worth a phone screen.

Spend the Saturday and Sunday on the three artifacts in proportion: 40% on the CI, 40% on the README, 20% on the walkthrough. The CI is the artifact a reviewer trusts implicitly. The README is the artifact a reviewer reads explicitly. The walkthrough is the artifact a reviewer watches if and only if the first two were strong enough to earn the click.

All three together, plus the live URL, plus the public repo, plus the filled rubric — that is the C8 capstone submission. That is the deliverable that proves twelve weeks of work compounded into one shipped product. That is what makes the track worth the time.

Ship.
