import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Terminal, 
  Copy, 
  Check, 
  Search, 
  FileCode, 
  Download, 
  Coins, 
  Lock, 
  Code, 
  AlertCircle, 
  Fingerprint, 
  ExternalLink,
  Cpu,
  Info,
  Globe,
  UploadCloud,
  Key,
  FileText,
  Star
} from 'lucide-react';
import { AppCard } from './components/AppCard';
import { ConsoleOverlay } from './components/ConsoleOverlay';
import { AppDetailsModal } from './components/AppDetailsModal';
import { GITHUB_WORKFLOW_YML, LINTER_SCRIPT_PY, PUBLISH_IPFS_PY } from './data/configTemplates';
import { StoreTab } from './components/StoreTab';
import { AuditTab } from './components/AuditTab';
import { StakingTab } from './components/StakingTab';
import { SettingsTab } from './components/SettingsTab';

declare global {
  interface Window {
    vravIpfsVerifier?: {
      checkGatewayAvailability: (url: string) => Promise<{ online: boolean; latency: number }>;
      validateDownloadedPayloadHash: (data: Uint8Array, expectedSha256: string) => Promise<{ success: boolean; calculatedHash: string }>;
    };
  }
}

// Decoupled mock data for Phase 1 (Decentralized Apps Marketplace)
export interface AppItem {
  id: string;
  name: string;
  version: string;
  developer: string;
  description: string;
  category: string;
  ipfsHash: string;
  reputationStaked: number; // MATIC for Phase 4
  authorizerSignature: string;
  virustotalScore: string;
  permissionsCount: number;
  staticScanStatus: 'clean' | 'warning' | 'critical';
  installCount: number;
  trustScore: number;
  stakingAddress: string;
  isSlashed?: boolean;
}

const INITIAL_APPS: AppItem[] = [
  {
    id: 'vrav-auth',
    name: 'VRAV Multi-Factor Authenticator',
    version: '1.4.2',
    developer: 'VRAV Core Security Group',
    description: 'Decentralized high-security OTP generator employing advanced hardware-backed encryption.',
    category: 'Security',
    ipfsHash: 'QmP9K1wSgxQWbyGv6b9nSTQeC6D68qRqyTzP9PskY2vL6A',
    reputationStaked: 1450,
    authorizerSignature: '0x8f7a...3d9c',
    virustotalScore: '0/72 Clean',
    permissionsCount: 2,
    staticScanStatus: 'clean',
    installCount: 3820,
    trustScore: 100,
    stakingAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    isSlashed: false
  },
  {
    id: 'p2p-wallet',
    name: 'Aetheria P2P Wallet',
    version: '0.9.8',
    developer: 'Aetheria Labs',
    description: 'Non-custodial, peer-to-peer crypto assets wallet with automated gas optimizer and staking support.',
    category: 'Finance',
    ipfsHash: 'QmR4k2AsuX7yBY6mTv5bQPeR7xZyyK5RpqTWNskaX2vH9B',
    reputationStaked: 500,
    authorizerSignature: '0x2a5d...7e91',
    virustotalScore: '1/70 Informational',
    permissionsCount: 4,
    staticScanStatus: 'warning',
    installCount: 1290,
    trustScore: 85,
    stakingAddress: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    isSlashed: false
  },
  {
    id: 'ipfs-chat',
    name: 'DecentraChat Secure',
    version: '2.1.0',
    developer: 'Federated Devs',
    description: 'End-to-end encrypted messaging tool operating purely over LibP2P and decentralized nodes.',
    category: 'Communication',
    ipfsHash: 'QmY8T3LswBYu6PkaR7xB6SqeQD68qRqyTzP9PskY2vF9K',
    reputationStaked: 980,
    authorizerSignature: '0xc8b2...01af',
    virustotalScore: '0/68 Clean',
    permissionsCount: 3,
    staticScanStatus: 'clean',
    installCount: 2450,
    trustScore: 98,
    stakingAddress: '0x90F8bf65DCCf190e30076a4aa3bf8340d0460c1E',
    isSlashed: false
  },
  {
    id: 'vulnerable-file-mgr',
    name: 'NodeExplorer Express',
    version: '1.0.3-beta',
    developer: 'ShadowyCoder77',
    description: 'Highly permissive explorer tool for managing files. Warning: Dynamic file executions enabled.',
    category: 'Utilities',
    ipfsHash: 'QmX5t9A8uB8CDe8eFx1bSTQeT958qRqyTzP9PskY2vL5M',
    reputationStaked: 25,
    authorizerSignature: '0xdead...beef',
    virustotalScore: '8/69 Malicious',
    permissionsCount: 12,
    staticScanStatus: 'critical',
    installCount: 350,
    trustScore: 12,
    stakingAddress: '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
    isSlashed: false
  }
];

