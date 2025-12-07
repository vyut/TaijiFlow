// === Pose connections สำหรับวาดโครงกระดูก ===
const POSE_CONNECTIONS = [
  [11, 13],
  [13, 15], // ไหล่ซ้าย–ศอกซ้าย–ข้อมือซ้าย
  [12, 14],
  [14, 16], // ไหล่ขวา–ศอกขวา–ข้อมือขวา
  [11, 12], // ไหล่ซ้าย–ไหล่ขวา
  [23, 24], // สะโพกซ้าย–สะโพกขวา
  [11, 23],
  [12, 24], // ไหล่ซ้าย–สะโพกซ้าย, ไหล่ขวา–สะโพกขวา
  [23, 25],
  [25, 27], // สะโพกซ้าย–เข่าซ้าย–ข้อเท้าซ้าย
  [24, 26],
  [26, 28], // สะโพกขวา–เข่าขวา–ข้อเท้าขวา
];

// === Global State ===
let currentTechnique = null;
let currentPosition = "sitting";

let languageManager;
let techniqueManager;
let modalManager;
let aiAnalysis;
let notificationSystem;
let formManager;
let smoothScroll;
let fullscreenManager;

// === Technique Manager ===
class TechniqueManager {
  constructor() {
    this.data = typeof techniqueData !== "undefined" ? techniqueData : {};
    this.initFilterTabs();
  }

  initFilterTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const pos = e.currentTarget.dataset.position;
        this.filterByPosition(pos);
      });
    });
  }

  filterByPosition(position) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.position === position);
    });

    const cards = document.querySelectorAll(".silk-card");
    cards.forEach((card) => {
      if (position === "all") {
        card.classList.remove("hidden");
      } else {
        const ps = card.dataset.positions.split(",");
        if (ps.includes(position)) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      }
    });
  }

  getTechniqueData(id, position) {
    if (!this.data[id] || !this.data[id].positions[position]) return null;
    return this.data[id].positions[position];
  }
}

// === AI Motion Analysis (with fullscreen support) ===
class AIMotionAnalysis {
  constructor() {
    this.isInitialized = false;
    this.isAnalyzing = false;
    this.pose = null;
    this.camera = null;
    this.canvas = null;
    this.ctx = null;
    this.video = null;
    this.feedbackElement = null;
    this.isFullscreen = false;
  }

  async initialize() {
    try {
      if (typeof Pose === "undefined") {
        throw new Error("MediaPipe Pose not loaded");
      }

      this.canvas = document.getElementById("output_canvas");
      this.ctx = this.canvas.getContext("2d");
      this.feedbackElement = document.getElementById("aiFeedback");
      this.video = document.createElement("video");

      this.pose = new Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.pose.onResults((results) => this.onResults(results));
      this.isInitialized = true;
      this.updateFeedback("ระบบ AI พร้อมใช้งาน", "success");
    } catch (err) {
      console.error(err);
      this.updateFeedback("ไม่สามารถเริ่มระบบ AI ได้", "error");
    }
  }

  async startAnalysis() {
    if (!this.isInitialized) {
      await this.initialize();
      if (!this.isInitialized) return;
    }

    try {
      const width = this.isFullscreen ? 1280 : 640;
      const height = this.isFullscreen ? 720 : 480;

      this.camera = new Camera(this.video, {
        onFrame: async () => {
          if (this.isAnalyzing) {
            await this.pose.send({ image: this.video });
          }
        },
        width,
        height,
      });

      await this.camera.start();
      this.isAnalyzing = true;
      this.updateControlButtons();
      this.updateFeedback(
        "กำลังวิเคราะห์ท่าทาง... โปรดยืนให้อยู่ในกรอบกล้อง",
        "info"
      );
    } catch (err) {
      console.error(err);
      this.updateFeedback(
        "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้อง",
        "error"
      );
    }
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    if (this.camera) this.camera.stop();

    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    const otherCanvas = this.isFullscreen
      ? document.getElementById("output_canvas")
      : document.getElementById("fullscreen_canvas");

    if (otherCanvas) {
      const octx = otherCanvas.getContext("2d");
      octx.clearRect(0, 0, otherCanvas.width, otherCanvas.height);
    }

    this.updateControlButtons();
    this.updateFeedback("การวิเคราะห์หยุดแล้ว", "info");
  }

