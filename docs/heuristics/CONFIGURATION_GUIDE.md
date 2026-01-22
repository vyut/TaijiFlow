# TaijiFlow AI - Configuration Guide

คู่มือการปรับแต่ง Thresholds ของ Heuristics Engine

---

## ⚙️ CONFIG Object

ทุก threshold ถูกรวมไว้ใน `this.CONFIG` ในไฟล์ `js/heuristics_engine.js`:

```javascript
this.CONFIG = {
  // === Path Shape (v0.9.10 Slice-Based) ===
  SHAPE_CONSISTENCY_THRESHOLD: 0.6,   // 60% = circular
  SHAPE_ANALYSIS_POINTS: 10,          // slice-based (was 30 frames)

  // === Arm Rotation ===
  ARM_MOTION_THRESHOLD: 0.015,        // min deltaY to trigger check
  ARM_ROTATION_NEUTRAL_ZONE: 0.05,    // 🆕 5% tolerance for transitions

  // === Elbow Sinking ===
  ELBOW_TOLERANCE_DEFAULT: 0.01,      // normalized units
  ELBOW_TOLERANCE_CALIBRATION_RATIO: 0.05, // 5% of torsoHeight

  // === Waist Initiation (v0.9.11 tuned) ===
  MIN_HIP_VELOCITY_DEG_SEC: 1.0,      // 🔄 degrees/second (was 2.0)
  SHOULDER_HIP_RATIO: 2.0,            // 🔄 if shoulder > hip * 2 → error (was 3.0)

  // === Vertical Stability (v0.9.11 time-based) ===
  STABILITY_WINDOW_MS: 5000,          // 🔄 5 seconds (was 2000, frames)
  STABILITY_MIN_POINTS: 3,            // 🆕 min points in window
  STABILITY_THRESHOLD_DEFAULT: 0.05,  // normalized units
  STABILITY_THRESHOLD_CALIBRATION_RATIO: 0.1, // 10% of torsoHeight

  // === Smoothness (v0.9.11 tuned) ===
  SMOOTHNESS_THRESHOLD_DEFAULT: 0.1,  // 🔄 normalized units/sec² (was 0.05)
  SMOOTHNESS_CALIBRATION_RATIO: 0.5,  // 🔄 50% of armLength → ~0.09 (was 0.08)

  // === Continuity (Time-Based v0.9.9) ===
  PAUSE_WINDOW_MS: 2000,              // 2 seconds window
  PAUSE_AVG_VELOCITY_THRESHOLD: 0.003, // avg velocity threshold

  // === Weight Shift (v0.9.11 tuned) ===
  WEIGHT_BUFFER_RATIO: 0.3,           // 🔄 30% of stanceWidth (was 0.1)

  // === Coordination (Rule 9) ===
  COORDINATION_VELOCITY_THRESHOLD: 0.02, // Min velocity to check direction

  // === Feedback Display ===
  FEEDBACK_HOLD_TIME_MS: 1000,        // 🔄 1 second (was 1.5)

  // === History Lengths ===
  WRIST_HISTORY_LENGTH: 60,           // 🔄 60 frames (was 10)
};
```

---

## 📏 Unit Explanations

| Unit | Meaning | Example |
|------|---------|---------|
| **normalized** | 0-1 relative to screen size | 0.08 = 8% of screen |
| **degrees/second** | Angular velocity | 2.0 deg/sec |
| **frames** | Number of video frames | 30 frames ≈ 1 sec |
| **ms** | Milliseconds | 1500ms = 1.5 sec |

---

## 🔧 How to Adjust

### 1. ทำให้ตรวจจับง่ายขึ้น (Easier)
```javascript
// เพิ่ม threshold → ยอมรับความผิดพลาดมากขึ้น
PATH_THRESHOLD_DEFAULT: 0.12,  // 0.08 → 0.12
PAUSE_WINDOW_MS: 3000,         // 2000 → 3000 (ยอมหยุดนานขึ้น)
```

### 2. ทำให้ตรวจจับยากขึ้น (Stricter)
```javascript
// ลด threshold → ตรวจจับเข้มงวดขึ้น
PATH_THRESHOLD_DEFAULT: 0.05,  // 0.08 → 0.05
SMOOTHNESS_THRESHOLD_DEFAULT: 0.01, // 0.02 → 0.01
```

### 3. ปรับเวลาแสดง Feedback
```javascript
FEEDBACK_HOLD_TIME_MS: 2000,  // แสดงค้าง 2 วินาที (default: 1.5)
```

---

## 🎛️ Debug Mode

กด **`D`** ระหว่างฝึกเพื่อดูค่า real-time:

| Value | Meaning |
|-------|---------|
| `pathDistance` | ระยะห่างจาก reference path |
| `pathThreshold` | threshold ที่ใช้ตัดสิน |
| `wristVelocity` | ความเร็วข้อมือ (units/sec) |
| `acceleration` | ความเร่ง (units/sec²) |

ใช้ค่าเหล่านี้ในการปรับ threshold ให้เหมาะสม

---

## ⚠️ Tips

1. **อย่าลด threshold ต่ำเกินไป** → จะเกิด false positive
2. **อย่าเพิ่ม threshold สูงเกินไป** → จะไม่ตรวจจับความผิดพลาด
3. **ทดสอบหลายคน** → แต่ละคนมีสรีระต่างกัน
4. **ใช้ Calibration** → ค่าที่ calibrated จะแม่นยำกว่า default
