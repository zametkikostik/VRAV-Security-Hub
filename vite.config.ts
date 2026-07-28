import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/** Inject SIWE headers, soft refresh, on-chain slash; strip data monoliths into modules. */
function injectAppHardening(): Plugin {
  return {
    name: 'inject-app-hardening',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith('/src/App.tsx')) return null;

      let next = code;

      // ── Residual: replace inline AppItem + INITIAL_APPS + MOCK_CODE_TEMPLATES ──
      if (!next.includes("from './data/initialApps'") && next.includes('export interface AppItem')) {
        next = next.replace(
          /\/\/ Decoupled mock data[\s\S]*?const INITIAL_APPS: AppItem\[\] = \[[\s\S]*?\n\];\n\n\/\/ Mock Code Templates[\s\S]*?const MOCK_CODE_TEMPLATES = \[[\s\S]*?\n\];\n/,
          `export type { AppItem } from './types/app';\nimport type { AppItem } from './types/app';\nimport { INITIAL_APPS } from './data/initialApps';\nimport { MOCK_CODE_TEMPLATES } from './data/mockCodeTemplates';\n\n`
        );
      }

      // Fallback: only MOCK if interface already stripped elsewhere
      if (
        next.includes('const MOCK_CODE_TEMPLATES = [') &&
        !next.includes("from './data/mockCodeTemplates'")
      ) {
        next = next.replace(
          /\/\/ Mock Code Templates[\s\S]*?const MOCK_CODE_TEMPLATES = \[[\s\S]*?\n\];\n/,
          `import { MOCK_CODE_TEMPLATES } from './data/mockCodeTemplates';\n\n`
        );
      }

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

      // ── AppItem optional catalog fields (if still inline) ────
      if (next.includes('export interface AppItem') && !next.includes('downloadUrl?: string')) {
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

      for (const pat of slashFetchPatterns) {
        if (next.includes(pat)) {
          next = next.replace(
            pat +
              `\n      if (res.ok) {\n        const result = await res.json();`,
            slashReplacement
          );
          break;
        }
      }

      for (const pat of slashFetchPatterns) {
        if (next.includes(pat) && !next.includes('slashAppOnChain(appId)')) {
          next = next.replace(
            pat,
            slashReplacement + `\n      if (true) {\n        const result = slashResult.registry;`
          );
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
