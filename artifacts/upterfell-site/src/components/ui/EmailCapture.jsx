import { useState } from 'react';
import { Check, Mail } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailCapture({ compact = false }) {
  const [email, setEmail] = useState('');
  const [upAddress, setUpAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="glass rounded-xl p-5 flex items-center gap-3 text-green-400">
        <Check size={22} />
        <div>
          <p className="font-display font-bold">You&apos;re on the list!</p>
          <p className="text-sm text-text/60">We&apos;ll notify you when whitelist confirmations go out.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="relative">
        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full glass rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent/50 bg-transparent"
        />
      </div>
      {!compact && (
        <input
          type="text"
          value={upAddress}
          onChange={(e) => setUpAddress(e.target.value)}
          placeholder="Universal Profile address (0x…) — optional"
          className="w-full glass rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent/50 bg-transparent"
        />
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-lg py-2.5 font-display font-bold bg-gradient-to-r from-accent to-purple text-white hover:brightness-110 transition"
      >
        Request Whitelist
      </button>
    </form>
  );
}
