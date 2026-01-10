# TaijiFlow AI - Ghost Manager Documentation

**Version:** 0.2  
**Last Updated:** 2026-01-10  
**Lines:** 261  
**Class:** GhostManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Reference Data](#2-reference-data)
3. [Playback System](#3-playback-system)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`GhostManager` จัดการ Ghost (เงาครูฝึก) ที่แสดงเป็น Reference

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Reference Playback** | เล่น landmark data แบบ loop |
| **Silhouette Video** | รองรับ video silhouette |
| **Speed Control** | ปรับความเร็ว (0.5x - 2.0x) |
| **Opacity Control** | ปรับความโปร่งใส |

### 📊 การใช้งาน

```javascript
const ghostManager = new GhostManager();

// โหลด reference data
ghostManager.load(referenceData);

// เริ่มเล่น
ghostManager.start();

// ในแต่ละ frame
ghostManager.update();
const frame = ghostManager.getCurrentFrame();
drawer.drawGhostSkeleton(frame);
```

---

## 2. Reference Data

### Data Structure

```javascript
referenceData = [
  { timestamp: 0, landmarks: [...33 landmarks...] },
  { timestamp: 33, landmarks: [...33 landmarks...] },
  { timestamp: 66, landmarks: [...33 landmarks...] },
  // ... ~30 fps for 10 seconds = 300 frames
];
```

### Landmark Format

```javascript
landmark = {
  x: 0.5,      // 0.0 - 1.0 (normalized)
  y: 0.3,      // 0.0 - 1.0 (normalized)
  z: -0.1,     // depth (can be negative)
  visibility: 0.99
};
```

---

## 3. Playback System

### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `isPlaying` | boolean | กำลังเล่นอยู่หรือไม่ |
| `currentIndex` | number | index ของ frame ปัจจุบัน |
| `playbackSpeed` | number | ความเร็ว (default: 1.0) |
| `opacity` | number | ความโปร่งใส (default: 0.6) |
| `lastUpdateTime` | number | เวลาอัปเดตล่าสุด |

### Playback Flow

```
┌─────────────────────────────────────────────────────┐
│                  Playback Flow                      │
├─────────────────────────────────────────────────────┤
│  1. start() → isPlaying = true                      │
│  2. update() → คำนวณ deltaTime                      │
│  3. Advance currentIndex based on speed             │
│  4. Loop back to 0 when reaching end                │
│  5. getCurrentFrame() → return landmarks            │
└─────────────────────────────────────────────────────┘
```

---

## 4. Methods Reference

### Loading

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `load(data)` | Array | boolean | โหลด reference data |
| `loadSilhouetteVideo(url)` | string | Promise | โหลด video silhouette |
| `getSilhouetteVideo()` | - | HTMLVideoElement | ดึง video element |

### Playback Control

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `start()` | - | void | เริ่มเล่น |
| `stop()` | - | void | หยุดเล่น |
| `toggle()` | - | boolean | เปิด/ปิด |
| `update()` | - | void | อัปเดต frame |
| `getCurrentFrame()` | - | Array\|null | ดึง landmarks ปัจจุบัน |

### Settings

| Method | Parameters | Description |
|--------|------------|-------------|
| `setSpeed(speed)` | number | ตั้งความเร็ว (0.5 - 2.0) |
| `setOpacity(opacity)` | number | ตั้งความโปร่งใส (0.0 - 1.0) |

### Information

| Method | Returns | Description |
|--------|---------|-------------|
| `getTotalDuration()` | number | ระยะเวลารวม (ms) |
| `getStatus()` | Object | สถานะปัจจุบัน (debug) |

---

## 5. Code Examples

### Load Reference Data

```javascript
load(data) {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('❌ Invalid reference data');
    return false;
  }
  
  this.referenceData = data;
  this.currentIndex = 0;
  this.isPlaying = false;
  
  console.log(`✅ Loaded ${data.length} frames`);
  return true;
}
```

### Update Frame (in render loop)

```javascript
update() {
  if (!this.isPlaying || !this.referenceData) return;
  
  const now = performance.now();
  const deltaTime = now - this.lastUpdateTime;
  
  // Calculate frame advance
  const frameDuration = 1000 / 30; // 30 fps
  const framesToAdvance = Math.floor(
    (deltaTime * this.playbackSpeed) / frameDuration
  );
  
  if (framesToAdvance > 0) {
    this.currentIndex = 
      (this.currentIndex + framesToAdvance) % this.referenceData.length;
    this.lastUpdateTime = now;
  }
}
```

### Get Current Frame

```javascript
getCurrentFrame() {
  if (!this.referenceData || this.referenceData.length === 0) {
    return null;
  }
  
  return this.referenceData[this.currentIndex]?.landmarks || null;
}
```

### Silhouette Video Loading

```javascript
loadSilhouetteVideo(url) {
  return new Promise((resolve, reject) => {
    this.silhouetteVideo = document.createElement('video');
    this.silhouetteVideo.src = url;
    this.silhouetteVideo.loop = true;
    this.silhouetteVideo.muted = true;
    
    this.silhouetteVideo.onloadeddata = () => {
      console.log('✅ Silhouette video loaded');
      resolve(true);
    };
    
    this.silhouetteVideo.onerror = () => {
      console.error('❌ Failed to load silhouette video');
      reject(false);
    };
  });
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
