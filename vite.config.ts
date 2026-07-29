import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Stamped fresh on every build/dev-start. main.tsx fetches public/version.json
// (written below, cache:'no-store') and compares it against this baked-in
// value to detect when a newer build is live — see main.tsx for why: the
// iOS "Add to Home Screen" standalone shell caches the app aggressively and
// otherwise never notices a new deploy on its own.
const buildVersion = String(Date.now());
fs.writeFileSync(path.resolve(__dirname, 'public/version.json'), JSON.stringify({ version: buildVersion }));

export default defineConfig(() => {
  return {
    define: {
      __BUILD_VERSION__: JSON.stringify(buildVersion),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
