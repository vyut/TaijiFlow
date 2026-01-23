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
      toggleDebugOverlay,
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
        break;

      // -----------------------------------------------------------------------
      // P = Path Overlay Toggle
      // -----------------------------------------------------------------------
      case "KeyP":
        e.preventDefault();
        if (checkPath) {
          checkPath.checked = !checkPath.checked;
          checkPath.dispatchEvent(new Event("change"));
        }
        break;

      // -----------------------------------------------------------------------
      // B = Blur Background Toggle (Virtual Backgrounds)
      // -----------------------------------------------------------------------
      case "KeyB":
        e.preventDefault();
        // Toggle Virtual Background (Blur <-> None)
        if (this.deps.backgroundManager) {
          const currentBg = this.deps.backgroundManager.getCurrentMode();
          // Toggle between 'none' and 'blur'
          const newBg = currentBg === "none" ? "blur" : "none";
          this.deps.backgroundManager.setBackground(newBg);

          // Update UI (Visual Feedback)
          if (window.uiManager) {
            window.uiManager.showNotification(
              newBg === "blur" ? "Blur Background: ON" : "Blur Background: OFF",
              "info",
            );
          }
        }
        break;

      // -----------------------------------------------------------------------
      // M = Mirror Mode Toggle
      // -----------------------------------------------------------------------
      case "KeyM":
        e.preventDefault();
        const checkMirror = document.getElementById("check-mirror");
        if (checkMirror) {
          checkMirror.click(); // Trigger change event + notification
        }
        break;

      // -----------------------------------------------------------------------
      // O = Ghost (O)verlay Toggle (Changed from G to avoid conflict with Grid)
      // -----------------------------------------------------------------------
      case "KeyO":
        e.preventDefault();
        const checkGhost = document.getElementById("check-ghost");
        if (checkGhost) {
          checkGhost.checked = !checkGhost.checked;
          checkGhost.dispatchEvent(new Event("change"));
        }
        break;

      // -----------------------------------------------------------------------
      // G = Grid Overlay Toggle
      // -----------------------------------------------------------------------
      case "KeyG":
        e.preventDefault();
        const checkGrid = document.getElementById("check-grid");
        if (checkGrid) {
          checkGrid.click(); // Trigger change event
        }
        break;

      // -----------------------------------------------------------------------
      // K = Skeleton (sKeleton) Toggle
      // -----------------------------------------------------------------------
      case "KeyK":
        e.preventDefault();
        if (checkSkeleton) {
          checkSkeleton.checked = !checkSkeleton.checked;
          checkSkeleton.dispatchEvent(new Event("change"));
        }
        break;

      // -----------------------------------------------------------------------
      // S = Silhouette Toggle
      // -----------------------------------------------------------------------
      case "KeyS":
        e.preventDefault();
        if (checkSilhouette) {
          checkSilhouette.checked = !checkSilhouette.checked;
          checkSilhouette.dispatchEvent(new Event("change"));
        }
        break;

      // -----------------------------------------------------------------------
      // R = Trail Visualization Toggle
      // -----------------------------------------------------------------------
      case "KeyR":
        e.preventDefault();
        const checkTrail = document.getElementById("check-trail");
        if (checkTrail) {
          checkTrail.checked = !checkTrail.checked;
          checkTrail.dispatchEvent(new Event("change"));
        }
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
        this.deps.engine.setDebugMode(!this.deps.engine.debugMode);
        toggleDebugOverlay(this.deps.engine.debugMode);
        const debugCheckbox = document.getElementById("check-debug");
        if (debugCheckbox) debugCheckbox.checked = this.deps.engine.debugMode;
        uiManager.showNotification(
          `Debug Mode: ${this.deps.engine.debugMode ? "ON" : "OFF"}`,
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
          this.showShortcutsHelp();
        }
        break;
    }
  }

  /**
   * Show keyboard shortcuts help notification
   */
  showShortcutsHelp() {
    const shortcuts = [
      "⌨️ คีย์ลัด",
      "━━━━━━━━━━━━",
      "Space = เริ่ม/หยุด",
      "F = เต็มจอ",
      "━━━━━━━━━━━━",
      "P = Path (เส้นทางต้นแบบ)",
      "I = Instructor (ผู้สอน)",
      "O = Ghost (เงาต้นแบบ)",
      "━━━━━━━━━━━━",
      "K = Skeleton (โครงผู้ฝึก)",
      "S = Silhouette (เงาผู้ฝึก)",
      "R = Trail (เส้นสัมผัส)",
      "━━━━━━━━━━━━",
      "G = Grid (เส้นตาราง)",
      "D = Debug Mode",
      "━━━━━━━━━━━━",
      "B = Blur Background",
      "━━━━━━━━━━━━",
      "A = เปิด/ปิดเสียง",
      "M = กระจก (Mirror)",
      "L = เปลี่ยนภาษา",
      "T = เปลี่ยน Theme",
      "? = วิธีใช้งาน",
      "━━━━━━━━━━━━",
      "/ = แสดงคีย์ลัด",
      "Esc = ยกเลิก",
    ].join("\n");

    this.deps.uiManager.showNotification(shortcuts, "info", 5000);
  }
}
