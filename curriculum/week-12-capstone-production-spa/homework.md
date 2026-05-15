# Week 12 — Homework

The homework this week is **the capstone**. There is no separate homework assignment; the rubric in `mini-project/starter/rubric.md` is the deliverable. This file enumerates the **mandatory** items the rubric will check, in case you want a tighter checklist to print or paste into your repo's issue tracker.

Print this. Cross items off as you finish them. The order is the order you should do them in.

---

## Monday — scaffold

- [ ] Read `README.md` cover to cover, including the **track wrap-up** sidebar.
- [ ] Read `mini-project/README.md` and the four archetype briefs. **Pick one.**
- [ ] Write a one-paragraph project brief in your repo's `README.md`: data model, 4 routes, IdP, deploy target.
- [ ] `gh repo create my-c8-capstone --public --clone` (or substitute your handle).
- [ ] `npm create vite@latest . -- --template react-ts` (or `--template react` if you prefer plain JS).
- [ ] `git add -A && git commit -m "feat: scaffold Vite + React + TS" && git push origin main`.
- [ ] Add `.nvmrc` pinning Node 20 and a `.gitignore` that excludes `dist/` and `node_modules/`.

## Tuesday — first deploy

- [ ] Sign up for Vercel (or Netlify) using your GitHub account. **Free tier only.**
- [ ] Connect the repo to Vercel. Confirm the first deploy succeeds and the Vite logo renders on `your-spa.vercel.app`.
- [ ] Add `vercel.json` (or `netlify.toml`) with:
  - [ ] The SPA-fallback rewrite (`/(.*)` → `/index.html`).
  - [ ] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
  - [ ] `X-Content-Type-Options: nosniff`.
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`.
  - [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
  - [ ] A `Content-Security-Policy-Report-Only` header (you will promote it to enforcing on Friday).
- [ ] Visit `your-spa.vercel.app/anything-random` — confirm the SPA loads, not a 404.
- [ ] Run Lighthouse mobile on the deployed URL. Note the baseline scores.

## Wednesday — routes and navigation

- [ ] Install React Router: `npm i react-router-dom`.
- [ ] Implement the four routes from your project brief.
- [ ] Each route has its own `<h1>`, a real first paragraph (not Lorem ipsum), and a real `<title>` set via `react-helmet-async` or the `useEffect` pattern.
- [ ] `<header>` with site name and `<nav>` containing four `<a>` links (or `<NavLink>`).
- [ ] `<footer>` with one copy line and a link to the GitHub repo.
- [ ] One skip-link in the first child of `<body>` pointing at `#main`.
- [ ] Refresh on each route — confirm none 404 in production.

## Thursday — auth

- [ ] Pick **one** IdP — Auth0 free tier, GitHub OAuth, or self-hosted Keycloak.
- [ ] Register the app with the IdP. Configure redirect URIs for both `localhost:5173` and `your-spa.vercel.app`.
- [ ] Install the appropriate SDK (`@auth0/auth0-react`, or a GitHub OAuth library, or `oidc-client-ts` for Keycloak).
- [ ] Implement login, logout, and a `/profile` route that displays claims from the ID token.
- [ ] Test the full round-trip on the **deployed URL** (not localhost). Confirm: login button works, profile page shows your name, logout works, session does not survive a browser restart unless you intended that.

## Friday — performance and accessibility

- [ ] Run Lighthouse mobile on the deployed URL.
- [ ] Target scores: **Performance 90+, Accessibility 95+, Best Practices 95+, SEO 90+.**
- [ ] If Performance is under 90, identify the LCP element and apply the cheapest fix (font preload, image `srcset`, defer non-critical JS).
- [ ] If Accessibility is under 95, fix every flagged issue.
- [ ] Run `npm run build` — confirm the total JS bundle is **under 200 KB gzipped** and CSS is **under 50 KB gzipped**.
- [ ] Add `<meta name="description">`, `og:title`, `og:image`, `og:url` per route.
- [ ] Promote the `Content-Security-Policy-Report-Only` to enforcing `Content-Security-Policy`.
- [ ] Run the **Mozilla Observatory** (`observatory.mozilla.org`) on the deployed URL. Target grade: A or higher.

## Saturday — tests and CI

- [ ] Port the Vitest setup from W11 (or scaffold fresh): `npm i -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`.
- [ ] Port the Playwright setup from W11: `npm i -D @playwright/test && npx playwright install`.
- [ ] Write at least **10 Vitest unit/component tests** covering: pure helpers, at least one form component, the profile component.
- [ ] Write at least **5 Playwright e2e tests** covering: home page loads, navigation works, login flow, profile renders, logout works.
- [ ] Add `.github/workflows/test.yml` running Vitest + Playwright on every push and PR. Cache `node_modules`. Upload Playwright report on failure.
- [ ] Add `.github/workflows/lighthouse.yml` running Lighthouse CI against the Vercel preview URL on every PR.
- [ ] Configure branch protection on `main` to require both workflows to pass before merge.
- [ ] Add the CI badge to the top of `README.md`.

