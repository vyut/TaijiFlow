// =================================================================
//  TaijiFlow AI - Main Controller (script.js) v2.2 (UX Improved)
// =================================================================

// 1. Setup & Variables
const videoElement = document.getElementById("input_video");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const loadingOverlay = document.getElementById("loading-overlay");
const startOverlay = document.getElementById("start-overlay"); // Overlay ใหม่

// Instances
const engine = new HeuristicsEngine();
const calibrator = new CalibrationManager();
const uiManager = new UIManager(); // สร้าง Instance

// State Variables
let currentExercise = "rh_cw";
let currentLevel = "L1";
let referencePath = [];
let sessionLog = []; // เก็บประวัติการวิเคราะห์
let sessionStartTime = 0;
let recordedSessionData = []; // เก็บ Raw Data

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
  langBtn.innerText = newLang === "th" ? "🇹🇭 TH / 🇺🇸 EN" : "🇺🇸 EN / 🇹🇭 TH";
});

themeBtn.addEventListener("click", () => {
  uiManager.toggleTheme();
});

// เริ่มต้น UI
uiManager.init();

// ฟังก์ชันเริ่ม Calibration (ใช้ร่วมกันทั้งปุ่มเล็กและใหญ่)
function startCalibration() {
  calibrator.start();
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
    levelButtons.forEach((b) => {
      b.classList.remove("bg-blue-600", "text-white", "active", "shadow-sm");
      b.classList.add("bg-gray-100", "text-gray-600");
    });
    e.target.classList.remove("bg-gray-100", "text-gray-600");
    e.target.classList.add("bg-blue-600", "text-white", "active", "shadow-sm");

    currentLevel = e.target.dataset.level;
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
    recordBtn.innerText = "⏹️ จบการฝึก (Stop)";
    recordBtn.classList.replace("bg-red-100", "bg-red-600");
    recordBtn.classList.replace("text-red-600", "text-white");

    // Reset Data
    sessionLog = [];
    recordedSessionData = []; // ล้างค่าเก่า
    sessionStartTime = Date.now();
    console.log("Session Started & Recording Data...");
  } else {
    // --- จบการฝึก ---
    recordBtn.innerText = "⏺️ บันทึก (R)";
    recordBtn.classList.replace("bg-red-600", "bg-red-100");
    recordBtn.classList.replace("text-white", "text-red-600");

    // ดาวน์โหลดข้อมูลครบชุด (Report + Raw Data)
    downloadFullData();
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
      drawSkeleton(results.poseLandmarks);

      const calibResult = calibrator.process(results.poseLandmarks);
      calibrator.drawOverlay(
        canvasCtx,
        canvasElement.width,
        canvasElement.height
      );

      if (calibResult && calibResult.status === "complete") {
        engine.setCalibration(calibResult.data);

        // ใช้ข้อความจาก uiManager
        alert(uiManager.getText("alert_calib_success"));

        // Reset UI
        loadReferenceData();
        smallCalibrateBtn.classList.remove("hidden");
        cancelCalibBtn.classList.add("hidden");
      }
    } else {
      if (referencePath.length > 0) {
        drawPath(referencePath, "rgba(0, 255, 0, 0.5)", 4);
      }

      drawSkeleton(results.poseLandmarks);

      if (!calibrator.isActive && referencePath.length > 0) {
        // 1. วิเคราะห์ด้วย Engine
        const feedbacks = engine.analyze(
          results.poseLandmarks,
          results.image.timeStamp,
          referencePath,
          currentExercise, // ส่งชื่อท่า
          currentLevel // *** ส่งเลเวลไปด้วย (L1, L2, L3) ***
        );
        drawFeedbackPanel(feedbacks);

        // 2. *** เก็บข้อมูล (Data Logging) ***
        if (isRecording) {
          const currentTime = (Date.now() - sessionStartTime) / 1000;

          // เก็บ Snapshot ของเฟรมนี้
          recordedSessionData.push({
            timestamp: currentTime,
            landmarks: results.poseLandmarks, // เก็บพิกัดทั้งตัว
            active_feedbacks: feedbacks, // เก็บผลการตรวจ (ใช้เป็น Label ในอนาคต)
          });

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

function drawSkeleton(landmarks) {
  canvasCtx.save();
  canvasCtx.scale(-1, 1);
  canvasCtx.translate(-canvasElement.width, 0);
  drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS, {
    color: "#FFFFFF",
    lineWidth: 4,
  });
  drawLandmarks(canvasCtx, landmarks, {
    color: "#FF0000",
    lineWidth: 2,
    radius: 4,
  });
  canvasCtx.restore();
}

function drawPath(path, color, width) {
  canvasCtx.save();
  canvasCtx.scale(-1, 1);
  canvasCtx.translate(-canvasElement.width, 0);
  canvasCtx.beginPath();
  canvasCtx.strokeStyle = color;
  canvasCtx.lineWidth = width;
  if (path.length > 0) {
    canvasCtx.moveTo(
      path[0].x * canvasElement.width,
      path[0].y * canvasElement.height
    );
    for (let i = 1; i < path.length; i++) {
      canvasCtx.lineTo(
        path[i].x * canvasElement.width,
        path[i].y * canvasElement.height
      );
    }
  }
  canvasCtx.stroke();
  canvasCtx.restore();
}

function drawFeedbackPanel(feedbacks) {
  if (feedbacks.length === 0) return;
  const boxX = 20,
    boxY = 20,
    padding = 15,
    lineHeight = 30;
  const boxWidth = 450;
  const boxHeight = feedbacks.length * lineHeight + padding * 2;

  canvasCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
  canvasCtx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
  canvasCtx.fill();

  canvasCtx.font = 'bold 20px "Sarabun", sans-serif';
  canvasCtx.fillStyle = "#FFD700";
  canvasCtx.textAlign = "left";
  canvasCtx.textBaseline = "top";

  feedbacks.forEach((text, index) => {
    canvasCtx.fillText(
      text,
      boxX + padding,
      boxY + padding + index * lineHeight
    );
  });
}

// --- ส่วนที่ 3: ฟังก์ชันดาวน์โหลดรายงาน ---
function downloadSessionReport() {
  if (sessionLog.length === 0) {
    alert("การฝึกเสร็จสิ้น! (ไม่มีข้อผิดพลาดที่บันทึกไว้)");
    return;
  }

  const report = {
    date: new Date().toLocaleString(),
    exercise: currentExercise,
    level: currentLevel,
    duration: ((Date.now() - sessionStartTime) / 1000).toFixed(2) + " seconds",
    total_issues: sessionLog.length,
    details: sessionLog,
  };

  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `taiji_report_${new Date().getTime()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  alert("บันทึกรายงานผลการฝึกเรียบร้อยแล้ว!");
}

function downloadFullData() {
  if (recordedSessionData.length === 0) {
    alert("ไม่มีข้อมูลการบันทึก");
    return;
  }

  const fullDataset = {
    meta: {
      date: new Date().toISOString(),
      exercise: currentExercise,
      level: currentLevel,
      // สำคัญ: บันทึกค่า Calibrate ไว้ด้วย เพื่อนำไปใช้ Train Model ให้แม่นยำ
      user_calibration: engine.calibrationData,
    },
    summary: {
      duration: ((Date.now() - sessionStartTime) / 1000).toFixed(2),
      total_issues: sessionLog.length,
      issue_log: sessionLog, // Log แบบอ่านง่าย
    },
    raw_data: recordedSessionData, // ข้อมูลดิบสำหรับ ML
  };

  const jsonString = JSON.stringify(fullDataset, null, 2); // จัดรูปแบบสวยงาม
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // สร้างชื่อไฟล์ที่มี timestamp เพื่อไม่ให้ซ้ำ
  const filename = `taiji_data_${currentExercise}_${new Date().getTime()}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  alert(`บันทึกข้อมูลสำเร็จ! (${recordedSessionData.length} frames)`);
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
