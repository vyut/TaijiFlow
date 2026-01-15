/**
 * ============================================================================
 * TaijiFlow AI - Rules Config Manager
 * ============================================================================
 *
 * จัดการ UI สำหรับเปิด/ปิดกฎและปรับค่า Threshold ของ HeuristicsEngine
 *
 * Features:
 *   - Toggle กฎแต่ละข้อได้ real-time
 *   - ปรับค่า Threshold ได้ real-time
 *   - แสดงค่า default สำหรับอ้างอิง
 *   - Reset to Defaults
 *   - ไม่ใช้ localStorage (refresh = defaults)
 *
 * Usage:
 *   const rulesManager = new RulesConfigManager(engine);
 *
 * ============================================================================
 */

class RulesConfigManager {
  constructor(engine) {
    this.engine = engine;

    // =========================================================================
    // Default values for reference and reset
    // =========================================================================
    this.defaults = {
      // Thresholds
      SHAPE_CONSISTENCY_THRESHOLD: 0.6, // Rule 1: Path Shape (0.0-1.0)
      ARM_MOTION_THRESHOLD: 0.015,
      ELBOW_TOLERANCE_DEFAULT: 0.01,
      MIN_HIP_VELOCITY_DEG_SEC: 2.0,
      SHOULDER_HIP_RATIO: 3.0,
      STABILITY_THRESHOLD_DEFAULT: 0.05,
      SMOOTHNESS_THRESHOLD_DEFAULT: 0.05,
      PAUSE_AVG_VELOCITY_THRESHOLD: 0.003, // Rule 7: Average velocity threshold
      PAUSE_WINDOW_MS: 2000, // Rule 7: Time window (ms)
      WEIGHT_BUFFER_RATIO: 0.1,
    };

    // =========================================================================
    // Rules configuration - mapping UI elements to engine config
    // =========================================================================
    this.rules = [
      {
        id: "path",
        checkboxId: "rule-path",
        configKey: "checkPath",
        thresholds: [
          {
            inputId: "threshold-path",
            configKey: "SHAPE_CONSISTENCY_THRESHOLD",
          },
        ],
      },
      {
        id: "rotation",
        checkboxId: "rule-rotation",
        configKey: "checkRotation",
        thresholds: [
          { inputId: "threshold-rotation", configKey: "ARM_MOTION_THRESHOLD" },
        ],
      },
      {
        id: "elbow",
        checkboxId: "rule-elbow",
        configKey: "checkElbow",
        thresholds: [
          { inputId: "threshold-elbow", configKey: "ELBOW_TOLERANCE_DEFAULT" },
        ],
      },
      {
        id: "waist",
        checkboxId: "rule-waist",
        configKey: "checkWaist",
        thresholds: [
          {
            inputId: "threshold-hip-vel",
            configKey: "MIN_HIP_VELOCITY_DEG_SEC",
          },
          { inputId: "threshold-sh-ratio", configKey: "SHOULDER_HIP_RATIO" },
        ],
      },
      {
        id: "stability",
        checkboxId: "rule-stability",
        configKey: "checkStability",
        thresholds: [
          {
            inputId: "threshold-stability",
            configKey: "STABILITY_THRESHOLD_DEFAULT",
          },
        ],
      },
      {
        id: "smooth",
        checkboxId: "rule-smooth",
        configKey: "checkSmooth",
        thresholds: [
          {
            inputId: "threshold-smooth",
            configKey: "SMOOTHNESS_THRESHOLD_DEFAULT",
          },
        ],
      },
      {
        id: "continuity",
        checkboxId: "rule-continuity",
        configKey: "checkContinuity",
        thresholds: [
          {
            inputId: "threshold-motion",
            configKey: "PAUSE_AVG_VELOCITY_THRESHOLD",
          },
          { inputId: "threshold-pause", configKey: "PAUSE_WINDOW_MS" },
        ],
      },
      {
        id: "weight",
        checkboxId: "rule-weight",
        configKey: "checkWeight",
        thresholds: [
          { inputId: "threshold-weight", configKey: "WEIGHT_BUFFER_RATIO" },
        ],
      },
    ];

    // DOM Elements
    this.rulesBtn = document.getElementById("rules-btn");
    this.rulesMenu = document.getElementById("rules-menu");
    this.resetBtn = document.getElementById("rules-reset-btn");

    // Initialize
    this.init();
  }

  // ===========================================================================
  // Initialization
  // ===========================================================================
  init() {
    this.bindDropdownToggle();
    this.bindRuleCheckboxes();
    this.bindThresholdInputs();
    // bindThresholdButtons removed - ปุ่ม ▲▼ ถูกลบออกแล้ว
    this.bindResetButton();
    this.bindDebugToggle();
    this.syncUIWithEngine();
    console.log("[RulesConfig] Initialized");
  }

