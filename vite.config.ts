import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/** Inject SIWE/admin headers into App.tsx mutation fetches without rewriting the whole monolith. */
function injectAdminHeaders(): Plugin {
  return {
    name: 'inject-admin-headers',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith('/src/App.tsx')) return null;
      if (code.includes("from './lib/adminHeaders'")) return null;

      let next = code.replace(
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

      // Extend AppItem interface for catalog fields
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

      return { code: next, map: null };
    },
  };
}

export default defineConfig({
  plugins: [injectAdminHeaders(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
