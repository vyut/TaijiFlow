/**
 * ============================================================================
 * TaijiFlow AI - Background Manager
 * ============================================================================
 *
 * จัดการ Virtual Backgrounds ทั้งหมด:
 * - None (ไม่มีเอฟเฟกต์)
 * - Blur (เบลอพื้นหลัง)
 * - Virtual Backgrounds (รูปภาพต่างๆ)
 *
 * @author TaijiFlow AI Team
 * @version 1.0
 * ============================================================================
 */

class BackgroundManager {
  constructor() {
    // Background catalog
    this.backgrounds = {
      none: {
        name: "None",
        url: null,
        category: "system",
        thumbnail: null,
      },
      blur: {
        name: "Blur",
        url: null,
        category: "system",
        thumbnail: null,
      },

      // Nature Category
      mountain: {
        name: "Mountain Mist",
        url: "assets/backgrounds/nature/mountain_mist.jpg",
        category: "nature",
        thumbnail: "assets/backgrounds/thumbnails/mountain_thumb.jpg",
      },
      bamboo: {
        name: "Bamboo Forest",
        url: "assets/backgrounds/nature/bamboo_forest.jpg",
        category: "nature",
        thumbnail: "assets/backgrounds/thumbnails/bamboo_thumb.jpg",
      },
      zen_garden: {
        name: "Zen Garden",
        url: "assets/backgrounds/nature/zen_garden.jpg",
        category: "nature",
        thumbnail: "assets/backgrounds/thumbnails/zen_garden_thumb.jpg",
      },
      lake: {
        name: "Sunrise Lake",
        url: "assets/backgrounds/nature/sunrise_lake.jpg",
        category: "nature",
        thumbnail: "assets/backgrounds/thumbnails/lake_thumb.jpg",
      },

      // Architecture Category
      temple: {
        name: "Temple",
        url: "assets/backgrounds/architecture/temple_courtyard.jpg",
        category: "architecture",
        thumbnail: "assets/backgrounds/thumbnails/temple_thumb.jpg",
      },
      dojo: {
        name: "Wooden Dojo",
        url: "assets/backgrounds/architecture/wooden_dojo.jpg",
        category: "architecture",
        thumbnail: "assets/backgrounds/thumbnails/dojo_thumb.jpg",
      },
      minimalist: {
        name: "Minimalist",
        url: "assets/backgrounds/architecture/modern_minimalist.jpg",
        category: "architecture",
        thumbnail: "assets/backgrounds/thumbnails/minimalist_thumb.jpg",
      },

      // Abstract Category
      gradient: {
        name: "Soft Gradient",
        url: "assets/backgrounds/abstract/soft_gradient.jpg",
        category: "abstract",
        thumbnail: "assets/backgrounds/thumbnails/gradient_thumb.jpg",
      },
      clouds: {
        name: "Yin Yang Clouds",
        url: "assets/backgrounds/abstract/yin_yang_clouds.jpg",
        category: "abstract",
        thumbnail: "assets/backgrounds/thumbnails/clouds_thumb.jpg",
      },
    };

    // Current state
    this.currentMode = "none"; // none, blur, virtual
    this.currentBackgroundKey = "none";
    this.currentBackgroundImage = null;

    // Preloaded images cache
    this.preloadedImages = new Map();

    // Canvas for temp operations
    this.tempCanvas = null;
    this.tempCtx = null;
  }

  /**
   * Initialize and preload all background images
   */
  async init() {
    console.log("🖼️ BackgroundManager: Initializing...");

    // Create temp canvas
    this.tempCanvas = document.createElement("canvas");
    this.tempCtx = this.tempCanvas.getContext("2d");

    // Preload all backgrounds
    await this.preloadBackgrounds();

    // 🔧 Don't load saved preference - always start with "none"
    // Background should be manually selected each session

    console.log("✅ BackgroundManager: Ready");
  }

  /**
   * Preload all background images
   */
  async preloadBackgrounds() {
    const loadPromises = [];

    for (const [key, bg] of Object.entries(this.backgrounds)) {
      if (!bg.url) continue; // Skip system backgrounds

      const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Important for canvas

        img.onload = () => {
          this.preloadedImages.set(key, img);
          console.log(`✅ Loaded: ${bg.name}`);
          resolve();
        };

        img.onerror = () => {
          console.warn(`⚠️ Failed to load: ${bg.name} (${bg.url})`);
          resolve(); // Don't fail, just skip
        };

        img.src = bg.url;
      });

