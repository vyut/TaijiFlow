// languageManager.js
// จัดการเรื่องภาษา: โหลด JSON, เก็บ translations, อัปเดต UI

class LanguageManager {
  constructor(options = {}) {
    this.currentLanguage = options.defaultLang || "th";
    this.supportedLanguages = ["th", "en"];
    this.translations = {};
    this.loaded = {};
    this.localesPath = options.localesPath || "./locales";
  }

  async init() {
    // โหลดภาษาเริ่มต้น
    await this.loadLanguage(this.currentLanguage);
    this.updateUI();
    this.updateActiveLanguageButton();
  }

  async loadLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    // ถ้าโหลดแล้ว ไม่ต้องโหลดซ้ำ
    if (this.loaded[lang]) return;

    try {
      const res = await fetch(`${this.localesPath}/${lang}.json`, {
        cache: "no-cache",
      });
      if (!res.ok) {
        throw new Error(`Failed to load ${lang}.json`);
      }
      const data = await res.json();
      this.translations[lang] = data;
      this.loaded[lang] = true;
    } catch (err) {
      console.error("Error loading language file:", err);
    }
  }

  async switchLanguage(lang) {
    if (lang === this.currentLanguage) return;

    await this.loadLanguage(lang);
    if (!this.loaded[lang]) return;

    this.currentLanguage = lang;
    this.updateUI();
    this.updateActiveLanguageButton();
  }

  // ดึงข้อความจาก key เช่น "hero.title"
  t(key) {
    const dict = this.translations[this.currentLanguage] || {};
    const parts = key.split(".");
    let cur = dict;
    for (const p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
        cur = cur[p];
      } else {
        return key; // ถ้าไม่เจอ key แสดง key แทน
      }
    }
    return typeof cur === "string" ? cur : key;
  }

  updateUI() {
    const t = (k) => this.t(k);

    // title
    document.title = t("meta.title");

    // nav
    this.setText('.nav-links a[href="#home"]', t("nav.home"));
    this.setText('.nav-links a[href="#mission"]', t("nav.mission"));
    this.setText('.nav-links a[href="#silk-reeling"]', t("nav.silkReeling"));
    this.setText('.nav-links a[href="#instructor"]', t("nav.instructor"));
    this.setText('.nav-links a[href="#features"]', t("nav.features"));
    this.setText('.nav-links a[href="#contact"]', t("nav.contact"));

    // hero
    const heroTitle = document.querySelector(".hero-title");
    if (heroTitle) {
      heroTitle.innerHTML = `${t("hero.title")} <span class="accent">${t(
        "hero.accent"
      )}</span>`;
    }
    this.setText(".hero-subtitle", t("hero.subtitle"));
    this.setText(".cta-button", t("hero.cta"));

    // mission
    this.setText("#mission .section-title", t("mission.title"));
    this.setText(".mission-text", t("mission.text"));

    // silk reeling
    this.setText("#silk-reeling .section-title", t("silkReeling.title"));
    this.setText("#silk-reeling .section-subtitle", t("silkReeling.subtitle"));
    this.setText(
      '.position-tabs [data-position="all"]',
      t("silkReeling.tabs.all")
    );
    this.setText(
      '.position-tabs [data-position="sitting"]',
      t("silkReeling.tabs.sitting")
    );
    this.setText(
      '.position-tabs [data-position="standing"]',
      t("silkReeling.tabs.standing")
    );
    this.setText(
      '.position-tabs [data-position="low-standing"]',
      t("silkReeling.tabs.lowStanding")
    );

    // ปุ่ม Learn ทุกใบ
    document.querySelectorAll(".learn-btn").forEach((btn) => {
      btn.textContent = t("silkReeling.learn");
    });

    // instructor
    this.setText("#instructor .section-title", t("instructor.title"));
    this.setText(".instructor-info h3", t("instructor.name"));
    this.setText(".instructor-title", t("instructor.role"));
    this.setText(".instructor-bio", t("instructor.bio"));
    this.setText(".know-more", t("instructor.more"));

    // features
    this.setText("#features .section-title", t("features.title"));
    const featureCards = document.querySelectorAll(".feature-card");
    const fKeys = [
      "beginner",
      "intermediate",
      "therapy",
      "ai",
      "online",
      "progress",
    ];
    featureCards.forEach((card, idx) => {
      const key = fKeys[idx];
      if (!key) return;
      this.setText(
        card.querySelector(".feature-title"),
        t(`features.items.${key}.title`)
      );
      this.setText(
        card.querySelector(".feature-desc"),
        t(`features.items.${key}.desc`)
      );
    });

    // contact
    this.setText("#contact .section-title", t("contact.title"));
    this.setText('label[for="name"]', t("contact.form.name"));
    this.setText('label[for="email"]', t("contact.form.email"));
    this.setText('label[for="phone"]', t("contact.form.phone"));
    this.setText('label[for="message"]', t("contact.form.message"));
    this.setText("#contactForm .submit-btn", t("contact.form.submit"));
    this.setText(".contact-details h4", t("contact.infoTitle"));

    // about
    this.setText("#about .section-title", t("about.title"));
    this.setText(".about-text", t("about.text"));

    // modal - position buttons
    this.setText(
      '.position-btn[data-pos="sitting"]',
      t("modal.position.sitting")
    );
    this.setText(
      '.position-btn[data-pos="standing"]',
      t("modal.position.standing")
    );
    this.setText(
      '.position-btn[data-pos="low-standing"]',
      t("modal.position.lowStanding")
    );

    // modal - AI panel
    this.setText(".ai-panel-header h4", t("modal.ai.title"));
    this.setText("#startCamera", t("modal.ai.start"));
    this.setText("#stopCamera", t("modal.ai.stop"));
    this.setText("#fullscreenStartCamera", t("modal.ai.start"));
    this.setText("#fullscreenStopCamera", t("modal.ai.stop"));

    // modal - details titles
    const details = document.getElementById("techniqueDetails");
    if (details) {
      const h4s = details.querySelectorAll("h4");
      if (h4s[0]) h4s[0].textContent = t("modal.details.description");
      if (h4s[1]) h4s[1].textContent = t("modal.details.keyPoints");
      if (h4s[2]) h4s[2].textContent = t("modal.details.mistakes");
      if (h4s[3]) h4s[3].textContent = t("modal.details.breathing");
      if (h4s[4]) h4s[4].textContent = t("modal.details.tips");
    }

    // AI feedback default text
    const aiFeedback = document.getElementById("aiFeedback");
    if (aiFeedback && !aiFeedback.dataset.locked) {
      aiFeedback.innerHTML = `<p>${t("modal.ai.initialHint")}</p>`;
    }
    const fsFeedback = document.getElementById("fullscreenFeedback");
    if (fsFeedback && !fsFeedback.dataset.locked) {
      fsFeedback.innerHTML = `<p>${t("modal.ai.initialHint")}</p>`;
    }
  }

  setText(selectorOrElement, text) {
    if (!text) return;
    let el = selectorOrElement;
    if (typeof selectorOrElement === "string") {
      el = document.querySelector(selectorOrElement);
    }
    if (el) {
      el.textContent = text;
    }
  }

  updateActiveLanguageButton() {
    const options = document.querySelectorAll(".language-option");
    options.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === this.currentLanguage);
    });

    const toggle = document.querySelector(".language-toggle");
    if (toggle) {
      const labels = {
        th: "🇹🇭 ไทย",
        en: "🇺🇸 English",
      };
      toggle.innerHTML = `${
        labels[this.currentLanguage] || ""
      } <span class="dropdown-arrow">▼</span>`;
    }
  }
}

// export เป็น global สำหรับใช้ใน script.js
window.LanguageManager = LanguageManager;
