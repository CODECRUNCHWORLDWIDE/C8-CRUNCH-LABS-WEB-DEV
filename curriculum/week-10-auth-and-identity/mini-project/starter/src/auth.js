// auth.js — the central UserManager configuration.
//
// This is the file you spend the most time in. The UserManager is the
// oidc-client-ts library's entry point; it owns the user state, the redirect
// to the IdP, the callback parsing, the silent renewal iframe, and the
// signout redirect.
//
// References:
//   - oidc-client-ts: https://github.com/authts/oidc-client-ts
//   - OIDC Core 1.0 §3.1: https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
//   - RFC 7636 (PKCE): https://datatracker.ietf.org/doc/html/rfc7636
//   - RFC 9700 §4.16 (token storage): https://www.rfc-editor.org/rfc/rfc9700.html#name-token-storage-on-the-client

import { UserManager, WebStorageStateStore, Log } from 'oidc-client-ts';

// Useful while developing — set to Log.WARN or Log.NONE for production.
Log.setLogger(console);
Log.setLevel(Log.INFO);

// The Keycloak realm URL. oidc-client-ts fetches the OIDC discovery document
// from ${authority}/.well-known/openid-configuration on first use.
const AUTHORITY = 'http://localhost:8080/realms/crunch';

// YOUR CODE
//
// 1. Configure the UserManager with the values listed in the mini-project README §"What you will fill in".
//
//    Required fields:
//      authority, client_id, redirect_uri, post_logout_redirect_uri,
//      response_type ('code'), scope ('openid profile email'),
//      loadUserInfo (true), userStore, stateStore,
//      automaticSilentRenew (true), silent_redirect_uri.
//
// 2. Add the userStore and stateStore using WebStorageStateStore with sessionStorage.
//
// 3. Construct the UserManager.
//
// 4. Wire event handlers (after construction):
//      userManager.events.addAccessTokenExpiring(() => console.info('[auth] access token expiring soon'));
//      userManager.events.addAccessTokenExpired(() => console.info('[auth] access token expired'));
//      userManager.events.addUserSignedOut(() => console.info('[auth] user signed out at IdP'));
//      userManager.events.addSilentRenewError((err) => console.error('[auth] silent renew error:', err));
//
//    These help you verify silent-renew is firing in DevTools.

const config = {
  // FILL THESE IN
};

export const userManager = new UserManager(config);

// Wire the event listeners HERE.
