import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { verifyToken } from "../utils/auth.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError("Authentication required.", 401);
  }

  const payload = verifyToken(token, env.jwtSecret);
  const user = await User.findById(payload.userId).select("_id username email createdAt");

  if (!user) {
    throw new AppError("User session is no longer valid.", 401);
  }

  req.user = user;
  next();
});

