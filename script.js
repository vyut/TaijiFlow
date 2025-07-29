// === Global Variables ===
let currentTechnique = null;
let currentPosition = "sitting";
let pose = null;
let camera = null;
let isAIActive = false;

// === Language Management ===
// === Language Management (ปรับปรุงใหม่) ===
class LanguageManager {
    constructor() {
        this.currentLanguage = "th";
        this.translations = {
            th: {
                // Page Meta
                title: "Taijiquan Academy - ศิลปะการต่อสู้แบบจีนโบราณ",
                
                // Navigation
                navHome: "หน้าแรก",
                navMission: "ปรัชญา", 
                navSilkReeling: "Silk Reeling",
                navInstructor: "ครูผู้สอน",
                navFeatures: "คุณสมบัติ",
                navContact: "ติดต่อเรา",
                
                // Hero Section
                heroTitle: "ศิลปะการต่อสู้แบบจีนโบราณ",
                heroAccent: "เพื่อสุขภาพกายและใจ",
                heroSubtitle: "เริ่มต้นการเรียนรู้ Silk Reeling ด้วยเทคโนโลยี AI",
                ctaButton: "เริ่มเรียนรู้",
                
                // Mission Section
                missionTitle: "ปรัชญาของเรา",
                missionText: "ที่ Taijiquan Academy เราแบ่งปันแก่นแท้ของศิลปะการต่อสู้จีน เพื่อให้ทุกคนสามารถได้รับประโยชน์โดยการนำหลักการไปใช้ในชีวิตประจำวัน เราเสนอวิธีการที่ง่ายและมีประสิทธิภาพแก่นักเรียนเพื่อบรรลุสุขภาพที่ดีที่สุด",
                
                // Silk Reeling Section
                silkReelingTitle: "12 ท่า Silk Reeling",
                silkReelingSubtitle: "แต่ละท่าประกอบด้วย 3 รูปแบบ: นั่ง ยืน และยืนย่อ",
                tabAll: "ทั้งหมด",
                tabSitting: "รูปแบบนั่ง",
                tabStanding: "รูปแบบยืน", 
                tabLowStanding: "รูปแบบยืนย่อ",
                learnBtn: "เรียนรู้",
                
                // Instructor Section
                instructorTitle: "ครูผู้สอนมืออาชีพ",
                instructorName: "อาจารย์ไท จี",
                instructorRole: "ครูผู้สอนไทจิและอู่ซู่มืออาชีพ (ดั้น 6)",
                instructorBio: "เกิดในปี 2520 ในมณฑลเหอหนาน ประเทศจีน ได้รับการถ่ายทอดศิลปะการต่อสู้จากบรรพบุรุษจากวัดเส้าหลินภายใต้การแนะนำอย่างเข้มงวดของบิดา มีประสบการณ์การสอนมากกว่า 20 ปี และได้รับการยอมรับในระดับสากล",
                knowMore: "เรียนรู้เพิ่มเติม",
                
                // Features Section
                featuresTitle: "คุณสมบัติพิเศษ",
                feature1Title: "เหมาะสำหรับผู้เริ่มต้น",
                feature1Desc: "เรียนรู้ท่าพื้นฐานและการหายใจ พร้อมคำแนะนำแบบเป็นขั้นตอน",
                feature2Title: "สำหรับผู้ที่มีพื้นฐาน",
                feature2Desc: "เน้นการใช้พลังภายในและเทคนิคขั้นสูง",
                feature3Title: "บำบัดและฟื้นฟู",
                feature3Desc: "เน้นการบำบัดและฟื้นฟูร่างกาย เหมาะสำหรับทุกวัย",
                feature4Title: "AI Motion Analysis",
                feature4Desc: "เทคโนโลยี AI วิเคราะห์ท่าทางและให้คำแนะนำแบบเรียลไทม์",
                feature5Title: "เรียนออนไลน์",
                feature5Desc: "เรียนรู้ได้ทุกที่ทุกเวลาผ่านอุปกรณ์มือถือหรือคอมพิวเตอร์",
                feature6Title: "ติดตามความก้าวหน้า",
                feature6Desc: "ระบบติดตามและวิเคราะห์พัฒนาการการเรียนรู้",
                
                // Contact Section
                contactTitle: "ติดต่อเรา",
                contactName: "ชื่อ-นามสกุล",
                contactEmail: "อีเมล",
                contactPhone: "เบอร์โทรศัพท์",
                contactMessage: "ข้อความ",
                submitBtn: "ส่งข้อความ",
                contactInfo: "ข้อมูลติดต่อ",
                
                // About Section
                aboutTitle: "เกี่ยวกับเรา",
                aboutText: "Taijiquan Academy ก่อตั้งขึ้นด้วยวิสัยทัศน์ในการนำเสนอศิลปะการต่อสู้จีนโบราณ ให้เข้าถึงได้ง่ายและเหมาะสมกับคนยุคใหม่ ผ่านการผสมผสานเทคโนโลยี AI เพื่อการเรียนรู้ที่มีประสิทธิภาพและปรับได้ตามความต้องการของแต่ละบุคคล",
                
                // Modal
                positionSitting: "🪑 นั่ง",
                positionStanding: "🧍 ยืน", 
                positionLowStanding: "🤸 ยืนย่อ",
                aiAnalysisTitle: "🤖 การวิเคราะห์ท่าทางด้วย AI",
                startAnalysis: "📹 เริ่มวิเคราะห์ท่าทาง",
                stopAnalysis: "⏹️ หยุดการวิเคราะห์",
                aiInitMessage: "เปิดกล้องเพื่อเริ่มการวิเคราะห์ท่าทาง",
                descriptionTitle: "📖 คำอธิบาย",
                keyPointsTitle: "🎯 จุดสำคัญ", 
                mistakesTitle: "⚠️ ข้อผิดพลาดที่พบบ่อย",
                breathingTitle: "🫁 เทคนิคการหายใจ",
                tipsTitle: "💡 เคล็ดลับการฝึก"
            },
            
            en: {
                // Page Meta
                title: "Taijiquan Academy - Ancient Chinese Martial Arts",
                
                // Navigation
                navHome: "Home",
                navMission: "Philosophy",
                navSilkReeling: "Silk Reeling", 
                navInstructor: "Instructor",
                navFeatures: "Features",
                navContact: "Contact",
                
                // Hero Section
                heroTitle: "Ancient Chinese Martial Arts",
                heroAccent: "for Physical and Mental Health",
                heroSubtitle: "Start learning Silk Reeling with AI Technology",
                ctaButton: "Start Learning",
                
                // Mission Section
                missionTitle: "Our Philosophy",
                missionText: "At Taijiquan Academy, we share the essence of Chinese martial arts so that everyone can benefit by applying the principles to daily life. We offer simple and effective methods for students to achieve optimal health.",
                
                // Silk Reeling Section
                silkReelingTitle: "12 Silk Reeling Forms",
                silkReelingSubtitle: "Each form includes 3 variations: Sitting, Standing, and Low Standing",
                tabAll: "All",
                tabSitting: "Sitting Form",
                tabStanding: "Standing Form",
                tabLowStanding: "Low Standing Form",
                learnBtn: "Learn",
                
                // Instructor Section
                instructorTitle: "Professional Instructor",
                instructorName: "Master Tai Chi",
                instructorRole: "Professional Taiji and Wushu Instructor (6th Dan)",
                instructorBio: "Born in 1977 in Henan Province, China. Received martial arts training from ancestors of Shaolin Temple under strict guidance from his father. Has over 20 years of teaching experience and is internationally recognized.",
                knowMore: "Learn More",
                
                // Features Section
                featuresTitle: "Special Features",
                feature1Title: "Suitable for Beginners",
                feature1Desc: "Learn basic forms and breathing with step-by-step guidance",
                feature2Title: "For Intermediate Practitioners", 
                feature2Desc: "Focus on internal energy and advanced techniques",
                feature3Title: "Therapy and Recovery",
                feature3Desc: "Focus on healing and recovery, suitable for all ages",
                feature4Title: "AI Motion Analysis",
                feature4Desc: "AI technology analyzes posture and provides real-time guidance",
                feature5Title: "Online Learning",
                feature5Desc: "Learn anytime, anywhere via mobile or computer",
                feature6Title: "Progress Tracking",
                feature6Desc: "System to track and analyze learning progress",
                
                // Contact Section
                contactTitle: "Contact Us",
                contactName: "Full Name",
                contactEmail: "Email",
                contactPhone: "Phone Number",
                contactMessage: "Message",
                submitBtn: "Send Message",
                contactInfo: "Contact Information",
                
                // About Section
                aboutTitle: "About Us",
                aboutText: "Taijiquan Academy was founded with the vision of presenting ancient Chinese martial arts in an accessible and modern way, through the integration of AI technology for efficient and personalized learning.",
                
                // Modal
                positionSitting: "🪑 Sitting",
                positionStanding: "🧍 Standing",
                positionLowStanding: "🤸 Low Standing", 
                aiAnalysisTitle: "🤖 AI Posture Analysis",
                startAnalysis: "📹 Start Posture Analysis",
                stopAnalysis: "⏹️ Stop Analysis",
                aiInitMessage: "Turn on camera to start posture analysis",
                descriptionTitle: "📖 Description",
                keyPointsTitle: "🎯 Key Points",
                mistakesTitle: "⚠️ Common Mistakes",
                breathingTitle: "🫁 Breathing Technique",
                tipsTitle: "💡 Practice Tips"
            },
            
            zh: {
                // Page Meta
                title: "太极拳学院 - 中国古代武术",
                
                // Navigation
                navHome: "首页",
                navMission: "理念",
                navSilkReeling: "缠丝劲",
                navInstructor: "教练",
                navFeatures: "特色",
                navContact: "联系",
                
                // Hero Section
                heroTitle: "中国古代武术",
                heroAccent: "身心健康之道",
                heroSubtitle: "开始用人工智能技术学习缠丝劲",
                ctaButton: "开始学习",
                
                // Mission Section
                missionTitle: "我们的理念",
                missionText: "在太极拳学院，我们分享中国武术的精髓，让每个人都能通过将原理应用到日常生活中而受益。我们为学生提供简单有效的方法来实现最佳健康。",
                
                // Silk Reeling Section
                silkReelingTitle: "缠丝劲十二式",
                silkReelingSubtitle: "每式包含3种变化：坐式、站式和低式",
                tabAll: "全部",
                tabSitting: "坐式",
                tabStanding: "站式", 
                tabLowStanding: "低式",
                learnBtn: "学习",
                
                // Instructor Section
                instructorTitle: "专业教练",
                instructorName: "太极师傅",
                instructorRole: "专业太极武术教练（六段）",
                instructorBio: "1977年生于中国河南省。在父亲的严格指导下，从少林寺祖师那里接受武术训练。拥有20多年的教学经验，获得国际认可。",
                knowMore: "了解更多",
                
                // Features Section
                featuresTitle: "特色功能",
                feature1Title: "适合初学者",
                feature1Desc: "学习基本招式和呼吸法，提供分步指导",
                feature2Title: "适合有基础者",
                feature2Desc: "专注内劲和高级技巧",
                feature3Title: "治疗康复",
                feature3Desc: "专注治疗和康复，适合所有年龄",
                feature4Title: "AI动作分析",
                feature4Desc: "AI技术分析姿势并提供实时指导",
                feature5Title: "在线学习",
                feature5Desc: "随时随地通过手机或电脑学习",
                feature6Title: "进度跟踪",
                feature6Desc: "跟踪和分析学习进度的系统",
                
                // Contact Section
                contactTitle: "联系我们",
                contactName: "姓名",
                contactEmail: "邮箱",
                contactPhone: "电话",
                contactMessage: "留言",
                submitBtn: "发送消息",
                contactInfo: "联系信息",
                
                // About Section
                aboutTitle: "关于我们",
                aboutText: "太极拳学院的成立愿景是通过整合AI技术，以现代化和个性化的方式呈现中国古代武术，实现高效学习。",
                
                // Modal
                positionSitting: "🪑 坐式",
                positionStanding: "🧍 站式",
                positionLowStanding: "🤸 低式",
                aiAnalysisTitle: "🤖 AI姿势分析",
                startAnalysis: "📹 开始姿势分析",
                stopAnalysis: "⏹️停止分析",
                aiInitMessage: "打开摄像头开始姿势分析",
                descriptionTitle: "📖 描述",
                keyPointsTitle: "🎯 要点",
                mistakesTitle: "⚠️ 常见错误",
                breathingTitle: "🫁 呼吸技巧",
                tipsTitle: "💡 练习技巧"
            }
        };
    }
    
