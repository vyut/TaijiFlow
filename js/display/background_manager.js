/**
 * ============================================================================
 * TaijiFlow AI - Background Manager
 * ============================================================================
 *
 * จัดการ Virtual Backgrounds ทั้งหมด:
 * - None (ไม่มีเอฟเฟกต์)
 * - Blur (เบลอพื้นหลัง)
 * - Virtual Backgrounds (รูปภาพต่างๆ)
 * - Silhouette (ภาพเงา)
 *
 * @author TaijiFlow AI Team
 * @version 1.1 (Refactored for Performance)
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
      silhouette: {
        name: "Silhouette",
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

    // Canvases for temp operations (Lazy initialization)
    this.tempCanvas = null;
    this.maskCanvas = null;
    this.personCanvas = null;
  }

  /**
   * Initialize and preload all background images
   */
  async init() {
    console.log("🖼️ BackgroundManager: Initializing...");

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
    } else if (key === "silhouette") {
      this.currentMode = "silhouette";
      this.currentBackgroundImage = null;
    } else {
      this.currentMode = "virtual";
      this.currentBackgroundImage = this.preloadedImages.get(key);
    }

    console.log(`🖼️ Background changed to: ${this.backgrounds[key].name}`);
  }

  /**
   * Ensure temp canvases are initialized and resized
   */
  _ensureCanvases(width, height) {
    if (
      !this.tempCanvas ||
      this.tempCanvas.width !== width ||
      this.tempCanvas.height !== height
    ) {
      this.tempCanvas = document.createElement("canvas");
      this.tempCanvas.width = width;
      this.tempCanvas.height = height;

      this.maskCanvas = document.createElement("canvas");
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;

      this.personCanvas = document.createElement("canvas");
      this.personCanvas.width = width;
      this.personCanvas.height = height;
    }
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
      return;
    }

    // Safety check: Needs segmentationMask and videoImage
    if (!segmentationMask || !videoImage) {
      return;
    }

    // Initialize temp canvases if needed
    this._ensureCanvases(width, height);

    // 1. Process Mask (Feather edges)
    const processedMask = this._processSegmentationMask(
      segmentationMask,
      width,
      height,
    );

    if (this.currentMode === "blur") {
      this.drawBlurBackground(ctx, processedMask, videoImage, width, height);
      return;
    }

    if (this.currentMode === "silhouette") {
      this.drawSilhouetteBackground(
        ctx,
        processedMask,
        videoImage, // Added videoImage
        width,
        height,
      );
      return;
    }

    if (this.currentMode === "virtual" && this.currentBackgroundImage) {
      this.drawVirtualBackground(ctx, processedMask, videoImage, width, height);
      return;
    }
  }

  /**
   * Process segmentation mask (Feathering)
   * Uses canvas filters instead of pixel manipulation for performance.
   */
  _processSegmentationMask(rawMask, width, height) {
    const maskCtx = this.maskCanvas.getContext("2d");

    // Clear
    maskCtx.clearRect(0, 0, width, height);

    // Draw raw mask with slight blur to feather edges
    maskCtx.filter = "blur(4px)";
    maskCtx.drawImage(rawMask, 0, 0, width, height);
    maskCtx.filter = "none";

    // Note: Temporal smoothing (blending with previous frame) is omitted
    // to prioritize high FPS, as JS-based pixel blending is expensive.
    // The blur filter alone provides decent edge softening.

    return this.maskCanvas;
  }

  /**
   * Draw Blur Background
   * - Background: Gaussian Blur of video
   * - Foreground: Sharp Person (cut out via mask)
   */
  drawBlurBackground(ctx, processedMask, videoImage, width, height) {
    const tempCtx = this.tempCanvas.getContext("2d");
    const personCtx = this.personCanvas.getContext("2d");

    // 1. Prepare Blurred Background (on tempCanvas)
    tempCtx.clearRect(0, 0, width, height);
    tempCtx.filter = "blur(15px)";
    tempCtx.drawImage(videoImage, 0, 0, width, height);
    tempCtx.filter = "none";

    // Draw blurred background to main canvas
    ctx.drawImage(this.tempCanvas, 0, 0, width, height);

    // 2. Prepare Sharp Person (on personCanvas)
    personCtx.clearRect(0, 0, width, height);
    personCtx.drawImage(videoImage, 0, 0, width, height);

    // Cut out person using mask (destination-in keeps only overlapping parts)
    personCtx.globalCompositeOperation = "destination-in";
    personCtx.drawImage(processedMask, 0, 0, width, height);
    personCtx.globalCompositeOperation = "source-over";

    // 3. Draw Sharp Person on top
    ctx.drawImage(this.personCanvas, 0, 0, width, height);
  }

  /**
   * Draw Virtual Background
   * - Background: Static Image
   * - Foreground: Sharp Person
   */
  drawVirtualBackground(ctx, processedMask, videoImage, width, height) {
    const personCtx = this.personCanvas.getContext("2d");

    // 1. Draw Background Image
    ctx.drawImage(this.currentBackgroundImage, 0, 0, width, height);

    // 2. Prepare Sharp Person
    personCtx.clearRect(0, 0, width, height);
    personCtx.drawImage(videoImage, 0, 0, width, height);

    // Apply Mask
    personCtx.globalCompositeOperation = "destination-in";
    personCtx.drawImage(processedMask, 0, 0, width, height);
    personCtx.globalCompositeOperation = "source-over";

    // 3. Draw Person on top
    ctx.drawImage(this.personCanvas, 0, 0, width, height);
  }

  /**
   * Draw Silhouette Background (Purple Overlay Style)
   * - Background: Normal Video
   * - Foreground: Purple Overlay on Person
   */
  drawSilhouetteBackground(ctx, processedMask, videoImage, width, height) {
    const personCtx = this.personCanvas.getContext("2d");

    // 1. Draw Normal Video Background
    ctx.drawImage(videoImage, 0, 0, width, height);

    // 2. Create Purple Overlay
    personCtx.clearRect(0, 0, width, height);

    // Fill entire canvas with Purple (semi-transparent)
    personCtx.fillStyle = "rgba(128, 0, 128, 0.5)"; // Purple with 50% opacity
    personCtx.fillRect(0, 0, width, height);

    // Cut out using the mask (destination-in)
    // This leaves purple only where the mask is present
    personCtx.globalCompositeOperation = "destination-in";
    personCtx.drawImage(processedMask, 0, 0, width, height);
    personCtx.globalCompositeOperation = "source-over";

    // 3. Draw Purple Overlay on top of Video
    ctx.drawImage(this.personCanvas, 0, 0, width, height);
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
