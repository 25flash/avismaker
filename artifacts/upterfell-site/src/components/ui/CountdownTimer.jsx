import { useCountdown } from '../../hooks/useCountdown';

function Box({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass rounded-lg px-3 py-2 min-w-[56px] text-center">
        <span className="font-display text-2xl md:text-3xl font-bold text-accent tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] md:text-xs uppercase tracking-widest text-text/50 mt-1">{label}</span>
    </div>
  );
}

export default function CountdownTimer({ compact = false }) {
  const { days, hours, minutes, seconds, expired } = useCountdown();

  if (expired) {
    return <span className="font-display text-accent font-bold uppercase tracking-widest">Mint Ended</span>;
  }

  if (compact) {
    return (
      <span className="font-display tabular-nums text-accent text-sm font-semibold">
        {String(days).padStart(2, '0')}:{String(hours).padStart(2, '0')}:
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    );
  }

  return (
    <div className="flex items-end gap-2 md:gap-3">
      <Box value={days} label="Days" />
      <span className="font-display text-2xl text-accent/40 pb-5">:</span>
      <Box value={hours} label="Hours" />
      <span className="font-display text-2xl text-accent/40 pb-5">:</span>
      <Box value={minutes} label="Mins" />
      <span className="font-display text-2xl text-accent/40 pb-5">:</span>
      <Box value={seconds} label="Secs" />
    </div>
  );
}
