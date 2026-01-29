# Display Popup Manager Documentation

## Overview

**File:** `js/ui/display_popup_manager.js`  
**Class:** `DisplayPopupManager`  
**Since:** v1.3.0

The `DisplayPopupManager` is responsible for managing the "Display & Visuals" modal popup. It replaces the legacy dropdown menu with a modern, glassmorphism-styled 4-column grid layout, providing centralized control over all visualization and system settings.

## Key Features

-   **Glassmorphism UI:** Uses `bg-white/90` and `backdrop-blur-xl` for a premium look.
-   **4-Column Grid:** Logically groups settings into "Trainee", "Reference", "View Env", and "System".
-   **Dynamic HTML Generation:** Generates the popup content on-the-fly when initialized or opened.
-   **"Always Show" Pattern:** Sub-settings (like opacity sliders or color pickers) are displayed inline for immediate access.
-   **Fine-Tuning Controls:** Includes sliders and color pickers for customizing visualization elements (Error Highlights, Motion Trails, etc.).

## Visual Layout

The popup is divided into 4 columns:

1.  **Trainee (User Visualization)**
    *   **Skeleton:** Toggle standard skeleton overlay.
    *   **Error Highlights:** Toggle red error circles.
        *   *Style:* Vivid, Minimal, Outline.
        *   *Opacity:* Slider (0.2 - 1.0).
    *   **Motion Trail:** Toggle movement trails.
        *   *Length:* Short, Medium, Long.
        *   *Color:* Cyan, Gold, Lime, Magenta.

2.  **Reference (Guides)**
    *   **Instructor PiP:** Picture-in-Picture mode (Size S/M/L, Corner selection).
    *   **Side-by-Side:** Split screen comparison.
        *   *Mode:* Fit (Full body), Focus (Zoomed).
        *   *Ratio:* 50:50, 60:40.
    *   **Ghost Overlay:** Semi-transparent reference guide.
        *   *Opacity:* Slider.
        *   *Color:* Cyan, White, Lime.

3.  **View Env (Environment)**
    *   **Mirror Mode:** Flips the camera feed.
        *   *Axis:* Horizontal, Vertical.
        *   *Rotate:* 0°, 90°, 180°, 270°.
    *   **Path Guide:** The green reference line.
        *   *Thickness:* Thin, Normal, Thick.
    *   **Grid Overlay:** Alignment grid (3x3).

4.  **System (Performance & Tools)**
    *   **Performance:** Lite (Low res), Balanced, Quality (High res/FPS).
    *   **Background:** Custom Image Upload (PNG/JPG).
    *   **Debug Mode:** Technical overlay (FPS, landmarks).

## Usage

```javascript
// Initialization (called in script.js)
const displayPopupManager = new DisplayPopupManager();
displayPopupManager.init();

// Open the popup
displayPopupManager.toggle();
```

## Integration with DisplayController

The `DisplayPopupManager` handles the **View** (HTML/CSS), while the logic remains in `DisplayController`.
After rendering the HTML, it triggers `displayController.reBind()` to attach event listeners to the newly created DOM elements.

## dependencies

-   `DisplayController` (Logic)
-   `TailwindCSS` (Styling)
