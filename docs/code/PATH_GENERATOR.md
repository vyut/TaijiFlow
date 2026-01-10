# TaijiFlow AI - Path Generator Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** ~130  
**Class/Module:** PathGenerator

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Path Calculation](#2-path-calculation)
3. [Exercise Configurations](#3-exercise-configurations)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`PathGenerator` สร้าง Dynamic Reference Path จาก calibration data

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Shape-Based Path** | สร้างวงรีตาม shoulder width |
| **Adaptive Size** | ปรับขนาดตามผู้ฝึก |
| **Direction Support** | CW และ CCW |

### 📊 การใช้งาน

```javascript
// สร้าง path สำหรับท่า
const path = generateDynamicPath(calibrationData, 'rh_cw');

// path = array of {x, y} points
drawPath(ctx, path);
```

---

## 2. Path Calculation

### Ellipse Parameters

```
                    ← radiusX →
                    
         ╭─────────────────────╮  ↑
        ╱                       ╲ │
       │                         │ radiusY
       │       ● center          │ │
        ╲                       ╱ │
         ╰─────────────────────╯  ↓

centerX = shoulderMidpoint.x
centerY = shoulder.y + offset
radiusX = shoulderWidth * 0.5
radiusY = shoulderWidth * 0.4
```

### Formulas

```javascript
// Center calculation
centerX = (leftShoulder.x + rightShoulder.x) / 2;
centerY = leftShoulder.y + (shoulderWidth * 0.3);

// Radius calculation
radiusX = shoulderWidth * 0.5;  // Horizontal
radiusY = shoulderWidth * 0.4;  // Vertical (slightly smaller)

// Point on ellipse
x = centerX + radiusX * Math.cos(angle);
y = centerY + radiusY * Math.sin(angle);
```

---

## 3. Exercise Configurations

### 4 ท่าฝึก

| Exercise | Hand | Direction | Start Angle |
|----------|:----:|:---------:|:-----------:|
| `rh_cw` | Right | Clockwise | 0° |
| `rh_ccw` | Right | Counter-CW | 0° |
| `lh_cw` | Left | Clockwise | 180° |
| `lh_ccw` | Left | Counter-CW | 180° |

### Center Offset

| Hand | X Offset |
|:----:|:--------:|
| Right | +0.1 × shoulderWidth |
| Left | -0.1 × shoulderWidth |

---

## 4. Methods Reference

### Path Generation

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `generateDynamicPath(calib, exercise)` | Object, string | Array | สร้าง path points |
| `generateEllipse(cx, cy, rx, ry, clockwise)` | numbers, bool | Array | สร้างจุดวงรี |

### Utilities

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getExerciseConfig(exercise)` | string | Object | ดึง config ของท่า |
| `calculateCenter(calib, hand)` | Object, string | Object | คำนวณจุดศูนย์กลาง |
| `calculateRadius(calib)` | Object | Object | คำนวณรัศมี |

---

## 5. Code Examples

### Generate Dynamic Path

```javascript
function generateDynamicPath(calibrationData, exercise) {
  const { shoulderWidth, leftShoulder, rightShoulder } = calibrationData;
  
  // Get exercise config
  const config = getExerciseConfig(exercise);
  const hand = config.hand;  // 'right' or 'left'
  const clockwise = config.clockwise;
  
  // Calculate center
  const centerX = (leftShoulder.x + rightShoulder.x) / 2;
  let centerY = leftShoulder.y + (shoulderWidth * 0.3);
  
  // Offset for hand
  const xOffset = hand === 'right' 
    ? shoulderWidth * 0.1 
    : shoulderWidth * -0.1;
  
  // Calculate radius
  const radiusX = shoulderWidth * 0.5;
  const radiusY = shoulderWidth * 0.4;
  
  // Generate ellipse points
  return generateEllipse(
    centerX + xOffset,
    centerY,
    radiusX,
    radiusY,
    clockwise
  );
}
```

### Generate Ellipse Points

```javascript
function generateEllipse(cx, cy, rx, ry, clockwise = true, points = 60) {
  const path = [];
  const direction = clockwise ? 1 : -1;
  
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI * direction;
    path.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle)
    });
  }
  
  return path;
}
```

### Get Exercise Config

```javascript
function getExerciseConfig(exercise) {
  const configs = {
    'rh_cw':  { hand: 'right', clockwise: true,  startAngle: 0 },
    'rh_ccw': { hand: 'right', clockwise: false, startAngle: 0 },
    'lh_cw':  { hand: 'left',  clockwise: true,  startAngle: Math.PI },
    'lh_ccw': { hand: 'left',  clockwise: false, startAngle: Math.PI }
  };
  
  return configs[exercise] || configs['rh_cw'];
}
```

### Draw Path on Canvas

```javascript
function drawPath(ctx, path, color = '#8b5cf6', lineWidth = 2) {
  if (!path || path.length < 2) return;
  
  ctx.beginPath();
  ctx.moveTo(path[0].x * ctx.canvas.width, path[0].y * ctx.canvas.height);
  
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(
      path[i].x * ctx.canvas.width,
      path[i].y * ctx.canvas.height
    );
  }
  
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
