import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { EmptyState } from "../components/EmptyState.jsx";
import { SkeletonCard } from "../components/SkeletonCard.jsx";
import { StatusBanner } from "../components/StatusBanner.jsx";
import { reviewLabels, reviewOrder } from "../features/study/reviewLabels.js";
import { SessionSummary } from "../features/study/SessionSummary.jsx";
import { StudyCard } from "../features/study/StudyCard.jsx";

export function StudyPage() {
  const { deckId } = useParams();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const sessionQuery = useQuery({
    queryKey: ["study", deckId],
    queryFn: () => api.fetchStudySession(deckId)
  });

  const reviewMutation = useMutation({
    mutationFn: ({ cardId, rating }) => api.submitReview(cardId, { rating })
  });

  const cards = sessionQuery.data?.cards || [];
  const currentCard = cards[index];
  const completed = cards.length > 0 && index >= cards.length;

  const sessionLabel = useMemo(() => {
    if (sessionQuery.data?.mode === "due") {
      return "Due Review Session";
    }

    return "Preview Session";
  }, [sessionQuery.data?.mode]);

  async function handleRate(rating) {
    if (!currentCard) {
      return;
    }

    try {
      setErrorMessage("");
      const response = await reviewMutation.mutateAsync({ cardId: currentCard.id, rating });
      setResults((previous) => [...previous, { rating, response }]);
      setIndex((previous) => previous + 1);
      setRevealed(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <>
      <div className="section-header">
        <div>
          <Link className="text-link" to={`/decks/${deckId}`}>
            ← Back to Deck Workspace
          </Link>
          <h2>{sessionQuery.data?.deck?.title || "Study Session"}</h2>
          <p className="muted-text">
            {sessionLabel}. Each card disappears from this session immediately after you score it.
          </p>
        </div>
      </div>

      {errorMessage ? <StatusBanner tone="error">{errorMessage}</StatusBanner> : null}

      {sessionQuery.isLoading ? (
        <SkeletonCard />
      ) : cards.length === 0 ? (
        <EmptyState
          title="No cards are ready for review"
          message="Add some flashcards or wait until more become due."
          action={
            <Link className="primary-button inline-button" to={`/decks/${deckId}`}>
              Go Back to Workspace
            </Link>
          }
        />
      ) : completed ? (
        <SessionSummary results={results} />
      ) : (
        <section className="study-layout">
          <div className="study-progress panel glass-panel">
            <p className="eyebrow">Progress</p>
            <h3>
              Card {index + 1} of {cards.length}
            </h3>
            <div className="progress-bar">
              <span style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
            </div>
          </div>

          <StudyCard card={currentCard} revealed={revealed} onReveal={() => setRevealed(true)} />

          <p className="muted-text study-rating-prompt">
            How well did you remember this card?
          </p>
          <div className="rating-row">
            {reviewOrder.map((rating) => (
              <button
                key={rating}
                className="secondary-button"
                type="button"
                disabled={!revealed || reviewMutation.isPending}
                onClick={() => handleRate(rating)}
              >
                {reviewMutation.isPending ? "Saving..." : reviewLabels[rating]}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
