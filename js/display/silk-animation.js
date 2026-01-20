/**
 * ============================================================================
 * TaijiFlow AI - Silk Reeling Animation
 * ============================================================================
 *
 * Canvas animation สำหรับแสดงเส้นเกลียวม้วนไหม (Silk Reeling) บน Hero Section
 *
 * Features:
 *   - Particle-based animation สร้างหางยาวสวยงาม
 *   - ไล่สีจากม่วง -> ฟ้า
 *   - Breathing effect (ขยาย-หด)
 *   - Responsive ตามขนาดหน้าจอ
 *
 * Usage:
 *   1. สร้าง canvas#silk-canvas ใน HTML
 *   2. โหลด script นี้ด้วย defer
 *   3. Animation จะเริ่มอัตโนมัติ
 *
 * ============================================================================
 */

class SilkReelingAnimation {
  constructor(canvasId = "silk-canvas") {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`Canvas #${canvasId} not found`);
      return;
    }

    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.maxParticles = 250;
    this.angle = 0;
    this.angle2 = Math.PI;
    this.radiusScale = 1;
    this.radiusDirection = 1;
    this.baseRadius = 0;
    this.lastTime = performance.now();
    this.isRunning = false;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.start();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.baseRadius = Math.min(this.canvas.width, this.canvas.height) * 0.2;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate(performance.now());
  }

  stop() {
    this.isRunning = false;
  }

  animate(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clear with fade effect
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Rotation speed
    const rotationSpeed = 0.3;
    this.angle += rotationSpeed * deltaTime;
    this.angle2 += rotationSpeed * deltaTime;

    // Breathing effect
    this.radiusScale += 0.01 * this.radiusDirection;
    if (this.radiusScale > 1.8) {
      this.radiusDirection = -1;
    } else if (this.radiusScale < 0.7) {
      this.radiusDirection = 1;
    }

    const particlesPerFrame = 2;

    // Line 1 (Purple)
    for (let i = 0; i < particlesPerFrame; i++) {
      const distance = this.baseRadius * this.radiusScale;
      const x = cx + Math.cos(this.angle) * distance;
      const y = cy + Math.sin(this.angle) * distance;
      this.particles.push(new SilkParticle(x, y, this.angle, false));
    }

    // Line 2 (Blue)
    for (let i = 0; i < particlesPerFrame; i++) {
      const distance = this.baseRadius * this.radiusScale;
      const x = cx + Math.cos(this.angle2) * distance;
      const y = cy + Math.sin(this.angle2) * distance;
      this.particles.push(new SilkParticle(x, y, this.angle2, true));
    }

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      this.particles[i].draw(this.ctx);

      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Limit particles
    while (this.particles.length > this.maxParticles) {
      this.particles.shift();
    }

    // Draw bright heads
    this.drawHeads(cx, cy);

    requestAnimationFrame((t) => this.animate(t));
  }

  drawHeads(cx, cy) {
    const heads = [
      { angle: this.angle, hue: 270 },
      { angle: this.angle2, hue: 200 },
    ];

    heads.forEach((head) => {
      const distance = this.baseRadius * this.radiusScale;
      const x = cx + Math.cos(head.angle) * distance;
      const y = cy + Math.sin(head.angle) * distance;

      // Outer glow
      const outerGlow = this.ctx.createRadialGradient(x, y, 0, x, y, 70);
      outerGlow.addColorStop(0, `hsla(${head.hue}, 90%, 85%, 1)`);
      outerGlow.addColorStop(0.2, `hsla(${head.hue}, 85%, 75%, 0.7)`);
      outerGlow.addColorStop(0.5, `hsla(${head.hue}, 80%, 65%, 0.3)`);
      outerGlow.addColorStop(1, `hsla(${head.hue}, 80%, 60%, 0)`);

      this.ctx.fillStyle = outerGlow;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 70, 0, Math.PI * 2);
      this.ctx.fill();

      // Core
      const core = this.ctx.createRadialGradient(x, y, 0, x, y, 25);
      core.addColorStop(0, "rgba(255, 255, 255, 1)");
      core.addColorStop(0.4, `hsla(${head.hue}, 95%, 85%, 0.9)`);
      core.addColorStop(1, `hsla(${head.hue}, 85%, 75%, 0.4)`);

      this.ctx.fillStyle = core;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 25, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}

class SilkParticle {
  constructor(x, y, angle, isSecondLine) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.size = Math.random() * 1.5 + 0.5;
    this.life = 1;
    this.decay = 0.003;
    this.isSecondLine = isSecondLine;
    this.baseHue = isSecondLine ? 200 : 270;
  }

  update() {
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.life <= 0) return;

    const alpha = Math.pow(this.life, 0.4);
    const size = this.size * (0.5 + this.life * 0.5);

    const colorProgress = 1 - this.life;
    const hue = this.baseHue + colorProgress * 80;
    const brightness = 60 + this.life * 20;
    const saturation = 80;

    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      size * 15
    );
    gradient.addColorStop(
      0,
      `hsla(${hue}, ${saturation}%, ${brightness + 30}%, ${alpha * 0.9})`
    );
    gradient.addColorStop(
      0.2,
      `hsla(${hue}, ${saturation}%, ${brightness + 10}%, ${alpha * 0.6})`
    );
    gradient.addColorStop(
      0.5,
      `hsla(${hue}, ${saturation}%, ${brightness}%, ${alpha * 0.3})`
    );
    gradient.addColorStop(
      1,
      `hsla(${hue}, ${saturation}%, ${brightness - 20}%, 0)`
    );

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size * 15, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("silk-canvas")) {
    window.silkAnimation = new SilkReelingAnimation("silk-canvas");
  }
});
