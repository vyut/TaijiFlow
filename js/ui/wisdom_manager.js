/**
 * ============================================================================
 * TaijiFlow AI - Wisdom Manager v1.0
 * ============================================================================
 *
 * จัดการหน้าต่าง Taiji Wisdom (ปรัชญาเต๋า)
 * ใช้ Shared Popup Shell จาก UIManager
 *
 * @version 1.0 (Refactored from ui_manager.js)
 */

class WisdomManager {
  constructor() {
    this.canvasId = "wisdom-canvas";
    this.animation = null;
    this.isAnimating = false;
    this.isShowingAbout = false;

    // Bind click event to Logo (Entry Point)
    this.initEntryPoint();
  }

  /**
   * Bind Event to App Logo to trigger popup
   */
  initEntryPoint() {
    const appTitle = document.getElementById("app-logo-container");
    if (appTitle) {
      appTitle.style.cursor = "pointer";
      appTitle.addEventListener("click", () => {
        this.show();
      });
    }
  }

  /**
   * Show Wisdom Popup
   */
  show() {
    if (!window.uiManager) {
      console.error("UIManager not found");
      return;
    }

    // 1. Prepare Data
    this.isShowingAbout = false;
    const { quote, sub } = this.getRandomQuote();

    // 2. Generate HTML
    // ใช้ Design เดิมจาก app.html แต่แปลงเป็น JS Template
    const html = `
      <div class="relative w-full max-w-lg bg-gray-900 rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col items-center p-8 transform scale-95 animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        
        <!-- Close Button -->
        <button id="wisdom-close-btn" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
          ✕
        </button>

        <!-- Animation Canvas -->
        <div id="wisdom-canvas-container" class="relative w-48 h-48 mb-6 cursor-pointer group" title="คลิกเพื่อดูข้อมูลผู้พัฒนา">
          <canvas id="${this.canvasId}" width="300" height="300" class="w-full h-full rounded-full opacity-80 transition-opacity duration-300 group-hover:opacity-100"></canvas>
          <!-- Center Yin Yang (Static Overlay) -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="text-6xl opacity-50">☯️</span>
          </div>
        </div>

        <!-- Content Area -->
        <div id="wisdom-content" class="text-center space-y-4 relative z-10 min-h-[120px] flex flex-col justify-center">
           <h3 id="wisdom-main-text" class="text-2xl md:text-3xl text-purple-300 font-serif tracking-widest transition-all duration-300">
             ${sub}
           </h3>
           <p id="wisdom-sub-text" class="text-lg md:text-xl text-white font-light italic transition-all duration-300">
             "${quote}"
           </p>
           <div class="w-12 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-4"></div>
        </div>

        <!-- Footer Hint -->
        <p class="mt-8 text-xs text-gray-500 opacity-60">*คลิกวงกลมเพื่อดูเกี่ยวกับแอพ</p>
        
         <style>
            @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
         </style>
      </div>
    `;

    // 3. Call UIManager
    window.uiManager.showPopup(html, {
      id: "wisdom-popup-dynamic",
      closeBtnId: "wisdom-close-btn",
      onClose: () => this.stopAnimation(),
    });

    // 4. Post-Render Setup
    this.startAnimation();
    this.bindInternalEvents();
  }

  /**
   * Bind events inside the popup (Canvas click)
   */
  bindInternalEvents() {
    const container = document.getElementById("wisdom-canvas-container");
    if (container) {
      container.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleAboutInfo();
      });
    }
  }

  /**
   * Get Random Quote from Translations
   */
  getRandomQuote() {
    const lang = window.uiManager?.currentLang || "th";
    const quotes =
      window.TRANSLATIONS?.[lang]?.score_popup?.motivational_quotes ||
      window.TRANSLATIONS?.["th"]?.score_popup?.motivational_quotes ||
      [];

    if (quotes.length > 0) {
      const item = quotes[Math.floor(Math.random() * quotes.length)];
      return { quote: item.text, sub: item.zh };
    }
    return { quote: "ความสงบสยบความเคลื่อนไหว", sub: "静制动" };
  }

  /**
   * Start Animation (SilkReelingAnimation)
   */
  startAnimation() {
    if (this.isAnimating) return;

    if (typeof SilkReelingAnimation !== "undefined") {
      requestAnimationFrame(() => {
        if (!this.animation) {
          this.animation = new SilkReelingAnimation(this.canvasId);
        } else {
          // Re-attach canvas if needed or just start
          // Since we destroy popup, canvas is new every time.
          // SilkReelingAnimation takes constructor ID, so likely need new instance if DOM changed.
          this.animation = new SilkReelingAnimation(this.canvasId);
        }
        this.animation.start();
        this.isAnimating = true;
      });
    }
  }

  stopAnimation() {
    if (this.animation) {
      this.animation.stop();
      this.isAnimating = false;
      this.animation = null; // Cleanup reference
    }
  }

  /**
   * Toggle between Quote and About Info
   */
  toggleAboutInfo() {
    this.isShowingAbout = !this.isShowingAbout;
    const mainText = document.getElementById("wisdom-main-text");
    const subText = document.getElementById("wisdom-sub-text");

    if (!mainText || !subText) return;

    // Fade Out
    mainText.style.opacity = "0";
    subText.style.opacity = "0";

    setTimeout(() => {
      if (this.isShowingAbout) {
        // Show About Info
        const lang = window.uiManager?.currentLang || "th";
        const info =
          window.TRANSLATIONS?.[lang]?.about_info ||
          window.TRANSLATIONS?.["th"]?.about_info;

        if (info) {
          mainText.innerHTML = info.title;
          mainText.className =
            "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-indigo-400 font-sans mb-2";

          subText.innerHTML = `
            <div class="text-sm leading-relaxed text-gray-300">
              <p class="italic mb-3">"${info.philosophy}"</p>
              <div class="text-xs opacity-75">
                ${info.credit_prefix} 
                <a href="mailto:${info.email}" class="text-purple-400 hover:text-purple-300 underline font-semibold">${info.developer_name}</a>
              </div>
            </div>
          `;
          subText.className = "text-base text-gray-300 font-sans";
        }
      } else {
        // Show Quote
        const { quote, sub } = this.getRandomQuote();
        mainText.textContent = sub;
        mainText.className =
          "text-2xl md:text-3xl text-purple-300 font-serif tracking-widest transition-all duration-300";

        subText.textContent = `"${quote}"`;
        subText.className =
          "text-lg md:text-xl text-white font-light italic transition-all duration-300";
      }

      // Fade In receive
      mainText.style.opacity = "1";
      subText.style.opacity = "1";
    }, 200);
  }
}

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
  window.wisdomManager = new WisdomManager();
});
