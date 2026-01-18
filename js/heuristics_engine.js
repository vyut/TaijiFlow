/**
 * ============================================================================
 * TaijiFlow AI - Heuristics Engine v3.0
 * ============================================================================
 *
 * ระบบวิเคราะห์ท่าทางการฝึกม้วนไหม (Silk Reeling) ตามหลักมวยไทเก๊กตระกูลเฉิน
 *
 * 📋 หน้าที่หลัก:
 *   - วิเคราะห์ท่าทางจาก MediaPipe landmarks แบบ real-time
 *   - เปรียบเทียบกับ Reference Path และหลักการฝึกมวยไทเก๊กที่ถูกต้อง
 *   - ส่ง Feedback ข้อผิดพลาดไปแสดงบนหน้าจอ แบบ real-time
 *
 * ⚙️ Features (v3.0):
 *   - Dynamic Thresholds: ปรับ Threshold ตามสัดส่วนร่างกายจาก Calibration
 *   - Priority System: จัดลำดับความสำคัญ แสดงข้อผิดพลาดที่สำคัญที่สุดก่อน
 *   - Sticky Feedback: แสดงข้อความค้างไว้ 1.5 วินาทีให้อ่านทัน
 *   - Time-normalized: คำนวณ velocity/acceleration ตาม timestamp จริง
 *   - Level-based Rules: ตรวจสอบกฎต่างกันตาม Level (L1, L2, L3)
 *
 * 🎯 กฎการตรวจสอบ 8 ข้อ (เรียงตามความสำคัญ):
 *   1. Path Accuracy      - เส้นทางตรงกับท่าต้นแบบ
 *   2. Waist Initiation   - เอวนำ เริ่มขยับจากเอว
 *   3. Weight Shift       - ถ่ายน้ำหนักอยู่ในฐาน
 *   4. Vertical Stability - ศีรษะนิ่ง ไม่ก้มหรือเงยศีรษะ
 *   5. Arm Rotation       - หมุนฝ่ามือถูกทิศ (หงาย/คว่ำ)
 *   6. Elbow Sinking      - ศอกจม ไม่ลอย
 *   7. Smoothness         - เคลื่อนไหวนุ่มนวล ต่อเนื่อง
 *   8. Continuity         - ไม่หยุดนิ่ง ไหลลื่น
 *
 * 📊 การใช้งาน:
 *   const engine = new HeuristicsEngine();
 *   engine.setCalibration(calibrationData);
 *   const feedbacks = engine.analyze(landmarks, timestamp, path, exercise, level);
 *
 * ============================================================================
 */

