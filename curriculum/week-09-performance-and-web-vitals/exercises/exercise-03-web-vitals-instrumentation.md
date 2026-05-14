# Exercise 3 — Instrument web-vitals in a Vite project

> Estimated time: 45–60 minutes.
> Prerequisite: Lecture 2 read. A working Vite project (Week 7's portfolio or Week 8's Crunch Library).

---

## Goal

Wire the **`web-vitals`** library into a Vite + React project so that LCP, INP, and CLS are measured on every load. Log them to the console for development; send them to a stub endpoint for the field-data pattern.

The deliverable is a small instrumentation file plus a working stub endpoint that you can verify in DevTools' Network panel. The library does the hard work; you do the integration.

---

## Setup

Pick a Vite project. The Week 8 Crunch Library is the recommended target. Open it in VS Code and confirm `npm run dev` launches.

Install the library:

```bash
npm install web-vitals
```

The package is small (~2 KB minified+gzipped for the basic build, ~4 KB for the attribution build). It has no runtime dependencies.

---

## Step 1 — Basic console logging (15 min)

Create `src/lib/vitals.js`:

```js
// src/lib/vitals.js
// Instrument the three Core Web Vitals plus FCP and TTFB.
// In development, log to console. In production, send to /_analytics.
//
// Reference: https://github.com/GoogleChrome/web-vitals

import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals/attribution";

const isDev = import.meta.env.DEV;

function report(metric) {
  if (isDev) {
    const { name, value, rating, delta } = metric;
    // eslint-disable-next-line no-console
    console.log(`[web-vitals] ${name}: ${value.toFixed(1)} (${rating}, delta ${delta.toFixed(1)})`, metric);
    return;
  }
  // Production: send to a stub analytics endpoint
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    page: location.pathname,
    // Attribution build only:
    element: metric.attribution?.element?.outerHTML?.slice(0, 200),
    loadState: metric.attribution?.loadState,
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/_analytics/web-vitals", body);
  } else {
    fetch("/_analytics/web-vitals", { body, method: "POST", keepalive: true });
  }
}

export function reportWebVitals() {
  onLCP(report);
  onINP(report);
  onCLS(report);
  onFCP(report);
  onTTFB(report);
}
```

Call `reportWebVitals()` from your app's entry point. In a Vite + React project, this is `src/main.jsx`:

```jsx
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { reportWebVitals } from "./lib/vitals.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
```

Run `npm run dev`. Open the page in Chrome. Open DevTools → Console. Within a few seconds you should see:

```text
[web-vitals] FCP: 412.0 (good, delta 412.0)
[web-vitals] TTFB: 31.0 (good, delta 31.0)
[web-vitals] LCP: 612.0 (good, delta 612.0)
```

(Numbers will differ. Localhost is fast.)

INP and CLS report only after interaction or a layout shift. Click something to trigger INP. Open a different route to potentially trigger CLS.

---

## Step 2 — Verify the attribution data (10 min)

The attribution build (the `web-vitals/attribution` import) ships with diagnostic information. Click the logged LCP entry in the console to expand it. Look for:

- `metric.attribution.element` — the actual DOM node that was the LCP candidate.
- `metric.attribution.elementRenderDelay` — the milliseconds of element render delay.
- `metric.attribution.resourceLoadDelay` — the milliseconds of resource load delay.
- `metric.attribution.timeToFirstByte` — the milliseconds of TTFB.

In your notes, screenshot the expanded LCP attribution object and label the four phases by their attribution-field names.

For INP, the attribution includes:

- `metric.attribution.eventType` — the kind of interaction (`click`, `keydown`, etc.).
- `metric.attribution.eventTarget` — the DOM node that received the interaction.
- `metric.attribution.inputDelay` — the milliseconds of input delay.
- `metric.attribution.processingDuration` — the milliseconds of processing time.
- `metric.attribution.presentationDelay` — the milliseconds of presentation delay.

For CLS:

- `metric.attribution.largestShiftTarget` — the element whose shift contributed most.
- `metric.attribution.largestShiftTime` — when the worst shift happened.

Reference: <https://github.com/GoogleChrome/web-vitals#attribution-build>.

---

## Step 3 — Stub the production endpoint (15 min)

To exercise the production path, simulate a deployed environment. There are two ways.

### 3a — Build and preview locally

```bash
npm run build
npm run preview
```

`vite preview` serves the production build on `localhost:4173` (by default). Production builds set `import.meta.env.DEV` to `false`, so the production code path runs: `navigator.sendBeacon("/_analytics/web-vitals", ...)`.

Open the preview URL. Open DevTools → Network. Filter the requests by "vitals". You should see POST requests to `/_analytics/web-vitals` as the vitals fire.

The requests will all 404 (you have no real endpoint). That is fine for the exercise — the point is to verify the integration is wired correctly. In a real deployment you would point the URL at a server route that accepts the JSON body.

### 3b — Add a temporary handler

If you want the requests to succeed, add a tiny stub server. Create `stub-server.js`:

