import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Shield, Zap, Lock, Award, Users, Check } from 'lucide-react';
import MintButton from '../ui/MintButton';
import TraitSlotMachine from '../ui/TraitSlotMachine';
import RecentMintsFeed from '../ui/RecentMintsFeed';
import CountdownTimer from '../ui/CountdownTimer';
import ProgressBar from '../ui/ProgressBar';
import HouseCoatOfArms from '../ui/HouseCoatOfArms';
import { useWallet } from '../../hooks/useWallet';
import { useMint } from '../../hooks/useMint';
import { useSupply } from '../../hooks/useSupply';
import { useStore } from '../../store/useStore';
import { MINT_PHASES, HOUSES } from '../../data/collection';
import { CONTRACT_DEPLOYED } from '../../utils/constants';

const TRUST = [
  { icon: <Shield size={16} />, text: 'Audited LSP8 contract on LUKSO' },
  { icon: <Zap size={16} />, text: 'Instant on-chain reveal' },
  { icon: <Lock size={16} />, text: 'Owned by your Universal Profile' },
  { icon: <Award size={16} />, text: 'Provably fair rarity rolls' },
  { icon: <Users size={16} />, text: 'Join 1,400+ minted souls' },
];

export default function MintSection() {
  const [phaseId, setPhaseId] = useState(MINT_PHASES.find((p) => p.status === 'live')?.id ?? 1);
  const [wlAddress, setWlAddress] = useState('');
  const [wlResult, setWlResult] = useState(null);

  const { wallet, connect, switchNetwork } = useWallet();
  const { mint, doMint } = useMint();
  const { totalMinted, totalSupply, percent, remaining, soldOut } = useSupply();
  const quantity = useStore((s) => s.mint.quantity);
  const setQuantity = useStore((s) => s.setQuantity);

  const phase = MINT_PHASES.find((p) => p.id === phaseId);
  const unit = phase.price;
  const total = (unit * quantity).toFixed(0);

  let buttonState = 'CONNECTED';
  if (!CONTRACT_DEPLOYED) buttonState = 'NOT_DEPLOYED';
  else if (soldOut) buttonState = 'SOLD_OUT';
  else if (!wallet.connected) buttonState = wallet.connecting ? 'CONNECTING' : 'NO_WALLET';
  else if (mint.status === 'minting') buttonState = 'MINTING';
  else if (mint.status === 'error') buttonState = 'ERROR';
  else if (mint.status === 'success') buttonState = 'SUCCESS';

  const handleMint = () => {
    if (!wallet.connected) { connect(); return; }
    if (wallet.wrongNetwork) { switchNetwork(); return; }
    doMint(quantity);
  };

  const checkWhitelist = () => {
    // Mock check: addresses ending in even hex char are whitelisted
    const ok = /^0x[0-9a-fA-F]{40}$/.test(wlAddress) && parseInt(wlAddress.slice(-1), 16) % 2 === 0;
    setWlResult(ok ? 'eligible' : 'not-eligible');
  };

  const previewHouse = HOUSES[0];

  return (
    <section id="mint" className="py-24 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Urgency strip */}
      <div className="glass rounded-2xl px-5 py-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <span className="font-display font-bold uppercase tracking-wider text-sm">Mint Live — Ends In</span>
          <CountdownTimer compact />
        </div>
        <div className="w-full md:w-64">
          <ProgressBar value={totalMinted} max={totalSupply} color="#FE60A0" label={`${totalMinted}/${totalSupply}`} />
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">Mint Your Soul</h2>
        <p className="text-text/60 font-body">Roll your traits, claim your house, and write yourself into the saga.</p>
      </div>

      {/* Phase tabs */}
      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {MINT_PHASES.map((p) => (
          <button
            key={p.id}
            onClick={() => p.status !== 'ended' && setPhaseId(p.id)}
            disabled={p.status === 'ended'}
            className={`px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition ${
              phaseId === p.id ? 'bg-gradient-to-r from-accent to-purple text-white' : 'glass hover:bg-white/10'
            } ${p.status === 'ended' ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
          >
            {p.name} · {p.price} LYX
            <span className="block text-[10px] uppercase opacity-70">{p.status}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: preview + slot machine */}
        <div className="space-y-6">
          <motion.div
            className="glass rounded-2xl p-8 flex flex-col items-center"
            animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }}
          >
            <HouseCoatOfArms houseId={previewHouse.id} size={140} />
            <p className="font-display text-xl font-bold mt-4 text-gradient">Your Soul Awaits</p>
            <p className="text-text/50 text-sm">Mint to reveal your house, rank & rarity</p>
          </motion.div>
          <div className="glass rounded-2xl p-6">
            <h4 className="font-display font-bold mb-4">Preview Trait Roll</h4>
            <TraitSlotMachine />
          </div>
        </div>

        {/* Right: mint controls */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-text/40">Current Phase</p>
                <p className="font-display text-xl font-bold">{phase.name}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent/20 text-accent uppercase">{phase.status}</span>
            </div>

            {/* Quantity stepper */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text/60">Quantity (max 10)</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(quantity - 1)} className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-white/10 disabled:opacity-40" disabled={quantity <= 1}><Minus size={16} /></button>
                <span className="font-display text-xl font-bold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-white/10 disabled:opacity-40" disabled={quantity >= 10}><Plus size={16} /></button>
              </div>
            </div>

            {/* Price summary */}
            <div className="glass rounded-xl p-4 mb-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-text/60">Unit price</span><span>{unit} LYX</span></div>
              <div className="flex justify-between"><span className="text-text/60">Quantity</span><span>× {quantity}</span></div>
              <div className="flex justify-between font-display font-bold text-lg pt-1 border-t border-white/10"><span>Total</span><span className="text-accent">{total} LYX</span></div>
            </div>

            <MintButton state={buttonState} onClick={handleMint} />
            {mint.status === 'error' && <p className="text-xs text-red-400 mt-2">{mint.error}</p>}
            {!CONTRACT_DEPLOYED && <p className="text-xs text-text/40 mt-2 text-center">The contract address is a placeholder. Minting is simulated for preview.</p>}

            {/* Trust signals */}
            <ul className="mt-5 space-y-2">
              {TRUST.map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-text/70">
                  <span className="text-accent">{t.icon}</span> {t.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Whitelist check (phase 1) */}
          {phase.id === 1 && (
            <div className="glass rounded-2xl p-6">
              <h4 className="font-display font-bold mb-3">Check Whitelist Eligibility</h4>
              <div className="flex gap-2">
                <input
                  value={wlAddress}
                  onChange={(e) => { setWlAddress(e.target.value); setWlResult(null); }}
                  placeholder="Universal Profile address (0x…)"
                  className="flex-1 glass rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none focus:border-accent/50"
                />
                <button onClick={checkWhitelist} className="px-4 rounded-lg font-display font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition">Check</button>
              </div>
              {wlResult === 'eligible' && <p className="text-sm text-green-400 mt-2 flex items-center gap-1"><Check size={14} /> Eligible for the Whitelist Sale!</p>}
              {wlResult === 'not-eligible' && <p className="text-sm text-red-400 mt-2">Not on the whitelist. Request access below or wait for Public Sale.</p>}
            </div>
          )}

          <RecentMintsFeed />
        </div>
      </div>

      {/* Mint progress + house competition */}
      <div className="mt-12 grid lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6">
          <h4 className="font-display font-bold mb-4">Mint Progress</h4>
          <ProgressBar value={totalMinted} max={totalSupply} color="#7B5CFF" label={`${remaining} souls remaining`} />
          <p className="text-sm text-text/50 mt-3">{percent.toFixed(1)}% of {totalSupply.toLocaleString()} minted.</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h4 className="font-display font-bold mb-4">House Competition</h4>
          <div className="space-y-3">
            {HOUSES.slice(0, 5).map((h) => (
              <ProgressBar key={h.id} value={Math.floor(h.supply * (percent / 100))} max={h.supply} color={h.color} label={h.name} showPercent={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
