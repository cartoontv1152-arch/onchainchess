import React, { useState, useEffect } from 'react';
import { useDynamicContext, DynamicConnectButton } from '@dynamic-labs/sdk-react-core';
import { croissantWallet } from '../services/wallet/croissant-wallet';
import { formatAddress } from '../utils/chessUtils';

const WalletSelector = ({ onWalletConnected, onWalletDisconnected }) => {
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [croissantAccount, setCroissantAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check for installed wallets on mount
  useEffect(() => {
    checkInstalledWallets();
  }, []);

  const checkInstalledWallets = () => {
    const hasCroissant = croissantWallet.isInstalled();
    const hasLinera = typeof window !== 'undefined' && !!window.linera;
    
    console.log('Installed wallets:', { hasCroissant, hasLinera });
  };

  const handleConnectCroissant = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!croissantWallet.isInstalled()) {
        throw new Error(
          'Croissant wallet not installed. Please install from https://croissant.linera.io'
        );
      }

      const accounts = await croissantWallet.connect();
      if (accounts && accounts.length > 0) {
        setCroissantAccount(accounts[0]);
        setSelectedWallet('croissant');
        if (onWalletConnected) {
          onWalletConnected(accounts[0], 'croissant');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to connect Croissant wallet');
      console.error('Croissant connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };


  const handleConnectLineraExtension = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.linera) {
        throw new Error(
          'Linera wallet extension not installed. Please install from https://github.com/linera-io/linera-protocol/releases'
        );
      }

      const accounts = await window.linera.request({ method: 'linera_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setSelectedWallet('linera-extension');
        if (onWalletConnected) {
          onWalletConnected(accounts[0], 'linera-extension');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to connect Linera extension');
      console.error('Linera extension connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (selectedWallet === 'croissant') {
        croissantWallet.disconnect();
        setCroissantAccount(null);
      } else if (selectedWallet === 'dynamic') {
        if (handleLogOut) {
          await handleLogOut();
        }
      }

      setSelectedWallet(null);
      if (onWalletDisconnected) {
        onWalletDisconnected();
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const isCroissantInstalled = croissantWallet.isInstalled();
  const isLineraExtensionInstalled = typeof window !== 'undefined' && !!window.linera;
  const isDynamicConnected = !!primaryWallet?.address;

  return (
    <div className="wallet-selector">
      <h3 className="wallet-selector-title">Connect Wallet</h3>
      
      {error && (
        <div className="wallet-error">
          {error}
        </div>
      )}

      <div className="wallet-options">
        {/* Dynamic Wallet */}
        <div className="wallet-option">
          <div className="wallet-option-header">
            <span className="wallet-name">Dynamic Wallet</span>
            {isDynamicConnected && (
              <span className="wallet-status connected">Connected</span>
            )}
          </div>
          <p className="wallet-description">
            Connect using Dynamic Labs wallet (Ethereum compatible)
          </p>
          <DynamicConnectButton />
        </div>

        {/* Croissant Wallet */}
        <div className="wallet-option">
          <div className="wallet-option-header">
            <span className="wallet-name">Croissant</span>
            {isCroissantInstalled ? (
              <span className="wallet-status available">Available</span>
            ) : (
              <span className="wallet-status unavailable">Not Installed</span>
            )}
            {selectedWallet === 'croissant' && croissantAccount && (
              <span className="wallet-status connected">Connected</span>
            )}
          </div>
          <p className="wallet-description">
            Browser extension wallet for Linera (Recommended for Wavehack)
          </p>
          {isCroissantInstalled ? (
            selectedWallet === 'croissant' && croissantAccount ? (
              <div className="wallet-connected">
                <span>{formatAddress(croissantAccount)}</span>
                <button onClick={handleDisconnect} className="disconnect-button">
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectCroissant}
                disabled={isConnecting}
                className="connect-button"
              >
                {isConnecting ? 'Connecting...' : 'Connect Croissant'}
              </button>
            )
          ) : (
            <a
              href="https://croissant.linera.io"
              target="_blank"
              rel="noopener noreferrer"
              className="install-link"
            >
              Install Croissant Wallet
            </a>
          )}
        </div>

        {/* Linera Extension */}
        <div className="wallet-option">
          <div className="wallet-option-header">
            <span className="wallet-name">Linera Extension</span>
            {isLineraExtensionInstalled ? (
              <span className="wallet-status available">Available</span>
            ) : (
              <span className="wallet-status unavailable">Not Installed</span>
            )}
            {selectedWallet === 'linera-extension' && (
              <span className="wallet-status connected">Connected</span>
            )}
          </div>
          <p className="wallet-description">
            Official Linera wallet browser extension
          </p>
          {isLineraExtensionInstalled ? (
            selectedWallet === 'linera-extension' ? (
              <div className="wallet-connected">
                <button onClick={handleDisconnect} className="disconnect-button">
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectLineraExtension}
                disabled={isConnecting}
                className="connect-button"
              >
                {isConnecting ? 'Connecting...' : 'Connect Extension'}
              </button>
            )
          ) : (
            <a
              href="https://github.com/linera-io/linera-protocol/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="install-link"
            >
              Install Linera Extension
            </a>
          )}
        </div>
      </div>

      <div className="wallet-info">
        <p className="wallet-info-text">
          <strong>For Wavehack Submission:</strong> Use Croissant wallet
          to connect to Testnet Conway.
        </p>
      </div>
    </div>
  );
};

export default WalletSelector;