  switchToFullscreen(fullCanvas, fullCtx) {
    this.canvas = fullCanvas;
    this.ctx = fullCtx;
    this.feedbackElement = document.getElementById("fullscreenFeedback");
    this.isFullscreen = true;
    this.updateControlButtons();
  }

  switchToNormal(normCanvas, normCtx) {
    this.canvas = normCanvas;
    this.ctx = normCtx;
    this.feedbackElement = document.getElementById("aiFeedback");
    this.isFullscreen = false;
    this.updateControlButtons();
  }

  onResults(results) {
    if (!this.isAnalyzing || !this.ctx || !this.canvas) return;

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      results.image,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    if (results.poseLandmarks) {
      // วาดเส้นโครงกระดูก + จุด แบบสคริปต์เดิม
      this.drawConnectors(results.poseLandmarks, POSE_CONNECTIONS);
      this.drawLandmarks(results.poseLandmarks);
      this.simpleAnalysis(results.poseLandmarks);
    } else {
      this.updateFeedback(
        "ไม่พบท่าทางในภาพ โปรดยืนให้อยู่ในกรอบกล้อง",
        "warning"
      );
    }

    this.ctx.restore();
  }

  drawConnectors(landmarks, connections) {
    if (!this.ctx || !this.canvas || !landmarks) return;

    this.ctx.strokeStyle = "#00FF00";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    for (const connection of connections) {
      const start = landmarks[connection[0]];
      const end = landmarks[connection[1]];
      if (start && end) {
        this.ctx.moveTo(
          start.x * this.canvas.width,
          start.y * this.canvas.height
        );
        this.ctx.lineTo(end.x * this.canvas.width, end.y * this.canvas.height);
      }
    }

    this.ctx.stroke();
  }

  drawLandmarks(landmarks) {
    if (!this.ctx || !this.canvas || !landmarks) return;

    this.ctx.fillStyle = "#FF0000";
    for (const landmark of landmarks) {
      this.ctx.beginPath();
      this.ctx.arc(
        landmark.x * this.canvas.width,
        landmark.y * this.canvas.height,
        3,
        0,
        2 * Math.PI
      );
      this.ctx.fill();
    }
  }

  simpleAnalysis(landmarks) {
    try {
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      if (!leftShoulder || !rightShoulder) return;

      const diff = Math.abs(leftShoulder.y - rightShoulder.y);
      const msgs = [];

      if (diff > 0.05) {
        msgs.push("⚠️ ปรับระดับไหล่ให้เสมอกัน");
      } else {
        msgs.push("✅ ระดับไหล่ดี");
      }

      msgs.push("ให้เคลื่อนไหวอย่างนุ่มนวลและต่อเนื่อง");
      this.updateFeedback(msgs.join("<br>"), "info");
    } catch (e) {
      console.error(e);
    }
  }

  updateFeedback(msg, type = "info") {
    if (!this.feedbackElement) return;
    this.feedbackElement.innerHTML = msg;
    const baseClass = this.isFullscreen ? "fullscreen-feedback" : "ai-feedback";
    this.feedbackElement.className = `${baseClass} ${type}`;

    // sync อีกฝั่ง
    const otherId = this.isFullscreen ? "aiFeedback" : "fullscreenFeedback";
    const other = document.getElementById(otherId);
    if (other) {
      other.innerHTML = msg;
      other.className = `${
        this.isFullscreen ? "ai-feedback" : "fullscreen-feedback"
      } ${type}`;
    }
  }

