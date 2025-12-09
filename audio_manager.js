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

    // แปลงเป็นข้อความสั้นๆ สำหรับพูด (รองรับทั้ง TH และ EN)
    const isThaiLang = this.lang === "th-TH";

    const shortMessages = {
      "Path Deviation": isThaiLang ? "เส้นทางผิด" : "Wrong path",
      "Incorrect Arm Rotation": isThaiLang ? "หมุนแขนผิด" : "Wrong rotation",
      "Elbow too high": isThaiLang ? "ศอกลอย" : "Elbow too high",
      "Start with Waist": isThaiLang ? "ใช้เอวนำ" : "Lead with waist",
      "Head Unstable": isThaiLang ? "ศีรษะไม่นิ่ง" : "Head unstable",
      "Not Smooth": isThaiLang ? "สะดุด" : "Not smooth",
      "Keep Moving": isThaiLang ? "อย่าหยุด" : "Keep moving",
      "Off Balance": isThaiLang ? "เสียสมดุล" : "Off balance",
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
    const isThaiLang = this.lang === "th-TH";

    const announcements = {
      record_start: isThaiLang ? "เริ่มการฝึก" : "Start training",
      record_stop: isThaiLang ? "หยุดการฝึก" : "Stop training",
      calib_success: isThaiLang ? "ปรับเทียบสำเร็จ" : "Calibration complete",
      calib_start: isThaiLang ? "กรุณายืนท่ากางเขน" : "Please stand in T pose",
    };

    if (announcements[type]) {
      this.speak(announcements[type], true); // force = true (ข้าม cooldown)
    }
  }
}
