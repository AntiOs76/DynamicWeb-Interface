import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { CardEditorDrawer } from "../features/decks/CardEditorDrawer.jsx";
import { DeckFormModal } from "../features/decks/DeckFormModal.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { SkeletonCard } from "../components/SkeletonCard.jsx";
import { StatusBanner } from "../components/StatusBanner.jsx";
import { formatDate, formatRelativeDue } from "../utils/format.js";

function icon(children) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function SearchIcon() {
  return icon(
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  );
}

function PlusIcon() {
  return icon(
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  );
}

function CalendarIcon() {
  return icon(
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
      <path d="M3.5 9.5h17" />
    </>
  );
}

function ReviewsIcon() {
  return icon(
    <>
      <path d="M20 11.5A8 8 0 1 1 17.7 5.8" />
      <path d="M20.5 4.5v5h-5" />
    </>
  );
}

function HintIcon() {
  return icon(
    <>
      <path d="M9.5 17.5h5" />
      <path d="M10 20.5h4" />
      <path d="M8 13.5c-1.1-.9-1.8-2.3-1.8-3.8A5.8 5.8 0 0 1 12 4a5.8 5.8 0 0 1 5.8 5.7c0 1.5-.7 2.9-1.8 3.8-.7.6-1.2 1.3-1.4 2h-5.2c-.2-.7-.7-1.4-1.4-2Z" />
    </>
  );
}

function EditIcon() {
  return icon(
    <>
      <path d="M4.5 19.5h4l9.4-9.4a2.1 2.1 0 1 0-3-3L5.5 16.5z" />
      <path d="m13.5 6.5 4 4" />
    </>
  );
}

function TrashIcon() {
  return icon(
    <>
      <path d="M4.5 7.5h15" />
      <path d="M9 4.5h6" />
      <path d="M7 7.5v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-10" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </>
  );
}

