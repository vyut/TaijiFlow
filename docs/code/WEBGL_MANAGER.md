# TaijiFlow AI - WebGL Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-25  
**Class:** WebGLManager  

---

## 1. ภาพรวม

`WebGLManager` เป็น Class ที่จัดการการเรนเดอร์กราฟิกความเร็วสูงโดยใช้ WebGL 2.0 API เพื่อลดภาระ CPU ในการทำ Visual Effects

### 🎯 หน้าที่หลัก

- จัดการ WebGL Context และ Shader Programs
- เรนเดอร์ **Gaussian Blur** สำหรับพื้นหลัง (Virtual Background)
- จัดการ Textures และ Framebuffers

---

## 2. การใช้งาน

```javascript
const webglManager = new WebGLManager();
const canvas = document.getElementById('output-canvas');
webglManager.init(canvas);

// ใน Render Loop
webglManager.applyGaussianBlur(videoElement);
```

---

## 3. Architecture

### 3.1 Shaders

ระบบใช้ Shader 2 ตัว:
1.  **Vertex Shader:** จัดการตำแหน่ง Geometry (Quad เต็มหน้าจอ)
2.  **Fragment Shader:** จัดการสีและ Gaussian Blur Algorithm (2-pass filter)

### 3.2 Texture Management

- **Input Texture:** ภาพจาก Webcam Video
- **Temp Texture:** ใช้สำหรับพักข้อมูลระหว่างการ Blur แกน X และ Y

---

## 4. Performance

- **GPU Acceleration:** ย้ายงานประมวลผลภาพจาก CPU ไป GPU
- **Optimized Blur:** ใช้ Linear Sampling เพื่อลดจำนวน Texture Reads

---

## 5. Methods

| Method | Description |
|--------|-------------|
| `init(canvas)` | เตรียม WebGL Context |
| `createProgram(vs, fs)` | Compile และ Link Shaders |
| `applyGaussianBlur(image)` | ประมวลผลภาพเบลอ |
| `resize(width, height)` | ปรับขนาด Viewport |

---
