/**
 * TaijiFlow AI - Heuristics Engine v3.0
 * - รองรับ Dynamic Thresholds (Calibration)
 * - จัดลำดับความสำคัญของ Feedback (Prioritization)
 * - แสดงผลค้างไว้ให้อ่านทัน (Sticky Feedback)
 * - Time-normalized calculations (v3.0)
 * - Configurable thresholds (v3.0)
 */

class HeuristicsEngine {
  constructor() {
    // =====================================================
    // CONFIG: Thresholds ทั้งหมด (ปรับแต่งได้)
    // หน่วย: normalized (0-1) หรือ degrees/second
    // =====================================================
    this.CONFIG = {
      // Path Accuracy
      PATH_THRESHOLD_DEFAULT: 0.08, // normalized units (8% of screen)
      PATH_THRESHOLD_CALIBRATION_RATIO: 0.4, // 40% of shoulderWidth
      PATH_THRESHOLD_MIN: 0.02, // minimum threshold
      PATH_THRESHOLD_MAX: 0.25, // maximum threshold

      // Arm Rotation
      ARM_MOTION_THRESHOLD: 0.005, // min deltaY to check rotation

      // Elbow Sinking
      ELBOW_TOLERANCE_DEFAULT: 0.01, // normalized units
      ELBOW_TOLERANCE_CALIBRATION_RATIO: 0.05, // 5% of torsoHeight

      // Waist Initiation
      MIN_HIP_VELOCITY_DEG_SEC: 2.0, // degrees/second
      SHOULDER_HIP_RATIO: 3.0, // shoulder must rotate 3x faster than hip

      // Vertical Stability
      STABILITY_HISTORY_LENGTH: 30, // frames (~1 second at 30fps)
      STABILITY_THRESHOLD_DEFAULT: 0.05, // normalized units
      STABILITY_THRESHOLD_CALIBRATION_RATIO: 0.1, // 10% of torsoHeight

      // Smoothness
      SMOOTHNESS_THRESHOLD_DEFAULT: 0.02, // normalized units
      SMOOTHNESS_CALIBRATION_RATIO: 0.05, // 5% of armLength

      // Continuity
      MOTION_THRESHOLD: 0.001, // normalized units (min movement)
      PAUSE_FRAME_THRESHOLD: 15, // frames (~0.5 sec at 30fps)

      // Weight Shift
      WEIGHT_BUFFER_RATIO: 0.1, // 10% of stanceWidth

      // Feedback Display
      FEEDBACK_HOLD_TIME_MS: 1500, // 1.5 seconds

      // History Lengths
      WRIST_HISTORY_LENGTH: 10, // frames
    };

    // --- ตัวแปรสำหรับเก็บข้อมูล Calibration ---
    this.calibrationData = null;

    // --- ตัวแปร State & History ---
    this.lastLandmarks = null;
    this.lastTimestamp = -1;
    this.headYHistory = [];
    this.wristHistory = []; // เก็บ {x, y, t} โดย t = timestamp (ms)
    this.pauseCounter = 0;

    // --- ตัวแปรสำหรับ Sticky Feedback (กันข้อความกระพริบ) ---
    this.lastFeedbackMsg = null;
    this.lastFeedbackTime = 0;

    // --- Debug Mode ---
    this.debugMode = false;
    this.debugInfo = {}; // เก็บค่าสำหรับ debug overlay

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

  /**
   * เปิด/ปิด Debug Mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`Debug mode: ${enabled ? "ON" : "OFF"}`);
  }

  /**
   * ดึง Debug Info สำหรับแสดง overlay
   */
  getDebugInfo() {
    return this.debugInfo;
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

    // --- เลือก Landmark ของแขนข้างที่ใช้งานอยู่ ---
    const isRightHandExercise = currentExercise.startsWith("rh");
    const activeWrist = isRightHandExercise ? rightWrist : leftWrist;
    const activeShoulder = isRightHandExercise ? rightShoulder : leftShoulder;
    const activeElbow = isRightHandExercise ? rightElbow : leftElbow;
    const activeThumb = isRightHandExercise ? rightThumb : leftThumb;
    const activePinky = isRightHandExercise ? rightPinky : leftPinky;

    // --- ตรวจสอบกฎต่างๆ และเก็บใส่ allErrors ---

    // 1. Path Accuracy
    if (config.checkPath && referencePath && referencePath.length > 0) {
      const err = this.checkPathAccuracy(activeWrist, referencePath);
      if (err) allErrors.push({ msg: err, rule: "Path Accuracy" });
    }

    // 2. Arm Rotation
    if (config.checkRotation) {
      const err = this.checkArmRotation(
        activeThumb,
        activePinky,
        currentExercise
      );
      if (err) allErrors.push({ msg: err, rule: "Arm Rotation" });
    }

    // 3. Elbow Sinking
    if (config.checkElbow) {
      const err = this.checkElbowSinking(
        activeShoulder,
        activeElbow,
        activeWrist
      );
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

    // 6. Smoothness (ส่ง timestamp เพื่อคำนวณ time-normalized acceleration)
    if (config.checkSmooth) {
      const err = this.checkSmoothness(activeWrist, timestamp);
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

    // กรณีที่ 2: ไม่พบข้อผิดพลาดในเฟรมนี้ (แต่จะโชว์อันเก่าค้างไว้)
    else {
      // ถ้าเวลาผ่านไปไม่ถึงกำหนด (Hold Time) ให้โชว์อันเดิมไปก่อน
      if (
        Date.now() - this.lastFeedbackTime <
        this.CONFIG.FEEDBACK_HOLD_TIME_MS
      ) {
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
    if (!userWrist) return null;

    let minDistance = Infinity;
    for (const refPoint of referencePath) {
      const d = this.calculateDistance(userWrist, refPoint);
      if (d < minDistance) minDistance = d;
    }

    // Dynamic Thresholds with min/max caps
    let threshold = this.CONFIG.PATH_THRESHOLD_DEFAULT;
    if (this.calibrationData) {
      const calibThreshold =
        this.calibrationData.shoulderWidth *
        this.CONFIG.PATH_THRESHOLD_CALIBRATION_RATIO;
      threshold = Math.max(
        this.CONFIG.PATH_THRESHOLD_MIN,
        Math.min(this.CONFIG.PATH_THRESHOLD_MAX, calibThreshold)
      );
    }

    // Debug info
    if (this.debugMode) {
      this.debugInfo.pathDistance = minDistance.toFixed(3);
      this.debugInfo.pathThreshold = threshold.toFixed(3);
    }

    return minDistance > threshold
      ? "⚠️ เส้นทางไม่แม่นยำ (Path Deviation)"
      : null;
  }

  checkArmRotation(thumb, pinky, moveType) {
    // 1. ตรวจสอบว่ามีข้อมูล landmark และประวัติการเคลื่อนไหวเพียงพอหรือไม่
    if (!thumb || !pinky || this.wristHistory.length < 2) {
      return null;
    }

    // 2. หา-ทิศทางการเคลื่อนที่ของข้อมือ (ขึ้นหรือลง)
    const p_current = this.wristHistory[this.wristHistory.length - 1];
    const p_previous = this.wristHistory[this.wristHistory.length - 2];
    const deltaY = p_current.y - p_previous.y;

    // ถ้าเคลื่อนที่น้อยไป ไม่ต้องเช็ค
    if (Math.abs(deltaY) < this.CONFIG.ARM_MOTION_THRESHOLD) {
      return null;
    }
    const isMovingUp = deltaY < 0;
    const isMovingDown = deltaY > 0;

    // 3. ตรวจสอบการหงาย/คว่ำของฝ่ามือ (Supination/Pronation)
    // Landmark ที่ได้มายังไม่กลับด้าน (un-mirrored)
    const isRightHand = moveType.startsWith("rh");
    const isActuallySupinated = isRightHand
      ? thumb.x > pinky.x // มือขวา: นิ้วโป้งอยู่ขวากว่านิ้วก้อย = หงาย
      : thumb.x < pinky.x; // มือซ้าย: นิ้วโป้งอยู่ซ้ายกว่านิ้วก้อย = หงาย

    // 4. กำหนด Logic การหมุนที่ถูกต้องตามท่า
    let isSupinationExpected = false;
    if (isMovingUp) {
      // ตอนเคลื่อนที่ขึ้น: rh_cw และ lh_ccw ควรจะหงายฝ่ามือ
      isSupinationExpected = moveType === "rh_cw" || moveType === "lh_ccw";
    } else if (isMovingDown) {
      // ตอนเคลื่อนที่ลง: rh_ccw และ lh_cw ควรจะหงายฝ่ามือ
      isSupinationExpected = moveType === "rh_ccw" || moveType === "lh_cw";
    }

    // 5. เปรียบเทียบและส่ง Feedback
    if (isSupinationExpected !== isActuallySupinated) {
      return "⚠️ หมุนแขนไม่ถูกต้อง (Incorrect Arm Rotation)";
    }

    return null;
  }

  checkElbowSinking(shoulder, elbow, wrist) {
    // เพิ่ม Tolerance เพื่อลดความ Sensitive ของการตรวจจับ
    // ทำให้ระบบไม่แจ้งเตือนถี่เกินไปจากการขยับเล็กๆ น้อยๆ
    const tolerance = this.calibrationData
      ? this.calibrationData.torsoHeight * 0.05 // 5% ของความสูงลำตัว
      : 0.01; // ค่า Default
    if (elbow.y < shoulder.y - tolerance) {
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

    // ปรับปรุง Logic: ตรวจจับเมื่อความเร็วไหล่ 'มากกว่า' ความเร็วสะโพกอย่างมีนัยสำคัญ
    // โดยใช้ 'อัตราส่วน' แทนค่าตายตัว เพื่อให้ยืดหยุ่นตามความเร็วของผู้ใช้
    const RATIO_THRESHOLD = this.CONFIG.SHOULDER_HIP_RATIO;
    const MIN_HIP_VELOCITY = this.CONFIG.MIN_HIP_VELOCITY_DEG_SEC;

    if (hipVel > MIN_HIP_VELOCITY && shoulderVel > hipVel * RATIO_THRESHOLD) {
      return "⚠️ ใช้เอวนำ (Start with Waist)";
    }
    return null;
  }

  checkVerticalStability(nose) {
    if (!nose) return null;
    this.headYHistory.push(nose.y);
    if (this.headYHistory.length > this.CONFIG.STABILITY_HISTORY_LENGTH)
      this.headYHistory.shift();

    if (this.headYHistory.length < this.CONFIG.STABILITY_HISTORY_LENGTH)
      return null;

    const min = Math.min(...this.headYHistory);
    const max = Math.max(...this.headYHistory);
    const displacement = max - min;

    let threshold = this.CONFIG.STABILITY_THRESHOLD_DEFAULT;
    if (this.calibrationData) {
      threshold =
        this.calibrationData.torsoHeight *
        this.CONFIG.STABILITY_THRESHOLD_CALIBRATION_RATIO;
    }

    if (displacement > threshold) return "⚠️ ศีรษะไม่นิ่ง (Head Unstable)";
    return null;
  }

  /**
   * ตรวจสอบความลื่นไหลของการเคลื่อนไหว
   * เก็บ wrist พร้อม timestamp เพื่อคำนวณ time-normalized acceleration
   * @param {object} wrist - {x, y} landmark
   * @param {number} timestamp - timestamp in ms
   */
  checkSmoothness(wrist, timestamp) {
    if (!wrist) return null;

    // เก็บ wrist พร้อม timestamp
    const currentTime = timestamp || Date.now();
    this.wristHistory.push({ x: wrist.x, y: wrist.y, t: currentTime });

    if (this.wristHistory.length > this.CONFIG.WRIST_HISTORY_LENGTH)
      this.wristHistory.shift();

    if (this.wristHistory.length < 3) return null;

    const p3 = this.wristHistory[this.wristHistory.length - 1];
    const p2 = this.wristHistory[this.wristHistory.length - 2];
    const p1 = this.wristHistory[this.wristHistory.length - 3];

    // Time-normalized velocity
    const dt2 = (p3.t - p2.t) / 1000; // seconds
    const dt1 = (p2.t - p1.t) / 1000;

    if (dt1 <= 0 || dt2 <= 0) return null;

    const v2 = this.calculateDistance(p2, p3) / dt2; // normalized units/sec
    const v1 = this.calculateDistance(p1, p2) / dt1;
    const acceleration = Math.abs(v2 - v1);

    // Dynamic Threshold
    let threshold = this.CONFIG.SMOOTHNESS_THRESHOLD_DEFAULT;
    if (this.calibrationData) {
      threshold =
        this.calibrationData.armLength *
        this.CONFIG.SMOOTHNESS_CALIBRATION_RATIO;
    }

    // Debug info
    if (this.debugMode) {
      this.debugInfo.wristVelocity = v2.toFixed(3);
      this.debugInfo.acceleration = acceleration.toFixed(3);
    }

    if (acceleration > threshold) return "⚠️ การเคลื่อนไหวสะดุด (Not Smooth)";
    return null;
  }

  checkContinuity() {
    if (this.wristHistory.length < 2) return null;

    const p2 = this.wristHistory[this.wristHistory.length - 1];
    const p1 = this.wristHistory[this.wristHistory.length - 2];
    const velocity = this.calculateDistance(p1, p2);

    if (velocity < this.CONFIG.MOTION_THRESHOLD) {
      this.pauseCounter++;
    } else {
      this.pauseCounter = 0;
    }

    if (this.pauseCounter > this.CONFIG.PAUSE_FRAME_THRESHOLD) {
      return "⚠️ อย่าหยุดนิ่ง (Keep Moving)";
    }
    return null;
  }

  checkWeightShift(leftHip, rightHip, leftAnkle, rightAnkle) {
    if (!leftHip || !rightHip || !leftAnkle || !rightAnkle) return null;

    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const stanceWidth = Math.abs(leftAnkle.x - rightAnkle.x);

    // กำหนดขอบเขตของฐานการยืน (Base of Support)
    const leftBoundary = Math.min(leftAnkle.x, rightAnkle.x);
    const rightBoundary = Math.max(leftAnkle.x, rightAnkle.x);

    // เพิ่มระยะกันชน (Buffer) 10% ของความกว้างการยืน เพื่อไม่ให้เอียงจนสุดเกินไป
    const buffer = stanceWidth * 0.1;

    if (
      hipCenter < leftBoundary + buffer ||
      hipCenter > rightBoundary - buffer
    ) {
      return "⚠️ เสียสมดุล (Off Balance)";
    }
    return null;
  }
}