```js
// stub-server.js
import { createServer } from "node:http";

const PORT = 4174;
const log = [];

createServer((req, res) => {
  if (req.method === "POST" && req.url === "/_analytics/web-vitals") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const data = JSON.parse(body);
      log.push({ at: Date.now(), ...data });
      console.log("[stub-server] vital:", data.name, data.value.toFixed(1), data.rating);
      res.writeHead(204);
      res.end();
    });
  } else if (req.method === "GET" && req.url === "/log") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(log, null, 2));
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT, () => console.log(`stub-server listening on :${PORT}`));
```

Run with `node stub-server.js`. Configure Vite's preview to proxy `/_analytics` to `localhost:4174` by editing `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    proxy: {
      "/_analytics": "http://localhost:4174",
    },
  },
});
```

`npm run preview` now proxies the `sendBeacon` requests to your stub server. Open <http://localhost:4174/log> in a separate tab; refresh after browsing the preview to see the collected vitals.

This is the production loop in miniature. In real production, the stub server is your analytics ingestion endpoint (or a service like Vercel Speed Insights that handles the ingestion for you).

---

## Step 4 — Trigger a poor INP intentionally (10 min)

INP only reports after a slow interaction. To trigger one for testing:

Add a button somewhere in your app with a deliberately-slow handler:

```jsx
<button onClick={() => {
  const start = Date.now();
  while (Date.now() - start < 500) {
    // busy-wait 500 ms to simulate a slow handler
  }
}}>
  Trigger slow interaction
</button>
```

Reload. Click the button. Watch the console — within a second or two, an `INP` entry should log with a value around 500 ms and a `poor` rating. The `metric.attribution.eventTarget` should point at the button; `metric.attribution.processingDuration` should be ~500 ms.

Confirm:

| Field | Value |
|-------|------:|
| `metric.value` | ~500 ms |
| `metric.attribution.inputDelay` | small (~10–50 ms) |
| `metric.attribution.processingDuration` | ~500 ms |
| `metric.attribution.presentationDelay` | small |

This is the canonical "the handler is slow" diagnosis. Remove the busy-wait button before shipping.

---

## Step 5 — Reflection (10 min)

Answer in your notes:

1. **The reporting cadence.** The basic `web-vitals` API fires the callback once per metric per page, on a debounced schedule. Why does the library not fire continuously? What happens if the user navigates away after one INP interaction but before the second?

2. **The `sendBeacon` choice.** Why does the production handler use `navigator.sendBeacon` instead of `fetch`? In what scenario would `fetch` lose the report?

3. **The attribution build's cost.** The attribution build adds ~2 KB compressed to the bundle. In what kind of project is the cost worth it? In what kind of project is the basic build enough?

4. **The privacy posture.** The `element.outerHTML` field can leak content. What's the right policy for shipping element HTML in vitals reports — log it? Truncate it? Strip it? Cite an MDN or web.dev source if you can.

---

## Done when

- [ ] `src/lib/vitals.js` exists and exports `reportWebVitals`.
- [ ] `main.jsx` calls `reportWebVitals()`.
- [ ] Three vitals are visible in the dev console when you reload the page.
- [ ] The production build sends `sendBeacon` requests to `/_analytics/web-vitals` (verified in DevTools' Network panel, even if the requests 404).
- [ ] The slow-button experiment produces an INP report with the right attribution fields.
- [ ] The four reflection questions are answered.

---

## Common pitfalls

**1. The library reports nothing.** Make sure you `import { onLCP, onINP, onCLS } from "web-vitals/attribution"` (or from `"web-vitals"` for the basic build). Importing from the wrong path is a common mistake.

**2. INP never fires.** INP requires an interaction. Without a click or keypress, INP is unmeasured and the callback never fires. Always click something before concluding INP is broken.

**3. The dev callbacks fire before render.** Vite's HMR can cause the LCP to fire on the empty shell before React renders. This is mostly a dev-mode artifact; production behaves correctly because the bundle is shipped statically.

**4. `sendBeacon` "fails silently."** `sendBeacon` returns a boolean indicating whether the browser queued the send; it does not tell you whether the server received it. For testing, use the stub server or check DevTools' Network panel.

---

## Stretch (optional)

- Wire your `web-vitals` data to **Vercel Speed Insights** (<https://vercel.com/docs/speed-insights>) if your project is on Vercel. The integration is one line; the dashboard is free.
- Wire your `web-vitals` data to **Cloudflare Web Analytics** (<https://www.cloudflare.com/web-analytics/>). Also free, also one line.
- Add the **`web-vitals` Chrome extension** (<https://chromewebstore.google.com/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma>). The extension shows live vitals as you browse any page. Use it to calibrate intuition on sites you do not own.
- Read **Dominik (TkDodo) — "How to debug slow interactions"** at <https://web.dev/articles/debug-performance-in-the-field> for the deeper attribution patterns.

---

## Reference

- web-vitals on GitHub: <https://github.com/GoogleChrome/web-vitals>
- web-vitals attribution build: <https://github.com/GoogleChrome/web-vitals#attribution-build>
- MDN — `navigator.sendBeacon`: <https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon>
- MDN — `fetch` with `keepalive`: <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch>
- web.dev — Debug performance in the field: <https://web.dev/articles/debug-performance-in-the-field>
