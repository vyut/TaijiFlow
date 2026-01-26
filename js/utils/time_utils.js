/**
 * ============================================================================
 * TaijiFlow AI - Time Utilities
 * ============================================================================
 *
 * ฟังก์ชันจัดการเวลาและการนับถอยหลัง
 *
 * @author TaijiFlow AI Team
 * @since 3.1.0
 * ============================================================================
 */

class TimeUtils {
  /**
   * แปลงเวลา (ms) เป็นรูปแบบ MM:SS
   * @param {number} ms - เวลาในหน่วยมิลลิวินาที
   * @returns {string} เวลาในรูปแบบ "MM:SS" (เช่น "05:00")
   */
  static formatTime(ms) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  /**
   * แปลงเวลา (seconds) เป็นรูปแบบ MM:SS (Overload)
   * @param {number} seconds - เวลาในหน่วยวินาที
   * @returns {string} เวลาในรูปแบบ "MM:SS" (เช่น "05:00")
   */
  static formatTimeSeconds(seconds) {
    return this.formatTime(seconds * 1000);
  }

  /**
   * แสดง Countdown 3-2-1
   *
   * @param {HTMLElement} overlay - Element ของ Countdown Overlay
   * @param {HTMLElement} numberEl - Element แสดงตัวเลข
   * @param {Object} audioManager - AudioManager instance (optional)
   * @param {Function} onTick - Callback แต่ละวินาที (optional)
   * @param {Function} onComplete - Callback เมื่อจบ (optional)
   * @returns {Promise} Resolves เมื่อนับจบ
   */
  static async startCountdown(
    overlay,
    numberEl,
    { audioManager, exerciseText } = {},
  ) {
    return new Promise(async (resolve) => {
      // Show Overlay
      if (overlay) overlay.classList.remove("hidden");

      let count = 3;
      if (numberEl) numberEl.textContent = count;

      // 1. รอเสียง (ถ้ามี AudioManager)
      if (audioManager) {
        await audioManager.waitForIdle();
        if (exerciseText) {
          audioManager.speak(exerciseText, true);
        }
      }

      // 2. Start Interval
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          if (numberEl) numberEl.textContent = count;
        } else {
          clearInterval(interval);
          if (overlay) overlay.classList.add("hidden");
          resolve();
        }
      }, 1000);
    });
  }
}

// Global Export
window.TimeUtils = TimeUtils;
