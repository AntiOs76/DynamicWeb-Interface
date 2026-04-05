import express from "express";
import {
  createDeck,
  deleteDeck,
  getDeckCards,
  listDecks,
  updateDeck
} from "../controllers/deckController.js";
import { createCard } from "../controllers/cardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const deckRoutes = express.Router();

deckRoutes.use(requireAuth);
deckRoutes.get("/", listDecks);
deckRoutes.post("/", createDeck);
deckRoutes.get("/:deckId/cards", getDeckCards);
deckRoutes.post("/:deckId/cards", createCard);
deckRoutes.patch("/:id", updateDeck);
deckRoutes.delete("/:id", deleteDeck);

