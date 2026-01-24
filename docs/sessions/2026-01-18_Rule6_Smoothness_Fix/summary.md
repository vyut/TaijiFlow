# 🔧 Rule 6 Smoothness - การวิเคราะห์และแก้ไข

**Date:** 2026-01-18

---

## 🐛 ปัญหาที่พบ

Rule 6 (Smoothness) trigger บ่อยเกินไป แม้ผู้ใช้เคลื่อนไหวสม่ำเสมอ

---

## 🔍 Root Cause Analysis

### Debug Log ที่พบ

```
dt1: 1.274 dt2: 1.202 v1: 0.070 v2: 0.081 acc: 0.011
threshold: 0.021 triggered: false

dt1: 1.202 dt2: 1.202 v1: 0.081 v2: 0.038 acc: 0.042
threshold: 0.021 triggered: true  ← ผิดพลาด!
```

### สาเหตุหลัก 2 ประการ

#### 1. Skip Frame ทำให้ dt ใหญ่มาก (~1.2 วินาที)

```
Camera: 30 FPS
↓ skip 3/4 frames
MediaPipe: ~7.5 FPS
↓ skip 8/9 frames (HEURISTICS_CHECK_INTERVAL)
analyze(): ~0.83 FPS

→ dt ระหว่าง data points ≈ 1.2 วินาที
```

**ผลกระทบ:** ความเร็วที่คำนวณไม่เสถียร เพราะ sample ห่างกันมาก

#### 2. Calibrated Threshold ต่ำเกินไป

```javascript
// CONFIG
SMOOTHNESS_CALIBRATION_RATIO: 0.12

// คำนวณ
armLength ≈ 0.175
threshold = 0.175 × 0.12 = 0.021  ← ต่ำเกินไป!
```

**ผลกระทบ:** acceleration เพียง 0.022 ก็ trigger warning

---

## ✅ Solution

### ปรับ Calibration Ratio ให้สูงขึ้น

| Parameter | ค่าเดิม | ค่าใหม่ |
|-----------|:-------:|:-------:|
| `SMOOTHNESS_CALIBRATION_RATIO` | 0.12 | **0.5** |

```javascript
// ผลลัพธ์
threshold = 0.175 × 0.5 = 0.0875

// ตอนนี้
acc: 0.042 < 0.0875 → ไม่ trigger ✅
```

---

## 📁 Files Changed

| File | Changes |
|------|---------|
| [heuristics_engine.js](file:///Users/yut/TaijiFlow/js/heuristics_engine.js) | `SMOOTHNESS_CALIBRATION_RATIO: 0.5` |

---

## 💡 บทเรียน

1. **Skip Frame Logic** ส่งผลต่อ time-based calculations ทุกกฎ
2. **Calibrated Thresholds** ต้องคำนึงถึง skip frame interval
3. **Debug Logging** ช่วยหาสาเหตุได้รวดเร็ว
