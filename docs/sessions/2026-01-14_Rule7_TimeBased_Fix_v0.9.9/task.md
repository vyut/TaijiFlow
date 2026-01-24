# UI Refinement Tasks

- [x] 1. Change Quickstart box color from Green to White (Done)
- [x] 2. Change "Starting Immediately" (TH) to "Quickstart" and change title color to Purple
    - [x] Text update (User did this manually)
    - [x] Change title color to Purple in `index.html` (landing.css)
    - [x] Change title color to Purple in `app.html`
- [-] 3. Align `app.html` overlay steps horizontally (Reverted to vertical)
- [x] 4. Unify buttons to Purple and "Start Training" text
- [x] 5. Change Main Card border to White in `app.html`
- [x] 6. Change Landing Hero Button to Purple Gradient

# Final Polish (v0.9.5)
- [x] 1. Refactor Speaker Button (Green -> Gray Theme)
- [x] 2. Refactor Stop Control UI (Separate Bottom Box with Red Header)
- [x] 3. Fix Thai Vowel Clipping in Header
- [x] 4. Responsive Layout Logic Check (Tablet/iPad)

# Thesis Documentation Updates
- [x] 1. Add "System Environment Requirements" to Chapter 3 (PC Recommended)
- [x] 2. Add "Device Limitations" to Chapter 1 (Tablet Experimental)

# Thesis Content Validation (Final Check)
- [x] 1. **Code Consistency Check**
    - [x] Check `chapter4.md` (SDD) vs Code Structure (Updated Sizes & Components)
    - [x] Check `chapter5.md` (Implementation) vs Latest Features (Stop Box, Speaker Button)
    - [x] Check `appendix_b_srs.md` (SRS) vs Current Features
- [x] 2. **User Guide Validation**
    - [x] Check `appendix_e_user_guide.md` vs Current UI (v0.9.5) (Added Stop Box & Placeholder)
- [x] 3. **Diagram Validation**
    - [x] Verify Class Diagrams match current JS classes
    - [x] Verify Sequence Diagrams match current flow
- [x] 4. **Completeness Check**
    - [x] Ensure all 8 Rules are documented in Chapter 3/5
    - [x] Ensure Grading Criteria (A-F) matches `scoring_manager.js`

# Performance Optimization (v0.9.6)
- [x] 1. **Frame Throttling**
    - [x] Implement Skip 3 Frames Logic (AI runs @ ~7.5 FPS) in `script.js` to reduce CPU/GPU load for Tablet Experimental Support
    - [x] Fix Double-Counting Bug (Split `frameCounter` vs `throttleFrameCounter`)
    - [x] Rename Debug labels: "FPS" (Cam) and "AI Rate" (AI)
    - [x] Refactor Calibration to Time-based (Date.now()) instead of Frame-based (Fixes lag)
    - [x] Document Optimization Strategy in Thesis (Chapter 4 & 5)
    - [x] Verify & Update Diagrams (Sequence/State) for Throttling & Time-based Logic
    - [x] Sync Class Diagram with Code (Added missing methods, fixed PathGenerator)
    - [x] Troubleshoot & Fix Graphviz Path for Diagram Generation

# Content Refinement Tasks (About Section)
- [x] 1. Refine "Origin" (Accessibility, Real-time Feedback, SE Keywords)
- [x] 2. Refine "Technology" (5 Core Tech Stack)
- [x] 3. Replace "Acknowledgements" with "System Architecture" (4-Layer)
- [x] 4. Refine "Key Features" (5 Core Features from SRS)
    - [x] Pose Detection, Gesture Control (New)
    - [x] Heuristics (8 Rules), Calibration, Scoring
    - [x] Web Speech API, Generative AI

# User Guide Refinement
- [x] 1. Analyze Gaps between Appendix E and Landing Page
- [x] 2. Update Guide to 3-Step Workflow (Prep -> Train -> Eval)
- [x] 3. Remove "Quickstart" block to focus on System Overview
- [x] 4. Add "Tips & Requirements" section (Device, Environment, Clothing)
- [x] 5. Add "Usage Warnings" section (2-Column Grid, Responsive)
- [x] 6. Refine "Learn More" Section (2x2 Grid: Definition, Principles, Benefits, Practice)
- [x] 7. Add "Project Stats" Section (Research Validation: 4.2/5 Satisfaction, 87.5% Intent)

