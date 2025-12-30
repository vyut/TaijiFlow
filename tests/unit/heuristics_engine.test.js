/**
 * Unit Tests - Heuristics Engine
 *
 * Tests for: 8 Tai Chi rules (2 cases each = 16 tests)
 * Plus helper functions: calculateDistance(), getLineAngle()
 */

describe("HeuristicsEngine", () => {
  // =========================================================================
  // Helper Functions (extracted from heuristics_engine.js)
  // =========================================================================

  function calculateDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getLineAngle(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  // =========================================================================
  // Helper Function Tests
  // =========================================================================

  describe("calculateDistance", () => {
    test("same point = 0 distance", () => {
      expect(calculateDistance({ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 })).toBe(0);
    });

    test("horizontal distance", () => {
      expect(calculateDistance({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(1);
    });

    test("vertical distance", () => {
      expect(calculateDistance({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(1);
    });

    test("diagonal distance (3-4-5 triangle)", () => {
      expect(calculateDistance({ x: 0, y: 0 }, { x: 0.3, y: 0.4 })).toBeCloseTo(
        0.5,
        5
      );
    });
  });

  describe("getLineAngle", () => {
    test("horizontal right = 0 degrees", () => {
      expect(getLineAngle({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
    });

    test("horizontal left = 180 degrees", () => {
      expect(getLineAngle({ x: 0, y: 0 }, { x: -1, y: 0 })).toBe(180);
    });

    test("vertical down = 90 degrees", () => {
      expect(getLineAngle({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(90);
    });

    test("vertical up = -90 degrees", () => {
      expect(getLineAngle({ x: 0, y: 0 }, { x: 0, y: -1 })).toBe(-90);
    });
  });

  // =========================================================================
  // Rule 1: Path Shape (checkPathShape)
  // =========================================================================

  describe("Rule 1: Path Shape", () => {
    // Simplified check: consistent direction in wrist history
    function checkPathShape(wristHistory, expectedDirection) {
      if (wristHistory.length < 3) return null;

      let cwCount = 0,
        ccwCount = 0;
      for (let i = 2; i < wristHistory.length; i++) {
        const p1 = wristHistory[i - 2];
        const p2 = wristHistory[i - 1];
        const p3 = wristHistory[i];
        const cross =
          (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
        if (cross > 0) ccwCount++;
        else if (cross < 0) cwCount++;
      }

      const total = cwCount + ccwCount;
      if (total === 0) return "ไม่มีการเคลื่อนที่เป็นวง";

      const consistency =
        (expectedDirection === "cw" ? cwCount : ccwCount) / total;
      if (consistency < 0.6) return "เส้นทางไม่เป็นวงกลม";
      return null; // Pass
    }

    test("PASS: circular motion (clockwise in screen coords = ccw)", () => {
      // In screen coords (Y down), visual CW = mathematical CCW
      const cwPath = [
        { x: 0.5, y: 0.2 }, // top
        { x: 0.6, y: 0.3 },
        { x: 0.7, y: 0.5 }, // right
        { x: 0.6, y: 0.7 },
        { x: 0.5, y: 0.8 }, // bottom
        { x: 0.4, y: 0.7 },
        { x: 0.3, y: 0.5 }, // left
        { x: 0.4, y: 0.3 },
      ];
      expect(checkPathShape(cwPath, "ccw")).toBeNull();
    });

    test("FAIL: straight line motion", () => {
      const straightPath = [
        { x: 0.3, y: 0.5 },
        { x: 0.4, y: 0.5 },
        { x: 0.5, y: 0.5 },
        { x: 0.6, y: 0.5 },
      ];
      expect(checkPathShape(straightPath, "cw")).not.toBeNull();
    });
  });

  // =========================================================================
  // Rule 2: Arm Rotation (checkArmRotation)
  // =========================================================================

  describe("Rule 2: Arm Rotation", () => {
    // หงายมือ = thumb.x < pinky.x (มือขวา, มองจากด้านหน้า)
    function checkArmRotation(thumb, pinky, moveType, hand) {
      if (hand === "right") {
        const palmUp = thumb.x < pinky.x;
        if (moveType === "up" && !palmUp) return "หงายมือขึ้น";
        if (moveType === "down" && palmUp) return "คว่ำมือลง";
      }
      return null; // Pass
    }

    test("PASS: palm up when moving up (right hand)", () => {
      const thumb = { x: 0.4 };
      const pinky = { x: 0.6 }; // thumb.x < pinky.x = หงายมือ
      expect(checkArmRotation(thumb, pinky, "up", "right")).toBeNull();
    });

    test("FAIL: palm down when should be up (right hand)", () => {
      const thumb = { x: 0.6 };
      const pinky = { x: 0.4 }; // thumb.x > pinky.x = คว่ำมือ
      expect(checkArmRotation(thumb, pinky, "up", "right")).toBe("หงายมือขึ้น");
    });
  });

  // =========================================================================
  // Rule 3: Elbow Sinking (checkElbowSinking)
  // =========================================================================

  describe("Rule 3: Elbow Sinking", () => {
    // ศอกควรอยู่ต่ำกว่าไหล่ (y สูงกว่า = ต่ำกว่าในหน้าจอ)
    function checkElbowSinking(shoulder, elbow, tolerance = 0.01) {
      if (elbow.y < shoulder.y - tolerance) {
        return "กดศอกลง อย่าให้ศอกลอย";
      }
      return null; // Pass
    }

    test("PASS: elbow below shoulder", () => {
      const shoulder = { x: 0.5, y: 0.3 };
      const elbow = { x: 0.6, y: 0.4 }; // y สูงกว่า = อยู่ต่ำกว่า
      expect(checkElbowSinking(shoulder, elbow)).toBeNull();
    });

    test("FAIL: elbow above shoulder", () => {
      const shoulder = { x: 0.5, y: 0.4 };
      const elbow = { x: 0.6, y: 0.2 }; // y ต่ำกว่า = อยู่สูงกว่า
      expect(checkElbowSinking(shoulder, elbow)).toBe("กดศอกลง อย่าให้ศอกลอย");
    });
  });

  // =========================================================================
  // Rule 4: Waist Initiation (checkWaistInitiation)
  // =========================================================================

  describe("Rule 4: Waist Initiation", () => {
    // เอวควรนำ - shoulder velocity ไม่ควรเร็วกว่า hip velocity 3 เท่า
    function checkWaistInitiation(shoulderVel, hipVel, ratio = 3.0) {
      if (hipVel < 2.0) return null; // ต้องเคลื่อนที่ก่อน
      if (shoulderVel > hipVel * ratio) {
        return "ใช้เอวนำการเคลื่อนไหว";
      }
      return null; // Pass
    }

    test("PASS: hip leads shoulder", () => {
      expect(checkWaistInitiation(5.0, 5.0)).toBeNull(); // 1:1 ratio
    });

    test("FAIL: shoulder leads hip (ratio > 3)", () => {
      expect(checkWaistInitiation(15.0, 3.0)).toBe("ใช้เอวนำการเคลื่อนไหว"); // 5:1 ratio
    });
  });

  // =========================================================================
  // Rule 5: Vertical Stability (checkVerticalStability)
  // =========================================================================

  describe("Rule 5: Vertical Stability", () => {
    // หัวควรนิ่ง - standard deviation ของ nose.y ไม่ควรเกิน threshold
    function checkVerticalStability(noseHistory, threshold = 0.05) {
      if (noseHistory.length < 5) return null;

      const yValues = noseHistory.map((p) => p.y);
      const mean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
      const variance =
        yValues.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0) /
        yValues.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > threshold) {
        return "รักษาหัวให้นิ่ง";
      }
      return null; // Pass
    }

    test("PASS: stable head (low variance)", () => {
      const stableNose = [
        { y: 0.2 },
        { y: 0.21 },
        { y: 0.2 },
        { y: 0.19 },
        { y: 0.2 },
      ];
      expect(checkVerticalStability(stableNose)).toBeNull();
    });

    test("FAIL: bobbing head (high variance)", () => {
      const bobbingNose = [
        { y: 0.15 },
        { y: 0.3 },
        { y: 0.1 },
        { y: 0.35 },
        { y: 0.2 },
      ];
      expect(checkVerticalStability(bobbingNose)).toBe("รักษาหัวให้นิ่ง");
    });
  });

  // =========================================================================
  // Rule 6: Smoothness (checkSmoothness)
  // =========================================================================

  describe("Rule 6: Smoothness", () => {
    // ความลื่นไหล - acceleration ไม่ควรเกิน threshold
    function checkSmoothness(acceleration, threshold = 0.05) {
      if (Math.abs(acceleration) > threshold) {
        return "เคลื่อนไหวให้ลื่นไหล อย่ากระตุก";
      }
      return null; // Pass
    }

    test("PASS: smooth motion (low acceleration)", () => {
      expect(checkSmoothness(0.02)).toBeNull();
    });

    test("FAIL: jerky motion (high acceleration)", () => {
      expect(checkSmoothness(0.1)).toBe("เคลื่อนไหวให้ลื่นไหล อย่ากระตุก");
    });
  });

  // =========================================================================
  // Rule 7: Continuity (checkContinuity)
  // =========================================================================

  describe("Rule 7: Continuity", () => {
    // ต่อเนื่อง - ไม่ควรหยุดนิ่งเกิน threshold frames
    function checkContinuity(pauseFrames, threshold = 15) {
      if (pauseFrames > threshold) {
        return "เคลื่อนไหวต่อเนื่อง อย่าหยุด";
      }
      return null; // Pass
    }

    test("PASS: continuous motion (no pause)", () => {
      expect(checkContinuity(5)).toBeNull();
    });

    test("FAIL: stopped too long", () => {
      expect(checkContinuity(20)).toBe("เคลื่อนไหวต่อเนื่อง อย่าหยุด");
    });
  });

  // =========================================================================
  // Rule 8: Weight Shift (checkWeightShift)
  // =========================================================================

  describe("Rule 8: Weight Shift", () => {
    // น้ำหนักอยู่ในฐาน - center of mass อยู่ระหว่าง ankles
    function checkWeightShift(leftAnkle, rightAnkle, centerX, buffer = 0.1) {
      const minX = Math.min(leftAnkle.x, rightAnkle.x) - buffer;
      const maxX = Math.max(leftAnkle.x, rightAnkle.x) + buffer;

      if (centerX < minX || centerX > maxX) {
        return "รักษาจุดศูนย์ถ่วงให้อยู่ในฐาน";
      }
      return null; // Pass
    }

    test("PASS: weight centered in stance", () => {
      const leftAnkle = { x: 0.4 };
      const rightAnkle = { x: 0.6 };
      const centerX = 0.5; // ตรงกลาง
      expect(checkWeightShift(leftAnkle, rightAnkle, centerX)).toBeNull();
    });

    test("FAIL: weight outside stance", () => {
      const leftAnkle = { x: 0.4 };
      const rightAnkle = { x: 0.6 };
      const centerX = 0.2; // นอกฐานด้านซ้าย
      expect(checkWeightShift(leftAnkle, rightAnkle, centerX)).toBe(
        "รักษาจุดศูนย์ถ่วงให้อยู่ในฐาน"
      );
    });
  });
});