  updateControlButtons() {
    const st = document.getElementById("startCamera");
    const sp = document.getElementById("stopCamera");
    const fst = document.getElementById("fullscreenStartCamera");
    const fsp = document.getElementById("fullscreenStopCamera");

    if (st && sp) {
      st.style.display = this.isAnalyzing ? "none" : "inline-block";
      sp.style.display = this.isAnalyzing ? "inline-block" : "none";
    }
    if (fst && fsp) {
      fst.style.display = this.isAnalyzing ? "none" : "inline-block";
      fsp.style.display = this.isAnalyzing ? "inline-block" : "none";
    }
  }
}

// === Fullscreen Manager ===
class FullscreenManager {
  constructor() {
    this.isFullscreen = false;
    this.fullCanvas = document.getElementById("fullscreen_canvas");
    this.normCanvas = document.getElementById("output_canvas");

    if (!this.fullCanvas || !this.normCanvas) {
      // console.warn("FullscreenManager: canvas element(s) not found.");
      this.fullCtx = null;
      this.normCtx = null;
      return;
    }

    this.fullCtx = this.fullCanvas.getContext("2d");
    this.normCtx = this.normCanvas.getContext("2d");
  }

  enter() {
    if (!this.fullCanvas || !this.fullCtx) return;

    this.isFullscreen = true;
    const overlay = document.getElementById("fullscreenOverlay");
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    this.resizeFullscreenCanvas();
    if (aiAnalysis) {
      aiAnalysis.switchToFullscreen(this.fullCanvas, this.fullCtx);
    }

    document.addEventListener("keydown", this.handleKey);
    if (notificationSystem) {
      notificationSystem.show("เข้าสู่โหมดเต็มหน้าจอ กด ESC เพื่อออก", "info");
    }
  }

  exit() {
    if (!this.fullCanvas || !this.normCanvas || !this.normCtx) return;

    this.isFullscreen = false;
    const overlay = document.getElementById("fullscreenOverlay");
    overlay.style.display = "none";
    document.body.style.overflow = "auto";

    if (aiAnalysis) {
      aiAnalysis.switchToNormal(this.normCanvas, this.normCtx);
    }
    document.removeEventListener("keydown", this.handleKey);
    if (notificationSystem) {
      notificationSystem.show("ออกจากโหมดเต็มหน้าจอแล้ว", "info");
    }
  }

  handleKey = (e) => {
    if (e.key === "Escape" && this.isFullscreen) {
      this.exit();
    }
  };

  resizeFullscreenCanvas() {
    if (!this.fullCanvas) return;
    const container = document.querySelector(".fullscreen-video-area");
    if (!container) return;

    const maxW = container.clientWidth - 40;
    const maxH = window.innerHeight * 0.7;
    let w = maxW;
    let h = (w * 9) / 16;
    if (h > maxH) {
      h = maxH;
      w = (h * 16) / 9;
    }
    this.fullCanvas.style.width = `${w}px`;
    this.fullCanvas.style.height = `${h}px`;
  }
}

// === Modal Manager ===
class ModalManager {
  constructor() {
    this.currentModal = null;
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.close();
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  open(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    this.currentModal = modal;
  }

  close() {
    if (!this.currentModal) return;
    this.currentModal.style.display = "none";
    document.body.style.overflow = "auto";
    this.currentModal = null;
    if (aiAnalysis && aiAnalysis.isAnalyzing) {
      aiAnalysis.stopAnalysis();
    }
  }
}

// === Notification System ===
class NotificationSystem {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    const div = document.createElement("div");
    div.id = "notification-container";
    div.style.position = "fixed";
    div.style.top = "100px";
    div.style.right = "20px";
    div.style.zIndex = "9999";
    document.body.appendChild(div);
    return div;
  }

  show(msg, type = "info", duration = 3000) {
    const n = document.createElement("div");
    n.className = `notification ${type}`;
    n.textContent = msg;
    this.container.appendChild(n);
    setTimeout(() => {
      if (n.parentNode) n.parentNode.removeChild(n);
    }, duration);
  }
}

