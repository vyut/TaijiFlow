# การวิเคราะห์ Training-Specific Features สำหรับ TaijiFlow AI

## บทนำ

Features ทั้ง 5 นี้ออกแบบมาเพื่อ**เพิ่มประสิทธิภาพการฝึก**โดยเฉพาะ ไม่ใช่แค่ทำให้ดูสวย แต่ช่วยให้ผู้ฝึก:
- เข้าใจท่าทางได้ดีขึ้น
- แก้ไขข้อผิดพลาดได้ตรงจุด
- ฝึกซ้อมได้สะดวกและมีประสิทธิภาพ

---

## 1. 📐 Grid Overlay - แสดงตารางช่วยวัดตำแหน่ง

### 🎯 วัตถุประสงค์
ช่วยผู้ฝึก**วัดระยะและตำแหน่ง**ของท่าทางได้แม่นยำขึ้น โดยใช้เส้นตารางเป็นแนวอ้างอิง

### 🖼️ ตัวอย่างการใช้งาน

```
┌─────────────────────────────────────────┐
│  📹 Canvas                               │
│     │         │         │                │
│  ───┼─────────┼─────────┼────  ← ศีรษะ   │
│     │         │         │                │
│     │    👤   │         │                │
│  ───┼─────────┼─────────┼────  ← ไหล่    │
│     │   /│\   │         │                │
│  ───┼──/─┼─\──┼─────────┼────  ← เอว     │
│     │  / │ \  │         │                │
│  ───┼──────────┼─────────┼────  ← เข่า   │
│     │ /  │  \ │         │                │
└─────────────────────────────────────────┘
        ↑       ↑         ↑
     Center  Left      Right
```

### ✨ ประโยชน์

1. **วัดความสมดุล**
   - เช็คว่าศีรษะอยู่กึ่งกลางหรือไม่
   - ดูว่าไหล่เอียงไหม (ควรอยู่แนวนอน)
   
2. **วัดระยะการขยับ**
   - มือควรขยับไปทางซ้าย/ขวากี่ช่อง
   - เท้าควรห่างกันเท่าไหร่ (Rule 8: Weight Shift)

3. **ช่วยท่าซ้ำได้แม่นยำ**
   - "ครั้งที่แล้วมือขึ้นถึงเส้นที่ 3 ครั้งนี้ก็ต้องเท่ากัน"

4. **Reference สำหรับ Calibration**
   - ช่วยผู้ฝึกเข้าใจว่า "ถอยหลังอีกนิด" หมายถึงกี่ช่อง

### 🛠️ ความเป็นไปได้ทางเทคนิค

**⭐⭐⭐⭐⭐ ง่ายมาก**
- เพียงแค่วาดเส้นลง Canvas ด้วย `ctx.strokeRect()` หรือ `ctx.moveTo()`
- ไม่กิน Performance เลย (เพียง 50-100 บรรทัดโค้ด)
- พัฒนา: **30 นาที - 1 ชั่วโมง**

### 💻 ตัวอย่างโค้ด

```javascript
function drawGrid(ctx, width, height, gridSize = 100) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // สีขาวโปร่งใส
  ctx.lineWidth = 1;
  
  // เส้นตั้ง
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // เส้นนอน
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Center line (เน้นหนักกว่า)
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
}
```

### ⚙️ UI Design

```html
Display Settings Dropdown:
  ☐ Show Skeleton
  ☐ Show Path
  ☐ Show Trail
  ☐ Show Ghost
  ☐ Blur Background
  ☑ Grid Overlay          ← เพิ่มตรงนี้
      ├─ Grid Size: [100px] ▼
      └─ Grid Opacity: ▱▱▱▱▱▱▱░░░ 70%
```

### 🎨 แนวทางพัฒนา

**ระดับ Basic:**
- เส้นตาราง 3x3 หรือ 4x4 แบบ fixed

**ระดับ Advanced (ถ้ามีเวลา):**
- ปรับขนาดตาราง (เล็ก/กลาง/ใหญ่)
- ปรับ opacity (โปร่งใส 20%-80%)
- เลือกสี (ขาว/เทา/แดง)
- แสดง "Center line" พิเศษ (สีแดง)

