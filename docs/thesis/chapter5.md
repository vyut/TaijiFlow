# บทที่ 5: การพัฒนาระบบ (System Implementation)

---

## 5.1 Tools and Technologies

ในการพัฒนาระบบ TaijiFlow AI ได้เลือกใช้เครื่องมือและเทคโนโลยีที่เหมาะสมกับลักษณะของแอปพลิเคชันที่เน้นการทำงานบน Web Browser โดยไม่ต้องการ Backend Server ทำให้สามารถใช้งานได้แบบ Offline หลังจากโหลด AI Model ครั้งแรก

### 5.1.1 Programming Languages

ระบบ TaijiFlow AI พัฒนาด้วยภาษาที่เป็นมาตรฐานของ Web Technologies ประกอบด้วย:

| Language | Version | Purpose | รายละเอียด |
|----------|:-------:|---------|-----------|
| **HTML5** | 5 | Page Structure | โครงสร้างหน้าเว็บ, Semantic Elements, Canvas Element |
| **CSS3** | 3 | Styling | การจัดรูปแบบ, Responsive Design, CSS Variables |
| **JavaScript** | ES6+ | Core Logic | ตรรกะหลักของระบบ, Object-Oriented Programming |

**เหตุผลในการเลือกใช้:**

1. **HTML5** - รองรับ `<canvas>` element ที่ใช้สำหรับวาด Skeleton และ Animation, รองรับ `<video>` สำหรับแสดงวิดีโอจาก Webcam และวิดีโอต้นแบบ
2. **CSS3** - รองรับ CSS Variables สำหรับ Theme System (Dark/Light Mode), Flexbox และ Grid Layout สำหรับ Responsive Design
3. **JavaScript ES6+** - รองรับ Class syntax สำหรับโครงสร้าง Object-Oriented, Async/Await สำหรับการทำงานแบบ Asynchronous, ES Modules สำหรับการจัดการ Dependencies

### 5.1.2 AI and Machine Learning Libraries

ระบบใช้ AI Libraries จาก Google สำหรับการตรวจจับท่าทางและการโต้ตอบกับผู้ใช้:

| Library | Version | CDN Source | Purpose |
|---------|:-------:|------------|---------|
| **MediaPipe Pose** | @latest | cdn.jsdelivr.net | ตรวจจับท่าทางร่างกาย 33 จุด (Landmarks) |
| **MediaPipe Tasks Vision** | @0.10.8 | cdn.jsdelivr.net | ตรวจจับท่าทางมือ (Gesture Recognition) |
| **MediaPipe Camera Utils** | @latest | cdn.jsdelivr.net | จัดการ Video Stream จาก Webcam |
| **MediaPipe Drawing Utils** | @latest | cdn.jsdelivr.net | วาด Skeleton บน Canvas |
| **Gemini API** | - | Google AI | AI Chatbot สำหรับตอบคำถาม |

**MediaPipe Pose Landmarks:**

ระบบ MediaPipe Pose ตรวจจับจุดสำคัญบนร่างกาย 33 จุด ซึ่งแต่ละจุดประกอบด้วยข้อมูล:
- `x`: ตำแหน่งแนวนอน (0.0 - 1.0, normalized)
- `y`: ตำแหน่งแนวตั้ง (0.0 - 1.0, normalized)
- `z`: ความลึก (ค่าลบ = ใกล้กล้อง)
- `visibility`: ความน่าเชื่อถือของการตรวจจับ (0.0 - 1.0)

จุดสำคัญที่ใช้ในการวิเคราะห์ท่ามวยไทเก๊ก:

| Index | Landmark | การใช้งานใน TaijiFlow |
|:-----:|----------|----------------------|
| 0 | Nose | ตรวจสอบตำแหน่งศีรษะ |
| 11-12 | Shoulders | คำนวณความกว้างไหล่, ตรวจสอบการยกไหล่ |
| 13-14 | Elbows | วิเคราะห์มุมข้อศอก |
| 15-16 | Wrists | ติดตามเส้นทางการเคลื่อนไหวมือ |
| 23-24 | Hips | ตรวจสอบการหมุนสะโพก |

**MediaPipe Gesture Recognition:**

ใช้สำหรับระบบ Hands-Free Control ที่ผู้ใช้สามารถควบคุมการฝึกด้วยท่าทางมือ:
- 👍 Thumbs Up: เริ่มต้น/หยุดการฝึก
- ✊ Closed Fist: หยุดชั่วคราว (Pause)

### 5.1.3 Browser APIs

ระบบใช้ประโยชน์จาก APIs ที่มีในเว็บเบราว์เซอร์สมัยใหม่:

| API | Purpose | Fallback |
|-----|---------|----------|
| **Canvas API** | วาด Skeleton, Path Trail, Ghost Overlay | - (Required) |
| **Web Speech API** | เสียงเตือนแบบ Text-to-Speech | ปิดการใช้งานเสียง |
| **LocalStorage API** | บันทึก Settings, Calibration Data | Memory (หายเมื่อ Refresh) |
| **Fullscreen API** | โหมดเต็มจอสำหรับการฝึก | ใช้งานแบบปกติ |
| **getUserMedia** | เข้าถึง Webcam | - (Required) |
| **Fetch API** | ส่ง Bug Report, โหลด Reference Data | - |

**Canvas API Usage:**

Canvas API เป็นหัวใจสำคัญของการแสดงผลในระบบ โดยใช้สำหรับ:

1. **Skeleton Drawing** - วาดโครงกระดูกของผู้ฝึกแบบ Real-time
2. **Path Trail** - วาดเส้นทางการเคลื่อนไหวของมือ
3. **Ghost Overlay** - แสดงเงาของท่าต้นแบบทับบนภาพผู้ฝึก
4. **Violation Highlight** - เน้นจุดที่มีข้อผิดพลาดด้วยสีแดง

```javascript
// ตัวอย่างการใช้ Canvas API ใน drawing_manager.js
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');

// วาด Connection ระหว่าง Landmarks
ctx.beginPath();
ctx.moveTo(startX, startY);
ctx.lineTo(endX, endY);
ctx.strokeStyle = isViolation ? '#FF0000' : '#00FF00';
ctx.lineWidth = 3;
ctx.stroke();
```

### 5.1.4 CSS Frameworks

| Framework | Version | Purpose |
|-----------|:-------:|---------|
| **TailwindCSS** | 3.x (CDN) | Utility-first CSS Framework |
| **Google Fonts** | - | Sarabun Font สำหรับภาษาไทย |

TailwindCSS ถูกใช้เฉพาะบางส่วนสำหรับ Utility Classes ในขณะที่ส่วนใหญ่ของ Styling ใช้ Custom CSS เพื่อควบคุม Design System ได้อย่างเต็มที่

### 5.1.5 Development Tools

เครื่องมือที่ใช้ในการพัฒนาและทดสอบระบบ:

