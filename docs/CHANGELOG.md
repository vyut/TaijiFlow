# TaijiFlow AI - Changelog

รายการการเปลี่ยนแปลงทั้งหมดของโปรเจค

---

## [v0.9] - 2026-01-08

### 🎨 Landing Page Refactoring

#### Added
- **New Landing Page** (`index.html`) - Entry Point หลักของระบบ
  - Hero Section: TaijiFlow AI branding + Silk Reeling animation
  - About Section: ที่มาโครงการ, เทคโนโลยี, จุดเด่น, กิตติกรรมประกาศ
  - Guide Section: 3 ขั้นตอนการใช้งาน (เลือกท่าฝึก → เลือกระดับ → กดเริ่มฝึก)
  - Reference Section: วิดีโอ, หลักการ, 8 กฎ
  - Footer: Copyright + Credits

#### Changed
- **File Structure Refactoring**:
  - `index.html` → `app.html` (Training Application)
  - `landing.html` → `index.html` (Landing Page - Entry Point)
- **Navigation**: หน้าแรก | เกี่ยวกับ | คู่มือ | อ้างอิง | ▶️ เริ่มฝึก
- **Branding**: 
  - Logo: ☯️ TaijiFlow AI
  - Badge: "🤖 ผู้ช่วยฝึกท่าม้วนไหม มวยไท้เก๊ก สกุลเฉิน"

### 📐 UML Diagrams (สำหรับ Final Report ป.โท)

#### Added - Sequence Diagrams (3 ไฟล์)
- **SequenceDiagram_TrainingFlow.wsd** - Training Flow หลัก
  - 6 participants: User, UI, Training, Calibrator, Heuristics, Scorer
  - ครอบคลุม: เลือกท่า → Calibration → Countdown → Training → Summary
- **SequenceDiagram_RealtimeAnalysis.wsd** - Real-time Pose Analysis
  - แสดงการทำงานทุก 3 frames (~10 FPS)
  - วิเคราะห์ 8 กฎไทเก๊ก: Path, Rotation, Elbow, Waist, Stability, Smooth, Continuity, Weight
  - Rendering order: Silhouette → Ghost → Instructor → Path → Skeleton → Trail
- **SequenceDiagram_Calibration.wsd** - Calibration Process
  - 5 phases: Start → Visibility Check → T-Pose Check → Countdown → Calculate

#### Added - State Diagram (1 ไฟล์)
- **StateDiagram_TrainingSession.wsd** - Training Session States
  - 5 states: Idle → Calibrating → Countdown → Training → Ended
  - State variables: isTrainingMode, isRecording, calibrator.isActive

#### Added - Component/Module Diagram (1 ไฟล์)
- **ModuleDependencies.wsd** - Module Dependencies Diagram
  - 21 modules organized in 5 layers
  - Top-Down layout with orthogonal lines
  - Categories: Core, Display, UI, Controllers, Utilities

#### Added - Architecture Diagram (1 ไฟล์)
- **LayerArchitecture.wsd** - Layer Architecture Diagram
  - 4 layers: Presentation → Business Logic → Data → External APIs

### 📚 Documentation

#### Added
- **MODULE_DEPENDENCIES.md** - Module Dependencies เอกสาร
  - ASCII Diagram แสดง 21 modules
  - Dependency Table แบ่งตามหมวด (6 categories)
  - Load Order ตาม index.html
  - External Dependencies (MediaPipe, Gemini, etc.)

#### Updated
- **ARCHITECTURE.md** - Full Update
  - File Structure: 21 JS files, 3 CSS files
  - Technology Stack: Frontend, AI/ML, Browser APIs, Dev Tools
  - Design Patterns: 7 patterns (Module, Singleton, Observer, Facade, Factory, Strategy, Controller)
  - Module Dependencies: ASCII diagram + tables
  - Layer Architecture: 4 layers diagram
- **ClassDiagram.wsd** - RulesConfigManager ย้ายจาก Core ไป UI & Feedback

#### Fixed
- **ARCHITECTURE.md** - แก้ไข MD060 linting errors (table column style)
- **ModuleDependencies.wsd** - RulesConfigManager อยู่ใน UI Managers (ตรงกับ ClassDiagram)

### 📊 Summary: UML Diagrams ทั้งหมด (15 ไฟล์)

