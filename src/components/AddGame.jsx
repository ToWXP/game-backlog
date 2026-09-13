import { useEffect, useRef, useState } from 'react';
import { searchGames } from '../lib/rawg';
import { SearchIcon } from './Icons';
import Metacritic from './Metacritic';
import RawgImg from './RawgImg';

export default function AddGame({ hasKey, ownedIds, onAdd, onOpenExisting, onNeedKey }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [addingId, setAddingId] = useState(null);
  const rootRef = useRef(null);

  const q = query.trim();

  // Debounced search; aborts the in-flight request when the query changes.
  useEffect(() => {
    if (!hasKey || q.length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setState('loading');
      try {
        const found = await searchGames(q, ctrl.signal);
        setResults(found);
        setActive(0);
        setState('done');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setState('error');
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, hasKey]);

  useEffect(() => {
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  async function pick(result) {
    if (addingId) return;
    if (ownedIds.has(result.rawgId)) {
      setOpen(false);
      onOpenExisting(result.rawgId);
      return;
    }
    setAddingId(result.rawgId);
    try {
      if (await onAdd(result)) {
        setQuery('');
        setResults([]);
        setState('idle');
        setOpen(false);
      }
    } finally {
      setAddingId(null);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(results[active]);
    }
  }

  const showDropdown = open && (!hasKey || q.length >= 2);

  let body;
  if (!hasKey) {
    body = (
      <div className="results-msg">
        <p>To find covers, scores and screenshots automatically, add a free RAWG API key.</p>
        <button type="button" className="btn btn-primary" onClick={onNeedKey}>
          Add API key
        </button>
      </div>
    );
  } else if (state === 'error') {
    body = <div className="results-msg error-text">{error}</div>;
  } else if (!results.length) {
    body = <div className="results-msg">{state === 'done' ? `No games found for “${q}”.` : 'Searching…'}</div>;
  } else {
    body = results.map((r, i) => {
      const owned = ownedIds.has(r.rawgId);
      return (
        <button
          key={r.rawgId}
          type="button"
          role="option"
          aria-selected={i === active}
          className={`result ${i === active ? 'active' : ''}`}
          onMouseEnter={() => setActive(i)}
          onClick={() => pick(r)}
          disabled={addingId !== null}
        >
          <RawgImg src={r.cover} width={200} className="result-thumb" />
          <span className="result-main">
            <span className="result-title">{r.title}</span>
            <span className="result-meta">{r.released?.slice(0, 4) ?? 'TBA'}</span>
          </span>
          {addingId === r.rawgId ? (
            <span className="spinner spinner-light" />
          ) : owned ? (
            <span className="tag">On shelf</span>
          ) : (
            <span className="tag tag-add">Add</span>
          )}
          <Metacritic score={r.metacritic} size="sm" />
        </button>
      );
    });
  }

  return (
    <div className="add-game" ref={rootRef}>
      <label className="search">
        <SearchIcon />
        <input
          value={query}
          placeholder="Add a game by name"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-label="Search games to add"
        />
        {state === 'loading' && <span className="spinner" />}
      </label>
      {showDropdown && (
        <div className="results" role="listbox">
          {body}
        </div>
      )}
    </div>
  );
}