export function DeckWorkspacePage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDeck, setEditingDeck] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [creatingCard, setCreatingCard] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const deckQuery = useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => api.fetchDeckCards(deckId)
  });

  const updateDeckMutation = useMutation({
    mutationFn: (payload) => api.updateDeck(deckId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setEditingDeck(false);
    }
  });

  const createCardMutation = useMutation({
    mutationFn: (payload) => api.createCard(deckId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setCreatingCard(false);
    }
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ cardId, payload }) => api.updateCard(cardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      setEditingCard(null);
    }
  });

  const deleteCardMutation = useMutation({
    mutationFn: api.deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    }
  });

  async function handleDeleteCard() {
    if (!cardToDelete) {
      return;
    }

    try {
      setErrorMessage("");
      await deleteCardMutation.mutateAsync(cardToDelete._id);
      setCardToDelete(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleCreateCard(values) {
    try {
      setErrorMessage("");
      await createCardMutation.mutateAsync(values);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleUpdateCard(values) {
    try {
      setErrorMessage("");
      await updateCardMutation.mutateAsync({ cardId: editingCard._id, payload: values });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleUpdateDeck(values) {
    try {
      setErrorMessage("");
      await updateDeckMutation.mutateAsync(values);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const deck = deckQuery.data?.deck;
  const cards = deckQuery.data?.cards || [];
  const metrics = deckQuery.data?.metrics;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCards = useMemo(() => {
    if (!normalizedSearch) {
      return cards;
    }

    return cards.filter((card) => {
      const haystack = [
        card.question,
        card.answer,
        card.hint || "",
        ...(card.tags || [])
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [cards, normalizedSearch]);

  return (
    <>
      <div className="section-header">
        <div className="section-heading">
          <Link className="text-link" to="/">
            ← Back to Dashboard
          </Link>
          <div className="title-search-row">
            <h2>{deck?.title || "Deck Workspace"}</h2>
            <label className="search-field workspace-search-field">
              <span className="visually-hidden">Search cards in this deck</span>
              <span className="workspace-search-icon">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search question, answer, hint, or tag"
              />
            </label>
          </div>
          <p className="muted-text">
            Manage every flashcard in one place with edit drawers, clear due dates, and study shortcuts.
          </p>
        </div>
        <div className="section-actions">
          <button className="ghost-button" type="button" onClick={() => setEditingDeck(true)} disabled={!deck}>
            Edit Deck
          </button>
          <button className="secondary-button" type="button" onClick={() => setCreatingCard(true)} disabled={!deck}>
            <PlusIcon />
            Add card
          </button>
          <button className="primary-button" type="button" onClick={() => navigate(`/study/${deckId}`)} disabled={!deck}>
            Start Study Session
          </button>
        </div>
      </div>

      {errorMessage ? <StatusBanner tone="error">{errorMessage}</StatusBanner> : null}

      {deckQuery.isLoading ? (
        <section className="deck-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </section>
      ) : deck ? (
        <>
          <section className="workspace-overview">
            <article className="panel feature-card">
              <span>Cards</span>
              <strong>{metrics?.cardCount ?? 0}</strong>
            </article>
            <article className="panel feature-card">
              <span>Due Now</span>
              <strong>{metrics?.dueCount ?? 0}</strong>
            </article>
            <article className="panel feature-card">
              <span>Tags</span>
              <strong>{deck.tags?.length || 0}</strong>
            </article>
          </section>

          {cards.length > 0 ? (
            filteredCards.length > 0 ? (
            <section className="card-list">
              {filteredCards.map((card) => (
                <article key={card._id} className="panel card-item">
                  <div className="card-item-body">
                    <div className="card-item-heading">
                      <p className="eyebrow">Flashcard</p>
                      <h3>{card.question}</h3>
                      <span className="pill card-due-pill">{formatRelativeDue(card.nextReviewAt)}</span>
                    </div>
                    <p className="card-answer">{card.answer}</p>
                    {card.hint ? (
                      <p className="muted-text card-hint">
                        <HintIcon />
                        <span>{card.hint}</span>
                      </p>
                    ) : null}
                    {card.tags?.length ? (
                      <div className="tag-row card-tag-row">
                        {card.tags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="card-item-footer">
                      <span className="card-meta">
                        <CalendarIcon />
                        Last reviewed {formatDate(card.lastReviewedAt)}
                      </span>
                      <span className="card-meta">
                        <ReviewsIcon />
                        {card.reviewCount} {card.reviewCount === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions card-item-actions">
                    <button className="ghost-button" type="button" onClick={() => setEditingCard(card)}>
                      <EditIcon />
                      Edit
                    </button>
                    <button className="ghost-button danger-button" type="button" onClick={() => setCardToDelete(card)}>
                      <TrashIcon />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </section>
            ) : (
              <EmptyState
                title="No cards match this search"
                message="Try a different keyword or clear the search to see every card in this deck."
                action={
                  <button className="primary-button" type="button" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </button>
                }
              />
            )
          ) : (
            <EmptyState
              title="This deck has no flashcards yet"
              message="Add a few cards so the deck can power a real review session."
              action={
                <button className="primary-button" type="button" onClick={() => setCreatingCard(true)}>
                  <PlusIcon />
                  Add card
                </button>
              }
            />
          )}
        </>
      ) : (
        <EmptyState
          title="Deck not found"
          message="The requested deck could not be loaded. Return to the dashboard and try again."
          action={
            <Link className="primary-button inline-button" to="/">
              Return to Dashboard
            </Link>
          }
        />
      )}

      <DeckFormModal
        isOpen={editingDeck}
        initialValues={deck}
        onClose={() => setEditingDeck(false)}
        onSubmit={handleUpdateDeck}
        isPending={updateDeckMutation.isPending}
      />

      <CardEditorDrawer
        isOpen={creatingCard}
        onClose={() => setCreatingCard(false)}
        onSubmit={handleCreateCard}
        isPending={createCardMutation.isPending}
      />

      <CardEditorDrawer
        isOpen={Boolean(editingCard)}
        initialValues={editingCard}
        onClose={() => setEditingCard(null)}
        onSubmit={handleUpdateCard}
        isPending={updateCardMutation.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(cardToDelete)}
        title="Delete this flashcard?"
        description={
          cardToDelete
            ? `This will permanently remove the card "${cardToDelete.question}". You cannot undo this deletion.`
            : ""
        }
        confirmLabel="Delete Card"
        isPending={deleteCardMutation.isPending}
        onCancel={() => setCardToDelete(null)}
        onConfirm={handleDeleteCard}
      />
    </>
  );
}
