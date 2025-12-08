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
| **Body Calibration** | Personalized thresholds based on user's body proportions |
| **8 Heuristic Rules** | Path accuracy, arm rotation, elbow sinking, waist initiation, stability, smoothness, continuity, weight shift |
| **3 Training Levels** | L1 (Seated), L2 (Standing), L3 (Bow Stance) |
| **4 Exercise Modes** | Right/Left hand, Clockwise/Counter-clockwise |
| **Scoring System** | 0-100% score with grade (A-F) after each session |
| **Data Export** | JSON export for ML training data |
| **Bilingual** | Thai & English |
| **Dark/Light Theme** | User preference saved locally |

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
├── index.html              # Main HTML file
├── script.js               # Main controller
├── heuristics_engine.js    # Pose analysis & feedback rules
├── calibration_manager.js  # Body proportion calibration
├── drawing_manager.js      # Canvas rendering
├── scoring_manager.js      # Session scoring system
├── ui_manager.js           # UI, theme, language management
├── data_exporter.js        # JSON data export
├── styles.css              # Custom styles
├── data/                   # Reference movement data
│   ├── rh_cw_L1.json       # Right hand, clockwise, Level 1
│   └── ...
└── README.md
```

---

## 🎯 How to Use

1. **Calibrate** - Click "Calibrate" button, stand in T-Pose for 3 seconds
2. **Select Exercise** - Choose hand (Right/Left) and direction (CW/CCW)
3. **Select Level** - L1 (Seated), L2 (Standing), or L3 (Bow Stance)
4. **Practice** - Follow the green reference path with your wrist
5. **Record** - Press "R" or Record button to start scoring session
6. **Review** - After stopping, see your score and top errors

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle Fullscreen |
| `R` | Start/Stop Recording |

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
| MediaPipe Pose | Real-time pose detection |
| TailwindCSS | UI styling |
| Canvas 2D API | Rendering overlay |
| Web Speech API | (Planned) Audio feedback |
| LocalStorage | User preferences |

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

**Your Name**  
Master's Student, Software Engineering  
[your.email@university.edu](mailto:your.email@university.edu)

---

## 🙏 Acknowledgments

- MediaPipe Team (Google)
- Taijiquan instructors and practitioners
- Research advisors