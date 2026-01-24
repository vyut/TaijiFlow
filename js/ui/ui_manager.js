/**
 * ============================================================================
 * TaijiFlow AI - UI Manager v1.1
 * ============================================================================
 *
 * ระบบจัดการส่วนติดต่อผู้ใช้ (User Interface Management System)
 *
 * @description
 *   ไฟล์นี้รับผิดชอบการจัดการ UI ทั้งหมดของแอปพลิเคชัน รวมถึง:
 *   - ระบบหลายภาษา (Internationalization - i18n)
 *   - ระบบ Theme (Light/Dark Mode)
 *   - ระบบ Notification (Toast Messages)
 *   - Popup แสดงผลคะแนน (Score Summary)
 *   - การอัปเดตสถานะปุ่มต่างๆ
 *
 * ============================================================================
 * หลักการออกแบบ UI สำหรับแอปฝึกไท่จี๋
 * ============================================================================
 *
 *   1. Minimal Distraction
 *      - UI ไม่ควรรบกวนการฝึก
 *      - ใช้ Notification แทน Alert ที่ต้องกดปิด
 *      - ข้อมูลสำคัญแสดงแบบ Non-blocking
 *
 *   2. Quick Glance Information
 *      - ผู้ฝึกควรเห็นข้อมูลได้เร็วเมื่อมองหน้าจอ
 *      - ใช้สีและไอคอนช่วยสื่อความหมาย
 *      - ขนาดตัวอักษรใหญ่พอสำหรับมองจากระยะ 2-3 เมตร
 *
 *   3. Multi-Language Support
 *      - รองรับทั้งภาษาไทยและอังกฤษ
 *      - เปลี่ยนภาษาได้ทันทีไม่ต้อง Refresh
 *      - จดจำการตั้งค่าภาษาใน localStorage
 *
 *   4. Theme Flexibility
 *      - Dark Mode สำหรับลดแสงรบกวนตา
 *      - Light Mode สำหรับแสงจ้า
 *      - จดจำการตั้งค่าใน localStorage
 *
 * ============================================================================
 * ระบบ Internationalization (i18n)
 * ============================================================================
 *
 *   แนวทางการทำ i18n ในไฟล์นี้:
 *
 *   1. ใช้ Dictionary Object (this.translations)
 *      - เก็บคำแปลทั้ง 2 ภาษาในที่เดียว
 *      - Key เดียวกันหาได้จากทุกภาษา
 *
 *   2. DOM ID Mapping
 *      - แต่ละ Element มี ID ที่สัมพันธ์กับ Key
 *      - Function updateText() จะอัปเดตทั้งหมด
 *
 *   3. Runtime Language Switch
 *      - เปลี่ยนภาษาได้ทันทีไม่ต้อง Reload
 *      - ใช้ toggleLanguage() แล้ว updateText()
 *
 * ============================================================================
 * ระบบ Theme (Light/Dark Mode)
 * ============================================================================
 *
 *   การทำงาน:
 *   1. ใช้ CSS Classes สลับสี
 *   2. เปลี่ยน Background และ Text Color
 *   3. บันทึกการตั้งค่าใน localStorage
 *
 *   Class Naming Convention (Tailwind-like):
 *   - bg-gray-900 = พื้นหลังเข้ม (Dark)
 *   - bg-f3f4f6 = พื้นหลังอ่อน (Light)
 *   - text-white = ตัวอักษรขาว
 *   - text-gray-700 = ตัวอักษรเทา
 *
 * ============================================================================
 * ระบบ Notification (Toast)
 * ============================================================================
 *
 *   Toast Notification คือการแจ้งเตือนที่ปรากฏชั่วคราว:
 *   - ไม่ต้องกดปิด (Auto-dismiss)
 *   - ไม่บล็อกการใช้งาน (Non-blocking)
 *   - มี Animation เข้า/ออก
 *
 *   ประเภท:
 *   - info (ข้อมูลทั่วไป) - สีน้ำเงิน
 *   - success (สำเร็จ) - สีเขียว
 *   - warning (เตือน) - สีเหลือง
 *   - error (ผิดพลาด) - สีแดง
 *
 * ============================================================================
 * โครงสร้างไฟล์
 * ============================================================================
 *
 *   Class: UIManager
 *   ├── constructor()             - เริ่มต้น/กำหนด Translations
 *   ├── init()                    - โหลดค่าจาก localStorage
 *   │
 *   ├── [Language Section]
 *   │   ├── toggleLanguage()      - สลับภาษา TH/EN
 *   │   ├── updateText()          - อัปเดตข้อความทั้งหน้า
 *   │   └── getText()             - ดึงข้อความตาม Key
 *   │
 *   ├── [Theme Section]
 *   │   ├── toggleTheme()         - สลับ Light/Dark
 *   │   └── setTheme()            - ตั้ง Theme เฉพาะ
 *   │
 *   ├── [Button State Section]
 *   │   ├── updateLevelButtons()  - อัปเดตปุ่มระดับ
 *   │   └── updateRecordButtonState() - อัปเดตปุ่ม Record
 *   │
 *   └── [Notification Section]
 *       ├── showNotification()    - แสดง Toast
 *       └── showScoreSummary()    - แสดง Popup สรุปคะแนน
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 1.0.0
 * @version 1.1
 * ============================================================================
 */

// =============================================================================
// CLASS: UIManager
// =============================================================================

/**
 * UIManager Class
 *
 * @description
 *   Class หลักสำหรับจัดการ User Interface ทั้งหมด
 *   ใช้ Singleton Pattern โดยมี Instance เดียวที่สร้างใน script.js
 *
 * @example
 *   // สร้าง Instance (ทำใน script.js)
 *   const uiManager = new UIManager();
 *   uiManager.init();
 *
 *   // สลับภาษา
 *   const newLang = uiManager.toggleLanguage(); // "en" หรือ "th"
 *
 *   // สลับ Theme
 *   const newTheme = uiManager.toggleTheme(); // "light" หรือ "dark"
 *
 *   // แสดง Notification
 *   uiManager.showNotification("บันทึกสำเร็จ!", "success");
 */
