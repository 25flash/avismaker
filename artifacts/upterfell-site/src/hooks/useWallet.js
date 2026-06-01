import { useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { LUKSO_CHAIN_ID, LUKSO_CHAIN_CONFIG } from '../utils/constants';

function getProvider() {
  if (typeof window === 'undefined') return null;
  return window.lukso || null;
}

export function useWallet() {
  const wallet = useStore((s) => s.wallet);
  const setWallet = useStore((s) => s.setWallet);
  const disconnectWallet = useStore((s) => s.disconnectWallet);
  const openWalletModal = useStore((s) => s.openWalletModal);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      openWalletModal();
      return;
    }
    setWallet({ connecting: true, error: null });
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      const wrongNetwork = chainId !== LUKSO_CHAIN_ID;

      setWallet({
        address: accounts[0],
        chainId,
        connected: true,
        connecting: false,
        wrongNetwork,
        error: null,
      });

      if (wrongNetwork) {
        await switchNetwork();
      }
    } catch (err) {
      setWallet({ connecting: false, error: err?.message || 'Failed to connect wallet' });
    }
  }, [openWalletModal, setWallet]);

  const switchNetwork = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return;
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LUKSO_CHAIN_CONFIG.chainId }],
      });
      setWallet({ chainId: LUKSO_CHAIN_ID, wrongNetwork: false });
    } catch (err) {
      if (err?.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [LUKSO_CHAIN_CONFIG],
          });
          setWallet({ chainId: LUKSO_CHAIN_ID, wrongNetwork: false });
        } catch (addErr) {
          setWallet({ error: addErr?.message || 'Failed to add LUKSO network' });
        }
      } else {
        setWallet({ error: err?.message || 'Failed to switch network' });
      }
    }
  }, [setWallet]);

  const disconnect = useCallback(() => {
    disconnectWallet();
  }, [disconnectWallet]);

  useEffect(() => {
    const provider = getProvider();
    if (!provider || !provider.on) return;

    const handleAccounts = (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else {
        setWallet({ address: accounts[0], connected: true });
      }
    };
    const handleChain = (chainIdHex) => {
      const chainId = parseInt(chainIdHex, 16);
      setWallet({ chainId, wrongNetwork: chainId !== LUKSO_CHAIN_ID });
    };

    provider.on('accountsChanged', handleAccounts);
    provider.on('chainChanged', handleChain);

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccounts);
        provider.removeListener('chainChanged', handleChain);
      }
    };
  }, [disconnectWallet, setWallet]);

  return { wallet, connect, disconnect, switchNetwork, hasProvider: !!getProvider() };
}
