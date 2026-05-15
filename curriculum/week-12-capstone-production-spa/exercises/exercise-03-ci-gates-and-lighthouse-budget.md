# Exercise 03 — CI Gates and the Lighthouse Budget

> *The Saturday exercise. Wire two GitHub Actions workflows that run on every push and PR, add a Lighthouse budget that fails the CI on a regression, and confirm the green badge appears in the README. Cap: 3 hours.*

## Goal

By the end of this exercise:

1. `.github/workflows/test.yml` runs Vitest and Playwright on every push and PR.
2. `.github/workflows/lighthouse.yml` runs Lighthouse CI against the Vercel preview URL on every PR.
3. `lighthouserc.json` declares the score budget — Performance 90+, Accessibility 95+, Best Practices 95+, SEO 90+.
4. Branch protection on `main` requires both workflows to pass.
5. The CI badge is in the top of `README.md`.
6. A deliberately failing PR is rejected by the CI; the merge button is greyed out.

## Why this exercise

Without a CI gate, the test suite is **trust-based**: every team member promises to run tests locally before pushing. Trust-based testing is the leading cause of regressions in real teams. The CI gate is the **enforcement layer**: even a contributor who forgets to run tests cannot merge a regression. This exercise installs the gate and verifies it works by trying to bypass it.

## Prerequisites

- Exercise 02 complete — the four-route auth-protected SPA is deployed.
- Some Vitest and Playwright tests already exist (carry-over from W11 or written this week).
- The repo is **public** (GitHub Actions free minutes are higher on public repos).

## Steps

### Step 1 — Create `.github/workflows/test.yml` (30 min)

