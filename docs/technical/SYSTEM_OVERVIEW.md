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
│                     (Main Controller / Glue Code)                    │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│  │ DOM Events   │ Training Flow│ MediaPipe    │ State Mgmt   │      │
│  └──────────────┴──────────────┴──────────────┴──────────────┘      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐   ┌───────────────────┐   ┌───────────────────┐
│  Core Logic   │   │   UI & Display    │   │   Utilities       │
├───────────────┤   ├───────────────────┤   ├───────────────────┤
│ heuristics_   │   │ ui_manager.js     │   │ session_manager   │
│ engine.js     │   │ drawing_manager   │   │ path_generator    │
│ scoring_      │   │ ghost_manager     │   │ translations.js   │
│ manager.js    │   │ tutorial_manager  │   │ data_exporter     │
│ calibration_  │   │ feedback_manager  │   │                   │
│ manager.js    │   │ audio_manager     │   │                   │
└───────────────┘   └───────────────────┘   └───────────────────┘
```
![Module Diagram](../../out/docs/diagrams/ModuleDiagram/ModuleDiagram.svg)

### Data Flow

```
Camera → MediaPipe → Landmarks → Heuristics Engine → Feedbacks
                         │                               │
                         ▼                               ▼
                  Drawing Manager              Audio Manager
                  (วาด Skeleton)               (พูด Feedback)
                         │                               │
                         └───────────┬───────────────────┘
                                     ▼
                              Scoring Manager
                              (คำนวณคะแนน)
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
│   ├── script.js              # Main Entry Point
│   ├── heuristics_engine.js   # Pose Analysis Core
│   ├── ui_manager.js          # Main UI Manager
│   ├── audio_manager.js       # Audio Feedback
│   ├── drawing_manager.js     # Canvas Drawing
│   ├── calibration_manager.js # Calibration Logic
│   ├── scoring_manager.js     # Scoring System
│   ├── ghost_manager.js       # Ghost Overlay
│   ├── silhouette_manager.js  # Silhouette Overlay
│   ├── path_generator.js      # Dynamic Path Logic
│   ├── session_manager.js     # Session/User ID
│   ├── data_exporter.js       # Data Export Logic
│   ├── translations.js        # i18n Data
│   ├── chatbot.js             # Gemini AI Chatbot
│   ├── display_controller.js  # Display Settings
│   ├── keyboard_controller.js # Shortcuts
│   ├── rules_config_manager.js# Rules Settings
│   ├── gesture_manager.js     # Hand Gestures
│   ├── tutorial_manager.js    # Tutorial System
│   ├── score_popup_manager.js # Result Popup
│   ├── feedback_manager.js    # Feedback UI
│   └── silk-animation.js      # Landing Animation
├── data/
│   └── *.json           # Reference Data
├── audio/
│   └── *.mp3            # Sound Effects
└── docs/
    └── *.md             # Documentation
```

### 📊 File Roles

| ไฟล์ | บทบาท | Dependencies |
|------|-------|--------------|
| `script.js` | Main Entry Point / Glue Code | All Modules |
| `heuristics_engine.js` | วิเคราะห์ท่า (Core Logic) | - |
| `calibration_manager.js` | ปรับเทียบสัดส่วน (T-Pose) | - |
| `scoring_manager.js` | คำนวณคะแนนและเกรด | - |
| `ui_manager.js` | จัดการ UI หน้าจอหลัก | translations.js |
| `audio_manager.js` | จัดการเสียงพูด (TTS) | - |
| `drawing_manager.js` | วาด Canvas (Skeleton, Path) | - |
| `ghost_manager.js` | วาดเงาครูฝึก (Instructor) | - |
| `silhouette_manager.js` | วาดเงาผู้เล่น (User Silhouette) | - |
| `path_generator.js` | สร้าง Dynamic Path | - |
| `session_manager.js` | จัดการ Session User | - |
| `data_exporter.js` | Export ข้อมูลการฝึก | - |
| `display_controller.js` | จัดการเมนูแสดงผล | - |
| `keyboard_controller.js` | จัดการคีย์ลัด | - |
| `chatbot.js` | AI Chatbot (Gemini) | - |
| `rules_config_manager.js` | จัดการตั้งค่า Rules | - |
| `gesture_manager.js` | สั่งงานด้วยมือ (Gesture) | - |
| `tutorial_manager.js` | ระบบสอนใช้งาน | - |
| `score_popup_manager.js` | หน้าต่างสรุปผลคะแนน | - |
| `feedback_manager.js` | แสดง Feedback UI | - |
| `silk-animation.js` | Animation หน้า Landing | - |

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
