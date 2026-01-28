/**
 * ============================================================================
 * TaijiFlow AI - Keyboard Controller
 * ============================================================================
 *
 * จัดการ Keyboard Shortcuts ทั้งหมดของแอปพลิเคชัน
 * แยกออกมาจาก script.js เพื่อความสะอาดและจัดการง่าย
 *
 * @author TaijiFlow AI Team
 * @version 1.0
 * ============================================================================
 */

class KeyboardController {
  /**
   * @param {Object} deps - Dependencies จาก main controller
   */
  constructor(deps) {
    this.deps = deps;
    this.init();
  }

  /**
   * Initialize keyboard event listener
   */
  init() {
    window.addEventListener("keydown", (e) => this.handleKeydown(e));
  }

  /**
   * Handle keydown events
   * @param {KeyboardEvent} e
   */
  handleKeydown(e) {
    // ไม่ทำงานถ้ากำลังพิมพ์ใน input/textarea
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    const {
      fullscreenBtn,
      audioBtn,
      langBtn,
      themeBtn,
      checkGhost,
      checkPath,
      checkSkeleton,
      checkSilhouette,
      startTrainingBtn,
      stopTrainingBtn,
      startOverlay,
      calibrator,
      uiManager,
      tutorialManager,
      displayController,
      debugManager, // Replaced toggleDebugOverlay
      currentExercise,
      currentLevel,
      isTrainingMode,
      loadReferenceData,
      resetToHomeScreen,
    } = this.deps;

    // =========================================================================
    // ใช้ e.code แทน e.key เพื่อรองรับ Thai Keyboard Layout
    // e.code = Physical key position (ไม่ขึ้นกับ layout)
    // e.key = Character produced (ขึ้นกับ layout - TH จะได้ ด, เ, etc.)
    // =========================================================================
    switch (e.code) {
      // =======================================================================
      // 🎮 CONTROL GROUP
      // =======================================================================

      // -----------------------------------------------------------------------
      // Space = Start/Stop Training
      // -----------------------------------------------------------------------
      case "Space":
        e.preventDefault();
        if (calibrator.isActive) {
          calibrator.cancel();
          loadReferenceData();
          startOverlay.classList.remove("hidden");
          if (document.fullscreenElement) document.exitFullscreen();
          uiManager.showNotification("🛑 ยกเลิกการ Calibrate", "info");
        } else if (isTrainingMode()) {
          stopTrainingBtn.click();
        } else if (currentExercise() && currentLevel()) {
          startTrainingBtn.click();
        }
        break;

      // -----------------------------------------------------------------------
      // Escape = Cancel Calibration / Close
      // -----------------------------------------------------------------------
      case "Escape":
        if (calibrator.isActive) {
          e.preventDefault();
          calibrator.cancel();
          loadReferenceData();
          resetToHomeScreen();
          uiManager.showNotification("ยกเลิกการปรับเทียบ", "info", 2000);
        }
        break;

      // -----------------------------------------------------------------------
      // F = Fullscreen Toggle
      // -----------------------------------------------------------------------
      case "KeyF":
        e.preventDefault();
        fullscreenBtn.click();
        break;

      // =======================================================================
      // 👁️ DISPLAY GROUP
      // =======================================================================

      // -----------------------------------------------------------------------
      // I = Instructor Thumbnail Toggle
      // -----------------------------------------------------------------------
      case "KeyI":
        e.preventDefault();
        displayController.toggleInstructor(!displayController.showInstructor);
        uiManager.showNotification(
          `Instructor PiP: ${displayController.showInstructor ? "ON" : "OFF"}`,
          "info",
        );
        break;

      // -----------------------------------------------------------------------
      // P = Path Overlay Toggle
      // -----------------------------------------------------------------------
      case "KeyP":
        e.preventDefault();
        displayController.togglePath();
        uiManager.showNotification(
          `Path Guide: ${displayController.showPath ? "ON" : "OFF"}`,
          "info",
        );
        break;

      // -----------------------------------------------------------------------
      // B = Blur Background Toggle (Virtual Backgrounds)
      // -----------------------------------------------------------------------
      case "KeyB":
        e.preventDefault();
        // Toggle Virtual Background (Blur <-> None)
        if (window.backgroundManager) {
          const currentBg = window.backgroundManager.getCurrentMode();
          const newBg = currentBg === "none" ? "blur" : "none";

          // Use the central method in displayController to handle all side effects
          displayController.setVirtualBackground(newBg);

          uiManager.showNotification(
            `Blur Background: ${newBg === "blur" ? "ON" : "OFF"}`,
            "info",
          );
        }
        break;

      // -----------------------------------------------------------------------
      // M = Mirror Mode Toggle
      // -----------------------------------------------------------------------
      case "KeyM":
        e.preventDefault();
        displayController.toggleMirror();
        uiManager.showNotification(
          `Mirror Mode: ${displayController.isMirrored ? "ON" : "OFF"}`,
          "info",
        );
        break;

      // -----------------------------------------------------------------------
      // O = Ghost (O)verlay Toggle
      // -----------------------------------------------------------------------
      case "KeyO":
        e.preventDefault();
        displayController.toggleGhost();
        uiManager.showNotification(
          `Ghost Overlay: ${displayController.showGhostOverlay ? "ON" : "OFF"}`,
          "info",
        );
        break;

      // -----------------------------------------------------------------------
      // G = Grid Overlay Toggle
      // -----------------------------------------------------------------------
      case "KeyG":
        e.preventDefault();
        displayController.toggleGrid();
        uiManager.showNotification(
          `Grid Overlay: ${displayController.showGrid ? "ON" : "OFF"}`,
          "info",
        );
        break;

      // -----------------------------------------------------------------------
      // K = Skeleton (sKeleton) Toggle
      // -----------------------------------------------------------------------
      case "KeyK":
        e.preventDefault();
        displayController.toggleSkeleton();
        uiManager.showNotification(
          `Skeleton: ${displayController.showSkeleton ? "ON" : "OFF"}`,
          "info",
        );
        break;

      // -----------------------------------------------------------------------
      // E = Error Highlights Toggle
      // -----------------------------------------------------------------------
      case "KeyE":
        e.preventDefault();
        displayController.toggleErrorHighlights();
        uiManager.showNotification(
          `Error Highlights: ${displayController.showErrorHighlights ? "ON" : "OFF"}`,
          "info",
        );
        break;

      // -----------------------------------------------------------------------
      // S = Side-by-Side Toggle (New)
      // -----------------------------------------------------------------------
      case "KeyS":
        e.preventDefault();
        const newSideBySideState = !displayController.isSideBySide;
        displayController.toggleSideBySide(newSideBySideState);
        // Sync checkbox UI
        const checkSideBySide = document.getElementById("check-side-by-side");
        if (checkSideBySide) checkSideBySide.checked = newSideBySideState;

        uiManager.showNotification(
          `Side-by-Side: ${newSideBySideState ? "ON" : "OFF"}`,
          "info",
        );
        break;

      // -----------------------------------------------------------------------
      // R = Trail Visualization Toggle
      // -----------------------------------------------------------------------
      // -----------------------------------------------------------------------
      // R = Trail Visualization Toggle
      // -----------------------------------------------------------------------
      case "KeyR":
        e.preventDefault();
        displayController.toggleTrail();
        uiManager.showNotification(
          `Motion Trail: ${displayController.showTrail ? "ON" : "OFF"}`,
          "info",
        );
        break;

      // =======================================================================
      // ⚙️ SETTINGS GROUP
      // =======================================================================

      // -----------------------------------------------------------------------
      // A = Audio Mute Toggle
      // -----------------------------------------------------------------------
      case "KeyA":
        e.preventDefault();
        audioBtn.click();
        break;

      // -----------------------------------------------------------------------
      // L = Language Toggle (TH/EN)
      // -----------------------------------------------------------------------
      case "KeyL":
        e.preventDefault();
        langBtn.click();
        break;

      // -----------------------------------------------------------------------
      // T = Theme Toggle (Dark/Light)
      // -----------------------------------------------------------------------
      case "KeyT":
        e.preventDefault();
        themeBtn.click();
        break;

      // -----------------------------------------------------------------------
      // D = Debug Mode Toggle
      // -----------------------------------------------------------------------
      case "KeyD":
        e.preventDefault();
        const newDebugState = displayController.toggleDebug();
        uiManager.showNotification(
          `Debug Mode: ${newDebugState ? "ON" : "OFF"}`,
          "info",
          1500,
        );
        break;

      // =======================================================================
      // ❓ HELP GROUP
      // =======================================================================

      // -----------------------------------------------------------------------
      // H = Open Tutorial Popup
      // -----------------------------------------------------------------------
      case "KeyH":
        e.preventDefault();
        tutorialManager.open(uiManager.currentLang);
        break;

      // -----------------------------------------------------------------------
      // Slash = Show Keyboard Shortcuts
      // -----------------------------------------------------------------------
      case "Slash":
        e.preventDefault();
        // "/" = Show shortcuts, "?" (Shift+/) = Open Tutorial
        if (e.shiftKey) {
          tutorialManager.open(uiManager.currentLang);
        } else {
          // New: Toggle Shortcuts Popup
          if (window.shortcutsManager) {
            window.shortcutsManager.toggle();
          }
        }
        break;
    }
  }
}
