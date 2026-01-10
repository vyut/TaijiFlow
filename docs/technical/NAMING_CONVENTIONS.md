# TaijiFlow AI - Naming Conventions

**Version:** 1.0  
**Last Updated:** 2024-12-26

---

## 📋 สารบัญ

1. [HTML IDs](#1-html-ids)
2. [CSS Classes](#2-css-classes)
3. [JavaScript Variables](#3-javascript-variables)
4. [File Names](#4-file-names)

---

## 1. HTML IDs

### ✅ มาตรฐาน: `kebab-case`

```html
<!-- ถูกต้อง -->
<div id="privacy-modal"></div>
<button id="start-training-btn"></button>
<input id="check-skeleton" type="checkbox">

<!-- หลีกเลี่ยง -->
<div id="privacyModal"></div>      <!-- camelCase -->
<div id="privacy_modal"></div>     <!-- snake_case -->
```

### 📊 สถานะปัจจุบัน (Legacy)

| รูปแบบ | ตัวอย่าง | สถานะ |
|--------|---------|-------|
| `kebab-case` | `privacy-modal`, `check-path` | ✅ ใช้ต่อไป |
| `camelCase` | `statusText`, `startBtn` | ⚠️ Legacy (อย่าเพิ่มใหม่) |
| `snake_case` | `input_video`, `output_canvas` | ⚠️ Legacy (MediaPipe convention) |

> **หมายเหตุ:** ไม่แก้ไข Legacy IDs เพื่อหลีกเลี่ยงการ break ระบบ

---

## 2. CSS Classes

### ✅ มาตรฐาน: `kebab-case`

```css
/* ถูกต้อง */
.canvas-container { }
.countdown-overlay { }
.status-dot { }

/* หลีกเลี่ยง */
.canvasContainer { }   /* camelCase */
.canvas_container { }  /* snake_case */
```

### TailwindCSS

ใช้ตาม TailwindCSS standard:
```html
<div class="bg-gray-800 text-white p-4"></div>
```

---

## 3. JavaScript Variables

### ✅ มาตรฐาน: `camelCase`

```javascript
// Variables & Functions
const isTrainingMode = false;
const currentExercise = "rh_cw";
function startTrainingFlow() {}

// Constants (UPPER_SNAKE_CASE)
const MAX_RECORDING_SECONDS = 30;
const COUNTDOWN_SECONDS = 3;

// Classes (PascalCase)
class HeuristicsEngine {}
class CalibrationManager {}
```

### DOM Element References

```javascript
// ใช้ camelCase สำหรับ variable
const startBtn = document.getElementById("start-btn");
const privacyModal = document.getElementById("privacy-modal");
```

---

## 4. File Names

### ✅ มาตรฐาน: `snake_case` หรือ `kebab-case`

| ประเภท | รูปแบบ | ตัวอย่าง |
|--------|-------|---------|
| **JavaScript** | `snake_case.js` | `heuristics_engine.js`, `audio_manager.js` |
| **CSS** | `kebab-case.css` หรือ `snake_case.css` | `styles.css`, `chatbot.css` |
| **HTML** | `snake_case.html` | `data_collector.html` |
| **Markdown** | `UPPER_CASE.md` | `CHANGELOG.md`, `README.md` |
| **Data** | `snake_case.json` | `rh_cw_L1.json` |

---

## 📝 Quick Reference

| ที่ไหน | รูปแบบ | ตัวอย่าง |
|--------|-------|---------|
| HTML `id` | `kebab-case` | `start-training-btn` |
| CSS class | `kebab-case` | `.canvas-container` |
| JS variable | `camelCase` | `isTrainingMode` |
| JS constant | `UPPER_SNAKE_CASE` | `MAX_DURATION` |
| JS class | `PascalCase` | `ScoringManager` |
| File name | `snake_case` | `audio_manager.js` |

---

*ใช้เอกสารนี้อ้างอิงเมื่อสร้างไฟล์หรือ element ใหม่*
