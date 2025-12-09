// =================================================================
//  TaijiFlow AI - Main Controller (script.js) v3.0 (New UX Flow)
// =================================================================

// 1. Setup & Variables
const videoElement = document.getElementById("input_video");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const loadingOverlay = document.getElementById("loading-overlay");
const startOverlay = document.getElementById("start-overlay");

// Instances
const engine = new HeuristicsEngine(); // สมองกลสำหรับวิเคราะห์ท่าทาง
const calibrator = new CalibrationManager(); // ผู้จัดการปรับเทียบ
const uiManager = new UIManager(); // ผู้จัดการหน้าจอและภาษา
const drawer = new DrawingManager(canvasCtx, canvasElement); // ผู้จัดการวาดภาพบน Canvas
const scorer = new ScoringManager(); // ผู้จัดการคะแนน
const audioManager = new AudioManager(); // ผู้จัดการเสียงพูด

// State Variables
let isRecording = false; // สถานะการบันทึก
let isTrainingMode = false; // สถานะ Training Mode (auto-record)
let currentExercise = null; // เก็บชื่อท่าที่กำลังฝึก (null = ยังไม่เลือก)
let currentLevel = null; // เก็บระดับความยาก (null = ยังไม่เลือก)
let referencePath = []; // เก็บข้อมูลเส้นทางต้นแบบที่โหลดมาจากไฟล์ JSON
let sessionLog = []; // เก็บประวัติข้อผิดพลาดที่เกิดขึ้นระหว่างการฝึก (สำหรับ Report แบบสรุป)
let sessionStartTime = 0;
let recordedSessionData = []; // เก็บข้อมูลดิบทั้งหมดแบบเฟรมต่อเฟรม (สำหรับนำไปใช้กับ Machine Learning)
let currentSessionId = null; // Unique ID สำหรับแต่ละ Session

// Training Timer Variables
const TRAINING_DURATION_MS = 5 * 60 * 1000; // 5 นาที
let trainingTimerId = null;
let trainingStartTime = 0;

// สร้าง User ID (เก็บใน LocalStorage เพื่อให้คงที่ตลอดการใช้งาน)
function getOrCreateUserId() {
  let userId = localStorage.getItem("taijiflow_user_id");
  if (!userId) {
    userId =
      "user_" +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2, 5);
    localStorage.setItem("taijiflow_user_id", userId);
  }
  return userId;
}

// สร้าง Session ID ใหม่ทุกครั้งที่เริ่มบันทึก
function generateSessionId() {
  return (
    "sess_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  );
}

// ดึงข้อมูล Platform
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

// 2. UI Event Listeners
const exerciseSelect = document.getElementById("exercise-select");
const levelButtons = document.querySelectorAll(".level-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const recordBtn = document.getElementById("record-btn");

const smallCalibrateBtn = document.getElementById("small-calibrate-btn"); // ปุ่มเล็ก (วัดใหม่)
const cancelCalibBtn = document.getElementById("cancel-calib-btn");

const langBtn = document.getElementById("lang-btn");
const themeBtn = document.getElementById("theme-btn");

// New UX Flow Elements
const startTrainingBtn = document.getElementById("start-training-btn");
const countdownOverlay = document.getElementById("countdown-overlay");
const countdownNumber = document.getElementById("countdown-number");
const trainingControls = document.getElementById("training-controls");
const trainingTimer = document.getElementById("training-timer");
const stopEarlyBtn = document.getElementById("stop-early-btn");

// ฟังก์ชันตรวจสอบว่าเลือกท่าและระดับครบหรือยัง
function checkSelectionComplete() {
  const isComplete = currentExercise !== null && currentLevel !== null;
  if (isComplete) {
    startTrainingBtn.classList.remove("hidden");
  } else {
    startTrainingBtn.classList.add("hidden");
  }
  return isComplete;
}

langBtn.addEventListener("click", () => {
  const newLang = uiManager.toggleLanguage();
  audioManager.setLanguage(newLang); // Sync เสียงพูดกับภาษา
  calibrator.setLanguage(newLang); // Sync Calibration text กับภาษา
  langBtn.innerText = newLang === "th" ? "🇹🇭 TH / 🇺🇸 EN" : "🇺🇸 EN / 🇹🇭 TH";
});

themeBtn.addEventListener("click", () => {
  uiManager.toggleTheme();
});

// Audio Toggle Button
const audioBtn = document.getElementById("audio-btn");
audioBtn.addEventListener("click", () => {
  const isEnabled = audioManager.toggle();
  audioBtn.innerText = isEnabled ? "🔊" : "🔇";
  audioBtn.classList.toggle("bg-green-600", isEnabled);
  audioBtn.classList.toggle("bg-gray-500", !isEnabled);
});

// เริ่มต้น UI
uiManager.init();

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

levelButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    currentLevel = e.target.dataset.level;
    uiManager.updateLevelButtons(currentLevel);
    loadReferenceData();
    checkSelectionComplete();
  });
});

// ============================================================
// Training Flow Functions (New UX)
// ============================================================

/**
 * แสดง Countdown 3-2-1 ก่อนเริ่มบันทึก
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
  trainingTimer.textContent = formatTime(remaining);

  if (remaining <= 0) {
    endTrainingSession();
  }
}

/**
 * เริ่ม Training Session (Flow ใหม่)
 */
