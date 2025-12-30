# TaijiFlow AI - Features Summary for SRS

**Version:** 1.0  
**Last Updated:** 2024-12-28

---

## Overview

| Category | Count |
|----------|:-----:|
| Core Features | 5 |
| Supporting Features | 6 |
| UI/UX Features | 4 (grouped) |
| **Total** | **15** |

---

## 1. Core Features (ต้อง FR ละเอียด)

### F-01: Pose Detection (ตรวจจับท่าทาง)

| Item | Description |
|------|-------------|
| **Module** | MediaPipe Pose + script.js |
| **Description** | ตรวจจับท่าทางผู้ใช้แบบ real-time ผ่าน Webcam |
| **Technical** | 33 landmarks, ~30 FPS |
| **Input** | Video stream จาก Webcam |
| **Output** | Pose landmarks (x, y, visibility) |

**FR ที่ควรเขียน:**
- FR-01.1: ระบบต้องตรวจจับ 33 จุดบนร่างกาย
- FR-01.2: ระบบต้องทำงานแบบ real-time (≥15 FPS)
- FR-01.3: ระบบต้องแสดง skeleton บนหน้าจอ

---

### F-02: 8 Rules Analysis (ตรวจสอบ 8 กฎไท่จี๋)

| Item | Description |
|------|-------------|
| **Module** | heuristics_engine.js |
| **Description** | ตรวจสอบความถูกต้องของท่าทางตามหลักไท่จี๋ 8 ข้อ |

**8 กฎ:**

| # | Rule | Thai Principle |
|---|------|----------------|
| 1 | Path Shape | วิถีการเคลื่อนที่เป็นวงกลม |
| 2 | Arm Rotation | หมุนฝ่ามือถูกทิศทาง |
| 3 | Elbow Sinking | 沉肩坠肘 - ศอกจมต่ำกว่าไหล่ |
| 4 | Waist Initiation | 以腰为轴 - เอวเป็นแกนนำ |
| 5 | Vertical Stability | 虚领顶劲 - หัวนิ่ง ลำตัวตรง |
| 6 | Smoothness | 如抽丝 - ลื่นไหลเหมือนดึงไหม |
| 7 | Continuity | 绵绵不断 - ต่อเนื่องไม่ขาดตอน |
| 8 | Weight Shift | 分虚实 - น้ำหนักอยู่ในฐาน |

**FR ที่ควรเขียน:**
- FR-02.1 ~ FR-02.8: แต่ละกฎ 1 FR

---

### F-03: Real-time Feedback (แจ้งเตือนทันที)

| Item | Description |
|------|-------------|
| **Module** | heuristics_engine.js, feedback_manager.js, audio_manager.js |
| **Description** | แสดงข้อผิดพลาดแบบ real-time ทั้งภาพและเสียง |
| **Output** | Visual overlay + TTS voice |

**FR ที่ควรเขียน:**
- FR-03.1: แสดงข้อความ feedback บนหน้าจอ
- FR-03.2: แจ้งเตือนด้วยเสียง (TTS)
- FR-03.3: มี cooldown ป้องกันแจ้งถี่เกินไป

---

### F-04: Scoring System (คะแนนและเกรด)

| Item | Description |
|------|-------------|
| **Module** | scoring_manager.js |
| **Description** | คำนวณคะแนนจากความถูกต้องและให้เกรด |
| **Formula** | Score = (Correct Frames / Total Frames) × 100 |
| **Grading** | A (≥90), B (≥80), C (≥70), D (≥60), F (<60) |

**FR ที่ควรเขียน:**
- FR-04.1: คำนวณคะแนนจากอัตราส่วนความถูกต้อง
- FR-04.2: แสดงเกรด A-F
- FR-04.3: แสดงสรุปผลหลังจบการฝึก

---

### F-05: Body Calibration (ปรับเทียบสัดส่วน)

| Item | Description |
|------|-------------|
| **Module** | calibration_manager.js |
| **Description** | ปรับเทียบสัดส่วนร่างกายก่อนเริ่มฝึก |
| **Method** | T-Pose detection |
| **Measurements** | Arm length, Torso height, Shoulder width |

**FR ที่ควรเขียน:**
- FR-05.1: ตรวจจับ T-Pose
- FR-05.2: วัดสัดส่วนร่างกาย (แขน, ลำตัว)
- FR-05.3: ปรับ threshold ตามสัดส่วน

---

## 2. Supporting Features (FR ปานกลาง)

### F-06: Dynamic Path (เส้นนำทาง)

