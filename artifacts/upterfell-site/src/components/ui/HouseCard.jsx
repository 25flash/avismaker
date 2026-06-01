import React from 'react';
import { motion } from 'framer-motion';
import HouseCoatOfArms from './HouseCoatOfArms';
import { useStore } from '../../store/useStore';
import { formatCount } from '../../utils/format';

function HouseCard({ house }) {
  const openHouseModal = useStore((s) => s.openHouseModal);

  return (
    <motion.button
      onClick={() => openHouseModal(house.id)}
      className="glass rounded-2xl p-5 text-left flex flex-col items-center gap-3 cursor-pointer group relative overflow-hidden"
      style={{ borderColor: `${house.color}33` }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 40px ${house.color}40`, border: `1px solid ${house.color}` , borderRadius: '1rem' }}
      />
      <div className="w-20 h-20 flex items-center justify-center">
        <HouseCoatOfArms houseId={house.id} size={72} />
      </div>
      <h3 className="font-display text-lg font-bold text-center" style={{ color: house.color }}>
        {house.name}
      </h3>
      <p className="text-xs text-text/60 text-center italic font-body">&ldquo;{house.motto}&rdquo;</p>
      <div className="flex items-center gap-3 text-xs text-text/50 mt-auto pt-2">
        <span className="px-2 py-0.5 rounded-full bg-white/5">{house.lsp}</span>
        <span>{formatCount(house.supply)} souls</span>
      </div>
    </motion.button>
  );
}

export default React.memo(HouseCard);