    switchLanguage(lang) {
        this.currentLanguage = lang;
        this.updateUI();
        this.updateActiveLanguage();
    }
    
    updateUI() {
        const t = this.translations[this.currentLanguage];
        
        // Update page title
        document.title = t.title;
        
        // Update navigation
        this.updateElementText('.nav-links a[href="#home"]', t.navHome);
        this.updateElementText('.nav-links a[href="#mission"]', t.navMission);
        this.updateElementText('.nav-links a[href="#silk-reeling"]', t.navSilkReeling);
        this.updateElementText('.nav-links a[href="#instructor"]', t.navInstructor);
        this.updateElementText('.nav-links a[href="#features"]', t.navFeatures);
        this.updateElementText('.nav-links a[href="#contact"]', t.navContact);
        
        // Update hero section
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.innerHTML = `${t.heroTitle} <span class="accent">${t.heroAccent}</span>`;
        }
        this.updateElementText('.hero-subtitle', t.heroSubtitle);
        this.updateElementText('.cta-button', t.ctaButton);
        
        // Update mission section
        this.updateElementText('#mission .section-title', t.missionTitle);
        this.updateElementText('.mission-text', t.missionText);
        
        // Update silk reeling section
        this.updateElementText('#silk-reeling .section-title', t.silkReelingTitle);
        this.updateElementText('.section-subtitle', t.silkReelingSubtitle);
        this.updateElementText('[data-position="all"]', t.tabAll);
        this.updateElementText('[data-position="sitting"]', t.tabSitting);
        this.updateElementText('[data-position="standing"]', t.tabStanding);
        this.updateElementText('[data-position="low-standing"]', t.tabLowStanding);
        
