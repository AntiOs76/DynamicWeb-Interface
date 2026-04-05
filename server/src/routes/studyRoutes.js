import express from "express";
import { getStudySession, submitReview } from "../controllers/studyController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const studyRoutes = express.Router();

studyRoutes.use(requireAuth);
studyRoutes.get("/decks/:deckId/session", getStudySession);
studyRoutes.post("/cards/:id/review", submitReview);

