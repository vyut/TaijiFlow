# TaijiFlow AI - Scoring Manager Documentation

**Version:** 3.0  
**Last Updated:** 2024-12-24  
**Lines:** 270  
**Class:** ScoringManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [สูตรการคำนวณ](#2-สูตรการคำนวณ)
3. [เกณฑ์การตัดเกรด](#3-เกณฑ์การตัดเกรด)
4. [Methods Reference](#4-methods-reference)

---

## 1. ภาพรวม

`ScoringManager` รับผิดชอบการให้คะแนนและสรุปผลการฝึก

### 📊 การใช้งาน

```javascript
const scorer = new ScoringManager();
scorer.start();

// ทุก Frame
scorer.recordFrame(feedbacks);

// จบ Session
const summary = scorer.stop();
const grade = ScoringManager.getGrade(summary.score, "th");
```

---

## 2. สูตรการคำนวณ

### Simple Ratio Score

```
Score = (CorrectFrames / TotalFrames) × 100

ตัวอย่าง:
  81 ถูก, 32 ผิด (รวม 113)
  Score = (81 / 113) × 100 = 71.7%
```

### Frame Classification

| Condition | Classification |
|-----------|----------------|
| feedbacks.length === 0 | ✅ Correct |
| feedbacks.length > 0 | ❌ Error |

---

## 3. เกณฑ์การตัดเกรด

| คะแนน | เกรด | Label (TH) | Label (EN) |
|-------|------|------------|------------|
| 85-100 | A | ยอดเยี่ยม | Excellent |
| 70-84 | B | ดีมาก | Very Good |
| 55-69 | C | ดี | Good |
| 40-54 | D | พอใช้ | Fair |
| 0-39 | F | ต้องปรับปรุง | Needs Improvement |

---

## 4. Methods Reference

### Lifecycle Methods

| Method | คำอธิบาย |
|--------|---------|
| `reset()` | รีเซ็ตเพื่อเริ่ม Session ใหม่ |
| `start()` | เริ่มต้นการฝึก |
| `stop()` | หยุดและสรุปผล |

### Recording Methods

| Method | คำอธิบาย |
|--------|---------|
| `recordFrame(feedbacks)` | บันทึกผลทุก frame |
| `getCurrentScore()` | คำนวณคะแนนปัจจุบัน |

### Summary Methods

| Method | คำอธิบาย |
|--------|---------|
| `getSummary()` | สรุปผลการฝึก |
| `getGrade(score, lang)` | แปลงคะแนนเป็นเกรด (Static) |

### getSummary() Return Object

```javascript
{
  score: 71.7,              // คะแนน 0-100
  correctFrames: 81,        // frame ที่ถูกต้อง
  errorFrames: 32,          // frame ที่ผิด
  totalFrames: 113,         // รวมทั้งหมด
  durationFormatted: "1:23" // เวลา mm:ss
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
