# Mobile Portrait Mode Implementation Plan

## 1. Problem Statement
*   **Current State:** Video is 16:9 Landscape. On Mobile Portrait (9:16), this results in a small video with huge black bars.
*   **Goal:** Make the video fill the screen (Fullscreen) on Mobile Portrait.
*   **Constraint:** AI logic works in Landscape (MediaPipe uses full frame). We must ensure visual alignment works when cropped.

## 2. Technical Strategy

### A. The "Object-Fit" Trick
Instead of complex coordinate math, we leverage CSS alignment.
If both `<video>` (Source) and `<canvas>` (Overlay) have **identical intrinsic aspect ratios** (e.g., 1280x720) and proper CSS:
```css
video, canvas {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Center crop both equally */
}
```
Then the AI Skeleton drawn at `x=0.5` (Center) will perfectly align with the person in the video center, even if the sides are cropped off-screen.

### B. UI Overlays (The Real Challenge)
Since [drawing_manager.js](file:///Users/yut/TaijiFlow/js/display/drawing_manager.js) draws feedback text at `x=20` (Top Left), in Mobile Portrait with Side-Cropping, this text will be **off-screen**.
*   **Solution:** We need [DrawingManager](file:///Users/yut/TaijiFlow/js/display/drawing_manager.js#26-977) to be "Safe Zone" aware.
*   **Logic:**
    *   Detect if `screen.width / screen.height < 1` (Portrait).
    *   If Portrait, draw texts/alerts in the **Center Safe Zone** or proper corners.

### C. Controls & Menus
The current "Sidebar" or "Top Bar" approach won't work in Fullscreen.
*   **Solution:** **"Overlay Controls"**
    *   Settings/Menu button floats top-right (transparent).
    *   Start/Stop buttons float bottom-center.
    *   Hide non-essential UI (Logo, Privacy text) during practice.

## 3. Implementation Steps

### Step 1: CSS Framework (New Class: `.mobile-portrait-mode`)
*   Add styles to [app.html](file:///Users/yut/TaijiFlow/app.html) or `styles.css`:
    ```css
    body.mobile-portrait-mode #main-card {
        display: none; /* Hide standard UI */
    }
    body.mobile-portrait-mode .video-container {
        position: fixed; inset: 0; z-index: 0;
    }
    body.mobile-portrait-mode video, 
    body.mobile-portrait-mode canvas {
        object-fit: cover;
    }
    /* Add Floating Buttons styles */
    ```

### Step 2: Detection Logic ([script.js](file:///Users/yut/TaijiFlow/js/controllers/script.js) / [ui_manager.js](file:///Users/yut/TaijiFlow/js/ui/ui_manager.js))
*   On Load & Resize:
    ```javascript
    const isMobile = /Android|iPhone/i.test(navigator.userAgent);
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isMobile && isPortrait) {
        document.body.classList.add('mobile-portrait-mode');
        // Activate Floating Controls
    }
    ```

### Step 3: Layout Refactor ([app.html](file:///Users/yut/TaijiFlow/app.html))
*   Create a `<div id="mobile-controls" class="hidden">` structure.
*   Duplicate checks (or move them) for essential actions:
    *   Start/Stop Button (Big Floating Button)
    *   Camera Flip (Front/Back) - **Crucial for mobile**
    *   Settings Toggle

### Step 4: DrawingManager Update ([js/display/drawing_manager.js](file:///Users/yut/TaijiFlow/js/display/drawing_manager.js))
*   Update [drawFeedbackPanel](file:///Users/yut/TaijiFlow/js/display/drawing_manager.js#651-695) and [drawDebugOverlay](file:///Users/yut/TaijiFlow/js/display/drawing_manager.js#700-763):
    *   Check `window.innerWidth` (or passing a flag).
    *   If Mobile, use different `x, y` coordinates to ensure visibility within the cropped central area.

## 4. Verification
1.  **Alignment Test:** Open on Mobile -> Stand in center -> Check if Skeleton matches body.
2.  **Crop Test:** Ensure arms are cut off visually but AI still tracks (if arm goes off-screen, AI might lose it, but that's a camera constraint, not code).
3.  **UI Test:** Ensure "Start" and "Feedback" text are visible and readable.

## 5. Risk Assessment
*   **Performance:** `object-fit: cover` is cheap. No impact.
*   **Field of View (FOV):** In Portrait, horizontal FOV is narrow. User must step back further to fit their whole body.
    *   *Mitigation:* Add a "Too Close" warning if hips/shoulders are out of frame? (Future Feature)
