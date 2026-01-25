# Configuration Item Table (ตาราง Configuration Items)

**โครงการ:** TaijiFlow AI  
**เวอร์ชัน:** 1.1.2
**วันที่:** 25 มกราคม 2569
**ผู้จัดทำ:** วีรยุทธ เอื้อใจพระ

---

## 1. บทนำ (Introduction)

เอกสารนี้ระบุรายการ Configuration Items (CI) ทั้งหมดในโครงการ TaijiFlow AI เพื่อใช้ในการบริหารจัดการการเปลี่ยนแปลง (Configuration Management) และควบคุมเวอร์ชัน

---

## 2. สรุปภาพรวม (Summary)

| ประเภท | จำนวน |
|--------|:-----:|
| HTML Files | 3 |
| CSS Files | 5 |
| JavaScript Files | 24 |
| Data Files | 4 |
| UML Diagrams | 18 |
| Documentation | 50+ |
| **รวม** | **100+** |

---

## 3. รายการ Configuration Items

### 3.1 HTML Files (3 files)

| CI-ID | ชื่อไฟล์ | Path | คำอธิบาย | Version |
|-------|---------|------|----------|:-------:|
| CI-HTML-01 | index.html | /index.html | Landing Page (Entry Point) | v0.9.5 |
| CI-HTML-02 | app.html | /app.html | Training Application (Main) | v1.1.0 |
| CI-HTML-03 | data_collector.html | /data_collector.html | Data Collection Tool | v0.6 |

---

### 3.2 CSS Files (5 files)

| CI-ID | ชื่อไฟล์ | Path | คำอธิบาย | Version |
|-------|---------|------|----------|:-------:|
| CI-CSS-01 | base.css | /css/base.css | Shared Styles (Variables, Reset) | v0.9.3 |
| CI-CSS-02 | styles.css | /css/styles.css | App Styles | v1.0.0 |
| CI-CSS-03 | landing.css | /css/landing.css | Landing Page Styles | v0.9.3 |
| CI-CSS-04 | chatbot.css | /css/chatbot.css | AI Chatbot Popup Styles | v0.8 |
| CI-CSS-05 | feedback.css | /css/feedback.css | Feedback Display Styles | v0.7 |

---

### 3.3 JavaScript Files (22 files)

#### Core Modules

| CI-ID | ชื่อไฟล์ | Path | คำอธิบาย | Version |
|-------|---------|------|----------|:-------:|
| CI-JS-01 | heuristics_engine.js | /js/core/heuristics_engine.js | 9 Rules Engine | v3.3 |
| CI-JS-02 | calibration_manager.js | /js/core/calibration_manager.js | T-Pose Calibration | v0.7 |
| CI-JS-03 | scoring_manager.js | /js/core/scoring_manager.js | Simple Ratio Scoring | v3.0 |

#### Display Modules

| CI-ID | ชื่อไฟล์ | Path | คำอธิบาย | Version |
|-------|---------|------|----------|:-------:|
| CI-JS-04 | drawing_manager.js | /js/display/drawing_manager.js | Canvas Drawing | v0.6 |
| CI-JS-05 | ghost_manager.js | /js/display/ghost_manager.js | Ghost Overlay | v0.2 |
| CI-JS-06 | background_manager.js | /js/display/background_manager.js | **[New]** Virtual Backgrounds | v1.0 |
| CI-JS-07 | silk-animation.js | /js/display/silk-animation.js | Landing Page Animation | v0.9.1 |
| CI-JS-23 | webgl_manager.js | /js/display/webgl_manager.js | **[New]** WebGL Rendering Engine | v1.0 |

#### UI Modules

| CI-ID | ชื่อไฟล์ | Path | คำอธิบาย | Version |
|-------|---------|------|----------|:-------:|
| CI-JS-08 | ui_manager.js | /js/ui/ui_manager.js | UI State Management | v1.0 |
| CI-JS-09 | feedback_manager.js | /js/ui/feedback_manager.js | Feedback Display | v0.5 |
| CI-JS-10 | tutorial_manager.js | /js/ui/tutorial_manager.js | Tutorial Popup | v0.8 |
| CI-JS-11 | score_popup_manager.js | /js/ui/score_popup_manager.js | Score Summary Popup | v0.6 |
| CI-JS-12 | rules_config_manager.js | /js/ui/rules_config_manager.js | Rules Configuration UI | v0.7 |
| CI-JS-13 | gesture_manager.js | /js/ui/gesture_manager.js | Hand Gesture Control | v0.8 |
| CI-JS-14 | audio_manager.js | /js/ui/audio_manager.js | TTS Audio Feedback | v0.6 |
| CI-JS-15 | chatbot.js | /js/ui/chatbot.js | Gemini AI Chatbot | v0.8 |
| CI-JS-24 | wisdom_manager.js | /js/ui/wisdom_manager.js | **[New]** Wisdom Quotes & Animation | v1.0 |

#### Controllers

| CI-ID | ชื่อไฟล์ | Path | คำอธิบาย | Version |
|-------|---------|------|----------|:-------:|
| CI-JS-16 | script.js | /js/controllers/script.js | Main Controller | v1.1.0 |
| CI-JS-17 | keyboard_controller.js | /js/controllers/keyboard_controller.js | Keyboard Shortcuts | v1.0 |
| CI-JS-18 | display_controller.js | /js/controllers/display_controller.js | Display Options | v1.0 |

