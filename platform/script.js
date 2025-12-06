// === Global Variables ===
let currentTechnique = null;
let currentPosition = "sitting";
let pose = null;
let camera = null;
let isAIActive = false;

// === Technique Management System ===
class TechniqueManager {
  constructor() {
    this.loadTechniqueData();
    this.initializeEventListeners();
  }

  loadTechniqueData() {
    // ตรวจสอบว่ามีข้อมูลจาก technique-data.js หรือไม่
    if (typeof techniqueData === "undefined") {
      console.warn("Technique data not loaded");
      return;
    }
    this.data = techniqueData;
  }

  initializeEventListeners() {
    // Position filter tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.filterByPosition(e.target.dataset.position);
      });
    });
  }

  filterByPosition(position) {
    // Update active tab
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document
      .querySelector(`[data-position="${position}"]`)
      .classList.add("active");

    // Filter cards
    const cards = document.querySelectorAll(".silk-card");
    cards.forEach((card) => {
      if (position === "all") {
        card.classList.remove("hidden");
      } else {
        const cardPositions = card.dataset.positions.split(",");
        if (cardPositions.includes(position)) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      }
    });
  }

  getTechniqueData(techniqueId, position) {
    if (!this.data || !this.data[techniqueId]) {
      return null;
    }
    return this.data[techniqueId].positions[position] || null;
  }
}

// === AI Motion Analysis System ===
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
  }

  async initialize() {
    try {
      // ตรวจสอบว่าโหลด MediaPipe libraries แล้วหรือไม่
      if (typeof Pose === "undefined") {
        throw new Error("MediaPipe Pose library not loaded");
      }

      this.canvas = document.getElementById("output_canvas");
      this.ctx = this.canvas.getContext("2d");
      this.feedbackElement = document.getElementById("aiFeedback");
      this.video = document.createElement("video");

      // Initialize MediaPipe Pose
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
    } catch (error) {
      console.error("AI initialization failed:", error);
      this.updateFeedback(
        "ไม่สามารถเริ่มระบบ AI ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        "error"
      );
    }
  }

  async startAnalysis() {
    if (!this.isInitialized) {
      await this.initialize();
      if (!this.isInitialized) return;
    }

    try {
      // Initialize camera
      this.camera = new Camera(this.video, {
        onFrame: async () => {
          if (this.isAnalyzing) {
            await this.pose.send({ image: this.video });
          }
        },
        width: 320,
        height: 240,
      });

      await this.camera.start();
      this.isAnalyzing = true;

      // Update UI
      document.getElementById("startCamera").style.display = "none";
      document.getElementById("stopCamera").style.display = "inline-block";

      this.updateFeedback(
        "กำลังวิเคราะห์ท่าทาง... โปรดยืนให้อยู่ในกรอบกล้อง",
        "info"
      );
    } catch (error) {
      console.error("Failed to start camera:", error);
      this.updateFeedback(
        "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้อง",
        "error"
      );
    }
  }

  stopAnalysis() {
    this.isAnalyzing = false;

    if (this.camera) {
      this.camera.stop();
    }

    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Update UI
    document.getElementById("startCamera").style.display = "inline-block";
    document.getElementById("stopCamera").style.display = "none";

    this.updateFeedback("การวิเคราะห์หยุดแล้ว", "info");
  }

  onResults(results) {
    if (!this.isAnalyzing) return;

    // Clear canvas and draw video
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
      // Draw pose landmarks
      this.drawConnectors(results.poseLandmarks, POSE_CONNECTIONS);
      this.drawLandmarks(results.poseLandmarks);

      // Analyze posture
      this.analyzePose(results.poseLandmarks);
    } else {
      this.updateFeedback(
        "ไม่พบท่าทางในภาพ โปรดยืนให้อยู่ในกรอบกล้อง",
        "warning"
      );
    }

    this.ctx.restore();
  }

  drawConnectors(landmarks, connections) {
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

  analyzePose(landmarks) {
    try {
      // Basic posture analysis
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];

      let feedback = [];

      // Check shoulder alignment
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      if (shoulderDiff > 0.05) {
        feedback.push("⚠️ ปรับไหล่ให้อยู่ในระดับเดียวกัน");
      }

      // Check arm position for current technique
      if (currentTechnique && currentPosition) {
        const techniqueData = techniqueManager.getTechniqueData(
          currentTechnique,
          currentPosition
        );
        if (techniqueData) {
          feedback.push("✅ ท่าทางดูดี ให้คลื่นไหวต่อเนื่อง");
        }
      }

      // Update feedback
      if (feedback.length > 0) {
        this.updateFeedback(feedback.join("<br>"), "info");
      } else {
        this.updateFeedback("✅ ท่าทางดีมาก!", "success");
      }
    } catch (error) {
      console.error("Pose analysis error:", error);
    }
  }

  updateFeedback(message, type = "info") {
    if (!this.feedbackElement) return;

    this.feedbackElement.innerHTML = message;
    this.feedbackElement.className = `ai-feedback ${type}`;
  }
}

