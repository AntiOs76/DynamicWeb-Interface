import mongoose from "mongoose";
import { Card } from "../models/Card.js";
import { Deck } from "../models/Deck.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeCardTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 3);
}

async function assertDeckOwner(deckId, userId) {
  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    throw new AppError("Invalid deck id.", 400);
  }

  const deck = await Deck.findOne({ _id: deckId, userId });

  if (!deck) {
    throw new AppError("Deck not found.", 404);
  }

  return deck;
}

async function getOwnedCard(cardId, userId) {
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new AppError("Invalid card id.", 400);
  }

  const card = await Card.findById(cardId);

  if (!card) {
    throw new AppError("Card not found.", 404);
  }

  await assertDeckOwner(card.deckId, userId);
  return card;
}

export const createCard = asyncHandler(async (req, res) => {
  const deck = await assertDeckOwner(req.params.deckId, req.user._id);
  const { question, answer, hint, tags } = req.body;

  if (!question?.trim() || !answer?.trim()) {
    throw new AppError("Question and answer are required.", 400);
  }

  const card = await Card.create({
    deckId: deck._id,
    question: question.trim(),
    answer: answer.trim(),
    hint: hint?.trim() || "",
    tags: normalizeCardTags(tags)
  });

  res.status(201).json({ card });
});

export const updateCard = asyncHandler(async (req, res) => {
  const card = await getOwnedCard(req.params.id, req.user._id);
  const { question, answer, hint, tags } = req.body;

  if (question !== undefined) {
    if (!String(question).trim()) {
      throw new AppError("Question cannot be empty.", 400);
    }

    card.question = String(question).trim();
  }

  if (answer !== undefined) {
    if (!String(answer).trim()) {
      throw new AppError("Answer cannot be empty.", 400);
    }

    card.answer = String(answer).trim();
  }

  if (hint !== undefined) {
    card.hint = String(hint).trim();
  }

  if (tags !== undefined) {
    card.tags = normalizeCardTags(tags);
  }

  await card.save();

  res.json({ card });
});

export const deleteCard = asyncHandler(async (req, res) => {
  const card = await getOwnedCard(req.params.id, req.user._id);
  await card.deleteOne();
  res.json({ message: "Card deleted successfully." });
});
