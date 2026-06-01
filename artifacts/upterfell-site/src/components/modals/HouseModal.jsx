import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { HOUSES } from '../../data/collection';
import HouseCoatOfArms from '../ui/HouseCoatOfArms';
import { formatCount } from '../../utils/format';

export default function HouseModal() {
  const houseId = useStore((s) => s.ui.houseModalId);
  const close = useStore((s) => s.closeHouseModal);
  const house = HOUSES.find((h) => h.id === houseId);

  const tweetUrl = house
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `I'm rallying to ${house.name} in @upterfell — "${house.motto}" ⚔️`
      )}`
    : '#';

  return (
    <AnimatePresence>
      {house && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="glass rounded-2xl p-6 max-w-lg w-full relative overflow-hidden"
            style={{ borderColor: `${house.color}55` }}
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: house.color }} />
            <button onClick={close} className="absolute top-4 right-4 text-text/50 hover:text-text z-10">
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <HouseCoatOfArms houseId={house.id} size={88} />
              <div>
                <h2 className="font-display text-2xl font-bold" style={{ color: house.color }}>{house.name}</h2>
                <p className="text-sm text-text/60 italic">&ldquo;{house.motto}&rdquo;</p>
              </div>
            </div>

            <p className="text-text/80 font-body mb-5 leading-relaxed">{house.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
              {[
                ['LSP Standard', house.lsp],
                ['dApp', house.dapp],
                ['Supply', `${formatCount(house.supply)} souls`],
                ['GoT Parallel', house.got],
              ].map(([k, v]) => (
                <div key={k} className="glass rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-text/40">{k}</p>
                  <p className="font-display font-semibold">{v}</p>
                </div>
              ))}
            </div>

            <a
              href={tweetUrl} target="_blank" rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-display font-bold bg-gradient-to-r from-accent to-purple text-white hover:brightness-110 transition"
            >
              <Twitter size={18} /> Pledge to {house.name}
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
