import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/** Inject SIWE headers, soft refresh, and on-chain slash into App.tsx monolith. */
function injectAppHardening(): Plugin {
  return {
    name: 'inject-app-hardening',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith('/src/App.tsx')) return null;

      let next = code;

      // ── imports ──────────────────────────────────────────────
      if (!next.includes("from './lib/adminHeaders'")) {
        next = next.replace(
          "import { SettingsTab } from './components/SettingsTab';",
          "import { SettingsTab } from './components/SettingsTab';\nimport { adminHeaders } from './lib/adminHeaders';"
        );
      }

      if (!next.includes("from './hooks/useSlashApp'")) {
        next = next.replace(
          "import { SettingsTab } from './components/SettingsTab';",
          "import { SettingsTab } from './components/SettingsTab';\nimport { useSlashApp } from './hooks/useSlashApp';"
        );
      }

      // ── AppItem optional catalog fields ──────────────────────
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

      // ── useSlashApp hook inside App() ────────────────────────
      if (!next.includes('useSlashApp()')) {
        next = next.replace(
          `export default function App() {
  const [activeTab, setActiveTab] = useState<'store' | 'audit' | 'staking' | 'settings' | 'pipeline'>('store');`,
          `export default function App() {
  const { slash: slashAppOnChain, onChainEnabled, isPending: isOnChainSlashPending } = useSlashApp();
  const [activeTab, setActiveTab] = useState<'store' | 'audit' | 'staking' | 'settings' | 'pipeline'>('store');`
        );
      }

      // ── soft refresh listener ────────────────────────────────
      if (!next.includes('vrav-apps-refresh')) {
        next = next.replace(
          `const [isAppsLoading, setIsAppsLoading] = useState(true);`,
          `const [isAppsLoading, setIsAppsLoading] = useState(true);
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

      // ── publish still needs adminHeaders if not already ──────
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

      // ── handleTriggerSlash → useSlashApp (on-chain + registry) ──
      // Match both original Content-Type and previously injected adminHeaders()
      const slashFetchPatterns = [
        `const res = await fetch('/api/slash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId })
      });`,
        `const res = await fetch('/api/slash', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ id: appId })
      });`,
      ];

      const slashReplacement = `setSlashingTerminalOutput(prev => [
        ...prev,
        onChainEnabled
          ? '[CHAIN] On-chain slash contract configured — submitting tx if wallet is owner...'
          : '[CHAIN] No VITE_SLASH_CONTRACT_ADDRESS — registry slash only',
      ]);
      const slashResult = await slashAppOnChain(appId);
      const res = {
        ok: true,
        json: async () => slashResult.registry,
      } as Response;
      void res;
      setSlashingTerminalOutput(prev => [
        ...prev,
        slashResult.onChain
          ? \`[CHAIN] On-chain slash tx: \${slashResult.txHash}\`
          : '[CHAIN] Skipped or failed on-chain (not owner / rejected) — registry continues',
        \`[REGISTRY_DAEMON] \${slashResult.message}\`,
      ]);
      if (slashResult.registry) {
        const result = slashResult.registry;`;

      // The original code after fetch is:
      //   if (res.ok) {
      //     const result = await res.json();
      // We need to splice carefully. Replace fetch + if (res.ok) { const result = await res.json();

      for (const pat of slashFetchPatterns) {
        if (next.includes(pat)) {
          next = next.replace(
            pat +
              `
      if (res.ok) {
        const result = await res.json();`,
            slashReplacement
          );
          break;
        }
      }

      // Fallback: only fetch line present without exact if block match
      for (const pat of slashFetchPatterns) {
        if (next.includes(pat) && !next.includes('slashAppOnChain(appId)')) {
          next = next.replace(pat, slashReplacement + `
      if (true) {
        const result = slashResult.registry;`);
        }
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
