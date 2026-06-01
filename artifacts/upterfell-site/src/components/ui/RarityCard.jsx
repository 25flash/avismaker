import React from 'react';
import { motion } from 'framer-motion';

function RarityCard({ tier }) {
  return (
    <motion.div
      className="glass rounded-2xl p-5 relative overflow-hidden"
      style={{ borderColor: `${tier.color}55` }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: tier.color }} />
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-display text-xl font-bold" style={{ color: tier.color }}>{tier.name}</h3>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
          style={{ background: `${tier.color}22`, color: tier.color }}
        >
          {tier.badge}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-display text-3xl font-bold text-text">{tier.count.toLocaleString()}</span>
        <span className="text-text/50 text-sm">souls · {tier.pct}%</span>
      </div>
      <div className="text-xs text-text/60 mb-3">Score range: {tier.scoreRange}</div>
      <div className="text-sm text-text/80 font-body flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: tier.color }} />
        {tier.effect}
      </div>
    </motion.div>
  );
}

export default React.memo(RarityCard);
