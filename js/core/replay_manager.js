/**
 * ============================================================================
 * TaijiFlow AI - Replay Manager (replay_manager.js)
 * ============================================================================
 *
 * จัดการการเล่นย้อนหลัง (Replay) จากไฟล์ JSON
 *
 * @description
 *   รับผิดชอบการ:
 *   - โหลดข้อมูลจากไฟล์ JSON
 *   - ควบคุมการเล่น (Play, Pause, Seek, Speed)
 *   - ส่งคืน Landmarks และ Feedbacks ของเฟรมปัจจุบัน
 *
 * @version 1.0 (2026-01-29)
 */

class ReplayManager {
  constructor() {
    // State
    this.data = null; // Loaded JSON data
    this.frames = []; // Array of frame objects
    this.meta = {}; // Metadata

    this.isPlaying = false;
    this.currentTime = 0; // Current playback time in seconds
    this.totalDuration = 0; // Total duration in seconds
    this.playbackSpeed = 1.0;

    this.currentFrameIndex = 0;
    this.lastTimestamp = 0; // For delta calculation
  }

  // ===========================================================================
  // PUBLIC METHODS: LOAD & CONTROL
  // ===========================================================================

  /**
   * โหลดข้อมูลจากไฟล์ JSON
   * @param {string} jsonString - เนื้อหาไฟล์ JSON
   * @returns {Object} result - { success: boolean, message: string }
   */
  load(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);

      // Validate Format
      if (!parsed.frames || !Array.isArray(parsed.frames)) {
        return {
          success: false,
          message: "Invalid file format: No 'frames' array found.",
        };
      }

      this.data = parsed;
      this.frames = parsed.frames;
      this.meta = parsed.meta || {};

      // Calculate Duration
      if (this.frames.length > 0) {
        const firstFrame = this.frames[0];
        const lastFrame = this.frames[this.frames.length - 1];

        // Robust timestamp check: use 0 if undefined
        const start =
          firstFrame.timestamp !== undefined ? firstFrame.timestamp : 0;
        const end = lastFrame.timestamp !== undefined ? lastFrame.timestamp : 0;

        let diff = end - start;

        // Heuristic: Check magnitude to determine if Milliseconds or Seconds
        // Unix MS (now) ~ 1.7e12
        // Relative Seconds ~ 100-300

        if (end > 100000000000) {
          // Logic A: High magnitude -> Likely Unix Timestamp (MS) -> Convert to seconds
          this.totalDuration = diff / 1000;
        } else {
          // Logic B: Low magnitude -> Likely Relative Seconds (already seconds) -> Use directly
          // NOTE: script.js saves timestamp as (Date.now() - sessionStart) / 1000, so it IS seconds.
          // Previous code wrongly divided by 1000 again.
          this.totalDuration = diff;
        }

        // Fallback: If duration is invalid or 0, estimate from frame count (30fps)
        if (isNaN(this.totalDuration) || this.totalDuration <= 0.1) {
          console.warn(
            "[Replay] Invalid duration detected. Falling back to FPS estimate.",
          );
          this.totalDuration = Math.max(0.1, this.frames.length / 30);
        }
      }

      this.reset();
      console.log(
        `[Replay] Loaded ${this.frames.length} frames. Duration: ${this.totalDuration.toFixed(1)}s`,
      );
      return { success: true, message: "File loaded successfully." };
    } catch (e) {
      console.error("[Replay] Load Error:", e);
      return { success: false, message: "Failed to parse JSON." };
    }
  }

  play() {
    if (!this.data) return;
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
  }

  pause() {
    this.isPlaying = false;
  }

  seek(timeInSeconds) {
    if (!this.data) return;
    this.currentTime = Math.max(0, Math.min(timeInSeconds, this.totalDuration));
    this._syncFrameToIndex();
  }

  setSpeed(speed) {
    this.playbackSpeed = speed;
  }

  /**
   * อัปเดต Loop (เรียกจาก Animation Loop หลัก)
   * @returns {Object|null} frameData - { landmarks, feedbacks, progress } or null
   */
  update() {
    if (!this.data) return null;

    if (this.isPlaying) {
      const now = performance.now();
      const dt = (now - this.lastTimestamp) / 1000; // Delta in seconds
      this.lastTimestamp = now;

      // Advance time
      this.currentTime += dt * this.playbackSpeed;

      // Loop or Stop at end? Let's stop.
      if (this.currentTime >= this.totalDuration) {
        this.currentTime = this.totalDuration;
        this.isPlaying = false;
        // Optional: Loop
        // this.currentTime = 0;
      }

      this._syncFrameToIndex();
    }

    return this.getCurrentFrameData();
  }

  // ===========================================================================
  // PRIVATE & HELPER METHODS
  // ===========================================================================

  _syncFrameToIndex() {
    // Simple logic: Frame Index = (Current Time / Total Time) * Total Frames
    // Or if we have exact timestamps, search.
    // For V1, let's assume 30 FPS estimate or uniform distribution if timestamps are messy.

    if (this.totalDuration <= 0) {
      this.currentFrameIndex = 0;
      return;
    }

    const progress = this.currentTime / this.totalDuration;
    let idx = Math.floor(progress * (this.frames.length - 1));
    this.currentFrameIndex = Math.max(0, Math.min(idx, this.frames.length - 1));
  }

  getCurrentFrameData() {
    if (!this.frames[this.currentFrameIndex]) return null;

    const frame = this.frames[this.currentFrameIndex];
    return {
      landmarks: frame.landmarks || frame.pose_landmarks, // Handle variations
      feedbacks: frame.active_feedbacks || [], // Ensure array
      error_joints: frame.error_joints || [], // 🆕 Include recorded error joints
      timestamp: this.currentTime,
      duration: this.totalDuration,
      progress: this.currentTime / this.totalDuration || 0,
      isPlaying: this.isPlaying,
    };
  }

  reset() {
    this.currentTime = 0;
    this.currentFrameIndex = 0;
    this.isPlaying = false;
  }
}

// Global Export
window.ReplayManager = ReplayManager;
