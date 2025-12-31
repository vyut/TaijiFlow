/**
 * ============================================================================
 * TaijiFlow AI - Feedback Manager v1.0
 * ============================================================================
 *
 * จัดการปุ่มและ Popup สำหรับแบบสอบถาม
 *
 * @description
 *   แสดงปุ่ม Feedback มุมขวาล่างของหน้าจอ
 *   เมื่อกดจะแสดง Popup พร้อม QR Code ลิงก์ไป Google Form
 *
 * 📋 หน้าที่หลัก:
 *   - createButton() - สร้างปุ่ม 📝 มุมขวาล่าง
 *   - showPopup() - แสดง Popup พร้อม QR Code
 *   - getLang() - ดึงภาษาปัจจุบันจาก uiManager
 *
 * 📊 การใช้งาน:
 *   // สร้าง Instance (ทำอัตโนมัติตอนโหลดไฟล์)
 *   window.feedbackManager = new FeedbackManager();
 *
 * 🌐 Multi-language:
 *   - รองรับ TH/EN
 *   - ดึงภาษาจาก uiManager.currentLang
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 1.0.0
 * @version 1.0 (2024-12-30)
 * ============================================================================
 */

class FeedbackManager {
  constructor() {
    this.formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSf3uXhHZogHZAR5apQ0QUAwlhiI6yvBLNHorPw7ydY3QEtklQ/viewform";
    this.init();
  }

  // เริ่มต้น - สร้างปุ่มและ bind events
  init() {
    this.createButton();
    this.bindEvents();
  }

  // ดึงภาษาปัจจุบันจาก uiManager
  getLang() {
    return window.uiManager?.currentLang || "th";
  }

  // สร้างปุ่ม 📝 มุมขวาล่างของหน้าจอ
  createButton() {
    const btn = document.createElement("button");
    btn.id = "feedback-btn";
    btn.innerHTML = "📝";
    btn.title =
      this.getLang() === "th"
        ? "ช่วยพัฒนาแอป TaijiFlow AI ให้ดียิ่งขึ้น"
        : "Help improve TaijiFlow AI";
    document.body.appendChild(btn);
  }

  // ผูก click event สำหรับเปิด popup
  bindEvents() {
    document.getElementById("feedback-btn").addEventListener("click", () => {
      this.showPopup();
    });
  }

  // แสดง Popup พร้อม QR Code และลิงก์ไป Google Form
  showPopup() {
    const isThaiLang = this.getLang() === "th";
    // ใช้ไฟล์ QR ที่เก็บใน local เพื่อโหลดเร็วขึ้น (ไม่ต้องรอ API)
    const qrPath = "images/qr_feedback.png";

    const popup = document.createElement("div");
    popup.id = "feedback-popup";
    popup.className = "feedback-overlay";
    popup.innerHTML = `
      <div class="feedback-modal">
        <h3>${isThaiLang ? "📝 แบบสอบถาม" : "📝 Feedback"}</h3>
        <p class="feedback-desc">${
          isThaiLang
            ? "ช่วยพัฒนาแอป TaijiFlow AI ให้ดียิ่งขึ้น"
            : "Help improve TaijiFlow AI"
        }</p>
        <img src="${qrPath}" alt="QR Feedback" class="feedback-qr" width="150" height="150" />
        <p class="feedback-hint">${
          isThaiLang
            ? "สแกน QR Code หรือคลิกปุ่มด้านล่าง"
            : "Scan QR Code or click button below"
        }</p>
        <a href="${this.formUrl}" target="_blank" class="feedback-link">${
      isThaiLang ? "🔗 เปิดแบบสอบถาม" : "🔗 Open Feedback Form"
    }</a>
        <button class="feedback-close">${isThaiLang ? "ปิด" : "Close"}</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Close handlers
    popup
      .querySelector(".feedback-close")
      .addEventListener("click", () => popup.remove());
    popup.addEventListener("click", (e) => {
      if (e.target === popup) popup.remove();
    });
  }
}

// Initialize when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.feedbackManager = new FeedbackManager();
});
