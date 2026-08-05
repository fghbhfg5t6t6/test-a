export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function flagUrl(code: string, size: 'sm' | 'md' = 'sm'): string {
  const c = code.toLowerCase();
  const w = size === 'sm' ? 40 : 80;
  return `https://flagcdn.com/${w}/${c}.png`;
}
