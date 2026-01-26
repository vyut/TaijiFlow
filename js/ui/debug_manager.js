/**
 * ============================================================================
 * TaijiFlow AI - Debug Manager
 * ============================================================================
 *
 * จัดการหน้าจอ Debug Overlay (แสดงค่า FPS, Thresholds)
 *
 * @author TaijiFlow AI Team
 * @since 3.1.0
 * ============================================================================
 */

class DebugManager {
  constructor(overlayEl, contentEl) {
    this.overlay = overlayEl;
    this.content = contentEl;
    this.visible = false;
  }

  /**
   * แสดง/ซ่อน Debug Overlay
   * @param {boolean} show
   */
  toggle(show) {
    this.visible = show;
    if (this.overlay) {
      if (show) {
        this.overlay.classList.remove("hidden");
      } else {
        this.overlay.classList.add("hidden");
      }
    }
  }

  /**
   * อัปเดตข้อมูลบนหน้าจอ Debug
   * @param {Object} info - ข้อมูลที่จะแสดง
   * @param {Object} engine - HeuristicsEngine instance (optional)
   */
  update(info, engine) {
    if (!this.visible || !this.content) return;

    let html = "";

    // 1. Engine Debug Info
    if (engine) {
      const engineInfo = engine.getDebugInfo();
      /*
         Structure: {
           pathDistance, pathThreshold, 
           wristVelocity, acceleration, smoothThreshold,
           shapeConsistency, shapeThreshold, cwTurns, ccwTurns
         }
        */
      if (engineInfo.pathDistance) {
        html += `<div class="mb-1"><span class="text-orange-400">Path Dist:</span> ${engineInfo.pathDistance} / ${engineInfo.pathThreshold}</div>`;
      }
      if (engineInfo.shapeConsistency) {
        html += `<div class="mb-1"><span class="text-blue-400">Shape:</span> ${engineInfo.shapeConsistency} (Th: ${engineInfo.shapeThreshold})</div>
                     <div class="text-xs text-gray-400 ml-2">CW: ${engineInfo.cwTurns}, CCW: ${engineInfo.ccwTurns}</div>`;
      }
      if (engineInfo.acceleration) {
        html += `<div class="mb-1"><span class="text-purple-400">Smooth:</span> Acc: ${engineInfo.acceleration} (Th: ${engineInfo.smoothThreshold})</div>
                      <div class="text-xs text-gray-400 ml-2">Vel: ${engineInfo.wristVelocity}</div>`;
      }
    }

    // 2. Generic Info (FPS, etc.)
    for (const [key, value] of Object.entries(info)) {
      html += `<div><span class="text-gray-400">${key}:</span> ${value}</div>`;
    }

    this.content.innerHTML = html;
  }
}

// Global Export
window.DebugManager = DebugManager;
