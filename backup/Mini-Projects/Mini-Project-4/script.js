// --- ส่วนที่ 1: การตั้งค่าเบื้องต้น ---
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoElement = document.createElement("video");

// **ใหม่:** ตัวแปรสำหรับเก็บประวัติพิกัดของศีรษะ
let headYHistory = [];
const HISTORY_LENGTH_STABILITY = 30; // เก็บข้อมูลย้อนหลัง 30 เฟรม (ประมาณ 1 วินาที)

// --- ส่วนที่ 2: Heuristic Rules #4 & #5 ---

/**
 * **ฟังก์ชันหลักสำหรับกฎข้อที่ 4 (Vertical Stability)**
 * วิเคราะห์ความมั่นคงแนวดิ่งโดยดูการขยับขึ้นลงของศีรษะ
 */
function checkVerticalStability(landmarks) {
  if (!landmarks) return;

  const nose = landmarks[0]; // ใช้จมูกเป็นตัวแทนของศีรษะ
  if (nose) {
    headYHistory.push(nose.y);
    if (headYHistory.length > HISTORY_LENGTH_STABILITY) {
      headYHistory.shift(); // ลบข้อมูลที่เก่าที่สุดออก
    }
  }

  if (headYHistory.length < HISTORY_LENGTH_STABILITY) return;

  // หาค่า y สูงสุดและต่ำสุดในช่วงเวลาที่ผ่านมา
  const minY = Math.min(...headYHistory);
  const maxY = Math.max(...headYHistory);
  const displacement = maxY - minY;

  // กำหนดค่าเกณฑ์ (Threshold)
  const STABILITY_THRESHOLD = 0.03; // 3% ของความสูงจอภาพ

  let feedbackText = "Stability: OK";
  let feedbackColor = "lime";

  if (displacement > STABILITY_THRESHOLD) {
    feedbackText = "Heuristic #4 FAIL: Unstable Head";
    feedbackColor = "yellow";
  }

  // แสดง Feedback
  canvasCtx.font = "bold 24px Arial";
  canvasCtx.fillStyle = feedbackColor;
  canvasCtx.textAlign = "center";
  canvasCtx.fillText(feedbackText, canvasElement.width / 2, 40);
}

/**
 * **ฟังก์ชันหลักสำหรับกฎข้อที่ 5 (Weight Shift)**
 * วิเคราะห์การถ่ายน้ำหนักโดยดูตำแหน่งของสะโพกเทียบกับเท้า
 */
function checkWeightShift(landmarks) {
  if (!landmarks) return;

  try {
    // ดึงตำแหน่งข้อต่อที่จำเป็น
    const hipLeft = landmarks[23];
    const hipRight = landmarks[24];
    const ankleLeft = landmarks[27];
    const ankleRight = landmarks[28];

    // คำนวณจุดกึ่งกลางของสะโพกและเท้า
    const hipCenterX = (hipLeft.x + hipRight.x) / 2;
    const feetCenterX = (ankleLeft.x + ankleRight.x) / 2;

    let shiftStatus = "Centered";
    let feedbackColor = "white";

    // ตรวจสอบว่าสะโพกอยู่ฝั่งไหนเทียบกับจุดกึ่งกลางเท้า
    if (hipCenterX < feetCenterX - 0.05) {
      // 0.05 คือค่า buffer เล็กน้อย
      shiftStatus = "Shifted LEFT";
      feedbackColor = "cyan";
    } else if (hipCenterX > feetCenterX + 0.05) {
      shiftStatus = "Shifted RIGHT";
      feedbackColor = "cyan";
    }

    // แสดง Feedback
    canvasCtx.font = "bold 24px Arial";
    canvasCtx.fillStyle = feedbackColor;
    canvasCtx.textAlign = "center";
    canvasCtx.fillText(
      `Weight Shift: ${shiftStatus}`,
      canvasElement.width / 2,
      80
    );
  } catch (error) {}
}

// --- ส่วนที่ 3: การประมวลผลด้วย MediaPipe (Core Logic) ---

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
      color: "#FFFFFF",
      lineWidth: 2,
    }); // เปลี่ยนเป็นสีขาวเพื่อให้เห็นง่ายขึ้น
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FF0000",
      lineWidth: 2,
      radius: 3,
    });

    // **สำคัญ:** เรียกใช้ฟังก์ชัน Heuristic ของเรา
    checkVerticalStability(results.poseLandmarks);
    checkWeightShift(results.poseLandmarks);
  }
  canvasCtx.restore();
}

// --- ส่วนที่ 4: การตั้งค่า MediaPipe และกล้อง (เหมือนเดิม) ---
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
