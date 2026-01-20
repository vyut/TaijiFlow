/**
 * ============================================================================
 * TaijiFlow AI - Scoring Manager v3.0
 * ============================================================================
 *
 * ระบบให้คะแนนแบบ Simple Ratio
 *
 * @description
 *   คำนวณคะแนนจากอัตราส่วนเฟรมที่ถูกต้อง
 *   สูตร: Score = (CorrectFrames / TotalFrames) × 100
 *
 * ============================================================================
 * สูตรการคำนวณ
 * ============================================================================
 *
 *   Score = (เฟรมถูก / เฟรมทั้งหมด) × 100
 *
 *   ตัวอย่าง: 81 ถูก, 32 ผิด (รวม 113)
 *   Score = (81 / 113) × 100 = 71.7%
 *
 * ============================================================================
 * เกณฑ์การตัดเกรด
 * ============================================================================
 *
 *   | คะแนน  | เกรด | Label (TH)     | Label (EN)        |
 *   |--------|------|----------------|-------------------|
 *   | 85-100 | A    | ยอดเยี่ยม       | Excellent         |
 *   | 70-84  | B    | ดีมาก          | Very Good         |
 *   | 55-69  | C    | ดี             | Good              |
 *   | 40-54  | D    | พอใช้          | Fair              |
 *   | 0-39   | F    | ต้องปรับปรุง    | Needs Improvement |
 *
 * ============================================================================
 * การใช้งาน
 * ============================================================================
 *
 *   ```javascript
 *   const scorer = new ScoringManager();
 *   scorer.start();
 *
 *   // ทุก Frame
 *   scorer.recordFrame(feedbacks);
 *
 *   // จบ Session
 *   const summary = scorer.stop();
 *   const grade = ScoringManager.getGrade(summary.score, "th");
 *   ```
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 1.0.0
 * @version 2.0 (Weighted Scoring)
 * ============================================================================
 */

// =============================================================================
// CLASS: ScoringManager
// =============================================================================

/**
 * ScoringManager Class
 *
 * @description
 *   จัดการการให้คะแนนและสรุปผลการฝึก
 */
class ScoringManager {
  // ===========================================================================
  // CONSTRUCTOR
  // ===========================================================================

  /**
   * Constructor - กำหนดค่าเริ่มต้นและตาราง Weight
   */
  constructor() {
    // -------------------------------------------------------------------------
    // ERROR_WEIGHTS - ตารางน้ำหนักความรุนแรงของแต่ละ Error
    // -------------------------------------------------------------------------
    // ค่า Weight เป็นตัวเลข 0.0 - 1.0
    // 1.0 = ร้ายแรงที่สุด (Critical)
    // 0.0 = ไม่มีผล (ไม่ใช้)
    this.ERROR_WEIGHTS = {
      // Critical (1.0): ผิดหลักการพื้นฐาน ไม่ใช่ไทเก๊ก
      "Path Deviation": 1.0, // ผิดเส้นทาง/ท่าผิด
      "Off Balance": 1.0, // เสียสมดุล/รากไม่มั่นคง

      // High (0.8): หลักสำคัญหลัก
      "Start with Waist": 0.8, // ไม่ใช้เอวนำ (หัวใจสำคัญของไทเก๊ก)

      // Moderate (0.5): ผิดระดับปานกลาง
      "Incorrect Arm Rotation": 0.5, // หมุนแขนผิดทาง

      // Minor (0.2): ผิดเล็กน้อย แก้ไขได้ง่าย
      "Elbow too high": 0.2, // ศอกลอย
      "Head Unstable": 0.2, // ศีรษะไม่นิ่ง
      "Not Smooth": 0.2, // ไม่ต่อเนื่อง/สะดุด
      "Keep Moving": 0.2, // หยุดนิ่งนานเกินไป
    };

    // ค่า Default สำหรับ Error ที่ไม่มีในตาราง
    this.DEFAULT_WEIGHT = 0.5;

    // อัตราส่วนโทษเพิ่มสำหรับ Error รอง (20% ของ Residual)
    this.RESIDUAL_FACTOR = 0.2;

    // Reset ค่า Session
    this.reset();
  }

  // ===========================================================================
  // SESSION MANAGEMENT
  // ===========================================================================

  /**
   * Reset - รีเซ็ตค่าทั้งหมดเพื่อเริ่ม Session ใหม่
   */
  reset() {
    this.totalFrames = 0; // จำนวนเฟรมทั้งหมด
    this.errorFrames = 0; // จำนวนเฟรมที่มี Error (backward compat)
    this.weightedErrorSum = 0; // Penalty สะสม
    this.errorCounts = {}; // สถิติแต่ละประเภท Error { "Elbow too high": 5 }

    this.startTime = null;
    this.endTime = null;
  }

  /**
   * เริ่มต้นการฝึก (Start Session)
   */
  start() {
    this.reset();
    this.startTime = Date.now();
    console.log("Scoring Manager: Session Started");
  }

  /**
   * หยุดการฝึกและสรุปผล (Stop Session)
   */
  stop() {
    this.endTime = Date.now();
    console.log("Scoring Manager: Session Stopped");
    return this.getSummary();
  }

