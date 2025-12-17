# TaijiFlow AI - Changelog

รายการการเปลี่ยนแปลงทั้งหมดของโปรเจค

---

## [v0.4] - 2024-12-17

### 🖥️ Fullscreen Mode Improvements

#### Changed
- **Fullscreen Target** - เปลี่ยนจาก `canvas` เป็น `.canvas-container`
  - Timer และปุ่ม Overlay แสดงใน Fullscreen ได้แล้ว
  - Gesture popup แสดงใน Fullscreen ได้แล้ว
  
- **Auto Fullscreen** - เข้า Fullscreen อัตโนมัติหลังกด Start Training
  - เรียก `requestFullscreen()` ทันทีใน user gesture context
  - Silent fail ถ้า browser block
  - ออก Fullscreen อัตโนมัติเมื่อจบ Training

- **Mirror Logic** - ลบ duplicate mirror ใน JS
  - CSS `scaleX(-1)` ทำ mirror ทั้งหมดแล้ว
  - ลบ `isFullscreen` check จาก `drawing_manager.js` และ `script.js`

#### Added
- **Stop Button (🛑)** - ปุ่มหยุดการฝึกบน Video Overlay (มุมซ้ายล่าง)
- **Fullscreen Toggle Text** - เปลี่ยนข้อความ "เต็มจอ" ↔ "จอปกติ" ตามสถานะ

### 🌐 Translation & i18n

#### Added
- `fullscreen_overlay` - ข้อความปุ่มเต็มจอบน Overlay
- `fullscreen_exit` - ข้อความปุ่มจอปกติ
- `stop_btn` - ข้อความปุ่มหยุด

#### Changed
- `overlay_note` - เปลี่ยนเป็น "กด 🛑 เพื่อหยุดก่อนเวลา"
- ตัด "ไม่บันทึกวิดีโอ" และ "ปรับเทียบอัตโนมัติ" ออก

#### Fixed
- **Language Sync** - Sync ธง/Audio/Calibrator กับภาษาจาก localStorage ตอนโหลดหน้า

### 📝 Calibration Text

#### Changed
- `tpose` - "กรุณายืนกางแขน (T-Pose)"
- `cancel` - "ถอยหลังให้เห็นเต็มตัว" (เดิม "กดปุ่มยกเลิก")

### 📱 PWA Support (Add to Home Screen)

#### Added
- **Standalone Mode Detection** - ตรวจจับ PWA mode ด้วย `display-mode: standalone`
- **Timeout Fallback** - ถ้า fullscreen ไม่ตอบสนองใน 1 วินาที → ข้ามไป
- รองรับ iOS Safari PWA และ Opera ที่ไม่รองรับ Fullscreen API

### 🖐️ Gesture Control

#### Added
- **Cancel Calibration** - ใช้ท่ามือ ✊ Closed Fist ยกเลิก Calibration ได้
- ออกจาก Fullscreen และแสดง Overlay กลับมาอัตโนมัติ

### 🔧 Debug Overlay (กด D)

#### Added
- `fps` - Frames Per Second (NFR Performance)
- `frameCount` - จำนวน Frame ทั้งหมด
- `score` - คะแนน Real-time

### 🗂️ Category Dropdown

#### Added
- **Category Select** - dropdown ใหม่สำหรับเลือกประเภทท่า
- `cat_silk_single` - ท่าม้วนไหม - มือเดียว (default)
- `cat_silk_double` - ท่าม้วนไหม - สองมือ (disabled, สำหรับอนาคต)

### 📚 Documentation

#### Updated
- **CHANGELOG.md** - เพิ่ม v0.4 พร้อมรายละเอียดครบ
- **TRAINING_FLOW.md** - (ใหม่) Training Flow พร้อม Mermaid diagrams
- **index.html** - เพิ่ม File Header อธิบายโครงสร้าง
- **data_collector.html** - เพิ่ม File Header อธิบายการใช้งาน
- **App Modules** - เพิ่ม comments อธิบายแต่ละ module

---

## [v0.3] - 2024-12-11

### 🔧 Heuristics Engine v3.0

#### Fixed
- **Double Canvas Transform** - แก้ไขปัญหา skeleton/path กลับด้าน
  - `script.js`: ใช้ save/restore รอบ video drawing
  - `drawing_manager.js`: เพิ่ม `mirrorDisplay` flag

#### Added
- **Timestamps in wristHistory** - เก็บ `{x, y, t}` แทน `{x, y}`
  - ทำให้คำนวณ velocity/acceleration ได้ถูกต้องตามเวลาจริง
  
- **CONFIG Object** - รวม threshold ทั้งหมด 20+ ค่า
  - ทุกค่ามีหน่วยอธิบาย (normalized, deg/sec, frames)
  - มี min/max caps สำหรับ Path Accuracy

- **Debug Mode** - กด `D` เพื่อดูค่า real-time
  - แสดง pathDistance, wristVelocity, acceleration
  - กล่อง cyan มุมขวาบน

- **Documentation** - 3 ไฟล์ใหม่:
  - `docs/HEURISTICS_MANUAL.md`
  - `docs/CONFIGURATION_GUIDE.md`
  - `docs/CHANGELOG.md`

#### Changed
- **checkSmoothness()** - รับ timestamp parameter
- **checkVerticalStability()** - ใช้ CONFIG constants
- **checkContinuity()** - ใช้ CONFIG constants
- **checkWaistInitiation()** - ใช้ CONFIG constants

---

## [v0.2] - 2024-12-10

### 🎨 UI Redesign

#### Changed
- ย้าย dropdown exercise/level ขึ้นด้านบน
- Language toggle แสดงเฉพาะ flag icon
- Theme toggle เปลี่ยน icon (🌙/☀️)
- ลบ timer ซ้ำซ้อนที่ top bar
- ซ่อน instructions box (ชั่วคราว)

#### Fixed
- Calibration text กลับด้าน
- Light mode readability สำหรับ instructions box
- Translation สำหรับ level dropdown และ stop button

#### Added
- Escape key shortcut ยกเลิก calibration

---

## [v0.1] - 2024-12-09

### 🚀 Initial Release

#### Core Features
- MediaPipe Pose integration
- 8 Heuristic rules
- Calibration system
- Audio feedback (Web Speech API)
- Data export (JSON/CSV)
- Bilingual support (TH/EN)
- Dark/Light mode
- Fullscreen mode

#### Exercise Support
- 4 exercises: rh_cw, rh_ccw, lh_cw, lh_ccw
- 3 levels: L1 (seated), L2 (standing), L3 (squat)

---

## Data Collector Optimization

### [2024-12-11]
- ลด frame rate: 30fps → 10fps
- ปัดทศนิยม: 15 → 3 ตำแหน่ง
- Minify JSON: ลบ whitespace
- **ผลลัพธ์:** ลดขนาดไฟล์ ~90%
