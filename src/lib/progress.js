// Hours played vs. how long the game is: your own length if you set one, else RAWG's average playtime.
export function progressOf(game) {
  const played = game.hoursPlayed ?? 0;
  const length = game.lengthHours || game.playtime || null;
  return {
    played,
    length,
    pct: length ? (played / length) * 100 : null,
    custom: Boolean(game.lengthHours),
  };
}

export const formatHours = (h) => `${Number.isInteger(h) ? h : h.toFixed(1)}h`;

export const formatHoursLong = (h) => `${Number.isInteger(h) ? h : h.toFixed(1)} hour${h === 1 ? '' : 's'}`;

// Input value → hours rounded to 0.1, or null when empty/invalid.
export function parseHours(value) {
  if (value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : null;
}
