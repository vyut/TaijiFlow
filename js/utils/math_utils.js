/**
 * ============================================================================
 * TaijiFlow AI - Math Utilities
 * ============================================================================
 *
 * รวมฟังก์ชันคำนวณทางคณิตศาสตร์และเรขาคณิตที่ใช้บ่อย
 *
 * @author TaijiFlow AI Team
 * @since 3.1.0
 * ============================================================================
 */

class MathUtils {
  /**
   * คำนวณระยะห่างระหว่าง 2 จุด (Euclidean Distance)
   *
   * @param {Object} p1 - จุดที่ 1 {x, y}
   * @param {Object} p2 - จุดที่ 2 {x, y}
   * @returns {number} ระยะห่าง (หน่วยเดียวกับ input)
   */
  static calculateDistance(p1, p2) {
    if (!p1 || !p2) return 0;
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * คำนวณมุมของเส้นตรงระหว่าง 2 จุด (เทียบกับแกนนอน)
   *
   * @param {Object} p1 - จุดเริ่มต้น
   * @param {Object} p2 - จุดปลายทาง
   * @returns {number} มุมเป็นองศา (-180 ถึง 180)
   */
  static getLineAngle(p1, p2) {
    if (!p1 || !p2) return 0;
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  }

  /**
   * คำนวณความเร็วเชิงมุม (Angular Velocity)
   * รองรับการ Wrap-around (-180 <-> 180)
   *
   * @param {number} angle1 - มุมเริ่มต้น (degrees)
   * @param {number} angle2 - มุมสิ้นสุด (degrees)
   * @param {number} deltaTime - ช่วงเวลา (วินาที)
   * @returns {number} ความเร็ว (degrees/second)
   */
  static getAngularVelocity(angle1, angle2, deltaTime) {
    if (deltaTime <= 0) return 0;

    let diff = angle2 - angle1;
    // Normalize diff to -180 to 180
    while (diff <= -180) diff += 360;
    while (diff > 180) diff -= 360;

    return Math.abs(diff / deltaTime);
  }

  /**
   * Normalize Vector (ทำให้ความยาวเป็น 1)
   * @param {Object} v - vector {x, y}
   * @returns {Object} normalized vector {u, v}
   */
  static normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  }

  /**
   * Dot Product of two vectors
   */
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }
}

// Make it globally available (Legacy Style) or Export
window.MathUtils = MathUtils;
