# TaijiFlow AI - Heuristics Engine v3.0 Documentation

## 📋 Summary of Changes

### Refactoring Complete (v3.0)

| Change | Status | Impact |
|--------|--------|--------|
| **Fix Double Transform** | ✅ | Skeleton/path now display correctly |
| **Add Timestamps** | ✅ | Time-normalized velocity/acceleration |
| **Create CONFIG** | ✅ | All thresholds documented with units |
| **Debug Overlay** | ✅ | Press `D` to toggle |

---

## 🔧 1. Double Transform Fix

### Problem
Canvas transforms were applied 3 times:
```
script.js      → scale(-1,1) × 2
drawing_manager → scale(-1,1) × 1 (per method)
= Triple mirroring (incorrect)
```

### Solution

#### [script.js](file:///Users/yut/TaijiFlow/js/script.js#L601-L620)
```javascript
canvasCtx.save();
canvasCtx.scale(-1, 1);
canvasCtx.translate(-canvasElement.width, 0);
canvasCtx.drawImage(results.image, ...);
canvasCtx.restore(); // Back to identity
// DrawingManager handles its own mirror
```

#### [drawing_manager.js](file:///Users/yut/TaijiFlow/js/drawing_manager.js#L10-L25)
```javascript
constructor() {
  this.mirrorDisplay = true; // Configurable
}

drawSkeleton(landmarks) {
  this.ctx.save();
  if (this.mirrorDisplay) {
    this.ctx.scale(-1, 1);
    this.ctx.translate(-this.canvasWidth, 0);
  }
  // ... draw ...
  this.ctx.restore();
}
```

---

## ⏱️ 2. Timestamp Support

### [heuristics_engine.js](file:///Users/yut/TaijiFlow/js/heuristics_engine.js#L430-L478)

**Before:** `wristHistory = [{x, y}, ...]`
**After:** `wristHistory = [{x, y, t}, ...]` where `t` = timestamp (ms)

### Time-Normalized Velocity
```javascript
const dt = (p3.t - p2.t) / 1000; // seconds
const velocity = this.calculateDistance(p2, p3) / dt; // units/sec
```

---

## ⚙️ 3. CONFIG Object

