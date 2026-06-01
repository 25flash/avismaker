import { Loader2, Wallet, Check, X, Sparkles } from 'lucide-react';

// states: NO_WALLET, CONNECTING, CONNECTED, MINTING, SUCCESS, ERROR, SOLD_OUT, NOT_DEPLOYED
export default function MintButton({ state, onClick, disabled }) {
  const config = {
    NO_WALLET: { label: 'Connect Wallet', icon: <Wallet size={20} />, bg: 'from-accent to-purple' },
    CONNECTING: { label: 'Connecting…', icon: <Loader2 size={20} className="animate-spin" />, bg: 'from-accent to-purple' },
    CONNECTED: { label: 'Mint Your Soul', icon: <Sparkles size={20} />, bg: 'from-accent to-purple', shimmer: true },
    MINTING: { label: 'Minting…', icon: <Loader2 size={20} className="animate-spin" />, bg: 'from-accent to-purple' },
    SUCCESS: { label: 'Minted!', icon: <Check size={20} />, bg: 'from-green-500 to-emerald-600' },
    ERROR: { label: 'Try Again', icon: <X size={20} />, bg: 'from-red-500 to-rose-600' },
    SOLD_OUT: { label: 'Sold Out', icon: null, bg: 'from-gray-600 to-gray-700' },
    NOT_DEPLOYED: { label: 'Contract not yet deployed — coming soon', icon: null, bg: 'from-gray-600 to-gray-700' },
  }[state] || { label: 'Mint', icon: null, bg: 'from-accent to-purple' };

  const isDisabled = disabled || state === 'SOLD_OUT' || state === 'NOT_DEPLOYED' || state === 'CONNECTING' || state === 'MINTING';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`relative w-full overflow-hidden rounded-xl py-4 px-6 font-display font-bold text-lg text-white
        bg-gradient-to-r ${config.bg} transition-all duration-200
        flex items-center justify-center gap-2
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.98]'}
        ${config.shimmer ? 'group' : ''}`}
    >
      {config.shimmer && (
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 shimmer-bg pointer-events-none" />
      )}
      <span className="relative flex items-center gap-2">
        {config.icon}
        {config.label}
      </span>
    </button>
  );
}
