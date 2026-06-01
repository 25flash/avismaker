import { motion } from 'framer-motion';

const CARDS = [
  { title: 'Born from LUKSO', body: 'UPTERFELL is forged on LUKSO — the blockchain built for digital lives. Every soul is an LSP8 asset, owned by your Universal Profile, living natively on-chain.' },
  { title: '12 Houses', body: 'Each house maps to a LUKSO Standard Protocol and a real dApp. From Universal Profiles to Vaults, every house governs a pillar of the realm. Choose your allegiance.' },
  { title: 'Rarity Is Lore', body: 'Five tiers, seven origins, and a rarity score from 12 to 999. Your soul\'s rank tells a story — from humble Peasant to Genesis Founder. Rarity is destiny.' },
];

export default function StorySection() {
  return (
    <section id="story" className="relative py-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <motion.p className="text-accent font-display uppercase tracking-widest text-sm mb-3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            The Saga
          </motion.p>
          <motion.h2 className="font-display text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            A Kingdom Written in Code
          </motion.h2>
          <motion.p className="text-text/70 font-body text-lg leading-relaxed mb-4"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            In the beginning there was rICO — a flicker of green text on black. From that genesis spark rose testnets, mainnets, and finally a living kingdom of seven thousand two hundred and fifty souls.
          </motion.p>
          <motion.p className="text-text/70 font-body text-lg leading-relaxed"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            UPTERFELL is the chronicle of LUKSO itself — its houses, its standards, its history etched into every soul. To mint is to claim your place in the saga.
          </motion.p>
        </div>

        <div className="space-y-6">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              className="glass rounded-2xl p-7"
              initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 80 }}
            >
              <span className="font-display text-5xl font-black text-accent/20">0{i + 1}</span>
              <h3 className="font-display text-2xl font-bold mt-2 mb-3">{c.title}</h3>
              <p className="text-text/70 font-body leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
