import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getClearCookieOptions, getCookieOptions, signToken } from "../utils/auth.js";

function sanitizeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  };
}

function setAuthCookie(res, userId) {
  const token = signToken(userId, env.jwtSecret);
  res.cookie("token", token, getCookieOptions(env.nodeEnv));
}

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new AppError("Username, email, and password are required.", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long.", 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    passwordHash
  });

  setAuthCookie(res, user._id);

  res.status(201).json({
    message: "Account created successfully.",
    user: sanitizeUser(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  setAuthCookie(res, user._id);

  res.json({
    message: "Signed in successfully.",
    user: sanitizeUser(user)
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token", getClearCookieOptions(env.nodeEnv));
  res.json({ message: "Signed out successfully." });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    user: sanitizeUser(req.user)
  });
});
