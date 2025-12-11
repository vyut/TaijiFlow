// --- ส่วนที่ 1: การตั้งค่าเบื้องต้น ---
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoElement = document.createElement("video");

// --- ส่วนที่ 2: จัดการโหมดการทำงานและข้อมูล ---
let isRecording = false;
let recordedPath = [];

function toggleRecording() {
  isRecording = !isRecording;
  if (isRecording) {
    recordedPath = [];
    console.log("--- Recording Started ---");
  } else {
    console.log("--- Recording Stopped ---");
    console.log("Copy the code below and save it as reference_path.js");
    console.log(`const referencePath = ${JSON.stringify(recordedPath)};`);
  }
}
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") {
    toggleRecording();
  }
});

// --- ส่วนที่ 3: Heuristic Rule #1 - Path Accuracy ---

/**
 * คำนวณระยะห่างระหว่างจุด 2 จุด (p1, p2) บนระนาบ 2 มิติ
 * @param {{x: number, y: number}} p1 - จุดที่ 1
 * @param {{x: number, y: number}} p2 - จุดที่ 2
 * @returns {number} ระยะห่าง
 */
function calculateDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * วาดเส้นทางอ้างอิง (referencePath) ลงบน Canvas
 * @param {Array<{x: number, y: number}>} path - ชุดข้อมูลพิกัดของเส้นทาง
 */
function drawReferencePath(path) {
  canvasCtx.strokeStyle = "rgba(0, 150, 255, 0.7)"; // สีฟ้าโปร่งแสง
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

/**
 * **นี่คือฟังก์ชันหลักสำหรับกฎข้อที่ 1**
 * วิเคราะห์ว่าข้อมือของผู้ใช้ (userWrist) อยู่ห่างจากเส้นทางอ้างอิง (referencePath) เกินกว่าที่กำหนดหรือไม่
 * @param {{x: number, y: number}} userWrist - พิกัดข้อมือปัจจุบันของผู้ใช้
 * @param {Array<{x: number, y: number}>} referencePath - ชุดข้อมูลพิกัดของเส้นทางอ้างอิง
 */
function checkPathAccuracy(userWrist, referencePath) {
  if (!userWrist || referencePath.length === 0) return;

  let minDistance = Infinity;
  // หาจุดที่ใกล้ที่สุดในเส้นทางต้นแบบ
  for (const refPoint of referencePath) {
    const distance = calculateDistance(userWrist, refPoint);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  // กำหนดค่าเกณฑ์ (Threshold) ที่ยอมรับได้ (เช่น 5% ของความกว้างจอ)
  const threshold = 0.05;

  // ถ้าค่าระยะห่างน้อยสุดยังมากกว่า Threshold ให้แสดง Feedback
  if (minDistance > threshold) {
    canvasCtx.font = "bold 24px Arial";
    canvasCtx.fillStyle = "yellow";
    canvasCtx.textAlign = "left";
    canvasCtx.fillText("Heuristic #1 FAIL: Path Accuracy", 20, 80);
  }
}

// --- ส่วนที่ 4: การประมวลผลด้วย MediaPipe (Core Logic) ---

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

  if (results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 4,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FF0000",
      lineWidth: 2,
    });

    const rightWrist = results.poseLandmarks[16];

    if (isRecording) {
      // โหมดบันทึก: แสดงสถานะและเก็บข้อมูล
      canvasCtx.font = "bold 30px Arial";
      canvasCtx.fillStyle = "red";
      canvasCtx.textAlign = "left";
      canvasCtx.fillText("RECORDING...", 20, 40);
      if (rightWrist) {
        recordedPath.push({ x: rightWrist.x, y: rightWrist.y });
      }
    } else {
      // โหมดวิเคราะห์: วาดเส้นทางและเรียกใช้ Heuristic
      if (typeof referencePath !== "undefined" && referencePath.length > 0) {
        drawReferencePath(referencePath);
        if (rightWrist) {
          checkPathAccuracy(rightWrist, referencePath);
        }
      }
    }
  }
  canvasCtx.restore();
}

// --- ส่วนที่ 5: การตั้งค่า MediaPipe และกล้อง ---
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
