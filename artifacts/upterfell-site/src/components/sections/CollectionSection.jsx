import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import HouseCard from '../ui/HouseCard';
import AnimatedCounter from '../ui/AnimatedCounter';
import { HOUSES } from '../../data/collection';

const FILTERS = ['All', 'Largest Supply', 'Rarest'];
const STATS = [
  { label: 'Total NFTs', value: 7250 },
  { label: 'Houses', value: 12 },
  { label: 'Ranks', value: 9 },
  { label: 'Weapons', value: 120 },
  { label: 'Armors', value: 52 },
  { label: 'Classes', value: 12 },
];

export default function CollectionSection() {
  const [filter, setFilter] = useState('All');

  const houses = useMemo(() => {
    const arr = [...HOUSES];
    if (filter === 'Largest Supply') return arr.sort((a, b) => b.supply - a.supply);
    if (filter === 'Rarest') return arr.sort((a, b) => a.supply - b.supply);
    return arr;
  }, [filter]);

  return (
    <section id="houses" className="py-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-accent font-display uppercase tracking-widest text-sm mb-3">The Twelve Houses</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Choose Your Allegiance</h2>
        <p className="text-text/60 max-w-2xl mx-auto font-body">Each house governs a LUKSO Standard Protocol. Click any sigil to learn its lore.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {STATS.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <div className="font-display text-3xl font-bold text-gradient">
              <AnimatedCounter value={s.value} />
            </div>
            <div className="text-xs text-text/50 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-display font-semibold transition ${
              filter === f ? 'bg-gradient-to-r from-accent to-purple text-white' : 'glass hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {houses.map((h) => <HouseCard key={h.id} house={h} />)}
      </motion.div>
    </section>
  );
}