In the repo root:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/test.yml`:

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
      - run: npm run lint --if-present
      - run: npm run typecheck --if-present
      - run: npm run test -- --coverage --reporter=verbose
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: vitest-coverage
          path: coverage/
          retention-days: 7

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

Add `package.json` scripts if they do not already exist:

```json
{
  "scripts": {
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

Commit and push:

```bash
git add .github/workflows/test.yml package.json
git commit -m "ci: add Vitest and Playwright workflow"
git push origin main
```

### Step 2 — Confirm the workflow runs and passes (10 min)

Visit `https://github.com/your-handle/your-repo/actions` in the browser. The workflow should be running on the latest push.

Wait 3-8 minutes for completion. Both `vitest` and `playwright` jobs should turn green.

**If a job fails**, click into the failure and read the log:

- Vitest failure usually means a test failed on CI but not locally — often a timezone, locale, or randomness issue. Pin or mock the unstable input.
- Playwright failure usually means a selector did not match — check `playwright-report/` artifact for the trace.

### Step 3 — Create `lighthouserc.json` (10 min)

In the repo root:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "chromeFlags": "--no-sandbox"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

The `assertions` block fails the CI on any score below the budget. The three explicit metric assertions (LCP, CLS, TBT) catch regressions even when the overall category score happens to still pass.

### Step 4 — Create `.github/workflows/lighthouse.yml` (20 min)

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse

on:
  pull_request:

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Build site
        run: npm run build
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.13.x
          lhci autorun --collect.staticDistDir=./dist
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

This variant runs Lighthouse against the **built `dist/`** locally on the CI runner, which is simpler than waiting for the Vercel preview URL. The trade-off is that the result reflects the static build, not the CDN-served build — for a capstone, the difference is small.

If you prefer to test against the live Vercel preview, replace the last step with:

```yaml
      - name: Wait for Vercel preview
        id: preview
        uses: zentered/vercel-preview-url@v1
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        with:
          vercel_project_id: ${{ secrets.VERCEL_PROJECT_ID }}
      - run: lhci autorun --collect.url=https://${{ steps.preview.outputs.preview_url }}
```

Set `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` as repo secrets first.

Commit and push:

```bash
git add lighthouserc.json .github/workflows/lighthouse.yml
git commit -m "ci: Lighthouse budget and PR check"
git push origin main
```

### Step 5 — Enable branch protection (10 min)

1. Go to the repo's Settings → Branches.
2. Click "Add branch protection rule" (or "Add classic rule").
3. Branch name pattern: `main`.
4. Check "Require status checks to pass before merging."
5. Check "Require branches to be up to date before merging."
6. In the search box for required checks, search and add:
   - `vitest`
   - `playwright`
   - `lighthouse` (will appear after the first PR triggers it)
7. Optionally check "Require pull request reviews before merging" (one approval).
8. Save.

The `lighthouse` check will not appear in the search until at least one PR has triggered it. After Step 6 below, return here and add it.

### Step 6 — Trigger a real PR (15 min)

Create a feature branch and open a PR:

```bash
git checkout -b feat/ci-test-pr
echo "// Test PR — remove me" >> src/main.tsx
git add src/main.tsx
git commit -m "test: trigger CI on a real PR"
git push -u origin feat/ci-test-pr
gh pr create --title "test: trigger CI on a real PR" --body "Confirms the CI workflows run on PRs and gate the merge."
```

Open the PR in the browser. The Actions tab should show all three workflows running.

Wait for completion. All three should pass (the test PR is trivial).

If `lighthouse` is now in the list of available status checks on the branch protection page, add it and save.

### Step 7 — Add the CI badge to the README (5 min)

Insert at the top of `README.md`, under the title:

```markdown
[![Test](https://github.com/your-handle/your-repo/actions/workflows/test.yml/badge.svg)](https://github.com/your-handle/your-repo/actions/workflows/test.yml)
[![Lighthouse](https://github.com/your-handle/your-repo/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/your-handle/your-repo/actions/workflows/lighthouse.yml)
```

Replace `your-handle/your-repo` with your actual repo slug. Commit on the PR branch:

```bash
git add README.md
git commit -m "docs: CI badges in README"
git push
```

The PR should re-trigger the CI and pass.

### Step 8 — Confirm the gate works (15 min)

This is the real test. Push a deliberately failing test to the PR:

```typescript
// Add this to any .test.ts file
it("fails on purpose to confirm the gate works", () => {
  expect(1 + 1).toBe(3);
});
```

```bash
git add -A
git commit -m "test: deliberate failure to confirm CI gate"
git push
```

Wait for the workflow to run. `vitest` should fail (red X). The merge button on the PR page should be **disabled** with a message like "Required status check 'vitest' failed."

If you can still merge with a failing check, branch protection is misconfigured. Re-check the rule.

Remove the failing test:

```bash
git revert --no-edit HEAD
git push
```

Confirm the workflow re-runs green and the merge button is now enabled.

### Step 9 — Merge the test PR (5 min)

Once green, merge:

```bash
gh pr merge --squash --delete-branch
```

Or use the GitHub UI. Confirm the badge on `main` is now green.

### Step 10 — Optional: add Dependabot (10 min)

While you are in CI mode, configure Dependabot to keep dependencies fresh:

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
```

Commit and push. Dependabot will start opening PRs for outdated dependencies; each PR triggers your CI, so you know within minutes if an upgrade breaks anything.

## Acceptance criteria

This exercise is complete when:

- [ ] `.github/workflows/test.yml` exists and runs Vitest + Playwright on push and PR.
- [ ] `.github/workflows/lighthouse.yml` exists and runs Lighthouse CI on PRs.
- [ ] `lighthouserc.json` declares the score budget.
- [ ] Branch protection on `main` requires all three workflows to pass.
- [ ] The CI badges appear at the top of the README and are green.
- [ ] A PR with a failing test is rejected by the CI; the merge button is disabled.
- [ ] A revert of the failing test makes the PR mergeable again.

## Common mistakes

- **`npm ci` fails because `package-lock.json` is gitignored.** It must not be — `package-lock.json` is committed to the repo and is what `npm ci` reads.
- **Playwright on CI is missing system dependencies.** The `--with-deps` flag installs them. Without it you see errors like "missing libnss3.so."
- **The Vercel preview URL is not yet ready when Lighthouse runs.** Use the `staticDistDir` approach (Step 4 default) for simplicity, or add a `Wait for Vercel preview` step with a longer timeout.
- **The Lighthouse budget is too strict for a real-world app.** A new SPA can typically hit 95/95/95/95 on desktop. If you cannot, reduce the budget to 90/90/90/90 and tighten later.

## Time budget

3 hours. If you spend less than 2, you skipped the verification step (Step 8); go back and break the test on purpose. The point of CI is the gate; the gate must be tested.

## What to do next

This exercise concludes Saturday. Sunday's work — README, walkthrough, submission — picks up from the green CI badge.
