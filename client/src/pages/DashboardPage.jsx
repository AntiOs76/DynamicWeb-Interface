import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { SkeletonCard } from "../components/SkeletonCard.jsx";
import { StatusBanner } from "../components/StatusBanner.jsx";
import { DeckFormModal } from "../features/decks/DeckFormModal.jsx";
import { formatDate } from "../utils/format.js";

function themeClass(theme) {
  return `theme-${theme || "ember"}`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const deferredSearch = useDeferredValue(search);

  const decksQuery = useQuery({
    queryKey: ["decks"],
    queryFn: api.fetchDecks
  });

  const createDeckMutation = useMutation({
    mutationFn: api.createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setShowCreateModal(false);
    }
  });

  const updateDeckMutation = useMutation({
    mutationFn: ({ deckId, payload }) => api.updateDeck(deckId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setEditingDeck(null);
    }
  });

  const deleteDeckMutation = useMutation({
    mutationFn: api.deleteDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    }
  });

  const filteredDecks = useMemo(() => {
    const decks = decksQuery.data?.decks || [];
    const normalizedSearch = deferredSearch.toLowerCase().trim();

    if (!normalizedSearch) {
      return decks;
    }

    return decks.filter((deck) => {
      const haystack = [deck.title, deck.description, ...(deck.tags || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [decksQuery.data?.decks, deferredSearch]);

  async function handleCreateDeck(values) {
    try {
      setErrorMessage("");
      await createDeckMutation.mutateAsync(values);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleUpdateDeck(values) {
    try {
      setErrorMessage("");
      await updateDeckMutation.mutateAsync({ deckId: editingDeck._id, payload: values });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteDeck() {
    if (!deckToDelete) {
      return;
    }

    try {
      setErrorMessage("");
      await deleteDeckMutation.mutateAsync(deckToDelete._id);
      setDeckToDelete(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const metrics = decksQuery.data?.metrics;
  const hasDecks = (decksQuery.data?.decks?.length || 0) > 0;
  const hasSearchQuery = deferredSearch.trim().length > 0;
  const hasFilteredDecks = filteredDecks.length > 0;

  return (
    <>
      <section className="dashboard-hero panel">
        <div>
          <p className="eyebrow">Learning Control Center</p>
          <h2>Keep every deck organized, visible, and ready for the next study session.</h2>
          <p className="muted-text">
            Build new decks, search your content, and jump directly into due reviews from one streamlined workspace.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={() => setShowCreateModal(true)}>
          Create Deck
        </button>
      </section>

      {errorMessage ? <StatusBanner tone="error">{errorMessage}</StatusBanner> : null}

      <section className="metrics-grid">
        <article className="metric-card panel">
          <span>Total Decks</span>
          <strong>{metrics?.totalDecks ?? 0}</strong>
        </article>
        <article className="metric-card panel">
          <span>Total Cards</span>
          <strong>{metrics?.totalCards ?? 0}</strong>
        </article>
        <article className="metric-card panel">
          <span>Due Now</span>
          <strong>{metrics?.dueCards ?? 0}</strong>
        </article>
        <article className="metric-card panel">
          <span>Last Study</span>
          <strong>{metrics?.lastStudyAt ? formatDate(metrics.lastStudyAt) : "Not yet"}</strong>
        </article>
      </section>

      <section className="toolbar panel glass-panel">
        <label className="search-field">
          <span className="visually-hidden">Search decks</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, description, or tag"
          />
        </label>
      </section>

      {decksQuery.isLoading ? (
        <section className="deck-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </section>
      ) : hasFilteredDecks ? (
        <section className="deck-grid">
          {filteredDecks.map((deck) => (
            <article key={deck._id} className={`deck-card panel ${themeClass(deck.colorTheme)}`}>
              <div className="deck-card-header">
                <div>
                  <p className="eyebrow">Deck</p>
                  <h3>{deck.title}</h3>
                </div>
                <span className="pill">{deck.dueCount} due</span>
              </div>
              <p className="muted-text">{deck.description || "No description yet. Add context to sharpen the deck's purpose."}</p>
              <div className="deck-stats">
                <span>{deck.cardCount} cards</span>
                <span>Updated {formatDate(deck.updatedAt)}</span>
              </div>
              <div className="tag-row">
                {(deck.tags || []).map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="card-actions">
                <button className="secondary-button" type="button" onClick={() => navigate(`/decks/${deck._id}`)}>
                  Open Workspace
                </button>
                <button className="ghost-button" type="button" onClick={() => navigate(`/study/${deck._id}`)}>
                  Study Now
                </button>
                <button className="ghost-button" type="button" onClick={() => setEditingDeck(deck)}>
                  Edit
                </button>
                <button className="ghost-button danger-button" type="button" onClick={() => setDeckToDelete(deck)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : !hasDecks ? (
        <EmptyState
          title="No decks yet"
          message="Create a new deck to start organizing flashcards and building your review workflow."
          action={
            <button className="primary-button" type="button" onClick={() => setShowCreateModal(true)}>
              Create a new deck
            </button>
          }
        />
      ) : hasSearchQuery ? (
        <EmptyState
          title="No decks match this search"
          message="Try a different keyword or clear the search to see your existing decks."
          action={
            <button className="primary-button" type="button" onClick={() => setShowCreateModal(true)}>
              Create a new deck
            </button>
          }
        />
      ) : (
        <EmptyState
          title="No decks yet"
          message="Create a new deck to start organizing flashcards and building your review workflow."
          action={
            <button className="primary-button" type="button" onClick={() => setShowCreateModal(true)}>
              Create a new deck
            </button>
          }
        />
      )}

      <DeckFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDeck}
        isPending={createDeckMutation.isPending}
      />

      <DeckFormModal
        isOpen={Boolean(editingDeck)}
        initialValues={editingDeck}
        onClose={() => setEditingDeck(null)}
        onSubmit={handleUpdateDeck}
        isPending={updateDeckMutation.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(deckToDelete)}
        title="Delete this deck?"
        description={
          deckToDelete
            ? `This will permanently remove "${deckToDelete.title}" and all of its flashcards. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Deck"
        isPending={deleteDeckMutation.isPending}
        onCancel={() => setDeckToDelete(null)}
        onConfirm={handleDeleteDeck}
      />
    </>
  );
}
