/**
 * ============================================================================
 * TaijiFlow AI - Data Exporter v1.0
 * ============================================================================
 *
 * ระบบส่งออกข้อมูลการฝึก (Training Data Export System)
 *
 * @description
 *   ไฟล์นี้รับผิดชอบการสร้างและดาวน์โหลดไฟล์ข้อมูลจากการฝึก
 *   ใช้สำหรับเก็บข้อมูลเพื่อ:
 *   - วิเคราะห์พัฒนาการของผู้ฝึก
 *   - Train Machine Learning Models
 *   - ติดตามสถิติการฝึก
 *
 * ============================================================================
 * ข้อมูลที่ Export
 * ============================================================================
 *
 *   ไฟล์ JSON ที่ Export มีโครงสร้าง:
 *   {
 *     "meta": {
 *       "user_id": "user_xxx",
 *       "session_id": "sess_xxx",
 *       "exercise": "rh_cw",
 *       "level": "L2",
 *       "timestamp": "2024-12-17T12:00:00Z",
 *       "platform": { ... }
 *     },
 *     "score_summary": {
 *       "score": 85,
 *       "grade": "A",
 *       "totalErrors": 12
 *     },
 *     "all_errors": [ ... ],
 *     "frames": [
 *       {
 *         "frame_number": 0,
 *         "timestamp": 0.0,
 *         "landmarks": [ ... ],
 *         "active_feedbacks": [ ... ]
 *       },
 *       ...
 *     ]
 *   }
 *
 * ============================================================================
 * การใช้งาน
 * ============================================================================
 *
 *   // Export ข้อมูล Session
 *   DataExporter.exportFullSession(sessionData);
 *
 *   // Download ไฟล์ใดๆ
 *   DataExporter.download(content, filename, contentType);
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 1.0.0
 * ============================================================================
 */

// =============================================================================
// CLASS: DataExporter (Static Class)
// =============================================================================

/**
 * DataExporter Class
 *
 * @description
 *   Utility Class สำหรับ Export ข้อมูล
 *   ใช้ Static Methods ไม่ต้องสร้าง Instance
 *
 * Methods:
 *   - download(content, filename, contentType) - ดาวน์โหลดไฟล์ใดๆ
 *   - exportFullSession(sessionData) - Export ข้อมูลการฝึกเป็น JSON
 */
class DataExporter {
  // ===========================================================================
  // METHOD: download
  // ===========================================================================

  /**
   * สร้างและดาวน์โหลดไฟล์
   *
   * @description
   *   สร้าง Blob จาก Content แล้วกระตุ้นการดาวน์โหลด
   *   ใช้เทคนิค Create-Click-Remove สำหรับ <a> element
   *
   *   Flow:
   *   1. สร้าง Blob จาก Content
   *   2. สร้าง Object URL
   *   3. สร้าง <a> element ชั่วคราว
   *   4. Click เพื่อ Download
   *   5. ลบ <a> และ revoke URL
   *
   * @param {string} content - เนื้อหาของไฟล์
   * @param {string} filename - ชื่อไฟล์ที่จะดาวน์โหลด (เช่น "data.json")
   * @param {string} contentType - MIME type (เช่น "application/json")
   *
   * @example
   *   // Download JSON file
   *   DataExporter.download(
   *     JSON.stringify(data),
   *     "session.json",
   *     "application/json"
   *   );
   *
   *   // Download CSV file
   *   DataExporter.download(
   *     csvContent,
   *     "report.csv",
   *     "text/csv"
   *   );
   */
  static download(content, filename, contentType) {
    // 1. สร้าง Blob (Binary Large Object) จาก Content
    const blob = new Blob([content], { type: contentType });

    // 2. สร้าง Object URL สำหรับ Blob
    const url = URL.createObjectURL(blob);

    // 3. สร้าง <a> element ชั่วคราว
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // 4. เพิ่มเข้า DOM แล้ว Click เพื่อ Download
    document.body.appendChild(a);
    a.click();

    // 5. Clean up - ลบ element และ revoke URL เพื่อคืน memory
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ===========================================================================
  // METHOD: exportFullSession
  // ===========================================================================

  /**
   * ส่งออกข้อมูลการฝึกทั้งหมดเป็นไฟล์ JSON
   *
   * @description
   *   Export ข้อมูล Session ทั้งหมดรวมถึง:
   *   - Metadata (user_id, exercise, level, timestamp)
   *   - Score Summary (score, grade, errors)
   *   - Raw Frame Data (landmarks ทุก frame)
   *
   *   ไฟล์จะถูกตั้งชื่อตาม Pattern:
   *   taiji_data_{exercise}_{timestamp}.json
   *
   *   ตัวอย่าง: taiji_data_rh_cw_1702800000000.json
   *
   * @param {Object} sessionData - Object ข้อมูลการฝึกทั้งหมด
   *   @param {Object} sessionData.meta - Metadata ของ Session
   *   @param {string} sessionData.meta.exercise - ชื่อท่าฝึก
   *   @param {Object} sessionData.score_summary - สรุปคะแนน
   *   @param {Array} sessionData.all_errors - รายการ Error ทั้งหมด
   *   @param {Array} sessionData.frames - ข้อมูล Frame ทั้งหมด
   *
   * @returns {void} - ดาวน์โหลดไฟล์โดยตรง ไม่มี Return value
   *
   * @example
   *   const sessionData = {
   *     meta: {
   *       user_id: "user_abc",
   *       exercise: "rh_cw",
   *       level: "L2",
   *       timestamp: new Date().toISOString()
   *     },
   *     score_summary: { score: 85, grade: "A" },
   *     all_errors: [...],
   *     frames: [...]
   *   };
   *
   *   DataExporter.exportFullSession(sessionData);
   *   // Downloads: taiji_data_rh_cw_1702800000000.json
   */
  static exportFullSession(sessionData) {
    // Validation: ตรวจสอบว่ามีข้อมูลหรือไม่
    if (
      !sessionData ||
      !sessionData.frames ||
      sessionData.frames.length === 0
    ) {
      console.warn("⚠️ Export cancelled: No data to export.");
      return;
    }

    // แปลง Object เป็น JSON String (pretty print with 2 spaces)
    const jsonString = JSON.stringify(sessionData, null, 2);

    // สร้างชื่อไฟล์: taiji_data_{exercise}_{timestamp}.json
    const filename = `taiji_data_${
      sessionData.meta.exercise
    }_${new Date().getTime()}.json`;

    // เรียก download
    this.download(jsonString, filename, "application/json");

    console.log(`✅ Exported: ${filename}`);
  }
}

// =============================================================================
// END OF FILE: data_exporter.js
// =============================================================================