## Sunday — README, walkthrough, submission

- [ ] Write the portfolio `README.md` in the repo root. Sections, in order:
  - [ ] One-line elevator pitch.
  - [ ] **Live URL** as the first link.
  - [ ] Screenshot or animated GIF.
  - [ ] One paragraph (60-100 words) on what it does and why.
  - [ ] "Stack" — bullet list of every tool with one-line explanation.
  - [ ] "Track wrap-up" — copy the W1-W12 table from the C8 Week 12 README; check off each row.
  - [ ] "Run it locally" — three commands, no more.
  - [ ] "What I'd build next" — three bullet points.
  - [ ] CI badge near the top.
- [ ] Record a **10-minute walkthrough** on Loom (free under 5 min, longer with .edu account) or OBS + YouTube unlisted.
  - [ ] First 2 minutes: live demo as a user, on the deployed URL.
  - [ ] Next 5 minutes: repo tour and one architectural decision in depth.
  - [ ] Last 3 minutes: what you'd build next.
- [ ] Link the walkthrough at the top of the README.
- [ ] Fill in `mini-project/starter/rubric.md` with your own scores. Be honest. Note any row you lost points on with a one-line explanation.
- [ ] **Submit** to the cohort channel: live URL + repo URL + walkthrough URL + filled-in rubric URL.
- [ ] Take the final exam in `quiz.md` for your own diagnostic. Do not submit it; the rubric is the grade.

---

## Required artifacts in the submission

| Artifact                  | Where it lives                                  | Why it matters                                                |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| Live URL                  | `your-spa.vercel.app` or `your-spa.netlify.app` | The single most important deliverable — it is the demo        |
| GitHub repo URL           | `github.com/your-handle/my-c8-capstone`         | The reviewer reads this; CI badge must be green               |
| Walkthrough URL           | Linked from the top of the repo's `README.md`   | The 10-minute video that explains the work                    |
| Filled rubric             | `rubric.md` in the repo with your scores        | Your self-assessment; the reviewer compares to their own      |
| Deployed `vercel.json` or `netlify.toml` | Repo root                          | The reviewer reads this for the SPA-fallback and headers       |
| Green CI badge            | Top of repo `README.md`                          | The instant visual signal that tests pass                     |
| W1-W12 track-wrap-up table | `README.md`, with checkboxes                   | The integration proof — every week is visible in the repo     |

---

## Constraints — what NOT to do

- **Do NOT** ship behind a private repo. The portfolio is public.
- **Do NOT** disable the CI to make the badge green. A failing CI badge is more honest than a bypassed one.
- **Do NOT** put a real secret in a `VITE_`-prefixed environment variable. Those are bundled into the client JS and visible to every user.
- **Do NOT** roll your own password authentication. Use the IdP. The rubric grades zero on auth if the login is a `<a href="/profile">`.
- **Do NOT** copy a famous design pixel-for-pixel. The portfolio reviewer recognizes the Twitter/Instagram/Spotify clone and discounts the work. Add a real personal twist.
- **Do NOT** wait until Sunday to deploy. The deploy must be working by Tuesday or the week is at risk.
- **Do NOT** force-push to `main` to clean up your commit history. Real iteration is a positive signal; 50+ commits over a week is what a hiring manager wants to see.

---

## Time budget

- Monday: 2-3 hours
- Tuesday: 2-3 hours
- Wednesday: 3-4 hours
- Thursday: 3-4 hours
- Friday: 3-4 hours
- Saturday: 3-4 hours
- Sunday: 2-3 hours

**Total: 18 to 25 hours of focused work.** Less than that is a red flag for under-scoping; more than that is a red flag for scope creep. If you are over budget by Friday, **cut the scope**, do not extend the deadline.

---

## Submission template (paste into the cohort channel)

```text
C8 Capstone Submission — <your name>

Live URL:        https://my-c8-capstone.vercel.app
GitHub repo:     https://github.com/your-handle/my-c8-capstone
Walkthrough:     https://youtu.be/your-unlisted-id (10 min)
Rubric:          https://github.com/your-handle/my-c8-capstone/blob/main/rubric.md
Self-score:      87/100 (lost 5 on CSP, 4 on Performance, 4 on test coverage)
Stack:           Vite + React + TS + React Router + Auth0 + Vitest + Playwright + Vercel
Project brief:   A reading list app that lets you save articles by URL,
                 tag them, mark as read, and export to JSON. Four routes:
                 /list, /add, /tags/:tag, /profile.

Time spent:      22 hours
What I'd build next: PWA offline support + a real backend on Cloudflare Workers
                 + WebSocket for live syncing across devices.
```

Submit the message verbatim once you have the four URLs ready.

---

That is the homework. The rest of the week's content — the lecture notes, the exercises, the challenges — is in service of completing this checklist. Read the lecture notes Monday and Tuesday; work the exercises Wednesday through Friday; take the quiz on Sunday before recording. The capstone is the only graded artifact.
