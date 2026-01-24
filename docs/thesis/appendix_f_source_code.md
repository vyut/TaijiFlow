# Appendix F: Source Code สำคัญ

---

## E.1 โครงสร้างไฟล์โปรเจค

```
TaijiFlow/
├── 📄 index.html                    # Landing Page
├── 📄 app.html                      # Training Application
├── 📄 data_collector.html           # Data Collection Tool
│
├── 📁 css/                          # Stylesheets (5 files)
│   ├── base.css                     # Shared Styles (Variables, Reset)
│   ├── styles.css                   # App Styles
│   ├── landing.css                  # Landing Page Styles
│   ├── chatbot.css                  # Chatbot Styles
│   └── feedback.css                 # Feedback Modal Styles
│
├── 📁 js/                           # JavaScript Modules (Modularized)
│   ├── 📁 core/                     # Core Logic
│   │   ├── heuristics_engine.js     # 9 Rules Analysis
│   │   ├── calibration_manager.js   # Body Calibration
│   │   └── scoring_manager.js       # Scoring System
│   ├── 📁 controllers/              # Input & Main Control
│   │   ├── script.js                # Main Entry Point
│   │   └── keyboard_controller.js   # Keyboard Shortcuts
│   ├── 📁 display/                  # Visual Rendering
│   │   ├── drawing_manager.js       # Canvas Drawing
│   │   └── ghost_manager.js         # Ghost Overlay
│   ├── 📁 ui/                       # UI Components
│   │   ├── ui_manager.js            # Menu & Theme
│   │   ├── audio_manager.js         # TTS Feedback
│   │   └── ...                      # Other UI managers
│   └── 📁 utils/                    # Shared Utilities
│
├── 📁 data/                         # Reference Data
│   ├── rh_cw_L1.json                # Ghost landmarks
│   ├── rh_cw_L1.webm                # Instructor video
│   └── ...
│
└── 📁 tests/                        # Unit Tests
    └── unit/
        ├── heuristics_engine.test.js
        ├── scoring_manager.test.js
        └── session_manager.test.js
```

---

## ง.2 HeuristicsEngine - Core Analysis Module

**ไฟล์:** `js/core/heuristics_engine.js` (1150 บรรทัด, ~60KB)

### ง.2.1 Class Overview

```javascript
/**
 * TaijiFlow AI - Heuristics Engine v3.0
 * 
 * ระบบวิเคราะห์ท่าทางการฝึกม้วนไหม (Silk Reeling) 
 * ตามหลักมวยไทเก๊กตระกูลเฉิน
 *
 * Features:
 *   - Dynamic Thresholds: ปรับตามสัดส่วนร่างกาย
 *   - Priority System: แสดงข้อผิดพลาดสำคัญก่อน
 *   - Sticky Feedback: ป้องกันข้อความกระพริบ
 *   - Level-based Rules: ตรวจกฎต่างกันตาม Level
 */
class HeuristicsEngine {
    constructor() {
        this.CONFIG = {
            // Rule 1: Path Shape (v0.9.10 Slice-Based)
            SHAPE_CONSISTENCY_THRESHOLD: 0.6,
            SHAPE_ANALYSIS_POINTS: 10,  // slice-based แทน frames
            
            // Rule 2: Arm Rotation (v0.9.11)
            ARM_MOTION_THRESHOLD: 0.015,
            ARM_ROTATION_NEUTRAL_ZONE: 0.05, // 🆕 5% transition tolerance
            
            // Rule 3: Elbow Sinking
            ELBOW_TOLERANCE_DEFAULT: 0.01,
            
            // Rule 4: Waist Initiation (v0.9.11 tuned)
            MIN_HIP_VELOCITY_DEG_SEC: 1.0, // 🔄 was 2.0
            SHOULDER_HIP_RATIO: 2.0,       // 🔄 was 3.0
            
            // Rule 5: Vertical Stability (v0.9.11 time-based)
            STABILITY_WINDOW_MS: 5000,     // 🔄 time-based, was frames
            STABILITY_MIN_POINTS: 3,       // 🆕
            STABILITY_THRESHOLD_DEFAULT: 0.05,
            
            // Rule 6: Smoothness (v0.9.11 tuned)
            SMOOTHNESS_THRESHOLD_DEFAULT: 0.1,  // 🔄 was 0.05
            SMOOTHNESS_CALIBRATION_RATIO: 0.5,  // 🔄 was 0.08
            
            // Rule 7: Continuity (Time-Based v0.9.9)
            PAUSE_WINDOW_MS: 2000,
            PAUSE_AVG_VELOCITY_THRESHOLD: 0.003,
            
            // Rule 8: Weight Shift (v0.9.11 tuned)
            WEIGHT_BUFFER_RATIO: 0.3,      // 🔄 was 0.1

            // Rule 9: Coordination (Rule 9 New)
            COORDINATION_VELOCITY_THRESHOLD: 0.02,
            
            // Feedback
            FEEDBACK_HOLD_TIME_MS: 1000,
        };
        
        // Level-based Rules Configuration
        this.RULES_CONFIG = {
            L1: { // 3 rules - ง่ายที่สุด
                checkPath: true,
                checkElbow: true,
                checkContinuity: true
            },
            L2: { // 6 rules - ปานกลาง
                checkPath: true,
                checkRotation: true,
                checkElbow: true,
                checkWaist: true,
                checkStability: true,
                checkContinuity: true
            },
// 9 Rules Analysis (~51KB)
...
            L3: { // 9 rules - ครบทุกกฎ
                checkPath: true,
                checkRotation: true,
                checkElbow: true,
                checkWaist: true,
                checkStability: true,
                checkSmooth: true,
                checkContinuity: true,
                checkWeight: true,
                checkCoordination: true // ✅ Rule 9 Added
            }
        };
    }
}
```

