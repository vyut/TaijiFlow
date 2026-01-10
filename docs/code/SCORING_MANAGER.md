# TaijiFlow AI - Scoring Manager Documentation

**Version:** 3.0  
**Last Updated:** 2026-01-10  
**Lines:** ~300  
**Class:** ScoringManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [สูตรการคำนวณ](#2-สูตรการคำนวณ)
3. [เกณฑ์การตัดเกรด](#3-เกณฑ์การตัดเกรด)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`ScoringManager` รับผิดชอบการให้คะแนนและสรุปผลการฝึก

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Frame Recording** | บันทึกผลทุก frame |
| **Score Calculation** | คำนวณคะแนนแบบ ratio |
| **Grade Assignment** | ตัดเกรด A-F |
| **Summary Generation** | สรุปผลการฝึก |

### 📊 การใช้งาน

```javascript
const scorer = new ScoringManager();

// เริ่ม session
scorer.start();

// ทุก Frame
scorer.recordFrame(feedbacks); // feedbacks = []

// จบ Session
const summary = scorer.stop();
console.log(summary.score);    // 71.7
console.log(summary.grade);    // "B"
```

---

## 2. สูตรการคำนวณ

### Simple Ratio Score

```
Score = (CorrectFrames / TotalFrames) × 100

ตัวอย่าง:
  765 ถูก, 135 ผิด (รวม 900 frames)
  Score = (765 / 900) × 100 = 85%
```

### Frame Classification

| Condition | Classification | Impact |
|-----------|:--------------:|:------:|
| `feedbacks.length === 0` | ✅ Correct | +1 correct |
| `feedbacks.length > 0` | ❌ Error | +1 error |

### ทำไมใช้ Simple Ratio?

```
❌ Weighted Score (เดิม):
   - ซับซ้อน, ยากต่อการเข้าใจ
   - ผลคะแนนไม่แน่นอน

✅ Simple Ratio (ปัจจุบัน):
   - เข้าใจง่าย: "กี่ frame ที่ทำถูก"
   - โปร่งใส: ผู้ฝึกเห็นความก้าวหน้าชัดเจน
   - ยุติธรรม: ทุก frame มีค่าเท่ากัน
```

---

## 3. เกณฑ์การตัดเกรด

### Grade Criteria

| คะแนน | เกรด | Label (TH) | Label (EN) | สี |
|:-----:|:----:|------------|------------|:--:|
| 90-100 | A | ยอดเยี่ยม | Excellent | 🟢 |
| 75-89 | B | ดีมาก | Very Good | 🔵 |
| 60-74 | C | ดี | Good | 🟡 |
| 50-59 | D | พอใช้ | Fair | 🟠 |
| 0-49 | F | ต้องปรับปรุง | Needs Improvement | 🔴 |

### Grade Color Mapping

```javascript
const GRADE_COLORS = {
  A: '#10b981', // Green
  B: '#3b82f6', // Blue
  C: '#f59e0b', // Yellow
  D: '#f97316', // Orange
  F: '#ef4444'  // Red
};
```

---

## 4. Methods Reference

### Lifecycle Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `constructor()` | void | Initialize state |
| `reset()` | void | รีเซ็ตเพื่อเริ่ม Session ใหม่ |
| `start()` | void | เริ่มต้นการฝึก |
| `stop()` | Object | หยุดและสรุปผล |

### Recording Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `recordFrame(feedbacks)` | Array | void | บันทึกผลทุก frame |
| `getCurrentScore()` | - | number | คำนวณคะแนนปัจจุบัน |

### Summary Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getSummary()` | - | Object | สรุปผลการฝึก |
| `getGrade(score, lang)` | number, string | Object | แปลงคะแนนเป็นเกรด (Static) |

### Summary Object Structure

```javascript
{
  score: 85.0,              // คะแนน 0-100
  grade: "B",               // A, B, C, D, F
  gradeLabel: "ดีมาก",       // Label ตามภาษา
  correctFrames: 765,       // frame ที่ถูกต้อง
  errorFrames: 135,         // frame ที่ผิด
  totalFrames: 900,         // รวมทั้งหมด
  duration: 30000,          // ms
  durationFormatted: "0:30" // mm:ss
}
```

---

## 5. Code Examples

### Constructor and Reset

```javascript
class ScoringManager {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.isRunning = false;
    this.startTime = null;
    this.endTime = null;
    this.correctFrames = 0;
    this.errorFrames = 0;
    this.totalFrames = 0;
  }
}
```

### Start Session

```javascript
start() {
  this.reset();
  this.isRunning = true;
  this.startTime = Date.now();
  console.log('📊 Scoring started');
}
```

### Record Frame

```javascript
recordFrame(feedbacks = []) {
  if (!this.isRunning) return;
  
  this.totalFrames++;
  
  if (feedbacks.length === 0) {
    // No errors - correct frame
    this.correctFrames++;
  } else {
    // Has errors - error frame
    this.errorFrames++;
  }
}
```

### Calculate Current Score

```javascript
getCurrentScore() {
  if (this.totalFrames === 0) return 0;
  return (this.correctFrames / this.totalFrames) * 100;
}
```

### Stop and Get Summary

```javascript
stop() {
  if (!this.isRunning) return null;
  
  this.isRunning = false;
  this.endTime = Date.now();
  
  return this.getSummary();
}

getSummary() {
  const score = this.getCurrentScore();
  const grade = ScoringManager.getGrade(score);
  const duration = this.endTime - this.startTime;
  
  return {
    score: Math.round(score * 10) / 10,
    grade: grade.letter,
    gradeLabel: grade.label,
    correctFrames: this.correctFrames,
    errorFrames: this.errorFrames,
    totalFrames: this.totalFrames,
    duration: duration,
    durationFormatted: this.formatDuration(duration)
  };
}
```

### Get Grade (Static Method)

```javascript
static getGrade(score, lang = 'th') {
  const grades = {
    th: [
      { min: 90, letter: 'A', label: 'ยอดเยี่ยม' },
      { min: 75, letter: 'B', label: 'ดีมาก' },
      { min: 60, letter: 'C', label: 'ดี' },
      { min: 50, letter: 'D', label: 'พอใช้' },
      { min: 0,  letter: 'F', label: 'ต้องปรับปรุง' }
    ],
    en: [
      { min: 90, letter: 'A', label: 'Excellent' },
      { min: 75, letter: 'B', label: 'Very Good' },
      { min: 60, letter: 'C', label: 'Good' },
      { min: 50, letter: 'D', label: 'Fair' },
      { min: 0,  letter: 'F', label: 'Needs Improvement' }
    ]
  };
  
  const gradeList = grades[lang] || grades['th'];
  
  for (const grade of gradeList) {
    if (score >= grade.min) {
      return { letter: grade.letter, label: grade.label };
    }
  }
  
  return { letter: 'F', label: gradeList[4].label };
}
```

### Format Duration

```javascript
formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
```

---

*เอกสารนี้อัปเดต: 2026-01-10*
