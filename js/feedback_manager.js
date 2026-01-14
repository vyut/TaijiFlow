/**
 * ============================================================================
 * TaijiFlow AI - Feedback Manager v2.0 (Theme Upgrade)
 * ============================================================================
 *
 * จัดการปุ่มและ Popup สำหรับแบบสอบถาม
 * @version 2.0 (2026-01-14)
 * - Upgraded to Purple Theme (Gradient)
 * - Replaced Emoji with SVG Icon
 * - Glassmorphism Popup (Matches Score Popup V3.2)
 * - Tailwind CSS based (No external CSS needed)
 */

class FeedbackManager {
  constructor() {
    this.formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSf3uXhHZogHZAR5apQ0QUAwlhiI6yvBLNHorPw7ydY3QEtklQ/viewform";
    this.init();
  }

  init() {
    this.createButton();
  }

  getLang() {
    return window.uiManager?.currentLang || "th";
  }

  createButton() {
    const btn = document.createElement("button");
    btn.id = "feedback-btn-v2";

    // Tailwind Styling: Purple Gradient, Floating, Shadow
    btn.className = `
      fixed bottom-5 right-24 z-50
      w-12 h-12 rounded-full
      bg-gradient-to-r from-purple-600 to-indigo-600
      text-white shadow-lg shadow-purple-500/40
      flex items-center justify-center
      transform transition-all duration-300
      hover:scale-110 hover:shadow-purple-500/60
      active:scale-95
      border border-white/20
    `;

    // SVG Icon (Chat Bubble with Heart or Pen)
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11l5-5h9a2 2 0 002-2v-6a2 2 0 00-2-2h-4l-2.5-2.5" />
      </svg>
    `;

    btn.title =
      this.getLang() === "th"
        ? "ช่วยพัฒนา TaijiFlow AI ให้ดียิ่งขึ้น"
        : "Help make TaijiFlow AI even better";

    btn.addEventListener("click", () => this.showPopup());
    document.body.appendChild(btn);
  }

  showPopup() {
    const lang = this.getLang();
    // Helper for translations
    const t =
      TRANSLATIONS[lang]?.feedback_popup || TRANSLATIONS["th"].feedback_popup;

    // Check global availability if needed, or fallback to local helper
    // Note: this.getLang() handles retrieval.

    const popup = document.createElement("div");
    popup.id = "feedback-popup-v2";
    // Glassmorphism Overlay
    popup.className =
      "fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[100] transition-opacity duration-300 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]";

    // Modal Content
    popup.innerHTML = `
      <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center relative transform scale-95 animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] border border-gray-100 dark:border-gray-700">
        
        <!-- Close X Button -->
        <button id="close-x-btn-fb" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Header -->
        <h3 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
          ${t.title}
        </h3>
        
        <p class="text-sm text-gray-600 dark:text-gray-300 font-medium mb-4">
          ${t.feedback_sub}
        </p>

        <!-- QR Code -->
        <div class="relative bg-white p-2 rounded-xl shadow-inner border border-gray-100 dark:border-gray-800 mx-auto w-fit mb-4">
          <img src="images/qr_feedback.png" alt="QR" class="w-32 h-32 rounded-lg object-contain">
        </div>

        <p class="text-xs text-gray-400 mb-4">
          ${t.qr_instruction}
        </p>

        <!-- Action Button -->
        <a href="${this.formUrl}" target="_blank" 
           class="block w-fit mx-auto px-8 py-3 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full font-semibold shadow-md shadow-purple-500/20 transform transition active:scale-95 mb-3 text-sm">
           ${t.take_survey_btn}
        </a>

        <!-- Close Button -->
        <button id="close-feedback-popup" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors">
          ${t.close_btn}
        </button>
      </div>

      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); } to { transform: scale(1); } }
      </style>
    `;

    document.body.appendChild(popup);

    // Event Handlers
    const close = () => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), 200);
    };

    popup
      .querySelector("#close-feedback-popup")
      .addEventListener("click", close);

    // Bind Close X Button
    popup.querySelector("#close-x-btn-fb")?.addEventListener("click", close);

    popup.addEventListener("click", (e) => {
      if (e.target === popup) close();
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  window.feedbackManager = new FeedbackManager();
});
