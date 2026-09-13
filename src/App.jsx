import { useCallback, useEffect, useMemo, useState } from 'react';
import logo from './assets/bookshelf-logo.svg';
import AddGame from './components/AddGame';
import GameModal from './components/GameModal';
import { GearIcon } from './components/Icons';
import SettingsModal from './components/SettingsModal';
import Shelf from './components/Shelf';
import { fetchGame, getApiKey, saveApiKey } from './lib/rawg';
import { DEFAULT_STATUS, STATUSES, STATUS_BY_ID } from './lib/statuses';
import { usePersistentState } from './lib/usePersistentState';

const SORTS = {
  added: { label: 'Recently added', fn: (a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0) },
  title: { label: 'Title', fn: (a, b) => a.title.localeCompare(b.title) },
  metacritic: { label: 'Metacritic', fn: (a, b) => (b.metacritic ?? -1) - (a.metacritic ?? -1) },
  released: { label: 'Release date', fn: (a, b) => (b.released ?? '').localeCompare(a.released ?? '') },
};

export default function App() {
  const [games, setGames] = usePersistentState('backlog.games', []);
  const [filter, setFilter] = usePersistentState('backlog.filter', 'all');
  const [sort, setSort] = usePersistentState('backlog.sort', 'added');
  const [apiKey, setApiKey] = useState(getApiKey);
  const [openId, setOpenId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, kind = 'info') => setToast({ message, kind, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const ownedIds = useMemo(() => new Set(games.map((g) => g.rawgId)), [games]);
  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUSES.map((s) => [s.id, 0]));
    for (const g of games) c[g.status] = (c[g.status] ?? 0) + 1;
    return c;
  }, [games]);
  const sorted = useMemo(() => [...games].sort((SORTS[sort] ?? SORTS.added).fn), [games, sort]);

  const activeFilter = filter === 'all' || STATUS_BY_ID[filter] ? filter : 'all';
  const shelves = activeFilter === 'all' ? STATUSES.filter((s) => counts[s.id] > 0) : [STATUS_BY_ID[activeFilter]];
  const openGame = games.find((g) => g.rawgId === openId) ?? null;
  const summary = games.length
    ? `${games.length} game${games.length === 1 ? '' : 's'} on the shelf, ${counts.finished} finished`
    : 'Add the games you want to play.';

  // Returns true when the game was added, so the search box knows to clear itself.
  async function addGame(result) {
    try {
      const details = await fetchGame(result.rawgId);
      setGames((prev) =>
        prev.some((g) => g.rawgId === details.rawgId)
          ? prev
          : [{ ...details, status: DEFAULT_STATUS, addedAt: Date.now() }, ...prev],
      );
      notify(`Added ${details.title} to ${STATUS_BY_ID[DEFAULT_STATUS].shelf}.`);
      return true;
    } catch (err) {
      notify(err.message, 'error');
      return false;
    }
  }

  function updateGame(rawgId, patch) {
    setGames((prev) => prev.map((g) => (g.rawgId === rawgId ? { ...g, ...patch } : g)));
  }

  function removeGame(rawgId) {
    setGames((prev) => prev.filter((g) => g.rawgId !== rawgId));
    setOpenId(null);
    notify('Removed from your shelf.');
  }

  async function refreshGame(rawgId) {
    try {
      updateGame(rawgId, await fetchGame(rawgId));
      notify('Game info updated.');
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  function importGames(list) {
    const valid = list.filter((g) => g && typeof g.title === 'string' && g.rawgId != null);
    setGames((prev) => {
      const byId = new Map(prev.map((g) => [g.rawgId, g]));
      for (const g of valid) {
        byId.set(g.rawgId, {
          ...g,
          status: STATUS_BY_ID[g.status] ? g.status : DEFAULT_STATUS,
          addedAt: g.addedAt ?? Date.now(),
        });
      }
      return [...byId.values()];
    });
    notify(`Imported ${valid.length} game${valid.length === 1 ? '' : 's'}.`);
  }

  function handleSaveKey(key) {
    saveApiKey(key);
    setApiKey(getApiKey());
  }

  return (
    <div className="room">
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <img src={logo} alt="" className="brand-logo" />
            <div>
              <h1>The Backlog</h1>
              <p>{summary}</p>
            </div>
          </div>
          <AddGame
            hasKey={Boolean(apiKey)}
            ownedIds={ownedIds}
            onAdd={addGame}
            onOpenExisting={setOpenId}
            onNeedKey={() => setSettingsOpen(true)}
          />
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            title="Settings"
          >
            <GearIcon />
          </button>
        </header>

        <div className="toolbar">
          <div className="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'all'}
              className={`tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All <span className="n">{games.length}</span>
            </button>
            {STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === s.id}
                className={`tab ${activeFilter === s.id ? 'active' : ''}`}
                onClick={() => setFilter(s.id)}
              >
                <span className="swatch" style={{ background: s.color }} />
                {s.label} <span className="n">{counts[s.id]}</span>
              </button>
            ))}
          </div>
          <label className="sort">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([id, s]) => (
                <option key={id} value={id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <main className="bookcase">
          <div className="bookcase-inner">
            {games.length === 0 ? (
              <Shelf
                title="Your shelf"
                games={[]}
                emptyText="Your shelf is empty. Search for a game above to add your first one."
              />
            ) : (
              shelves.map((s) => (
                <Shelf
                  key={s.id}
                  title={s.shelf}
                  color={s.color}
                  games={sorted.filter((g) => g.status === s.id)}
                  onOpen={setOpenId}
                  emptyText={s.empty}
                />
              ))
            )}
          </div>
        </main>
      </div>

      <footer className="floor">
        Game data, Metacritic scores and images from{' '}
        <a href="https://rawg.io" target="_blank" rel="noreferrer">
          RAWG
        </a>
        .
      </footer>

      {openGame && (
        <GameModal
          key={openGame.rawgId}
          game={openGame}
          onClose={() => setOpenId(null)}
          onUpdate={(patch) => updateGame(openGame.rawgId, patch)}
          onRemove={() => removeGame(openGame.rawgId)}
          onRefresh={() => refreshGame(openGame.rawgId)}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          apiKey={apiKey}
          games={games}
          onSaveKey={handleSaveKey}
          onImport={importGames}
          onClose={() => setSettingsOpen(false)}
          notify={notify}
        />
      )}

      {toast && (
        <div key={toast.id} className={`toast toast-${toast.kind}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}
