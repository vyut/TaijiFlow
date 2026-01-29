# ภาคผนวก ก: แผนการดำเนินโครงการ (Project Plan)

---

## ก.1 ภาพรวมโครงการ (Project Overview)

| รายการ | รายละเอียด |
| :--- | :--- |
| **ชื่อโครงการ** | TaijiFlow AI: ระบบ AI ต้นแบบสำหรับการฝึกท่าม้วนไหมในมวยไท้เก๊กสกุลเฉิน |
| **ระยะเวลา** | 4 เดือน (พฤศจิกายน 2568 - กุมภาพันธ์ 2569) |
| **ผู้พัฒนา** | 1 คน |
| **แพลตฟอร์ม** | Web Application |

---

## ก.2 ตารางแผนงาน (Work Schedule)

### Phase 1: Requirements & Analysis (2 สัปดาห์)

| สัปดาห์ | กิจกรรม | ผลลัพธ์ |
| :--- | :--- | :--- |
| 1 | รวบรวมความต้องการและวิเคราะห์หลักการท่าม้วนไหม | Requirements Document |
| 2 | เขียน SRS และ Use Cases | SRS Document |

### Phase 2: Design (2 สัปดาห์)

| สัปดาห์ | กิจกรรม | ผลลัพธ์ |
| :--- | :--- | :--- |
| 3 | ออกแบบ System Architecture และ Module Design | SDD Document |
| 4 | ออกแบบ UI/UX และ Heuristics Rules | Wireframes, Rules Spec |

### Phase 3: Implementation (8 สัปดาห์)

| สัปดาห์ | กิจกรรม | ผลลัพธ์ |
| :--- | :--- | :--- |
| 5-6 | พัฒนา Core Features (Webcam, Pose Detection) | Pose Detection Working |
| 7-8 | พัฒนา Calibration และ Training Mode | Calibration System |
| 9-10 | พัฒนา Heuristics Engine (9 กฎ) | Real-time Feedback |
| 11-12 | พัฒนา UI Features และ Scoring System | Complete UI |

### Phase 4: Testing & Documentation (4 สัปดาห์)

| สัปดาห์ | กิจกรรม | ผลลัพธ์ |
| :--- | :--- | :--- |
| 13 | Unit Testing และ Functional Testing | Test Reports |
| 14 | Usability Testing กับผู้ใช้จริง | User Feedback |
| 15-16 | เขียน Final Report และ Presentation | Final Report |

---

## ก.3 Gantt Chart

```text
พฤศจิกายน 2568          ธันวาคม 2568          มกราคม 2569        กุมภาพันธ์ 2569
W1  W2  W3  W4   W5  W6  W7  W8   W9  W10 W11 W12  W13 W14 W15 W16
├───┴───┴───┴────┴───┴───┴───┴────┴───┴───┴───┴────┴───┴───┴───┴───┤

Phase 1: Requirements
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Phase 2: Design
░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Phase 3: Implementation
░░░░░░░░░░░░░░░░████████████████████████████████░░░░░░░░░░░░░░░░░░░

Phase 4: Testing & Docs
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███████████████████

Legend: ████ = Active Phase
```

---

## ก.4 Milestones

| # | Milestone | กำหนด | สถานะ |
| :--- | :--- | :--- | :--- |
| M1 | SRS & SDD Complete | สัปดาห์ที่ 4 | ✅ |
| M2 | Pose Detection Working | สัปดาห์ที่ 6 | ✅ |
| M3 | Heuristics Engine Complete | สัปดาห์ที่ 10 | ✅ |
| M4 | All Features Complete | สัปดาห์ที่ 12 | ✅ |
| M5 | Testing Complete | สัปดาห์ที่ 14 | ✅ |
| M6 | Final Report Submitted | สัปดาห์ที่ 16 | ✅ |

---

## ก.5 ทรัพยากรที่ใช้ (Resources)

### ก.5.1 Hardware

| รายการ | รายละเอียด |
| :--- | :--- |
| **Computer** | MacBook Air M2 |
| **Webcam** | Built-in FaceTime HD / OBSBOT Meet 2 WebCam |
| **Display** | External Monitor 4K 16:9  |

### ก.5.2 Software

| รายการ | เวอร์ชัน | การใช้งาน |
| :--- | :--- | :--- |
| VS Code | Latest | IDE |
| Chrome | 120+ | Testing & Development |
| Git/GitHub | Latest | Version Control |
| Node.js | 18+ | Development Tools |
| Jest | 29+ | Unit Testing |

### ก.5.3 Libraries & APIs

| รายการ | เวอร์ชัน | การใช้งาน |
| :--- | :--- | :--- |
| MediaPipe Pose | 0.5+ | Pose Estimation |
| MediaPipe Hand | 0.5+ | Gesture Detection |
| Web Speech API | Browser | Text-to-Speech |
| Canvas API | Browser | Drawing & Animation |

---

## ก.6 ความเสี่ยงและการจัดการ (Risk Management)

| # | ความเสี่ยง | ผลกระทบ | ความน่าจะเป็น | การจัดการ |
| :--- | :--- | :--- | :--- | :--- |
| 1 | MediaPipe ไม่แม่นยำ | สูง | ปานกลาง | ปรับ Thresholds, เพิ่ม Smoothing |
| 2 | Browser Compatibility | ปานกลาง | ต่ำ | ทดสอบหลาย Browser, แนะนำใช้ Chrome |
| 3 | Performance Issues | ปานกลาง | ปานกลาง | Optimize Code, ลด Feature ถ้าจำเป็น |
| 4 | Scope Creep | สูง | ปานกลาง | กำหนดขอบเขตชัด, ไม่เพิ่ม Feature |
| 5 | User Testing ล่าช้า | ปานกลาง | ต่ำ | หากลุ่มทดสอบสำรอง |

---

## ก.7 สรุปผลการดำเนินงาน

| รายการ | แผน | ผลจริง | สถานะ |
| :--- | :--- | :--- | :--- |
| **ระยะเวลา** | 16 สัปดาห์ | 16 สัปดาห์ | ✅ ตามแผน |
| **Features** | 12 FR | 12 FR | ✅ ครบถ้วน |
| **Test Cases** | 90+ | 94 | ✅ เกินเป้า |
| **User Testing** | 5-10 คน | 8 คน | ✅ ตามแผน |

**สรุป:** โครงการดำเนินการเสร็จสิ้นตามแผนที่กำหนด ไม่มีความล่าช้าที่สำคัญ

---

*Document updated: 2026-01-26*
