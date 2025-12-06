// Taiji Silk Reeling Animation - Optimized Version
// ======================================
// Performance Settings
// ======================================
const PERFORMANCE_CONFIG = {
  TARGET_FPS: 30, // จำกัดที่ 30 FPS เพื่อประหยัดทรัพยากร (เว็บคามต้องการ 60 FPS)
  SHOW_FPS: true, // แสดง FPS monitor
  AUTO_ADJUST: true, // ปรับ quality อัตโนมัติตาม performance
  LOW_FPS_THRESHOLD: 20, // ถ้า FPS ต่ำกว่านี้ = performance ไม่ดี
};

// ======================================
// Canvas Setup
// ======================================
const canvas = document.getElementById("taiji-canvas");
const ctx = canvas.getContext("2d", {
  alpha: true,
  desynchronized: true, // ปรับปรุง performance บนบาง browser
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // อัพเดทตำแหน่งศูนย์กลางเมื่อ resize
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  targetX = centerX;
  targetY = centerY;
});

// ======================================
// FPS Monitoring
// ======================================
const fpsMonitor = {
  frames: [],
  lastTime: performance.now(),
  currentFPS: 0,

  update() {
    const now = performance.now();
    // เก็บ timestamp ในช่วง 1 วินาที
    while (this.frames.length > 0 && this.frames[0] <= now - 1000) {
      this.frames.shift();
    }
    this.frames.push(now);
    this.currentFPS = this.frames.length;
    return this.currentFPS;
  },

  draw() {
    if (!PERFORMANCE_CONFIG.SHOW_FPS) return;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 140, 60);

    ctx.fillStyle =
      this.currentFPS < PERFORMANCE_CONFIG.LOW_FPS_THRESHOLD
        ? "#ff4444"
        : "#44ff44";
    ctx.font = "bold 20px monospace";
    ctx.fillText(`FPS: ${this.currentFPS}`, 20, 35);

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px monospace";
    ctx.fillText(`Particles: ${particles.length}`, 20, 55);
    ctx.restore();
  },
};

// ======================================
// Animation State
// ======================================
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let targetX = centerX;
let targetY = centerY;
let mouseAngle = 0;
let lastMouseAngle = 0;
let rotationDirection = 1;
let targetRotationDirection = 1;
let mouseSpeed = 0;
let targetScale = 1;
let currentScale = 1;
let breathTime = 0;

// ======================================
// Particle Settings (ปรับได้ตาม performance)
// ======================================
let particleConfig = {
  ringRadius: 180,
  ringThickness: 300,
  particleCount: 60, // ลดจาก 80
  particleRows: 20, // ลดจาก 30
  particleSize: 2,
};

const particles = [];

// ======================================
// Mouse Tracking
// ======================================
canvas.addEventListener("mousemove", (e) => {
  targetX = e.clientX;
  targetY = e.clientY;

  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  mouseAngle = Math.atan2(dy, dx);

  let angleDiff = mouseAngle - lastMouseAngle;

  if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  mouseSpeed = Math.abs(angleDiff);

  if (Math.abs(angleDiff) > 0.01) {
    targetRotationDirection = angleDiff > 0 ? 1 : -1;
  }

  targetScale = 1 + Math.min(mouseSpeed * 8, 0.2);
  if (mouseSpeed < 0.005) {
    targetScale = 1 - Math.min((0.005 - mouseSpeed) * 30, 0.15);
  }

  lastMouseAngle = mouseAngle;
});

// ======================================
// Particle Class
// ======================================
class Particle {
  constructor(angle, row) {
    this.angle = angle;
    this.row = row;
    this.baseRadius =
      particleConfig.ringRadius +
      (row / particleConfig.particleRows) * particleConfig.ringThickness;
    this.radius = this.baseRadius;
    this.size = particleConfig.particleSize;
    this.alpha = 0.1 + (row / particleConfig.particleRows) * 0.7;
    this.phase = Math.random() * Math.PI * 2;
    this.spiralPhase = (row / particleConfig.particleRows) * Math.PI * 4;
    this.speed = 0.001 + (row / particleConfig.particleRows) * 0.002;
    this.followSpeed = 0.02 + (row / particleConfig.particleRows) * 0.08;
    this.x = 0;
    this.y = 0;
  }

