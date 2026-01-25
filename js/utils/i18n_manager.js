/**
 * ============================================================================
 * TaijiFlow AI - I18n Manager v1.0
 * ============================================================================
 *
 * ระบบจัดการภาษาแบบรวมศูนย์ (Shared Internationalization Manager)
 * ใช้สำหรับเปลี่ยนภาษาใน Landing Page (index.html) และ App (ในอนาคต)
 *
 * @description
 *   Class นี้ทำหน้าที่:
 *   1. จัดการ state ภาษาปัจจุบัน (th/en)
 *   2. บันทึกและโหลดภาษาจาก localStorage
 *   3. สแกนหา element ที่มี attribute 'data-i18n' และเปลี่ยนข้อความอัตโนมัติ
 *   4. จัดการปุ่มเปลี่ยนภาษา (Toggle Button)
 *
 * @dependency
 *   - js/utils/translations.js (ต้องโหลดก่อน)
 */
class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem("language") || "th";
    this.translations = window.TRANSLATIONS;

    // Auto-init if DOM is ready, otherwise wait
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log(`[I18n] Initializing... Current Lang: ${this.currentLang}`);
    if (!this.translations) {
      console.error("[I18n] Error: translations.js not loaded!");
      return;
    }

    this.updatePage();
    this.bindLanguageToggle();
  }

  /**
   * สลับภาษา (Toggle)
   */
  toggleLanguage() {
    this.currentLang = this.currentLang === "th" ? "en" : "th";
    localStorage.setItem("language", this.currentLang);
    this.updatePage();

    // Dispatch Custom Event เผื่อ module อื่นต้องการดักจับ
    window.dispatchEvent(
      new CustomEvent("language-changed", { detail: this.currentLang }),
    );
  }

  /**
   * อัปเดตข้อความทั้งหน้า
   */
  updatePage() {
    const t = this.translations[this.currentLang];
    if (!t) return;

    // 1. Update elements with data-i18n attribute
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = t[key];

      if (text) {
        // ถ้าเป็น Input/Textarea ให้เปลี่ยน value
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = text;
        } else {
          // รองรับ Markdown-like syntax อย่างง่าย (เช่น `bold`)
          // แต่เพื่อความปลอดภัย ใช้ innerText หรือ innerHTML แบบระวัง
          // ในที่นี้เราใช้ innerHTML เพราะบาง key มี <br> หรือ span
          el.innerHTML = this.processText(text);
        }
      }
    });

    // 2. Update Toggle Button Text
    const toggleBtns = document.querySelectorAll(".lang-toggle-btn");
    toggleBtns.forEach((btn) => {
      // Update Toggle Button Text
      // User Request: ถ้าเป็นรูปธงไทย ข้อความในหน้าเป็นไทย (Button shows Current Language)
      btn.innerText = this.currentLang === "th" ? "🇹🇭 TH" : "🇺🇸 EN";
      btn.setAttribute(
        "aria-label",
        this.currentLang === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย",
      );
    });

    // 3. Update HTML lang attribute
    document.documentElement.lang = this.currentLang;
  }

  /**
   * แปลง Markdown-like syntax เป็น HTML (เฉพาะที่จำเป็น)
   */
  processText(text) {
    // แปลง `text` เป็น <strong>text</strong>
    return text.replace(
      /`([^`]+)`/g,
      '<strong class="text-amber-400">$1</strong>',
    );
  }
}

// Global Instance
window.i18nManager = new I18nManager();
