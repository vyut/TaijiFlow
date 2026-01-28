/**
 * ============================================================================
 * TaijiFlow AI - Rule Popup Manager
 * ============================================================================
 *
 * Manages the "Rules Settings" Popup (Modal).
 * Mirrors the visual style of ShortcutsManager.
 *
 * Features:
 * - 4-Column Layout (L1, L2, L3, L4/Future)
 * - Dynamic HTML Generation
 * - Integration with RuleConfigManager (reBind events)
 *
 * @author TaijiFlow AI Team
 * @since 4.0.0
 */

class RulesPopupManager {
  constructor() {
    this.popupId = "rules-popup";
    this.overlayId = "rules-overlay";
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
      "fixed inset-0 z-[60] bg-black/60 hidden transition-opacity duration-300 flex items-center justify-center p-4 backdrop-blur-sm";

    // Close on click outside
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
    });

    document.body.appendChild(overlay);
  }

  /**
   * Generate HTML for the 4-Column Grid
   */
  /**
   * Generate HTML for the 4-Column Grid
   */
  generateHtml() {
    return `
            <div id="${this.popupId}" class="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 transform scale-95 animate-[scaleIn_0.2s_ease-out_forwards] overflow-hidden">
                
                <!-- Header -->
                <div class="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        🔧 Rules Configuration
                        <span class="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700">
                           Customize Feedback
                        </span>
                    </h2>
                    <button onclick="window.rulesPopupManager.close()" class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                        ✕
                    </button>
                </div>

                <!-- Scrollable Grid Content -->
                <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                        ${this._col1_L1()}
                        ${this._col2_L2()}
                        ${this._col3_L3()}
                        ${this._col4_L4()}
                    </div>
                </div>

                <!-- Footer (Reset Button) -->
                <div class="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                     <button
                        id="rules-reset-btn"
                        class="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all flex items-center gap-2 text-sm shadow-sm hover:shadow"
                      >
                        🔄 Reset to Defaults
                      </button>
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

  _col1_L1() {
    return `
            <div class="rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/20 p-4">
                <h3 class="font-bold mb-4 text-green-600 dark:text-green-400 uppercase text-xs tracking-wider flex items-center gap-2">
                    🟢 L1: นั่ง (3 กฎ)
                </h3>
                <div class="space-y-4">
                    ${this._renderItem("Path Shape", "rule-path", "Consistency", "threshold-path", 0.6, 0.3, 0.9, 0.05)}
                    ${this._renderItem("Elbow Sinking", "rule-elbow", "Tolerance", "threshold-elbow", 0.01, 0.005, 0.05, 0.005)}
                    ${this._renderItem("Continuity", "rule-continuity", "Threshold", "threshold-motion", 0.003, 0.001, 0.01, 0.001)}
                    <!-- Continuity has 2 thresholds, manual fix -->
                    <div class="ml-8 -mt-2 mb-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span>Window(s):</span>
                        <input type="number" id="threshold-pause" value="2" step="0.5" min="1" max="5" class="w-14 px-1 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-center text-xs text-gray-900 dark:text-white focus:border-green-500 focus:outline-none">
                    </div>
                </div>
            </div>
        `;
  }

  _col2_L2() {
    return `
            <div class="rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-4">
                <h3 class="font-bold mb-4 text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wider flex items-center gap-2">
                    🔵 L2: ยืน (เพิ่ม 3 กฎ)
                </h3>
                <div class="space-y-4">
                     ${this._renderItem("Arm Rotation", "rule-rotation", "Motion", "threshold-rotation", 0.015, 0.005, 0.05, 0.005)}
                     ${this._renderItem("Waist Initiation", "rule-waist", "Hip Vel", "threshold-hip-vel", 1.0, 0.5, 10, 0.5)}
                     <!-- Waist has 2 thresholds -->
                     <div class="ml-8 -mt-2 mb-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span>S/H Ratio:</span>
                        <input type="number" id="threshold-sh-ratio" value="2.0" step="0.5" min="1" max="10" class="w-14 px-1 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-center text-xs text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none">
                    </div>
                     ${this._renderItem("Smoothness", "rule-smooth", "Threshold", "threshold-smooth", 0.05, 0.01, 0.15, 0.01)}
                </div>
            </div>
        `;
  }

  _col3_L3() {
    return `
            <div class="rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20 p-4">
                <h3 class="font-bold mb-4 text-purple-600 dark:text-purple-400 uppercase text-xs tracking-wider flex items-center gap-2">
                    🟣 L3: ยืนย่อ (เพิ่ม 3 กฎ)
                </h3>
                <div class="space-y-4">
                    ${this._renderItem("Stability", "rule-stability", "Threshold", "threshold-stability", 0.05, 0.01, 0.15, 0.01)}
                    ${this._renderItem("Weight Shift", "rule-weight", "Buffer", "threshold-weight", 0.3, 0.05, 0.5, 0.05)}
                    ${this._renderItem("Coordination", "rule-coordination", "Vel Thresh", "threshold-coordination", 0.02, 0.01, 0.1, 0.01)}
                </div>
            </div>
        `;
  }

  _col4_L4() {
    return `
            <div class="rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-500/20 p-4 opacity-75">
                <h3 class="font-bold mb-4 text-yellow-600 dark:text-yellow-400 uppercase text-xs tracking-wider flex items-center gap-2">
                    🟡 L4: Future Use
                </h3>
                <div class="flex flex-col items-center justify-center p-4 text-center h-[200px] border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <span class="text-3xl mb-2">🚧</span>
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Future rules for<br>2-handed silk reeling</span>
                </div>
            </div>
        `;
  }

  _renderItem(title, checkId, inputLabel, inputId, val, min, max, step) {
    return `
            <div class="group">
                <div class="flex items-center justify-between mb-1">
                    <label class="flex items-center cursor-pointer select-none">
                        <input type="checkbox" id="${checkId}" class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-500 focus:ring-offset-white dark:focus:ring-offset-gray-900">
                        <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">${title}</span>
                    </label>
                </div>
                <div class="ml-6 flex items-center gap-2">
                     <span class="text-[10px] text-gray-500 uppercase font-bold">${inputLabel}</span>
                     <input type="number" id="${inputId}" value="${val}" min="${min}" max="${max}" step="${step}" 
                        class="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded px-2 py-1 text-right text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                     >
                </div>
            </div>
        `;
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

    // 2. Re-Bind Events in RuleConfigManager
    if (
      window.rulesConfigManager &&
      typeof window.rulesConfigManager.reBind === "function"
    ) {
      window.rulesConfigManager.reBind();
    } else {
      console.warn("RulePopup: rulesConfigManager not found or no reBind()");
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
window.RulesPopupManager = RulesPopupManager;
window.rulesPopupManager = new RulesPopupManager(); // Auto-instantiate for onclick usage