---

## 2. 🔄 Mirror Mode Toggle - สลับภาพกลับแบบง่ายขึ้น

### 🎯 วัตถุประสงค์
สลับ**ทิศทางภาพ**ระหว่าง mirror (กลับซ้าย-ขวา) กับ normal (ตรงตามจริง) ได้ทันที

### 📱 ปัญหาปัจจุบัน

ตอนนี้ TaijiFlow ใช้ CSS `scaleX(-1)` **แบบ fixed** (mirror เสมอ)
- ✅ ดีสำหรับผู้เริ่มต้น - มองเห็นตัวเองเหมือนกระจก
- ❌ สับสนสำหรับผู้ชำนาญ - มือซ้ายกลับเป็นขวา

### ✨ สถานการณ์การใช้งาน

**กรณีที่ 1: ผู้เริ่มต้น (ต้องการ Mirror)**
```
อาจารย์บนจอ:  ยกมือ-ขวา →
ผู้ฝึกเห็น:     ยกมือ-ขวา → (เหมือนกระจก)
ผู้ฝึกทำ:       ยกมือ-ขวาตัวเอง → ✅ ถูกต้อง
```

**กรณีที่ 2: ผู้ชำนาญ (ต้องการ Normal)**
```
อาจารย์บนจอ:   ยกมือ-ขวา →
ผู้ฝึกเห็น:     ยกมือ-ซ้าย ← (ตรงข้าม)
ผู้ฝึกเข้าใจ:   "อาจารย์ยกขวา ผมต้องยกซ้าย" ✅
```

**กรณีที่ 3: ดู Recording**
- Mirror Mode: ดูตัวเองเหมือนกระจก (สบายตา)
- Normal Mode: ดูท่าทางจริงๆ (วิเคราะห์ง่าย)

### 🛠️ ความเป็นไปได้ทางเทคนิค

**⭐⭐⭐⭐⭐ ง่ายมาก**
- เพียงแค่ toggle CSS `scaleX(-1)` on/off
- ไม่กิน Performance เลย
- พัฒนา: **15-30 นาที**

### 💻 ตัวอย่างโค้ด

```javascript
let isMirrorMode = true; // default: mirror

function toggleMirrorMode() {
  isMirrorMode = !isMirrorMode;
  const canvas = document.getElementById('output-canvas');
  
  if (isMirrorMode) {
    canvas.style.transform = 'scaleX(-1)'; // Mirror
  } else {
    canvas.style.transform = 'scaleX(1)';  // Normal
  }
  
  // บันทึก preference
  localStorage.setItem('mirrorMode', isMirrorMode);
}
```

### ⚙️ UI Design

**Option A: Toggle Button (แนะนำ)**
```
Top Bar:
  [🔄 Mirror] ← กดเพื่อสลับ
  หรือ
  [🔄 Normal]
```

**Option B: Dropdown**
```
Display Settings:
  ☑ Mirror Mode  ← Checkbox
```

**Option C: Keyboard Shortcut**
```
กด M = Toggle Mirror/Normal
```

### ✨ ประโยชน์

1. **สะดวกสำหรับทุกระดับ**
   - ผู้เริ่มต้น → Mirror (เลียนแบบง่าย)
   - ผู้ชำนาญ → Normal (ท่าจริง)

2. **ช่วยดู Recording**
   - สลับดูทั้ง 2 แบบ เข้าใจมากขึ้น

3. **UX ดีขึ้น**
   - ไม่บังคับต้องใช้แบบเดียว

---

## 3. 🐌 Slow Motion Playback - ดู Recording ช้าลง

### 🎯 วัตถุประสงค์
ดู**วิดีโอย้อนหลัง**ได้แบบ slow motion เพื่อวิเคราะห์ท่าทางอย่างละเอียด

### 📹 สถานการณ์การใช้งาน

