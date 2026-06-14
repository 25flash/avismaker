// GenerateRIB derives a simplified Louma RIB from an account sequence number.
// Placeholder for the Lot 1 foundation; the final BCEAO-compliant RIB format
// must be confirmed with the cantonnement bank partner before Go-Live
// (see docs/OPEN_QUESTIONS.md).
export function generateRib(seq: bigint): string {
  const check = seq % 97n;
  return `SN${check.toString().padStart(2, "0")}${seq.toString().padStart(18, "0")}`;
}
