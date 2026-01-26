# TaijiFlow AI - script.js Documentation

**Version:** 4.0 (Refactored)
**Last Updated:** 2026-01-26
**Role:** Main Orchestrator / Glue Code

---

## 📋 Overview

`script.js` has been significantly refactored in v1.2.0. It no longer contains the bulk of the application logic. Instead, it acts as the **Main Orchestrator** (Conductor) that coordinates specialized Managers.

### 🔑 Key Responsibilities

1.  **Initialization**: Sets up the Game Loop and initializes all Managers.
2.  **State Management**: Manages high-level states (`isTraining`, `isCalibrating`).
3.  **Event Bus**: Connects UI events (Buttons, Keys) to Logic Managers.
4.  **Game Loop**: The `onResults()` function that runs every frame.

---

## 🏗️ Architecture Change

> **Legacy (v1.0)**: `script.js` was a 2,000+ line monolith containing everything.
> **Current (v1.2)**: Logic has been moved to:

-   **Camera & MediaPipe** -> `js/core/camera_manager.js`
-   **Performance/FPS** -> `js/core/performance_monitor.js`
-   **Lighting/Brightness** -> `js/ui/lighting_manager.js`
-   **Time/Countdown** -> `js/utils/time_utils.js`
-   **Debug Stats** -> `js/ui/debug_manager.js`

---

## 🔄 Main Loop (`onResults`)

The heart of the application is now streamlined:

```javascript
function onResults(results) {
    // 1. Performance Monitor (FPS check)
    performanceMonitor.update();

    // 2. Camera Manager (Draw Video)
    cameraManager.drawVideo(results.image);

    // 3. Lighting Manager (Check Brightness)
    if (lightingManager.isEnabled) {
        lightingManager.processFrame(results.image);
    }

    // 4. Game Logic (Delegated)
    if (calibrator.isActive) {
        calibrator.process(results, ctx);
    } else if (isTrainingMode) {
        // ... Logic delegated to HeuristicsEngine & Managers ...
    }
}
```

---

## 📚 Related Modules

Please refer to specific manager documentation or source code:

-   [CameraManager](../../js/core/camera_manager.js)
-   [PerformanceMonitor](../../js/core/performance_monitor.js)
-   [HeuristicsEngine](../../js/heuristics_engine.js)
-   [UIManager](../../js/ui_manager.js)