| ประเภท | จำนวน | ไฟล์ |
|--------|:-----:|------|
| Use Case | 1 | UseCaseDiagram.wsd |
| Class | 1 | ClassDiagram.wsd |
| Activity | 8 | ActivityDiagram_UC01-06.wsd, ActivityDiagram_Heuristics.wsd |
| Sequence | 3 | TrainingFlow, RealtimeAnalysis, Calibration |
| State | 1 | StateDiagram_TrainingSession.wsd |
| Component | 1 | ModuleDependencies.wsd |
| Architecture | 1 | LayerArchitecture.wsd |

---

## [v0.8] - 2026-01-07

### 📐 UML Diagrams Update (สำหรับ Final Report ป.โท)

#### Added
- **ClassDiagram.wsd** - Class Diagram ใหม่ 14 classes, 20 relationships
  - แสดงโครงสร้าง MVC-like (Controller: script.js, Model: HeuristicsEngine, View: UIManager)
  - ครอบคลุมทุก Manager และ Utility modules

#### Changed
- **ActivityDiagram_UC02.wsd** - เพิ่ม Low Light Check, Ghost/Silhouette, รวม activities ให้กระชับ
- **ActivityDiagram_UC05.wsd** - เพิ่ม Display Options (7 toggles) และ Rules Config (8 rules)
  - เพิ่ม Note "Development Mode Only" สำหรับ features ที่ซ่อนใน Production
- **ActivityDiagram_UC06.wsd** - เพิ่มรายละเอียดจาก data_collector.html (Countdown, Frame Optimization, Silhouette Recording)

### 🖐️ Gesture Hint UI

#### Added
- **Gesture Hint Section** (index.html) - แสดงใน Start Overlay
  - 👍 ยกนิ้วโป้ง = เริ่มการฝึก
  - ✊ กำมือ = หยุดการฝึก
- **translations.js** - เพิ่ม `gesture_start_hint`, `gesture_stop_hint` (TH/EN)
- **ui_manager.js** - เพิ่ม setText() สำหรับ gesture hints

### 🚀 Quick Start (Default Selection)

#### Changed
- **index.html** - Dropdown เลือกค่า Default อัตโนมัติ
  - Exercise: `1. มือขวา - ตามเข็ม` (rh_cw)
  - Level: `1. แบบนั่ง` (L1)
- **script.js** - ตั้งค่าเริ่มต้นใน state variables และ resetToHomeScreen()

### 🔧 Code Refactoring

#### Added
- **keyboard_controller.js** (254 lines) - แยก Keyboard Shortcuts ออกจาก script.js
  - ใช้ Dependency Injection pattern เพื่อความปลอดภัย
  - รองรับ 14 keyboard shortcuts (F, D, Space, M, L, T, G, I, P, B, S, R, ?, /, Escape)
- **display_controller.js** (254 lines) - แยก Display Options ออกจาก script.js
  - จัดการ 6 display toggles (Ghost, Instructor, Path, Skeleton, Silhouette, Trail)
  - รวม resetToDefaults() และ addTrailPoint() methods

#### Changed
- **script.js** - ลดจาก 1,913 → 1,643 บรรทัด (-14%)
- **index.html** - เพิ่ม script tags สำหรับ controllers

---

## [v0.7] - 2026-01-04

### ⚠️ Low Light Warning

#### Added
- **Low Light Detection** - ตรวจสอบแสงใน 2 จุด:
  1. **Calibration (Block)** - ถ้าแสงไม่พอจะยกเลิก calibration และบังคับให้แก้ไขก่อน
  2. **Training (Warn)** - ถ้าแสงเปลี่ยนระหว่างฝึก จะเตือนด้วย notification + เสียง
- ตรวจจาก avgVisibility ของ landmarks สำคัญ (ไหล่, ศอก, ข้อมือ, สะโพก)
- Threshold: avgVisibility < 0.5
- Training cooldown: 30 วินาที (ลดการรบกวน)

#### Changed
- **script.js** - เพิ่ม Low Light check ใน Calibration block และ Training loop
- **translations.js** - เพิ่ม `alert_low_light` และ `alert_low_light_calibration` (TH/EN)

### 🎨 UX Enhancements

#### Added
- **Tooltips (Consistency)** - เพิ่ม tooltip ให้ครบทุก element:
  - Category, Exercise, Level dropdowns
  - Language, Theme buttons
- **Interactive Highlight** - กรอบสีม่วงบน dropdown ที่ยังไม่เลือก:
  - Exercise dropdown: highlight ตอนเปิดเว็บครั้งแรก
  - Level dropdown: highlight หลังเลือกท่าแล้ว
  - หายไปเมื่อเลือกครบ

#### Changed
- **styles.css** - เพิ่ม `.highlight-required` class
- **script.js** - เพิ่ม highlight logic ใน `checkSelectionComplete()`
- **index.html** - เพิ่ม `title` attributes บน dropdowns และ buttons

