# Implementation Plan: UML Diagrams for TaijiFlow

## Goal

เพิ่ม UML Diagrams ให้ครบตามมาตรฐาน SE ป.โท

---

## Current Status

| Diagram Type | มีแล้ว | ขาด |
|--------------|:------:|:---:|
| Use Case | ✅ 1 | - |
| Activity | ✅ 8 | - |
| **Class** | ❌ | **ต้องสร้าง** |
| **Sequence** | ❌ | **ต้องสร้าง** |
| Component | ❌ | Optional |
| State | ❌ | Optional |

---

## Proposed Diagrams

### 1. Class Diagram (ความสำคัญ: สูง)

**วัตถุประสงค์:** แสดงโครงสร้าง classes และความสัมพันธ์

**Classes ที่จะแสดง:**

| Class | หน้าที่ | Relationships |
|-------|--------|---------------|
| [HeuristicsEngine](file:///Users/yut/TaijiFlow/js/heuristics_engine.js#38-973) | วิเคราะห์ท่าทาง 8 กฎ | ← script.js |
| `CalibrationManager` | ปรับเทียบสัดส่วน | ← script.js |
| `ScoringManager` | คำนวณคะแนน | ← HeuristicsEngine |
| `FeedbackManager` | แสดง feedback | ← HeuristicsEngine |
| `AudioManager` | TTS เสียงพูด | ← FeedbackManager |
| [UIManager](file:///Users/yut/TaijiFlow/js/ui_manager.js#145-889) | จัดการ UI | ← script.js |
| `GhostManager` | แสดง instructor | ← script.js |
| `DrawingManager` | วาด skeleton/path | ← script.js |

**ไฟล์:** `ClassDiagram.wsd`

---

### 2. Sequence Diagram - Training Flow (ความสำคัญ: สูง)

**วัตถุประสงค์:** แสดง interaction ระหว่าง objects ใน UC02

**Flow ที่จะแสดง:**
```
User → script.js → Calibrator → HeuristicsEngine → FeedbackManager → User
```

**Scenarios:**
1. เริ่มฝึก (Start Training)
2. ตรวจท่าและแจ้งเตือน (Real-time Analysis)
3. หยุดฝึกและแสดงคะแนน (End Training)

**ไฟล์:** `SequenceDiagram_UC02.wsd`

---

### 3. Component Diagram (Optional)

**วัตถุประสงค์:** แสดงโครงสร้าง modules

**Components:**
- Frontend (index.html, styles.css)
- Core Logic (script.js, managers)
- AI Engine (MediaPipe, HeuristicsEngine)
- Data (reference JSON, translations)

**ไฟล์:** `ComponentDiagram.wsd`

---

## Execution Order

| ลำดับ | Diagram | เหตุผล |
|:-----:|---------|--------|
| 1 | **Class Diagram** | พื้นฐานสำคัญ แสดงโครงสร้างระบบ |
| 2 | **Sequence Diagram** | แสดง flow การทำงานหลัก |
| 3 | Component (Optional) | เสริมความสมบูรณ์ |

---

## Next Step

รอ user approve → เริ่มสร้าง Class Diagram
