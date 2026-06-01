import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { formatAddress } from '../../utils/format';

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function RecentMintsFeed() {
  const recentMints = useStore((s) => s.recentMints);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <h4 className="font-display text-sm font-bold uppercase tracking-wider text-text/80">Live Mints</h4>
      </div>
      <div className="space-y-2 max-h-[260px] overflow-hidden">
        <AnimatePresence initial={false}>
          {recentMints.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs text-text/60">{formatAddress(m.address)}</span>
                <span className="text-xs truncate" style={{ color: m.houseColor }}>{m.house}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${m.tierColor}33`, color: m.tierColor }}>
                  {m.tier}
                </span>
                <span className="text-[10px] text-text/40">{timeAgo(m.timestamp)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
