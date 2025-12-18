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
 *   Section 1: Setup & Variables (บรรทัด 1-84)
 *     - DOM Elements, Manager Instances, State Variables
 *
 *   Section 2: UI Event Listeners (บรรทัด 85-600)
 *     - ปุ่ม, Dropdown, Keyboard Shortcuts
 *     - Training Flow Functions
 *
 *   Section 3: Data Loading (บรรทัด 601-655)
 *     - โหลด Reference Path จาก JSON
 *
 *   Section 4: MediaPipe Processing (บรรทัด 656-805)
 *     - onResults() - ประมวลผลทุก Frame
 *
 *   Section 5: Initialization (บรรทัด 806-903)
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
const calibrator = new CalibrationManager(); // ปรับเทียบสัดส่วนร่างกาย
const uiManager = new UIManager(); // จัดการ UI และภาษา
const drawer = new DrawingManager(canvasCtx, canvasElement); // วาดภาพบน Canvas
const scorer = new ScoringManager(); // คำนวณคะแนน
const audioManager = new AudioManager(); // เสียงพูดแจ้งเตือน
const gestureManager = new GestureManager(); // ควบคุมด้วยท่ามือ

// -----------------------------------------------------------------------------
// State Variables - ตัวแปรเก็บสถานะ
// -----------------------------------------------------------------------------
let isRecording = false; // กำลังบันทึก Session อยู่หรือไม่
let isTrainingMode = false; // อยู่ใน Training Mode หรือไม่
let currentExercise = null; // ท่าที่เลือก (rh_cw, rh_ccw, lh_cw, lh_ccw)
let currentLevel = null; // ระดับที่เลือก (L1, L2, L3)
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

// -----------------------------------------------------------------------------
// Performance Optimization - ลด CPU Load
// -----------------------------------------------------------------------------
// เช็ค Heuristics ทุก 3 frames แทนทุก frame
// ~30 FPS → ~10 FPS สำหรับ Heuristics = ประหยัด CPU ~70%
const HEURISTICS_CHECK_INTERVAL = 3;
let frameCounter = 0;

// -----------------------------------------------------------------------------
// FPS Tracking - สำหรับ Debug Overlay (NFR)
// -----------------------------------------------------------------------------
let lastFpsTime = performance.now();
let fpsFrameCount = 0;
let currentFps = 0;

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
  });
}
// -----------------------------------------------------------------------------
// Helper Functions - ฟังก์ชันช่วยสร้าง ID และดึงข้อมูล
// -----------------------------------------------------------------------------

/**
 * สร้างหรือดึง User ID จาก LocalStorage
 *
 * @description
 *   สร้าง ID ที่ไม่ซ้ำกันสำหรับแต่ละผู้ใช้
 *   เก็บใน LocalStorage เพื่อให้คงที่ตลอดการใช้งาน
 *   ใช้สำหรับ Track ข้อมูลการฝึกของแต่ละคน
 *
 * @returns {string} User ID (เช่น "user_lxyz123ab")
 */
function getOrCreateUserId() {
  let userId = localStorage.getItem("taijiflow_user_id");
  if (!userId) {
    // สร้าง ID ใหม่: "user_" + timestamp(base36) + random(5 chars)
    userId =
      "user_" +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2, 5);
    localStorage.setItem("taijiflow_user_id", userId);
  }
  return userId;
}

/**
 * สร้าง Session ID ใหม่
 *
 * @description
 *   สร้าง ID ที่ไม่ซ้ำกันสำหรับแต่ละ Session การฝึก
 *   เรียกทุกครั้งที่เริ่มบันทึกใหม่
 *
 * @returns {string} Session ID (เช่น "sess_lxyz123ab")
 */
function generateSessionId() {
  return (
    "sess_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  );
}

/**
 * ดึงข้อมูล Platform/Device
 *
 * @description
 *   เก็บข้อมูลอุปกรณ์สำหรับ Analytics และ Debug
 *   ช่วยให้เข้าใจว่าผู้ใช้ใช้อุปกรณ์ใดบ้าง
 *
 * @returns {Object} ข้อมูล Platform
 */
function getPlatformInfo() {
  const ua = navigator.userAgent;
  return {
    userAgent: ua,
    platform: navigator.platform,
    isMobile: /Android|iPhone|iPad|iPod/i.test(ua),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
  };
}

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
const checkSkeleton = document.getElementById("check-skeleton");
const checkSilhouette = document.getElementById("check-silhouette");
const checkGhost = document.getElementById("check-ghost");

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
  audioBtn.classList.toggle("bg-green-600", isEnabled);
  audioBtn.classList.toggle("bg-gray-500", !isEnabled);
});