### ง.2.2 Main Analysis Method

```javascript
/**
 * วิเคราะห์ท่าทางและส่งคืน Feedback
 * 
 * @param {Object[]} landmarks - 33 จุดจาก MediaPipe
 * @param {number} timestamp - เวลาปัจจุบัน (ms)
 * @param {Object[]} referencePath - เส้นทางต้นแบบ
 * @param {string} currentExercise - ท่าที่ฝึก
 * @param {string} currentLevel - ระดับ L1/L2/L3
 * @returns {string[]} Array ของ Feedback messages
 */
analyze(landmarks, timestamp, referencePath, currentExercise, currentLevel) {
    let allErrors = [];
    
    // ดึง Keypoints ที่ต้องการ
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    // ... more keypoints
    
    // ตรวจสอบทุกกฎตาม Level
    if (config.checkPath) {
        const err = this.checkPathShape(currentExercise);
        if (err) allErrors.push({ msg: err, rule: "Path Accuracy" });
    }
    // ... ตรวจกฎอื่นๆ
    
    // เรียงตาม Priority และแสดงข้อที่สำคัญที่สุด
    allErrors.sort((a, b) => {
        return this.RULE_PRIORITY[a.rule] - this.RULE_PRIORITY[b.rule];
    });
    
    return allErrors.length > 0 ? [allErrors[0].msg] : [];
}
```

### ง.2.3 Rule Implementation Example - Path Shape

