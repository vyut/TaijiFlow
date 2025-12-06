class UIManager {
  constructor() {
    this.currentLang = "th";
    this.currentTheme = "dark";

    // พจนานุกรมคำศัพท์ (Dictionary)
    this.translations = {
      th: {
        app_title: "☯️ TaijiFlow AI: ผู้ช่วยฝึกมวยไท้เก๊ก - ท่าม้วนไหม",
        select_exercise: "เลือกท่าฝึก :",
        select_level: "เลือกระดับ :",
        l1_btn: "ระดับที่ 1: ท่านั่ง",
        l2_btn: "ระดับที่ 2: ท่ายืน",
        l3_btn: "ระดับที่ 3: ท่ายืนย่อ",
        calibrate_btn: "📏 ปรับเทียบสัดส่วน",
        re_calibrate_btn: "📏 วัดใหม่อีกครั้ง",
        cancel_btn: "❌ ยกเลิก",
        fullscreen_btn: "เต็มจอ (F)",
        record_btn_start: "บันทึก (R)",
        record_btn_stop: "⏹️ จบการฝึก",
        instructions_title: "💡 คำแนะนำ:",
        instructions_1: 'กดปุ่ม "ปรับเทียบสัดส่วน" ก่อนเริ่มใช้งานครั้งแรก',
        instructions_2: "ยืนให้เต็มตัว ห่างจากกล้อง 2-3 เมตร",
        instructions_3: "แสงสว่างต้องเพียงพอ",
        loading: "กำลังโหลดโมเดล AI...",
        overlay_title: "พร้อมเริ่มฝึกหรือยัง?",
        overlay_desc: "*กดเพื่อเริ่มวัดตัวก่อนการฝึก",
        alert_calib_success: "ปรับเทียบสำเร็จ! ระบบพร้อมใช้งานแล้ว",
        ex_rh_cw: "มือขวา - ตามเข็ม",
        ex_rh_ccw: "มือขวา - ทวนเข็ม",
        ex_lh_cw: "มือซ้าย - ตามเข็ม",
        ex_lh_ccw: "มือซ้าย - ทวนเข็ม",
      },
      en: {
        app_title: "☯️ TaijiFlow AI: Taijiquan Assistant - Silk Reeling",
        select_exercise: "Select Exercise:",
        select_level: "Select Level:",
        l1_btn: "Level 1: Seated",
        l2_btn: "Level 2: Standing",
        l3_btn: "Level 3: Bow Stance",
        calibrate_btn: "📏 Calibrate",
        re_calibrate_btn: "📏 Re-Calibrate",
        cancel_btn: "❌ Cancel",
        fullscreen_btn: "(F)ullscreen",
        record_btn_start: "(R)ecord",
        record_btn_stop: "⏹️ Stop",
        instructions_title: "💡 Instructions:",
        instructions_1: 'Press "Calibrate" before starting.',
        instructions_2: "Stand full-body, 2-3m from camera.",
        instructions_3: "Ensure good lighting.",
        loading: "Loading AI Models...",
        overlay_title: "Ready to Train?",
        overlay_desc: "*Press to calibrate your body proportions",
        alert_calib_success: "Calibration Complete! System Ready.",
        ex_rh_cw: "Right Hand - Clockwise",
        ex_rh_ccw: "Right Hand - Counter-Clockwise",
        ex_lh_cw: "Left Hand - Clockwise",
        ex_lh_ccw: "Left Hand - Counter-Clockwise",
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

    // ปุ่ม Record ต้องเช็คสถานะปัจจุบันก่อน
    const recBtn = document.getElementById("record_btn");
    if (recBtn) {
      // Logic นี้อาจจะต้องเชื่อมกับ scriptหลัก แต่เบื้องต้นเซ็ตค่า default ก่อน
      // หรือเราอาจจะข้ามปุ่มนี้ไปก่อนแล้วให้ script.js จัดการตอน toggle
    }

    setText("instr-title", "instructions_title");
    setText("instr-1", "instructions_1");
    setText("instr-2", "instructions_2");
    setText("instr-3", "instructions_3");
    setText("loading-text", "loading");
    setText("overlay-title", "overlay_title");
    setText("overlay-desc", "overlay_desc");

    // Update Dropdown Options
    const exSelect = document.getElementById("exercise-select");
    if (exSelect) {
      exSelect.options[0].text = t["ex_rh_cw"];
      exSelect.options[1].text = t["ex_rh_ccw"];
      exSelect.options[2].text = t["ex_lh_cw"];
      exSelect.options[3].text = t["ex_lh_ccw"];
    }
  }

  // ฟังก์ชันช่วยสำหรับดึงข้อความไปใช้ใน script.js (เช่น Alert)
  getText(key) {
    return this.translations[this.currentLang][key];
  }
}
