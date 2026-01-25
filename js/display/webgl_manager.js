/**
 * ============================================================================
 * TaijiFlow AI - WebGL Manager v1.0
 * ============================================================================
 *
 * รับผิดชอบการ Render Visual Effects โดยใช้ WebGL 2.0 เพื่อประสิทธิภาพสูงสุด
 * - Gaussian Blur (GPU Accelerated)
 * - Compositing (Person + Background blending)
 *
 * Replaces slow 2D Canvas operations (filter, globalCompositeOperation)
 *
 * @version 1.0
 * ============================================================================
 */
class WebGLManager {
  constructor() {
    this.gl = null;
    this.canvas = null;
    this.width = 0;
    this.height = 0;

    // Texture References
    this.videoTexture = null;
    this.maskTexture = null;
    this.bgTexture = null; // For virtual background image

    // Shader Programs
    this.blurProgram = null;
    this.compositeProgram = null;

    // Buffers
    this.quadBuffer = null;

    // Framebuffers (for multi-pass rendering like blur)
    this.tempMetadata = null; // { fbo, texture }
    this.tempMetadata2 = null; // { fbo, texture } (Ping-Pong)

    this.initialized = false;
  }

  /**
   * Initialize WebGL Context and Shaders
   * @param {number} width
   * @param {number} height
   * @returns {HTMLCanvasElement} The WebGL canvas
   */
  init(width, height) {
    if (this.initialized && this.width === width && this.height === height) {
      return this.canvas;
    }

    console.log(`🚀 WebGLManager: Initializing ${width}x${height}`);

    this.width = width;
    this.height = height;

    // 1. Create Canvas
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
    }
    this.canvas.width = width;
    this.canvas.height = height;

    // 2. Get Context
    this.gl = this.canvas.getContext("webgl2", {
      alpha: false,
      desynchronized: true, // Low latency hint
      antialias: false,
    });

    if (!this.gl) {
      console.error("❌ WebGL 2.0 not supported");
      return null;
    }

    // 3. Setup Shaders
    this._setupShaders();

    // 4. Setup Geometry (Full screen quad)
    this._setupQuad();

    // 5. Setup Textures
    this.videoTexture = this._createTexture();
    this.maskTexture = this._createTexture();
    this.bgTexture = this._createTexture();

    // 6. Setup Framebuffers
    this.tempMetadata = this._createFramebuffer(width, height);

