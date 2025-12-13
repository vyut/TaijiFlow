# ☯️ TaijiFlow AI

> **AI-Powered Taijiquan Training Assistant for Silk Reeling (Chán Sī Jìn 纏絲勁)**

A web-based real-time pose analysis system that helps practitioners learn and improve Taijiquan Silk Reeling movements using computer vision and heuristic-based feedback.

---

## 📸 Demo

![TaijiFlow Screenshot](favicon.png)

*Real-time pose detection with instant feedback*

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Real-time Pose Detection** | Using MediaPipe Pose for 33 body landmarks |
| **Gesture Control** | 👍 Thumb Up to start, ✊ Closed Fist to stop (2-sec hold) |
| **Auto Calibration** | Automatic T-Pose calibration before each session |
| **8 Heuristic Rules** | Path accuracy, arm rotation, elbow sinking, waist initiation, stability, smoothness, continuity, weight shift |
| **3 Training Levels** | L1 (Seated), L2 (Standing), L3 (Bow Stance) |
| **4 Exercise Modes** | Right/Left hand, Clockwise/Counter-clockwise |
| **Session Timer** | 5-minute auto-stop with timer display |
| **Scoring System** | 0-100% score with grade (A-F) after each session |
| **Audio Feedback** | Voice announcements using Web Speech API (TH/EN) |
| **AI Chatbot** | "อาจารย์เต๋า" - Taijiquan master powered by Google Gemini API |
| **Bilingual** | Thai & English with persistent language preference |
| **Dark/Light Theme** | User preference saved locally |
| **Privacy Notice** | Clear data handling disclosure on startup |
| **Debug Mode** | Press `D` to toggle real-time analysis overlay |
| **Data Export** | JSON export for ML training data (Developer tool) |

---

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge)
- Webcam
- Good lighting

### Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/TaijiFlow.git
cd TaijiFlow

# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx serve .

# Option 3: Using VS Code Live Server extension
# Right-click on index.html → Open with Live Server
```

Open `http://localhost:8000` in your browser.

---

## 📁 Project Structure

```
TaijiFlow/
├── index.html                # Main application
├── data_collector.html       # Reference data recorder (Developer tool)
├── js/                       # JavaScript modules
│   ├── script.js             # Main controller
│   ├── heuristics_engine.js  # Pose analysis & 8 feedback rules
│   ├── calibration_manager.js # Body proportion calibration
│   ├── gesture_manager.js    # Hand gesture control (MediaPipe)
│   ├── drawing_manager.js    # Canvas rendering
│   ├── scoring_manager.js    # Session scoring system
│   ├── audio_manager.js      # Voice feedback (TTS)
│   ├── ui_manager.js         # UI, theme, language management
│   ├── chatbot.js            # AI Chatbot (Gemini API)
│   └── data_exporter.js      # JSON data export
├── css/
│   ├── styles.css            # Custom styles (purple theme)
│   └── chatbot.css           # Chatbot popup styles
├── data/                     # Reference movement data (12 files needed)
│   ├── rh_cw_L1.json         # Right hand, clockwise, Level 1
│   ├── rh_cw_L2.json         # Right hand, clockwise, Level 2
│   ├── rh_cw_L3.json         # Right hand, clockwise, Level 3
│   ├── rh_ccw_L1.json        # Right hand, counter-clockwise, Level 1
│   ├── ... (12 files total: 4 exercises × 3 levels)
│   └── lh_ccw_L3.json        # Left hand, counter-clockwise, Level 3
├── docs/                     # Documentation
│   ├── HEURISTICS_RULES_MANUAL.md
│   ├── CONFIGURATION_GUIDE.md
│   └── CHANGELOG.md
└── README.md
```

---

## 🎯 How to Use

### New Streamlined Flow (v3.0)

1. **Select Exercise** - Choose movement type (Right/Left hand, CW/CCW)
2. **Select Level** - L1 (Seated), L2 (Standing), or L3 (Bow Stance)
3. **Start Training** - Click "🏃 เริ่มการฝึก" button
4. **Auto Calibrate** - Stand in T-Pose for 3 seconds (automatic)
5. **Countdown** - 3-2-1 countdown before recording starts
6. **Practice** - Follow the green reference path with your wrist (5 min max)
7. **Stop** - Click "⏹️ หยุดการฝึก" or wait until 5 minutes
8. **Review** - See your score, grade, and top errors

### Features During Training

| Position | Element | Description |
|----------|---------|-------------|
| Bottom-Left | ⏱️ Timer | Shows remaining time (max 5:00) |
| Bottom-Right | ⛶ Fullscreen | Toggle fullscreen mode |
| Control Panel | Stop Button | Changes to red "หยุดการฝึก" |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle Fullscreen |
| `D` | Toggle Debug Mode |
| `Esc` | Cancel Calibration |

### Gesture Controls

| Gesture | Action | Hold Time |
|---------|--------|-----------|
| 👍 Thumb Up | Start Training | 2 seconds |
| ✊ Closed Fist | Stop Training | 2 seconds |

---

## 🧠 Heuristic Rules

The system checks 8 aspects of movement quality:

| Rule | Description |
|------|-------------|
| **Path Accuracy** | Wrist follows the reference path |
| **Arm Rotation** | Correct supination/pronation timing |
| **Elbow Sinking** | Elbow stays below shoulder level |
| **Waist Initiation** | Movement starts from waist, not shoulders |
| **Vertical Stability** | Head remains stable (L2, L3 only) |
| **Smoothness** | Consistent movement velocity |
| **Continuity** | No pauses during movement |
| **Weight Shift** | Proper balance (L3 only) |

---

## 📊 Scoring System

After each recorded session, you receive:

- **Score**: 0-100% based on error-free frames
- **Grade**: A (≥90%), B (≥80%), C (≥70%), D (≥60%), F (<60%)
- **Top Errors**: Most common mistakes to focus on

---

## 🔧 Technology Stack

| Technology | Usage |
|------------|-------|
| MediaPipe Pose | Real-time body pose detection (33 landmarks) |
| MediaPipe Gesture | Hand gesture recognition for UI control |
| Google Gemini API | AI Chatbot (อาจารย์เต๋า) |
| TailwindCSS | UI styling |
| Canvas 2D API | Rendering overlay |
| Web Speech API | Audio feedback (TTS) |
| LocalStorage | User preferences (theme, language) |

---

## 📚 Research Context

This project is developed as part of an **Independent Study** for a Master's degree in Software Engineering. It serves as the foundation for a planned PhD research in AI focusing on:

- Multi-movement classification (12 Silk Reeling forms)
- Temporal sequence analysis with LSTM/Transformers
- Real-time continuous movement recognition

---

## 🗺️ Roadmap

- [x] Phase 1: 4 single-hand movements with heuristics
- [ ] Phase 2: 8 two-hand movements + user system
- [ ] Phase 3: ML/DL model for sequence recognition

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 👤 Author

**Weerayuth Uarjaipra**  
Master's Student, Software Engineering, CAMT CMU
[weerayuth_u@cmu.ac.th](mailto:weerayuth_u@cmu.ac.th)

---

## 🙏 Acknowledgments

- MediaPipe Team (Google)
- Taijiquan instructors and practitioners
- Independent Study advisors