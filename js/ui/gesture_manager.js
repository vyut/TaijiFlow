/**
 * ============================================================================
 * TaijiFlow AI - Gesture Manager v1.0
 * ============================================================================
 *
 * ระบบควบคุมด้วยท่ามือ (Gesture Control System)
 *
 * @description
 *   ใช้ MediaPipe Gesture Recognizer ตรวจจับท่ามือเพื่อควบคุม UI
 *   ช่วยให้ผู้ฝึกสามารถเริ่ม/หยุดการฝึกโดยไม่ต้องเดินไปกดปุ่ม
 *
 * ============================================================================
 * Gestures ที่รองรับ
 * ============================================================================
 *
 *   | ท่ามือ          | Action        | Hold Time |
 *   |-----------------|---------------|-----------|
 *   | 👍 Thumb_Up     | เริ่มการฝึก    | 2 วินาที   |
 *   | ✊ Closed_Fist  | หยุดการฝึก    | 2 วินาที   |
 *
 *   หมายเหตุ: ต้องค้างท่าไว้ 2 วินาทีเพื่อป้องกัน False Positive
 *
 * ============================================================================
 * Workflow
 * ============================================================================
 *
 *   1. init() - โหลด MediaPipe Gesture Recognizer
 *   2. detectGestures() - ถูกเรียกทุก Frame จาก script.js
 *   3. processGesture() - ตรวจสอบ Hold Time และ Trigger Action
 *   4. showOverlay() - แสดง Progress Bar ขณะค้าง
 *   5. Trigger Callback (onStartTraining/onStopTraining)
 *
 * ============================================================================
 * Dependencies
 * ============================================================================
 *
 *   - MediaPipe Tasks Vision (@mediapipe/tasks-vision)
 *   - gesture_recognizer.task (MediaPipe Model)
 *   - GPU หรือ CPU delegate
 *
 * ============================================================================
 * การใช้งาน
 * ============================================================================
 *
 *   ```javascript
 *   const gestureManager = new GestureManager();
 *   await gestureManager.init();
 *
 *   // ผูก Callbacks
 *   gestureManager.onStartTraining = () => { ... };
 *   gestureManager.onStopTraining = () => { ... };
 *
 *   // เรียกทุก Frame
 *   gestureManager.detectGestures(videoElement, timestamp, lang);
 *   ```
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 1.0.0
 * ============================================================================
 */

// =============================================================================
// CLASS: GestureManager
// =============================================================================

/**
 * GestureManager Class
 *
 * @description
 *   จัดการ Gesture Recognition และ UI Feedback
 */
class GestureManager {
  // ===========================================================================
  // CONSTRUCTOR
  // ===========================================================================

  /**
   * Constructor - เริ่มต้นระบบ Gesture Control
   *
   * @description
   *   สร้าง Properties และ UI Elements
   *   ยังไม่โหลด Model (ต้องเรียก init() แยก)
   */
  constructor() {
    // -------------------------------------------------------------------------
    // MediaPipe References
    // -------------------------------------------------------------------------
    this.gestureRecognizer = null; // MediaPipe Gesture Recognizer Instance
    this.isReady = false; // โหลด Model เสร็จหรือยัง
    this.isEnabled = true; // เปิดใช้งาน Gesture Detection หรือไม่

    // -------------------------------------------------------------------------
    // Gesture Hold State - สถานะการค้างท่า
    // -------------------------------------------------------------------------
    this.currentGesture = null; // ท่าที่กำลังค้างอยู่
    this.gestureStartTime = 0; // เวลาเริ่มค้าง (timestamp)
    this.HOLD_DURATION_MS = 2000; // ต้องค้าง 2 วินาที

    // -------------------------------------------------------------------------
    // Callbacks - ฟังก์ชันที่จะถูกเรียกเมื่อ Gesture สำเร็จ
    // -------------------------------------------------------------------------
    this.onStartTraining = null; // Callback: เริ่มการฝึก
    this.onStopTraining = null; // Callback: หยุดการฝึก

    // -------------------------------------------------------------------------
    // UI Elements - สำหรับแสดง Feedback
    // -------------------------------------------------------------------------
    this.overlayEl = null; // Overlay container
    this.progressEl = null; // Progress bar
    this.gestureTextEl = null; // ข้อความ

    // -------------------------------------------------------------------------
    // Gesture Action Mapping - กำหนดว่าท่าไหนทำอะไร
    // -------------------------------------------------------------------------
    this.gestureActions = {
      // 👍 Thumb Up = เริ่มการฝึก
      Thumb_Up: {
        icon: "👍",
        text: { th: "เริ่มการฝึก...", en: "Starting..." },
        callback: () => this.onStartTraining && this.onStartTraining(),
      },
      // ✊ Closed Fist = หยุดการฝึก
      Closed_Fist: {
        icon: "✊",
        text: { th: "หยุดการฝึก...", en: "Stopping..." },
        callback: () => this.onStopTraining && this.onStopTraining(),
      },
    };

    // สร้าง UI
    this.createUI();
  }

