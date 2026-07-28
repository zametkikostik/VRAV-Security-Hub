import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/** Inject SIWE headers + soft refresh listener into App.tsx monolith. */
function injectAppHardening(): Plugin {
  return {
    name: 'inject-app-hardening',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith('/src/App.tsx')) return null;

      let next = code;

      if (!next.includes("from './lib/adminHeaders'")) {
        next = next.replace(
          "import { SettingsTab } from './components/SettingsTab';",
          "import { SettingsTab } from './components/SettingsTab';\nimport { adminHeaders } from './lib/adminHeaders';"
        );

        next = next.replace(
          `const res = await fetch('/api/slash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId })
      });`,
          `const res = await fetch('/api/slash', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ id: appId })
      });`
        );

        next = next.replace(
          `const response = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pubId,`,
          `const response = await fetch('/api/apps', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          id: pubId,`
        );
      }

      if (!next.includes('downloadUrl?: string')) {
        next = next.replace(
          `  isSlashed?: boolean;
}`,
          `  isSlashed?: boolean;
  downloadUrl?: string;
  hashVerified?: boolean;
  source?: string;
  sha256?: string;
}`
        );
      }

      // Soft refresh: listen for catalog import / slash events
      if (!next.includes('vrav-apps-refresh')) {
        next = next.replace(
          `const [isAppsLoading, setIsAppsLoading] = useState(true);`,
          `const [isAppsLoading, setIsAppsLoading] = useState(true);
  // phase6: soft store refresh without full page reload
  useEffect(() => {
    const reloadApps = () => {
      setIsAppsLoading(true);
      fetch('/api/apps')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setAppsList(data);
        })
        .catch(() => {})
        .finally(() => setIsAppsLoading(false));
    };
    window.addEventListener('vrav-apps-refresh', reloadApps);
    return () => window.removeEventListener('vrav-apps-refresh', reloadApps);
  }, []);`
        );
      }

      return { code: next, map: null };
    },
  };
}

export default defineConfig({
  plugins: [injectAppHardening(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
