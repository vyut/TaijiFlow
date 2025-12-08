/**
 * TaijiFlow AI - Scoring Manager v1.0
 * ระบบให้คะแนนการฝึก (0-100%)
 */
class ScoringManager {
  constructor() {
    this.reset();
  }

  /**
   * รีเซ็ตข้อมูลคะแนนสำหรับ Session ใหม่
   */
  reset() {
    this.totalFrames = 0; // จำนวนเฟรมทั้งหมด
    this.errorFrames = 0; // จำนวนเฟรมที่มีข้อผิดพลาด
    this.errorCounts = {}; // นับจำนวนครั้งของแต่ละ Error Type
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * เริ่มต้น Session ใหม่
   */
  start() {
    this.reset();
    this.startTime = Date.now();
  }

  /**
   * หยุด Session และคำนวณผลลัพธ์
   * @returns {Object} ผลสรุปการฝึก
   */
  stop() {
    this.endTime = Date.now();
    return this.getSummary();
  }

  /**
   * บันทึกผลการวิเคราะห์แต่ละเฟรม
   * @param {string[]} feedbacks - Array ของ Feedback จาก HeuristicsEngine
   */
  recordFrame(feedbacks) {
    this.totalFrames++;

    if (feedbacks && feedbacks.length > 0) {
      this.errorFrames++;

      // นับจำนวนครั้งของแต่ละประเภท Error
      feedbacks.forEach((feedback) => {
        // ดึงชื่อ Error Type จากข้อความ (เช่น "⚠️ ศอกลอย (Elbow too high)" -> "Elbow too high")
        const match = feedback.match(/\(([^)]+)\)/);
        const errorType = match ? match[1] : feedback;

        if (!this.errorCounts[errorType]) {
          this.errorCounts[errorType] = 0;
        }
        this.errorCounts[errorType]++;
      });
    }
  }

  /**
   * คำนวณคะแนนปัจจุบัน (0-100%)
   * @returns {number} คะแนน 0-100
   */
  getCurrentScore() {
    if (this.totalFrames === 0) return 100;

    const correctFrames = this.totalFrames - this.errorFrames;
    const score = (correctFrames / this.totalFrames) * 100;
    return Math.round(score * 10) / 10; // ปัดเศษ 1 ตำแหน่ง
  }

  /**
   * ดึงข้อมูลสรุปผลการฝึก
   * @returns {Object} ข้อมูลสรุป
   */
  getSummary() {
    const duration = this.endTime
      ? (this.endTime - this.startTime) / 1000
      : (Date.now() - this.startTime) / 1000;

    // เรียงลำดับ Error ตามจำนวนครั้ง (มากไปน้อย)
    const sortedErrors = Object.entries(this.errorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    return {
      score: this.getCurrentScore(),
      totalFrames: this.totalFrames,
      errorFrames: this.errorFrames,
      correctFrames: this.totalFrames - this.errorFrames,
      durationSeconds: Math.round(duration * 10) / 10,
      topErrors: sortedErrors.slice(0, 3), // Top 3 ข้อผิดพลาด
      allErrors: sortedErrors,
    };
  }

  /**
   * แปลงคะแนนเป็นเกรด
   * @param {number} score - คะแนน 0-100
   * @returns {Object} เกรดและสี
   */
  static getGrade(score) {
    if (score >= 90) return { grade: "A", label: "ยอดเยี่ยม", color: "#22c55e" };
    if (score >= 80) return { grade: "B", label: "ดีมาก", color: "#84cc16" };
    if (score >= 70) return { grade: "C", label: "ดี", color: "#eab308" };
    if (score >= 60) return { grade: "D", label: "พอใช้", color: "#f97316" };
    return { grade: "F", label: "ต้องปรับปรุง", color: "#ef4444" };
  }
}