| Tool | Purpose | รายละเอียด |
|------|---------|-----------|
| **Visual Studio Code** | IDE | โปรแกรมเขียนโค้ดหลัก |
| **Chrome DevTools** | Debugging | ตรวจสอบ Performance, Debug JavaScript |
| **Git** | Version Control | จัดการเวอร์ชันของโค้ด |
| **GitHub** | Repository | เก็บ Source Code และ Collaboration |
| **PlantUML** | Documentation | สร้าง UML Diagrams |
| **Jest** | Unit Testing | ทดสอบ Functions |

---

## 5.2 System Architecture

### 5.2.1 Architecture Overview

TaijiFlow AI ใช้สถาปัตยกรรมแบบ **Client-Side Only** โดยไม่ต้องการ Backend Server ทำให้:
- ลดค่าใช้จ่ายในการ Deploy และดูแลรักษาระบบ
- ทำงานได้แบบ Offline หลังจากโหลด AI Model ครั้งแรก
- ข้อมูลผู้ใช้ไม่ถูกส่งออกไปภายนอก (Privacy-focused)

ระบบใช้สถาปัตยกรรมแบบ **4-Layer Architecture** ประกอบด้วย:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  (HTML, CSS, Canvas, UI Managers)                               │
├─────────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                         │
│  (Heuristics Engine, Calibration, Scoring, Gesture)             │
├─────────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                   │
│  (LocalStorage, Session Manager, Reference Data)                │
├─────────────────────────────────────────────────────────────────┤
│                    EXTERNAL APIs                                │
│  (MediaPipe Pose, MediaPipe Gesture, Gemini API, Web Speech)    │
└─────────────────────────────────────────────────────────────────┘
```

**Layer 1: Presentation Layer (การแสดงผล)**

รับผิดชอบการแสดงผล UI และการรับ Input จากผู้ใช้:
- `index.html` - Landing Page
- `app.html` - Training Application
- `ui_manager.js` - จัดการ Theme, Notifications
- `drawing_manager.js` - วาด Skeleton, Path Trail
- `score_popup_manager.js` - แสดงผลคะแนน

**Layer 2: Business Logic Layer (ตรรกะหลัก)**

ประมวลผลหลักของระบบ:
- `heuristics_engine.js` - วิเคราะห์ท่าด้วย 9 กฎ
- `calibration_manager.js` - ปรับเทียบท่า T-Pose
- `scoring_manager.js` - คำนวณคะแนน
- `gesture_manager.js` - ตรวจจับท่าทางมือ

**Layer 3: Data Layer (จัดการข้อมูล)**

จัดการข้อมูลทั้งในหน่วยความจำและ Persistent Storage:
- `session_manager.js` - จัดการ Session และ User ID
- `data_exporter.js` - Export ข้อมูลเป็น JSON/CSV
- `translations.js` - ข้อมูลภาษา (i18n)
- LocalStorage - บันทึก Settings และ Calibration

**Layer 4: External APIs (บริการภายนอก)**

เชื่อมต่อกับ APIs ภายนอก:
- MediaPipe Pose - ตรวจจับท่าทาง
- MediaPipe Gesture - ตรวจจับมือ
- Gemini API - AI Chatbot
- Web Speech API - Text-to-Speech

### 5.2.2 Module Structure

ระบบประกอบด้วย 22 JavaScript Modules แบ่งตามหน้าที่:

| Category | Modules | Total Size | หน้าที่ |
|----------|:-------:|:----------:|--------|
| Core Managers | 3 | ~77 KB | วิเคราะห์ท่า, Calibration, คะแนน |
| Display Managers | 3 | ~36 KB | วาด Skeleton, Ghost, Silhouette |
| UI Managers | 8 | ~223 KB | จัดการ UI ต่างๆ (Audio, Tutorial) |
| Controllers | 2 | ~17 KB | Keyboard, Display Options |
| Utilities | 4 | ~41 KB | Export, Translation, Path |
| Main Controller | 1 | ~72 KB | ประสานงานทุก Module |
| **Total** | **22** | **~473 KB** | - |

**Module Dependency Diagram:**

![Module Dependencies](../diagrams/ModuleDependencies.wsd)

*หมายเหตุ: ดู Diagram จริงที่ `/docs/diagrams/ModuleDependencies.wsd`*

### 5.2.3 File Structure

```text
TaijiFlow/
├── 📄 index.html                    # Landing Page (Entry Point)
├── 📄 app.html                      # Training Application (Main App)
│
├── 📁 css/                          # Stylesheets (5 files)
│   ├── base.css                     # Shared Styles (Variables, Reset)
│   ├── styles.css                   # App Styles
│   ├── landing.css                  # Landing Page Styles
│   ├── chatbot.css                  # Chatbot Popup Styles
│   └── feedback.css                 # Feedback Modal Styles
│
├── 📁 js/                           # JavaScript Modules (22 files)
│   ├── script.js                    # Main Controller (~72KB)
│   ├── heuristics_engine.js         # วิเคราะห์ท่า 9 กฎ (~51KB)
│   ├── calibration_manager.js       # ปรับเทียบ T-Pose (~15KB)
│   ├── scoring_manager.js           # คำนวณคะแนน (~11KB)
│   ├── drawing_manager.js           # วาด Skeleton (~25KB)
│   ├── ui_manager.js                # Theme, Notifications (~41KB)
│   └── ...                          # Modules อื่นๆ
│
├── 📁 data/                         # Reference Data
│   ├── rh_cw_L1.json                # Ghost landmarks
│   ├── rh_cw_L1.webm                # Video ต้นแบบ
│   └── ...
│
└── 📁 docs/                         # Documentation
    ├── diagrams/                    # UML Diagrams (17 files)
    └── ...
```

### 5.2.4 Design Patterns

ระบบใช้ Design Patterns หลายรูปแบบเพื่อให้โค้ดมีโครงสร้างที่ดีและบำรุงรักษาง่าย:

| Pattern | Module | Purpose |
|---------|--------|---------|
| **Module Pattern** | ทุก Manager classes | Encapsulation - แยก scope ของแต่ละ module |
| **Singleton** | `ghostManager`, `uiManager` | Single Instance - ป้องกันการสร้างซ้ำ |
| **Observer** | Event Listeners | Reactive UI - อัปเดตเมื่อ state เปลี่ยน |
| **Facade** | `script.js` | Simplify Access - รวม dependencies ไว้ที่เดียว |
| **Strategy** | `HeuristicsEngine` rules | Swappable Algorithms - เปิด/ปิดกฎได้ |

**ตัวอย่าง Singleton Pattern:**

```javascript
// สร้าง instance เพียงครั้งเดียวใน script.js
const ghostManager = new GhostManager();
window.ghostManager = ghostManager;  // เข้าถึงได้ทั่วทั้ง Application

