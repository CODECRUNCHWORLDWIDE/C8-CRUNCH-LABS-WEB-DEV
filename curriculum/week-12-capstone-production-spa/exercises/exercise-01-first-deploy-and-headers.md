# Exercise 01 — First Deploy and Security Headers

> *The Tuesday exercise. Get a Vite + React + TS scaffold deployed to Vercel free tier, ship the security headers, and verify with Mozilla Observatory. Cap: 90 minutes.*

## Goal

By the end of this exercise you will have:

1. A new public GitHub repo.
2. A Vite + React + TS scaffold committed and pushed.
3. A working Vercel deploy at `your-spa.vercel.app` showing the Vite logo.
4. A `vercel.json` with the SPA-fallback rewrite and all five security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options).
5. A Content-Security-Policy in **report-only** mode (to be promoted later in the week).
6. A Mozilla Observatory scan showing grade A or higher.

## Why this exercise

Every other deliverable this week depends on the deploy being working. The single largest time sink in capstone weeks is "I'll deploy on Sunday after everything works locally" — Sunday comes, the deploy fails, and Sunday becomes a panic. This exercise inverts the schedule: deploy the empty scaffold first, before there is anything to break.

## Prerequisites

- A GitHub account.
- A free Vercel account (sign up at <https://vercel.com> with your GitHub).
- The `gh` CLI signed in (`gh auth login`).
- Node.js 20+ on the path.

## Steps

### Step 1 — Create the repo (5 min)

```bash
gh repo create my-c8-capstone --public --clone
cd my-c8-capstone
```

Replace `my-c8-capstone` with your project name. Keep the repo **public**; the portfolio is public.

### Step 2 — Scaffold Vite + React + TS (5 min)

```bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

Confirm the dev server starts and `http://localhost:5173` renders the Vite logo. Stop the dev server with Ctrl+C.

### Step 3 — First commit (5 min)

```bash
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore
echo "20" > .nvmrc

git add -A
git commit -m "feat: scaffold Vite + React + TS"
git push origin main
```

### Step 4 — Connect to Vercel (10 min)

1. Open <https://vercel.com/new>.
2. Click "Import" next to your repo.
3. Vercel auto-detects "Vite" as the framework. Keep the defaults.
4. Click "Deploy."
5. Wait roughly 30-60 seconds for the first deploy.
6. Click "Visit." You should see the Vite logo at `https://your-spa.vercel.app` (the actual subdomain is auto-generated; you can rename it under Settings → Domains).

If the deploy fails, check:

- The Vercel build log (Project → Deployments → latest → Build Logs). Look for the line `> vite build` and any errors below it.
- The `package.json` has `"build": "vite build"` in the scripts.
- `npm run build` works locally.

### Step 5 — Add `vercel.json` with rewrite and headers (15 min)

Create `vercel.json` in the repo root with the contents below. Replace `your-tenant.auth0.com` later when you add Auth0; for now, the policy is permissive.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), gyroscope=(), magnetometer=(), usb=(), midi=(), payment=()" },
        { "key": "X-Frame-Options", "value": "DENY" },
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        }
      ]
    }
  ]
}
```

Commit and push:

```bash
git add vercel.json
git commit -m "chore: SPA-fallback rewrite and security headers"
git push origin main
```

Wait for Vercel to redeploy (30-60 seconds).

### Step 6 — Verify the rewrite (5 min)

In an incognito browser window, open `https://your-spa.vercel.app/this-route-does-not-exist`.

**Expected:** the Vite logo loads. The hosting layer rewrote the request to `/index.html`, the React app booted, and the router (which does not yet exist) showed the default app.

**If you see a 404 page** from Vercel: the rewrite did not pick up. Check `vercel.json` syntax with a JSON validator. Check the deploy succeeded after committing the file (Project → Deployments → latest).

### Step 7 — Verify the headers with `curl` (5 min)

In a terminal:

```bash
curl -I https://your-spa.vercel.app
```

The output should include:

```
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=(), ...
x-frame-options: DENY
content-security-policy-report-only: default-src 'self'; ...
```

