/**
 * ============================================================================
 * TaijiFlow AI - Display Controller
 * ============================================================================
 *
 * จัดการ Display Options ทั้งหมด:
 * - Ghost Overlay (เงาครูฝึกบนวิดีโอหลัก)
 * - Instructor Thumbnail (เงาครูฝึกมุมขวาบน)
 * - Path (เส้นทางต้นแบบ)
 * - Skeleton (โครงผู้ฝึก)
 * - Silhouette (เงาผู้ฝึก)
 * - Trail (เส้นทางการเคลื่อนไหว)
 * - Mirror Mode (New)
 * - Grid Overlay (New)
 *
 * @author TaijiFlow AI Team
 * @version 1.1
 * ============================================================================
 */

class DisplayController {
  /**
   * @param {Object} deps - Dependencies
   */
  constructor(deps) {
    this.deps = deps;

    // Display State Variables
    this.showGhostOverlay = false;
    this.showInstructor = true;
    this.showPath = true;
    this.showSkeleton = true;
    this.showTrail = true;
    this.showBlurBackground = false;
    this.showGrid = false; // 🆕 Grid Overlay
    this.showErrorHighlights = true; // 🆕 Error Highlights (Red Dots)

    // Trail Visualization
    this.TRAIL_LENGTH = 60;
    this.trailHistory = [];
    this.circularityScore = null;

    this.init();
  }

  /**
   * Initialize all display options
   */
  init() {
    this.initDropdown();
    this.initSettingsDropdown(); // Settings dropdown (Performance + Effects + Backgrounds)
    this.initMirrorCheckbox(); // 🆕 Mirror Mode
    this.initGridCheckbox(); // 🆕 Grid Overlay
    this.initGhostCheckbox();
    this.initInstructorCheckbox();
    this.initPathCheckbox();
    this.initSkeletonCheckbox();
    this.initTrailCheckbox();
    this.initAutoAdjustLightCheckbox(); // Auto-Adjust Light
    this.initAutoAdjustLightCheckbox(); // Auto-Adjust Light
    this.initVirtualBackgrounds(); // Virtual Backgrounds
    this.initErrorHighlightsCheckbox(); // 🆕 Error Highlights
  }