// ใน module อื่นๆ สามารถเรียกใช้ได้โดยตรง
ghostManager.loadGhost(exerciseId);
```

**ตัวอย่าง Observer Pattern:**

```javascript
// ลงทะเบียน Event Listener
document.addEventListener('languageChange', () => {
    uiManager.updateAllTexts();      // อัปเดต UI เมื่อเปลี่ยนภาษา
    audioManager.setLanguage(lang);  // เปลี่ยนภาษาเสียงพูด
});

// กระจาย Event เมื่อเปลี่ยนภาษา
document.dispatchEvent(new CustomEvent('languageChange', { 
    detail: { lang: 'en' } 
}));
```

**ตัวอย่าง Strategy Pattern:**

```javascript
// กำหนดกลยุทธ์การตรวจสอบตามระดับความยาก
this.RULES_CONFIG = {
    L1: { checkPath: true, checkWaist: false },   // ง่าย
    L2: { checkPath: true, checkWaist: true },    // ปานกลาง
    L3: { checkPath: true, checkWaist: true, checkBreath: true }  // ยาก
};
```

---

## 5.3 Core Features Development

### 5.3.1 Pose Detection Module

**ไฟล์:** `app.html` (MediaPipe Integration)

ระบบใช้ MediaPipe Pose สำหรับตรวจจับท่าทางร่างกายแบบ Real-time โดยทำงานที่ความเร็วประมาณ 30 FPS

**กระบวนการทำงาน:**

1. รับ Video Frame จาก Webcam
2. ส่งไปยัง MediaPipe Pose Model
3. รับ 33 Landmarks กลับมา
4. ส่งต่อไป Heuristics Engine สำหรับวิเคราะห์

```javascript
// การตั้งค่า MediaPipe Pose
const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});

pose.setOptions({
    modelComplexity: 1,              // 0=Light, 1=Full, 2=Heavy
    smoothLandmarks: true,           // ลด jitter
    enableSegmentation: false,       // ไม่ต้องการ segmentation
    minDetectionConfidence: 0.5,     // threshold การตรวจจับ
    minTrackingConfidence: 0.5       // threshold การติดตาม
});

pose.onResults(onPoseResults);       // Callback เมื่อได้ผลลัพธ์
```

**Callback Function:**

```javascript
function onPoseResults(results) {
    if (!results.poseLandmarks) return;
    
    const landmarks = results.poseLandmarks;
    
    // 1. วาด Skeleton บน Canvas
    drawingManager.drawSkeleton(landmarks);
    
    // 2. วิเคราะห์ท่าด้วย Heuristics Engine
    const feedbacks = heuristicsEngine.analyze(
        landmarks, 
        calibrationData, 
        ghostLandmarks
    );
    
    // 3. แสดง Feedback
    feedbackManager.displayFeedbacks(feedbacks);
    
    // 4. เล่นเสียงเตือน (ถ้ามี Error)
    if (feedbacks.some(f => f.type === 'error')) {
        audioManager.speak(feedbacks[0].message);
    }
}
```

### 5.3.2 Heuristics Engine

**ไฟล์:** `js/heuristics_engine.js` (~51 KB)

Heuristics Engine เป็นหัวใจสำคัญของการวิเคราะห์ท่ามวยไทเก๊ก ประกอบด้วย 9 กฎหลัก:

| Rule | ชื่อ | หลักการ | เกณฑ์ |
|:----:|------|---------|------|
| R-01 | Path Accuracy | ความแม่นยำเส้นทาง | มือห่างจาก Ghost ≤ 15% |
| R-02 | Elbow Position | ข้อศอกจมลง | ศอกต่ำกว่าไหล่ |
| R-03 | Shoulder Relaxed | ไหล่ผ่อนคลาย | ไหล่ไม่ยกสูงผิดปกติ |
| R-04 | Center Axis Stable | แกนกลางมั่นคง | หัว-สะโพกอยู่แนวเดียว |
| R-05 | Head Position | ศีรษะตั้งตรง | ศีรษะไม่เอียง |
| R-06 | Waist Rotation | การหมุนเอว | สะโพกหมุนไปทิศทางถูก |
| R-07 | Movement Speed | ความเร็วสม่ำเสมอ | ความเร็วไม่เกิน threshold |
| R-08 | Continuous Motion | ความต่อเนื่อง | ไม่หยุดกลางคัน |
| R-09 | Coordination | ความสัมพันธ์ | มือและเท้าสัมพันธ์กัน |

**โครงสร้าง Class:**

```javascript
class HeuristicsEngine {
    constructor() {
        // ค่า Config สำหรับแต่ละกฎ
        this.CONFIG = {
            pathAccuracyThreshold: 0.15,     // R-01: 15% of shoulder width
            elbowDropThreshold: 0.05,        // R-02: 5% below shoulder
            shoulderRaiseThreshold: 1.15,    // R-03: 15% above normal
            axisTiltThreshold: 0.05,         // R-04: 5% tilt
            headTiltThreshold: 0.08,         // R-05: 8% tilt
            // ...
        };
        
        // สถานะการเปิด/ปิดกฎ
        this.rulesEnabled = {
            'R-01': true,
            'R-02': true,
            // ...
        };
    }
    
    /**
     * วิเคราะห์ท่าทางและคืน Feedbacks
     * @param {Array} landmarks - 33 landmarks จาก MediaPipe
     * @param {Object} calibration - ข้อมูล Calibration จาก T-Pose
     * @param {Array} ghostLandmarks - Landmarks ของท่าต้นแบบ
     * @returns {Array} feedbacks - รายการ feedback
     */
    analyze(landmarks, calibration, ghostLandmarks) {
        const feedbacks = [];
        
        if (this.rulesEnabled['R-01']) {
            feedbacks.push(...this.checkPathAccuracy(landmarks, ghostLandmarks));
        }
        if (this.rulesEnabled['R-02']) {
            feedbacks.push(...this.checkElbowPosition(landmarks, calibration));
        }
        // ... ตรวจสอบกฎอื่นๆ
        
        return feedbacks;
    }
}
```

**ตัวอย่างการตรวจสอบกฎ R-01 (Path Accuracy):**

```javascript
/**
 * R-01: ตรวจสอบความแม่นยำของเส้นทางมือ
 * เปรียบเทียบตำแหน่งมือปัจจุบันกับท่าต้นแบบ
 */
