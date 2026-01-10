# TaijiFlow AI - Feedback Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** 115  
**Class:** FeedbackManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [UI Components](#2-ui-components)
3. [Methods Reference](#3-methods-reference)
4. [Code Examples](#4-code-examples)

---

## 1. ภาพรวม

`FeedbackManager` จัดการปุ่มและ Popup สำหรับแบบสอบถาม

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Floating Button** | ปุ่ม 📝 มุมขวาล่าง |
| **QR Code Popup** | แสดง QR สแกนไป Google Form |
| **Bilingual Support** | รองรับ TH/EN |

### 📊 การใช้งาน

```javascript
// สร้างอัตโนมัติตอน DOMContentLoaded
window.feedbackManager = new FeedbackManager();
```

---

## 2. UI Components

### Floating Button

| Property | Value |
|----------|-------|
| Position | Fixed bottom-right |
| Icon | 📝 |
| Size | 48px × 48px |

### Popup Structure

```
┌─────────────────────────────────────┐
│        📝 แบบสอบถาม                 │
├─────────────────────────────────────┤
│  ช่วยพัฒนาแอป TaijiFlow AI          │
│                                     │
│         ┌─────────────┐             │
│         │   QR Code   │             │
│         │    150px    │             │
│         └─────────────┘             │
│                                     │
│  สแกน QR Code หรือคลิกปุ่มด้านล่าง   │
│                                     │
│      [🔗 เปิดแบบสอบถาม]              │
│          [ปิด]                      │
└─────────────────────────────────────┘
```

---

## 3. Methods Reference

### Initialization

| Method | Description |
|--------|-------------|
| `constructor()` | ตั้งค่า formUrl, เรียก init() |
| `init()` | สร้างปุ่มและ bind events |

### UI Creation

| Method | Description |
|--------|-------------|
| `createButton()` | สร้างปุ่ม floating |
| `bindEvents()` | ผูก click event |
| `showPopup()` | แสดง popup |

### Utility

| Method | Returns | Description |
|--------|---------|-------------|
| `getLang()` | string | ดึงภาษาจาก uiManager |

---

## 4. Code Examples

### Create Floating Button

```javascript
createButton() {
  const btn = document.createElement('button');
  btn.id = 'feedback-btn';
  btn.innerHTML = '📝';
  btn.title = this.getLang() === 'th'
    ? 'ช่วยพัฒนาแอป TaijiFlow AI ให้ดียิ่งขึ้น'
    : 'Help improve TaijiFlow AI';
  document.body.appendChild(btn);
}
```

### Show Popup

```javascript
showPopup() {
  const isThaiLang = this.getLang() === 'th';
  const qrPath = 'images/qr_feedback.png';
  
  const popup = document.createElement('div');
  popup.id = 'feedback-popup';
  popup.className = 'feedback-overlay';
  popup.innerHTML = `
    <div class="feedback-modal">
      <h3>${isThaiLang ? '📝 แบบสอบถาม' : '📝 Feedback'}</h3>
      <p class="feedback-desc">${
        isThaiLang
          ? 'ช่วยพัฒนาแอป TaijiFlow AI ให้ดียิ่งขึ้น'
          : 'Help improve TaijiFlow AI'
      }</p>
      <img src="${qrPath}" alt="QR Feedback" class="feedback-qr" />
      <p class="feedback-hint">${
        isThaiLang
          ? 'สแกน QR Code หรือคลิกปุ่มด้านล่าง'
          : 'Scan QR Code or click button below'
      }</p>
      <a href="${this.formUrl}" target="_blank" class="feedback-link">${
        isThaiLang ? '🔗 เปิดแบบสอบถาม' : '🔗 Open Feedback Form'
      }</a>
      <button class="feedback-close">${isThaiLang ? 'ปิด' : 'Close'}</button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Close handlers
  popup.querySelector('.feedback-close')
    .addEventListener('click', () => popup.remove());
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });
}
```

### Get Language

```javascript
getLang() {
  return window.uiManager?.currentLang || 'th';
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
