/**
 * ============================================================================
 * TaijiFlow AI - Drawing Manager v1.0
 * ============================================================================
 *
 * รับผิดชอบการวาดภาพทั้งหมดลงบน Canvas
 *
 * 🎨 Features:
 *   - วาด Skeleton (โครงกระดูก) จาก MediaPipe landmarks
 *   - วาด Reference Path (เส้นทางต้นแบบ)
 *   - วาด Feedback Panel (กล่องแสดงข้อผิดพลาด)
 *   - วาด Gesture Progress (วงกลมความคืบหน้าท่าทาง)
 *   - วาด Debug Overlay (แสดงค่า Threshold และค่าวัด)
 *
 * 🗒️ หมายเหตุ Mirror:
 *   - Webcam ส่งภาพ mirror มาแล้ว (เหมือนส่องกระจก)
 *   - แต่ Skeleton และ Path ต้อง mirror เพิ่มเมื่อ Fullscreen
 *   - ใช้ scale(-1, 1) + translate เพื่อพลิกภาพ
 *
 * 📊 Coordinate System:
 *   - landmarks อยู่ในหน่วย normalized (0-1)
 *   - คูณ canvasWidth/Height เพื่อแปลงเป็น pixel
 *
 * ============================================================================
 */
class DrawingManager {
  /**
   * @param {CanvasRenderingContext2D} canvasCtx - Canvas 2D context
   * @param {HTMLCanvasElement} canvasElement - Canvas element
   */
  constructor(canvasCtx, canvasElement) {
    // =========================================================================
    // 📁 STATE: เก็บ reference และขนาด
    // =========================================================================
    this.ctx = canvasCtx; // Canvas 2D context สำหรับวาด
    this.canvasWidth = canvasElement.width; // ความกว้าง (pixel)
    this.canvasHeight = canvasElement.height; // ความสูง (pixel)
    this.mirrorDisplay = false; // Mirror mode (ปกติ = false เพราะ webcam mirror มาแล้ว)

    // =========================================================================
    // 🎭 VIRTUAL BACKGROUND: Temporal Smoothing & Performance
    // =========================================================================
    this.previousMask = null; // เก็บ mask ของ frame ก่อนหน้า (สำหรับ temporal smoothing)
    this.temporalWeight = 0.7; // น้ำหัก: previous mask (0.7) + new mask (0.3)

    // Reusable canvases (หลีกเลี่ยงการสร้างใหม่ทุก frame)
    this.tempBlurCanvas = null; // สำหรับเบลอพื้นหลัง
    this.tempPersonCanvas = null; // สำหรับตัดส่วนคน
    this.tempMaskCanvas = null; // สำหรับ process mask (feather + smooth)
  }

  // ===========================================================================
  // 🛠️ CONFIG METHODS: ตั้งค่า
  // ===========================================================================

