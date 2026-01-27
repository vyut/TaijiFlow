/**
 * ============================================================================
 * TaijiFlow AI - Debug Manager
 * ============================================================================
 *
 * จัดการหน้าจอ Debug Overlay (แสดงค่า FPS, Thresholds)
 *
 * @author TaijiFlow AI Team
 * @since 3.1.0
 * ============================================================================
 */

class DebugManager {
  constructor(overlayEl, contentEl) {
    this.overlay = overlayEl;
    this.content = contentEl;
    this.visible = false;

    // Graph Data
    this.maxHistory = 60; // 2 seconds @ 30fps
    this.history = {
      camFps: new Array(this.maxHistory).fill(0),
      aiFps: new Array(this.maxHistory).fill(0),
      latency: new Array(this.maxHistory).fill(0),
    };

    // Create Canvas for Graph
    this.canvas = document.createElement("canvas");
    this.canvas.width = 240; // Fits within min-w-[280px]
    this.canvas.height = 60;
    this.canvas.className = "mt-2 opacity-90";
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * แสดง/ซ่อน Debug Overlay
   * @param {boolean} show
   */
  toggle(show) {
    this.visible = show;
    if (this.overlay) {
      if (show) {
        this.overlay.classList.remove("hidden");
        // Append canvas if not present
        if (!this.overlay.contains(this.canvas)) {
          this.overlay.appendChild(this.canvas);
        }
      } else {
        this.overlay.classList.add("hidden");
      }
    }
  }

  /**
   * อัปเดตข้อมูลบนหน้าจอ Debug และวาดกราฟ
   * @param {Object} info - ข้อมูลที่จะแสดง (FPS, AI Rate, AI Time, Res)
   * @param {Object} engine - HeuristicsEngine instance (optional)
   */
  update(info, engine) {
    if (!this.visible || !this.content) return;

    // --- 1. Update Text Info ---
    let html = "";

    // A. Engine Debug Info
    if (engine) {
      const engineInfo = engine.getDebugInfo();
      if (engineInfo.pathDistance) {
        html += `<div class="mb-1"><span class="text-orange-400">Path Dist:</span> ${engineInfo.pathDistance} / ${engineInfo.pathThreshold}</div>`;
      }
      if (engineInfo.shapeConsistency) {
        html += `<div class="mb-1"><span class="text-blue-400">Shape:</span> ${engineInfo.shapeConsistency} (Th: ${engineInfo.shapeThreshold})</div>
                     <div class="text-xs text-gray-400 ml-2">CW: ${engineInfo.cwTurns}, CCW: ${engineInfo.ccwTurns}</div>`;
      }
      if (engineInfo.acceleration) {
        html += `<div class="mb-1"><span class="text-purple-400">Smooth:</span> Acc: ${engineInfo.acceleration} (Th: ${engineInfo.smoothThreshold})</div>
                      <div class="text-xs text-gray-400 ml-2">Vel: ${engineInfo.wristVelocity}</div>`;
      }
    }

    // B. Generic Info
    for (const [key, value] of Object.entries(info)) {
      let colorClass = "text-gray-400";
      if (key === "FPS") colorClass = "text-green-400 font-bold";
      if (key === "AI Rate") colorClass = "text-cyan-400 font-bold";
      if (key === "AI Time") colorClass = "text-purple-400";

      html += `<div><span class="${colorClass}">${key}:</span> ${value}</div>`;
    }
    this.content.innerHTML = html;

    // --- 2. Update Graph Data ---
    // Extract numeric values strictly
    const camFps = parseFloat(info["FPS"]) || 0;
    const aiFps = parseFloat(info["AI Rate"]) || 0;
    const latency = parseFloat(info["AI Time"]) || 0;

    this.pushHistory(this.history.camFps, camFps);
    this.pushHistory(this.history.aiFps, aiFps);
    this.pushHistory(this.history.latency, latency);

    // --- 3. Draw Graph ---
    this.drawGraph();
  }

  pushHistory(arr, val) {
    arr.push(val);
    if (arr.length > this.maxHistory) arr.shift();
  }

  drawGraph() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, w, h);

    // Grid Lines (every 20px approx)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5); // Mid line
    ctx.lineTo(w, h * 0.5);
    ctx.stroke();

    // Draw Lines
    // 1. Camera FPS (Green) - Scale 0-60
    this.drawLine(this.history.camFps, "rgba(74, 222, 128, 1)", 60);

    // 2. AI FPS (Cyan) - Scale 0-60
    this.drawLine(this.history.aiFps, "rgba(34, 211, 238, 1)", 60);

    // 3. Latency (Purple) - Scale 0-200ms (Secondary Axis equivalent)
    // To fit in same graph, we scale it down: 200ms = full height
    this.drawLine(this.history.latency, "rgba(192, 132, 252, 0.7)", 200, true);
  }

  drawLine(data, color, maxVal, isFill = false) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const step = w / (this.maxHistory - 1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((val, i) => {
      // Normalize 0-1
      const normalized = Math.min(val / maxVal, 1);
      // Invert Y (Canvas 0 is top)
      const x = i * step;
      const y = h - normalized * h;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    if (isFill) {
      ctx.fillStyle = color.replace("1)", "0.1)").replace("0.7)", "0.1)");
      ctx.lineTo(w, h); // Bottom Right
      ctx.lineTo(0, h); // Bottom Left
      ctx.fill();
    }
  }
}

// Global Export
window.DebugManager = DebugManager;