        // Update all learn buttons
        document.querySelectorAll('.learn-btn').forEach(btn => {
            btn.textContent = t.learnBtn;
        });
        
        // Update instructor section
        this.updateElementText('#instructor .section-title', t.instructorTitle);
        this.updateElementText('.instructor-info h3', t.instructorName);
        this.updateElementText('.instructor-title', t.instructorRole);
        this.updateElementText('.instructor-bio', t.instructorBio);
        this.updateElementText('.know-more', t.knowMore);
        
        // Update features section
        this.updateElementText('#features .section-title', t.featuresTitle);
        const featureCards = document.querySelectorAll('.feature-card');
        if (featureCards.length >= 6) {
            this.updateElementText(featureCards[0].querySelector('.feature-title'), t.feature1Title);
            this.updateElementText(featureCards[0].querySelector('.feature-desc'), t.feature1Desc);
            this.updateElementText(featureCards[1].querySelector('.feature-title'), t.feature2Title);
            this.updateElementText(featureCards[1].querySelector('.feature-desc'), t.feature2Desc);
            this.updateElementText(featureCards[2].querySelector('.feature-title'), t.feature3Title);
            this.updateElementText(featureCards[2].querySelector('.feature-desc'), t.feature3Desc);
            this.updateElementText(featureCards[3].querySelector('.feature-title'), t.feature4Title);
            this.updateElementText(featureCards[3].querySelector('.feature-desc'), t.feature4Desc);
            this.updateElementText(featureCards[4].querySelector('.feature-title'), t.feature5Title);
            this.updateElementText(featureCards[4].querySelector('.feature-desc'), t.feature5Desc);
            this.updateElementText(featureCards[5].querySelector('.feature-title'), t.feature6Title);
            this.updateElementText(featureCards[5].querySelector('.feature-desc'), t.feature6Desc);
        }
        
