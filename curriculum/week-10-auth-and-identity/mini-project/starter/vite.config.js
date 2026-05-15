// vite.config.js
//
// Pinned to port 5173 (Vite's default) because the Keycloak realm export
// registers exactly that URL as the redirect_uri. If you change this port,
// update the realm export OR the Valid Redirect URIs in the Keycloak admin
// console — exact-string matching is enforced per OAuth 2.1 §1.5.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // No proxy — the SPA talks directly to Keycloak (port 8080) and the
    // resource server (port 3001). CORS is enabled on both.
  },
});
