/**
 * ============================================================================
 * TaijiFlow AI - Lighting Manager
 * ============================================================================
 *
 * จัดการแสงและความสว่าง:
 * 1. Auto-Adjust Brightness (CSS Filter) เมื่อแสงน้อย
 * 2. Low Light Warning (Visibility Check)
 *
 * @author TaijiFlow AI Team
 * @since 3.1.0
 * ============================================================================
 */

class LightingManager {
  constructor(canvasElement, deps = {}) {
    this.canvasElement = canvasElement;
    this.deps = deps; // uiManager, audioManager

    // Config
    this.LOW_LIGHT_THRESHOLD = 0.5;
    this.WARNING_COOLDOWN = 30000; // 30 sec
    this.STARTUP_DELAY = 3000; // 3 sec delay

    // State
    this.isEnabled = true; // Auto-Adjust Enable/Disable
    this.lastWarningTime = 0;
    this.sessionStartTime = Date.now();
    this.currentFilter = "none";
  }

  /**
   * Main Update Loop (Call every frame in onResults)
   * @param {Object} results - MediaPipe Results
   * @param {boolean} isCalibrating - Are we in calibration mode?
   */
  update(results, isCalibrating) {
    if (!results.poseLandmarks) return;

    // 1. Calculate Average Visibility
    const keyIndices = [11, 12, 13, 14, 15, 16, 23, 24]; // Shoulders, Elbows, Wrists, Hips
    const visibilitySum = keyIndices.reduce(
      (sum, i) => sum + (results.poseLandmarks[i]?.visibility || 0),
      0,
    );
    const avgVisibility = visibilitySum / keyIndices.length;

    // 2. Auto-Adjust Brightness (CSS Filter)
    this.applyAutoBrightness(avgVisibility);

    // 3. Check for Low Light Warning
    this.checkLowLight(avgVisibility, isCalibrating);
  }

  /**
   * Apply CSS Filter based on visibility
   */
  applyAutoBrightness(avgVisibility) {
    if (!this.isEnabled || !this.canvasElement) {
      if (this.canvasElement && this.canvasElement.style.filter !== "none") {
        this.canvasElement.style.filter = "none";
      }
      return;
    }

    let brightnessFilter = "none";
    // ถ้า visibility ต่ำกว่า 0.5 ให้เริ่มเร่งแสง
    if (avgVisibility < 0.5) {
      // คำนวณความสว่าง 1.0 -> 1.5 (Max 50% boost)
      const boost = 1.0 + (0.5 - avgVisibility);
      const finalBrightness = Math.min(boost, 1.5);
      brightnessFilter = `brightness(${finalBrightness})`;
    }

    // Apply only if changed
    if (this.canvasElement.style.filter !== brightnessFilter) {
      this.canvasElement.style.filter = brightnessFilter;
    }
    this.currentFilter = brightnessFilter;
  }

  /**
   * Check conditions and warn user if light is too low
   */
  checkLowLight(avgVisibility, isCalibrating) {
    const now = Date.now();

    // Condition 1: Startup Delay passed?
    if (now - this.sessionStartTime < this.STARTUP_DELAY) return;

    // Condition 2: Start Warning Check
    // Threshold depends on Auto-Adjust mode
    // If Auto-Adjust ON: Only warn if very dark (< 0.3)
    // If OFF: Warn if dark (< 0.5)
    let threshold = this.LOW_LIGHT_THRESHOLD;
    let warningKey = "alert_low_light";

    if (this.isEnabled) {
      threshold = 0.20;
      warningKey = "alert_low_light_critical";
    }

    if (avgVisibility < threshold) {
      // Cooldown Check
      if (now - this.lastWarningTime > this.WARNING_COOLDOWN) {
        this.lastWarningTime = now;
        this.triggerWarning(warningKey, isCalibrating);
      }
    }
  }

  triggerWarning(warningKey, isCalibrating) {
    if (!this.deps.uiManager || !this.deps.audioManager) return;

    const ui = this.deps.uiManager;
    const audio = this.deps.audioManager;

    // Special message for calibration
    if (isCalibrating) {
      ui.showNotification(
        ui.getText("alert_low_light_calibration"),
        "warning",
        6000,
      );
      audio.speak(ui.getText("alert_low_light_short"));
    } else {
      // Normal warning
      ui.showNotification(ui.getText(warningKey), "warning", 5000);
      audio.speak(ui.getText(warningKey + "_short"));
    }
  }

  /**
   * Handle case where no pose is detected (potentially too dark)
   */
  handleNoPose(isCalibrating) {
    if (!isCalibrating) return; // Only warn during calibration if completely lost

    const now = Date.now();
    if (now - this.lastWarningTime > this.WARNING_COOLDOWN) {
      this.lastWarningTime = now;
      this.triggerWarning("alert_low_light_calibration", true);
    }
  }

  /**
   * Toggle Auto-Adjust Feature
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    // Reset filter immediately if disabled
    if (!enabled && this.canvasElement) {
      this.canvasElement.style.filter = "none";
    }
  }
}

// Global Export
window.LightingManager = LightingManager;
