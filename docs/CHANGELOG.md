# TaijiFlow AI - Changelog

รายการการเปลี่ยนแปลงทั้งหมดของโปรเจค

---

## [v0.9.11] - 2026-01-19

### 🔧 Heuristics Rules Debugging & Tuning

#### Fixed
- **Rule 4: Waist Initiation** - ปรับ threshold ให้ sensitive ขึ้น
  - `MIN_HIP_VELOCITY_DEG_SEC`: 2.0 → **1.0** °/s
  - `SHOULDER_HIP_RATIO`: 3.0 → **2.0**
- **Rule 5: Vertical Stability** - เปลี่ยนเป็น Time-Based
  - `STABILITY_WINDOW_MS`: 2000 (frames) → **5000** ms
  - เพิ่ม `STABILITY_MIN_POINTS: 3` สำหรับ skip frame
- **Rule 6: Smoothness** - ลด false positives
  - `SMOOTHNESS_CALIBRATION_RATIO`: 0.08 → **0.5** (threshold ~0.09)
- **Rule 8: Weight Shift** - ปรับ Safe Zone ให้แคบลง
  - `WEIGHT_BUFFER_RATIO`: 0.1 → **0.3** (sensitive ขึ้น)

#### Changed
- **Rules Settings UI** - จัดกลุ่มกฎตาม Level
  - เพิ่ม 3 subtitles สี: L1 (เขียว), L2 (น้ำเงิน), L3 (ม่วง)
  - เรียงลำดับใหม่: 1,3,7 → 2,4,6 → 5,8
  - ลบ L2+/L3 badges เดิม
- **Reset to Defaults** - แก้ไขให้ reset checkboxes ถูกต้อง
  - ใช้ level จาก UI dropdown แทน `engine.currentLevel`
  - Clear `userOverrides` เมื่อ reset

#### Added
- **Rules Settings User Guide** (`docs/guides/RULES_SETTINGS_GUIDE.md`)
  - คู่มือภาษาไทยอธิบาย 8 กฎ + วิธีปรับค่า
- **Thesis Documentation**
  - Chapter 4: Expanded RulesConfigManager section (4.2.5.8)
  - Chapter 5: Added Rules Settings UI section (5.4.4)

#### Updated Docs
- `docs/heuristics/CONFIGURATION_GUIDE.md` - Updated CONFIG values
- `docs/CHANGELOG.md` - v0.9.11 changelog

---

## [v0.9.9] - 2026-01-17

### 🌐 Multi-Language Support & Privacy Enhancements

#### Added
- **English Language Support** (`translations.js`) - เพิ่มภาษาอังกฤษครบทุก UI elements
  - Privacy Modal, Warning Modal, Mobile Warning
  - Tutorial (How To Tab) Tips & Warnings
  - All buttons, dropdowns, notifications

- **Combined Privacy + Warning Modal** (`app.html`) - รวม 2 popups เป็น 1
  - 🔒 Privacy Section: 3 items (Local processing, No external data, Gemini API)
  - ⚠️ Warning Section: 3 items (Limitation, Health, Disclaimer)
  - Visual separation with divider and color coding

- **Mobile Warning Modal** (`app.html`, `ui_manager.js`) - ป้องกันการใช้งานบนมือถือ
  - Detection: User Agent + Screen Width < 768px
  - Excludes Tablets (iPad, Android Tablet allowed)
  - Options: "← Back to Home" or "Continue Anyway →"
  - Full TH/EN support

- **Responsive Hamburger Navbar** (`index.html`, `landing.css`) - เมนูสำหรับ Mobile
  - Logo clickable → scroll to #hero (removed "หน้าแรก" menu item)
  - "Start Now" button always visible on mobile
  - Hamburger menu (☰ ↔ ✕) with smooth animation
  - Auto-close when clicking links or outside

- **MediaPipe Model Prefetch** (`index.html`) - Preload AI จากหน้า Landing
  - 5 prefetch links for Pose model files (WASM, Data, Script)
  - Faster load time when entering app.html

