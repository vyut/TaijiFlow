/**
 * TaijiFlow AI - Calibration Manager v1.1
 * จัดการการปรับเทียบสัดส่วนร่างกายผู้ใช้ผ่านท่า T-Pose
 * 
 * Features:
 * - วัด Torso Height, Shoulder Width, Arm Length
 * - ใช้สำหรับ Dynamic Thresholds ใน HeuristicsEngine
 * - รองรับ 2 ภาษา (TH/EN)
 */
class CalibrationManager {
  constructor() {
    this.isActive = false;
    this.isComplete = false;
    this.calibrationData = null;
    this.lang = "th"; // ภาษาปัจจุบัน

    // ตัวแปรสำหรับจับเวลาและความนิ่ง
    this.stableFrames = 0;
    this.REQUIRED_STABLE_FRAMES = 90; // ต้องยืนนิ่งๆ ประมาณ 3 วินาที (30fps)
    this.statusText = "";

    // ข้อความ 2 ภาษา
    this.texts = {
      th: {
        tpose: "กรุณายืนตัวตรง กางแขน (T-Pose)",
        backUp: "ถอยหลังอีกนิด! (ให้เห็นทั้งตัว)",
        armsUp: "กางแขนระดับไหล่ (T-Pose)",
        holdStill: "อยู่นิ่งๆ...",
        complete: "✅ ปรับเทียบเสร็จสมบูรณ์!",
        cancel: "(กดปุ่ม 'ยกเลิก' หากต้องการหยุด)",
      },
      en: {
        tpose: "Stand straight, arms out (T-Pose)",
        backUp: "Step back! (Full body visible)",
        armsUp: "Raise arms to shoulder level (T-Pose)",
        holdStill: "Hold still...",
        complete: "✅ Calibration complete!",
        cancel: "(Press 'Cancel' to stop)",
      },
    };
  }

  setLanguage(lang) {
    this.lang = lang === "th" ? "th" : "en";
  }

  getText(key) {
    return this.texts[this.lang][key] || this.texts.th[key];
  }

  start() {
    this.isActive = true;
    this.isComplete = false;
    this.stableFrames = 0;
    this.calibrationData = null;
    this.statusText = this.getText("tpose");
    console.log("Calibration Started");
  }

  cancel() {
    this.isActive = false;
    this.isComplete = false;
    this.stableFrames = 0;
    this.statusText = "";
    console.log("Calibration Cancelled");
  }

  process(landmarks) {
    if (!this.isActive || this.isComplete) return null;

    // 1. ตรวจสอบว่ายืนเต็มตัวหรือไม่ (ต้องเห็นข้อเท้าและไหล่)
    const requiredIndices = [11, 12, 23, 24, 27, 28]; // ไหล่, สะโพก, ข้อเท้า
    const isVisible = requiredIndices.every(
      (index) => landmarks[index] && landmarks[index].visibility > 0.5
    );

    if (!isVisible) {
      this.statusText = this.getText("backUp");
      this.stableFrames = 0;
      return { status: "adjusting", message: this.statusText };
    }

    // 2. ตรวจสอบท่า T-Pose คร่าวๆ (มือต้องอยู่สูงระดับไหล่)
    const wristY = (landmarks[15].y + landmarks[16].y) / 2;
    const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;

    // ใช้ค่า 0.2 เป็น threshold (ปรับจูนได้)
    if (Math.abs(wristY - shoulderY) > 0.2) {
      this.statusText = this.getText("armsUp");
      this.stableFrames = 0;
      return { status: "adjusting", message: this.statusText };
    }

    // 3. เริ่มนับถอยหลังเมื่อท่านิ่ง
    this.stableFrames++;
    if (this.stableFrames < this.REQUIRED_STABLE_FRAMES) {
      const timeLeft = Math.ceil(
        (this.REQUIRED_STABLE_FRAMES - this.stableFrames) / 30
      );
      this.statusText = `${this.getText("holdStill")} ${timeLeft}`;
      return { status: "measuring", message: this.statusText };
    }

    // 4. บันทึกค่า (Capture Metrics)
    this.calibrationData = this.calculateMetrics(landmarks);
    this.isComplete = true;
    this.isActive = false;
    this.statusText = this.getText("complete");


    return {
      status: "complete",
      message: this.statusText,
      data: this.calibrationData,
    };
  }

  calculateMetrics(landmarks) {
    // คำนวณความสูงลำตัว (Torso Height)
    const midShoulderY = (landmarks[11].y + landmarks[12].y) / 2;
    const midHipY = (landmarks[23].y + landmarks[24].y) / 2;
    const torsoHeight = Math.abs(midHipY - midShoulderY);

    // คำนวณความกว้างไหล่ (Shoulder Width)
    const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);

    // คำนวณความยาวแขน (Arm Length)
    const dist = (p1, p2) =>
      Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    const armLength =
      dist(landmarks[12], landmarks[14]) + dist(landmarks[14], landmarks[16]);

    console.log("Calibration Data:", { torsoHeight, shoulderWidth, armLength });

    return { torsoHeight, shoulderWidth, armLength };
  }

  drawOverlay(ctx, canvasWidth, canvasHeight) {
    if (!this.isActive) return;

    // วาดพื้นหลังสีดำจางๆ (อันนี้ไม่ต้องกลับด้าน)
    ctx.save();
    // Reset transformation เพื่อวาดเต็มจอแน่นอน
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // --- ส่วนวาดข้อความ (ต้องแก้ Mirror) ---
    ctx.save();

    // *** FIX: พลิก Canvas กลับด้านเฉพาะตอนวาดตัวหนังสือ ***
    // เนื่องจาก Context หลัก (ใน script.js) ถูก Mirror ไว้ (-1, 1)
    // เราต้อง Scale (-1, 1) อีกครั้งเพื่อกลับเป็นปกติ
    // และ Translate กลับมาที่จุดเดิม
    // ctx.scale(-1, 1);
    // ctx.translate(-canvasWidth, 0);

    // วาดข้อความสถานะ
    ctx.font = "bold 40px 'Sarabun', sans-serif";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.fillText(this.statusText, canvasWidth / 2, canvasHeight / 2);

    // วาดข้อความแนะนำปุ่ม Cancel (ถ้าต้องการวาดบนจอ)
    ctx.font = "20px 'Sarabun', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      this.getText("cancel"),
      canvasWidth / 2,
      canvasHeight / 2 + 50
    );

    ctx.restore();
  }
}
