// --- ส่วนที่ 1: การตั้งค่าเบื้องต้น ---
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoElement = document.createElement("video");

// **ใหม่:** ตัวแปรสำหรับเก็บข้อมูลความเร็วและประวัติ
let userSpeedHistory = [];
let referenceSpeedProfile = [];
const HISTORY_LENGTH_SPEED = 5; // ใช้ค่าเฉลี่ยความเร็ว 5 เฟรมล่าสุดเพื่อลดการแกว่งของข้อมูล

// --- ส่วนที่ 2: ฟังก์ชันเตรียมการและช่วยคำนวณ ---

function calculateDistance(p1, p2) {
  if (!p1 || !p2) return 0;
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * **ใหม่:** ฟังก์ชันสำหรับคำนวณโปรไฟล์ความเร็วของเส้นทางต้นแบบ
 * จะถูกเรียกใช้แค่ครั้งเดียวตอนเริ่มต้น
 */
function calculateReferenceSpeedProfile(path) {
  const speedProfile = [];
  if (path.length < 2) return [];

  for (let i = 1; i < path.length; i++) {
    // คำนวณระยะห่าง (ความเร็ว) ระหว่างจุดปัจจุบันกับจุดก่อนหน้า
    const speed = calculateDistance(path[i - 1], path[i]);
    speedProfile.push(speed);
  }
  return speedProfile;
}

// --- ส่วนที่ 3: Heuristic Rule #6 - Speed Control ---

/**
 * **ฟังก์ชันหลักสำหรับกฎข้อที่ 6 (Speed Control)**
 * วิเคราะห์ความเร็วของผู้ใช้เทียบกับต้นแบบ
 */
function checkSpeedControl(userWrist, referencePath, referenceSpeed) {
  if (!userWrist || referencePath.length === 0 || userSpeedHistory.length < 2)
    return;

  // 1. คำนวณความเร็วปัจจุบันของผู้ใช้
  const currentUserSpeed = calculateDistance(
    userSpeedHistory[userSpeedHistory.length - 2],
    userSpeedHistory[userSpeedHistory.length - 1]
  );

  // 2. หาจุดที่ใกล้ที่สุดบนเส้นทางต้นแบบเพื่อหาว่าผู้ใช้อยู่ส่วนไหนของท่ารำ
  let minDistance = Infinity;
  let closestPointIndex = -1;
  for (let i = 0; i < referencePath.length; i++) {
    const distance = calculateDistance(userWrist, referencePath[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestPointIndex = i;
    }
  }

  if (closestPointIndex === -1) return;

  // 3. ดึง "ความเร็วมาตรฐาน" ณ จุดนั้นๆ จากโปรไฟล์ความเร็วที่เราคำนวณไว้
  // (ใช้ index - 1 เพราะ speed profile จะสั้นกว่า path 1 ช่อง)
  const standardSpeed = referenceSpeed[closestPointIndex - 1] || 0;

  // 4. เปรียบเทียบความเร็ว
  const speedDifference = currentUserSpeed - standardSpeed;
  const SPEED_THRESHOLD = 0.005; // ค่าเกณฑ์ที่ยอมรับได้

  let feedbackText = `Speed: OK`;
  let feedbackColor = "lime";

  if (speedDifference > SPEED_THRESHOLD) {
    feedbackText = "Heuristic #6 FAIL: Too Fast";
    feedbackColor = "orange";
  } else if (speedDifference < -SPEED_THRESHOLD) {
    feedbackText = "Heuristic #6 FAIL: Too Slow";
    feedbackColor = "yellow";
  }

  // 5. แสดง Feedback
  canvasCtx.font = "bold 24px Arial";
  canvasCtx.fillStyle = feedbackColor;
  canvasCtx.textAlign = "center";
  canvasCtx.fillText(feedbackText, canvasElement.width / 2, 40);

  // แสดงค่า (สำหรับ Debug)
  canvasCtx.font = "18px Arial";
  canvasCtx.fillStyle = "white";
  canvasCtx.textAlign = "left";
  canvasCtx.fillText(`User Speed: ${currentUserSpeed.toFixed(4)}`, 20, 430);
  canvasCtx.fillText(`Standard Speed: ${standardSpeed.toFixed(4)}`, 20, 460);
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
      color: "#FFFFFF",
      lineWidth: 2,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FF0000",
      lineWidth: 2,
      radius: 3,
    });

    const rightWrist = results.poseLandmarks[16];
    if (rightWrist) {
      // เพิ่มตำแหน่งปัจจุบันลงในประวัติ
      userSpeedHistory.push(rightWrist);
      if (userSpeedHistory.length > HISTORY_LENGTH_SPEED) {
        userSpeedHistory.shift();
      }
    }

    // **สำคัญ:** เรียกใช้ฟังก์ชัน Heuristic ของเรา
    if (referenceSpeedProfile.length > 0) {
      checkSpeedControl(rightWrist, referencePath, referenceSpeedProfile);
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

// **ใหม่:** คำนวณโปรไฟล์ความเร็วของต้นแบบ "แค่ครั้งเดียว" ตอนเริ่มต้น
if (typeof referencePath !== "undefined" && referencePath.length > 0) {
  referenceSpeedProfile = calculateReferenceSpeedProfile(referencePath);
  console.log("Reference speed profile calculated successfully.");
} else {
  console.log(
    "Reference path data not found. Please record a path first (Press 'R')."
  );
}