**ปัญหา:** ผู้ฝึกทำท่าผิดพลาด แต่เกิดขึ้นเร็วมาก มองไม่ทัน
```
Real-time: [1 วงกลมใช้เวลา 3 วินาที]
  → ผิดตอนไหน? มองไม่เห็น!

Slow Motion (0.5x): [1 วงกลมใช้เวลา 6 วินาที]
  → เห็นชัดว่า มือสะดุดตรงจุดบน!

Slow Motion (0.25x): [1 วงกลมใช้เวลา 12 วินาที]
  → เห็นแม้กระทั่งศอกเด้งตอนหมุน!
```

### ✨ ประโยชน์

1. **แก้ไขข้อผิดพลาดแบบละเอียด**
   - เห็นว่าจุดไหนที่ acceleration สูงเกินไป (Rule 6)
   - เช็คว่าศอกจมจริงหรือไม่ (Rule 3)

2. **เรียนรู้ท่ายาก**
   - ท่าซับซ้อนดูครั้งเดียวไม่เข้าใจ → ช้าลง 4x จะเห็นชัดขึ้น

3. **เปรียบเทียบกับอาจารย์**
   - ดู Ghost Skeleton + Recording ตัวเอง แบบ slow motion
   - "อ๋อ! อาจารย์หมุนข้อมือเร็วกว่าผม"

### 🛠️ ความเป็นไปได้ทางเทคนิค

**⭐⭐⭐⭐ ค่อนข้างง่าย**
- HTML5 `<video>` มี `playbackRate` API อยู่แล้ว
- แต่ TaijiFlow ไม่ได้บันทึกเป็นวิดีโอ (บันทึกเป็น JSON landmarks)
- **ต้องสร้างระบบ Replay Player**

### 💻 แนวทางพัฒนา

**วิธีที่ 1: Recording เป็นวิดีโอ (ง่าย แต่ไฟล์ใหญ่)**
```javascript
// ใช้ MediaRecorder API
const mediaRecorder = new MediaRecorder(canvasStream);
mediaRecorder.start();

// หลังฝึกเสร็จ
mediaRecorder.stop();
const blob = mediaRecorder.ondataavailable;
const videoURL = URL.createObjectURL(blob);

// Playback
const video = document.createElement('video');
video.src = videoURL;
video.playbackRate = 0.5; // 0.5x speed
video.play();
```

**วิธีที่ 2: Replay จาก Landmarks (ดีกว่า แต่ซับซ้อนกว่า)**
```javascript
// มีข้อมูลอยู่แล้วใน recordedSessionData
const frames = recordedSessionData; // [{landmarks, timestamp}, ...]

// Replay with custom speed
function replaySession(speed = 1.0) {
  let frameIndex = 0;
  
  const interval = setInterval(() => {
    if (frameIndex >= frames.length) {
      clearInterval(interval);
      return;
    }
    
    const frame = frames[frameIndex];
    drawSkeleton(frame.landmarks);
    
    frameIndex++;
  }, (1000 / 30) / speed); // 30 FPS / speed
}

// เล่นช้า 2 เท่า
replaySession(0.5);
```

### ⚙️ UI Design

```html
Playback Controls (หลังฝึกเสร็จ):
┌─────────────────────────────────────┐
│  [⏮️] [▶️/⏸️] [⏭️]                  │
│  Speed: [0.25x] [0.5x] [1x] [2x]   │
│  ▱▱▱▱▱▱▱▱▱▱░░░░░░░░░░  3.2 / 10s   │
└─────────────────────────────────────┘
```

### 📊 ระดับความสำเร็จ

- **Basic (ควรทำ):** 0.5x, 1x, 2x speeds
- **Advanced:** 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- **Expert:** Slider แบบ continuous (0.1x - 2x)

### ⏱️ เวลาพัฒนา

- วิธีที่ 1 (Video): **2-3 ชั่วโมง**
- วิธีที่ 2 (Replay): **1-2 วัน** (ต้องสร้าง player ใหม่)

---

## 4. 👥 Side-by-side Comparison - เทียบตัวเองกับ Ghost

### 🎯 วัตถุประสงค์
แสดง**ผู้ฝึกและอาจารย์เคียงข้างกัน**เพื่อเปรียบเทียบความแตกต่างได้ชัดเจน