  /**
   * Initialize dropdown toggle
   */
  initDropdown() {
    const { displayBtn, displayMenu } = this.deps;

    if (displayBtn && displayMenu) {
      displayBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.uiManager) window.uiManager.closeAllMenus("display-menu");
        displayMenu.classList.toggle("hidden");
      });

      document.addEventListener("click", (e) => {
        if (!displayMenu.contains(e.target) && e.target !== displayBtn) {
          displayMenu.classList.add("hidden");
        }
      });
    }
  }

  /**
   * Initialize Settings dropdown toggle
   */
  initSettingsDropdown() {
    const settingsBtn = document.getElementById("settings-btn");
    const settingsMenu = document.getElementById("settings-menu");

    if (settingsBtn && settingsMenu) {
      settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.uiManager) window.uiManager.closeAllMenus("settings-menu");
        settingsMenu.classList.toggle("hidden");
      });

      document.addEventListener("click", (e) => {
        if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
          settingsMenu.classList.add("hidden");
        }
      });
    }
  }

  /**
   * Initialize Mirror Mode toggle
   */
  initMirrorCheckbox() {
    const checkMirror = document.getElementById("check-mirror");

    if (checkMirror) {
      // 1. Default state: Always Mirror (true) on load
      const isMirror = true;

      checkMirror.checked = isMirror;
      this.setMirrorMode(isMirror);

      // 2. Handle change
      checkMirror.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        this.setMirrorMode(enabled);
        // No notification for consistency
      });
    }
  }

  /**
   * Helper to set mirror mode state
   * @param {boolean} enabled
   */
  setMirrorMode(enabled) {
    const container = document.querySelector(".canvas-container");
    if (!container) return;

    if (enabled) {
      container.classList.remove("normal-view"); // Mirror (Default CSS)
    } else {
      container.classList.add("normal-view"); // Normal View
    }
  }

  /**
   * Initialize Error Highlights toggle
   */
  initErrorHighlightsCheckbox() {
    const checkErrorHighlights = document.getElementById(
      "check-error-highlights",
    );

    if (checkErrorHighlights) {
      // 1. Defaut state: Checked (Enabled)
      checkErrorHighlights.checked = this.showErrorHighlights;

      // 2. Handle change
      checkErrorHighlights.addEventListener("change", (e) => {
        this.showErrorHighlights = e.target.checked;
        if (this.showErrorHighlights) {
          if (window.uiManager)
            window.uiManager.showNotification(
              "🔴 Enabled Error Highlights",
              "info",
            );
        } else {
          if (window.uiManager)
            window.uiManager.showNotification(
              "⚪ Disabled Error Highlights",
              "info",
            );
        }
      });
    }
  }

  /**
   * Initialize Grid Overlay toggle
   */
  initGridCheckbox() {
    const checkGrid = document.getElementById("check-grid");

    if (checkGrid) {
      // 1. Default: OFF (not persistent)
      checkGrid.checked = false;
      this.showGrid = false;

      // 2. Handle change
      checkGrid.addEventListener("change", (e) => {
        this.showGrid = e.target.checked;

        // No notification as requested (Consistent with other options)
      });
    } else {
      console.warn("⚠️ Grid Checkbox not found in initGridCheckbox");
    }
  }

  /**
   * Ghost checkbox (เงาครูฝึกบนวิดีโอหลัก)
   */
  initGhostCheckbox() {
    const { checkGhost, ghostManager } = this.deps;

    if (checkGhost) {
      checkGhost.checked = this.showGhostOverlay;
      checkGhost.addEventListener("change", () => {
        this.showGhostOverlay = checkGhost.checked;
        if (this.showGhostOverlay) {
          ghostManager.start();
        } else {
          ghostManager.stop();
        }
      });
    }
  }

  /**
   * Instructor checkbox (เงาครูฝึกมุมขวาบน)
   */
  initInstructorCheckbox() {
    const { checkInstructor } = this.deps;

    if (checkInstructor) {
      checkInstructor.checked = this.showInstructor;
      checkInstructor.addEventListener("change", () => {
        this.toggleInstructor(checkInstructor.checked);
      });
    }
  }

  /**
   * Toggle Instructor Thumbnail visibility
   */
  toggleInstructor(show) {
    const { instructorThumbnail, checkInstructor } = this.deps;

    this.showInstructor = show;
    if (instructorThumbnail) {
      instructorThumbnail.classList.toggle("hidden", !show);
    }
    if (checkInstructor) {
      checkInstructor.checked = show;
    }
  }

  /**
   * Path checkbox (เส้นทางต้นแบบ)
   */
  initPathCheckbox() {
    const { checkPath } = this.deps;

    if (checkPath) {
      checkPath.checked = this.showPath;
      checkPath.addEventListener("change", () => {
        this.showPath = checkPath.checked;
      });
    }
  }

  /**
   * Skeleton checkbox (โครงผู้ฝึก)
   */
  initSkeletonCheckbox() {
    const { checkSkeleton } = this.deps;

    if (checkSkeleton) {
      checkSkeleton.checked = this.showSkeleton;
      checkSkeleton.addEventListener("change", () => {
        this.showSkeleton = checkSkeleton.checked;
      });
    }
  }

  /**
   * Trail checkbox (เส้นทางการเคลื่อนไหว)
   */
  initTrailCheckbox() {
    const checkTrail = document.getElementById("check-trail");

    if (checkTrail) {
      checkTrail.checked = this.showTrail;
      checkTrail.addEventListener("change", () => {
        this.showTrail = checkTrail.checked;

        if (!this.showTrail) {
          this.trailHistory = [];
          this.circularityScore = null;
        }
        console.log(`🔵 Trail: ${this.showTrail ? "enabled" : "disabled"}`);
      });
    }
  }

  /**
   * 🆕 Auto-Adjust Light checkbox
   */
  initAutoAdjustLightCheckbox() {
    const checkAutoAdjust = document.getElementById("check-auto-adjust-light");

    if (checkAutoAdjust) {
      const saved = localStorage.getItem("autoAdjustLight");
      if (saved !== null) {
        window.autoAdjustLightEnabled = saved === "true";
        checkAutoAdjust.checked = window.autoAdjustLightEnabled;
      }

      checkAutoAdjust.addEventListener("change", () => {
        window.autoAdjustLightEnabled = checkAutoAdjust.checked;
        localStorage.setItem("autoAdjustLight", checkAutoAdjust.checked);
        console.log(
          `🔆 Auto-Adjust Light: ${window.autoAdjustLightEnabled ? "enabled" : "disabled"}`,
        );
      });
    }
  }

  /**
   * 🆕 Virtual Backgrounds
   */
  initVirtualBackgrounds() {
    const bgButtons = document.querySelectorAll(".bg-option");

    if (bgButtons.length === 0) return;

    bgButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const bgKey = btn.dataset.bg;

        bgButtons.forEach((b) => {
          b.classList.remove("active", "border-green-500");
          b.classList.add("border-transparent");
        });
        btn.classList.add("active");
        btn.classList.remove("border-transparent");
        btn.classList.add("border-green-500");

        if (window.backgroundManager) {
          window.backgroundManager.setBackground(bgKey);
          console.log(`🖼️ Background changed to: ${bgKey}`);

          if (window.pose) {
            if (bgKey !== "none") {
              window.pose.setOptions({
                enableSegmentation: true,
                smoothSegmentation: true,
              });
              console.log("🎨 Segmentation enabled for background effect");
            } else {
              if (!this.showSilhouette) {
                window.pose.setOptions({
                  enableSegmentation: false,
                  smoothSegmentation: false,
                });
                console.log("🎨 Segmentation disabled (no background effect)");
              }
            }
          }
        }
      });
    });

    console.log(
      `✅ Virtual Backgrounds UI initialized (${bgButtons.length} options)`,
    );
  }

  /**
   * Start checking for Low FPS (Auto-downgrade)
   */
  startLowFPSCheck() {
    this.lowFpsCount = 0;
    this.fpsCheckInterval = setInterval(() => {
      // Use window.currentFps computed in script.js
      if (window.currentFps > 0 && window.currentFps < 15) {
        this.lowFpsCount++;
        if (this.lowFpsCount >= 5) {
          // < 15 FPS for 5 seconds
          this.autoDisableHighCostEffects();
        }
      } else {
        this.lowFpsCount = 0;
      }
    }, 1000);
  }

  stopLowFPSCheck() {
    if (this.fpsCheckInterval) {
      clearInterval(this.fpsCheckInterval);
      this.fpsCheckInterval = null;
    }
  }

  autoDisableHighCostEffects() {
    this.stopLowFPSCheck();

    // Disable Blur BG
    this.showBlurBackground = false;
    const checkBlurBg = document.getElementById("check-blur-bg");
    if (checkBlurBg) checkBlurBg.checked = false;

    // Toggle Segmentation off (if Silhouette is also off)
    if (!this.showSilhouette && typeof pose !== "undefined") {
      pose.setOptions({
        enableSegmentation: false,
        smoothSegmentation: false,
      });
    }

    // Notify User
    const { uiManager, translations } = this.deps;
    if (uiManager && translations) {
      const lang = uiManager.currentLang || "th";
      const message =
        translations[lang]?.blur_bg_warning ||
        "Low FPS! Blur Background disabled.";
      uiManager.showNotification(message, "warning");
    }
    console.warn("⚠️ High Cost Effects Auto-disabled due to Low FPS");
  }

  /**
   * Reset display options to defaults
   */
  resetToDefaults() {
    const { checkGhost, checkInstructor, checkPath, checkSkeleton } = this.deps;

    this.showGhostOverlay = false;
    this.showInstructor = true;
    this.showPath = true;
    this.showSkeleton = true;
    this.showTrail = true;
    this.showBlurBackground = false; // 🆕
    this.showGrid = false; // 🆕
    this.trailHistory = [];
    this.circularityScore = null;

    // Sync checkboxes
    if (checkGhost) checkGhost.checked = false;
    if (checkInstructor) checkInstructor.checked = true;
    if (checkPath) checkPath.checked = true;
    if (checkSkeleton) checkSkeleton.checked = true;

    const checkTrail = document.getElementById("check-trail");
    if (checkTrail) checkTrail.checked = true;

    const checkGrid = document.getElementById("check-grid");
    if (checkGrid) checkGrid.checked = false;

    const checkBlurBg = document.getElementById("check-blur-bg");
    if (checkBlurBg) checkBlurBg.checked = false; // 🆕
  }

  /**
   * Add point to trail history
   */
  addTrailPoint(x, y) {
    if (!this.showTrail) return;

    this.trailHistory.push({ x, y, timestamp: Date.now() });

    // Keep only last N points
    if (this.trailHistory.length > this.TRAIL_LENGTH) {
      this.trailHistory.shift();
    }
  }

  /**
   * Clear trail history
   */
  clearTrail() {
    this.trailHistory = [];
    this.circularityScore = null;
  }
}