  update(time, targetCenterX, targetCenterY, direction, scale) {
    const spiralExpansion = Math.sin(time * 0.4 + this.spiralPhase) * 60;
    const spiralRotation = Math.cos(time * 0.3 + this.spiralPhase) * 0.5;

    this.angle += (this.speed + spiralRotation * 0.01) * direction;

    const innerToOuter =
      Math.sin(time * 0.5 + this.phase - this.row * 0.2) * 25;
    const spiralPulse = Math.cos(time * 0.35 + this.angle * 1.5) * 15;

    this.radius =
      (this.baseRadius + spiralExpansion + innerToOuter + spiralPulse) * scale;

    const alphaWave =
      Math.sin(time * 0.4 + this.phase + this.spiralPhase) * 0.3;
    this.alpha =
      0.1 + (this.row / particleConfig.particleRows) * 0.7 + alphaWave;
    this.alpha = Math.max(0.05, Math.min(1, this.alpha));

    const spiralX = Math.cos(this.angle) * this.radius;
    const spiralY = Math.sin(this.angle) * this.radius;

    const targetX = targetCenterX + spiralX;
    const targetY = targetCenterY + spiralY;

    this.x += (targetX - this.x) * this.followSpeed;
    this.y += (targetY - this.y) * this.followSpeed;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(66, 133, 244, ${this.alpha})`;
    ctx.fill();
  }
}

// ======================================
// Initialize Particles
// ======================================
function initParticles() {
  particles.length = 0;
  for (let row = 0; row < particleConfig.particleRows; row++) {
    for (let i = 0; i < particleConfig.particleCount; i++) {
      const angle = (i / particleConfig.particleCount) * Math.PI * 2;
      particles.push(new Particle(angle, row));
    }
  }
}

// ======================================
// Auto Performance Adjustment
// ======================================
let performanceCheckCounter = 0;
function checkAndAdjustPerformance() {
  if (!PERFORMANCE_CONFIG.AUTO_ADJUST) return;

  performanceCheckCounter++;
  if (performanceCheckCounter < 60) return; // ตรวจทุก 60 frames (~2 วินาที)
  performanceCheckCounter = 0;

  const fps = fpsMonitor.currentFPS;

  // ถ้า FPS ต่ำเกินไป ลด particles
  if (
    fps < PERFORMANCE_CONFIG.LOW_FPS_THRESHOLD &&
    particleConfig.particleRows > 10
  ) {
    console.log("⚠️ Low FPS detected. Reducing particle quality...");
    particleConfig.particleRows = Math.max(10, particleConfig.particleRows - 5);
    particleConfig.particleCount = Math.max(
      40,
      particleConfig.particleCount - 10
    );
    initParticles();
  }
  // ถ้า FPS ดี และ particles ยังไม่เต็ม ค่อยๆ เพิ่ม
  else if (fps > 50 && particleConfig.particleRows < 20) {
    console.log("✅ Good FPS. Increasing particle quality...");
    particleConfig.particleRows = Math.min(20, particleConfig.particleRows + 2);
    particleConfig.particleCount = Math.min(
      60,
      particleConfig.particleCount + 5
    );
    initParticles();
  }
}

// ======================================
// Animation Loop with FPS Control
// ======================================
let time = 0;
let lastFrameTime = 0;
const frameInterval = 1000 / PERFORMANCE_CONFIG.TARGET_FPS;

function animate(timestamp) {
  requestAnimationFrame(animate);

  // จำกัด FPS
  const elapsed = timestamp - lastFrameTime;
  if (elapsed < frameInterval) return;

  // เก็บ excess time เพื่อความแม่นยำ
  lastFrameTime = timestamp - (elapsed % frameInterval);

  // อัพเดท FPS monitor
  fpsMonitor.update();

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update animation state
  time += 0.01;
  breathTime += 0.02;

  centerX += (targetX - centerX) * 0.08;
  centerY += (targetY - centerY) * 0.08;

  rotationDirection += (targetRotationDirection - rotationDirection) * 0.05;

  mouseSpeed *= 0.95;
  if (mouseSpeed < 0.001) {
    const breathScale = Math.sin(breathTime) * 0.08 + 1;
    targetScale = breathScale;
  }

  currentScale += (targetScale - currentScale) * 0.08;

  // Update and draw particles
  particles.forEach((particle) => {
    particle.update(time, centerX, centerY, rotationDirection, currentScale);
    particle.draw();
  });

  // Draw FPS monitor
  fpsMonitor.draw();

  // Check performance และปรับ quality
  checkAndAdjustPerformance();
}

// ======================================
// Start Animation
// ======================================
console.log("🌀 Taiji Animation Started");
console.log(`📊 Target FPS: ${PERFORMANCE_CONFIG.TARGET_FPS}`);
console.log(`🔧 Auto Adjust: ${PERFORMANCE_CONFIG.AUTO_ADJUST ? "ON" : "OFF"}`);

initParticles();
requestAnimationFrame(animate);
