# TaijiFlow AI - Training Flow (v0.4)

แผนภาพแสดงลำดับการทำงานเมื่อผู้ใช้เริ่มฝึก

---

## 📊 Training Session Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant UI as 🖥️ UI
    participant SC as 📜 script.js
    participant CAL as 📏 calibrator
    participant FS as ⬜ Fullscreen
    participant TR as ⏱️ Training
    
    U->>UI: เลือกท่าฝึก + ระดับ
    U->>UI: กด "🏃 Start Training"
    
    UI->>SC: startTrainingFlow()
    
    Note over SC,FS: Step 1: Fullscreen (User Gesture Context)
    SC->>FS: canvasContainer.requestFullscreen()
    FS-->>UI: เข้า Fullscreen Mode
    
    Note over SC,CAL: Step 2: Calibration (ใน Fullscreen)
    SC->>CAL: calibrator.start()
    CAL->>UI: แสดง "กรุณายืนกางแขน (T-Pose)"
    U->>CAL: ยืน T-Pose 3 วินาที
    CAL->>SC: onCalibrationComplete()
    
    Note over SC,TR: Step 3: Countdown (ใน Fullscreen)
    SC->>UI: showCountdown() 3-2-1
    
    Note over SC,TR: Step 4: Training (ใน Fullscreen)
    SC->>TR: เริ่มฝึก 5 นาที
    TR->>UI: แสดง Timer มุมซ้ายล่าง
    TR->>UI: แสดง Skeleton + Feedback
    
    alt กดปุ่มหยุด หรือ หมดเวลา
        U->>UI: กด 🛑 หยุด
        UI->>SC: endTrainingSession()
    end
    
    SC->>FS: document.exitFullscreen()
    FS-->>UI: ออกจาก Fullscreen
    SC->>UI: แสดง Score Summary Popup
```

---

## 🔄 Simplified Flow

```
กด Start Training
     │
     ▼
┌─────────────────┐
│  📺 FULLSCREEN  │  ← เข้า Fullscreen ทันที (User Gesture)
│     Mode        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  📏 Calibration │  ← ยืน T-Pose 3 วินาที
│   "กรุณายืนกางแขน" │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ⏱️ Countdown   │  ← 3-2-1
│     3-2-1       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  🏃 Training    │  ← 5 นาที + Feedback
│   5:00 Timer    │
└────────┬────────┘
         │
    กด 🛑 หรือหมดเวลา
         │
         ▼
┌─────────────────┐
│  📊 Summary     │  ← คะแนน + เกรด
│   Score Popup   │
└────────┬────────┘
         │
         ▼
    ออก Fullscreen
```

---

## 📋 UI Elements During Training (Fullscreen)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                    🎥 WEBCAM VIEW                    │
│                  + 🦴 SKELETON OVERLAY               │
│                  + 📍 REFERENCE PATH                 │
│                                                      │
│  ┌─────────────────────┐       ┌──────────────────┐  │
│  │ ⏱️ 4:32 | 🛑 หยุด  │       │ ⬜ จอปกติ        │  │
│  └─────────────────────┘       └──────────────────┘  │
│        ↑ มุมซ้ายล่าง                 ↑ มุมขวาล่าง      │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 Key Functions

| Function | Location | Description |
|----------|----------|-------------|
| `startTrainingFlow()` | script.js | เริ่ม Flow: Fullscreen → Calibrate |
| `startTrainingAfterCalibration()` | script.js | หลัง Calibrate: Countdown → Training |
| `showCountdown()` | script.js | แสดง 3-2-1 |
| `endTrainingSession()` | script.js | หยุด Training + Exit Fullscreen + สรุปผล |

---

## 🪞 Mirror Logic (v0.4)

**ก่อน v0.4:**
- CSS: `canvas { transform: scaleX(-1) }` ✅
- CSS: `canvas:fullscreen { transform: scaleX(-1) }` → Double flip!
- JS: `if (isFullscreen) scale(-1, 1)` → ต้อง flip กลับ

**หลัง v0.4:**
- CSS: `canvas { transform: scaleX(-1) }` ✅
- Container Fullscreen: CSS ยังทำงานปกติ ✅
- JS: ไม่ต้อง check `isFullscreen` อีกต่อไป ✅