checkPathAccuracy(landmarks, ghostLandmarks) {
    const feedbacks = [];
    
    // ดึงตำแหน่งข้อมือ (Index 15 = ขวา, 16 = ซ้าย)
    const rightWrist = landmarks[15];
    const ghostRightWrist = ghostLandmarks[15];
    
    // คำนวณระยะห่าง (Euclidean Distance)
    const distance = Math.sqrt(
        Math.pow(rightWrist.x - ghostRightWrist.x, 2) +
        Math.pow(rightWrist.y - ghostRightWrist.y, 2)
    );
    
    // เปรียบเทียบกับ Threshold (Normalized by shoulder width)
    const normalizedDistance = distance / this.calibration.shoulderWidth;
    
    if (normalizedDistance > this.CONFIG.pathAccuracyThreshold) {
        feedbacks.push({
            rule: 'R-01',
            type: 'error',
            severity: this.calculateSeverity(normalizedDistance),
            message: 'มือเบี่ยงออกจากเส้นทาง',
            messageEn: 'Hand deviating from path',
            landmark: 15,  // สำหรับ highlight
            value: normalizedDistance
        });
    }
    
    return feedbacks;
}
```

### 5.3.3 Calibration System

**ไฟล์:** `js/calibration_manager.js` (~15 KB)

ระบบ Calibration ใช้ท่า T-Pose เพื่อวัดสัดส่วนร่างกายของผู้ฝึกแต่ละคน ทำให้การวิเคราะห์แม่นยำขึ้นโดยไม่ขึ้นกับขนาดตัวหรือระยะห่างจากกล้อง

**ข้อมูลที่เก็บจาก Calibration:**

| Data | วิธีคำนวณ | การใช้งาน |
|------|----------|----------|
| `shoulderWidth` | ระยะห่างระหว่างไหล่ซ้าย-ขวา | Normalize ระยะทาง |
| `armLength` | ความยาวแขน (ไหล่-ข้อมือ) | ตรวจสอบการเหยียดแขน |
| `torsoHeight` | ความสูงลำตัว (ไหล่-สะโพก) | ตรวจสอบการก้ม |
| `shoulderY` | ความสูงไหล่เริ่มต้น | ตรวจสอบการยกไหล่ |

```javascript
class CalibrationManager {
    constructor() {
        this.calibrationData = null;
        this.isCalibrating = false;
        this.framesCollected = [];
    }
    
    /**
     * เริ่มกระบวนการ Calibration
     * เก็บข้อมูล 30 frames แล้วคำนวณค่าเฉลี่ย
     */
    async startCalibration() {
        this.isCalibrating = true;
        this.framesCollected = [];
        
        // รอเก็บ 30 frames (ประมาณ 1 วินาที)
        await this.collectFrames(30);
        
        // คำนวณค่าเฉลี่ย
        this.calibrationData = this.calculateAverages();
        
        // บันทึกลง LocalStorage
        this.saveToLocalStorage();
        
        this.isCalibrating = false;
        return this.calibrationData;
    }
    
    /**
     * คำนวณความกว้างไหล่
     */
    calculateShoulderWidth(landmarks) {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        
        return Math.sqrt(
            Math.pow(rightShoulder.x - leftShoulder.x, 2) +
            Math.pow(rightShoulder.y - leftShoulder.y, 2)
        );
    }
}
```

### 5.3.4 Scoring System

**ไฟล์:** `js/scoring_manager.js` (~11 KB)

ระบบคำนวณคะแนนจาก Feedbacks ที่ได้ตลอดการฝึก โดยแปลงเป็นเกรด A-F

**สูตรการคำนวณคะแนน:**

```
คะแนนรวม = 100 - (ผลรวมของ Penalty จาก Violations)

โดย Penalty แต่ละครั้ง = Base Penalty × Severity Multiplier
- Error: Base = 5 points
- Warning: Base = 2 points
- Info: Base = 0 points

Severity Multiplier:
- Severity 1 (Minor): 1.0×
- Severity 2 (Moderate): 1.5×
- Severity 3 (Severe): 2.0×
```

**เกณฑ์การให้เกรด:**

| เกรด | คะแนน | ความหมาย |
|:----:|:-----:|----------|
| A | 90-100 | ยอดเยี่ยม |
| B | 80-89 | ดี |
| C | 70-79 | พอใช้ |
| D | 60-69 | ต้องปรับปรุง |
| F | 0-59 | ไม่ผ่าน |

```javascript
class ScoringManager {
    calculateScore(feedbacks, duration) {
        let totalPenalty = 0;
        const ruleViolations = {};
        
        for (const feedback of feedbacks) {
            if (feedback.type === 'error') {
                const penalty = 5 * this.getSeverityMultiplier(feedback.severity);
                totalPenalty += penalty;
                
                // นับจำนวนครั้งที่ละเมิดแต่ละกฎ
                ruleViolations[feedback.rule] = 
                    (ruleViolations[feedback.rule] || 0) + 1;
            }
        }
        
        const score = Math.max(0, 100 - totalPenalty);
        const grade = this.scoreToGrade(score);
        
        return {
            overallScore: score,
            grade: grade,
            ruleScores: this.calculateRuleScores(feedbacks),
            topErrors: this.getTopErrors(ruleViolations),
            duration: duration
        };
    }
    
    scoreToGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }
}
```

### 5.3.5 AI Chatbot Integration

**ไฟล์:** `js/chatbot.js` (~26 KB)

ระบบ Chatbot ใช้ Gemini API สำหรับตอบคำถามเกี่ยวกับมวยไทเก๊กและการใช้งานระบบ

**คุณสมบัติ:**
- รองรับภาษาไทยและอังกฤษ
- มี System Prompt ที่ให้ความรู้เกี่ยวกับมวยไทเก๊ก
- จำบริบทการสนทนาได้ (Conversation History)

```javascript
class TaijiChatbot {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.conversationHistory = [];
        this.systemPrompt = `
            คุณเป็นผู้เชี่ยวชาญด้านมวยไทเก๊ก (Taijiquan / Taijiquan)
            มีความรู้เกี่ยวกับ:
            - หลักการพื้นฐานของไทเก๊ก
            - ท่าม้วนไหม (Silk Reeling / Chan Si Gong)
            - การฝึกซ้อมและเทคนิคต่างๆ
            - ระบบ TaijiFlow AI
            
            ตอบคำถามอย่างเป็นมิตรและให้ข้อมูลที่ถูกต้อง
        `;
    }
    
    async sendMessage(userMessage) {
        // เพิ่มข้อความผู้ใช้ใน History
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });
        
        // เรียก Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: this.formatContents(),
                    systemInstruction: { parts: [{ text: this.systemPrompt }] }
                })
            }
        );
        
        const data = await response.json();
        const botReply = data.candidates[0].content.parts[0].text;
        
        // เพิ่มคำตอบใน History
        this.conversationHistory.push({
            role: 'model',
            content: botReply
        });
        
        return botReply;
    }
}
```

---

### 5.3.6 Environmental Checks & Low Light Detection

เพื่อให้การตรวจจับท่าทางทำงานได้แม่นยำ ระบบได้เพิ่มกลไกตรวจสอบสภาพแสงและสภาพแวดล้อม:

**1. Visibility-based Detection (Confidence Check):**
ระบบตรวจสอบค่า `visibility` (ความน่าเชื่อถือ) ของ Key Landmarks 8 จุดสำคัญ (ไหล่, ศอก, ข้อมือ, สะโพก ทั้งซ้ายและขวา) ที่ได้จาก MediaPipe Pose:

```javascript
// script.js logic
const avgVisibility = visibilitySum / keyIndices.length;
const LOW_LIGHT_THRESHOLD = 0.65; // ปรับค่าตามการทดสอบจริง

