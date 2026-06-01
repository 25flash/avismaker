import { motion } from 'framer-motion';

export default function ProgressBar({ value, max, color = '#FE60A0', label, showPercent = true }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-2 text-sm">
          {label && <span className="text-text/70 font-body">{label}</span>}
          {showPercent && <span className="font-semibold" style={{ color }}>{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
