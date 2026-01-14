# TaijiFlow AI - Drawing Manager Documentation

**Version:** 1.2  
**Last Updated:** 2026-01-14  
**Lines:** ~661  
**Class:** DrawingManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Drawing Features](#2-drawing-features)
3. [Mirror Handling](#3-mirror-handling)
4. [Color System](#4-color-system)
5. [Methods Reference](#5-methods-reference)
6. [Code Examples](#6-code-examples)

---

## 1. ภาพรวม

`DrawingManager` รับผิดชอบการวาดภาพทั้งหมดลงบน Canvas

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Skeleton Drawing** | วาดโครงกระดูกจาก landmarks |
| **Reference Path** | วาดเส้นทางวงกลมนำทาง |
| **Ghost Overlay** | วาดเงาครูฝึก |
| **Trail Drawing** | วาดเส้นทางการเคลื่อนไหว |
| **Feedback Panel** | กล่องแสดงข้อผิดพลาด |
| **Debug Overlay** | แสดงค่า Threshold |
| **Blurred Background** | 🆕 เบลอฉากหลัง (Visual Effects) |

### 📊 การใช้งาน

```javascript
const drawer = new DrawingManager(canvas, ctx);

// ในแต่ละ frame
drawer.clear();
drawer.drawSkeleton(landmarks);
drawer.drawPath(pathPoints);
drawer.drawTrail(trailHistory);
drawer.drawFeedbackPanel(feedbacks);
```

---

## 2. Drawing Features

### 2.1 Skeleton Drawing

วาดโครงกระดูกจาก MediaPipe landmarks (33 points)

```javascript
drawer.drawSkeleton(landmarks, {
  color: 'rgba(0, 255, 0, 0.8)',
  lineWidth: 2,
  pointRadius: 4
});
```

### 2.2 Reference Path

วาดเส้นทางวงรีที่ผู้ฝึกควรทำตาม

```javascript
drawer.drawPath(pathPoints, {
  color: 'rgba(139, 92, 246, 0.6)', // Purple
  lineWidth: 4,
  dashed: true
});
```

### 2.3 Ghost Skeleton

วาดเงาครูฝึกจาก reference data

```javascript
drawer.drawGhostSkeleton(ghostLandmarks, {
  color: 'rgba(100, 200, 255, 0.4)',
  lineWidth: 3
});
```

### 2.4 Trail Visualization

วาดเส้นทางการเคลื่อนไหวของมือ

```javascript
drawer.drawTrail(trailHistory, {
  color: 'rgba(236, 72, 153, 0.7)', // Pink
  gradient: true,
  fadeOut: true
});
```

### 2.5 Feedback Panel

วาดกล่องแสดง feedback

```javascript
drawer.drawFeedbackPanel(['ศอกสูงไป', 'เส้นทางเบี่ยง'], {
  position: 'top-left',
  opacity: 0.8
});
```

---

## 3. Mirror Handling

### ปัญหา

```
Webcam      →  Video Element  →  Canvas
(mirrored)     (mirrored)       (NOT mirrored!)

ผลลัพธ์: Skeleton วาดไม่ตรงกับ Video!
```

### วิธีแก้

```javascript
// Mirror canvas ก่อนวาด
ctx.save();
ctx.scale(-1, 1);
ctx.translate(-canvasWidth, 0);

// ... draw skeleton, path, etc ...

ctx.restore();
```

### Configuration

| Setting | Value | Description |
|---------|:-----:|-------------|
| `mirrorMode` | true | Mirror ทุกอย่าง |
| `flipX` | -1 | Scale factor |

---

## 4. Color System

### Skeleton Colors

| Element | Color | Meaning |
|---------|-------|---------|
| Body | Green | ปกติ |
| Active Arm | Cyan | แขนที่กำลังใช้ |
| Error | Red | มีข้อผิดพลาด |

### Path Colors

| State | Color | Opacity |
|-------|-------|:-------:|
| Reference | Purple | 0.6 |
| User Trail | Pink | 0.7 |
| Ghost | Cyan | 0.4 |

### Gradient Trail

```javascript
// Fade out จากใหม่ไปเก่า
const gradient = ctx.createLinearGradient(...);
gradient.addColorStop(0, 'rgba(236, 72, 153, 0.8)'); // ใหม่สุด
gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)'); // เก่าสุด
```

---

## 5. Methods Reference

### Initialization

| Method | Parameters | Description |
|--------|------------|-------------|
| `constructor(canvas, ctx)` | HTMLCanvas, Context2D | Initialize |
| `setMirror(enabled)` | boolean | เปิด/ปิด mirror mode |
| `resize(width, height)` | number, number | ปรับขนาด canvas |

### Drawing Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `clear()` | - | ล้าง canvas |
| `drawSkeleton(landmarks, options)` | Array, Object | วาดโครงกระดูก |
| `drawGhostSkeleton(landmarks, options)` | Array, Object | วาด Ghost |
| `drawPath(points, options)` | Array, Object | วาด Reference Path |
| `drawTrail(history, options)` | Array, Object | วาด Trail |
| `drawBlurredBackground(ctx, image, mask)` | Context, Image, Mask | 🆕 วาดฉากหลังเบลอ |
| `drawFeedbackPanel(msgs, options)` | Array, Object | วาดกล่อง feedback |
| `drawDebugOverlay(data)` | Object | วาด debug info |

### Utility Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `landmarkToPixel(landmark)` | Object | Object | แปลง normalized → pixel |
| `drawLine(p1, p2, color, width)` | Objects, string, number | void | วาดเส้น |
| `drawCircle(x, y, r, color)` | numbers, string | void | วาดวงกลม |

---

## 6. Code Examples

### Constructor

```javascript
class DrawingManager {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.mirrorMode = true;
    
    // Skeleton connections
    this.POSE_CONNECTIONS = [
      [11, 12], // shoulders
      [11, 13], [13, 15], // left arm
      [12, 14], [14, 16], // right arm
      [11, 23], [12, 24], // torso
      [23, 24], // hips
      // ... etc
    ];
  }
}
```

### Clear Canvas

```javascript
clear() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}
```

### Draw Skeleton with Mirror

```javascript
drawSkeleton(landmarks, options = {}) {
  if (!landmarks) return;
  
  const ctx = this.ctx;
  const { color = '#00ff00', lineWidth = 2 } = options;
  
  // Apply mirror transform
  ctx.save();
  if (this.mirrorMode) {
    ctx.scale(-1, 1);
    ctx.translate(-this.canvas.width, 0);
  }
  
  // Draw connections
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  
  for (const [start, end] of this.POSE_CONNECTIONS) {
    const p1 = landmarks[start];
    const p2 = landmarks[end];
    
    if (p1.visibility > 0.5 && p2.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo(p1.x * this.canvas.width, p1.y * this.canvas.height);
      ctx.lineTo(p2.x * this.canvas.width, p2.y * this.canvas.height);
      ctx.stroke();
    }
  }
  
  // Draw points
  for (const lm of landmarks) {
    if (lm.visibility > 0.5) {
      ctx.beginPath();
      ctx.arc(
        lm.x * this.canvas.width,
        lm.y * this.canvas.height,
        4, 0, Math.PI * 2
      );
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
  
  ctx.restore();
}
```

### Draw Reference Path

```javascript
drawPath(points, options = {}) {
  if (!points || points.length < 2) return;
  
  const ctx = this.ctx;
  const { color = '#8b5cf6', lineWidth = 4, dashed = true } = options;
  
  ctx.save();
  if (this.mirrorMode) {
    ctx.scale(-1, 1);
    ctx.translate(-this.canvas.width, 0);
  }
  
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  if (dashed) ctx.setLineDash([10, 5]);
  
  ctx.beginPath();
  ctx.moveTo(
    points[0].x * this.canvas.width,
    points[0].y * this.canvas.height
  );
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(
      points[i].x * this.canvas.width,
      points[i].y * this.canvas.height
    );
  }
  
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.restore();
}
```

### Draw Trail with Gradient

```javascript
drawTrail(history, options = {}) {
  if (!history || history.length < 2) return;
  
  const ctx = this.ctx;
  const { baseColor = [236, 72, 153] } = options; // Pink
  
  ctx.save();
  if (this.mirrorMode) {
    ctx.scale(-1, 1);
    ctx.translate(-this.canvas.width, 0);
  }
  
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    
    // Fade out older points
    const alpha = (i / history.length) * 0.8;
    ctx.strokeStyle = `rgba(${baseColor.join(',')}, ${alpha})`;
    
    ctx.beginPath();
    ctx.moveTo(prev.x * this.canvas.width, prev.y * this.canvas.height);
    ctx.lineTo(curr.x * this.canvas.width, curr.y * this.canvas.height);
    ctx.stroke();
  }
  
  ctx.restore();
}
```

### Draw Feedback Panel

```javascript
drawFeedbackPanel(messages, options = {}) {
  if (!messages || messages.length === 0) return;
  
  const ctx = this.ctx;
  const { x = 20, y = 20, opacity = 0.8 } = options;
  
  // Background
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  const panelHeight = 30 + messages.length * 25;
  ctx.fillRect(x, y, 250, panelHeight);
  
  // Border
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 250, panelHeight);
  
  // Title
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('⚠️ Feedback', x + 10, y + 20);
  
  // Messages
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px sans-serif';
  messages.forEach((msg, i) => {
    ctx.fillText(`• ${msg}`, x + 10, y + 45 + i * 25);
  });
}
```

---

*เอกสารนี้อัปเดต: 2026-01-14*