// Mock Code Templates for Phase 2 (AI Static Analysis Linter)
const MOCK_CODE_TEMPLATES = [
  {
    id: 'backdoor',
    name: 'BackdoorActivity.java (Dangerous)',
    filename: 'BackdoorActivity.java',
    type: 'Java',
    description: 'Contains covert remote executions, command patterns, and leaky hardcoded credential states.',
    content: `package com.vrav.securehub.app;

import android.app.Activity;
import android.os.Bundle;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class BackdoorActivity extends Activity {
    // 🚩 HARDCODED API KEY DETECTED!
    private static final String SYSTEM_BACKDOOR_TOKEN = "vrav_sec_8ca3f24b10294daef8c728d10b83ef3c";
    private static final String COVERT_API_ENDPOINT = "https://covert.vrav-sec.su/api/v1/telemetry";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 🚩 COVERT REFLECTION ACTION SETUP
        triggerHiddenCommand("com.vrav.securehub.exploit.Helper", "exploitMethod");
        
        // 🚩 RUNNING SYSTEM COMMANDS DYNAMICALLY
        executeShellCommand("rm -rf /data/data/com.vrav.securehub.app/databases");
    }

    private void triggerHiddenCommand(String className, String methodName) {
        try {
            Class<?> clazz = Class.forName(className);
            java.lang.reflect.Method method = clazz.getMethod(methodName);
            method.invoke(null);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void executeShellCommand(String cmd) {
        try {
            // 🚩 EXTREMELY DANGEROUS DESERIALIZED SYSTEM COMMAND EXECUTION
            Runtime.getRuntime().exec(new String[]{"/system/bin/sh", "-c", cmd});
        } catch (Exception e) {
            // Suppressed exception - signature of anti-debug / malware
        }
    }
}`
  },
  {
    id: 'ssl-bypass',
    name: 'InsecureNetClient.kt (SSL Bypass)',
    filename: 'InsecureNetClient.kt',
    type: 'Kotlin',
    description: 'Demonstrates Custom X509 TrustManager bypass which permits wiretapping/MITM attacks.',
    content: `package com.vrav.securehub.net

import java.security.SecureRandom
import javax.net.ssl.*
import java.security.cert.X509Certificate

class InsecureNetClient {
    // 🚩 HARDCODED AWS SECRET
    private val awsClientSecret = "AKIAIOSFODNN7EXAMPLE/wJalrXUtnFEMI/K7MDENG/bPxRfiCY"

    fun initClient() {
        val trustAllCerts = arrayOf<TrustManager>(object : X509TrustManager {
            override fun getAcceptedIssuers(): Array<X509Certificate>? = null
            
            // 🚩 SILENT EXCEPTION OVERRIDE: Trust all certificates blindly
            override fun checkClientTrusted(chain: Array<X509Certificate>?, authType: String?) {}
            override fun checkServerTrusted(chain: Array<X509Certificate>?, authType: String?) {}
        })

        val sc = SSLContext.getInstance("SSL")
        sc.init(null, trustAllCerts, SecureRandom())
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.socketFactory)
        
        // 🚩 HOSTNAME VERIFIER DISABLED!
        HttpsURLConnection.setDefaultHostnameVerifier { _, _ -> true }
    }
}`
  },
  {
    id: 'manifest',
    name: 'AndroidManifest.xml (Permissions Abuse)',
    filename: 'AndroidManifest.xml',
    type: 'XML',
    description: 'Highlights wide-open broadcast receivers and excessive core-layer permissions.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vrav.decentralized.app">

    <!-- 🚩 DANGEROUS PERMISSION: ACCESS FINE LOCATION WITHOUT CONSENT -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <!-- 🚩 SYSTEM ROOT SCOPE PRIVILEGES REQUEST -->
    <uses-permission android:name="android.permission.WRITE_SETTINGS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="DecentraNode">
        
        <!-- 🚩 EXPOSED BROADCAST RECEIVER THAT CAN BE TRIGGERED OUTSIDE -->
        <receiver android:name=".CoreCommandReceiver" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="com.vrav.command.TRIGGER_BACKDOOR" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
  },
  {
    id: 'secure-crypto',
    name: 'SecureCryptoVault.kt (Pristine Standard)',
    filename: 'SecureCryptoVault.kt',
    type: 'Kotlin',
    description: 'Fully compliant cryptographic storage utilizing Android Keystore and strong transformation algorithms.',
    content: `package com.vrav.securehub.crypto

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class SecureCryptoVault {
    private val provider = "AndroidKeyStore"
    private val keyAlias = "VRAV_Core_Signing_Key"

    init {
        val keyStore = KeyStore.getInstance(provider).apply { load(null) }
        if (!keyStore.containsAlias(keyAlias)) {
            val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, provider)
            keyGenerator.init(
                KeyGenParameterSpec.Builder(
                    keyAlias,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                ).setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                 .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                 .build()
            )
            keyGenerator.generateKey()
        }
    }

    fun encryptData(plainText: String): ByteArray {
        val keyStore = KeyStore.getInstance(provider).apply { load(null) }
        val secretKey = keyStore.getKey(keyAlias, null) as SecretKey
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)
        return cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))
    }
}`
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'store' | 'audit' | 'staking' | 'settings' | 'pipeline'>('store');
  
  // Market states
  const [appsList, setAppsList] = useState<AppItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [installStatus, setInstallStatus] = useState<'idle' | 'pulling' | 'verifying' | 'success'>('idle');
  const [installTerminalOutput, setInstallTerminalOutput] = useState<string[]>([]);
  const [selectedGateway, setSelectedGateway] = useState('https://cloudflare-ipfs.com');
  const [gatewayStatus, setGatewayStatus] = useState<'unchecked' | 'checking' | 'online' | 'error'>('online');
  const [gatewayLatency, setGatewayLatency] = useState<number | null>(135);

  // Redesign extensions
  const [isAppsLoading, setIsAppsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Playground Publisher State (Phase 3)
  const [pipelineSubTab, setPipelineSubTab] = useState<'build' | 'staking'>('build');
  const [pubId, setPubId] = useState('vrav-dns-guard');
  const [pubName, setPubName] = useState('VRAV Dec-DNS Threat Guard');
  const [pubVersion, setPubVersion] = useState('1.0.5');
  const [pubDeveloper, setPubDeveloper] = useState('VRAV Core Security Group');
  const [pubDescription, setPubDescription] = useState('Monitors secure DNS routing tables recursively over decentralized DHT tables.');
  const [pubCategory, setPubCategory] = useState('Security');
  const [pubCode, setPubCode] = useState('package com.vrav.securehub.dns;\n\npublic class DNSGuard {\n    // Standard secure compliance implementation avoiding system overrides\n}');
  const [pubRep, setPubRep] = useState(1200);
  const [isCheckedOk, setIsCheckedOk] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishTerminalOutput, setPublishTerminalOutput] = useState<string[]>([]);
  
  // Analyzer states
  const [selectedTemplateId, setSelectedTemplateId] = useState('backdoor');
  const [customCode, setCustomCode] = useState(MOCK_CODE_TEMPLATES[0].content);
  const [fileName, setFileName] = useState(MOCK_CODE_TEMPLATES[0].filename);
  const [scanTypeSecrets, setScanTypeSecrets] = useState(true);
  const [scanTypeDangerousApi, setScanTypeDangerousApi] = useState(true);
  const [scanTypeReflection, setScanTypeReflection] = useState(true);
  const [isLinterRunning, setIsLinterRunning] = useState(false);
  const [localLinterResults, setLocalLinterResults] = useState<{
    score: number;
    issues: { line: number; rule: string; msg: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO' }[];
  } | null>(null);
  
  // AI Deep Scan state
  const [runAIDeepScan, setRunAIDeepScan] = useState(true);
  const [aiAuditReport, setAiAuditReport] = useState<string>('');
  const [aiAuditError, setAiAuditError] = useState<string>('');
  const [scannedOnce, setScannedOnce] = useState(false);

  // Copy-paste status indicator
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  // Reputation & Slashing simulation state (Phase 4)
  const [slashingTerminalOutput, setSlashingTerminalOutput] = useState<string[]>([]);
  const [isSlashingActive, setIsSlashingActive] = useState(false);
  const [stakeFilter, setStakeFilter] = useState<'all' | 'staked' | 'slashed'>('all');

  // Phase 5 Cloud-Signer / HSM & Attestation Report states
  const [selectedAttestationAppId, setSelectedAttestationAppId] = useState<string | null>(null);
  const [attestationReport, setAttestationReport] = useState<any | null>(null);
  const [isAttestationLoading, setIsAttestationLoading] = useState(false);
  const [isAttestationVerifying, setIsAttestationVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'git_proof' | 'linter_eval' | 'stake_check' | 'hsm_sign' | 'complete'>('idle');
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleOpenAttestation = async (appId: string) => {
    setSelectedAttestationAppId(appId);
    setIsAttestationLoading(true);
    setVerificationStep('idle');
    try {
      const res = await fetch(`/api/attestation?id=${encodeURIComponent(appId)}`);
      if (res.ok) {
        const data = await res.json();
        setAttestationReport(data);
      } else {
        console.error("Failed to load attestation report");
      }
    } catch (err) {
      console.error("Attestation report fetch error", err);
    } finally {
      setIsAttestationLoading(false);
    }
  };

  const handleStartAttestationVerification = async () => {
    setIsAttestationVerifying(true);
    setVerificationStep('git_proof');
    await new Promise(r => setTimeout(r, 650));
    setVerificationStep('linter_eval');
    await new Promise(r => setTimeout(r, 650));
    setVerificationStep('stake_check');
    await new Promise(r => setTimeout(r, 650));
    setVerificationStep('hsm_sign');
    await new Promise(r => setTimeout(r, 650));
    setVerificationStep('complete');
    setIsAttestationVerifying(false);
  };

  const handleTriggerSlash = async (appId: string) => {
    setIsSlashingActive(true);
    setIsConsoleOpen(true);
    const targetApp = appsList.find(a => a.id === appId);
    const initialStake = targetApp ? targetApp.reputationStaked : 100;
    const initialAddress = targetApp ? targetApp.stakingAddress : '0xUnknown';

    setSlashingTerminalOutput([
      `[PoS_SLASH_DAEMON] INITIATING PROOF-OF-SECURITY COLLATERAL FORFEITURE PROTOCOL...`,
      `[PoS_SLASH_DAEMON] Target App-ID:   ${appId}`,
      `[PoS_SLASH_DAEMON] Staking Address: ${initialAddress}`,
      `[PoS_SLASH_DAEMON] Collateral Pool: ${initialStake} MATIC`,
      `[PoS_SLASH_DAEMON] ---------------------------------------------`,
      `[PoS_SLASH_DAEMON] Contacting smart contract validator node at https://vrav-staking-api.vrav.org...`
    ]);

    await new Promise(resolve => setTimeout(resolve, 800));

    setSlashingTerminalOutput(prev => [
      ...prev,
      `[SMART_CONTRACT] Validating zero-trust audit compliance check results...`,
      `[SMART_CONTRACT] SUCCESS: Validator signatures confirm CRITICAL static backdoor payload!`,
      `[SMART_CONTRACT] EXECUTE METHOD: SlashedStake(${initialAddress}, ${initialStake} MATIC)`
    ]);

    await new Promise(resolve => setTimeout(resolve, 800));

    setSlashingTerminalOutput(prev => [
      ...prev,
      `[SMART_CONTRACT] Transferred penalty fine: ${initialStake} MATIC successfully burnt from liquidity pool.`,
      `[REGISTRY_DAEMON] Initiating dynamic on-chain registry database update (POST /api/slash)...`
    ]);

    try {
      const res = await fetch('/api/slash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId })
      });
      if (res.ok) {
        const result = await res.json();
        setSlashingTerminalOutput(prev => [
          ...prev,
          `[REGISTRY_DAEMON] Master index updated!`,
          `[REGISTRY_DAEMON] Trust Score reset to: 0/100`,
          `[REGISTRY_DAEMON] New Stake Balance:    0 MATIC (isSlashed = true)`,
          `[SUCCESS] Slashing protocol completed for ${appId}. Peer consensus reached.`
        ]);
        await loadDynamicManifest();
      } else {
        const errData = await res.json();
        setSlashingTerminalOutput(prev => [
          ...prev,
          `[ERROR] Server registry rejected slashing transaction: ${errData.error}`
        ]);
      }
    } catch (err: any) {
      setSlashingTerminalOutput(prev => [
        ...prev,
        `[ERROR] Network failed to sync with registry node: ${err.message}`
      ]);
    }
    setIsSlashingActive(false);
  };

  // Fetch applications list dynamically from `/api/apps`
  const loadDynamicManifest = async () => {
    setIsAppsLoading(true);
    try {
      const res = await fetch('/api/apps');
      if (res.ok) {
        const data = await res.json();
        setAppsList(data);
      } else {
        setAppsList(INITIAL_APPS);
      }
    } catch (e) {
      console.warn("REST manifest query returned error, loading backup catalog instead.", e);
      setAppsList(INITIAL_APPS);
    } finally {
      // Simulate highly aesthetic premium Google Play store elements delay
      await new Promise(r => setTimeout(r, 600));
      setIsAppsLoading(false);
    }
  };

  // Active IPFS gateway probing check
  const executeGatewayProbe = async (gatewayUrl: string = selectedGateway) => {
    setGatewayStatus('checking');
    if (window.vravIpfsVerifier) {
      const checkObj = await window.vravIpfsVerifier.checkGatewayAvailability(gatewayUrl);
      if (checkObj.online) {
        setGatewayStatus('online');
        setGatewayLatency(checkObj.latency);
      } else {
        setGatewayStatus('error');
        setGatewayLatency(null);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 300));
      setGatewayStatus('online');
      setGatewayLatency(90 + Math.floor(Math.random() * 80));
    }
  };

  useEffect(() => {
    loadDynamicManifest();
    executeGatewayProbe();
  }, []);

  const handleGatewayChangeAndProbe = async (newUrl: string) => {
    setSelectedGateway(newUrl);
    executeGatewayProbe(newUrl);
  };

  // Live Playground Publisher API Execution
  const triggerHubAppPublish = async () => {
    setIsPublishing(true);
    setIsConsoleOpen(true);
    setPublishTerminalOutput([
      `[DEV_PIPELINE] Booting local DevSecOps packaging node...`,
      `[DEV_PIPELINE] Creating release binary payload: ${pubId}-v${pubVersion}.apk`,
      `[DEV_PIPELINE] Launching post-compilation custom linter...`
    ]);

    await new Promise(resolve => setTimeout(resolve, 800));

    // Run custom regex linter check on new published code
    const checkObj = executeLocalRegExLinter(pubCode, "UploadedCode.java");
    
    // Check if linter found critical issues
    const hasCritical = checkObj.issues.some(i => i.severity === 'CRITICAL');
    setPublishTerminalOutput(prev => [
      ...prev,
      `[LINTER] Automated code scanning complete. Lint-score: ${checkObj.score}/100`,
      `[LINTER] Discovered ${checkObj.issues.length} security flags.`
    ]);

    if (hasCritical) {
      setPublishTerminalOutput(prev => [
        ...prev,
        `[CRITICAL] Linter blocked upload! Source code violates security policies!`,
        `[CRITICAL] Resolve all high-risk vulnerabilities before deployment push.`
      ]);
      setIsPublishing(false);
      alert("Submission Rejected! The custom code holds CRITICAL backyard vulnerabilities detected by local linter.");
      return;
    }

    setPublishTerminalOutput(prev => [
      ...prev,
      `[LINTER] Code passed integrity validation. Target marked SAFE.`,
      `[IPFS_PUSH] Establishing handshake with gateway: ${selectedGateway}/api/v0/add`,
      `[IPFS_PUSH] Registering content block allocation to decentral network...`
    ]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Calculate simulated crypto hash and CIDv0 multihash
    const encoder = new TextEncoder();
    const dataUint8 = encoder.encode(pubCode);
    
    let simulatedSHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    if (window.vravIpfsVerifier) {
      const res = await window.vravIpfsVerifier.validateDownloadedPayloadHash(dataUint8, simulatedSHA256);
      simulatedSHA256 = res.calculatedHash;
    } else {
      simulatedSHA256 = '4a' + Array.from({length: 62}, () => Math.floor(Math.random()*16).toString(16)).join('');
    }

    const simulatedCID = 'Qm' + simulatedSHA256.substring(0, 30).toUpperCase() + 'zP9PskY2vL6A';

    setPublishTerminalOutput(prev => [
      ...prev,
      `[IPFS_PUSH] Succeeded. New CID generated: ${simulatedCID}`,
      `[IPFS_PUSH] Core File Integrity SHA-256 Sum: ${simulatedSHA256}`,
      `[REGISTRY_SYNC] Committing metadata properties update to manifest.json via POST /api/apps...`
    ]);

    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pubId,
          name: pubName,
          version: pubVersion,
          developer: pubDeveloper,
          description: pubDescription,
          category: pubCategory,
          ipfsHash: simulatedCID,
          sha256: simulatedSHA256,
          reputationStaked: Number(pubRep),
          virustotalScore: "0/72 Clean",
          permissionsCount: 2,
          staticScanStatus: "clean"
        })
      });

      const data = await response.json();
      if (response.ok) {
        setPublishTerminalOutput(prev => [
          ...prev,
          `[REGISTRY_SYNC] Core Hub Index Synced Successfully!`,
          `[GIT_OPS] Completed Commit/Push deployment cycle:`,
          `  $ git add manifest.json`,
          `  $ git commit -m "chore(ops): publish verified ${pubId} @ ${simulatedCID}"`,
          `  $ git push origin main`,
          `[SUCCESS] App index available immediately across all peer nodes!`
        ]);
        // Reload manifest to view newly published item!
        await loadDynamicManifest();
      } else {
        setPublishTerminalOutput(prev => [
          ...prev,
          `[ERROR] Server rejected manifest sync execution: ${data.error}`
        ]);
      }
    } catch (err: any) {
      setPublishTerminalOutput(prev => [
        ...prev,
        `[ERROR] Network error contacting registry endpoint: ${err.message}`
      ]);
    }

    setIsPublishing(false);
  };

  // Change code input when template changes
  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const template = MOCK_CODE_TEMPLATES.find(t => t.id === id);
    if (template) {
      setCustomCode(template.content);
      setFileName(template.filename);
      // Reset scan results
      setLocalLinterResults(null);
      setAiAuditReport('');
      setAiAuditError('');
      setScannedOnce(false);
    }
  };

  // Run Local RegEx Linter & Setup UI indicators
  const executeLocalRegExLinter = (sourceCode: string, name: string) => {
    const lines = sourceCode.split('\n');
    const detectedIssues: { line: number; rule: string; msg: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO' }[] = [];
    let baseScore = 100;

    lines.forEach((lineText, index) => {
      const lineNo = index + 1;
      
      // 1. Secret scanning
      if (scanTypeSecrets) {
        // AWS Client Secrets
        if (/AKIA[0-9A-Z]{16}/.test(lineText) || /awsClientSecret|AWS_SECRET/i.test(lineText)) {
          detectedIssues.push({
            line: lineNo,
            rule: 'Hardcoded Cloud Signature API Secret',
            msg: 'Found potential hardcoded Amazon Web Services credential signature.',
            severity: 'CRITICAL'
          });
          baseScore -= 18;
        }
        // VRAV Internal token or placeholder generic key
        if (/vrav_sec_[a-f0-9]{32}/.test(lineText) || /SYSTEM_BACKDOOR_TOKEN/i.test(lineText)) {
          detectedIssues.push({
            line: lineNo,
            rule: 'Hub Backdoor Admin Key Leak',
            msg: 'Detected static plain-text key block labeled Core Guard Administrator token.',
            severity: 'CRITICAL'
          });
          baseScore -= 25;
        }
      }

      // 2. Dangerous API Checks
      if (scanTypeDangerousApi) {
        // Runtime execute
        if (/\w+\.exec\(/i.test(lineText)) {
          detectedIssues.push({
            line: lineNo,
            rule: 'Arbitrary Shell Execution Channel',
            msg: 'Explicit call to Runtime.getRuntime().exec() detects. Highly unsafe if executing raw shell commands.',
            severity: 'CRITICAL'
          });
          baseScore -= 20;
        }
        // SSL Overrides
        if (/checkClientTrusted|checkServerTrusted/i.test(lineText) || /setDefaultHostnameVerifier/i.test(lineText)) {
          detectedIssues.push({
            line: lineNo,
            rule: 'SSL Cryptographic Validation Bypass',
            msg: 'Null-operation trust manager override discovered. Compromises Transport Layer TLS validation, allowing MITM attacks.',
            severity: 'HIGH'
          });
          baseScore -= 15;
        }
        // Extreme System Permissions request in manifest
        if (lineText.includes('android.permission.WRITE_SETTINGS') || lineText.includes('android.permission.SYSTEM_ALERT_WINDOW')) {
          detectedIssues.push({
            line: lineNo,
            rule: 'Intrusive System Overlays Requested',
            msg: 'App requests permissions to override secure system level system UI settings.',
            severity: 'HIGH'
          });
          baseScore -= 10;
        }
      }

      // 3. Dynamic Reflection Checks
      if (scanTypeReflection) {
        if (/Class\.forName|ClassLoader/i.test(lineText)) {
          detectedIssues.push({
            line: lineNo,
            rule: 'Dynamic Command Class-Loading',
            msg: 'Utilizing Reflection API (Class.forName) to resolve dynamic references at runtime. Classic signature of cover app behaviors.',
            severity: 'MEDIUM'
          });
          baseScore -= 8;
        }
      }
    });

    const finalScore = Math.max(0, baseScore);
    return { score: finalScore, issues: detectedIssues };
  };

  const handleRunLinter = async () => {
    setIsLinterRunning(true);
    setLocalLinterResults(null);
    setAiAuditReport('');
    setAiAuditError('');

    // Simulate audit engine starting
    await new Promise(resolve => setTimeout(resolve, 600));

    // Run custom RegEx rules Engine
    const linterObj = executeLocalRegExLinter(customCode, fileName);
    setLocalLinterResults(linterObj);

    if (runAIDeepScan) {
      try {
        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: customCode, filename: fileName })
        });

        const data = await response.json();
        if (response.ok) {
          setAiAuditReport(data.result);
        } else {
          setAiAuditError(data.error || 'Server rejected audit execution.');
        }
      } catch (e: any) {
        setAiAuditError(e.message || 'Network exception calling static audit service.');
      }
    }

    setIsLinterRunning(false);
    setScannedOnce(true);
  };

  // Automated IPFS Handshake, Gateway response probes, and SHA-256 integrity verifications
  const handleInstallApp = async (app: AppItem) => {
    setSelectedApp(app);
    setInstallStatus('pulling');
    setIsConsoleOpen(true);
    setInstallTerminalOutput([
      `[NODE_DAEMON] Initializing decentralized handshake...`,
      `[NODE_DAEMON] Chosen Content Gateway: ${selectedGateway}`,
      `[NODE_DAEMON] App Hub CID Pointer: ${app.ipfsHash}`,
      `[NODE_DAEMON] ---------------------------------------------`,
    ]);

    if (app.isSlashed) {
      setInstallTerminalOutput(prev => [
        ...prev,
        `[CRITICAL] ❌ SECURITY CLEARANCE VIOLATION!`,
        `[CRITICAL] Application developer stake has been active-slashed due to audit failures.`,
        `[CRITICAL] Staking Account: ${app.stakingAddress}`,
        `[CRITICAL] This package CID is dynamically blacklisted in peer consensus nodes.`,
        `[CRITICAL] Handshake Terminated.`
      ]);
      setInstallStatus('idle');
      alert(`Installation Blocked! App "${app.name}" is slashed and blacklisted under VRAV's Proof-of-Security model.`);
      return;
    }

    setInstallTerminalOutput(prev => [
      ...prev,
      `[GATEWAY_PROBE] Initiating active availability check (window.vravIpfsVerifier)...`
    ]);

    await new Promise(resolve => setTimeout(resolve, 800));

    let probeResult: { online: boolean; latency: number; simulated?: boolean } = { online: true, latency: 135, simulated: false };
    if (window.vravIpfsVerifier) {
      const res = await window.vravIpfsVerifier.checkGatewayAvailability(selectedGateway);
      probeResult = { online: res.online, latency: res.latency, simulated: false };
    } else {
      probeResult = { online: true, latency: 140, simulated: true };
    }

    setInstallTerminalOutput(prev => [
      ...prev,
      `[GATEWAY_PROBE] Response received from IPFS Cluster: OK`,
      `[GATEWAY_PROBE] Connection Status: ONLINE (Ping: ${probeResult.latency}ms)`,
      `[IPFS_PULL] Direct connection established. Querying peer blocks...`
    ]);

    await new Promise(resolve => setTimeout(resolve, 800));

    // Chunk downloads progress
    setInstallTerminalOutput(prev => [
      ...prev,
      `[IPFS_PULL] Downloading block chunks [64KB, 128KB, 512KB, 1.2MB]...`,
      `[IPFS_PULL] Payload extraction completed. Complete stream reassembled in local system cache.`
    ]);

    setInstallStatus('verifying');
    setInstallTerminalOutput(prev => [
      ...prev,
      `[SECURITY_HUB] Secure Payload loaded. COMMENCING INTEGRITY CHECK...`,
      `[SECURITY_HUB] Fetching expected digital checksum from master manifest...`
    ]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get expected SHA-256 hash
    const expectedSHA = (app as any).sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    
    // Simulate computing the SHA-256 hash using index.html SubtleCrypto hook
    const dummyBuffer = new TextEncoder().encode(app.name + app.ipfsHash);
    let hashCheckObj = { success: true, calculatedHash: expectedSHA };
    
    if (window.vravIpfsVerifier) {
      hashCheckObj = await window.vravIpfsVerifier.validateDownloadedPayloadHash(dummyBuffer, expectedSHA);
    }

    setInstallTerminalOutput(prev => [
      ...prev,
      `[HASH_VERIFY] Expected SHA-256: ${expectedSHA}`,
      `[HASH_VERIFY] Locally Computed:  ${hashCheckObj.calculatedHash}`
    ]);

    if (!hashCheckObj.success) {
      setInstallTerminalOutput(prev => [
        ...prev,
        `[CRITICAL] ❌ INTEGRITY CHECKSUM MISMATCH!`,
        `[CRITICAL] The binary packet has been modified by unauthorized nodes!`,
        `[SECURITY_HUB] Handshake disconnected. Download payload has been safely deleted and quarantined.`
      ]);
      setInstallStatus('idle');
      alert(`Critical! App: "${app.name}" failed cryptographic integrity checks. expected CID signature mismatch.`);
      return;
    }

    setInstallTerminalOutput(prev => [
      ...prev,
      `[HASH_VERIFY] Checksum status: MATCHED SECURE (Payload is bitwise integral)`
    ]);

    const isCritical = app.staticScanStatus === 'critical';

    if (isCritical) {
      setInstallTerminalOutput(prev => [
        ...prev,
        `[CRITICAL] ❌ HIGH-LEVEL STATIC ANALYSIS POLICY ALERTS DETECTED!`,
        `[CRITICAL] App holds critical security flags and is blocked from installation.`,
        `[SECURITY_HUB] System blocked package execution stream to local Android kernel. App quarantined.`
      ]);
      setInstallStatus('idle'); // Rollback / Blocked
      alert(`Installation Blocked. App: "${app.name}" fails the hub anti-backdoor compliance standards.`);
      return;
    }

    setInstallTerminalOutput(prev => [
      ...prev,
      `[VERIFIER] Certificate checksum matches authorizer block: ${app.authorizerSignature}`,
      `[VERIFIER] Approved security validation state!`,
      `[COMMAND_SYS] Deploying safe package stream to target client daemon...`,
      `[COMMAND_SYS] sandboxed-hub-installer --target-cid=${app.ipfsHash} --force-verify=true`,
      `[NODE_DAEMON] ----------------------------------------------------`,
      `[NODE_DAEMON] SUCCESS: Application successfully installed over IPFS stream and running under sandboxed space.`
    ]);
    setInstallStatus('success');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // Filter apps based on search
  const filteredApps = appsList.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.ipfsHash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="vrav-root-main" className="min-h-screen bg-neutral-50 text-neutral-800 font-sans antialiased flex flex-col">
      {/* Upper Navigation Bar */}
      <header id="vrav-header" className="bg-neutral-900 text-white border-b border-neutral-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 text-neutral-950 p-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-6 h-6 stroke-[2.5]" id="logo-icon-vrav" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-emerald-400 block font-mono">VRAV SECURITY CORE</span>
              <span className="text-xs text-neutral-400 font-semibold tracking-wide">CLOUD-SIGNING (HSM) • DECENTRALISED STANDARDS PIPELINE</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-neutral-800 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>KMS/HSM PROTECTED</span>
            </span>
          </div>
        </div>
      </header>

      {/* Sub-Header / Control board */}
      <section className="bg-white border-b border-neutral-200 py-6 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-950 tracking-tight flex items-center gap-1.5">
              <span>VRAV DevSecOps Security Core Console</span>
              <span className="text-[10px] uppercase bg-emerald-105 text-emerald-800 px-1.5 py-0.5 rounded-md font-mono font-extrabold tracking-wider border border-emerald-300">Phase 5 Core</span>
            </h1>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
              Unified hardware security module (HSM/KMS) code signing, on-chain collateral staking (PoS) audits, and zero-trust commit attestation standards proposed for multi-project software verification.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-nowrap bg-neutral-100 p-1 rounded-xl self-start md:self-auto border border-neutral-200 gap-1">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold tracking-wider rounded-lg transition-all duration-200 cursor-pointer pointer-events-auto ${
                (activeTab === 'shop' || activeTab === 'store')
                  ? 'bg-neutral-900 text-white shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 opacity-90" />
              <span>DEC-APP MARKET (P1)</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold tracking-wider rounded-lg transition-all duration-200 cursor-pointer pointer-events-auto ${
                (activeTab === 'analyzer' || activeTab === 'audit')
                  ? 'bg-neutral-900 text-white shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 opacity-90" />
              <span>AI CODE AUDITOR (P2)</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold tracking-wider rounded-lg transition-all duration-200 cursor-pointer pointer-events-auto ${
                (activeTab === 'pipeline' || activeTab === 'settings')
                  ? 'bg-neutral-900 text-white shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 opacity-90" />
              <span>CI/CD PIPELINE (P3)</span>
            </button>
            <button
              onClick={() => setActiveTab('staking')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold tracking-wider rounded-lg transition-all duration-200 cursor-pointer pointer-events-auto ${
                activeTab === 'staking'
                  ? 'bg-neutral-900 text-white shadow-sm' 
                  : 'text-neutral-650 hover:text-neutral-950 hover:bg-neutral-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5 opacity-90" />
              <span>COLLATERAL STAKING (P4)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main body viewport */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB 1: PREMIUM DEC-APP MARKET STORE */}
        {(activeTab === 'shop' || activeTab === 'store') && (
          <StoreTab
            appsList={appsList}
            isAppsLoading={isAppsLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onInstall={handleInstallApp}
            onSelectDetails={(selected) => { setSelectedApp(selected); setIsDetailsOpen(true); }}
            onOpenAttestation={handleOpenAttestation}
            gatewayLatency={gatewayLatency}
            selectedGateway={selectedGateway}
          />
        )}
        {false && (
          <div className="space-y-6">
            {/* IPFS Node Gateway & Security Settings Configuration Board (Phase 3) */}
            <div className="bg-neutral-900 text-white rounded-xl border border-neutral-800 p-6 shadow-lg space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
                <div className="space-y-1">
                  <h2 className="text-md font-bold tracking-tight text-emerald-400 font-mono flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>P2P NETWORK GATEWAY DEPLOYMENT (PHASE 3)</span>
                  </h2>
                  <p className="text-xs text-neutral-400 max-w-2xl font-medium">
                    Configure remote endpoint connections for App payload retrievals. When installing, files are dynamically pulled, checked for gateway responsiveness, and checksum-verified client-side.
                  </p>
                </div>
                
                {/* Latency Indicator Dashboard */}
                <div className="bg-neutral-950 px-4 py-3 rounded-lg border border-neutral-800 flex items-center space-x-4 self-stretch lg:self-auto justify-between lg:justify-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-neutral-500 block font-mono font-bold tracking-wider uppercase">NODE CONNECTION STATUS</span>
                    <span className="text-xs font-mono font-bold flex items-center space-x-1.5">
                      {gatewayStatus === 'online' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="text-emerald-400">ACTIVE ONLINE</span>
                        </>
                      ) : gatewayStatus === 'checking' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                          <span className="text-amber-400">PROBING CLUSTER...</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          <span className="text-red-400">CONNECTION OFFLINE</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="border-l border-neutral-800 pl-4 space-y-0.5">
                    <span className="text-[10px] text-neutral-500 block font-mono font-bold tracking-wider uppercase">PING DELAY</span>
                    <span className="text-xs font-mono font-bold text-neutral-200">
                      {gatewayLatency ? `${gatewayLatency} ms` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                {/* Gateway select dropdown */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-mono font-bold text-neutral-400 block tracking-wider uppercase">IPFS EDGE GATEWAY URL</label>
                  <select
                    value={selectedGateway}
                    onChange={(e) => handleGatewayChangeAndProbe(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-xs font-mono font-bold text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="https://cloudflare-ipfs.com">Cloudflare CDN Cluster (https://cloudflare-ipfs.com)</option>
                    <option value="https://ipfs.io">Decentral IPFS Gateway Node (https://ipfs.io)</option>
                    <option value="https://gateway.pinata.cloud">Pinata Dedicated Gateway (https://gateway.pinata.cloud)</option>
                    <option value="https://ipfs.infura.io">Infura Dev Cluster Node (https://ipfs.infura.io)</option>
                  </select>
                </div>

                {/* Gateway active probe selector */}
                <div className="md:col-span-3">
                  <button
                    onClick={() => executeGatewayProbe()}
                    disabled={gatewayStatus === 'checking'}
                    className="w-full bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600 font-mono text-xs font-bold text-neutral-300 py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center space-x-1.5"
                  >
                    <span>⚡ SYSTEM CHECK GATEWAY</span>
                  </button>
                </div>

                <div className="md:col-span-4 bg-neutral-950/70 p-3 rounded-lg border border-neutral-800/60 flex items-center space-x-3 h-10.5">
                  <div className="flex items-center h-5">
                    <input
                      id="enforce-hashing"
                      name="enforce-hashing"
                      type="checkbox"
                      checked={isCheckedOk}
                      onChange={(e) => setIsCheckedOk(e.target.checked)}
                      className="h-4 w-4 bg-neutral-900 border-neutral-800 text-emerald-500 focus:ring-emerald-500 rounded"
                    />
                  </div>
                  <div className="text-xs">
                    <label htmlFor="enforce-hashing" className="font-mono font-semibold text-neutral-400 select-none cursor-pointer">
                      Enforce Client SHA-256 Checksum Validation
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 4: Proof-of-Security Reputation & Staking Dashboard */}
            <div className="bg-neutral-900 text-white rounded-xl border border-neutral-800 overflow-hidden shadow-lg">
              <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <h2 className="text-sm font-bold font-mono tracking-wider text-neutral-200">PROOF-OF-SECURITY (PoS) STAKING LEDGER (PHASE 4)</h2>
                </div>
                <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
                  <button 
                    onClick={() => setStakeFilter('all')}
                    className={`px-2.5 py-1 rounded font-mono ${stakeFilter === 'all' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
                  >
                    ALL
                  </button>
                  <button 
                    onClick={() => setStakeFilter('staked')}
                    className={`px-2.5 py-1 rounded font-mono ${stakeFilter === 'staked' ? 'bg-emerald-600 text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
                  >
                    STAKED
                  </button>
                  <button 
                    onClick={() => setStakeFilter('slashed')}
                    className={`px-2.5 py-1 rounded font-mono ${stakeFilter === 'slashed' ? 'bg-red-600 text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
                  >
                    SLASHED
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
                {/* Left Side: Staking Registry Table */}
                <div className="lg:col-span-7 p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-neutral-800 bg-neutral-950/65 text-neutral-400">
                          <th className="py-2.5 px-3">Developer / Application</th>
                          <th className="py-2.5 px-3">Deposit Address</th>
                          <th className="py-2.5 px-3 text-right">Stake Pool</th>
                          <th className="py-2.5 px-3 text-center">Trust %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {appsList
                          .filter(app => {
                            if (stakeFilter === 'staked') return !app.isSlashed && app.reputationStaked > 0;
                            if (stakeFilter === 'slashed') return app.isSlashed;
                            return true;
                          })
                          .map((app) => (
                            <tr key={app.id} className={`hover:bg-neutral-950/40 transition-colors ${app.isSlashed ? 'text-red-400/90' : ''}`}>
                              <td className="py-3 px-3">
                                <div className="font-bold text-neutral-200">{app.developer}</div>
                                <div className="text-[10px] text-neutral-400 flex items-center space-x-1">
                                  <span className="truncate max-w-[120px]">{app.name}</span>
                                  <span>•</span>
                                  <span className="font-bold uppercase text-[9px] px-1 bg-neutral-800 rounded">{app.id}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-neutral-400">
                                <span title={app.stakingAddress}>{app.stakingAddress.slice(0, 8)}...{app.stakingAddress.slice(-6)}</span>
                              </td>
                              <td className="py-3 px-3 text-right font-bold">
                                {app.isSlashed ? (
                                  <span className="text-red-500 line-through">Slashed!</span>
                                ) : (
                                  <span className="text-emerald-400">{app.reputationStaked} MATIC</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  app.trustScore >= 80 ? 'bg-emerald-950/80 text-emerald-400' :
                                  app.trustScore >= 40 ? 'bg-amber-950/80 text-amber-400' :
                                  'bg-red-950/80 text-red-400 animate-pulse'
                                }`}>
                                  {app.trustScore}%
                                </span>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3.5 bg-neutral-950 rounded-lg border border-neutral-800/80 flex items-start space-x-3 text-xs text-neutral-400">
                    <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-200">How the "Proof-of-Security" (PoS) Slashing Protocol Works</p>
                      <p className="mt-1 text-[11px] leading-relaxed">
                        Under Phase 4 covenants, developers deposit MATIC collateral into the VRAV core Staking Address. If manual user audit requests or automated policy scanners reveal critical backdoor patterns, the associated contract executes an immediate <strong className="text-red-400">Slashing Transaction</strong>: trust score goes to 0%, the MATIC stake is locked/burnt, and installation permissions are de-authorized dynamically.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Active Smart Contract Slashing Simulator CLI */}
                <div className="lg:col-span-5 p-6 flex flex-col justify-between h-full bg-neutral-950">
                  <div className="space-y-4 flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-neutral-400 tracking-wider">LIVE SMART-CONTRACT PENALTY LOGS</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3.5 h-64 overflow-y-auto font-mono text-[10px] text-neutral-300 space-y-1.5 scrollbar-thin">
                      {slashingTerminalOutput.length === 0 ? (
                        <div className="text-neutral-500 italic flex flex-col items-center justify-center h-full text-center space-y-1 py-12">
                          <Terminal className="w-5 h-5 opacity-40 mb-1 animate-pulse" />
                          <span>No slashing executes active. Click "Slash Collateral" on any untrusted app card below to simulate penalty logic.</span>
                        </div>
                      ) : (
                        slashingTerminalOutput.map((line, idx) => (
                          <div 
                            key={idx} 
                            className={`leading-relaxed ${
                              line.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' :
                              line.includes('[ERROR]') ? 'text-red-400 font-bold' :
                              line.includes('[PoS_SLASH_DAEMON]') ? 'text-blue-400 font-bold' :
                              line.includes('[SMART_CONTRACT]') ? 'text-amber-400 font-bold' : ''
                            }`}
                          >
                            {line}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-neutral-500">Consensus Nodes Checked: 12/12</span>
                    <button
                      onClick={() => setSlashingTerminalOutput([])}
                      disabled={slashingTerminalOutput.length === 0}
                      className="text-[10px] font-mono border border-neutral-800 text-neutral-400 hover:text-white px-2 py-1 rounded hover:border-neutral-700 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      CLEAR PROTOCOL LOG
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Search Container with status */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-grow max-w-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search apps by ID, developer, or IPFS hash identifier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex items-center space-x-3 text-xs text-neutral-500 font-mono">
                  <span>Showing <strong className="text-neutral-900">{filteredApps.length}</strong> audited releases</span>
                  <span>•</span>
                  <span>Source: <strong className="text-neutral-900">manifest.json (Dynamic)</strong></span>
                </div>
              </div>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApps.map((app) => (
                <div 
                  key={app.id} 
                  className={`bg-white rounded-xl border transition-all duration-200 flex flex-col h-full overflow-hidden ${
                    app.staticScanStatus === 'critical' 
                      ? 'border-red-200 shadow-red-50/50 shadow-md' 
                      : app.staticScanStatus === 'warning' 
                        ? 'border-amber-200 shadow-amber-50/50 shadow-md'
                        : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                  }`}
                >
                  <div className="p-6 flex-grow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className="font-bold text-lg text-neutral-950 tracking-tight">{app.name}</h3>
                          <span className="text-xs px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-600 font-bold rounded">v{app.version}</span>
                          
                          {app.reputationStaked >= 100 && !app.isSlashed && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-[9px] font-extrabold text-emerald-800 tracking-wider">
                              <Coins className="w-2.5 h-2.5" />
                              <span>✓ VERIFIED STAKER</span>
                            </span>
                          )}
                          {app.isSlashed && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-100 border border-red-200 text-[9px] font-extrabold text-red-800 tracking-wider">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              <span>SLASHED DEPOSIT</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-emerald-600 font-mono leading-none">by {app.developer}</p>
                      </div>
                      
                      {/* Security Badging Status */}
                      <div className="flex flex-col items-end">
                        {app.staticScanStatus === 'clean' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>VRAV APPROVED</span>
                          </span>
                        )}
                        {app.staticScanStatus === 'warning' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700 font-sans">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>VERIFIED WITH FLOATS</span>
                          </span>
                        )}
                        {app.staticScanStatus === 'critical' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-red-50 border border-red-200 text-xs font-bold text-red-700 font-mono tracking-tighter">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            <span>FAILED REPUTATION-AUDIT</span>
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-mono mt-1 font-semibold">{app.virustotalScore}</span>
                      </div>
                    </div>

                    <p className="text-sm text-neutral-600 mt-4 leading-relaxed line-clamp-2 h-10">{app.description}</p>

                    {/* Trust Score & Progress Bar (Phase 4) */}
                    <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200/60 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-neutral-600 font-mono">On-Chain Trust Score:</span>
                        <span className={`font-bold font-mono ${
                          app.trustScore >= 80 ? 'text-emerald-600' : app.trustScore >= 40 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {app.trustScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-neutral-250 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            app.trustScore >= 80 ? 'bg-emerald-500' : app.trustScore >= 40 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'
                          }`}
                          style={{ width: `${app.trustScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="mt-4 border-t border-dotted border-neutral-200 pt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-500">IPFS CID Hash:</span>
                        <span className="text-emerald-700 font-bold truncate max-w-[240px]" title={app.ipfsHash}>{app.ipfsHash}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-500">SHA-256 Cryptosum:</span>
                        <span className="text-blue-600 font-bold truncate max-w-[240px]" title={(app as any).sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}>
                          {(app as any).sha256 || 'e3b0c44298fc1c149afb...'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-500">Staking Contract/Deposit:</span>
                        <span className="text-amber-700 font-bold truncate max-w-[240px]" title={app.stakingAddress}>{app.stakingAddress}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 font-mono">Active Collateral:</span>
                        <span className="font-semibold text-neutral-900 inline-flex items-center space-x-1">
                          <Coins className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{app.isSlashed ? '0 MATIC (SLASHED)' : `${app.reputationStaked} MATIC`}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 font-mono">Cold Auth Signature:</span>
                        <span className="font-mono text-neutral-800 font-semibold text-right truncate max-w-[200px]">{app.authorizerSignature}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-neutral-500 font-mono">{app.installCount.toLocaleString()} installs</span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenAttestation(app.id)}
                        className="px-2.5 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded-lg border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-900 lg:hover:text-white transition-all flex items-center space-x-1 uppercase shadow-xs select-none"
                        title="View Hardware Security Module asymmetric signature & verifiable Git build records"
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-500 hover:text-inherit" />
                        <span>Verifiable Attestation</span>
                      </button>

                      {/* Interactive Slashing simulator trigger button */}
                      {!app.isSlashed && app.id !== 'vrav-auth' && (
                        <button
                          onClick={() => handleTriggerSlash(app.id)}
                          disabled={isSlashingActive}
                          className="px-2.5 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-500 hover:text-white transition-all flex items-center space-x-1 uppercase"
                          title="Simulate security backdoor policy failure and trigger smart contract Slashing"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Slash Collateral</span>
                        </button>
                      )}

                      <button 
                        onClick={() => handleInstallApp(app)}
                        className={`inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold tracking-wider rounded-lg border transition-all duration-200 select-none ${
                          app.staticScanStatus === 'critical'
                            ? 'bg-neutral-200 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-80'
                            : 'bg-neutral-900 text-white border-neutral-950 hover:bg-emerald-600 hover:border-emerald-700 cursor-pointer shadow-xs'
                        }`}
                        disabled={app.staticScanStatus === 'critical' && installStatus === 'idle'}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>INSTALL (IPFS PULL)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Install terminal console indicator */}
            {selectedApp && installStatus !== 'idle' && (
              <div id="vrav-install-terminal" className="bg-neutral-900 border-2 border-neutral-800 rounded-xl overflow-hidden shadow-xl mt-8">
                <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-neutral-300">Decentralized Secure Command Installer Console — IPFS Gateway</span>
                  </div>
                  <button 
                    onClick={() => { setInstallStatus('idle'); setSelectedApp(null); }}
                    className="text-neutral-400 hover:text-white font-mono text-xs font-bold"
                  >
                    CLOSE [X]
                  </button>
                </div>
                <div className="p-4 font-mono text-xs text-neutral-300 space-y-2 h-72 overflow-y-auto bg-neutral-950/80">
                  {installTerminalOutput.map((line, idx) => (
                    <div key={idx} className={`leading-relaxed ${
                      line.includes('[CRITICAL]') ? 'text-red-400 font-bold' : 
                      line.includes('[VERIFIER]') ? 'text-blue-400' :
                      line.includes('SUCCESS') ? 'text-emerald-400 font-bold text-center border-t border-emerald-900/60 pt-4' : ''
                    }`}>
                      {line}
                    </div>
                  ))}
                  {installStatus === 'pulling' && (
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold animate-pulse">
                      <span>•</span><span>•</span><span>•</span><span>PULLING APK PAYLOAD FROM IPFS P2P CLUSTERS</span>
                    </div>
                  )}
                  {installStatus === 'verifying' && (
                    <div className="flex items-center space-x-2 text-blue-400 font-bold animate-pulse">
                      <span>⚡</span><span>RUNNING ZERO-TRUST AUTOMATED CODE INTEGRITY AUDIT...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI STATIC ANALYSIS AUDIT TOOL */}
        {(activeTab === 'analyzer' || activeTab === 'audit') && (
          <AuditTab
            selectedTemplateId={selectedTemplateId}
            handleTemplateChange={handleTemplateChange}
            runAIDeepScan={runAIDeepScan}
            setRunAIDeepScan={setRunAIDeepScan}
            scanTypeSecrets={scanTypeSecrets}
            setScanTypeSecrets={setScanTypeSecrets}
            scanTypeDangerousApi={scanTypeDangerousApi}
            setScanTypeDangerousApi={setScanTypeDangerousApi}
            scanTypeReflection={scanTypeReflection}
            setScanTypeReflection={setScanTypeReflection}
            customCode={customCode}
            setCustomCode={setCustomCode}
            fileName={fileName}
            setFileName={setFileName}
            isLinterRunning={isLinterRunning}
            handleRunLinter={handleRunLinter}
            scannedOnce={scannedOnce}
            localLinterResults={localLinterResults}
            aiAuditReport={aiAuditReport}
            aiAuditError={aiAuditError}
          />
        )}
        {false && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Config control workspace (Line 4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-md font-extrabold text-neutral-950 tracking-tight flex items-center space-x-1.5 leading-none">
                      <Terminal className="w-4.5 h-4.5 text-neutral-500" />
                      <span>SECURE SCANNING ENGINE</span>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-medium">Select code templates loaded with different backdoor vulnerabilities or test safe code structures.</p>
                  </div>

                  {/* Selector list */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700 block select-none">CODE TEMPLATES</label>
                    <div className="space-y-2">
                      {MOCK_CODE_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          onClick={() => handleTemplateChange(tmpl.id)}
                          className={`w-full text-left p-3 rounded-lg border text-xs transition-all duration-150 relative ${
                            selectedTemplateId === tmpl.id
                              ? 'bg-emerald-50/50 border-emerald-500/80 text-emerald-950 shadow-xs ring-1 ring-emerald-500/20'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{tmpl.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-neutral-200 rounded text-neutral-600 font-mono">{tmpl.type}</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-normal">{tmpl.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Settings */}
                  <div className="border-t border-neutral-200 pt-5 space-y-4">
                    <label className="text-xs font-bold text-neutral-700 block tracking-wider uppercase select-none">SCAN RULES</label>
                    
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={scanTypeSecrets}
                          onChange={(e) => setScanTypeSecrets(e.target.checked)}
                          className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-neutral-900 block leading-tight">Hardcoded Credentials</span>
                          <span className="text-neutral-500 text-[11px]">AWS identifiers, backdoors, internal Auth secret keys.</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={scanTypeDangerousApi}
                          onChange={(e) => setScanTypeDangerousApi(e.target.checked)}
                          className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-neutral-900 block leading-tight">Dangerous API / Permissions</span>
                          <span className="text-neutral-500 text-[11px]">Runtime shell execute(), custom unverified SSL TrustManagers.</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={scanTypeReflection}
                          onChange={(e) => setScanTypeReflection(e.target.checked)}
                          className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-neutral-900 block leading-tight">Reflection & Command Loaders</span>
                          <span className="text-neutral-500 text-[11px]">Class.forName reference structures to bypass compilation checks.</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 text-xs cursor-pointer select-none border-t border-neutral-100 pt-3">
                        <input
                          type="checkbox"
                          checked={runAIDeepScan}
                          onChange={(e) => setRunAIDeepScan(e.target.checked)}
                          className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-neutral-950 block leading-tight flex items-center space-x-1 text-emerald-700">
                            <Cpu className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Gemini AI Deep Audit</span>
                          </span>
                          <span className="text-neutral-500 text-[11px]">Server-side dynamic agent checks for logical and cryptographic backdoors.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleRunLinter}
                    disabled={isLinterRunning}
                    className="w-full bg-neutral-900 hover:bg-emerald-600 disabled:bg-neutral-300 border border-neutral-950 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-xs tracking-wider cursor-pointer shadow-xs font-mono"
                  >
                    {isLinterRunning ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>RUNNING AUTOMATED CHECKS...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4.5 h-4.5 fill-white" />
                        <span>RUN STATIC SEC AUDIT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Workspace Core code panel + output consoles (Line 8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Editor Workspace */}
                <div className="bg-neutral-900 text-neutral-100 rounded-xl border border-neutral-800 shadow-lg overflow-hidden flex flex-col">
                  <div className="px-5 py-3.5 bg-neutral-950 flex items-center justify-between border-b border-neutral-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-1.5 rounded-full bg-red-400"></div>
                      <input 
                        type="text" 
                        value={fileName} 
                        onChange={(e) => setFileName(e.target.value)}
                        className="bg-transparent text-xs font-mono font-bold text-neutral-200 border-none outline-none focus:ring-0 w-48"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider bg-neutral-800/80 px-2 py-0.5 rounded">
                      EDITOR WORKSPACE
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      rows={16}
                      className="w-full bg-neutral-950/40 p-5 font-mono text-xs leading-relaxed text-emerald-300 outline-none focus:ring-0 border-none resize-none overflow-x-auto selection:bg-emerald-500/20"
                      placeholder="Paste your custom Java, Kotlin or AndroidManifest XML file to analyze security anomalies..."
                    />
                  </div>
                </div>

                {/* Local Regex Static Scan result block */}
                {localLinterResults && (
                  <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-neutral-950 text-sm tracking-tight flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>REGULAR EXPRESSION SCANNERS LOG</span>
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 font-medium">Signature validation audit of standard dangerous APIs & definitions.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-neutral-500 font-bold font-mono">App Trust Core Index:</span>
                        <span className={`text-md font-extrabold px-3 py-1 font-mono rounded ${
                          localLinterResults.score >= 90 ? 'bg-emerald-100 text-emerald-950' : 
                          localLinterResults.score >= 50 ? 'bg-amber-100 text-amber-950' :
                          'bg-red-100 text-red-950'
                        }`}>
                          {localLinterResults.score}/100
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-4">
                      {localLinterResults.issues.length === 0 ? (
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex items-start space-x-3">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-emerald-950 block">Audit Signatures Passed!</span>
                            <span className="text-xs text-emerald-700 font-medium">No malicious API patterns or leaked static secrets matched standard signatures inside current source file representation.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {localLinterResults.issues.map((issue, i) => (
                            <div key={i} className={`p-4 rounded-lg border text-xs flex items-start space-x-3.5 ${
                              issue.severity === 'CRITICAL' ? 'bg-red-50/30 border-red-200' :
                              issue.severity === 'HIGH' ? 'bg-amber-50/30 border-amber-200' :
                              'bg-neutral-50 border-neutral-200'
                            }`}>
                              <span className={`inline-flex items-center justify-center font-bold px-2 py-1 rounded text-[10px] font-mono leading-none ${
                                issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-900 border border-red-200' :
                                issue.severity === 'HIGH' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                                'bg-neutral-200 text-neutral-800'
                              }`}>
                                {issue.severity}
                              </span>
                              <div className="space-y-1.5 flex-grow">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-neutral-900">{issue.rule}</span>
                                  <span className="text-neutral-500 font-mono text-[10px]">Line: {issue.line}</span>
                                </div>
                                <p className="text-neutral-600 leading-relaxed text-[11px] font-medium">{issue.msg}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Gemini AI Deep Scanners Outcome */}
                {scannedOnce && runAIDeepScan && (
                  <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-emerald-600 stroke-[2.2]" />
                      <div>
                        <h3 className="font-bold text-neutral-950 text-sm tracking-tight">VRAV DEEP SECURITY AGENT - AI HEURISTIC AUDIT</h3>
                        <p className="text-xs text-neutral-500 mt-0.5 font-medium">Deep AI-powered scanning of logical code flaws and obfuscated security backdoors.</p>
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-4">
                      {isLinterRunning ? (
                        <div className="p-8 flex flex-col items-center justify-center space-y-3.5 text-center">
                          <span className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></span>
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-neutral-900 tracking-tight block">Gemini Analyzing Cryptographic Transforms and Command Chains...</span>
                            <span className="text-neutral-500 text-[11px] block font-mono">POST /api/audit (using Model: gemini-3.5-flash)</span>
                          </div>
                        </div>
                      ) : aiAuditError ? (
                        <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 flex items-start space-x-3 text-xs leading-relaxed">
                          <AlertCircle className="w-4.5 h-4.5 text-red-600 mt-0.5" />
                          <div>
                            <span className="font-bold text-red-950 block">AI Deep Scan Unavailable</span>
                            <span className="text-red-700 block mt-1 font-medium">{aiAuditError}</span>
                            <p className="text-[11px] text-neutral-500 font-semibold mt-3 font-mono">
                              Tip: Confirm that your API credentials have been linked correctly inside the Settings &gt; Secrets panel under variable GEMINI_API_KEY.
                            </p>
                          </div>
                        </div>
                      ) : aiAuditReport ? (
                        <div className="bg-neutral-950 text-neutral-200 p-6 rounded-xl font-sans text-xs leading-relaxed overflow-x-auto shadow-inner max-h-120 border border-neutral-800 space-y-4">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                            <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">AI AGENT DETAILED REPORT</span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">SECURE VERDICT DELIVERED</span>
                          </div>
                          
                          {/* Rich Render of Gemini output to avoid markdown layout broken states */}
                          <div className="prose prose-sm prose-invert max-w-none text-neutral-300 space-y-4">
                            {aiAuditReport.split('\n\n').map((paragraph, index) => {
                              // Render title block
                              if (paragraph.startsWith('### ')) {
                                return <h4 key={index} className="text-sm font-bold text-white tracking-tight pt-3 border-t border-neutral-800/40 first:border-0">{paragraph.replace('### ', '')}</h4>;
                              }
                              if (paragraph.startsWith('## ')) {
                                return <h3 key={index} className="text-md font-extrabold text-emerald-400 tracking-tight pt-4">{paragraph.replace('## ', '')}</h3>;
                              }
                              // Formatted card box for overview stats
                              if (paragraph.includes('Security Score') || paragraph.includes('Overall Risk Status')) {
                                return (
                                  <div key={index} className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4 my-2 text-emerald-300 font-mono text-[11px]">
                                    {paragraph.split('\n').map((l, li) => <div key={li}>{l}</div>)}
                                  </div>
                                );
                              }
                              // Formatted alert list items
                              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                                return (
                                  <ul key={index} className="list-disc pl-5 space-y-1 my-2">
                                    {paragraph.split('\n').map((line, li) => {
                                      const cleanLine = line.replace(/^[-*]\s+/, '');
                                      return <li key={li} className="text-neutral-300 font-medium">{cleanLine}</li>;
                                    })}
                                  </ul>
                                );
                              }
                              // Code block support inside report
                              if (paragraph.startsWith('```')) {
                                return (
                                  <pre key={index} className="bg-neutral-900 border border-neutral-800/70 p-3 rounded font-mono text-[11px] my-3 leading-normal text-emerald-400 overflow-x-auto">
                                    {paragraph.replace(/```[a-zA-Z]*\n?|```/g, '')}
                                  </pre>
                                );
                              }
                              return <p key={index} className="font-medium text-neutral-300 leading-relaxed">{paragraph}</p>;
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-neutral-400 font-semibold font-mono">No analysis report payload returned from model execution.</div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CI/CD PUBLISHING PIPELINE WORKSPACE */}
        {(activeTab === 'pipeline' || activeTab === 'settings') && (
          <SettingsTab
            selectedGateway={selectedGateway}
            setSelectedGateway={setSelectedGateway}
            gatewayStatus={gatewayStatus}
            gatewayLatency={gatewayLatency}
            executeGatewayProbe={executeGatewayProbe}
            isCheckedOk={isCheckedOk}
            setIsCheckedOk={setIsCheckedOk}
            pubId={pubId}
            setPubId={setPubId}
            pubName={pubName}
            setPubName={setPubName}
            pubVersion={pubVersion}
            setPubVersion={setPubVersion}
            pubDeveloper={pubDeveloper}
            setPubDeveloper={setPubDeveloper}
            pubDescription={pubDescription}
            setPubDescription={setPubDescription}
            pubRep={pubRep}
            setPubRep={setPubRep}
            pubCode={pubCode}
            setPubCode={setPubCode}
            isPublishing={isPublishing}
            triggerHubAppPublish={triggerHubAppPublish}
            copiedTextId={copiedTextId}
            copyToClipboard={copyToClipboard}
          />
        )}

        {/* TAB 4: POS SECURITIES STAKING COLLATERAL */}
        {activeTab === 'staking' && (
          <StakingTab
            appsList={appsList}
            isAppsLoading={isAppsLoading}
            stakeFilter={stakeFilter}
            setStakeFilter={setStakeFilter}
            handleTriggerSlash={handleTriggerSlash}
            isSlashingActive={isSlashingActive}
            slashingTerminalOutput={slashingTerminalOutput}
          />
        )}

        {false && (
          <div className="space-y-6">
            
            {/* Interactive Phase 3 P2P Publisher Playground Desk */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center space-x-2.5 pb-4 border-b border-neutral-100">
                <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-950 tracking-tight flex items-center space-x-2">
                    <span>Developer P2P Publisher Desk & IPFS Sandbox</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300/30 rounded-full">PLAYGROUND ENGINE</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Stage new client APK builds, run local linter checks, upload payload data to IPFS gateways, and update the live manifest registry.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form fields */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-xs font-mono font-bold text-neutral-400 tracking-wider uppercase">BUILD METADATA PARAMETERS</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-neutral-600 block">APPLICATION ID</label>
                      <input 
                        type="text" 
                        value={pubId}
                        onChange={(e) => setPubId(e.target.value)}
                        placeholder="vrav-vpn-guard"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded py-2 px-3 text-xs font-mono text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-neutral-600 block">RELEASE VERSION</label>
                      <input 
                        type="text" 
                        value={pubVersion}
                        onChange={(e) => setPubVersion(e.target.value)}
                        placeholder="1.0.0"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded py-2 px-3 text-xs font-mono text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold text-neutral-600 block">HUMAN-READABLE APP NAME</label>
                    <input 
                      type="text" 
                      value={pubName}
                      onChange={(e) => setPubName(e.target.value)}
                      placeholder="DNS Anti-Poison Shield"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded py-2 px-3 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-neutral-600 block font-sans">DEVELOPER ORG</label>
                      <input 
                        type="text" 
                        value={pubDeveloper}
                        onChange={(e) => setPubDeveloper(e.target.value)}
                        placeholder="Anonymous Dev Sector"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded py-2 px-3 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-neutral-600 block">REPUTATION DEPOSIT (MATIC)</label>
                      <input 
                        type="number" 
                        value={pubRep}
                        onChange={(e) => setPubRep(Number(e.target.value))}
                        placeholder="500"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded py-2 px-3 text-xs font-mono text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold text-neutral-600 block">DESCRIPTION OVERVIEW</label>
                    <textarea 
                      value={pubDescription}
                      onChange={(e) => setPubDescription(e.target.value)}
                      rows={2}
                      placeholder="Ex: Secure proxy agent executing local tunnel interfaces..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded py-2 px-3 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <button
                    onClick={triggerHubAppPublish}
                    disabled={isPublishing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-mono text-xs font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    {isPublishing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>UPLOADING TO IPFS CLUSTERS...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4.5 h-4.5" />
                        <span>⚡ PACKAGE & PUBLISH TO IPFS MARKET</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Editor & Logs console on the right */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="flex-1 flex flex-col">
                    <label className="text-xs font-mono font-bold text-neutral-400 tracking-wider uppercase block mb-1">STAGED APPS CODE (LINT AUDITED DIRECTLY ON PUBLISHING)</label>
                    <div className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 flex-grow flex flex-col">
                      <div className="px-3 py-1.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-400 font-bold">compliance_staged_build.java</span>
                        <span className="text-[10px] font-mono font-semibold text-amber-500">Warning: Linter checks are hard-enforced on uploads</span>
                      </div>
                      <textarea
                        value={pubCode}
                        onChange={(e) => setPubCode(e.target.value)}
                        className="w-full p-3 bg-neutral-950 font-mono text-[11px] text-emerald-400 border-none outline-none focus:ring-0 min-h-36 resize-y"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  {/* Simulation logs console */}
                  <div className="h-42 bg-neutral-950 border border-neutral-900 rounded-lg overflow-hidden flex flex-col font-mono text-xs">
                    <div className="px-3 py-2 bg-neutral-900 border-b border-neutral-950 flex items-center justify-between text-[10px] text-neutral-400 font-bold">
                      <span>CONSOLE: IPFS BLOCK PUBLICATION DAEMON</span>
                      <span className="text-neutral-500">IDLE LOGS</span>
                    </div>
                    <div className="p-3 bg-neutral-950/80 text-neutral-300 space-y-1.5 flex-grow overflow-y-auto leading-relaxed text-[11px]">
                      {publishTerminalOutput.length === 0 ? (
                        <div className="text-neutral-500 italic text-center pt-8">Awaiting DevSecOps build compilation. Configure fields and click publish above.</div>
                      ) : (
                        publishTerminalOutput.map((logLine, logIdx) => (
                          <div key={logIdx} className={
                            logLine.includes('[CRITICAL]') ? 'text-red-400 font-bold' : 
                            logLine.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' :
                            logLine.includes('[LINTER]') ? 'text-blue-400' : ''
                          }>
                            {logLine}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-neutral-950 tracking-tight flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-emerald-600" />
                <span>Phase 2 Production Implementation: audit.yml + linter.py</span>
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-4xl">
                To run these checks natively within your **GitHub App Repository (Spoke)** CI/CD flow, create the automated files below. The pipeline automatically fails if the exit code of `linter.py` is non-zero (indicating matched backdoor patterns).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Box 1: github automated actions */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col shadow-xs">
                <div className="px-4 py-3 bg-neutral-900 text-neutral-200 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold">.github/workflows/audit.yml</span>
                  <button 
                    onClick={() => copyToClipboard(GITHUB_WORKFLOW_YML, 'github-yaml')}
                    className="text-[10px] font-mono border border-neutral-700 hover:border-neutral-500 rounded bg-neutral-800 text-neutral-300 px-2.5 py-1 tracking-wider flex items-center space-x-1 font-bold"
                  >
                    {copiedTextId === 'github-yaml' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-neutral-950 flex-grow max-h-96 overflow-y-auto">
                  <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre leading-relaxed font-bold">
                    {GITHUB_WORKFLOW_YML}
                  </pre>
                </div>
              </div>

              {/* Box 2: python custom linter execution */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col shadow-xs">
                <div className="px-4 py-3 bg-neutral-900 text-neutral-200 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold">scripts/linter.py</span>
                  <button 
                    onClick={() => copyToClipboard(LINTER_SCRIPT_PY, 'python-linter')}
                    className="text-[10px] font-mono border border-neutral-700 hover:border-neutral-500 rounded bg-neutral-800 text-neutral-300 px-2.5 py-1 tracking-wider flex items-center space-x-1 font-bold"
                  >
                    {copiedTextId === 'python-linter' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-neutral-950 flex-grow max-h-96 overflow-y-auto">
                  <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre leading-relaxed font-bold">
                    {LINTER_SCRIPT_PY}
                  </pre>
                </div>
              </div>

              {/* Box 3: python custom IPFS registry publisher */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col shadow-xs">
                <div className="px-4 py-3 bg-neutral-900 text-neutral-200 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold">scripts/publish_ipfs.py</span>
                  <button 
                    onClick={() => copyToClipboard(PUBLISH_IPFS_PY, 'python-publish')}
                    className="text-[10px] font-mono border border-neutral-700 hover:border-neutral-500 rounded bg-neutral-800 text-neutral-300 px-2.5 py-1 tracking-wider flex items-center space-x-1 font-bold"
                  >
                    {copiedTextId === 'python-publish' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-neutral-950 flex-grow max-h-96 overflow-y-auto">
                  <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre leading-relaxed font-bold">
                    {PUBLISH_IPFS_PY}
                  </pre>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Phase 5: Cryptographic Cloud KMS/HSM Attestation Report Modal */}
        {selectedAttestationAppId && attestationReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-neutral-900 border border-neutral-800 text-white rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col my-8">
              {/* Header */}
              <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400">
                    <Key className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono tracking-wider text-neutral-200">
                      VRAV SECURE CORE: HSM ATTESTATION LEDGER
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest">
                      NON-REPUDIATION DEPLOYMENT SIGNER • PHASE 5 CORE STANDARD
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedAttestationAppId(null);
                    setAttestationReport(null);
                  }}
                  className="text-neutral-400 hover:text-white font-mono text-xs border border-neutral-800 hover:border-neutral-700 bg-neutral-955 px-3 py-1.5 rounded transition-all cursor-pointer"
                >
                  ✕ CLOSE REPORT
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 bg-neutral-900">
                {/* Left Side: Interactive Step-by-Step Verifier */}
                <div className="lg:col-span-6 p-6 space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest">
                      TRUST COVENANTS PIPELINE VERIFICATION
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      This build has been compiled securely inside clean sandboxed environments and authenticated by remote Google Cloud KMS HSM keystores. Re-evaluate signatures below.
                    </p>
                  </div>

                  {/* Steps Progress */}
                  <div className="space-y-4">
                    {/* Step 1: Git Proof */}
                    <div className={`p-4 rounded-lg border transition-all ${
                      verificationStep === 'git_proof' ? 'bg-emerald-950/20 border-emerald-500/50 scale-[1.01]' :
                      (verificationStep !== 'idle' ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-500/5 border-neutral-850 opacity-60')
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <CheckCircle className={`w-4 h-4 ${
                            verificationStep === 'git_proof' ? 'text-emerald-400 animate-spin animate-duration-1000' :
                            (['linter_eval', 'stake_check', 'hsm_sign', 'complete'].includes(verificationStep) ? 'text-emerald-400' : 'text-neutral-500')
                          }`} />
                          <span className="text-xs font-bold font-mono tracking-tight text-neutral-200">1. Git Source Provenance Proof</span>
                        </div>
                        {['linter_eval', 'stake_check', 'hsm_sign', 'complete'].includes(verificationStep) && (
                          <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/20 px-1.5 py-0.5 rounded">Verified</span>
                        )}
                      </div>
                      <div className="mt-2 text-[11px] text-neutral-400 font-mono space-y-1 pl-6">
                        <div>Commit Signature: <span className="text-neutral-300 select-all">{attestationReport.gitProvenance.commitSha}</span></div>
                        <div>Source Target Branch: <span className="text-neutral-300">{attestationReport.gitProvenance.branch}</span></div>
                        <div>Repository Host: <span className="text-neutral-300">{attestationReport.gitProvenance.repository}</span></div>
                      </div>
                    </div>

                    {/* Step 2: Linter code evaluations */}
                    <div className={`p-4 rounded-lg border transition-all ${
                      verificationStep === 'linter_eval' ? 'bg-emerald-950/20 border-emerald-500/50 scale-[1.01]' :
                      (['stake_check', 'hsm_sign', 'complete'].includes(verificationStep) ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-500/5 border-neutral-850 opacity-15')
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <CheckCircle className={`w-4 h-4 ${
                            verificationStep === 'linter_eval' ? 'text-emerald-400 animate-spin animate-duration-1000' :
                            (['stake_check', 'hsm_sign', 'complete'].includes(verificationStep) ? 'text-emerald-400' : 'text-neutral-500')
                          }`} />
                          <span className="text-xs font-bold font-mono tracking-tight text-neutral-200">2. Static Audit Scanner (DevSecOps)</span>
                        </div>
                        {['stake_check', 'hsm_sign', 'complete'].includes(verificationStep) && (
                          <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                            attestationReport.auditValidation.linterStatus === 'failed' ? 'text-red-400 bg-red-950 border border-red-500/30 font-extrabold' : 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/20'
                          }`}>
                            {attestationReport.auditValidation.linterStatus === 'failed' ? 'CRITICAL_FAIL' : 'COMPLIANT'}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-[11px] text-neutral-400 font-mono space-y-1 pl-6">
                        <div>Regex Rule Scanners: <span className="text-neutral-250 font-bold uppercase">{attestationReport.auditValidation.regexPatternScanner}</span></div>
                        <div>Identified Vulnerant CWEs: <span className={attestationReport.auditValidation.cweViolationsCount > 0 ? 'text-red-400 font-bold' : 'text-neutral-300'}>{attestationReport.auditValidation.cweViolationsCount} violations</span></div>
                        <div>Linter Output Status: <span className="text-neutral-300 uppercase">{attestationReport.auditValidation.linterStatus}</span></div>
                      </div>
                    </div>

                    {/* Step 3: Staking logic */}
                    <div className={`p-4 rounded-lg border transition-all ${
                      verificationStep === 'stake_check' ? 'bg-emerald-950/20 border-emerald-500/50 scale-[1.01]' :
                      (['hsm_sign', 'complete'].includes(verificationStep) ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-500/5 border-neutral-850 opacity-15')
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <CheckCircle className={`w-4 h-4 ${
                            verificationStep === 'stake_check' ? 'text-emerald-400 animate-spin animate-duration-1000' :
                            (['hsm_sign', 'complete'].includes(verificationStep) ? 'text-emerald-400' : 'text-neutral-500')
                          }`} />
                          <span className="text-xs font-bold font-mono tracking-tight text-neutral-200">3. Proof-of-Security Staking Balance</span>
                        </div>
                        {['hsm_sign', 'complete'].includes(verificationStep) && (
                          <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${
                            attestationReport.auditValidation.linterStatus === 'failed' ? 'text-red-400 bg-red-950 border-red-500/30 font-extrabold' : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/20'
                          }`}>
                            {attestationReport.auditValidation.linterStatus === 'failed' ? 'DEP_BURNT' : 'ACTIVE_DEPOSIT'}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-[11px] text-neutral-400 font-mono space-y-1 pl-6">
                        <div>Staking Lock Account: <span className="text-neutral-300 truncate font-bold text-[10px] select-all">{attestationReport.kmsHsmSigning.keyName === 'vrav-auth-release-signer' ? '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' : '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f'}</span></div>
                        <div>Reputation Liquidity: <span className="text-neutral-250 font-bold">{attestationReport.auditValidation.linterStatus === 'failed' ? '0 MATIC (FORFEITED)' : 'Active locked asset'}</span></div>
                        <div>Block Attestation ID: <span className="text-neutral-300 font-mono">0x25D1...{attestationReport.reportId.slice(-6)}</span></div>
                      </div>
                    </div>

                    {/* Step 4: Asymmetric HSM / KMS Signature */}
                    <div className={`p-4 rounded-lg border transition-all ${
                      verificationStep === 'hsm_sign' ? 'bg-emerald-950/20 border-emerald-500/50 scale-[1.01]' :
                      (verificationStep === 'complete' ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-500/5 border-neutral-850 opacity-15')
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <CheckCircle className={`w-4 h-4 ${
                            verificationStep === 'hsm_sign' ? 'text-emerald-400 animate-spin animate-duration-1000' :
                            (verificationStep === 'complete' ? 'text-emerald-400' : 'text-neutral-500')
                          }`} />
                          <span className="text-xs font-bold font-mono tracking-tight text-neutral-200">4. Google Cloud KMS Asymmetric Key Authentication</span>
                        </div>
                        {verificationStep === 'complete' && (
                          <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${
                            attestationReport.auditValidation.linterStatus === 'failed' ? 'text-red-400 bg-red-950 border-red-500/30' : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/20'
                          }`}>
                            {attestationReport.auditValidation.linterStatus === 'failed' ? 'CERT_REVOKED' : 'SECURE_HSM'}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-[11px] text-neutral-400 font-mono space-y-1 pl-6">
                        <div className="truncate">Key Reference Path: <span className="text-neutral-300 font-bold" title={attestationReport.kmsHsmSigning.keyResourcePath}>{attestationReport.kmsHsmSigning.keyResourcePath}</span></div>
                        <div>Algorithm Family: <span className="text-neutral-300">{attestationReport.kmsHsmSigning.signatureAlgorithm}</span></div>
                        <div className="truncate text-[10px] text-emerald-450">Signature Payload: <span className="text-emerald-400 select-all">{attestationReport.kmsHsmSigning.hsmSignature}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Manual trigger control */}
                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div>
                      {verificationStep === 'complete' ? (
                        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider animate-bounce">
                          <CheckCircle className="w-4 h-4" />
                          <span>ALL DEPLOYMENT CONTROLLERS VALIDATED CLEAN!</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-neutral-500">
                          {isAttestationVerifying ? 'Verifying consensus nodes...' : 'Verification engine is currently idling.'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleStartAttestationVerification}
                      disabled={isAttestationVerifying}
                      className="px-4 py-2.5 text-xs font-bold font-mono bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-850 hover:border-emerald-500 text-white rounded-lg border border-emerald-700 tracking-wider shadow-md uppercase transition-all duration-200 disabled:opacity-50 select-none cursor-pointer"
                    >
                      {isAttestationVerifying ? 'VERIFYING STACK...' : 'RUN VERIFICATION'}
                    </button>
                  </div>
                </div>

                {/* Right Side: Raw JSON report document */}
                <div className="lg:col-span-6 p-6 flex flex-col justify-between h-full bg-neutral-950">
                  <div className="space-y-4 flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-neutral-300 tracking-wider flex items-center space-x-1.5">
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span>VERIFIED_ATTESTATION_SPEC.JSON</span>
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(attestationReport, null, 2));
                          alert('Attestation JSON Report structure copied to clipboard.');
                        }}
                        className="text-[10px] font-mono border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white px-2.5 py-1 rounded bg-neutral-900 cursor-pointer"
                      >
                        [COPY JSON]
                      </button>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-850 rounded-lg p-3.5 h-[340px] overflow-y-auto font-mono text-[10px] text-emerald-400/90 leading-relaxed scrollbar-thin">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(attestationReport, null, 2)}</pre>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-800/80 flex items-start gap-2.5 text-[10px] text-neutral-400 leading-relaxed">
                    <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      VRAV Security Core provides hardware-locked non-repudiation. Unfalsifiable report parameters represent raw asymmetric signature states generated strictly at build time in secure remote hardware.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Workspace Footer details */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-6 text-center text-xs text-neutral-400 font-mono mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span className="font-bold tracking-wider text-neutral-300">VRAV SECURITY HUB CORE</span>
          </div>
          <span className="text-neutral-500 font-semibold">Zero-Trust Dec-App Store DevSecOps Console © 2026. Designed for Absolute Compliance.</span>
        </div>
      </footer>
    </div>
  );
}

