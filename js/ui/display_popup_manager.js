/**
 * ============================================================================
 * TaijiFlow AI - Display Popup Manager
 * ============================================================================
 *
 * Manages the "Display Options" Popup (Modal).
 * Mirrors the visual style of RulesPopupManager/ShortcutsManager.
 *
 * Layout: 4-Column Grid
 * - Col 1: Trainee/You (Skeleton, Error, Trail)
 * - Col 2: Reference (Instructor, Side-by-Side, Ghost)
 * - Col 3: View (Mirror, Path, Grid)
 * - Col 4: Developer (Debug, FPS, Calibration)
 *
 * Pattern: "Always Show Settings"
 * - Sub-settings are displayed inline below the main toggle.
 *
 * @author TaijiFlow AI Team
 * @since 4.0.0
 */

class DisplayPopupManager {
  constructor() {
    this.popupId = "display-popup";
    this.overlayId = "display-overlay";
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.createOverlay();
    this.initialized = true;
  }

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = this.overlayId;
    overlay.className =
      "fixed inset-0 z-[60] bg-black/20 hidden transition-opacity duration-300 flex items-center justify-center p-4"; // Removed backdrop-blur from overlay to see video clearly

    // Close on click outside
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
    });

    document.body.appendChild(overlay);
  }

  /**
   * Generate HTML for the 4-Column Grid
   */
  generateHtml() {
    return `
            <div id="${this.popupId}" class="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white/85 dark:bg-gray-900/25 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 transform scale-95 animate-[scaleIn_0.2s_ease-out_forwards] overflow-hidden">
                
                <!-- Header -->
                <div class="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        👁️ Display Options
                        <span class="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700">
                           Configure your view
                        </span>
                    </h2>
                    <button onclick="window.displayPopupManager.close()" class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                        ✕
                    </button>
                </div>

                <!-- Scrollable Grid Content -->
                <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                        ${this._col1_Trainee()}
                        ${this._col2_Reference()}
                        ${this._col3_View()}
                        ${this._col4_Developer()}
                    </div>
                </div>

                <!-- Footer (Info) -->
                <div class="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                     <!-- Info Bar (Left) -->
                     <div class="flex-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 w-full md:w-auto">
                        <span class="text-xl">ℹ️</span>
                        <span id="display-info-text" class="italic transition-all duration-300">
                           Hover over an option to see details. Keyboard shortcuts shown in ().
                        </span>
                     </div>
                </div>

                <style>
                   @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                   .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                   .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                   .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
                   .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
                </style>
            </div>
        `;
  }

  // =========================================================================
  // Column Generators
  // =========================================================================

  _getDC() {
    return window.displayController || {};
  }

  _col1_Trainee() {
    return `
            <div class="rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20 p-4">
                <h3 class="font-bold mb-4 text-purple-600 dark:text-purple-400 uppercase text-xs tracking-wider flex items-center gap-2">
                    🧑 Trainee/You
                </h3>
                <div class="space-y-6">
                    <!-- Skeleton -->
                    <div>
                        ${this._renderMainToggle("Skeleton", "check-skeleton", "🦴", "K", "Track your joints in real-time")}
                        <div class="ml-6 mt-2 space-y-2">
                             ${this._renderColorPicker("skeleton-color", ["255, 255, 255", "0, 255, 255", "255, 255, 0", "255, 0, 255"], 0)}
                             ${this._renderSubCheckbox("Joint Numbers", "check-skeleton-indices", "Show index numbers on skeleton")}
                        </div>
                    </div>

                    ${this._renderDivider()}

                    <!-- Error Highlights -->
                    <div>
                        ${this._renderMainToggle("Error Highlights", "check-error-highlights", "🎯", "E", "Show red dots on mistakes")}
                        <div class="ml-6 mt-2 space-y-2">
                             ${this._renderSelect("highlight-style", [
                               { val: "vivid", text: "✨ Vivid" },
                               { val: "minimal", text: "⚫ Minimal" },
                               { val: "outline", text: "⭕ Outline" },
                             ])}
                             ${this._renderSubCheckbox("Show Details", "check-highlight-scope", "Connectors overlay")}
                             ${this._renderSlider("Opacity", "highlight-opacity", 0.2, 1.0, 1.0, 0.1)}
                        </div>
                    </div>

                    ${this._renderDivider()}

                    <!-- Motion Trail -->
                    <div>
                        ${this._renderMainToggle("Motion Trail", "check-trail", "☄️", "R", "Track hand movement history")}
                        <div class="ml-6 mt-2 space-y-2">
                             ${this._renderSelect("trail-length", [
                               { val: "30", text: "Short" },
                               { val: "60", text: "Medium" },
                               { val: "90", text: "Long" },
                             ])}
                             ${this._renderColorPicker("trail-color", ["100, 200, 255", "50, 255, 100", "255, 215, 0"], 0)}
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  _col2_Reference() {
    const dc = this._getDC();
    return `
            <div class="rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-500/20 p-4">
                <h3 class="font-bold mb-4 text-indigo-600 dark:text-indigo-400 uppercase text-xs tracking-wider flex items-center gap-2">
                    🎓 Reference
                </h3>
                <div class="space-y-6">
                    <!-- Instructor PiP -->
                    <div>
                        ${this._renderMainToggle("Instructor PiP", "check-instructor", "🎓", "I", "Corner video overlay")}
                        <div class="ml-6 mt-2 space-y-2">
                             ${this._renderButtonGroup(
                               "instructor-size",
                               [
                                 { val: "small", text: "S" },
                                 { val: "medium", text: "M" },
                                 { val: "large", text: "L" },
                               ],
                               dc.instructorSize || "medium",
                             )}
                             ${this._renderButtonGroup(
                               "instructor-pos",
                               [
                                 { val: "tl", text: "Top-Left" },
                                 { val: "tr", text: "Top-Right" },
                                 { val: "bl", text: "Bottom-Left" },
                                 { val: "br", text: "Bottom-Right" },
                               ],
                               dc.instructorPos || "tr",
                               "grid grid-cols-2 gap-2", // 2x2 Grid
                             )}
                        </div>
                    </div>

                    ${this._renderDivider()}

                    <!-- Side-by-Side -->
                    <div>
                        ${this._renderMainToggle("Side-by-Side", "check-side-by-side", "🌗", "S", "Split screen comparison")}
                        <div class="ml-6 mt-2 space-y-2">
                             ${this._renderButtonGroup(
                               "sbs-mode",
                               [
                                 { val: "contain", text: "🔲 Fit" },
                                 { val: "cover", text: "🔍 Focus" },
                               ],
                               dc.sbsMode || "cover",
                             )}
                             ${this._renderButtonGroup(
                               "sbs-ratio",
                               [
                                 { val: "60", text: "60:40" },
                                 { val: "50", text: "50:50" },
                                 { val: "40", text: "40:60" },
                               ],
                               dc.sbsRatio || "50",
                             )}
                        </div>
                    </div>

                    ${this._renderDivider()}

                    <!-- Ghost Overlay -->
                    <div>
                        ${this._renderMainToggle("Ghost Overlay", "check-ghost", "👻", "O", "Full body reference shadow")}
                        <div class="ml-6 mt-2 space-y-2">
                             ${this._renderSlider("Opacity", "ghost-opacity", 20, 80, dc.ghostOpacity || 60, 10)}
                             ${this._renderColorPicker("ghost-color", ["100, 200, 255", "255, 215, 0", "255, 40, 40"], 1)}
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  _col3_View() {
    const dc = this._getDC();
    return `
            <div class="rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-4">
                <h3 class="font-bold mb-4 text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wider flex items-center gap-2">
                    🖼️ View Env
                </h3>
                <div class="space-y-6">
                    <!-- Mirror Mode -->
                    <div>
                        ${this._renderMainToggle("Mirror Mode", "check-mirror", "🪞", "M", "Flip display horizontally")}
                        <div class="ml-6 mt-2 space-y-2">
                             ${this._renderButtonGroup(
                               "mirror-rot",
                               [
                                 { val: "0", text: "0°" },
                                 { val: "90", text: "90°" },
                                 { val: "180", text: "180°" },
                                 { val: "270", text: "270°" },
                               ],
                               (dc.mirrorRotation || 0).toString(),
                             )}
                             ${this._renderButtonGroup(
                               "mirror-flip",
                               [
                                 { val: "horizontal", text: "Horz" },
                                 { val: "vertical", text: "Vert" },
                               ],
                               dc.mirrorFlipAxis || "horizontal",
                             )}
                        </div>
                    </div>

                    ${this._renderDivider()}

                    <!-- Path Guide -->
                    <div>
                         ${this._renderMainToggle("Path Guide", "check-path", "🛣️", "P", "Dynamic movement guide")}
                         <div class="ml-6 mt-2 space-y-2">
                             ${this._renderSelect("path-width", [
                               { val: "4", text: "Thin" },
                               { val: "8", text: "Thick" },
                             ])}
                             ${this._renderColorPicker("path-color", ["0, 255, 0", "255, 255, 0", "255, 0, 255"], 0)}
                         </div>
                    </div>

                    ${this._renderDivider()}

                    <!-- Grid Overlay -->
                    <div>
                         ${this._renderMainToggle("Grid Overlay", "check-grid", "📏", "G", "Position reference lines")}
                         <div class="ml-6 mt-2 space-y-2">
                             ${this._renderSelect("grid-size", [
                               { val: "60", text: "Small" },
                               { val: "100", text: "Medium" },
                               { val: "140", text: "Large" },
                             ])}
                             ${this._renderColorPicker("grid-color", ["255, 255, 255", "150, 150, 150", "255, 50, 50"], 0)}
                             ${this._renderSlider("Opacity", "grid-opacity", 20, 80, 40, 10)}
                         </div>
                    </div>
                </div>
            </div>
        `;
  }

  _col4_Developer() {
    return `
            <div class="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 p-4">
                <h3 class="font-bold mb-4 text-red-600 dark:text-red-400 uppercase text-xs tracking-wider flex items-center gap-2">
                    🛠️ Developer
                </h3>
                <div class="space-y-6">
                    <!-- Debug Info -->
                    <div>
                        ${this._renderMainToggle("Debug Info", "check-debug", "🐞", "D", "Show technical overlay")}
                        <div class="ml-6 mt-2 space-y-2">
                             ${this._renderSubCheckbox("Graphs", "check-debug-graph", "Show FPS/Heuristic graphs")}
                             ${this._renderSubCheckbox("Details", "check-debug-detail", "Show detailed analysis")}
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  // =========================================================================
  // Component Renderers
  // =========================================================================

  _renderDivider() {
    return `<hr class="border-t border-gray-200 dark:border-gray-700/50 my-4">`;
  }

  _renderMainToggle(title, id, emoji, shortcut, desc) {
    // Escape single quotes
    const safeDesc = desc.replace(/'/g, "&apos;");
    const shortcutHtml = shortcut
      ? `<span class="opacity-50 ml-1">(${shortcut})</span>`
      : "";

    return `
            <div class="group" onmouseenter="window.displayPopupManager.updateInfo('${safeDesc}')" onmouseleave="window.displayPopupManager.resetInfo()">
                <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" id="${id}" class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-500 focus:ring-offset-white dark:focus:ring-offset-gray-900">
                    <span class="ml-2 text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                       ${title} ${shortcutHtml}
                    </span>
                </label>
            </div>
        `;
  }

  _renderSubCheckbox(title, id, desc) {
    const safeDesc = desc.replace(/'/g, "&apos;");
    return `
        <div class="group" onmouseenter="window.displayPopupManager.updateInfo('${safeDesc}')" onmouseleave="window.displayPopupManager.resetInfo()">
            <label class="flex items-center cursor-pointer select-none">
                <input type="checkbox" id="${id}" class="w-3.5 h-3.5 rounded border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-blue-500 focus:ring-blue-500">
                <span class="ml-2 text-xs text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors">${title}</span>
            </label>
        </div>
      `;
  }

  _renderColorPicker(id, colors, defaultIdx) {
    return `
        <div class="flex items-center gap-2">
            <span class="text-[10px] uppercase font-bold text-gray-400">Color</span>
            <div class="flex gap-2">
                ${colors
                  .map(
                    (rgb) => `
                  <button class="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform ${id}-btn relative" 
                          data-color="${rgb}"
                          style="background-color: rgb(${rgb})"
                  ></button>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `;
  }

  _renderSelect(id, options) {
    return `
         <div class="flex items-center justify-between gap-2">
             <span class="text-[10px] uppercase font-bold text-gray-400">Mode</span>
             <select id="${id}" class="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded border border-gray-300 dark:border-gray-600 px-1 py-0.5 focus:border-indigo-500 focus:outline-none">
                 ${options.map((opt) => `<option value="${opt.val}">${opt.text}</option>`).join("")}
             </select>
         </div>
      `;
  }

  _renderSlider(label, id, min, max, val, step) {
    return `
        <div class="flex flex-col gap-0.5 w-full">
            <div class="flex justify-between">
                <span class="text-[10px] uppercase font-bold text-gray-400">${label}</span>
                <span id="${id}-val" class="text-[10px] text-gray-500 dark:text-gray-400">${val}</span>
            </div>
            <input type="range" id="${id}" min="${min}" max="${max}" value="${val}" step="${step}" 
                   class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500">
        </div>
     `;
  }

  _renderButtonGroup(
    id,
    buttons,
    defaultVal,
    containerClass = "flex gap-1 w-full",
  ) {
    return `
        <div class="${containerClass}">
            ${buttons
              .map(
                (btn) => `
                <button class="${id}-btn ${containerClass.includes("grid") ? "" : "flex-1"} py-1 rounded border border-gray-300 dark:border-gray-600 text-[10px] hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors ${btn.val === defaultVal ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500" : "bg-white dark:bg-gray-800"}" 
                        data-val="${btn.val}">
                    ${btn.text}
                </button>
            `,
              )
              .join("")}
        </div>
      `;
  }

  // =========================================================================
  // Footer Info Logic
  // =========================================================================

  updateInfo(text) {
    const el = document.getElementById("display-info-text");
    if (el && text) {
      el.textContent = text;
      el.classList.remove("text-gray-500", "dark:text-gray-400", "italic"); // Active style
      el.classList.add(
        "text-indigo-600",
        "dark:text-indigo-400",
        "font-medium",
      );
    }
  }

  resetInfo() {
    const el = document.getElementById("display-info-text");
    if (el) {
      el.textContent =
        "Hover over an option to see details. Keyboard shortcuts shown in ().";
      // Reset style
      el.classList.add("text-gray-500", "dark:text-gray-400", "italic");
      el.classList.remove(
        "text-indigo-600",
        "dark:text-indigo-400",
        "font-medium",
      );
    }
  }

  // =========================================================================
  // Open / Close
  // =========================================================================

  toggle() {
    const overlay = document.getElementById(this.overlayId);
    if (!overlay || overlay.classList.contains("hidden")) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    if (!this.initialized) this.init();

    const overlay = document.getElementById(this.overlayId);
    if (!overlay) return;

    // 1. Generate & Inject HTML
    overlay.innerHTML = this.generateHtml();
    overlay.classList.remove("hidden");

    // 2. Re-Bind Events via DisplayController
    if (
      window.displayController &&
      typeof window.displayController.reBind === "function"
    ) {
      window.displayController.reBind();
    } else {
      console.warn(
        "DisplayPopup: displayController.reBind() not found. Controls may not work.",
      );
    }
  }

  close() {
    const overlay = document.getElementById(this.overlayId);
    if (overlay) {
      overlay.classList.add("hidden");
    }
  }
}

// Global Instance
window.DisplayPopupManager = DisplayPopupManager;
window.displayPopupManager = new DisplayPopupManager();
