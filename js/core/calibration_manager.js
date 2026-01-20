/**
 * ============================================================================
 * TaijiFlow AI - Calibration Manager v1.1
 * ============================================================================
 *
 * จัดการการปรับเทียบ (Calibration) สัดส่วนร่างกายผู้ใช้ผ่านท่า T-Pose
 * เพื่อนำไปปรับ Dynamic Thresholds ใน HeuristicsEngine
 *
 * 📋 หน้าที่หลัก:
 *   - ตรวจจับท่า T-Pose ของผู้ใช้
 *   - วัดสัดส่วน: Torso Height, Shoulder Width, Arm Length
 *   - บันทึก/โหลด ข้อมูลจาก LocalStorage
 *
 * 🎯 การทำงาน:
 *   1. เริ่ม Calibration → แสดง Overlay
 *   2. ผู้ใช้ยืน T-Pose → ตรวจสอบ visibility และท่า
 *   3. ยืนนิ่ง 3 วินาที → บันทึกสัดส่วน
 *   4. ส่งข้อมูลให้ HeuristicsEngine
 *
 * 📊 ข้อมูลที่วัด:
 *   - torsoHeight: ความสูงลำตัว (ไหล่ถึงสะโพก)
 *   - shoulderWidth: ความกว้างไหล่ (ไหล่ซ้ายถึงขวา)
 *   - armLength: ความยาวแขน (ไหล่ถึงข้อมือ)
 *
 * 📖 การใช้งาน:
 *   const calibration = new CalibrationManager();
 *   calibration.start();
 *   const result = calibration.process(landmarks);
 *   if (result.status === 'complete') {
 *     engine.setCalibration(result.data);
 *   }
 *
 * ============================================================================
 */
class CalibrationManager {
  constructor() {
    // =========================================================================
    // 📁 STATE: ตัวแปรสถานะการทำงาน
    // =========================================================================

    // --- Calibration State ---
    this.isActive = false; // กำลัง Calibrate อยู่หรือไม่
    this.isComplete = false; // Calibrate เสร็จแล้วหรือยัง
    this.calibrationData = null; // ข้อมูลสัดส่วนที่วัดได้ { torsoHeight, shoulderWidth, armLength }
    this.lang = "th"; // ภาษาปัจจุบัน (th/en)
    this.currentLevel = null; // Level ที่เลือก (L1, L2, L3) - ใช้กำหนด visibility requirement

    this.stabilityStartTime = null; // เริ่มนับเวลาเมื่อยืนนิ่ง
    this.REQUIRED_STABLE_TIME = 3000; // 3 วินาที
    this.statusText = ""; // ข้อความที่จะแสดงบน Overlay

    // =========================================================================
    // 🌐 TEXTS: ข้อความ 2 ภาษา (TH/EN)
    // =========================================================================
    this.texts = {
      th: {
        tpose: "กรุณายืนกางแขน (T-Pose)",
        backUp: "กรุณายืนกางแขน (T-Pose)",
        armsUp: "กางแขนระดับไหล่",
        holdStill: "อยู่นิ่งๆ... ",
        complete: "✅ ปรับเทียบเสร็จสมบูรณ์!",
        cancel: "ถอยหลังอีกนิด! (ให้เห็นทั้งตัว)",
      },
      en: {
        tpose: "Stand with arms out (T-Pose)",
        backUp: "Stand with arms out (T-Pose)",
        armsUp: "Raise arms to shoulder level",
        holdStill: "Hold still... ",
        complete: "✅ Calibration complete!",
        cancel: "Step back! (Full body visible)",
      },
    };
  }

  // ===========================================================================
  // 🌐 LANGUAGE METHODS: จัดการภาษา
  // ===========================================================================

  /**
   * ตั้งค่าภาษา
   * @param {string} lang - 'th' หรือ 'en'
   */
  setLanguage(lang) {
    this.lang = lang === "th" ? "th" : "en";
  }

  /**
   * ดึงข้อความตามภาษาปัจจุบัน
   * @param {string} key - key ของข้อความ
   */
  getText(key) {
    return this.texts[this.lang][key] || this.texts.th[key];
  }

