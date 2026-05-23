import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-audit-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/audit' && req.method === 'POST') {
              try {
                // Read and parse request body
                const body = await new Promise<any>((resolve, reject) => {
                  let chunkData = '';
                  req.on('data', (chunk) => { chunkData += chunk; });
                  req.on('end', () => {
                    try { resolve(JSON.parse(chunkData)); } catch { resolve({}); }
                  });
                  req.on('error', reject);
                });

                const { code, filename } = body;
                if (!code) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Code content is required' }));
                  return;
                }

                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.' }));
                  return;
                }

                // Lazy load GenAI
                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({
                  apiKey: apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build',
                    }
                  }
                });

                const systemPrompt = `You are VRAV Security Hub Deep AI Auditing Agent checking untrusted decentralized applications for backdoors, hidden API channels, command control, reflection, insecure intents, crypto-bypass, or secret key leakage.
Analyze the following source file or config (${filename || 'code'}).
Return a structured audit in clean Markdown. Start with a visual summary card (Security Score out of 100, Overall Risk Status, Major Alerts). Then detail every finding with file context, exact risk description, severity classification (CRITICAL, HIGH, MEDIUM, LOW), and clear remediation code. Make the Markdown visually pristine using beautiful list bullets and blocks. Do not contain general pleasantry or greetings. Keep it highly technical, objective, and dense.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-3.5-flash',
                  contents: [
                    { text: systemPrompt },
                    { text: `Filename: ${filename || 'unnamed'}\n\nCode to analyze:\n\`\`\`\n${code}\n\`\`\`` }
                  ]
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ result: response.text }));
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message || 'Internal audit execution error' }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
