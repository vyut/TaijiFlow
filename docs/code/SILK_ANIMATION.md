# TaijiFlow AI - Silk Animation Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** ~220  
**Class:** SilkReelingAnimation

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Animation Parameters](#2-animation-parameters)
3. [Wave Calculation](#3-wave-calculation)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`SilkReelingAnimation` สร้าง Animation สำหรับ Landing Page (เส้นม้วนไหม)

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Canvas Animation** | วาดด้วย HTML5 Canvas |
| **Wave Effect** | เส้นโค้งแบบ sine wave |
| **Responsive** | ปรับขนาดตาม viewport |
| **Auto-initialize** | เริ่มอัตโนมัติ |

### 📊 การใช้งาน

```javascript
// Auto-initialize เมื่อ DOM ready
const animation = new SilkReelingAnimation();

// หรือสร้างเอง
const canvas = document.getElementById('silk-canvas');
const anim = new SilkReelingAnimation(canvas);
anim.start();
```

---

## 2. Animation Parameters

### Configuration

| Parameter | Value | Description |
|-----------|:-----:|-------------|
| Wave count | 3 | จำนวน waves |
| Base speed | 0.02 | ความเร็วพื้นฐาน |
| Line count | 8 | จำนวนเส้น |
| Opacity range | 0.3 - 0.7 | ความโปร่งใส |

### Colors

```javascript
const COLORS = [
  'rgba(139, 92, 246, 0.6)',   // Purple
  'rgba(236, 72, 153, 0.5)',   // Pink
  'rgba(59, 130, 246, 0.4)',   // Blue
];
```

---

## 3. Wave Calculation

### Sine Wave Formula

```
y = amplitude × sin(frequency × x + phase + time)

Where:
- amplitude = canvas.height × 0.2
- frequency = π / canvas.width × 2
- phase = offset per line
- time = continuously incrementing
```

### Visual Effect

```
     ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿     Line 1 (top)
    ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿     Line 2
   ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿     Line 3
  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿     Line 4
 ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿     Line 5
∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿     Line 6
 ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿     Line 7
  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿     Line 8 (bottom)
```

---

## 4. Methods Reference

### Lifecycle

| Method | Description |
|--------|-------------|
| `constructor(canvas)` | Initialize with canvas element |
| `start()` | เริ่ม animation loop |
| `stop()` | หยุด animation |
| `resize()` | ปรับขนาด canvas |

### Drawing

| Method | Description |
|--------|-------------|
| `draw()` | วาด 1 frame |
| `drawLine(y, phase, color)` | วาดเส้นโค้ง 1 เส้น |
| `clear()` | ล้าง canvas |

### Animation Loop

| Method | Description |
|--------|-------------|
| `animate()` | Main animation loop |
| `updateTime()` | อัปเดต time variable |

---

## 5. Code Examples

### Constructor

```javascript
class SilkReelingAnimation {
  constructor(canvas) {
    this.canvas = canvas || document.getElementById('silk-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Animation state
    this.time = 0;
    this.isRunning = false;
    this.animationId = null;
    
    // Configuration
    this.config = {
      waveCount: 3,
      baseSpeed: 0.02,
      lineCount: 8,
      minOpacity: 0.3,
      maxOpacity: 0.7
    };
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
}
```

### Start Animation

```javascript
start() {
  if (this.isRunning) return;
  
  this.isRunning = true;
  this.animate();
}

stop() {
  this.isRunning = false;
  if (this.animationId) {
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
}
```

### Animation Loop

```javascript
animate() {
  if (!this.isRunning) return;
  
  this.clear();
  this.draw();
  this.updateTime();
  
  this.animationId = requestAnimationFrame(() => this.animate());
}

updateTime() {
  this.time += this.config.baseSpeed;
}
```

### Draw Lines

```javascript
draw() {
  const { lineCount, minOpacity, maxOpacity } = this.config;
  const height = this.canvas.height;
  
  for (let i = 0; i < lineCount; i++) {
    const y = height * (i + 1) / (lineCount + 1);
    const phase = (i / lineCount) * Math.PI * 2;
    const opacity = minOpacity + (maxOpacity - minOpacity) * Math.random();
    const color = this.getColor(i, opacity);
    
    this.drawLine(y, phase, color);
  }
}

drawLine(baseY, phase, color) {
  const ctx = this.ctx;
  const width = this.canvas.width;
  const amplitude = this.canvas.height * 0.08;
  const frequency = Math.PI * 2 / width;
  
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  
  for (let x = 0; x < width; x += 2) {
    const y = baseY + amplitude * Math.sin(
      frequency * x * this.config.waveCount + phase + this.time
    );
    ctx.lineTo(x, y);
  }
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}
```

### Resize Handler

```javascript
resize() {
  const parent = this.canvas.parentElement;
  this.canvas.width = parent.clientWidth;
  this.canvas.height = parent.clientHeight;
}
```

### Auto Initialize

```javascript
// At end of file
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('silk-canvas');
  if (canvas) {
    const animation = new SilkReelingAnimation(canvas);
    animation.start();
  }
});
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
