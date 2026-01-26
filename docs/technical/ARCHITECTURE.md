# TaijiFlow AI - System Architecture

**Version:** 1.1.2
**Last Updated:** 2026-01-25

---

## 📋 สารบัญ

1. [File Structure](#1-file-structure)
2. [Technology Stack](#2-technology-stack)
3. [Design Patterns](#3-design-patterns)
4. [Module Dependencies](#4-module-dependencies)
5. [Layer Architecture](#5-layer-architecture)
6. [Error Handling](#6-error-handling)

---

## 1. File Structure

```text
TaijiFlow/
├── 📄 index.html                    # Landing Page (Entry Point)
├── 📄 app.html                      # Training Application (Main App)
├── 📄 data_collector.html           # เครื่องมือเก็บข้อมูล Reference
│
├── 📁 css/                          # Stylesheets
│   ├── base.css                     # Shared Styles
│   ├── styles.css                   # App Styles
│   ├── landing.css                  # Landing Page Styles
│   └── ...
│
├── 📁 js/                           # JavaScript Modules
│   │
│   │   # ═══════════════════════════════════════════════════════
│   │   # CORE MANAGERS (Business Logic)
│   │   # ═══════════════════════════════════════════════════════
│   ├── heuristics_engine.js         # วิเคราะห์ท่า 9 กฎ
│   ├── calibration_manager.js       # ปรับเทียบ T-Pose
│   ├── scoring_manager.js           # คำนวณคะแนน
│   ├── camera_manager.js            # [NEW] จัดการกล้อง & MediaPipe
│   ├── performance_monitor.js       # [NEW] ตรวจสอบ FPS & Quality
│   │
│   │   # ═══════════════════════════════════════════════════════
│   │   # DISPLAY MANAGERS (Visuals)
│   │   # ═══════════════════════════════════════════════════════
│   ├── drawing_manager.js           # วาด Skeleton, Path, Grid
│   ├── ghost_manager.js             # เงาครูผู้สอน
│   ├── background_manager.js        # จัดการพื้นหลัง/Segmentation
│   ├── webgl_manager.js             # [NEW] WebGL Rendering Engine (Blur/Mattes)
│   │
│   │   # ═══════════════════════════════════════════════════════
│   │   # UI MANAGERS (Interaction)
│   │   # ═══════════════════════════════════════════════════════
│   ├── ui_manager.js                # Theme, Language, Notifications
│   ├── lighting_manager.js          # [NEW] Auto-Brightness & Low Light
│   ├── debug_manager.js             # [NEW] Debug Overlay & Stats
│   ├── shortcuts_manager.js         # [NEW] Keyboard Shortcuts Grid
│   ├── wisdom_manager.js            # Wisdom Quotes & Animation
│   ├── audio_manager.js             # Text-to-Speech
│   ├── score_popup_manager.js       # ผลคะแนน Popup
│   ├── tutorial_manager.js          # Tutorial Popup
│   ├── gesture_manager.js           # ควบคุมด้วยมือ 👍✊
│   ├── feedback_manager.js          # Bug Report
│   ├── chatbot.js                   # Gemini AI Chatbot
│   ├── rules_config_manager.js      # Settings UI
│   │
│   │   # ═══════════════════════════════════════════════════════
│   │   # CONTROLLERS
│   │   # ═══════════════════════════════════════════════════════
│   ├── display_controller.js        # Display Options & Visual Effects
│   ├── keyboard_controller.js       # Keyboard Shortcuts Handler
│   │
│   │   # ═══════════════════════════════════════════════════════
│   │   # UTILITIES (Stateless Helpers)
│   │   # ═══════════════════════════════════════════════════════
│   ├── data_exporter.js             # Export JSON/CSV
│   ├── path_generator.js            # Dynamic Path
│   ├── session_manager.js           # User/Session ID
│   ├── i18n_manager.js              # [NEW] Shared i18n logic
│   ├── time_utils.js                # [NEW] Time formatting & Countdown
│   ├── math_utils.js                # [NEW] Geometry calculations
│   ├── translations.js              # i18n Data
│   │
│   │   # ═══════════════════════════════════════════════════════
│   │   # MAIN CONTROLLER
│   │   # ═══════════════════════════════════════════════════════
│   └── script.js                    # Main Orchestrator
```

### File Statistics

| Category | Files | Notes |
| -------- | :---: | :---: |
| Core Managers | 5 | Logic heavy |
| Display Managers | 4 | Visuals & WebGL |
| UI Managers | 12 | Interaction |
| Controllers | 2 | Input Handling |
| Utilities | 7 | Pure functions |
| Main Controller | 1 | Glue code |
| **Total JS** | **31** | **Modular Architecture** |

---

## 2. Technology Stack

### Frontend

| Technology | Purpose |
| ---------- | ------- |
| **HTML5/CSS3** | Structure & Styling |
| **JavaScript (ES6+)** | Core Logic |
| **TailwindCSS** | Utility CSS Framework |
| **WebGL 2.0** | High-performance Visual Effects (Blur) |

### AI / Machine Learning

| Technology | Purpose |
| ---------- | ------- |
| **MediaPipe Pose** | Pose Detection (33 landmarks) |
| **MediaPipe Gesture** | Hand Gesture Recognition (👍✊) |
| **MediaPipe Segmentation** | Selfie Segmentation (Background Blur) |
| **Gemini API** | AI Chatbot (อาจารย์เต๋า) |

---

## 3. Design Patterns

| Pattern | Where Used |
| ------- | ---------- |
| **Module Pattern** | All Managers |
| **Singleton** | `uiManager`, `ghostManager` |
| **Observer** | Event Listeners |
| **Facade** | `script.js` |
| **Strategy** | `HeuristicsEngine` rules |
| **State** | `PerformanceMonitor` modes |

---

## 4. Module Dependencies

### Dependency Table


#### Core Managers


| Module | Responsibilities |
| ------ | ---------------- |
| `heuristics_engine.js` | Analyzes pose against 9 Taiji rules |
| `calibration_manager.js` | Handles T-Pose calibration |
| `scoring_manager.js` | Calculates session score and grade |
| `camera_manager.js` | Manages Webcam & MediaPipe loop |
| `performance_monitor.js` | Monitors FPS, handles quality downgrades |


#### Display Managers


| Module | Responsibilities |
| ------ | ---------------- |
| `drawing_manager.js` | Canvas 2D rendering (Skeleton, Path) |
| `ghost_manager.js` | Instructor overlay playback |
| `background_manager.js` | Virtual background logic |
| `webgl_manager.js` | Hardware-accelerated blur/rendering |


#### UI Managers


| Module | Responsibilities |
| ------ | ---------------- |
| `ui_manager.js` | General UI state, Theme, Language |
| `lighting_manager.js` | Checks lighting conditions |
| `debug_manager.js` | Renders technical stats overlay |
| `shortcuts_manager.js` | Renders keyboard shortcuts grid |
| `wisdom_manager.js` | Quotes animation |
| `audio_manager.js` | Text-to-Speech feedback |
| `tutorial_manager.js` | Help/Onboarding popup |
| `gesture_manager.js` | Hand gesture controls |
| `feedback_manager.js` | User feedback form |
| `chatbot.js` | AI Assistant |


#### Utilities


| Module | Responsibilities |
| ------ | ---------------- |
| `i18n_manager.js` | Shared translation logic |
| `time_utils.js` | Countdown & time formatting |
| `math_utils.js` | Geometric calculations |
| `session_manager.js` | User & Session ID management |
| `data_exporter.js` | Export training data |
| `path_generator.js` | Create reference paths |

---

## 5. Layer Architecture

![Layer Architecture Diagram](../../out/docs/diagrams/LayerArchitecture/LayerArchitecture.svg)

```text
┌────────────────────────────────────────────────────────────────┐
│                    🖥️ PRESENTATION LAYER                       │
│  index.html │ ui_manager.js │ drawing_manager.js │ tutorial... │
├────────────────────────────────────────────────────────────────┤
│                    ⚙️ BUSINESS LOGIC LAYER                      │
│  script.js │ heuristics_engine.js │ calibration │ scoring     │
├────────────────────────────────────────────────────────────────┤
│                    💾 DATA LAYER                                │
│  session_manager.js │ data_exporter.js │ LocalStorage          │
├────────────────────────────────────────────────────────────────┤
│                    🌐 EXTERNAL APIs                             │
│  MediaPipe Pose │ MediaPipe Gesture │ Web Speech │ Gemini      │
└────────────────────────────────────────────────────────────────┘
```

| Layer | หน้าที่ | ไฟล์หลัก |
| ----- | ---- | ------ |
| **Presentation** | แสดงผล UI, รับ input, วาด Canvas | `index.html`, `ui_manager.js`, `drawing_manager.js` |
| **Business Logic** | ประมวลผลหลัก, วิเคราะห์ท่า, คำนวณคะแนน | `script.js`, `heuristics_engine.js`, `scoring_manager.js` |
| **Data** | จัดการข้อมูล, Session, Export | `session_manager.js`, `data_exporter.js` |
| **External** | APIs ภายนอก | MediaPipe, Web Speech, Gemini |

> **💡 หลักการ:** แต่ละ Layer สื่อสารกับ Layer ที่อยู่ติดกันเท่านั้น

---

## 6. Error Handling

### Camera Errors

ระบบจัดการ Camera Error ได้ครบถ้วน โดยจำแนก 4 ประเภท:

| Error Type | สาเหตุ | ข้อความ TH | ข้อความ EN |
| ---------- | ------ | ---------- | ---------- |
| `not_allowed` | ไม่ได้รับอนุญาต | ไม่ได้รับอนุญาตใช้กล้อง | Camera access denied |
| `not_found` | ไม่พบกล้อง | ไม่พบกล้อง | No camera found |
| `not_readable` | กล้องถูกใช้งาน | กล้องถูกใช้งานโดยโปรแกรมอื่น | Camera in use |
| `unknown` | ไม่ทราบสาเหตุ | เกิดข้อผิดพลาด | Camera error |

**การแสดงผล:**

1. ซ่อน Loading Overlay
2. แสดง Toast Notification (สีแดง, 10 วินาที)
3. อัปเดตหัวข้อบน Start Overlay
4. บันทึกลง Console

**อ้างอิง:** `script.js` → `showCameraError()`, `initCamera()`

### Reference Data Errors

| Error Type | สาเหตุ | การจัดการ |
| ---------- | ------ | --------- |
| JSON Not Found | ไม่พบไฟล์ Reference | แจ้งเตือน + หยุดทำงาน |
| Video Load Error | วิดีโอครูโหลดไม่ได้ | ซ่อน Instructor thumbnail |

---

## Document Status

*Document updated: 2026-01-25 (v1.1.2)*
