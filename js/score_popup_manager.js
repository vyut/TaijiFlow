/**
 * ============================================================================
 * TaijiFlow AI - Score Popup Manager v3.3 (Feedback Alignment)
 * ============================================================================
 *
 * แสดง Popup สรุปคะแนนหลังจบ Session การฝึก (UI ใหม่)
 *
 * @version 3.3 (2026-01-14)
 * - Aligned Feedback Section with Feedback Popup Design
 * - Survey Button is now Primary (Purple Gradient)
 * - Close Button is now Secondary (Text Only)
 * - Updated Text Headers as requested
 */

class ScorePopupManager {
  constructor() {
    this.popup = null;
    this.formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSf3uXhHZogHZAR5apQ0QUAwlhiI6yvBLNHorPw7ydY3QEtklQ/viewform";
  }

  createProgressRing(percentage, color) {
    const radius = 50; // Reduced radius for w-32 (128px) container
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return `
      <div class="relative flex items-center justify-center w-32 h-32">
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="${radius}" stroke="currentColor" stroke-width="8" fill="transparent" class="text-gray-100 dark:text-gray-800" />
          <circle cx="60" cy="60" r="${radius}" stroke="${color}" stroke-width="8" fill="transparent" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" class="transition-all duration-1000 ease-out" style="stroke-dashoffset: ${circumference}; animation: progress 1.5s ease-out forwards;" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-black dark:text-white filter drop-shadow-sm" style="color:${color}">${percentage}%</span>
        </div>
      </div>
      <style>@keyframes progress { to { stroke-dashoffset: ${offset}; } }</style>
    `;
  }

  getSmartTip(topErrors, lang) {
    if (!topErrors || topErrors.length === 0)
      return TRANSLATIONS[lang]?.tips?.default || "";
    const mainError = topErrors[0];
    let tipKey = "default";
    const typeStr = mainError.type.toLowerCase();

    if (typeStr.includes("ศอก") || typeStr.includes("elbow"))
      tipKey = "FEEDBACK_ELBOW";
    else if (
      typeStr.includes("เร็ว") ||
      typeStr.includes("fast") ||
      typeStr.includes("speed")
    )
      tipKey = "FEEDBACK_SPEED";
    else if (
      typeStr.includes("นิ่ง") ||
      typeStr.includes("still") ||
      typeStr.includes("mov")
    )
      tipKey = "FEEDBACK_CONTINUITY";
    else if (typeStr.includes("วาด") || typeStr.includes("path"))
      tipKey = "FEEDBACK_PATH";
    else if (
      typeStr.includes("ทรงตัว") ||
      typeStr.includes("balance") ||
      typeStr.includes("lean")
    )
      tipKey = "FEEDBACK_STABILITY";
    else if (typeStr.includes("กระตุก") || typeStr.includes("smooth"))
      tipKey = "FEEDBACK_SMOOTH";

    return (
      TRANSLATIONS[lang]?.tips?.[tipKey] || TRANSLATIONS[lang]?.tips?.default
    );
  }

