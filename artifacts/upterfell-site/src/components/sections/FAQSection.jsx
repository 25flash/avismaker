import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const FAQS = [
  { q: 'What is UPTERFELL?', a: 'UPTERFELL is a collection of 7,250 unique on-chain souls forged on LUKSO. Each soul belongs to one of twelve houses and carries a unique set of traits and a rarity score.' },
  { q: 'What blockchain is it on?', a: 'UPTERFELL lives on LUKSO Mainnet (chain ID 42) as LSP8 assets, owned directly by your Universal Profile.' },
  { q: 'What do I need to mint?', a: 'You need the Universal Profile Browser Extension and some LYX to cover the mint price and gas. We guide you through setup if you do not have it yet.' },
  { q: 'How much does it cost?', a: 'Pricing is tiered by phase: Founders 5 LYX (ended), Whitelist 10 LYX (live), and Public 15 LYX (upcoming).' },
  { q: 'How does rarity work?', a: 'Every soul gets a rarity score from 12 to 999 based on its traits, sorting it into one of five tiers: Mythic, Legendary, Epic, Rare and Uncommon.' },
  { q: 'What are the twelve houses?', a: 'Each house maps to a LUKSO Standard Protocol and a real dApp — from House UP (Universal Profile) to House Verse (Vault). Your soul is born into one house.' },
  { q: 'When is the reveal?', a: 'Reveal is instant and on-chain. The moment you mint, your soul\'s house, rank, traits and rarity are revealed.' },
  { q: 'Is the contract audited?', a: 'The LSP8 mint contract follows LUKSO standards and undergoes audit before public sale. The address shown is a placeholder until deployment.' },
  { q: 'How do I join the community?', a: 'Follow us on X, join the Discord, and request whitelist access through the form in the roadmap or footer.' },
];

function FAQItem({ item, open, onToggle }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-display font-semibold text-lg">{item.q}</span>
        {open ? <X size={20} className="text-accent shrink-0" /> : <Plus size={20} className="text-text/50 shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }} className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-text/70 font-body leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MemoFAQItem = React.memo(FAQItem);

export default function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24 px-4 md:px-6 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-accent font-display uppercase tracking-widest text-sm mb-3">Questions</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">FAQ</h2>
      </div>
      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <MemoFAQItem key={i} item={item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </div>
    </section>
  );
}