// === Modal Management ===
class ModalManager {
  constructor() {
    this.currentModal = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeModal();
      }
    });

    // Close modal with ESC key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.currentModal) {
        this.closeModal();
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "block";
      this.currentModal = modal;
      document.body.style.overflow = "hidden"; // Prevent scrolling
    }
  }

  closeModal() {
    if (this.currentModal) {
      this.currentModal.style.display = "none";
      document.body.style.overflow = "auto"; // Restore scrolling

      // Stop AI analysis if modal is closing
      if (aiAnalysis && aiAnalysis.isAnalyzing) {
        aiAnalysis.stopAnalysis();
      }

      this.currentModal = null;
    }
  }
}

// === Notification System ===
class NotificationSystem {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    const container = document.createElement("div");
    container.id = "notification-container";
    container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
    document.body.appendChild(container);
    return container;
  }

  show(message, type = "info", duration = 3000) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            padding: 1rem 1.5rem;
            margin-bottom: 10px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            pointer-events: auto;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

    // Set background color based on type
    const colors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };
    notification.style.background = colors[type] || colors.info;

    this.container.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOutRight 0.3s ease-in";
        setTimeout(() => {
          if (notification.parentNode) {
            this.container.removeChild(notification);
          }
        }, 300);
      }
    }, duration);
  }
}

// === Form Management ===
class FormManager {
  constructor() {
    this.initializeForms();
  }

  initializeForms() {
    // Contact form
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => this.handleContactForm(e));
    }
  }

  handleContactForm(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // Validate form
    if (!data.name || !data.email || !data.message) {
      notificationSystem.show("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
      return;
    }

    // Simulate form submission
    notificationSystem.show("กำลังส่งข้อความ...", "info");

    setTimeout(() => {
      notificationSystem.show("ส่งข้อความเรียบร้อยแล้ว ขอบคุณครับ!", "success");
      e.target.reset();
    }, 1000);
  }
}

// === Smooth Scrolling ===
class SmoothScroll {
  constructor() {
    this.initializeScrolling();
  }

  initializeScrolling() {
    // Add smooth scrolling to navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const headerHeight = document.querySelector("header").offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }
}

// === Global Functions ===

// Language toggle function
function toggleLanguage() {
  const menu = document.getElementById("languageMenu");
  menu.classList.toggle("show");

  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!e.target.closest(".language-dropdown")) {
        menu.classList.remove("show");
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 0);
}

// Technique modal functions
function openTechniqueModal(techniqueId, techniqueName) {
  currentTechnique = techniqueId;

  // Update modal title
  document.getElementById("modalTitle").textContent = techniqueName;

  // Load technique data
  loadTechniqueContent(techniqueId, currentPosition);

  // Open modal
  modalManager.openModal("techniqueModal");

  // Initialize AI if not already done
  if (!aiAnalysis.isInitialized) {
    aiAnalysis.initialize();
  }
}

function closeTechniqueModal() {
  modalManager.closeModal();
  currentTechnique = null;
}