  // ===========================================================================
  // Dropdown Toggle
  // ===========================================================================
  bindDropdownToggle() {
    if (!this.rulesBtn || !this.rulesMenu) return;

    this.rulesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.rulesMenu.classList.toggle("hidden");
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.rulesMenu.contains(e.target) && e.target !== this.rulesBtn) {
        this.rulesMenu.classList.add("hidden");
      }
    });
  }

  // ===========================================================================
  // Rule Checkboxes - Enable/Disable rules
  // ===========================================================================
  bindRuleCheckboxes() {
    this.rules.forEach((rule) => {
      const checkbox = document.getElementById(rule.checkboxId);
      if (!checkbox) return;

      checkbox.addEventListener("change", () => {
        this.setRuleEnabled(rule.configKey, checkbox.checked);
      });
    });
  }

  setRuleEnabled(configKey, enabled) {
    if (this.engine && this.engine.currentRulesConfig) {
      this.engine.currentRulesConfig[configKey] = enabled;
      console.log(`[RulesConfig] ${configKey} = ${enabled}`);
    }
  }

  // ===========================================================================
  // Threshold Inputs - Direct input change
  // ===========================================================================
  bindThresholdInputs() {
    this.rules.forEach((rule) => {
      rule.thresholds.forEach((threshold) => {
        const input = document.getElementById(threshold.inputId);
        if (!input) return;

        input.addEventListener("change", () => {
          const value = parseFloat(input.value);
          if (!isNaN(value)) {
            this.setThreshold(threshold.configKey, value);
          }
        });
      });
    });
  }

  setThreshold(configKey, value) {
    if (this.engine && this.engine.CONFIG) {
      // Convert seconds to milliseconds for PAUSE_WINDOW_MS
      if (configKey === "PAUSE_WINDOW_MS") {
        value = value * 1000;
      }
      this.engine.CONFIG[configKey] = value;
      console.log(`[RulesConfig] ${configKey} = ${value}`);
    }
  }

  // ===========================================================================
  // Threshold Buttons - ▲▼ increment/decrement
  // ===========================================================================
  bindThresholdButtons() {
    // Up buttons
    document.querySelectorAll(".threshold-up").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.adjustThreshold(btn, 1);
      });
    });

    // Down buttons
    document.querySelectorAll(".threshold-down").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.adjustThreshold(btn, -1);
      });
    });
  }

  adjustThreshold(btn, direction) {
    const targetId = btn.dataset.target;
    const step = parseFloat(btn.dataset.step) || 0.01;
    const input = document.getElementById(targetId);

    if (!input) return;

    let value = parseFloat(input.value) || 0;
    value += step * direction;

    // Respect min/max
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || Infinity;
    value = Math.max(min, Math.min(max, value));

    // Round to avoid floating point issues
    const decimals = step.toString().split(".")[1]?.length || 0;
    value = parseFloat(value.toFixed(decimals + 1));

    input.value = value;

    // Trigger change event to update engine
    input.dispatchEvent(new Event("change"));
  }

  // ===========================================================================
  // Reset Button
  // ===========================================================================
  bindResetButton() {
    if (!this.resetBtn) return;

    this.resetBtn.addEventListener("click", () => {
      this.resetToDefaults();
    });
  }

  // ===========================================================================
  // Debug Toggle
  // ===========================================================================
  bindDebugToggle() {
    const debugToggle = document.getElementById("check-debug");
    if (!debugToggle) return;

    debugToggle.addEventListener("change", () => {
      if (this.engine) {
        this.engine.setDebugMode(debugToggle.checked);
        // แสดง/ซ่อน HTML debug overlay
        if (typeof toggleDebugOverlay === "function") {
          toggleDebugOverlay(debugToggle.checked);
        }
        console.log(
          `[RulesConfig] Debug Mode: ${debugToggle.checked ? "ON" : "OFF"}`
        );
      }
    });
  }

  resetToDefaults() {
    // Reset thresholds in engine
    if (this.engine && this.engine.CONFIG) {
      Object.keys(this.defaults).forEach((key) => {
        this.engine.CONFIG[key] = this.defaults[key];
      });
    }

    // Reset rule checkboxes based on current level
    if (this.engine && this.engine.RULES_CONFIG && this.engine.currentLevel) {
      const levelConfig = this.engine.RULES_CONFIG[this.engine.currentLevel];
      if (levelConfig) {
        this.engine.currentRulesConfig = { ...levelConfig };
      }
    }

    // Sync UI
    this.syncUIWithEngine();
    console.log("[RulesConfig] Reset to defaults");
  }

  // ===========================================================================
  // Sync UI with Engine
  // ===========================================================================
  syncUIWithEngine() {
    // Sync checkboxes
    this.rules.forEach((rule) => {
      const checkbox = document.getElementById(rule.checkboxId);
      if (checkbox && this.engine?.currentRulesConfig) {
        checkbox.checked =
          this.engine.currentRulesConfig[rule.configKey] || false;
      }
    });

    // Sync threshold inputs
    this.rules.forEach((rule) => {
      rule.thresholds.forEach((threshold) => {
        const input = document.getElementById(threshold.inputId);
        if (input && this.engine?.CONFIG) {
          let value = this.engine.CONFIG[threshold.configKey];
          // Convert milliseconds to seconds for PAUSE_WINDOW_MS display
          if (
            threshold.configKey === "PAUSE_WINDOW_MS" &&
            value !== undefined
          ) {
            value = value / 1000;
          }
          if (value !== undefined) {
            input.value = value;
          }
        }
      });
    });

    // Sync debug toggle
    const debugToggle = document.getElementById("check-debug");
    if (debugToggle && this.engine) {
      debugToggle.checked = this.engine.debugMode || false;
    }
  }

  // ===========================================================================
  // Update when level changes
  // ===========================================================================
  onLevelChange(level) {
    if (
      this.engine &&
      this.engine.RULES_CONFIG &&
      this.engine.RULES_CONFIG[level]
    ) {
      this.engine.currentRulesConfig = { ...this.engine.RULES_CONFIG[level] };
      this.syncUIWithEngine();
      console.log(`[RulesConfig] Level changed to ${level}`);
    }
  }
}

// Export for use
if (typeof module !== "undefined" && module.exports) {
  module.exports = RulesConfigManager;
}