  /**
   * บันทึกผลการวิเคราะห์ในแต่ละเฟรม (เรียกโดย Main Loop)
   * @param {string[]} feedbacks - รายการข้อความแจ้งเตือนจาก HeuristicsEngine
   */
  recordFrame(feedbacks) {
    this.totalFrames++;

    // ถ้าไม่มี Feedback เลย = เฟรมนั้นสมบูรณ์ (Penalty = 0)
    if (!feedbacks || feedbacks.length === 0) return;

    // นับเฟรมที่มีข้อผิดพลาด (for backward compatibility)
    this.errorFrames++;

    // ตัวแปรสำหรับคำนวณในเฟรมนี้
    let maxPenalty = 0; // น้ำหนักของข้อที่หนักที่สุด
    let sumPenalty = 0; // ผลรวมน้ำหนักทั้งหมด

    feedbacks.forEach((feedback) => {
      // 1. ดึงชื่อ Error Key จากข้อความ (เช่น "⚠️ ... (ErrorKey)")
      // ใช้ Regex จับข้อความในวงเล็บเล็บ
      const match = feedback.match(/\(([^)]+)\)/);
      const errorKey = match ? match[1] : feedback;

      // 2. หาน้ำหนักจากตาราง Config
      const weight = this.ERROR_WEIGHTS[errorKey] || this.DEFAULT_WEIGHT;

      // 3. เก็บสถิติ (นับจำนวนครั้ง)
      if (!this.errorCounts[errorKey]) {
        this.errorCounts[errorKey] = 0;
      }
      this.errorCounts[errorKey]++;

      // 4. คำนวณค่า Max และ Sum
      sumPenalty += weight;
      if (weight > maxPenalty) {
        maxPenalty = weight;
      }
    });

    // 5. คำนวณ Penalty สุทธิด้วยสูตร Weighted Max Strategy
    // Penalty = ตัวหนักสุด + (20% ของน้ำหนักที่เหลือ)
    const residualPenalty = sumPenalty - maxPenalty; // น้ำหนักส่วนเกินที่เหลือ
    let finalPenalty = maxPenalty + residualPenalty * this.RESIDUAL_FACTOR;

    // บวกสะสมเข้ายอดรวม
    this.weightedErrorSum += finalPenalty;
  }

  /**
   * คำนวณคะแนนปัจจุบัน (0-100%)
   * สูตร Simple Ratio: (ถูก / ทั้งหมด) × 100
   */
  getCurrentScore() {
    if (this.totalFrames === 0) return 100;

    // Simple Ratio: เฟรมถูก / เฟรมทั้งหมด
    const correctFrames = this.totalFrames - this.errorFrames;
    const score = (correctFrames / this.totalFrames) * 100;

    return Math.round(score * 10) / 10; // ปัดเศษทศนิยม 1 ตำแหน่ง
  }

  /**
   * สรุปผลการฝึก (Summary Report)
   */
  getSummary() {
    // คำนวณระยะเวลา (ถ้า startTime เป็น null ให้เป็น 0)
    let duration = 0;
    if (this.startTime) {
      const endTime = this.endTime || Date.now();
      duration = (endTime - this.startTime) / 1000;
    }

    // Format duration เป็น mm:ss
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const durationFormatted = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    // เรียงลำดับ Error ตามจำนวนครั้ง (มากไปน้อย) เพื่อแสดง Top Errors
    const sortedErrors = Object.entries(this.errorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    return {
      score: this.getCurrentScore(),
      totalFrames: this.totalFrames,
      errorFrames: this.errorFrames, // Backward compatibility with V1
      correctFrames: this.totalFrames - this.errorFrames, // Backward compatibility with V1
      durationSeconds: Math.round(duration * 10) / 10,
      durationFormatted: durationFormatted, // mm:ss format
      topErrors: sortedErrors.slice(0, 3), // ส่งคืนแค่ 3 อันดับแรก
      allErrors: sortedErrors,
    };
  }

  /**
   * แปลงคะแนนเป็นเกรด (Static Method)
   */
  static getGrade(score, lang = "th") {
    const labels = {
      th: {
        A: "ยอดเยี่ยม",
        B: "ดีมาก",
        C: "ดี",
        D: "พอใช้",
        F: "ต้องปรับปรุง",
      },
      en: {
        A: "Excellent",
        B: "Very Good",
        C: "Good",
        D: "Fair",
        F: "Needs Improvement",
      },
    };
    const l = labels[lang] || labels.th;

    if (score >= 85) return { grade: "A", label: l.A, color: "#22c55e" }; // เขียวสด
    if (score >= 70) return { grade: "B", label: l.B, color: "#84cc16" }; // เขียวอมเหลือง
    if (score >= 55) return { grade: "C", label: l.C, color: "#eab308" }; // เหลือง
    if (score >= 40) return { grade: "D", label: l.D, color: "#f97316" }; // ส้ม
    return { grade: "F", label: l.F, color: "#ef4444" }; // แดง
  }
}