If any header is missing, the deploy did not pick up `vercel.json`. Check the file is in the **repo root**, not in a subdirectory, and that the latest deploy ran **after** the commit.

### Step 8 — Verify with Mozilla Observatory (5 min)

1. Open <https://observatory.mozilla.org/>.
2. Paste `your-spa.vercel.app` (no `https://`) into the scanner.
3. Click "Scan."
4. Wait roughly 30 seconds.

**Expected grade: A or A+.**

If you see grade B or lower, the report names exactly which header is missing or misconfigured. Fix the header in `vercel.json`, redeploy, re-scan.

### Step 9 — Lighthouse baseline (5 min)

1. Open `https://your-spa.vercel.app` in an incognito Chrome window.
2. Open DevTools.
3. Lighthouse tab.
4. Mode: Navigation.
5. Device: Mobile.
6. Categories: all four.
7. Click "Analyze page load."

Note the four scores. For an empty Vite scaffold, expect roughly 95-100 Performance, 95-100 Accessibility, 90-95 Best Practices, 90-95 SEO. These are the baseline you start from on Wednesday.

### Step 10 — Write the project brief (10 min)

In the repo's `README.md` (overwrite the Vite-generated one), write a one-paragraph brief in your own words. Use this template:

```markdown
# My Capstone Project Name

A short tagline.

**Live URL:** https://your-spa.vercel.app
**Status:** Tuesday — scaffold deployed, security headers shipped, project picked.

## What it does

Two to three sentences explaining the application from the user's perspective.

## Project brief

- **Archetype:** task tracker | reading list | expense splitter | micro-CMS
- **Data model:** one sentence about the main entity and its fields.
- **Four routes:** /, /list, /add, /profile (or whatever yours are).
- **IdP:** Auth0 free tier | GitHub OAuth | Keycloak.
- **Deploy target:** Vercel (or Netlify).
- **Persistence:** localStorage | Supabase | Turso.

## Track wrap-up (to be checked off this week)

| Week | Concept | Done? |
| ---- | ------- | ----- |
| W1   | ...     | [ ]   |
... (mirror the C8 W12 README table here)
```

Commit and push.

```bash
git add README.md
git commit -m "docs: project brief and Tuesday status"
git push origin main
```

### Step 11 — Submit Tuesday status (5 min)

Post in the cohort channel:

```
C8 Capstone Day 2 — <your name>

Live URL: https://your-spa.vercel.app
Repo: https://github.com/your-handle/my-c8-capstone
Observatory grade: A
Lighthouse mobile: 98 / 100 / 95 / 92
Archetype picked: reading list
IdP: Auth0
```

Sharing the Tuesday status with the cohort creates social commitment for the rest of the week. Skip this step if you must; do not skip the deploy itself.

## Acceptance criteria

This exercise is complete when:

- [ ] `your-spa.vercel.app` loads the Vite logo.
- [ ] `your-spa.vercel.app/random-route` also loads the Vite logo (rewrite working).
- [ ] `curl -I` shows all five security headers plus the CSP-Report-Only.
- [ ] Mozilla Observatory grades A or A+.
- [ ] Lighthouse mobile shows 90+ on all four categories.
- [ ] The README has a project brief with the archetype picked.

## Common mistakes

- **Forgetting to commit `vercel.json`.** The file must be in the deployed commit.
- **JSON syntax error.** A trailing comma or missing brace causes Vercel to ignore the file silently. Validate with `jq . vercel.json`.
- **Vercel re-deploys to a different URL.** Each preview deploy has its own URL; the **production** URL is the one you want for Observatory. Check Project → Deployments → look for the row labeled "Production."
- **Permission denied on push.** The repo must be one you own. If you forked rather than created, push to your fork.

## Time budget

90 minutes total. If you exceed 120, ask in the cohort channel — most stumbling blocks at this stage are five-minute fixes that look ten times bigger when you are stuck.

## What to do next

This exercise concludes Tuesday. Wednesday's work — routes and navigation — picks up from this deploy. The empty scaffold becomes the four-route app.