```javascript
/**
 * Rule 1: Path Shape - ตรวจสอบรูปทรงวงกลม (v0.9.10)
 * 
 * Algorithm:
 *   1. เก็บ wrist history 10 จุดล่าสุด (slice-based)
 *   2. ตรวจ isPaused() - ถ้าหยุดนิ่งให้ Rule 7 จัดการ
 *   3. คำนวณ cross product ทุก 3 จุด
 *   4. ตรวจเส้นตรง (total === 0)
 *   5. ตรวจทิศทางก่อน consistency
 */
checkPathShape(currentExercise = "rh_cw") {
    const analysisPoints = this.CONFIG.SHAPE_ANALYSIS_POINTS;  // 10
    const threshold = this.CONFIG.SHAPE_CONSISTENCY_THRESHOLD; // 0.6

    if (this.wristHistory.length < analysisPoints) return null;
    if (this.isPaused()) return null;  // 🆕 ให้ Rule 7 จัดการการหยุดนิ่ง

    const recentHistory = this.wristHistory.slice(-analysisPoints);
    let clockwiseTurns = 0;
    let counterClockwiseTurns = 0;

    for (let i = 2; i < recentHistory.length; i++) {
        const p1 = recentHistory[i - 2];
        const p2 = recentHistory[i - 1];
        const p3 = recentHistory[i];

        // Cross product: CW vs CCW
        const cross = (p2.x - p1.x) * (p3.y - p2.y) 
                    - (p2.y - p1.y) * (p3.x - p2.x);

        if (cross > 0.0001) clockwiseTurns++;
        else if (cross < -0.0001) counterClockwiseTurns++;
    }

    const total = clockwiseTurns + counterClockwiseTurns;
    
    // 🆕 ตรวจเส้นตรง
    if (total === 0) return this.getMessage("moveInCircle");

    const consistency = Math.max(clockwiseTurns, counterClockwiseTurns) / total;

    // 🆕 ตรวจทิศทางก่อน (สำคัญกว่า consistency)
    const expectedCW = currentExercise.includes("cw");
    const actualCW = counterClockwiseTurns > clockwiseTurns;  // สลับเพราะ mirror
    
    const dominance = Math.max(clockwiseTurns, counterClockwiseTurns) / total;
    if (dominance >= 0.6 && expectedCW !== actualCW) {
        return this.getMessage("wrongDirection");
    }

    if (consistency < threshold) {
        return this.getMessage("moveInCircle");
    }

    return null;
}

/**
 * Example 2: Rule 9 - Upper-Lower Coordination (v0.9.12)
 * ตรวจสอบความสัมพันธ์ระหว่างมือและสะโพก (บนล่างสัมพันธ์กัน)
 */
checkCoordination(wrist, hipCenterProp) {
    if (!wrist || !hipCenterProp) return null;
    if (this.wristHistory.length < 3) return null;

    // 1. คำนวณ Hand Velocity X
    const p3 = this.wristHistory[this.wristHistory.length - 1];
    const p1 = this.wristHistory[this.wristHistory.length - 3];
    const dt = (p3.t - p1.t) / 1000;
    if (dt <= 0) return null;
    const handVelX = (p3.x - p1.x) / dt;

    // 2. คำนวณ Hip Velocity X
    // (ใช้ lastWaistLandmarks จาก Waist Rule)
    if (!this.lastWaistLandmarks) return null;
    const curHipCenter = hipCenterProp;
    const lastHipCenter = (this.lastWaistLandmarks[23].x + this.lastWaistLandmarks[24].x) / 2;
    const hipVelX = (curHipCenter - lastHipCenter) / dt;

    // 3. กรอง Noise (Deadzone check)
    const threshold = this.CONFIG.COORDINATION_VELOCITY_THRESHOLD || 0.02;
    if (Math.abs(handVelX) < threshold || Math.abs(hipVelX) < threshold) {
        return null;
    }

    // 4. เช็คทิศทาง (Direction Check)
    // ถ้าเครื่องหมายต่างกัน = สวนทาง (Conflict)
    if (Math.sign(handVelX) * Math.sign(hipVelX) < 0) {
        return this.getMessage("coordinationFail");
    }

    return null;
}
```

---

## ง.3 CalibrationManager - Body Measurement

**ไฟล์:** `js/core/calibration_manager.js` (~15KB)

```javascript
/**
 * Calibration Manager
 * 
 * ปรับเทียบสัดส่วนร่างกายด้วยท่า T-Pose
 * เก็บ 90 frames (3 วินาที) แล้วคำนวณค่าเฉลี่ย
 */
class CalibrationManager {
    constructor() {
        this.REQUIRED_STABLE_FRAMES = 90; // 3 วินาที @ 30fps
        this.framesCollected = [];
    }
    
    /**
     * คำนวณสัดส่วนร่างกายจาก landmarks
     */
    calculateMetrics(landmarks) {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        
        return {
            shoulderWidth: this.distance(leftShoulder, rightShoulder),
            torsoHeight: this.distance(
                this.midpoint(leftShoulder, rightShoulder),
                this.midpoint(leftHip, rightHip)
            ),
            armLength: Math.max(
                this.distance(leftShoulder, leftWrist),
                this.distance(rightShoulder, rightWrist)
            )
        };
    }
}
```

