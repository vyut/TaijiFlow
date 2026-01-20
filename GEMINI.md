# TaijiFlow AI - Context for Gemini

This document provides essential context for the TaijiFlow AI project to assist Gemini in understanding the codebase, architecture, and development conventions.

## 1. Project Overview

**TaijiFlow AI** is a web-based real-time pose analysis system designed to help practitioners learn Taijiquan Silk Reeling movements. It leverages computer vision (MediaPipe) and heuristic rules to provide instant feedback.

*   **Type:** Web Application (Client-side mostly)
*   **Core Goal:** Teach Silk Reeling (Chán Sī Jìn) through AI feedback.
*   **Key Features:** Real-time skeleton tracking, 8 heuristic rules for movement quality, voice feedback, scoring system, and an AI Chatbot ("อาจารย์เต๋า").

## 2. Technology Stack

*   **Languages:** HTML5, CSS3, JavaScript (ES6+).
*   **Frameworks/Libraries:**
    *   **MediaPipe Pose:** For body landmark detection.
    *   **MediaPipe Gesture:** For hand control (Thumb Up/Fist).
    *   **TailwindCSS:** For UI styling (via CDN or local build).
    *   **Google Gemini API:** Backend for the chatbot.
*   **APIs:**
    *   **Web Speech API:** Text-to-Speech (TTS) for audio feedback.
    *   **Canvas API:** Rendering the skeleton overlays and paths.

## 3. Architecture & File Structure

The project follows a modular architecture without a bundler (using native ES modules or script tags).

### Key Directories
*   `js/`: Contains all logic, split into categories:
    *   **Core:** `heuristics_engine.js`, `calibration_manager.js`, `scoring_manager.js`
    *   **Display:** `drawing_manager.js`, `ghost_manager.js`
    *   **UI:** `ui_manager.js`, `audio_manager.js`, `chatbot.js`
    *   **Controllers:** `script.js` (Main Entry), `keyboard_controller.js`
*   `data/`: JSON reference files for movements (e.g., `rh_cw_L1.json`) and videos.
*   `docs/`: Extensive documentation (Architecture, Heuristics, Manuals).
*   `css/`: Stylesheets (`styles.css`, `landing.css`, etc.).

### Entry Points
*   **`index.html`**: The Landing Page.
*   **`app.html`**: The Main Training Application.
*   **`script.js`**: The main controller for the training application.

## 4. Development Conventions

Strictly adhere to the established conventions found in `docs/technical/NAMING_CONVENTIONS.md`.

*   **HTML IDs:** `kebab-case` (e.g., `privacy-modal`). *Note: Some legacy IDs use camelCase/snake_case; do not refactor them unless necessary.*
*   **CSS Classes:** `kebab-case` (e.g., `.canvas-container`).
*   **JS Variables:** `camelCase` (e.g., `isTrainingMode`).
*   **JS Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RECORDING_SECONDS`).
*   **JS Classes:** `PascalCase` (e.g., `HeuristicsEngine`).
*   **Filenames:**
    *   JavaScript: `snake_case.js` (e.g., `audio_manager.js`).
    *   HTML: `snake_case.html` (e.g., `data_collector.html`).
    *   Markdown: `UPPER_CASE.md` (e.g., `README.md`).

## 5. Build & Run Instructions

Since this is a static web project, no complex build process is required for the core logic.

### Local Development
To run the application locally:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (npx)
npx serve .
```

Access via: `http://localhost:8000`

### Testing
Unit tests are available (using Jest):
```bash
npm test
```

## 6. Critical Files to Know

1.  `js/heuristics_engine.js`: The "brain" of the feedback system. Contains the logic for the 8 rules.
2.  `js/script.js`: The central hub connecting MediaPipe, UI, and Logic.
3.  `docs/technical/ARCHITECTURE.md`: Detailed system design and dependency graph.
4.  `package.json`: Dependencies and test scripts.