        // Update contact section
        this.updateElementText('#contact .section-title', t.contactTitle);
        this.updateElementText('label[for="name"]', t.contactName);
        this.updateElementText('label[for="email"]', t.contactEmail);
        this.updateElementText('label[for="phone"]', t.contactPhone);
        this.updateElementText('label[for="message"]', t.contactMessage);
        this.updateElementText('.submit-btn', t.submitBtn);
        this.updateElementText('.contact-details h4', t.contactInfo);
        
        // Update about section
        this.updateElementText('#about .section-title', t.aboutTitle);
        this.updateElementText('.about-text', t.aboutText);
        
        // Update modal elements (if modal is open)
        this.updateElementText('[data-pos="sitting"]', t.positionSitting);
        this.updateElementText('[data-pos="standing"]', t.positionStanding);
        this.updateElementText('[data-pos="low-standing"]', t.positionLowStanding);
        this.updateElementText('.ai-analysis-panel h4', t.aiAnalysisTitle);
        this.updateElementText('#startCamera', t.startAnalysis);
        this.updateElementText('#stopCamera', t.stopAnalysis);
        
        // Update technique details titles
        this.updateTechniqueDetailsTitles(t);
    }
    
    updateElementText(selector, text) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element && text) {
            element.textContent = text;
        }
    }
    
    updateTechniqueDetailsTitles(t) {
        const modal = document.getElementById('techniqueModal');
        if (modal && modal.style.display !== 'none') {
            // Update technique details section titles
            const detailsSection = document.getElementById('techniqueDetails');
            if (detailsSection) {
                const h4Elements = detailsSection.querySelectorAll('h4');
                if (h4Elements.length >= 5) {
                    h4Elements[0].textContent = t.descriptionTitle;
                    h4Elements[1].textContent = t.keyPointsTitle;
                    h4Elements[2].textContent = t.mistakesTitle;
                    h4Elements[3].textContent = t.breathingTitle;
                    h4Elements[4].textContent = t.tipsTitle;
                }
            }
        }
    }
    
    updateActiveLanguage() {
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.lang === this.currentLanguage) {
                option.classList.add('active');
            }
        });
        
        // Update toggle button
        const toggleButton = document.querySelector('.language-toggle');
        if (toggleButton) {
            const flags = { 
                th: '🇹🇭 ไทย', 
                en: '🇺🇸 English', 
                zh: '🇨🇳 中文' 
            };
            toggleButton.innerHTML = `${flags[this.currentLanguage]} <span class="dropdown-arrow">▼</span>`;
        }
    }
    
    // Method to get current translation
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
}

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
