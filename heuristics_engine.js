/**
 * TaijiFlow AI - Heuristics Engine v2.2
 * - รองรับ Dynamic Thresholds (Calibration)
 * - จัดลำดับความสำคัญของ Feedback (Prioritization)
 * - แสดงผลค้างไว้ให้อ่านทัน (Sticky Feedback)
 */

class HeuristicsEngine {
  constructor() {
    // --- ตัวแปรสำหรับเก็บข้อมูล Calibration ---
    this.calibrationData = null;

    // --- ตัวแปร State & History ---
    this.lastLandmarks = null;
    this.lastTimestamp = -1;
    this.headYHistory = [];
    this.HISTORY_LENGTH_STABILITY = 30;
    this.wristHistory = [];
    this.HISTORY_LENGTH_WRIST = 10;
    this.pauseCounter = 0;

    // --- ตัวแปรสำหรับ Sticky Feedback (กันข้อความกระพริบ) ---
    this.lastFeedbackMsg = null;
    this.lastFeedbackTime = 0;
    this.FEEDBACK_HOLD_TIME = 1500; // แสดงค้างไว้อย่างน้อย 1.5 วินาที

    // --- Config: Level ไหน ตรวจอะไรบ้าง ---
    this.RULES_CONFIG = {
      L1: {
        // ท่านั่ง
        checkPath: true,
        checkRotation: true,
        checkElbow: true,
        checkWaist: true,
        checkStability: false,
        checkSmooth: true,
        checkContinuity: true,
        checkWeight: false,
      },
      L2: {
        // ท่ายืน
        checkPath: true,
        checkRotation: true,
        checkElbow: true,
        checkWaist: true,
        checkStability: true,
        checkSmooth: true,
        checkContinuity: true,
        checkWeight: false,
      },
      L3: {
        // ท่ายืนย่อ
        checkPath: true,
        checkRotation: true,
        checkElbow: true,
        checkWaist: true,
        checkStability: true,
        checkSmooth: true,
        checkContinuity: true,
        checkWeight: true,
      },
    };

    // --- Priority: ลำดับความสำคัญ (เลขน้อย = สำคัญมาก) ---
    this.RULE_PRIORITY = {
      "Path Accuracy": 1, // รูปทรงผิด ต้องแก้ก่อน
      "Waist Initiation": 2, // แกนกลางสำคัญรองลงมา
      "Weight Shift": 3, // ฐานรากสำคัญ
      "Vertical Stability": 4,
      "Arm Rotation": 5,
      "Elbow Sinking": 6,
      Smoothness: 7,
      Continuity: 8,
    };
  }

  setCalibration(data) {
    this.calibrationData = data;
    console.log("Engine updated with user metrics:", this.calibrationData);
  }

  analyze(landmarks, timestamp, referencePath, currentExercise, currentLevel) {
    // 1. เปลี่ยนจาก feedbacks array เป็น allErrors array เพื่อเก็บรายละเอียด
    let allErrors = [];

    if (!landmarks) return [];

    const config = this.RULES_CONFIG[currentLevel] || this.RULES_CONFIG["L3"];

    // Keypoints extraction
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

    // --- ตรวจสอบกฎต่างๆ และเก็บใส่ allErrors ---

    // 1. Path Accuracy
    if (config.checkPath && referencePath && referencePath.length > 0) {
      const err = this.checkPathAccuracy(rightWrist, referencePath);
      if (err) allErrors.push({ msg: err, rule: "Path Accuracy" });
    }

    // 2. Arm Rotation
    if (config.checkRotation) {
      const err = this.checkArmRotation(
        rightThumb,
        rightPinky,
        rightWrist,
        rightElbow,
        currentExercise
      );
      if (err) allErrors.push({ msg: err, rule: "Arm Rotation" });
    }

    // 3. Elbow Sinking
    if (config.checkElbow) {
      const err = this.checkElbowSinking(rightShoulder, rightElbow, rightWrist);
      if (err) allErrors.push({ msg: err, rule: "Elbow Sinking" });
    }

    // 4. Waist Initiation
    if (config.checkWaist) {
      const err = this.checkWaistInitiation(landmarks, timestamp);
      if (err) allErrors.push({ msg: err, rule: "Waist Initiation" });
    }

    // 5. Vertical Stability
    if (config.checkStability) {
      const err = this.checkVerticalStability(nose);
      if (err) allErrors.push({ msg: err, rule: "Vertical Stability" });
    }

    // 6. Smoothness
    if (config.checkSmooth) {
      const err = this.checkSmoothness(rightWrist);
      if (err) allErrors.push({ msg: err, rule: "Smoothness" });
    }

    // 7. Continuity
    if (config.checkContinuity) {
      const err = this.checkContinuity();
      if (err) allErrors.push({ msg: err, rule: "Continuity" });
    }

    // 8. Weight Shifting
    if (config.checkWeight) {
      const err = this.checkWeightShift(
        leftHip,
        rightHip,
        leftAnkle,
        rightAnkle
      );
      if (err) allErrors.push({ msg: err, rule: "Weight Shift" });
    }

    // --- ขั้นตอนการคัดเลือก Feedback (Selection Logic) ---

    // กรณีที่ 1: พบข้อผิดพลาดใหม่ในเฟรมนี้
    if (allErrors.length > 0) {
      // เรียงลำดับความสำคัญ (Priority Sort)
      allErrors.sort((a, b) => {
        return (
          (this.RULE_PRIORITY[a.rule] || 99) -
          (this.RULE_PRIORITY[b.rule] || 99)
        );
      });

      // เลือกข้อผิดพลาดที่สำคัญที่สุด (Top Priority)
      const topError = allErrors[0].msg;

      // อัปเดต Sticky Logic
      this.lastFeedbackMsg = topError;
      this.lastFeedbackTime = Date.now();

      return [topError]; // ส่งกลับเป็น Array ตาม Format เดิม
    }

    // กรณีที่ 2: ไม่พบข้อผิดพลาดในเฟรมนี้ (แต่จะโชว์อันเก่าค้างไว้หน่อยไหม?)
    else {
      // ถ้าเวลาผ่านไปไม่ถึงกำหนด (Hold Time) ให้โชว์อันเดิมไปก่อน
      if (Date.now() - this.lastFeedbackTime < this.FEEDBACK_HOLD_TIME) {
        return this.lastFeedbackMsg ? [this.lastFeedbackMsg] : [];
      } else {
        // ถ้าผ่านไปนานแล้ว ก็เคลียร์หน้าจอ (แสดงว่าทำถูกแล้ว)
        this.lastFeedbackMsg = null;
        return []; // ส่งค่าว่าง = สีเขียว/ไม่มีข้อความ
      }
    }
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
    let threshold = 0.08;
    if (this.calibrationData) {
      threshold = this.calibrationData.shoulderWidth * 0.4;
    }
    return minDistance > threshold
      ? "⚠️ เส้นทางไม่แม่นยำ (Path Deviation)"
      : null;
  }

  checkArmRotation(thumb, pinky, wrist, elbow, moveType) {
    if (!thumb || !pinky) return null;
    return null; // รอ Logic จริง
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
