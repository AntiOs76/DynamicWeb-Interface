import mongoose from "mongoose";
import { Card } from "../models/Card.js";
import { Deck } from "../models/Deck.js";
import { ReviewEvent } from "../models/ReviewEvent.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DECK_THEMES = new Set(["ember", "ocean", "mint", "plum", "sunrise"]);

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 6);
}

async function getDeckByIdForUser(deckId, userId) {
  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    throw new AppError("Invalid deck id.", 400);
  }

  const deck = await Deck.findOne({ _id: deckId, userId });

  if (!deck) {
    throw new AppError("Deck not found.", 404);
  }

  return deck;
}

export const listDecks = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const deckIds = await Deck.find({ userId: req.user._id }).distinct("_id");

  const [decks, totalCards, dueCards, reviewedToday, recentReview] = await Promise.all([
    Deck.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: {
          from: "cards",
          localField: "_id",
          foreignField: "deckId",
          as: "cards"
        }
      },
      {
        $addFields: {
          cardCount: { $size: "$cards" },
          dueCount: {
            $size: {
              $filter: {
                input: "$cards",
                as: "card",
                cond: { $lte: ["$$card.nextReviewAt", now] }
              }
            }
          }
        }
      },
      {
        $project: {
          cards: 0
        }
      },
      { $sort: { updatedAt: -1 } }
    ]),
    Card.countDocuments({ deckId: { $in: deckIds } }),
    Card.countDocuments({ deckId: { $in: deckIds }, nextReviewAt: { $lte: now } }),
    ReviewEvent.countDocuments({
      userId: req.user._id,
      reviewedAt: { $gte: startOfDay }
    }),
    ReviewEvent.findOne({ userId: req.user._id }).sort({ reviewedAt: -1 }).select("reviewedAt")
  ]);

  res.json({
    decks,
    metrics: {
      totalDecks: decks.length,
      totalCards,
      dueCards,
      reviewedToday,
      lastStudyAt: recentReview?.reviewedAt || null
    }
  });
});

export const createDeck = asyncHandler(async (req, res) => {
  const { title, description, tags, colorTheme } = req.body;

  if (!title?.trim()) {
    throw new AppError("Deck title is required.", 400);
  }

  const deck = await Deck.create({
    userId: req.user._id,
    title: title.trim(),
    description: description?.trim() || "",
    tags: normalizeTags(tags),
    colorTheme: DECK_THEMES.has(colorTheme) ? colorTheme : "ember"
  });

  res.status(201).json({ deck });
});

export const updateDeck = asyncHandler(async (req, res) => {
  const deck = await getDeckByIdForUser(req.params.id, req.user._id);
  const { title, description, tags, colorTheme } = req.body;

  if (title !== undefined) {
    if (!String(title).trim()) {
      throw new AppError("Deck title cannot be empty.", 400);
    }

    deck.title = String(title).trim();
  }

  if (description !== undefined) {
    deck.description = String(description).trim();
  }

  if (tags !== undefined) {
    deck.tags = normalizeTags(tags);
  }

  if (colorTheme !== undefined) {
    deck.colorTheme = DECK_THEMES.has(colorTheme) ? colorTheme : deck.colorTheme;
  }

  await deck.save();
  res.json({ deck });
});

export const deleteDeck = asyncHandler(async (req, res) => {
  const deck = await getDeckByIdForUser(req.params.id, req.user._id);

  await Card.deleteMany({ deckId: deck._id });
  await deck.deleteOne();

  res.json({ message: "Deck deleted successfully." });
});

export const getDeckCards = asyncHandler(async (req, res) => {
  const deck = await getDeckByIdForUser(req.params.deckId, req.user._id);
  const cards = await Card.find({ deckId: deck._id }).sort({
    nextReviewAt: 1,
    createdAt: -1
  });

  const dueCount = cards.filter((card) => new Date(card.nextReviewAt) <= new Date()).length;

  res.json({
    deck,
    cards,
    metrics: {
      cardCount: cards.length,
      dueCount
    }
  });
});