class UIManager {
  // ===========================================================================
  // CONSTRUCTOR
  // ===========================================================================

  /**
   * Constructor - เริ่มต้นระบบ UI Manager
   *
   * @description
   *   กำหนดค่าเริ่มต้นและสร้าง Translation Dictionary สำหรับ 2 ภาษา
   *
   * Properties ที่สร้าง:
   *
   *   @property {string} currentLang
   *     ภาษาปัจจุบัน
   *     - "th" = ภาษาไทย (Default)
   *     - "en" = ภาษาอังกฤษ
   *
   *   @property {HTMLElement|null} notificationContainer
   *     Container Element สำหรับแสดง Toast Notifications
   *     - ค้นหาจาก DOM ด้วย ID "notification-container"
   *     - ถ้าไม่พบจะเป็น null และ Notification จะไม่แสดง
   *
   *   @property {string} currentTheme
   *     Theme ปัจจุบัน
   *     - "dark" = Dark Mode (Default)
   *     - "light" = Light Mode
   *
   *   @property {Object} translations
   *     พจนานุกรมคำแปล (Translation Dictionary)
   *     โครงสร้าง: { th: { key: value }, en: { key: value } }
   */
  constructor() {
    // -------------------------------------------------------------------------
    // Language Settings
    // -------------------------------------------------------------------------
    // ภาษาเริ่มต้นเป็นภาษาไทย (Target Users หลักเป็นคนไทย)
    this.currentLang = "th";

    // -------------------------------------------------------------------------
    // DOM References
    // -------------------------------------------------------------------------
    // Container สำหรับ Toast Notifications (มุมบนขวาของหน้าจอ)
    this.notificationContainer = document.getElementById(
      "notification-container",
    );

    // -------------------------------------------------------------------------
    // Theme Settings
    // -------------------------------------------------------------------------
    // เริ่มต้นใช้ Dark Mode เพราะลดแสงรบกวนขณะฝึก
    this.currentTheme = "dark";

    // -------------------------------------------------------------------------
    // Translation Dictionary (i18n)
    // -------------------------------------------------------------------------
    // ใช้ TRANSLATIONS object จากไฟล์ translations.js
    // แยกไฟล์เพื่อให้แก้ไขและเพิ่มภาษาได้ง่ายขึ้น
    //
    // @see js/translations.js - ไฟล์เก็บ Translation Dictionary
    //
    // หมายเหตุ: TRANSLATIONS ต้องโหลดก่อน ui_manager.js ใน index.html
    // <script src="js/translations.js" defer></script>
    // <script src="js/ui_manager.js" defer></script>
    this.translations = TRANSLATIONS;
  }

  // ===========================================================================
  // METHOD: init
  // ===========================================================================

  /**
   * Initialize - โหลดการตั้งค่าจาก localStorage
   *
   * @description
   *   เรียกเมื่อแอปเริ่มทำงาน เพื่อโหลดค่า Theme และ Language ที่ผู้ใช้เคยเลือก
   *
   *   ขั้นตอน:
   *   1. โหลด Theme จาก localStorage (ถ้ามี)
   *   2. โหลด Language จาก localStorage (ถ้ามี)
   *   3. อัปเดต UI ตามค่าที่โหลดมา
   *
   * @example
   *   const uiManager = new UIManager();
   *   uiManager.init(); // โหลดค่าที่บันทึกไว้
   *
   * @note
   *   ควรเรียกหลังจาก DOM โหลดเสร็จแล้ว (DOMContentLoaded)
   */
  init() {
    // -------------------------------------------------------------------------
    // โหลด Theme จาก localStorage
    // -------------------------------------------------------------------------
    // ดึงค่าที่บันทึกไว้ (ถ้ามี)
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      this.setTheme(savedTheme);
    }

    // -------------------------------------------------------------------------
    // โหลด Language จาก localStorage
    // -------------------------------------------------------------------------
    // ดึงค่าที่บันทึกไว้ (ถ้ามี)
    const savedLang = localStorage.getItem("language");
    if (savedLang) {
      this.currentLang = savedLang;
    }

    // -------------------------------------------------------------------------
    // โหลด Performance Mode (Updated for Vertical List)
    // -------------------------------------------------------------------------
    // Note: UI Update logic moved to script.js (updatePerformanceMenuUI)
    // because it requires DOM access to the new list structure.

    // -------------------------------------------------------------------------
    // อัปเดต UI ตามค่าที่โหลดมา
    // -------------------------------------------------------------------------
    this.updateText();

    // -------------------------------------------------------------------------
    // ตรวจสอบ Mobile Device และแสดง Warning Modal
    // -------------------------------------------------------------------------
    this.checkMobileDevice();