async function startTrainingFlow() {
  // 1. ซ่อนปุ่มเริ่มฝึก
  startTrainingBtn.classList.add("hidden");
  startOverlay.classList.add("hidden");

  // 2. ตรวจสอบ Calibration Data
  if (!calibrator.isComplete) {
    const storedData = calibrator.loadFromStorage();
    if (!storedData) {
      // ต้อง Calibrate ก่อน
      calibrator.start();
      audioManager.announce("calib_start");
      // รอ Calibration เสร็จ (จะถูกเรียก startTrainingAfterCalibration)
      return;
    } else {
      // ใช้ข้อมูลที่บันทึกไว้
      engine.setCalibration(storedData);
    }
  }

  // 3. เริ่ม Training หลัง Calibration เสร็จ (หรือมีข้อมูลแล้ว)
  startTrainingAfterCalibration();
}

/**
 * เริ่ม Training หลังจาก Calibration เสร็จ
 */
async function startTrainingAfterCalibration() {
  // 1. Countdown 3-2-1
  await showCountdown();

  // 2. เต็มจอ
  try {
    await canvasElement.requestFullscreen();
  } catch (e) {
    console.warn("Fullscreen not supported:", e);
  }

  // 3. เริ่มบันทึก
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

  // 4. แสดง Timer และปุ่มหยุด
  trainingControls.classList.remove("hidden");
  trainingControls.classList.add("flex");
  trainingTimer.textContent = formatTime(TRAINING_DURATION_MS);

  // 5. เริ่ม Timer
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

  // 3. ซ่อน Training Controls
  trainingControls.classList.add("hidden");
  trainingControls.classList.remove("flex");

  // 4. ออกจาก Fullscreen
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  // 5. สรุปคะแนน
  const summary = scorer.getSessionSummary();
  const grade = ScoringManager.getGrade(summary.score, uiManager.currentLang);

  // 6. Export Data
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
        recordedSessionData.length / ((Date.now() - sessionStartTime) / 1000),
    },
    score_summary: { ...summary, grade: grade.label },
    all_errors: sessionLog,
    frames: recordedSessionData,
  };
  DataExporter.exportFullSession(fullDataset);

  // 7. แสดง Score Popup
  uiManager.showScoreSummary(summary.score, grade.label, summary.totalErrors);

  // 8. Reset UI และกลับหน้าแรก
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
  levelButtons.forEach((btn) =>
    btn.classList.remove("active", "bg-blue-600", "text-white", "font-bold")
  );
  levelButtons.forEach((btn) =>
    btn.classList.add("bg-gray-100", "text-gray-600", "font-medium")
  );
  startTrainingBtn.classList.add("hidden");
  startOverlay.classList.remove("hidden");
  uiManager.updateRecordButtonState(false);
}

// Event Listeners สำหรับ Training Flow
startTrainingBtn.addEventListener("click", startTrainingFlow);
stopEarlyBtn.addEventListener("click", endTrainingSession);

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    canvasElement.requestFullscreen().catch((err) => {
      console.error(`Error enabling fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});

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
  // ใช้ e.key เพื่อความทันสมัยและอ่านง่าย
  switch (e.key.toLowerCase()) {
    case "f":
      e.preventDefault(); // ป้องกันพฤติกรรม default ของเบราว์เซอร์
      fullscreenBtn.click();
      break;
    case "r":
      e.preventDefault();
      recordBtn.click();
      break;
  }
});

// 3. Data Loading Function
let referenceDataLoaded = false; // สถานะการโหลด Reference Data

async function loadReferenceData() {
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

    referenceDataLoaded = true;
    console.log(`✅ Loaded ${referencePath.length} points.`);
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

// 4. MediaPipe Processing
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw Video (Mirror)
  canvasCtx.scale(-1, 1);
  canvasCtx.translate(-canvasElement.width, 0);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  // Un-mirror for overlay text
  canvasCtx.scale(-1, 1);
  canvasCtx.translate(-canvasElement.width, 0);

  if (results.poseLandmarks) {
    if (calibrator.isActive) {
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
      if (referencePath.length > 0) {
        drawer.drawPath(referencePath, "rgba(0, 255, 0, 0.5)", 4);
      }

      drawer.drawSkeleton(results.poseLandmarks);

      if (!calibrator.isActive && referencePath.length > 0) {
        // 1. วิเคราะห์ด้วย Engine
        const feedbacks = engine.analyze(
          results.poseLandmarks,
          results.image.timeStamp,
          referencePath,
          currentExercise, // ส่งชื่อท่า
          currentLevel // ส่งเลเวล (L1, L2, L3)
        );
        drawer.drawFeedbackPanel(feedbacks);

        // 1.1 พูดแจ้งเตือนเมื่อมีข้อผิดพลาด (มี Cooldown ป้องกันพูดซ้ำเร็วเกินไป)
        audioManager.speakFeedback(feedbacks);

        // 2. *** เก็บข้อมูล (Data Logging) ***
        if (isRecording) {
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

// 5. Initialization
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
pose.onResults(onResults);

loadingOverlay.classList.remove("hidden");

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
    loadingOverlay.classList.add("hidden");
  },
  width: 1280,
  height: 720,
});

// ฟังก์ชันแสดง Error สำหรับกล้อง
function showCameraError(errorType) {
  loadingOverlay.classList.add("hidden");
  startOverlay.classList.remove("hidden");

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

  // แสดง Alert
  uiManager.showNotification(errorText.split("\n")[0], "error", 10000);

  // แสดงบน Overlay
  const overlayTitle = document.getElementById("overlay-title");
  if (overlayTitle) {
    overlayTitle.innerText = errorText.split("\n")[0];
  }

  console.error("Camera Error:", errorType);
}

// เริ่มต้นกล้องพร้อม Error Handling
async function initCamera() {
  try {
    await camera.start();
    console.log("Camera started successfully");
  } catch (error) {
    console.error("Camera initialization failed:", error);

    // จำแนกประเภท Error
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

loadReferenceData();
initCamera();
