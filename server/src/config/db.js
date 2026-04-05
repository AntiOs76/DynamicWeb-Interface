import mongoose from "mongoose";

export async function connectDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to connect to MongoDB.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
}