    this.initialized = true;
    return this.canvas;
  }

  /**
   * Upload Video Frame to GPU
   * @param {HTMLVideoElement} video
   */
  updateVideoTexture(video) {
    if (!this.gl || !video) return;
    this._uploadTexture(this.videoTexture, video);
  }

  /**
   * Upload Segmentation Mask to GPU
   * @param {ImageData|ImageBitmap} mask
   */
  updateMaskTexture(mask) {
    if (!this.gl || !mask) return;
    this._uploadTexture(this.maskTexture, mask);
  }

  /**
   * Upload Background Image to GPU (Call only when BG changes)
   * @param {HTMLImageElement} image
   */
  updateBackgroundTexture(image) {
    if (!this.gl || !image) return;
    this._uploadTexture(this.bgTexture, image);
  }

  _ensureFBOs(width, height) {
    // Downsample factor 0.5
    const targetW = Math.floor(width * 0.5);
    const targetH = Math.floor(height * 0.5);

    // Check if dimensions changed (recreate if needed)
    if (
      this.tempMetadata &&
      (this.tempMetadata.width !== targetW ||
        this.tempMetadata.height !== targetH)
    ) {
      this.tempMetadata = null;
      this.tempMetadata2 = null;
    }

    if (!this.tempMetadata) {
      this.tempMetadata = this._createFramebuffer(targetW, targetH);
      this.tempMetadata.width = targetW;
      this.tempMetadata.height = targetH;
    }

    if (!this.tempMetadata2) {
      this.tempMetadata2 = this._createFramebuffer(targetW, targetH);
      this.tempMetadata2.width = targetW;
      this.tempMetadata2.height = targetH;
    }
  }
  renderBlur() {
    if (!this.gl) return;

    const gl = this.gl;
    this._ensureFBOs(this.width, this.height);

    const halfW = this.tempMetadata.width;
    const halfH = this.tempMetadata.height;

    // --- Pass 1: Horizontal Blur (Video Full -> FBO 1 Half) ---
    // Downsample + Blur X
    gl.viewport(0, 0, halfW, halfH);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.tempMetadata.fbo);
    gl.useProgram(this.blurProgram.program);
    gl.uniform2f(this.blurProgram.uResolution, halfW, halfH); // Resolution of TARGET

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
    gl.uniform1i(this.blurProgram.uImage, 0);
    gl.uniform2f(this.blurProgram.uDirection, 1.0, 0.0); // Horizontal
    this._drawQuad();

    // --- Pass 2: Vertical Blur (FBO 1 Half -> FBO 2 Half) ---
    // Blur Y
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.tempMetadata2.fbo);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tempMetadata.texture);
    gl.uniform1i(this.blurProgram.uImage, 0);
    gl.uniform2f(this.blurProgram.uDirection, 0.0, 1.0); // Vertical
    this._drawQuad();

    // --- Pass 3: Composite (FBO 2 Half + Video Full -> Screen Full) ---
    // Upsample Blurred BG + Mix with Sharp FG
    gl.viewport(0, 0, this.width, this.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Screen
    gl.useProgram(this.compositeProgram.program);

    // Unit 0: Blurred Background (FBO 2)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tempMetadata2.texture);
    gl.uniform1i(this.compositeProgram.uBackground, 0);

    // Unit 1: Sharp Foreground (Video)
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
    gl.uniform1i(this.compositeProgram.uForeground, 1);

    // Unit 2: Mask
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);
    gl.uniform1i(this.compositeProgram.uMask, 2);

    this._drawQuad();
  }

  /**
   * Render Virtual Background
   */
  renderVirtual() {
    if (!this.gl) return;

    const gl = this.gl;
    gl.viewport(0, 0, this.width, this.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.useProgram(this.compositeProgram.program);

    // Unit 0: Static Background Image
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
    gl.uniform1i(this.compositeProgram.uBackground, 0);

    // Unit 1: Sharp Foreground (Video)
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
    gl.uniform1i(this.compositeProgram.uForeground, 1);

    // Unit 2: Mask
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);
    gl.uniform1i(this.compositeProgram.uMask, 2);

    this._drawQuad();
  }

  /**
   * Render Silhouette (Purple Body on Transparent/Composite)
   * For "Silhouette Mode" in TaijiFlow: Background = Video, Foreground = Purple Mask
   */
  renderSilhouette() {
    if (!this.gl) return;

    const gl = this.gl;
    gl.viewport(0, 0, this.width, this.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.useProgram(this.compositeProgram.program);

    // Special Mode for Silhouette via Uniform?
    // Or re-use composite with different inputs:
    // Bg = Video
    // Fg = Purple Color (we need a way to support color)

    // For simplicity reusing Compositor:
    // We will pass Video as Background
    // We need a specific Shader for Silhouette or a Uniform switch.
    // Let's add uMode to Composite Shader.

    gl.uniform1i(this.compositeProgram.uMode, 1); // 1 = Silhouette Mode

    // Unit 0: Background (Video)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
    gl.uniform1i(this.compositeProgram.uBackground, 0);

    // Unit 2: Mask
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);
    gl.uniform1i(this.compositeProgram.uMask, 2);

    this._drawQuad();

    // Reset Mode
    gl.uniform1i(this.compositeProgram.uMode, 0); // 0 = Normal
  }

  // =========================================================
  // 🛠️ INTERNAL HELPERS
  // =========================================================

  _setupShaders() {
    const gl = this.gl;

    // --- VS (Shared) ---
    // --- VS (Shared) ---
    const vsSource = `#version 300 es
        in vec2 a_position;
        out vec2 v_texCoord;
        void main() {
          v_texCoord = a_position * 0.5 + 0.5; // -1..1 -> 0..1
          v_texCoord.y = 1.0 - v_texCoord.y;   // Flip Y for WebGL
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

    // --- VS (No Flip) for Off-screen rendering (FBO) ---
    // Fixes double-flip issue in Pass 1 of Blur
    const vsSourceDirect = `#version 300 es
        in vec2 a_position;
        out vec2 v_texCoord;
        void main() {
          v_texCoord = a_position * 0.5 + 0.5;
          // No Y flip
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

    // --- FS: Gaussian Blur (2-Pass Standard Loop) ---
    // Uses a 9-tap Gaussian kernel for smooth, high-quality blur.
    // Weights: [0.016216, 0.054054, 0.121622, 0.194595, 0.227027, 0.194595, 0.121622, 0.054054, 0.016216]
    // To be efficient, we sample 5 points (center + 2 pairs) and use symmetry.
    const fsBlurSource = `#version 300 es
        precision mediump float;
        in vec2 v_texCoord;
        uniform sampler2D u_image;
        uniform vec2 u_resolution;
        uniform vec2 u_direction; // (1,0) for H, (0,1) for V
        out vec4 outColor;
  
        void main() {
          vec2 onePixel = vec2(1.0) / u_resolution;
          vec4 color = vec4(0.0);
          
          // 9-tap Gaussian Weights (Normalized)
          float weight[5];
          weight[0] = 0.227027;
          weight[1] = 0.194595;
          weight[2] = 0.121622;
          weight[3] = 0.054054;
          weight[4] = 0.016216;

          // Center
          color += texture(u_image, v_texCoord) * weight[0];
          
          // Downsampling handles the macro blur, so we keep scale small (1.2) to fill gaps.
          // User requested "More Blur", so bumping to 2.0. Downsampling + 2.0 should be very creamy without huge gaps.
          float scale = 2.0; 

          for(int i = 1; i < 5; i++) {
             // Offset in direction
             vec2 off = vec2(float(i)) * scale * u_direction * onePixel;
             color += texture(u_image, v_texCoord + off) * weight[i];
             color += texture(u_image, v_texCoord - off) * weight[i];
          }
          
          outColor = color;
        }
      `;

    // --- FS: Compositor (Mixes FG/BG using Mask) ---
    const fsCompositeSource = `#version 300 es
        precision mediump float;
        in vec2 v_texCoord;
        
        uniform sampler2D u_background;
        uniform sampler2D u_foreground;
        uniform sampler2D u_mask;
        uniform int u_mode; // 0=Normal, 1=Silhouette
        
        out vec4 outColor;
  
        void main() {
          vec4 bg = texture(u_background, v_texCoord);
          float maskVal = texture(u_mask, v_texCoord).a; // MediaPipe mask is alpha? Or channel? Usually channel 0 if from ImageData
          // Actually MediaPipe ImageBitmap/ImageData usually has values in R/G/B/A.
          // Let's assume Mask Texture is standard RGBA, mask is density.
          
          maskVal = texture(u_mask, v_texCoord).r; // Try Red channel
          
          // Improve mask edge (Threshold/Smoothstep)
          float alpha = smoothstep(0.3, 0.5, maskVal); 
  
          if (u_mode == 1) {
            // Silhouette Mode: BG is Video, FG is Purple
            vec4 purple = vec4(0.6, 0.0, 0.8, 0.6); 
            outColor = mix(bg, purple, alpha * 0.6);
          } else {
            // Normal Mode: Blur/Virtual -> Show Real Person
            vec4 fg = texture(u_foreground, v_texCoord);
            outColor = mix(bg, fg, alpha);
          }
        }
      `;

    // Compile
    // Use vsSourceDirect (No Flip) for Blur Pass 1 to match FBO memory layout
    this.blurProgram = this._createProgram(gl, vsSourceDirect, fsBlurSource);
    this.blurProgram.uImage = gl.getUniformLocation(
      this.blurProgram.program,
      "u_image",
    );
    this.blurProgram.uResolution = gl.getUniformLocation(
      this.blurProgram.program,
      "u_resolution",
    );
    this.blurProgram.uDirection = gl.getUniformLocation(
      this.blurProgram.program,
      "u_direction",
    );

    this.compositeProgram = this._createProgram(
      gl,
      vsSource,
      fsCompositeSource,
    );
    this.compositeProgram.uBackground = gl.getUniformLocation(
      this.compositeProgram.program,
      "u_background",
    );
    this.compositeProgram.uForeground = gl.getUniformLocation(
      this.compositeProgram.program,
      "u_foreground",
    );
    this.compositeProgram.uMask = gl.getUniformLocation(
      this.compositeProgram.program,
      "u_mask",
    );
    this.compositeProgram.uMode = gl.getUniformLocation(
      this.compositeProgram.program,
      "u_mode",
    );
  }

  _setupQuad() {
    const gl = this.gl;
    // Full screen quad (-1 to 1)
    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);

    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  _drawQuad() {
    const gl = this.gl;
    const positionLoc = 0; // Standard loc

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  _createTexture() {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Standard Parameters (Clamp to edge is safer for NPOT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return tex;
  }

  _uploadTexture(tex, source) {
    if (!source) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Use texImage2D with source
    // This is efficient in WebGL2
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  _createFramebuffer(width, height) {
    const gl = this.gl;
    const tex = this._createTexture();

    // Allocate storage
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );

    return { fbo, texture: tex };
  }

  _createProgram(gl, vsSrc, fsSrc) {
    const vs = this._compileShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = this._compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Link Error:", gl.getProgramInfoLog(program));
      return null;
    }
    return { program };
  }

  _compileShader(gl, type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader Error:", gl.getShaderInfoLog(shader));
    }
    return shader;
  }
}
