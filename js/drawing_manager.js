/**
 * ============================================================================
 * TaijiFlow AI - Drawing Manager v1.0
 * ============================================================================
 *
 * รับผิดชอบการวาดภาพทั้งหมดลงบน Canvas
 *
 * 🎨 Features:
 *   - วาด Skeleton (โครงกระดูก) จาก MediaPipe landmarks
 *   - วาด Reference Path (เส้นทางต้นแบบ)
 *   - วาด Feedback Panel (กล่องแสดงข้อผิดพลาด)
 *   - วาด Gesture Progress (วงกลมความคืบหน้าท่าทาง)
 *   - วาด Debug Overlay (แสดงค่า Threshold และค่าวัด)
 *
 * 🗒️ หมายเหตุ Mirror:
 *   - Webcam ส่งภาพ mirror มาแล้ว (เหมือนส่องกระจก)
 *   - แต่ Skeleton และ Path ต้อง mirror เพิ่มเมื่อ Fullscreen
 *   - ใช้ scale(-1, 1) + translate เพื่อพลิกภาพ
 *
 * 📊 Coordinate System:
 *   - landmarks อยู่ในหน่วย normalized (0-1)
 *   - คูณ canvasWidth/Height เพื่อแปลงเป็น pixel
 *
 * ============================================================================
 */
class DrawingManager {
  /**
   * @param {CanvasRenderingContext2D} canvasCtx - Canvas 2D context
   * @param {HTMLCanvasElement} canvasElement - Canvas element
   */
  constructor(canvasCtx, canvasElement) {
    // =========================================================================
    // 📁 STATE: เก็บ reference และขนาด
    // =========================================================================
    this.ctx = canvasCtx; // Canvas 2D context สำหรับวาด
    this.canvasWidth = canvasElement.width; // ความกว้าง (pixel)
    this.canvasHeight = canvasElement.height; // ความสูง (pixel)
    this.mirrorDisplay = false; // Mirror mode (ปกติ = false เพราะ webcam mirror มาแล้ว)
  }

  // ===========================================================================
  // 🛠️ CONFIG METHODS: ตั้งค่า
  // ===========================================================================

  /**
   * เปิด/ปิด Mirror Mode
   * ใช้เมื่อต้องการพลิกภาพเพิ่มเติม (เช่น Fullscreen)
   * @param {boolean} enabled - true = mirror, false = ไม่ mirror
   */
  setMirror(enabled) {
    this.mirrorDisplay = enabled;
  }

  // ===========================================================================
  // 🗃️ SKELETON: วาดโครงกระดูก
  // ===========================================================================

  /**
   * วาดโครงกระดูก (Pose Landmarks)
   * ใช้ฟังก์ชัน MediaPipe: drawConnectors, drawLandmarks
   *
   * @param {Object[]} landmarks - 33 จุดจาก MediaPipe Pose
   */
  drawSkeleton(landmarks) {
    this.ctx.save();

    // ----- Mirror Logic -----
    // Fullscreen ต้อง mirror เพิ่ม (เพราะไม่ได้ผ่าน webcam mirror ของ browser)
    // isFullscreen เป็น global variable จาก script.js
    const shouldMirror =
      this.mirrorDisplay ||
      (typeof isFullscreen !== "undefined" && isFullscreen);
    if (shouldMirror) {
      this.ctx.scale(-1, 1); // พลิกแนวนอน
      this.ctx.translate(-this.canvasWidth, 0); // ย้ายกลับมา
    }

    // ----- วาดเส้นเชื่อมข้อต่อ -----
    drawConnectors(this.ctx, landmarks, POSE_CONNECTIONS, {
      color: "#FFFFFF", // สีขาว
      lineWidth: 4, // เส้นหนา 4px
    });

    // ----- วาดจุดข้อต่อ -----
    drawLandmarks(this.ctx, landmarks, {
      color: "#FF0000", // สีแดง
      lineWidth: 2,
      radius: 4, // วงกลมรัศมี 4px
    });

    this.ctx.restore();
  }

  // ===========================================================================
  // 🟣 REFERENCE PATH: วาดเส้นทางต้นแบบ
  // ===========================================================================