  /**
   * ตั้งค่า Level สำหรับกำหนด visibility requirement
   * L1-L2: ไม่ต้องเห็นข้อเท้า
   * L3: ต้องเห็นทั้งตัว (รวมข้อเท้า)
   * @param {string} level - 'L1', 'L2', หรือ 'L3'
   */
  setLevel(level) {
    this.currentLevel = level;
  }

  // ===========================================================================
  // 💾 LOCALSTORAGE METHODS: บันทึก/โหลดข้อมูล
  // ===========================================================================

  /** Key สำหรับเก็บข้อมูลใน LocalStorage */
  static STORAGE_KEY = "taijiflow_calibration_data";

  /**
   * บันทึก Calibration Data ลง LocalStorage
   * เพิ่ม savedAt timestamp เพื่อตรวจสอบความเก่าของข้อมูล
   */
  saveToStorage() {
    if (this.calibrationData) {
      const data = {
        ...this.calibrationData,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        CalibrationManager.STORAGE_KEY,
        JSON.stringify(data)
      );
      console.log("Calibration data saved to LocalStorage");
    }
  }

  /**
   * โหลด Calibration Data จาก LocalStorage
   * @returns {Object|null} ข้อมูลที่โหลด หรือ null ถ้าไม่มี
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(CalibrationManager.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.calibrationData = data;
        this.isComplete = true;
        console.log("Calibration data loaded from LocalStorage:", data);
        return data;
      }
    } catch (e) {
      console.warn("Failed to load calibration data:", e);
    }
    return null;
  }

  /**
   * เช็คว่ามีข้อมูลใน LocalStorage หรือไม่
   */
  hasStoredData() {
    return localStorage.getItem(CalibrationManager.STORAGE_KEY) !== null;
  }

  /**
   * ลบ Calibration Data จาก LocalStorage (สำหรับการ recalibrate)
   */
  clearStorage() {
    localStorage.removeItem(CalibrationManager.STORAGE_KEY);
    console.log("Calibration data cleared from LocalStorage");
  }

  // ===========================================================================
  // ▶️ START/STOP METHODS: เริ่ม/หยุดการ Calibrate
  // ===========================================================================

  /**
   * เริ่ม Calibration - Reset state และเปิด Overlay
   */
  start() {
    this.isActive = true;
    this.isComplete = false;
    this.stabilityStartTime = null;
    this.calibrationData = null;
    this.statusText = this.getText("tpose");
    console.log("Calibration Started");
  }

  /**
   * ยกเลิก Calibration - ปิด Overlay โดยไม่บันทึก
   */
  cancel() {
    this.isActive = false;
    this.isComplete = false;
    this.stabilityStartTime = null;
    this.statusText = "";
    console.log("Calibration Cancelled");
  }

  /**
   * หยุด Calibration (สำเร็จ) - ปิด Active แต่เก็บสถานะ Complete ไว้
   */
  stop() {
    this.isActive = false;
    // ไม่ Reset isComplete หรือ Data เพราะเป็นการหยุดแบบสำเร็จ
    this.statusText = "";
    console.log("Calibration Stopped (Success)");
  }

  // ===========================================================================
  // 🎯 PROCESS: ตรวจสอบท่า T-Pose และวัดสัดส่วน
  // ===========================================================================

