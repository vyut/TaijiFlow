/**
 * ================================================================================
 * TaijiFlow AI - Silhouette Manager (silhouette_manager.js)
 * ================================================================================
 *
 * จัดการการแสดง Silhouette Overlay (เงาร่างผู้ฝึก)
 * ใช้ Segmentation Mask จาก MediaPipe Pose (enableSegmentation: true)
 *
 * วิธีการ: Pose + Segmentation (ในตัว)
 *   - Pose model ให้ segmentationMask มาพร้อม landmarks
 *   - ไม่ต้องโหลด model เพิ่ม = ไม่มี conflict
 *   - ได้เงา 100% ตรงกับร่างจริง
 *
 * Version: 0.3 (2024-12-18)
 * ================================================================================
 */

class SilhouetteManager {
  constructor() {
    this.isEnabled = false;
    this.isReady = true;

    // สีเงา
    this.color = "rgba(138, 43, 226, 0.85)"; // Purple (70% opacity)
  }

  /**
   * Initialize - พร้อมใช้งานทันที (ใช้ mask จาก Pose)
   */
  async init() {
    console.log("[Silhouette] Ready (Pose Segmentation mode)");
    return true;
  }

  /**
   * เปิดใช้งาน
   */
  enable() {
    this.isEnabled = true;
    console.log("[Silhouette] Enabled");
  }

  /**
   * ปิดใช้งาน
   */
  disable() {
    this.isEnabled = false;
    console.log("[Silhouette] Disabled");
  }

  /**
   * Toggle
   */
  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isEnabled;
  }

  /**
   * วาดเงาจาก Segmentation Mask (จาก Pose)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {CanvasImageSource} mask - Segmentation mask จาก results.segmentationMask
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  drawSilhouetteFromMask(ctx, mask, width, height) {
    if (!mask) return;

    ctx.save();

    // สร้าง temp canvas สำหรับสร้างเงาสี
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");

    // 1. วาดสีทึบเต็มจอบน temp canvas
    tempCtx.fillStyle = this.color;
    tempCtx.fillRect(0, 0, width, height);

    // 2. ใช้ mask ตัดเอาเฉพาะส่วนที่เป็นคน
    tempCtx.globalCompositeOperation = "destination-in";
    tempCtx.drawImage(mask, 0, 0, width, height);

    // 3. วาด temp canvas ลง main canvas
    ctx.drawImage(tempCanvas, 0, 0);

    ctx.restore();
  }

  /**
   * ตั้งค่าสี
   */
  setColor(color) {
    this.color = color;
  }
}

// Global instance
const silhouetteManager = new SilhouetteManager();
