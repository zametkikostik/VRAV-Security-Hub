import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import App from './App';
import { WalletBar } from './components/WalletBar';
import { GitHubCatalog } from './components/GitHubCatalog';
import { OperatorSetup } from './components/OperatorSetup';
import { wagmiConfig } from './lib/wagmiConfig';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#10b981',
            accentColorForeground: '#0a0a0a',
            borderRadius: 'large',
          })}
          modalSize="compact"
        >
          <WalletBar />
          <GitHubCatalog />
          <OperatorSetup />
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