if (avgVisibility < LOW_LIGHT_THRESHOLD) {
    // แจ้งเตือนแสงไม่พอ
}
```

หากค่าเฉลี่ยต่ำกว่าเกณฑ์ แสดงว่า AI ขาดข้อมูลเนื่องจากภาพมืด, เบลอ, หรือย้อนแสง

**2. Startup Delay (Smart Check):**
เพื่อป้องกัน False Positive ในช่วงแรกที่กล้องกำลังปรับแสง (Auto-exposure) หรือผู้ใช้กำลังเดินเข้าประจำที่ ระบบจึงมี **Startup Delay 3-5 วินาที**:
- **0-3 วินาที:** ไม่แสดงคำเตือน (Grace Period)
- **>3 วินาที:** เริ่มตรวจสอบและแจ้งเตือนถ้าค่า Visibility ต่ำต่อเนื่อง

**3. Periodic Monitoring:**
หลังจากผ่านช่วง Calibration แล้ว ระบบจะยังคงแอบตรวจสอบคุณภาพการจับภาพเป็นระยะ (Periodic Check) ทุกๆ 5 วินาที เพื่อเตือนผู้ใช้หากสภาวะแสงเปลี่ยนไปจนเป็นอุปสรรคต่อการวิเคราะห์คะแนน

---

### 5.3.7 Audio Feedback System

ระบบเสียงตอบกลับ (Audio Feedback) ถูกออกแบบมาเพื่อให้ผู้ใช้สามารถฝึกได้โดยไม่ต้องมองหน้าจอตลอดเวลา (Blind Training Support) มีการปรับปรุงสำคัญในเวอร์ชัน 0.9.1 ดังนี้:

**1. Smart Audio Queueing (ระบบคิวเสียงอัจฉริยะ):**
- **ปัญหา:** การใช้ `setTimeout` แบบเดิมทำให้เสียงซ้อนกัน (Overlap) เมื่อ Web Speech API ทำงานช้าหรือเร็วต่างกันในแต่ละอุปกรณ์
- **การแก้ไข:** ใช้เมธอด `AudioManager.waitForIdle()` ซึ่งใช้ `setInterval` ตรวจสอบสถานะ `window.speechSynthesis.speaking` ทุก 100ms
- **ผลลัพธ์:** เสียงจะถูกพูดเรียงลำดับอย่างถูกต้องเสมอ (Sequential Playback) เช่น "Calibration Complete" -> จบ -> "Right Hand Clockwise" -> จบ -> "Start Training"

**2. Localized Text-to-Speech:**
- ระบบรองรับเสียงพูด 2 ภาษา (ไทย/อังกฤษ) โดยใช้ `SpeechSynthesisUtterance`
- ข้อความเสียงทั้งหมดถูกย้ายไปเก็บใน `translations.js` เพื่อความง่ายในการดูแลรักษา
- **ตัวอย่าง:**
  - `announce_record_stop`: "สิ้นสุดการฝึก" (ช่วยแก้ปัญหาคำว่า "หยุด" สั้นเกินไปจนถูกตัดเสียง)
  - `alert_low_light_short`: "แสงสว่างไม่เพียงพอ" (ตัดคำเตือนยาวๆ ออกเพื่อให้กระชับ)

### 5.3.8 Random Exercise Mode (Gamification)

**ไฟล์:** `js/script.js`, `js/ui_manager.js`

เพื่อเพิ่มความน่าสนใจและลดความจำเจในการฝึกซ้อม (Gamification) ระบบได้เพิ่มฟีเจอร์ **"Random Exercise Mode (โหมดสุ่มท่า)"** ซึ่งท้าทายให้ผู้ฝึกทำท่าที่ไม่คาดคิด

**Algorithm Logic:**
การสุ่มท่าใช้ `Math.random()` ในการเลือกหนึ่งท่าจาก 4 ท่ามาตรฐาน แต่มีความท้าทายทางเทคนิคในการจัดการ State ของระบบ:

```javascript
// script.js (Simplified)
async function startTrainingFlow() {
    if (currentExercise === "random") {
        const exercises = ["rh_cw", "rh_ccw", "lh_cw", "lh_ccw"];
        const randomIndex = Math.floor(Math.random() * exercises.length);
        
        // 1. อัปเดต State จริง
        currentExercise = exercises[randomIndex];
        
        // 2. อัปเดต UI เพื่อแจ้งผู้ใช้
        uiManager.showNotification(
            `🎲 Random Selected: ${uiManager.getText("ex_" + currentExercise)}`
        );
        
        // 3. (Critical Change) รอให้โหลดข้อมูลเสร็จก่อนไปต่อ
        // ป้องกัน Race Condition ที่ทำให้หน้าจอ Calibration ไม่ขึ้น
        await loadReferenceData();
    }
    
    // ... เริ่ม Process ปกติ (Calibration -> Training)
}
```

**Technical Challenges & Solutions:**
1.  **State Consistency:** เมื่อสุ่มท่าแล้ว ต้องเปลี่ยนค่า `currentExercise` จริงๆ เพื่อให้ระบบ Scoring และ Reference Data ทำงานถูกต้อง ไม่ใช่แค่สุ่มโชว์ชื่อ
2.  **Race Condition (Double Click Bug):** ในช่วงแรกของการพัฒนา พบปัญหาที่ผู้ใช้ต้องกดปุ่ม Start 2 ครั้งถึงจะเริ่ม สาเหตุเกิดจาก `loadReferenceData()` ทำงานแบบ Asynchronous (โหลดไฟล์ JSON ขนาดใหญ่) และแย่งทรัพยากรกับ `calibrator.start()`
    *   **Solution:** เพิ่ม `await` หน้า `loadReferenceData()` เพื่อบังคับให้โหลดข้อมูลเสร็จสมบูรณ์ 100% ก่อนที่จะเริ่มแสดงหน้าจอ Calibration

### 5.3.9 Performance Optimization (System Efficiency)

เพื่อให้ระบบสามารถทำงานได้ราบรื่นบนอุปกรณ์ที่มีทรัพยากรจำกัด (เช่น Tablets หรือ Mobile Devices) ทีมพัฒนาได้ใช้เทคนิค **Frame Throttling** เพื่อลดภาระการประมวลผลของ AI Model:

#### 1. Dynamic Performance Mode (User-Selectable)

จากการทดสอบพบว่าอุปกรณ์แต่ละระดับมีความสามารถในการประมวลผลต่างกัน ระบบจึงพัฒนา **Dynamic Performance Mode** ที่ให้ผู้ใช้เลือกได้ หรือปรับอัตโนมัติ:

| Mode | Target Device | Resolution | Frame Skipping | Est. AI FPS |
|------|--------------|------------|----------------|-------------|
| **Lite** | Mobile, Tablet, Low-end PC | 640x480 (SD) | Process 1, Skip 4 | ~6 FPS |
| **Balanced** | Average Laptop | 640x480 (SD) | Process 1, Skip 3 | ~7.5 FPS |
| **Quality** | High-end Desktop | 1280x720 (HD) | Process 1, Skip 2 | ~10 FPS |

**Code Implementation:**

```javascript
// script.js (Simplified)
const throttleFrameCounter = 0;
const skipFrames = currentPerformanceMode === 'lite' ? 4 : 
                   currentPerformanceMode === 'quality' ? 2 : 3;

