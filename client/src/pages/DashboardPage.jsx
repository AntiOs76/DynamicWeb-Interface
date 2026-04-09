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

function CardsIcon() {
  return icon(
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M7.5 10h9" />
      <path d="M7.5 14h5.5" />
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

function FolderIcon() {
  return icon(
    <>
      <path d="M3.5 8.5a2.5 2.5 0 0 1 2.5-2.5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5z" />
      <path d="M3.5 10.5h17" />
    </>
  );
}

function StudyIcon() {
  return icon(
    <>
      <path d="m3.5 9 8.5-4 8.5 4-8.5 4z" />
      <path d="M7.5 11.5v3.2c0 .8 2 2.3 4.5 2.3s4.5-1.5 4.5-2.3v-3.2" />
      <path d="M20.5 10.2V15" />
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

function deckStatusLabel(dueCount) {
  if (dueCount > 0) {
    return `${dueCount} ${dueCount === 1 ? "card" : "cards"} ready to review`;
  }

  return "No reviews due";
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
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Learning Control Center</p>
          <h2>Keep every deck organized, visible, and ready for the next study session.</h2>
          <p className="muted-text">
            Build new decks, search your content, and jump directly into due reviews from one streamlined workspace.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={() => setShowCreateModal(true)}>
          <PlusIcon />
          Create deck
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

      <section className="dashboard-search-row">
        <label className="search-field dashboard-search-field">
          <span className="visually-hidden">Search decks</span>
          <span className="dashboard-search-icon">
            <SearchIcon />
          </span>
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
              <div className="deck-card-body">
                <div className="deck-card-heading">
                  <p className="eyebrow">Deck</p>
                  <h3>{deck.title}</h3>
                  <span className={`pill deck-status-pill ${deck.dueCount > 0 ? "is-due" : "is-preview"}`}>
                    {deckStatusLabel(deck.dueCount)}
                  </span>
                </div>
                <p className="muted-text deck-card-description">
                  {deck.description || "No description yet. Add context to sharpen the deck's purpose."}
                </p>
                {(deck.tags || []).length > 0 ? (
                  <div className="tag-row deck-tag-row">
                    {(deck.tags || []).map((tag) => (
                      <span key={tag} className="tag-chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="deck-stats">
                  <span className="deck-stat">
                    <CardsIcon />
                    {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
                  </span>
                  <span className="deck-stat">
                    <CalendarIcon />
                    Updated {formatDate(deck.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="deck-card-footer">
                <div className="card-actions deck-card-actions">
                  <button className="secondary-button" type="button" onClick={() => navigate(`/decks/${deck._id}`)}>
                    <FolderIcon />
                    Open workspace
                  </button>
                  <button className="ghost-button" type="button" onClick={() => setEditingDeck(deck)}>
                    <EditIcon />
                    Edit
                  </button>
                  <button
                    className="ghost-button danger-button deck-delete-button"
                    type="button"
                    onClick={() => setDeckToDelete(deck)}
                  >
                    <TrashIcon />
                    Delete
                  </button>
                </div>
                <button className="primary-button deck-study-button" type="button" onClick={() => navigate(`/study/${deck._id}`)}>
                  <StudyIcon />
                  Study Now
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
              <PlusIcon />
              Create deck
            </button>
          }
        />
      ) : hasSearchQuery ? (
        <EmptyState
          title="No decks match this search"
          message="Try a different keyword or clear the search to see your existing decks."
          action={
            <button className="primary-button" type="button" onClick={() => setShowCreateModal(true)}>
              <PlusIcon />
              Create deck
            </button>
          }
        />
      ) : (
        <EmptyState
          title="No decks yet"
          message="Create a new deck to start organizing flashcards and building your review workflow."
          action={
            <button className="primary-button" type="button" onClick={() => setShowCreateModal(true)}>
              <PlusIcon />
              Create deck
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
