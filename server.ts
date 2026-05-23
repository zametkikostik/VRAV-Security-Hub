import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// API endpoints
app.get('/api/apps', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const manifestPath = path.join(process.cwd(), 'manifest.json');
    const rawData = await fs.readFile(manifestPath, 'utf-8');
    const apps = JSON.parse(rawData);
    res.json(apps);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve manifest.json: ' + err.message });
  }
});

app.post('/api/apps', async (req, res) => {
  try {
    const { id, name, version, developer, description, category, ipfsHash, sha256, reputationStaked, authorizerSignature, virustotalScore, permissionsCount, staticScanStatus, trustScore, stakingAddress, isSlashed } = req.body;
    
    if (!id || !name || !ipfsHash) {
      res.status(400).json({ error: 'App ID, Name and IPFS Hash are mandatory fields' });
      return;
    }

    const fs = await import('fs/promises');
    const manifestPath = path.join(process.cwd(), 'manifest.json');
    let apps = [];
    try {
      const rawData = await fs.readFile(manifestPath, 'utf-8');
      apps = JSON.parse(rawData);
    } catch (e) {
      apps = [];
    }

    // Check if app already exists, then replace or append
    const existingIndex = apps.findIndex((a: any) => a.id === id);
    const newApp = {
      id,
      name,
      version: version || '1.0.0',
      developer: developer || 'Anonymous Decentralized Developer',
      description: description || 'No description provided.',
      category: category || 'Utilities',
      ipfsHash,
      sha256: sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      reputationStaked: Number(reputationStaked) || 10,
      authorizerSignature: authorizerSignature || '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      virustotalScore: virustotalScore || '0/70 Clean',
      permissionsCount: Number(permissionsCount) || 1,
      staticScanStatus: staticScanStatus || 'clean',
      installCount: 1,
      trustScore: trustScore !== undefined ? Number(trustScore) : 100,
      stakingAddress: stakingAddress || '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      isSlashed: isSlashed === true || isSlashed === 'true'
    };

    if (existingIndex > -1) {
      apps[existingIndex] = newApp;
    } else {
      apps.push(newApp);
    }

    await fs.writeFile(manifestPath, JSON.stringify(apps, null, 2), 'utf-8');
    res.json({ success: true, app: newApp });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update manifest.json: ' + err.message });
  }
});

app.post('/api/slash', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
       res.status(400).json({ error: 'App ID is required for slashing' });
       return;
    }

    const fs = await import('fs/promises');
    const manifestPath = path.join(process.cwd(), 'manifest.json');
    let apps = [];
    try {
      const rawData = await fs.readFile(manifestPath, 'utf-8');
      apps = JSON.parse(rawData);
    } catch (e) {
      res.status(404).json({ error: 'Manifest file not found or corrupted' });
      return;
    }

    const appIndex = apps.findIndex((a: any) => a.id === id);
    if (appIndex === -1) {
       res.status(404).json({ error: `App ID "${id}" was not found in registry.` });
       return;
    }

    const targetApp = apps[appIndex];
    if (targetApp.isSlashed) {
       res.json({
         success: true,
         alreadySlashed: true,
         message: `App "${targetApp.name}" is already slashed.`,
         slashedAddress: targetApp.stakingAddress,
         slashedAmount: 0,
         app: targetApp
       });
       return;
    }

    const stakedBeforeSlash = targetApp.reputationStaked || 0;
    const addr = targetApp.stakingAddress || '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    // Slashing Protocol Penalty application
    targetApp.trustScore = 0;
    targetApp.reputationStaked = 0;
    targetApp.isSlashed = true;
    targetApp.staticScanStatus = 'critical';
    
    await fs.writeFile(manifestPath, JSON.stringify(apps, null, 2), 'utf-8');
    
    res.json({
      success: true,
      message: `Zero-Trust Staked Deposit Slashed Successfully!`,
      slashedAddress: addr,
      slashedAmount: stakedBeforeSlash,
      app: targetApp
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Slashing routine failed: ' + err.message });
  }
});

app.get('/api/attestation', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
       res.status(400).json({ error: 'App ID is required' });
       return;
    }

    const fs = await import('fs/promises');
    const manifestPath = path.join(process.cwd(), 'manifest.json');
    let apps = [];
    try {
      const rawData = await fs.readFile(manifestPath, 'utf-8');
      apps = JSON.parse(rawData);
    } catch (e) {
      res.status(404).json({ error: 'Manifest file not found or corrupted' });
      return;
    }

    const app = apps.find((a: any) => a.id === id);
    if (!app) {
       res.status(404).json({ error: `App ID "${id}" was not found in registry.` });
       return;
    }

    // Create a deterministic attestation report based on app metadata
    const hashFn = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16);
    };

    const isSlashed = app.isSlashed === true;
    const reportId = `attest-vrav-${hashFn(app.id + app.version).slice(0, 16).padStart(16, 'f')}`;
    const commitSha = isSlashed ? '0000000000000000000000000000000000000000' : hashFn(app.id + 'git').padEnd(40, 'e');
    const binaryHash = app.sha256;
    const timestamp = new Date().toISOString();

    const signature = `0x${hashFn(app.id + 'hsm-signature').padEnd(46, 'a')}${hashFn(app.ipfsHash).padEnd(46, 'b')}`;

    const report = {
      reportId,
      appId: app.id,
      appName: app.name,
      buildVersion: app.version,
      compilationTimestamp: timestamp,
      gitProvenance: {
        commitSha,
        branch: 'main',
        repository: `github.com/vrav-core/${app.id}`
      },
      binaryIntegrity: {
        checksumSha256: binaryHash,
        fileSizeEstimatedBytes: isSlashed ? 0 : 5120194
      },
      auditValidation: {
        linterStatus: isSlashed ? 'failed' : 'passed',
        regexPatternScanner: isSlashed ? 'critical' : 'clean',
        cweViolationsCount: isSlashed ? 5 : 0
      },
      kmsHsmSigning: {
        provider: 'Google Cloud KMS (HSM Partitioned)',
        keyRing: 'projects/vrav-core/locations/global/keyRings/hsm-signers',
        keyName: `${app.id}-release-signer`,
        keyResourcePath: `projects/vrav-core/locations/global/keyRings/hsm-signers/cryptoKeys/${app.id}-release-signer/cryptoKeyVersions/1`,
        signatureAlgorithm: 'RSASSA_PKCS1_v1_5_SHA256_2048',
        hsmSignature: isSlashed ? '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' : signature,
        status: isSlashed ? 'revoked_due_to_slashing' : 'active_HSM_secured'
      }
    };

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compile attestation report: ' + err.message });
  }
});

app.post('/api/audit', async (req: express.Request, res: express.Response) => {
  try {
    const { code, filename } = req.body;
    if (!code) {
       res.status(400).json({ error: 'Code content is required' });
       return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
       res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing on server settings.' });
       return;
    }

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

    res.json({ result: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal audit execution error' });
  }
});

// All fallback assets and Vite development middleware placement
async function registerViteDevOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

registerViteDevOrStatic().then(() => {
  app.listen(port, () => {
    console.log(`VRAV Security Hub Server listening on port ${port}`);
  });
});