### 🖼️ แนวคิด

**ปัจจุบัน (Overlay):**
```
┌───────────────────────┐
│  👻 (Ghost - โปร่งใส)  │
│   👤 (User - ทึบ)       │
└───────────────────────┘
→ ทับกัน บางครั้งดูยาก
```

**แนวทางใหม่ (Side-by-side):**
```
┌─────────────┬─────────────┐
│  อาจารย์ 👻  │   ผม 👤      │
│             │             │
│   (Ghost)   │   (User)    │
└─────────────┴─────────────┘
→ เห็นชัดเจน เปรียบเทียบง่าย
```

### ✨ ประโยชน์

1. **เปรียบเทียบท่าได้ชัดเจน**
   ```
   อาจารย์:           ผม:
   ศอกต่ำ 📐          ศอกสูง ❌
   มือวงกลมสมส่วน ⭕  มือวงรี ❌
   ```

2. **ดูพร้อมกันทั้งคู่**
   - ไม่ต้องหาว่า Ghost อยู่ตรงไหน (ทับกันอาจมองไม่เจอ)

3. **เหมาะกับการวิเคราะห์**
   - ใช้ตอน Review session
   - ครูสอน ศิษย์ดูเทียบ

### 🛠️ ความเป็นไปได้ทางเทคนิค

**⭐⭐⭐ ปานกลาง**
- ต้องแบ่ง Canvas เป็น 2 ส่วน
- หรือใช้ 2 Canvas วางข้างกัน
- ต้องปรับ UI Layout ใหม่

### 💻 แนวทางพัฒนา

**วิธีที่ 1: Split Canvas (แนะนำ)**
```javascript
function drawSideBySide(userLandmarks, ghostLandmarks) {
  const halfWidth = canvasWidth / 2;
  
  // ซ้าย: Ghost
  ctx.save();
  ctx.rect(0, 0, halfWidth, canvasHeight); // Clip ครึ่งซ้าย
  ctx.clip();
  drawSkeleton(ghostLandmarks, 'green');
  ctx.restore();
  
  // ขวา: User
  ctx.save();
  ctx.rect(halfWidth, 0, halfWidth, canvasHeight); // Clip ครึ่งขวา
  ctx.clip();
  ctx.translate(halfWidth, 0); // เลื่อนไปขวา
  drawSkeleton(userLandmarks, 'white');
  ctx.restore();
  
  // เส้นแบ่งกลาง
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(halfWidth, 0);
  ctx.lineTo(halfWidth, canvasHeight);
  ctx.stroke();
}
```

**วิธีที่ 2: 2 Canvas แยก (ง่ายกว่า แต่ใช้พื้นที่มาก)**
```html
<div class="comparison-container">
  <div class="ghost-panel">
    <h3>อาจารย์ (Ghost)</h3>
    <canvas id="ghost-canvas"></canvas>
  </div>
  <div class="user-panel">
    <h3>คุณ (User)</h3>
    <canvas id="user-canvas"></canvas>
  </div>
</div>
```

### ⚙️ UI Design

```html
Display Settings:
  Mode: [●] Overlay   (ปกติ)
        [○] Side-by-side (เทียบข้างกัน)
```

### ⏱️ เวลาพัฒนา

- วิธีที่ 1: **4-6 ชั่วโมง**
- วิธีที่ 2: **2-3 ชั่วโมง**

### 📱 Responsive Design

**Desktop (กว้างพอ):**
```
┌──────────┬──────────┐
│  Ghost   │   User   │
└──────────┴──────────┘
```

**Mobile (แคบเกินไป):**
```
┌────────────┐
│   Ghost    │ ← Swipe ลง
├────────────┤
│    User    │
└────────────┘
```

---

## 5. 🔴 Highlight Problem Areas - แสดงจุดที่ผิดพลาดด้วยสีแดง

### 🎯 วัตถุประสงค์
**ไฮไลต์จุดที่ผิดพลาด**บน skeleton ด้วยสี/เอฟเฟกต์ เพื่อให้ผู้ฝึกรู้ทันทีว่าต้องแก้ไขตรงไหน

