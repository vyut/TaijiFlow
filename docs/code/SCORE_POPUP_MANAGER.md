# TaijiFlow AI - Score Popup Manager Documentation

**Version:** 3.0  
**Last Updated:** 2026-01-14  
**Class:** ScorePopupManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Score Display](#2-score-display)
3. [Grading System](#3-grading-system)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`ScorePopupManager` แสดงสรุปผลการฝึกหลังจบ Session โดยใช้ **Compact Layout** และธีมสีม่วง

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Score Summary** | แสดงเกรด (A-F) และวงแหวนคะแนน (Ring) |
| **Bilingual** | ใช้ข้อความจาก `translations.js` (score_popup) |
| **Statistics** | แสดงเวลาฝึก, ข้อผิดพลาดหลัก (Top Errors) |
| **Interactive** | ปุ่มลงแบบสอบถาม, ปุ่มปิด (X), ปุ่มเริ่มใหม่ |

### 📊 การใช้งาน

```javascript
const scorePopup = new ScorePopupManager();
scorePopup.show({
  score: 85,
  grade: 'B',
  duration: "0:45",
  metrics: { ... },
  feedbacks: [ ... ]
});
```

---

## 2. Score Display

### Popup Layout (v3.0)

```
┌─────────────────────────────────────────────────────┐
│  🟣 สรุปผลการฝึก (Title)                        [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│        [ Grade B ]         ( 85% )                  │
│        (Blue Card)       (Score Ring)               │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ⏱️ เวลาที่ใช้: 0:45 นาที                             │
│                                                     │
│  ⚠️ ข้อผิดพลาดที่พบ:                                 │
│  - ศอกลอย (20%)                                     │
│  - หมุนมือผิดทิศ (5%)                                │
│                                                     │
│  💡 คำแนะนำ:                                        │
│  "ฝึกซ้ำอีกนิด! ลองลดระดับข้อศอกลง"                     │
├─────────────────────────────────────────────────────┤
│         [ 📝 ตอบแบบสอบถาม (Survey) ]                 │
│         [ 🔄 ฝึกอีกครั้ง (Restart) ]                  │
└─────────────────────────────────────────────────────┘
```

---

## 3. Grading System

### Grade Criteria

| เกรด | คะแนน | สี | ความหมาย |
|:----:|:-----:|:--:|----------|
| A | ≥ 80 | 🟢 Teal | ยอดเยี่ยม Excellent |
| B | 60-79 | 🔵 Blue | ดีมาก Very Good |
| C | 40-59 | 🟡 Yellow | พอใช้ Fair |
| F | < 40 | 🔴 Red | ต้องปรับปรุง Try Again |

---

## 4. Methods Reference

### Popup Control

| Method | Parameters | Description |
|--------|------------|-------------|
| `show(data)` | Object | แสดง popup, คำนวณเกรด, เรียก translations |
| `close()` | - | ปิด popup, เคลียร์ UI |

### Logic

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `calculateGrade(score)` | number | string | คำนวณเกรด A, B, C, F |
| `getGradeColor(grade)` | string | string | คืนค่า Tailwind class `text-xxx` |
| `getGradeColorBg(grade)` | string | string | คืนค่า Tailwind class `bg-xxx` |
| `createRing(score)` | number | string | สร้าง SVG Ring Chart |

---

## 5. Code Examples

### Show Logic (Simplified)

```javascript
show(data) {
  // 1. Get Translations
  const lang = window.uiManager?.currentLang || 'th';
  const t = TRANSLATIONS[lang].score_popup;

  // 2. Calculate Grade
  const grade = this.calculateGrade(data.score);
  
  // 3. Build HTML (Compact)
  const popup = document.createElement("div");
  popup.innerHTML = `
    <!-- Header with Title & Close Btn -->
    <div class="header">
      <h3>${t.title}</h3>
      <button onclick="close()">X</button>
    </div>
    
    <!-- Side-by-Side Content -->
    <div class="flex-row">
      <div class="grade-card">${grade}</div>
      <div class="ring-chart">${this.createRing(data.score)}</div>
    </div>
    
    <!-- Stats & Feedback -->
    <div class="stats">...</div>
    
    <!-- Actions Stack -->
    <div class="actions">
      <button class="survey-btn">${t.take_survey_btn}</button>
      <button class="restart-btn">${t.close_btn}</button>
    </div>
  `;
}
```

---

*เอกสารนี้อัปเดตสำหรับ v0.9.8*