class HeuristicsEngine {
  constructor() {
    // =========================================================================
    // 📐 CONFIG: Thresholds ที่ปรับแต่งได้
    // =========================================================================
    // หน่วยที่ใช้:
    //   - normalized (0-1): สัดส่วนเทียบกับขนาดหน้าจอ/ร่างกาย
    //   - degrees/second: ความเร็วเชิงมุม
    //   - frames: จำนวนเฟรม (ที่ 30fps, 30 frames ≈ 1 วินาที)
    //   - ms: มิลลิวินาที
    // =========================================================================
    this.CONFIG = {
      // ----- Rule 1: Path Shape (รูปทรงเส้นทาง) -----
      // ตรวจว่าเส้นทางที่ผู้ฝึกวาดเป็นวงโค้ง (ไม่เช็คตำแหน่ง)
      SHAPE_CONSISTENCY_THRESHOLD: 0.6, // 60% ขึ้นไป = เป็นวงโค้ง (0.0-1.0)
      SHAPE_ANALYSIS_POINTS: 10, // 🆕 ใช้ 10 จุดล่าสุด (slice-based แทน time-based เพราะ timestamps ไม่เชื่อถือได้)

      // (เก็บไว้เผื่อใช้ในอนาคต - Position-Based)
      // PATH_THRESHOLD_DEFAULT: 0.08,
      // PATH_THRESHOLD_CALIBRATION_RATIO: 0.4,
      // PATH_THRESHOLD_MIN: 0.02,
      // PATH_THRESHOLD_MAX: 0.25,

      // ----- Rule 2: Arm Rotation (การหมุนแขน) -----
      // ตรวจทิศทางการหงาย/คว่ำฝ่ามือ ขณะเคลื่อนที่ขึ้น/ลง
      ARM_MOTION_THRESHOLD: 0.015, // ขยับขึ้นลงอย่างน้อย 1.5% จึงเช็คการหมุน
      ARM_ROTATION_NEUTRAL_ZONE: 0.05, // 5% tolerance สำหรับช่วงเปลี่ยนผ่านการหมุน (เพิ่มจาก 0.03)

      // ----- Rule 3: Elbow Sinking (ศอกจม) -----
      // หลัก "沉肩坠肘" (ชิ่นเจียน จุ้ยโจ่ว) - ผ่อนไหล่ลง ศอกตก
      ELBOW_TOLERANCE_DEFAULT: 0.01, // Tolerance 1% ของหน้าจอ
      ELBOW_TOLERANCE_CALIBRATION_RATIO: 0.05, // 5% ของความสูงลำตัว

      // ----- Rule 4: Waist Initiation (เอวนำ) -----
      // หลัก "腰为轴" (เอาเหวยโจ่ว) - เอวเป็นเพลากลาง ทุกการเคลื่อนไหวเริ่มจากเอว
      MIN_HIP_VELOCITY_DEG_SEC: 1.0, // สะโพกต้องหมุนอย่างน้อย 1°/วินาที (ลดจาก 2.0)
      SHOULDER_HIP_RATIO: 2.0, // ถ้าไหล่หมุนเร็วกว่าสะโพก 2 เท่า = ผิด (ลดจาก 3.0)

      // ----- Rule 5: Vertical Stability (ศีรษะนิ่ง) -----
      // หลัก "虚领顶劲" (ซวี่หลิงติ่งจิ้น) - โปรงกระหม่อมเบา ศีรษะตั้งตรง ไม่กระดก
      STABILITY_HISTORY_LENGTH: 30, // เก็บประวัติ 30 เฟรม (~1 วินาที)
      STABILITY_THRESHOLD_DEFAULT: 0.05, // ศีรษะขยับขึ้นลงไม่เกิน 5% ของหน้าจอ
      STABILITY_THRESHOLD_CALIBRATION_RATIO: 0.1, // 10% ของความสูงลำตัว

      // ----- Rule 6: Smoothness (ความลื่นไหล) -----
      // หลัก "如抽丝" (ดังเช่นดึงเส้นไหม) - เคลื่อนไหวสม่ำเสมอ ไม่กระตุก
      SMOOTHNESS_THRESHOLD_DEFAULT: 0.1, // Acceleration ไม่เกิน 0.1 units/sec²
      SMOOTHNESS_CALIBRATION_RATIO: 0.5, // 50% ของความยาวแขน (เพิ่มจาก 0.12, เพื่อ threshold ~0.09)

      // ----- Rule 7: Continuity (ความต่อเนื่อง) - TIME-BASED -----
      // หลัก "绵绵不断" (เหมียนเหมียนปู้ต้วน) - ต่อเนื่องไม่ขาดตอน
      // ใช้ Time-Based แทน Frame-Based เพื่อไม่ขึ้นกับ Skip Frame Logic
      // Note: Heuristics ถูกเรียก ~0.83/sec ดังนั้น 2 วินาที ≈ 1-2 points
      PAUSE_WINDOW_MS: 2000, // วิเคราะห์ช่วง 2 วินาทีล่าสุด
      PAUSE_AVG_VELOCITY_THRESHOLD: 0.003, // avg velocity ต่ำกว่านี้ = หยุดนิ่ง

      // ----- Rule 8: Weight Shift (ถ่ายน้ำหนัก) -----
      // หลัก "分虚实" (เฟินซวี่ซวื่อ) - รู้จักแยกเต็ม/ว่าง แต่ไม่เอียงจนเสียสมดุล
      WEIGHT_BUFFER_RATIO: 0.1, // Buffer 10% ของความกว้างการยืน

      // ----- Feedback Display -----
      FEEDBACK_HOLD_TIME_MS: 1000, // แสดงข้อความค้าง 1.0 วินาที

      // ----- History Settings -----
      WRIST_HISTORY_LENGTH: 60, // เก็บประวัติข้อมือ 60 เฟรมล่าสุด (รองรับ Shape Analysis)
    };

    // =========================================================================
    // 📁 STATE: ตัวแปรเก็บข้อมูลระหว่างการทำงาน
    // =========================================================================

    // --- Calibration Data ---
    // ข้อมูลสัดส่วนร่างกายผู้ใช้ ใช้ปรับ Dynamic Threshold
    // ประกอบด้วย: { torsoHeight, shoulderWidth, armLength }
    this.calibrationData = null;

    // --- Frame-to-Frame State ---
    // เก็บข้อมูลเฟรมก่อนหน้าเพื่อเปรียบเทียบคำนวณ velocity
    this.lastLandmarks = null; // landmarks ของเฟรมก่อนหน้า
    this.lastTimestamp = -1; // timestamp ของเฟรมก่อนหน้า (ms)

    // --- History Buffers ---
    // เก็บประวัติการเคลื่อนไหวเพื่อคำนวณความเร็ว/ความเร่ง
    this.headYHistory = []; // ประวัติตำแหน่ง Y ของศีรษะ (สำหรับ Vertical Stability)
    this.wristHistory = []; // ประวัติข้อมือ [{x, y, t}] (สำหรับ Smoothness, Continuity)

    // --- Sticky Feedback (Anti-Flicker) ---
    // ป้องกันข้อความกระพริบเร็วเกินไป - แสดงข้อความค้างไว้ 1.5 วินาที
    this.lastFeedbackMsg = null; // ข้อความสุดท้ายที่แสดง
    this.lastFeedbackTime = 0; // timestamp ที่แสดงครั้งล่าสุด

    // --- Debug Mode ---
    // เปิดโดยกด D - แสดงค่า Threshold และค่าวัดต่างๆ บนหน้าจอ
    this.debugMode = false;
    this.debugInfo = {}; // Object เก็บค่าสำหรับ debug overlay

    // =========================================================================
    // 🎯 RULES_CONFIG: กำหนดว่าแต่ละ Level ตรวจอะไรบ้าง
    // =========================================================================
    // L1 (ท่านั่ง): ง่ายที่สุด - เน้นพื้นฐาน 3 กฎ (สำหรับผู้เริ่มต้น/สูงอายุ)
    // L2 (ท่ายืน): ปานกลาง - เพิ่มหลักสำคัญ 6 กฎ
    // L3 (ท่ายืนย่อ): ยากที่สุด - เช็คทุกกฎ 8 กฎ
    // =========================================================================
    this.RULES_CONFIG = {
      L1: {
        // --- Level 1: ท่านั่ง (ง่ายที่สุด - 3 กฎ) ---
        // สำหรับผู้เริ่มต้น/สูงอายุ: เน้นดูตาม Ghost + พื้นฐาน
        checkPath: true, // ✔ เส้นทางแม่นยำ (ดูตาม Ghost)
        checkRotation: false, // ✘ ยังไม่เช็ค (ยากเกินไป)
        checkElbow: true, // ✔ ศอกจม (หลักสำคัญ)
        checkWaist: false, // ✘ ยังไม่เช็ค (นั่งขยับลำบาก)
        checkStability: false, // ✘ ไม่เช็ค (นั่ง = นิ่งอยู่แล้ว)
        checkSmooth: false, // ✘ ยังไม่เช็ค (ผู้เริ่มต้นต้องเรียนรู้ก่อน)
        checkContinuity: true, // ✔ ความต่อเนื่อง (อย่าหยุดนิ่ง)
        checkWeight: false, // ✘ ไม่เช็ค (นั่ง = ไม่ถ่ายน้ำหนัก)
      },
      L2: {
        // --- Level 2: ท่ายืน (ปานกลาง - 6 กฎ) ---
        // เพิ่ม Rotation, Waist, Stability จาก L1
        checkPath: true, // ✔ เส้นทางแม่นยำ
        checkRotation: true, // ✔ เพิ่ม: การหมุนแขน
        checkElbow: true, // ✔ ศอกจม
        checkWaist: true, // ✔ เพิ่ม: เอวนำ
        checkStability: true, // ✔ เพิ่ม: ศีรษะนิ่ง
        checkSmooth: false, // ✘ ยังไม่เช็ค
        checkContinuity: true, // ✔ ความต่อเนื่อง
        checkWeight: false, // ✘ ยังไม่เช็ค (ยืนตรง = ไม่ถ่ายน้ำหนัก)
      },
      L3: {
        // --- Level 3: ท่ายืนย่อ/ขาคู่ (ยากที่สุด - 8 กฎ) ---
        // เช็คทุกกฎ รวมถึง Smoothness และ Weight Shift
        checkPath: true, // ✔ เส้นทางแม่นยำ
        checkRotation: true, // ✔ การหมุนแขน
        checkElbow: true, // ✔ ศอกจม
        checkWaist: true, // ✔ เอวนำ
        checkStability: true, // ✔ ศีรษะนิ่ง
        checkSmooth: true, // ✔ เพิ่ม: ความลื่นไหล
        checkContinuity: true, // ✔ ความต่อเนื่อง
        checkWeight: true, // ✔ เพิ่ม: ถ่ายน้ำหนัก
      },
    };

    // =========================================================================
    // ⭐ RULE_PRIORITY: ลำดับความสำคัญ (เลขน้อย = สำคัญก่อน)
    // =========================================================================
    // เมื่อพบข้อผิดพลาดหลายข้อพร้อมกัน จะแสดงเฉพาะข้อที่สำคัญที่สุด
    // เหตุผล: แก้ข้อสำคัญก่อน มักช่วยแก้ข้ออื่นไปด้วย
    // =========================================================================
    this.RULE_PRIORITY = {
      // Priority 1-3: หลักพื้นฐาน (ถ้าผิดแล้วไม่ใช่ไทเก๊ก)
      "Path Accuracy": 1, // 🥇 ท่าผิด - สำคัญที่สุด
      "Waist Initiation": 2, // 🥈 เอวไม่นำ - หัวใจของไทเก๊ก
      "Weight Shift": 3, // 🥉 เสียสมดุล - ฐานไม่มั่นคง

      // Priority 4-6: หลักเสริม (ทำให้ดีขึ้น)
      "Vertical Stability": 4, // ศีรษะไม่นิ่ง
      "Arm Rotation": 5, // หมุนแขนไม่ถูก
      "Elbow Sinking": 6, // ศอกลอย

      // Priority 7-8: สไตล์ (ความลื่นไหล)
      Smoothness: 7, // เคลื่อนไหวสะดุด
      Continuity: 8, // หยุดนิ่ง
    };

    // =========================================================================
    // 🎮 CURRENT STATE: สถานะปัจจุบัน (สำหรับ RulesConfigManager)
    // =========================================================================
    // เริ่มต้นเป็น null/empty - รอจนกว่าจะเลือก Level
    this.currentLevel = null;
    this.currentRulesConfig = {
      checkPath: false,
      checkRotation: false,
      checkElbow: false,
      checkWaist: false,
      checkStability: false,
      checkSmooth: false,
      checkContinuity: false,
      checkWeight: false,
    };
    // 🆕 เก็บค่าที่ user เปลี่ยนไว้แยกจาก level config
    // จะ merge กับ currentRulesConfig เมื่อ level เปลี่ยน
    this.userOverrides = {};
  }