- **Privacy-Gated Camera** (`script.js`) - เปิดกล้องหลังยินยอม
  - Camera starts ONLY after clicking "เข้าใจแล้ว"
  - AI Models preload during Privacy Modal (parallel loading)
  - Loading Overlay shows only after consent

- **2-Column Score Popup** (`score_popup_manager.js`) - Layout ใหม่สำหรับ iPad
  - Left Column: Grade, Score Ring, Stats, Coach Tip, Error List
  - Right Column: Feedback, QR Code, Survey Button, Thank You, Close
  - Responsive: stack on mobile (<640px), side-by-side on tablet/desktop

- **Motivational Quotes** (`translations.js`, `index.html`) - คำคมไท่จี๋ 15 ประโยค
  - Random quote on Score Popup footer (Chinese + TH/EN)
  - Random quote on Landing Page (before footer)
  - 15 quotes from Taoist/Taiji philosophy (上善若水, 以柔克剛, etc.)

#### Changed
- **Tutorial How To Tab** (`tutorial_manager.js`) - เพิ่ม Tips & Warnings sections
  - 📌 Tips: Device, Space, Wear requirements
  - ⚠️ Warnings: Limitation, Health, Disclaimer
  - Both sections support TH/EN

#### Files Modified
- `app.html` - Mobile Modal, Privacy+Warning Modal
- `index.html` - Prefetch links, Hamburger Navbar, Quote Section
- `js/script.js` - Privacy-gated camera, Loading overlay timing
- `js/ui_manager.js` - Mobile detection, Modal text updates
- `js/translations.js` - All new translation keys (TH/EN), 15 motivational quotes
- `js/tutorial_manager.js` - Tips & Warnings in How To tab
- `js/score_popup_manager.js` - 2-Column responsive layout, Quote footer
- `css/landing.css` - Hamburger menu styles, Quote section styles

---

## [v0.9.8] - 2026-01-14

### 🎨 UI & UX Refinement (Purple Theme & Feedback)

#### Added
- **Visual Effects: Background Blur** - New optional feature to blur the background for privacy.
  - Toggle: Display Options → 🎨 Visual Effects → Blur Background (B).
  - Implementation: Uses MediaPipe Segmentation Mask + Canvas blur filter.
  - Performance: Off by default. Shows warning if FPS drops below 18.
- **Low FPS Warning** (`script.js`) - Added `checkLowFpsPerformance()` to notify users when blur impacts performance.

#### Changed
- **Feedback Button Redesign** - Moved from bottom-right floating button into a **Right-Side Sticky Tab** (Vertical).
  - Shape: Rounded-left pill attached to the right edge.
  - Content: Star Icon + Vertical Text ("Feedback" / "ข้อเสนอแนะ").
  - Purpose: Reduces clutter in the chatbot area and improves visibility.
- **Score Popup Layout** - Redesigned for compactness.
  - Layout: "Grade" and "Score Ring" are now side-by-side.
  - Added new Title: "Training Result" / "สรุปผลการฝึก".
  - Refined gradients to match the unified Purple Theme.
- **Unified Purple Theme** - Standardized gradients (`from-purple-500 to-indigo-500`) across:
  - Main App Title & Quickstart Title.
  - Start Training Button.
  - 1-2-3 Step Overlays.
  - **Info Notifications** (Previously blue, now purple gradient).
- **Popup Controls** - Added "X" Close Button to both Score and Feedback popups for better usability.
- **Keyboard Shortcuts** (`keyboard_controller.js`):
  - `B` = Blur Background (New - Visual Effects).
  - `K` = Skeleton (Moved from B).
  - Updated `/` shortcuts help display.

#### Refactored
- **Centralized Translations** - Moved all Popup text strings (Score/Feedback) to `translations.js`.
  - Keys: `score_popup`, `feedback_popup`, `visual_effects_title`, `blur_background`.
  - Ensures 100% consistency between Thai and English.