  process(landmarks) {
    // Guard: ไม่ได้เปิด active หรือ Calibrate เสร็จแล้ว
    if (!this.isActive || this.isComplete) return null;

    // ----- Step 1: ตรวจ Visibility -----
    const requiredIndices =
      this.currentLevel === "L3"
        ? [11, 12, 23, 24, 27, 28] // L3: เห็นทั้งตัว
        : [11, 12, 23, 24]; // L1-L2: ครึ่งบน

    const isVisible = requiredIndices.every(
      (index) => landmarks[index] && landmarks[index].visibility > 0.5
    );

    if (!isVisible) {
      this.statusText = this.getText("backUp");
      this.stabilityStartTime = null; // Reset เมื่อท่าไม่ถูก
      return { status: "adjusting", message: this.statusText };
    }

    // ----- Step 2: ตรวจท่า T-Pose -----
    const wristY = (landmarks[15].y + landmarks[16].y) / 2;
    const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
    const armThreshold = 0.2; // 20% ของหน้าจอ

    if (Math.abs(wristY - shoulderY) > armThreshold) {
      this.statusText = this.getText("armsUp");
      this.stabilityStartTime = null;
      return { status: "adjusting", message: this.statusText };
    }

    // ----- Step 3: นับถอยหลัง (Time-based Logic) -----
    // เริ่มนับเวลาถ้ายืนนิ่งครั้งแรก
    if (this.stabilityStartTime === null) {
      this.stabilityStartTime = Date.now();
    }

    const elapsed = Date.now() - this.stabilityStartTime;

    if (elapsed < this.REQUIRED_STABLE_TIME) {
      // ยังไม่ครบ 3 วิ
      const timeLeft = Math.ceil((this.REQUIRED_STABLE_TIME - elapsed) / 1000);
      this.statusText = `${this.getText("holdStill")} ${timeLeft}`;
      return { status: "measuring", message: this.statusText };
    }

    // ----- Step 4: บันทึกสัดส่วน -----
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

  // ===========================================================================
  // 📏 CALCULATE METRICS: คำนวณสัดส่วนร่างกาย
  // ===========================================================================

  /**
   * คำนวณสัดส่วนร่างกายจาก T-Pose
   *
   *           [Shoulder Left]----[Shoulder Right]
   *                  |                 |
   *              [Elbow]           [Elbow]
   *                  |                 |
   *              [Wrist]           [Wrist]
   *                  |
   *           [Hip Center]
   *
   * @param {Object[]} landmarks - 33 จุดจาก MediaPipe
   * @returns {Object} { torsoHeight, shoulderWidth, armLength }
   */
  calculateMetrics(landmarks) {
    // --- Torso Height ---
    // ความสูงลำตัว = ระยะห่างกึ่งกลางไหล่ ถึง กึ่งกลางสะโพก
    const midShoulderY = (landmarks[11].y + landmarks[12].y) / 2;
    const midHipY = (landmarks[23].y + landmarks[24].y) / 2;
    const torsoHeight = Math.abs(midHipY - midShoulderY);

    // --- Shoulder Width ---
    // ความกว้างไหล่ = ระยะห่างไหล่ซ้าย ถึง ไหล่ขวา
    const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);

    // --- Arm Length ---
    // ความยาวแขน = (ไหล่-ศอก) + (ศอก-ข้อมือ) (ใช้แขนขวา)
    const dist = (p1, p2) =>
      Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    const armLength =
      dist(landmarks[12], landmarks[14]) + dist(landmarks[14], landmarks[16]);

    console.log("Calibration Data:", { torsoHeight, shoulderWidth, armLength });

    return { torsoHeight, shoulderWidth, armLength };
  }

  // ===========================================================================
  // 🎨 DRAW OVERLAY: วาดหน้าจอ Calibration
  // ===========================================================================

  /**
   * วาด Overlay บน Canvas ระหว่าง Calibration
   *
   * หมายเหตุ Mirror Fix:
   *   - script.js ทำ Mirror (-1, 1) สำหรับภาพ Webcam
   *   - แต่ตัวหนังสือจะกลับด้านด้วย
   *   - เราต้อง scale(-1, 1) อีกครั้งเพื่อกลับเป็นปกติ
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - ความกว้าง canvas
   * @param {number} canvasHeight - ความสูง canvas
   */
  drawOverlay(ctx, canvasWidth, canvasHeight) {
    if (!this.isActive) return;

    // ----- พื้นหลังสีดำ (ไม่ต้องกลับด้าน) -----
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // ----- ข้อความ (ต้อง Un-mirror) -----
    ctx.save();

    // FIX: กลับ scale เพื่อให้ตัวหนังสืออ่านได้ปกติ
    ctx.scale(-1, 1);
    ctx.translate(-canvasWidth, 0);

    // วาดข้อความสถานะ (กลางจอ)
    ctx.font = "bold 40px 'Sarabun', sans-serif";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.fillText(this.statusText, canvasWidth / 2, canvasHeight / 2);

    // วาดข้อความยกเลิก (ล่างลงมา)
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
