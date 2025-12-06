// --- ส่วนที่ 1: การตั้งค่าเบื้องต้น ---
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoElement = document.createElement("video");

// **ใหม่:** ตัวแปรสำหรับเก็บประวัติการเคลื่อนไหว
let landmarksHistory = []; // เก็บข้อมูล landmark ย้อนหลังหลายเฟรม
const HISTORY_LENGTH = 10; // เก็บข้อมูลย้อนหลัง 10 เฟรม

// **ใหม่:** ตัวแปรสำหรับกฎ #8 (Continuity)
let pauseCounter = 0;
const PAUSE_THRESHOLD_FRAMES = 10; // ถ้าหยุดนิ่งเกิน 10 เฟรม (ประมาณ 0.3 วินาที)

// --- ส่วนที่ 2: ฟังก์ชันช่วยคำนวณ ---

function calculateDistance(p1, p2) {
  if (!p1 || !p2) return 0;
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// --- ส่วนที่ 3: Heuristic Rules #7 & #8 ---

/**
 * **ฟังก์ชันหลักสำหรับกฎข้อที่ 7 (Smoothness)**
 * วิเคราะห์ความไหลลื่นโดยการคำนวณ "ความเร่ง" ของข้อมือ
 */
function checkSmoothness(history) {
  if (history.length < 3) return; // ต้องการข้อมูลอย่างน้อย 3 เฟรมเพื่อคำนวณความเร่ง

  // ดึงข้อมูล 3 เฟรมล่าสุด
  const pos3 = history[history.length - 1].wrist; // ปัจจุบัน
  const pos2 = history[history.length - 2].wrist; // ก่อนหน้า
  const pos1 = history[history.length - 3].wrist; // ก่อนหน้าอีก

  if (!pos1 || !pos2 || !pos3) return;

  // คำนวณความเร็ว
  const vel1 = calculateDistance(pos1, pos2); // ความเร็วในช่วงแรก
  const vel2 = calculateDistance(pos2, pos3); // ความเร็วในช่วงที่สอง

  // คำนวณความเร่ง (การเปลี่ยนแปลงของความเร็ว)
  const acceleration = Math.abs(vel2 - vel1);

  // กำหนดค่าเกณฑ์ (Threshold) สำหรับการกระตุก
  const JERK_THRESHOLD = 0.01; // ค่านี้ต้องปรับจูนจากการทดลองจริง

  if (acceleration > JERK_THRESHOLD) {
    canvasCtx.font = "bold 24px Arial";
    canvasCtx.fillStyle = "orange";
    canvasCtx.textAlign = "center";
    canvasCtx.fillText(
      "Heuristic #7 FAIL: Movement is Jerky",
      canvasElement.width / 2,
      40
    );
  }
}

/**
 * **ฟังก์ชันหลักสำหรับกฎข้อที่ 8 (Continuity)**
 * วิเคราะห์ความต่อเนื่องโดยการตรวจสอบว่าข้อมือหยุดนิ่งนานเกินไปหรือไม่
 */
function checkContinuity(history) {
  if (history.length < 2) return;

  const pos2 = history[history.length - 1].wrist; // ปัจจุบัน
  const pos1 = history[history.length - 2].wrist; // ก่อนหน้า

  if (!pos1 || !pos2) return;

  const velocity = calculateDistance(pos1, pos2);
  const STOP_THRESHOLD = 0.002; // ค่าเกณฑ์สำหรับถือว่า "หยุดนิ่ง"

  if (velocity < STOP_THRESHOLD) {
    pauseCounter++;
  } else {
    pauseCounter = 0; // รีเซ็ตตัวนับถ้ามีการเคลื่อนไหว
  }

  if (pauseCounter > PAUSE_THRESHOLD_FRAMES) {
    canvasCtx.font = "bold 24px Arial";
    canvasCtx.fillStyle = "yellow";
    canvasCtx.textAlign = "center";
    canvasCtx.fillText(
      "Heuristic #8 FAIL: Movement Paused",
      canvasElement.width / 2,
      80
    );
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

    // **ใหม่:** เพิ่มข้อมูลปัจจุบันลงในประวัติ
    const rightWrist = results.poseLandmarks[16];
    landmarksHistory.push({ wrist: rightWrist });

    // จำกัดความยาวของประวัติข้อมูลไม่ให้ยาวเกินไป
    if (landmarksHistory.length > HISTORY_LENGTH) {
      landmarksHistory.shift(); // ลบข้อมูลที่เก่าที่สุดออก
    }

    // **สำคัญ:** เรียกใช้ฟังก์ชัน Heuristic ของเรา
    checkSmoothness(landmarksHistory);
    checkContinuity(landmarksHistory);
  }
  canvasCtx.restore();
}

// --- ส่วนที่ 5: การตั้งค่า MediaPipe และกล้อง (เหมือนเดิม) ---
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
