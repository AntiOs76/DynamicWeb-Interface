import mongoose from "mongoose";

const reviewEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
      index: true
    },
    rating: {
      type: String,
      enum: ["again", "hard", "easy"],
      required: true
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

export const ReviewEvent = mongoose.model("ReviewEvent", reviewEventSchema);

