# TaijiFlow AI - Changelog

รายการการเปลี่ยนแปลงทั้งหมดของโปรเจค

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
