/**
 * TaijiFlow AI - Drawing Manager v1.0
 * รับผิดชอบการวาดภาพทั้งหมดลงบน Canvas
 *
 * Features:
 * - วาด Skeleton (โครงกระดูก) จาก MediaPipe landmarks
 * - วาด Reference Path (เส้นทางต้นแบบ)
 * - วาด Feedback Panel (กล่องแสดงข้อผิดพลาด)
 */
class DrawingManager {
  constructor(canvasCtx, canvasElement) {
    this.ctx = canvasCtx;
    this.canvasWidth = canvasElement.width;
    this.canvasHeight = canvasElement.height;
    this.mirrorDisplay = false; // Webcam ส่งภาพ mirror มาแล้ว ไม่ต้อง flip เพิ่ม
  }

  /**
   * เปิด/ปิด Mirror Mode
   * @param {boolean} enabled - true = mirror, false = no mirror
   */
  setMirror(enabled) {
    this.mirrorDisplay = enabled;
  }

  /**
   * วาดโครงกระดูก (Pose Landmarks)
   * @param {object[]} landmarks - ข้อมูลตำแหน่งข้อต่อจาก MediaPipe
   */
  drawSkeleton(landmarks) {
    this.ctx.save();
    // Fullscreen: ต้อง mirror เพิ่ม (ใช้ตัวแปร global isFullscreen จาก script.js)
    // ปกติ: mirrorDisplay = false เพราะ webcam ส่ง mirror มาแล้ว
    const shouldMirror =
      this.mirrorDisplay ||
      (typeof isFullscreen !== "undefined" && isFullscreen);
    if (shouldMirror) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.canvasWidth, 0);
    }

    drawConnectors(this.ctx, landmarks, POSE_CONNECTIONS, {
      color: "#FFFFFF",
      lineWidth: 4,
    });
    drawLandmarks(this.ctx, landmarks, {
      color: "#FF0000",
      lineWidth: 2,
      radius: 4,
    });

    this.ctx.restore();
  }

  /**
   * วาดเส้นทางการเคลื่อนที่ต้นแบบ (Reference Path)
   * @param {object[]} path - Array ของจุด {x, y}
   * @param {string} color - สีของเส้น
   * @param {number} width - ความหนาของเส้น
   */
  drawPath(path, color, width) {
    this.ctx.save();
    // Fullscreen: ต้อง mirror เพิ่ม
    const shouldMirror =
      this.mirrorDisplay ||
      (typeof isFullscreen !== "undefined" && isFullscreen);
    if (shouldMirror) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.canvasWidth, 0);
    }

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    if (path.length > 0) {
      this.ctx.moveTo(
        path[0].x * this.canvasWidth,
        path[0].y * this.canvasHeight
      );
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

  /**
   *
   * @param {string[]} feedback
   */
  drawGestureFeedback(feedback) {
    if (!feedback || !feedback.hand) return;

    // เราจะใช้ landmark ที่ 9 (โคนนิ้วกลาง) เป็นจุดศูนย์กลางของวงกลม
    const handlandmark = feedback.hand[9];
    if (!handlandmark) return;

    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;

    const x = handlandmark.x * canvasWidth;
    const y = handlandmark.y * canvasHeight;
    const radius = 40;

    this.ctx.save();

    // วาดวงกลมพื้นหลังโปร่งแสง
    this.ctx.globalAlpha = 0.5;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = "white";
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;

    // วาดเส้นโค้งแสดงความคืบหน้าการกดค้าง
    this.ctx.beginPath();
    // เริ่มวาดจากด้านบน (-90 องศา)
    this.ctx.arc(
      x,
      y,
      radius,
      -0.5 * Math.PI,
      (-0.5 + 2 * feedback.progress) * Math.PI
    );
    this.ctx.strokeStyle = "#00FF00"; // สีเขียว
    this.ctx.lineWidth = 8;
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * วาดกล่องแสดงข้อความ Feedback
   * @param {string[]} feedbacks - Array ของข้อความที่จะแสดง
   */
  drawFeedbackPanel(feedbacks) {
    if (!feedbacks || feedbacks.length === 0) return;

    const boxX = 20,
      boxY = 20,
      padding = 15,
      lineHeight = 30;
    const boxWidth = 450;
    const boxHeight = feedbacks.length * lineHeight + padding * 2;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    this.ctx.fill();

    this.ctx.font = 'bold 20px "Sarabun", sans-serif';
    this.ctx.fillStyle = "#FFD700";
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

  /**
   * วาด Debug Overlay แสดงค่าตัวแปรสำคัญ
   * @param {object} debugInfo - ข้อมูล debug จาก HeuristicsEngine
   */
  drawDebugOverlay(debugInfo) {
    if (!debugInfo || Object.keys(debugInfo).length === 0) return;

    const boxX = this.canvasWidth - 300;
    const boxY = 20;
    const padding = 10;
    const lineHeight = 22;
    const entries = Object.entries(debugInfo);
    const boxWidth = 280;
    const boxHeight = entries.length * lineHeight + padding * 2 + 25;

    // Background
    this.ctx.fillStyle = "rgba(0, 0, 50, 0.85)";
    this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
    this.ctx.fill();

    // Border
    this.ctx.strokeStyle = "#00FFFF";
    this.ctx.lineWidth = 2;
    this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
    this.ctx.stroke();

    // Title
    this.ctx.font = 'bold 14px "Consolas", monospace';
    this.ctx.fillStyle = "#00FFFF";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText("🔧 DEBUG MODE", boxX + padding, boxY + padding);

    // Debug values
    this.ctx.font = '12px "Consolas", monospace';
    this.ctx.fillStyle = "#00FF00";

    entries.forEach(([key, value], index) => {
      const displayKey = key.replace(/([A-Z])/g, " $1").trim(); // camelCase to space
      this.ctx.fillText(
        `${displayKey}: ${value}`,
        boxX + padding,
        boxY + padding + 25 + index * lineHeight
      );
    });
  }
}
