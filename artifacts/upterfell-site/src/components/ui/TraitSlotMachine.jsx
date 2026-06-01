import { useCallback, useEffect, useRef, useState } from 'react';
import { Dices } from 'lucide-react';
import { HOUSES, ORIGINS, TRAITS } from '../../data/collection';

const SLOTS = [
  { key: 'House', options: HOUSES.map((h) => h.name) },
  { key: 'Rank', options: TRAITS.ranks },
  { key: 'Origin', options: ORIGINS.map((o) => o.name) },
  { key: 'Armor', options: TRAITS.armors },
  { key: 'Weapon', options: TRAITS.weapons },
  { key: 'Aura', options: TRAITS.auras },
  { key: 'Familiar', options: TRAITS.familiars },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function TraitSlotMachine() {
  const [values, setValues] = useState(() => SLOTS.map((s) => pick(s.options)));
  const [spinning, setSpinning] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.forEach((t) => clearInterval(t));
    timers.current = [];
  };

  const roll = useCallback(() => {
    clearTimers();
    setSpinning(true);

    SLOTS.forEach((slot, i) => {
      const interval = setInterval(() => {
        setValues((prev) => {
          const next = [...prev];
          next[i] = pick(slot.options);
          return next;
        });
      }, 70);
      timers.current.push(interval);

      const stopAt = 1200 + i * 380; // staggered deceleration ~4s total
      const stop = setTimeout(() => {
        clearInterval(interval);
        setValues((prev) => {
          const next = [...prev];
          next[i] = pick(slot.options);
          return next;
        });
        if (i === SLOTS.length - 1) setSpinning(false);
      }, stopAt);
      timers.current.push(stop);
    });
  }, []);

  useEffect(() => () => clearTimers(), []);

  return (
    <div className="w-full">
      <div className="space-y-2">
        {SLOTS.map((slot, i) => (
          <div key={slot.key} className="flex items-center justify-between glass rounded-lg px-4 py-2.5">
            <span className="text-xs uppercase tracking-wider text-text/50">{slot.key}</span>
            <span className={`font-display font-semibold text-text ${spinning ? 'blur-[1px]' : ''}`}>
              {values[i]}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={roll}
        disabled={spinning}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 font-display font-bold
          bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-50"
      >
        <Dices size={18} className={spinning ? 'animate-spin' : ''} />
        {spinning ? 'Rolling…' : 'Re-roll Traits'}
      </button>
    </div>
  );
}
