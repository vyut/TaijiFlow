/**
 * ============================================================================
 * TaijiFlow AI - WebGPU Manager (Experimental Prototype)
 * ============================================================================
 *
 * สำหรับทดสอบเทคโนโลยี WebGPU (Next-Gen Graphics API)
 * เป้าหมาย: แสดงผลวิดีโอผ่าน WebGPU Pipeline เพื่อวัดความเป็นไปได้
 *
 * ข้อจำกัด:
 * - ต้องใช้ Browser ที่รองรับ (Chrome 113+, Edge)
 * - Safari ต้องเปิด Feature Flag
 *
 * @version 0.1 (Prototype)
 */

class WebGPUManager {
  constructor() {
    this.adapter = null;
    this.device = null;
    this.context = null;
    this.pipeline = null;
    this.sampler = null;
    this.videoTexture = null;
    this.bindGroup = null;

    this.initialized = false;
    this.isSupported = false;
    this.width = 0;
    this.height = 0;
  }

  /**
   * เริ่มต้นระบบ WebGPU
   * @param {HTMLCanvasElement} canvas - Canvas ที่จะวาด
   */
  async init(canvas) {
    if (this.initialized) return this.isSupported;

    console.log("🚀 WebGPU: Initializing Prototype...");

    // 1. Check Support
    if (!navigator.gpu) {
      console.warn("❌ WebGPU not supported in this browser.");
      return false;
    }

    try {
      // 2. Request Adapter (GPU)
      this.adapter = await navigator.gpu.requestAdapter();
      if (!this.adapter) {
        console.error("❌ No WebGPU adapter found.");
        return false;
      }

      // 3. Request Device
      this.device = await this.adapter.requestDevice();
      console.log(
        `✅ WebGPU Device: ${this.adapter.limits.maxTextureDimension2D}px max texture`,
      );

      // 4. Configure Context
      this.context = canvas.getContext("webgpu");
      this.width = canvas.width;
      this.height = canvas.height;
      const format = navigator.gpu.getPreferredCanvasFormat(); // e.g. 'bgra8unorm'

      this.context.configure({
        device: this.device,
        format: format,
        alphaMode: "premultiplied",
      });

      // 5. Setup Shaders & Pipeline
      await this.setupPipeline(format);

      this.initialized = true;
      this.isSupported = true;
      console.log("✅ WebGPU Initialized Successfully!");
      return true;
    } catch (e) {
      console.error("❌ WebGPU Init Error:", e);
      return false;
    }
  }

  async setupPipeline(presentationFormat) {
    // --- WGSL Shaders ---
    const shaderModule = this.device.createShaderModule({
      label: "Video Passthrough Shader",
      code: `
        struct VertexOutput {
          @builtin(position) position : vec4f,
          @location(0) uv : vec2f,
        };

        // Fullscreen Quad Vertex Shader
        @vertex
        fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
          var pos = array<vec2f, 6>(
            vec2f(-1.0, -1.0), vec2f( 1.0, -1.0), vec2f(-1.0,  1.0),
            vec2f(-1.0,  1.0), vec2f( 1.0, -1.0), vec2f( 1.0,  1.0)
          );

          var output : VertexOutput;
          let xy = pos[vertexIndex];
          output.position = vec4f(xy, 0.0, 1.0);
          
          // Map -1..1 to 0..1 and Flip Y for Texture
          output.uv = vec2f((xy.x + 1.0) * 0.5, 1.0 - (xy.y + 1.0) * 0.5);
          return output;
        }

        @group(0) @binding(0) var mySampler : sampler;
        @group(0) @binding(1) var myTexture : texture_external; // Use texture_external for Video

        @fragment
        fn fs_main(@location(0) uv : vec2f) -> @location(0) vec4f {
          return textureSampleBaseClampToEdge(myTexture, mySampler, uv);
        }
      `,
    });

    // --- Pipeline ---
    this.pipeline = this.device.createRenderPipeline({
      label: "Video Pipeline",
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format: presentationFormat }],
      },
      primitive: {
        topology: "triangle-list",
      },
    });

    // --- Sampler ---
    this.sampler = this.device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });
  }

  /**
   * Render loop
   * @param {HTMLVideoElement} videoElement
   */
  render(videoElement) {
    if (!this.isSupported || !videoElement || videoElement.readyState < 2)
      return;

    // 1. Create Texture from Video (Zero-copy technique if supported)
    // importExternalTexture is highly efficient
    const externalTexture = this.device.importExternalTexture({
      source: videoElement,
    });

    // 2. Create BindGroup (Resources)
    // In optimized app, we cache this. But importExternalTexture returns new obj each frame.
    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.sampler },
        { binding: 1, resource: externalTexture }, // WGSL texture_external
      ],
    });

    // 3. Command Encoder
    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.draw(6); // Draw 6 vertices (Quad)
    passEncoder.end();

    // 4. Submit
    this.device.queue.submit([commandEncoder.finish()]);
  }
}
