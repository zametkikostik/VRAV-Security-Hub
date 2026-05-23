# 🛡️ VRAV Security Hub & Decentralized App Store

[!["Built with React"](https://img.shields.io/badge/Frontend-React%2019-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[!["TypeScript"](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[!["Tailwind CSS v4"](https://img.shields.io/badge/Styles-Tailwind%20CSS%20v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[!["Vite v6"](https://img.shields.io/badge/Bundler-Vite%20v6-646cff?style=for-the-badge&logo=vite)](https://vite.dev/)
[!["Gemini API Enabled"](https://img.shields.io/badge/AI--Scanner-Gemini%20API-de5b8b?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)
[!["License: MIT"](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://opensource.org/licenses/MIT)

An advanced web application sandbox simulating a **Zero-Trust Decentralized App Store** built with React, TypeScript, and Tailwind CSS. The system integrates automated and AI-enhanced static analysis linter mechanics, Proof-of-Security (PoS) stake/slash governance, decentralized IPFS gateways, and cryptographic HSM cloud attestation standards.

---

## 🗺️ Architectural Concept Map

This diagram illustrates how code moves from local developer sandboxes through security gates onto the decentralized hub:

```text
               +----------------------------------------+
               |      Developer Custom Software         |
               +----------------------------------------+
                                    |
                                    v
               +----------------------------------------+
               | PHASE 2: AI static linter scan         |
               | (Secret / API leak Check via Gemini)   |
               +----------------------------------------+
                                    |
                                    v
               +----------------------------------------+
               | PHASE 3: CI/CD Publisher Dashboard     |
               | (Generate IPFS metadata manifest)      |
               +----------------------------------------+
                                    |
                                    v
               +----------------------------------------+
               | PHASE 4: PoS Collateral Staking Block  |
               | (Burn MATIC on active threat level)    |
               +----------------------------------------+
                                    |
                                    v
               +----------------------------------------+
               | PHASE 5: Cryptographic KMS/HSM Sign    |
               | (Cloud Attestation SHA-256 Authority)  |
               +----------------------------------------+
                                    |
                                    v
               +----------------------------------------+
               | PHASE 1: Zero-Trust App Store Market   |
               | (Secure installation & local gateway)  |
               +----------------------------------------+
```

---

## ⚡ Key Core Features

### 🛍️ Phase 1: Dec-App Marketplace Store
* **Zero-Trust Sandbox Model**: Visual indicators showing virus status, trusted key-signature hashes, and estimated gateway latencies.
* **On-Demand Gateway configuration**: Instantly swap or benchmark your underlying IPFS node gates.
* **Granular Permission Indicators**: Audit permissions (camera, location, network access) of listed app candidates before downloading.

### 🔍 Phase 2: AI-Powered Static Code Audit Scanner
* **Custom Code Linter Integration**: Allows developers to paste customized script payloads, select preloaded application templates, or choose standard YAML presets.
* **Security Multi-Scanner Filters**: Toggle vulnerability categories like Hardcoded Secret Leaks, Dangerous Network API invocations, and Reflection vectors.
* **Gemini Smart Report Analysis**: Powered by Google Gemini (`@google/genai`) to generate full deep-dive logs explaining why the scanned codebase contains critical backdoor vulnerabilities.

### ⚙️ Phase 3: P2P Publishing Sandbox 
* **Dynamic Manifest Generator**: Define, modify, and update custom developer metadata formats including app description, version standards, and custom IPFS storage identifiers.
* **Automated Code Formatting Hooks**: Instantly analyze code configurations with automated validation tests pre-publish.

### 🪙 Phase 4: Proof-of-Security Staking Console
* **On-Chain Collateral Model**: Protects consumers by locking core MATIC tokens on-chain against listed developer addresses.
* **Simulated Slashing Daemon**: If threat vectors or active policy bypass parameters are detected, users can manually trigger a **Slashing Transaction** that decreases developer trust score to 0% and burns collateral instantly.

### 🔑 Phase 5: Cryptographic Cloud KMS/HSM Attestation
* **SHA-256 Digital Fingerprint Verifiers**: Displays real-time cryptographic attestation logs containing secure system keys.
* **Hardware Security Module Signatures**: Prevents malicious injection inside transport layer assets by checking verified KMS hashes.

---

## 🛠️ Stack Configuration & Technologies

* **Frontend Engine**: `React 19` styled with `Tailwind CSS 4` and accelerated by lightweight, smooth custom spring physics via `Motion React`.
* **Backend Runtime**: `Express` API server loaded with typescript support via modern `tsx` node command loaders.
* **Security AI Layer**: Official Google `@google/genai` TypeScript SDK interfacing seamlessly with server-side API proxy controllers.

---

## 🚀 Speedrun Quick-Start

### 1. Prerequisites
Ensure you have the latest stable Node.js version installed:
```bash
node -v  # Recommended: Node 20+
npm -v   # Recommended: npm 10+
```

### 2. Live Local Workspace Setup
Clone the repository and install clean node registry packages:
```bash
# Install core workspace items
npm install
```

### 3. Environment Variables
For optimal Gemini Static Code Auditing, create a `.env` file inside your repository root containing:
```env
# Google Developer Console API access
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Running the Dev Server
Launch your fully hot-reloaded development portal listening on port `3000`:
```bash
npm run dev
```

### 5. Build for Production Compilation
Compile client assets into optimized, statically cached files under `/dist`:
```bash
npm run build
```

---

## 🛡️ Zero-Trust Security Policy

All simulated decentralized applications inside this platform must present a certified HSM signature before client invocation. AI Static audits are evaluated using modern, zero-bias vector definitions under sandbox conditions.

Designed with high design standard focus, professional typography pairings, spacious grid padding, and responsive layouts.