# Low Light Fix (Pixel-Based)
- [x] 1. Implement `checkBrightness` in `script.js` (Canvas analysis)
- [x] 2. Replace Visibility Check with Brightness Check
- [x] 3. Add Startup Delay (3-5s) & Periodic Check (5s)
# Documentation Updates (Post-Fix)
- [x] 1. Update `chapter4.md` (CalibrationManager `stop()`)
- [x] 2. Update `chapter5.md` (Low Light Logic: Delay + Visibility, Random Mode)
- [x] 3. Update Sequence Diagram `.wsd` file (Add `stop()` call)
- [x] 4. Verify & Sync other related docs

# Debugging Audio Announcements (v0.91)
- [x] 1. **Fix Audio Overlap**
    - [x] Implement `waitForIdle` (Smart Wait) in `AudioManager` to queue speech correctly
    - [x] Refactor `showCountdown` in `script.js` to use `await waitForIdle()`
- [x] 2. **Refine Audio Content**
    - [x] Change "Stop Training" audio from "หยุดการฝึก" to "สิ้นสุดการฝึก" (Prevent cutoff)
    - [x] Shorten Low Light warning audio to "แสงสว่างไม่เพียงพอ" (Remove "Warning" prefix)
- [x] 3. **Localization Refactoring**
    - [x] Move hardcoded strings from `script.js` and `audio_manager.js` to `translations.js`
    - [x] Standardize keys (`camera_error`, `announce`, `alert_low_light_short`)

# Feature: Random Exercise Mode & UI Reorder (v0.9.2)
- [x] 1. **UI Refactoring (app.html)**
    - [x] Swap Level and Exercise Dropdowns (Level -> Exercise)
    - [x] Add "Random (Surprise Me)" Option to `exercise-select`
- [x] 2. **Logic Implementation (script.js)**
    - [x] Handle `startTraining` random logic
    - [x] Implement exercise randomization
    - [x] Update UI dropdown on random selection
- [x] 3. **Localization (translations.js)**
    - [x] Add `exercise_random` key

# Score Summary UI Redesign (v1.0 & v2.1)
- [x] 1. **Add Tips to Translations**
    - [x] Create `tips` object in `translations.js` (TH/EN)
    - [x] Map error types (Elbow, Speed, Smoothness) to advice
- [x] 2. **Refactor Score Popup Manager**
    - [x] Implement Circular Progress Ring (SVG/CSS)
    - [x] Implement "Smart Tips" Logic (Map `topErrors` to tips)
    - [x] Redesign Layout (Gradient Grade, Grid, Clean UI)
    - [x] Restore Duration, Error List, QR Code (v2.1)
    - [x] Refine Button Color, Fonts, Visibility (v2.2)
- [x] 3. **Verify**
    - [x] Check Audio Flow (Regression Test)
    - [x] Check Low Light Warning (Regression Test)
    - [x] Check Popup Visuals

# Feedback UI Upgrade (v1.0 & v2.0)
- [x] 1. **Refactor Feedback Manager**
    - [x] Update Button Style (Purple Gradient, SVG Icon)
    - [x] Update Popup Style (Glassmorphism, Match Score Popup)
    - [x] Update Text (Match V3.2 wording)
- [x] 2. **Refactor CSS**
    - [x] Clean up `feedback.css` or migrate to Tailwind

# Background Blur Feature (Visual Effects) v0.9.8
- [x] 1. **UI: Display Options Panel**
    - [x] Add "Visual Effects" section in `app.html`
    - [x] Add translations keys in `translations.js`
- [x] 2. **Core: MediaPipe Segmentation**
    - [x] Add state variable `showBlurBackground`
    - [x] Enable `enableSegmentation: true` in Pose options (via DisplayController)
    - [x] Handle `segmentationMask` in `onResults`
- [x] 3. **Display: Drawing Manager**
    - [x] Implement `drawBlurredBackground()` method
