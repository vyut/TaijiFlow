# Implementation Plan: Smart Audio Wait & Speech Cleanup

## Goal
1.  Eliminate audio overlaps ("Calibration..." vs "Right Hand...") by implementing a true "Wait for completion" mechanism instead of fixed delays.
2.  Remove the unwanted "ป้ายเตือน" (Warning Label) prefix from low-light warnings.

## 1. Smart Audio Queueing (Audio Manager)

### `js/audio_manager.js`
-   **New Method:** `waitForIdle()`
    -   Returns a `Promise` that resolves when `window.speechSynthesis.speaking` becomes `false`.
    -   Uses a polling mechanism (e.g., `setInterval` every 100ms) to check status.
    -   Includes a safety timeout (e.g., 5 seconds) to prevent infinite hanging if the browser gets stuck.

### `js/script.js` -> `showCountdown`
-   **Refactor:**
    -   Remove `setTimeout` wrapping the exercise name speech.
    -   Insert `await audioManager.waitForIdle()` **before** calling `audioManager.speak(exerciseText)`.
    -   This ensures "Calibration Complete" is fully finished before "Right Hand..."
    -   **Note:** `showCountdown` must handle this async flow correctly. Since it already returns a `Promise`, we can use `async/await` inside the existing Promise wrapper or convert it to `async function`.

## Feature: Random Exercise Mode & UI Reordering (v0.9.2)

### User Review Required
- **UX Change:** Dropdowns will be swapped. "Level" (Sitting/Standing) will now appear BEFORE "Exercise".
- **New Option:** "Random (Surprise Me)" added to Exercise dropdown.

### Proposed Changes

#### [UI] [app.html](file:///Users/yut/TaijiFlow/app.html)
- **Swap:** Move `#level-select` container div to be before `#exercise-select` container div.
- **Add:** Option `<option value="random">🎲 Random (Surprise Me)</option>` to `#exercise-select`.

#### [Logic] [script.js](file:///Users/yut/TaijiFlow/js/script.js)
- **Modify:** `startTrainingFlow` (or button click handler).
    - If `currentExercise === 'random'`:
        - Randomly select one key from `['rh_cw', 'rh_ccw', 'lh_cw', 'lh_ccw']`.
        - Update `currentExercise`.
        - Update UI dropdown to reflect the choice (so user knows what to do).
        - Proceed with normal start flow.

#### [Localization] [translations.js](file:///Users/yut/TaijiFlow/js/translations.js)
- **Add:** Key for "Random Exercise" label (e.g., `exercise_random`).

## Verification Plan
### Manual Verification
1.  Select Level "Seated" -> Select "Random" -> Click Start.
2.  Verify: System picks a valid exercise (e.g., Right Hand CW) and starts countdown.
3.  Verify: Dropdown updates to show the picked exercise.
4.  Verify: UI order is Level -> Exercise.

## 2. Removing "ป้ายเตือน" Prefix

### Investigation
-   Search for code triggering the Low Light warning.
-   Identify if there are duplicate triggers:
    1.  `audioManager.speak("แสงสว่างไม่พอ")`
    2.  `alert("แสงสว่างไม่พอ")` -> Browsers read "Alert..." ("ป้ายเตือน") automatically.
    3.  `uiManager.show...` triggering an ARIA live region update.

### Fix
-   If utilizing `alert()`: Replace with a custom non-blocking toast/notification (using `uiManager`) OR silence the `audioManager.speak` if reasonable.
-   However, pure `audioManager.speak` shouldn't prefix "ป้ายเตือน". The issue is likely a system dialog (`alert`) or notification causing the system reader to chime in.
-   **Action:** Locate the `alert()` call in low-light logic and replace/modify it.


### Score Summary UI Redesign (Pro Polish)
Refine the score popup to be visually stunning and more informative.

#### [MODIFY] [translations.js](file:///Users/yut/TaijiFlow/js/translations.js)
- Add `tips` section with specific advice for common errors (Elbow Sinking, Speed, etc.).

#### [MODIFY] [score_popup_manager.js](file:///Users/yut/TaijiFlow/js/score_popup_manager.js)
- **Circular Progress Ring**: 
  - Add animated SVG ring around the score using Tailwind and CSS transitions.
- **Smart Tips**: 
  - Map the "Top Error" to a specific "Tip" from translations.
  - Display tip with a lightbulb icon 💡.
- **Layout Improvements**:
  - Gradient text for Grade (A/B/C).
  - Clean up the grid layout.
  - Make QR code section collapsible or cleaner.
- **Micro-interactions**:
  - Fade-in animation for elements.

## Verification
1.  **Audio Flow:** Run calibration. Verify "Calibration Complete" finishes fully -> 3-2-1 starts -> "Right Hand..." speaks clearly -> "Start Training".
2.  **Low Light:** Trigger low light. Verify only "แสงสว่างไม่เพียงพอ" is heard, no "ป้ายเตือน".
3.  **UI Redesign:** Complete training session. Verify Score Popup has:
    -   Animated ring.
    -   Actionable tip for the most frequent error.
    -   Gradient grade text.

### Score Popup V2.1 (Reintegration & Polish)
Address user feedback by restoring missing features and fixing colors.

#### [MODIFY] [score_popup_manager.js](file:///Users/yut/TaijiFlow/js/score_popup_manager.js)
- **Restore Features**:
  - Add **Duration** to stat grid.
  - Re-introduce **Top Errors List** (small text below tips) for detailed data.
  - Add **QR Code** (Expandable "Show QR" section) for easy mobile access.
- **Visual Fixes**:
  - **Button Color**: Change "Close" button to standard **Theme Purple** (or gray) instead of Grade Color (Yellow/Red) to prevent theme clash.
  - **Grade Color**: Keep `Grade Text` and `Progress Ring` colored by grade for feedback, but ensure "Yellow" (Grade C) looks good (Gold/Amber).
  - **Gradient Logic**: Implement proper `adjustColor` (HSL manipulation) for smoother gradients.

