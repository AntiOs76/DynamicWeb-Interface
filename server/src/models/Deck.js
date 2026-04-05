import mongoose from "mongoose";

const deckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    description: {
      type: String,
      trim: true,
      maxlength: 240,
      default: ""
    },
    tags: {
      type: [String],
      default: []
    },
    colorTheme: {
      type: String,
      default: "ember"
    }
  },
  {
    timestamps: true
  }
);

export const Deck = mongoose.model("Deck", deckSchema);

