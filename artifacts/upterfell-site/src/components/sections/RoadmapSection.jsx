import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Circle, ChevronDown } from 'lucide-react';
import EmailCapture from '../ui/EmailCapture';

const PHASES = [
  { phase: 'Phase 0', title: 'The Founding', status: 'complete', items: ['Lore & 12 houses designed', 'rICO → Mainnet origins mapped', 'Founders Sale (500 souls) sold out'] },
  { phase: 'Phase 1', title: 'Whitelist Sale', status: 'live', items: ['2,500 souls at 10 LYX', 'On-chain rarity reveal', 'Universal Page integration'], whitelist: true },
  { phase: 'Phase 2', title: 'Public Sale', status: 'upcoming', items: ['4,250 souls at 15 LYX', 'Open to all Universal Profiles', 'Live mint leaderboard'] },
  { phase: 'Phase 3', title: 'The Realm Expands', status: 'upcoming', items: ['House governance & voting', 'Trait-based staking', 'Cross-house quests'] },
  { phase: 'Phase 4', title: 'Living Kingdom', status: 'upcoming', items: ['Secondary marketplace tools', 'Lore-driven seasonal events', 'Community treasury'] },
];

function StatusIcon({ status }) {
  if (status === 'complete') return <Check size={16} className="text-green-400" />;
  if (status === 'live') return <Loader2 size={16} className="text-accent animate-spin" />;
  return <Circle size={14} className="text-text/30" />;
}

export default function RoadmapSection() {
  const [open, setOpen] = useState(1);

  return (
    <section id="roadmap" className="py-24 px-4 md:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-accent font-display uppercase tracking-widest text-sm mb-3">The Path Ahead</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">Roadmap</h2>
      </div>

      <div className="relative">
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-white/10 hidden md:block" />
        <div className="space-y-4">
          {PHASES.map((p, i) => (
            <motion.div
              key={p.phase}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative md:pl-12"
            >
              <div className={`absolute left-0 top-4 w-9 h-9 rounded-full glass items-center justify-center hidden md:flex ${p.status === 'live' ? 'pulse-glow' : ''}`}>
                <StatusIcon status={p.status} />
              </div>
              <div className="glass rounded-2xl overflow-hidden">
                <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <div className="flex items-center gap-3">
                    <span className="md:hidden"><StatusIcon status={p.status} /></span>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-text/40">{p.phase} · {p.status}</span>
                      <h3 className="font-display text-xl font-bold">{p.title}</h3>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`transition ${open === i ? 'rotate-180' : ''}`} />
                </button>
                <motion.div initial={false} animate={{ height: open === i ? 'auto' : 0 }} className="overflow-hidden">
                  <div className="px-5 pb-5">
                    <ul className="space-y-2 mb-4">
                      {p.items.map((it) => (
                        <li key={it} className="flex items-center gap-2 text-sm text-text/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {it}
                        </li>
                      ))}
                    </ul>
                    {p.whitelist && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-sm text-text/60 mb-3">Not whitelisted yet? Request access:</p>
                        <EmailCapture compact />
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
