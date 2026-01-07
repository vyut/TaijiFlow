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

    switch (e.key.toLowerCase()) {
      // -----------------------------------------------------------------------
      // F = Fullscreen Toggle
      // -----------------------------------------------------------------------
      case "f":
        e.preventDefault();
        fullscreenBtn.click();
        break;

      // -----------------------------------------------------------------------
      // D = Debug Mode Toggle
      // -----------------------------------------------------------------------
      case "d":
        e.preventDefault();
        this.deps.engine.setDebugMode(!this.deps.engine.debugMode);
        toggleDebugOverlay(this.deps.engine.debugMode);
        const debugCheckbox = document.getElementById("check-debug");
        if (debugCheckbox) debugCheckbox.checked = this.deps.engine.debugMode;
        uiManager.showNotification(
          `Debug Mode: ${this.deps.engine.debugMode ? "ON" : "OFF"}`,
          "info",
          1500
        );
        break;

      // -----------------------------------------------------------------------
      // Space = Start/Stop Training
      // -----------------------------------------------------------------------
      case " ":
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
      // M = Mute/Unmute Audio
      // -----------------------------------------------------------------------
      case "m":
        e.preventDefault();
        audioBtn.click();
        break;

      // -----------------------------------------------------------------------
      // L = Language Toggle (TH/EN)
      // -----------------------------------------------------------------------
      case "l":
        e.preventDefault();
        langBtn.click();
        break;

      // -----------------------------------------------------------------------
      // T = Theme Toggle (Dark/Light)
      // -----------------------------------------------------------------------
      case "t":
        e.preventDefault();
        themeBtn.click();
        break;

      // -----------------------------------------------------------------------
      // G = Ghost Overlay Toggle
      // -----------------------------------------------------------------------
      case "g":
        e.preventDefault();
        if (checkGhost) {
          checkGhost.checked = !checkGhost.checked;
          checkGhost.dispatchEvent(new Event("change"));
        }
        break;

      // -----------------------------------------------------------------------
      // I = Instructor Thumbnail Toggle
      // -----------------------------------------------------------------------
      case "i":
        e.preventDefault();
        displayController.toggleInstructor(!displayController.showInstructor);
        break;

      // -----------------------------------------------------------------------
      // P = Path Overlay Toggle
      // -----------------------------------------------------------------------
      case "p":
        e.preventDefault();
        if (checkPath) {
          checkPath.checked = !checkPath.checked;
          checkPath.dispatchEvent(new Event("change"));
        }
        break;

      // -----------------------------------------------------------------------
      // B = Skeleton (Bones) Toggle
      // -----------------------------------------------------------------------
      case "b":
        e.preventDefault();
        if (checkSkeleton) {
          checkSkeleton.checked = !checkSkeleton.checked;
          checkSkeleton.dispatchEvent(new Event("change"));
        }
        break;

      // -----------------------------------------------------------------------
      // S = Silhouette Toggle
      // -----------------------------------------------------------------------
      case "s":
        e.preventDefault();
        if (checkSilhouette) {
          checkSilhouette.checked = !checkSilhouette.checked;
          checkSilhouette.dispatchEvent(new Event("change"));
        }
        break;

      // -----------------------------------------------------------------------
      // R = Trail Visualization Toggle
      // -----------------------------------------------------------------------
      case "r":
        e.preventDefault();
        const checkTrail = document.getElementById("check-trail");
        if (checkTrail) {
          checkTrail.checked = !checkTrail.checked;
          checkTrail.dispatchEvent(new Event("change"));
        }
        break;

      // -----------------------------------------------------------------------
      // ? = Open Tutorial Popup
      // -----------------------------------------------------------------------
      case "?":
        e.preventDefault();
        tutorialManager.open(uiManager.currentLang);
        break;

      // -----------------------------------------------------------------------
      // / = Show Keyboard Shortcuts
      // -----------------------------------------------------------------------
      case "/":
        e.preventDefault();
        this.showShortcutsHelp();
        break;

      // -----------------------------------------------------------------------
      // Escape = Cancel Calibration
      // -----------------------------------------------------------------------
      case "escape":
        if (calibrator.isActive) {
          e.preventDefault();
          calibrator.cancel();
          loadReferenceData();
          resetToHomeScreen();
          uiManager.showNotification("ยกเลิกการปรับเทียบ", "info", 2000);
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
      "",
      "Space = เริ่ม/หยุด",
      "F = เต็มจอ",
      "D = Debug Mode",
      "",
      "G = Ghost (เงาต้นแบบ)",
      "P = Path (เส้นทางต้นแบบ)",
      "B = Skeleton (โครงผู้ฝึก)",
      "S = Silhouette (เงาผู้ฝึก)",
      "",
      "M = เปิด/ปิดเสียง",
      "L = เปลี่ยนภาษา",
      "T = เปลี่ยน Theme",
      "",
      "? = วิธีใช้งาน",
      "/ = คีย์ลัด (นี้)",
      "Esc = ยกเลิก",
    ].join("\n");

    this.deps.uiManager.showNotification(shortcuts, "info", 5000);
  }
}
