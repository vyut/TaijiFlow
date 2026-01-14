# TaijiFlow AI - Feedback Manager Documentation

**Version:** 2.0  
**Last Updated:** 2026-01-14  
**Class:** FeedbackManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [UI Components](#2-ui-components)
3. [Methods Reference](#3-methods-reference)
4. [Code Examples](#4-code-examples)

---

## 1. ภาพรวม

`FeedbackManager` จัดการปุ่มและ Popup สำหรับแบบสอบถาม โดยใช้ **Right-Side Sticky Tab** และ **Glassmorphism Popup**

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Sticky Side Tab** | แท็บด้านขวา (Right Edge) พร้อมข้อความแนวตั้ง |
| **QR Code Popup** | Popup แบบ Glassmorphism แสดง QR และปุ่ม Survey |
| **Bilingual Support** | รองรับ TH/EN ผ่าน `translations.js` |
| **Independent Logic** | ใช้ Pull Model ในการดึงค่าภาษาจาก `window.uiManager` |

### 📊 การใช้งาน

```javascript
// สร้างอัตโนมัติตอน DOMContentLoaded
window.feedbackManager = new FeedbackManager();
```

---

## 2. UI Components

### Sticky Side Tab (v2.0)

| Property | Value |
|----------|-------|
| Position | Fixed Right-Center (`top-1/2 right-0`) |
| Icon | ⭐ Star (SVG) |
| Shape | Rounded Left Pill (Vertical) |
| Style | Purple-Indigo Gradient (Vertical) |
| Interaction | Slide-out on hover |

### Popup Structure

```
┌─────────────────────────────────────┐
[X] (Close Button)                    │
│        ⭐ Your Feedback             │
│   Help improve TaijiFlow AI         │
│                                     │
│         ┌─────────────┐             │
│         │   QR Code   │             │
│         │    128px    │             │
│         └─────────────┘             │
│                                     │
│     Scan QR or click below          │
│                                     │
│    (🟣 Take Survey Button)          │
│          (Close Text)               │
└─────────────────────────────────────┘
```

---

## 3. Methods Reference

### Initialization

| Method | Description |
|--------|-------------|
| `constructor()` | ตั้งค่า formUrl, เรียก init() |
| `init()` | สร้างปุ่ม `createButton()` |

### UI Creation

| Method | Description |
|--------|-------------|
| `createButton()` | สร้างปุ่ม Sticky Tab ที่ขอบขวาของจอ |
| `showPopup()` | แสดง Popup (ใช้ translations.js) |

### Utility

| Method | Returns | Description |
|--------|---------|-------------|
| `getLang()` | string | ดึงภาษาจาก `window.uiManager.currentLang` |

---

## 4. Code Examples

### Create Sticky Tab Button

```javascript
createButton() {
  const btn = document.createElement("button");
  // ... Tailwind classes for Right fixed position ...
  
  // Vertical Logic
  btn.innerHTML = `
    ${starIconSvg}
    <span style="writing-mode: vertical-rl;">
      ${isThai ? "ข้อเสนอแนะ" : "Feedback"}
    </span>
  `;
  document.body.appendChild(btn);
}
```

### Show Popup (With Translations)

```javascript
showPopup() {
  const lang = this.getLang();
  // Fetch texts from centralized dict
  const t = TRANSLATIONS[lang]?.feedback_popup;
  
  // Create Glassmorphism Modal
  // ...
  
  // Use t.title, t.qr_instruction, etc.
}
```

---

*เอกสารนี้อัปเดตสำหรับ v0.9.8*
