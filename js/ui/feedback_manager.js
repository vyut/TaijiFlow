/**
 * ============================================================================
 * TaijiFlow AI - Feedback Manager v2.1 (Shared Survey Component)
 * ============================================================================
 *
 * จัดการปุ่มและ Popup สำหรับแบบสอบถาม
 * @version 2.1 (2026-01-19)
 * - Merged Survey Section shared component
 * - Used by both FeedbackManager and ScorePopupManager
 */

// =============================================================================
// SHARED COMPONENT: Survey Section
// =============================================================================
// ใช้ร่วมกันระหว่าง FeedbackManager และ ScorePopupManager
// เพื่อให้ UI ของส่วน Survey เหมือนกันทั้ง 2 popup

/**
 * สร้าง HTML template สำหรับ Survey Section
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.translations - Translation object containing survey text
 * @param {string} options.formUrl - Google Form URL
 * @param {string} options.closeButtonId - ID for close button (for event binding)
 * @param {string} [options.variant='default'] - 'default' or 'compact' for different sizes
 * @returns {string} HTML string
 */
function createSurveySectionHtml(options) {
  const {
    translations: t,
    formUrl,
    closeButtonId,
    variant = "default",
  } = options;

  // Size variants
  const isCompact = variant === "compact";
  const qrSize = isCompact ? "w-28 h-28" : "w-32 h-32";
  const titleSize = isCompact ? "text-lg" : "text-2xl";
  const buttonPadding = isCompact ? "px-6 py-2" : "px-8 py-3";

  return `
    <!-- Survey Section Header -->
    <div class="text-center">
      <h4 class="${titleSize} font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-1">
        ${t.title}
      </h4>
      <p class="text-xs text-gray-600 dark:text-gray-300 font-medium mb-3">
        ${t.feedback_sub}
      </p>
    </div>

    <!-- QR Code -->
    <div class="relative bg-white p-2 rounded-xl shadow-inner border border-gray-100 dark:border-gray-800 mx-auto w-fit mb-3">
      <img src="images/qr_feedback.png" alt="QR" class="${qrSize} rounded-lg object-contain">
    </div>

    <!-- QR Instruction -->
    <p class="text-xs text-gray-400 mb-3">
      ${t.qr_instruction}
    </p>

    <!-- Survey Button -->
    <a href="${formUrl}" target="_blank" 
      class="block w-fit mx-auto ${buttonPadding} bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 text-white hover:text-white rounded-lg font-semibold shadow-md shadow-purple-500/20 transition-all duration-200 active:scale-95 mb-3 text-sm no-underline">
      ${t.take_survey_btn}
    </a>

    <!-- Thank You Message -->
    <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-3">
      ${t.thank_you}
    </p>

    <!-- Close Button (Secondary Style - Gray for neutral action) -->
    <button id="${closeButtonId}" 
      class="block w-fit mx-auto ${buttonPadding} bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 transition-colors text-sm">
      ${t.close_btn}
    </button>
  `;
}

// =============================================================================
// FEEDBACK MANAGER CLASS
// =============================================================================

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
    const lang = this.getLang();
    const isThai = lang === "th";

    // Tailwind Styling: Vertical Side Tab (Right Edge)
    btn.className = `
      fixed top-1/2 right-0 z-50 transform -translate-y-1/2
      bg-gradient-to-b from-purple-600 to-indigo-600
      text-white shadow-lg shadow-purple-900/20
      py-4 px-1 rounded-l-xl
      flex flex-col items-center gap-2
      transition-all duration-300
      hover:pr-3 hover:pl-2
      border-l border-t border-b border-white/20
    `;

    // Label Logic
    const label = isThai ? "ข้อเสนอแนะ" : "Feedback";

    // SVG Icon (Star) - Upright
    const iconHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    `;

    // Vertical Text using writing-mode
    btn.innerHTML = `
      ${iconHtml}
      <span class="text-xs font-semibold tracking-wide" style="writing-mode: vertical-rl; text-orientation: mixed;">
        ${label}
      </span>
    `;

    btn.title = isThai
      ? "ช่วยพัฒนา TaijiFlow AI ให้ดียิ่งขึ้น"
      : "Help make TaijiFlow AI even better";

    btn.addEventListener("click", () => this.showPopup());
    document.body.appendChild(btn);
  }

  showPopup() {
    if (!window.uiManager) return;

    const lang = this.getLang();
    // Helper for translations
    const t =
      TRANSLATIONS[lang]?.feedback_popup || TRANSLATIONS["th"].feedback_popup;

    // Survey Section HTML (shared component)
    const surveySectionHtml = createSurveySectionHtml({
      translations: t,
      formUrl: this.formUrl,
      closeButtonId: "close-feedback-popup",
      variant: "default",
    });

    // Generate HTML Content
    const html = `
      <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center relative transform scale-95 animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] border border-gray-100 dark:border-gray-700">
        
        <!-- Close X Button -->
        <button id="close-x-btn-fb" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        ${surveySectionHtml}
        
        <style>
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        </style>
      </div>
    `;

    // Call Shared Shell
    // Note: We need to bind BOTH close buttons (X and the Gray Button)
    // showPopup accepts 'closeBtnId' for one, but we can manually bind others in a callback if needed,
    // OR just let the shell closeOnClickOutside handle it for quick exit.
    // However, the survey component creates a button with ID passed in 'closeButtonId'.
    // We can use that as the primary closer for showPopup options.

    const popupEl = window.uiManager.showPopup(html, {
      id: "feedback-popup-v2",
      closeBtnId: "close-feedback-popup", // Bind the bottom gray button
    });

    // Manually bind the X button as well
    const xBtn = popupEl.querySelector("#close-x-btn-fb");
    if (xBtn) {
      xBtn.addEventListener("click", () => {
        // Trigger the close animation manually or if exposed?
        // Since showPopup doesn't expose 'close()' publicly on the element easily (it's internal closure),
        // we effectively need to trigger a click on the backdrop or existing close btn,
        // OR update showPopup to attach a .close() method to the element.
        //
        // Strategy: Trigger click on the bound button :)
        const boundBtn = popupEl.querySelector("#close-feedback-popup");
        if (boundBtn) boundBtn.click();
        // Or just remove since it's redundant if closeOnClickOutside is true.
      });
    }
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  window.feedbackManager = new FeedbackManager();
});