  /**
   * Initialize MediaPipe Gesture Recognizer
   */
  async init() {
    try {
      console.log("[GestureManager] Initializing...");

      // รอจนกว่า MediaPipe Tasks Vision จะโหลดเสร็จ
      await this.waitForMediaPipe();

      const GestureRecognizer = window.GestureRecognizerClass;
      const FilesetResolver = window.FilesetResolverClass;

      if (!GestureRecognizer || !FilesetResolver) {
        throw new Error("MediaPipe Tasks Vision not loaded correctly");
      }

      console.log("[GestureManager] Loading WASM files...");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm",
      );

      console.log("[GestureManager] Creating Gesture Recognizer...");
      this.gestureRecognizer = await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        },
      );

      this.isReady = true;
      console.log("[GestureManager] ✅ Ready!");
      return true;
    } catch (error) {
      console.error("[GestureManager] ❌ Init failed:", error);
      this.isReady = false;
      return false;
    }
  }

  /**
   * Wait for MediaPipe to be loaded via the module script
   */
  waitForMediaPipe() {
    return new Promise((resolve) => {
      // ถ้าโหลดแล้ว
      if (window.GestureRecognizerClass && window.FilesetResolverClass) {
        resolve();
        return;
      }
      // รอ event
      window.addEventListener("mediapipe-ready", () => resolve(), {
        once: true,
      });
      // Timeout 10 วินาที
      setTimeout(() => {
        console.warn(
          "[GestureManager] MediaPipe load timeout, proceeding anyway...",
        );
        resolve();
      }, 10000);
    });
  }

  /**
   * Create gesture feedback UI overlay
   * -------------------------------------------------------------------------
   * หมายเหตุ: ต้อง append ใน .canvas-container เพื่อให้แสดงใน Fullscreen ด้วย
   * -------------------------------------------------------------------------
   */
  createUI() {
    // สร้าง overlay สำหรับแสดง feedback
    this.overlayEl = document.createElement("div");
    this.overlayEl.id = "gesture-overlay";
    // ใช้ absolute แทน fixed เพื่อให้อยู่ใน container
    this.overlayEl.className =
      "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 hidden";
    this.overlayEl.innerHTML = `
      <div class="bg-black/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl border border-white/20 dark:border-gray-700/50">
        <div id="gesture-icon" class="text-6xl mb-4">👍</div>
        <div id="gesture-text" class="text-white text-xl mb-4">เริ่มการฝึก...</div>
        <div class="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div id="gesture-progress" class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100" style="width: 0%"></div>
        </div>
        <div id="gesture-hold-text" class="text-gray-400 text-sm mt-2">ค้างไว้ 2 วินาที</div>
      </div>
    `;

    // Append ใน canvas-container เพื่อให้แสดงใน Fullscreen
    const canvasContainer = document.querySelector(".canvas-container");
    if (canvasContainer) {
      canvasContainer.appendChild(this.overlayEl);
    } else {
      // Fallback ถ้าหา container ไม่เจอ
      document.body.appendChild(this.overlayEl);
    }

    this.progressEl = document.getElementById("gesture-progress");
    this.gestureTextEl = document.getElementById("gesture-text");
    this.gestureIconEl = document.getElementById("gesture-icon");
    this.holdTextEl = document.getElementById("gesture-hold-text");

    // Hold text translations
    this.holdText = {
      th: "ค้างไว้ 2 วินาที",
      en: "Hold for 2 seconds",
    };
  }

  /**
   * Process video frame and detect gestures
   * @param {HTMLVideoElement} videoElement
   * @param {number} timestamp - Current time in ms
   * @param {string} lang - "th" or "en"
   */
  detectGestures(videoElement, timestamp, lang = "th") {
    if (!this.isReady || !this.isEnabled || !this.gestureRecognizer) return;

    try {
      const results = this.gestureRecognizer.recognizeForVideo(
        videoElement,
        timestamp,
      );

      // หา gesture ที่ detect ได้
      let detectedGesture = null;
      if (results.gestures && results.gestures.length > 0) {
        for (const handGestures of results.gestures) {
          if (handGestures.length > 0) {
            const gesture = handGestures[0];
            // ต้องมี confidence สูงพอ
            if (gesture.score > 0.7) {
              detectedGesture = gesture.categoryName;
              break;
            }
          }
        }
      }

      // ประมวลผล gesture
      this.processGesture(detectedGesture, timestamp, lang);
    } catch (error) {
      // ไม่ log error เพราะอาจเกิดบ่อย
    }
  }

  /**
   * Process detected gesture with hold timer
   */
  processGesture(gestureName, timestamp, lang) {
    const actionConfig = this.gestureActions[gestureName];

    // ถ้าไม่ใช่ gesture ที่เราสนใจ หรือไม่มี gesture
    if (!actionConfig) {
      this.resetGesture();
      return;
    }

    // ถ้าเป็น gesture ใหม่
    if (this.currentGesture !== gestureName) {
      this.currentGesture = gestureName;
      this.gestureStartTime = timestamp;
      this.showOverlay(actionConfig, lang);
    }

    // คำนวณ progress
    const elapsed = timestamp - this.gestureStartTime;
    const progress = Math.min(elapsed / this.HOLD_DURATION_MS, 1);
    this.updateProgress(progress);

    // ถ้าค้างครบ 3 วินาที
    if (progress >= 1) {
      this.hideOverlay();
      actionConfig.callback();
      this.currentGesture = null;
      this.gestureStartTime = 0;

      // ป้องกันการ trigger ซ้ำ - หยุด detect ชั่วคราว
      this.isEnabled = false;
      setTimeout(() => {
        this.isEnabled = true;
      }, 1000);
    }
  }

  /**
   * Reset gesture state when gesture is released
   */
  resetGesture() {
    if (this.currentGesture) {
      this.currentGesture = null;
      this.gestureStartTime = 0;
      this.hideOverlay();
    }
  }

  /**
   * Show gesture feedback overlay
   */
  showOverlay(config, lang) {
    if (this.overlayEl) {
      this.overlayEl.classList.remove("hidden");
      this.gestureIconEl.textContent = config.icon;
      this.gestureTextEl.textContent = config.text[lang] || config.text.en;
      if (this.holdTextEl && this.holdText) {
        this.holdTextEl.textContent = this.holdText[lang] || this.holdText.en;
      }
    }
  }

  /**
   * Hide gesture feedback overlay
   */
  hideOverlay() {
    if (this.overlayEl) {
      this.overlayEl.classList.add("hidden");
    }
    if (this.progressEl) {
      this.progressEl.style.width = "0%";
    }
  }

  /**
   * Update progress bar
   */
  updateProgress(progress) {
    if (this.progressEl) {
      this.progressEl.style.width = `${progress * 100}%`;
    }
  }

  /**
   * Enable/Disable gesture detection
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.resetGesture();
    }
  }

  /**
   * Check if manager is ready
   */
  getIsReady() {
    return this.isReady;
  }
}

// Export for use
if (typeof window !== "undefined") {
  window.GestureManager = GestureManager;
}
