import { useEffect, useState } from "react";

export function StudyCard({ card, revealed, onReveal }) {
  const [hintPinned, setHintPinned] = useState(false);
  const cardKey = card.id ?? card._id;
  const hasHiddenHint = !revealed && Boolean(card.hint);

  useEffect(() => {
    setHintPinned(false);
  }, [cardKey, revealed]);

  return (
    <div className={`study-card-frame ${hasHiddenHint ? "has-hidden-hint" : ""}`}>
      <button className={`study-card ${revealed ? "revealed" : ""}`} type="button" onClick={onReveal}>
        <div className="study-card-inner">
          <p className="eyebrow">{revealed ? "Answer" : "Question"}</p>
          <h2>{revealed ? card.answer : card.question}</h2>
          <p className="muted-text">
            {revealed
              ? "Rate your recall honestly. The card will leave this session after you choose an outcome."
              : card.hint
                ? "Hover or tap the hidden hint if you need a small nudge."
                : "Tap to reveal the answer and continue the session."}
          </p>
        </div>
      </button>

      {hasHiddenHint ? (
        <button
          className={`study-hint-peek ${hintPinned ? "is-visible" : ""}`}
          type="button"
          aria-pressed={hintPinned}
          aria-label={hintPinned ? "Hide hint" : "Reveal hint"}
          onClick={() => setHintPinned((previous) => !previous)}
        >
          <span className="study-hint-label">Hint</span>
          <span className="study-hint-text">{card.hint}</span>
        </button>
      ) : null}
    </div>
  );
}
