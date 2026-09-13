export default function Metacritic({ score, size = 'md' }) {
  const tier = score == null ? 'na' : score >= 75 ? 'good' : score >= 50 ? 'mixed' : 'bad';
  return (
    <span className={`mc mc-${tier} mc-${size}`} title={score == null ? 'No Metacritic score' : `Metacritic: ${score}`}>
      {score ?? '–'}
    </span>
  );
}
