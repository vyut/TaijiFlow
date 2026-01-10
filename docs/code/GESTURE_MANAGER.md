# TaijiFlow AI - Gesture Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** 394  
**Class:** GestureManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Gestures Supported](#2-gestures-supported)
3. [Hold Timer System](#3-hold-timer-system)
4. [Methods Reference](#4-methods-reference)
5. [UI Overlay](#5-ui-overlay)
6. [Code Examples](#6-code-examples)

---

## 1. ภาพรวม

`GestureManager` จัดการ Hand Gesture Recognition ด้วย MediaPipe Gesture Recognizer

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Gesture Detection** | ตรวจจับท่ามือจาก video |
| **Hold Timer** | รอให้ค้างท่า 2 วินาที |
| **Progress UI** | แสดงความก้าวหน้าขณะค้าง |
| **Callback Trigger** | เรียก action เมื่อครบเวลา |

### 📊 การใช้งาน

```javascript
const gestureManager = new GestureManager();
await gestureManager.init();

// ในแต่ละ frame
gestureManager.detectGestures(videoElement, timestamp, lang);
```

---

## 2. Gestures Supported

### Gesture Configuration

| Gesture Name | Emoji | Action | Hold Time |
|-------------|:-----:|--------|:---------:|
| `Thumb_Up` | 👍 | Start Training | 2000 ms |
| `Closed_Fist` | ✊ | Stop Training | 2000 ms |

### Gesture Flow

```
┌─────────────────────────────────────────────────────┐
│                    Gesture Flow                     │
├─────────────────────────────────────────────────────┤
│  1. User shows gesture (👍 or ✊)                   │
│  2. MediaPipe detects gesture                       │
│  3. Hold timer starts                               │
│  4. Progress overlay shows (0% → 100%)              │
│  5. On 100%: Trigger action callback                │
│  6. If released early: Cancel and reset             │
└─────────────────────────────────────────────────────┘
```

---

## 3. Hold Timer System

### Configuration

| Parameter | Value | Description |
|-----------|:-----:|-------------|
| `HOLD_DURATION_MS` | 2000 | เวลาที่ต้องค้าง |
| `holdStartTime` | number | เวลาเริ่มค้าง |
| `currentGesture` | string | ท่ามือปัจจุบัน |

### Timer Logic

```javascript
// เมื่อตรวจจับ gesture
if (gesture !== currentGesture) {
  // Reset timer for new gesture
  holdStartTime = timestamp;
  currentGesture = gesture;
}

// Calculate progress
const elapsed = timestamp - holdStartTime;
const progress = Math.min(elapsed / HOLD_DURATION_MS, 1.0);

// Trigger on complete
if (progress >= 1.0) {
  triggerAction(gesture);
}
```

---

## 4. Methods Reference

### Initialization

| Method | Returns | Description |
|--------|---------|-------------|
| `constructor()` | void | สร้าง properties และ callbacks |
| `init()` | Promise | โหลด MediaPipe Gesture Recognizer |
| `waitForMediaPipe()` | Promise | รอ MediaPipe module โหลด |
| `createUI()` | void | สร้าง overlay UI elements |

### Detection

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `detectGestures(video, timestamp, lang)` | HTMLVideoElement, number, string | void | ประมวลผล frame |
| `processGesture(name, timestamp, lang)` | string, number, string | void | ประมวลผล gesture ที่ตรวจพบ |
| `resetGesture()` | - | void | Reset state เมื่อปล่อยมือ |

### UI Control

| Method | Parameters | Description |
|--------|------------|-------------|
| `showOverlay(config, lang)` | object, string | แสดง overlay พร้อม progress |
| `hideOverlay()` | - | ซ่อน overlay |
| `updateProgress(progress)` | number (0-1) | อัปเดต progress bar |

### Enable/Disable

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `setEnabled(enabled)` | boolean | void | เปิด/ปิด gesture detection |
| `getIsReady()` | - | boolean | เช็คว่า manager พร้อมหรือไม่ |

---

## 5. UI Overlay

### Overlay Structure

```html
<div class="gesture-overlay">
  <div class="gesture-icon">👍</div>
  <div class="gesture-text">ยกนิ้วโป้งค้างไว้...</div>
  <div class="gesture-progress">
    <div class="gesture-progress-bar" style="width: 50%"></div>
  </div>
</div>
```

### Overlay States

| State | Icon | Text (TH) |
|-------|:----:|-----------|
| Thumb Up Progress | 👍 | ยกนิ้วโป้งค้างไว้... |
| Fist Progress | ✊ | กำมือค้างไว้... |
| Complete | ✅ | เริ่มต้น! / หยุด! |

---

## 6. Code Examples

### Initialize Manager

```javascript
gestureManager = new GestureManager();
gestureManager.setStartCallback(() => startTrainingFlow());
gestureManager.setStopCallback(() => stopAndShowSummary());

await gestureManager.init();
```

### Detection in Render Loop

```javascript
function onFrame(results, timestamp) {
  // ... other processing
  
  if (gestureManager.getIsReady()) {
    gestureManager.detectGestures(video, timestamp, uiManager.currentLang);
  }
}
```

### Callback Registration

```javascript
// Set callbacks in constructor
this.startCallback = () => {};
this.stopCallback = () => {};

// Expose setters
setStartCallback(fn) { this.startCallback = fn; }
setStopCallback(fn) { this.stopCallback = fn; }

// Trigger in processGesture
if (gestureName === 'Thumb_Up') {
  this.startCallback();
} else if (gestureName === 'Closed_Fist') {
  this.stopCallback();
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
