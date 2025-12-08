/**
 * TaijiFlow AI - Audio Manager v1.0
 * ระบบเสียงพูดแจ้งเตือน (Text-to-Speech)
 * ใช้ Web Speech API
 */
class AudioManager {
  constructor() {
    this.enabled = true;
    this.lastSpokenMessage = null;
    this.lastSpeakTime = 0;
    this.cooldownMs = 2000; // พูดซ้ำได้ทุก 2 วินาที
    this.lang = "th-TH";
    this.rate = 1.1; // ความเร็วในการพูด (1.0 = ปกติ)

    // ตรวจสอบว่า Browser รองรับ Speech API ไหม
    this.isSupported = "speechSynthesis" in window;
    if (!this.isSupported) {
      console.warn("AudioManager: Web Speech API not supported");
    }
  }

  /**
   * เปิด/ปิดเสียง
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * ตั้งค่าภาษา
   * @param {string} lang - รหัสภาษา เช่น 'th-TH', 'en-US'
   */
  setLanguage(lang) {
    this.lang = lang === "th" ? "th-TH" : "en-US";
  }

  /**
   * พูดข้อความ (พร้อม Cooldown ป้องกันพูดซ้ำถี่เกินไป)
   * @param {string} message - ข้อความที่จะพูด
   * @param {boolean} force - บังคับพูด (ข้าม Cooldown)
   */
  speak(message, force = false) {
    if (!this.enabled || !this.isSupported) return;

    const now = Date.now();

    // ข้าม Cooldown ถ้าข้อความเหมือนเดิมและยังไม่ถึงเวลา
    if (
      !force &&
      message === this.lastSpokenMessage &&
      now - this.lastSpeakTime < this.cooldownMs
    ) {
      return;
    }

    // หยุดเสียงเก่าก่อน (ถ้ามี)
    speechSynthesis.cancel();

    // สร้าง Utterance ใหม่
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = this.lang;
    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    // พูด
    speechSynthesis.speak(utterance);

    // บันทึกประวัติ
    this.lastSpokenMessage = message;
    this.lastSpeakTime = now;
  }

  /**
   * พูดจาก Feedback ที่ได้รับ (แปลงข้อความให้สั้นลง)
   * @param {string[]} feedbacks - Array ของ Feedback messages
   */
  speakFeedback(feedbacks) {
    if (!feedbacks || feedbacks.length === 0) return;

    // ดึงเฉพาะข้อความสั้นๆ จาก Feedback แรก
    const feedback = feedbacks[0];

    // แปลงเป็นข้อความสั้นๆ สำหรับพูด
    const shortMessages = {
      "Path Deviation": "เส้นทางผิด",
      "Incorrect Arm Rotation": "หมุนแขนผิด",
      "Elbow too high": "ศอกลอย",
      "Start with Waist": "ใช้เอวนำ",
      "Head Unstable": "ศีรษะไม่นิ่ง",
      "Not Smooth": "สะดุด",
      "Keep Moving": "อย่าหยุด",
      "Off Balance": "เสียสมดุล",
    };

    // หาคีย์ที่ตรงกัน
    for (const [key, shortText] of Object.entries(shortMessages)) {
      if (feedback.includes(key)) {
        this.speak(shortText);
        return;
      }
    }
  }

  /**
   * พูดประกาศพิเศษ (เช่น เริ่ม/หยุดบันทึก, Calibration สำเร็จ)
   * @param {string} type - ประเภทประกาศ
   */
  announce(type) {
    const announcements = {
      record_start: "เริ่มบันทึก",
      record_stop: "หยุดบันทึก",
      calib_success: "ปรับเทียบสำเร็จ",
      calib_start: "กรุณายืนท่ากางเขน",
    };

    if (announcements[type]) {
      this.speak(announcements[type], true); // force = true (ข้าม cooldown)
    }
  }
}
