# TaijiFlow AI - Script.js Documentation

**Version:** 3.0  
**Last Updated:** 2024-12-24  
**Lines:** 1,723  
**Functions:** 66

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [โครงสร้างไฟล์](#2-โครงสร้างไฟล์)
3. [Functions Reference](#3-functions-reference)
4. [State Variables](#4-state-variables)
5. [Event Listeners](#5-event-listeners)

---

## 1. ภาพรวม

`script.js` เป็น **Main Controller** ของแอปพลิเคชัน ทำหน้าที่:
- เชื่อมต่อ Modules ทั้งหมดเข้าด้วยกัน
- จัดการ User Interactions (ปุ่ม, Dropdown, Keyboard)
- ควบคุม Training Flow (เริ่ม → Calibrate → Countdown → ฝึก → สรุป)
- ประมวลผลจาก MediaPipe และส่งไปยัง Heuristics Engine
- บันทึกข้อมูล Session สำหรับ Export

---

## 2. โครงสร้างไฟล์

```
script.js (1,723 lines)
│
├── SECTION 1: SETUP & VARIABLES (56-220)
│   ├── DOM Elements
│   ├── Manager Instances
│   ├── State Variables
│   └── Helper Functions
│
├── SECTION 2: UI EVENT LISTENERS (221-1183)
│   ├── Button Event Listeners
│   ├── Display Checkbox Handlers
│   ├── Training Flow Functions
│   └── Keyboard Shortcuts
│
├── SECTION 3: DATA LOADING (1184-1272)
│   └── loadReferenceData()
│
├── SECTION 4: MEDIAPIPE PROCESSING (1273-1570)
│   └── onResults()
│
└── SECTION 5: INITIALIZATION (1571-1723)
    ├── Pose Model Setup
    ├── Camera Setup
    └── Start Application
```

---

## 3. Functions Reference

### 3.1 Section 1: Helper Functions

| Function | Lines | คำอธิบาย |
|----------|-------|---------|
| `updateDebugOverlay(debugInfo)` | 146-162 | อัปเดต Debug Overlay แสดงค่า thresholds |
| `toggleDebugOverlay(show)` | 164-175 | แสดง/ซ่อน Debug Overlay |
| `updateFeedbackOverlay(feedbacks)` | 181-201 | อัปเดต Feedback Overlay แสดงข้อผิดพลาด |
| `toggleFeedbackOverlay(show)` | 203-214 | แสดง/ซ่อน Feedback Overlay |

#### `updateDebugOverlay(debugInfo)`
```javascript
// Input: { elbowAngle: 45.2, headMovement: 0.02, ... }
// Output: แสดงค่าใน HTML overlay
```

#### `toggleFeedbackOverlay(show)`
```javascript
// show = true → แสดง overlay
// show = false → ซ่อน overlay
```

---

### 3.2 Section 2: UI Functions

| Function | Lines | คำอธิบาย |
|----------|-------|---------|
| `checkSelectionComplete()` | 282-295 | ตรวจสอบว่าเลือกท่า+ระดับครบหรือยัง |
| `updateButtonStates(isTraining)` | 297-323 | อัปเดตสถานะปุ่ม Start/Stop |
| `toggleInstructor(show)` | 391-400 | เปิด/ปิด Instructor Thumbnail |

#### `checkSelectionComplete()`
```javascript
// Return: boolean
// true = เลือกท่าและระดับครบแล้ว
// false = ยังไม่ครบ → ปุ่มเริ่มฝึก disabled
```

---

### 3.3 Training Flow Functions

| Function | Lines | คำอธิบาย |
|----------|-------|---------|
| `showCountdown()` | 563-590 | แสดง Countdown 3-2-1 (Promise) |
| `formatTime(ms)` | 592-600 | แปลง ms เป็น mm:ss |
| `updateTrainingTimer()` | 602-617 | อัปเดต Timer ทุกวินาที |
| `startTrainingFlow()` | 623-646 | เริ่ม Training (Fullscreen → Calibrate) |
| `startTrainingAfterCalibration()` | 648-682 | เริ่มฝึกหลัง Calibrate สำเร็จ |
| `endTrainingSession()` | 684-767 | จบ Session (Export + Summary) |
| `resetToHomeScreen()` | 769-828 | Reset ทุกอย่างกลับหน้าแรก |

#### `showCountdown()` - Promise-based
```javascript
// Usage:
await showCountdown(); // รอจนนับเสร็จ
startTraining();
```

#### `startTrainingFlow()` - Main Entry Point
```javascript
// Flow:
// 1. ซ่อน Start Overlay
// 2. เข้า Fullscreen (ถ้าไม่ใช่ PWA)
// 3. setLevel() ให้ Calibrator
// 4. เริ่ม Calibration
```

#### `endTrainingSession()` - Cleanup
```javascript
// Flow:
// 1. หยุด Timer
// 2. คำนวณคะแนน
// 3. Export Data (Desktop only)
// 4. แสดง Summary
// 5. Announce ด้วยเสียง
```

---

### 3.4 Gesture Callbacks

| Function | Lines | คำอธิบาย |
|----------|-------|---------|
| `onStartTraining()` | 453-462 | Callback เมื่อ Gesture ส่งสัญญาณเริ่ม |
| `onStopTraining()` | 464-488 | Callback เมื่อ Gesture ส่งสัญญาณหยุด |
| `startCalibration()` | 490-500 | เริ่ม Calibration (ปุ่ม "วัดใหม่") |

---

### 3.5 Data Loading

| Function | Lines | คำอธิบาย |
|----------|-------|---------|
| `loadReferenceData()` | 1197-1272 | โหลด Ghost + Silhouette data |

#### `loadReferenceData()`
```javascript
// Input: currentExercise, currentLevel
// Output: 
//   - ghostManager.load(data)
//   - ghostManager.loadSilhouetteVideo(url)
```

---

### 3.6 MediaPipe Processing

| Function | Lines | คำอธิบาย |
|----------|-------|---------|
| `onResults(results)` | 1289-1570 | **Main Loop** - ทำงานทุก Frame (~30fps) |

#### `onResults(results)` - หัวใจของแอป
```javascript
function onResults(results) {
  // 1. Draw Video
  ctx.drawImage(results.image);
  
  // 2. Calibration Mode
  if (calibrator.isActive) {
    calibrator.process(results, canvasCtx);
  }
  
  // 3. Training Mode
  if (isTrainingMode) {
    // Generate Dynamic Path (first frame only)
    if (referencePath.length === 0) {
      referencePath = generateDynamicPath(landmarks, exercise);
    }
    
    // Draw overlays
    drawer.drawPath(referencePath);
    drawer.drawSkeleton(landmarks);
    
    // Analyze pose
    feedbacks = engine.analyze(landmarks, timestamp, path, exercise, level);
    
    // Display feedback
    updateFeedbackOverlay(feedbacks);
    audioManager.announceFeedback(feedbacks);
    
    // Record score
    scorer.recordFrame(feedbacks);
  }
}
```

---

### 3.7 Initialization

| Function | Lines | คำอธิบาย |
|----------|-------|---------|
| `locateFile(file)` | 1586 | Helper สำหรับ MediaPipe CDN |
| `onFrame()` | 1615-1620 | Camera callback ส่งภาพไป Pose |
| `showCameraError(errorType)` | 1629-1676 | แสดง Error กล้อง |
| `initCamera()` | 1678-1711 | เริ่มกล้องพร้อม Error Handling |

---

## 4. State Variables

### 4.1 Training State

| Variable | Type | Default | คำอธิบาย |
|----------|------|---------|---------|
| `currentExercise` | string | null | ท่าที่เลือก (rh_cw, lh_ccw, ...) |
| `currentLevel` | string | null | ระดับที่เลือก (L1, L2, L3) |
| `isTrainingMode` | boolean | false | กำลังฝึกอยู่หรือไม่ |
| `isRecording` | boolean | false | กำลังบันทึกข้อมูลหรือไม่ |
| `trainingStartTime` | number | 0 | Unix timestamp เริ่มฝึก |

### 4.2 Display State

| Variable | Type | Default | คำอธิบาย |
|----------|------|---------|---------|
| `showGhostOverlay` | boolean | false | แสดง Ghost บนวิดีโอ |
| `showInstructor` | boolean | true | แสดง Instructor Thumbnail |
| `showPath` | boolean | true | แสดง Dynamic Path |
| `showSkeleton` | boolean | true | แสดง Skeleton ผู้ฝึก |
| `showSilhouette` | boolean | false | แสดง Silhouette ผู้ฝึก |

### 4.3 Session Data

| Variable | Type | คำอธิบาย |
|----------|------|---------|
| `referencePath` | array | จุดบน Path จาก generateDynamicPath() |
| `sessionLog` | array | ประวัติ feedback ทุก frame |
| `recordedSessionData` | array | ข้อมูลดิบสำหรับ Export |

---

## 5. Event Listeners

### 5.1 Button Events

| Element | Event | Action |
|---------|-------|--------|
| `startTrainingBtn` | click | `startTrainingFlow()` |
| `stopTrainingBtn` | click | `endTrainingSession()` |
| `smallCalibrateBtn` | click | `startCalibration()` |
| `cancelCalibBtn` | click | `calibrator.cancel()` |
| `fullscreenBtn` | click | Toggle Fullscreen |
| `langBtn` | click | Toggle Language |
| `themeBtn` | click | Toggle Theme |
| `audioBtn` | click | Toggle Audio |

### 5.2 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start/Stop Training |
| `F` | Toggle Fullscreen |
| `D` | Toggle Debug Mode |
| `G` | Toggle Ghost Overlay |
| `I` | Toggle Instructor |
| `P` | Toggle Path |
| `B` | Toggle Skeleton (Bones) |
| `S` | Toggle Silhouette |
| `M` | Toggle Mute |
| `L` | Toggle Language |
| `T` | Toggle Theme |
| `/` | Show Shortcuts Help |
| `Esc` | Cancel Calibration |

---

## 📚 Related Files

- [path_generator.js](CODE_PATH_GENERATOR.md) - generateDynamicPath()
- [session_manager.js](CODE_SESSION_MANAGER.md) - User/Session ID
- [heuristics_engine.js](CODE_HEURISTICS_ENGINE.md) - Pose Analysis
- [calibration_manager.js](CODE_CALIBRATION_MANAGER.md) - Calibration

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
