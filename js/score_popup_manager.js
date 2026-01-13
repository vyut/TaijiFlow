/**
 * ============================================================================
 * TaijiFlow AI - Score Popup Manager v3.1 (Visual Balance)
 * ============================================================================
 *
 * แสดง Popup สรุปคะแนนหลังจบ Session การฝึก (UI ใหม่)
 *
 * @version 3.1 (2026-01-13)
 * - Refined Text: Shorter, more direct wording
 * - UI Polish: Close button width adjusted (pill shape) for better balance
 */

class ScorePopupManager {
  constructor() {
    this.popup = null;
    this.formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSf3uXhHZogHZAR5apQ0QUAwlhiI6yvBLNHorPw7ydY3QEtklQ/viewform";
  }

  createProgressRing(percentage, color) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return `
      <div class="relative flex items-center justify-center w-40 h-40 mx-auto my-2">
        <svg class="w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r="${radius}" stroke="currentColor" stroke-width="10" fill="transparent" class="text-gray-100 dark:text-gray-800" />
          <circle cx="50%" cy="50%" r="${radius}" stroke="${color}" stroke-width="10" fill="transparent" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" class="transition-all duration-1000 ease-out" style="stroke-dashoffset: ${circumference}; animation: progress 1.5s ease-out forwards;" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-4xl font-black dark:text-white filter drop-shadow-sm" style="color:${color}">${percentage}%</span>
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
    const isThaiLang = lang === "th";

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
            ${isThaiLang ? "รายละเอียดข้อผิดพลาด" : "Error Breakdown"}
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
        
        <!-- Header: Grade -->
        <div class="">
           <h2 class="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 filter drop-shadow-sm" 
               style="background-image: linear-gradient(135deg, ${
                 gradeInfo.color
               }, ${
      gradeInfo.color
    }); -webkit-text-fill-color: transparent; -webkit-background-clip: text;">
             ${gradeInfo.grade}
           </h2>
           <p class="text-xl font-medium text-gray-500 dark:text-gray-400">${
             gradeInfo.label
           }</p>
        </div>

        <!-- Ring Chart -->
        ${progressRingHtml}

        <!-- 3-Column Stats Grid (Larger Fonts) -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <!-- Correct -->
          <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
             <div class="text-3xl font-black text-green-500">${
               summary.correctFrames
             }</div>
             <div class="text-[9px] text-gray-500 uppercase tracking-wider">${
               isThaiLang ? "ถูกต้อง" : "Correct"
             }</div>
          </div>
          <!-- Error -->
          <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
             <div class="text-3xl font-black text-red-500">${
               summary.errorFrames
             }</div>
             <div class="text-[9px] text-gray-500 uppercase tracking-wider">${
               isThaiLang ? "แก้ไข" : "Fix"
             }</div>
          </div>
           <!-- Duration -->
          <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
             <div class="text-3xl font-black text-blue-500">${duration}</div>
             <div class="text-[9px] text-gray-500 uppercase tracking-wider">${
               isThaiLang ? "เวลา" : "Time"
             }</div>
          </div>
        </div>

        <!-- Coach's Tip & Errors -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4 border-l-4 border-blue-500">
            <div class="text-left">
              <p class="text-[10px] font-bold text-blue-600 dark:text-blue-300 mb-1 uppercase flex items-center gap-1">
                <span class="text-base">💡</span> ${
                  isThaiLang ? "คำแนะนำจากโค้ช" : "Coach's Tip"
                }
              </p>
              <p class="text-sm text-gray-800 dark:text-gray-200 leading-snug font-medium">
                "${tipText}"
              </p>
            </div>
            <!-- Nested Error List -->
            ${errorListHtml}
        </div>
        
        <!-- Feedback Section (Refined Text) -->
        <div class="mb-4 text-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
             <p class="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
               ${
                 isThaiLang
                   ? "ช่วยพัฒนา TaijiFlow AI ให้ดียิ่งขึ้น"
                   : "Help make TaijiFlow AI even better"
               }
             </p>
             <p class="text-[10px] text-gray-400 mb-2">
               ${
                 isThaiLang
                   ? "สแกน QR Code หรือคลิกปุ่มด้านล่าง"
                   : "Scanning QR or clicking below"
               }
             </p>
             <img src="images/qr_feedback.png" alt="QR" class="w-28 h-28 mx-auto rounded-lg shadow-md border border-white dark:border-gray-700 bg-white p-1">
             <a href="${this.formUrl}" target="_blank" 
                class="inline-block mt-3 px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-full transition font-bold">
                ${isThaiLang ? "📋 ตอบแบบสอบถาม" : "📋 Take Survey"}
             </a>
        </div>

        <!-- Actions (Balanced Width Pill Button) -->
        <button id="close-score-popup" 
          class="px-12 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold shadow-lg shadow-purple-500/30 transform transition active:scale-95 duration-200 text-base">
          ${isThaiLang ? "ปิดหน้าต่าง" : "Close"}
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