if (throttleFrameCounter % (skipFrames + 1) === 0) {
    await pose.send({ image: videoElement }); 
}
```

**ผลลัพธ์ (Benefits):**
*   **Flexibility:** ผู้ใช้สามารถเลือกระดกว่าต้องการความลื่นไหล (Lite) หรือความคมชัด (Quality)
*   **Tablet Support:** ทำให้สามารถใช้งานบน Tablet ได้โดยเครื่องไม่ร้อนจนเกินไป
*   **Battery Saving:** โหมด Lite ช่วยประหยัดพลังงานได้มากที่สุด

#### 2. Time-based Calibration Logic

เนื่องจาก AI Frame Rate ลดลงเหลือ 7.5 FPS การใช้ "จำนวนเฟรม" (Frame Count) ในการจับเวลา (เช่น นับ 90 เฟรม = 3 วินาที) จึงไม่แม่นยำอีกต่อไป ระบบจึงถูก Refactor ให้ใช้ **"เวลาจริง" (Timestamp-based)** แทน:

```javascript
// calibration_manager.js
// Old Logic (Frame-based):
// if (stableFrames > 90) -> Complete (ช้าลง 4 เท่าเมื่อลด FPS)

// New Logic (Time-based):
const elapsed = Date.now() - stabilityStartTime;
if (elapsed > 3000) -> Complete // แม่นยำ 3 วินาทีเสมอ ไม่ขึ้นกับ FPS
```

### 5.3.10 Background & Effects Manager

**ไฟล์:** `js/display/background_manager.js` (~12 KB)

ระบบจัดการพื้นหลังแบบเสมือน (Virtual Background) ใช้เทคโนโลยี **Selfie Segmentation** จาก MediaPipe เพื่อแยกตัวผู้ใช้ออกจากฉากหลัง ทำให้สามารถแสดงผลเอฟเฟกต์ต่างๆ ได้:

**Modes:**
1.  **None:** แสดงภาพวิดีโอปกติ
2.  **Blur:** เบลอฉากหลัง (Gaussian Blur) เพื่อเน้นตัวผู้ใช้
3.  **Image:** แทนที่ฉากหลังด้วยรูปภาพ (Virtual Environment) เช่น สวนไผ่ หรือ วัด
4.  **Silhouette:** สร้าง Overlay สีม่วงทับตัวผู้ใช้ เพื่อให้เห็นรูปทรงชัดเจนขึ้น

**Implementation Details:**
การประมวลผลทำบน HTML5 Canvas โดยใช้ Technical Steps ดังนี้:
1.  รับ `segmentationMask` จาก MediaPipe Pose
2.  ใช้ `globalCompositeOperation = 'destination-in'` เพื่อตัดภาพตัวคนออกจาก Background เดิม
3.  วาด Background ใหม่ (เบลอ หรือ รูปภาพ) ลงบน Canvas ล่างสุด
4.  วาดภาพตัวคนที่ตัดออกมาทับด้านบน

### 5.3.11 Enhanced Display Modes

เพื่อให้การฝึกมีประสิทธิภาพสูงสุด ระบบได้เพิ่มโหมดการแสดงผลพิเศษ:

**1. Side-by-Side Mode (จอแยก):**
สำหรับผู้เริ่มฝึกที่ยังจำท่าไม่ได้ การแสดงภาพซ้อน (Overlay) อาจทำให้สับสน ระบบจึงมีโหมด Side-by-Side แบ่งหน้าจอเป็น 2 ส่วน:
*   **ซ้าย:** วิดีโอต้นแบบ (Instructor)
*   **ขวา:** วิดีโอผู้ฝึก (User) พร้อม Skeleton
*   **การซิงค์:** วิดีโอทั้งสองฝั่งทำงานแยกกันแต่ถูกควบคุมด้วย Controller เดียวกัน

**2. Mirror Mode (กระจกเงา):**
ผู้ฝึกส่วนใหญ่คุ้นเคยกับการฝึกหน้ากระจก ระบบจึง set default เป็น Mirror Mode (พลิกภาพแกน X) แต่สามารถปิดได้หากต้องการเห็นมุมมองจริง

**3. Grid Overlay (ตาราง):**
เส้นตารางช่วยในการอ้างอิงตำแหน่งร่างกายและตรวจสอบความสมดุล โดยวาดทับลงบน Canvas เป็น Layer สุดท้าย

---

## 5.4 User Interface

### 5.4.1 Landing Page

**ไฟล์:** `index.html`, `css/landing.css`, `js/silk-animation.js`

Landing Page เป็นหน้าแรกของระบบ ออกแบบเพื่อแนะนำ TaijiFlow AI และนำผู้ใช้ไปยังหน้าฝึกซ้อม

**องค์ประกอบหลัก:**
- Header พร้อม Navigation
- Hero Section พร้อม Animated Background
- คู่มือการใช้งานเบื้องต้น
- ส่วนอ้างอิงหลักการไทเก๊ก
- Footer พร้อม Copyright

![Landing Page Screenshot]
*รูปที่ 5.1: หน้า Landing Page ของ TaijiFlow AI*
*(จะใส่ Screenshot ในภายหลัง)*

**Silk Reeling Animation:**

หน้า Landing มี Canvas Animation ที่จำลองการเคลื่อนไหวแบบ Silk Reeling:

```javascript
class SilkAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }
    
    init() {
        // สร้าง Particles
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1
            });
        }
        
        this.animate();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // วาด Particles และเส้นเชื่อม
        for (const particle of this.particles) {
            // อัปเดตตำแหน่งแบบ Circular Motion
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // วาด Particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fill();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}
```

### 5.4.2 Training Application

**ไฟล์:** `app.html`, `css/styles.css`

หน้า Training Application เป็นหน้าหลักสำหรับการฝึกซ้อม ประกอบด้วย:

**Layout (Responsive Design):**

หน้าจอถูกออกแบบด้วย Flexbox และ Grid โดยแบ่งเป็น 3 ส่วนหลัก:

1.  **Header:**
    *   **Controls:** ปุ่มเลือก "ท่าฝึก" (Exercise) และ "ระดับ" (Level)
    *   **Random Mode:** ตัวเลือก "🎲 Random (Surprise Me)" สำหรับสุ่มท่าฝึก
    *   **Status Bar:** แสดงสถานะการเชื่อมต่อกล้อง, FPS, และ AI Debug info
    *   **Theme Toggle:** ปุ่มเปลี่ยนโหมดมืด/สว่าง

2.  **Main Content (Video Area):**
    *   **Webcam Feed:** แสดงภาพผู้ฝึกเต็มหน้าจอ
    *   **Overlays:**
        *   **Skeleton:** เส้นโครงกระดูกสีเขียว/แดง
        *   **Ghost:** เงาท่าต้นแบบสีขาวจางๆ
        *   **Feedback:** ข้อความแจ้งเตือนแบบ Real-time
        *   **Countdown:** ตัวเลขนับถอยหลังขนาดใหญ่
    *   **Start/Stop Controls:** ปุ่มควบคุมขนาดใหญ่ที่ด้านล่าง

3.  **Footer/Control Panel:**
    *   **Settings:** ปุ่มตั้งค่าเสียง, ภาษา
    *   **Instructions:** ปุ่มเรียกดูคู่มือ
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  TaijiFlow AI                    [Settings] [Theme]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                                                           │  │
│   │                     Main Canvas                           │  │
│   │               (Video + Skeleton + Ghost)                  │  │
│   │                                                           │  │
│   │                                    ┌─────────────────┐    │  │
│   │                                    │ Instructor Video │    │  │
│   │                                    └─────────────────┘    │  │
│   │                                                           │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   [Feedback Area]                                               │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  ⚠️ ศอกจมลง / ✅ ท่าถูกต้อง                              │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   [Controls]                                                     │
│   [Start] [Stop] [Settings] [Tutorial] [Chatbot] [Export]       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

![Training Application Screenshot]
*รูปที่ 5.2: หน้า Training Application*
*(จะใส่ Screenshot ในภายหลัง)*

**Control Buttons:**

| ปุ่ม | ฟังก์ชัน | Keyboard Shortcut |
|-----|---------|:-----------------:|
| ▶️ Start | เริ่มการฝึก | Space |
| ⏹️ Stop | หยุดและแสดงคะแนน | Space (ขณะฝึก) / Esc |
| ❓ Help | เปิดคู่มือการใช้งาน | H หรือ ? |
| 🌙/☀️ Theme | สลับ Dark/Light Mode | T |
| 🌐 Language | สลับภาษา TH/EN | L |
| 🔊/🔇 Sound | เปิด/ปิดเสียง | M |

### 5.4.3 Score Summary Popup

**ไฟล์:** `js/score_popup_manager.js`

เมื่อจบการฝึก ระบบจะแสดง Popup สรุปผลคะแนน:

**องค์ประกอบ:**
- เกรดขนาดใหญ่ (A-F) พร้อมสี
- คะแนนเป็นเปอร์เซ็นต์
- กราฟแท่งแสดงคะแนนแต่ละกฎ
- รายการข้อผิดพลาดที่พบบ่อย
- ปุ่ม Export และ Try Again

![Score Summary Screenshot]
*รูปที่ 5.3: Score Summary Popup*
*(จะใส่ Screenshot ในภายหลัง)*

### 5.4.4 Theme System

ระบบรองรับ 2 Themes:

| Theme | Background | Text | Accent |
|-------|------------|------|--------|
| Light (☀️) | #FFFFFF | #1A1A1A | #4CAF50 |
| Dark (🌙) | #1A1A1A | #FFFFFF | #6ECF6E |

Theme ถูกบันทึกใน LocalStorage และจะถูกนำมาใช้เมื่อเปิดใช้งานครั้งถัดไป

```javascript
// Theme Toggle
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Load Saved Theme
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}
```

### 5.4.4 Rules Settings UI

**ไฟล์:** `js/rules_config_manager.js` (~13 KB)

ระบบ Rules Settings ให้ผู้ใช้สามารถปรับแต่งการตรวจสอบกฎได้ตามระดับทักษะและความต้องการ

**โครงสร้าง UI:**

หน้าต่าง Rules Settings จัดกลุ่มกฎตาม Level เพื่อให้ผู้ใช้เข้าใจได้ง่าย โดยมี 3 กลุ่มหลัก:

| กลุ่ม | คำอธิบาย | กฎที่รวม |
|-------|----------|----------|
| **L1: นั่ง** | กฎพื้นฐาน 3 ข้อ สำหรับผู้เริ่มต้น | 1, 3, 7 |
| **L2: ยืน** | เพิ่มอีก 3 กฎ สำหรับระดับกลาง | 2, 4, 6 |
| **L3: ยืนย่อ** | เพิ่มอีก 2 กฎ สำหรับระดับสูง | 5, 8 |

**ค่าที่ปรับได้ (Configurable Parameters):**

| กฎ | Parameter | Default | ความหมาย |
|:--:|-----------|:-------:|----------|
| 1 | Consistency | 0.6 | ความสม่ำเสมอของทิศทางหมุน |
| 2 | Motion | 0.015 | ขยับขึ้น/ลงขั้นต่ำก่อนเช็คการหมุน |
| 3 | Tolerance | 0.01 | ความอดทนต่อศอกที่สูงกว่าข้อมือ |
| 4 | Hip Vel | 1.0 | ความเร็วสะโพกขั้นต่ำ (°/s) |
| 5 | Threshold | 0.05 | การขยับศีรษะสูงสุด |
| 6 | Threshold | 0.05 | ความเร่งสูงสุดที่ยอมรับ |
| 7 | Threshold | 0.003 | ความเร็วขั้นต่ำ (ไม่หยุดนิ่ง) |
| 8 | Buffer | 0.3 | ขนาด Safe Zone |

**วิธีใช้งาน:**

1. **เปิด Rules Settings** - คลิกปุ่ม ⚙️ Rules ที่ด้านบนขวา
2. **เปิด/ปิดกฎ** - ติ๊กถูก ☑ เพื่อเปิด หรือ ☐ เพื่อปิด
3. **ปรับค่า Threshold** - ใส่ค่าตัวเลข หรือใช้ลูกศร ▲▼
4. **Reset to Defaults** - กด 🔄 เพื่อคืนค่าตาม Level ที่เลือก

> **หมายเหตุ:** การตั้งค่าของผู้ใช้จะถูกเก็บระหว่าง Session แต่จะถูก Reset เมื่อ Refresh หน้าเว็บ หรือเมื่อกดปุ่ม "Reset to Defaults"

> **ดูรายละเอียดเพิ่มเติม:** คู่มือการตั้งค่ากฎฉบับเต็มอยู่ที่ `docs/guides/RULES_SETTINGS_GUIDE.md`

---

## 5.5 Deployment and Installation

### 5.5.1 System Requirements

**Hardware Requirements:**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | Dual-core 2.0 GHz | Quad-core 2.5 GHz+ |
| Memory | 4 GB RAM | 8 GB RAM |
| Webcam | 720p @ 30fps | 1080p @ 30fps |
| Display | 1366×768 | 1920×1080 |

**Software Requirements:**

| Software | Version | Notes |
|----------|---------|-------|
| Chrome | 90+ | Recommended |
| Firefox | 88+ | Supported |
| Edge | 90+ | Supported |
| Safari | 14+ | Limited (WebRTC issues) |

**Network Requirements:**
- ครั้งแรก: ต้องมี Internet เพื่อโหลด AI Model (~10-15 MB)
- หลังจากนั้น: สามารถใช้งาน Offline ได้ (ยกเว้น Chatbot)

### 5.5.2 Installation

TaijiFlow AI เป็น Static Web Application ไม่ต้องการ Backend Server:

**วิธีที่ 1: เปิดโดยตรงจากไฟล์**
```bash
# Clone หรือ Download โปรเจค
git clone https://github.com/username/TaijiFlow.git

