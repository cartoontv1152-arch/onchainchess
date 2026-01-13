import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import GraphQLProvider from "./providers/GraphQLProvider";
import { WalletProvider } from './providers';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import App from "./App";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <details>
            <summary>Technical Details</summary>
            <pre>{this.state.error && this.state.error.toString()}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ErrorBoundary>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<DefaultApp />} />
        <Route path=":id" element={<ChessApp />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);

function DefaultApp() {
  const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;
  const APP_ID = import.meta.env.VITE_APP_ID;
  const OWNER_ID = import.meta.env.VITE_OWNER_ID;
  const PORT = import.meta.env.VITE_PORT || "8080";
  const HOST = import.meta.env.VITE_HOST || "localhost";

  if (!CHAIN_ID || !APP_ID || !OWNER_ID) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">♟️ OnChain Chess</h1>
        </header>
        <main className="main-content">
          <div className="setup-required">
            <h2>Configuration Required</h2>
            <p>Please set the following environment variables:</p>
            <ul>
              <li>VITE_CHAIN_ID</li>
              <li>VITE_APP_ID</li>
              <li>VITE_OWNER_ID</li>
            </ul>
            <p>Or access the app with URL parameters:</p>
            <code>
              /:CHAIN_ID?app=APP_ID&owner=OWNER_ID&port=8080
            </code>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DynamicContextProvider
        settings={{
          environmentId: '2a6a2498-e013-4b1b-983a-cb2a53cd7d9d',
          appName: 'OnChain Chess',
          initialAuthenticationMode: 'connect-only',
          walletConnectors: [EthereumWalletConnectors],
          events: {
            onAuthSuccess: () => {},
            onAuthError: () => {},
            onLogout: () => {}
          }
        }}
      >
        <WalletProvider appChainId={CHAIN_ID}>
          <GraphQLProvider
            chainId={CHAIN_ID}
            applicationId={APP_ID}
            port={PORT}
            host={HOST}
          >
            <App
              chainId={CHAIN_ID}
              appId={APP_ID}
              ownerId={OWNER_ID}
            />
          </GraphQLProvider>
        </WalletProvider>
      </DynamicContextProvider>
    </ErrorBoundary>
  );
}

function ChessApp() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  try {
    const CHAIN_ID = id;
    const APP_ID = searchParams.get("app") || import.meta.env.VITE_APP_ID;
    const OWNER_ID = searchParams.get("owner") || import.meta.env.VITE_OWNER_ID;
    const PORT = searchParams.get("port") || import.meta.env.VITE_PORT || "8080";
    const HOST = searchParams.get("host") || import.meta.env.VITE_HOST || "localhost";

    if (!CHAIN_ID || !APP_ID || !OWNER_ID) {
      return (
        <div className="app-container">
          <header className="app-header">
            <h1 className="app-title">♟️ OnChain Chess</h1>
          </header>
          <main className="main-content">
            <div className="setup-required">
              <h2>Invalid URL Parameters</h2>
              <p>Please provide valid Chain ID, App ID, and Owner ID in the URL.</p>
            </div>
          </main>
        </div>
      );
    }

    return (
      <ErrorBoundary>
        <DynamicContextProvider
          settings={{
            environmentId: '2a6a2498-e013-4b1b-983a-cb2a53cd7d9d',
            appName: 'OnChain Chess',
            initialAuthenticationMode: 'connect-only',
            walletConnectors: [EthereumWalletConnectors],
            events: {
              onAuthSuccess: () => {},
              onAuthError: () => {},
              onLogout: () => {}
            }
          }}
        >
          <WalletProvider appChainId={CHAIN_ID}>
            <GraphQLProvider
              chainId={CHAIN_ID}
              applicationId={APP_ID}
              port={PORT}
              host={HOST}
            >
              <App
                chainId={CHAIN_ID}
                appId={APP_ID}
                ownerId={OWNER_ID}
              />
            </GraphQLProvider>
          </WalletProvider>
        </DynamicContextProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">♟️ OnChain Chess</h1>
        </header>
        <main className="main-content">
          <div className="error-state">
            <h2>Application Error</h2>
            <p>An error occurred while loading the application:</p>
            <pre>{error.toString()}</pre>
          </div>
        </main>
      </div>
    );
  }
}
