/**
 * TaijiFlow AI - Drawing Manager
 * รับผิดชอบการวาดภาพทั้งหมดลงบน Canvas
 */
class DrawingManager {
  constructor(canvasCtx, canvasElement) {
    this.ctx = canvasCtx;
    this.canvasWidth = canvasElement.width;
    this.canvasHeight = canvasElement.height;
  }

  /**
   * วาดโครงกระดูก (Pose Landmarks)
   * @param {object[]} landmarks - ข้อมูลตำแหน่งข้อต่อจาก MediaPipe
   */
  drawSkeleton(landmarks) {
    this.ctx.save();
    // กลับด้านภาพให้เหมือนกระจกเงา
    this.ctx.scale(-1, 1);
    this.ctx.translate(-this.canvasWidth, 0);

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
    // กลับด้านภาพให้เหมือนกระจกเงา
    this.ctx.scale(-1, 1);
    this.ctx.translate(-this.canvasWidth, 0);

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
}