// Skeleton Display State (เปิดเป็น default)
let showSkeleton = true;
let showGhostOverlay = false;
let showSilhouette = false;

// Display Dropdown Toggle
if (displayBtn && displayMenu) {
  displayBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    displayMenu.classList.toggle("hidden");
  });

  // ปิด dropdown เมื่อคลิกข้างนอก
  document.addEventListener("click", (e) => {
    if (!displayMenu.contains(e.target) && e.target !== displayBtn) {
      displayMenu.classList.add("hidden");
    }
  });
}

// Checkbox: Skeleton
if (checkSkeleton) {
  checkSkeleton.checked = showSkeleton;
  checkSkeleton.addEventListener("change", () => {
    showSkeleton = checkSkeleton.checked;
  });
}

// Checkbox: Silhouette
if (checkSilhouette) {
  checkSilhouette.addEventListener("change", () => {
    showSilhouette = checkSilhouette.checked;
    if (showSilhouette) {
      silhouetteManager.enable();
    } else {
      silhouetteManager.disable();
    }
  });
}

// Checkbox: Ghost
if (checkGhost) {
  checkGhost.addEventListener("change", () => {
    showGhostOverlay = checkGhost.checked;
    if (showGhostOverlay) {
      ghostManager.start();
    } else {
      ghostManager.stop();
    }
  });
}

// เริ่มต้น UI
uiManager.init();

// -----------------------------------------------------------------------------
// Sync ภาษาจาก localStorage กับ Components อื่น
// -----------------------------------------------------------------------------
// หลังจาก uiManager.init() โหลดภาษาจาก localStorage แล้ว
// ต้อง sync กับ AudioManager, CalibrationManager และ ธง
const initLang = uiManager.currentLang || "th";
langBtn.innerText = initLang === "th" ? "🇹🇭" : "🇺🇸";
audioManager.setLanguage(initLang);
calibrator.setLanguage(initLang);

// เริ่มต้น Gesture Manager (Gesture Control)
gestureManager.init().then((ready) => {
  if (ready) {
    console.log("[Main] Gesture Control พร้อมใช้งาน!");
    uiManager.showNotification("🖐️ Gesture Control พร้อมใช้งาน", "success");
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
    // ออกจาก Fullscreen ถ้าอยู่
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
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
  loadReferenceData();
  checkSelectionComplete();
});

// Legacy level buttons (hidden, for compatibility)
levelButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    currentLevel = e.target.dataset.level;
    uiManager.updateLevelButtons(currentLevel);
    loadReferenceData();
    checkSelectionComplete();
  });
});

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
 *   ให้ผู้ฝึกเตรียมตัวก่อนเริ่มบันทึก
 *   ใช้ Promise เพื่อให้ await ได้
 *
 * @returns {Promise} Resolves เมื่อนับถอยหลังเสร็จ
 */
function showCountdown() {
  return new Promise((resolve) => {
    countdownOverlay.classList.remove("hidden");
    let count = 3;
    countdownNumber.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.textContent = count;
      } else {
        clearInterval(interval);
        countdownOverlay.classList.add("hidden");
        resolve();
      }
    }, 1000);
  });
}

/**
 * Format เวลาเป็น mm:ss
 */
function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * อัปเดต Timer Display
 */
function updateTrainingTimer() {
  const elapsed = Date.now() - trainingStartTime;
  const remaining = Math.max(0, TRAINING_DURATION_MS - elapsed);
  const timeStr = formatTime(remaining);

  // Update both timers
  if (trainingTimerTop) trainingTimerTop.textContent = timeStr;
  if (trainingTimerOverlay) trainingTimerOverlay.textContent = timeStr;

  if (remaining <= 0) {
    endTrainingSession();
  }
}

/**
 * เริ่ม Training Session (Calibrate ทุกครั้ง)
 *
 * หมายเหตุ: รองรับ PWA Standalone Mode (Add to Home Screen)
 * - iOS Safari PWA ไม่รองรับ Fullscreen API
 * - ใช้ feature detection และ timeout fallback
 */
