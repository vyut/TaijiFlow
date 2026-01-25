/**
 * ============================================================================
 * TaijiFlow AI - Shortcuts Manager
 * ============================================================================
 *
 * จัดการ Popup แสดงรายการคีย์ลัดใหม่ (แทน Notification เดิม)
 * - แสดงรายการคีย์ลัดแบบ Grid สวยงาม
 * - รองรับ Light/Dark Mode
 * - รองรับ Responsive
 *
 * @author TaijiFlow AI Team
 * @version 1.0
 */

class ShortcutsManager {
  constructor() {
    this.popupId = "shortcuts-popup";
    this.overlayId = "shortcuts-overlay";
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.createPopup();
    this.initialized = true;
  }

  /**
   * สร้าง HTML Popup และ Overlay
   */
  createPopup() {
    // 1. Create Overlay
    const overlay = document.createElement("div");
    overlay.id = this.overlayId;
    overlay.className =
      "fixed inset-0 z-[60] bg-black/60 hidden transition-opacity duration-300 flex items-center justify-center p-4 backdrop-blur-sm";

    // 2. Click outside to close implementation
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
    });

    document.body.appendChild(overlay);

    // 3. Inject Content later (Dynamic based on language if needed, but keys are universal)
    // We can use fixed text for keys, translated text for descriptions.
  }

  /**
   * ข้อมูล Shortcuts แยกตามหมวดหมู่
   */
  getShortcutsData(lang = "th") {
    const t = window.uiManager?.translations[lang] || {};

    // Helper to get text or fallback
    const txt = (key, fallback) => t[key] || fallback;

    return {
      control: {
        title: lang === "th" ? "🎮 การควบคุม" : "Control",
        color: "blue",
        items: [
          {
            key: "Space",
            desc: lang === "th" ? "เริ่ม / หยุดการฝึก" : "Start / Stop",
          },
          {
            key: "Esc",
            desc: lang === "th" ? "ยกเลิก / ปิด" : "Cancel / Close",
          },
          {
            key: "F",
            desc: lang === "th" ? "เต็มจอ (Fullscreen)" : "Fullscreen",
          },
          { key: "H", desc: lang === "th" ? "เปิดคู่มือ" : "Open Tutorial" },
          { key: "/", desc: lang === "th" ? "คีย์ลัดนี้" : "Shortcuts" },
        ],
      },
      display: {
        title: lang === "th" ? "👁️ การแสดงผล" : "Display",
        color: "purple",
        items: [
          {
            key: "I",
            desc:
              lang === "th" ? "จอครูฝึก (Instructor PiP)" : "Instructor PiP",
          },
          {
            key: "S",
            desc: lang === "th" ? "จอแยก (Side-by-Side)" : "Side-by-Side",
          },
          {
            key: "M",
            desc: lang === "th" ? "กระจก (Mirror Mode)" : "Mirror Mode",
          },
          {
            key: "O",
            desc: lang === "th" ? "เงาครูฝึก (Ghost)" : "Ghost Overlay",
          },
          {
            key: "B",
            desc: lang === "th" ? "เบลอพื้นหลัง" : "Blur Background",
          },
        ],
      },
      analysis: {
        title: lang === "th" ? "📊 การวิเคราะห์" : "Analysis",
        color: "green",
        items: [
          {
            key: "K",
            desc: lang === "th" ? "โครงกระดูก (Skeleton)" : "Skeleton",
          },
          {
            key: "P",
            desc: lang === "th" ? "เส้นทางต้นแบบ (Path)" : "Reference Path",
          },
          {
            key: "G",
            desc: lang === "th" ? "เส้นตาราง (Grid)" : "Grid Overlay",
          },
          {
            key: "R",
            desc: lang === "th" ? "เส้นสัมผัส (Trail)" : "Motion Trail",
          },
          {
            key: "E",
            desc:
              lang === "th"
                ? "จุดผิดพลาด (Error Highlights)"
                : "Error Highlights",
          },
          {
            key: "D",
            desc: lang === "th" ? "โหมดดีบัก (Debug)" : "Debug Mode",
          },
        ],
      },
      settings: {
        title: lang === "th" ? "⚙️ ตั้งค่า" : "Settings",
        color: "gray",
        items: [
          { key: "A", desc: lang === "th" ? "เปิด/ปิด เสียง" : "Toggle Audio" },
          { key: "L", desc: lang === "th" ? "เปลี่ยนภาษา" : "Change Language" },
          { key: "T", desc: lang === "th" ? "เปลี่ยน Theme" : "Toggle Theme" },
        ],
      },
    };
  }

  /**
   * สร้าง HTML Popup Content
   */
  generateHtml(lang) {
    const data = this.getShortcutsData(lang);
    const sections = Object.values(data);

    let gridHtml = "";

    sections.forEach((section) => {
      // Define colors based on section type
      let headerColor, bgColor, textColor, keyBg;

      switch (section.color) {
        case "blue":
          headerColor = "text-blue-600 dark:text-blue-400";
          bgColor = "bg-blue-50 dark:bg-blue-900/20";
          keyBg =
            "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700";
          break;
        case "purple":
          headerColor = "text-purple-600 dark:text-purple-400";
          bgColor = "bg-purple-50 dark:bg-purple-900/20";
          keyBg =
            "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700";
          break;
        case "green":
          headerColor = "text-green-600 dark:text-green-400";
          bgColor = "bg-green-50 dark:bg-green-900/20";
          keyBg =
            "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700";
          break;
        default:
          headerColor = "text-gray-600 dark:text-gray-400";
          bgColor = "bg-gray-100 dark:bg-gray-800/50";
          keyBg =
            "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
      }

      const itemsHtml = section.items
        .map(
          (item) => `
        <div class="flex items-center justify-between group">
           <span class="text-sm text-gray-700 dark:text-gray-300">${item.desc}</span>
           <kbd class="px-2 py-1 min-w-[32px] text-center text-xs font-bold rounded shadow-sm border ${keyBg} transition-transform group-hover:scale-110 font-mono">
             ${item.key}
           </kbd>
        </div>
      `,
        )
        .join("");

      gridHtml += `
        <div class="rounded-xl p-4 border border-transparent ${bgColor}">
           <h4 class="font-bold mb-3 ${headerColor} uppercase text-xs tracking-wider flex items-center gap-2">
             ${section.title}
           </h4>
           <div class="space-y-2">
             ${itemsHtml}
           </div>
        </div>
      `;
    });

    return `
      <div id="${this.popupId}" class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-purple-500/30 p-6 transform scale-95 animate-[scaleIn_0.2s_ease-out_forwards]">
         <!-- Header -->
         <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
               ⌨️ ${lang === "th" ? "รายการคีย์ลัด" : "Keyboard Shortcuts"}
               <span class="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                 Press /
               </span>
            </h2>
            <button onclick="window.shortcutsManager.close()" class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
               ✕
            </button>
         </div>

         <!-- Grid Content -->
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${gridHtml}
         </div>

         <!-- Footer Hint -->
         <div class="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            ${lang === "th" ? "กดปุ่มคีย์ลัดเพื่อใช้งานได้ทันที" : "Press keys to trigger actions immediately"}
         </div>
         
         <style>
           .custom-scrollbar::-webkit-scrollbar { width: 6px; }
           .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
           .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
           .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
           @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
         </style>
      </div>
    `;
  }

  toggle() {
    if (!this.initialized) this.init();

    const overlay = document.getElementById(this.overlayId);
    if (!overlay) return;

    if (overlay.classList.contains("hidden")) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    if (!this.initialized) this.init();

    const overlay = document.getElementById(this.overlayId);
    if (!overlay) return;

    const lang = window.uiManager?.currentLang || "th";
    overlay.innerHTML = this.generateHtml(lang);

    overlay.classList.remove("hidden");

    // Play sound if available
    // if (window.audioManager) window.audioManager.playSound('click');
  }

  close() {
    const overlay = document.getElementById(this.overlayId);
    if (overlay) {
      overlay.classList.add("hidden");
    }
  }
}
