# TaijiFlow AI - Utility Files Documentation

**Last Updated:** 2024-12-24

---

## 📋 สารบัญ

1. [Path Generator](#1-path-generator)
2. [Session Manager](#2-session-manager)
3. [Ghost Manager](#3-ghost-manager)
4. [UI Manager](#4-ui-manager)
5. [Translations](#5-translations)

---

## 1. Path Generator

**File:** `path_generator.js`  
**Lines:** 85

### Function: `generateDynamicPath(landmarks, exercise)`

สร้าง Dynamic Path วงกลมจากสัดส่วนผู้ฝึก

```javascript
// Usage
const path = generateDynamicPath(landmarks, 'rh_cw');
// Returns: [{ x, y }, { x, y }, ...] (72 points)
```

### Algorithm

1. เลือกมือซ้าย/ขวาตาม exercise
2. คำนวณ center (ระหว่างไหล่กับกึ่งกลางลำตัว)
3. คำนวณ radius (85% ของความยาวแขน)
4. Generate 72 จุดบนวงกลม (ทุก 5°)

---

## 2. Session Manager

**File:** `session_manager.js`  
**Lines:** 115

### Functions

| Function | คำอธิบาย |
|----------|---------|
| `getOrCreateUserId()` | สร้าง/ดึง User ID จาก LocalStorage |
| `generateSessionId()` | สร้าง Session ID ใหม่ทุก session |
| `getPlatformInfo()` | ดึงข้อมูลอุปกรณ์ |
| `isMobileDevice()` | ตรวจสอบว่าเป็น Mobile/Tablet |

### ID Format

```javascript
// User ID: "user_" + timestamp(base36) + random(5)
"user_lxyz123ab"

// Session ID: "sess_" + timestamp(base36) + random(5)
"sess_lxyz456cd"
```

---

## 3. Ghost Manager

**File:** `ghost_manager.js`  
**Lines:** 261

### Class: GhostManager

จัดการการแสดง Ghost Overlay (ร่างเงาต้นแบบ)

### Main Methods

| Method | คำอธิบาย |
|--------|---------|
| `load(data)` | โหลด reference skeleton data |
| `loadSilhouetteVideo(url)` | โหลด silhouette video |
| `start()` | เริ่มเล่น |
| `stop()` | หยุดเล่น |
| `update()` | อัปเดต frame (เรียกทุก loop) |
| `getCurrentFrame()` | ดึง landmarks ปัจจุบัน |

---

## 4. UI Manager

**File:** `ui_manager.js`  
**Lines:** 1,091

### Class: UIManager

จัดการ UI ทั้งหมดของแอปพลิเคชัน

### Features

| Feature | คำอธิบาย |
|---------|---------|
| i18n | ระบบหลายภาษา (TH/EN) |
| Theme | Dark/Light Mode |
| Notification | Toast Messages |
| Score Popup | แสดงผลคะแนน |

### Main Methods

| Method | คำอธิบาย |
|--------|---------|
| `toggleLanguage()` | สลับภาษา |
| `toggleTheme()` | สลับ Theme |
| `showNotification(msg, type)` | แสดง Toast |
| `showScoreSummary(score, grade)` | แสดง Popup สรุป |
| `getText(key)` | ดึงข้อความตามภาษา |

---

## 5. Translations

**File:** `translations.js`  
**Lines:** ~500

### โครงสร้าง

```javascript
const TRANSLATIONS = {
  th: {
    start_training: "เริ่มการฝึก",
    stop_training: "หยุดการฝึก",
    // ...
  },
  en: {
    start_training: "Start Training",
    stop_training: "Stop Training",
    // ...
  }
};
```

### Usage

```javascript
const text = TRANSLATIONS[lang][key];
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