- **Global UI State** (`script.js`) - Exposed `window.uiManager` to allow independent modules (like FeedbackManager) to access language state reliably.
  - Fixes bug where Feedback Popup always defaulted to Thai.
- **Notification Multi-Class Fix** (`ui_manager.js`) - Fixed `classList.add()` to support gradient classes with spaces.

## [v0.9.7] - 2026-01-13

### 🐛 Critical Bug Fixes & Tuning

#### Fixed
- **Sticky Feedback Bug** (`script.js`) - Fixed an issue where the feedback overlay would not clear after the user corrected their pose.
  - Added logic to explicitly clear `lastDisplayedFeedbacks` when the engine returns an empty array.
- **Calibration UI Bug** (`script.js`) - Fixed missing `drawOverlay` call in the main loop.
  - Warning messages (e.g., "Step Back", "Low Light") during calibration are now visible.
- **Thai Typo** - "กางเขน" -> "กางแขน".

#### Changed
- **Heuristics Tuning** (`heuristics_engine.js`) - Adjusted thresholds based on user testing:
  - **Continuity**: Increased `MOTION_THRESHOLD` (0.001 -> 0.005) to filter out camera jitter and correctly detect static poses.
  - **Elbow Sinking**: Relaxed `ELBOW_TOLERANCE` (0.01 -> 0.02) to reduce "sticky" error messages for beginners.
- **Stop Training Audio**: Changed "หยุดการฝึก" to "สิ้นสุดการฝึก" (Training Ended).

### 🔊 Audio & Localization Updates

#### Added
- **Smart Audio Queueing** (`audio_manager.js`) - Implemented `waitForIdle()` to prevent audio overlaps (e.g., Calibration success vs Exercise name).
- **Short Low Light Warnings** - Added `alert_low_light_short` ("แสงสว่างไม่เพียงพอ") for concise spoken warnings.
- **Localization Keys** - centralized `announce_*` and `camera_error_*` keys in `translations.js`.

---

## [v0.9.6] - 2026-01-12

### ⚡ Performance Optimization & Verification

#### Added
- **Frame Throttling Logic** (`script.js`) - Implemented "Process 1, Skip 3" logic.
  - Camera Input: ~30 FPS (Smooth visual)
  - AI Inference: ~7.5 FPS (Reduced CPU/GPU load)
  - Fixed double-counting bug in fps counters.
- **Time-based Calibration** (`calibration_manager.js`) - Refactored from Frame-based to Time-based.
  - Uses `Date.now()` (3000ms) for countdown instead of frame counting.
  - Solves lag issues where calibration took too long at low FPS.
- **VS Code Settings** (`.vscode/settings.json`) - Added configuration for PlantUML Graphviz path (Fixes MacPorts/Homebrew mismatch).
- **Data Export Update** (`script.js`, `data_exporter.js`) - Added `thresholds` (Heuristic Config) to exported JSON metadata.
  - Ensures research reproducibility by recording exact sensitivity settings used during training.
  - Supports future Machine Learning model training (Phase 3).

#### Changed
- **Diagrams Synchronization** - Updated diagrams to strictly match codebase (v0.9.6).
  - `ClassDiagram.wsd`: Added missing methods in DrawingManager/GhostManager, fixed PathGenerator name.
  - `SequenceDiagram_Calibration.wsd`: Removed `saveToStorage` (Dead Code).
  - `SequenceDiagram_RealtimeAnalysis.wsd`: Updated to show Throttling Loop.
- **Code Cleanup** - Commented out unused `saveToStorage` call in `script.js`.

#### Updated Docs
- **`task.md`** - Marked all tasks as complete.
- **`walkthrough.md`** - Added final session summary.

---

## [v0.9.5] - 2026-01-11

### 💎 Final UI Polish & Refactoring

#### Changed
- **Speaker Button Refactor** - Changed style from Green to Default Gray to match theme Consistency.
  - Replaced icon toggle logic with pure text content update (`🔊`/`🔇`).
