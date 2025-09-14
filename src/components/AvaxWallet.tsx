/* eslint-disable */
// @ts-nocheck
"use client";
import { useState, useEffect } from "react";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
}

export default function AvaxWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
  });

  // Check if MetaMask is installed and available
  const isMetaMaskInstalled = () => {
    if (typeof window === "undefined") return false;

    // Check for MetaMask specifically
    return window.ethereum?.isMetaMask === true;
  };

  // Get MetaMask provider specifically
  const getMetaMaskProvider = () => {
    if (typeof window === "undefined") return null;

    // If there are multiple providers, find MetaMask specifically
    if (window.ethereum?.providers) {
      return window.ethereum.providers.find(
        (provider: any) => provider.isMetaMask
      );
    }

    // If single provider and it's MetaMask
    if (window.ethereum?.isMetaMask) {
      return window.ethereum;
    }

    return null;
  };

  // Connect to wallet
  const connectWallet = async () => {
    const metaMask = getMetaMaskProvider();

    if (!metaMask) {
      alert(
        "MetaMask is not installed or not available. Please install MetaMask and disable other wallet extensions temporarily."
      );
      return;
    }

    try {
      setWallet((prev) => ({ ...prev, isConnecting: true }));

      // Request account access specifically from MetaMask
      const accounts = await metaMask.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];

        // Switch to Avalanche Fuji testnet
        await switchToAvalancheFuji(metaMask);

        // Get balance
        const balance = await getBalance(address, metaMask);

        setWallet({
          isConnected: true,
          address,
          balance,
          isConnecting: false,
        });
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet: " + error.message);
      setWallet((prev) => ({ ...prev, isConnecting: false }));
    }
  };

  // Switch to Avalanche Fuji testnet
  const switchToAvalancheFuji = async (provider: any) => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xA869" }], // 43113 in hex = Avalanche Fuji C-Chain
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xA869", // 43113 in hex
                chainName: "Avalanche Fuji C-Chain",
                nativeCurrency: {
                  name: "AVAX",
                  symbol: "AVAX",
                  decimals: 18,
                },
                rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                blockExplorerUrls: ["https://testnet.snowtrace.io"],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Avalanche Fuji network:", addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  // Get wallet balance
  const getBalance = async (
    address: string,
    provider?: any
  ): Promise<string> => {
    try {
      const metaMask = provider || getMetaMaskProvider();
      if (!metaMask) return "0";

      const balance = await metaMask.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      // Convert from wei to AVAX
      const avaxBalance = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      return avaxBalance;
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0";
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      isConnecting: false,
    });
  };

  // Listen for account changes
  useEffect(() => {
    const metaMask = getMetaMaskProvider();
    if (!metaMask) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== wallet.address) {
        // Update with new account without full reconnection
        const newAddress = accounts[0];
        getBalance(newAddress, metaMask).then((balance) => {
          setWallet((prev) => ({
            ...prev,
            address: newAddress,
            balance,
          }));
        });
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log("Chain changed to:", chainId);
      // Only disconnect if not on Fuji testnet
      if (chainId !== "0xA869") {
        setWallet((prev) => ({
          ...prev,
          isConnected: false,
          address: null,
          balance: null,
        }));
      }
    };

    metaMask.on("accountsChanged", handleAccountsChanged);
    metaMask.on("chainChanged", handleChainChanged);

    return () => {
      if (metaMask.removeListener) {
        metaMask.removeListener("accountsChanged", handleAccountsChanged);
        metaMask.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [wallet.address]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      const metaMask = getMetaMaskProvider();
      if (!metaMask) return;

      try {
        const accounts = await metaMask.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          // Check if we're on the right network
          const chainId = await metaMask.request({
            method: "eth_chainId",
          });

          if (chainId === "0xA869") {
            const address = accounts[0];
            const balance = await getBalance(address, metaMask);

            setWallet({
              isConnected: true,
              address,
              balance,
              isConnecting: false,
            });
          }
        }
      } catch (error) {
        console.error("Failed to check connection:", error);
      }
    };

    checkConnection();
  }, []);

  if (!isMetaMaskInstalled()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-800 mb-2">MetaMask Required</h3>
        <p className="text-sm text-red-600 mb-3">
          MetaMask is not installed or not available. Please install MetaMask
          and disable other wallet extensions (like Phantom) temporarily.
        </p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-medium text-gray-800 mb-3">
        Avalanche Fuji Testnet (MetaMask)
      </h3>

      {!wallet.isConnected ? (
        <button
          onClick={connectWallet}
          disabled={wallet.isConnecting}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {wallet.isConnecting ? "Connecting..." : "Connect MetaMask"}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-sm text-gray-600">Address:</div>
            <div className="font-mono text-sm text-gray-600">
              {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
            </div>
          </div>

          <div className="bg-gray-50 rounded p-3">
            <div className="text-sm text-gray-600">Balance:</div>
            <div className="font-medium text-gray-600">
              {wallet.balance} AVAX
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Connected to Fuji Testnet via MetaMask
          </div>

          <button
            onClick={disconnectWallet}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Disconnect
          </button>
        </div>
      )}

      {!wallet.isConnected && (
        <div className="mt-3 text-xs text-gray-500">
          <p>
            Need testnet AVAX? Get it from the{" "}
            <a
              href="https://faucet.avax.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Avalanche Faucet
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
