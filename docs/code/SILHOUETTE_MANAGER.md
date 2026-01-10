# TaijiFlow AI - Silhouette Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** ~80  
**Class:** SilhouetteManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Segmentation Mask](#2-segmentation-mask)
3. [Methods Reference](#3-methods-reference)
4. [Performance Notes](#4-performance-notes)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`SilhouetteManager` จัดการการแสดง Silhouette (เงา) ของผู้ฝึก

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Enable/Disable** | เปิด/ปิด silhouette |
| **Mask Drawing** | วาด segmentation mask |
| **Performance** | จัดการ enable segmentation ใน MediaPipe |

### 📊 การใช้งาน

```javascript
const silhouetteManager = new SilhouetteManager();

// เปิด silhouette
silhouetteManager.enable();

// วาดใน render loop
silhouetteManager.draw(ctx, results.segmentationMask);

// ปิด silhouette
silhouetteManager.disable();
```

---

## 2. Segmentation Mask

### Mask Data

| Property | Type | Description |
|----------|------|-------------|
| Source | ImageData | จาก MediaPipe Pose |
| Resolution | Same as video | ความละเอียดเท่า video |
| Format | RGBA | 4 channels |

### Mask Values

| Pixel Value | Meaning |
|:-----------:|---------|
| 0 | Background (ไม่ใช่คน) |
| 255 | Person (เป็นคน) |

---

## 3. Methods Reference

### Enable/Disable

| Method | Description |
|--------|-------------|
| `enable()` | เปิด silhouette, set pose options |
| `disable()` | ปิด silhouette, disable segmentation |
| `isEnabled()` | เช็คสถานะ |

### Drawing

| Method | Parameters | Description |
|--------|------------|-------------|
| `draw(ctx, mask)` | CanvasContext, ImageData | วาด silhouette |
| `setColor(color)` | string | ตั้งสี (default: purple) |
| `setOpacity(opacity)` | number | ตั้งความโปร่งใส |

---

## 4. Performance Notes

### การเปิด Segmentation

```javascript
// ⚠️ Segmentation ใช้ GPU มาก
// ควรเปิดเฉพาะเมื่อต้องการ

// เมื่อเปิด
pose.setOptions({
  enableSegmentation: true,
  smoothSegmentation: true
});
// -5 ถึง -10 FPS

// เมื่อปิด
pose.setOptions({
  enableSegmentation: false,
  smoothSegmentation: false
});
// +5 ถึง +10 FPS
```

### Memory Usage

| State | Impact |
|-------|--------|
| Disabled | ~0 MB extra |
| Enabled | ~50-100 MB extra |

---

## 5. Code Examples

### Enable Silhouette

```javascript
enable() {
  this.isActive = true;
  
  // Update MediaPipe options
  if (typeof pose !== 'undefined') {
    pose.setOptions({
      enableSegmentation: true,
      smoothSegmentation: true
    });
  }
  
  console.log('⚠️ Silhouette enabled - may affect FPS');
}
```

### Disable Silhouette

```javascript
disable() {
  this.isActive = false;
  
  // Update MediaPipe options
  if (typeof pose !== 'undefined') {
    pose.setOptions({
      enableSegmentation: false,
      smoothSegmentation: false
    });
  }
  
  console.log('✅ Silhouette disabled - FPS improved');
}
```

### Draw Silhouette

```javascript
draw(ctx, segmentationMask) {
  if (!this.isActive || !segmentationMask) return;
  
  const { width, height } = ctx.canvas;
  
  // Create temporary canvas for mask
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  
  // Draw mask
  tempCtx.drawImage(segmentationMask, 0, 0, width, height);
  
  // Apply color overlay
  tempCtx.globalCompositeOperation = 'source-in';
  tempCtx.fillStyle = this.color;
  tempCtx.globalAlpha = this.opacity;
  tempCtx.fillRect(0, 0, width, height);
  
  // Draw to main canvas
  ctx.drawImage(tempCanvas, 0, 0);
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
