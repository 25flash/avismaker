import { Twitter, MessageCircle, Send, ExternalLink } from 'lucide-react';
import { SOCIAL_LINKS } from '../../utils/constants';
import EmailCapture from '../ui/EmailCapture';

const NAV = [['Story', '#story'], ['Houses', '#houses'], ['Rarity', '#rarity'], ['Mint', '#mint'], ['Roadmap', '#roadmap'], ['FAQ', '#faq']];
const RESOURCES = [
  ['LUKSO', 'https://lukso.network'],
  ['Universal Profile', 'https://universalprofile.cloud'],
  ['Universal Page', SOCIAL_LINKS.page],
  ['Explorer', SOCIAL_LINKS.explorer],
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bg2 pt-14 pb-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-xl font-bold mb-3"><span className="text-accent">⚔</span> UPTERFELL</h3>
          <p className="text-sm text-text/60 mb-4">7,250 unique souls forged on LUKSO. Twelve houses. One kingdom.</p>
          <div className="flex gap-3">
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="p-2 glass rounded-lg hover:text-accent transition"><Twitter size={18} /></a>
            <a href={SOCIAL_LINKS.discord} target="_blank" rel="noreferrer" className="p-2 glass rounded-lg hover:text-accent transition"><MessageCircle size={18} /></a>
            <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="p-2 glass rounded-lg hover:text-accent transition"><Send size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold mb-3">Explore</h4>
          <ul className="space-y-2">
            {NAV.map(([l, h]) => <li key={h}><a href={h} className="text-sm text-text/60 hover:text-text transition">{l}</a></li>)}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-3">Resources</h4>
          <ul className="space-y-2">
            {RESOURCES.map(([l, h]) => (
              <li key={h}><a href={h} target="_blank" rel="noreferrer" className="text-sm text-text/60 hover:text-text transition flex items-center gap-1">{l} <ExternalLink size={11} /></a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-3">Join the Realm</h4>
          <EmailCapture compact />
          <a href={SOCIAL_LINKS.discord} target="_blank" rel="noreferrer" className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-display font-semibold glass hover:bg-white/10 transition">
            <MessageCircle size={16} /> Join Discord
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between gap-3 text-xs text-text/40">
        <span>© {new Date().getFullYear()} UPTERFELL. All rights reserved.</span>
        <span>NFTs are collectibles, not investments. Mint responsibly. Not affiliated with HBO or Game of Thrones.</span>
      </div>
    </footer>
  );
}
