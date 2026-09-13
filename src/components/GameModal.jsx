import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatHoursLong, parseHours, progressOf } from '../lib/progress';
import { STATUSES } from '../lib/statuses';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
} from './Icons';
import Metacritic from './Metacritic';
import Modal from './Modal';
import ProgressBar from './ProgressBar';
import RawgImg from './RawgImg';

function Lightbox({ shots, index, onChange, onClose }) {
  const step = (delta) => (e) => {
    e.stopPropagation();
    onChange((index + delta + shots.length) % shots.length);
  };

  return createPortal(
    <div className="lightbox" onClick={onClose}>
      <img src={shots[index]} alt={`Screenshot ${index + 1}`} onClick={(e) => e.stopPropagation()} />
      {shots.length > 1 && (
        <>
          <button type="button" className="lb-nav lb-prev" onClick={step(-1)} aria-label="Previous screenshot">
            <ChevronLeftIcon />
          </button>
          <button type="button" className="lb-nav lb-next" onClick={step(1)} aria-label="Next screenshot">
            <ChevronRightIcon />
          </button>
        </>
      )}
      <button type="button" className="lb-close" onClick={onClose} aria-label="Close screenshot">
        <CloseIcon />
      </button>
      <span className="lb-count">
        {index + 1} of {shots.length}
      </span>
    </div>,
    document.body,
  );
}

function Hours({ game, onUpdate }) {
  const { played, length, pct, custom } = progressOf(game);
  const setPlayed = (hoursPlayed) => onUpdate({ hoursPlayed });
  const source = custom ? 'your estimate' : "RAWG's average playtime";

  let note;
  if (!length) note = 'RAWG has no playtime for this game. Enter its length to track your progress.';
  else if (played < length) note = `${formatHoursLong(Math.round((length - played) * 10) / 10)} to go, based on ${source}.`;
  else note = `You're past ${source}.`;

  return (
    <div className="hours">
      <div className="hours-inputs">
        <div className="stepper">
          <button type="button" onClick={() => setPlayed(Math.max(0, played - 1))} aria-label="Remove an hour">
            <MinusIcon />
          </button>
          <input
            className="num-input"
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            placeholder="0"
            value={game.hoursPlayed ?? ''}
            onChange={(e) => setPlayed(parseHours(e.target.value))}
            aria-label="Hours played"
          />
          <button type="button" onClick={() => setPlayed(played + 1)} aria-label="Add an hour">
            <PlusIcon />
          </button>
        </div>
        <span>hours played, out of</span>
        <input
          className="num-input length-input"
          type="number"
          min="0"
          inputMode="decimal"
          placeholder={game.playtime || '?'}
          value={game.lengthHours ?? ''}
          onChange={(e) => onUpdate({ lengthHours: parseHours(e.target.value) || null })}
          aria-label="Game length in hours"
          title="Leave empty to use RAWG's average playtime"
        />
        <span>hours</span>
      </div>
      {length ? (
        <div className="hours-bar">
          <ProgressBar pct={pct} />
          <span className="pct">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <p className="hours-note">{note}</p>
    </div>
  );
}

export default function GameModal({ game, onClose, onUpdate, onRemove, onRefresh }) {
  const [shotIndex, setShotIndex] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const shots = game.screenshots ?? [];
  const year = game.released?.slice(0, 4);
  const devs = game.developers?.slice(0, 2).join(' and ');
  const byline = year ? `Released ${year}${devs ? ` by ${devs}` : ''}` : devs ? `By ${devs}` : '';

  useEffect(() => {
    if (shotIndex === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setShotIndex((i) => (i + 1) % shots.length);
      if (e.key === 'ArrowLeft') setShotIndex((i) => (i - 1 + shots.length) % shots.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shotIndex, shots.length]);

  async function refresh() {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  const score = <Metacritic score={game.metacritic} size="lg" />;

  return (
    <Modal onClose={shotIndex !== null ? () => setShotIndex(null) : onClose}>
      <RawgImg src={game.cover} width={1280} className="modal-art" />

      <div className="modal-head">
        <div>
          <h2>{game.title}</h2>
          {byline && <p className="byline">{byline}</p>}
        </div>
        <div className="score">
          {game.metacriticUrl ? (
            <a href={game.metacriticUrl} target="_blank" rel="noreferrer" title="Open on Metacritic">
              {score}
            </a>
          ) : (
            score
          )}
          <span>Metacritic</span>
        </div>
      </div>

      <div className="modal-body">
        <div className="status-picker" role="group" aria-label="Status">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`status-btn ${game.status === s.id ? 'active' : ''}`}
              onClick={() => onUpdate({ status: s.id })}
              aria-pressed={game.status === s.id}
            >
              <span className="swatch" style={{ background: s.color }} />
              {s.label}
            </button>
          ))}
        </div>

        <Hours game={game} onUpdate={onUpdate} />

        {(game.genres?.length > 0 || game.platforms?.length > 0) && (
          <dl className="facts">
            {game.genres?.length > 0 && (
              <div>
                <dt>Genres</dt>
                <dd>{game.genres.join(', ')}</dd>
              </div>
            )}
            {game.platforms?.length > 0 && (
              <div>
                <dt>Platforms</dt>
                <dd>{game.platforms.join(', ')}</dd>
              </div>
            )}
          </dl>
        )}

        {game.description && (
          <div>
            <p className={`description ${expanded ? '' : 'clamped'}`}>{game.description}</p>
            {game.description.length > 400 && (
              <button type="button" className="link-btn" onClick={() => setExpanded((v) => !v)}>
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {shots.length > 0 && (
          <div className="shots">
            {shots.map((src, i) => (
              <button key={src} type="button" className="shot" onClick={() => setShotIndex(i)}>
                <RawgImg src={src} width={640} alt={`${game.title} screenshot ${i + 1}`} />
              </button>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={refresh} disabled={refreshing}>
            <RefreshIcon /> {refreshing ? 'Refreshing…' : 'Refresh info'}
          </button>
          <button
            type="button"
            className={`btn btn-danger ${confirmRemove ? 'confirm' : ''}`}
            onClick={() => (confirmRemove ? onRemove() : setConfirmRemove(true))}
            onBlur={() => setConfirmRemove(false)}
          >
            <TrashIcon /> {confirmRemove ? 'Click again to remove' : 'Remove from shelf'}
          </button>
        </div>
      </div>

      {shotIndex !== null && (
        <Lightbox shots={shots} index={shotIndex} onChange={setShotIndex} onClose={() => setShotIndex(null)} />
      )}
    </Modal>
  );
}
