/**
 * ============================================================================
 * TaijiFlow AI - Main Controller v3.0
 * ============================================================================
 *
 * ไฟล์ควบคุมหลักของแอปพลิเคชัน (Main Controller / Entry Point)
 *
 * @description
 *   ไฟล์นี้เป็น "สมอง" ของแอปพลิเคชัน ทำหน้าที่:
 *   - เชื่อมต่อ Modules ทั้งหมดเข้าด้วยกัน
 *   - จัดการ User Interactions (ปุ่ม, Dropdown, Keyboard)
 *   - ควบคุม Training Flow (เริ่ม → Calibrate → Countdown → ฝึก → สรุป)
 *   - ประมวลผลจาก MediaPipe และส่งไปยัง Heuristics Engine
 *   - บันทึกข้อมูล Session สำหรับ Export
 *
 * ============================================================================
 * Flow การทำงานหลัก
 * ============================================================================
 *
 *   1. User เลือกท่าฝึก + ระดับ
 *   2. กดปุ่ม "เริ่มการฝึก"
 *   3. ระบบ Calibrate สัดส่วนร่างกายอัตโนมัติ
 *   4. แสดง Countdown 3-2-1
 *   5. เริ่มบันทึก + วิเคราะห์ท่าทาง (5 นาที)
 *   6. สรุปผลคะแนน + Export Data
 *   7. กลับหน้าแรก
 *
 * ============================================================================
 * โครงสร้างไฟล์ (5 Sections)
 * ============================================================================
 *
 *   Section 1: Setup & Variables (บรรทัด 56-222)
 *     - DOM Elements, Manager Instances, State Variables
 *
 *   Section 2: UI Event Listeners (บรรทัด 223-1185)
 *     - ปุ่ม, Dropdown, Keyboard Shortcuts
 *     - Training Flow Functions
 *
 *   Section 3: Data Loading (บรรทัด 1186-1273)
 *     - โหลด Reference Data (Ghost, Silhouette)
 *
 *   Section 4: MediaPipe Processing (บรรทัด 1274-1571)
 *     - onResults() - ประมวลผลทุก Frame
 *
 *   Section 5: Initialization (บรรทัด 1572-1722)
 *     - เริ่มต้น Pose Model, Camera
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 1.0.0
 * @version 3.0 (New UX Flow)
 * ============================================================================
 */

// =============================================================================
// SECTION 1: SETUP & VARIABLES
// =============================================================================

// -----------------------------------------------------------------------------
// DOM Elements - อ้างอิง HTML Elements
// -----------------------------------------------------------------------------
const videoElement = document.getElementById("input_video"); // <video> สำหรับ Webcam
const canvasElement = document.getElementById("output_canvas"); // <canvas> สำหรับวาดภาพ
const canvasCtx = canvasElement.getContext("2d"); // Context สำหรับวาด
const loadingOverlay = document.getElementById("loading-overlay"); // หน้าจอ Loading
const startOverlay = document.getElementById("start-overlay"); // หน้าจอเริ่มต้น

// -----------------------------------------------------------------------------
// Manager Instances - สร้าง Instance ของแต่ละ Module
// -----------------------------------------------------------------------------
// แต่ละ Manager รับผิดชอบงานเฉพาะทาง (Single Responsibility Principle)
const engine = new HeuristicsEngine(); // วิเคราะห์ท่าทางตามหลักไท่จี๋
// 🆕 Rule Config Manager (Renamed)
window.rulesConfigManager = new RulesConfigManager(engine); // ปรับค่ากฎ (Rules Settings UI)
const calibrator = new CalibrationManager(); // ปรับเทียบสัดส่วนร่างกาย
const uiManager = new UIManager(); // จัดการ UI และภาษา
window.uiManager = uiManager; // Expose globally for other managers (e.g. FeedbackManager)
// 🆕 Debug Manager
const debugManager = new DebugManager(
  document.getElementById("debug-overlay"),
  document.getElementById("debug-content"),
);
const drawer = new DrawingManager(canvasCtx, canvasElement); // วาดภาพบน Canvas
const scorer = new ScoringManager(); // คำนวณคะแนน
const audioManager = new AudioManager(); // เสียงพูดแจ้งเตือน

// 🆕 Camera Manager
const cameraManager = new CameraManager(videoElement, canvasElement, {
  uiManager,
  onCameraError: showCameraError,
});
const gestureManager = new GestureManager(); // ควบคุมด้วยท่ามือ
const backgroundManager = new BackgroundManager(); // จัดการพื้นหลัง (Virtual Backgrounds)
const shortcutsManager = new ShortcutsManager(); // Popup คีย์ลัด (New)
const performanceMonitor = new PerformanceMonitor({
  uiManager,
  backgroundManager,
});
const lightingManager = new LightingManager(canvasElement, {
  uiManager,
  audioManager,
});

// Expose for usage if needed
window.lightingManager = lightingManager;

window.shortcutsManager = shortcutsManager; // Expose globally

// 🆕 Replay Manager
const replayManager = new ReplayManager();
let isReplayMode = false;
let replayAnimationFrameId = null;

// -----------------------------------------------------------------------------
// State Variables - ตัวแปรเก็บสถานะ
// -----------------------------------------------------------------------------
let isRecording = false; // กำลังบันทึก Session อยู่หรือไม่
let isTrainingMode = false; // อยู่ใน Training Mode หรือไม่
let currentExercise = "rh_cw"; // ท่าที่เลือก - Default: มือขวา ตามเข็ม
let currentLevel = "L1"; // ระดับที่เลือก - Default: นั่ง
let referencePath = []; // เส้นทางต้นแบบจาก JSON
let sessionLog = []; // ประวัติข้อผิดพลาด (สำหรับสรุป)
let sessionStartTime = 0; // เวลาเริ่ม Session (Unix timestamp)
let recordedSessionData = []; // ข้อมูลดิบทุก Frame (สำหรับ ML)
let currentSessionId = null; // ID ของ Session ปัจจุบัน

// -----------------------------------------------------------------------------
// Training Timer - ตัวแปรสำหรับนับเวลา
// -----------------------------------------------------------------------------
const TRAINING_DURATION_MS = 5 * 60 * 1000; // 5 นาที = 300,000 ms
let trainingTimerId = null; // ID ของ setInterval
let trainingStartTime = 0; // เวลาเริ่มฝึก

// (Lighting variables moved to LightingManager)
// -----------------------------------------------------------------------------
let segmentationEnabled = false; // 🆕 Track if segmentation has been enabled for virtual backgrounds

// -----------------------------------------------------------------------------
// Performance Optimization - ลด CPU Load & Feedback Frequency
// -----------------------------------------------------------------------------
// Setting	Checks/sec	CPU Load	Feedback Delay
// INTERVAL = 3	~10/sec	🔴 สูง	~100ms
// INTERVAL = 9	~3.3/sec	🟢 ต่ำ	~300ms
// INTERVAL = 15	~2/sec	🟢 ต่ำมาก	~500ms
//
// เช็ค Heuristics ทุก 9 frames แทนทุก frame
// ~30 FPS → ~3 FPS สำหรับ Heuristics = feedback ไม่กระพริบถี่เกินไป
const HEURISTICS_CHECK_INTERVAL = 9;
let frameCounter = 0; // สำหรับ Heuristics Check (increment ใน onResults)
let throttleFrameCounter = 0; // สำหรับ Throttling Check (increment ใน onFrame)

// -----------------------------------------------------------------------------
// Feedback Display Cooldown - ให้ feedback ค้างไว้ให้อ่านได้
// -----------------------------------------------------------------------------
const FEEDBACK_DISPLAY_COOLDOWN_MS = 3000; // 3 วินาที
let lastDisplayedFeedbacks = []; // feedback ล่าสุดที่แสดง
let lastErrorJoints = []; // 🆕 ข้อต่อที่ผิดพลาดล่าสุด (Highlight)
let lastActiveRule = null; // 🆕 กฎที่ผิดพลาดลาสุด (สำหรับเลือกสี Highlight)
let lastFeedbackDisplayTime = 0; // เวลาที่แสดง feedback ล่าสุด

// -----------------------------------------------------------------------------
// FPS Tracking - สำหรับ Debug Overlay (NFR)
// -----------------------------------------------------------------------------
let lastFpsTime = performance.now();
let fpsFrameCount = 0;
let currentFps = 0;
let camFrameCount = 0;
let currentCamFps = 0;

// (Lighting variables moved to LightingManager)

// -----------------------------------------------------------------------------
// (Performance variables moved to PerformanceMonitor)

// -----------------------------------------------------------------------------
// Fullscreen State
// -----------------------------------------------------------------------------
let isFullscreen = false; // ใช้สำหรับ Mirror canvas ใน Fullscreen

// -----------------------------------------------------------------------------
// Privacy Modal - Popup ความเป็นส่วนตัว
// -----------------------------------------------------------------------------
const privacyModal = document.getElementById("privacy-modal");
const privacyAcceptBtn = document.getElementById("privacy-accept-btn");
if (privacyAcceptBtn) {
  privacyAcceptBtn.addEventListener("click", () => {
    privacyModal.classList.add("hidden");
    // เริ่มกล้องหลังจากผู้ใช้ยินยอม Privacy Policy
    initCamera();
  });
}
// -----------------------------------------------------------------------------
// Helper Functions - ฟังก์ชันช่วยสร้าง ID และดึงข้อมูล
// -----------------------------------------------------------------------------

// Feedback Overlay Elements
const feedbackOverlay = document.getElementById("feedback-overlay");
const feedbackContent = document.getElementById("feedback-content");

/**
 * อัพเดท Feedback Overlay (HTML version - ไม่ถูก CSS mirror)
 * @param {string[]} feedbacks - Array ของข้อความ feedback
 */
function updateFeedbackOverlay(feedbacks) {
  if (!feedbackContent) return;

  if (!feedbacks || feedbacks.length === 0) {
    // ซ่อน overlay ถ้าไม่มี feedback
    if (feedbackOverlay) feedbackOverlay.classList.add("hidden");
    return;
  }

  // แสดง overlay
  if (feedbackOverlay) feedbackOverlay.classList.remove("hidden");

  // แปลง array เป็น HTML
  const html = feedbacks.map((text) => `<div>${text}</div>`).join("");

  feedbackContent.innerHTML = html;
}

/**
 * แสดง/ซ่อน Feedback Overlay
 * @param {boolean} show - true = แสดง, false = ซ่อน
 */
function toggleFeedbackOverlay(show) {
  if (!feedbackOverlay) return;
  if (show) {
    feedbackOverlay.classList.remove("hidden");
  } else {
    feedbackOverlay.classList.add("hidden");
  }
}

