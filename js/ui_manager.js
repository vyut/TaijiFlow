/**
 * TaijiFlow AI - UI Manager v1.1
 * จัดการส่วนติดต่อผู้ใช้ (User Interface)
 *
 * Features:
 * - สลับภาษา Thai/English (i18n)
 * - สลับ Theme Light/Dark
 * - แสดง Notifications (Toast)
 * - แสดง Score Summary Popup
 */
class UIManager {
  constructor() {
    this.currentLang = "th";
    this.notificationContainer = document.getElementById(
      "notification-container"
    );
    this.currentTheme = "dark";

    // พจนานุกรมคำศัพท์ (Dictionary)
    this.translations = {
      th: {
        app_title: "TaijiFlow AI: ผู้ช่วยฝึกมวยไท้เก๊ก (v0.1)",
        select_exercise: "เลือกท่าฝึก :",
        select_level: "เลือกระดับ :",
        l1_btn: "ระดับที่ 1: ท่านั่ง",
        l2_btn: "ระดับที่ 2: ท่ายืน",
        l3_btn: "ระดับที่ 3: ท่ายืนย่อ",
        calibrate_btn: "📏 ปรับเทียบสัดส่วน",
        re_calibrate_btn: "📏 วัดใหม่อีกครั้ง",
        cancel_btn: "❌ ยกเลิก",
        fullscreen_btn: "เต็มจอ (F)",
        record_btn_start: "⏺️ บันทึก (R)",
        record_btn_stop: "⏹️ หยุดบันทึก",
        instructions_title: "💡 คำแนะนำ:",
        instructions_1: "เลือกท่าฝึกและระดับ แล้วกด 'เริ่มการฝึก'",
        instructions_2: "ยืนให้เห็นเต็มตัว ห่างจากกล้อง 2-3 เมตร",
        instructions_3: "แสงสว่างต้องเพียงพอ",
        loading: "กำลังโหลดโมเดล AI...",
        overlay_title: "พร้อมเริ่มฝึกหรือยัง?",
        overlay_desc: "*กดเพื่อเริ่มวัดตัวก่อนการฝึก",
        alert_calib_success: "ปรับเทียบสำเร็จ! ระบบพร้อมใช้งานแล้ว",
        alert_no_data: "ไม่มีข้อมูลการบันทึก",
        alert_report_saved: "บันทึกรายงานผลการฝึกเรียบร้อยแล้ว!",
        alert_data_saved: "บันทึกข้อมูลสำเร็จ!",
        ex_rh_cw: "มือขวา - ตามเข็ม",
        ex_rh_ccw: "มือขวา - ทวนเข็ม",
        ex_lh_cw: "มือซ้าย - ตามเข็ม",
        ex_lh_ccw: "มือซ้าย - ทวนเข็ม",
        ex_placeholder: "-- เลือกท่าฝึก --",
        start_training_btn: "🏃 เริ่มการฝึก",
        stop_training_btn: "⏹️ หยุดการฝึก",
        overlay_how_to: "📋 วิธีเริ่มต้นใช้งาน",
        overlay_step1: 'เลือก "ท่าฝึก" จากเมนูด้านบน',
        overlay_step2: 'เลือก "ระดับ" ที่ต้องการฝึก',
        overlay_step3: 'กดปุ่ม "🏃 เริ่มการฝึก"',
        overlay_note:
          "⏱️ บันทึกอัตโนมัติ 5 นาที | 📏 ปรับเทียบสัดส่วนอัตโนมัติทุกครั้ง",
        level_placeholder: "-- เลือกระดับ --",
        level_l1: "Level 1: ท่านั่ง",
        level_l2: "Level 2: ท่ายืน",
        level_l3: "Level 3: ท่ายืนย่อ",
      },
      en: {
        app_title: "TaijiFlow AI: Taijiquan Assistant (v0.1)",
        select_exercise: "Select Exercise:",
        select_level: "Select Level:",
        l1_btn: "Level 1: Seated",
        l2_btn: "Level 2: Standing",
        l3_btn: "Level 3: Bow Stance",
        calibrate_btn: "📏 Calibrate",
        re_calibrate_btn: "📏 Re-Calibrate",
        cancel_btn: "❌ Cancel",
        fullscreen_btn: "(F)ullscreen",
        record_btn_start: "⏺️ Record (R)",
        record_btn_stop: "⏹️ Stop Recording",
        instructions_title: "💡 Tips:",
        instructions_1: "Select exercise & level, then press 'Start Training'",
        instructions_2: "Stand full-body, 2-3m from camera",
        instructions_3: "Ensure good lighting",
        loading: "Loading AI Models...",
        overlay_title: "Ready to Train?",
        overlay_desc: "*Press to calibrate your body proportions",
        alert_calib_success: "Calibration Complete! System Ready.",
        alert_no_data: "No recorded data found.",
        alert_report_saved: "Session report saved successfully!",
        alert_data_saved: "Data saved successfully!",
        ex_rh_cw: "Right Hand - Clockwise",
        ex_rh_ccw: "Right Hand - Counter-Clockwise",
        ex_lh_cw: "Left Hand - Clockwise",
        ex_lh_ccw: "Left Hand - Counter-Clockwise",
        ex_placeholder: "-- Select Exercise --",
        start_training_btn: "🏃 Start Training",
        stop_training_btn: "⏹️ Stop Training",
        overlay_how_to: "📋 How to Start",
        overlay_step1: 'Select "Exercise" from the menu above',
        overlay_step2: 'Select "Level" to train',
        overlay_step3: 'Press "🏃 Start Training"',
        overlay_note:
          "⏱️ Auto-record 5 min | 📏 Auto-calibration before each session",
        level_placeholder: "-- Select Level --",
        level_l1: "Level 1: Seated",
        level_l2: "Level 2: Standing",
        level_l3: "Level 3: Bow Stance",
      },
    };
  }

