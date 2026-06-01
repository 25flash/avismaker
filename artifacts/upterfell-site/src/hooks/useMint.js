import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useStore } from '../store/useStore';
import { getContract } from '../utils/contract';
import { CONTRACT_DEPLOYED } from '../utils/constants';
import { HOUSES, RARITY_TIERS } from '../data/collection';

const RANKS = ['Knight', 'Lord', 'High Lord', 'Founder', 'Genesis Founder'];

function randomTokenId() {
  const bytes = new Uint8Array(32);
  (window.crypto || crypto).getRandomValues(bytes);
  return '0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function rollNFT() {
  const house = HOUSES[Math.floor(Math.random() * HOUSES.length)];
  const tier = RARITY_TIERS[Math.floor(Math.random() * RARITY_TIERS.length)];
  return {
    id: `UP-${String(Math.floor(Math.random() * 7250) + 1).padStart(4, '0')}`,
    house: house.name,
    houseColor: house.color,
    rank: RANKS[Math.floor(Math.random() * RANKS.length)],
    tier: tier.name,
    tierColor: tier.color,
    score: Math.floor(Math.random() * 999) + 1,
  };
}

export function useMint() {
  const mint = useStore((s) => s.mint);
  const setMint = useStore((s) => s.setMint);
  const collection = useStore((s) => s.collection);
  const incrementMinted = useStore((s) => s.incrementMinted);
  const pushMint = useStore((s) => s.pushMint);
  const setUI = useStore((s) => s.setUI);
  const wallet = useStore((s) => s.wallet);

  const doMint = useCallback(
    async (quantity = 1) => {
      const phase = collection.currentPhase;
      setMint({ status: 'minting', error: null });

      try {
        if (CONTRACT_DEPLOYED && wallet.connected && window.lukso) {
          const provider = new ethers.BrowserProvider(window.lukso);
          const signer = await provider.getSigner();
          const contract = getContract(signer);
          const value = BigInt(phase.priceWei) * BigInt(quantity);

          for (let i = 0; i < quantity; i++) {
            const tokenId = randomTokenId();
            const tx = await contract.mint(wallet.address, tokenId, true, '0x', {
              value: BigInt(phase.priceWei),
            });
            await tx.wait();
          }
          void value;
        } else {
          // Simulated mint (contract not deployed)
          await new Promise((r) => setTimeout(r, 1800));
        }

        const nft = rollNFT();
        incrementMinted(quantity);
        pushMint({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          address: wallet.address || '0x0000000000000000000000000000000000000000',
          house: nft.house,
          houseColor: nft.houseColor,
          rank: nft.rank,
          tier: nft.tier,
          tierColor: nft.tierColor,
          timestamp: Date.now(),
        });

        setMint({ status: 'success', lastMinted: nft });
        setUI({ mintSuccessOpen: true });
        return nft;
      } catch (err) {
        setMint({ status: 'error', error: err?.message || 'Mint failed' });
        return null;
      }
    },
    [collection.currentPhase, incrementMinted, pushMint, setMint, setUI, wallet.address, wallet.connected]
  );

  return { mint, doMint };
}