### 🎨 ตัวอย่างการแสดงผล

**ปกติ (ไม่มี error):**
```
     ⚪ ศีรษะ
    /|\  (สีขาวปกติ)
   / | \
  ⚪  ⚪  ⚪ (ข้อต่อทุกจุดสีขาว)
```

**มี Error (Rule 3: Elbow Sinking):**
```
     ⚪ ศีรษะ
    /|\  
   🔴 | \  ← ศอกขวาสูงเกินไป! (สีแดง + กระพริบ)
  ⚪  ⚪  ⚪ 
  
  ⚠️ "ศอกขวาสูงเกินไป จมศอกลง"
```

**มี Error (Rule 8: Weight Shift):**
```
     ⚪ ศีรษะ
    /|\  
   / | \  
  ⚪  ⚪  ⚪ 
  |  🔴  |  ← สะโพกไปทางซ้ายเกิน! (สีแดง)
  ⚪  ⚪  ⚪
  
  ⚠️ "น้ำหนักเอนซ้ายเกิน ปรับกลับมากึ่งกลาง"
```

### ✨ การทำงาน (ตาม Rule)

| Rule | จุดที่ต้อง Highlight | สี/เอฟเฟกต์ |
|------|---------------------|-----------|
| **R1: Path** | Wrist (ข้อมือ) | 🔴 แดง + ⭕ วงกลมรอบๆ |
| **R2: Rotation** | Thumb + Pinky | 🟠 ส้ม |
| **R3: Elbow** | Elbow (ศอก) | 🔴 แดงกระพริบ |
| **R4: Waist** | Shoulder + Hip | 🟡 เหลือง |
| **R5: Stability** | Head (ศีรษะ) | 🔵 ฟ้า + ลูกศรขึ้น-ลง |
| **R6: Smooth** | Wrist + วงกลมรอบ | 🟣 ม่วง |
| **R7: Continuity** | Wrist + ⏸️ icon | 🟤 น้ำตาล |
| **R8: Weight** | Hip (สะโพก) | 🔴 แดง + ลูกศรซ้าย/ขวา |
| **R9: Coordination** | Wrist + Hip | 🟠 ส้ม (ทั้ง 2 จุด) |

### ✨ ประโยชน์

1. **รู้ทันทีว่าผิดตรงไหน**
   - ไม่ต้องอ่าน feedback message ทุกครั้ง
   - มองเห็นง่าย ชัดเจน

2. **จำได้ดีขึ้น**
   - สีและตำแหน่งช่วยจดจำ
   - "ครั้งที่แล้วศอกขวาแดง ครั้งนี้ต้องระวัง"

3. **เหมาะกับการเรียนรู้ Visual**
   - บางคนเข้าใจภาพมากกว่าข้อความ

### 🛠️ ความเป็นไปได้ทางเทคนิค

**⭐⭐⭐⭐ ค่อนข้างง่าย**
- เพียงแค่เช็ค `feedbacks` array → วาดจุดที่ผิดด้วยสีแดง
- ใช้ `ctx.fillStyle = 'red'` + `ctx.arc()` วาดวงกลม
- อาจเพิ่ม animation กระพริบ

### 💻 ตัวอย่างโค้ด

```javascript
function highlightProblemAreas(feedbacks, landmarks) {
  feedbacks.forEach(error => {
    const errorKey = error.key; // เช่น "elbowHigh"
    
    // Map error -> landmark index
    const highlightMap = {
      'elbowHigh': [13, 14],        // ศอกซ้าย, ขวา
      'pathDeviate': [15, 16],      // ข้อมือ
      'weightShift': [23, 24],      // สะโพก
      'coordination': [15, 16, 23, 24], // มือ + สะโพก
      // ...
    };
    
    const indices = highlightMap[errorKey];
    if (!indices) return;
    
    indices.forEach(idx => {
      const point = landmarks[idx];
      if (!point) return;
      
      const x = point.x * canvasWidth;
      const y = point.y * canvasHeight;
      
      // วงกลมแดงกระพริบ
      ctx.save();
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() / 200); // กระพริบ
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
      
      // เส้นขอบ
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.stroke();
    });
  });
}
```

