# Lecture Note 02 — Security Headers and CSP in Anger

> *Security headers are the cheapest defense in depth available to a web application. They are configuration, not code. They run before any of your JavaScript loads. They are free at every hosting provider. The senior engineer's reading of a deployed URL begins, before anything else, with `curl -I https://your-url` to read the headers.*

The capstone rubric reserves five points for security headers and another five for a working Content-Security-Policy. Those ten points are recoverable in 90 minutes of focused work on Tuesday or Friday. This lecture explains each header, the exact value to ship, the failure mode when the header is missing, and the iterative process for writing a CSP that does not break your app.

The lecture has a strong opinion: **ship the headers in this exact order, with these exact values, on Tuesday, and audit them with Mozilla Observatory before you touch any other production concern.** The Mozilla Observatory (<https://observatory.mozilla.org/>) is a free scanner that grades your URL against the OWASP Secure Headers recommendations; a typical Vite + React + Vercel deploy starts at grade F (no headers) and reaches grade A in two passes of the config file.

---

## Why headers, why now

There is a long history of web vulnerabilities — XSS, CSRF, clickjacking, MIME-type confusion, downgrade attacks, mixed-content scripts — that browsers were unable to defend against until the **server told them how**. The HTTP response header is the channel by which the server gives the browser its instructions. Every modern browser honors the headers. Every modern hosting provider lets you set them in a config file. The pattern is mature, the cost is zero, and the value is real: a missing `Strict-Transport-Security` is the difference between a coffee-shop Wi-Fi attacker reading your tokens and not.

OWASP, the open-source web-security working group, maintains the canonical recommended-headers list at <https://owasp.org/www-project-secure-headers/>. The list grew slowly; the modern minimum is five headers (six if you count CSP separately). Browsers' enforcement, the standardization through the IETF and W3C, and the propagation through hosting-provider defaults have made these the table-stakes hygiene of any 2026 deploy.

The capstone treats headers as **mandatory**. A submission that ships without them caps at 85 on the rubric. A submission that ships with a broken CSP that breaks the app caps at 75 (a broken CSP is worse than no CSP because it crashes the user experience).

---

## The five headers, in order

Set these five headers on Tuesday. Test them with `curl -I https://your-spa.vercel.app` from the terminal; every header should appear in the response. Test them with Mozilla Observatory; the grade should jump from F to A or A+.

### Header 1 — `Strict-Transport-Security`

**Value to ship:** `max-age=63072000; includeSubDomains; preload`

**What it does:** Tells the browser to use HTTPS only for this hostname for the next two years (`max-age=63072000` seconds). After the first visit, the browser refuses to load `http://` URLs from this hostname and silently upgrades them. The `includeSubDomains` directive extends the policy to any subdomain. The `preload` directive declares that you intend to be added to the [HSTS preload list](https://hstspreload.org/), which both Chrome and Firefox bake into their browser builds — so even the **first** visit to your URL is HTTPS-only.

**Failure mode without it:** A coffee-shop Wi-Fi attacker can intercept the first request to `http://your-spa.vercel.app`, return a redirect to a phishing URL, and capture credentials. With HSTS, the browser refuses to make the HTTP request at all.

**On Vercel, in `vercel.json`:**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

**On Netlify, in `netlify.toml`:**

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
```

Reference: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security>.

### Header 2 — `X-Content-Type-Options`

**Value to ship:** `nosniff`

**What it does:** Forbids the browser from guessing the MIME type of a response. The browser uses the `Content-Type` response header verbatim and refuses to render a response with the wrong type. The header kills a category of historical attacks where an attacker uploads a file labeled `image/jpeg` but containing JavaScript, the browser sniffs the content, sees JS, and executes it.

**Failure mode without it:** A user-uploaded file (avatar, attachment) can be made executable as a script by a content-type-confusion attack. This is one of the oldest XSS vectors.

**Cost:** Zero. There is no downside. Set this on every response.

Reference: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options>.

### Header 3 — `Referrer-Policy`

**Value to ship:** `strict-origin-when-cross-origin`

**What it does:** Controls the value of the `Referer` header your browser sends on outbound requests. The named policy sends the full URL when navigating within the same origin, sends only the origin (`https://your-spa.vercel.app`) when navigating to a different origin over HTTPS, and sends nothing on cross-origin HTTP requests.

**Failure mode without it:** The browser's default (in 2026) is `strict-origin-when-cross-origin`, which is the same as the recommended value. But explicitly setting the header is safer because (a) future browser default changes do not affect you, (b) older browsers that have different defaults are pinned to your value, and (c) it makes the intent visible in your code.

**The risk it prevents:** A page at `/reset-password?token=abc123` that links to a third-party CDN-hosted image will, without a strict policy, send `your-spa.vercel.app/reset-password?token=abc123` in the `Referer` header — and the CDN's log file now contains a reset token. The header tells the browser to send just the origin instead.

Reference: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy>.

### Header 4 — `Permissions-Policy`

**Value to ship:** `camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), gyroscope=(), magnetometer=(), usb=(), midi=(), payment=()`

**What it does:** Explicitly disables every browser feature the app does not use. The empty parentheses (`()`) mean "no origins allowed." If your app does not access the camera, the API is unavailable to any script running on the page, including third-party scripts you do not control.

**Failure mode without it:** A compromised third-party dependency could call `navigator.geolocation.getCurrentPosition` and exfiltrate the user's location without the user noticing. With the header, the API throws.

**Discovering what to allow:** Inventory your app's browser-API usage. If the app needs geolocation, change `geolocation=()` to `geolocation=(self)`. Same for any other feature. The default-deny posture is the secure posture.

Reference: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy>.

### Header 5 — `Content-Security-Policy` (its own section below)

This one gets its own section because it is the most important and the most dangerous. Skip to §"Authoring CSP without breaking the app" after the §"Other headers worth knowing" subsection.

### Other headers worth knowing

Three more headers are valuable but not always required:

- **`X-Frame-Options: DENY`** — prevents your page from being embedded in an iframe on another origin. The modern replacement is the `frame-ancestors` directive in CSP, but X-Frame-Options is still respected by older browsers. Cost: zero. Set it unless your app is intentionally embeddable.
- **`Cross-Origin-Opener-Policy: same-origin`** — opens up additional browser security features (`SharedArrayBuffer`, high-resolution `performance.now`). Required if you need those APIs; harmless otherwise.
- **`Cross-Origin-Embedder-Policy: require-corp`** — companion to COOP; required for the same advanced features. Note: setting this aggressively can break third-party embeds.

The capstone rubric does not require COOP/COEP. The rubric does check for `X-Frame-Options` or its CSP equivalent.

---

## Authoring CSP without breaking the app

`Content-Security-Policy` is the most powerful header. It is also the most likely to **break your app** if you write it wrong on the first try. The professional pattern, used by every team that successfully ships CSP, is the **iterative tighten** approach:

1. Deploy in **report-only** mode.
2. Audit the report.
3. Tighten the policy.
4. Promote to enforcing.

The pattern fits a one-week capstone if you start on Tuesday and finish on Friday.

### Step 1 — Deploy CSP in report-only mode

The browser has two CSP headers:

- `Content-Security-Policy` — the **enforcing** header. The browser blocks anything the policy disallows.
- `Content-Security-Policy-Report-Only` — the **monitoring** header. The browser logs what it would have blocked but does not block.

Start with the report-only variant and a permissive policy. The policy below is a reasonable starting point for a Vite + React app with Auth0 and a self-hosted font:

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
font-src 'self';
img-src 'self' data: https:;
connect-src 'self' https://your-tenant.auth0.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

In `vercel.json`:

```json
{
  "key": "Content-Security-Policy-Report-Only",
  "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://your-tenant.auth0.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
}
```

Deploy. Open the deployed URL. Open DevTools → Console. Click through every flow in the app (login, logout, navigate to every route, submit every form).

### Step 2 — Audit the report

The browser logs a message for every blocked or would-be-blocked resource. In Chrome, the Issues panel (`⋮` → More tools → Issues) lists them. Each report names the directive (`script-src`, `connect-src`, `img-src`) and the violating URL.

Example reports you might see:

- `Refused to load the image 'https://cdn.example.com/logo.png' because it violates the following Content Security Policy directive: "img-src 'self' data: https:"` — actually allowed, because `https:` covers all HTTPS sources; ignore this report.
- `Refused to connect to 'https://api.your-backend.com/data' because it violates the following Content Security Policy directive: "connect-src 'self' https://your-tenant.auth0.com"` — you need to add `https://api.your-backend.com` to `connect-src`.
- `Refused to apply inline style because it violates the following Content Security Policy directive: "style-src 'self'"` — you need `'unsafe-inline'` on `style-src` (which the starter policy already includes) or you need to refactor to use nonces.

Add origins to the appropriate directives until the report is clean.

### Step 3 — Common violations and their fixes

- **Inline scripts** — Vite production builds emit very few inline scripts; the main offender is the favicon polyfill or a vendor-injected analytics snippet. Fix: remove the inline script and load it as an external file, or use a nonce.
- **`eval` or `new Function`** — both forbidden by default. Some libraries (older versions of Lodash, certain templating libraries) use them. Fix: upgrade or replace the library. Avoid `'unsafe-eval'` in production.
- **`data:` URIs in images** — Vite emits some image data URIs for small SVGs. Allowed by `img-src 'self' data:`.
- **Inline `<style>`** — CSS-in-JS libraries (`styled-components`, `emotion`) emit inline `<style>` tags by default. Allowed by `'unsafe-inline'` on `style-src`. The clean fix is to use the library's nonce or extraction features, but `'unsafe-inline'` is the pragmatic compromise for a capstone.
- **Web fonts from `fonts.googleapis.com`** — needs `font-src https://fonts.gstatic.com` and `style-src https://fonts.googleapis.com`. The cleaner fix is to self-host the font.
- **Third-party analytics** — Google Analytics needs `script-src https://www.googletagmanager.com` and `connect-src https://www.google-analytics.com`. The cleaner fix for a capstone is to not include analytics.

### Step 4 — Promote to enforcing

When the report is clean for 24 hours of real usage, rename the header from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`. Redeploy. The same policy is now enforcing.

Verify that the app still works end-to-end. If anything breaks, the browser logs `Refused to ...` errors in the console; the fix is to re-add the necessary origin.

### Step 5 — Tighten the policy

The starter policy above is **permissive**. The next two weeks of polish would tighten it:

- Remove `'unsafe-inline'` from `style-src` by switching to a nonce-based approach. Vite has a [build option](https://vitejs.dev/config/build-options.html) for this.
- Constrain `img-src` from `https:` to the specific origins you use.
- Add `report-uri` or `report-to` to receive structured reports from the field, not just the dev console.

For the capstone, the starter policy is sufficient and earns the five rubric points. Tightening further is optional polish.

---

## A full `vercel.json` example with every header

Here is a complete `vercel.json` you can paste into the capstone repo, with placeholders for your domains:

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
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), gyroscope=(), magnetometer=(), usb=(), midi=(), payment=()"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://your-tenant.auth0.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        }
      ]
    },
    {
      "source": "/(.*\\.(js|css|woff2|png|jpg|jpeg|svg|webp|avif))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

The second `headers` block sets aggressive caching on static assets — Vite's content-hashed bundles can safely be cached forever, because a code change produces a new filename.

---

## A full `netlify.toml` example with every header

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), gyroscope=(), magnetometer=(), usb=(), midi=(), payment=()"
    X-Frame-Options = "DENY"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://your-tenant.auth0.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

Both files are roughly 50 lines of configuration. Both give you a grade A on Mozilla Observatory.

---

## Verifying with Mozilla Observatory

Once deployed, paste your URL into <https://observatory.mozilla.org/>. The scanner returns a grade (F through A+) and a per-header breakdown. The targets:

- **A or A+** is the rubric requirement.
- B is acceptable for a minimum-viable submission but loses points.
- Anything below B is a fail.

The Observatory results include actionable advice for every header you are missing. If the grade is B, read the advice, apply the missing header, redeploy, re-scan.

The secondary scanner is `securityheaders.com` (Scott Helme's, free). The two scanners weight slightly differently; use both for cross-validation.

---

## Verifying with `curl`

Headers are visible from the terminal:

```bash
curl -I https://your-spa.vercel.app
```

Output should include every header you set. The `-I` flag asks for the response headers only. If a header you expected is missing, the deploy did not pick up the config file (Vercel and Netlify both need the file in the repo root and the deploy must have run after the file landed).

A useful one-liner for verifying every required header:

```bash
curl -sI https://your-spa.vercel.app | grep -i -E 'strict-transport-security|content-security-policy|x-content-type-options|referrer-policy|permissions-policy|x-frame-options'
```

Six lines of output means all six headers are present. Fewer than six means at least one is missing.

---

## The Mozilla Observatory + curl + Lighthouse verification dance

The full verification routine, done on Tuesday and again on Friday:

1. `curl -I` for the headers — every header present.
2. Mozilla Observatory scan — grade A or A+.
3. SecurityHeaders.com scan — grade A or A+.
4. Lighthouse mobile run — Best Practices 95+.
5. Click through the deployed app — no console errors, no broken features.

The five-step dance takes 10 minutes. Do it Tuesday after the first headers ship, then again Friday after the CSP promotion to enforcing, then once more Sunday before the walkthrough.

---

## What can go wrong, and how to fix it

### CSP breaks the app on the first deploy

**Symptom:** App loads, but interactive features (login, search) fail silently. Console is full of "Refused to ..." errors.

**Fix:** Redeploy with the header renamed to `Content-Security-Policy-Report-Only`. The app works again. Audit the console. Add the missing origins. Re-promote to enforcing.

### The headers are set but the deploy does not show them

**Symptom:** `vercel.json` is in the repo root, looks correct, but `curl -I` shows none of the headers.

**Fix:** Vercel only reads `vercel.json` from the **deployed** branch's repo root. Confirm the file is committed and the deploy ran after the commit. Check the deploy logs on the Vercel dashboard for a JSON parse error in the config file.

### Mozilla Observatory shows grade A but reports CSP as "warning"

**Symptom:** Every header is correct except CSP, which is graded as a warning because of `'unsafe-inline'` on `style-src`.

**Fix:** This is expected. `'unsafe-inline'` on `style-src` is the pragmatic compromise for a Vite + React + CSS-in-JS stack. The A grade is sufficient for the rubric. To reach A+, refactor to nonce-based CSP.

### The app works on localhost but the production CSP breaks the IdP login

**Symptom:** Auth0 login button does nothing in production. Console: "Refused to connect to 'https://your-tenant.auth0.com' because it violates ..."

**Fix:** Add `https://your-tenant.auth0.com` to `connect-src`. If using Auth0's hosted login page, also add `https://your-tenant.auth0.com` to `frame-src`.

---

## Reading

- OWASP Secure Headers Project: <https://owasp.org/www-project-secure-headers/>
- OWASP HTTP Headers Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html>
- MDN, "Content-Security-Policy": <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy>
- `content-security-policy.com` — the interactive builder: <https://content-security-policy.com/>
- Mozilla Observatory: <https://observatory.mozilla.org/>
- Scott Helme's `securityheaders.com`: <https://securityheaders.com/>
- HSTS preload list: <https://hstspreload.org/>

These six links cover everything in this lecture in greater depth. Bookmark them.

---

## Closing

Security headers are the cheapest defense in depth available. Five lines of config, A grade, ten rubric points. The mistake is to defer them to Sunday and discover that the CSP breaks something nontrivial. The discipline is to ship them on Tuesday in report-only mode, watch the report all week, promote to enforcing on Friday, and verify Sunday before the walkthrough. The cost is two hours total over the week; the value is real defense and a real differentiator on the portfolio.

The headers are also a signal in interviews. An interviewer who pulls your live URL into `curl -I` and sees a full set of headers will read it correctly: "this person knows what production looks like." The signal is rare in junior portfolios and is real, defensible engineering work.

Ship the headers Tuesday. Verify with the Observatory. Move on.
