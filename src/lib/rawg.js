// Thin client for the RAWG video game database (https://rawg.io/apidocs).
// RAWG provides cover art, Metacritic scores and screenshots for free.

const BASE = 'https://api.rawg.io/api';
const KEY_STORAGE = 'backlog.rawgKey';

export function getApiKey() {
  const envKey = import.meta.env.VITE_RAWG_API_KEY || '';
  try {
    return localStorage.getItem(KEY_STORAGE) || envKey;
  } catch {
    return envKey;
  }
}

export function saveApiKey(key) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    // Storage unavailable (private mode etc.) — the env key still works.
  }
}

async function request(path, params = {}, signal) {
  const key = getApiKey();
  if (!key) throw new Error('Add your RAWG API key in Settings to search for games.');

  const url = new URL(BASE + path);
  url.searchParams.set('key', key);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);

  const res = await fetch(url, { signal });
  if (res.status === 401) throw new Error('RAWG rejected the API key — check it in Settings.');
  if (!res.ok) throw new Error(`RAWG request failed (${res.status}).`);
  return res.json();
}

export async function searchGames(query, signal) {
  const data = await request('/games', { search: query, page_size: 8 }, signal);
  return (data.results ?? []).map((g) => ({
    rawgId: g.id,
    title: g.name,
    released: g.released,
    cover: g.background_image,
    metacritic: g.metacritic,
  }));
}

// Full record stored on the shelf: details + screenshots.
export async function fetchGame(rawgId) {
  const [d, shots] = await Promise.all([
    request(`/games/${rawgId}`),
    request(`/games/${rawgId}/screenshots`, { page_size: 20 }),
  ]);

  return {
    rawgId: d.id,
    slug: d.slug,
    title: d.name,
    released: d.released,
    cover: d.background_image,
    metacritic: d.metacritic,
    metacriticUrl: d.metacritic_url || null,
    description: d.description_raw || '',
    genres: (d.genres ?? []).map((g) => g.name),
    platforms: (d.platforms ?? []).map((p) => p.platform.name),
    developers: (d.developers ?? []).map((dev) => dev.name),
    playtime: d.playtime || null,
    screenshots: (shots.results ?? []).map((s) => s.image).filter((src) => src !== d.background_image),
  };
}

// RAWG serves smaller copies of its images via /media/resize/<width>/-/...
export function resized(url, width) {
  if (!url || !url.includes('media.rawg.io/media/') || /\/(resize|crop)\//.test(url)) return url;
  return url.replace('/media/', `/media/resize/${width}/-/`);
}