  // ===========================================================================
  // 🛠️ PUBLIC METHODS: ฟังก์ชันสำหรับเรียกจากภายนอก
  // ===========================================================================

  /**
   * เปิด/ปิด Debug Mode
   * กด D ระหว่างการฝึกเพื่อดูค่า Threshold และค่าวัดต่างๆ บนหน้าจอ
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`Debug mode: ${enabled ? "ON" : "OFF"}`);
  }

  /**
   * ตั้งค่าภาษาสำหรับ Feedback Messages
   * @param {string} lang - "th" หรือ "en"
   */
  setLang(lang) {
    this.lang = lang;
  }

  /**
   * ดึงข้อความ Feedback ตามภาษาปัจจุบัน
   * @param {string} key - Key ของข้อความ (internal key)
   * @returns {string} ข้อความตามภาษาจาก TRANSLATIONS
   */
  getMessage(key) {
    // Mapping จาก internal key ไปยัง translation key
    const keyMap = {
      // Rule 1: Path Shape
      moveInCircle: "heur_move_in_circle",
      wrongDirection: "heur_wrong_direction",
      // Rule 2: Rotation
      incorrectRotation: "heur_incorrect_rotation",
      // Rule 3: Elbow
      elbowTooHigh: "heur_elbow_too_high",
      // Rule 4: Waist
      startWithWaist: "heur_start_with_waist",
      // Rule 5: Stability
      headUnstable: "heur_head_unstable",
      // Rule 6: Smoothness
      notSmooth: "heur_not_smooth",
      // Rule 7: Continuity
      keepMoving: "heur_keep_moving",
      // Rule 8: Weight
      offBalance: "heur_off_balance",
    };

    const translationKey = keyMap[key];
    if (translationKey && typeof TRANSLATIONS !== "undefined") {
      const text = TRANSLATIONS[this.lang]?.[translationKey];
      if (text) return text;
    }

    // Fallback: return key if not found
    return key;
  }

  /**
   * ดึงข้อมูล Debug สำหรับแสดง Overlay
   * @returns {Object} { pathDistance, pathThreshold, wristVelocity, acceleration }
   */
  getDebugInfo() {
    return this.debugInfo;
  }

  /**
   * รับข้อมูล Calibration จาก CalibrationManager
   * ใช้สำหรับคำนวณ Dynamic Threshold ตามสัดส่วนร่างกายผู้ใช้
   * @param {Object} data - { torsoHeight, shoulderWidth, armLength }
   */
  setCalibration(data) {
    this.calibrationData = data;
    console.log("Engine updated with user metrics:", this.calibrationData);
  }

