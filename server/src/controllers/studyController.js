import mongoose from "mongoose";
import { Card } from "../models/Card.js";
import { Deck } from "../models/Deck.js";
import { ReviewEvent } from "../models/ReviewEvent.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateReviewOutcome } from "../utils/reviewScheduler.js";

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

export const getStudySession = asyncHandler(async (req, res) => {
  const deck = await assertDeckOwner(req.params.deckId, req.user._id);
  const now = new Date();

  const dueCards = await Card.find({
    deckId: deck._id,
    nextReviewAt: { $lte: now }
  }).sort({ nextReviewAt: 1, createdAt: 1 });

  const fallbackCards =
    dueCards.length > 0
      ? []
      : await Card.find({ deckId: deck._id }).sort({ createdAt: -1 }).limit(10);

  const cards = (dueCards.length > 0 ? dueCards : fallbackCards).map((card) => ({
    id: card._id,
    question: card.question,
    answer: card.answer,
    hint: card.hint,
    tags: card.tags || [],
    reviewCount: card.reviewCount,
    nextReviewAt: card.nextReviewAt
  }));

  res.json({
    deck: {
      id: deck._id,
      title: deck.title,
      description: deck.description,
      colorTheme: deck.colorTheme
    },
    mode: dueCards.length > 0 ? "due" : "preview",
    cards
  });
});

export const submitReview = asyncHandler(async (req, res) => {
  const { rating } = req.body;

  if (!["again", "hard", "easy"].includes(rating)) {
    throw new AppError("Rating must be one of again, hard, or easy.", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Invalid card id.", 400);
  }

  const card = await Card.findById(req.params.id);

  if (!card) {
    throw new AppError("Card not found.", 404);
  }

  await assertDeckOwner(card.deckId, req.user._id);

  const outcome = calculateReviewOutcome(card, rating);

  card.ease = outcome.ease;
  card.streak = outcome.streak;
  card.reviewCount = outcome.reviewCount;
  card.lastReviewedAt = outcome.lastReviewedAt;
  card.nextReviewAt = outcome.nextReviewAt;
  await card.save();

  await ReviewEvent.create({
    userId: req.user._id,
    cardId: card._id,
    rating,
    reviewedAt: outcome.lastReviewedAt
  });

  const deck = await Deck.findById(card.deckId).select("title");

  res.json({
    message: "Review saved.",
    review: {
      rating,
      nextReviewAt: outcome.nextReviewAt,
      streak: outcome.streak
    },
    deck: {
      id: deck._id,
      title: deck.title
    }
  });
});