- **Stop Control UI** - Moved Stop instructions to a dedicated bottom box.
  - Added Red "Stop" header for clear visual hierarchy.
  - Added "Auto-finish after 5 mins" reassurance text.
  - Removed redundant gesture hints and floating note.
  - Implemented auto-width sizing for better balance.
- **Header Typography** - Fixed Thai vowel clipping issue.
  - Added `leading-relaxed` and `py-1` to main title.

## [v0.9.4] - 2026-01-11

### 🌟 Landing Page Refinement (Thesis-Ready)

#### Added
- **Project Stats Section** (index.html) - แสดงผลลัพธ์จาก Usability Testing (Chapter 6)
  - ⭐️ 4.2/5 User Satisfaction
  - 🚀 87.5% Intent to Use
  - 🎯 100% Training Success
  - *Note: Commented out pending final data confirmation.*
- **Learn More Grid** (index.html) - ปรับปรุงเป็น 2x2 Grid Layout
  - **Definition:** What is Silk Reeling? (Circular, Continuous)
  - **Principles:** Key concepts (Waist Axis, Whole Body Connection)
  - **Benefits:** Mental, Balance/Strength, Energy (Qi)
  - **Practice:** How to practice (Relax, Slow, Focus)
- **Responsive Layouts** (css/landing.css) - New grid systems for:
  - `.guide-extras-grid` (Tips vs Warnings)
  - `.reference-content` (2x2 Learn More)
  - `.stats-container` (3-column Stats)

#### Changed
- **About Section** - Refined content to focus on "Heritage meets Technology".
- **User Guide** - Streamlined to 3 steps (Prep -> Train -> Eval).
- **Tips & Warnings** - Consolidated into a side-by-side responsive grid.
- **Visuals** - Added icons to Stats and improved spacing/typography.

#### Updated Docs
- **`walkthrough.md`** - Finalized for v0.9.4 release.


### 🎨 Theme Matching & CSS Refactoring

#### Added
- **`/css/base.css`** (~230 lines) - สร้างใหม่ Shared styles สำหรับทั้ง Landing และ App
  - CSS Variables สำหรับ colors, spacing, radius
  - Shared animations (fadeIn, fadeInUp, pulse)
  - Glass card component
  - Light/Dark mode support via CSS variables

#### Changed
- **`/css/landing.css`** - Import base.css, ลบ code ซ้ำ (~20 lines saved)
- **`/css/styles.css`** - Import base.css, รองรับ dark/light mode ถูกต้อง
  - ใช้ `body.dark` selector แทน `body.light` ให้ตรงกับ JS toggle
  - เพิ่ม `!important` เพื่อ override Tailwind CDN
- **`app.html`** - ใช้ `glass-card` class แทน Tailwind bg classes

