import { describe, it, expect } from "vitest";
import {
  calculateGlobalScore,
  getQualityLevel,
  getQualityColor,
  getHumidityLevel,
  validateScores,
} from "../convex/lib/scoring";

describe("scoring", () => {
  describe("calculateGlobalScore", () => {
    it("returns 5 for all perfect scores", () => {
      expect(
        calculateGlobalScore({
          visualAspect: 5,
          homogeneity: 5,
          cleanliness: 5,
          husking: 5,
          humidity: 12,
        }),
      ).toBe(5);
    });

    it("returns 1 for all minimum scores", () => {
      expect(
        calculateGlobalScore({
          visualAspect: 1,
          homogeneity: 1,
          cleanliness: 1,
          husking: 1,
          humidity: 50,
        }),
      ).toBe(1);
    });

    it("calculates correct average", () => {
      expect(
        calculateGlobalScore({
          visualAspect: 4,
          homogeneity: 3,
          cleanliness: 5,
          husking: 2,
          humidity: 14,
        }),
      ).toBe(3.5);
    });

    it("rounds to 2 decimal places", () => {
      expect(
        calculateGlobalScore({
          visualAspect: 3,
          homogeneity: 4,
          cleanliness: 3,
          husking: 4,
          humidity: 10,
        }),
      ).toBe(3.5);
    });

    it("does not include humidity in the average", () => {
      const score1 = calculateGlobalScore({
        visualAspect: 4,
        homogeneity: 4,
        cleanliness: 4,
        husking: 4,
        humidity: 5,
      });
      const score2 = calculateGlobalScore({
        visualAspect: 4,
        homogeneity: 4,
        cleanliness: 4,
        husking: 4,
        humidity: 95,
      });
      expect(score1).toBe(score2);
    });
  });

  describe("getQualityLevel", () => {
    it("returns excellent for score >= 4", () => {
      expect(getQualityLevel(4)).toBe("excellent");
      expect(getQualityLevel(5)).toBe("excellent");
      expect(getQualityLevel(4.5)).toBe("excellent");
    });

    it("returns bon for score >= 3 and < 4", () => {
      expect(getQualityLevel(3)).toBe("bon");
      expect(getQualityLevel(3.99)).toBe("bon");
    });

    it("returns moyen for score >= 2 and < 3", () => {
      expect(getQualityLevel(2)).toBe("moyen");
      expect(getQualityLevel(2.5)).toBe("moyen");
    });

    it("returns faible for score < 2", () => {
      expect(getQualityLevel(1)).toBe("faible");
      expect(getQualityLevel(1.5)).toBe("faible");
    });
  });

  describe("getQualityColor", () => {
    it("returns text-success for excellent", () => {
      expect(getQualityColor(4.5)).toBe("text-success");
    });

    it("returns text-info for bon", () => {
      expect(getQualityColor(3.5)).toBe("text-info");
    });

    it("returns text-warning for moyen", () => {
      expect(getQualityColor(2.5)).toBe("text-warning");
    });

    it("returns text-error for faible", () => {
      expect(getQualityColor(1.5)).toBe("text-error");
    });
  });

  describe("getHumidityLevel", () => {
    it("returns optimal for <= 14%", () => {
      expect(getHumidityLevel(12)).toBe("optimal");
      expect(getHumidityLevel(14)).toBe("optimal");
    });

    it("returns acceptable for 15-17%", () => {
      expect(getHumidityLevel(15)).toBe("acceptable");
      expect(getHumidityLevel(17)).toBe("acceptable");
    });

    it("returns elevee for > 17%", () => {
      expect(getHumidityLevel(18)).toBe("elevee");
      expect(getHumidityLevel(30)).toBe("elevee");
    });
  });

  describe("validateScores", () => {
    it("returns null for valid scores", () => {
      expect(
        validateScores({
          visualAspect: 3,
          homogeneity: 4,
          cleanliness: 5,
          husking: 2,
          humidity: 14,
        }),
      ).toBeNull();
    });

    it("rejects score below 1", () => {
      expect(
        validateScores({
          visualAspect: 0,
          homogeneity: 4,
          cleanliness: 5,
          husking: 2,
          humidity: 14,
        }),
      ).toContain("visualAspect");
    });

    it("rejects score above 5", () => {
      expect(
        validateScores({
          visualAspect: 3,
          homogeneity: 6,
          cleanliness: 5,
          husking: 2,
          humidity: 14,
        }),
      ).toContain("homogeneity");
    });

    it("rejects non-integer score", () => {
      expect(
        validateScores({
          visualAspect: 3.5,
          homogeneity: 4,
          cleanliness: 5,
          husking: 2,
          humidity: 14,
        }),
      ).toContain("visualAspect");
    });

    it("rejects humidity below 0", () => {
      expect(
        validateScores({
          visualAspect: 3,
          homogeneity: 4,
          cleanliness: 5,
          husking: 2,
          humidity: -1,
        }),
      ).toContain("humidity");
    });

    it("rejects humidity above 100", () => {
      expect(
        validateScores({
          visualAspect: 3,
          homogeneity: 4,
          cleanliness: 5,
          husking: 2,
          humidity: 101,
        }),
      ).toContain("humidity");
    });
  });
});
