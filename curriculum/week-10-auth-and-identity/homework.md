# Week 10 — Homework

> Six problems. Each problem cites the lecture and/or spec section that contains the answer. Estimate: 6 hours total spread across the week. Write your answers in a single markdown file. The first three problems are short answer; problems 4 through 6 require code and screenshots from your running Keycloak.

---

## Problem 1 — Walk the auth-code-with-PKCE flow in writing

Without copying from the lecture, write out the eight HTTP messages in a successful auth-code-with-PKCE login. For each message:

- Indicate sender and receiver (browser, SPA, IdP, resource server).
- List the key parameters or headers.
- Cite the RFC or spec section that defines the message.

**Suggested length:** 1 page. **Reference:** Lecture 1 §4.1 and Lecture 2 §4; RFC 6749 §4.1; OIDC Core 1.0 §3.1.

---

## Problem 2 — Read RFC 9700 §4 and summarize three risks

[RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html) is the OAuth 2.0 Security Best Current Practice. Read §4 (Attacks and Mitigations). Pick three attacks. For each:

- Name the attack.
- Explain it in one paragraph in your own words.
- State the recommended mitigation.
- Identify whether the mini-project's setup implements the mitigation.

Good picks include §4.10 (redirect-URI manipulation), §4.14 (refresh-token replay), §4.16 (access-token storage), §4.5 (mix-up attack), §4.12 (code injection).

**Suggested length:** 2 pages. **Reference:** RFC 9700 §4 — <https://www.rfc-editor.org/rfc/rfc9700.html#name-attacks-and-mitigations>.

---

## Problem 3 — Sessions vs. JWTs — pick one for a fictional app

You are designing the auth layer for a fictional app with:

- A single-team backend monolith (Postgres + a Python web framework of your choice).
- A React SPA at `app.example.com`.
- A mobile app that talks to the same backend.
- No third-party API consumers.
- An expected scale of "thousands of daily active users" — not millions.

Write 2 to 3 paragraphs:

1. Recommend either server-side sessions or JWTs (or the hybrid BFF pattern).
2. State three concrete reasons for the choice that reference the trade-off matrix from Lecture 3 §1.3.
3. State one concrete reason that argues against your choice — to demonstrate you understand the trade-off honestly.

**Reference:** Lecture 3 §1; RFC 9700 §6.2.

---

## Problem 4 — Decode and verify a Keycloak token

Boot Keycloak locally. Acquire an ID token (the exercises walk you through how). Then:

1. Decode the token's header and payload using your `starter-jwt-decode.ts` (Exercise 1) implementation. Paste the decoded JSON into your homework file.
2. Run the verification step and paste the output (success or error).
3. **Then tamper.** Use the `tamper(token, 'sub', 'someone-else')` helper to alter the `sub` claim. Re-run verification. Paste the error.

The tamper failure is the load-bearing part: the signature verification catches the alteration. **Explain in one paragraph** what would happen in a real application if your verifier did NOT pin the `algorithms` allowlist, given the historic HS256/RS256 confusion attack.

**Reference:** Lecture 2 §3.4; Exercise 1 §3 and §7.

---

## Problem 5 — Trigger refresh-token rotation in your terminal

Using `curl` and `jq`:

1. Acquire an initial token set via the `direct-access-grants` shortcut on the W10 exercise realm (the realm export enables it for `spa-client` for this exercise only).
2. Refresh the token. Record the prefix (first 10 chars) of the old and new refresh tokens. Confirm they are different strings.
3. Reuse the **old** refresh token. Record the IdP's response.
4. Paste the three responses into your homework file.

This is essentially Exercise 2 §§8–9 done deliberately and recorded.

**Reference:** Lecture 3 §3; Exercise 2 §§8–9; RFC 9700 §4.14.

---

## Problem 6 — Add a protected `/admin` route

In the SPA you build in Exercise 3, add a second protected route `/admin` that requires the user to have the `admin` realm role in Keycloak. The flow:

1. Add an `admin` realm role in the Keycloak admin console.
2. Assign it to the seed `alice` user.
3. Modify your `<ProtectedRoute>` to accept an optional `requireRole` prop.
4. In `ProtectedRoute`, read `user.profile.realm_access?.roles` (the way Keycloak exposes realm roles in tokens by default) and check membership. If the user is signed in but lacks the role, render a `<p>403 — not authorized</p>` instead of either the children or the sign-in redirect.

Test:

- Visit `/admin` while signed out → redirected to IdP.
- Visit `/admin` as `alice` after assigning the role → see the admin page.
- Visit `/admin` as `alice` after **removing** the role → see the 403 message.

Paste your modified `ProtectedRoute` source and a screenshot (or text description) of the three test cases.

**Reference:** Lecture 3 §1.4; Keycloak Server Admin Guide — Roles. <https://www.keycloak.org/docs/latest/server_admin/#assigning-permissions-and-access-using-roles-and-groups>.

---

## Submission

A single `homework.md` file containing your answers to all six problems, plus any required code snippets and screenshots referenced from problems 4 through 6. Submit alongside the mini-project.

A passing homework cites at least three RFC section numbers across the six answers and at least one OWASP cheat sheet URL. The point is to demonstrate that you can read and reference the specs, not just summarize lecture notes.

---

## References

- RFC 6749 — OAuth 2.0. <https://datatracker.ietf.org/doc/html/rfc6749>
- RFC 7519 — JWT. <https://datatracker.ietf.org/doc/html/rfc7519>
- RFC 7636 — PKCE. <https://datatracker.ietf.org/doc/html/rfc7636>
- RFC 9700 — OAuth Security BCP. <https://www.rfc-editor.org/rfc/rfc9700.html>
- OIDC Core 1.0. <https://openid.net/specs/openid-connect-core-1_0.html>
- OWASP Authentication Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
- Keycloak Server Administration Guide. <https://www.keycloak.org/docs/latest/server_admin/>
