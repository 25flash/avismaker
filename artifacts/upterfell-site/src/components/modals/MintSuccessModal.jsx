import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter, ExternalLink, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { SOCIAL_LINKS } from '../../utils/constants';

const CONFETTI_COLORS = ['#FE60A0', '#7B5CFF', '#5A9BFF', '#FF6B35', '#E65100', '#A855F7'];

export default function MintSuccessModal() {
  const open = useStore((s) => s.ui.mintSuccessOpen);
  const setUI = useStore((s) => s.setUI);
  const nft = useStore((s) => s.mint.lastMinted);
  const canvasRef = useRef(null);

  const close = () => setUI({ mintSuccessOpen: false });

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let raf;
    const particles = [];
    for (let i = 0; i < 140; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 4,
        r: Math.random() * 4 + 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        life: 1,
      });
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life -= 0.012;
        if (p.life > 0) {
          alive = true;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.r, p.r);
        }
      }
      ctx.globalAlpha = 1;
      if (alive) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const tweetUrl = nft
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Just minted ${nft.id} — a ${nft.tier} of ${nft.house} in @upterfell ⚔️ #LUKSO`
      )}`
    : '#';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          <motion.div
            className="glass rounded-2xl p-7 max-w-md w-full relative text-center"
            initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={close} className="absolute top-4 right-4 text-text/50 hover:text-text">
              <X size={20} />
            </button>
            <Sparkles size={40} className="mx-auto text-accent mb-3" />
            <h2 className="font-display text-3xl font-bold text-gradient mb-1">Soul Minted!</h2>
            <p className="text-text/60 mb-5">Welcome to UPTERFELL.</p>

            {nft && (
              <div className="glass rounded-xl p-4 mb-5 space-y-2 text-left" style={{ borderColor: `${nft.tierColor}55` }}>
                <div className="flex justify-between"><span className="text-text/50">Token</span><span className="font-display font-bold">{nft.id}</span></div>
                <div className="flex justify-between"><span className="text-text/50">House</span><span style={{ color: nft.houseColor }} className="font-semibold">{nft.house}</span></div>
                <div className="flex justify-between"><span className="text-text/50">Tier</span><span style={{ color: nft.tierColor }} className="font-bold">{nft.tier}</span></div>
                <div className="flex justify-between"><span className="text-text/50">Rarity Score</span><span className="font-display font-bold">{nft.score}</span></div>
              </div>
            )}

            <div className="space-y-2">
              <a href={tweetUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-display font-bold bg-gradient-to-r from-accent to-purple text-white hover:brightness-110 transition">
                <Twitter size={18} /> Share on X
              </a>
              <a href={SOCIAL_LINKS.page} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-display font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <ExternalLink size={18} /> View on Universal Page
              </a>
              <button onClick={close} className="w-full rounded-xl py-3 font-display font-semibold text-text/70 hover:text-text transition">
                Mint Another
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
