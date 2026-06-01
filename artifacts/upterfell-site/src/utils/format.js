export function formatAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0,6)}...${addr.slice(-4)}`;
}
export function formatLYX(wei) {
  if (!wei) return '0';
  return (Number(wei) / 1e18).toFixed(2);
}
export function formatCount(n) {
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`;
  return n.toString();
}
