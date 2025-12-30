# Wrist Trail Visualization - Feature Specification

**Version:** 2.0  
**Last Updated:** 2024-12-30  
**Status:** ✅ Implemented

---

## 1. Overview

### Feature Name
**Wrist Trail Visualization**

### Description
แสดงเส้นทางการเคลื่อนไหวของมือ (Trail) แบบ Real-time บนหน้าจอขณะฝึก

### Features
- เส้น Fading Line สีฟ้า (Cyan)
- Glow effect ที่ปลาย (ตำแหน่งปัจจุบัน)
- Smoothing ลด noise จาก MediaPipe
- ปรับความยาว Trail ได้

---

## 2. Configuration

### TRAIL_LENGTH (ความยาว Trail)

**ไฟล์:** `js/script.js` บรรทัด ~361

```javascript
// 🔧 CONFIG: ปรับความยาว Trail (จำนวนจุด)
// - 20 = สั้น (~0.7 วินาที) → หายเร็ว
// - 40 = ปานกลาง (~1.3 วินาที)
// - 60 = ยาว (~2 วินาที) → หายช้า
const TRAIL_LENGTH = 60;
```

### SMOOTH_FACTOR (ความ Smooth)

**ไฟล์:** `js/script.js` บรรทัด ~1543

```javascript
// 0 = ไม่ smooth (ตามจริง)
// 0.4 = ปานกลาง ✅
// 0.7 = smooth มาก (delay)
// 1 = ไม่ขยับเลย
const SMOOTH_FACTOR = 0.4;
```

---

## 3. Usage

### UI
ไปที่ **Display Options** → เลือก **🔵 Trail**

### Keyboard
กดปุ่ม **R**

---

## 4. Technical Details

### Files

| ไฟล์ | หน้าที่ |
|------|--------|
| `js/drawing_manager.js` | `drawTrail()` - วาดเส้นและ glow |
| `js/script.js` | เก็บ trailHistory + smoothing |
| `index.html` | Trail checkbox |

### Algorithm: Smoothing

```javascript
// Exponential Moving Average
smoothX = last.x * SMOOTH_FACTOR + wrist.x * (1 - SMOOTH_FACTOR);
smoothY = last.y * SMOOTH_FACTOR + wrist.y * (1 - SMOOTH_FACTOR);
```

### Drawing

1. วาดเส้นแต่ละ segment (จางไปเข้ม)
2. วาด Glow ที่ปลาย (radial gradient)

---

## 5. Performance

| ส่วน | Impact |
|------|:------:|
| เก็บจุด | ~0.1% |
| วาดเส้น | ~1-2% |
| Glow | ~0.5% |
| **รวม** | **~2-3%** |

---

*End of Document*