  // ===========================================================================
  // 🎯 ANALYZE: ฟังก์ชันหลักสำหรับวิเคราะห์ท่าทาง
  // ===========================================================================
  /**
   * วิเคราะห์ท่าทางและส่งคืน Feedback
   *
   * Flow:
   *   1. ดึง Keypoints ที่ต้องการจาก landmarks
   *   2. ตรวจสอบทุกกฎตาม Level ที่เลือก
   *   3. เรียงลำดับข้อผิดพลาดตามความสำคัญ
   *   4. เลือกแสดงเฉพาะข้อที่สำคัญที่สุด (+ Sticky Logic)
   *
   * @param {Object[]} landmarks - 33 จุดจาก MediaPipe Pose
   * @param {number} timestamp - เวลาปัจจุบัน (ms)
   * @param {Object[]} referencePath - เส้นทางต้นแบบ [{x, y}]
   * @param {string} currentExercise - ท่าที่กำลังฝึก ('rh_cw', 'lh_ccw', etc.)
   * @param {string} currentLevel - ระดับ ('L1', 'L2', 'L3')
   * @returns {string[]} Array ของข้อความ Feedback (หรือ [] ถ้าถูกต้อง)
   */
  analyze(landmarks, timestamp, referencePath, currentExercise, currentLevel) {
    // ----- 1. เตรียมตัวแปรเก็บข้อผิดพลาด -----
    let allErrors = [];

    // Guard: ถ้าไม่มี landmarks ให้ return เลย
    if (!landmarks) return [];

    // ดึง Config ปัจจุบัน (ใช้ currentRulesConfig ที่ RulesConfigManager สามารถแก้ไขได้)
    // ถ้า level เปลี่ยน ให้อัพเดท currentRulesConfig แต่คงค่าที่ user ตั้งไว้
    if (currentLevel && currentLevel !== this.currentLevel) {
      // ใช้ค่าจาก RULES_CONFIG เป็น default แล้ว merge กับ userOverrides
      const levelConfig =
        this.RULES_CONFIG[currentLevel] || this.RULES_CONFIG["L3"];

      // Merge: levelConfig เป็น base, userOverrides ทับค่าที่ user เปลี่ยน
      this.currentRulesConfig = { ...levelConfig, ...this.userOverrides };

      this.currentLevel = currentLevel;
    }
    const config = this.currentRulesConfig;

    // ----- 2. ดึง Keypoints จาก MediaPipe Pose Landmarks -----
    // MediaPipe Pose มี 33 จุด ดูรายละเอียดได้ที่:
    // https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
    const nose = landmarks[0]; // จมูก - ใช้วัด Vertical Stability
    const leftShoulder = landmarks[11]; // ไหล่ซ้าย
    const rightShoulder = landmarks[12]; // ไหล่ขวา
    const leftElbow = landmarks[13]; // ศอกซ้าย
    const rightElbow = landmarks[14]; // ศอกขวา
    const leftWrist = landmarks[15]; // ข้อมือซ้าย - ใช้วัด Path
    const rightWrist = landmarks[16]; // ข้อมือขวา - ใช้วัด Path
    const leftPinky = landmarks[17]; // นิ้วก้อยซ้าย - ใช้วัด Arm Rotation
    const rightPinky = landmarks[18]; // นิ้วก้อยขวา
    const leftThumb = landmarks[21]; // นิ้วโป้งซ้าย - ใช้วัด Arm Rotation
    const rightThumb = landmarks[22]; // นิ้วโป้งขวา
    const leftHip = landmarks[23]; // สะโพกซ้าย - ใช้วัด Waist, Weight
    const rightHip = landmarks[24]; // สะโพกขวา
    const leftAnkle = landmarks[27]; // ข้อเท้าซ้าย - ใช้วัด Weight Shift
    const rightAnkle = landmarks[28]; // ข้อเท้าขวา

    // ----- 3. เลือกแขนข้างที่กำลังฝึก (Active Side) -----
    // rh_* = มือขวา, lh_* = มือซ้าย
    const isRightHandExercise = currentExercise.startsWith("rh");
    const activeWrist = isRightHandExercise ? rightWrist : leftWrist;
    const activeShoulder = isRightHandExercise ? rightShoulder : leftShoulder;
    const activeElbow = isRightHandExercise ? rightElbow : leftElbow;
    const activeThumb = isRightHandExercise ? rightThumb : leftThumb;
    const activePinky = isRightHandExercise ? rightPinky : leftPinky;

    // =========================================================================
    // 📋 เก็บประวัติ Wrist Position (ใช้ร่วมกันโดย Rule 1, 6, 7)
    // =========================================================================
    if (activeWrist) {
      this.wristHistory.push({
        x: activeWrist.x,
        y: activeWrist.y,
        // 🆕 ใช้ Date.now() แทน timestamp จาก MediaPipe ซึ่งอาจเป็น undefined
        t: Date.now(),
      });
      // จำกัดขนาด buffer
      if (this.wristHistory.length > this.CONFIG.WRIST_HISTORY_LENGTH) {
        this.wristHistory.shift();
      }
    }

    // =========================================================================
    // 📋 ตรวจสอบทุกกฎตาม Level Config และเก็บใส่ allErrors
    // =========================================================================

    // Rule 1: Path Shape - เส้นทางเป็นวงโค้ง
    // (เปลี่ยนจาก Position-Based เป็น Shape-Based)
    if (config.checkPath) {
      const err = this.checkPathShape(currentExercise);
      if (err) allErrors.push({ msg: err, rule: "Path Accuracy" });
    }

    // (เก็บไว้เผื่อใช้ในอนาคต - Position-Based)
    // if (config.checkPath && referencePath && referencePath.length > 0) {
    //   const err = this.checkPathAccuracy(
    //     activeWrist,
    //     referencePath,
    //     currentExercise
    //   );
    //   if (err) allErrors.push({ msg: err, rule: "Path Accuracy" });
    // }

    // Rule 2: Arm Rotation - หมุนฝ่ามือถูกทิศ (หงาย/คว่ำ)
    if (config.checkRotation) {
      const err = this.checkArmRotation(
        activeThumb,
        activePinky,
        currentExercise,
      );
      if (err) allErrors.push({ msg: err, rule: "Arm Rotation" });
    }

    // Rule 3: Elbow Sinking - ศอกจม ไม่ลอย (沉肩坠肘)
    if (config.checkElbow) {
      const err = this.checkElbowSinking(
        activeShoulder,
        activeElbow,
        activeWrist,
      );
      if (err) allErrors.push({ msg: err, rule: "Elbow Sinking" });
    }

    // Rule 4: Waist Initiation - เอวนำ (腰为轴)
    if (config.checkWaist) {
      const err = this.checkWaistInitiation(landmarks);
      if (err) allErrors.push({ msg: err, rule: "Waist Initiation" });
    }

    // Rule 5: Vertical Stability - ศีรษะนิ่ง (虚领顶劲)
    if (config.checkStability) {
      const err = this.checkVerticalStability(nose);
      if (err) allErrors.push({ msg: err, rule: "Vertical Stability" });
    }

    // Rule 6: Smoothness - เคลื่อนไหวลื่น (如抽丝)
    if (config.checkSmooth) {
      const err = this.checkSmoothness(activeWrist, timestamp);
      if (err) allErrors.push({ msg: err, rule: "Smoothness" });
    }

    // Rule 7: Continuity - ต่อเนื่องไม่ขาดตอน (绵绵不断)
    if (config.checkContinuity) {
      const err = this.checkContinuity();
      if (err) allErrors.push({ msg: err, rule: "Continuity" });
    }

    // Rule 8: Weight Shift - ถ่ายน้ำหนักสมดุล (分虚实)
    if (config.checkWeight) {
      const err = this.checkWeightShift(
        leftHip,
        rightHip,
        leftAnkle,
        rightAnkle,
      );
      if (err) allErrors.push({ msg: err, rule: "Weight Shift" });
    }

    // =========================================================================
    // ⭐ คัดเลือก Feedback ที่จะแสดง (Selection Logic + Sticky)
    // =========================================================================

    // Case 1: พบข้อผิดพลาดในเฟรมนี้
    if (allErrors.length > 0) {
      // เรียงตามความสำคัญ (Priority 1 = สำคัญที่สุด)
      allErrors.sort((a, b) => {
        return (
          (this.RULE_PRIORITY[a.rule] || 99) -
          (this.RULE_PRIORITY[b.rule] || 99)
        );
      });

      // เลือกแสดงเฉพาะข้อที่สำคัญที่สุด (อันดับ 1)
      const topError = allErrors[0].msg;

      // อัปเดต Sticky Logic - จำข้อความและเวลา
      this.lastFeedbackMsg = topError;
      this.lastFeedbackTime = Date.now();

      return [topError]; // Return เป็น Array (เพื่อความเข้ากันได้กับ code เดิม)
    }

    // Case 2: ไม่พบข้อผิดพลาดในเฟรมนี้ -> ใช้ Sticky Logic
    else {
      // ถ้ายังไม่ครบ Hold Time -> แสดงข้อความเดิมต่อ
      // (เพื่อให้ผู้ใช้มีเวลาอ่าน)
      if (
        Date.now() - this.lastFeedbackTime <
        this.CONFIG.FEEDBACK_HOLD_TIME_MS
      ) {
        return this.lastFeedbackMsg ? [this.lastFeedbackMsg] : [];
      } else {
        // Hold Time หมดแล้ว -> เคลียร์ (แสดงว่าถูกต้องแล้ว! 😊)
        this.lastFeedbackMsg = null;
        return []; // [] = สีเขียว/ไร้ข้อความ
      }
    }
  }

