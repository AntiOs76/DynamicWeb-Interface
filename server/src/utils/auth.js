import jwt from "jsonwebtoken";

export function signToken(userId, secret) {
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

export function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

export function getCookieOptions(nodeEnv) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: nodeEnv === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

export function getClearCookieOptions(nodeEnv) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: nodeEnv === "production"
  };
}
