import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
      index: true
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    hint: {
      type: String,
      trim: true,
      maxlength: 180,
      default: ""
    },
    tags: {
      type: [String],
      default: []
    },
    lastReviewedAt: {
      type: Date,
      default: null
    },
    nextReviewAt: {
      type: Date,
      default: Date.now
    },
    streak: {
      type: Number,
      default: 0
    },
    ease: {
      type: Number,
      default: 2.3
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const Card = mongoose.model("Card", cardSchema);
