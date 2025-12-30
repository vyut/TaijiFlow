# TaijiFlow AI - Manual Testing Checklist

**Version:** 1.0  
**Last Updated:** 2024-12-26  
**Tester:** _______________  
**Date:** _______________

---

## วิธีใช้งาน

1. ทำเครื่องหมาย ✅ เมื่อผ่าน, ❌ เมื่อไม่ผ่าน
2. บันทึกหมายเหตุถ้ามีปัญหา
3. Test บน Chrome (recommended)

---

## 1. Core Features

| # | Feature | Steps | Expected | Result | Notes |
|---|---------|-------|----------|:------:|-------|
| 1.1 | เปิดหน้าเว็บ | เปิด index.html | แสดง Loading → เปิดกล้อง | ☐ | |
| 1.2 | Privacy Modal | เปิดครั้งแรก | แสดง popup ยอมรับ | ☐ | |
| 1.3 | เลือกท่าฝึก | เลือก dropdown | เปลี่ยนท่าสำเร็จ | ☐ | |
| 1.4 | เลือกระดับ | เลือก L1/L2/L3 | เปลี่ยนระดับสำเร็จ | ☐ | |
| 1.5 | Start Training | กดปุ่ม | Fullscreen → Calibration → 3-2-1 | ☐ | |
| 1.6 | Calibration | ยืน T-Pose | ตรวจจับสำเร็จ → แสดง Path | ☐ | |
| 1.7 | Training Timer | ฝึก 10 วินาที | Timer นับถอยหลัง | ☐ | |
| 1.8 | Stop Training | กดปุ่มหยุด | ออก Fullscreen → แสดง Score | ☐ | |
| 1.9 | Score Summary | หลังหยุดฝึก | แสดง Score + Grade | ☐ | |
| 1.10 | Recalibrate | กดปุ่มวัดใหม่ | เริ่ม Calibration ใหม่ | ☐ | |

---

## 2. Display Options

| # | Option | Steps | Expected | Result | Notes |
|---|--------|-------|----------|:------:|-------|
| 2.1 | Path Toggle | เปิด/ปิด checkbox | เส้นวงกลมเปิด/ปิด | ☐ | |
| 2.2 | Skeleton Toggle | เปิด/ปิด checkbox | โครงกระดูกเปิด/ปิด | ☐ | |
| 2.3 | Instructor Toggle | เปิด/ปิด checkbox | Thumbnail เปิด/ปิด | ☐ | |
| 2.4 | Ghost Toggle | เปิด/ปิด checkbox | เงาครูฝึกเปิด/ปิด | ☐ | |
| 2.5 | Silhouette Toggle | เปิด/ปิด checkbox | เงาผู้ฝึกเปิด/ปิด | ☐ | |

---

## 3. Heuristics Feedback (8 Rules)

| # | Rule | How to Trigger | Expected Feedback | Result | Notes |
|---|------|----------------|-------------------|:------:|-------|
| 3.1 | Path Shape | เคลื่อนที่ผิดทิศ | "เคลื่อนที่เป็นวงกลม" | ☐ | |
| 3.2 | Arm Rotation | หงาย/คว่ำมือผิด | "หมุนฝ่ามือ..." | ☐ | |
| 3.3 | Elbow Sinking | ยกศอกสูง | "กดศอกลง" | ☐ | |
| 3.4 | Waist Initiation | ขยับไหล่ก่อนเอว | "ใช้เอวนำ" | ☐ | |
| 3.5 | Vertical Stability | กระดกหัว | "รักษาหัวนิ่ง" | ☐ | |
| 3.6 | Smoothness | เคลื่อนไหวกระตุก | "เคลื่อนไหวให้ลื่น" | ☐ | |
| 3.7 | Continuity | หยุดนิ่ง | "อย่าหยุด" | ☐ | |
| 3.8 | Weight Shift | เอียงตัวมาก | "รักษาสมดุล" | ☐ | |

---

## 4. UI Features

| # | Feature | Steps | Expected | Result | Notes |
|---|---------|-------|----------|:------:|-------|
| 4.1 | Language Toggle | กดปุ่ม TH/EN | เปลี่ยนภาษา | ☐ | |
| 4.2 | Theme Toggle | กดปุ่ม Theme | Light/Dark mode | ☐ | |
| 4.3 | Audio Toggle | กดปุ่ม Audio | เปิด/ปิดเสียง | ☐ | |
| 4.4 | Tutorial Popup | กดปุ่ม ? | แสดงคู่มือ | ☐ | |
| 4.5 | Rules Config | กดปุ่ม Rules | แสดงเมนูปรับค่า | ☐ | |
| 4.6 | Fullscreen Toggle | กดปุ่ม Fullscreen | เข้า/ออก Fullscreen | ☐ | |
| 4.7 | Debug Mode | กด D | แสดง/ซ่อน Debug overlay | ☐ | |
| 4.8 | Keyboard Shortcuts | กด Space/M/L | ทำงานตาม shortcut | ☐ | |

---

## 5. Audio Feedback

| # | Feature | Steps | Expected | Result | Notes |
|---|---------|-------|----------|:------:|-------|
| 5.1 | TTS Enable | เปิด Audio + ทำผิด | ได้ยินเสียงแจ้งเตือน | ☐ | |
| 5.2 | TTS Disable | ปิด Audio + ทำผิด | ไม่มีเสียง | ☐ | |
| 5.3 | TTS Cooldown | ทำผิดติดๆ กัน | ไม่พูดซ้ำเร็วเกินไป | ☐ | |
| 5.4 | TTS Language | เปลี่ยนภาษา + ทำผิด | พูดตามภาษาที่เลือก | ☐ | |

---

## 6. Edge Cases

| # | Case | Steps | Expected | Result | Notes |
|---|------|-------|----------|:------:|-------|
| 6.1 | No Camera | ปิดกล้อง | แสดง error message | ☐ | |
| 6.2 | Camera Blocked | บังกล้อง | ไม่แสดง skeleton | ☐ | |
| 6.3 | Out of Frame | ยืนนอกกรอบ | ไม่ตรวจจับ | ☐ | |
| 6.4 | Refresh Page | กด F5 ระหว่างฝึก | กลับหน้าแรก | ☐ | |
| 6.5 | Multiple Tabs | เปิดหลาย tab | ทำงานแยกกัน | ☐ | |

---

## 7. Performance

| # | Test | Steps | Expected | Result | Notes |
|---|------|-------|----------|:------:|-------|
| 7.1 | FPS Normal | ดู Debug overlay | ≥25 fps | ☐ | |
| 7.2 | FPS All Options | เปิดทุก option | ≥15 fps | ☐ | |
| 7.3 | Memory Usage | ฝึก 5 นาที | ไม่ crash | ☐ | |

---

## Summary

| Category | Pass | Fail | Total |
|----------|:----:|:----:|:-----:|
| Core Features | /10 | /10 | 10 |
| Display Options | /5 | /5 | 5 |
| Heuristics | /8 | /8 | 8 |
| UI Features | /8 | /8 | 8 |
| Audio | /4 | /4 | 4 |
| Edge Cases | /5 | /5 | 5 |
| Performance | /3 | /3 | 3 |
| **Total** | **/43** | **/43** | **43** |

---

**Tested By:** _______________  
**Date:** _______________  
**Overall Result:** ☐ PASS / ☐ FAIL
