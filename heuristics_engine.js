/**
 * TaijiFlow AI - Heuristics Engine v2.1
 * รองรับ Dynamic Thresholds จากการ Calibration
 */

class HeuristicsEngine {
  constructor() {
    // *** ตัวแปรสำหรับเก็บข้อมูล Calibration ***
    this.calibrationData = null; // จะถูก set เมื่อ calibrate เสร็จ

    // *** ตัวแปร State & History เดิม ***
    this.lastLandmarks = null;
    this.lastTimestamp = -1;
    this.headYHistory = [];
    this.HISTORY_LENGTH_STABILITY = 30;
    this.wristHistory = [];
    this.HISTORY_LENGTH_WRIST = 10;
    this.pauseCounter = 0;

    // *** ตารางกำหนดว่า Level ไหน ต้องตรวจกฎข้อไหนบ้าง ***
    this.RULES_CONFIG = {
      L1: {
        // ท่านั่ง
        checkPath: true,
        checkRotation: true,
        checkElbow: true,
        checkWaist: true, // เอวหมุนได้แม้นั่ง
        checkStability: false, // นั่งอยู่ ตัวนิ่งอยู่แล้ว ไม่ต้องตรวจเข้ม
        checkSmooth: true,
        checkContinuity: true,
        checkWeight: false, // นั่งอยู่ ไม่มีการถ่ายน้ำหนักขา
      },
      L2: {
        // ท่ายืน
        checkPath: true,
        checkRotation: true,
        checkElbow: true,
        checkWaist: true,
        checkStability: true, // ยืนแล้ว ต้องตรวจการโยกตัว
        checkSmooth: true,
        checkContinuity: true,
        checkWeight: false, // ยืนเฉยๆ อาจยังไม่เน้นถ่ายน้ำหนักมาก
      },
      L3: {
        // ท่ายืนย่อ (Bow Stance)
        checkPath: true,
        checkRotation: true,
        checkElbow: true,
        checkWaist: true,
        checkStability: true,
        checkSmooth: true,
        checkContinuity: true,
        checkWeight: true, // *** สำคัญมากสำหรับเลเวลนี้ ***
      },
    };

    // กำหนดความสำคัญ (ค่าน้อย = สำคัญมาก)
    this.RULE_PRIORITY = {
        'Path Accuracy': 1,
        'Waist Initiation': 2,
        'Weight Shift': 3,
        'Vertical Stability': 4,
        'Arm Rotation': 5,
        'Elbow Sinking': 6,
        'Smoothness': 7,
        'Continuity': 8
    };
  }

  /**
   * รับค่าสัดส่วนร่างกายของผู้ใช้มาเก็บไว้
   */
  setCalibration(data) {
    this.calibrationData = data;
    console.log("Engine updated with user metrics:", this.calibrationData);
  }

  analyze(landmarks, timestamp, referencePath, currentExercise, currentLevel) {
    const feedbacks = [];
    if (!landmarks) return feedbacks;

    // ดึง Config ของเลเวลปัจจุบันมาดู
    const config = this.RULES_CONFIG[currentLevel];

    // ถ้าไม่เจอ Config ให้ใช้ของ L3 (ตรวจหมด)
    const rules = config || this.RULES_CONFIG["L3"];

    // ดึงจุดสำคัญ (Keypoints)
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftPinky = landmarks[17];
    const rightPinky = landmarks[18];
    const leftThumb = landmarks[21];
    const rightThumb = landmarks[22];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // --- เริ่มตรวจสอบตาม Config ---

    // --- กลุ่มที่ 1: รูปแบบภายนอก ---

    // 1. Path Accuracy
    if (rules.checkPath && referencePath && referencePath.length > 0) {
      const pathError = this.checkPathAccuracy(rightWrist, referencePath);
      if (pathError) feedbacks.push(pathError);
    }

    // 2. Arm Rotation
    if (rules.checkRotation) {
      const rotationError = this.checkArmRotation(
        rightThumb,
        rightPinky,
        rightWrist,
        rightElbow,
        currentExercise
      );
      if (rotationError) feedbacks.push(rotationError);
    }

    // 3. Elbow Sinking
    if (rules.checkElbow) {
      const elbowError = this.checkElbowSinking(
        rightShoulder,
        rightElbow,
        rightWrist
      );
      if (elbowError) feedbacks.push(elbowError);
    }

    // --- กลุ่มที่ 2: คุณภาพภายใน ---

    // 4. Waist Initiation
    if (rules.checkWaist) {
      const waistError = this.checkWaistInitiation(landmarks, timestamp);
      if (waistError) feedbacks.push(waistError);
    }

    // 5. Vertical Stability
    if (rules.checkStability) {
      const stabilityError = this.checkVerticalStability(nose);
      if (stabilityError) feedbacks.push(stabilityError);
    }

    // 6. Smoothness
    if (rules.checkSmooth) {
      const smoothnessError = this.checkSmoothness(rightWrist);
      if (smoothnessError) feedbacks.push(smoothnessError);
    }

    // --- กลุ่มที่ 3: ขั้นสูง ---

    // 7. Continuity
    if (rules.checkContinuity) {
      const continuityError = this.checkContinuity();
      if (continuityError) feedbacks.push(continuityError);
    }

    // 8. Weight Shifting (เฉพาะ L3 ตาม Config)
    if (rules.checkWeight) {
      const weightError = this.checkWeightShift(
        leftHip,
        rightHip,
        leftAnkle,
        rightAnkle
      );
      if (weightError) feedbacks.push(weightError);
    }

    return feedbacks;
  }