  /**
   * วาดเส้นทางการเคลื่อนที่ต้นแบบ (Reference Path)
   * แปลง normalized coords (0-1) เป็น pixel coords
   *
   * @param {Object[]} path - Array ของจุด {x, y} (หน่วย normalized 0-1)
   * @param {string} color - สีของเส้น (CSS color)
   * @param {number} width - ความหนาของเส้น (pixel)
   */
  drawPath(path, color, width) {
    this.ctx.save();

    // ----- Mirror Logic (เหมือน drawSkeleton) -----
    const shouldMirror =
      this.mirrorDisplay ||
      (typeof isFullscreen !== "undefined" && isFullscreen);
    if (shouldMirror) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.canvasWidth, 0);
    }

    // ----- วาดเส้นทาง -----
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    if (path.length > 0) {
      // ย้ายไปยังจุดแรก (แปลง normalized → pixel)
      this.ctx.moveTo(
        path[0].x * this.canvasWidth,
        path[0].y * this.canvasHeight
      );
      // ลากเส้นไปยังจุดถัดไป
      for (let i = 1; i < path.length; i++) {
        this.ctx.lineTo(
          path[i].x * this.canvasWidth,
          path[i].y * this.canvasHeight
        );
      }
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  // ===========================================================================
  // ⭕ GESTURE FEEDBACK: วาดวงกลมความคืบหน้าท่าทาง
  // ===========================================================================

  /**
   * วาดวงกลมแสดงความคืบหน้าการกดท่าทางค้าง
   * สำหรับ Gesture Start/Stop ด้วยท่าทางมือ
   *
   * @param {Object} feedback - { hand: landmarks[], progress: 0-1 }
   */
  drawGestureFeedback(feedback) {
    if (!feedback || !feedback.hand) return;

    // ใช้ landmark ที่ 9 (โคนนิ้วกลาง) เป็นจุดศูนย์กลางของวงกลม
    const handlandmark = feedback.hand[9];
    if (!handlandmark) return;

    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;

    // แปลง normalized → pixel
    const x = handlandmark.x * canvasWidth;
    const y = handlandmark.y * canvasHeight;
    const radius = 40;

    this.ctx.save();

    // ----- วงกลมพื้นหลังโปร่งแสง -----
    this.ctx.globalAlpha = 0.5;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = "white";
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;

    // ----- เส้นโค้งแสดง Progress -----
    // เริ่มจากด้านบน (-90°) และวาดตาม progress
    this.ctx.beginPath();
    this.ctx.arc(
      x,
      y,
      radius,
      -0.5 * Math.PI, // เริ่ม -90° (ด้านบน)
      (-0.5 + 2 * feedback.progress) * Math.PI // หมุนตาม progress
    );
    this.ctx.strokeStyle = "#00FF00"; // สีเขียว
    this.ctx.lineWidth = 8;
    this.ctx.stroke();

    this.ctx.restore();
  }

  // ===========================================================================
  // 🟨 FEEDBACK PANEL: กล่องแสดงข้อผิดพลาด
  // ===========================================================================

  /**
   * วาดกล่องแสดงข้อความ Feedback
   * อยู่มุมซ้ายบน พื้นหลังดำโปร่งใส
   *
   * @param {string[]} feedbacks - Array ของข้อความที่จะแสดง
   */
  drawFeedbackPanel(feedbacks) {
    if (!feedbacks || feedbacks.length === 0) return;

    // ----- Position & Size -----
    const boxX = 20,
      boxY = 20,
      padding = 15,
      lineHeight = 30;
    const boxWidth = 450;
    const boxHeight = feedbacks.length * lineHeight + padding * 2;

    // ----- พื้นหลังกล่อง -----
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    this.ctx.fill();

    // ----- ข้อความ -----
    this.ctx.font = 'bold 20px "Sarabun", sans-serif';
    this.ctx.fillStyle = "#FFD700"; // สีทอง
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    feedbacks.forEach((text, index) => {
      this.ctx.fillText(
        text,
        boxX + padding,
        boxY + padding + index * lineHeight
      );
    });
  }

  // ===========================================================================
  // 🔧 DEBUG OVERLAY: แสดงค่า Debug (กด D เพื่อเปิด)
  // ===========================================================================

  /**
   * วาด Debug Overlay แสดงค่าตัวแปรสำคัญ
   * อยู่มุมขวาบน พื้นหลังสีน้ำเงินเข้ม
   *
   * @param {Object} debugInfo - ข้อมูล debug จาก HeuristicsEngine
   *   - pathDistance: ระยะห่างจาก path
   *   - pathThreshold: ค่า threshold ที่ใช้
   *   - wristVelocity: ความเร็วข้อมือ
   *   - acceleration: ความเร่ง
   */
  drawDebugOverlay(debugInfo) {
    if (!debugInfo || Object.keys(debugInfo).length === 0) return;

    // ----- Position & Size -----
    const boxX = this.canvasWidth - 300; // มุมขวาบน
    const boxY = 20;
    const padding = 10;
    const lineHeight = 22;
    const entries = Object.entries(debugInfo);
    const boxWidth = 280;
    const boxHeight = entries.length * lineHeight + padding * 2 + 25;

    // ----- พื้นหลังกล่อง -----
    this.ctx.fillStyle = "rgba(0, 0, 50, 0.85)"; // สีน้ำเงินเข้ม
    this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
    this.ctx.fill();

    // ----- ขอบ -----
    this.ctx.strokeStyle = "#00FFFF"; // สีฟ้า
    this.ctx.lineWidth = 2;
    this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
    this.ctx.stroke();

    // ----- หัวข้อ -----
    this.ctx.font = 'bold 14px "Consolas", monospace';
    this.ctx.fillStyle = "#00FFFF";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText("🔧 DEBUG MODE", boxX + padding, boxY + padding);

    // ----- ค่าตัวแปร -----
    this.ctx.font = '12px "Consolas", monospace';
    this.ctx.fillStyle = "#00FF00"; // สีเขียว

    entries.forEach(([key, value], index) => {
      // แปลง camelCase เป็น "camel Case"
      const displayKey = key.replace(/([A-Z])/g, " $1").trim();
      this.ctx.fillText(
        `${displayKey}: ${value}`,
        boxX + padding,
        boxY + padding + 25 + index * lineHeight
      );
    });
  }
}