---

## ง.4 ScoringManager - Score Calculation

**ไฟล์:** `js/core/scoring_manager.js` (~11KB)

```javascript
/**
 * Scoring Manager
 * 
 * คำนวณคะแนนจาก Feedback ที่ได้ตลอดการฝึก
 */
class ScoringManager {
    constructor() {
        this.totalFrames = 0;
        this.correctFrames = 0;
        this.ruleViolations = {};
    }
    
    /**
     * บันทึกผลแต่ละ frame
     */
    recordFrame(feedbacks) {
        this.totalFrames++;
        if (feedbacks.length === 0) {
            this.correctFrames++;
        } else {
            // นับ violations ตามกฎ
            feedbacks.forEach(f => {
                this.ruleViolations[f.rule] = 
                    (this.ruleViolations[f.rule] || 0) + 1;
            });
        }
    }
    
    /**
     * คำนวณคะแนนและเกรด
     */
    getSummary() {
        const score = (this.correctFrames / this.totalFrames) * 100;
        return {
            overallScore: score.toFixed(1),
            grade: this.getGrade(score),
            topErrors: this.getTopErrors()
        };
    }
    
    /**
     * ตัดเกรด A-F
     */
    getGrade(score) {
        if (score >= 85) return 'A';
        if (score >= 70) return 'B';
        if (score >= 55) return 'C';
        if (score >= 40) return 'D';
        return 'F';
    }
}
```

---

## ง.5 DrawingManager - Canvas Rendering

**ไฟล์:** `js/display/drawing_manager.js` (~25KB)

```javascript
/**
 * Drawing Manager
 * 
 * วาดกราฟิกบน Canvas: Skeleton, Path, Trail, Ghost
 */
class DrawingManager {
    /**
     * วาด Skeleton connections
     */
    drawConnections(landmarks, ctx) {
        const connections = [
            [11, 12], // shoulders
            [11, 13], [13, 15], // left arm
            [12, 14], [14, 16], // right arm
            [11, 23], [12, 24], // torso
            [23, 24], // hips
            // ... more connections
        ];
        
        connections.forEach(([start, end]) => {
            const p1 = landmarks[start];
            const p2 = landmarks[end];
            
            ctx.beginPath();
            ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
            ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 3;
            ctx.stroke();
        });
    }
    
    /**
     * วาด Trail ของข้อมือ
     */
    drawTrail(history, ctx) {
        if (history.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(history[0].x, history[0].y);
        
        for (let i = 1; i < history.length; i++) {
            ctx.lineTo(history[i].x, history[i].y);
        }
        
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
```

---

## ง.6 Unit Test Example

**ไฟล์:** `tests/unit/heuristics_engine.test.js`

```javascript
describe("Rule 3: Elbow Sinking", () => {
    function checkElbowSinking(shoulder, elbow, tolerance = 0.01) {
        if (elbow.y < shoulder.y - tolerance) {
            return "กดศอกลง อย่าให้ศอกลอย";
        }
        return null;
    }

    test("PASS: elbow below shoulder", () => {
        const shoulder = { x: 0.5, y: 0.3 };
        const elbow = { x: 0.6, y: 0.4 }; // y สูงกว่า = ต่ำกว่า
        expect(checkElbowSinking(shoulder, elbow)).toBeNull();
    });

    test("FAIL: elbow above shoulder", () => {
        const shoulder = { x: 0.5, y: 0.4 };
        const elbow = { x: 0.6, y: 0.2 }; // y ต่ำกว่า = สูงกว่า
        expect(checkElbowSinking(shoulder, elbow)).toBe(
            "กดศอกลง อย่าให้ศอกลอย"
        );
    });
});
```

---

> **หมายเหตุ:** Source Code ฉบับเต็มจัดเก็บอยู่ที่ `/js/` (แบ่งหมวดหมู่ core, ui, display, controllers)

---

*Document updated: 2026-01-21 (v0.9.12 Rule 9 & Refactoring)*