// -----------------------------------------------------------------------------
// NOTE: Session/User ID Functions ย้ายไปอยู่ที่ js/session_manager.js
//   - getOrCreateUserId()
//   - generateSessionId()
//   - getPlatformInfo()
//   - isMobileDevice()
// -----------------------------------------------------------------------------

// =============================================================================
// SECTION 2: UI EVENT LISTENERS
// =============================================================================

// -----------------------------------------------------------------------------
// DOM Elements - ปุ่มและ Controls ต่างๆ
// -----------------------------------------------------------------------------

// Dropdown Selects
const exerciseSelect = document.getElementById("exercise-select"); // เลือกท่าฝึก
const levelSelect = document.getElementById("level-select"); // เลือกระดับ (New UI)
const levelButtons = document.querySelectorAll(".level-btn"); // ปุ่มระดับ (Legacy)

// Action Buttons
const fullscreenBtn = document.getElementById("fullscreen-btn"); // ปุ่มเต็มจอ
const recordBtn = document.getElementById("record-btn"); // ปุ่มบันทึก (Legacy)

// Calibration Buttons
const smallCalibrateBtn = document.getElementById("small-calibrate-btn"); // ปุ่ม "วัดใหม่"
const cancelCalibBtn = document.getElementById("cancel-calib-btn"); // ปุ่มยกเลิก

// Settings Buttons
const langBtn = document.getElementById("lang-btn"); // สลับภาษา
const themeBtn = document.getElementById("theme-btn"); // สลับ Theme

// Display Dropdown Elements
const displayBtn = document.getElementById("display-btn");
const displayMenu = document.getElementById("display-menu");
const checkGhost = document.getElementById("check-ghost");
const checkInstructor = document.getElementById("check-instructor");
const checkPath = document.getElementById("check-path");
const checkSkeleton = document.getElementById("check-skeleton");
const checkSilhouette = document.getElementById("check-silhouette");
const instructorThumbnail = document.getElementById("instructor-thumbnail");
const instructorCtx = instructorThumbnail
  ? instructorThumbnail.getContext("2d")
  : null;
const checkDebug = document.getElementById("check-debug"); // 🆕 Debug Checkbox

// 🆕 Debug Toggle Listener
if (checkDebug) {
  checkDebug.addEventListener("change", (e) => {
    const isDebug = e.target.checked;
    if (engine) engine.debugMode = isDebug;
    if (debugManager) debugManager.toggle(isDebug);
  });
}

// -----------------------------------------------------------------------------
// New UX Flow Elements - ปุ่มและ Overlay สำหรับ Training Flow ใหม่
// -----------------------------------------------------------------------------
const startTrainingBtn = document.getElementById("start-training-btn"); // ปุ่มเริ่มฝึก
const stopTrainingBtn = document.getElementById("stop-training-btn"); // ปุ่มหยุดฝึก
const countdownOverlay = document.getElementById("countdown-overlay"); // Overlay 3-2-1
const countdownNumber = document.getElementById("countdown-number"); // ตัวเลขนับถอยหลัง
const trainingControls = document.getElementById("training-controls"); // กล่อง Timer ซ้ายล่าง
const trainingTimer = document.getElementById("training-timer"); // Timer Display
const trainingTimerTop = document.getElementById("training-timer"); // Timer บน Top Bar
const trainingTimerOverlay = document.getElementById("training-timer-overlay"); // Timer บน Video
const recordIndicator = document.getElementById("recordIndicator"); // สัญญาณบันทึก
const stopEarlyBtn = document.getElementById("stop-early-btn"); // ปุ่มหยุดก่อนเวลา
const fullscreenOverlayBtn = document.getElementById("fullscreen-overlay-btn"); // Container ปุ่มเต็มจอ
const videoFullscreenBtn = document.getElementById("video-fullscreen-btn"); // ปุ่มเต็มจอบน Video

// -----------------------------------------------------------------------------
// Validation Functions
// -----------------------------------------------------------------------------

// ฟังก์ชันตรวจสอบว่าเลือกท่าและระดับครบหรือยัง
function checkSelectionComplete() {
  const isComplete = currentExercise !== null && currentLevel !== null;

  // Quick Start: มี default values เสมอ จึงไม่ต้อง highlight แล้ว
  if (isComplete) {
    // Enable start button
    startTrainingBtn.disabled = false;
    startTrainingBtn.classList.remove("opacity-50", "cursor-not-allowed");
  } else {
    // Disable start button
    startTrainingBtn.disabled = true;
    startTrainingBtn.classList.add("opacity-50", "cursor-not-allowed");
  }
  return isComplete;
}

/**
 * อัปเดตสถานะปุ่ม Start/Stop
 */
function updateButtonStates(isTraining) {
  if (isTraining) {
    // Disable start, enable stop
    startTrainingBtn.disabled = true;
    startTrainingBtn.classList.add("opacity-50", "cursor-not-allowed");
    stopTrainingBtn.disabled = false;
    stopTrainingBtn.classList.remove("opacity-50", "cursor-not-allowed");
    // Update record indicator
    if (recordIndicator) {
      recordIndicator.classList.remove("idle");
      recordIndicator.classList.add("recording");
    }
  } else {
    // Enable start (if selection complete), disable stop
    checkSelectionComplete();
    stopTrainingBtn.disabled = true;
    stopTrainingBtn.classList.add("opacity-50", "cursor-not-allowed");
    // Update record indicator
    if (recordIndicator) {
      recordIndicator.classList.remove("recording");
      recordIndicator.classList.add("idle");
    }
  }
}

langBtn.addEventListener("click", () => {
  const newLang = uiManager.toggleLanguage();
  audioManager.setLanguage(newLang); // Sync เสียงพูดกับภาษา
  calibrator.setLanguage(newLang); // Sync Calibration text กับภาษา
  engine.setLang(newLang); // Sync Feedback messages กับภาษา
  langBtn.innerText = newLang === "th" ? "🇹🇭" : "🇺🇸"; // แสดงแค่ธงภาษาปัจจุบัน
});

themeBtn.addEventListener("click", () => {
  const newTheme = uiManager.toggleTheme();
  themeBtn.innerText = newTheme === "dark" ? "🌙" : "☀️"; // Toggle moon/sun icon
});

// Audio Toggle Button
const audioBtn = document.getElementById("audio-btn");
audioBtn.addEventListener("click", () => {
  const isEnabled = audioManager.toggle();
  audioBtn.innerText = isEnabled ? "🔊" : "🔇";
});

// 🆕 Auto-Adjust Light UI Sync
const checkAutoAdjust = document.getElementById("check-auto-adjust-light");
if (checkAutoAdjust) {
  // Sync initial state
  checkAutoAdjust.checked = lightingManager.isEnabled;

  // Add listener
  checkAutoAdjust.addEventListener("change", (e) => {
    lightingManager.setEnabled(e.target.checked);
  });
}

// Display Controller (extracted to display_controller.js)
const displayController = new DisplayController({
  // DOM Elements
  displayBtn,
  displayMenu,
  checkGhost,
  checkInstructor,
  checkPath,
  checkSkeleton,
  checkSilhouette,
  instructorThumbnail,

  // Managers
  ghostManager,
  uiManager, // 🆕 สำหรับ Safari Warning
  translations: TRANSLATIONS, // 🆕 สำหรับข้อความ Warning
  engine, // 🆕 For Debug Toggle
  debugManager, // 🆕 For Debug Toggle
  lightingManager, // 🆕 For Auto-Adjust Light Control
  // Note: pose จะถูก access ผ่าน window.pose ใน display_controller.js
});
window.displayController = displayController; // Expose globally for Popup Manager

// Helper: ให้ส่วนอื่นเข้าถึง display state ผ่าน displayController
// ใช้ displayController.showGhostOverlay, displayController.showPath, etc.

// เริ่มต้น UI
uiManager.init();

// -----------------------------------------------------------------------------
// Sync ภาษาจาก localStorage กับ Components อื่น
// -----------------------------------------------------------------------------
// หลังจาก uiManager.init() โหลดภาษาจาก localStorage แล้ว
// ต้อง sync กับ AudioManager, CalibrationManager และ Language
const initLang = uiManager.currentLang || "th";
langBtn.innerText = initLang === "th" ? "🇹🇭" : "🇺🇸";
audioManager.setLanguage(initLang);
calibrator.setLanguage(initLang);
engine.setLang(initLang); // Sync Feedback messages กับภาษา

// เริ่มต้น Rules Settings ตาม Default Level (L1)
if (currentLevel) {
  rulesConfigManager.onLevelChange(currentLevel);
}

// เริ่มต้น Gesture Manager (Gesture Control)
gestureManager.init().then((ready) => {
  if (ready) {
    console.log("[Main] Gesture Control พร้อมใช้งาน!");
    // uiManager.showNotification("🖐️ Gesture Control พร้อมใช้งาน", "success");
  }
});

// ผูก Callbacks สำหรับ Gesture Control
gestureManager.onStartTraining = () => {
  // ตรวจสอบว่าเลือกท่าและระดับแล้ว และยังไม่ได้ฝึกอยู่
  if (currentExercise && currentLevel && !isTrainingMode) {
    console.log("[Gesture] 👍 Starting Training via Gesture");
    startTrainingBtn.click(); // Trigger the start button
  } else if (!currentExercise || !currentLevel) {
    uiManager.showNotification("⚠️ เลือกท่าและระดับก่อน", "warning");
  }
};

gestureManager.onStopTraining = () => {
  // 1. หยุด Calibration ถ้ากำลัง Calibrate อยู่
  if (calibrator.isActive) {
    console.log("[Gesture] ✋ Cancelling Calibration via Gesture");
    calibrator.cancel();
    loadReferenceData(); // คืนค่า Path เดิม
    startOverlay.classList.remove("hidden"); // แสดง Overlay กลับมา
    // Reset button states
    startTrainingBtn.disabled = false;
    startTrainingBtn.classList.remove("opacity-50", "cursor-not-allowed");
    stopTrainingBtn.disabled = true;
    stopTrainingBtn.classList.add("opacity-50", "cursor-not-allowed");
    // ออกจาก Fullscreen ถ้าอยู่
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    audioManager.announce("calib_cancel"); // เสียงแจ้ง
    uiManager.showNotification("🛑 ยกเลิกการ Calibrate", "info");
  }
  // 2. หยุดการฝึก ถ้ากำลังฝึกอยู่
  else if (isTrainingMode) {
    console.log("[Gesture] ✋ Stopping Training via Gesture");
    stopTrainingBtn.click(); // Trigger the stop button
  }
};

// ฟังก์ชันเริ่ม Calibration (ใช้กับปุ่มเล็ก "วัดใหม่")
function startCalibration() {
  calibrator.start();
  audioManager.announce("calib_start"); // พูดแจ้งเตือน
  referencePath = []; // ซ่อน Path ชั่วคราว

  // UI Updates
  startOverlay.classList.add("hidden");
  smallCalibrateBtn.classList.add("hidden");
  cancelCalibBtn.classList.remove("hidden");
}

