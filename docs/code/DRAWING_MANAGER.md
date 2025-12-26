# TaijiFlow AI - Drawing Manager Documentation

**Version:** 1.0  
**Last Updated:** 2024-12-24  
**Lines:** 430  
**Class:** DrawingManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Drawing Features](#2-drawing-features)
3. [Mirror Handling](#3-mirror-handling)
4. [Methods Reference](#4-methods-reference)

---

## 1. ภาพรวม

`DrawingManager` รับผิดชอบการวาดภาพทั้งหมดลงบน Canvas

### 🎨 Features

| Feature | คำอธิบาย |
|---------|---------|
| Skeleton | วาดโครงกระดูกจาก landmarks |
| Reference Path | วาดเส้นทางวงกลมนำทาง |
| Feedback Panel | กล่องแสดงข้อผิดพลาด |
| Debug Overlay | แสดงค่า Threshold |

---

## 2. Drawing Features

### 2.1 Skeleton Drawing

```javascript
drawer.drawSkeleton(landmarks, {
  color: "rgba(0, 255, 0, 0.8)",
  lineWidth: 2
});
```

### 2.2 Path Drawing

```javascript
drawer.drawPath(points, {
  color: "rgba(0, 200, 100, 0.5)",
  lineWidth: 4
});
```

### 2.3 Ghost Skeleton

```javascript
drawer.drawGhostSkeleton(landmarks, {
  color: "rgba(100, 200, 255, 0.4)"
});
```

---

## 3. Mirror Handling

### ปัญหา

- Webcam ส่งภาพ mirror มาแล้ว
- แต่ Canvas drawing ไม่ mirror

### วิธีแก้

```javascript
// Mirror canvas เมื่อวาด
ctx.save();
ctx.scale(-1, 1);
ctx.translate(-canvasWidth, 0);
// ... draw ...
ctx.restore();
```

---

## 4. Methods Reference

| Method | คำอธิบาย |
|--------|---------|
| `setMirror(enabled)` | เปิด/ปิด mirror mode |
| `drawSkeleton(landmarks)` | วาดโครงกระดูก |
| `drawGhostSkeleton(landmarks)` | วาด Ghost Overlay |
| `drawPath(points)` | วาด Reference Path |
| `drawFeedbackPanel(msgs)` | วาดกล่อง feedback |
| `clear()` | ล้าง canvas |

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
