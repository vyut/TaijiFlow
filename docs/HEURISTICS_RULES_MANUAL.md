# TaijiFlow AI - Heuristics Engine User Manual v3.0

คู่มือฉบับสมบูรณ์: อธิบายกฎการตรวจสอบท่าทาง 8 ข้อ พร้อมโค้ดและแผนภาพ

---

## 📖 สารบัญ

1. [Path Accuracy](#rule-1-path-accuracy)
2. [Arm Rotation](#rule-2-arm-rotation)
3. [Elbow Sinking](#rule-3-elbow-sinking)
4. [Waist Initiation](#rule-4-waist-initiation)
5. [Vertical Stability](#rule-5-vertical-stability)
6. [Smoothness](#rule-6-smoothness)
7. [Continuity](#rule-7-continuity)
8. [Weight Shift](#rule-8-weight-shift)

---

## Rule 1: Path Accuracy (Shape-Based)

### 🎯 วัตถุประสงค์
ตรวจสอบว่า**เส้นทางที่ผู้ใช้วาดเป็นวงโค้ง**และ**หมุนถูกทิศทาง**หรือไม่

### 📝 Implementation Notes (v3.1)

> **เปลี่ยนจาก Position-Based เป็น Shape-Based**
> 
> เดิม: วัดระยะห่างระหว่างข้อมือกับ Ghost/Reference Path
> 
> ใหม่: วิเคราะห์ว่าเส้นทางที่วาดเป็นวงกลมหรือไม่ + ตรวจทิศทางหมุน
> 
> **เหตุผล:** สอดคล้องกับหลักท่าม้วนไหมที่อนุญาตให้ขนาดวงกลมและความเร็วต่างกันได้

### 🔄 Algorithm ทีละขั้นตอน

```
┌─────────────────────────────────────────────────────────────┐
│  checkPathShape(currentExercise)                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 1: ตรวจสอบข้อมูลเบื้องต้น                               │
│ - ต้องมี wristHistory อย่างน้อย 30 frames (~1 วินาที)        │
│ → ถ้าไม่พอ: return null (รอเก็บข้อมูลเพิ่ม)                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 2: คำนวณ Direction Consistency                        │
│                                                             │
│   สำหรับทุก 3 จุดติดกัน (p1, p2, p3):                        │
│     cross = (p2-p1) × (p3-p2)  (Cross Product)             │
│                                                             │
│     ถ้า cross > 0.0001 → clockwiseTurns++                   │
│     ถ้า cross < -0.0001 → counterClockwiseTurns++           │
│                                                             │
│   consistency = max(CW, CCW) / (CW + CCW)                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 3: ตรวจว่าเป็นวงโค้งหรือไม่                             │
│                                                             │
│   ถ้า consistency < 0.6 (60%)                               │
│     → "⚠️ เคลื่อนไหวมือให้เป็นวงโค้ง"                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 4: ตรวจทิศทางหมุน (CW vs CCW)                         │
│                                                             │
│   expectedCW = ท่าที่เลือกมี "cw" หรือไม่                      │
│   actualCW = counterClockwiseTurns > clockwiseTurns         │
│   (สลับเพราะวิดีโอ Mirror)                                    │
│                                                             │
│   ถ้า expectedCW ≠ actualCW → "⚠️ หมุนมือผิดทิศทาง"          │
│   ถ้าถูกต้อง → null                                         │
└─────────────────────────────────────────────────────────────┘
```

### 📊 แผนภาพ Cross Product

```
   Cross Product ใช้ตรวจทิศทางการหมุน
   
   p1 ──→ p2 ──→ p3
   
   Cross = (p2.x - p1.x) × (p3.y - p2.y) 
         - (p2.y - p1.y) × (p3.x - p2.x)
   
   ใน Screen Coordinates (Y กลับหัว):
   Cross > 0 = หมุนตามเข็ม (CW)
   Cross < 0 = หมุนทวนเข็ม (CCW)
```

### 💻 โค้ด

```javascript
checkPathShape(currentExercise = "rh_cw") {
  const minFrames = this.CONFIG.SHAPE_ANALYSIS_FRAMES;  // 30
  const threshold = this.CONFIG.SHAPE_CONSISTENCY_THRESHOLD;  // 0.6

  if (this.wristHistory.length < minFrames) return null;

  const recentHistory = this.wristHistory.slice(-minFrames);
  let clockwiseTurns = 0, counterClockwiseTurns = 0;

  for (let i = 2; i < recentHistory.length; i++) {
    const p1 = recentHistory[i - 2];
    const p2 = recentHistory[i - 1];
    const p3 = recentHistory[i];
    const cross = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);

    if (cross > 0.0001) clockwiseTurns++;
    else if (cross < -0.0001) counterClockwiseTurns++;
  }

  const total = clockwiseTurns + counterClockwiseTurns;
  if (total === 0) return null;

  const consistency = Math.max(clockwiseTurns, counterClockwiseTurns) / total;

  // ตรวจว่าเป็นวงโค้ง
  if (consistency < threshold) {
    return "⚠️ เคลื่อนไหวมือให้เป็นวงโค้ง (Move your hand in a circle)";
  }

  // ตรวจทิศทาง (สลับเพราะ video mirror)
  const expectedCW = currentExercise.includes("cw");
  const actualCW = counterClockwiseTurns > clockwiseTurns;
  if (expectedCW !== actualCW) {
    return "⚠️ หมุนมือผิดทิศทาง (Wrong direction)";
  }

  return null;
}
```

### 📐 CONFIG

| Parameter | ค่า | คำอธิบาย |
|-----------|-----|----------|
| `SHAPE_CONSISTENCY_THRESHOLD` | 0.6 | 60% ขึ้นไป = เป็นวงโค้ง |
| `SHAPE_ANALYSIS_FRAMES` | 30 | วิเคราะห์ 30 frames (~1 วินาที) |

### ✅ ข้อดีของ Shape-Based

| เดิม (Position-Based) | ใหม่ (Shape-Based) |
|-----------------------|-------------------|
| ❌ ต้องยืนตรงกับ Ghost | ✅ ยืนตรงไหนก็ได้ |
| ❌ ต้องทำวงเท่า Ghost | ✅ วงเล็ก/ใหญ่ก็ได้ |
| ❌ ต้องเร็วเท่า Ghost | ✅ ช้า/เร็วก็ได้ |

---

## Rule 2: Arm Rotation

### 🎯 วัตถุประสงค์
ตรวจสอบว่าผู้ใช้**หมุนฝ่ามือ (หงาย/คว่ำ)** ถูกต้องตามทิศทางการเคลื่อนที่

### 🔄 Algorithm ทีละขั้นตอน

```
┌─────────────────────────────────────────────────────────────┐
│  checkArmRotation(thumb, pinky, moveType)                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 1: ตรวจสอบข้อมูลเบื้องต้น                               │
│ - มี thumb, pinky landmarks หรือไม่?                        │
│ - มี wristHistory อย่างน้อย 2 frames?                        │
│ → ถ้าไม่ครบ: return null                                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 2: หาทิศทางการเคลื่อนที่ของข้อมือ (ขึ้น/ลง)             │
│                                                             │
│   deltaY = ข้อมือปัจจุบัน.y - ข้อมือก่อนหน้า.y                  │
│                                                             │
│   ถ้า |deltaY| < 0.005 → ไม่ตรวจ (เคลื่อนที่น้อยเกินไป)         │
│   ถ้า deltaY < 0 → กำลังเคลื่อนที่ขึ้น (Moving Up)             │
│   ถ้า deltaY > 0 → กำลังเคลื่อนที่ลง (Moving Down)            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 3: ตรวจสอบสถานะฝ่ามือจริง (Actual State)               │
│                                                             │
│   มือขวา (rh_*):                                            │
│     thumb.x > pinky.x → หงาย (Supinated) ✋                  │
│     thumb.x < pinky.x → คว่ำ (Pronated) 🤚                  │
│                                                             │
│   มือซ้าย (lh_*):                                            │
│     thumb.x < pinky.x → หงาย (Supinated) ✋                  │
│     thumb.x > pinky.x → คว่ำ (Pronated) 🤚                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 4: กำหนดสถานะที่ควรจะเป็น (Expected State)             │
│                                                             │
│   เมื่อเคลื่อนที่ขึ้น (Moving Up):                             │
│     rh_cw, lh_ccw → ควรหงาย (Supinated)                     │
│     rh_ccw, lh_cw → ควรคว่ำ (Pronated)                      │
│                                                             │
│   เมื่อเคลื่อนที่ลง (Moving Down):                            │
│     rh_ccw, lh_cw → ควรหงาย (Supinated)                     │
│     rh_cw, lh_ccw → ควรคว่ำ (Pronated)                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 5: เปรียบเทียบและส่ง Feedback                          │
│                                                             │
│   ถ้า Expected ≠ Actual                                     │
│     → "⚠️ หมุนแขนไม่ถูกต้อง"                                  │
│   ถ้า Expected = Actual                                     │
│     → null (ถูกต้อง)                                        │
└─────────────────────────────────────────────────────────────┘
```

### 📊 แผนภาพ

```
   ┌─────────────────────────────────────────────────────────┐
   │              ตรวจสอบตำแหน่งนิ้วโป้ง vs นิ้วก้อย            │
   └─────────────────────────────────────────────────────────┘
   
   มือขวา (Right Hand):
   
   หงาย (Supinated)           คว่ำ (Pronated)
   thumb.x > pinky.x          thumb.x < pinky.x
   
       👍───────🤙                🤙───────👍
       ↑        ↑                 ↑        ↑
     Thumb   Pinky              Pinky   Thumb
     (ขวา)   (ซ้าย)              (ขวา)   (ซ้าย)
   
   ─────────────────────────────────────────────────
   
   มือซ้าย (Left Hand): ตรงข้ามกัน
   
   หงาย = thumb.x < pinky.x
   คว่ำ = thumb.x > pinky.x
```

### 🔄 ตาราง Logic

```
   ┌──────────┬────────────┬──────────────┐
   │   ท่า    │ เคลื่อนที่  │ ฝ่ามือควร   │
   ├──────────┼────────────┼──────────────┤
   │ rh_cw    │    ขึ้น     │    หงาย     │
   │ rh_cw    │    ลง      │    คว่ำ     │
   │ rh_ccw   │    ขึ้น     │    คว่ำ     │
   │ rh_ccw   │    ลง      │    หงาย     │
   ├──────────┼────────────┼──────────────┤
   │ lh_cw    │    ขึ้น     │    คว่ำ     │
   │ lh_cw    │    ลง      │    หงาย     │
   │ lh_ccw   │    ขึ้น     │    หงาย     │
   │ lh_ccw   │    ลง      │    คว่ำ     │
   └──────────┴────────────┴──────────────┘
```

### 💻 โค้ด

```javascript
checkArmRotation(thumb, pinky, moveType) {
  // 1. ตรวจสอบข้อมูลเบื้องต้น
  if (!thumb || !pinky || this.wristHistory.length < 2) return null;

  // 2. หาทิศทางการเคลื่อนที่ (ขึ้น/ลง)
  const p_current = this.wristHistory[this.wristHistory.length - 1];
  const p_previous = this.wristHistory[this.wristHistory.length - 2];
  const deltaY = p_current.y - p_previous.y;
  
  if (Math.abs(deltaY) < 0.005) return null; // เคลื่อนที่น้อยเกินไป
  
  const isMovingUp = deltaY < 0;
  const isMovingDown = deltaY > 0;

  // 3. ตรวจสอบสถานะฝ่ามือจริง
  const isRightHand = moveType.startsWith("rh");
  const isActuallySupinated = isRightHand
    ? thumb.x > pinky.x  // มือขวา: นิ้วโป้งอยู่ขวา = หงาย
    : thumb.x < pinky.x; // มือซ้าย: นิ้วโป้งอยู่ซ้าย = หงาย

  // 4. กำหนดสถานะที่ควรจะเป็น
  let isSupinationExpected = false;
  if (isMovingUp) {
    isSupinationExpected = moveType === "rh_cw" || moveType === "lh_ccw";
  } else if (isMovingDown) {
    isSupinationExpected = moveType === "rh_ccw" || moveType === "lh_cw";
  }

  // 5. เปรียบเทียบ
  return isSupinationExpected !== isActuallySupinated
    ? "⚠️ หมุนแขนไม่ถูกต้อง"
    : null;
}
```

---

## Rule 3: Elbow Sinking

### 🎯 วัตถุประสงค์
ตรวจสอบว่า**ศอกอยู่ต่ำกว่าไหล่**เสมอ ตามหลัก "จมศอก" (沉肩坠肘)

### 🔄 Algorithm ทีละขั้นตอน

```
┌─────────────────────────────────────────────────────────────┐
│  checkElbowSinking(shoulder, elbow, wrist)                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 1: คำนวณ Tolerance                                    │
│                                                             │
│   ถ้ามี calibrationData:                                    │
│     tolerance = torsoHeight × 0.05 (5%)                    │
│   ถ้าไม่มี:                                                  │
│     tolerance = 0.01 (default)                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 2: เปรียบเทียบตำแหน่ง Y                                │
│                                                             │
│   ในพิกัดภาพ: Y เพิ่มลงล่าง                                   │
│   ศอกควรอยู่ต่ำกว่าไหล่ = elbow.y > shoulder.y               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 3: ส่ง Feedback                                       │
│                                                             │
│   ถ้า elbow.y < shoulder.y - tolerance                      │
│     → "⚠️ ศอกลอย (Elbow Floating)"                          │
│   ถ้าไม่เข้าเงื่อนไข                                          │
│     → null (ถูกต้อง)                                        │
└─────────────────────────────────────────────────────────────┘
```

### 📊 แผนภาพ

```
   ถูกต้อง ✅                    ผิด ❌
   
       ●  Shoulder                  ●  Shoulder
       │                            │
       │ elbow.y > shoulder.y       │ elbow.y < shoulder.y
       │ (ศอกอยู่ต่ำกว่า)             │ (ศอกลอยขึ้น!)
       ▼                            ▲
       ●  Elbow                     ●  Elbow
       │                            │
       │                            │
       ▼                            ▼
       ●  Wrist                     ●  Wrist
       
   * หมายเหตุ: ในพิกัดภาพ Y เพิ่มลงล่าง
   * ดังนั้น elbow.y > shoulder.y = ศอกอยู่ต่ำกว่า (ถูกต้อง)
```

### 💻 โค้ด

```javascript
checkElbowSinking(shoulder, elbow, wrist) {
  // Tolerance 5% ของความสูงลำตัว
  const tolerance = this.calibrationData
    ? this.calibrationData.torsoHeight * 0.05
    : 0.01;

  // ศอกต้องอยู่ต่ำกว่าไหล่ (elbow.y > shoulder.y ในพิกัดภาพ)
  if (elbow.y < shoulder.y - tolerance) {
    return "⚠️ ศอกลอย (Elbow Floating)";
  }
  return null;
}
```

### 📐 หลักการ

> **"จมไหล่ตกศอก"** (沉肩坠肘) - ไหล่และศอกต้องผ่อนลง
> ช่วยให้พลังไหลลงดิน ไม่ติดค้างที่ไหล่

---

## Rule 4: Waist Initiation

### 🎯 วัตถุประสงค์
ตรวจสอบว่า**การเคลื่อนไหวเริ่มจากเอว** ไม่ใช่จากไหล่

### 🔄 Algorithm ทีละขั้นตอน

```
┌─────────────────────────────────────────────────────────────┐
│  checkWaistInitiation(lHip, rHip, lShoulder, rShoulder, dt) │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 1: คำนวณมุมของเอวและไหล่                               │
│                                                             │
│   hipAngle = atan2(rHip.y - lHip.y, rHip.x - lHip.x)       │
│   shoulderAngle = atan2(rShoulder.y - lShoulder.y, ...)    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 2: คำนวณความเร็วเชิงมุม (degrees/sec)                  │
│                                                             │
│   hipVel = |hipAngle - lastHipAngle| / deltaTime           │
│   shoulderVel = |shoulderAngle - lastShoulderAngle| / dt   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 3: ตรวจสอบว่าไหล่หมุนเร็วกว่าเอว                        │
│                                                             │
│   ถ้า hipVel > 2.0 (เอวกำลังหมุน) AND                        │
│      shoulderVel > hipVel × 3.0 (ไหล่เร็วกว่า 3 เท่า)         │
│     → "⚠️ ใช้เอวนำ (Start with Waist)"                       │
│   ถ้าไม่เข้าเงื่อนไข                                          │
│     → null (ถูกต้อง)                                        │
└─────────────────────────────────────────────────────────────┘
```

### 📊 แผนภาพ

```
   ถูกต้อง ✅ (เอวนำ)            ผิด ❌ (ไหล่นำ)
   
       ┌─────┐                     ┌─────┐
       │ ไหล่ │ ← หมุนช้า            │ ไหล่ │ ← หมุนเร็ว! 
       └──┬──┘                     └──┬──┘
          │                           │
       ┌──┴──┐                     ┌──┴──┐
       │ เอว │ ← หมุนก่อน/เร็ว       │ เอว │ ← หมุนช้า/ไม่หมุน
       └─────┘                     └─────┘
   
   hipVelocity > 2°/s             shoulderVelocity > hipVelocity × 3
   shoulderVelocity ≤ hipVelocity × 3
```

### 💻 โค้ด

```javascript
checkWaistInitiation(leftHip, rightHip, leftShoulder, rightShoulder, deltaTime) {
  // คำนวณมุมของเอวและไหล่
  const hipAngle = Math.atan2(rightHip.y - leftHip.y, rightHip.x - leftHip.x);
  const shoulderAngle = Math.atan2(
    rightShoulder.y - leftShoulder.y,
    rightShoulder.x - leftShoulder.x
  );

  // คำนวณความเร็วเชิงมุม (degrees/second)
  const hipVel = this.getAngularVelocity(this.lastHipAngle, hipAngle, deltaTime);
  const shoulderVel = this.getAngularVelocity(this.lastShoulderAngle, shoulderAngle, deltaTime);

  // อัปเดตค่า
  this.lastHipAngle = hipAngle;
  this.lastShoulderAngle = shoulderAngle;

  // ตรวจจับ: ถ้าไหล่หมุนเร็วกว่าเอว 3 เท่า = ไหล่นำ (ผิด)
  const MIN_HIP_VELOCITY = 2.0;    // degrees/second
  const RATIO_THRESHOLD = 3.0;

  if (hipVel > MIN_HIP_VELOCITY && shoulderVel > hipVel * RATIO_THRESHOLD) {
    return "⚠️ ใช้เอวนำ (Start with Waist)";
  }
  return null;
}
```

### 📐 หลักการ

> **"เอวเป็นจักรเพลา"** (腰为轴) - ทุกการเคลื่อนไหวต้องเริ่มจากเอว
> เอวหมุนนำ ไหล่ตาม แขนตาม มือตาม เป็นลำดับ

---

## Rule 5: Vertical Stability

### 🎯 วัตถุประสงค์
ตรวจสอบว่า**ศีรษะไม่ขยับขึ้นลง**มากเกินไป ตามหลัก "โปรงกระหม่อมเบา"

### 🔄 Algorithm ทีละขั้นตอน

```
┌─────────────────────────────────────────────────────────────┐
│  checkVerticalStability(nose)                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 1: เก็บประวัติตำแหน่ง Y ของจมูก                         │
│                                                             │
│   headYHistory.push(nose.y)                                 │
│   เก็บไว้ 30 frames (~1 วินาที ที่ 30fps)                     │
│   ถ้ายังไม่ครบ 30 frames → return null                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 2: หาค่า min/max และ displacement                    │
│                                                             │
│   min = Math.min(...headYHistory)                           │
│   max = Math.max(...headYHistory)                           │
│   displacement = max - min                                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 3: คำนวณ Dynamic Threshold                            │
│                                                             │
│   ถ้ามี calibrationData:                                    │
│     threshold = torsoHeight × 0.1 (10%)                    │
│   ถ้าไม่มี:                                                  │
│     threshold = 0.05 (default)                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 4: ส่ง Feedback                                       │
│                                                             │
│   ถ้า displacement > threshold                              │
│     → "⚠️ ศีรษะไม่นิ่ง (Head Unstable)"                      │
│   ถ้าไม่เข้าเงื่อนไข                                          │
│     → null (ถูกต้อง)                                        │
└─────────────────────────────────────────────────────────────┘
```

### 📊 แผนภาพ

```
   เก็บตำแหน่ง nose.y ย้อนหลัง 30 frames (~1 วินาที)
   
   nose.y
     │
   max ┼─────●─────────────────●─────
     │     ╱↖ displacement     ╲
     │────●────────●────────────●────
     │             ↓
   min ┼───────────●────────────────
     │
     └────────────────────────────── time
          ← 30 frames (~1 sec) →
          
   ถ้า displacement > threshold → "ศีรษะไม่นิ่ง"
```

### 💻 โค้ด

```javascript
checkVerticalStability(nose) {
  if (!nose) return null;
  
  // เก็บประวัติ nose.y
  this.headYHistory.push(nose.y);
  if (this.headYHistory.length > 30) this.headYHistory.shift();
  if (this.headYHistory.length < 30) return null;

  // หาค่า min/max
  const min = Math.min(...this.headYHistory);
  const max = Math.max(...this.headYHistory);
  const displacement = max - min;

  // Dynamic Threshold: 10% ของความสูงลำตัว
  let threshold = 0.05;
  if (this.calibrationData) {
    threshold = this.calibrationData.torsoHeight * 0.1;
  }

  return displacement > threshold
    ? "⚠️ ศีรษะไม่นิ่ง (Head Unstable)"
    : null;
}
```

### 📐 หลักการ

> **"โปรงกระหม่อมเบา"** (虚领顶劲) - ศีรษะต้องลอยเบาๆ เหมือนลอยน้ำ
> ไม่โยกขึ้นลงขณะถ่ายน้ำหนัก

---

## Rule 6: Smoothness

### 🎯 วัตถุประสงค์
ตรวจสอบว่า**การเคลื่อนไหวลื่นไหล**ไม่สะดุด ความเร็วสม่ำเสมอ

### 🔄 Algorithm ทีละขั้นตอน

```
┌─────────────────────────────────────────────────────────────┐
│  checkSmoothness(wrist, timestamp)                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 1: เก็บประวัติพร้อม timestamp                          │
│                                                             │
│   wristHistory.push({ x, y, t: timestamp })                 │
│   เก็บไว้ 10 frames                                         │
│   ถ้ายังไม่ครบ 3 frames → return null                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 2: คำนวณ Time-Normalized Velocity                     │
│                                                             │
│   dt1 = (p2.t - p1.t) / 1000   (seconds)                   │
│   dt2 = (p3.t - p2.t) / 1000                               │
│                                                             │
│   v1 = distance(p1, p2) / dt1  (units/sec)                 │
│   v2 = distance(p2, p3) / dt2                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 3: คำนวณ Acceleration                                 │
│                                                             │
│   acceleration = |v2 - v1|                                  │
│   (ค่าสูง = เปลี่ยนความเร็วกะทันหัน = สะดุด)                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 4: เปรียบเทียบกับ Dynamic Threshold                    │
│                                                             │
│   ถ้ามี calibrationData:                                    │
│     threshold = armLength × 0.05 (5%)                      │
│   ถ้าไม่มี:                                                  │
│     threshold = 0.02 (default)                              │
│                                                             │
│   ถ้า acceleration > threshold                              │
│     → "⚠️ การเคลื่อนไหวสะดุด (Not Smooth)"                   │
│   ถ้าไม่เข้าเงื่อนไข                                          │
│     → null (ถูกต้อง)                                        │
└─────────────────────────────────────────────────────────────┘
```

### 📊 แผนภาพ

```
   คำนวณ Time-Normalized Velocity และ Acceleration
   
   Position
     │     p3 (ปัจจุบัน)
     ●────────────────────●
     │                    │
     │    p2              │
     ●────────────────────│
     │                    │
     │ p1                 │
     ●────────────────────┘
     │
     └──────────────────── time
        dt1        dt2
        
   v1 = distance(p1, p2) / dt1   (units/sec)
   v2 = distance(p2, p3) / dt2   (units/sec)
   acceleration = |v2 - v1|
   
   ถ้า acceleration > threshold → "การเคลื่อนไหวสะดุด"
```

### 💻 โค้ด

```javascript
checkSmoothness(wrist, timestamp) {
  if (!wrist) return null;
  
  // เก็บ wrist พร้อม timestamp
  const currentTime = timestamp || Date.now();
  this.wristHistory.push({ x: wrist.x, y: wrist.y, t: currentTime });
  if (this.wristHistory.length > 10) this.wristHistory.shift();
  if (this.wristHistory.length < 3) return null;

  const p3 = this.wristHistory[this.wristHistory.length - 1];
  const p2 = this.wristHistory[this.wristHistory.length - 2];
  const p1 = this.wristHistory[this.wristHistory.length - 3];

  // Time-normalized velocity
  const dt2 = (p3.t - p2.t) / 1000; // seconds
  const dt1 = (p2.t - p1.t) / 1000;
  if (dt1 <= 0 || dt2 <= 0) return null;

  const v2 = this.calculateDistance(p2, p3) / dt2;
  const v1 = this.calculateDistance(p1, p2) / dt1;
  const acceleration = Math.abs(v2 - v1);

  // Threshold: 5% ของความยาวแขน
  let threshold = 0.02;
  if (this.calibrationData) {
    threshold = this.calibrationData.armLength * 0.05;
  }

  return acceleration > threshold
    ? "⚠️ การเคลื่อนไหวสะดุด (Not Smooth)"
    : null;
}
```

### 📐 หลักการ

> **"ต่อเนื่องไม่ขาดตอน"** - การเคลื่อนไหวต้องเหมือนดึงเส้นไหม
> ไม่เร็วไม่ช้า สม่ำเสมอ ไหมจึงไม่ขาด

---

## Rule 7: Continuity

### 🎯 วัตถุประสงค์
ตรวจสอบว่า**ไม่หยุดนิ่ง**ระหว่างการฝึก

### 🔄 Algorithm ทีละขั้นตอน

```
┌─────────────────────────────────────────────────────────────┐
│  checkContinuity()                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 1: คำนวณ Velocity ระหว่าง 2 frames ล่าสุด              │
│                                                             │
│   p1 = wristHistory[length - 2]                             │
│   p2 = wristHistory[length - 1]                             │
│   velocity = distance(p1, p2)                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 2: นับ frames ที่หยุดนิ่ง                               │
│                                                             │
│   ถ้า velocity < 0.001 (เกือบไม่ขยับ):                        │
│     pauseCounter++                                          │
│   ถ้าไม่ (ยังเคลื่อนที่อยู่):                                  │
│     pauseCounter = 0 (reset)                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 3: ส่ง Feedback ถ้าหยุดนานเกินไป                        │
│                                                             │
│   ถ้า pauseCounter > 15 (~0.5 วินาที ที่ 30fps)               │
│     → "⚠️ อย่าหยุดนิ่ง (Keep Moving)"                         │
│   ถ้าไม่เข้าเงื่อนไข                                          │
│     → null (ถูกต้อง)                                        │
└─────────────────────────────────────────────────────────────┘
```

### 📊 แผนภาพ

```
   Velocity
     │
     │  ●     ●
     │ ╱ ╲   ╱ ╲
     │╱   ╲ ╱   ╲     ●
   ──●─────●─────●─────●──────────────
     │               │← pauseCounter++
   0 ┼───────────────●────●────●────●─
     │               └─ velocity < 0.001 เกิน 15 frames
     └────────────────────────────── time
     
   ถ้า pauseCounter > 15 → "อย่าหยุดนิ่ง"
```

### 💻 โค้ด

```javascript
checkContinuity() {
  if (this.wristHistory.length < 2) return null;

  const p2 = this.wristHistory[this.wristHistory.length - 1];
  const p1 = this.wristHistory[this.wristHistory.length - 2];
  const velocity = this.calculateDistance(p1, p2);

  // นับจำนวน frames ที่หยุดนิ่ง
  if (velocity < 0.001) {
    this.pauseCounter++;
  } else {
    this.pauseCounter = 0;
  }

  // ถ้าหยุดนิ่งเกิน 15 frames (~0.5 วินาที)
  return this.pauseCounter > 15
    ? "⚠️ อย่าหยุดนิ่ง (Keep Moving)"
    : null;
}
```

### 📐 CONFIG

| Parameter | ค่า | คำอธิบาย |
|-----------|-----|----------|
| `MOTION_THRESHOLD` | 0.001 | ถ้าเคลื่อนที่น้อยกว่านี้ = หยุดนิ่ง |
| `PAUSE_FRAME_THRESHOLD` | 15 | ~0.5 วินาที ที่ 30fps |

---

## Rule 8: Weight Shift

### 🎯 วัตถุประสงค์
ตรวจสอบว่า**จุดศูนย์ถ่วงอยู่ในฐานการยืน** ไม่เอียงจนเสียสมดุล

### 🔄 Algorithm ทีละขั้นตอน

```
┌─────────────────────────────────────────────────────────────┐
│  checkWeightShift(leftHip, rightHip, leftAnkle, rightAnkle) │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 1: คำนวณจุดกึ่งกลางสะโพก (Center of Mass)              │
│                                                             │
│   hipCenter = (leftHip.x + rightHip.x) / 2                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 2: กำหนดขอบเขตฐานการยืน (Base of Support)            │
│                                                             │
│   stanceWidth = |leftAnkle.x - rightAnkle.x|               │
│   leftBoundary = min(leftAnkle.x, rightAnkle.x)            │
│   rightBoundary = max(leftAnkle.x, rightAnkle.x)           │
│   buffer = stanceWidth × 0.1 (10% กันชน)                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ขั้นที่ 3: ตรวจสอบว่าสะโพกอยู่ใน Safe Zone                     │
│                                                             │
│   Safe Zone = [leftBoundary + buffer, rightBoundary - buffer]│
│                                                             │
│   ถ้า hipCenter < leftBoundary + buffer (เอียงซ้าย)          │
│   OR hipCenter > rightBoundary - buffer (เอียงขวา)          │
│     → "⚠️ เสียสมดุล (Off Balance)"                           │
│   ถ้าไม่เข้าเงื่อนไข                                          │
│     → null (ถูกต้อง)                                        │
└─────────────────────────────────────────────────────────────┘
```

### 📊 แผนภาพ

```
   มองจากด้านบน (Top View)
   
   leftAnkle                     rightAnkle
       ●───────────────────────────●
       │← buffer →│ Safe Zone │← buffer →│
       │          │           │          │
       │    ❌    │     ✅    │    ❌     │
       │  Off     │  hipCenter│  Off     │
       │ Balance  │    ●      │ Balance  │
       │          │           │          │
       └──────────┴───────────┴──────────┘
       
   leftBoundary              rightBoundary
   + buffer                  - buffer
```

### 💻 โค้ด

```javascript
checkWeightShift(leftHip, rightHip, leftAnkle, rightAnkle) {
  if (!leftHip || !rightHip || !leftAnkle || !rightAnkle) return null;

  // คำนวณจุดกึ่งกลางสะโพก
  const hipCenter = (leftHip.x + rightHip.x) / 2;
  const stanceWidth = Math.abs(leftAnkle.x - rightAnkle.x);

  // กำหนดขอบเขตของฐานการยืน
  const leftBoundary = Math.min(leftAnkle.x, rightAnkle.x);
  const rightBoundary = Math.max(leftAnkle.x, rightAnkle.x);

  // เพิ่มระยะกันชน 10% ของความกว้างการยืน
  const buffer = stanceWidth * 0.1;

  // ตรวจสอบว่าสะโพกอยู่ในขอบเขตหรือไม่
  if (hipCenter < leftBoundary + buffer || 
      hipCenter > rightBoundary - buffer) {
    return "⚠️ เสียสมดุล (Off Balance)";
  }
  return null;
}
```

### 📐 หลักการ

> **"แยกเต็มว่าง"** (分虚实) - รู้จักถ่ายน้ำหนักซ้าย/ขวา
> แต่ต้องไม่เอียงจนเสียสมดุล จุดศูนย์ถ่วงต้องอยู่เหนือฐาน

---

## 🎚️ Priority Ranking

เมื่อตรวจพบหลายข้อผิดพลาด จะแสดง**เฉพาะข้อที่สำคัญที่สุด**:

```
   Priority 1 ─────────────────────────────> Priority 8
   
   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
   │  Path   │  │  Waist  │  │ Weight  │  │ Vertical│
   │Accuracy │→ │Initiation│→ │  Shift  │→ │Stability│
   │    1    │  │    2    │  │    3    │  │    4    │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
   │   Arm   │  │  Elbow  │  │Smoothness│ │Continuity│
   │Rotation │  │ Sinking │  │    7    │  │    8    │
   │    5    │  │    6    │  │         │  │         │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

---

## 🎮 Level Configuration

แต่ละระดับมีจำนวนกฎที่ตรวจสอบแตกต่างกัน เพื่อให้เหมาะกับความสามารถของผู้ฝึก:

### สรุประดับความยาก

| ระดับ | จำนวนกฎ | กลุ่มเป้าหมาย | ท่า |
|-------|:-------:|--------------|-----|
| **L1** | **3 กฎ** | ผู้เริ่มต้น/สูงอายุ | นั่ง |
| **L2** | **6 กฎ** | ระดับกลาง | ยืน |
| **L3** | **8 กฎ** | ระดับสูง | ยืนย่อ |

### ตารางละเอียด

```
   ┌────────────────┬─────┬─────┬─────┐
   │     Rule       │ L1  │ L2  │ L3  │
   │                │(นั่ง)│(ยืน) │(ย่อ) │
   ├────────────────┼─────┼─────┼─────┤
   │ Path Accuracy  │  ✅  │  ✅  │  ✅  │
   │ Arm Rotation   │  ❌  │  ✅  │  ✅  │
   │ Elbow Sinking  │  ✅  │  ✅  │  ✅  │
   │ Waist Initiation│ ❌  │  ✅  │  ✅  │
   │ Vertical Stab. │  ❌  │  ✅  │  ✅  │
   │ Smoothness     │  ❌  │  ❌  │  ✅  │
   │ Continuity     │  ✅  │  ✅  │  ✅  │
   │ Weight Shift   │  ❌  │  ❌  │  ✅  │
   └────────────────┴─────┴─────┴─────┘
   
   L1 (3 กฎ): Path, Elbow, Continuity
   L2 (6 กฎ): + Rotation, Waist, Stability
   L3 (8 กฎ): + Smoothness, Weight (ครบทุกกฎ)
```

---

## 🐛 Debug Mode

กด **`D`** ระหว่างฝึกเพื่อดูค่า real-time:

```
┌───────────────────────────┐
│ 🔧 DEBUG MODE             │
├───────────────────────────┤
│ pathDistance: 0.045       │
│ pathThreshold: 0.080      │
│ wristVelocity: 0.123      │
│ acceleration: 0.015       │
└───────────────────────────┘
```

---

## 📚 อ้างอิง

- MediaPipe Pose Landmarks: [mediapipe.dev](https://mediapipe.dev)
- Chen Taijiquan Silk Reeling Principles
- TaijiFlow AI Heuristics Engine v3.0
