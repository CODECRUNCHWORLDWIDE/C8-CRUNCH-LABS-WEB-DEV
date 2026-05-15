// main.jsx — Vite entry point.
//
// This file should not need significant editing. The React app's root mount
// happens here; the application logic lives in App.jsx and the supporting
// files. We deliberately do NOT use React.StrictMode in this starter because
// StrictMode's double-invocation of effects causes the OIDC callback effect
// to fire twice, which produces an "authorization code already used" error
// on the second invocation. The oidc-client-ts library has helpers for this,
// but for clarity in the learning context we just disable StrictMode.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