  // ================= Helper Functions =================

  calculateDistance(p1, p2) {
    if (!p1 || !p2) return 0;
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  getLineAngle(p1, p2) {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  }

  getAngularVelocity(angle1, angle2, deltaTime) {
    if (deltaTime <= 0) return 0;
    let diff = angle2 - angle1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return Math.abs(diff / deltaTime);
  }

  // ================= Rule Implementations =================

  checkPathAccuracy(userWrist, referencePath) {
    let minDistance = Infinity;
    for (const refPoint of referencePath) {
      const d = this.calculateDistance(userWrist, refPoint);
      if (d < minDistance) minDistance = d;
    }

    // **Dynamic Threshold**: ใช้ 40% ของความกว้างไหล่ (ถ้ามีค่า Calibrate)
    // ถ้าไม่มีค่า ให้ใช้ค่า Default 0.08
    let threshold = 0.08;
    if (this.calibrationData) {
      threshold = this.calibrationData.shoulderWidth * 0.4;
    }

    return minDistance > threshold
      ? "⚠️ เส้นทางไม่แม่นยำ (Path Deviation)"
      : null;
  }

  checkArmRotation(thumb, pinky, wrist, elbow, moveType) {
    // (Logic เดิม) ยังคงใช้การเปรียบเทียบความสูงสัมพัทธ์
    if (!thumb || !pinky) return null;
    // const isPalmUp = thumb.y < pinky.y;
    return null;
  }

  checkElbowSinking(shoulder, elbow, wrist) {
    if (elbow.y < shoulder.y) {
      return "⚠️ ศอกลอย (Elbow too high)";
    }
    return null;
  }

  checkWaistInitiation(landmarks, timestamp) {
    if (this.lastTimestamp === -1) {
      this.lastTimestamp = timestamp;
      this.lastLandmarks = landmarks;
      return null;
    }
    const dt = (timestamp - this.lastTimestamp) / 1000;
    if (dt < 0.01) return null;

    const curShoulderAngle = this.getLineAngle(landmarks[11], landmarks[12]);
    const lastShoulderAngle = this.getLineAngle(
      this.lastLandmarks[11],
      this.lastLandmarks[12]
    );
    const curHipAngle = this.getLineAngle(landmarks[23], landmarks[24]);
    const lastHipAngle = this.getLineAngle(
      this.lastLandmarks[23],
      this.lastLandmarks[24]
    );

    const shoulderVel = this.getAngularVelocity(
      lastShoulderAngle,
      curShoulderAngle,
      dt
    );
    const hipVel = this.getAngularVelocity(lastHipAngle, curHipAngle, dt);

    this.lastTimestamp = timestamp;
    this.lastLandmarks = landmarks;

    const THRESHOLD = 10;
    if (shoulderVel > THRESHOLD && hipVel < THRESHOLD / 2) {
      return "⚠️ ใช้เอวนำ (Start with Waist)";
    }
    return null;
  }

  checkVerticalStability(nose) {
    if (!nose) return null;
    this.headYHistory.push(nose.y);
    if (this.headYHistory.length > this.HISTORY_LENGTH_STABILITY)
      this.headYHistory.shift();

    if (this.headYHistory.length < this.HISTORY_LENGTH_STABILITY) return null;

    const min = Math.min(...this.headYHistory);
    const max = Math.max(...this.headYHistory);
    const displacement = max - min;

    // **Dynamic Threshold**: ใช้ 10% ของความสูงลำตัว (Torso Height)
    let threshold = 0.05;
    if (this.calibrationData) {
      threshold = this.calibrationData.torsoHeight * 0.1;
    }

    if (displacement > threshold) return "⚠️ ศีรษะไม่นิ่ง (Head Unstable)";
    return null;
  }

  checkSmoothness(wrist) {
    if (!wrist) return null;
    this.wristHistory.push(wrist);
    if (this.wristHistory.length > this.HISTORY_LENGTH_WRIST)
      this.wristHistory.shift();

    if (this.wristHistory.length < 3) return null;

    const p3 = this.wristHistory[this.wristHistory.length - 1];
    const p2 = this.wristHistory[this.wristHistory.length - 2];
    const p1 = this.wristHistory[this.wristHistory.length - 3];

    const v2 = this.calculateDistance(p2, p3);
    const v1 = this.calculateDistance(p1, p2);
    const acceleration = Math.abs(v2 - v1);

    if (acceleration > 0.02) return "⚠️ การเคลื่อนไหวสะดุด (Not Smooth)";
    return null;
  }

  checkContinuity() {
    if (this.wristHistory.length < 2) return null;

    const p2 = this.wristHistory[this.wristHistory.length - 1];
    const p1 = this.wristHistory[this.wristHistory.length - 2];
    const velocity = this.calculateDistance(p1, p2);

    if (velocity < 0.001) {
      this.pauseCounter++;
    } else {
      this.pauseCounter = 0;
    }

    if (this.pauseCounter > 15) return "⚠️ อย่าหยุดนิ่ง (Keep Moving)";
    return null;
  }

  checkWeightShift(leftHip, rightHip, leftAnkle, rightAnkle) {
    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const feetCenter = (leftAnkle.x + rightAnkle.x) / 2;

    if (Math.abs(hipCenter - feetCenter) > 0.1)
      return "⚠️ เสียสมดุล (Off Balance)";
    return null;
  }
}
