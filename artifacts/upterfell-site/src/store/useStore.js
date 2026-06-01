import { create } from 'zustand';
import { COLLECTION, MINT_PHASES, HOUSES, RARITY_TIERS } from '../data/collection';

function randomAddr() {
  const hex = '0123456789abcdef';
  let s = '0x';
  for (let i = 0; i < 40; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

function randomHouse() {
  return HOUSES[Math.floor(Math.random() * HOUSES.length)];
}

function randomTier() {
  return RARITY_TIERS[Math.floor(Math.random() * RARITY_TIERS.length)];
}

const RANKS = ['Peasant', 'Citizen', 'Merchant', 'Knight', 'Lord', 'High Lord', 'King', 'Founder', 'Genesis Founder'];

function makeMockMint(secondsAgo) {
  const house = randomHouse();
  const tier = randomTier();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    address: randomAddr(),
    house: house.name,
    houseColor: house.color,
    rank: RANKS[Math.floor(Math.random() * RANKS.length)],
    tier: tier.name,
    tierColor: tier.color,
    timestamp: Date.now() - secondsAgo * 1000,
  };
}

const initialMints = [
  makeMockMint(12),
  makeMockMint(48),
  makeMockMint(95),
  makeMockMint(160),
  makeMockMint(240),
];

export const useStore = create((set, get) => ({
  // Wallet state
  wallet: {
    address: null,
    chainId: null,
    connected: false,
    connecting: false,
    wrongNetwork: false,
    error: null,
  },
  setWallet: (partial) => set((s) => ({ wallet: { ...s.wallet, ...partial } })),
  disconnectWallet: () =>
    set({
      wallet: {
        address: null,
        chainId: null,
        connected: false,
        connecting: false,
        wrongNetwork: false,
        error: null,
      },
    }),

  // Mint state
  mint: {
    status: 'idle', // idle | minting | success | error
    quantity: 1,
    txHash: null,
    error: null,
    lastMinted: null,
    whitelisted: null,
  },
  setMint: (partial) => set((s) => ({ mint: { ...s.mint, ...partial } })),
  setQuantity: (q) => set((s) => ({ mint: { ...s.mint, quantity: Math.max(1, Math.min(10, q)) } })),

  // Collection state
  collection: {
    totalSupply: COLLECTION.totalSupply,
    totalMinted: 1487,
    currentPhase: MINT_PHASES.find((p) => p.status === 'live') || MINT_PHASES[0],
  },
  setCollection: (partial) => set((s) => ({ collection: { ...s.collection, ...partial } })),
  incrementMinted: (n = 1) =>
    set((s) => ({
      collection: {
        ...s.collection,
        totalMinted: Math.min(s.collection.totalSupply, s.collection.totalMinted + n),
      },
    })),

  // UI state
  ui: {
    walletModalOpen: false,
    houseModalId: null,
    mintSuccessOpen: false,
    mobileMenuOpen: false,
  },
  setUI: (partial) => set((s) => ({ ui: { ...s.ui, ...partial } })),
  openWalletModal: () => set((s) => ({ ui: { ...s.ui, walletModalOpen: true } })),
  closeWalletModal: () => set((s) => ({ ui: { ...s.ui, walletModalOpen: false } })),
  openHouseModal: (id) => set((s) => ({ ui: { ...s.ui, houseModalId: id } })),
  closeHouseModal: () => set((s) => ({ ui: { ...s.ui, houseModalId: null } })),

  // Recent mints feed
  recentMints: initialMints,
  pushMint: (entry) =>
    set((s) => ({ recentMints: [entry, ...s.recentMints].slice(0, 5) })),
  pushRandomMint: () => {
    const m = makeMockMint(0);
    get().pushMint(m);
    return m;
  },
}));
