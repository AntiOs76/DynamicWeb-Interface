import { describe, expect, it } from "vitest";
import { calculateReviewOutcome } from "../src/utils/reviewScheduler.js";

describe("calculateReviewOutcome", () => {
  it("resets streak for again reviews", () => {
    const result = calculateReviewOutcome(
      { ease: 2.4, streak: 3, reviewCount: 5 },
      "again"
    );

    expect(result.streak).toBe(0);
    expect(result.reviewCount).toBe(6);
    expect(result.ease).toBeLessThan(2.4);
  });

  it("extends interval for easy reviews", () => {
    const result = calculateReviewOutcome(
      { ease: 2.3, streak: 2, reviewCount: 4 },
      "easy"
    );

    expect(result.streak).toBe(3);
    expect(result.ease).toBeGreaterThan(2.3);
    expect(result.nextReviewAt.getTime()).toBeGreaterThan(Date.now());
  });
});
