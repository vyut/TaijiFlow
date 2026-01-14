# TaijiFlow AI - Display Controller Documentation

**Version:** 1.1  
**Last Updated:** 2026-01-14  
**Lines:** 296  
**Class:** DisplayController

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Display Options](#2-display-options)
3. [Trail Visualization](#3-trail-visualization)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`DisplayController` จัดการ Display Options ทั้งหมด (checkboxes และ visual toggles)

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Toggle Management** | จัดการ 6 display toggles |
| **Trail Tracking** | บันทึกเส้นทางการเคลื่อนไหว |
| **Checkbox Sync** | Sync state กับ UI checkboxes |
| **Dynamic Segmentation** | เปิด/ปิด pose segmentation |

### 📊 การใช้งาน

```javascript
const displayController = new DisplayController({
  displayBtn: document.getElementById('display-btn'),
  displayMenu: document.getElementById('display-menu'),
  checkGhost: document.getElementById('check-ghost'),
  checkInstructor: document.getElementById('check-instructor'),
  checkPath: document.getElementById('check-path'),
  checkSkeleton: document.getElementById('check-skeleton'),
  checkSilhouette: document.getElementById('check-silhouette'),
  ghostManager: ghostManager,
  instructorThumbnail: document.getElementById('instructor-thumbnail'),
  silhouetteManager: silhouetteManager
});
```

---

## 2. Display Options

### State Variables

| Variable | Type | Default | Description |
|----------|------|:-------:|-------------|
| `showGhostOverlay` | boolean | `false` | เงาครูฝึกบนวิดีโอหลัก |
| `showInstructor` | boolean | `true` | Thumbnail ครูฝึกมุมขวาบน |
| `showPath` | boolean | `true` | เส้นทางต้นแบบ |
| `showSkeleton` | boolean | `true` | โครงกระดูกผู้ฝึก |
| `showSilhouette` | boolean | `false` | เงาผู้ฝึก |
| `showTrail` | boolean | `true` | เส้นทางการเคลื่อนไหว |
| `showBlurBackground` | boolean | `false` | 🆕 Visual Effects: เบลอฉากหลัง |

### Toggle Behavior

```
┌─────────────────────────────────────┐
│          Display Options            │
├─────────────────────────────────────┤
│ ☐ Ghost      - เงาครูบนวิดีโอ     │
│ ☑ Instructor - Thumbnail มุมบน    │
│ ☑ Path       - เส้นทางอ้างอิง     │
│ ☑ Skeleton   - โครงกระดูก (K)   │
│ ☐ Silhouette - เงาผู้ฝึก         │
│ ☑ Trail      - เส้นทางมือ        │
├─────────────────────────────────────┤
│ 🎨 Visual Effects                   │
│ ☐ Blur Background - เบลอฉากหลัง (B)│
└─────────────────────────────────────┘
```

---

## 3. Trail Visualization

### Configuration

| Parameter | Value | Description |
|-----------|:-----:|-------------|
| `TRAIL_LENGTH` | 60 | จำนวน points สูงสุด |
| `trailHistory` | Array | เก็บ {x, y, timestamp} |
| `circularityScore` | number | คะแนนความเป็นวงกลม |

### Trail Data Structure

```javascript
trailHistory = [
  { x: 0.5, y: 0.3, timestamp: 1234567890 },
  { x: 0.52, y: 0.32, timestamp: 1234567923 },
  // ... max 60 points
];
```

---

## 4. Methods Reference

### Initialization Methods

| Method | Description |
|--------|-------------|
| `init()` | Initialize all display options |
| `initDropdown()` | Setup dropdown toggle behavior |
| `initGhostCheckbox()` | Setup Ghost checkbox |
| `initInstructorCheckbox()` | Setup Instructor checkbox |
| `initPathCheckbox()` | Setup Path checkbox |
| `initSkeletonCheckbox()` | Setup Skeleton checkbox |
| `initSilhouetteCheckbox()` | Setup Silhouette checkbox |
| `initTrailCheckbox()` | Setup Trail checkbox |
| `initBlurBackgroundCheckbox()` | 🆕 Setup Blur Background checkbox |

### Control Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `toggleInstructor(show)` | boolean | void | Toggle instructor thumbnail |
| `resetToDefaults()` | - | void | Reset ทุกค่าเป็น default |

### Trail Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `addTrailPoint(x, y)` | number, number | void | เพิ่ม point ใน trail |
| `clearTrail()` | - | void | ล้าง trail history |

---

## 5. Code Examples

### Ghost Toggle with Manager

```javascript
initGhostCheckbox() {
  const { checkGhost, ghostManager } = this.deps;
  
  if (checkGhost) {
    checkGhost.checked = this.showGhostOverlay;
    checkGhost.addEventListener('change', () => {
      this.showGhostOverlay = checkGhost.checked;
      if (this.showGhostOverlay) {
        ghostManager.start();
      } else {
        ghostManager.stop();
      }
    });
  }
}
```

### Dynamic Segmentation Toggle

```javascript
initSilhouetteCheckbox() {
  checkSilhouette.addEventListener('change', () => {
    this.showSilhouette = checkSilhouette.checked;
    
    // Update MediaPipe options for performance
    if (typeof pose !== 'undefined') {
      pose.setOptions({
        enableSegmentation: this.showSilhouette,
        smoothSegmentation: this.showSilhouette
      });
    }
    
    if (this.showSilhouette) {
      silhouetteManager.enable();
      console.log('⚠️ Silhouette enabled');
    } else {
      silhouetteManager.disable();
      console.log('✅ Silhouette disabled (+5-10 fps)');
    }
  });
}
```

### Reset to Defaults

```javascript
resetToDefaults() {
  this.showGhostOverlay = false;
  this.showInstructor = true;
  this.showPath = true;
  this.showSkeleton = true;
  this.showSilhouette = false;
  this.showTrail = true;
  this.trailHistory = [];
  this.circularityScore = null;
  
  // Sync checkboxes
  if (checkGhost) checkGhost.checked = false;
  if (checkInstructor) checkInstructor.checked = true;
  // ... etc
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
