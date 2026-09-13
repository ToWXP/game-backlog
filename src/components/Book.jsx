import { formatHours, progressOf } from '../lib/progress';
import { STATUS_BY_ID } from '../lib/statuses';
import Metacritic from './Metacritic';
import ProgressBar from './ProgressBar';
import RawgImg from './RawgImg';

// Book colors from the pixel logo, shown while the art loads or when a game has no art.
const SPINE_COLORS = ['#3452c9', '#c23a2e', '#2f8c48', '#6f8ee6', '#9aa0a6', '#d9a531'];

// Stable pseudo-random number per game so each book keeps its size between visits.
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function Book({ game, onOpen }) {
  const status = STATUS_BY_ID[game.status];
  const h = hash(String(game.rawgId ?? game.title));
  const width = 44 + (h % 7) * 4; // 44–68
  const height = 214 + ((h >>> 4) % 8) * 6; // 214–256
  const len = game.title.length;
  const style = {
    '--w': width,
    '--h': height,
    '--fs': len > 26 ? 10.5 : len > 17 ? 12 : 14, // shrink long titles to fit the spine
    '--spine': SPINE_COLORS[(h >>> 8) % SPINE_COLORS.length],
  };

  const { played, length, pct } = progressOf(game);
  const hoursText = length ? `${formatHours(played)} of ${formatHours(length)}` : `${formatHours(played)} played`;

  return (
    <button
      type="button"
      className="slot"
      onClick={() => onOpen(game.rawgId)}
      aria-label={`${game.title}, ${status.label}${played > 0 ? `, ${hoursText}` : ''}`}
      title={game.title}
    >
      <div className="book" style={style}>
        <div className="spine">
          {game.cover && <RawgImg src={game.cover} width={420} className="spine-art" />}
          {game.metacritic != null && (
            <span className="spine-score">
              <Metacritic score={game.metacritic} size="xs" />
            </span>
          )}
          <span className="spine-title">{game.title}</span>
          {played > 0 && length && <ProgressBar pct={pct} className="spine-progress" />}
        </div>

        <div className="cover">
          <RawgImg src={game.cover} width={420} className="cover-img" />
          <div className="cover-band">
            <span className="cover-title">{game.title}</span>
            <span className="cover-meta">
              <Metacritic score={game.metacritic} size="sm" />
              {played > 0 && <span>{hoursText}</span>}
            </span>
            {played > 0 && length && <ProgressBar pct={pct} />}
          </div>
        </div>
      </div>
    </button>
  );
}
