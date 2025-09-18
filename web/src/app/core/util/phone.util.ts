// Shared phone formatting and validation utilities (BR + US)
// BR: 10 digits (landline) => (11) 2345-6789
// BR: 11 digits (mobile)   => (11) 98765-4321
// US: 11 digits starting with 1 => +1 (AAA) BBB-CCCC
// US: 10 digits => (AAA) BBB-CCCC

export function formatPhoneDisplay(raw?: string | null): string {
  const original = raw || '';
  const d = original.replace(/\D+/g, '');
  if (!d) return '';
  const hadPlus = original.trim().startsWith('+');
  // Only treat as US +1 if user explicitly typed +1 (to avoid misclassifying DDD 11,12,13... como EUA)
  if (hadPlus && d.length === 11 && d.startsWith('1')) {
    const area = d.slice(1, 4);
    const p1 = d.slice(4, 7);
    const p2 = d.slice(7);
    return `+1 (${area}) ${p1}-${p2}`;
  }
  // Brazilian 11-digit (mobile) or any 11-digit without +1 prefix
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  // Brazilian 10-digit (landline)
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  // Partial typing heurística (BR style)
  if (d.length < 3) return d;
  if (d.length < 7) return d.replace(/(\d{2})(\d+)/, '($1) $2');
  if (d.length < 11) return d.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return d;
}

export function normalizePhoneDigits(v?: string | null): string {
  return (v || '').replace(/\D+/g, '').slice(0, 11);
}

export function validatePhone(raw?: string | null): boolean {
  const digits = normalizePhoneDigits(raw);
  if (!digits) return true; // optional
  return digits.length === 10 || digits.length === 11;
}