All thresholds centralized in [this.CONFIG](file:///Users/yut/TaijiFlow/js/heuristics_engine.js#L12-L52):

```javascript
this.CONFIG = {
  // Path Accuracy
  PATH_THRESHOLD_DEFAULT: 0.08,       // 8% of screen
  PATH_THRESHOLD_MIN: 0.02,
  PATH_THRESHOLD_MAX: 0.25,

  // Arm Rotation
  ARM_MOTION_THRESHOLD: 0.005,        // min deltaY

  // Waist Initiation
  MIN_HIP_VELOCITY_DEG_SEC: 2.0,      // degrees/second
  SHOULDER_HIP_RATIO: 3.0,            // shoulder 3x faster = error

  // Vertical Stability
  STABILITY_HISTORY_LENGTH: 30,       // frames (~1 sec)
  STABILITY_THRESHOLD_DEFAULT: 0.05,

  // Smoothness
  SMOOTHNESS_THRESHOLD_DEFAULT: 0.02, // normalized units
  SMOOTHNESS_CALIBRATION_RATIO: 0.05, // 5% of armLength

  // Continuity
  MOTION_THRESHOLD: 0.001,
  PAUSE_FRAME_THRESHOLD: 15,          // ~0.5 sec

  // Feedback
  FEEDBACK_HOLD_TIME_MS: 1500,
};
```

---

## 🐛 4. Debug Overlay

**Toggle:** Press `D` key during training

**Displays:**
- `pathDistance` / `pathThreshold`
- `wristVelocity` / `acceleration`

![debug overlay example](Shows real-time values in cyan box on top-right)

---

## 📖 Heuristics Rules Manual

### Rule 1: Path Accuracy
**Purpose:** ตรวจสอบว่าข้อมือผู้ใช้อยู่ใกล้เส้นทางต้นแบบหรือไม่

```javascript
checkPathAccuracy(userWrist, referencePath) {
  // หาระยะที่ใกล้ที่สุดไปยังทุกจุดใน reference
  let minDistance = Infinity;
  for (const refPoint of referencePath) {
    const d = this.calculateDistance(userWrist, refPoint);
    if (d < minDistance) minDistance = d;
  }
  
  // Dynamic threshold (40% of shoulderWidth)
  // Capped between 0.02 - 0.25
  return minDistance > threshold 
    ? "⚠️ เส้นทางไม่แม่นยำ" : null;
}
```

---

### Rule 2: Arm Rotation
**Purpose:** ตรวจสอบการหงาย/คว่ำฝ่ามือตามทิศทางการเคลื่อนที่

| Movement | rh_cw / lh_ccw | rh_ccw / lh_cw |
|----------|----------------|----------------|
| **ขึ้น** | หงาย (palm up) | คว่ำ |
| **ลง** | คว่ำ | หงาย |

```javascript
// ตรวจจาก thumb.x vs pinky.x
const isRightHand = moveType.startsWith("rh");
const isSupinated = isRightHand 
  ? thumb.x > pinky.x  // นิ้วโป้งขวา = หงาย
  : thumb.x < pinky.x; // นิ้วโป้งซ้าย = หงาย
```

---

### Rule 3: Elbow Sinking
**Purpose:** ศอกต้องอยู่ต่ำกว่าไหล่เสมอ

```javascript
// Image coords: Y เพิ่มลงล่าง
// elbow.y > shoulder.y → ศอกอยู่ต่ำกว่า (ถูก)
// elbow.y < shoulder.y - tolerance → ศอกลอย (ผิด)
```

---

### Rule 4: Waist Initiation
**Purpose:** เอวต้องเริ่มหมุนก่อนไหล่

```javascript
// ถ้า shoulderVel > hipVel × 3 → ไหล่นำ (ผิด)
if (hipVel > MIN_HIP_VELOCITY && 
    shoulderVel > hipVel * SHOULDER_HIP_RATIO) {
  return "⚠️ ใช้เอวนำ";
}
```

---

### Rule 5: Vertical Stability
**Purpose:** ศีรษะต้องนิ่ง ไม่ขยับขึ้นลง

```javascript
// เก็บ nose.y 30 frames (~1 วินาที)
// ถ้า max-min > threshold → ศีรษะไม่นิ่ง
const displacement = max - min;
if (displacement > threshold) return "⚠️ ศีรษะไม่นิ่ง";
```

---

### Rule 6: Smoothness
**Purpose:** การเคลื่อนไหวต้องลื่นไหล ไม่สะดุด

```javascript
// คำนวณ acceleration จาก velocity
const v1 = dist(p1, p2) / dt1;
const v2 = dist(p2, p3) / dt2;
const accel = Math.abs(v2 - v1);
if (accel > threshold) return "⚠️ การเคลื่อนไหวสะดุด";
```

---

### Rule 7: Continuity
**Purpose:** ไม่หยุดนิ่งระหว่างฝึก

```javascript
// ถ้า velocity < 0.001 เกิน 15 frames (~0.5 วินาที)
if (this.pauseCounter > PAUSE_FRAME_THRESHOLD) {
  return "⚠️ อย่าหยุดนิ่ง";
}
```

---

### Rule 8: Weight Shift
**Purpose:** จุดศูนย์ถ่วงต้องอยู่ในฐานการยืน

```javascript
const hipCenter = (leftHip.x + rightHip.x) / 2;
const leftEdge = leftAnkle.x - buffer;
const rightEdge = rightAnkle.x + buffer;
// ถ้า hipCenter อยู่นอก leftEdge-rightEdge → น้ำหนักเอียง
```

---

## 🎮 Keyboard Shortcuts

| Key | Function |
|-----|----------|
| `F` | Toggle Fullscreen |
| `D` | Toggle Debug Overlay |
| `Esc` | Cancel Calibration |

---

## 📁 Files Modified

| File | Changes |
|------|---------|
| `js/script.js` | Fixed transform, added D key, debug overlay call |
| `js/drawing_manager.js` | Added mirrorDisplay flag, drawDebugOverlay() |
| `js/heuristics_engine.js` | v3.0: CONFIG object, timestamps, debugMode |
