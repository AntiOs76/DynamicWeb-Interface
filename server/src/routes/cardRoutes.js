import express from "express";
import { deleteCard, updateCard } from "../controllers/cardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const cardRoutes = express.Router();

cardRoutes.use(requireAuth);
cardRoutes.patch("/:id", updateCard);
cardRoutes.delete("/:id", deleteCard);