  /**
   * วาดตาราง Grid Overlay เพื่อช่วยวัดตำแหน่ง (Enhanced v2)
   * @param {string} color - สีเส้นตาราง (format: 'R, G, B')
   * @param {number} opacity - ความโปร่งใส (0.0 - 1.0)
   * @param {number} gridSize - ขนาดช่องตาราง (pixel)
   */
  drawGrid(color = "255, 255, 255", opacity = 0.2, gridSize = 100) {
    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;

    // Save context
    this.ctx.save();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = `rgba(${color}, ${opacity})`;

    // ----- เส้นแนวตั้ง (Vertical) -----
    for (let x = 0; x <= width; x += gridSize) {
      if (Math.abs(x - width / 2) < 2) continue; // Skip near center (will draw separately)
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // ----- เส้นแนวนอน (Horizontal) -----
    for (let y = 0; y <= height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // ----- Center Line (แกนกลาง) - เน้นสีแดงเสมอ -----
    // ปรับความทึบของแกนกลางให้เห็นชัดกว่าเส้นปกติเล็กน้อย
    const centerOpacity = Math.min(opacity + 0.3, 0.8);
    this.ctx.strokeStyle = `rgba(255, 50, 50, ${centerOpacity})`;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(width / 2, 0);
    this.ctx.lineTo(width / 2, height);
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * เปิด/ปิด Mirror Mode
   * ใช้เมื่อต้องการพลิกภาพเพิ่มเติม (เช่น Fullscreen)
   * @param {boolean} enabled - true = mirror, false = ไม่ mirror
   */
  setMirror(enabled) {
    this.mirrorDisplay = enabled;
  }

  // ===========================================================================
  // 🗃️ SKELETON: วาดโครงกระดูก
  // ===========================================================================

  /**
   * วาดโครงกระดูก (Pose Landmarks)
   * ใช้ฟังก์ชัน MediaPipe: drawConnectors, drawLandmarks
   *
   * @param {Object[]} landmarks - 33 จุดจาก MediaPipe Pose
   * @param {number[]} errorJoints - Array of joint indices to highlight (default: [])
   */
  drawSkeleton(landmarks, errorJoints = []) {
    this.ctx.save();

    // ----- Mirror Logic -----
    // หมายเหตุ: CSS scaleX(-1) บน canvas ทำ mirror อยู่แล้ว
    // ใน Fullscreen (canvas-container) CSS นี้ยังคงทำงาน
    // ดังนั้น DrawingManager ไม่ต้อง mirror เพิ่ม
    const shouldMirror = this.mirrorDisplay;
    if (shouldMirror) {
      this.ctx.scale(-1, 1); // พลิกแนวนอน
      this.ctx.translate(-this.canvasWidth, 0); // ย้ายกลับมา
    }

    // ----- วาดเส้นเชื่อมข้อต่อ (White, slightly transparent) -----
    drawConnectors(this.ctx, landmarks, POSE_CONNECTIONS, {
      color: "rgba(255, 255, 255, 0.7)",
      lineWidth: 4,
    });

    // ----- วาดจุดข้อต่อ (Custom Loop for Highlighting) -----
    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      // MediaPipe landmarks are normalized (0-1)
      const x = landmark.x * this.canvasWidth;
      const y = landmark.y * this.canvasHeight;

      const isError = errorJoints && errorJoints.includes(i);

      this.ctx.beginPath();

      if (isError) {
        // 🔴 Error: Red, Bigger, Glow
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
        this.ctx.fillStyle = "#FF0000";
        this.ctx.arc(x, y, 8, 0, 2 * Math.PI); // Radius 8
      } else {
        // ⚪ Normal: White
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.arc(x, y, 4, 0, 2 * Math.PI); // Radius 4
      }

      this.ctx.fill();
    }

    // Reset shadow
    this.ctx.shadowBlur = 0;

    this.ctx.restore();
    this.ctx.restore();
  }

  /**
   * วาดเฉพาะจุด Error Highlights (ไม่ต้องมีโครง)
   * ใช้กรณีที่ปิด Skeleton แต่ต้องการเห็นจุดผิด
   *
   * @param {Object[]} landmarks - 33 จุดจาก MediaPipe Pose
   * @param {number[]} errorJoints - Array of joint indices to highlight
   */
  drawErrorHighlights(landmarks, errorJoints) {
    if (!errorJoints || errorJoints.length === 0) return;

    this.ctx.save();

    // ----- Mirror Logic -----
    const shouldMirror = this.mirrorDisplay;
    if (shouldMirror) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.canvasWidth, 0);
    }

    // ----- วาดเฉพาะจุด Error -----
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
    this.ctx.fillStyle = "#FF0000";

    errorJoints.forEach((index) => {
      const landmark = landmarks[index];
      if (landmark) {
        const x = landmark.x * this.canvasWidth;
        const y = landmark.y * this.canvasHeight;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, 2 * Math.PI); // Radius 8
        this.ctx.fill();
      }
    });

