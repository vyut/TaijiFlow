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
 *
 * @author TaijiFlow AI Team
 * @version 1.0
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
    this.showSilhouette = false;
    this.showTrail = true;

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
    this.initGhostCheckbox();
    this.initInstructorCheckbox();
    this.initPathCheckbox();
    this.initSkeletonCheckbox();
    this.initSilhouetteCheckbox();
    this.initTrailCheckbox();
  }

  /**
   * Initialize dropdown toggle
   */
  initDropdown() {
    const { displayBtn, displayMenu } = this.deps;

    if (displayBtn && displayMenu) {
      displayBtn.addEventListener("click", (e) => {
        e.stopPropagation();
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
   * Silhouette checkbox (เงาผู้ฝึก)
   */
  initSilhouetteCheckbox() {
    const { checkSilhouette, silhouetteManager } = this.deps;

    if (checkSilhouette) {
      checkSilhouette.checked = this.showSilhouette;
      checkSilhouette.addEventListener("change", () => {
        this.showSilhouette = checkSilhouette.checked;

        // Dynamic Segmentation Toggle - เพิ่ม/ลด performance
        // Note: ใช้ window.pose เพราะ pose ถูก define หลังจาก DisplayController สร้าง
        if (typeof pose !== "undefined") {
          pose.setOptions({
            enableSegmentation: this.showSilhouette,
            smoothSegmentation: this.showSilhouette,
          });
        }

        if (this.showSilhouette) {
          silhouetteManager.enable();
          console.log("⚠️ Silhouette enabled - enableSegmentation: true");
        } else {
          silhouetteManager.disable();
          console.log(
            "✅ Silhouette disabled - enableSegmentation: false (+5-10 fps)"
          );
        }
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
   * Reset display options to defaults
   */
  resetToDefaults() {
    const {
      checkGhost,
      checkInstructor,
      checkPath,
      checkSkeleton,
      checkSilhouette,
    } = this.deps;

    this.showGhostOverlay = false;
    this.showInstructor = true;
    this.showPath = true;
    this.showSkeleton = true;
    this.showSilhouette = false;
    this.showTrail = true;
    this.trailHistory = [];
    this.circularityScore = null;

    // Sync checkboxes
    if (checkGhost) checkGhost.checked = false;
    if (checkInstructor) checkInstructor.checked = true;
    if (checkPath) checkPath.checked = true;
    if (checkSkeleton) checkSkeleton.checked = true;
    if (checkSilhouette) checkSilhouette.checked = false;

    const checkTrail = document.getElementById("check-trail");
    if (checkTrail) checkTrail.checked = true;
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
