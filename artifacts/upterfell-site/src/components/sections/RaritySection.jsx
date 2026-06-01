import { useState } from 'react';
import { motion } from 'framer-motion';
import RarityCard from '../ui/RarityCard';
import { RARITY_TIERS, TRAITS, UP_0001, COLLECTION } from '../../data/collection';

const EXPLORER = [
  { key: 'Rank', options: TRAITS.ranks },
  { key: 'Class', options: TRAITS.classes },
  { key: 'Armor', options: TRAITS.armors },
  { key: 'Weapon', options: TRAITS.weapons },
  { key: 'Aura', options: TRAITS.auras },
  { key: 'Familiar', options: TRAITS.familiars },
];

export default function RaritySection() {
  const [sel, setSel] = useState(() => Object.fromEntries(EXPLORER.map((e) => [e.key, e.options[0]])));

  return (
    <section id="rarity" className="py-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-accent font-display uppercase tracking-widest text-sm mb-3">Rarity & Lore</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Five Tiers of Destiny</h2>
      </div>

      {/* Stacked distribution bar */}
      <div className="mb-12">
        <div className="flex w-full h-8 rounded-full overflow-hidden border border-white/10">
          {RARITY_TIERS.map((t) => (
            <motion.div
              key={t.name}
              className="h-full flex items-center justify-center text-[10px] font-bold text-white/90"
              style={{ background: t.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${t.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              title={`${t.name} — ${t.pct}%`}
            >
              {t.pct >= 5 ? `${t.pct}%` : ''}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
        {RARITY_TIERS.map((t) => <RarityCard key={t.name} tier={t} />)}
      </div>

      {/* UP-0001 spotlight */}
      <div className="relative glass rounded-3xl p-8 md:p-12 mb-16 overflow-hidden">
        <span className="absolute inset-0 flex items-center justify-center font-display font-black text-[28vw] md:text-[18vw] text-white/[0.03] pointer-events-none select-none">
          UP-0001
        </span>
        <div className="relative">
          <p className="text-accent font-display uppercase tracking-widest text-sm mb-2">The First Soul</p>
          <h3 className="font-display text-4xl md:text-5xl font-bold mb-2">{UP_0001.id}</h3>
          <p className="text-text/70 font-body max-w-2xl mb-6">{UP_0001.lore}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['House', UP_0001.house], ['Rank', UP_0001.rank], ['Class', UP_0001.class], ['Origin', UP_0001.origin],
              ['Armor', UP_0001.armor], ['Weapon', UP_0001.weapon], ['Tier', UP_0001.tier], ['Score', `${UP_0001.score} (${UP_0001.pct})`],
            ].map(([k, v]) => (
              <div key={k} className="glass rounded-lg px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-text/40">{k}</p>
                <p className="font-display font-semibold text-sm">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trait explorer */}
      <div className="glass rounded-3xl p-8">
        <h3 className="font-display text-2xl font-bold mb-1">Trait Explorer</h3>
        <p className="text-text/60 font-body mb-6">Mix and match traits across the {COLLECTION.totalSupply.toLocaleString()} souls.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {EXPLORER.map((e) => (
            <div key={e.key}>
              <label className="block text-xs uppercase tracking-wider text-text/40 mb-1">{e.key}</label>
              <select
                value={sel[e.key]}
                onChange={(ev) => setSel((p) => ({ ...p, [e.key]: ev.target.value }))}
                className="w-full glass rounded-lg px-3 py-2.5 text-sm bg-bg2 outline-none focus:border-accent/50"
              >
                {e.options.map((o) => <option key={o} value={o} className="bg-bg2">{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