  init() {
    // Load settings from localStorage if available
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) this.setTheme(savedTheme);

    this.updateText();
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === "th" ? "en" : "th";
    this.updateText();
    return this.currentLang;
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
    return newTheme;
  }

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem("theme", theme); // Remember user preference

    const body = document.body;
    const mainCard = document.getElementById("main-card");

    if (theme === "dark") {
      body.classList.remove("bg-f3f4f6");
      body.classList.add("bg-gray-900");

      mainCard.classList.remove("bg-white");
      mainCard.classList.add("bg-gray-800", "text-white", "border-gray-700");

      // ปรับสี Text ใน Dropdown และอื่นๆ ให้เหมาะสม
      document
        .querySelectorAll("label")
        .forEach((el) => el.classList.add("text-gray-200"));
      document
        .querySelectorAll("label")
        .forEach((el) => el.classList.remove("text-gray-700"));
    } else {
      body.classList.remove("bg-gray-900");
      body.classList.add("bg-f3f4f6");

      mainCard.classList.remove("bg-gray-800", "text-white", "border-gray-700");
      mainCard.classList.add("bg-white");

      document
        .querySelectorAll("label")
        .forEach((el) => el.classList.remove("text-gray-200"));
      document
        .querySelectorAll("label")
        .forEach((el) => el.classList.add("text-gray-700"));
    }
  }

  updateText() {
    const t = this.translations[this.currentLang];

    // Helper function to safe update
    const setText = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t[key];
    };

    setText("app-title", "app_title");
    setText("label-exercise", "select_exercise");
    setText("label-level", "select_level");
    setText("level1-btn", "l1_btn");
    setText("level2-btn", "l2_btn");
    setText("level3-btn", "l3_btn");
    setText("big-calibrate-btn-text", "calibrate_btn");
    setText("small-calibrate-btn", "re_calibrate_btn");
    setText("cancel-calib-btn", "cancel_btn");
    setText("fullscreen-btn", "fullscreen_btn");
    this.updateRecordButtonState(false); // ตั้งค่าเริ่มต้นให้ปุ่ม Record

    setText("instr-title", "instructions_title");
    setText("instr-1", "instructions_1");
    setText("instr-2", "instructions_2");
    setText("instr-3", "instructions_3");
    setText("loading-text", "loading");
    setText("overlay-title", "overlay_how_to");
    setText("overlay-step1", "overlay_step1");
    setText("overlay-step2", "overlay_step2");
    setText("overlay-step3", "overlay_step3");
    setText("overlay-note", "overlay_note");
    setText("start-training-btn", "start_training_btn");

    // Update Dropdown Options (index 0 = placeholder, 1-4 = exercises)
    const exSelect = document.getElementById("exercise-select");
    if (exSelect && exSelect.options.length >= 5) {
      exSelect.options[0].text = t["ex_placeholder"];
      exSelect.options[1].text = t["ex_rh_cw"];
      exSelect.options[2].text = t["ex_rh_ccw"];
      exSelect.options[3].text = t["ex_lh_cw"];
      exSelect.options[4].text = t["ex_lh_ccw"];
    }

    // Update Level Dropdown Options
    const levelSelect = document.getElementById("level-select");
    if (levelSelect && levelSelect.options.length >= 4) {
      levelSelect.options[0].text = t["level_placeholder"];
      levelSelect.options[1].text = t["level_l1"];
      levelSelect.options[2].text = t["level_l2"];
      levelSelect.options[3].text = t["level_l3"];
    }

    // Update Stop Training Button
    const stopBtn = document.getElementById("stop-training-btn");
    if (stopBtn) stopBtn.innerText = t["stop_training_btn"];

    // Update Title Text (separate from emoji)
    const titleText = document.querySelector(".title-text");
    if (titleText) {
      const titleOnly = t["app_title"].replace(/^☯️\s*/, "");
      titleText.innerText = titleOnly;
    }
  }

  // ฟังก์ชันช่วยสำหรับดึงข้อความไปใช้ใน script.js (เช่น Alert)
  getText(key) {
    return this.translations[this.currentLang][key];
  }

  updateLevelButtons(activeLevel) {
    const levelButtons = document.querySelectorAll(".level-btn");
    levelButtons.forEach((btn) => {
      if (btn.dataset.level === activeLevel) {
        btn.classList.remove("bg-gray-100", "text-gray-600");
        btn.classList.add("bg-blue-600", "text-white", "active", "shadow-sm");
      } else {
        btn.classList.remove(
          "bg-blue-600",
          "text-white",
          "active",
          "shadow-sm"
        );
        btn.classList.add("bg-gray-100", "text-gray-600");
      }
    });
  }

  updateRecordButtonState(isRecording) {
    const recordBtn = document.getElementById("record-btn");
    if (!recordBtn) return;

    if (isRecording) {
      recordBtn.innerText = this.getText("record_btn_stop");
      recordBtn.classList.replace("bg-red-100", "bg-red-600");
      recordBtn.classList.replace("text-red-600", "text-white");
    } else {
      recordBtn.innerText = this.getText("record_btn_start");
      recordBtn.classList.replace("bg-red-600", "bg-red-100");
      recordBtn.classList.replace("text-white", "text-red-600");
    }
  }

  /**
   * แสดง Notification แบบ Toast ที่มุมจอ
   * @param {string} message ข้อความที่จะแสดง
   * @param {string} type ประเภท ('info', 'success', 'warning', 'error')
   * @param {number} duration ระยะเวลาที่จะแสดง (ms)
   */
  showNotification(message, type = "info", duration = 3000) {
    if (!this.notificationContainer) return;

    const notification = document.createElement("div");
    // Base classes
    notification.className =
      "notification flex items-center gap-4 p-4 rounded-lg shadow-lg text-white max-w-sm";

    let bgColor, icon;

    switch (type) {
      case "success":
        bgColor = "bg-green-500";
        icon = "✅";
        break;
      case "error":
        bgColor = "bg-red-500";
        icon = "❌";
        break;
      case "warning":
        bgColor = "bg-yellow-500";
        icon = "⚠️";
        break;
      default: // 'info'
        bgColor = "bg-blue-500";
        icon = "ℹ️";
        break;
    }

    notification.classList.add(bgColor);
    notification.innerHTML = `
        <span class="text-2xl">${icon}</span>
        <span class="font-medium">${message}</span>
    `;

    this.notificationContainer.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => notification.classList.add("show"));

    // Animate out and remove
    setTimeout(() => {
      notification.classList.remove("show");
      // รอ animation จบแล้วค่อยลบ Element
      notification.addEventListener("transitionend", () =>
        notification.remove()
      );
    }, duration);
  }

  /**
   * แสดง Popup สรุปคะแนนหลังจบ Session
   * @param {Object} summary - ข้อมูลสรุปจาก ScoringManager
   * @param {Object} gradeInfo - ข้อมูลเกรด (grade, label, color)
   */
  showScoreSummary(summary, gradeInfo) {
    if (!this.notificationContainer) return;

    const isThaiLang = this.currentLang === "th";

    // สร้าง Popup Element
    const popup = document.createElement("div");
    popup.className =
      "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50";

    // สร้างข้อความ Top Errors
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

    popup.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm text-center transform scale-100 animate-pulse-once">
        <div class="text-6xl font-bold mb-2" style="color: ${
          gradeInfo.color
        }">${gradeInfo.grade}</div>
        <div class="text-2xl font-medium text-gray-600 dark:text-gray-300 mb-1">${
          gradeInfo.label
        }</div>
        <div class="text-5xl font-bold text-gray-800 dark:text-white mb-4">${
          summary.score
        }%</div>
        
        <div class="grid grid-cols-2 gap-4 text-center mb-4">
          <div class="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">${
              summary.correctFrames
            }</div>
            <div class="text-xs text-green-700 dark:text-green-300">${
              isThaiLang ? "เฟรมถูกต้อง" : "Correct"
            }</div>
          </div>
          <div class="bg-red-50 dark:bg-red-900 p-3 rounded-lg">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">${
              summary.errorFrames
            }</div>
            <div class="text-xs text-red-700 dark:text-red-300">${
              isThaiLang ? "เฟรมผิดพลาด" : "Errors"
            }</div>
          </div>
        </div>
        
        <p class="text-sm text-gray-500">${
          isThaiLang ? "ระยะเวลา:" : "Duration:"
        } ${summary.durationSeconds}s | ${summary.totalFrames} frames</p>
        
        ${topErrorsHtml}
        
        <button id="close-score-popup" class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-bold">
          ${isThaiLang ? "ปิด" : "Close"}
        </button>
      </div>
    `;

    document.body.appendChild(popup);

    // ปิด Popup เมื่อคลิกปุ่มหรือพื้นหลัง
    const closeBtn = popup.querySelector("#close-score-popup");
    closeBtn.addEventListener("click", () => popup.remove());
    popup.addEventListener("click", (e) => {
      if (e.target === popup) popup.remove();
    });

    // แสดง Notification ด้วย
    this.showNotification(
      `${this.getText("alert_data_saved")} (${summary.totalFrames} frames)`,
      "success"
    );
  }
}
