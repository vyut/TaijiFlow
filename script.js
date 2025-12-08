// =================================================================
//  TaijiFlow AI - Main Controller (script.js) v2.4 (Audio Feedback Added)
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
let currentExercise = "rh_cw"; // เก็บชื่อท่าที่กำลังฝึก
let currentLevel = "L1"; // เก็บระดับความยาก (L1, L2, L3)
let referencePath = []; // เก็บข้อมูลเส้นทางต้นแบบที่โหลดมาจากไฟล์ JSON
let sessionLog = []; // เก็บประวัติข้อผิดพลาดที่เกิดขึ้นระหว่างการฝึก (สำหรับ Report แบบสรุป)
let sessionStartTime = 0;
let recordedSessionData = []; // เก็บข้อมูลดิบทั้งหมดแบบเฟรมต่อเฟรม (สำหรับนำไปใช้กับ Machine Learning)
let currentSessionId = null; // Unique ID สำหรับแต่ละ Session

// สร้าง User ID (เก็บใน LocalStorage เพื่อให้คงที่ตลอดการใช้งาน)
function getOrCreateUserId() {
  let userId = localStorage.getItem('taijiflow_user_id');
  if (!userId) {
    userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    localStorage.setItem('taijiflow_user_id', userId);
  }
  return userId;
}

// สร้าง Session ID ใหม่ทุกครั้งที่เริ่มบันทึก
function generateSessionId() {
  return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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

const bigCalibrateBtn = document.getElementById("big-calibrate-btn"); // ปุ่มใหญ่
const smallCalibrateBtn = document.getElementById("small-calibrate-btn"); // ปุ่มเล็ก
const cancelCalibBtn = document.getElementById("cancel-calib-btn");

const langBtn = document.getElementById("lang-btn");
const themeBtn = document.getElementById("theme-btn");

langBtn.addEventListener("click", () => {
  const newLang = uiManager.toggleLanguage();
  audioManager.setLanguage(newLang); // Sync เสียงพูดกับภาษา
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

// ฟังก์ชันเริ่ม Calibration (ใช้ร่วมกันทั้งปุ่มเล็กและใหญ่)
function startCalibration() {
  calibrator.start();
  audioManager.announce("calib_start"); // พูดแจ้งเตือน
  referencePath = []; // ซ่อน Path ชั่วคราว

  // UI Updates
  startOverlay.classList.add("hidden"); // ซ่อน Overlay ใหญ่เสมอเมื่อเริ่ม
  smallCalibrateBtn.classList.add("hidden");
  cancelCalibBtn.classList.remove("hidden");
}

// ผูก Event Listeners
bigCalibrateBtn.addEventListener("click", startCalibration);
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
  currentExercise = e.target.value;
  loadReferenceData();
});

levelButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    currentLevel = e.target.dataset.level;
    uiManager.updateLevelButtons(currentLevel);
    loadReferenceData();
  });
});

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
    const gradeInfo = ScoringManager.getGrade(scoreSummary.score);

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
          fps_estimated: Math.round(scoreSummary.totalFrames / scoreSummary.durationSeconds),
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
async function loadReferenceData() {
  const filename = `data/${currentExercise}_${currentLevel}.json`;
  console.log(`Loading reference data from: ${filename}`);

  try {
    const response = await fetch(filename);
    if (!response.ok) throw new Error("File not found");
    const data = await response.json();
    referencePath = data.map((frame) => {
      const wrist = frame.landmarks[16];
      return { x: wrist.x, y: wrist.y };
    });
    console.log(`Loaded ${referencePath.length} points.`);
  } catch (error) {
    console.warn("Reference data not found (User needs to record).");
    referencePath = [];
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

loadReferenceData();
camera.start();