async function startTrainingFlow() {
  // 1. ซ่อน Overlay คำแนะนำ
  startOverlay.classList.add("hidden");

  // 2. ตรวจสอบว่าอยู่ใน PWA Standalone Mode หรือไม่
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true; // iOS Safari

  // 3. พยายามเข้า Fullscreen (ถ้าไม่ใช่ PWA และรองรับ API)
  if (!isStandalone && canvasContainer.requestFullscreen) {
    try {
      // ใช้ Promise.race กับ timeout เพื่อป้องกันค้าง
      const fullscreenPromise = canvasContainer.requestFullscreen();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Fullscreen timeout")), 1000)
      );

      await Promise.race([fullscreenPromise, timeoutPromise]);
      console.log("[Training] Entered fullscreen mode");
    } catch (err) {
      console.log(
        "[Training] Fullscreen failed/timeout, continuing normally:",
        err.message
      );
    }
  } else {
    console.log("[Training] PWA/Standalone mode detected, skipping fullscreen");
  }

  // 4. เริ่ม Calibrate (ไม่ว่า fullscreen จะสำเร็จหรือไม่)
  calibrator.start();
  audioManager.announce("calib_start");
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
  scorer.reset();

  audioManager.announce("record_start");
  uiManager.updateRecordButtonState(true);

  // 4. อัปเดตสถานะปุ่ม (Start disabled, Stop enabled)
  updateButtonStates(true);

  // 5. แสดง Timer (ซ้ายล่าง)
  trainingControls.classList.remove("hidden");
  const timeStr = formatTime(TRAINING_DURATION_MS);
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

  // 4. ออกจาก Fullscreen
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  // 5. สรุปคะแนนและ Export Data (wrap ใน try-catch เพื่อไม่ให้ crash)
  try {
    const summary = scorer.getSessionSummary();
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
      DataExporter.exportFullSession(fullDataset);
    }

    // แสดง Score Popup
    uiManager.showScoreSummary(summary.score, grade.label, summary.totalErrors);
  } catch (error) {
    console.error("Error in endTrainingSession:", error);
    // ยังคงแสดง notification แจ้งเตือน
    uiManager.showNotification("เกิดข้อผิดพลาดในการสรุปผล", "warning", 3000);
  }

  // 6. Reset UI และกลับหน้าแรก (เรียกเสมอ ไม่ว่าจะมี error หรือไม่)
  setTimeout(() => {
    resetToHomeScreen();
  }, 3000);
}

/**
 * กลับไปหน้าแรก (Reset การเลือก)
 */
function resetToHomeScreen() {
  // Reset State
  currentExercise = null;
  currentLevel = null;
  referencePath = [];

  // Reset UI
  exerciseSelect.value = "";
  if (levelSelect) levelSelect.value = "";

  // Reset button states
  updateButtonStates(false);

  // Reset timers
  if (trainingTimerTop) trainingTimerTop.textContent = "00:00";
  if (trainingTimerOverlay) trainingTimerOverlay.textContent = "5:00";

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
  if (isTrainingMode) {
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
      uiManager.currentLang
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
        },

        // === สรุปผล (Summary) ===
        summary: {
          duration_seconds: scoreSummary.durationSeconds,
          total_frames: scoreSummary.totalFrames,
          fps_estimated: Math.round(
            scoreSummary.totalFrames / scoreSummary.durationSeconds
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
      DataExporter.exportFullSession(fullDataset);

      // แสดงผลคะแนน
      uiManager.showScoreSummary(scoreSummary, gradeInfo);
    } else {
      uiManager.showNotification(uiManager.getText("alert_no_data"), "warning");
    }
  }
});

