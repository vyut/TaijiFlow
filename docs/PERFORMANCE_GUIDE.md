# TaijiFlow AI - Performance Guide

**Version:** 1.0  
**Last Updated:** 2024-12-26

---

## 📋 สารบัญ

1. [Display Options](#1-display-options)
2. [FPS Impact Analysis](#2-fps-impact-analysis)
3. [Device Performance](#3-device-performance)
4. [Optimization Tips](#4-optimization-tips)

---

## 1. Display Options

### ตารางสรุป

| Option | Default | คำอธิบาย |
|--------|:-------:|---------|
| Path | ✅ ON | เส้นวงกลมนำทาง (Dynamic Path) |
| Skeleton | ✅ ON | โครงกระดูกผู้ฝึก (33 joints) |
| Instructor | ✅ ON | เงาครูฝึกมุมขวาบน (Thumbnail) |
| Ghost | ❌ OFF | เงาครูฝึกซ้อนบนวิดีโอหลัก |
| Silhouette | ❌ OFF | เงาผู้ฝึก (Body Segmentation) |

---

### 1.1 Path (เส้นนำทาง) 📍

```
วาดเส้นวงกลมนำทางขนาดพอดีกับแขนผู้ฝึก
```

| รายละเอียด | ค่า |
|-----------|-----|
| **Operation** | วาด 72 จุด bezier curve |
| **ใช้ CPU** | ต่ำมาก |
| **ความสำคัญ** | สูง - ช่วยให้เห็นว่าควรม้วนแขนไปทางไหน |

---

### 1.2 Skeleton (โครงผู้ฝึก) 🦴

```
วาดโครงกระดูก 33 จุด + เส้นเชื่อม
```

| รายละเอียด | ค่า |
|-----------|-----|
| **Operation** | drawConnectors + drawLandmarks |
| **ใช้ CPU** | ต่ำ |
| **ความสำคัญ** | สูง - แสดงว่า MediaPipe ตรวจจับถูกต้อง |

---

### 1.3 Instructor Thumbnail (เงาครูฝึกมุมขวาบน) 🎬

```
วิดีโอเงาครูฝึกขนาดเล็ก (150-400px) มุมขวาบน
```

| รายละเอียด | ค่า |
|-----------|-----|
| **Operation** | Video decode + drawImage + mirror |
| **ใช้ CPU** | ปานกลาง |
| **ความสำคัญ** | ปานกลาง - อ้างอิงท่าที่ถูกต้อง |

---

### 1.4 Ghost Overlay (เงาครูฝึกบนวิดีโอ) 👻

```
เงาครูฝึกซ้อนบนวิดีโอหลัก (เต็มจอ)
```

| รายละเอียด | ค่า |
|-----------|-----|
| **Operation** | Video decode full canvas |
| **ใช้ CPU** | ปานกลาง-สูง |
| **Default** | OFF (ใช้ Instructor แทน) |

> ⚠️ ซ้ำกับ Instructor - เลือกอย่างใดอย่างหนึ่ง

---

### 1.5 Silhouette (เงาผู้ฝึก) 👤

```
เงาร่างกายผู้ฝึกจาก Segmentation Mask
```

| รายละเอียด | ค่า |
|-----------|-----|
| **Operation** | Pixel-level segmentation |
| **ใช้ CPU/GPU** | สูงมาก |
| **MediaPipe** | ต้องเปิด `enableSegmentation: true` |
| **Default** | OFF |

> ⚠️ **หนักที่สุด** - ใช้เฉพาะ PC ที่แรงเพียงพอ

---

## 2. FPS Impact Analysis

### ตาราง Performance

| Option | Est. Time/Frame | FPS Impact |
|--------|-----------------|------------|
| Base (video only) | ~10ms | ~100 fps |
| + Path | +0.1-0.2ms | 🟢 ต่ำ |
| + Skeleton | +0.2-0.4ms | 🟢 ต่ำ |
| + Instructor | +0.5-1.5ms | 🟡 กลาง |
| + Ghost | +1-2ms | 🟡 กลาง |
| + Silhouette | +2-4ms | 🔴 สูง |

### Combinations

| Configuration | Est. FPS (PC) | Est. FPS (Tablet) |
|--------------|---------------|-------------------|
| Default (Path+Skel+Instr) | ~80 fps | **~25-30 fps** |
| Minimal (Path+Skel only) | ~95 fps | **~35-40 fps** |
| All OFF | ~100 fps | ~50 fps |
| All ON | ~50 fps | ⚠️ **~15-20 fps** |

---

## 3. Device Performance

### 3.1 Desktop/Laptop (แนะนำ)

| Spec | Minimum | Recommended |
|------|---------|-------------|
| CPU | Intel i3 / Ryzen 3 | Intel i5+ / Ryzen 5+ |
| RAM | 4GB | 8GB+ |
| GPU | Integrated | Dedicated (optional) |
| Browser | Chrome 90+ | Chrome/Edge latest |

**Expected FPS:** 60-100 fps ✅

---

### 3.2 Tablet 📱

| Spec | Minimum | Recommended |
|------|---------|-------------|
| CPU | Snapdragon 660+ | Snapdragon 870+ / Apple M1 |
| RAM | 4GB | 6GB+ |
| OS | Android 10+ | Android 12+ / iPadOS 15+ |
| Browser | Chrome 100+ | Chrome/Safari latest |

**Expected FPS:**
- High-end tablet (iPad Pro, Galaxy Tab S8): **30-40 fps** ✅
- Mid-range tablet: **20-30 fps** ⚠️
- Low-end tablet: **<20 fps** ❌

### 3.3 Tablet Recommendations

| สถานการณ์ | คำแนะนำ |
|----------|---------|
| **iPad Pro / Tab S8+** | Default settings OK |
| **Mid-range tablet** | ปิด Instructor หรือลดขนาด |
| **Low-end tablet** | Path + Skeleton เท่านั้น |

### Tablet-Specific Settings

```javascript
// สำหรับ tablet ที่ช้า
showPath = true;       // ✅ เปิด
showSkeleton = true;   // ✅ เปิด
showInstructor = false; // ❌ ปิด
showGhost = false;     // ❌ ปิด
showSilhouette = false; // ❌ ปิด
```

---

## 4. Optimization Tips

### 4.1 General Tips

| Tip | รายละเอียด |
|-----|-----------|
| ปิด tab อื่น | ลด memory pressure |
| ใช้ Chrome | เร็วกว่า browser อื่น |
| ปิด extensions | Ad blockers ช้า |
| เสียบปลั๊ก | Battery mode = throttled CPU |

### 4.2 Display Options Priority

เรียงจากสำคัญมาก → น้อย:

1. **Path** - จำเป็น (เห็นว่าควรม้วนไปทางไหน)
2. **Skeleton** - แนะนำ (เห็นว่าตรวจจับถูก)
3. **Instructor** - เสริม (อ้างอิงท่า)
4. **Ghost** - ไม่จำเป็น (ซ้ำกับ Instructor)
5. **Silhouette** - หนักมาก (ใช้ PC เท่านั้น)

### 4.3 Low Performance Mode

สำหรับเครื่องช้า:

```
✅ Path: ON
✅ Skeleton: ON
❌ Instructor: OFF
❌ Ghost: OFF
❌ Silhouette: OFF
❌ Debug: OFF
```

---

## 5. MediaPipe Configuration

### 5.1 Model Complexity

```javascript
pose.setOptions({
  modelComplexity: 1,  // 0=Lite, 1=Full, 2=Heavy
});
```

| Value | ชื่อ | Accuracy | Speed | Use Case |
|:-----:|------|----------|-------|----------|
| **0** | Lite | ⭐⭐ | ⚡⚡⚡ | Mobile/Tablet, Low-end PC |
| **1** | Full | ⭐⭐⭐ | ⚡⚡ | **Default** - Desktop |
| **2** | Heavy | ⭐⭐⭐⭐ | ⚡ | High accuracy needed |

### 5.2 Performance Impact

| Setting | PC (i5) | Tablet | Landmark Accuracy |
|---------|---------|--------|-------------------|
| `complexity: 0` | ~50 fps | ~25-30 fps | ดี (บางครั้งกระตุก) |
| `complexity: 1` | ~35 fps | ~18-22 fps | **ดีมาก** |
| `complexity: 2` | ~20 fps | ~10-12 fps | ดีเยี่ยม |

### 5.3 enableSegmentation

```javascript
pose.setOptions({
  enableSegmentation: true,  // สำหรับ Silhouette feature
});
```

| Setting | Impact | หมายเหตุ |
|---------|--------|---------|
| `true` | **-5 to -10 fps** | จำเป็นถ้าใช้ Silhouette |
| `false` | +5 to +10 fps | ปิดถ้าไม่ใช้ Silhouette |

> ⚠️ **ปัจจุบัน:** `enableSegmentation: true` เปิดอยู่  
> ถ้าไม่ใช้ Silhouette → สามารถปิดเพื่อเพิ่ม performance ได้

### 5.4 ผลกระทบต่อ Landmark Detection

| Complexity | จุดแข็ง | จุดอ่อน |
|:----------:|--------|--------|
| 0 (Lite) | เร็ว, ใช้ RAM น้อย | บางครั้งข้อมือ/ข้อเท้าหาย |
| 1 (Full) | สมดุล accuracy/speed | - |
| 2 (Heavy) | แม่นยำมากแม้ท่ายาก | ช้า, ใช้ RAM มาก |

**สำหรับ TaijiFlow (ท่าม้วนไหม):**
- ต้องการ wrist tracking แม่นยำ → **complexity ≥ 1**
- Lite mode อาจทำให้ข้อมือหายเมื่อม้วนเร็ว

---

## 6. Heuristics Engine Performance

### 6.1 Current Settings

```javascript
const HEURISTICS_CHECK_INTERVAL = 9;  // ตรวจทุก 9 frames
// 30 fps → 3.3 checks/sec
```

| Setting | Checks/sec | CPU Load | Feedback Delay |
|---------|------------|----------|----------------|
| `INTERVAL = 3` | ~10/sec | 🔴 สูง | ~100ms |
| `INTERVAL = 9` | ~3.3/sec | 🟢 ต่ำ | **~300ms** |
| `INTERVAL = 15` | ~2/sec | 🟢 ต่ำมาก | ~500ms |

### 6.2 Rules Checked (8 กฎ)

| Rule | Operations | Cost |
|------|-----------|------|
| Path Shape | Array iteration, direction calc | 🟡 กลาง |
| Arm Rotation | Thumb-pinky comparison | 🟢 ต่ำ |
| Elbow Sinking | Y-coordinate comparison | 🟢 ต่ำ |
| Waist Initiation | Angular velocity calc | 🟡 กลาง |
| Vertical Stability | Head history analysis | 🟡 กลาง |
| Smoothness | Acceleration calc | 🟢 ต่ำ |
| Continuity | Velocity check | 🟢 ต่ำ |
| Weight Shift | Center of mass calc | 🟢 ต่ำ |

**Total:** ~2-5ms per check (รวม 8 กฎ)

---

## 7. Other Components

### 7.1 Audio Manager (TTS)

| Operation | Trigger | CPU Impact |
|-----------|---------|------------|
| `speakFeedback()` | เมื่อมี error | 🟢 ต่ำ (~0.1ms) |
| TTS Engine | ทุก 3 วินาที (cooldown) | 🟢 async, ไม่ block |

### 7.2 Feedback Overlay

| Operation | Trigger | CPU Impact |
|-----------|---------|------------|
| `updateFeedbackOverlay()` | ทุก 9 frames | 🟢 ต่ำ (~0.1ms) |
| HTML DOM update | ไม่บ่อย (cooldown 5s) | 🟢 ต่ำ |

### 7.3 Debug Overlay

| Operation | Trigger | CPU Impact |
|-----------|---------|------------|
| `updateDebugOverlay()` | กด D เปิด | 🟢 ต่ำ (~0.1ms) |
| Default | OFF | ไม่กระทบ |

### 7.4 Scoring Manager

| Operation | Trigger | CPU Impact |
|-----------|---------|------------|
| `recordFrame()` | ทุก 9 frames | 🟢 ต่ำมาก (~0.05ms) |

---

## 8. Performance Breakdown (รวม)

### 8.1 เวลาใน 1 Frame (ประมาณ)

```
┌─────────────────────────────────────────┐
│ MediaPipe Pose          │████████░│ 80% │  15-25ms
│ Display Options         │██░░░░░░░│ 15% │  2-5ms
│ Heuristics (1/9 frames) │░░░░░░░░░│ 3%  │  0.5-1ms
│ Others (Audio, UI, etc) │░░░░░░░░░│ 2%  │  0.2-0.5ms
└─────────────────────────────────────────┘
```

### 8.2 สรุป: ใครหนักที่สุด

| Component | % ของเวลา | สามารถ optimize? |
|-----------|----------|-----------------|
| **MediaPipe Pose** | ~80% | ✅ ลด complexity |
| **Segmentation** | ~10% | ✅ ปิดถ้าไม่ใช้ |
| Display Options | ~8% | ✅ ปิดบางอัน |
| Heuristics | ~2% | ✅ เพิ่ม interval |

---

## 9. Optimization Recommendations

### 9.1 สำหรับ Tablet

```javascript
// Recommended settings for tablets
pose.setOptions({
  modelComplexity: 0,         // Lite model
  enableSegmentation: false,  // ปิด (ไม่ใช้ Silhouette)
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

// Display
showPath = true;
showSkeleton = true;
showInstructor = false;  // ปิดเพื่อประหยัด
showSilhouette = false;

// Heuristics
const HEURISTICS_CHECK_INTERVAL = 15;  // ลดความถี่
```

**Expected improvement:** +10-15 fps on tablets

### 9.2 สำหรับ Low-end PC

```javascript
// เหมือน tablet settings
pose.setOptions({
  modelComplexity: 1,         // ยังใช้ Full ได้
  enableSegmentation: false,  // ปิด
});
```

### 9.3 Maximum Performance Mode

```javascript
// Ultra-low latency (trading accuracy)
pose.setOptions({
  modelComplexity: 0,
  enableSegmentation: false,
  smoothLandmarks: false,     // ปิด smoothing
  minDetectionConfidence: 0.3,
  minTrackingConfidence: 0.3,
});
```

---

## 📱 Tablet Summary

| Tablet | รองรับ | หมายเหตุ |
|--------|:------:|---------|
| iPad Pro (M1/M2) | ✅ | ใช้ได้ปกติ |
| iPad Air | ✅ | ปิด Instructor ถ้าช้า |
| iPad (9th gen) | ⚠️ | Minimal mode |
| Galaxy Tab S8+ | ✅ | ใช้ได้ปกติ |
| Galaxy Tab S6 Lite | ⚠️ | Minimal mode |
| Xiaomi Pad 5 | ⚠️ | ปิด Instructor |

> **สรุป:** Tablet ระดับกลาง-สูงใช้งานได้ดี  
> Tablet ระดับต่ำควรใช้ Minimal mode

---

*เอกสารนี้ใช้สำหรับ troubleshooting และ optimization*