  // ===========================================================================
  // 🛠️ HELPER FUNCTIONS: ฟังก์ชันช่วยคำนวณ
  // ===========================================================================

  /**
   * คำนวณระยะห่างระหว่าง 2 จุด (Euclidean Distance)
   * @param {Object} p1 - จุดที่ 1 {x, y}
   * @param {Object} p2 - จุดที่ 2 {x, y}
   * @returns {number} ระยะห่าง (หน่วย normalized 0-1)
   */
  calculateDistance(p1, p2) {
    if (!p1 || !p2) return 0;
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  /**
   * คำนวณมุมของเส้นตรงระหว่าง 2 จุด (เทียบกับแกนนอน)
   * @param {Object} p1 - จุดเริ่มต้น
   * @param {Object} p2 - จุดปลายทาง
   * @returns {number} มุมเป็นองศา (-180 ถึง 180)
   */
  getLineAngle(p1, p2) {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  }

  /**
   * คำนวณความเร็วเชิงมุม (Angular Velocity)
   * รองรับการ Wrap-around (-180 <-> 180)
   * @param {number} angle1 - มุมเริ่มต้น (degrees)
   * @param {number} angle2 - มุมสิ้นสุด (degrees)
   * @param {number} deltaTime - ช่วงเวลา (วินาที)
   * @returns {number} ความเร็ว (degrees/second)
   */
  getAngularVelocity(angle1, angle2, deltaTime) {
    if (deltaTime <= 0) return 0;
    let diff = angle2 - angle1;
    // Handle wrap-around: -170° to 170° shouldn't be 340°, should be -20°
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return Math.abs(diff / deltaTime);
  }

  // ===========================================================================
  // 📋 HELPER METHODS: ฟังก์ชันช่วยเหลือ
  // ===========================================================================

  /**
   * ตรวจสอบว่าผู้ใช้กำลังหยุดนิ่งหรือไม่
   * ใช้ร่วมกันโดย Rule 1 (ข้าม) และ Rule 7 (แจ้งเตือน)
   *
   * @returns {boolean} true = หยุดนิ่ง, false = กำลังเคลื่อนไหว
   */
  isPaused() {
    if (this.wristHistory.length < 3) return false;

    const latestPoint = this.wristHistory[this.wristHistory.length - 1];
    const windowStartTime = latestPoint.t - this.CONFIG.PAUSE_WINDOW_MS;

    // Filter points ภายใน time window
    const recentPoints = this.wristHistory.filter(
      (p) => p.t >= windowStartTime,
    );
    if (recentPoints.length < 2) return false;

    // คำนวณ total distance traveled ใน window
    let totalDistance = 0;
    for (let i = 1; i < recentPoints.length; i++) {
      totalDistance += this.calculateDistance(
        recentPoints[i - 1],
        recentPoints[i],
      );
    }

    // Time span
    const timeSpanMs =
      recentPoints[recentPoints.length - 1].t - recentPoints[0].t;
    if (timeSpanMs <= 0) return false;

    // Average velocity
    const avgVelocity = totalDistance / (timeSpanMs / 1000);

    return avgVelocity < this.CONFIG.PAUSE_AVG_VELOCITY_THRESHOLD;
  }

  // ===========================================================================
  // 📋 RULE IMPLEMENTATIONS: การตรวจสอบแต่ละกฎ
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // Rule 1: Path Shape - รูปทรงเส้นทาง (Time-Based v0.9.10)
  // ---------------------------------------------------------------------------
  /**
   * ตรวจสอบว่าเส้นทางที่ผู้ฝึกวาดเป็นวงโค้งหรือไม่
   *
   * Algorithm (Time-Based Direction Consistency) v0.9.10:
   *   1. Filter wristHistory ใน time window (1 วินาทีล่าสุด)
   *   2. คำนวณ cross product ทุก 3 จุดติดกันเพื่อหาทิศทางหมุน
   *   3. ถ้าทิศทางหมุน (CW/CCW) สม่ำเสมอ >= threshold = ผ่าน
   *
   * ข้อดี:
   *   - ไม่ขึ้นกับตำแหน่งบนหน้าจอ
   *   - ไม่ขึ้นกับขนาดวงกลม (เล็ก/ใหญ่ = ถูก)
   *   - ไม่ขึ้นกับความเร็ว (ช้า/เร็ว = ถูก)
   *   - 🆕 ไม่ขึ้นกับ Frame Rate หรือ Skip Interval
   *
   * @param {string} currentExercise - ท่าที่ฝึก ('rh_cw', 'lh_cw', etc.)
   * @returns {string|null} ข้อความผิดพลาด หรือ null ถ้าถูกต้อง
   */
  checkPathShape(currentExercise = "rh_cw") {
    const threshold = this.CONFIG.SHAPE_CONSISTENCY_THRESHOLD;
    const analysisPoints = this.CONFIG.SHAPE_ANALYSIS_POINTS;

    // ต้องมี points เพียงพอก่อนวิเคราะห์
    if (this.wristHistory.length < analysisPoints) {
      return null;
    }

    // ถ้าหยุดนิ่ง ให้ข้าม Rule 1 และปล่อยให้ Rule 7 (Continuity) จัดการ
    if (this.isPaused()) {
      return null;
    }

    // Slice-Based: ใช้ N จุดล่าสุด
    const recentHistory = this.wristHistory.slice(-analysisPoints);

    // นับทิศทางหมุน (clockwise vs counter-clockwise)
    let clockwiseTurns = 0;
    let counterClockwiseTurns = 0;

    for (let i = 2; i < recentHistory.length; i++) {
      const p1 = recentHistory[i - 2];
      const p2 = recentHistory[i - 1];
      const p3 = recentHistory[i];

      // Cross product: ถ้า > 0 = CW, < 0 = CCW (ใน screen coords ที่ Y กลับหัว)
      const cross =
        (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);

      if (cross > 0.0001) {
        clockwiseTurns++;
      } else if (cross < -0.0001) {
        counterClockwiseTurns++;
      }
    }

    // คำนวณ totals และ consistency
    const total = clockwiseTurns + counterClockwiseTurns;

    // ถ้า total = 0 แปลว่าเคลื่อนที่เป็นเส้นตรง → แจ้งเตือน
    if (total === 0) {
      return this.getMessage("moveInCircle");
    }

    const consistency = Math.max(clockwiseTurns, counterClockwiseTurns) / total;

    // Debug Mode
    if (this.debugMode) {
      this.debugInfo.shapeConsistency = consistency.toFixed(2);
      this.debugInfo.shapeThreshold = threshold.toFixed(2);
      this.debugInfo.cwTurns = clockwiseTurns;
      this.debugInfo.ccwTurns = counterClockwiseTurns;
      this.debugInfo.shapePoints = recentHistory.length;
    }

    // ตรวจทิศทางก่อน (สำคัญกว่า consistency)
    const expectedCW = currentExercise.includes("cw");
    const actualCW = counterClockwiseTurns > clockwiseTurns; // สลับเพราะ mirror

    // ตรวจทิศทางเมื่อมี turn ชัดเจน (dominance > 60%)
    const dominance = Math.max(clockwiseTurns, counterClockwiseTurns) / total;
    if (dominance >= 0.6 && expectedCW !== actualCW) {
      return this.getMessage("wrongDirection");
    }

    // ถ้า consistency ต่ำกว่า threshold = ไม่เป็นวงโค้ง
    if (consistency < threshold) {
      return this.getMessage("moveInCircle");
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Rule 1 (เก่า): Path Accuracy - Position-Based (เก็บไว้เผื่อใช้ในอนาคต)
  // ---------------------------------------------------------------------------
  /*
  checkPathAccuracy(userWrist, referencePath, currentExercise = "rh_cw") {
    if (!userWrist) return null;

    let minDistance = Infinity;

    // ลองใช้ Ghost position ก่อน (ถ้า Ghost กำลังเล่นอยู่)
    if (typeof ghostManager !== "undefined" && ghostManager.isPlaying) {
      const ghostFrame = ghostManager.getCurrentFrame();
      if (ghostFrame && ghostFrame.length > 0) {
        const isRightHand = currentExercise.startsWith("rh");
        const ghostWristIndex = isRightHand ? 16 : 15;
        const ghostWrist = ghostFrame[ghostWristIndex];
        if (ghostWrist) {
          minDistance = this.calculateDistance(userWrist, ghostWrist);
        }
      }
    }

    // Fallback: ถ้าไม่มี Ghost ให้ใช้ path เดิม
    if (minDistance === Infinity && referencePath && referencePath.length > 0) {
      for (const refPoint of referencePath) {
        const d = this.calculateDistance(userWrist, refPoint);
        if (d < minDistance) minDistance = d;
      }
    }

    if (minDistance === Infinity) return null;

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

    if (this.debugMode) {
      this.debugInfo.pathDistance = minDistance.toFixed(3);
      this.debugInfo.pathThreshold = threshold.toFixed(3);
    }

    return minDistance > threshold
      ? "⚠️ ขยับให้เหมือนต้นแบบ (Adjust to match guide)"
      : null;
  }
  */

  // ---------------------------------------------------------------------------
  // Rule 2: Arm Rotation - การหมุนฝ่ามือ
  // ---------------------------------------------------------------------------
  /**
   * ตรวจสอบว่าหมุนฝ่ามือ (หงาย/คว่ำ) ถูกต้องตามทิศทางการเคลื่อนไหว
   *
   * หลักการ:
   *   - มือขวา-ตามเข็ม (rh_cw): ขึ้น=หงาย, ลง=คว่ำ
   *   - มือขวา-ทวนเข็ม (rh_ccw): ขึ้น=คว่ำ, ลง=หงาย
   *   - มือซ้าย กลับกัน
   *
   * Algorithm:
   *   1. หาทิศทางการเคลื่อนไหว (ขึ้น/ลง) จาก wristHistory
   *   2. ตรวจสอบตำแหน่งนิ้วโป้ง vs นิ้วก้อย (หงาย=thumb.x > pinky.x สำหรับมือขวา)
   *   3. เปรียบเทียบกับที่ควรจะเป็นตามท่าที่เลือก
   *
   * @param {Object} thumb - ตำแหน่งนิ้วโป้ง {x, y}
   * @param {Object} pinky - ตำแหน่งนิ้วก้อย {x, y}
   * @param {string} moveType - ท่าที่กำลังฝึก ('rh_cw', 'rh_ccw', 'lh_cw', 'lh_ccw')
   * @returns {string|null} ข้อความผิดพลาด หรือ null ถ้าถูกต้อง
   */
  checkArmRotation(thumb, pinky, moveType) {
    // Guard: ต้องมีข้อมูลเพียงพอ
    if (!thumb || !pinky || this.wristHistory.length < 2) {
      return null;
    }

    // Step 1: หาทิศทางการเคลื่อนไหว (ขึ้น = deltaY < 0, ลง = deltaY > 0)
    const p_current = this.wristHistory[this.wristHistory.length - 1];
    const p_previous = this.wristHistory[this.wristHistory.length - 2];
    const deltaY = p_current.y - p_previous.y;

    // ถ้าขยับน้อยเกินไป ไม่ต้องตรวจ
    if (Math.abs(deltaY) < this.CONFIG.ARM_MOTION_THRESHOLD) {
      return null;
    }
    const isMovingUp = deltaY < 0; // Y ใน screen coords: ขึ้น = น้อยลง
    const isMovingDown = deltaY > 0;

    // Step 2: ตรวจสอบการหงาย/คว่ำตัวจริง (Supination/Pronation)
    // 🆕 เพิ่ม Neutral Zone: ถ้า thumb.x ใกล้ pinky.x (กำลังหมุน) ไม่ต้องตรวจ
    const thumbPinkyDiff = Math.abs(thumb.x - pinky.x);
    const neutralZone = this.CONFIG.ARM_ROTATION_NEUTRAL_ZONE || 0.03; // 3% tolerance

    if (thumbPinkyDiff < neutralZone) {
      // มือกำลังหมุนอยู่ในช่วงเปลี่ยนผ่าน - ไม่ตรวจ
      return null;
    }

    // มือขวา หงาย = นิ้วโป้งอยู่ทางขวาของนิ้วก้อย (thumb.x > pinky.x)
    // มือซ้าย หงาย = นิ้วโป้งอยู่ทางซ้ายของนิ้วก้อย (thumb.x < pinky.x)
    const isRightHand = moveType.startsWith("rh");
    const isActuallySupinated = isRightHand
      ? thumb.x > pinky.x
      : thumb.x < pinky.x;

    // Step 3: กำหนดว่าควรจะเป็นอย่างไรตามท่าที่เลือก
    let isSupinationExpected = false;
    if (isMovingUp) {
      // ขึ้น: rh_cw และ lh_ccw ควรหงาย
      isSupinationExpected = moveType === "rh_cw" || moveType === "lh_ccw";
    } else if (isMovingDown) {
      // ลง: rh_ccw และ lh_cw ควรหงาย
      isSupinationExpected = moveType === "rh_ccw" || moveType === "lh_cw";
    }

    // Step 4: เปรียบเทียบและส่ง Feedback
    if (isSupinationExpected !== isActuallySupinated) {
      return this.getMessage("incorrectRotation");
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Rule 3: Elbow Sinking - ศอกจม (沉肩坠肘)
  // ---------------------------------------------------------------------------
  /**
   * ตรวจสอบว่าศอกจม ไม่ลอยขึ้นสูงกว่าไหล่
   *
   * หลัก "沉肩坠肘" (ชิ่นเจียน จุ้ยโจ่ว):
   *   - ผ่อนไหล่ลง, ศอกตก
   *   - พลังจมลงไปยังฐานล่าง
   *
   * @param {Object} shoulder - ตำแหน่งไหล่ {x, y}
   * @param {Object} elbow - ตำแหน่งศอก {x, y}
   * @param {Object} wrist - ตำแหน่งข้อมือ {x, y} (ไม่ได้ใช้ แต่เก็บไว้สำหรับอนาคต)
   * @returns {string|null} ข้อความผิดพลาด หรือ null ถ้าถูกต้อง
   */
  checkElbowSinking(shoulder, elbow, wrist) {
    // Tolerance: ป้องกันการแจ้งถี่เกินไปจากการขยับเล็กน้อย
    const tolerance = this.calibrationData
      ? this.calibrationData.torsoHeight * 0.05 // 5% ของความสูงลำตัว
      : 0.01; // ค่า Default

    // ตรวจ: ศอกอยู่สูงกว่าไหล่มากไป (elbow.y < shoulder.y - tolerance)
    // หมายเหตุ: Y ใน screen coords = ค่าน้อย = อยู่สูง
    if (elbow.y < shoulder.y - tolerance) {
      return this.getMessage("elbowTooHigh");
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Rule 4: Waist Initiation - เอวนำ (腰为轴)
  // ---------------------------------------------------------------------------
  /**
   * ตรวจสอบว่าเอวเป็นตัวนำการเคลื่อนไหว ไม่ใช่ไหล่
   * หลัก "腰为轴" (เอาเหวยโจ่ว) - เอวเป็นเพลากลาง ทุกการเคลื่อนไหวเริ่มจากเอว
   *
   * Algorithm:
   *   1. คำนวณความเร็วเชิงมุมของไหล่และสะโพก
   *   2. ถ้าไหล่หมุนเร็วกว่าสะโพก 3 เท่า = ผิด (ไหล่นำแทนเอว)
   *
   * 🆕 v0.9.11: ใช้ Date.now() แทน timestamp จาก MediaPipe ซึ่งเป็น undefined
   */
  checkWaistInitiation(landmarks) {
    const now = Date.now();

    // เฟรมแรก: เก็บข้อมูลไว้เปรียบเทียบ
    if (this.lastWaistTimestamp === undefined) {
      this.lastWaistTimestamp = now;
      this.lastWaistLandmarks = landmarks;
      return null;
    }

    // คำนวณ delta time (วินาที)
    const dt = (now - this.lastWaistTimestamp) / 1000;
    if (dt < 0.01) return null; // ป้องกัน division by zero

    // คำนวณมุมของไหล่และสะโพก (เส้นเชื่อมซ้าย-ขวา)
    const curShoulderAngle = this.getLineAngle(landmarks[11], landmarks[12]);
    const lastShoulderAngle = this.getLineAngle(
      this.lastWaistLandmarks[11],
      this.lastWaistLandmarks[12],
    );
    const curHipAngle = this.getLineAngle(landmarks[23], landmarks[24]);
    const lastHipAngle = this.getLineAngle(
      this.lastWaistLandmarks[23],
      this.lastWaistLandmarks[24],
    );

    // คำนวณความเร็วเชิงมุม (degrees/second)
    const shoulderVel = this.getAngularVelocity(
      lastShoulderAngle,
      curShoulderAngle,
      dt,
    );
    const hipVel = this.getAngularVelocity(lastHipAngle, curHipAngle, dt);

    // อัปเดต state สำหรับเฟรมถัดไป
    this.lastWaistTimestamp = now;
    this.lastWaistLandmarks = landmarks;

    // Debug Mode
    if (this.debugMode) {
      this.debugInfo.shoulderVel = shoulderVel?.toFixed(1);
      this.debugInfo.hipVel = hipVel?.toFixed(1);
    }

    // ตัดสิน: ถ้าสะโพกหมุนอยู่ แต่ไหล่เร็วกว่า 3 เท่า = ไหล่นำ ผิดหลัก
    const RATIO_THRESHOLD = this.CONFIG.SHOULDER_HIP_RATIO;
    const MIN_HIP_VELOCITY = this.CONFIG.MIN_HIP_VELOCITY_DEG_SEC;

    if (hipVel > MIN_HIP_VELOCITY && shoulderVel > hipVel * RATIO_THRESHOLD) {
      return this.getMessage("startWithWaist");
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Rule 5: Vertical Stability - ศีรษะนิ่ง (虚领顶劲)
  // ---------------------------------------------------------------------------
  /**
   * ตรวจสอบว่าศีรษะนิ่ง ไม่กระดกขึ้นลงมากเกินไป
   * หลัก "虚领顶劲" (ซวี่หลิงติ่งจิ้น) - โปรงกระหม่อมเบา ศีรษะตั้งตรง
   */
  checkVerticalStability(nose) {
    if (!nose) return null;

    // เก็บประวัติตำแหน่ง Y ของศีรษะ
    this.headYHistory.push(nose.y);
    if (this.headYHistory.length > this.CONFIG.STABILITY_HISTORY_LENGTH)
      this.headYHistory.shift();

    // ต้องมีข้อมูลเพียงพอก่อนตัดสิน
    if (this.headYHistory.length < this.CONFIG.STABILITY_HISTORY_LENGTH)
      return null;

    // หาค่า displacement (ระยะห่างระหว่าง min-max)
    const min = Math.min(...this.headYHistory);
    const max = Math.max(...this.headYHistory);
    const displacement = max - min;

    // Dynamic Threshold ตามความสูงลำตัว
    let threshold = this.CONFIG.STABILITY_THRESHOLD_DEFAULT;
    if (this.calibrationData) {
      threshold =
        this.calibrationData.torsoHeight *
        this.CONFIG.STABILITY_THRESHOLD_CALIBRATION_RATIO;
    }

    if (displacement > threshold) return this.getMessage("headUnstable");
    return null;
  }

  // ---------------------------------------------------------------------------
  // Rule 6: Smoothness - ความลื่นไหล (如抽丝)
  // ---------------------------------------------------------------------------
  /**
   * ตรวจสอบว่าเคลื่อนไหวลื่น ไม่สะดุดกระตุก
   * หลัก "如抽丝" (รู๊โชวสือ) - เหมือนดึงเส้นไหม สม่ำเสมอ
   * @param {Object} wrist - ตำแหน่งข้อมือ {x, y}
   * @param {number} timestamp - เวลาปัจจุบัน (ms)
   */
  checkSmoothness(wrist, timestamp) {
    if (!wrist) return null;

    // wristHistory ถูก populate แล้วใน analyze()
    // ต้องมี 3 จุดขึ้นไปเพื่อคำนวณ acceleration
    if (this.wristHistory.length < 3) return null;

    const p3 = this.wristHistory[this.wristHistory.length - 1];
    const p2 = this.wristHistory[this.wristHistory.length - 2];
    const p1 = this.wristHistory[this.wristHistory.length - 3];

    // Time-normalized velocity (units/second)
    const dt2 = (p3.t - p2.t) / 1000;
    const dt1 = (p2.t - p1.t) / 1000;
    if (dt1 <= 0 || dt2 <= 0) return null;

    const dist2 = this.calculateDistance(p2, p3);
    const dist1 = this.calculateDistance(p1, p2);
    const v2 = dist2 / dt2;
    const v1 = dist1 / dt1;
    const acceleration = Math.abs(v2 - v1);

    // Dynamic Threshold ตามความยาวแขน
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
      this.debugInfo.smoothThreshold = threshold.toFixed(3);
    }

    if (acceleration > threshold) return this.getMessage("notSmooth");
    return null;
  }

  // ---------------------------------------------------------------------------
  // Rule 7: Continuity - ความต่อเนื่อง (绵绵不断) - TIME-BASED
  // ---------------------------------------------------------------------------
  /**
   * ตรวจสอบว่าไม่หยุดนิ่งระหว่างการฝึก
   * หลัก "绵绵不断" (เหมียนเหมียนปู้ต้วน) - ต่อเนื่องไม่ขาดตอน
   *
   * 🆕 ใช้ isPaused() helper ซึ่งคำนวณ Time-Based Average Velocity
   */
  checkContinuity() {
    // Debug info
    if (this.debugMode) {
      this.debugInfo.isPaused = this.isPaused();
    }

    // ใช้ isPaused() ที่คำนวณ avg velocity แล้ว
    if (this.isPaused()) {
      return this.getMessage("keepMoving");
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Rule 8: Weight Shift - สมดุล (分虚实)
  // ---------------------------------------------------------------------------
  /**
   * ตรวจสอบว่าจุดศูนย์ถ่วงอยู่ในฐานการยืน
   * หลัก "分虚实" (เฟินซวี่ซื่อ) - รู้จักแยกเต็ม/ว่าง ไม่เอียงจนล้ม
   */
  checkWeightShift(leftHip, rightHip, leftAnkle, rightAnkle) {
    if (!leftHip || !rightHip || !leftAnkle || !rightAnkle) return null;

    // คำนวณจุดกึ่งกลางสะโพก (จุดศูนย์ถ่วง)
    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const stanceWidth = Math.abs(leftAnkle.x - rightAnkle.x);

    // กำหนดขอบเขตฐานการยืน (Base of Support)
    const leftBoundary = Math.min(leftAnkle.x, rightAnkle.x);
    const rightBoundary = Math.max(leftAnkle.x, rightAnkle.x);

    // Buffer 10% - ไม่ให้เอียงจนสุดขอบ
    const buffer = stanceWidth * 0.1;

    // ตรวจ: สะโพกออกนอก Safe Zone หรือไม่
    if (
      hipCenter < leftBoundary + buffer ||
      hipCenter > rightBoundary - buffer
    ) {
      return this.getMessage("offBalance");
    }
    return null;
  }
}