### ⚙️ UI Design

```html
Display Settings:
  ☑ Highlight Errors  ← เปิด/ปิด
      ├─ Style: [●] Circle [○] Glow [○] Pulse
      └─ Color: [Red ▼]
```

### 🎨 Variants (ตัวเลือก)

1. **Circle** - วงกลมรอบจุด (ง่าย)
2. **Glow** - แสงเรืองรอบจุด (สวย)
3. **Pulse** - กระพริบเข้า-ออก (เด่น)
4. **Arrow** - ลูกศรชี้ทิศทาง (เช่น "ลดลง")

### ⏱️ เวลาพัฒนา

- Basic (Circle): **2-3 ชั่วโมง**
- Advanced (+ Glow/Pulse): **1 วัน**

---

## 📊 สรุปเปรียบเทียบ 5 Features

| Feature | ความง่าย | เวลาพัฒนา | ประโยชน์ | Priority |
|---------|---------|----------|---------|----------|
| **Grid Overlay** | ⭐⭐⭐⭐⭐ | 30 นาที | ⭐⭐⭐⭐ | 🔥 High |
| **Mirror Toggle** | ⭐⭐⭐⭐⭐ | 30 นาที | ⭐⭐⭐⭐⭐ | 🔥 Very High |
| **Slow Motion** | ⭐⭐⭐⭐ | 1-2 วัน | ⭐⭐⭐⭐⭐ | ⭐ Medium-High |
| **Side-by-side** | ⭐⭐⭐ | 3-6 ชม. | ⭐⭐⭐⭐ | ⭐ Medium |
| **Highlight Errors** | ⭐⭐⭐⭐ | 3 ชม. - 1 วัน | ⭐⭐⭐⭐⭐ | 🔥 Very High |

---

## 🎯 แผนการพัฒนาแนะนำ

### Phase 1: Quick Wins (ควรทำก่อน)
1. ✅ **Mirror Toggle** (30 นาที) - ประโยชน์สูง ทำง่าย
2. ✅ **Grid Overlay** (30 นาที-1 ชม.) - ประโยชน์สูง ทำง่าย

### Phase 2: High Impact (ควรทำต่อ)
3. ✅ **Highlight Errors** (3 ชม.-1 วัน) - ประโยชน์สูงมาก ช่วยการเรียนรู้
4. ✅ **Side-by-side** (3-6 ชม.) - ดี สำหรับ Review

### Phase 3: Advanced (ถ้ามีเวลา)
5. ✅ **Slow Motion** (1-2 วัน) - ประโยชน์สูง แต่ใช้เวลานาน

---

## 💡 ข้อเสนอเพิ่มเติม

### Feature Combo ที่เข้ากันได้ดี

**Combo 1: Review Session**
- Slow Motion + Highlight Errors
  → ดูช้าๆ พร้อมเห็นจุดผิดชัดเจน

**Combo 2: Practice Mode**
- Grid + Mirror Toggle
  → วัดตำแหน่งแม่นยำ สลับมุมมองได้

**Combo 3: Learning Mode**
- Side-by-side + Highlight Errors
  → เทียบกับอาจารย์ เห็นจุดผิดทันที

---

## 🎬 สรุป

ทั้ง 5 features นี้**ออกแบบมาเพื่อการฝึก**โดยเฉพาะ ไม่ใช่แค่ visual gimmick:

✅ **ช่วยเข้าใจท่าทางได้ดีขึ้น** (Grid, Mirror)
✅ **แก้ไขข้อผิดพลาดได้ตรงจุด** (Highlight)
✅ **วิเคราะห์และเปรียบเทียบได้ละเอียด** (Slow Motion, Side-by-side)

แนะนำให้เริ่มจาก **Phase 1** (Mirror + Grid) ก่อน เพราะ:
- ทำง่าย (1-2 ชั่วโมงรวม)
- ได้ประโยชน์ทันที
- ไม่กระทบ Performance

จากนั้นค่อยพัฒนา **Highlight Errors** (Phase 2) เพราะเป็น game-changer สำหรับการเรียนรู้!
