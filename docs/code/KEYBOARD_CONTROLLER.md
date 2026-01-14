# TaijiFlow AI - Keyboard Controller Documentation

**Version:** 1.1  
**Last Updated:** 2026-01-14  
**Lines:** 296  
**Class:** KeyboardController

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Keyboard Shortcuts](#2-keyboard-shortcuts)
3. [Methods Reference](#3-methods-reference)
4. [Dependencies](#4-dependencies)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`KeyboardController` จัดการ Keyboard Shortcuts ทั้งหมดในแอปพลิเคชัน

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------| 
| **Keyboard Listening** | รับ keydown events |
| **Shortcut Mapping** | Map keys ไปยัง actions |
| **Dependency Injection** | ใช้ deps object แทน globals |
| **Thai Keyboard Support** | ใช้ `e.code` แทน `e.key` |

### 📊 การใช้งาน

```javascript
const keyboardController = new KeyboardController({
  script: scriptFunctions,
  uiManager: uiManager,
  displayController: displayController,
  tutorialManager: tutorialManager,
  audioManager: audioManager,
  heuristics: heuristicsEngine,
  translations: translations
});
```

---

## 2. Keyboard Shortcuts

### Control Shortcuts

| Key Code | Key | Function | Description |
|----------|-----|----------|-------------|
| `Space` | Space | Toggle Training | เริ่ม/หยุดการฝึก |
| `KeyM` | M | Toggle Audio | เปิด/ปิดเสียง |
| `KeyL` | L | Cycle Levels | สลับระดับ L1→L2→L3 |
| `Escape` | Esc | Cancel Calibration | ยกเลิก Calibration |

### Display Shortcuts

| Key Code | Key | Function | Description |
|----------|-----|----------|-------------|
| `KeyF` | F | Toggle Fullscreen | เปิด/ปิดเต็มจอ |
| `KeyD` | D | Toggle Debug | เปิด/ปิด Debug Overlay |
| `KeyP` | P | Toggle Path | เปิด/ปิดเส้นทาง |
| `KeyK` | K | Toggle Skeleton | 🆕 เปิด/ปิดโครงกระดูก (ย้ายจาก B) |
| `KeyB` | B | Toggle Blur Background | 🆕 เปิด/ปิด Visual Effects |
| `KeyS` | S | Toggle Silhouette | เปิด/ปิดเงา |
| `KeyG` | G | Toggle Ghost | เปิด/ปิดเงาครู |
| `KeyI` | I | Toggle Instructor | เปิด/ปิด Thumbnail ครู |
| `KeyR` | R | Toggle Trail | เปิด/ปิดเส้นทางมือ |

### Settings Shortcuts

| Key Code | Key | Function | Description |
|----------|-----|----------|-------------|
| `KeyT` | T | Toggle Theme | สลับ Dark/Light |

### Help Shortcuts

| Key Code | Key | Function | Description |
|----------|-----|----------|-------------|
| `KeyH` | H | Open Tutorial | เปิดคู่มือ |
| `Shift+Slash` | ? | Open Tutorial | เปิดคู่มือ (เหมือน H) |
| `Slash` | / | Show Shortcuts | แสดงรายการ shortcuts |

---

## 3. Methods Reference

### Constructor

| Method | Parameters | Description |
|--------|------------|-------------|
| `constructor(deps)` | deps: Object | รับ dependencies และเรียก init() |

### Core Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `init()` | - | void | ผูก keydown event listener |
| `handleKeydown(e)` | KeyboardEvent | void | ประมวลผล keyboard event |
| `showShortcutsHelp()` | - | void | แสดง notification รายการ shortcuts |

---

## 4. Dependencies

### จาก Constructor

```javascript
{
  script: {
    startTrainingFlow,
    stopAndShowSummary,
    requestFullscreenMode,
    exitFullscreen,
    toggleDebugOverlay,
    isTrainingMode,
    isFullscreen,
    currentLevel,
    setLevel
  },
  uiManager: UIManager,
  displayController: DisplayController,
  tutorialManager: TutorialManager,
  audioManager: AudioManager,
  heuristics: HeuristicsEngine,
  translations: Object
}
```

---

## 5. Code Examples

### การใช้ e.code แทน e.key

```javascript
// ❌ เดิม - ไม่ทำงานกับ Thai keyboard
switch (e.key.toLowerCase()) {
  case 'd':
    // ...
}

// ✅ ใหม่ - ทำงานทุก keyboard layout
switch (e.code) {
  case 'KeyD':
    // ...
}
```

### Toggle Training

```javascript
case 'Space':
  e.preventDefault();
  if (script.isTrainingMode) {
    script.stopAndShowSummary();
  } else {
    script.startTrainingFlow();
  }
  break;
```

### Cycle Levels

```javascript
case 'KeyL':
  const levels = ['L1', 'L2', 'L3'];
  const currentIdx = levels.indexOf(script.currentLevel);
  const nextIdx = (currentIdx + 1) % levels.length;
  script.setLevel(levels[nextIdx]);
  break;
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
