/**
 * ================================================================================
 * TaijiFlow AI - Ghost Manager (ghost_manager.js)
 * ================================================================================
 *
 * จัดการการแสดง Ghost Overlay (ร่างเงาต้นแบบ)
 *
 * คุณสมบัติหลัก:
 *   - โหลด reference data และเล่น loop
 *   - คำนวณ frame ปัจจุบันตาม timestamp
 *   - รองรับการปรับ speed
 *
 * การใช้งาน:
 *   const ghost = new GhostManager();
 *   ghost.load(referenceData);
 *   ghost.start();
 *   // ในแต่ละ frame:
 *   ghost.update(deltaTime);
 *   drawer.drawGhostSkeleton(ghost.getCurrentFrame());
 *
 * Version: 0.2 (2024-12-24)
 * ================================================================================
 */

class GhostManager {
  constructor() {
    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------
    this.frames = []; // Array of { timestamp, landmarks }
    this.currentIndex = 0; // Current frame index
    this.elapsedTime = 0; // Time elapsed since start (ms)
    this.isPlaying = false;
    this.playbackSpeed = 1.0; // 1.0 = normal, 0.5 = slow, 2.0 = fast
    this.lastUpdateTime = 0; // For calculating deltaTime

    // -------------------------------------------------------------------------
    // Silhouette Video (เงาคนสอน)
    // -------------------------------------------------------------------------
    this.silhouetteVideo = null; // <video> element สำหรับเล่นเงา
    this.silhouetteLoaded = false; // โหลดสำเร็จหรือยัง
    this.useSilhouette = true; // ใช้ silhouette แทน skeleton

    // -------------------------------------------------------------------------
    // Visual Settings
    // -------------------------------------------------------------------------
    this.opacity = 0.4; // Ghost transparency (0-1)
    this.color = "rgba(100, 200, 255, 0.4)"; // Light blue
  }

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * โหลด reference data
   * @param {Array} data - Array of { timestamp, landmarks }
   * @returns {boolean} success
   */
  load(data) {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("[Ghost] Invalid data format");
      return false;
    }

    // ตรวจสอบว่ามี full landmarks (33 จุด)
    if (!data[0].landmarks || data[0].landmarks.length < 33) {
      console.warn("[Ghost] Data must contain full skeleton (33 landmarks)");
      return false;
    }

    this.frames = data;
    this.currentIndex = 0;
    this.elapsedTime = 0;

    console.log(`[Ghost] Loaded ${this.frames.length} frames`);
    return true;
  }

  /**
   * โหลด silhouette video
   * @param {string} url - path ไปยังไฟล์ silhouette.webm
   * @returns {Promise<boolean>} success
   */
  async loadSilhouetteVideo(url) {
    return new Promise((resolve) => {
      this.silhouetteVideo = document.createElement("video");
      this.silhouetteVideo.src = url;
      this.silhouetteVideo.loop = true;
      this.silhouetteVideo.muted = true;
      this.silhouetteVideo.playsInline = true;

      this.silhouetteVideo.onloadeddata = () => {
        this.silhouetteLoaded = true;
        console.log(`[Ghost] Silhouette video loaded: ${url}`);
        resolve(true);
      };

      this.silhouetteVideo.onerror = () => {
        console.warn(`[Ghost] Silhouette video not found: ${url}`);
        this.silhouetteLoaded = false;
        resolve(false);
      };

      this.silhouetteVideo.load();
    });
  }

  /**
   * ดึง video element สำหรับวาด
   * @returns {HTMLVideoElement|null}
   */
  getSilhouetteVideo() {
    if (this.silhouetteLoaded && this.isPlaying) {
      return this.silhouetteVideo;
    }
    return null;
  }

  /**
   * เริ่มเล่น Ghost
   */
  start() {
    if (this.frames.length === 0 && !this.silhouetteLoaded) {
      console.warn("[Ghost] No data loaded");
      return;
    }

    this.isPlaying = true;
    this.currentIndex = 0;
    this.elapsedTime = 0;
    this.lastUpdateTime = performance.now();

    // เล่น silhouette video ถ้ามี
    if (this.silhouetteLoaded && this.silhouetteVideo) {
      this.silhouetteVideo.currentTime = 0;
      this.silhouetteVideo.play();
    }

    console.log("[Ghost] Playback started");
  }

  /**
   * หยุดเล่น Ghost
   */
  stop() {
    this.isPlaying = false;

    // หยุด silhouette video
    if (this.silhouetteVideo) {
      this.silhouetteVideo.pause();
    }

    console.log("[Ghost] Playback stopped");
  }

  /**
   * Toggle เปิด/ปิด Ghost
   * @returns {boolean} new state
   */
  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  /**
   * อัปเดต frame ตามเวลาที่ผ่านไป
   * ควรเรียกทุก frame ใน render loop
   */
  update() {
    if (!this.isPlaying || this.frames.length === 0) return;

    const now = performance.now();
    const deltaTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    // เพิ่มเวลาที่ผ่านไป (ปรับตาม playback speed)
    this.elapsedTime += deltaTime * this.playbackSpeed;

    // หา frame ที่ตรงกับ elapsedTime
    const totalDuration = this.getTotalDuration();

    // Loop back เมื่อจบ
    if (this.elapsedTime >= totalDuration) {
      this.elapsedTime = this.elapsedTime % totalDuration;
      this.currentIndex = 0;
    }

    // หา frame ที่ตรงกับเวลาปัจจุบัน
    while (
      this.currentIndex < this.frames.length - 1 &&
      this.frames[this.currentIndex + 1].timestamp <= this.elapsedTime
    ) {
      this.currentIndex++;
    }
  }

  /**
   * ดึง landmarks ของ frame ปัจจุบัน
   * @returns {Array|null} landmarks array หรือ null ถ้าไม่มีข้อมูล
   */
  getCurrentFrame() {
    if (!this.isPlaying || this.frames.length === 0) return null;
    return this.frames[this.currentIndex]?.landmarks || null;
  }

  /**
   * ตั้งค่าความเร็ว
   * @param {number} speed - 0.5 = slow, 1.0 = normal, 2.0 = fast
   */
  setSpeed(speed) {
    this.playbackSpeed = Math.max(0.25, Math.min(4.0, speed));
    console.log(`[Ghost] Speed set to ${this.playbackSpeed}x`);
  }

  /**
   * ตั้งค่าความโปร่งใส
   * @param {number} opacity - 0.0 = fully transparent, 1.0 = opaque
   */
  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * คำนวณระยะเวลารวมของ reference data
   * @returns {number} duration in ms
   */
  getTotalDuration() {
    if (this.frames.length === 0) return 0;
    return this.frames[this.frames.length - 1].timestamp;
  }

  /**
   * ดึงข้อมูลสถานะปัจจุบัน (สำหรับ debug)
   * @returns {Object}
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentIndex: this.currentIndex,
      totalFrames: this.frames.length,
      elapsedTime: Math.round(this.elapsedTime),
      totalDuration: this.getTotalDuration(),
      speed: this.playbackSpeed,
    };
  }
}

// =============================================================================
// GLOBAL INSTANCE
// =============================================================================
const ghostManager = new GhostManager();