#### Utilities

| CI-ID | ชื่อไฟล์ | Path | คำอธิบาย | Version |
|-------|---------|------|----------|:-------:|
| CI-JS-19 | path_generator.js | /js/utils/path_generator.js | Dynamic Path Generation | v0.6 |
| CI-JS-20 | translations.js | /js/utils/translations.js | i18n (TH/EN) | v0.9 |
| CI-JS-21 | data_exporter.js | /js/utils/data_exporter.js | JSON/CSV Export | v0.5 |
| CI-JS-22 | session_manager.js | /js/utils/session_manager.js | Session/User ID | v0.6 |

---

### 3.4 Data Files (4 files)

| CI-ID | ชื่อไฟล์ | Path | คำอธิบาย | Version |
|-------|---------|------|----------|:-------:|
| CI-DATA-01 | rh_cw_L1.json | /data/rh_cw_L1.json | Reference Landmarks L1 | v1.0 |
| CI-DATA-02 | rh_cw_L2.json | /data/rh_cw_L2.json | Reference Landmarks L2 | v1.0 |
| CI-DATA-03 | rh_cw_L3.json | /data/rh_cw_L3.json | Reference Landmarks L3 | v1.0 |
| CI-DATA-04 | rh_cw_L1.webm | /data/rh_cw_L1.webm | Reference Video L1 | v1.0 |

---

### 3.5 UML Diagrams (18 files)

| CI-ID | ชื่อไฟล์ | ประเภท | คำอธิบาย |
|-------|---------|--------|----------|
| CI-UML-01 | UseCaseDiagram.wsd | Use Case | 6 Use Cases |
| CI-UML-02 | ClassDiagram.wsd | Class | 14 Classes, 20 Relationships |
| CI-UML-03 | ActivityDiagram_UC01.wsd | Activity | Calibration Flow |
| CI-UML-04 | ActivityDiagram_UC02.wsd | Activity | Training Flow |
| CI-UML-05 | ActivityDiagram_UC03.wsd | Activity | View Results Flow |
| CI-UML-06 | ActivityDiagram_UC04.wsd | Activity | Tutorial Flow |
| CI-UML-07 | ActivityDiagram_UC05.wsd | Activity | Settings Flow |
| CI-UML-08 | ActivityDiagram_UC06.wsd | Activity | Data Collection Flow |
| CI-UML-09 | ActivityDiagram_Heuristics.wsd | Activity | 9 Rules Analysis |
| CI-UML-10 | SequenceDiagram_TrainingFlow.wsd | Sequence | Training Sequence |
| CI-UML-11 | SequenceDiagram_RealtimeAnalysis.wsd | Sequence | Real-time Analysis |
| CI-UML-12 | SequenceDiagram_Calibration.wsd | Sequence | Calibration Sequence |
| CI-UML-13 | StateDiagram_TrainingSession.wsd | State | Training States |
| CI-UML-14 | ModuleDependencies.wsd | Component | 22 Modules |
| CI-UML-15 | LayerArchitecture.wsd | Architecture | 4 Layers |
| CI-UML-16 | SystemArchitecture.wsd | Architecture | System Overview |
| CI-UML-17 | DataFlowDiagram.wsd | Data Flow | Data Flow |
| CI-UML-18 | SequenceDiagram_EnhancedDisplay.wsd | Sequence | **[New]** Display Mode Logic |

---

### 3.6 Documentation Files

| CI-ID | ชื่อไฟล์ | Path | คำอธิบาย |
|-------|---------|------|----------|
| CI-DOC-01 | SRS.md | /docs/srs/SRS.md | Software Requirements |
| CI-DOC-02 | SDD.md | /docs/sdd/SDD.md | Software Design |
| CI-DOC-03 | CHANGELOG.md | /docs/CHANGELOG.md | Version History |
| CI-DOC-04 | ARCHITECTURE.md | /docs/ARCHITECTURE.md | System Architecture |
| CI-DOC-05 | TESTING_CHECKLIST.md | /docs/TESTING_CHECKLIST.md | Manual Test Cases |
| CI-DOC-06 | HEURISTICS_RULES_MANUAL.md | /docs/HEURISTICS_RULES_MANUAL.md | 9 Rules Documentation |
| CI-DOC-07 | WEBGPU_FUTURE_PLAN.md | /docs/technical/WEBGPU_FUTURE_PLAN.md | **[New]** WebGL/WebGPU Roadmap |

---

## 4. Baseline Identification

| Baseline | Version | วันที่ | รายละเอียด |
|----------|:-------:|--------|------------|
| Initial | v0.1 | 2024-12-09 | Initial Release |
| Alpha | v0.5 | 2024-12-23 | Shape-Based Path Analysis |
| Beta | v0.8 | 2026-01-07 | Gesture Control + Chatbot |
| RC1 | v0.9.1 | 2026-01-09 | Landing Page + UML Complete |
| RC2 | v0.9.2 | 2026-01-10 | Thesis Docs + Terminology |
| Final | v1.1.2 | 2026-01-25 | Feature Complete (WebGL + Hybrid Popups) |

---

## 5. Version Control

- **Repository:** GitHub
- **Branching Strategy:** main (production), develop (development)
- **Commit Convention:** `[type]: description` (feat, fix, docs, refactor)

---

*เอกสารนี้เป็นส่วนหนึ่งของโครงการ TaijiFlow AI*