#### Fixed
- **Theme Toggle** - Dark/Light mode ทำงานถูกต้องทั้ง body และ main-card
- **Background Color** - ทั้ง index.html และ app.html ใช้พื้นดำ (#000) เมื่อเป็น Dark mode
- **Glass Card Hover** - ลบ hover animation ที่ทำให้ video container ขยับ

#### Updated Docs
- **`docs/guides/THEME_MATCHING_PLAN.md`** - Mark as completed
- **`docs/code/AUDIO_MANAGER.md`** - Updated to detailed style
- **`docs/code/SCORING_MANAGER.md`** - Updated to detailed style  
- **`docs/code/DRAWING_MANAGER.md`** - Updated to detailed style
- **`docs/technical/ARCHITECTURE.md`** - CSS 4 → 5 files
- **`docs/sdd/SDD.md`** - CSS 4 → 5 files
- **`docs/thesis/chapter5.md`** - File structure updated
- **`docs/thesis/appendix_d_source_code.md`** - File structure updated
- **`docs/thesis/configuration_item_table.md`** - Added base.css (CI-CSS-01)
- **`docs/thesis/progress_status_record.md`** - Added v0.9.3, CSS 5

### ⚡ Quickstart UI

#### Added
- **`index.html`** - เพิ่ม Quickstart box ในส่วนคู่มือการใช้งาน
- **`app.html`** - เพิ่ม Quickstart box ใน Start Overlay
- **`translations.js`** - เพิ่ม quickstart translations (TH/EN)
- **`landing.css`** - เพิ่ม `.guide-quickstart` และ `.guide-divider` styles
- **`ui_manager.js`** - เพิ่ม setText calls สำหรับ quickstart elements

#### ข้อความใหม่
- ⚡ เริ่มทันที: กดปุ่ม "เริ่มฝึก" หรือ ยกนิ้วโป้ง 👍
- ค่าเริ่มต้น: ท่าม้วนไหม - มือขวา - ตามเข็ม - ระดับนั่ง

---


## [v0.9.2] - 2026-01-10

### 📚 Thesis Documentation Finalization

#### Added - Thesis Documents
- **`abstract.md`** - บทคัดย่อภาษาไทย + English Abstract
- **`acknowledgments.md`** - กิตติกรรมประกาศ (ร่าง)
- **`references.md`** - เอกสารอ้างอิง 19 รายการ (IEEE Style)
- **`test_plan.md`** - แผนการทดสอบครบถ้วน (21 test cases)
- **`configuration_item_table.md`** - ตาราง CI 100+ รายการ
- **`progress_status_record.md`** - บันทึกความก้าวหน้า v0.1-v0.9.1

#### Changed
- **`abstract.md`** - แก้ไขคำศัพท์ "มวยไท่จี๋" → "มวยไท้เก๊ก" ให้สอดคล้องทั้งเอกสาร
- **`chapter1.md`** - เพิ่มหมายเหตุอธิบายการใช้ "Taijiquan" แทน "Tai Chi"
- **`keyboard_controller.js`** - ใช้ `e.code` แทน `e.key` สำหรับ Thai keyboard compatibility
- **`app.html`** - อัปเดตเวอร์ชันเป็น v0.9.1

#### Terminology Updates (Global)
- เปลี่ยน "มวยไท่จี๋" → "มวยไท้เก๊ก" (43 instances, 8 files)
- เปลี่ยน "Tai Chi" → "Taijiquan" ใน abstract, chapter3, chapter5

#### Documentation Improvements
- **`chapter4.md`** - แก้ไขตาราง Keyboard Shortcuts (grouped by function)
- **`appendix_e_user_guide.md`** - อัปเดต Keyboard Shortcuts ให้ตรงกับ code
- **`use_case_descriptions.md`** - แก้ไข UC-01, UC-02, UC-04 ให้ตรงกับ implementation

---


## [v0.9.1] - 2026-01-09

### 🔧 Landing Page Code Separation

#### Added
- **`/css/landing.css`** (~400 lines) - แยก CSS จาก index.html
  - Organized 9 sections: Base, Navigation, Hero, About, Guide, Reference, Footer, Animations, Responsive
- **`/js/silk-animation.js`** (~220 lines) - แยก Animation จาก index.html
  - Class-based: `SilkReelingAnimation` reusable
  - Auto-initialize เมื่อ DOM ready
  - Responsive ตาม viewport

#### Changed
- **`index.html`**: ลดจาก 915 → ~220 บรรทัด (76% reduction)
  - ใช้ external CSS: `<link href="css/landing.css">`
  - ใช้ external JS: `<script src="js/silk-animation.js" defer>`
  - เพิ่ม `body.landing` class สำหรับ scoped styles
- **`/css/styles.css`**: เพิ่ม Responsive breakpoints สำหรับ Tablet
  - 1024px (Tablet Landscape)
  - 768px (Tablet Portrait)
  - 640px (Small Tablet)

#### Updated Docs
- **ARCHITECTURE.md**: อัปเดต File Structure (4 CSS, 22 JS)

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
