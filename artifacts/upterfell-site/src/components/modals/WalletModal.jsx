import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useWallet } from '../../hooks/useWallet';

const STEPS = [
  { n: 1, title: 'Install the UP Browser Extension', desc: 'Download the Universal Profile extension for your browser from universalprofile.cloud.' },
  { n: 2, title: 'Create your Universal Profile', desc: 'Follow the setup to create your free on-chain identity on LUKSO.' },
  { n: 3, title: 'Fund & connect', desc: 'Add some LYX, then return here and connect to mint your soul.' },
];

export default function WalletModal() {
  const open = useStore((s) => s.ui.walletModalOpen);
  const close = useStore((s) => s.closeWalletModal);
  const { connect } = useWallet();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="glass rounded-2xl p-6 max-w-md w-full relative"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={close} className="absolute top-4 right-4 text-text/50 hover:text-text">
              <X size={20} />
            </button>
            <h2 className="font-display text-2xl font-bold mb-1">Install Universal Profile</h2>
            <p className="text-text/60 text-sm mb-5">UPTERFELL lives on LUKSO. You&apos;ll need the UP Browser Extension to mint.</p>

            <div className="space-y-4 mb-6">
              {STEPS.map((s) => (
                <div key={s.n} className="flex gap-3">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm">
                    {s.n}
                  </div>
                  <div>
                    <p className="font-display font-semibold">{s.title}</p>
                    <p className="text-sm text-text/60">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://my.universalprofile.cloud/"
              target="_blank" rel="noreferrer"
              className="w-full mb-3 flex items-center justify-center gap-2 rounded-xl py-3 font-display font-bold bg-gradient-to-r from-accent to-purple text-white hover:brightness-110 transition"
            >
              <Download size={18} /> Get UP Extension
            </a>
            <button
              onClick={() => { close(); connect(); }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-display font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <RefreshCw size={18} /> I have it installed — Retry
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
