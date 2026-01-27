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
    // 4. Initialize WebGL Manager
    this.webglManager = new WebGLManager();
    this.useWebGL = true; // Flag to switch between 2D and WebGL
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

        // Fix for WebGL texture: decode() ensures it's ready
        img.src = bg.url;

        img.onload = async () => {
          try {
            await img.decode(); // Ensure decoded for GPU upload
            this.preloadedImages.set(key, img);
            console.log(`✅ Loaded: ${bg.name}`);
            resolve();
          } catch (e) {
            console.warn(`⚠️ Decode failed: ${bg.name}`, e);
            resolve();
          }
        };

        img.onerror = () => {
          console.warn(`⚠️ Failed to load: ${bg.name} (${bg.url})`);
          resolve(); // Don't fail, just skip
        };
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

      // Upload to WebGL if ready
      if (this.webglManager.initialized && this.currentBackgroundImage) {
        this.webglManager.updateBackgroundTexture(this.currentBackgroundImage);
      }
    }

    console.log(`🖼️ Background changed to: ${this.backgrounds[key].name}`);
  }

  /**
   * Set Custom Background (from Upload)
   * @param {HTMLImageElement|HTMLCanvasElement} image - Resized custom image
   */
  setCustomBackground(image) {
    if (!image) return;

    this.currentMode = "virtual";
    this.currentBackgroundKey = "custom";
    this.currentBackgroundImage = image;

    // Update WebGL
    if (this.webglManager.initialized) {
      this.webglManager.updateBackgroundTexture(this.currentBackgroundImage);
    }

    console.log("🖼️ Custom Background set");
  }

  /**
   * Ensure temp canvases are initialized and resized
   * Now also handles WebGL initialization
   */
  _ensureCanvases(width, height) {
    // 2D fallback canvases (keep them for safety or hybrid usage)
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

    // WebGL Init
    if (this.useWebGL) {
      this.webglManager.init(width, height);
    }
  }

  /**
   * Draw background with segmentation
   * @param {CanvasRenderingContext2D} ctx - Main Canvas 2D context
   * @param {ImageData} segmentationMask - Segmentation mask from MediaPipe
   * @param {HTMLVideoElement} videoElement - Source Video Element
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  drawBackground(ctx, segmentationMask, videoElement, width, height) {
    if (this.currentMode === "none") {
      return;
    }

    // Safety check
    if (!segmentationMask || !videoElement) {
      return;
    }

    this._ensureCanvases(width, height);

    if (this.useWebGL) {
      // --- WebGL Rendering Path (High Performance) ---
      const glCanvas = this.webglManager.canvas;
      if (!glCanvas) return; // WebGL Init failed

      // 1. Upload Textures
      this.webglManager.updateVideoTexture(videoElement);
      this.webglManager.updateMaskTexture(segmentationMask);

      // 2. Render
      if (this.currentMode === "blur") {
        this.webglManager.renderBlur();
      } else if (this.currentMode === "silhouette") {
        this.webglManager.renderSilhouette();
      } else if (
        this.currentMode === "virtual" &&
        this.currentBackgroundImage
      ) {
        // Ensure BG texture is updated (fix for black screen on first load)
        this.webglManager.updateBackgroundTexture(this.currentBackgroundImage);
        this.webglManager.renderVirtual();
      }

      // 3. Draw WebGL Canvas Result to Main 2D Canvas
      ctx.drawImage(glCanvas, 0, 0, width, height);
    } else {
      // --- Legacy 2D Rendering Path (Fallback) ---
      // (Removed for brevity as per instructions, but could be kept here if needed)
      // Since we refactored, let's just log or do nothing.
      // Or we could have kept the old methods as _drawBlur2D etc.
      console.warn("2D Rendering path removed for WebGL optimization.");
    }
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