- [x] 4. **Controller: Display Controller**
    - [x] Add `initBlurBackgroundCheckbox()` method
    - [x] Bind UI toggle event with Segmentation toggle
- [x] 5. **Low Performance Detection**
    - [x] ~~Implement `isLowEndDevice()` detection~~ (Skipped: Runtime FPS is sufficient)
    - [x] Implement FPS Runtime Monitoring (`checkLowFpsPerformance()`)
- [x] 6. **Keyboard Shortcuts**
    - [x] Change B: Skeleton → Blur Background
    - [x] Add K: Skeleton
    - [x] Update shortcuts help text
- [x] 7. **UI Polish**
    - [x] Change info notification color to purple gradient
    - [x] Fix classList.add() for multiple classes
- [x] 8. **Browser Compatibility**
    - [x] Implement Safari Detection (WebKit Limitation for Segmentation)
    - [x] ~~Add Warning Notification for Safari users~~ (Strategy Changed: Hide on Mobile/Tablet)
    - [x] Hide "Blur Background" option on all Mobile/Tablet devices (Edge/Opera on iPad failed too)
    - [x] Update Documentation to state "Desktop Only" for Visual Effects

# Documentation Update (v0.9.8)
- [x] 1. **CHANGELOG.md**
    - [x] Add v0.9.8 changes (Visual Effects, Keyboard, Notification)
    - [x] Sync to docs/CHANGELOG.md
- [x] 2. **Code Documentation**
    - [x] Update `docs/code/DISPLAY_CONTROLLER.md`
    - [x] Update `docs/code/KEYBOARD_CONTROLLER.md`
- [x] 3. **Diagrams**
    - [x] Update `ClassDiagram.wsd` (showBlurBackground, initBlurBackgroundCheckbox, drawBlurredBackground)
- [x] 4. **Thesis Documentation (v0.9.8 Sync)**
    - [x] Chapter 4: Update Display Options (added Blur Background), Keyboard Shortcuts (B→Blur, K→Skeleton)
    - [x] Appendix F: Update Display Options, Keyboard Shortcuts, Shortcuts Count (15→16)
    - [x] Chapter 3: Update F-08 Display Options description
    - [x] Chapter 7: Update Display Options count (4→5), Keyboard Shortcuts count (14→16)
    - [x] Configuration Item Table: Update version numbers (v0.9.8), Module count (21→22)
    - [x] Chapter 5: Add `data_collector.html` documentation section (5.5.4)

# Heuristics Engine Fix (v0.9.9)
- [x] 1. **Fix Rule 7 (Continuity) - Time-Based Detection**
    - [x] Analyzed root cause: Skip Frame Logic + Frame-based counter
    - [x] Implement Time-Based Average Velocity approach (C-2)
    - [x] Update CONFIG: Replace `PAUSE_FRAME_THRESHOLD` with `PAUSE_WINDOW_MS` + `PAUSE_AVG_VELOCITY_THRESHOLD`
    - [x] Rewrite `checkContinuity()` to use time-windowed average velocity
    - [x] Remove `pauseCounter` state variable
    - [x] Add `isPaused()` helper method (shared by Rule 1 and Rule 7)
    - [x] Fix Rule 1 to skip when paused (let Rule 7 handle it)
    - [x] Fix timestamp issue: Use `Date.now()` instead of undefined MediaPipe timestamp
    - [x] Reduced PAUSE_WINDOW_MS from 3000 to 2000ms
    - [x] Updated feedback messages (TH/EN)
    - [x] Test: Pause hand ~2 sec → Triggers "เคลื่อนไหวอย่างต่อเนื่อง อย่าหยุดนิ่ง"
- [x] 2. **Migrate Hardcoded Messages to `translations.js`**
    - [x] Move heuristics feedback messages (9 messages) from `heuristics_engine.js`
    - [x] Move circle score labels (3 labels) from `drawing_manager.js`
    - [x] Add TH/EN translations with keys: `heur_*` and `circle_*`
    - [x] Update `getMessage()` to use TRANSLATIONS lookup
    - [x] Verified `gesture_manager.js` already uses `{ th: "...", en: "..." }` pattern (OK)
