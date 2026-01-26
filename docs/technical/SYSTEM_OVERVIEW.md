# TaijiFlow AI - System Overview

**Version:** 0.9.1
**Last Updated:** 2026-01-12
**Author:** TaijiFlow AI Team

---

## 📋 สารบัญ

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [สถาปัตยกรรม](#2-สถาปัตยกรรม)
3. [โครงสร้างไฟล์](#3-โครงสร้างไฟล์)
4. [Flow การทำงาน](#4-flow-การทำงาน)
5. [Dependencies](#5-dependencies)

---

## 1. ภาพรวมระบบ

TaijiFlow AI เป็นแอปพลิเคชันฝึกท่าม้วนไหม (Silk Reeling) ด้วย AI แบบ Real-time

### 🎯 Features หลัก

| Feature | คำอธิบาย |
|---------|---------|
| **Pose Detection** | ตรวจจับท่าทาง 33 จุดด้วย MediaPipe |
| **Pose Analysis** | วิเคราะห์ท่าตาม 8 กฎไทเก๊ก |
| **Visual Feedback** | แสดง Path, Ghost, Skeleton, Silhouette |
| **Audio Feedback** | พูดแจ้งเตือนด้วย TTS |
| **Scoring** | คำนวณคะแนนแบบ Real-time |
| **Data Export** | บันทึกข้อมูล Session (JSON/CSV) |

### 🏗️ เทคโนโลยีที่ใช้

- **MediaPipe Pose** - AI Pose Detection
- **Web Speech API** - Text-to-Speech
- **Canvas API** - วาด Skeleton/Path
- **TailwindCSS** - Styling

---

## 2. สถาปัตยกรรม

### Module Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          app.html                                  │
│                     (Entry Point, DOM Structure)                     │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          script.js                                   │
│                 (Main Orchestrator / Glue Code)                      │
│  ┌──────────────────────┬──────────────────────┬─────────────────┐  │
│  │     Game Loop        │    State Machine     │   Event Bus     │  │
│  └──────────────────────┴──────────────────────┴─────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐   ┌───────────────────┐   ┌───────────────────┐
│  Core Logic   │   │   UI & Display    │   │   Utilities       │
├───────────────┤   ├───────────────────┤   ├───────────────────┤
│ heuristics_   │   │ ui_manager (Main) │   │ session_manager   │
│ engine.js     │   │ drawing_manager   │   │ path_generator    │
│ scoring_      │   │ ghost_manager     │   │ translations.js   │
│ manager.js    │   │ tutorial_manager  │   │ data_exporter     │
│ calibration_  │   │ feedback_manager  │   │ time_utils.js     │
│ manager.js    │   │ audio_manager     │   │                   │
│ camera_       │   │ lighting_manager  │   │                   │
│ manager.js    │   │ debug_manager     │   │                   │
│ performance_  │   │ background_mn.    │   │                   │
│ monitor.js    │   │                   │   │                   │
└───────────────┘   └───────────────────┘   └───────────────────┘
```
![Module Diagram](../../out/docs/diagrams/ModuleDiagram/ModuleDiagram.svg)

### Data Flow

```
Camera → CameraManager → MediaPipe → Landmarks → Heuristics
                                        │             │
                                        ▼             ▼
                                  DrawingMgr      AudioMgr
                                  (Visuals)       (Feedback)
                                        │             │
                                        ▼             ▼
                                   ScoringMgr     UIManager
                                   (Score)        (Display)
```

![Simple Data Flow Diagram](../../out/docs/diagrams/TaijiFlow_SimpleDataFlow/TaijiFlow_SimpleDataFlow.svg)

---

## 3. โครงสร้างไฟล์

### 📁 Directory Structure

```
TaijiFlow/
├── index.html           # Landing Page
├── app.html             # Application Entry Point
├── css/
│   ├── styles.css       # Main App Styles
│   ├── landing.css      # Landing Page Styles
│   ├── chatbot.css      # Chatbot Styles
│   ├── feedback.css     # Feedback Box Styles
│   └── base.css         # Base/Reset Styles
├── js/
│   ├── script.js              # Main Orchestrator
│   ├── core/                  # [Planned] Core Logic 
│   │   ├── heuristics_engine.js
│   │   ├── scoring_manager.js
│   │   ├── calibration_manager.js
│   │   ├── camera_manager.js  # [NEW] Camera Control
│   │   └── performance_monitor.js # [NEW] FPS Control
│   ├── ui/                    # [Planned] UI Logic
│   │   ├── ui_manager.js
│   │   ├── lighting_manager.js # [NEW] Auto-Brightness
│   │   ├── debug_manager.js    # [NEW] Debug Overlay
│   │   ├── audio_manager.js
│   │   ├── tutorial_manager.js
│   │   └── ...
│   ├── display/               # [Planned] Visuals
│   │   ├── drawing_manager.js
│   │   ├── ghost_manager.js
│   │   └── background_manager.js
│   └── utils/                 # [Planned] Utilities
│       ├── time_utils.js      # [NEW] Time Helpers
│       ├── session_manager.js
│       └── ...
└── docs/
    └── ...
```

### 📊 File Roles

| ไฟล์ | บทบาท | Dependencies |
|------|-------|--------------|
| `script.js` | **Main Orchestrator** - คุม Flow หลัก เชื่อมต่อ modules | All Modules |
| `heuristics_engine.js` | วิเคราะห์ท่า (Core Logic) | - |
| `calibration_manager.js` | ปรับเทียบสัดส่วน (T-Pose) | - |
| `scoring_manager.js` | คำนวณคะแนนและเกรด | - |
| `camera_manager.js` | **[NEW]** จัดการกล้อง & MediaPipe Loop | MediaPipe |
| `performance_monitor.js`| **[NEW]** คุม Performance (Lite Mode) | - |
| `ui_manager.js` | จัดการ UI หน้าจอหลัก | translations.js |
| `lighting_manager.js` | **[NEW]** Auto-Brightness (CSS) | - |
| `debug_manager.js` | **[NEW]** แสดงค่า Debug Stats | PerformanceMonitor |
| `audio_manager.js` | จัดการเสียงพูด (TTS) | - |
| `drawing_manager.js` | วาด Canvas (Skeleton, Path) | - |
| `ghost_manager.js` | วาดเงาครูฝึก (Instructor) | - |
| `background_manager.js` | จัดการพื้นหลัง (Virtual/Blur) | - |
| `time_utils.js` | **[NEW]** ฟังก์ชันแปลงเวลา & Countdown | - |

---

## 4. Flow การทำงาน

### 4.1 Application Startup

```
1. Browser loads index.html
2. Scripts loaded with defer (in order)
3. MediaPipe Pose model initialized
4. Camera stream started
5. UI Manager initializes language/theme
6. Ready for user interaction
```

### 4.2 Training Flow

```
┌────────────────┐
│  เลือกท่า+ระดับ  │
└───────┬────────┘
        ▼
┌────────────────┐
│  กด "เริ่มฝึก"   │
└───────┬────────┘
        ▼
┌────────────────┐
│  Calibration   │ ← T-Pose 3 วินาที
│  (ปรับเทียบ)    │
└───────┬────────┘
        ▼
┌────────────────┐
│  Countdown     │ ← 3-2-1
│  (นับถอยหลัง)   │
└───────┬────────┘
        ▼
┌────────────────┐
│  Training Mode │ ← 5 นาที
│  (ฝึก+วิเคราะห์) │
│                │
│  ทุก Frame:    │
│  - Pose Detect │
│  - Analyze     │
│  - Draw        │
│  - Feedback    │
│  - Score       │
└───────┬────────┘
        ▼
┌────────────────┐
│  Summary       │ ← แสดงคะแนน
│  (สรุปผล)       │
└───────┬────────┘
        ▼
┌────────────────┐
│  Reset         │ ← กลับหน้าแรก
└────────────────┘
```

![Training Flow Diagram](../../out/docs/diagrams/TrainingFlow/TrainingFlow.svg)

### 4.3 Frame Processing (onResults)

```javascript
// ทุก Frame (~30fps)
function onResults(results) {
  // 1. Draw Video
  ctx.drawImage(results.image);
  
  // 2. Generate Dynamic Path (first frame only)
  if (isTrainingMode && referencePath.length === 0) {
    referencePath = generateDynamicPath(landmarks, exercise);
  }
  
  // 3. Draw Overlays
  if (showPath) drawer.drawPath(referencePath);
  if (showSkeleton) drawer.drawSkeleton(landmarks);
  if (showGhost) drawer.drawGhostSkeleton(ghostLandmarks);
  
  // 4. Analyze Pose
  feedbacks = engine.analyze(landmarks, timestamp, path, exercise, level);
  
  // 5. Display Feedback
  updateFeedbackOverlay(feedbacks);
  audioManager.announceFeedback(feedbacks);
  
  // 6. Record Score
  scorer.recordFrame(feedbacks);
}
```

---

## 5. Dependencies

### 5.1 External Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| MediaPipe Pose | 0.5 | Pose Detection |
| MediaPipe Camera | 0.3 | Camera Utils |
| MediaPipe Drawing | 0.3 | Drawing Utils |
| TailwindCSS | 3.x | Styling |
| Google Fonts | - | Sarabun Font |

### 5.2 Script Loading Order

```html
<!-- 1. External Libraries -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"></script>
...

<!-- 2. Core Managers (Independent) -->
<script src="js/calibration_manager.js" defer></script>
<script src="js/heuristics_engine.js" defer></script>
<script src="js/rules_config_manager.js" defer></script>
<script src="js/drawing_manager.js" defer></script>
<script src="js/data_exporter.js" defer></script>
<script src="js/audio_manager.js" defer></script>
<script src="js/scoring_manager.js" defer></script>
<script src="js/ghost_manager.js" defer></script>
<script src="js/silhouette_manager.js" defer></script>

<!-- 3. UI/Translation (Dependent on Core) -->
<script src="js/translations.js" defer></script>
<script src="js/ui_manager.js" defer></script>
<script src="js/score_popup_manager.js" defer></script>
<script src="js/gesture_manager.js" defer></script>
<script src="js/tutorial_manager.js" defer></script>
<script src="js/chatbot.js" defer></script>
<script src="js/feedback_manager.js" defer></script>

<!-- 4. Utility Modules -->
<script src="js/session_manager.js" defer></script>
<script src="js/path_generator.js" defer></script>

<!-- 5. Controllers & Entry Point -->
<script src="js/display_controller.js" defer></script>
<script src="js/keyboard_controller.js" defer></script>
<script src="js/script.js" defer></script>
```

---

## 📚 Related Documentation

- [HEURISTICS_RULES_MANUAL.md](HEURISTICS_RULES_MANUAL.md) - รายละเอียดกฎ 8 ข้อ
- [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) - การตั้งค่า
- [CHANGELOG.md](CHANGELOG.md) - ประวัติการเปลี่ยนแปลง

---

*เอกสารนี้อัปเดตอัตโนมัติเมื่อมีการเปลี่ยนแปลงโครงสร้างระบบ*
