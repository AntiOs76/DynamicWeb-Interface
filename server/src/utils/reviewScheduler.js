const DAY_IN_MS = 24 * 60 * 60 * 1000;

const ratingConfig = {
  again: { easeDelta: -0.2, streak: 0, multiplier: 0.2 },
  hard: { easeDelta: -0.05, streak: 1, multiplier: 1.2 },
  easy: { easeDelta: 0.15, streak: 1, multiplier: 2 }
};

export function calculateReviewOutcome(card, rating) {
  const config = ratingConfig[rating];

  if (!config) {
    throw new Error(`Unsupported rating: ${rating}`);
  }

  const previousEase = Number(card.ease ?? 2.3);
  const safeEase = Math.max(1.3, previousEase + config.easeDelta);
  const previousStreak = Number(card.streak ?? 0);
  const newStreak = rating === "again" ? 0 : previousStreak + config.streak;
  const previousCount = Number(card.reviewCount ?? 0);
  const baseIntervalDays =
    rating === "again"
      ? 1
      : Math.max(1, Math.round((previousStreak + 1) * safeEase * config.multiplier));
  const now = new Date();
  const nextReviewAt = new Date(now.getTime() + baseIntervalDays * DAY_IN_MS);

  return {
    ease: Number(safeEase.toFixed(2)),
    streak: newStreak,
    reviewCount: previousCount + 1,
    lastReviewedAt: now,
    nextReviewAt
  };
}

