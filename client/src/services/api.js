const API_BASE = import.meta.env.VITE_API_URL || "";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || "Request failed.", response.status);
  }

  return data;
}

export const api = {
  healthCheck() {
    return request("/api/health");
  },
  register(payload) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  login(payload) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  logout() {
    return request("/api/auth/logout", { method: "POST" });
  },
  fetchSession() {
    return request("/api/auth/me");
  },
  fetchDecks() {
    return request("/api/decks");
  },
  createDeck(payload) {
    return request("/api/decks", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateDeck(deckId, payload) {
    return request(`/api/decks/${deckId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  deleteDeck(deckId) {
    return request(`/api/decks/${deckId}`, { method: "DELETE" });
  },
  fetchDeckCards(deckId) {
    return request(`/api/decks/${deckId}/cards`);
  },
  createCard(deckId, payload) {
    return request(`/api/decks/${deckId}/cards`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateCard(cardId, payload) {
    return request(`/api/cards/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  deleteCard(cardId) {
    return request(`/api/cards/${cardId}`, { method: "DELETE" });
  },
  fetchStudySession(deckId) {
    return request(`/api/study/decks/${deckId}/session`);
  },
  submitReview(cardId, payload) {
    return request(`/api/study/cards/${cardId}/review`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};