| Item | Description |
|------|-------------|
| **Module** | path_generator.js, drawing_manager.js |
| **Description** | วาดเส้นวงกลมนำทางตามขนาดแขนผู้ใช้ |

---

### F-07: Audio Feedback (เสียงแจ้งเตือน)

| Item | Description |
|------|-------------|
| **Module** | audio_manager.js |
| **Description** | Text-to-Speech แจ้งเตือนข้อผิดพลาด |
| **Languages** | Thai, English |

---

### F-08: Instructor Reference (วิดีโอต้นแบบ)

| Item | Description |
|------|-------------|
| **Module** | ghost_manager.js |
| **Description** | แสดงวิดีโอเงาครูฝึกเป็นแบบอ้างอิง |
| **Display** | Thumbnail มุมขวาบน หรือ Overlay บนวิดีโอ |

---

### F-09: Multi-level Training (3 ระดับ)

| Item | Description |
|------|-------------|
| **Module** | script.js, heuristics_engine.js |
| **Description** | 3 ระดับความยาก |

| Level | Rules Checked | Description |
|-------|:-------------:|-------------|
| L1 | 3 กฎ | เริ่มต้น (Path, Elbow, Continuity) |
| L2 | 5 กฎ | ปานกลาง (+Rotation, Smoothness) |
| L3 | 8 กฎ | ขั้นสูง (ครบทุกกฎ) |

---

### F-10: Training Timer (จับเวลา)

| Item | Description |
|------|-------------|
| **Module** | script.js |
| **Description** | Countdown 3-2-1 และ Timer แสดงเวลาฝึก |

---

### F-11: Gesture Control (ควบคุมด้วยท่ามือ)

| Item | Description |
|------|-------------|
| **Module** | gesture_manager.js |
| **Description** | ควบคุมระบบด้วยท่ามือ (เริ่ม/หยุด) |

---

## 3. UI/UX Features (รวมกลุ่ม)

### F-12: User Interface Configuration

| Sub-feature | Description |
|-------------|-------------|
| **Language Toggle** | สลับ TH/EN |
| **Theme Toggle** | Light/Dark mode |
| **Fullscreen Mode** | เต็มจอขณะฝึก |
| **Notifications** | Toast alerts |

---

### F-13: Display Options

| Sub-feature | Default | Description |
|-------------|:-------:|-------------|
| Path | ON | เส้นวงกลมนำทาง |
| Skeleton | ON | โครงกระดูกผู้ใช้ |
| Instructor | ON | เงาครูฝึก thumbnail |
| Ghost | OFF | เงาครูฝึก overlay |
| Silhouette | OFF | เงาผู้ใช้ |

---

### F-14: Tutorial System

| Item | Description |
|------|-------------|
| **Module** | tutorial_manager.js |
| **Description** | คู่มือการใช้งานแบบ popup |

---

### F-15: AI Chatbot (Optional)

| Item | Description |
|------|-------------|
| **Module** | chatbot.js |
| **Description** | ถาม-ตอบเกี่ยวกับไท่จี๋ (Gemini API) |

---

## Summary Table

| F-ID | Feature | Priority | FR Count |
|------|---------|:--------:|:--------:|
| F-01 | Pose Detection | Core | 3 |
| F-02 | 8 Rules Analysis | Core | 8 |
| F-03 | Real-time Feedback | Core | 3 |
| F-04 | Scoring System | Core | 3 |
| F-05 | Body Calibration | Core | 3 |
| F-06 | Dynamic Path | Support | 2 |
| F-07 | Audio Feedback | Support | 2 |
| F-08 | Instructor Reference | Support | 2 |
| F-09 | Multi-level Training | Support | 2 |
| F-10 | Training Timer | Support | 1 |
| F-11 | Gesture Control | Support | 1 |
| F-12 | UI Configuration | UI | 2 (grouped) |
| F-13 | Display Options | UI | 1 (grouped) |
| F-14 | Tutorial System | UI | 1 |
| F-15 | AI Chatbot | Optional | 1 |
| **Total** | | | **~35 FRs** |

---

## Non-Functional Requirements (NFR)

| NFR-ID | Requirement |
|--------|-------------|
| NFR-01 | Performance: ≥15 FPS on mid-range PC |
| NFR-02 | Browser: Chrome 90+, Edge, Safari |
| NFR-03 | Responsive: Desktop + Tablet |
| NFR-04 | Accessibility: TH/EN bilingual |
| NFR-05 | Security: Camera permission only |

---

*Use this document as reference for writing SRS*
