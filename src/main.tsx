import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SystemProvider } from './engines/SystemEngine.tsx';
import './index.css';

// The iOS "Add to Home Screen" standalone shell caches the app aggressively
// and has no built-in way to notice a new deploy — reopening the icon can
// keep running old code (and reading/writing storage under old version-gated
// keys) indefinitely. version.json is fetched fresh (cache:'no-store') on
// every load and compared to the version baked into THIS bundle at build
// time; a mismatch means a newer build is live, so we force a real network
// navigation (not just location.reload(), which can itself be served from
// cache) to pick it up. Guarded by sessionStorage so a version we already
// tried once this session doesn't force a reload loop (e.g. if version.json
// itself is being served stale by a CDN edge).
async function checkForNewDeploy() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const { version } = await res.json();
    const alreadyAttempted = sessionStorage.getItem('renaser_update_attempted');
    if (version && version !== __BUILD_VERSION__ && version !== alreadyAttempted) {
      sessionStorage.setItem('renaser_update_attempted', version);
      window.location.href = `${window.location.pathname}?v=${version}`;
    }
  } catch {
    // Offline or blocked — keep running on whatever is already loaded.
  }
}
checkForNewDeploy();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemProvider>
      <App />
    </SystemProvider>
  </StrictMode>,
);
