import Book from './Book';

export default function Shelf({ title, color, games, onOpen, emptyText }) {
  return (
    <section className="shelf">
      <h2 className="shelf-tag">
        {color && <span className="swatch" style={{ background: color }} />}
        {title}
        {games.length > 0 && <span className="shelf-count">{games.length}</span>}
      </h2>
      <div className="shelf-rows">
        {games.length ? (
          games.map((g) => <Book key={g.rawgId} game={g} onOpen={onOpen} />)
        ) : (
          <p className="shelf-empty">{emptyText}</p>
        )}
      </div>
    </section>
  );
}