// === Form Manager ===
class FormManager {
  constructor() {
    const form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name");
    const email = fd.get("email");
    const message = fd.get("message");

    if (!name || !email || !message) {
      notificationSystem.show("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
      return;
    }

    notificationSystem.show("กำลังส่งข้อความ...", "info");
    setTimeout(() => {
      notificationSystem.show("ส่งข้อความเรียบร้อยแล้ว ขอบคุณครับ!", "success");
      e.target.reset();
    }, 800);
  }
}

// === Smooth Scroll ===
class SmoothScroll {
  constructor() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length === 1) return;
        e.preventDefault();
        const el = document.querySelector(id);
        if (!el) return;
        const headerH = document.querySelector("header").offsetHeight;
        const top = el.offsetTop - headerH - 20;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }
}

// === Global functions for HTML onClick ===
function openTechniqueModal(id, name) {
  currentTechnique = id;
  document.getElementById("modalTitle").textContent = name;
  loadTechniqueContent(id, currentPosition);
  modalManager.open("techniqueModal");
}

function closeTechniqueModal() {
  modalManager.close();
}

function switchPosition(pos) {
  currentPosition = pos;
  document.querySelectorAll(".position-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.pos === pos);
  });
  if (currentTechnique) {
    loadTechniqueContent(currentTechnique, pos);
  }
}

function loadTechniqueContent(id, pos) {
  const data = techniqueManager.getTechniqueData(id, pos);
  if (!data) return;

  document.getElementById("techniqueDescription").textContent =
    data.description || "";

  const kp = document.getElementById("keyPoints");
  kp.innerHTML = "";
  (data.keyPoints || []).forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    kp.appendChild(li);
  });

  const cm = document.getElementById("commonMistakes");
  cm.innerHTML = "";
  (data.commonMistakes || []).forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    cm.appendChild(li);
  });

  document.getElementById("breathingTechnique").textContent =
    data.breathingTechnique || "";
  document.getElementById("practiceTips").innerHTML = `<p>${
    data.tips || ""
  }</p>`;
}

function startAIAnalysis() {
  aiAnalysis.isFullscreen = false;
  aiAnalysis.startAnalysis();
}

function stopAIAnalysis() {
  aiAnalysis.stopAnalysis();
}

function startAIAnalysisFullscreen() {
  aiAnalysis.isFullscreen = true;
  aiAnalysis.startAnalysis();
}

function stopAIAnalysisFullscreen() {
  aiAnalysis.stopAnalysis();
}

function toggleFullscreen() {
  fullscreenManager.enter();
}

function exitFullscreen() {
  fullscreenManager.exit();
}

function toggleLanguageMenu() {
  const menu = document.getElementById("languageMenu");
  if (!menu) return;

  menu.classList.toggle("show");

  // ปิดเมนูเมื่อคลิกนอก dropdown
  setTimeout(() => {
    const handler = (e) => {
      if (!e.target.closest(".language-dropdown")) {
        menu.classList.remove("show");
        document.removeEventListener("click", handler);
      }
    };
    document.addEventListener("click", handler);
  }, 0);
}

// === Init ===
document.addEventListener("DOMContentLoaded", async () => {
  notificationSystem = new NotificationSystem();
  languageManager = new window.LanguageManager({
    defaultLang: "th",
    localesPath: "./locales",
  });
  await languageManager.init();

  techniqueManager = new TechniqueManager();
  modalManager = new ModalManager();
  aiAnalysis = new AIMotionAnalysis();
  formManager = new FormManager();
  smoothScroll = new SmoothScroll();
  fullscreenManager = new FullscreenManager();

  document.querySelectorAll(".language-option").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const lang = btn.dataset.lang;
      await languageManager.switchLanguage(lang);
      document.getElementById("languageMenu").classList.remove("show");
    });
  });
});