      loadPromises.push(promise);
    }

    await Promise.all(loadPromises);
    console.log(`✅ Preloaded ${this.preloadedImages.size} backgrounds`);
  }

  /**
   * Set current background
   * @param {string} key - Background key (e.g., 'mountain', 'blur', 'none')
   */
  setBackground(key) {
    if (!this.backgrounds[key]) {
      console.warn(`⚠️ Unknown background: ${key}`);
      return;
    }

    this.currentBackgroundKey = key;

    // Update mode
    if (key === "none") {
      this.currentMode = "none";
      this.currentBackgroundImage = null;
    } else if (key === "blur") {
      this.currentMode = "blur";
      this.currentBackgroundImage = null;
    } else {
      this.currentMode = "virtual";
      this.currentBackgroundImage = this.preloadedImages.get(key);
    }

    // 🔧 Don't save preference - backgrounds should not persist across sessions
    // localStorage.setItem("virtualBackground", key);

    console.log(`🖼️ Background changed to: ${this.backgrounds[key].name}`);
  }

  /**
   * Draw background with segmentation
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {ImageData} segmentationMask - Segmentation mask from MediaPipe
   * @param {HTMLImageElement} videoImage - Video frame
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  drawBackground(ctx, segmentationMask, videoImage, width, height) {
    if (this.currentMode === "none") {
      // No effect - already drawn by main script
      return;
    }

    // Safety check: segmentationMask must exist and have data
    if (!segmentationMask || !segmentationMask.data) {
      console.warn(
        "⚠️ Segmentation mask not available yet - skipping background",
      );
      return;
    }

    if (this.currentMode === "blur") {
      this.drawBlurBackground(ctx, segmentationMask, videoImage, width, height);
      return;
    }

    if (this.currentMode === "virtual" && this.currentBackgroundImage) {
      this.drawVirtualBackground(
        ctx,
        segmentationMask,
        videoImage,
        width,
        height,
      );
      return;
    }
  }

  /**
   * Draw blurred background
   */
  drawBlurBackground(ctx, segmentationMask, videoImage, width, height) {
    // Set up temp canvas
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;

    // Draw blurred background
    this.tempCtx.filter = "blur(10px)";
    this.tempCtx.drawImage(videoImage, 0, 0, width, height);
    this.tempCtx.filter = "none";

    // Get blurred image data
    const blurredData = this.tempCtx.getImageData(0, 0, width, height);

    // Draw on main canvas
    ctx.putImageData(blurredData, 0, 0);

    // Draw person on top (using mask)
    this.drawPersonOverlay(ctx, segmentationMask, videoImage, width, height);
  }

  /**
   * Draw virtual background
   */
  drawVirtualBackground(ctx, segmentationMask, videoImage, width, height) {
    // Draw background image (stretched to fit)
    ctx.drawImage(this.currentBackgroundImage, 0, 0, width, height);

    // Draw person on top (using mask)
    this.drawPersonOverlay(ctx, segmentationMask, videoImage, width, height);
  }

  /**
   * Draw person overlay using segmentation mask
   */
  drawPersonOverlay(ctx, segmentationMask, videoImage, width, height) {
    // Draw video to temp canvas
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
    this.tempCtx.drawImage(videoImage, 0, 0, width, height);

    // Get video image data
    const personData = this.tempCtx.getImageData(0, 0, width, height);
    const data = personData.data;

    // Apply mask (make background transparent)
    for (let i = 0; i < data.length; i += 4) {
      const maskValue = segmentationMask.data[i / 4];

      // If background (maskValue < 0.5), make transparent
      if (maskValue < 0.5) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }

    // Draw person overlay
    ctx.putImageData(personData, 0, 0);
  }

  /**
   * Get current mode
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * Get background list by category
   */
  getBackgroundsByCategory(category) {
    return Object.entries(this.backgrounds)
      .filter(([key, bg]) => bg.category === category)
      .map(([key, bg]) => ({ key, ...bg }));
  }

  /**
   * Get all backgrounds
   */
  getAllBackgrounds() {
    return Object.entries(this.backgrounds).map(([key, bg]) => ({
      key,
      ...bg,
    }));
  }
}
