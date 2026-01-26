/**
 * ============================================================================
 * TaijiFlow AI - Performance Monitor
 * ============================================================================
 *
 * ตรวจสอบประสิทธิภาพการทำงานของเครื่อง (FPS Logic)
 * แจ้งเตือนเมื่อเฟรมเรทต่ำเกินไปขณะใช้ฟีเจอร์หนักๆ (เช่น Blur Background)
 *
 * @author TaijiFlow AI Team
 * @since 3.1.0
 * ============================================================================
 */

class PerformanceMonitor {
  constructor(deps = {}) {
    this.deps = deps; // uiManager, backgroundManager

    // Config
    this.LOW_FPS_THRESHOLD = 18; // ถ้าต่ำกว่านี้จะเตือน
    this.CHECK_INTERVAL = 5000; // เช็คทุก 5 วินาที

    // State
    this.lastCheckTime = 0;
    this.warningShown = false; // แสดงเตือนรอบเดียวต่อ session
  }

  /**
   * ตรวจสอบ FPS
   * @param {number} currentFps - AI/Processing FPS ปัจจุบัน
   */
  check(currentFps) {
    const now = Date.now();
    if (now - this.lastCheckTime < this.CHECK_INTERVAL) return;
    this.lastCheckTime = now;

    // เช็คเฉพาะเมื่อเปิด Virtual Background และยังไม่เคยเตือน
    const bgMode = this.deps.backgroundManager?.getCurrentMode();
    const hasVirtualBg = bgMode && bgMode !== "none";

    if (
      hasVirtualBg &&
      currentFps < this.LOW_FPS_THRESHOLD &&
      !this.warningShown
    ) {
      this.warningShown = true;

      // แจ้งเตือน
      if (this.deps.uiManager) {
        this.deps.uiManager.showNotification(
          this.deps.uiManager.getText("blur_bg_warning"),
          "warning",
          8000,
        );
      }

      console.log(`⚠️ Low FPS Warning: ${currentFps} FPS with Blur enabled`);
    }
  }

  /**
   * Reset สถานะการเตือน (เช่น เมื่อเริ่ม Session ใหม่)
   */
  reset() {
    this.warningShown = false;
    this.lastCheckTime = Date.now();
  }
}

// Global Export
window.PerformanceMonitor = PerformanceMonitor;
