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
    this.pathWidth = 4; // Default Thin
    this.pathColor = "0, 255, 0"; // Default Green
    this.showSkeleton = true;
    this.skeletonColor = "255, 255, 255"; // Default White
    this.showTrail = true;
    this.instructorSize = "medium"; // Small/Medium/Large
    this.instructorPos = "tr"; // TR/TL/BR/BL
    this.isMirrored = true; // 🆕 Track Mirror State explicitly
    this.showBlurBackground = false;
    this.showGrid = false; // 🆕 Grid Overlay
    this.showErrorHighlights = true; // 🆕 Error Highlights (Red Dots)
    this.isSideBySide = false; // 🆕 Side-by-Side Mode
    this.gridSize = 100; // Default Medium
    this.gridColor = "150, 150, 150"; // Default Gray
    this.gridOpacity = 0.4; // Default 40%
    this.ghostOpacity = 0.4; // 🆕 Ghost Opacity (Default 40%)
    this.ghostColor = "100, 200, 255"; // 🆕 Ghost Color (Default Cyan)

    // Trail Visualization
    this.TRAIL_LENGTH = 60; // Max History Length (will be updated by settings)
    this.trailLength = 60; // Default Medium
    this.trailColor = "100, 200, 255"; // Default Cyan
    this.trailHistory = [];
    this.circularityScore = null;

    // Persist Ghost State
    this.ghostWasEnabledBeforeSideBySide = false;

    this.init();
  }
  init() {
    this.initDropdown();
    this.initSettingsDropdown(); // Settings dropdown (Performance + Effects + Backgrounds)
    this.initMirrorCheckbox(); // 🆕 Mirror Mode
    this.initGridCheckbox(); // 🆕 Grid Overlay
    this.initGhostCheckbox();
    this.initInstructorCheckbox();
    this.initPathCheckbox();
    this.initSkeletonCheckbox();
    this.initTrailCheckbox(); // Init Checkbox & Settings
    this.initAutoAdjustLightCheckbox(); // Auto-Adjust Light
    this.initVirtualBackgrounds(); // Virtual Backgrounds
    this.initZoomControls(); // 🆕 Zoom/Pan Controls
    this.initSideBySideCheckbox(); // 🆕 Side-by-Side Mode
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

        // Auto-Collapse when closing
        if (displayMenu.classList.contains("hidden")) {
          this.collapseAllSettings();
        }
      });

      document.addEventListener("click", (e) => {
        if (!displayMenu.contains(e.target) && e.target !== displayBtn) {
          if (!displayMenu.classList.contains("hidden")) {
            displayMenu.classList.add("hidden");
            this.collapseAllSettings();
          }
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
   * Helper: Setup Toggle Button for Settings Panels
   * @param {string} settingsId - ID of the settings div
   * @param {string} btnId - ID of the toggle button (chevron)
   * @param {string} checkboxId - ID of the feature checkbox
   */
  setupSettingsToggle(settingsId, btnId, checkboxId) {
    const settings = document.getElementById(settingsId);
    const btn = document.getElementById(btnId);
    const checkbox = document.getElementById(checkboxId);

    if (!settings || !btn || !checkbox) return;

    // 1. Initial State: Hidden by default (Auto-Collapse rule)
    settings.classList.add("hidden");
    btn.style.transform = "rotate(0deg)";

    // 2. Toggle Click
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent label click
      e.preventDefault();

      const isHidden = settings.classList.contains("hidden");
      if (isHidden) {
        settings.classList.remove("hidden");
        btn.style.transform = "rotate(180deg)"; // Arrow Up
      } else {
        settings.classList.add("hidden");
        btn.style.transform = "rotate(0deg)"; // Arrow Down
      }
    });

    // 3. Link with Checkbox (Uncheck -> Hide)
    checkbox.addEventListener("change", () => {
      if (!checkbox.checked) {
        settings.classList.add("hidden");
        btn.style.transform = "rotate(0deg)";
      }
    });
  }

  /**
   * Helper: Collapse all settings panels
   */
  collapseAllSettings() {
    const allSettings = [
      "trail-settings",
      "path-settings",
      "grid-settings",
      "ghost-settings",
      "skeleton-settings",
      "instructor-settings",
    ];
    const allBtns = [
      "btn-trail-settings",
      "btn-path-settings",
      "btn-grid-settings",
      "btn-ghost-settings",
      "btn-skeleton-settings",
      "btn-instructor-settings",
    ];

    allSettings.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });

    allBtns.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.transform = "rotate(0deg)"; // Reset rotation
    });
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
    this.isMirrored = enabled; // Update State
    const container = document.querySelector(".canvas-container");

    // We still toggle class for potential CSS fallback/other uses
    if (container) {
      if (enabled) {
        container.classList.remove("normal-view");
      } else {
        container.classList.add("normal-view");
      }
    }

    // Force Transform Update
    this.updateTransform();
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
          // Notification handled in KeyboardController
        } else {
          // Notification handled in KeyboardController
        }
      });
    }
  }

  /**
   * Initialize Grid Overlay toggle
   */
  /**
   * Initialize Grid Overlay toggle + Settings
   */
  initGridCheckbox() {
    const checkGrid = document.getElementById("check-grid");
    const gridSettings = document.getElementById("grid-settings");

    // Inputs
    const sizeSelect = document.getElementById("grid-size");
    const colorBtns = document.querySelectorAll(".grid-color-btn");
    const opacitySlider = document.getElementById("grid-opacity");
    const opacityLabel = document.getElementById("grid-opacity-val");

    if (checkGrid) {
      // 1. Initialize UI with current state
      checkGrid.checked = this.showGrid;

      // Setup Toggle Logic (Auto-Collapse & Chevron)
      this.setupSettingsToggle(
        "grid-settings",
        "btn-grid-settings",
        "check-grid",
      );

      if (sizeSelect) {
        sizeSelect.value = this.gridSize;
      }
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          if (btn.dataset.color === this.gridColor) {
            btn.classList.add("active", "ring-2", "ring-blue-500");
          } else {
            btn.classList.remove("active", "ring-2", "ring-blue-500");
          }
        });
      }
      if (opacitySlider) {
        const val = Math.round(this.gridOpacity * 100);
        opacitySlider.value = val;
        if (opacityLabel) opacityLabel.textContent = `${val}%`;
      }

      // 2. Handle Checkbox
      checkGrid.addEventListener("change", (e) => {
        this.showGrid = e.target.checked;
        // Settings toggle handled by setupSettingsToggle
      });

      // 3. Handle Size Change
      if (sizeSelect) {
        sizeSelect.addEventListener("change", (e) => {
          this.gridSize = parseInt(e.target.value, 10);
        });
      }

      // 4. Handle Color Change
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            // Remove active ring from all
            colorBtns.forEach((b) =>
              b.classList.remove("active", "ring-2", "ring-blue-500"),
            );
            // Add to current
            btn.classList.add("active", "ring-2", "ring-blue-500");

            // Update State
            this.gridColor = btn.dataset.color;
          });
        });
      }

      // 5. Handle Opacity Change (Real-time)
      if (opacitySlider) {
        opacitySlider.addEventListener("input", (e) => {
          const val = e.target.value;
          this.gridOpacity = val / 100;
          if (opacityLabel) opacityLabel.textContent = `${val}%`;
        });
      }
    } else {
      console.warn("⚠️ Grid Checkbox not found in initGridCheckbox");
    }
  }

  /**
   * Ghost checkbox (เงาครูฝึกบนวิดีโอหลัก)
   */
  initGhostCheckbox() {
    const { checkGhost, ghostManager } = this.deps;
    const ghostSettings = document.getElementById("ghost-settings");

    // Inputs
    const opacitySlider = document.getElementById("ghost-opacity");
    const opacityLabel = document.getElementById("ghost-opacity-val");
    const colorBtns = document.querySelectorAll(".ghost-color-btn");

    if (checkGhost) {
      // 1. Initialize UI
      checkGhost.checked = this.showGhostOverlay;

      // Setup Toggle Logic (Auto-Collapse & Chevron)
      this.setupSettingsToggle(
        "ghost-settings",
        "btn-ghost-settings",
        "check-ghost",
      );

      // Initialize Opacity Slider
      if (opacitySlider) {
        const val = Math.round(this.ghostOpacity * 100);
        opacitySlider.value = val;
        if (opacityLabel) opacityLabel.textContent = `${val}%`;
      }

      // Initialize Color Buttons
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          if (btn.dataset.color === this.ghostColor) {
            btn.classList.add("active", "ring-2", "ring-blue-500");
          } else {
            btn.classList.remove("active", "ring-2", "ring-blue-500");
          }
        });
      }

      // 2. Handle Checkbox Change
      checkGhost.addEventListener("change", () => {
        this.showGhostOverlay = checkGhost.checked;
        if (this.showGhostOverlay) {
          ghostManager.start();
          // Settings toggle handled by setupSettingsToggle (Manual open required)
        } else {
          ghostManager.stop();
          // Settings auto-close handled by setupSettingsToggle
        }
      });

      // 3. Handle Opacity Change
      if (opacitySlider) {
        opacitySlider.addEventListener("input", (e) => {
          const val = e.target.value;
          this.ghostOpacity = val / 100;
          if (opacityLabel) opacityLabel.textContent = `${val}%`;

          // Update Manager immediately
          if (ghostManager) ghostManager.setOpacity(this.ghostOpacity);
        });
      }

      // 4. Handle Color Change
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            // Remove active ring
            colorBtns.forEach((b) =>
              b.classList.remove("active", "ring-2", "ring-blue-500"),
            );
            // Add active ring
            btn.classList.add("active", "ring-2", "ring-blue-500");

            // Update State
            this.ghostColor = btn.dataset.color;
            // Note: ghostManager doesn't handle color directly yet,
            // we will pass this.ghostColor to drawing_manager via script.js or directly here if we refactor.
            // For now, we rely on script.js reading displayController.ghostColor.
          });
        });
      }
    }
  }

  /**
  /**
   * Instructor checkbox (เงาครูฝึกมุมขวาบน)
   */
  initInstructorCheckbox() {
    const { checkInstructor } = this.deps;
    const sizeBtns = document.querySelectorAll(".instructor-size-btn");
    const posBtns = document.querySelectorAll(".instructor-pos-btn");

    if (checkInstructor) {
      checkInstructor.checked = this.showInstructor;

      // Setup Toggle Logic
      this.setupSettingsToggle(
        "instructor-settings",
        "btn-instructor-settings",
        "check-instructor",
      );

      // Init Size & Pos Buttons
      this.updateInstructorUI(sizeBtns, posBtns);

      checkInstructor.addEventListener("change", () => {
        this.toggleInstructor(checkInstructor.checked);
        // Settings toggle handled by setupSettingsToggle
      });

      // Handle Size Change
      sizeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.instructorSize = btn.dataset.size;
          this.updateInstructorStyle();
          this.updateInstructorUI(sizeBtns, posBtns);
        });
      });

      // Handle Position Change
      posBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.instructorPos = btn.dataset.pos;
          this.updateInstructorStyle();
          this.updateInstructorUI(sizeBtns, posBtns);
        });
      });
    }
  }

  updateInstructorUI(sizeBtns, posBtns) {
    if (sizeBtns) {
      sizeBtns.forEach((btn) => {
        if (btn.dataset.size === this.instructorSize) {
          btn.classList.add("bg-blue-600", "text-white");
          btn.classList.remove("bg-gray-700", "text-gray-300");
        } else {
          btn.classList.remove("bg-blue-600", "text-white");
          btn.classList.add("bg-gray-700", "text-gray-300");
        }
      });
    }
    if (posBtns) {
      posBtns.forEach((btn) => {
        if (btn.dataset.pos === this.instructorPos) {
          btn.classList.add("bg-blue-600", "text-white");
          btn.classList.remove("bg-gray-700", "text-gray-300");
        } else {
          btn.classList.remove("bg-blue-600", "text-white");
          btn.classList.add("bg-gray-700", "text-gray-300");
        }
      });
    }
  }

  updateInstructorStyle() {
    const { instructorThumbnail } = this.deps;
    if (!instructorThumbnail) return;

    // Reset basics
    instructorThumbnail.style.top = "auto";
    instructorThumbnail.style.bottom = "auto";
    instructorThumbnail.style.left = "auto";
    instructorThumbnail.style.right = "auto";
    instructorThumbnail.style.width = "auto";

    // Apply Position
    switch (this.instructorPos) {
      case "tr":
        instructorThumbnail.style.top = "10px";
        instructorThumbnail.style.right = "10px";
        break;
      case "tl":
        instructorThumbnail.style.top = "10px";
        instructorThumbnail.style.left = "10px";
        break;
      case "br":
        instructorThumbnail.style.bottom = "10px";
        instructorThumbnail.style.right = "10px";
        break;
      case "bl":
        instructorThumbnail.style.bottom = "10px";
        instructorThumbnail.style.left = "10px";
        break;
    }

    // Apply Size (Width) - Height auto via CSS aspect-ratio
    switch (this.instructorSize) {
      case "small":
        instructorThumbnail.style.width = "30%";
        instructorThumbnail.style.minWidth = "300px";
        break;
      case "medium":
        instructorThumbnail.style.width = "45%";
        instructorThumbnail.style.minWidth = "450px";
        break;
      case "large":
        instructorThumbnail.style.width = "60%";
        instructorThumbnail.style.minWidth = "600px";
        break;
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
      // Ensure style is applied when showing
      if (show) this.updateInstructorStyle();
    }
    if (checkInstructor) {
      checkInstructor.checked = show;
    }
  }

  /**
   * Zoom & Pan Controls
   */
  initZoomControls() {
    this.zoomLevel = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.zoomStep = 0.1;
    this.panStep = 20;

    const btnZoomIn = document.getElementById("btn-zoom-in");
    const btnZoomOut = document.getElementById("btn-zoom-out");
    const btnZoomReset = document.getElementById("btn-zoom-reset");
    const btnPanUp = document.getElementById("btn-pan-up");
    const btnPanDown = document.getElementById("btn-pan-down");
    const btnPanLeft = document.getElementById("btn-pan-left");
    const btnPanRight = document.getElementById("btn-pan-right");

    if (btnZoomIn) {
      btnZoomIn.addEventListener("click", () => this.adjustZoom(1));
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener("click", () => this.adjustZoom(-1));
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener("click", () => this.resetZoom());
    }

    // Pan Buttons
    if (btnPanUp)
      btnPanUp.addEventListener("click", () => this.adjustPan(0, 1));
    if (btnPanDown)
      btnPanDown.addEventListener("click", () => this.adjustPan(0, -1));
    if (btnPanLeft)
      btnPanLeft.addEventListener("click", () => this.adjustPan(1, 0));
    if (btnPanRight)
      btnPanRight.addEventListener("click", () => this.adjustPan(-1, 0));
  }

  adjustZoom(direction) {
    const newZoom = this.zoomLevel + direction * this.zoomStep;
    // Limit zoom: 1.0x to 3.0x
    if (newZoom >= 1.0 && newZoom <= 3.0) {
      this.zoomLevel = newZoom;
      this.updateTransform();
    }
  }

  /**
   * Adjust Pan with constraints
   * ป้องกันการเลื่อนหลุดขอบจอ (Black borders)
   */
  adjustPan(dx, dy) {
    if (this.zoomLevel <= 1.0) return;

    // 1. Calculate Max Pan (in unscaled pixels)
    // Formula: MaxTranslate = (1 - 1/Zoom) * (Dimension/2)
    // Assumption: Base resolution 1280x720 or use offsetWidth
    const container = document.querySelector(".canvas-container");
    const W = container ? container.offsetWidth : 1280;
    const H = container ? container.offsetHeight : 720;

    const maxPanX = (1 - 1 / this.zoomLevel) * (W / 2);
    const maxPanY = (1 - 1 / this.zoomLevel) * (H / 2);

    // 2. Apply Step
    // Note: mirrorScale affects DIRECTION, not limit magnitude
    let nextX = this.panX + dx * this.panStep;
    let nextY = this.panY + dy * this.panStep;

    // 3. Clamp
    // Math.abs(nextX) must be <= maxPanX
    if (nextX > maxPanX) nextX = maxPanX;
    if (nextX < -maxPanX) nextX = -maxPanX;

    if (nextY > maxPanY) nextY = maxPanY;
    if (nextY < -maxPanY) nextY = -maxPanY;

    this.panX = nextX;
    this.panY = nextY;
    this.updateTransform();
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.updateTransform();
  }

  updateTransform() {
    const canvas = document.getElementById("output_canvas");
    const video = document.getElementById("input_video");

    // Mirror Logic:
    // If Mirrored: ScaleX should be NEGATIVE
    // If Normal: ScaleX should be POSITIVE
    const mirrorScale = this.isMirrored ? -1 : 1;

    // Zoom Logic:
    const finalScaleX = this.zoomLevel * mirrorScale;
    const finalScaleY = this.zoomLevel;

    // Pan Logic:
    // When ScaleX is -1 (Mirrored), Translate X directions are inverted visually.
    // If we want Pan Right (+panX) to move Image Right, we must Invert X translation when mirrored.
    const finalPanX = this.panX * mirrorScale;
    const finalPanY = this.panY;

    const transform = `scale(${finalScaleX}, ${finalScaleY}) translate(${finalPanX}px, ${finalPanY}px)`;

    if (canvas) {
      canvas.style.transform = transform;
      canvas.style.transition = "transform 0.1s ease-out";
    }
    if (video) {
      video.style.transform = transform;
      video.style.transition = "transform 0.1s ease-out";
    }
  }

  /**
   * Path checkbox (เส้นทางต้นแบบ)
   */
  initPathCheckbox() {
    const checkPath = document.getElementById("check-path");
    const pathSettings = document.getElementById("path-settings");
    const widthSelect = document.getElementById("path-width");
    const colorBtns = document.querySelectorAll(".path-color-btn");

    if (checkPath) {
      checkPath.checked = this.showPath;

      // Setup Toggle Logic (Auto-Collapse & Chevron)
      this.setupSettingsToggle(
        "path-settings",
        "btn-path-settings",
        "check-path",
      );

      // 1. Init Width Select
      if (widthSelect) {
        widthSelect.value = this.pathWidth.toString();
      }

      // 2. Init Color Buttons
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          if (btn.dataset.color === this.pathColor) {
            btn.classList.add("active", "ring-2", "ring-blue-500");
          } else {
            btn.classList.remove("active", "ring-2", "ring-blue-500");
          }
        });
      }

      // 3. Handle Checkbox Change
      checkPath.addEventListener("change", () => {
        this.showPath = checkPath.checked;
        // Settings toggle handled by setupSettingsToggle
      });

      // 5. Handle Width Change
      if (widthSelect) {
        widthSelect.addEventListener("change", (e) => {
          this.pathWidth = parseInt(e.target.value, 10);
        });
      }

      // 6. Handle Color Change (Delegation or Loop)
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            // Remove active ring
            colorBtns.forEach((b) =>
              b.classList.remove("active", "ring-2", "ring-blue-500"),
            );
            // Add active ring
            btn.classList.add("active", "ring-2", "ring-blue-500");

            // Update State
            this.pathColor = btn.dataset.color;
          });
        });
      }
    }
  }

  /**
   * Skeleton checkbox (โครงผู้ฝึก)
   */
  initSkeletonCheckbox() {
    const checkSkeleton = document.getElementById("check-skeleton");
    const colorBtns = document.querySelectorAll(".skeleton-color-btn");

    if (checkSkeleton) {
      checkSkeleton.checked = this.showSkeleton;

      // Setup Toggle Logic (Auto-Collapse & Chevron)
      this.setupSettingsToggle(
        "skeleton-settings",
        "btn-skeleton-settings",
        "check-skeleton",
      );

      // Init Color Buttons
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          if (btn.dataset.color === this.skeletonColor) {
            btn.classList.add("active", "ring-2", "ring-blue-500");
          } else {
            btn.classList.remove("active", "ring-2", "ring-blue-500");
          }
        });
      }

      // 1. Handle Checkbox
      checkSkeleton.addEventListener("change", () => {
        this.showSkeleton = checkSkeleton.checked;
        // Settings toggle handled by setupSettingsToggle
      });

      // 2. Handle Color Change
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            // Remove active ring
            colorBtns.forEach((b) =>
              b.classList.remove("active", "ring-2", "ring-blue-500"),
            );
            // Add active ring
            btn.classList.add("active", "ring-2", "ring-blue-500");

            // Update State
            this.skeletonColor = btn.dataset.color;
          });
        });
      }
    }
  }

  /**
   * Trail checkbox (เส้นทางการเคลื่อนไหว)
   */
  initTrailCheckbox() {
    const checkTrail = document.getElementById("check-trail");
    const trailSettings = document.getElementById("trail-settings");
    const lengthSelect = document.getElementById("trail-length");
    const colorBtns = document.querySelectorAll(".trail-color-btn");

    if (checkTrail) {
      checkTrail.checked = this.showTrail;

      // Setup Toggle Logic (Auto-Collapse & Chevron)
      this.setupSettingsToggle(
        "trail-settings",
        "btn-trail-settings",
        "check-trail",
      );

      // 1. Init Length Select
      if (lengthSelect) {
        lengthSelect.value = this.trailLength.toString();
      }

      // 2. Init Color Buttons
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          if (btn.dataset.color === this.trailColor) {
            btn.classList.add("active", "ring-2", "ring-blue-500");
          } else {
            btn.classList.remove("active", "ring-2", "ring-blue-500");
          }
        });
      }

      // 3. Handle Checkbox Change
      checkTrail.addEventListener("change", () => {
        this.showTrail = checkTrail.checked;
        // Settings toggle handled by setupSettingsToggle

        if (!this.showTrail) {
          this.trailHistory = [];
          this.circularityScore = null;
        }
      });

      // 5. Handle Length Change
      if (lengthSelect) {
        lengthSelect.addEventListener("change", (e) => {
          this.trailLength = parseInt(e.target.value, 10);
          this.TRAIL_LENGTH = this.trailLength; // Sync legacy var
          // Trim history immediately if shortened
          while (this.trailHistory.length > this.trailLength) {
            this.trailHistory.shift();
          }
        });
      }

      // 6. Handle Color Change
      if (colorBtns.length > 0) {
        colorBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            // Remove active ring
            colorBtns.forEach((b) =>
              b.classList.remove("active", "ring-2", "ring-blue-500"),
            );
            // Add active ring
            btn.classList.add("active", "ring-2", "ring-blue-500");

            // Update State
            this.trailColor = btn.dataset.color;
          });
        });
      }
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
      }

      // Sync UI with state (Default is TRUE in script.js)
      checkAutoAdjust.checked = window.autoAdjustLightEnabled;

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
        this.setVirtualBackground(bgKey);
      });
    });

    console.log(
      `✅ Virtual Backgrounds UI initialized (${bgButtons.length} options)`,
    );
  }

  /**
   * Set Virtual Background and handle side effects (Pose Options & UI)
   * @param {string} bgKey - 'none' | 'blur' | 'image'
   */
  setVirtualBackground(bgKey) {
    // 1. Update Manager
    if (window.backgroundManager) {
      window.backgroundManager.setBackground(bgKey);
      console.log(`🖼️ Background changed to: ${bgKey}`);
    }

    // 2. Update UI Buttons
    const bgButtons = document.querySelectorAll(".bg-option");
    bgButtons.forEach((b) => {
      if (b.dataset.bg === bgKey) {
        b.classList.remove("border-transparent");
        b.classList.add("active", "border-green-500");
      } else {
        b.classList.remove("active", "border-green-500");
        b.classList.add("border-transparent");
      }
    });

    // 3. Update Pose Options (Segmentation)
    if (window.pose) {
      if (bgKey !== "none") {
        window.pose.setOptions({
          enableSegmentation: true,
          smoothSegmentation: true,
        });
        console.log("🎨 Segmentation enabled for background effect");
      } else {
        // Only disable if Silhouette is also OFF
        // (Silhouette also needs segmentation)
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

    // Reset Side-by-Side
    this.toggleSideBySide(false);
    const checkSideBySide = document.getElementById("check-side-by-side");
    if (checkSideBySide) checkSideBySide.checked = false;
  }

  /**
   * 🆕 Side-by-Side Mode checkbox
   */
  initSideBySideCheckbox() {
    const checkSideBySide = document.getElementById("check-side-by-side");

    if (checkSideBySide) {
      checkSideBySide.checked = this.isSideBySide;

      checkSideBySide.addEventListener("change", (e) => {
        this.toggleSideBySide(e.target.checked);
      });
    }
  }

  /**
   * Toggle Side-by-Side Mode
   * @param {boolean} enabled
   */
  toggleSideBySide(enabled) {
    if (this.isSideBySide === enabled) return;

    console.log(`🌗 Toggle Side-by-Side: ${enabled}`);
    console.log(`   Current Ghost Checkbox: ${this.deps.checkGhost?.checked}`);
    console.log(
      `   Saved Previous Ghost State: ${this.ghostWasEnabledBeforeSideBySide}`,
    );

    this.isSideBySide = enabled;
    const body = document.body;
    const container = document.getElementById("instructor-video-container");
    const { ghostManager, checkGhost } = this.deps;

    if (enabled) {
      // 1. Enable CSS Mode
      body.classList.add("side-by-side-mode");

      // 2. Ensure Ghost is Active (so video plays)
      if (checkGhost) {
        // Save previous state BEFORE we change it
        this.ghostWasEnabledBeforeSideBySide = checkGhost.checked;
        console.log(
          `   💾 Saving Ghost State: ${this.ghostWasEnabledBeforeSideBySide}`,
        );

        if (!checkGhost.checked) {
          console.log("   🟢 Force enabling Ghost for Side-by-Side");
          checkGhost.checked = true;
          checkGhost.dispatchEvent(new Event("change")); // Force start ghostManager

          if (window.uiManager) {
            // Notification handled in KeyboardController (or suppressed for auto-actions)
          }
        }
      }

      // 3. Move Instructor Video to Left Container
      if (ghostManager && container) {
        // Try to get video from manager (even if not playing yet, accessible via property)
        // We know ghostManager stores it in this.silhouetteVideo
        const video = ghostManager.silhouetteVideo;

        if (video) {
          container.appendChild(video);
          video.style.display = "block";
          if (video.paused) video.play().catch(() => {});
        }
      }
    } else {
      // 1. Disable CSS Mode
      body.classList.remove("side-by-side-mode");

      // 2. Clear Left Container (Video removed from DOM, but GhostManager keeps ref)
      if (container) {
        container.innerHTML = "";
      }

      // 3. Restore Ghost State
      if (checkGhost) {
        console.log(
          `   🔄 Restoring Ghost. Previous: ${this.ghostWasEnabledBeforeSideBySide}, Current: ${checkGhost.checked}`,
        );

        // Only turn off if it was OFF before Side-by-Side started
        if (!this.ghostWasEnabledBeforeSideBySide && checkGhost.checked) {
          console.log("   🔴 Force disabling Ghost (Restore)");
          checkGhost.checked = false;
          checkGhost.dispatchEvent(new Event("change")); // Stop ghostManager
        }
      }
    }
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
