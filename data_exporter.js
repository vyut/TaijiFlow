/**
 * TaijiFlow AI - Data Exporter
 * รับผิดชอบการสร้างและดาวน์โหลดไฟล์ข้อมูล
 */
class DataExporter {
  /**
   * ฟังก์ชันหลักในการสร้างไฟล์และกระตุ้นการดาวน์โหลด
   * @param {string} content - เนื้อหาของไฟล์
   * @param {string} filename - ชื่อไฟล์ที่จะดาวน์โหลด
   * @param {string} contentType - ประเภทของไฟล์ (MIME type)
   */
  static download(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * ส่งออกข้อมูลการฝึกทั้งหมดเป็นไฟล์ JSON
   * @param {object} sessionData - Object ข้อมูลการฝึกทั้งหมดที่รวบรวมจาก script.js
   */
  static exportFullSession(sessionData) {
    if (
      !sessionData ||
      !sessionData.frames ||
      sessionData.frames.length === 0
    ) {
      console.warn("Export cancelled: No data to export.");
      return;
    }
    const jsonString = JSON.stringify(sessionData, null, 2);
    const filename = `taiji_data_${
      sessionData.meta.exercise
    }_${new Date().getTime()}.json`;
    this.download(jsonString, filename, "application/json");
  }
}
