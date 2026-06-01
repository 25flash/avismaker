import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import ParticleCanvas from '../ui/ParticleCanvas';
import HouseCoatOfArms from '../ui/HouseCoatOfArms';
import { COLLECTION } from '../../data/collection';

const TITLE = 'UPTERFELL';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <ParticleCanvas />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(123,92,255,0.18), transparent 60%), radial-gradient(circle at 50% 100%, rgba(254,96,160,0.12), transparent 55%)' }}
      />

      <motion.div
        className="absolute top-1/4 right-[8%] hidden lg:block"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="glass rounded-2xl p-6 w-48 flex flex-col items-center gap-3" style={{ borderColor: '#FE60A055' }}>
          <HouseCoatOfArms houseId="up" size={90} />
          <p className="font-display font-bold text-accent">House UP</p>
          <p className="text-[10px] text-text/50 uppercase tracking-widest">Mythic · 999</p>
        </div>
      </motion.div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.p
          className="text-sm md:text-base uppercase tracking-[0.3em] text-text/60 mb-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          {COLLECTION.totalSupply.toLocaleString()} Unique Souls. One Kingdom.
        </motion.p>

        <h1 className="font-display font-black text-6xl md:text-8xl tracking-tight mb-5">
          {TITLE.split('').map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block text-gradient"
              initial={{ opacity: 0, y: 40, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 200 }}
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="text-lg md:text-xl text-text/70 max-w-2xl mx-auto mb-8 font-body"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        >
          A medieval kingdom born on LUKSO. Twelve houses, five rarity tiers, and a soul for every collector. Mint yours before the gates close.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
        >
          <a href="#mint" className="flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-display font-bold text-white bg-gradient-to-r from-accent to-purple hover:brightness-110 transition">
            Mint Your Soul <ArrowRight size={18} />
          </a>
          <a href="#houses" className="flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-display font-bold glass hover:bg-white/10 transition">
            Explore the Houses
          </a>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-text/50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        >
          <span><strong className="text-text">12</strong> Houses</span>
          <span><strong className="text-text">5</strong> Rarity Tiers</span>
          <span><strong className="text-text">LSP8</strong> on LUKSO</span>
          <span><strong className="text-text">120</strong> Weapons</span>
        </motion.div>
      </div>

      <a href="#story" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-text/40 animate-bounce">
        <ChevronDown size={28} />
      </a>
    </section>
  );
}
