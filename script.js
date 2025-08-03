// =================================================================
//  AI Silk Reeling Training Assistant - script.js (ฉบับสมบูรณ์)
// =================================================================

// --- ส่วนที่ 1: การตั้งค่าและตัวแปรหลัก ---

const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const videoElement = document.createElement("video");

let isRecording = false;
let recordedPath = [];

console.log("Analysis mode is active. Press 'R' to switch to recording mode.");

// =================================================================
//  ส่วนที่ 2: ฟังก์ชันจัดการการทำงาน (Event Handlers & Controls)
// =================================================================

/**
 * สลับโหมดระหว่างการบันทึก (Recording) และการวิเคราะห์ (Analysis)
 */
function toggleRecording() {
  if (!isRecording) {
    isRecording = true;
    recordedPath = [];
    console.log("--- Recording Started ---");
  } else {
    isRecording = false;
    console.log("--- Recording Stopped ---");
    console.log("Copy the array below and save it as reference_data.js");
    console.log(
      `const referencePath_rh_cw_L1 = ${JSON.stringify(recordedPath)};`
    );
  }
}

/**
 * ทำให้ Canvas แสดงผลเต็มหน้าจอหรือกลับสู่ขนาดปกติ
 */
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    canvasElement.requestFullscreen().catch((err) => {
      alert(
        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
      );
    });
  } else {
    document.exitFullscreen();
  }
}

// --- การดักจับ Event จากผู้ใช้ ---

fullscreenBtn.addEventListener("click", toggleFullScreen);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "r") {
    toggleRecording();
  }
  // --- ใหม่: เพิ่มการตรวจสอบคีย์ 'ด' ---
  if (key === "f" || key === "ด") {
    toggleFullScreen();
  }
});

// =================================================================
//  ส่วนที่ 3: Heuristics Engine (กลไกการวิเคราะห์และวาดผล)
// =================================================================

function calculateDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function drawReferencePath(path) {
  canvasCtx.strokeStyle = "rgba(0, 150, 255, 0.7)";
  canvasCtx.lineWidth = 5;
  canvasCtx.beginPath();
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
}

function analyzePathAccuracy(userWrist, referencePath) {
  if (!userWrist || referencePath.length === 0) return;

  let minDistance = Infinity;

  for (const refPoint of referencePath) {
    const distance = calculateDistance(userWrist, refPoint);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  const threshold = 0.05;

  if (minDistance > threshold) {
    canvasCtx.font = "bold 24px Arial";
    canvasCtx.fillStyle = "yellow";
    canvasCtx.textAlign = "left";
    canvasCtx.fillText("ควบคุมเส้นทางให้อยู่ในแนว!", 20, 80);
  }
}

// =================================================================
//  ส่วนที่ 4: การประมวลผลด้วย MediaPipe (Core Logic)
// =================================================================

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  if (isRecording) {
    canvasCtx.font = "bold 30px Arial";
    canvasCtx.fillStyle = "red";
    canvasCtx.textAlign = "left";
    canvasCtx.fillText("RECORDING...", 20, 40);
  }

  if (results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 4,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FF0000",
      lineWidth: 2,
    });

    if (isRecording) {
      const rightWrist = results.poseLandmarks[16];
      if (rightWrist) {
        recordedPath.push({ x: rightWrist.x, y: rightWrist.y });
      }
    } else {
      if (typeof referencePath_rh_cw_L1 !== "undefined") {
        drawReferencePath(referencePath_rh_cw_L1);
        const userRightWrist = results.poseLandmarks[16];
        if (userRightWrist) {
          analyzePathAccuracy(userRightWrist, referencePath_rh_cw_L1);
        }
      }
    }
  }

  canvasCtx.restore();
}

// =================================================================
//  ส่วนที่ 5: การตั้งค่า MediaPipe และกล้อง (Initialization)
// =================================================================

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

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});

camera.start();