function switchPosition(position) {
  currentPosition = position;

  // Update position buttons
  document.querySelectorAll(".position-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.pos === position) {
      btn.classList.add("active");
    }
  });

  // Load content for new position
  if (currentTechnique) {
    loadTechniqueContent(currentTechnique, position);
  }
}

function loadTechniqueContent(techniqueId, position) {
  const data = techniqueManager.getTechniqueData(techniqueId, position);

  if (!data) {
    document.getElementById("techniqueDetails").innerHTML =
      "<p>ไม่พบข้อมูลสำหรับท่านี้</p>";
    return;
  }

  // Update content
  document.getElementById("techniqueDescription").textContent =
    data.description || "ไม่มีคำอธิบาย";

  // Update key points
  const keyPointsList = document.getElementById("keyPoints");
  keyPointsList.innerHTML = "";
  if (data.keyPoints && data.keyPoints.length > 0) {
    data.keyPoints.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      keyPointsList.appendChild(li);
    });
  }

  // Update common mistakes
  const mistakesList = document.getElementById("commonMistakes");
  mistakesList.innerHTML = "";
  if (data.commonMistakes && data.commonMistakes.length > 0) {
    data.commonMistakes.forEach((mistake) => {
      const li = document.createElement("li");
      li.textContent = mistake;
      mistakesList.appendChild(li);
    });
  }

  // Update breathing technique
  document.getElementById("breathingTechnique").textContent =
    data.breathingTechnique || "ไม่มีข้อมูล";

  // Update practice tips
  document.getElementById("practiceTips").innerHTML = `<p>${
    data.tips || "ไม่มีเคล็ดลับเพิ่มเติม"
  }</p>`;
}

// AI Analysis functions
function startAIAnalysis() {
  if (aiAnalysis) {
    aiAnalysis.startAnalysis();
  }
}

function stopAIAnalysis() {
  if (aiAnalysis) {
    aiAnalysis.stopAnalysis();
  }
}

// === Initialize Application ===
let languageManager,
  techniqueManager,
  modalManager,
  aiAnalysis,
  notificationSystem,
  formManager,
  smoothScroll;

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all systems
  languageManager = new LanguageManager();
  techniqueManager = new TechniqueManager();
  modalManager = new ModalManager();
  aiAnalysis = new AIMotionAnalysis();
  notificationSystem = new NotificationSystem();
  formManager = new FormManager();
  smoothScroll = new SmoothScroll();

  // Setup language dropdown
  document.querySelectorAll(".language-option").forEach((option) => {
    option.addEventListener("click", function () {
      const lang = this.dataset.lang;
      languageManager.switchLanguage(lang);
      document.getElementById("languageMenu").classList.remove("show");
    });
  });

  // Add loading animation
  const loadingAnimation = document.createElement("div");
  loadingAnimation.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center;" id="loadingScreen">
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 3px solid #dc2626; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: #dc2626; font-size: 1.2rem;">กำลังโหลด...</p>
            </div>
        </div>
    `;
  document.body.appendChild(loadingAnimation);

  // Remove loading screen after initialization
  setTimeout(() => {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        if (loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, 300);
    }
  }, 1500);

  console.log("Taijiquan Academy System Initialized");
  console.log("Available systems:", {
    languageManager: !!languageManager,
    techniqueManager: !!techniqueManager,
    modalManager: !!modalManager,
    aiAnalysis: !!aiAnalysis,
    notificationSystem: !!notificationSystem,
  });
});

// Add custom CSS animations
const customStyles = document.createElement("style");
customStyles.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .ai-feedback.success { background: rgba(16, 185, 129, 0.1) !important; color: #059669 !important; }
    .ai-feedback.error { background: rgba(239, 68, 68, 0.1) !important; color: #dc2626 !important; }
    .ai-feedback.warning { background: rgba(245, 158, 11, 0.1) !important; color: #d97706 !important; }
    .ai-feedback.info { background: rgba(59, 130, 246, 0.1) !important; color: #2563eb !important; }
`;
document.head.appendChild(customStyles);
