import { motion } from 'framer-motion';

const TEAM = [
  { name: 'The Architect', role: 'Founder', initial: 'A', color: '#FE60A0', bio: 'Designed the realm and its twelve houses, mapping every LUKSO standard into living lore.' },
  { name: 'The Lorekeeper', role: 'Creative Director', initial: 'L', color: '#7B5CFF', bio: 'Weaves the saga — origins, rarities and house mottos that give each soul its story.' },
  { name: 'The Builder', role: 'Tech Lead', initial: 'B', color: '#5A9BFF', bio: 'Ships the LSP8 contracts and on-chain reveal pipeline that bring UPTERFELL to life on LUKSO.' },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-24 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-accent font-display uppercase tracking-widest text-sm mb-3">The Keepers</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">The Team</h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {TEAM.map((m, i) => (
          <motion.div
            key={m.name}
            className="glass rounded-2xl p-6 text-center"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center font-display text-3xl font-bold text-white mb-4"
              style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}88)` }}>
              {m.initial}
            </div>
            <h3 className="font-display text-xl font-bold">{m.name}</h3>
            <p className="text-sm text-accent mb-3">{m.role}</p>
            <p className="text-sm text-text/60 font-body">{m.bio}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