// ผูก Event Listeners (เฉพาะปุ่มเล็ก "วัดใหม่")
smallCalibrateBtn.addEventListener("click", startCalibration);

// ปุ่ม Cancel
cancelCalibBtn.addEventListener("click", () => {
  calibrator.cancel();
  loadReferenceData(); // คืนค่า Path เดิม

  // UI Updates
  smallCalibrateBtn.classList.remove("hidden");
  cancelCalibBtn.classList.add("hidden");
  // ไม่ต้องโชว์ Overlay ใหญ่กลับมา ให้ใช้ปุ่มเล็กแทน
});

exerciseSelect.addEventListener("change", (e) => {
  currentExercise = e.target.value || null;
  loadReferenceData();
  checkSelectionComplete();
});

// Level Select (Dropdown - New UI)
levelSelect.addEventListener("change", (e) => {
  currentLevel = e.target.value || null;
  // อัพเดท Rules Settings Panel ให้ตรงกับ Level
  if (currentLevel) {
    rulesConfigManager.onLevelChange(currentLevel);
  }
  loadReferenceData();
  checkSelectionComplete();
});

// Legacy level buttons (hidden, for compatibility)
levelButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    currentLevel = e.target.dataset.level;
    uiManager.updateLevelButtons(currentLevel);
    // อัพเดท Rules Settings Panel ให้ตรงกับ Level
    if (currentLevel) {
      rulesConfigManager.onLevelChange(currentLevel);
    }
    loadReferenceData();
    checkSelectionComplete();
  });
});

// =============================================================================
// REPLAY MODE LOGIC
// =============================================================================

// UI Elements
const btnLoadReplay = document.getElementById("btn-load-replay");
const replayInput = document.getElementById("replay-upload-input");
const replayOverlay = document.getElementById("replay-control-overlay");
const replayTimeCurrent = document.getElementById("replay-time-current");
const replayTimeTotal = document.getElementById("replay-time-total");
const replayTimeline = document.getElementById("replay-timeline");
const replayBtnPlay = document.getElementById("replay-btn-play");
const replayBtnPrev = document.getElementById("replay-btn-prev");
const replayBtnNext = document.getElementById("replay-btn-next");
const replaySpeedBtn = document.getElementById("replay-speed-btn");
const replayBtnClose = document.getElementById("replay-btn-close");

// Event Listeners
if (btnLoadReplay) {
  btnLoadReplay.addEventListener("click", () => replayInput.click());
}

if (replayInput) {
  replayInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show loading
    uiManager.showNotification("Loading Replay...", "info");

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = replayManager.load(event.target.result);
      if (result.success) {
        uiManager.showNotification(`✅ Loaded: ${file.name}`, "success");
        // Enter Replay Mode
        startReplayMode();
        // Auto Play
        replayManager.play();
        updateReplayUIState();
      } else {
        uiManager.showNotification(`❌ Error: ${result.message}`, "error");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  });
}

// Controls
if (replayBtnPlay) {
  replayBtnPlay.addEventListener("click", () => {
    if (replayManager.isPlaying) replayManager.pause();
    else replayManager.play();
    updateReplayUIState();
  });
}

if (replayTimeline) {
  replayTimeline.addEventListener("input", (e) => {
    // User dragging: pause first
    // replayManager.pause();
    const percent = parseFloat(e.target.value);
    const duration = replayManager.totalDuration || 1; // Prevent NaN
    const time = (percent / 100) * duration;
    replayManager.seek(time);
    updateReplayUIState();
  });
}

if (replaySpeedBtn) {
  let speeds = [0.5, 1.0, 2.0];
  let speedIdx = 1;
  replaySpeedBtn.addEventListener("click", () => {
    speedIdx = (speedIdx + 1) % speeds.length;
    const s = speeds[speedIdx];
    replayManager.setSpeed(s);
    replaySpeedBtn.innerText = s + "x";
  });
}

if (replayBtnClose) {
  replayBtnClose.addEventListener("click", () => stopReplayMode());
}

if (replayBtnPrev)
  replayBtnPrev.addEventListener("click", () =>
    replayManager.seek(replayManager.currentTime - 5),
  );
if (replayBtnNext)
  replayBtnNext.addEventListener("click", () =>
    replayManager.seek(replayManager.currentTime + 5),
  );

function updateReplayUIState() {
  replayBtnPlay.innerHTML = replayManager.isPlaying ? "⏸️" : "▶️";
}

function startReplayMode() {
  if (isReplayMode) return;
  isReplayMode = true;

  // 1. Stop Camera
  if (cameraManager && cameraManager.camera) {
    // cameraManager has no explicit stop in public API?
    // We can just stop the video or hide it.
    // Actually best to just not render the camera frame, but keep it running to avoid warmup delay?
    // Or stop to save battery. Let's stop.
    // Assuming camera_utils camera.stop() exists.
    // If not, we just hide video.
    videoElement.pause();
  }

  // 2. UI Updates
  replayOverlay.classList.remove("hidden");
  startOverlay.classList.add("hidden");
  // Hide default controls
  startTrainingBtn.classList.add("hidden");
  stopTrainingBtn.classList.add("hidden");
  if (btnLoadReplay) btnLoadReplay.classList.add("hidden");

  // 3. Start Loop
  replayManager.play(); // Auto-start
  loopReplay();
}

