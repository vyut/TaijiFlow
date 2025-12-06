// --- ส่วนที่ 1: การตั้งค่าเบื้องต้น ---
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoElement = document.createElement("video");

// ตัวแปรสำหรับเก็บข้อมูลจากเฟรมก่อนหน้าเพื่อใช้ในการคำนวณ
let lastLandmarks = null;
let lastTimestamp = -1;

// --- ส่วนที่ 2: ฟังก์ชันช่วยคำนวณ (Helper Functions) ---

/**
 * คำนวณมุมของเส้นตรงที่เกิดจากจุด 2 จุด เทียบกับแกนแนวนอน (ผลลัพธ์เป็นองศา)
 */
function getLineAngle(p1, p2) {
  const radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  return (radians * 180) / Math.PI;
}

/**
 * คำนวณความเร็วเชิงมุม (องศาต่อวินาที)
 */
function getAngularVelocity(angle1, angle2, deltaTime) {
  // deltaTime ต้องมีค่ามากกว่า 0 เพื่อไม่ให้หารด้วยศูนย์
  if (deltaTime === 0) return 0;
  // คำนวณผลต่างของมุม (จัดการกรณีข้าม 180/-180 องศา)
  let angleDiff = angle2 - angle1;
  if (angleDiff > 180) {
    angleDiff -= 360;
  }
  if (angleDiff < -180) {
    angleDiff += 360;
  }

  return Math.abs(angleDiff / deltaTime); // คืนค่าเป็นบวกเสมอ
}

// --- ส่วนที่ 3: Heuristic Rule #3 - Waist Initiation ---

/**
 * **นี่คือฟังก์ชันหลักสำหรับกฎข้อที่ 3**
 * วิเคราะห์และแสดง Feedback เกี่ยวกับการเริ่มต้นการเคลื่อนไหว
 */
function checkWaistInitiation(landmarks, timestamp) {
  if (!landmarks) return; // ออกถ้าไม่มีข้อมูล

  // ถ้ายังไม่มีข้อมูลเฟรมก่อนหน้า ให้เก็บข้อมูลปัจจุบันไว้แล้วออก
  if (lastTimestamp === -1) {
    lastTimestamp = timestamp;
    lastLandmarks = landmarks;
    return;
  }

  const deltaTime = (timestamp - lastTimestamp) / 1000; // แปลง ms เป็น s
  if (deltaTime < 0.01) return; // ข้ามไปถ้าเฟรมติดกันเกินไป

  try {
    // ดึงตำแหน่งข้อต่อที่จำเป็น
    const currentShoulderLeft = landmarks[11];
    const currentShoulderRight = landmarks[12];
    const currentHipLeft = landmarks[23];
    const currentHipRight = landmarks[24];

    const lastShoulderLeft = lastLandmarks[11];
    const lastShoulderRight = lastLandmarks[12];
    const lastHipLeft = lastLandmarks[23];
    const lastHipRight = lastLandmarks[24];

    // คำนวณมุมของแกนหัวไหล่และสะโพกในเฟรมปัจจุบันและเฟรมก่อนหน้า
    const currentShoulderAngle = getLineAngle(
      currentShoulderLeft,
      currentShoulderRight
    );
    const currentHipAngle = getLineAngle(currentHipLeft, currentHipRight);
    const lastShoulderAngle = getLineAngle(lastShoulderLeft, lastShoulderRight);
    const lastHipAngle = getLineAngle(lastHipLeft, lastHipRight);

    // คำนวณความเร็วเชิงมุม
    const shoulderVelocity = getAngularVelocity(
      lastShoulderAngle,
      currentShoulderAngle,
      deltaTime
    );
    const hipVelocity = getAngularVelocity(
      lastHipAngle,
      currentHipAngle,
      deltaTime
    );

    // กำหนดค่าเกณฑ์ (Threshold) เพื่อดูว่ามีการเคลื่อนไหวที่มีนัยสำคัญหรือไม่
    const MOVEMENT_THRESHOLD = 5; // องศาต่อวินาที

    // ตรวจสอบตามกฎ
    let feedbackText = "OK";
    let feedbackColor = "lime";

    if (
      shoulderVelocity > MOVEMENT_THRESHOLD &&
      hipVelocity < MOVEMENT_THRESHOLD
    ) {
      feedbackText = "ERROR: Start with WAIST, not SHOULDER";
      feedbackColor = "yellow";
    }

    // แสดงผล Feedback
    canvasCtx.font = "bold 24px Arial";
    canvasCtx.fillStyle = feedbackColor;
    canvasCtx.textAlign = "center";
    canvasCtx.fillText(feedbackText, canvasElement.width / 2, 40);

    // แสดงค่าความเร็ว (สำหรับ Debug)
    canvasCtx.font = "18px Arial";
    canvasCtx.fillStyle = "white";
    canvasCtx.textAlign = "left";
    canvasCtx.fillText(`Shoulder Vel: ${shoulderVelocity.toFixed(2)}`, 20, 430);
    canvasCtx.fillText(`Hip Vel: ${hipVelocity.toFixed(2)}`, 20, 460);
  } catch (error) {}

  // อัปเดตข้อมูลสำหรับใช้ในเฟรมถัดไป
  lastTimestamp = timestamp;
  lastLandmarks = landmarks;
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

    // **สำคัญ:** เรียกใช้ฟังก์ชัน Heuristic ของเรา
    checkWaistInitiation(results.poseLandmarks, results.image.timeStamp);
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
