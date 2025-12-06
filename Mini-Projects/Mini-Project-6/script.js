// --- ส่วนที่ 1: การตั้งค่าเบื้องต้น ---
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoElement = document.createElement("video");

// --- ส่วนที่ 2: Heuristic Rule #2 - Palm Orientation ---

/**
 * **ฟังก์ชันหลักสำหรับกฎข้อที่ 2 (Palm Orientation)**
 * วิเคราะห์การวางแนวของฝ่ามือขวาโดยเปรียบเทียบตำแหน่ง y ของนิ้วโป้งและนิ้วก้อย
 */
function checkPalmOrientation(landmarks) {
  if (!landmarks) return;

  try {
    // ดึงตำแหน่งข้อต่อที่จำเป็นสำหรับมือขวา
    const thumbRight = landmarks[22]; // นิ้วโป้งขวา
    const pinkyRight = landmarks[18]; // นิ้วก้อยขวา

    let orientation = "Neutral / Unclear";
    let feedbackColor = "white";

    // กำหนดค่าเกณฑ์ (Threshold) เพื่อป้องกันการสั่นของข้อมูล
    const ORIENTATION_THRESHOLD = 0.01; // 1% ของความสูงจอภาพ

    // ตรวจสอบตามตรรกะ
    // พิกัด y ใน Canvas: ค่า y น้อยกว่า = อยู่สูงกว่า
    if (thumbRight.y < pinkyRight.y - ORIENTATION_THRESHOLD) {
      orientation = "Palm DOWN (คว่ำ)";
      feedbackColor = "orange";
    } else if (thumbRight.y > pinkyRight.y + ORIENTATION_THRESHOLD) {
      orientation = "Palm UP (หงาย)";
      feedbackColor = "cyan";
    }

    // แสดง Feedback
    canvasCtx.font = "bold 24px Arial";
    canvasCtx.fillStyle = feedbackColor;
    canvasCtx.textAlign = "center";
    canvasCtx.fillText(
      `Right Hand: ${orientation}`,
      canvasElement.width / 2,
      40
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
    // วาดเฉพาะส่วนแขนและลำตัวเพื่อให้โฟกัสที่มือได้ง่ายขึ้น
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: "#FFFFFF",
      lineWidth: 2,
    });
    // วาดเฉพาะ Landmark ของมือให้ใหญ่เป็นพิเศษ
    const handLandmarks = [16, 18, 20, 22]; // ข้อมือ, นิ้วก้อย, นิ้วชี้, นิ้วโป้ง
    for (const index of handLandmarks) {
      const landmark = results.poseLandmarks[index];
      if (landmark) {
        canvasCtx.beginPath();
        canvasCtx.arc(
          landmark.x * canvasElement.width,
          landmark.y * canvasElement.height,
          8,
          0,
          2 * Math.PI
        );
        canvasCtx.fillStyle = "#FF0000";
        canvasCtx.fill();
      }
    }

    // **สำคัญ:** เรียกใช้ฟังก์ชัน Heuristic ของเรา
    checkPalmOrientation(results.poseLandmarks);
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
