import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, Loader2, AlertTriangle } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { useStore } from '../../store/useStore';
import CountdownTimer from '../ui/CountdownTimer';
import { formatAddress } from '../../utils/format';

const LINKS = [
  ['Story', '#story'], ['Houses', '#houses'], ['Rarity', '#rarity'],
  ['Mint', '#mint'], ['Roadmap', '#roadmap'], ['FAQ', '#faq'],
];

function WalletButton({ onClick }) {
  const { wallet } = useWallet();
  let label = 'Connect';
  let icon = <Wallet size={16} />;
  let cls = 'from-accent to-purple';

  if (wallet.connecting) { label = 'Connecting…'; icon = <Loader2 size={16} className="animate-spin" />; }
  else if (wallet.wrongNetwork) { label = 'Wrong Network'; icon = <AlertTriangle size={16} />; cls = 'from-red-500 to-rose-600'; }
  else if (wallet.connected) { label = formatAddress(wallet.address); icon = <Wallet size={16} />; cls = 'from-green-500 to-emerald-600'; }

  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-display font-semibold text-white bg-gradient-to-r ${cls} hover:brightness-110 transition`}>
      {icon} {label}
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const mobileOpen = useStore((s) => s.ui.mobileMenuOpen);
  const setUI = useStore((s) => s.setUI);
  const { connect, wallet, switchNetwork } = useWallet();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleWallet = () => {
    if (wallet.wrongNetwork) switchNetwork();
    else connect();
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-2' : 'bg-transparent py-4'}`}>
      <nav className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <a href="#" className="font-display text-xl font-bold tracking-wide">
          <span className="text-accent">⚔</span> UPTERFELL
        </a>

        <div className="hidden lg:flex items-center gap-6">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-text/70 hover:text-text transition font-body">{label}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="hidden lg:block glass rounded-lg px-3 py-1.5">
            <CountdownTimer compact />
          </div>
          <WalletButton onClick={handleWallet} />
        </div>

        <button className="md:hidden text-text" onClick={() => setUI({ mobileMenuOpen: true })}>
          <Menu size={26} />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-bg2 flex flex-col p-6"
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
          >
            <div className="flex justify-between items-center mb-10">
              <span className="font-display text-xl font-bold"><span className="text-accent">⚔</span> UPTERFELL</span>
              <button onClick={() => setUI({ mobileMenuOpen: false })}><X size={28} /></button>
            </div>
            <div className="flex flex-col gap-6">
              {LINKS.map(([label, href]) => (
                <a key={href} href={href} onClick={() => setUI({ mobileMenuOpen: false })} className="font-display text-2xl">{label}</a>
              ))}
            </div>
            <div className="mt-10"><WalletButton onClick={handleWallet} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
