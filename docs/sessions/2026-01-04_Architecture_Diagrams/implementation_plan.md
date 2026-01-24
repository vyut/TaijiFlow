# Implementation Plan: Update System Architecture Diagrams

## Goal

อัปเดตและสร้าง UML Diagrams ให้สอดคล้องกับ codebase ปัจจุบัน สำหรับรายงาน SE ป.โท

---

## Current State Analysis

### 📊 Existing Diagrams (8 files)
| File | Type | Status |
|------|------|--------|
| `UseCaseDiagram.wsd` | Use Case | ✅ ครบ 6 UCs |
| `ActivityDiagram_UC01.wsd` | Activity | ✅ Calibration |
| `ActivityDiagram_UC02.wsd` | Activity | ⚠️ **ต้องอัปเดต** |
| `ActivityDiagram_UC03.wsd` | Activity | ✅ View Result |
| `ActivityDiagram_UC04.wsd` | Activity | ✅ Tutorial |
| `ActivityDiagram_UC05.wsd` | Activity | ✅ Settings |
| `ActivityDiagram_UC06.wsd` | Activity | ✅ Manage Data |
| `ActivityDiagram_Heuristics.wsd` | Activity | ✅ 8 Rules |

### 🆕 New Features Found (ไม่มีใน Architecture Doc)

| Feature | File | Description |
|---------|------|-------------|
| **Low Light Warning** | `script.js:124-128` | ตรวจสอบแสงก่อน/ระหว่างฝึก |
| **Theme System** | `ui_manager.js` | Dark/Light Mode |
| **Ghost Manager** | `ghost_manager.js` | แสดงผู้สอนเงา |
| **Silhouette Video** | `ghost_manager.js` | Video overlay ผู้สอน |
| **Score Popup** | `score_popup_manager.js` | Popup แสดงคะแนน |
| **Rules Config** | `rules_config_manager.js` | UI ปรับ Threshold |
| **Gesture Manager** | `gesture_manager.js` | ควบคุมด้วยท่าทางมือ |
| **Tutorial Manager** | `tutorial_manager.js` | Popup คู่มือการใช้งาน |
| **Feedback Manager** | `feedback_manager.js` | QR Code แบบสอบถาม |

### 📦 Current Module Structure (19 files)
```
js/
├── script.js              # Main Controller (82KB)
├── heuristics_engine.js   # Pose Analysis (51KB)
├── ui_manager.js          # UI + Theme (41KB)
├── audio_manager.js       # TTS Audio (31KB)
├── tutorial_manager.js    # Tutorial Popup (30KB)
├── chatbot.js             # AI Chatbot (26KB)
├── drawing_manager.js     # Canvas Drawing (25KB)
├── translations.js        # i18n Strings (22KB)
├── calibration_manager.js # Calibration (15KB)
├── gesture_manager.js     # Gesture Control (14KB)
├── rules_config_manager.js # Rules Settings (12KB)
├── scoring_manager.js     # Scoring (11KB)
├── ghost_manager.js       # Ghost Overlay (8KB)
├── data_exporter.js       # Export Data (8KB)
├── score_popup_manager.js # Score Popup (7KB)
├── path_generator.js      # Dynamic Path (5KB)
├── session_manager.js     # Session/User ID (5KB)
├── feedback_manager.js    # Feedback Form (4KB)
└── silhouette_manager.js  # Silhouette (3KB)
```

---

## Proposed Changes

### 1. Update ActivityDiagram_UC02.wsd (Training Flow)

> [!IMPORTANT]
> Training Flow Diagram ขาด Low Light Check ที่เป็น feature สำคัญ

**Changes:**
- เพิ่ม "Low Light Check" ก่อนเริ่ม Calibration
- เพิ่ม "Low Light Warning" ระหว่าง Main Loop
- เพิ่ม "Ghost/Silhouette Overlay" ใน Training Loop

### 2. Create Class Diagram

> [!IMPORTANT]
> **Critical for SE Report** - แสดงโครงสร้าง Classes และความสัมพันธ์

**Classes to include:**
- Main: `script.js` (controller)
- Core: `HeuristicsEngine`, `CalibrationManager`, `ScoringManager`
- UI: `UIManager`, `DrawingManager`, `TutorialManager`
- Audio: `AudioManager`
- Features: `GhostManager`, `GestureManager`, `RulesConfigManager`

### 3. Create Sequence Diagram (Training Flow)

> [!IMPORTANT]
> **Critical for SE Report** - แสดง interaction ระหว่าง objects

**Flow:**
```
User → script.js → CalibrationManager → HeuristicsEngine → FeedbackManager → AudioManager → User
```

### 4. Update System Architecture Document

**Update embedded diagrams with:**
- Current module list (19 modules vs original)
- New dependency relationships
- Updated technology stack

---

## Execution Order

| # | Task | Priority | Files |
|---|------|----------|-------|
| 1 | Update `ActivityDiagram_UC02.wsd` | High | Add Low Light Check |
| 2 | Create `ClassDiagram.wsd` | High | New file |
| 3 | Create `SequenceDiagram_UC02.wsd` | High | New file |
| 4 | Update `System Architecture.md` | Medium | Update images |

---

## Verification Plan

### Visual Verification (Manual)
1. **PlantUML Rendering**
   - คำสั่ง: เปิดไฟล์ `.wsd` ใน VS Code + PlantUML Extension
   - ตรวจสอบ: Diagram แสดงครบถ้วน, ภาษาไทยถูกต้อง

2. **Code Accuracy**
   - เปรียบเทียบ Diagram กับ code จริงใน `script.js`, `heuristics_engine.js`
   - ตรวจสอบว่า Flow ตรงกับ logic จริง

---

## Next Step

รอ user approve → เริ่มอัปเดต ActivityDiagram_UC02.wsd
