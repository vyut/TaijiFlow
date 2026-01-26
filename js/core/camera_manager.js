/**
 * ============================================================================
 * TaijiFlow AI - Camera Manager
 * ============================================================================
 *
 * จัดการกล้อง, MediaPipe Pose, และ Loop การประมวลผลภาพ
 * รวม Logic การปรับ Performance Check และ Throttling ไว้ที่นี่
 *
 * @author TaijiFlow AI Team
 * @since 3.1.0
 * ============================================================================
 */

class CameraManager {
  /**
   * @param {HTMLVideoElement} videoElement
   * @param {HTMLCanvasElement} canvasElement
   * @param {Object} deps - Dependencies (uiManager, etc.)
   */
  constructor(videoElement, canvasElement, deps = {}) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.deps = deps;

    // MediaPipe Instances
    this.pose = null;
    this.camera = null;

    // State
    this.currentPerformanceMode =
      localStorage.getItem("perfMode") || "balanced";
    this.isRunning = false;

    // FPS / Stats
    this.throttleFrameCounter = 0;
    this.camFrameCount = 0;
    this.fpsFrameCount = 0; // AI FPS
    this.lastFpsTime = performance.now();
    this.currentFps = 0; // AI FPS
    this.currentCamFps = 0; // Camera FPS

    // FPS Capping
    this.lastFrameTime = 0;
    this.targetFps = 30; // Max Camera FPS

    // Callback
    this.onResultsCallback = null;
  }

  /**
   * เริ่มต้น Pose Model
   */
  initPose() {
    this.pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    // ตั้งค่า Pose Options ตาม Performance Mode ปัจจุบัน
    this.updatePoseOptions();

    // Bind Internal Callback -> User Callback
    this.pose.onResults((results) => {
      this.fpsFrameCount++; // Count AI processed frames
      if (this.onResultsCallback) {
        this.onResultsCallback(results);
      }
    });

    // Expose globally if needed (legacy compatibility)
    window.pose = this.pose;
  }

  /**
   * เริ่มต้น Camera และลูปประมวลผล
   * @param {Function} onResultsCallback - ฟังก์ชันที่จะเรียกเมื่อ AI ประมวลผลเสร็จ
   */
  async start(onResultsCallback) {
    if (onResultsCallback) {
      this.onResultsCallback = onResultsCallback;
    }

    if (!this.pose) {
      this.initPose();
    }

    // Re-create Camera instance
    this.createCameraInstance();

    try {
      await this.camera.start();
      this.isRunning = true;
      console.log("✅ CameraManager: Started successfully");
    } catch (error) {
      console.error("❌ CameraManager: Start failed", error);
      this.handleCameraError(error);
      throw error; // Re-throw for caller handling
    }
  }

  /**
   * Create MediaPipe Camera Instance with custom loop
   */
  createCameraInstance() {
    // 1. Determine target resolution
    const { width, height } = this.getTargetResolution();

    // 2. Resize Canvas (Prevents Aspect Ratio Distortion)
    if (this.canvasElement) {
      this.canvasElement.width = width;
      this.canvasElement.height = height;
    }

    // 3. Create Camera
    this.camera = new Camera(this.videoElement, {
      onFrame: async () => await this.gameLoop(),
      width: width,
      height: height,
    });
  }

  /**
   * The Main Game Loop (called by Camera on every frame)
   */
  async gameLoop() {
    try {
      const now = performance.now();
      const elapsed = now - this.lastFrameTime;
      const frameInterval = 1000 / this.targetFps;

      // FPS Capping Logic
      if (elapsed < frameInterval) {
        return; // Skip this frame
      }
      this.lastFrameTime = now - (elapsed % frameInterval); // Adjust for drift

      this.throttleFrameCounter++;
      this.camFrameCount++;

      // Update FPS Counters every 1 second
      if (now - this.lastFpsTime >= 1000) {
        this.currentFps = this.fpsFrameCount;
        this.currentCamFps = this.camFrameCount;
        this.fpsFrameCount = 0;
        this.camFrameCount = 0;
        this.lastFpsTime = now;
      }

      // Dynamic Throttling Logic
      const skipFrames = this.getSkipFramesConfig();

      // Process Frame
      if (this.throttleFrameCounter % (skipFrames + 1) === 0) {
        if (this.pose) {
          await this.pose.send({ image: this.videoElement });
        }
      }

      // Hide Loading Overlay Logic (Legacy check)
      const loadingOverlay = document.getElementById("loading-overlay");
      if (
        loadingOverlay &&
        !loadingOverlay.classList.contains("hidden") &&
        this.throttleFrameCounter > 10
      ) {
        loadingOverlay.classList.add("hidden");
      }
    } catch (error) {
      console.error("❌ CameraManager Loop Error:", error);
    }
  }

  /**
   * หยุดกล้อง
   */
  async stop() {
    if (this.camera) {
      await this.camera.stop();
    }
    this.isRunning = false;
  }

  /**
   * เปลี่ยน Performance Mode (Lite / Balanced / Quality)
   * @param {string} mode
   */
  async setPerformanceMode(mode) {
    if (mode === this.currentPerformanceMode) return;

    console.log(
      `⚡ Switching Performance Mode: ${this.currentPerformanceMode} -> ${mode}`,
    );
    this.currentPerformanceMode = mode;
    localStorage.setItem("perfMode", mode);

    // 1. Update Pose Options
    this.updatePoseOptions();

    // 2. Restart Camera (Resolution Change)
    if (this.isRunning) {
      await this.stop();
      // Show notification via deps
      if (this.deps.uiManager) {
        this.deps.uiManager.showNotification(
          `Performance Mode: ${mode}`,
          "success",
        );
      }
      this.createCameraInstance();
      await this.camera.start();
      this.isRunning = true;
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  updatePoseOptions() {
    if (!this.pose) return;

    const mode = this.currentPerformanceMode;
    const complexity = mode === "lite" ? 0 : mode === "quality" ? 2 : 1;
    const enableSmooth = mode !== "lite";

    this.pose.setOptions({
      modelComplexity: complexity,
      smoothLandmarks: enableSmooth,
      enableSegmentation: false, // Default off
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  getTargetResolution() {
    const isLite = this.currentPerformanceMode === "lite";
    return {
      width: isLite ? 640 : 1280,
      height: isLite ? 480 : 720,
    };
  }

  getSkipFramesConfig() {
    // Lite: Skip 4, Balanced: Skip 3, Quality: Skip 2
    switch (this.currentPerformanceMode) {
      case "lite":
        return 4;
      case "quality":
        return 2;
      default:
        return 3; // balanced
    }
  }

  handleCameraError(error) {
    // Forward to UI Logic (Could be refactored to use deps.uiManager directly)
    // For now, let's allow external handling via throw, or use deps if available
    if (this.deps.onCameraError) {
      this.deps.onCameraError(error);
    }
  }
}

// Global Export
window.CameraManager = CameraManager;
