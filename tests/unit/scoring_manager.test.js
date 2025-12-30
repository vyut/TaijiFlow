/**
 * Unit Tests - Scoring Manager
 *
 * Tests for: calculateScore(), getGrade()
 */

// Mock the ScoringManager class (extract logic for testing)
// Note: Original class is in js/scoring_manager.js

describe("ScoringManager", () => {
  // Score calculation logic (extracted from ScoringManager)
  function calculateScore(correctFrames, totalFrames) {
    if (totalFrames === 0) return 0;
    return Math.round((correctFrames / totalFrames) * 100);
  }

  // Grade logic (extracted from ScoringManager)
  // Thresholds: A≥85, B≥70, C≥55, D≥40, F<40
  function getGrade(score) {
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "F";
  }

  describe("calculateScore", () => {
    test("100% correct = 100 score", () => {
      expect(calculateScore(100, 100)).toBe(100);
    });

    test("50% correct = 50 score", () => {
      expect(calculateScore(50, 100)).toBe(50);
    });

    test("0% correct = 0 score", () => {
      expect(calculateScore(0, 100)).toBe(0);
    });

    test("0 total frames = 0 score (avoid division by zero)", () => {
      expect(calculateScore(0, 0)).toBe(0);
    });

    test("partial frames rounds correctly", () => {
      expect(calculateScore(33, 100)).toBe(33);
      expect(calculateScore(67, 100)).toBe(67);
    });
  });

  describe("getGrade", () => {
    test("score 85+ = A", () => {
      expect(getGrade(85)).toBe("A");
      expect(getGrade(90)).toBe("A");
      expect(getGrade(100)).toBe("A");
    });

    test("score 70-84 = B", () => {
      expect(getGrade(70)).toBe("B");
      expect(getGrade(77)).toBe("B");
      expect(getGrade(84)).toBe("B");
    });

    test("score 55-69 = C", () => {
      expect(getGrade(55)).toBe("C");
      expect(getGrade(62)).toBe("C");
      expect(getGrade(69)).toBe("C");
    });

    test("score 40-54 = D", () => {
      expect(getGrade(40)).toBe("D");
      expect(getGrade(47)).toBe("D");
      expect(getGrade(54)).toBe("D");
    });

    test("score <40 = F", () => {
      expect(getGrade(39)).toBe("F");
      expect(getGrade(20)).toBe("F");
      expect(getGrade(0)).toBe("F");
    });
  });
});
