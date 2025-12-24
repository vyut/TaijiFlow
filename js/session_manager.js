/**
 * ============================================================================
 * TaijiFlow AI - Session Manager v1.0
 * ============================================================================
 *
 * จัดการข้อมูล Session และ User สำหรับการฝึก
 *
 * @description
 *   ไฟล์นี้รับผิดชอบการสร้างและจัดการ:
 *   - User ID: ระบุผู้ใช้แต่ละคน (เก็บใน LocalStorage)
 *   - Session ID: ระบุแต่ละ session การฝึก
 *   - Platform Info: ข้อมูลอุปกรณ์สำหรับ Analytics
 *
 * 📋 หน้าที่หลัก:
 *   - getOrCreateUserId() - สร้าง/ดึง User ID
 *   - generateSessionId() - สร้าง Session ID ใหม่
 *   - getPlatformInfo() - ดึงข้อมูลอุปกรณ์
 *   - isMobileDevice() - ตรวจสอบ Mobile/Tablet
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 0.6
 * @version 1.0 (2024-12-24)
 * ============================================================================
 */

/**
 * สร้างหรือดึง User ID จาก LocalStorage
 *
 * @description
 *   สร้าง ID ที่ไม่ซ้ำกันสำหรับแต่ละผู้ใช้
 *   เก็บใน LocalStorage เพื่อให้คงที่ตลอดการใช้งาน
 *   ใช้สำหรับ Track ข้อมูลการฝึกของแต่ละคน
 *
 * @returns {string} User ID (เช่น "user_lxyz123ab")
 */
function getOrCreateUserId() {
  let userId = localStorage.getItem("taijiflow_user_id");
  if (!userId) {
    // สร้าง ID ใหม่: "user_" + timestamp(base36) + random(5 chars)
    userId =
      "user_" +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2, 5);
    localStorage.setItem("taijiflow_user_id", userId);
  }
  return userId;
}

/**
 * สร้าง Session ID ใหม่
 *
 * @description
 *   สร้าง ID ที่ไม่ซ้ำกันสำหรับแต่ละ Session การฝึก
 *   เรียกทุกครั้งที่เริ่มบันทึกใหม่
 *
 * @returns {string} Session ID (เช่น "sess_lxyz123ab")
 */
function generateSessionId() {
  return (
    "sess_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  );
}

/**
 * ดึงข้อมูล Platform/Device
 *
 * @description
 *   เก็บข้อมูลอุปกรณ์สำหรับ Analytics และ Debug
 *   ช่วยให้เข้าใจว่าผู้ใช้ใช้อุปกรณ์ใดบ้าง
 *
 * @returns {Object} ข้อมูล Platform
 */
function getPlatformInfo() {
  const ua = navigator.userAgent;
  return {
    userAgent: ua,
    platform: navigator.platform,
    isMobile: /Android|iPhone|iPad|iPod/i.test(ua),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
  };
}

/**
 * ตรวจสอบว่าเป็น Mobile/Tablet หรือไม่
 * ใช้สำหรับข้าม export ไฟล์บนอุปกรณ์ที่มี memory จำกัด
 *
 * หมายเหตุ: iPadOS 13+ รายงานตัวเองเป็น desktop Safari
 * ต้องใช้ maxTouchPoints เพิ่มเติมในการตรวจจับ
 *
 * @returns {boolean} true = Mobile/Tablet, false = Desktop
 */
function isMobileDevice() {
  const ua = navigator.userAgent;

  // ตรวจจับ Mobile/Tablet ทั่วไป
  const isMobile =
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  // ตรวจจับ iPad ที่รายงานตัวเองเป็น Mac (iPadOS 13+)
  // iPad จะมี maxTouchPoints > 1 แต่ Mac ปกติจะมี 0
  const isIPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isMobile || isIPadOS;
}

// =============================================================================
// EXPORT (for testing)
// =============================================================================
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getOrCreateUserId,
    generateSessionId,
    getPlatformInfo,
    isMobileDevice,
  };
}
