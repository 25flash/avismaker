import { useStore } from '../store/useStore';

export function useSupply() {
  const { totalSupply, totalMinted } = useStore((s) => s.collection);
  const remaining = Math.max(0, totalSupply - totalMinted);
  const percent = totalSupply > 0 ? (totalMinted / totalSupply) * 100 : 0;
  const soldOut = remaining <= 0;
  return { totalSupply, totalMinted, remaining, percent, soldOut };
}