# เปิดไฟล์ index.html ด้วย Browser
# หมายเหตุ: บาง Browser อาจมีข้อจำกัดด้าน CORS
```

**วิธีที่ 2: ใช้ Local Server**
```bash
# ใช้ Python HTTP Server
cd TaijiFlow
python -m http.server 8000

# หรือใช้ Node.js http-server
npx http-server -p 8000

# เปิด http://localhost:8000
```

**วิธีที่ 3: Deploy บน Web Hosting**
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

### 5.5.3 Configuration

**Gemini API Key Setup:**

หากต้องการใช้งาน AI Chatbot:

1. ไปที่ https://makersuite.google.com/app/apikey
2. สร้าง API Key
3. ใส่ API Key ในช่อง Settings ของระบบ

```javascript
// API Key ถูกเก็บใน LocalStorage (ไม่ส่งไปที่ Server)
localStorage.setItem('geminiApiKey', 'YOUR_API_KEY');
```

### 5.5.4 Web Application Compatibility (ข้อจำกัดของเบราว์เซอร์)

เนื่องจากการใช้เทคโนโลยีขั้นสูง (MediaPipe Segmentation, WebGL), ระบบมีข้อจำกัดในบางเบราว์เซอร์:

1. **Mobile / Tablet Devices (iPad, Android Tablets)**
    - **Visual Effects (Blur Background):** ไม่รองรับ (Desktop Only) - ระบบจะซ่อนตัวเลือกนี้อัตโนมัติเพื่อลดภาระการประมวลผล
    - **Performance:** จัดอยู่ในสถานะ "Experimental Support" แนะนำให้ใช้ Desktop (Chrome/Edge) เพื่อประสิทธิภาพสูงสุด
    - **Mitigation:** ใช้ `isMobileDevice()` ตรวจจับและปรับ UI ให้เหมาะสม (ซ่อนฟีเจอร์หนัก)


**Reference Data:**

ไฟล์ Reference Data อยู่ใน folder `/data/`:
- `*.json` - Ghost Landmarks
- `*.webm` - Video ต้นแบบ

ผู้ใช้สามารถเพิ่มท่าใหม่ได้โดยใช้ Data Collector Tool (`data_collector.html`)

### 5.5.4 Data Collector Tool (สำหรับ Admin)

> **หมายเหตุ:** เครื่องมือนี้มีไว้สำหรับผู้ดูแลระบบ/ผู้เชี่ยวชาญเท่านั้น (UC-06: Manage Reference Data)

`data_collector.html` เป็นเครื่องมือสำหรับบันทึกท่าต้นแบบ (Reference Data) ที่ใช้ในระบบหลัก โดยมีฟีเจอร์ดังนี้:

**Features:**

| Feature | Description |
|---------|-------------|
| **Exercise Selection** | เลือกท่า (rh_cw, rh_ccw, lh_cw, lh_ccw) |
| **Level Selection** | เลือกระดับ (L1, L2, L3) |
| **Countdown** | นับถอยหลัง 3-2-1 ก่อนเริ่มบันทึก |
| **Auto-stop** | หยุดอัตโนมัติเมื่อครบ 30 วินาที |
| **Frame Optimization** | บันทึกทุก 3 frames (30fps → ~10fps) |
| **Precision** | ปัดทศนิยม 3 ตำแหน่ง |
| **Silhouette Recording** | บันทึก Segmentation Mask สำหรับ Ghost Display |

**Output Files:**

| File | Format | Purpose |
|------|--------|---------|
| `{exercise}_{level}.json` | JSON | Ghost Landmarks สำหรับ Main App |
| `{exercise}_{level}.webm` | WebM | วิดีโอต้นฉบับ (Reference Video) |
| `{exercise}_{level}_silhouette.webm` | WebM | วิดีโอเงาสำหรับ Instructor Thumbnail |

**ขั้นตอนการใช้งาน:**

1. เปิด `data_collector.html` ผ่าน Local Server
2. เลือกท่าและระดับที่ต้องการบันทึก
3. กดปุ่ม "Start Recording"
4. รอ Countdown 3-2-1 แล้วเริ่มทำท่า
5. ทำท่าจนกว่าระบบหยุดอัตโนมัติ (30 วินาที)
6. ไฟล์จะ Download อัตโนมัติ
7. ย้ายไฟล์ไปยัง folder `/data/`

**JSON Output Structure:**

```json
{
  "exercise": "rh_cw",
  "level": "L1",
  "fps": 10,
  "landmarks": [
    {
      "frame": 0,
      "time": 0,
      "pose": [...33 landmarks...]
    }
  ]
}
```

### 5.5.5 User Guide

**ขั้นตอนการใช้งานเบื้องต้น:**

1. **เปิดระบบ** - เข้าหน้า Landing Page
2. **เลือกท่าฝึก** - เลือกท่าที่ต้องการฝึก (เช่น Right Hand Clockwise L1)
3. **อนุญาต Webcam** - Browser จะขออนุญาตเข้าถึงกล้อง
4. **Calibrate** - ยืนท่า T-Pose เพื่อวัดสัดส่วนร่างกาย
5. **เริ่มฝึก** - กดปุ่ม Start หรือยกนิ้วโป้ง 👍
6. **ฝึกตามท่าต้นแบบ** - ดู Ghost และทำตาม
7. **รับ Feedback** - ระบบจะเตือนเมื่อมีท่าผิด
8. **ดูผลคะแนน** - เมื่อจบจะแสดง Score Summary

**Tips สำหรับผลลัพธ์ที่ดี:**
- ยืนห่างจากกล้องประมาณ 1.5-3 เมตร
- ใช้แสงสว่างเพียงพอ ไม่มีแสงสะท้อนหลัง
- สวมเสื้อผ้าสีตัดกับพื้นหลัง
- ทำท่า Calibration ให้นิ่งที่สุด

---

*Document updated: 2026-01-26 (v1.2.0)*