// --- Keyboard Shortcuts ---
window.addEventListener("keydown", (e) => {
  // ไม่ทำงานถ้ากำลังพิมพ์ใน input/textarea
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  // ใช้ e.key เพื่อความทันสมัยและอ่านง่าย
  switch (e.key.toLowerCase()) {
    // -------------------------------------------------------------------------
    // F = Fullscreen Toggle
    // -------------------------------------------------------------------------
    case "f":
      e.preventDefault();
      fullscreenBtn.click();
      break;

    // -------------------------------------------------------------------------
    // D = Debug Mode Toggle
    // -------------------------------------------------------------------------
    case "d":
      e.preventDefault();
      engine.setDebugMode(!engine.debugMode);
      uiManager.showNotification(
        `Debug Mode: ${engine.debugMode ? "ON" : "OFF"}`,
        "info",
        1500
      );
      break;

    // -------------------------------------------------------------------------
    // Space = Start/Stop Training
    // -------------------------------------------------------------------------
    case " ":
      e.preventDefault();
      if (calibrator.isActive) {
        // กำลัง Calibrate → ยกเลิก
        calibrator.cancel();
        loadReferenceData();
        startOverlay.classList.remove("hidden");
        if (document.fullscreenElement) document.exitFullscreen();
        uiManager.showNotification("🛑 ยกเลิกการ Calibrate", "info");
      } else if (isTrainingMode) {
        // กำลังฝึก → หยุด
        stopTrainingBtn.click();
      } else if (currentExercise && currentLevel) {
        // พร้อมฝึก → เริ่ม
        startTrainingBtn.click();
      }
      break;

    // -------------------------------------------------------------------------
    // M = Mute/Unmute Audio
    // -------------------------------------------------------------------------
    case "m":
      e.preventDefault();
      audioBtn.click(); // Toggle audio button
      break;

    // -------------------------------------------------------------------------
    // L = Language Toggle (TH/EN)
    // -------------------------------------------------------------------------
    case "l":
      e.preventDefault();
      langBtn.click(); // Toggle language button
      break;

    // -------------------------------------------------------------------------
    // T = Theme Toggle (Dark/Light)
    // -------------------------------------------------------------------------
    case "t":
      e.preventDefault();
      themeBtn.click(); // Toggle theme button
      break;

    // -------------------------------------------------------------------------
    // G = Ghost Overlay Toggle
    // -------------------------------------------------------------------------
    case "g":
      e.preventDefault();
      if (checkGhost) {
        checkGhost.checked = !checkGhost.checked;
        checkGhost.dispatchEvent(new Event("change"));
      }
      break;

    // -------------------------------------------------------------------------
    // S = Silhouette Overlay Toggle
    // -------------------------------------------------------------------------
    case "s":
      e.preventDefault();
      if (checkSilhouette) {
        checkSilhouette.checked = !checkSilhouette.checked;
        checkSilhouette.dispatchEvent(new Event("change"));
      }
      break;

    // -------------------------------------------------------------------------
    // B = Skeleton (Bones) Toggle
    // -------------------------------------------------------------------------
    case "b":
      e.preventDefault();
      if (checkSkeleton) {
        checkSkeleton.checked = !checkSkeleton.checked;
        checkSkeleton.dispatchEvent(new Event("change"));
      }
      break;

    // -------------------------------------------------------------------------
    // H or ? = Open Tutorial Popup (วิธีการใช้งาน)
    // -------------------------------------------------------------------------
    case "h":
    case "?":
      e.preventDefault();
      tutorialManager.open(uiManager.currentLang);
      break;

    // -------------------------------------------------------------------------
    // K = Show Keyboard Shortcuts
    // -------------------------------------------------------------------------
    case "k":
      e.preventDefault();
      const shortcuts = [
        "⌨️ คีย์ลัด",
        "━━━━━━━━━━━━",
        "",
        "Space = เริ่ม/หยุด",
        "F = เต็มจอ",
        "D = Debug Mode",
        "",
        "M = เปิด/ปิดเสียง",
        "L = เปลี่ยนภาษา",
        "T = เปลี่ยน Theme",
        "",
        "H = วิธีใช้งาน",
        "K = คีย์ลัด (นี้)",
        "Esc = ยกเลิก",
      ].join("\n");
      uiManager.showNotification(shortcuts, "info", 5000);
      break;

    // -------------------------------------------------------------------------
    // Escape = Cancel Calibration
    // -------------------------------------------------------------------------
    case "escape":
      if (calibrator.isActive) {
        e.preventDefault();
        calibrator.cancel();
        loadReferenceData();
        resetToHomeScreen();
        uiManager.showNotification("ยกเลิกการปรับเทียบ", "info", 2000);
      }
      break;
  }
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

    referencePath = data.map((frame) => {
      const wrist = frame.landmarks[16];
      if (!wrist) throw new Error("Missing wrist landmark");
      return { x: wrist.x, y: wrist.y };
    });

    // โหลด full skeleton data เข้า Ghost Manager
    ghostManager.load(data);

    referenceDataLoaded = true;
    console.log(`✅ Loaded ${referencePath.length} points (Path + Ghost).`);
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

  // Gesture Detection - ตรวจจับท่ามือสำหรับควบคุม UI
  if (gestureManager.getIsReady() && videoElement.readyState >= 2) {
    gestureManager.detectGestures(
      videoElement,
      timestamp,
      uiManager.currentLang
    );
  }

  canvasCtx.save(); // บันทึกสถานะ
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // ล้างภาพก่อน

  // Draw Video
  // หมายเหตุ: Webcam ส่งภาพแบบ mirror มาแล้ว เวลาปกติ
  // หมายเหตุ: CSS scaleX(-1) บน canvas ทำ mirror อยู่แล้ว
  // ใน Fullscreen (canvas-container) CSS นี้ยังคงทำงาน
  // ดังนั้นไม่ต้อง mirror เพิ่มใน JS

  // วาดภาพ
  canvasCtx.drawImage(
    results.image, // ภาพที่ได้จาก MediaPipe
    0,
    0,
    canvasElement.width,
    canvasElement.height
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
        canvasElement.height
      );

      if (calibResult && calibResult.status === "complete") {
        engine.setCalibration(calibResult.data);
        calibrator.saveToStorage(); // บันทึก Calibration Data ลง LocalStorage
        audioManager.announce("calib_success"); // พูดแจ้งเตือน

        // ใช้ข้อความจาก uiManager
        uiManager.showNotification(
          uiManager.getText("alert_calib_success"),
          "success"
        );

        // Reset UI
        loadReferenceData();
        smallCalibrateBtn.classList.remove("hidden");
        cancelCalibBtn.classList.add("hidden");

        // ถ้าเลือกท่าและระดับครบแล้ว → เริ่ม Training อัตโนมัติ
        if (currentExercise && currentLevel) {
          startTrainingAfterCalibration();
        }
      }
    } else {
      // Normal Mode

      // 0. วาด Silhouette (ถ้าเปิดใช้งาน) - ใช้ segmentationMask จาก Pose
      if (
        showSilhouette &&
        silhouetteManager.isEnabled &&
        results.segmentationMask
      ) {
        silhouetteManager.drawSilhouetteFromMask(
          drawer.ctx,
          results.segmentationMask,
          drawer.canvasWidth,
          drawer.canvasHeight
        );
      }

      // 1. วาด Ghost Skeleton ก่อน (ถ้าเปิดใช้งาน)
      if (showGhostOverlay && ghostManager.isPlaying) {
        ghostManager.update(); // อัปเดต frame
        const ghostLandmarks = ghostManager.getCurrentFrame();
        if (ghostLandmarks) {
          drawer.drawGhostSkeleton(ghostLandmarks, ghostManager.opacity);
        }
      }

      // 2. วาด Reference Path
      if (referencePath.length > 0) {
        drawer.drawPath(referencePath, "rgba(0, 255, 0, 0.5)", 4); // วาด Path Reference
      }

      // 3. วาด User Skeleton (ถ้าเปิด)
      if (showSkeleton) {
        drawer.drawSkeleton(results.poseLandmarks);
      }

      if (!calibrator.isActive && referencePath.length > 0) {
        // ไม่ใช่ Mode ปรับเทียบ และมี Path Reference
        // Performance: เช็ค Heuristics ทุก 3 frames (~10 FPS แทน 30 FPS) เพื่อประหยัด CPU
        frameCounter++;
        const shouldCheckHeuristics =
          frameCounter % HEURISTICS_CHECK_INTERVAL === 0;

        let feedbacks = [];

        if (shouldCheckHeuristics) {
          // 1. วิเคราะห์ด้วย Engine
          feedbacks = engine.analyze(
            results.poseLandmarks,
            results.image.timeStamp,
            referencePath,
            currentExercise, // ส่งชื่อท่า
            currentLevel // ส่งเลเวล (L1, L2, L3)
          );
          drawer.drawFeedbackPanel(feedbacks);

          // 1.1 พูดแจ้งเตือนเมื่อมีข้อผิดพลาด (มี Cooldown ป้องกันพูดซ้ำเร็วเกินไป)
          audioManager.speakFeedback(feedbacks);

          // 1.2 Debug Overlay (กด D เพื่อเปิด)
          if (engine.debugMode) {
            // รวม debugInfo จาก engine กับค่า performance อื่นๆ
            const debugInfo = {
              fps: currentFps,
              frameCount: frameCounter,
              score: scorer.getCurrentScore().toFixed(1) + "%",
              ...engine.getDebugInfo(),
            };
            drawer.drawDebugOverlay(debugInfo);
          }
        }

        // 2. *** เก็บข้อมูล (Data Logging) - เก็บทุก 3 frames เพื่อลดขนาดไฟล์ ***
        if (isRecording && shouldCheckHeuristics) {
          const currentTime = (Date.now() - sessionStartTime) / 1000;

          // คำนวณค่าเฉลี่ย Visibility ของ Landmarks สำคัญ
          const keyIndices = [11, 12, 13, 14, 15, 16, 23, 24]; // ไหล่, ศอก, ข้อมือ, สะโพก
          const visibilitySum = keyIndices.reduce((sum, i) => {
            return sum + (results.poseLandmarks[i]?.visibility || 0);
          }, 0);
          const avgVisibility = visibilitySum / keyIndices.length;

          // เก็บ Snapshot ของเฟรมนี้
          recordedSessionData.push({
            frame_number: recordedSessionData.length,
            timestamp: currentTime,
            visibility_avg: Math.round(avgVisibility * 1000) / 1000, // ปัดเศษ 3 ตำแหน่ง
            landmarks: results.poseLandmarks, // เก็บพิกัดทั้งตัว
            active_feedbacks: feedbacks, // เก็บผลการตรวจ (ใช้เป็น Label ในอนาคต)
            has_error: feedbacks.length > 0,
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

// -----------------------------------------------------------------------------
// MediaPipe Pose Model
// -----------------------------------------------------------------------------
// สร้าง Instance ของ MediaPipe Pose
// ใช้ CDN สำหรับโหลด Model Files
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

// ตั้งค่า Pose Model
// - modelComplexity: 0=Lite, 1=Full, 2=Heavy (ความแม่นยำ)
// - smoothLandmarks: ทำให้จุดนิ่งขึ้น ลดการกระตุก
// - minDetectionConfidence: ความมั่นใจขั้นต่ำในการตรวจจับ
// - minTrackingConfidence: ความมั่นใจขั้นต่ำในการติดตาม
pose.setOptions({
  modelComplexity: 1, // Full Model (สมดุลระหว่างความแม่นยำและความเร็ว)
  smoothLandmarks: true, // เปิด Smoothing
  enableSegmentation: true, // เปิด Segmentation (สำหรับ Silhouette)
  smoothSegmentation: true, // ทำให้ mask นิ่งขึ้น
  minDetectionConfidence: 0.5, // 50% ขึ้นไปถึงจะยอมรับ
  minTrackingConfidence: 0.5, // 50% ขึ้นไปถึงจะติดตามต่อ
});

// ผูก Callback Function
pose.onResults(onResults);

// แสดง Loading Overlay ระหว่างโหลด
loadingOverlay.classList.remove("hidden");

// -----------------------------------------------------------------------------
// Camera Setup
// -----------------------------------------------------------------------------
// สร้าง Camera Instance จาก MediaPipe Camera Utils
// onFrame จะถูกเรียกทุก Frame (~30 FPS)
const camera = new Camera(videoElement, {
  onFrame: async () => {
    // ส่งภาพจาก Video ไปให้ Pose Model ประมวลผล
    await pose.send({ image: videoElement });
    // ซ่อน Loading หลังจากได้ผลลัพธ์ Frame แรก
    loadingOverlay.classList.add("hidden");
  },
  width: 1280, // ความกว้าง (px)
  height: 720, // ความสูง (px) - 720p HD
});

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

  // ข้อความ Error แยกตามประเภทและภาษา
  const messages = {
    not_allowed: {
      th: "❌ ไม่ได้รับอนุญาตใช้กล้อง\n\nกรุณาอนุญาตการเข้าถึงกล้องใน Browser Settings แล้วรีเฟรชหน้า",
      en: "❌ Camera access denied\n\nPlease allow camera access in browser settings and refresh",
    },
    not_found: {
      th: "❌ ไม่พบกล้อง\n\nกรุณาเชื่อมต่อ Webcam แล้วรีเฟรชหน้า",
      en: "❌ No camera found\n\nPlease connect a webcam and refresh",
    },
    not_readable: {
      th: "❌ กล้องถูกใช้งานโดยโปรแกรมอื่น\n\nกรุณาปิดโปรแกรมอื่นที่ใช้กล้องแล้วรีเฟรชหน้า",
      en: "❌ Camera in use by another app\n\nPlease close other apps using the camera and refresh",
    },
    unknown: {
      th: "❌ เกิดข้อผิดพลาดในการเข้าถึงกล้อง\n\nกรุณารีเฟรชหน้าแล้วลองใหม่",
      en: "❌ Camera error\n\nPlease refresh and try again",
    },
  };

  const lang = uiManager.currentLang;
  const msg = messages[errorType] || messages.unknown;
  const errorText = lang === "th" ? msg.th : msg.en;

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
  try {
    await camera.start();
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
// โหลด Reference Data และเริ่มกล้อง
loadReferenceData();
initCamera();

// =============================================================================
// END OF FILE: script.js
// =============================================================================