function stopReplayMode() {
  if (!isReplayMode) return;
  isReplayMode = false;

  // 1. Stop Loop
  if (replayAnimationFrameId) cancelAnimationFrame(replayAnimationFrameId);
  replayManager.pause();

  // 2. Resume Camera
  videoElement.play();

  // 3. UI Updates
  replayOverlay.classList.add("hidden");

  // Restore Start Overlay if not recording/trained
  if (!isRecording && !isTrainingMode) {
    if (startOverlay) startOverlay.classList.remove("hidden");
  }

  startTrainingBtn.classList.remove("hidden");
  stopTrainingBtn.classList.remove("hidden");
  if (btnLoadReplay) btnLoadReplay.classList.remove("hidden");

  // Custom: Ensure Camera is Mirrored (Restoring User Preference)
  displayController.setMirrorMode(true);
  const mirrorCheck = document.getElementById("check-mirror");
  if (mirrorCheck) mirrorCheck.checked = true;

  // Clear Canvas
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

function loopReplay() {
  if (!isReplayMode) return;

  // 1. Update Manager
  const data = replayManager.update();

  // 2. Render
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Black background for replay
  canvasCtx.fillStyle = "#111";
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  if (data) {
    // Draw Skeleton
    if (data.landmarks) {
      drawer.drawSkeleton(
        data.landmarks,
        data.error_joints || [], // Pass recorded error joints
        displayController.skeletonColor,
        false,
        true, // 🛑 FORCE MIRROR MODE (Always true for replay)
        null, // activeRule (Replay doesn't save rule name individually yet, or use data if available)
        {
          style: displayController.highlightStyle,
          scope: displayController.highlightScope,
          opacity: displayController.highlightOpacity,
        },
      );
    }

    // Draw Feedbacks (Synchronized)
    if (data.feedbacks && data.feedbacks.length > 0) {
      updateFeedbackOverlay(data.feedbacks);
    } else {
      updateFeedbackOverlay([]);
    }

    // Update Timeline UI
    const duration = data.duration || 1;
    // Prevent NaN
    if (!isNaN(data.timestamp) && !isNaN(duration) && duration > 0) {
      const percent = (data.timestamp / duration) * 100;
      if (document.activeElement !== replayTimeline) {
        replayTimeline.value = percent;
      }
      replayTimeCurrent.innerText = TimeUtils.formatTime(data.timestamp * 1000);
      replayTimeTotal.innerText = TimeUtils.formatTime(duration * 1000);
    }

    if (!data.isPlaying && Math.abs(data.progress - 1) < 0.01) {
      updateReplayUIState(); // End reached
    }
  }

  replayAnimationFrameId = requestAnimationFrame(loopReplay);
}

// =============================================================================
// TRAINING FLOW FUNCTIONS (New UX)
// =============================================================================
//
// Flow: เลือกท่า → เริ่มฝึก → Calibrate → Countdown → บันทึก 5 นาที → สรุปผล
//
// Functions:
//   - showCountdown()                  : แสดง 3-2-1
//   - formatTime()                     : แปลง ms เป็น mm:ss
//   - updateTrainingTimer()            : อัปเดต Timer Display
//   - startTrainingFlow()              : เริ่ม Training (รวม Calibrate)
//   - startTrainingAfterCalibration()  : เริ่มหลัง Calibrate เสร็จ
//   - endTrainingSession()             : จบ Session + สรุปผล
//   - resetToHomeScreen()              : Reset กลับหน้าแรก
// =============================================================================

/**
 * แสดง Countdown 3-2-1 ก่อนเริ่มบันทึก
 *
 * @description
 *   แสดง Overlay พร้อมตัวเลขนับถอยหลัง 3, 2, 1
 *   ใช้ Smart Wait (waitForIdle) เพื่อให้เสียงไม่ตีกัน
 *
 * @returns {Promise} Resolves เมื่อนับถอยหลังเสร็จ + เสียงพูดจบ
 */
function showCountdown() {
  const countdownOverlay = document.getElementById("countdown-overlay");
  const countdownNumber = document.getElementById("countdown-number");

  const exerciseText = audioManager.getExerciseSpokenText(
    currentExercise,
    currentLevel,
  );

  return TimeUtils.startCountdown(countdownOverlay, countdownNumber, {
    audioManager,
    exerciseText,
  });
}

/**
 * อัปเดต Timer Display
 */
function updateTrainingTimer() {
  const elapsed = Date.now() - trainingStartTime;
  const remaining = Math.max(0, TRAINING_DURATION_MS - elapsed);
  // Update both timers
  if (trainingTimerTop)
    trainingTimerTop.textContent = TimeUtils.formatTime(remaining);
  if (trainingTimerOverlay)
    trainingTimerOverlay.textContent = TimeUtils.formatTime(remaining);

  if (remaining <= 0) {
    endTrainingSession();
  }
}

// -----------------------------------------------------------------------------
// NOTE: generateDynamicPath() ย้ายไปอยู่ที่ js/path_generator.js แล้ว
// -----------------------------------------------------------------------------

/**
 * เริ่ม Training Session (Calibrate ทุกครั้ง)
 *
 * หมายเหตุ: รองรับ PWA Standalone Mode (Add to Home Screen)
 * - iOS Safari PWA ไม่รองรับ Fullscreen API
 * - ใช้ feature detection และ timeout fallback
 */
async function startTrainingFlow() {
  // Random Exercise Logic (Surprise Me!)
  if (currentExercise === "random") {
    const exercises = ["rh_cw", "rh_ccw", "lh_cw", "lh_ccw"];
    const randomIndex = Math.floor(Math.random() * exercises.length);
    currentExercise = exercises[randomIndex];

    // Update UI and Data
    exerciseSelect.value = currentExercise;
    // Notify user of the choice (Small delay to let them see it before fullscreen)
    uiManager.showNotification(
      `🎲 Random Selected: ${uiManager.getText("ex_" + currentExercise)}`,
      "info",
    );
    // await new Promise((r) => setTimeout(r, 800)); // Delay removed to fix "Double Click" issue
    await loadReferenceData();
  }

  // 1. ซ่อน Overlay คำแนะนำ
  startOverlay.classList.add("hidden");

  // 2. เริ่ม Calibrate (กำหนด Level ก่อน เพื่อ visibility requirement)
  calibrator.setLevel(currentLevel); // L1-L2 ไม่ต้องเห็นข้อเท้า, L3 ต้องเห็นทั้งตัว
  calibrator.start();
  sessionStartTime = Date.now(); // เริ่มนับเวลาสำหรับ Startup Delay
  audioManager.announce("calib_start");

  // 3. อัปเดตสถานะปุ่ม: Disable Start, Enable Stop
  startTrainingBtn.disabled = true;
  startTrainingBtn.classList.add("opacity-50", "cursor-not-allowed");
  stopTrainingBtn.disabled = false;
  stopTrainingBtn.classList.remove("opacity-50", "cursor-not-allowed");

  // รอ Calibration เสร็จ (callback จะเรียก startTrainingAfterCalibration)
}

/**
 * เริ่ม Training หลังจาก Calibration เสร็จ
 */
async function startTrainingAfterCalibration() {
  // 1. Countdown 3-2-1 (ใน Fullscreen)
  await showCountdown();

  // 2. เริ่มบันทึก
  isTrainingMode = true;
  isRecording = true;
  sessionStartTime = Date.now();
  trainingStartTime = Date.now();
  currentSessionId = generateSessionId();
  sessionLog = [];
  recordedSessionData = [];
  scorer.start(); // เริ่มนับคะแนน (reset + set startTime)

  audioManager.announce("record_start");
  uiManager.updateRecordButtonState(true);

  // 4. อัปเดตสถานะปุ่ม (Start disabled, Stop enabled)
  updateButtonStates(true);

  // 5. แสดง Timer (ซ้ายล่าง)
  trainingControls.classList.remove("hidden");
  const timeStr = TimeUtils.formatTime(TRAINING_DURATION_MS);
  if (trainingTimerTop) trainingTimerTop.textContent = timeStr;
  if (trainingTimerOverlay) trainingTimerOverlay.textContent = timeStr;

  // 6. แสดงปุ่มเต็มจอ (ขวาล่าง)
  fullscreenOverlayBtn.classList.remove("hidden");

  // 6. เริ่ม Timer
  trainingTimerId = setInterval(updateTrainingTimer, 1000);
}

/**
 * สิ้นสุด Training Session
 */
function endTrainingSession() {
  if (!isTrainingMode) return;

  // 1. หยุด Timer
  if (trainingTimerId) {
    clearInterval(trainingTimerId);
    trainingTimerId = null;
  }

  // 2. ออกจากโหมด Training
  isTrainingMode = false;
  isRecording = false;
  audioManager.announce("record_stop");

  // 3. ซ่อน Training Controls และปุ่มเต็มจอ
  trainingControls.classList.add("hidden");
  trainingControls.classList.remove("flex");
  fullscreenOverlayBtn.classList.add("hidden");

  // 3.1 ซ่อน HTML overlays
  toggleFeedbackOverlay(false);
  debugManager.toggle(false); // Use debugManager to hide debug overlay

  // 3.2 หยุด Ghost playback
  if (typeof ghostManager !== "undefined" && ghostManager.isPlaying) {
    ghostManager.stop();
  }

  // 3.3 รีเซ็ต Rules Config ให้กลับเป็นค่าเริ่มต้น
  if (typeof rulesConfigManager !== "undefined") {
    rulesConfigManager.resetToDefaults();
  }

  // 4. ออกจาก Fullscreen
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  // 5. สรุปคะแนนและ Export Data (wrap ใน try-catch เพื่อไม่ให้ crash)
  try {
    const summary = scorer.getSummary();
    const grade = ScoringManager.getGrade(summary.score, uiManager.currentLang);

    // Export Data (ถ้ามีข้อมูล)
    if (recordedSessionData.length > 0) {
      const fullDataset = {
        meta: {
          user_id: getOrCreateUserId(),
          session_id: currentSessionId,
          exercise: currentExercise,
          level: currentLevel,
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: getPlatformInfo(),
          total_frames: recordedSessionData.length,
          fps_estimated:
            recordedSessionData.length /
            ((Date.now() - sessionStartTime) / 1000),
        },
        score_summary: { ...summary, grade: grade.label },
        all_errors: sessionLog,
        frames: recordedSessionData,
      };
      // Export เฉพาะบน Desktop (Mobile/Tablet มี memory จำกัด ทำให้วิดีโอค้าง)
      if (!isMobileDevice()) {
        DataExporter.exportFullSession(fullDataset);
      } else {
        console.log(
          "[Export] Skipped on mobile device to prevent memory issues",
        );
      }
    }

    // แสดง Score Popup (ใช้ ScorePopupManager แยกไฟล์)
    scorePopupManager.show(summary, grade, uiManager.currentLang);
    uiManager.showNotification(
      `${uiManager.getText("alert_data_saved")} (${
        summary.totalFrames
      } frames)`,
      "success",
    );

    // 🆕 Instant Replay Handler
    const replayBtn = document.getElementById("btn-instant-replay");
    if (replayBtn && recordedSessionData.length > 0) {
      replayBtn.addEventListener("click", () => {
        console.log("🎬 Instant Replay Clicked");
        // 1. Close Popup
        // Use the close button's ID to trigger close logic properly or remove element
        const closeBtn = document.getElementById("close-x-btn-score");
        if (closeBtn) closeBtn.click();

        // 2. Prepare Data (Reuse fullDataset if possible, or create on fly)
        // Since fullDataset scope is limited, we reconstruct a simple version or use recordedSessionData
        // ReplayManager can handle raw frames + meta
        const replayData = {
          frames: recordedSessionData,
          meta: {
            exercise: currentExercise,
            level: currentLevel,
            timestamp: new Date().toISOString(),
          },
        };

        // 3. Load & Start
        const loadResult = replayManager.load(replayData);
        if (loadResult && loadResult.success === false) {
          console.error("Instant Replay Load Failed:", loadResult.message);
          uiManager.showNotification("Replay Failed", "error");
        } else {
          // 🛑 Cancel the auto-reset to home screen
          if (window.resetTimeoutId) {
            clearTimeout(window.resetTimeoutId);
            window.resetTimeoutId = null;
          }
          // 🛑 FORCE MIRROR MODE for Instant Replay
          if (window.displayController)
            window.displayController.setMirrorMode(true);
          const mirrorCheck = document.getElementById("check-mirror");
          if (mirrorCheck) mirrorCheck.checked = true;

          startReplayMode();
        }
      });
    }
  } catch (error) {
    console.error("Error in endTrainingSession:", error);
    // ยังคงแสดง notification แจ้งเตือน
    uiManager.showNotification("เกิดข้อผิดพลาดในการสรุปผล", "warning", 3000);
  }

  // 6. Reset UI และกลับหน้าแรก (เรียกเสมอ ไม่ว่าจะมี error หรือไม่)
  // Store timeout ID globally (or on window) to allow cancellation
  if (window.resetTimeoutId) clearTimeout(window.resetTimeoutId);
  window.resetTimeoutId = setTimeout(() => {
    resetToHomeScreen();
  }, 3000);
}

/**
 * กลับไปหน้าแรก (Reset การเลือก)
 */
function resetToHomeScreen() {
  // Reset State - ใช้ค่า Default แทน null
  currentExercise = "rh_cw";
  currentLevel = "L1";
  referencePath = [];

  // Reset UI - ใช้ค่า Default
  exerciseSelect.value = "rh_cw";
  if (levelSelect) levelSelect.value = "L1";

  // Reset button states
  updateButtonStates(false);

  // Reset timers
  if (trainingTimerTop) trainingTimerTop.textContent = "00:00";
  if (trainingTimerOverlay) trainingTimerOverlay.textContent = "5:00";

  // Reset Display Options to defaults (via DisplayController)
  displayController.resetToDefaults();

  // Reset Debug Mode
  if (typeof engine !== "undefined") {
    engine.setDebugMode(false);
  }
  const debugCheckbox = document.getElementById("check-debug");
  if (debugCheckbox) debugCheckbox.checked = false;
  debugManager.toggle(false); // Use debugManager to hide debug overlay

  // Reset Rules Settings to defaults
  if (typeof rulesManager !== "undefined") {
    rulesManager.resetToDefaults();
  }

  // Clear Instructor Thumbnail canvas
  if (instructorCtx && instructorThumbnail) {
    instructorCtx.clearRect(
      0,
      0,
      instructorThumbnail.width,
      instructorThumbnail.height,
    );
  }

  startOverlay.classList.remove("hidden");
  uiManager.updateRecordButtonState(false);
}

// Event Listener สำหรับปุ่มเริ่มการฝึก
startTrainingBtn.addEventListener("click", () => {
  if (!isTrainingMode) {
    startTrainingFlow();
  }
});

// Event Listener สำหรับปุ่มหยุดการฝึก (Separate button)
stopTrainingBtn.addEventListener("click", () => {
  // 1. หยุด Calibration ถ้ากำลัง Calibrate อยู่
  if (calibrator.isActive) {
    console.log("[Stop] ✋ Cancelling Calibration via Stop Button");
    calibrator.cancel();
    loadReferenceData();
    startOverlay.classList.remove("hidden");
    // Reset button states
    startTrainingBtn.disabled = false;
    startTrainingBtn.classList.remove("opacity-50", "cursor-not-allowed");
    stopTrainingBtn.disabled = true;
    stopTrainingBtn.classList.add("opacity-50", "cursor-not-allowed");
    // ออกจาก Fullscreen ถ้าอยู่
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    audioManager.announce("calib_cancel"); // เสียงแจ้ง
    uiManager.showNotification("🛑 ยกเลิกการ Calibrate", "info");
  }
  // 2. หยุดการฝึก ถ้ากำลังฝึกอยู่
  else if (isTrainingMode) {
    endTrainingSession();
  }
});

// -----------------------------------------------------------------------------
// Fullscreen: ใช้ canvas-container แทน canvas เพื่อให้ overlay แสดงด้วย
// -----------------------------------------------------------------------------
const canvasContainer = document.querySelector(".canvas-container");

// Video Fullscreen Button (ปุ่ม Overlay บนวิดีโอ)
videoFullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    canvasContainer.requestFullscreen().catch((err) => {
      console.warn("Fullscreen error:", err);
    });
  } else {
    document.exitFullscreen();
  }
});

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    canvasContainer.requestFullscreen().catch((err) => {
      console.error(`Error enabling fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});

// Fullscreen change listener - ตรวจจับเมื่อเข้า/ออก fullscreen
document.addEventListener("fullscreenchange", () => {
  isFullscreen = !!document.fullscreenElement;
  console.log(`Fullscreen: ${isFullscreen}`);

  // อัปเดต Fullscreen Button Text ตามสถานะ
  const btnText = document.getElementById("fullscreen-btn-text");
  if (btnText) {
    const lang = uiManager?.currentLang || "th";
    if (isFullscreen) {
      btnText.textContent = TRANSLATIONS[lang]?.fullscreen_exit || "จอปกติ";
    } else {
      // เมื่อออก fullscreen: แสดง "เต็มจอ"
      btnText.textContent = TRANSLATIONS[lang]?.fullscreen_overlay || "เต็มจอ";
    }
  }
});

// -----------------------------------------------------------------------------
// Stop Training Overlay Button (ปุ่มหยุดบน Video Overlay)
// -----------------------------------------------------------------------------
const stopOverlayBtn = document.getElementById("stop-training-overlay-btn");
if (stopOverlayBtn) {
  stopOverlayBtn.addEventListener("click", () => {
    if (isTrainingMode) {
      endTrainingSession();
    }
  });
}

recordBtn.addEventListener("click", () => {
  isRecording = !isRecording;

  if (isRecording) {
    // --- เริ่มต้นการฝึก ---
    uiManager.updateRecordButtonState(true);
    audioManager.announce("record_start"); // พูดแจ้งเตือน

    // Reset Data
    sessionLog = [];
    recordedSessionData = [];
    sessionStartTime = Date.now();
    currentSessionId = generateSessionId(); // สร้าง Session ID ใหม่
    scorer.start(); // เริ่มนับคะแนน
    console.log(`Session Started: ${currentSessionId}`);
  } else {
    // --- จบการฝึก ---
    uiManager.updateRecordButtonState(false);
    audioManager.announce("record_stop"); // พูดแจ้งเตือน

    // หยุดและดึงข้อมูลคะแนน
    const scoreSummary = scorer.stop();
    const gradeInfo = ScoringManager.getGrade(
      scoreSummary.score,
      uiManager.currentLang,
    );

    // รวบรวมข้อมูลและส่งให้ Exporter จัดการ
    if (recordedSessionData.length > 0) {
      const fullDataset = {
        // === ข้อมูลระบุตัวตน (Identification) ===
        user_id: getOrCreateUserId(),
        session_id: currentSessionId,

        // === Metadata ===
        meta: {
          date: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          exercise: currentExercise,
          level: currentLevel,
          user_calibration: engine.calibrationData,
          platform: getPlatformInfo(),
          thresholds: engine.CONFIG,
        },

        // === สรุปผล (Summary) ===
        summary: {
          duration_seconds: scoreSummary.durationSeconds,
          total_frames: scoreSummary.totalFrames,
          fps_estimated: Math.round(
            scoreSummary.totalFrames / scoreSummary.durationSeconds,
          ),
          total_issues: sessionLog.length,
          issue_log: sessionLog,
        },

        // === คะแนน (Scoring) ===
        scoring: {
          score: scoreSummary.score,
          grade: gradeInfo.grade,
          correct_frames: scoreSummary.correctFrames,
          error_frames: scoreSummary.errorFrames,
          top_errors: scoreSummary.topErrors,
          all_errors: scoreSummary.allErrors,
        },

        // === ข้อมูลดิบ (Raw Data) ===
        raw_data: recordedSessionData,
      };
      // Export เฉพาะบน Desktop (Mobile/Tablet มี memory จำกัด ทำให้วิดีโอค้าง)
      if (!isMobileDevice()) {
        DataExporter.exportFullSession(fullDataset);
      } else {
        console.log(
          "[Export] Skipped on mobile device to prevent memory issues",
        );
      }

      // แสดงผลคะแนน (ใช้ ScorePopupManager แยกไฟล์)
      scorePopupManager.show(scoreSummary, gradeInfo, uiManager.currentLang);
      uiManager.showNotification(
        `${uiManager.getText("alert_data_saved")} (${
          scoreSummary.totalFrames
        } frames)`,
        "success",
      );
    } else {
      uiManager.showNotification(uiManager.getText("alert_no_data"), "warning");
    }
  }
});

// --- Keyboard Shortcuts (extracted to keyboard_controller.js) ---
const keyboardController = new KeyboardController({
  // DOM Elements
  fullscreenBtn,
  audioBtn,
  langBtn,
  themeBtn,
  checkGhost,
  checkPath,
  checkSkeleton,
  checkSilhouette,
  // checkTrail ถูกจัดการใน displayController แล้ว
  startTrainingBtn,
  stopTrainingBtn,
  startOverlay,

  // Managers
  engine,
  calibrator,
  uiManager,
  tutorialManager,
  displayController, // เพิ่มสำหรับ toggleInstructor และ showInstructor
  backgroundManager, // เพิ่มสำหรับ toggle blur background (Key B)
  debugManager, // Pass debugManager

  // Functions
  // toggleDebugOverlay, // Removed, now handled by debugManager
  loadReferenceData,
  resetToHomeScreen,

  // State getters (functions เพื่อให้ได้ค่าล่าสุด)
  currentExercise: () => currentExercise,
  currentLevel: () => currentLevel,
  isTrainingMode: () => isTrainingMode,
});

// =============================================================================
// SECTION 3: DATA LOADING
// =============================================================================
//
// โหลด Reference Path จากไฟล์ JSON
// ไฟล์อยู่ใน folder: data/{exercise}_{level}.json
// ตัวอย่าง: data/rh_cw_L2.json = มือขวา ตามเข็ม ระดับ 2
// =============================================================================

let referenceDataLoaded = false; // สถานะการโหลด Reference Data

/**
 * โหลด Reference Path Data
 *
 * @description
 *   โหลดข้อมูลเส้นทางต้นแบบจากไฟล์ JSON
 *   ใช้สำหรับเปรียบเทียบกับท่าทางของผู้ฝึก
 *
 *   โครงสร้างไฟล์ JSON:
 *   [
 *     { "landmarks": [{ x, y, z, visibility }, ...] },
 *     ...
 *   ]
 *
 *   ดึงเฉพาะตำแหน่ง Wrist (index 16) มาสร้าง Path
 */
async function loadReferenceData() {
  // ถ้ายังไม่ได้เลือกท่าหรือระดับ ไม่ต้องโหลด
  // ถ้ายังไม่ได้เลือกท่าหรือระดับ ไม่ต้องโหลด
  if (!currentExercise || !currentLevel) {
    referencePath = [];
    referenceDataLoaded = false;
    return; // ไม่แสดง Error
  }

  // Random Mode: ไม่ต้องโหลดข้อมูล (จะโหลดจริงตอน Start)
  if (currentExercise === "random") {
    referencePath = [];
    referenceDataLoaded = true; // Pretend loaded so start button works
    console.log("🎲 Random mode selected. Waiting for start.");
    return;
  }

  const filename = `data/${currentExercise}_${currentLevel}.json`;
  console.log(`Loading reference data from: ${filename}`);

  try {
    const response = await fetch(filename);
    if (!response.ok) throw new Error("File not found");
    const data = await response.json();

    // ตรวจสอบว่าข้อมูลมี format ถูกต้อง
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid data format");
    }

    // หมายเหตุ: referencePath ไม่ได้โหลดจาก JSON แล้ว
    // ใช้ generateDynamicPath() สร้างจากสัดส่วนผู้ฝึกแทน

    // โหลด full skeleton data เข้า Ghost Manager
    ghostManager.load(data);

    // โหลด silhouette video (ถ้ามี)
    const silhouetteUrl = `data/${currentExercise}_${currentLevel}_silhouette.webm`;
    await ghostManager.loadSilhouetteVideo(silhouetteUrl);

    referenceDataLoaded = true;
    console.log(`✅ Loaded Ghost + Silhouette data.`);

    // ถ้า Ghost checkbox เปิดอยู่ ให้ restart ghost playback
    if (displayController.showGhostOverlay) {
      ghostManager.start();
    }
  } catch (error) {
    console.warn("⚠️ Reference data not found:", error.message);
    referencePath = [];
    referenceDataLoaded = false;

    // แสดง Notification แจ้งผู้ใช้
    const exerciseNames = {
      rh_cw: "มือขวา-ตามเข็ม",
      rh_ccw: "มือขวา-ทวนเข็ม",
      lh_cw: "มือซ้าย-ตามเข็ม",
      lh_ccw: "มือซ้าย-ทวนเข็ม",
    };
    const exerciseName = exerciseNames[currentExercise] || currentExercise;

    const isThaiLang = uiManager.currentLang === "th";
    const msg = isThaiLang
      ? `⚠️ ไม่พบข้อมูลต้นแบบสำหรับ ${exerciseName} (${currentLevel})`
      : `⚠️ No reference data for ${currentExercise} (${currentLevel})`;

    uiManager.showNotification(msg, "warning", 5000);
  }
}

// =============================================================================
// SECTION 4: MEDIAPIPE PROCESSING
// =============================================================================
//
// onResults() - ฟังก์ชันหลักที่ถูกเรียกทุก Frame (~30 FPS)
// รับ Pose Landmarks จาก MediaPipe แล้วประมวลผล
//
// Flow ภายใน onResults:
//   1. Gesture Detection (ควบคุมด้วยท่ามือ)
//   2. วาด Video Frame ลง Canvas
//   3. ถ้ากำลัง Calibrate → วาด Skeleton + Calibration Overlay
//   4. ถ้า Normal Mode → วาด Path + Skeleton + วิเคราะห์ท่าทาง
//   5. ถ้ากำลัง Recording → เก็บข้อมูลลง recordedSessionData
// =============================================================================

/**
 * MediaPipe onResults Callback
 *
 * @description
 *   ฟังก์ชันหลักที่ถูกเรียกทุก Frame จาก MediaPipe Pose
 *   ทำหน้าที่:
 *   - วาดภาพ Video + Skeleton ลง Canvas
 *   - วิเคราะห์ท่าทางด้วย Heuristics Engine
 *   - บันทึกข้อมูล Session
 *
 * @param {Object} results - ผลลัพธ์จาก MediaPipe Pose
 *   @param {ImageData} results.image - ภาพจาก Webcam
 *   @param {Array} results.poseLandmarks - พิกัด 33 จุดบนร่างกาย
 */
async function onResults(results) {
  // 🐛 DEBUG: Check if segmentation mask exists
  if (!window._segmentationDebugLogged) {
    console.log("🐛 DEBUG - Results object keys:", Object.keys(results));
    console.log("🐛 DEBUG - Has segmentationMask?", !!results.segmentationMask);
    console.log("🐛 DEBUG - Pose options should have enableSegmentation: true");
    window._segmentationDebugLogged = true;
  }
  const timestamp = performance.now();

  // -------------------------------------------------------------------------
  // FPS Calculation - คำนวณทุก 1 วินาที
  // -------------------------------------------------------------------------
  fpsFrameCount++;
  const elapsed = timestamp - lastFpsTime;
  if (elapsed >= 1000) {
    currentFps = Math.round((fpsFrameCount * 1000) / elapsed);
    fpsFrameCount = 0;
    lastFpsTime = timestamp;
  }

  // 🆕 Low FPS Warning (Visual Effects)
  // 🆕 Performance Check using Monitor
  performanceMonitor.check(cameraManager.currentFps);

  // Gesture Detection - ตรวจจับท่ามือสำหรับควบคุม UI
  if (gestureManager.getIsReady() && videoElement.readyState >= 2) {
    gestureManager.detectGestures(
      videoElement,
      timestamp,
      uiManager.currentLang,
    );
  }

  canvasCtx.save(); // บันทึกสถานะ
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // ล้างภาพก่อน

  // Draw Video
  // หมายเหตุ: Webcam ส่งภาพแบบ mirror มาแล้ว เวลาปกติ
  // หมายเหตุ: CSS scaleX(-1) บน canvas ทำ mirror อยู่แล้ว
  // ใน Fullscreen (canvas-container) CSS นี้ยังคงทำงาน
  // ดังนั้นไม่ต้อง mirror เพิ่มใน JS

  // 🆕 Lighting Manager Update (Auto-Brightness & Warnings)
  try {
    lightingManager.update(results, calibrator.isActive);
  } catch (e) {
    console.error("LightingManager Error:", e);
  }

  // 🆕 Replay Mode Guard
  if (isReplayMode) return;

  // วาดภาพ (Clean Draw)
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height,
  );

  // DrawingManager: mirrorDisplay = false เพราะ landmarks ก็ตรงกับภาพ webcam อยู่แล้ว

  if (results.poseLandmarks) {
    // มีข้อมูล landmarks
    if (calibrator.isActive) {
      // กำลังปรับเทียบ
      drawer.drawSkeleton(results.poseLandmarks);

      const calibResult = calibrator.process(results.poseLandmarks);
      calibrator.drawOverlay(
        canvasCtx,
        canvasElement.width,
        canvasElement.height,
      );

      if (calibResult && calibResult.status === "complete") {
        // Calibration สำเร็จ → บันทึกและเริ่มฝึก
        // หมายเหตุ: Low Light check ทำไปแล้วระหว่าง Calibration (ถ้าแสงไม่พอจะเตือนไปแล้ว)
        engine.setCalibration(calibResult.data);
        // calibrator.saveToStorage(); // Commented out: Unused legacy storage (Diagram updated)
        audioManager.announce("calib_success"); // พูดแจ้งเตือน

        // ใช้ข้อความจาก uiManager
        uiManager.showNotification(
          uiManager.getText("alert_calib_success"),
          "success",
        );

        // Reset UI
        loadReferenceData();
        smallCalibrateBtn.classList.remove("hidden");
        cancelCalibBtn.classList.add("hidden");

        // ถ้าเลือกท่าและระดับครบแล้ว → เริ่ม Training อัตโนมัติ
        // หมายเหตุ: Dynamic Path จะสร้างในเฟรมแรกของการฝึก (ไม่ใช่ตอน calibrate)
        if (currentExercise && currentLevel) {
          startTrainingAfterCalibration();
        }
      }
    } else {
      // Normal Mode

      // 0.2 🆕 Virtual Background (Merged: Blur, Virtual, Silhouette)
      // ใช้ BackgroundManager จัดการทั้งหมดทีเดียว (ไม่แยก if/else แล้ว)
      if (results.segmentationMask) {
        backgroundManager.drawBackground(
          canvasCtx,
          results.segmentationMask,
          results.image,
          drawer.canvasWidth,
          drawer.canvasHeight,
        );
      }

      // 🆕 0.5 วาด Grid Overlay (ถ้าเปิดใช้งาน)
      // 🆕 0.5 วาด Grid Overlay (ถ้าเปิดใช้งาน)
      if (displayController.showGrid) {
        // ใช้ค่าจาก Settings (Size, Color, Opacity)
        drawer.drawGrid(
          displayController.gridColor,
          displayController.gridOpacity,
          displayController.gridSize,
        );
      }

      // 1. วาด Ghost (เงาคนสอน) ถ้าเปิดใช้งาน (วาดก่อน Grid หรือหลังก็ได้ แต่วาดหลัง Grid จะเห็นชัดกว่า)
      // 1. วาด Ghost (เงาคนสอน) -- MAIN OVERLAY
      // ถ้าเปิดโหมด Side-by-Side เราจะไม่วาด Ghost ทับวิดีโอหลัก (ให้ดูจอแยกแทน)
      if (
        displayController.showGhostOverlay &&
        ghostManager.isPlaying &&
        !displayController.isSideBySide
      ) {
        ghostManager.update(); // อัปเดต frame

        // Priority: Silhouette Video > Ghost Skeleton
        const silhouetteVideo = ghostManager.getSilhouetteVideo();
        if (silhouetteVideo) {
          // มี silhouette video - วาดเงา
          drawer.drawSilhouetteVideo(
            silhouetteVideo,
            ghostManager.opacity,
            displayController.ghostColor,
          );
        } else {
          // ไม่มี silhouette video - ใช้ skeleton แทน
          const ghostLandmarks = ghostManager.getCurrentFrame();
          if (ghostLandmarks) {
            drawer.drawGhostSkeleton(
              ghostLandmarks,
              ghostManager.opacity,
              displayController.ghostColor,
            );
          }
        }
      }

      // 🆕 1.1 Side-by-Side Mode Rendering (แยกออกมาจาก loop ปกติ)
      // ทำงานเมื่อเปิด SBS mode (ไม่ขึ้นกับ showGhostOverlay)
      if (displayController.isSideBySide) {
        // ต้อง ensure ว่า ghostManager update แล้ว (ถ้ายังไม่ได้ทำข้างบน)
        if (
          !displayController.showGhostOverlay ||
          !ghostManager.isPlaying // กรณี ghost overlay ปิดอยู่ เราต้อง update เอง
        ) {
          ghostManager.update();
        }

        const sbsCanvas = document.getElementById("sbs-instructor-canvas");
        if (sbsCanvas) {
          const sbsCtx = sbsCanvas.getContext("2d");

          // 🆕 Resolution Fix: Set Canvas Resolution to match Source Video (Intrinsic Size)
          const sourceVideo =
            ghostManager.getSilhouetteVideo() || ghostManager.silhouetteVideo;

          let targetWidth = 1920;
          let targetHeight = 1080;

          if (sourceVideo && sourceVideo.readyState >= 1) {
            targetWidth = sourceVideo.videoWidth;
            targetHeight = sourceVideo.videoHeight;
          } else {
            targetWidth = canvasElement.width;
            targetHeight = canvasElement.height;
          }

          if (
            sbsCanvas.width !== targetWidth ||
            sbsCanvas.height !== targetHeight
          ) {
            sbsCanvas.width = targetWidth;
            sbsCanvas.height = targetHeight;
          }

          // Clear previous frame
          sbsCtx.clearRect(0, 0, sbsCanvas.width, sbsCanvas.height);

          // Render
          if (sourceVideo && sourceVideo.readyState >= 2) {
            drawer.drawSilhouetteVideo(
              sourceVideo,
              ghostManager.opacity, // Use Manager Opacity
              displayController.ghostColor, // Use Controller Color
              sbsCtx, // Target SbS Canvas
            );
          } else {
            const ghostLandmarks = ghostManager.getCurrentFrame();
            if (ghostLandmarks) {
              drawer.drawGhostSkeleton(
                ghostLandmarks,
                ghostManager.opacity,
                displayController.ghostColor,
                sbsCtx, // Target SbS Canvas
              );
            }
          }
        }
      }

      // 1.5. วาด Instructor Thumbnail (มุมขวาบน) ถ้าเปิดใช้งาน
      if (displayController.showInstructor && instructorCtx && isTrainingMode) {
        // ต้องการ silhouette video โดยตรง (ไม่ขึ้นกับ Ghost overlay)
        const silhouetteVideo = ghostManager.silhouetteVideo;
        if (silhouetteVideo && silhouetteVideo.readyState >= 2) {
          // เล่น video ถ้ายังไม่เล่น
          if (silhouetteVideo.paused) {
            silhouetteVideo.play().catch(() => {});
          }

          // ดึงขนาดจริงของ canvas (responsive)
          const canvasRect = instructorThumbnail.getBoundingClientRect();
          const w = canvasRect.width;
          const h = canvasRect.height;

          // Set canvas resolution ให้ตรงกับขนาดแสดงผล
          if (
            instructorThumbnail.width !== w ||
            instructorThumbnail.height !== h
          ) {
            instructorThumbnail.width = w;
            instructorThumbnail.height = h;
          }

          // Clear canvas (transparent)
          instructorCtx.clearRect(0, 0, w, h);

          // Mirror flip เพราะ video เดิมถูก mirror
          instructorCtx.save();
          instructorCtx.scale(-1, 1);
          instructorCtx.translate(-w, 0);

          // ใช้ lighter mode ให้พื้นดำโปร่งใส
          instructorCtx.globalCompositeOperation = "lighter";
          instructorCtx.drawImage(silhouetteVideo, 0, 0, w, h);

          instructorCtx.restore();
        }
      }

      // 1.8. Draw Calibration Overlay (ถ้ากำลัง Calibrate)
      // [FIX] ต้องเรียก drawOverlay เพื่อให้ข้อความ "ถอยหลังอีกนิด" หรือ "Countdown" ปรากฏ
      if (calibrator.isActive) {
        calibrator.drawOverlay(
          canvasCtx,
          canvasElement.width,
          canvasElement.height,
        );
      }

      // 2. สร้าง Dynamic Path (เฟรมแรกของการฝึกเท่านั้น)
      if (
        isTrainingMode &&
        referencePath.length === 0 &&
        currentExercise &&
        results.poseLandmarks
      ) {
        referencePath = generateDynamicPath(
          results.poseLandmarks,
          currentExercise,
        );
      }

      // 2.5. วาด Reference Path (ถ้าเปิด)
      if (displayController.showPath && referencePath.length > 0) {
        drawer.drawPath(
          referencePath,
          displayController.pathColor,
          displayController.pathWidth,
        );
      }

      // 3. วาด User Skeleton (ถ้าเปิด) OR วาด Error Highlights (ถ้าเปิดแต่ปิด Skeleton)
      if (displayController.showSkeleton) {
        // กรณีเปิด Skeleton: วาดโครง + Highlight (ถ้ามี) ในฟังก์ชันเดียว
        const jointsToHighlight = displayController.showErrorHighlights
          ? lastErrorJoints
          : [];

        // 🆕 Customization Config
        const highlightConfig = {
          style: displayController.highlightStyle,
          scope: displayController.highlightScope,
          opacity: displayController.highlightOpacity,
        };

        drawer.drawSkeleton(
          results.poseLandmarks,
          jointsToHighlight,
          displayController.skeletonColor,
          displayController.showSkeletonIndices,
          displayController.isMirrored,
          lastActiveRule,
          highlightConfig, // 🆕 Pass Config
        );
      } else if (displayController.showErrorHighlights) {
        // กรณีปิด Skeleton แต่เปิด Highlights: วาดเฉพาะจุดแดง
        const highlightConfig = {
          style: displayController.highlightStyle,
          scope: displayController.highlightScope,
          opacity: displayController.highlightOpacity,
        };
        drawer.drawErrorHighlights(
          results.poseLandmarks,
          lastErrorJoints,
          highlightConfig,
        );
      }

      // 4. Trail Visualization (ถ้าเปิด)
      if (
        displayController.showTrail &&
        isTrainingMode &&
        !calibrator.isActive
      ) {
        try {
          // หาตำแหน่ง Wrist ที่ใช้
          const isRightHand = currentExercise.includes("rh");
          const wristIndex = isRightHand ? 16 : 15; // Right: 16, Left: 15
          const wrist = results.poseLandmarks[wristIndex];

          if (wrist && wrist.visibility > 0.5) {
            // Smoothing: ใช้ Exponential Moving Average เพื่อลด noise
            let smoothX = wrist.x;
            let smoothY = wrist.y;

            if (displayController.trailHistory.length > 0) {
              const last =
                displayController.trailHistory[
                  displayController.trailHistory.length - 1
                ];
              const SMOOTH_FACTOR = 0.4; // 0 = ไม่ smooth, 0.4 = ปานกลาง, 0.7 = smooth มาก, 1 = ไม่ขยับ
              smoothX = last.x * SMOOTH_FACTOR + wrist.x * (1 - SMOOTH_FACTOR);
              smoothY = last.y * SMOOTH_FACTOR + wrist.y * (1 - SMOOTH_FACTOR);
            }

            // เก็บตำแหน่งที่ smooth แล้วลง History
            displayController.trailHistory.push({
              x: smoothX,
              y: smoothY,
              timestamp: Date.now(),
            });

            // จำกัดขนาด History
            while (
              displayController.trailHistory.length >
              displayController.TRAIL_LENGTH
            ) {
              displayController.trailHistory.shift();
            }

            // วาด Trail (Fading Dots)
            drawer.drawTrail(
              displayController.trailHistory,
              displayController.trailColor,
            );
          }
        } catch (err) {
          console.error("Trail error:", err);
        }
      }

      if (isTrainingMode && !calibrator.isActive && referencePath.length > 0) {
        // Training Mode เท่านั้น + ไม่ใช่ Mode ปรับเทียบ + มี Path Reference
        // Performance: เช็ค Heuristics ทุก 3 frames (~10 FPS แทน 30 FPS) เพื่อประหยัด CPU
        frameCounter++;
        const shouldCheckHeuristics =
          frameCounter % HEURISTICS_CHECK_INTERVAL === 0;

        let feedbacks = [];

        if (shouldCheckHeuristics) {
          // 1. วิเคราะห์ด้วย Engine
          // 🆕 รับค่า Object { feedback, errorJoints }
          const analysisResult = engine.analyze(
            results.poseLandmarks,
            results.image.timeStamp,
            referencePath,
            currentExercise, // ส่งชื่อท่า
            currentLevel, // ส่งเลเวล (L1, L2, L3)
          );

          // Handle backward compatibility (if engine returns string array)
          if (Array.isArray(analysisResult)) {
            feedbacks = analysisResult;
            // No joints info
          } else {
            feedbacks = analysisResult.feedback || [];
            // Store current joints
          }

          const currentErrorJoints = analysisResult.errorJoints || [];

          // 1.0 Feedback Display Cooldown - ให้ข้อความค้างไว้ให้อ่านได้
          const now = Date.now();
          if (feedbacks.length > 0) {
            // มี feedback ใหม่
            if (now - lastFeedbackDisplayTime >= FEEDBACK_DISPLAY_COOLDOWN_MS) {
              // ครบ cooldown แล้ว - อัพเดท feedback ใหม่
              lastDisplayedFeedbacks = feedbacks;
              lastErrorJoints = currentErrorJoints; // 🆕 Sync Joints
              lastActiveRule = analysisResult.rule || null; // 🆕 Sync Rule
              lastFeedbackDisplayTime = now;
            }
            // ถ้ายังไม่ครบ cooldown จะใช้ lastDisplayedFeedbacks ที่มีอยู่
          } else {
            // [FIX] ไม่มี feedback (ถูกต้อง) - เคลียร์ทันทีไม่ต้องรอ Cooldown
            // ถ้า Engine ส่ง empty array มา แปลว่า Sticky Logic ของ Engine (1วินาที) หมดเวลาแล้ว
            lastDisplayedFeedbacks = [];
            lastErrorJoints = []; // 🆕 Clear Joints
            lastActiveRule = null; // 🆕 Clear Rule
          }

          // แสดง feedback (ใช้ค่าล่าสุดที่ไม่เปลี่ยนถี่เกินไป) - ใช้ HTML overlay
          updateFeedbackOverlay(lastDisplayedFeedbacks);

          // 1.1 พูดแจ้งเตือนเมื่อมีข้อผิดพลาด (มี Cooldown ป้องกันพูดซ้ำเร็วเกินไป)
          audioManager.speakFeedback(feedbacks);
        }

        // =====================================================================
        // 1.2 Global Debug Overlay (Updates EVERY FRAME if D is pressed)
        // =====================================================================
        if (engine.debugMode) {
          let debugInfo = {
            FPS: currentCamFps, // Camera FPS
            "AI Rate": currentFps, // AI Processing Rate
          };

          // 1.2.1 Add Light/Visibility Status (System Check)
          const keyIndices = [11, 12, 13, 14, 15, 16, 23, 24];
          let avgVisibility = 0;
          if (results.poseLandmarks) {
            const visibilitySum = keyIndices.reduce(
              (sum, i) => sum + (results.poseLandmarks[i]?.visibility || 0),
              0,
            );
            avgVisibility = visibilitySum / keyIndices.length;
          }
          debugInfo["Light"] = (avgVisibility * 100).toFixed(0) + "%";

          // 1.2.2 Add Training Specific Metrics (Only when training)
          if (isRecording && shouldCheckHeuristics) {
            debugInfo["Frame"] = frameCounter;
            // Debug Overlay Update
            debugManager.update(
              {
                FPS: currentFps,
                State: calibrator.isActive
                  ? "Calibrating"
                  : isTrainingMode
                    ? "Training"
                    : "Idle",
              },
              engine,
            );
          }

          fpsFrameCount++; // Increment counter for AI Rate calculation
          // Use debugManager to update debug overlay
        }

        // 2. *** เก็บข้อมูล (Data Logging) ***
        // ปรับปรุง: เก็บทุกเฟรมเพื่อให้ Replay ลื่นไหล (30 FPS)
        // แต่ Feedback จะอัปเดตเฉพาะเมื่อ shouldCheckHeuristics เป็นจริง
        if (isRecording) {
          const currentTime = (Date.now() - sessionStartTime) / 1000;

          // คำนวณค่าเฉลี่ย Visibility ของ Landmarks สำคัญ
          const keyIndices = [11, 12, 13, 14, 15, 16, 23, 24]; // ไหล่, ศอก, ข้อมือ, สะโพก
          const visibilitySum = keyIndices.reduce((sum, i) => {
            return sum + (results.poseLandmarks[i]?.visibility || 0);
          }, 0);
          const avgVisibility = visibilitySum / keyIndices.length;

          // ⚠️ Low Light Warning - เตือนเมื่อแสงไม่เพียงพอ
          // -------------------------------------------------------------------------
          // เหตุผล: MediaPipe Pose ต้องการแสงเพียงพอเพื่อตรวจจับ landmarks ได้แม่นยำ
          //        ถ้า avgVisibility ต่ำ หมายความว่า:
          //        - แสงน้อยเกินไป
          //        - มีแสงย้อน (backlighting)
          //        - กล้องถูกบังบางส่วน
          //
          // Logic:
          //   1. เช็คว่า avgVisibility < LOW_LIGHT_THRESHOLD (0.5)
          //   2. เช็คว่าเกิน cooldown แล้ว (10 วินาที) เพื่อไม่เตือนซ้ำถี่เกินไป
          //   3. แสดง notification (ภาพ) + พูดเตือน (เสียง)
          // -------------------------------------------------------------------------

          // เก็บ Snapshot ของเฟรมนี้
          recordedSessionData.push({
            frame_number: recordedSessionData.length,
            timestamp: currentTime,
            visibility_avg: Math.round(avgVisibility * 1000) / 1000,
            // 🆕 Optimization: Round decimals to 5 places to save space (approx 50% reduction)
            landmarks: results.poseLandmarks.map((lm) => ({
              x: Number(lm.x.toFixed(5)),
              y: Number(lm.y.toFixed(5)),
              z: Number(lm.z.toFixed(5)),
              visibility: Number((lm.visibility || 0).toFixed(5)),
            })),
            active_feedbacks: lastDisplayedFeedbacks || [], // ใช้ค่าล่าสุดที่โชว์อยู่ (Sticky)
            error_joints: lastErrorJoints || [], // 🆕 บันทึกจุดที่ผิดด้วย
            has_error:
              lastDisplayedFeedbacks && lastDisplayedFeedbacks.length > 0,
          });

          // บันทึกคะแนนทุกเฟรม
          scorer.recordFrame(feedbacks);

          // (ส่วนเก็บ Log Error เดิมไว้อ่านง่ายๆ)
          if (feedbacks.length > 0) {
            const lastLog = sessionLog[sessionLog.length - 1];
            if (
              !lastLog ||
              lastLog.timestamp !== currentTime.toFixed(0) + "s"
            ) {
              sessionLog.push({
                timestamp: currentTime.toFixed(2) + "s",
                issues: feedbacks,
              });
            }
          }
        }
      }
    }
  } else {
    // -------------------------------------------------------------------------
    // ไม่พบ poseLandmarks (กล้องถูกบังหรือไม่เห็นคน)
    // -------------------------------------------------------------------------
    // ถ้าอยู่ใน Calibration และไม่เห็นตัวเลย → เตือนผู้ใช้ (อาจจะมืดเกินไป)
    lightingManager.handleNoPose(calibrator.isActive);
  }
  // =====================================================================
  // 1.2 Global Debug Overlay (Updates EVERY FRAME if D is pressed)
  // MOVED OUTSIDE if(results.poseLandmarks) to show even when idle/no body
  // =====================================================================
  if (engine.debugMode) {
    // Determine Resolution string (e.g. "1280x720")
    // Use canvasElement defaults if image not present (shouldn't happen in onResults but safe check)
    const w = results.image ? results.image.width : canvasElement.width;
    const h = results.image ? results.image.height : canvasElement.height;

    // Calculate AI Latency (Time taken for this entire onResults execution so far)
    // Approximate, as we are at the end of the function
    const aiLatency = (performance.now() - timestamp).toFixed(1);

    let debugInfo = {
      FPS: cameraManager.currentCamFps, // Camera FPS
      "AI Rate": cameraManager.currentFps, // AI Processing Rate
      "AI Time": aiLatency + "ms", // 🆕 Latency
      Res: `${w}x${h}`, // 🆕 Resolution
    };

    // 1.2.1 Add Light/Visibility Status (System Check)
    const keyIndices = [11, 12, 13, 14, 15, 16, 23, 24];
    let avgVisibility = 0;
    if (results.poseLandmarks) {
      const visibilitySum = keyIndices.reduce(
        (sum, i) => sum + (results.poseLandmarks[i]?.visibility || 0),
        0,
      );
      avgVisibility = visibilitySum / keyIndices.length;
    }
    debugInfo["Light"] = (avgVisibility * 100).toFixed(0) + "%";

    // 1.2.2 Add Training Specific Metrics (Only when training)
    // Note: isRecording is global, shouldCheckHeuristics is calculated above
    if (isRecording && results.poseLandmarks) {
      debugInfo["Frame"] = frameCounter;
      debugInfo["Score"] = scorer.getCurrentScore().toFixed(1) + "%";

      // Pass engine to let DebugManager handle Heuristics info
      // Instead of merging manually
    }

    fpsFrameCount++;

    // Call Manager
    const debugConfig = {
      showGraph: displayController.showDebugGraph,
      showDetail: displayController.showDebugDetail,
    };

    debugManager.update(
      debugInfo,
      isRecording && results.poseLandmarks ? engine : null,
      debugConfig,
    );
  }

  canvasCtx.restore();
}

// =============================================================================
// SECTION 5: INITIALIZATION
// =============================================================================
//
// เริ่มต้น MediaPipe Pose Model และ Camera
// ทำงานเมื่อ Script โหลดเสร็จ
// =============================================================================

// (MediaPipe Pose initialized in CameraManager)

// -----------------------------------------------------------------------------
// Background Manager Initialization
// -----------------------------------------------------------------------------
// Initialize and preload all background images
backgroundManager
  .init()
  .then(() => {
    console.log("✅ BackgroundManager ready");
  })
  .catch((err) => {
    console.warn("⚠️ BackgroundManager init failed:", err);
  });

// Expose globally for DisplayController
window.backgroundManager = backgroundManager;
// window.pose handled by CameraManager

// หมายเหตุ: Loading Overlay จะแสดงตอน initCamera() (หลังกด "เข้าใจแล้ว")
// ไม่แสดงตั้งแต่ตอนนี้เพราะยังไม่ได้เปิดกล้อง

// -----------------------------------------------------------------------------
// Camera Setup
// -----------------------------------------------------------------------------
// สร้าง Camera Instance จาก MediaPipe Camera Utils
// onFrame จะถูกเรียกทุก Frame (~30 FPS)

// =============================================================================
// PERFORMANCE MODE MANAGEMENT
// =============================================================================
// NOTE: Logic ย้ายไป CameraManager แล้ว
// Wrapper คงไว้เพื่อ compatibility กับ HTML onclick

/**
 * ตั้งค่า Performance Mode และ Restart ระบบ AI
 * @param {string} mode - "lite", "balanced", "quality"
 */
window.setPerformanceMode = function (mode) {
  cameraManager.setPerformanceMode(mode);

  // Update UI Checkmarks is handled in selectPerformanceMode
};

/**
 * 🆕 Wrapper สำหรับจัดการ UI ของ Performance Menu (Vertical List)
 * @param {string} mode
 */
window.selectPerformanceMode = function (mode) {
  // 1. Call logic
  window.setPerformanceMode(mode);

  // 2. Update UI (Checkmarks)
  updatePerformanceMenuUI(mode);
};

function updatePerformanceMenuUI(mode) {
  document.querySelectorAll(".perf-option").forEach((btn) => {
    // Legacy check icon logic removed

    if (btn.dataset.value === mode) {
      // Active State
      btn.classList.add(
        "bg-blue-600",
        "text-white",
        "shadow-md",
        "ring-2",
        "ring-blue-300",
        "dark:ring-blue-500",
      );
      btn.classList.remove(
        "hover:bg-gray-100",
        "dark:hover:bg-gray-700",
        "text-gray-800",
        "dark:text-gray-200",
      );

      // Update internal text colors if needed (icon/title)
      const title = btn.querySelector("span.font-bold");
      if (title) {
        title.classList.remove("text-gray-800", "dark:text-gray-200");
        title.classList.add("text-white");
      }
    } else {
      // Inactive State
      btn.classList.remove(
        "bg-blue-600",
        "text-white",
        "shadow-md",
        "ring-2",
        "ring-blue-300",
        "dark:ring-blue-500",
      );
      btn.classList.add("hover:bg-gray-100", "dark:hover:bg-gray-700");

      const title = btn.querySelector("span.font-bold");
      if (title) {
        title.classList.add("text-gray-800", "dark:text-gray-200");
        title.classList.remove("text-white");
      }
    }
  });
}

// Init Performance Menu UI (now inside Settings menu)
const settingsBtn = document.getElementById("settings-btn");
const settingsMenu = document.getElementById("settings-menu");

// Set initial Performance UI state
if (settingsMenu) {
  updatePerformanceMenuUI(cameraManager.currentPerformanceMode);
}

// -----------------------------------------------------------------------------
// Camera Initialization (Dynamic)
// -----------------------------------------------------------------------------
// (Camera Creation logic moved to CameraManager)
// Initial Creation handled by CameraManager on start

// -----------------------------------------------------------------------------
// Camera Error Handling
// -----------------------------------------------------------------------------

/**
 * แสดง Error Message สำหรับปัญหากล้อง
 *
 * @param {string} errorType - ประเภท Error
 *   - "not_allowed" = ไม่ได้รับอนุญาต
 *   - "not_found" = ไม่พบกล้อง
 *   - "not_readable" = กล้องถูกใช้งานอยู่
 *   - "unknown" = ไม่ทราบสาเหตุ
 */
function showCameraError(errorType) {
  loadingOverlay.classList.add("hidden");
  startOverlay.classList.remove("hidden");

  // ข้อความ Error แยกตามประเภทและภาษา (ใช้ Translations)
  let msgKey = "camera_error_unknown";
  if (errorType === "not_allowed") msgKey = "camera_error_not_allowed";
  else if (errorType === "not_found") msgKey = "camera_error_not_found";
  else if (errorType === "not_readable") msgKey = "camera_error_not_readable";

  const errorText = uiManager.getText(msgKey);

  // แสดง Notification
  uiManager.showNotification(errorText.split("\n")[0], "error", 10000);

  // แสดงบน Overlay
  const overlayTitle = document.getElementById("overlay-title");
  if (overlayTitle) {
    overlayTitle.innerText = errorText.split("\n")[0];
  }

  console.error("Camera Error:", errorType);
}

/**
 * เริ่มต้น Camera พร้อม Error Handling
 *
 * @description
 *   พยายามเริ่มกล้อง ถ้าเกิด Error จะจำแนกประเภทและแสดงข้อความ
 */
async function initCamera() {
  // แสดง Loading Overlay ตอนเริ่มกล้อง (หลังกด "เข้าใจแล้ว")
  loadingOverlay.classList.remove("hidden");

  try {
    // Use CameraManager
    await cameraManager.start(onResults);
    console.log("✅ Camera started successfully");
  } catch (error) {
    console.error("❌ Camera initialization failed:", error);

    // จำแนกประเภท Error จาก Error Name
    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      showCameraError("not_allowed");
    } else if (
      error.name === "NotFoundError" ||
      error.name === "DevicesNotFoundError"
    ) {
      showCameraError("not_found");
    } else if (
      error.name === "NotReadableError" ||
      error.name === "TrackStartError"
    ) {
      showCameraError("not_readable");
    } else {
      showCameraError("unknown");
    }
  }
}

// =============================================================================
// START APPLICATION
// =============================================================================
// โหลด Reference Data (AI Models จะ preload ขณะแสดง Privacy Modal)
loadReferenceData();
checkSelectionComplete(); // เรียกเพื่อแสดง highlight ตั้งแต่เริ่มต้น
// initCamera(); // ย้ายไปเรียกใน Privacy Accept Button handler (line ~156)
// หมายเหตุ: MediaPipe Pose Model จะถูกโหลดเมื่อสร้าง instance (line 1635)
//           ดังนั้น AI preload ไปพร้อมกับ Privacy Modal อยู่แล้ว

/**
 * ตรวจสอบความสว่างของแสงจาก Video Frame
 * @param {HTMLVideoElement} video - วิดีโอต้นฉบับ
 * @returns {number} ค่าความสว่างเฉลี่ย (0-255)
 */
// สร้าง Canvas ชั่วคราวขนาดเล็กสำหรับ checkBrightness (Reuse เพื่อลด Memory Overhead)
const tempBrightnessCanvas = document.createElement("canvas");
tempBrightnessCanvas.width = 32;
tempBrightnessCanvas.height = 24;
const tempBrightnessCtx = tempBrightnessCanvas.getContext("2d", {
  willReadFrequently: true,
});

/**
 * ตรวจสอบความสว่างของแสงจาก Video Frame
 * @param {HTMLVideoElement} video - วิดีโอต้นฉบับ
 * @returns {number} ค่าความสว่างเฉลี่ย (0-255)
 */
// =============================================================================
