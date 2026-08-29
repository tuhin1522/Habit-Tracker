// ─────────────────────────────────────────────────────────────────────────────
// nanoid — tiny unique ID generator (no external dependency needed)
// ─────────────────────────────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function nanoid(size?: number): string {
  const s = size || 21;
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(s));
  for (let i = 0; i < s; i++) {
    id += CHARS[bytes[i] % CHARS.length];
  }
  return id;
}
