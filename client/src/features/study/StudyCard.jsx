export function StudyCard({ card, revealed, onReveal }) {
  return (
    <button className={`study-card ${revealed ? "revealed" : ""}`} type="button" onClick={onReveal}>
      <div className="study-card-inner">
        <p className="eyebrow">{revealed ? "Answer" : "Question"}</p>
        <h2>{revealed ? card.answer : card.question}</h2>
        <p className="muted-text">
          {revealed
            ? "Rate your recall honestly. The card will leave this session after you choose an outcome."
            : card.hint || "Tap to reveal the answer and continue the session."}
        </p>
      </div>
    </button>
  );
}
