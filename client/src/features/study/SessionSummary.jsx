import { reviewLabels } from "./reviewLabels.js";

export function SessionSummary({ results }) {
  const counts = results.reduce(
    (accumulator, item) => {
      accumulator[item.rating] += 1;
      return accumulator;
    },
    { again: 0, hard: 0, easy: 0 }
  );

  return (
    <div className="panel session-summary">
      <p className="eyebrow">Session Complete</p>
      <h2>Nice work. This review set is fully cleared for now.</h2>
      <div className="summary-grid">
        <div>
          <strong>{results.length}</strong>
          <span>Cards reviewed</span>
        </div>
        <div>
          <strong>{counts.easy}</strong>
          <span>{reviewLabels.easy}</span>
        </div>
        <div>
          <strong>{counts.hard}</strong>
          <span>{reviewLabels.hard}</span>
        </div>
        <div>
          <strong>{counts.again}</strong>
          <span>{reviewLabels.again}</span>
        </div>
      </div>
    </div>
  );
}
