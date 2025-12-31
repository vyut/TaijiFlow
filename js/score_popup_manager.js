/**
 * ============================================================================
 * TaijiFlow AI - Score Popup Manager v1.0
 * ============================================================================
 *
 * แสดง Popup สรุปคะแนนหลังจบ Session การฝึก
 *
 * @description
 *   แสดง Popup ขนาดใหญ่ตรงกลางจอ สรุปผลการฝึก
 *   แยกออกจาก ui_manager.js เพื่อลดขนาดไฟล์
 *
 * 📋 หน้าที่หลัก:
 *   - show() - แสดง Popup พร้อมข้อมูลคะแนน
 *   - close() - ปิด Popup
 *
 * 📊 ข้อมูลที่แสดง:
 *   - Grade (A/B/C/D/F) พร้อมสี
 *   - คะแนนเปอร์เซ็นต์
 *   - จำนวน Frame ที่ถูกต้อง/ผิดพลาด
 *   - ระยะเวลาฝึก
 *   - รายการข้อผิดพลาดที่พบบ่อย
 *   - QR Code แบบสอบถาม
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 1.0.0
 * @version 1.0 (2024-12-31)
 * ============================================================================
 */

class ScorePopupManager {
  constructor() {
    this.popup = null;
    this.formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSf3uXhHZogHZAR5apQ0QUAwlhiI6yvBLNHorPw7ydY3QEtklQ/viewform";
  }

  /**
   * แสดง Popup สรุปคะแนน
   * @param {Object} summary - ข้อมูลสรุปจาก ScoringManager
   * @param {Object} gradeInfo - ข้อมูลเกรด (grade, label, color)
   * @param {string} lang - ภาษาปัจจุบัน ("th" หรือ "en")
   */
  show(summary, gradeInfo, lang = "th") {
    // ปิด Popup เก่า (ถ้ามี)
    this.close();

    const isThaiLang = lang === "th";

    // สร้าง Top Errors Section (ถ้ามี)
    let topErrorsHtml = "";
    if (summary.topErrors && summary.topErrors.length > 0) {
      const errorItems = summary.topErrors
        .map(
          (e) =>
            `<li class="text-sm text-gray-600 dark:text-gray-300">• ${e.type} (${e.count}x)</li>`
        )
        .join("");

      topErrorsHtml = `
        <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p class="text-xs font-bold text-gray-500 mb-1">${
            isThaiLang ? "ข้อผิดพลาดที่พบบ่อย:" : "Top Errors:"
          }</p>
          <ul>${errorItems}</ul>
        </div>
      `;
    }

    // สร้าง Popup Element
    this.popup = document.createElement("div");
    this.popup.id = "score-popup";
    this.popup.className =
      "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50";

    this.popup.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm text-center transform scale-100 animate-pulse-once">
        <!-- Grade Letter -->
        <div class="text-6xl font-bold mb-2" style="color: ${
          gradeInfo.color
        }">${gradeInfo.grade}</div>
        
        <!-- Grade Label -->
        <div class="text-2xl font-medium text-gray-600 dark:text-gray-300 mb-1">${
          gradeInfo.label
        }</div>
        
        <!-- Score Percentage -->
        <div class="text-5xl font-bold text-gray-800 dark:text-white mb-4">${
          summary.score
        }%</div>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-4 text-center mb-4">
          <!-- Correct Frames -->
          <div class="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">${
              summary.correctFrames
            }</div>
            <div class="text-xs text-green-700 dark:text-green-300">${
              isThaiLang ? "เฟรมถูกต้อง" : "Correct"
            }</div>
          </div>
          
          <!-- Error Frames -->
          <div class="bg-red-50 dark:bg-red-900 p-3 rounded-lg">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">${
              summary.errorFrames
            }</div>
            <div class="text-xs text-red-700 dark:text-red-300">${
              isThaiLang ? "เฟรมผิดพลาด" : "Errors"
            }</div>
          </div>
        </div>
        
        <!-- Duration Info -->
        <p class="text-sm text-gray-500">${
          isThaiLang ? "ระยะเวลา:" : "Duration:"
        } ${summary.durationFormatted || summary.durationSeconds + "s"}</p>
        
        <!-- Top Errors Section -->
        ${topErrorsHtml}
        
        <!-- Feedback Section -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p class="text-xs text-gray-500 mb-2">
            ${
              isThaiLang
                ? "📝 ช่วยพัฒนาแอป TaijiFlow AI ให้ดียิ่งขึ้น"
                : "📝 Help improve TaijiFlow AI"
            }
          </p>
          <img 
            src="images/qr_feedback.png"
            alt="QR Feedback"
            class="mx-auto mb-2 rounded"
            width="100"
            height="100"
          />
          <a 
            href="${this.formUrl}" 
            target="_blank"
            class="inline-block px-4 py-2 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition"
          >
            ${isThaiLang ? "📋 ตอบแบบสอบถาม" : "📋 Give Feedback"}
          </a>
        </div>
        
        <!-- Close Button -->
        <button id="close-score-popup" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-bold">
          ${isThaiLang ? "ปิด" : "Close"}
        </button>
      </div>
    `;

    // เพิ่ม Popup เข้า DOM
    document.body.appendChild(this.popup);

    // ผูก Event Listeners
    this.bindEvents();
  }

  // ผูก Event สำหรับปิด Popup
  bindEvents() {
    if (!this.popup) return;

    // ปิดเมื่อกดปุ่ม "ปิด"
    const closeBtn = this.popup.querySelector("#close-score-popup");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // ปิดเมื่อคลิกพื้นหลังมืด
    this.popup.addEventListener("click", (e) => {
      if (e.target === this.popup) this.close();
    });
  }

  // ปิด Popup
  close() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
  }
}

// สร้าง Global Instance
const scorePopupManager = new ScorePopupManager();