    // -------------------------------------------------------------------------
    // เริ่มต้นระบบ Wisdom Popup (New)
    // -------------------------------------------------------------------------
    this.initWisdomPopup();
  }

  // ===========================================================================
  // METHOD: checkMobileDevice
  // ===========================================================================

  /**
   * Check Mobile Device - ตรวจสอบว่าผู้ใช้เปิดจากมือถือหรือไม่
   *
   * @description
   *   ตรวจสอบ User Agent เพื่อระบุว่าเป็น Mobile Phone (ไม่รวม Tablet)
   *   - iPhone: เช็คจาก 'iPhone' ใน User Agent
   *   - Android Phone: เช็คจาก 'Android' + 'Mobile' ใน User Agent
   *   - iPad และ Android Tablet: อนุญาตให้ใช้งานได้
   */
  checkMobileDevice() {
    const ua = navigator.userAgent;

    // เช็ค iPhone (ไม่รวม iPad)
    const isIPhone = /iPhone/i.test(ua) && !/iPad/i.test(ua);

    // เช็ค Android Phone (Android + Mobile = Phone, Android without Mobile = Tablet)
    const isAndroidPhone = /Android/i.test(ua) && /Mobile/i.test(ua);

    // เช็ค Mobile Phones อื่นๆ (BlackBerry, Windows Phone, etc.)
    const isOtherPhone =
      /webOS|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(ua);

    const isMobilePhone = isIPhone || isAndroidPhone || isOtherPhone;

    if (isMobilePhone) {
      // ซ่อน Privacy Modal ก่อน
      const privacyModal = document.getElementById("privacy-modal");
      if (privacyModal) {
        privacyModal.classList.add("hidden");
      }

      // แสดง Mobile Warning Modal
      const mobileModal = document.getElementById("mobile-modal");
      if (mobileModal) {
        mobileModal.classList.remove("hidden");
        mobileModal.classList.add("flex");

        // อัปเดตข้อความตามภาษา
        this.updateMobileModalText();

        // ปุ่ม "ดำเนินการต่อ" - ปิด Mobile Modal และแสดง Privacy Modal
        const continueBtn = document.getElementById("mobile-continue-btn");
        if (continueBtn) {
          continueBtn.addEventListener("click", () => {
            mobileModal.classList.add("hidden");
            mobileModal.classList.remove("flex");
            if (privacyModal) {
              privacyModal.classList.remove("hidden");
            }
          });
        }
      }
    }
  }

  // ===========================================================================
  // METHOD: updateMobileModalText
  // ===========================================================================

  /**
   * Update Mobile Modal Text - อัปเดตข้อความใน Mobile Modal ตามภาษา
   */
  updateMobileModalText() {
    const t = this.translations[this.currentLang];

    const setText = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t[key];
    };

    const setTextSpan = (id, key) => {
      const el = document.getElementById(id);
      if (el) {
        const span = el.querySelector("span:last-child");
        if (span) span.innerText = t[key];
      }
    };

    setText("mobile-title", "mobile_title");
    setText("mobile-desc", "mobile_desc");
    setText("mobile-issue-title", "mobile_issue_title");
    setTextSpan("mobile-issue1", "mobile_issue1");
    setTextSpan("mobile-issue2", "mobile_issue2");
    setTextSpan("mobile-issue3", "mobile_issue3");
    setText("mobile-back-btn", "mobile_back_btn");
    setText("mobile-continue-btn", "mobile_continue_btn");
  }

  // ===========================================================================
  // SECTION: LANGUAGE MANAGEMENT
  // ===========================================================================

  // ===========================================================================
  // METHOD: toggleLanguage
  // ===========================================================================

  /**
   * Toggle Language - สลับภาษาระหว่าง TH และ EN
   *
   * @description
   *   สลับภาษาและอัปเดต UI ทั้งหมดทันที
   *   บันทึกการตั้งค่าใน localStorage เพื่อจดจำครั้งถัดไป
   *
   * @returns {string} ภาษาใหม่หลังจาก Toggle
   *   - "th" = ภาษาไทย
   *   - "en" = ภาษาอังกฤษ
   *
   * @example
   *   // ใน Event Handler ของปุ่มสลับภาษา
   *   langToggleBtn.addEventListener("click", () => {
   *     const newLang = uiManager.toggleLanguage();
   *     langToggleBtn.textContent = newLang === "th" ? "EN" : "TH";
   *   });
   */
  toggleLanguage() {
    // สลับระหว่าง "th" และ "en"
    this.currentLang = this.currentLang === "th" ? "en" : "th";

    // บันทึกลง localStorage เพื่อจดจำครั้งถัดไป
    localStorage.setItem("language", this.currentLang);

    // อัปเดตข้อความทั้งหน้า
    this.updateText();

    // Return ภาษาใหม่เพื่อให้ UI อัปเดตได้ (เช่น เปลี่ยนไอคอน/ข้อความบนปุ่ม)
    return this.currentLang;
  }

  // ===========================================================================
  // SECTION: THEME MANAGEMENT
  // ===========================================================================

  // ===========================================================================
  // METHOD: toggleTheme
  // ===========================================================================

  /**
   * Toggle Theme - สลับระหว่าง Light และ Dark Mode
   *
   * @description
   *   สลับ Theme และอัปเดต UI ทันที
   *
   *   การเลือก Theme:
   *   - Dark Mode: ลดแสงสะท้อนเข้าตา เหมาะสำหรับการฝึกในห้องมืด
   *   - Light Mode: มองเห็นชัดเจนในแสงจ้า
   *
   * @returns {string} Theme ใหม่หลังจาก Toggle
   *   - "dark" = Dark Mode
   *   - "light" = Light Mode
   *
   * @example
   *   // ใน Event Handler ของปุ่มสลับ Theme
   *   themeToggleBtn.addEventListener("click", () => {
   *     const newTheme = uiManager.toggleTheme();
   *     themeToggleBtn.textContent = newTheme === "dark" ? "☀️" : "🌙";
   *   });
   */
  toggleTheme() {
    // สลับระหว่าง "light" และ "dark"
    const newTheme = this.currentTheme === "light" ? "dark" : "light";

    // เรียก setTheme เพื่ออัปเดต UI
    this.setTheme(newTheme);

    // Return Theme ใหม่เพื่อให้ UI อัปเดตได้
    return newTheme;
  }

  // ===========================================================================
  // METHOD: setTheme
  // ===========================================================================

  /**
   * Set Theme - ตั้งค่า Theme เฉพาะ
   *
   * @description
   *   ตั้งค่า Theme โดยเปลี่ยน CSS Classes ของ Elements ต่างๆ
   *   บันทึกการตั้งค่าใน localStorage
   *
   *   Elements ที่ถูกเปลี่ยน:
   *   - document.body: Background Color
   *   - #main-card: Card Background & Border
   *   - label elements: Text Color
   *
   *   CSS Classes ที่ใช้ (Tailwind-like):
   *
   *   Dark Mode:
   *   - bg-gray-900: พื้นหลังเข้มมาก (#111827)
   *   - bg-gray-800: พื้นหลังเข้า (#1f2937)
   *   - text-white: ตัวอักษรขาว
   *   - text-gray-200: ตัวอักษรเทาอ่อน
   *   - border-gray-700: ขอบเทา
   *
   *   Light Mode:
   *   - bg-f3f4f6: พื้นหลังเทาอ่อน (#f3f4f6)
   *   - bg-white: พื้นหลังขาว
   *   - text-gray-700: ตัวอักษรเทาเข้ม
   *
   * @param {string} theme - Theme ที่ต้องการ
   *   - "dark" = Dark Mode
   *   - "light" = Light Mode
   *
   * @example
   *   // ตั้งเป็น Dark Mode โดยตรง
   *   uiManager.setTheme("dark");
   *
   *   // ตั้งเป็น Light Mode โดยตรง
   *   uiManager.setTheme("light");
   */
  setTheme(theme) {
    // บันทึก Theme ปัจจุบัน
    this.currentTheme = theme;

    // บันทึกลง localStorage เพื่อจดจำครั้งถัดไป
    localStorage.setItem("theme", theme);

    // -------------------------------------------------------------------------
    // DOM References
    // -------------------------------------------------------------------------
    const body = document.body;
    const mainCard = document.getElementById("main-card");

    // -------------------------------------------------------------------------
    // Apply Theme Classes
    // -------------------------------------------------------------------------
    if (theme === "dark") {
      // -----------------------------------------------------------------------
      // Dark Mode
      // -----------------------------------------------------------------------
      // เพิ่ม dark class สำหรับ CSS selectors (body.dark)
      body.classList.add("dark");

      // เปลี่ยน Body Background
      body.classList.remove("bg-f3f4f6");
      body.classList.add("bg-gray-900");

      // เปลี่ยน Main Card
      mainCard.classList.remove("bg-white");
      mainCard.classList.add("bg-gray-800", "text-white", "border-gray-700");

      // เปลี่ยนสี Labels
      document
        .querySelectorAll("label")
        .forEach((el) => el.classList.add("text-gray-200"));
      document
        .querySelectorAll("label")
        .forEach((el) => el.classList.remove("text-gray-700"));
    } else {
      // -----------------------------------------------------------------------
      // Light Mode
      // -----------------------------------------------------------------------
      // ลบ dark class
      body.classList.remove("dark");

      // เปลี่ยน Body Background
      body.classList.remove("bg-gray-900");
      body.classList.add("bg-f3f4f6");

      // เปลี่ยน Main Card
      mainCard.classList.remove("bg-gray-800", "text-white", "border-gray-700");
      mainCard.classList.add("bg-white");

      // เปลี่ยนสี Labels
      document
        .querySelectorAll("label")
        .forEach((el) => el.classList.remove("text-gray-200"));
      document
        .querySelectorAll("label")
        .forEach((el) => el.classList.add("text-gray-700"));
    }
  }

  /**
   * Close All Menus - ปิดเมนูทั้งหมด (ยกเว้น ID ที่ระบุ)
   * @param {string|null} exceptId - ID ของเมนูที่ *ไม่ต้อง* ปิด (ถ้ามี)
   */
  /**
   * Close All Menus - ปิดเมนูทั้งหมด (ยกเว้น ID ที่ระบุ)
   * @param {string|null} exceptId - ID ของเมนูที่ *ไม่ต้อง* ปิด (ถ้ามี)
   */
  closeAllMenus(exceptId = null) {
    // List of all managed menus
    const menus = ["display-menu", "rules-menu", "settings-menu"];

    menus.forEach((id) => {
      if (id !== exceptId) {
        const el = document.getElementById(id);
        if (el && !el.classList.contains("hidden")) {
          el.classList.add("hidden");
        }
      }
    });
  }

  // ===========================================================================
  // METHOD: updateText
  // ===========================================================================

  /**
   * Update Text - อัปเดตข้อความทั้งหน้าตามภาษาปัจจุบัน
   *
   * @description
   *   วน Loop อัปเดตข้อความของ Elements ต่างๆ ตาม Translation Dictionary
   *   ใช้ Element ID เป็น Key ในการหา Element และ Translation Key ในการหาข้อความ
   *
   *   Helper Functions ภายใน:
   *   - setText(id, key): อัปเดต innerText ของ Element
   *   - setTextSpan(id, key): อัปเดต innerText ของ span ลูกใน Element
   *
   * @example
   *   // เรียกหลังเปลี่ยนภาษา
   *   this.currentLang = "en";
   *   this.updateText();
   */
  updateText() {
    // ดึง Translation Object สำหรับภาษาปัจจุบัน
    const t = this.translations[this.currentLang];

    // -------------------------------------------------------------------------
    // Helper Function: setText
    // -------------------------------------------------------------------------
    // อัปเดต innerText ของ Element ตาม ID
    // @param {string} id - Element ID
    // @param {string} key - Translation Key
    const setText = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t[key];
    };

    // -------------------------------------------------------------------------
    // Helper Function: setTextSpan
    // -------------------------------------------------------------------------
    // อัปเดต innerText ของ span ลูกตัวสุดท้ายใน Element
    // ใช้สำหรับ Privacy List Items ที่มี Icon อยู่ใน span แรก
    // @param {string} id - Element ID
    // @param {string} key - Translation Key
    const setTextSpan = (id, key) => {
      const el = document.getElementById(id);
      if (el) {
        const span = el.querySelector("span:last-child");
        if (span) span.innerText = t[key];
      }
    };

    // -------------------------------------------------------------------------
    // Update Elements
    // -------------------------------------------------------------------------

    // Header
    setText("app-title", "app_title");

    // Selection Labels
    setText("label-exercise", "select_exercise");
    setText("label-level", "select_level");

    // Level Buttons
    setText("level1-btn", "l1_btn");
    setText("level2-btn", "l2_btn");
    setText("level3-btn", "l3_btn");

    // Action Buttons
    setText("big-calibrate-btn-text", "calibrate_btn");
    setText("small-calibrate-btn", "re_calibrate_btn");
    setText("cancel-calib-btn", "cancel_btn");
    setText("fullscreen-btn", "fullscreen_btn");

    // Record Button (ใช้ Method แยกเพราะมี State)
    this.updateRecordButtonState(false);

    // Instructions
    setText("instr-title", "instructions_title");
    setText("instr-1", "instructions_1");
    setText("instr-2", "instructions_2");
    setText("instr-3", "instructions_3");

    // Loading
    setText("loading-text", "loading");

    // Overlay Screen
    setText("overlay-title", "overlay_how_to");
    // Quickstart Section (new)
    setText("quickstart-title", "quickstart_title");
    setText("quickstart-action", "quickstart_action");
    setText("quickstart-default", "quickstart_default");
    setText("or-customize", "or_customize");
    // Steps
    setText("overlay-step1", "overlay_step1");
    setText("overlay-step2", "overlay_step2");
    setText("overlay-step3", "overlay_step3");
    // Stop Box (New)
    setText("stop-title", "stop_title");
    setText("stop-action", "stop_action");
    setText("stop-auto-finish", "stop_auto_finish");

    // Video Overlay Buttons (แสดงระหว่างฝึก)
    setText("stop-btn-text", "stop_btn");
    setText("fullscreen-btn-text", "fullscreen_overlay");

    // Privacy Modal
    setText("privacy-title", "privacy_title");
    setTextSpan("privacy-item1", "privacy_item1");
    setTextSpan("privacy-item2", "privacy_item2");
    setTextSpan("privacy-item3", "privacy_item3");
    setText("privacy-accept-btn", "privacy_accept");

    // Warning Section (inside Privacy Modal)
    setText("warning-title", "warning_title");
    setTextSpan("warning-item1", "warning_item1");
    setTextSpan("warning-item2", "warning_item2");
    setTextSpan("warning-item3", "warning_item3");

    // Training Buttons
    setText("start-training-btn", "start_training_btn");

    // -------------------------------------------------------------------------
    // Update Dropdown: Category Select (ประเภทท่า)
    // -------------------------------------------------------------------------
    const catSelect = document.getElementById("category-select");
    if (catSelect && catSelect.options.length >= 1) {
      catSelect.options[0].text = t["cat_placeholder"]; // -- เลือกหมวดหมู่ --
      catSelect.options[1].text = t["cat_silk_single"]; // ม้วนไหม - มือเดียว
      // catSelect.options[2].text = t["cat_silk_double"]; // ม้วนไหม - สองมือ
    }

    // -------------------------------------------------------------------------
    // Update Dropdown: Exercise Select
    // -------------------------------------------------------------------------
    // Dropdown มี Options หลายตัว ต้องอัปเดตทีละ Option
    const exSelect = document.getElementById("exercise-select");
    if (exSelect && exSelect.options.length >= 6) {
      exSelect.options[0].text = t["ex_placeholder"]; // -- เลือกท่าฝึก --
      exSelect.options[1].text = t["ex_rh_cw"]; // 1. มือขวา - ตามเข็ม
      exSelect.options[2].text = t["ex_rh_ccw"]; // 2. มือขวา - ทวนเข็ม
      exSelect.options[3].text = t["ex_lh_cw"]; // 3. มือซ้าย - ตามเข็ม
      exSelect.options[4].text = t["ex_lh_ccw"]; // 4. มือซ้าย - ทวนเข็ม
      exSelect.options[5].text = t["ex_random"]; // 🎲 สุ่มท่าฝึก (New - Moved to bottom)
    }

    // -------------------------------------------------------------------------
    // Update Dropdown: Level Select
    // -------------------------------------------------------------------------
    const levelSelect = document.getElementById("level-select");
    if (levelSelect && levelSelect.options.length >= 4) {
      levelSelect.options[0].text = t["level_placeholder"]; // -- เลือกระดับ --
      levelSelect.options[1].text = t["level_l1"]; // Level 1: ท่านั่ง
      levelSelect.options[2].text = t["level_l2"]; // Level 2: ท่ายืน
      levelSelect.options[3].text = t["level_l3"]; // Level 3: ท่ายืนย่อ
    }

    // -------------------------------------------------------------------------
    // Update Stop Training Button
    // -------------------------------------------------------------------------
    const stopBtn = document.getElementById("stop-training-btn");
    if (stopBtn) stopBtn.innerText = t["stop_training_btn"];

    // -------------------------------------------------------------------------
    // Update Title Text (แยกจาก Emoji)
    // -------------------------------------------------------------------------
    // Title อาจมี Emoji ☯️ นำหน้า ต้องอัปเดตเฉพาะส่วนข้อความ
    const titleText = document.querySelector(".title-text");
    if (titleText) {
      // ลบ Emoji ออกจาก Title
      const titleOnly = t["app_title"].replace(/^☯️\s*/, "");
      titleText.innerText = titleOnly;
    }
  }

  // ===========================================================================
  // METHOD: getText
  // ===========================================================================

  /**
   * Get Text - ดึงข้อความจาก Translation Dictionary
   *
   * @description
   *   Helper Function สำหรับดึงข้อความตาม Key
   *   ใช้ใน script.js เมื่อต้องการข้อความสำหรับ Alert หรือ Notification
   *
   * @param {string} key - Translation Key
   * @returns {string} ข้อความในภาษาปัจจุบัน
   *
   * @example
   *   // ใน script.js
   *   alert(uiManager.getText("alert_calib_success"));
   *   // Output (TH): "ปรับเทียบสำเร็จ! ระบบพร้อมใช้งานแล้ว"
   *   // Output (EN): "Calibration Complete! System Ready."
   */
  getText(key) {
    return this.translations[this.currentLang][key];
  }

  // ===========================================================================
  // SECTION: BUTTON STATE MANAGEMENT
  // ===========================================================================

  // ===========================================================================
  // METHOD: updateLevelButtons
  // ===========================================================================

  /**
   * Update Level Buttons - อัปเดตสถานะปุ่มเลือกระดับ
   *
   * @description
   *   เปลี่ยนสไตล์ของปุ่มระดับ (Level 1/2/3) เพื่อแสดงว่าปุ่มไหน Active
   *
   *   สถานะ Active:
   *   - พื้นหลังสีน้ำเงิน (bg-blue-600)
   *   - ตัวอักษรสีขาว (text-white)
   *   - มี Shadow
   *
   *   สถานะ Inactive:
   *   - พื้นหลังสีเทา (bg-gray-100)
   *   - ตัวอักษรสีเทา (text-gray-600)
   *
   * @param {string} activeLevel - ระดับที่ Active อยู่
   *   - "L1" = Level 1 (ท่านั่ง)
   *   - "L2" = Level 2 (ท่ายืน)
   *   - "L3" = Level 3 (ท่ายืนย่อ)
   *
   * @example
   *   // เมื่อผู้ใช้เลือก Level 2
   *   uiManager.updateLevelButtons("L2");
   */
  updateLevelButtons(activeLevel) {
    // ค้นหาปุ่มทั้งหมดที่มี class "level-btn"
    const levelButtons = document.querySelectorAll(".level-btn");

    // วน Loop อัปเดตแต่ละปุ่ม
    levelButtons.forEach((btn) => {
      // ตรวจสอบว่าปุ่มนี้ตรงกับ activeLevel หรือไม่
      if (btn.dataset.level === activeLevel) {
        // -------------------------------------------------------------------------
        // Activate Button
        // -------------------------------------------------------------------------
        // ลบ Class Inactive
        btn.classList.remove("bg-gray-100", "text-gray-600");
        // เพิ่ม Class Active
        btn.classList.add("bg-blue-600", "text-white", "active", "shadow-sm");
      } else {
        // -------------------------------------------------------------------------
        // Deactivate Button
        // -------------------------------------------------------------------------
        // ลบ Class Active
        btn.classList.remove(
          "bg-blue-600",
          "text-white",
          "active",
          "shadow-sm",
        );
        // เพิ่ม Class Inactive
        btn.classList.add("bg-gray-100", "text-gray-600");
      }
    });
  }

  // ===========================================================================
  // METHOD: updateRecordButtonState
  // ===========================================================================

  /**
   * Update Record Button State - อัปเดตสถานะปุ่ม Record
   *
   * @description
   *   เปลี่ยนข้อความและสีของปุ่ม Record ตามสถานะการบันทึก
   *
   *   สถานะ Recording:
   *   - ข้อความ: "⏹️ หยุดบันทึก"
   *   - พื้นหลัง: แดงเข้ม (bg-red-600)
   *   - ตัวอักษร: ขาว (text-white)
   *
   *   สถานะ Not Recording:
   *   - ข้อความ: "⏺️ บันทึก (R)"
   *   - พื้นหลัง: แดงอ่อน (bg-red-100)
   *   - ตัวอักษร: แดง (text-red-600)
   *
   * @param {boolean} isRecording - สถานะการบันทึก
   *   - true = กำลังบันทึกอยู่
   *   - false = ไม่ได้บันทึก
   *
   * @example
   *   // เมื่อเริ่มบันทึก
   *   uiManager.updateRecordButtonState(true);
   *
   *   // เมื่อหยุดบันทึก
   *   uiManager.updateRecordButtonState(false);
   */
  updateRecordButtonState(isRecording) {
    // ค้นหาปุ่ม Record
    const recordBtn = document.getElementById("record-btn");
    if (!recordBtn) return;

    if (isRecording) {
      // -------------------------------------------------------------------------
      // Recording State
      // -------------------------------------------------------------------------
      // เปลี่ยนข้อความเป็น "หยุดบันทึก"
      recordBtn.innerText = this.getText("record_btn_stop");

      // เปลี่ยนสีเป็นแดงเข้ม (โดดเด่นเพื่อบอกว่ากำลังบันทึก)
      recordBtn.classList.replace("bg-red-100", "bg-red-600");
      recordBtn.classList.replace("text-red-600", "text-white");
    } else {
      // -------------------------------------------------------------------------
      // Not Recording State
      // -------------------------------------------------------------------------
      // เปลี่ยนข้อความเป็น "บันทึก"
      recordBtn.innerText = this.getText("record_btn_start");

      // เปลี่ยนสีเป็นแดงอ่อน (ปกติ)
      recordBtn.classList.replace("bg-red-600", "bg-red-100");
      recordBtn.classList.replace("text-white", "text-red-600");
    }
  }

  // ===========================================================================
  // SECTION: NOTIFICATIONS
  // ===========================================================================

  // ===========================================================================
  // METHOD: showNotification
  // ===========================================================================

  /**
   * Show Notification - แสดง Toast Notification
   *
   * @description
   *   แสดงข้อความแจ้งเตือนแบบ Toast ที่มุมจอ
   *   Toast จะแสดงชั่วคราวแล้วหายไปอัตโนมัติ (Auto-dismiss)
   *
   *   ขั้นตอนการทำงาน:
   *   1. สร้าง Notification Element
   *   2. กำหนดสีและไอคอนตาม Type
   *   3. เพิ่มเข้า Container
   *   4. Animate เข้า (Fade In)
   *   5. รอตาม Duration
   *   6. Animate ออก (Fade Out)
   *   7. ลบ Element ออก
   *
   *   ประเภท Notification:
   *
   *   | Type    | สี       | ไอคอน | ใช้สำหรับ                    |
   *   |---------|----------|-------|------------------------------|
   *   | info    | น้ำเงิน  | ℹ️    | ข้อมูลทั่วไป                 |
   *   | success | เขียว   | ✅    | ดำเนินการสำเร็จ              |
   *   | warning | เหลือง  | ⚠️    | คำเตือน                      |
   *   | error   | แดง     | ❌    | ข้อผิดพลาด                   |
   *
   * @param {string} message - ข้อความที่จะแสดง
   * @param {string} [type="info"] - ประเภท Notification
   * @param {number} [duration=3000] - ระยะเวลาแสดง (ms)
   *
   * @example
   *   // แสดงข้อความสำเร็จ
   *   uiManager.showNotification("บันทึกสำเร็จ!", "success");
   *
   *   // แสดงข้อความผิดพลาด นาน 5 วินาที
   *   uiManager.showNotification("เกิดข้อผิดพลาด", "error", 5000);
   *
   *   // แสดงข้อมูลทั่วไป
   *   uiManager.showNotification("กำลังโหลด...", "info");
   */
  showNotification(message, type = "info", duration = 3000) {
    // -------------------------------------------------------------------------
    // Validation: ตรวจสอบว่ามี Container หรือไม่
    // -------------------------------------------------------------------------
    if (!this.notificationContainer) return;

    // -------------------------------------------------------------------------
    // สร้าง Notification Element
    // -------------------------------------------------------------------------
    const notification = document.createElement("div");

    // Base CSS Classes
    // - flex items-center: จัดวาง Icon และ Text ในแถวเดียว
    // - gap-4: ระยะห่างระหว่าง Icon และ Text
    // - p-4: Padding รอบด้าน
    // - rounded-lg: มุมโค้ง
    // - shadow-lg: เงา
    // - text-white: ตัวอักษรขาว
    // - max-w-sm: ความกว้างสูงสุด
    notification.className =
      "notification flex items-center gap-4 p-4 rounded-lg shadow-lg text-white max-w-sm";

    // -------------------------------------------------------------------------
    // กำหนดสีและไอคอนตาม Type
    // -------------------------------------------------------------------------
    let bgColor, icon;

    switch (type) {
      case "success":
        // สำเร็จ - สีเขียว
        bgColor = "bg-green-500";
        icon = "✅";
        break;
      case "error":
        // ผิดพลาด - สีแดง
        bgColor = "bg-red-500";
        icon = "❌";
        break;
      case "warning":
        // เตือน - สีเหลือง
        bgColor = "bg-yellow-500";
        icon = "⚠️";
        break;
      default:
        // ข้อมูลทั่วไป - สีม่วง (Gradient เหมือนปุ่มเริ่มฝึก)
        bgColor = "bg-gradient-to-br from-purple-500 to-indigo-500";
        icon = "ℹ️";
        break;
    }

    // เพิ่ม Background Color Class (รองรับ multiple classes)
    bgColor.split(" ").forEach((cls) => notification.classList.add(cls));

    // กำหนด HTML Content
    // หมายเหตุ: แปลง \n เป็น <br> เพื่อรองรับ multi-line notifications
    const formattedMessage = message.replace(/\n/g, "<br>");
    notification.innerHTML = `
        <span class="text-2xl">${icon}</span>
        <span class="font-medium">${formattedMessage}</span>
    `;

    // -------------------------------------------------------------------------
    // เพิ่มเข้า Container
    // -------------------------------------------------------------------------
    this.notificationContainer.appendChild(notification);

    // -------------------------------------------------------------------------
    // Animate In (Fade In)
    // -------------------------------------------------------------------------
    // ใช้ requestAnimationFrame เพื่อให้ Browser Render ก่อน แล้วค่อย Add Class
    // ทำให้ CSS Transition ทำงาน
    requestAnimationFrame(() => notification.classList.add("show"));

    // -------------------------------------------------------------------------
    // Auto-dismiss หลังหมด Duration
    // -------------------------------------------------------------------------
    setTimeout(() => {
      // Animate Out (Fade Out)
      notification.classList.remove("show");

      // รอ Transition จบแล้วค่อยลบ Element
      // transitionend event จะ Fire เมื่อ CSS Transition เสร็จ
      notification.addEventListener("transitionend", () =>
        notification.remove(),
      );
    }, duration);
  }

  // ===========================================================================
  // SECTION: WISDOM POPUP (TAIJI WISDOM)
  // ===========================================================================
  // Merged from wisdom_popup.js
  // ===========================================================================

  /**
   * Init Wisdom Popup - เริ่มต้นระบบ Wisdom Popup
   */
  initWisdomPopup() {
    this.wisdomPopup = document.getElementById("wisdom-popup");
    this.wisdomCloseBtn = document.getElementById("wisdom-close-btn");
    this.wisdomQuoteText = document.getElementById("wisdom-quote");
    this.wisdomQuoteSub = document.getElementById("wisdom-quote-sub");
    this.wisdomCanvasId = "wisdom-canvas";
    this.wisdomCanvasId = "wisdom-canvas";
    this.wisdomAnimation = null;
    this.isWisdomAnimating = false;
    this.isShowingAbout = false; // State to track view mode

    if (!this.wisdomPopup) return;

    // Close Event
    if (this.wisdomCloseBtn) {
      this.wisdomCloseBtn.addEventListener("click", () =>
        this.hideWisdomPopup(),
      );
    }

    // Close on click outside
    this.wisdomPopup.addEventListener("click", (e) => {
      if (e.target === this.wisdomPopup) {
        this.hideWisdomPopup();
      }
    });

    // ESC key to close
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        !this.wisdomPopup.classList.contains("hidden")
      ) {
        this.hideWisdomPopup();
      }
    });

    // Attach click to App Title to trigger Popup
    const appTitle = document.getElementById("app-logo-container");
    if (appTitle) {
      appTitle.style.cursor = "pointer";
      appTitle.addEventListener("click", () => {
        this.showWisdomPopup();
      });
    }

    // Attach click to Logo Canvas to toggle About Info
    const canvasContainer = document.getElementById(
      this.wisdomCanvasId,
    )?.parentElement;
    if (canvasContainer) {
      canvasContainer.style.cursor = "pointer";
      canvasContainer.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent closing popup
        this.toggleAboutInfo();
      });
    }
  }

  /**
   * Show Wisdom Popup - แสดงหน้าต่าง Taiji Wisdom
   */
  showWisdomPopup() {
    if (!this.wisdomPopup) return;

    // 1. Reset state & Random Quote
    this.isShowingAbout = false;
    this.setRandomWisdomQuote();

    // 2. Show Modal
    this.wisdomPopup.classList.remove("hidden");
    this.wisdomPopup.classList.add("flex");

    // 3. Start Animation
    this.startWisdomAnimation();
  }

  /**
   * Hide Wisdom Popup - ปิดหน้าต่าง Taiji Wisdom
   */
  hideWisdomPopup() {
    if (!this.wisdomPopup) return;

    this.wisdomPopup.classList.add("hidden");
    this.wisdomPopup.classList.remove("flex");

    // Stop Animation to save resources
    this.stopWisdomAnimation();
  }

  /**
   * Set Random Wisdom Quote - สุ่มคำคมมาแสดง
   */
  setRandomWisdomQuote() {
    if (typeof TRANSLATIONS === "undefined") return;

    // Use current language setting
    const lang = this.currentLang || "th";

    // Access centralized quotes via TRANSLATIONS
    const quotes =
      TRANSLATIONS[lang]?.score_popup?.motivational_quotes ||
      TRANSLATIONS["th"].score_popup.motivational_quotes;

    if (quotes && quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const quote = quotes[randomIndex];

      // Display
      if (this.wisdomQuoteText)
        this.wisdomQuoteText.textContent = `"${quote.text}"`;
      if (this.wisdomQuoteSub) this.wisdomQuoteSub.textContent = quote.zh;
    }
  }

  /**
   * Toggle About Info - สลับระหว่างคำคมและข้อมูลแอพ
   */
  toggleAboutInfo() {
    this.isShowingAbout = !this.isShowingAbout;

    if (!this.isShowingAbout) {
      // Revert style from About mode
      if (this.wisdomQuoteSub) {
        this.wisdomQuoteSub.classList.add("font-serif", "tracking-widest");
        this.wisdomQuoteSub.classList.remove("font-sans", "font-bold");
      }
      // Show Random Quote
      this.setRandomWisdomQuote();
    } else {
      // Show About Info
      if (typeof TRANSLATIONS === "undefined") return;
      const lang = this.currentLang || "th";
      const info =
        TRANSLATIONS[lang]?.about_info || TRANSLATIONS["th"].about_info;

      if (info) {
        if (this.wisdomQuoteSub) {
          this.wisdomQuoteSub.textContent = info.title;
          this.wisdomQuoteSub.style.fontSize = "1.5rem";
          // Switch to App Font (Sans) for Title
          this.wisdomQuoteSub.classList.remove("font-serif", "tracking-widest");
          this.wisdomQuoteSub.classList.add("font-sans", "font-bold");
        }
        if (this.wisdomQuoteText) {
          this.wisdomQuoteText.innerHTML = `
            <div style="font-size: 0.9em; line-height: 1.6;">
              <p style="margin-bottom: 12px; font-style: italic;">${info.philosophy}</p>
              <p style="font-size: 0.8em; opacity: 0.8;">
                ${info.credit_prefix}
                <a href="mailto:${info.email}" style="color: inherit; text-decoration: underline; font-weight: bold;" onclick="event.stopPropagation()">${info.developer_name}</a>
              </p>
            </div>
          `;
        }
      }
    }
  }

  /**
   * Start Wisdom Animation - เริ่ม Animation วงกลม
   */
  startWisdomAnimation() {
    if (this.isWisdomAnimating) return;

    // Re-use SilkReelingAnimation global class if available
    if (typeof SilkReelingAnimation !== "undefined") {
      // Wait for DOM to be fully visible/rendered
      setTimeout(() => {
        if (!this.wisdomAnimation) {
          this.wisdomAnimation = new SilkReelingAnimation(this.wisdomCanvasId);
        } else {
          this.wisdomAnimation.start();
        }
        this.isWisdomAnimating = true;
      }, 100);
    }
  }

  /**
   * Stop Wisdom Animation - หยุด Animation
   */
  stopWisdomAnimation() {
    if (this.wisdomAnimation) {
      this.wisdomAnimation.stop();
      this.isWisdomAnimating = false;
    }
  }

  // ===========================================================================
  // NOTE: showScoreSummary() moved to js/score_popup_manager.js
  // ===========================================================================
  // ย้ายไปไฟล์แยก ScorePopupManager เพื่อลดขนาดไฟล์
  // เรียกใช้: scorePopupManager.show(summary, gradeInfo, lang)
  // ===========================================================================
}

// =============================================================================
// END OF FILE: ui_manager.js
// =============================================================================
