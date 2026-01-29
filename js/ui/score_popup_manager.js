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
    // 1. Ensure UIManager exists
    if (!window.uiManager) return;

    // Helper for translations
    const t = TRANSLATIONS[lang]?.score_popup || TRANSLATIONS["th"].score_popup;

    // Data Preparation
    const progressRingHtml = this.createProgressRing(
      summary.score,
      gradeInfo.color,
    );
    const tipText = this.getSmartTip(summary.topErrors, lang);
    const duration = summary.durationFormatted || summary.durationSeconds + "s";

    // Random Motivational Quote
    const quotes = t.motivational_quotes || [];
    const randomQuote =
      quotes.length > 0
        ? quotes[Math.floor(Math.random() * quotes.length)]
        : null;

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
            `,
              )
              .join("")}
          </ul>
        </div>
      `;
    }

    // 2. Generate HTML Content
    // 2. Generate HTML Content
    const html = `
      <div class="bg-white/90 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full text-center relative transform scale-95 animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] border border-white/20 dark:border-gray-700/50 max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <!-- Close X Button -->
        <button id="close-x-btn-score" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Title (Full Width) -->
        <h3 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-indigo-500 mb-4">
          ${t.title}
        </h3>

        <!-- 2-Column Layout (responsive: stack on mobile) -->
        <div class="flex flex-col sm:flex-row gap-6">
          
          <!-- LEFT COLUMN: Score Info -->
          <div class="flex-1 min-w-0">
            <!-- Grade + Ring (Side-by-Side) -->
            <div class="flex flex-row items-center justify-center gap-6 mb-4">
                <!-- Left: Grade -->
                <div class="flex flex-col items-center">
                  <h2 class="text-6xl font-black leading-none" 
                      style="background-image: linear-gradient(135deg, ${
                        gradeInfo.color
                      }, ${
                        gradeInfo.color
                      }); -webkit-text-fill-color: transparent; -webkit-background-clip: text;">
                    ${gradeInfo.grade}
                  </h2>
                  <p class="text-base font-medium text-gray-500 dark:text-gray-400 mt-1">${
                    gradeInfo.label
                  }</p>
                </div>

                <!-- Right: Ring -->
                <div class="flex-shrink-0">
                    ${progressRingHtml}
                </div>
            </div>

            <!-- 3-Column Stats Grid -->
            <div class="grid grid-cols-3 gap-2 mb-4">
              <!-- Correct -->
              <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                <div class="text-2xl font-black text-green-500">${
                  summary.correctFrames
                }</div>
                <div class="text-[9px] text-gray-500 uppercase tracking-wider">${
                  t.correct
                }</div>
              </div>
              <!-- Error -->
              <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                <div class="text-2xl font-black text-red-500">${
                  summary.errorFrames
                }</div>
                <div class="text-[9px] text-gray-500 uppercase tracking-wider">${
                  t.fix
                }</div>
              </div>
              <!-- Duration -->
              <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                <div class="text-2xl font-black text-blue-500">${duration}</div>
                <div class="text-[9px] text-gray-500 uppercase tracking-wider">${
                  t.time
                }</div>
              </div>
            </div>

            <!-- Coach's Tip & Errors -->
            <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border-l-4 border-blue-500">
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
            <!-- Instant Replay Button -->
            <button id="btn-instant-replay" class="mt-4 w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ${t.instant_replay || "Watch Replay"}
            </button>
          </div>

          <!-- RIGHT COLUMN: Feedback (Shared Component) -->
          <div class="flex-1 min-w-0 flex flex-col items-center justify-between sm:border-l sm:border-gray-100 dark:sm:border-gray-800 sm:pl-6">
            ${createSurveySectionHtml({
              translations:
                TRANSLATIONS[lang]?.feedback_popup ||
                TRANSLATIONS["th"].feedback_popup,
              formUrl: this.formUrl,
              closeButtonId: "close-score-popup", // This ID is used for the button bottom right
              variant: "compact",
            })}
          </div>

        </div>

        <!-- Footer: Motivational Quote (spanning both columns) -->
        ${
          randomQuote
            ? `
        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400 italic">
            "${randomQuote.zh}" — ${randomQuote.text}
          </p>
        </div>
        `
            : ""
        }

      </div>
      <style>
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      </style>
    `;

    // 3. Call UIManager
    const popupEl = window.uiManager.showPopup(html, {
      id: "score-popup-dynamic",
      closeBtnId: "close-x-btn-score", // Bind Top Right X
    });

    // 4. Bind Secondary Close Button (survey close button)
    const surveyCloseBtn = popupEl.querySelector("#close-score-popup");
    if (surveyCloseBtn) {
      surveyCloseBtn.addEventListener("click", () => {
        // Simulate click on known close button or trigger close somehow?
        // Since we know the X button is bound, let's just trigger it.
        const xBtn = popupEl.querySelector("#close-x-btn-score");
        if (xBtn) xBtn.click();
      });
    }

    this.popup = popupEl; // Keep reference if needed, though uiManager manages removal
  }
}

const scorePopupManager = new ScorePopupManager();