  show(summary, gradeInfo, lang = "th") {
    this.close();
    // Helper for translations
    const t = TRANSLATIONS[lang]?.score_popup || TRANSLATIONS["th"].score_popup;

    // Data Preparation
    const progressRingHtml = this.createProgressRing(
      summary.score,
      gradeInfo.color
    );
    const tipText = this.getSmartTip(summary.topErrors, lang);
    const duration = summary.durationFormatted || summary.durationSeconds + "s";

    const limitedErrors = (summary.topErrors || []).slice(0, 3);

    // Top Errors List Generation
    let errorListHtml = "";
    if (limitedErrors.length > 0) {
      errorListHtml = `
        <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-left">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            ${t.error_breakdown}
          </p>
          <ul class="space-y-1">
            ${limitedErrors
              .map(
                (e) => `
              <li class="text-xs text-gray-600 dark:text-gray-300 flex justify-between">
                <span>• ${e.type}</span>
                <span class="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-[10px]">${e.count}x</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `;
    }

    // Popup Creation
    this.popup = document.createElement("div");
    this.popup.id = "score-popup";
    this.popup.className =
      "fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 transition-opacity duration-300";

    this.popup.innerHTML = `
      <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center relative transform scale-95 opacity-0 animate-popup-in border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <!-- Title -->
        <h3 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-indigo-500 mb-2">
          ${t.title}
        </h3>

        <!-- Close X Button -->
        <button id="close-x-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Compact Header: Grade + Ring (Side-by-Side) -->
        <div class="flex flex-row items-center justify-center gap-8 mb-6 mt-2">
            <!-- Left: Grade -->
            <div class="flex flex-col items-center">
               <h2 class="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 filter drop-shadow-sm leading-none" 
                   style="background-image: linear-gradient(135deg, ${gradeInfo.color}, ${gradeInfo.color}); -webkit-text-fill-color: transparent; -webkit-background-clip: text;">
                 ${gradeInfo.grade}
               </h2>
               <p class="text-lg font-medium text-gray-500 dark:text-gray-400 mt-2">${gradeInfo.label}</p>
            </div>

            <!-- Right: Ring -->
            <div class="flex-shrink-0">
                ${progressRingHtml}
            </div>
        </div>

        <!-- 3-Column Stats Grid (Larger Fonts) -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <!-- Correct -->
          <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
             <div class="text-3xl font-black text-green-500">${summary.correctFrames}</div>
             <div class="text-[9px] text-gray-500 uppercase tracking-wider">${t.correct}</div>
          </div>
          <!-- Error -->
          <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
             <div class="text-3xl font-black text-red-500">${summary.errorFrames}</div>
             <div class="text-[9px] text-gray-500 uppercase tracking-wider">${t.fix}</div>
          </div>
           <!-- Duration -->
          <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
             <div class="text-3xl font-black text-blue-500">${duration}</div>
             <div class="text-[9px] text-gray-500 uppercase tracking-wider">${t.time}</div>
          </div>
        </div>

        <!-- Coach's Tip & Errors -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4 border-l-4 border-blue-500">
            <div class="text-left">
              <p class="text-[10px] font-bold text-blue-600 dark:text-blue-300 mb-1 uppercase flex items-center gap-1">
                <span class="text-base">💡</span> ${t.coach_tip}
              </p>
              <p class="text-sm text-gray-800 dark:text-gray-200 leading-snug font-medium">
                "${tipText}"
              </p>
            </div>
            <!-- Nested Error List -->
            ${errorListHtml}
        </div>
        
        <!-- Feedback Section (Matched with Feedback Popup) -->
        <div class="mb-2 text-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
             <!-- 1. Header -->
             <h3 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
               ${t.feedback_title}
             </h3>
             
             <!-- 2. Sub-Header -->
             <p class="text-sm text-gray-600 dark:text-gray-300 font-medium mb-4">
               ${t.feedback_sub}
             </p>

             <!-- 3. QR Code with Background -->
             <div class="relative bg-white p-2 rounded-xl shadow-inner border border-gray-100 dark:border-gray-800 mx-auto w-fit mb-4">
               <img src="images/qr_feedback.png" alt="QR" class="w-32 h-32 rounded-lg object-contain">
             </div>

             <!-- 4. Text Below QR -->
             <p class="text-xs text-gray-400 mb-4">
               ${t.qr_instruction}
             </p>
             
             <!-- 5. Primary Action: Survey Button (Purple) -->
             <a href="${this.formUrl}" target="_blank" 
                class="block w-fit mx-auto px-8 py-3 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full font-semibold shadow-md shadow-purple-500/20 transform transition active:scale-95 mb-3 text-sm">
                ${t.take_survey_btn}
             </a>
        </div>

        <!-- 6. Secondary Action: Close Button (Text Only) -->
        <button id="close-score-popup" 
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors">
          ${t.close_btn}
        </button>

      </div>
      <style>
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        @keyframes popup-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-popup-in { animation: popup-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      </style>
    `;

    document.body.appendChild(this.popup);
    this.bindEvents();
  }

  bindEvents() {
    if (!this.popup) return;
    const closeBtn = this.popup.querySelector("#close-score-popup");
    if (closeBtn) closeBtn.addEventListener("click", () => this.close());

    // Bind Close X Button
    const closeXBtn = this.popup.querySelector("#close-x-btn");
    if (closeXBtn) closeXBtn.addEventListener("click", () => this.close());

    this.popup.addEventListener("click", (e) => {
      // Close only if clicking strictly outside the content
      if (e.target.id === "score-popup") this.close();
    });
  }

  close() {
    if (this.popup) {
      this.popup.style.opacity = "0";
      setTimeout(() => {
        if (this.popup) this.popup.remove();
        this.popup = null;
      }, 200);
    }
  }
}

const scorePopupManager = new ScorePopupManager();