### 📄 Documentation

#### Added
- **ActivityDiagram_Heuristics.wsd** - Diagram ใหม่อธิบาย 8 กฎของ Heuristics Engine โดยละเอียด
- **TESTING_CHECKLIST.md** - เพิ่ม 9 test cases ใหม่ (Low Light + UX)

#### Changed
- **ActivityDiagram_UC02.wsd** - แก้ไข Countdown partition ให้ตรงกับ code, เพิ่ม reference ไปยัง Heuristics diagram

---

## [v0.6] - 2024-12-24

### 🔧 Code Refactoring

#### Added
- **path_generator.js** (85 lines) - แยก `generateDynamicPath()` ออกจาก script.js
- **session_manager.js** (115 lines) - แยก session/user ID functions
  - `getOrCreateUserId()`
  - `generateSessionId()`
  - `getPlatformInfo()`
  - `isMobileDevice()`

#### Changed
- **script.js** - ลดจาก 1,840 → 1,723 lines (-6%)
- **index.html** - อัปเดต version เป็น v0.6, เพิ่ม script tags ใหม่
- **ghost_manager.js** - อัปเดต version เป็น v0.2

---

### 📚 Code Documentation

#### Added
- **docs/SYSTEM_OVERVIEW.md** - ภาพรวมสถาปัตยกรรม, Data Flow, Dependencies
- **docs/code/** folder - รวมเอกสารโค้ดทั้งหมด
  - `README.md` - Index ของเอกสารโค้ด
  - `SCRIPT_JS.md` - Main Controller (66 functions)
  - `HEURISTICS_ENGINE.md` - 8 Rules + Methods
  - `CALIBRATION_MANAGER.md` - T-Pose + Metrics
  - `SCORING_MANAGER.md` - Simple Ratio + Grades
  - `AUDIO_MANAGER.md` - TTS System
  - `DRAWING_MANAGER.md` - Canvas Drawing
  - `UTILITY_FILES.md` - Path, Session, Ghost, UI

---

### 🎯 Level-Based Calibration

#### Changed
- **calibration_manager.js** - เพิ่ม level-based visibility requirements
  - L1-L2: ไม่ต้องเห็นข้อเท้า (upper body only)
  - L3: ต้องเห็นทั้งตัว (full body including ankles)
- เพิ่ม `setLevel()` method

---

### 📺 Display Menu Reorganization

#### Changed
- **index.html** - จัดเรียง Display Options เป็น 3 sections:
  - 📚 ต้นแบบ: Instructor, Ghost, Path
  - 👤 ผู้ฝึก: Skeleton, Silhouette
  - 🛠️ Developer: Debug
- **Path** - เปลี่ยน default เป็น ON

---

### 🎬 Instructor Thumbnail

#### Added
- **Instructor Thumbnail (มุมขวาบน)** - แสดงเงาครูฝึก (silhouette) ในรูปแบบ thumbnail
  - Responsive sizing (20% ของ container, min 150px, max 400px)
  - พื้นโปร่งใส (ใช้ CSS `mix-blend-mode: lighten`)
  - Keyboard shortcut: `I`
  - Default: ON

#### Changed
- **Ghost Overlay** - เปลี่ยน default เป็น OFF (ใช้ Instructor Thumbnail แทน)
- **Display Menu** - เพิ่มตัวเลือก `🎬 Instructor (I)` หลัง Ghost

---

### 🌐 Localized Feedback Messages

#### Changed
- **Feedback Messages** - แยกภาษา TH/EN ตามการตั้งค่า
  - TH: `⚠️ ศอกลอย`
  - EN: `⚠️ Elbow too high`
- **Audio Mappings** - อัปเดตให้รองรับทั้ง Thai และ English keys
- เพิ่ม `setLang()` และ `getMessage()` methods ใน HeuristicsEngine

---

### 📊 Simple Ratio Scoring (v3.0)

#### Changed
- **Scoring Algorithm** - เปลี่ยนจาก Weighted Penalty เป็น Simple Ratio
  - สูตรใหม่: `Score = (CorrectFrames / TotalFrames) × 100`
  - ตัวอย่าง: 81 ถูก / 113 ทั้งหมด = 71.7%
- **Duration Display** - แก้ไข bug และเปลี่ยน format
  - แก้ไข: `startTime` ไม่ถูก set (แสดง 0:00)
  - Format: `mm:ss` (เช่น `0:25`, `1:30`)
  - ลบ frames count ออก

---

## [v0.5] - 2024-12-23

### 🔄 Rule 1: Shape-Based Path Analysis

#### Changed
- **Path Accuracy → Path Shape** - เปลี่ยน implementation จาก Position-Based เป็น Shape-Based
  - เดิม: วัดระยะห่างระหว่างข้อมือกับ Ghost/Reference Path
  - ใหม่: วิเคราะห์ว่าเส้นทางเป็นวงโค้ง + ตรวจทิศทางหมุน
  - **เหตุผล:** สอดคล้องกับหลักท่าม้วนไหมที่อนุญาตให้ขนาดวงกลมและความเร็วต่างกันได้

- **Direction Detection** - เพิ่มการตรวจทิศทางหมุน (CW/CCW)
  - ใช้ Cross Product วิเคราะห์ทิศทาง
  - รองรับ Video Mirror (สลับทิศเพราะกล้อง mirror)

#### Added
- `checkPathShape()` - method ใหม่สำหรับ Shape-Based Analysis
- `SHAPE_CONSISTENCY_THRESHOLD` - config ใหม่ (default: 0.6)
- `SHAPE_ANALYSIS_FRAMES` - config ใหม่ (default: 30)
- Audio feedback: "เคลื่อนไหวมือให้เป็นวงโค้ง" และ "หมุนมือผิดทิศทาง"

#### Fixed
- **wristHistory population** - ย้ายมาไว้ใน `analyze()` ก่อนเรียก rules
  - แก้ปัญหา wristHistory ว่างเมื่อ checkSmooth ปิด
- **Feedback hold time** - ลดจาก 1.5s เป็น 1.0s

### 🎨 Display Options

#### Changed
- **Skeleton เปิดเป็น Default** - เนื่องจากไม่จำเป็นต้องดู Ghost อย่างเดียวแล้ว

### 📱 Tablet/Mobile Fixes

#### Added
- `isMobileDevice()` - ตรวจจับ tablet/mobile (รวม iPad)
- Skip data export บน mobile เพื่อลด memory spike

#### Fixed
- **Ghost ไม่หยุดเล่นหลังจบ session** - เพิ่ม `ghostManager.stop()`
- **Display/Rules settings ไม่ reset** - เพิ่ม reset ใน `resetToHomeScreen()`

### 📚 Documentation

#### Updated
- **HEURISTICS_RULES_MANUAL.md** - อัปเดต Rule 1 เป็น Shape-Based พร้อม algorithm และ code

---

## [v0.4] - 2024-12-17

### 🖥️ Fullscreen Mode Improvements

#### Changed
- **Fullscreen Target** - เปลี่ยนจาก `canvas` เป็น `.canvas-container`
  - Timer และปุ่ม Overlay แสดงใน Fullscreen ได้แล้ว
  - Gesture popup แสดงใน Fullscreen ได้แล้ว
  
- **Auto Fullscreen** - เข้า Fullscreen อัตโนมัติหลังกด Start Training
  - เรียก `requestFullscreen()` ทันทีใน user gesture context
  - Silent fail ถ้า browser block
  - ออก Fullscreen อัตโนมัติเมื่อจบ Training

- **Mirror Logic** - ลบ duplicate mirror ใน JS
  - CSS `scaleX(-1)` ทำ mirror ทั้งหมดแล้ว
  - ลบ `isFullscreen` check จาก `drawing_manager.js` และ `script.js`

#### Added
- **Stop Button (🛑)** - ปุ่มหยุดการฝึกบน Video Overlay (มุมซ้ายล่าง)
- **Fullscreen Toggle Text** - เปลี่ยนข้อความ "เต็มจอ" ↔ "จอปกติ" ตามสถานะ

### 🌐 Translation & i18n

#### Added
- `fullscreen_overlay` - ข้อความปุ่มเต็มจอบน Overlay
- `fullscreen_exit` - ข้อความปุ่มจอปกติ
- `stop_btn` - ข้อความปุ่มหยุด

#### Changed
- `overlay_note` - เปลี่ยนเป็น "กด 🛑 เพื่อหยุดก่อนเวลา"
- ตัด "ไม่บันทึกวิดีโอ" และ "ปรับเทียบอัตโนมัติ" ออก

#### Fixed
- **Language Sync** - Sync ธง/Audio/Calibrator กับภาษาจาก localStorage ตอนโหลดหน้า

### 📝 Calibration Text

#### Changed
- `tpose` - "กรุณายืนกางแขน (T-Pose)"
- `cancel` - "ถอยหลังให้เห็นเต็มตัว" (เดิม "กดปุ่มยกเลิก")

### 📱 PWA Support (Add to Home Screen)

#### Added
- **Standalone Mode Detection** - ตรวจจับ PWA mode ด้วย `display-mode: standalone`
- **Timeout Fallback** - ถ้า fullscreen ไม่ตอบสนองใน 1 วินาที → ข้ามไป
- รองรับ iOS Safari PWA และ Opera ที่ไม่รองรับ Fullscreen API

### 🖐️ Gesture Control

#### Added
- **Cancel Calibration** - ใช้ท่ามือ ✊ Closed Fist ยกเลิก Calibration ได้
- ออกจาก Fullscreen และแสดง Overlay กลับมาอัตโนมัติ

### 🔧 Debug Overlay (กด D)

#### Added
- `fps` - Frames Per Second (NFR Performance)
- `frameCount` - จำนวน Frame ทั้งหมด
- `score` - คะแนน Real-time

### 🗂️ Category Dropdown

#### Added
- **Category Select** - dropdown ใหม่สำหรับเลือกประเภทท่า
- `cat_silk_single` - ท่าม้วนไหม - มือเดียว (default)
- `cat_silk_double` - ท่าม้วนไหม - สองมือ (disabled, สำหรับอนาคต)

### 📚 Documentation

#### Updated
- **CHANGELOG.md** - เพิ่ม v0.4 พร้อมรายละเอียดครบ
- **TRAINING_FLOW.md** - (ใหม่) Training Flow พร้อม Mermaid diagrams
- **index.html** - เพิ่ม File Header อธิบายโครงสร้าง
- **data_collector.html** - เพิ่ม File Header อธิบายการใช้งาน
- **App Modules** - เพิ่ม comments อธิบายแต่ละ module

---

## [v0.3] - 2024-12-11

### 🔧 Heuristics Engine v3.0

#### Fixed
- **Double Canvas Transform** - แก้ไขปัญหา skeleton/path กลับด้าน
  - `script.js`: ใช้ save/restore รอบ video drawing
  - `drawing_manager.js`: เพิ่ม `mirrorDisplay` flag

#### Added
- **Timestamps in wristHistory** - เก็บ `{x, y, t}` แทน `{x, y}`
  - ทำให้คำนวณ velocity/acceleration ได้ถูกต้องตามเวลาจริง
  
- **CONFIG Object** - รวม threshold ทั้งหมด 20+ ค่า
  - ทุกค่ามีหน่วยอธิบาย (normalized, deg/sec, frames)
  - มี min/max caps สำหรับ Path Accuracy

- **Debug Mode** - กด `D` เพื่อดูค่า real-time
  - แสดง pathDistance, wristVelocity, acceleration
  - กล่อง cyan มุมขวาบน

- **Documentation** - 3 ไฟล์ใหม่:
  - `docs/HEURISTICS_MANUAL.md`
  - `docs/CONFIGURATION_GUIDE.md`
  - `docs/CHANGELOG.md`

#### Changed
- **checkSmoothness()** - รับ timestamp parameter
- **checkVerticalStability()** - ใช้ CONFIG constants
- **checkContinuity()** - ใช้ CONFIG constants
- **checkWaistInitiation()** - ใช้ CONFIG constants

---

## [v0.2] - 2024-12-10

### 🎨 UI Redesign

#### Changed
- ย้าย dropdown exercise/level ขึ้นด้านบน
- Language toggle แสดงเฉพาะ flag icon
- Theme toggle เปลี่ยน icon (🌙/☀️)
- ลบ timer ซ้ำซ้อนที่ top bar
- ซ่อน instructions box (ชั่วคราว)

#### Fixed
- Calibration text กลับด้าน
- Light mode readability สำหรับ instructions box
- Translation สำหรับ level dropdown และ stop button

#### Added
- Escape key shortcut ยกเลิก calibration

---

## [v0.1] - 2024-12-09

### 🚀 Initial Release

#### Core Features
- MediaPipe Pose integration
- 8 Heuristic rules
- Calibration system
- Audio feedback (Web Speech API)
- Data export (JSON/CSV)
- Bilingual support (TH/EN)
- Dark/Light mode
- Fullscreen mode

#### Exercise Support
- 4 exercises: rh_cw, rh_ccw, lh_cw, lh_ccw
- 3 levels: L1 (seated), L2 (standing), L3 (squat)

---

## Data Collector Optimization

### [2024-12-11]
- ลด frame rate: 30fps → 10fps
- ปัดทศนิยม: 15 → 3 ตำแหน่ง
- Minify JSON: ลบ whitespace
- **ผลลัพธ์:** ลดขนาดไฟล์ ~90%
