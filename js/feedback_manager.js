/**
 * TaijiFlow AI - Feedback Manager
 * จัดการปุ่มและ Popup สำหรับแบบสอบถาม
 */

class FeedbackManager {
  constructor() {
    this.formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSf3uXhHZogHZAR5apQ0QUAwlhiI6yvBLNHorPw7ydY3QEtklQ/viewform";
    this.init();
  }

  init() {
    this.createButton();
    this.bindEvents();
  }

  createButton() {
    const btn = document.createElement("button");
    btn.id = "feedback-btn";
    btn.innerHTML = "📝";
    btn.title = "ช่วยพัฒนาแอป - ตอบแบบสอบถาม";
    document.body.appendChild(btn);
  }

  bindEvents() {
    document.getElementById("feedback-btn").addEventListener("click", () => {
      this.showPopup();
    });
  }

  showPopup() {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      this.formUrl
    )}`;

    const popup = document.createElement("div");
    popup.id = "feedback-popup";
    popup.className = "feedback-overlay";
    popup.innerHTML = `
      <div class="feedback-modal">
        <h3>📝 แบบสอบถาม</h3>
        <p class="feedback-desc">ช่วยพัฒนาแอป TaijiFlow AI ให้ดียิ่งขึ้น</p>
        <img src="${qrUrl}" alt="QR Feedback" class="feedback-qr" width="150" height="150" />
        <p class="feedback-hint">สแกน QR Code หรือคลิกปุ่มด้านล่าง</p>
        <a href="${this.formUrl}" target="_blank" class="feedback-link">🔗 เปิดแบบสอบถาม</a>
        <button class="feedback-close">ปิด</button>
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
