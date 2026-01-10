# TaijiFlow AI - Translations Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** ~500  
**Module:** translations.js

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Structure](#2-structure)
3. [Key Categories](#3-key-categories)
4. [Usage](#4-usage)
5. [Adding Translations](#5-adding-translations)

---

## 1. ภาพรวม

`translations.js` เป็นพจนานุกรมคำแปลสำหรับ 2 ภาษา (TH/EN)

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Dictionary** | เก็บคำแปลทั้งหมด |
| **Key-based** | ใช้ key เดียวกันทุกภาษา |
| **Runtime Switch** | สลับภาษาได้ทันที |

### 📊 การใช้งาน

```javascript
// ดึงคำแปล
const text = translations[lang][key];

// ตัวอย่าง
const title = translations['th']['app_title'];
// = "TaijiFlow AI: ผู้ช่วยฝึกมวยไท้เก๊ก (v0.91)"
```

---

## 2. Structure

### Object Format

```javascript
const translations = {
  th: {
    // Thai translations
    key1: "ข้อความภาษาไทย",
    key2: "...",
    // ...
  },
  en: {
    // English translations
    key1: "English text",
    key2: "...",
    // ...
  }
};
```

### Key Naming Convention

| Format | Example | Usage |
|--------|---------|-------|
| `section_element` | `header_title` | UI element |
| `action_btn` | `start_btn` | Button text |
| `msg_type` | `error_camera` | Messages |
| `label_name` | `label_level` | Form labels |

---

## 3. Key Categories

### Header & Title

| Key | TH | EN |
|-----|----|----|
| `app_title` | TaijiFlow AI: ผู้ช่วยฝึกมวยไท้เก๊ก | TaijiFlow AI: Taijiquan Assistant |

### Selection Controls

| Key | TH | EN |
|-----|----|----|
| `exercise_label` | เลือกท่า | Select Exercise |
| `level_label` | ระดับ | Level |
| `rh_cw` | มือขวา ตามเข็ม | Right Hand CW |
| `rh_ccw` | มือขวา ทวนเข็ม | Right Hand CCW |
| `lh_cw` | มือซ้าย ตามเข็ม | Left Hand CW |
| `lh_ccw` | มือซ้าย ทวนเข็ม | Left Hand CCW |

### Buttons

| Key | TH | EN |
|-----|----|----|
| `start_btn` | เริ่มฝึก | Start Training |
| `stop_btn` | หยุด | Stop |
| `record_btn` | บันทึก | Record |
| `export_btn` | Export | Export |

### Feedback Messages

| Key | TH | EN |
|-----|----|----|
| `fb_path_good` | เส้นทางดี! | Good path! |
| `fb_path_off` | เส้นทางเบี่ยง | Path deviation |
| `fb_elbow_high` | ศอกสูงไป | Elbow too high |
| `fb_elbow_good` | ศอกดี! | Good elbow! |
| `fb_smooth` | ลื่นไหลดี | Good smoothness |
| `fb_jerky` | กระตุก | Jerky movement |

### Calibration

| Key | TH | EN |
|-----|----|----|
| `calib_title` | การปรับเทียบ | Calibration |
| `calib_tpose` | ทำท่ายืนกางแขน | Stand in T-Pose |
| `calib_hold` | ค้างไว้ 3 วินาที | Hold for 3 seconds |
| `calib_complete` | ปรับเทียบสำเร็จ! | Calibration complete! |

### Tutorial

| Key | TH | EN |
|-----|----|----|
| `tut_principles` | หลักการ | Principles |
| `tut_exercises` | ท่าฝึก | Exercises |
| `tut_howto` | วิธีใช้งาน | How To Use |

---

## 4. Usage

### Direct Access

```javascript
// Get translation directly
const text = translations[uiManager.currentLang]['start_btn'];
```

### Via UIManager

```javascript
// UIManager method
const text = uiManager.getText('start_btn');

// UIManager updates DOM automatically
uiManager.updateText(); // Updates all [data-i18n] elements
```

### In HTML with Data Attribute

```html
<button data-i18n="start_btn">เริ่มฝึก</button>

<!-- Will be updated to "Start Training" when switching to EN -->
```

---

## 5. Adding Translations

### Step 1: Add to TH

```javascript
th: {
  // ... existing keys
  new_feature_title: "ฟีเจอร์ใหม่",
  new_feature_desc: "คำอธิบายฟีเจอร์ใหม่",
}
```

### Step 2: Add to EN

```javascript
en: {
  // ... existing keys  
  new_feature_title: "New Feature",
  new_feature_desc: "Description of new feature",
}
```

### Step 3: Use in HTML

```html
<h2 data-i18n="new_feature_title">ฟีเจอร์ใหม่</h2>
<p data-i18n="new_feature_desc">คำอธิบายฟีเจอร์ใหม่</p>
```

### Step 4: Or Use in JavaScript

```javascript
const title = translations[currentLang]['new_feature_title'];
element.textContent = title;
```

---

## 📊 Statistics

| Language | Keys | Coverage |
|:--------:|:----:|:--------:|
| Thai (th) | ~100 | 100% |
| English (en) | ~100 | 100% |

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