    this.ctx.shadowBlur = 0;
    this.ctx.restore();
  }

  // ===========================================================================
  // 🟣 REFERENCE PATH: วาดเส้นทางต้นแบบ
  // ===========================================================================

  /**
   * วาดเส้นทางการเคลื่อนที่ต้นแบบ (Reference Path)
   * แปลง normalized coords (0-1) เป็น pixel coords
   *
   * @param {Object[]} path - Array ของจุด {x, y} (หน่วย normalized 0-1)
   * @param {string} color - สีของเส้น (CSS color or RGB string "r, g, b")
   * @param {number} width - ความหนาของเส้น (pixel)
   */
  drawPath(path, color, width) {
    this.ctx.save();

    // ----- Mirror Logic (เหมือน drawSkeleton) -----
    const shouldMirror = this.mirrorDisplay;
    if (shouldMirror) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.canvasWidth, 0);
    }

    // ----- Determine Stroke Style -----
    // ถ้า color เป็น "r, g, b" ให้แปลงเป็น rgba(r, g, b, 0.5)
    // ถ้าเป็น hex หรือ named color ให้ใช้เลย
    let strokeStyle = color;
    if (
      color.includes(",") &&
      !color.startsWith("rgba") &&
      !color.startsWith("rgb")
    ) {
      strokeStyle = `rgba(${color}, 0.5)`;
    }

    // ----- วาดเส้นทาง -----
    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = width;

    if (path.length > 0) {
      // ย้ายไปยังจุดแรก (แปลง normalized → pixel)
      this.ctx.moveTo(
        path[0].x * this.canvasWidth,
        path[0].y * this.canvasHeight,
      );
      // ลากเส้นไปยังจุดถัดไป
      for (let i = 1; i < path.length; i++) {
        this.ctx.lineTo(
          path[i].x * this.canvasWidth,
          path[i].y * this.canvasHeight,
        );
      }
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  // ===========================================================================
  // 👻 GHOST SKELETON: วาดร่างเงาต้นแบบ
  // ===========================================================================

  /**
   * วาด Ghost Skeleton (ร่างเงาต้นแบบ)
   * ใช้สำหรับแสดงท่าที่ผู้ฝึกควรทำตาม
   *
   * @param {Object[]} landmarks - 33 จุดจาก reference data
   * @param {number} opacity - ความโปร่งใส (0-1), default 0.4
   * @param {string} color - สีเส้น (RGB string e.g. "100, 200, 255")
   */
  drawGhostSkeleton(landmarks, opacity = 0.4, color = "100, 200, 255") {
    if (!landmarks || landmarks.length < 33) return;

    this.ctx.save();

    // ----- Mirror Logic (เหมือน drawSkeleton) -----
    const shouldMirror = this.mirrorDisplay;
    if (shouldMirror) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.canvasWidth, 0);
    }

    // ----- Global Opacity -----
    this.ctx.globalAlpha = opacity;

    // MediaPipe drawConnectors/drawLandmarks ใช้ normalized coords (0-1)
    // ไม่ต้องแปลงเป็น pixel (เหมือน drawSkeleton)

    // ----- วาดเส้นเชื่อมข้อต่อ (ใช้สีที่เลือก) -----
    drawConnectors(this.ctx, landmarks, POSE_CONNECTIONS, {
      color: `rgba(${color}, 1)`, // Tint Color
      lineWidth: 2, // บางกว่า user skeleton
    });

    // ----- วาดจุดข้อต่อ (สีขาวเสมอ เพื่อให้เห็นตำแหน่งชัด) -----
    drawLandmarks(this.ctx, landmarks, {
      color: "rgba(255, 255, 255, 1)", // White
      lineWidth: 1,
      radius: 3, // เล็กกว่า user skeleton
    });

    this.ctx.restore();
  }

  // ===========================================================================
  // 🎬 GHOST SILHOUETTE VIDEO: วาดเงาคนสอนจากวิดีโอ
  // ===========================================================================

  /**
   * วาดเงาคนสอนจาก silhouette video
   *
   * @param {HTMLVideoElement} video - Video element ที่มี silhouette
   * @param {number} opacity - ความโปร่งใส (0-1)
   */
  /**
   * วาดเงาคนสอนจาก silhouette video
   *
   * @param {HTMLVideoElement} video - Video element ที่มี silhouette
   * @param {number} opacity - ความโปร่งใส (0-1)
   * @param {string} color - สี tint (RGB string e.g. "100, 200, 255") - ถ้า null/undefined จะใช้สีเดิม
   */
  drawSilhouetteVideo(video, opacity = 0.4, color = null) {
    if (!video || video.readyState < 2) return; // ยังโหลดไม่เสร็จ

    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;

    this.ctx.save();

    // ----- Mirror Logic (เหมือน drawSkeleton) -----
    // Note: เราจะ flip ตอนวาดลง Main Canvas สุดท้าย

    // ----- Global Opacity -----
    this.ctx.globalAlpha = opacity;

    if (color) {
      // 🟢 กรณีมี Tint Color: ต้องใช้ Off-screen Canvas
      // 1. Prepare Temp Canvas
      if (!this.tempGhostCanvas) {
        this.tempGhostCanvas = document.createElement("canvas");
      }

      // Update dimensions
      if (
        this.tempGhostCanvas.width !== width ||
        this.tempGhostCanvas.height !== height
      ) {
        this.tempGhostCanvas.width = width;
        this.tempGhostCanvas.height = height;
      }

      const tempCtx = this.tempGhostCanvas.getContext("2d");
      tempCtx.clearRect(0, 0, width, height);

      // 2. วาด Video ลง Temp (Normal) -> แปลงเป็น Grayscale เพื่อให้ Tint สีได้ถูกต้อง
      tempCtx.save();
      // Boost Brightness & Contrast to make it solid white
      tempCtx.filter = "grayscale(100%) brightness(500%) contrast(500%)";
      tempCtx.globalCompositeOperation = "source-over";
      tempCtx.drawImage(video, 0, 0, width, height);
      tempCtx.filter = "none"; // Reset filter

      // 3. Apply Tint (Multiply: White -> Color, Black -> Black)
      tempCtx.globalCompositeOperation = "multiply";
      tempCtx.fillStyle = `rgb(${color})`;
      tempCtx.fillRect(0, 0, width, height);
      tempCtx.restore();

      // 4. วาด Temp ลง Main (Apply Mirror + Blend Mode)
      if (this.mirrorDisplay) {
        this.ctx.scale(-1, 1);
        this.ctx.translate(-width, 0);
      }

      // Blend Mode: Lighter (Add) เพื่อให้สว่างจ้า
      this.ctx.globalCompositeOperation = "lighter";
      this.ctx.drawImage(this.tempGhostCanvas, 0, 0, width, height);
    } else {
      // ⚪ กรณีไม่มี Tint (Original Logic)
      if (this.mirrorDisplay) {
        this.ctx.scale(-1, 1);
        this.ctx.translate(-width, 0);
      }

      this.ctx.globalCompositeOperation = "lighter";
      this.ctx.drawImage(video, 0, 0, width, height);
    }

    this.ctx.restore();
  }

  // ===========================================================================
  // 🎭 SILHOUETTE: วาดเงาผู้ฝึก
  // ===========================================================================

  /**
   * วาด Silhouette (เงาร่างผู้ฝึก) จาก segmentation mask
   *
   * @param {CanvasImageSource} mask - Segmentation mask จาก MediaPipe
   * @param {string} color - สีเงา (CSS color)
   * @param {HTMLVideoElement} video - Video element (สำหรับขนาด)
   */
  drawSilhouette(mask, color, video) {
    if (!mask) return;

    this.ctx.save();

    // ----- สร้าง temporary canvas สำหรับ mask processing -----
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = this.canvasWidth;
    tempCanvas.height = this.canvasHeight;
    const tempCtx = tempCanvas.getContext("2d");

    // ----- วาด mask ลง temp canvas -----
    tempCtx.drawImage(mask, 0, 0, this.canvasWidth, this.canvasHeight);

    // ----- ใช้ mask เป็น clip path -----
    // วิธีนี้: วาด mask แล้วใช้ composite-destination-in
    this.ctx.globalCompositeOperation = "source-over";

    // วาดสีทึบเต็มจอ
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // ใช้ mask เพื่อ "ตัด" เฉพาะส่วนที่เป็นคน
    this.ctx.globalCompositeOperation = "destination-in";
    this.ctx.drawImage(mask, 0, 0, this.canvasWidth, this.canvasHeight);

    // Reset composite operation
    this.ctx.globalCompositeOperation = "source-over";

    this.ctx.restore();
  }

  // ===========================================================================
  // ⭕ GESTURE FEEDBACK: วาดวงกลมความคืบหน้าท่าทาง
  // ===========================================================================

  /**
   * วาดวงกลมแสดงความคืบหน้าการกดท่าทางค้าง
   * สำหรับ Gesture Start/Stop ด้วยท่าทางมือ
   *
   * @param {Object} feedback - { hand: landmarks[], progress: 0-1 }
   */
  drawGestureFeedback(feedback) {
    if (!feedback || !feedback.hand) return;

    // ใช้ landmark ที่ 9 (โคนนิ้วกลาง) เป็นจุดศูนย์กลางของวงกลม
    const handlandmark = feedback.hand[9];
    if (!handlandmark) return;

    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;

    // แปลง normalized → pixel
    const x = handlandmark.x * canvasWidth;
    const y = handlandmark.y * canvasHeight;
    const radius = 40;

    this.ctx.save();

    // ----- วงกลมพื้นหลังโปร่งแสง -----
    this.ctx.globalAlpha = 0.5;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = "white";
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;

    // ----- เส้นโค้งแสดง Progress -----
    // เริ่มจากด้านบน (-90°) และวาดตาม progress
    this.ctx.beginPath();
    this.ctx.arc(
      x,
      y,
      radius,
      -0.5 * Math.PI, // เริ่ม -90° (ด้านบน)
      (-0.5 + 2 * feedback.progress) * Math.PI, // หมุนตาม progress
    );
    this.ctx.strokeStyle = "#00FF00"; // สีเขียว
    this.ctx.lineWidth = 8;
    this.ctx.stroke();

    this.ctx.restore();
  }

  // ===========================================================================
  // 🟨 FEEDBACK PANEL: กล่องแสดงข้อผิดพลาด
  // ===========================================================================

  /**
   * วาดกล่องแสดงข้อความ Feedback
   * อยู่มุมซ้ายบน พื้นหลังดำโปร่งใส
   *
   * @param {string[]} feedbacks - Array ของข้อความที่จะแสดง
   */
  drawFeedbackPanel(feedbacks) {
    if (!feedbacks || feedbacks.length === 0) return;

    // ----- Flip canvas กลับเพื่อให้ข้อความไม่ mirror -----
    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.translate(-this.canvasWidth, 0);

    // ----- Position & Size -----
    // ตอนนี้ canvas flip กลับแล้ว วาดปกติที่ซ้ายบน
    const padding = 15,
      lineHeight = 30;
    const boxWidth = 450;
    const boxHeight = feedbacks.length * lineHeight + padding * 2;
    const boxX = 20; // ซ้ายบน (ไม่ต้อง flip)
    const boxY = 20;

    // ----- พื้นหลังกล่อง -----
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    this.ctx.fill();

    // ----- ข้อความ -----
    this.ctx.font = 'bold 20px "Sarabun", sans-serif';
    this.ctx.fillStyle = "#FFD700"; // สีทอง
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    feedbacks.forEach((text, index) => {
      this.ctx.fillText(
        text,
        boxX + padding,
        boxY + padding + index * lineHeight,
      );
    });

    this.ctx.restore();
  }

  // ===========================================================================
  // 🔧 DEBUG OVERLAY: แสดงค่า Debug (กด D เพื่อเปิด)
  // ===========================================================================

  /**
   * วาด Debug Overlay แสดงค่าตัวแปรสำคัญ
   * อยู่มุมขวาบน พื้นหลังสีน้ำเงินเข้ม
   *
   * @param {Object} debugInfo - ข้อมูล debug จาก HeuristicsEngine
   *   - pathDistance: ระยะห่างจาก path
   *   - pathThreshold: ค่า threshold ที่ใช้
   *   - wristVelocity: ความเร็วข้อมือ
   *   - acceleration: ความเร่ง
   */
  drawDebugOverlay(debugInfo) {
    if (!debugInfo || Object.keys(debugInfo).length === 0) return;

    // ----- Save current state และ flip กลับเพื่อแก้ปัญหา mirror -----
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform เป็น identity (ไม่ mirror)

    // ----- Position & Size (มุมขวาบนของหน้าจอจริง) -----
    const boxWidth = 320;
    const boxX = this.canvasWidth - boxWidth - 15; // ชิดขวา เว้นขอบ 15px
    const boxY = 15; // ชิดบน
    const padding = 12;
    const lineHeight = 26; // ระยะห่างบรรทัด
    const entries = Object.entries(debugInfo);
    const boxHeight = entries.length * lineHeight + padding * 2 + 35;

    // ----- พื้นหลังกล่อง -----
    this.ctx.fillStyle = "rgba(0, 0, 40, 0.95)"; // สีน้ำเงินเข้มมาก ทึบมาก
    this.ctx.beginPath();
    this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    this.ctx.fill();

    // ----- ขอบ -----
    this.ctx.strokeStyle = "#00FFFF"; // สีฟ้า
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    this.ctx.stroke();

    // ----- หัวข้อ -----
    this.ctx.font = 'bold 18px "Consolas", "Monaco", monospace';
    this.ctx.fillStyle = "#00FFFF";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText("🐞 DEBUG MODE", boxX + padding, boxY + padding);

    // ----- ค่าตัวแปร -----
    this.ctx.font = 'bold 15px "Consolas", "Monaco", monospace';
    this.ctx.fillStyle = "#00FF00"; // สีเขียว

    entries.forEach(([key, value], index) => {
      // แปลง camelCase เป็น "camel Case" และตัดให้สั้น
      const displayKey = key.replace(/([A-Z])/g, " $1").trim();
      this.ctx.fillText(
        `${displayKey}: ${value}`,
        boxX + padding,
        boxY + padding + 30 + index * lineHeight,
      );
    });

    // ----- Restore state -----
    this.ctx.restore();
  }

  // ===========================================================================
  // 🔵 TRAIL VISUALIZATION: วาดเส้นทางการเคลื่อนไหว
  // ===========================================================================

  /**
   * วาดเส้นทางการเคลื่อนไหวของมือ (Wrist Trail)
   * แสดง Trail เส้นเดียว + Glow ที่ปลาย
   *
   * @param {Object[]} trailHistory - Array ของ {x, y, timestamp}
   * @param {string} color - สีของเส้น (RGB string e.g. "100, 200, 255") - Default Cyan
   */
  drawTrail(trailHistory, color = "100, 200, 255") {
    if (!trailHistory || trailHistory.length < 2) return;

    this.ctx.save();

    // ----- Parse Color -----
    const [r, g, b] = color.split(",").map((c) => parseInt(c.trim()));
    const baseColor = { r, g, b };

    // ----- วาดเส้น Trail เดียว (Fading Line) -----
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    for (let i = 1; i < trailHistory.length; i++) {
      const prev = trailHistory[i - 1];
      const curr = trailHistory[i];
      const progress = i / trailHistory.length; // 0 → 1

      // แปลง normalized coords เป็น pixel
      const x1 = prev.x * this.canvasWidth;
      const y1 = prev.y * this.canvasHeight;
      const x2 = curr.x * this.canvasWidth;
      const y2 = curr.y * this.canvasHeight;

      // ยิ่งใหม่ยิ่งเข้ม + หนา
      const opacity = progress * 0.7 + 0.1;
      const lineWidth = progress * 4 + 1;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }

    // ----- วาด Glow ที่ปลาย (จุดปัจจุบัน) -----
    const lastPoint = trailHistory[trailHistory.length - 1];
    const x = lastPoint.x * this.canvasWidth;
    const y = lastPoint.y * this.canvasHeight;

    // Glow effect
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 15);
    gradient.addColorStop(
      0,
      `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.9)`,
    );
    gradient.addColorStop(
      0.5,
      `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.3)`,
    );
    gradient.addColorStop(
      1,
      `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0)`,
    );

    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * แสดง Circularity Score Indicator
   * แสดงเป็นกล่องที่มุมขวาล่าง
   *
   * @param {number} score - คะแนน 0-100
   * @param {string} lang - ภาษา "th" หรือ "en"
   */
  drawCircularityIndicator(score, lang = "th") {
    if (score === null || score === undefined) return;

    this.ctx.save();

    // ----- กำหนดข้อความและสี (ใช้ TRANSLATIONS) -----
    let labelText, bgColor;
    const t = (key) => TRANSLATIONS?.[lang]?.[key] || key;

    if (score >= 80) {
      labelText = t("circle_good");
      bgColor = "rgba(34, 197, 94, 0.85)"; // Green
    } else if (score >= 50) {
      labelText = t("circle_can_improve");
      bgColor = "rgba(234, 179, 8, 0.85)"; // Yellow
    } else {
      labelText = t("circle_poor");
      bgColor = "rgba(239, 68, 68, 0.85)"; // Red
    }

    // ----- วาดกล่องพื้นหลัง -----
    const boxWidth = 160;
    const boxHeight = 50;
    // หมายเหตุ: Canvas มี CSS scaleX(-1) mirror อยู่
    // วาดที่ซ้าย (x=20) → จะแสดงที่ขวาบนหน้าจอ
    const boxX = 20;
    const boxY = this.canvasHeight - boxHeight - 80; // ล่าง - margin (เหนือ timer)

    this.ctx.fillStyle = bgColor;
    // ใช้ fillRect ธรรมดาแทน roundRect เพื่อ browser compatibility
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // ----- วาดข้อความ -----
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = 'bold 14px "Sarabun", sans-serif';
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // บรรทัดที่ 1: Score
    this.ctx.fillText(
      `🔵 ${Math.round(score)}%`,
      boxX + boxWidth / 2,
      boxY + 18,
    );

    // บรรทัดที่ 2: Label
    this.ctx.font = '12px "Sarabun", sans-serif';
    this.ctx.fillText(labelText, boxX + boxWidth / 2, boxY + 36);

    this.ctx.restore();
  }

  // ===========================================================================
  // 📊 CIRCULARITY CALCULATION: คำนวณความกลมของ Trail
  // ===========================================================================

  /**
   * คำนวณ Circularity Score ของ Trail
   * Score สูง = วงกลมสมบูรณ์, Score ต่ำ = วงกลมเบี้ยว
   *
   * @param {Object[]} trailHistory - Array ของ {x, y}
   * @returns {number|null} คะแนน 0-100 หรือ null ถ้าข้อมูลไม่พอ
   */
  static calculateCircularity(trailHistory) {
    const MIN_POINTS = 30;
    if (!trailHistory || trailHistory.length < MIN_POINTS) return null;

    // ----- Step 1: หาจุดศูนย์กลาง (Centroid) -----
    const sumX = trailHistory.reduce((sum, p) => sum + p.x, 0);
    const sumY = trailHistory.reduce((sum, p) => sum + p.y, 0);
    const center = {
      x: sumX / trailHistory.length,
      y: sumY / trailHistory.length,
    };

    // ----- Step 2: หารัศมีเฉลี่ย -----
    const distances = trailHistory.map((p) =>
      Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2)),
    );
    const avgRadius =
      distances.reduce((sum, d) => sum + d, 0) / distances.length;

    // ถ้ารัศมีเล็กมาก (ไม่ขยับ) ให้ return null
    if (avgRadius < 0.02) return null;

    // ----- Step 3: หา Variance ของรัศมี -----
    const squaredDiffs = distances.map((d) => Math.pow(d - avgRadius, 2));
    const variance = Math.sqrt(
      squaredDiffs.reduce((sum, d) => sum + d, 0) / squaredDiffs.length,
    );

    // ----- Step 4: แปลงเป็น Score (0-100) -----
    // Normalized variance = variance / avgRadius
    // ยิ่ง variance ต่ำ = ยิ่งกลม = score สูง
    // ปรับ: ใช้ตัวคูณ 1.0 แทน 2.0 เพื่อให้ผ่อนคลายขึ้น
    const normalizedVariance = variance / avgRadius;
    const score = Math.max(0, Math.min(100, (1 - normalizedVariance) * 100));

    // Debug: แสดงค่าใน console
    // console.log(`Circularity: variance=${variance.toFixed(4)}, avgRadius=${avgRadius.toFixed(4)}, normalized=${normalizedVariance.toFixed(4)}, score=${score.toFixed(1)}`);

    return Math.round(score);
  }
}
