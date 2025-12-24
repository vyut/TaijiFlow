/**
 * ============================================================================
 * TaijiFlow AI - Path Generator v1.0
 * ============================================================================
 *
 * สร้าง Dynamic Path วงกลมจากสัดส่วนร่างกายผู้ฝึก
 *
 * @description
 *   ไฟล์นี้รับผิดชอบการสร้าง Reference Path แบบ Dynamic
 *   ปรับตามสัดส่วนผู้ฝึกจริง ไม่ใช่ Fixed Path จาก JSON
 *
 * 📋 หน้าที่หลัก:
 *   - คำนวณ center point จากตำแหน่งไหล่และสะโพก
 *   - คำนวณ radius จากความยาวแขน
 *   - สร้างจุดบนวงกลม 72 จุด (ทุก 5°)
 *   - รองรับทิศทาง cw (ตามเข็ม) และ ccw (ทวนเข็ม)
 *
 * 📊 การใช้งาน:
 *   const path = generateDynamicPath(landmarks, 'rh_cw');
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 0.6
 * @version 1.0 (2024-12-24)
 * ============================================================================
 */

/**
 * สร้าง Dynamic Path วงกลมจากสัดส่วนผู้ฝึก
 *
 * @param {Object[]} landmarks - 33 จุดจาก MediaPipe Pose
 * @param {string} exercise - ท่าที่เลือก (rh_cw, rh_ccw, lh_cw, lh_ccw)
 * @returns {Object[]} - Array ของจุด {x, y} เป็นวงกลม
 *
 * @example
 *   // ท่ามือขวา ตามเข็มนาฬิกา
 *   const path = generateDynamicPath(landmarks, 'rh_cw');
 *   drawer.drawPath(path, 'rgba(0,255,0,0.5)', 4);
 */
function generateDynamicPath(landmarks, exercise) {
  // Guard: ต้องมี landmarks อย่างน้อย 25 จุด
  if (!landmarks || landmarks.length < 25) return [];

  // 1. เลือกมือซ้าย/ขวาตามท่าที่เลือก
  const isRightHand = exercise.startsWith("rh");
  const shoulder = isRightHand ? landmarks[12] : landmarks[11];
  const hip = isRightHand ? landmarks[24] : landmarks[23];
  const wrist = isRightHand ? landmarks[16] : landmarks[15];

  // 2. คำนวณ center (ด้านหน้า-ข้างลำตัว ระดับหน้าอก)
  //    - X: ระหว่างไหล่กับกึ่งกลางลำตัว
  //    - Y: ลงจากไหล่ 30% ของระยะไหล่-สะโพก
  const bodyCenter = (landmarks[11].x + landmarks[12].x) / 2;
  const centerX = (shoulder.x + bodyCenter) / 2;
  const centerY = shoulder.y + (hip.y - shoulder.y) * 0.3;

  // 3. คำนวณ radius (~85% ของความยาวแขน)
  const armLength = Math.hypot(shoulder.x - wrist.x, shoulder.y - wrist.y);
  const radius = armLength * 0.85;

  // 4. Generate circle points (72 จุด, ทุก 5°)
  const points = [];
  const numPoints = 72;
  const direction = exercise.includes("cw") ? 1 : -1; // cw = ตามเข็ม, ccw = ทวนเข็ม

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 5 * direction * Math.PI) / 180;
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  console.log(
    `[DynamicPath] Generated ${points.length} points, ` +
      `center=(${centerX.toFixed(2)}, ${centerY.toFixed(2)}), ` +
      `radius=${radius.toFixed(2)}`
  );

  return points;
}

// =============================================================================
// EXPORT (for testing)
// =============================================================================
if (typeof module !== "undefined" && module.exports) {
  module.exports = { generateDynamicPath };
}
