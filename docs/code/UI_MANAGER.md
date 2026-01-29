# TaijiFlow AI - UI Manager Documentation

**Version:** 1.1  
**Last Updated:** 2026-01-10  
**Lines:** 897  
**Class:** UIManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Language System](#2-language-system)
3. [Theme System](#3-theme-system)
4. [Notification System](#4-notification-system)
5. [Button State Management](#5-button-state-management)
6. [Methods Reference](#6-methods-reference)
7. [Code Examples](#7-code-examples)

---

## 1. ภาพรวม

`UIManager` เป็น Class หลักสำหรับจัดการ User Interface ทั้งหมด รวมถึงระบบ **Unified Popups** ที่ใช้ร่วมกันระหว่าง Wisdom, Score, และ Feedback

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
| :--- | :--- |
| **Unified Popups** | ระบบ Popup กลาง (showPopup) |
| **Language Management** | สลับภาษา TH/EN |
| **Theme Management** | สลับ Dark/Light Mode |
| **Text Updates** | อัปเดตข้อความทั้งหน้า |
| **Toast Notifications** | แจ้งเตือนแบบ Non-blocking |
| **Button States** | จัดการ state ของปุ่มต่างๆ |

### 📊 การใช้งาน

```javascript
const uiManager = new UIManager();
uiManager.init();

// สลับภาษา
const newLang = uiManager.toggleLanguage(); // "th" หรือ "en"

// สลับ Theme
const newTheme = uiManager.toggleTheme(); // "dark" หรือ "light"

// แสดง Notification
uiManager.showNotification("บันทึกสำเร็จ!", "success");

// แสดง Popup
uiManager.showPopup("my-popup-id", "<h3>Title</h3><p>Content</p>");
```

---

## 2. Language System

### Supported Languages

| Code | Language | Flag |
| :---: | :--- | :---: |
| `th` | ภาษาไทย | 🇹🇭 |
| `en` | English | 🇺🇸 |

### Translation Dictionary Structure

```javascript
translations = {
  th: {
    app_title: "TaijiFlow AI: ผู้ช่วยฝึกมวยไท้เก๊ก",
    start_btn: "เริ่มฝึก",
    stop_btn: "หยุด",
    // ... 100+ keys
  },
  en: {
    app_title: "TaijiFlow AI: Taijiquan Assistant",
    start_btn: "Start",
    stop_btn: "Stop",
    // ... 100+ keys
  }
};
```

### DOM ID Mapping

```javascript
// Key → DOM ID
app_title → #app-title
start_btn → #start-btn
exercise_select → #exercise-select [title]
```

---

## 3. Theme System

### Theme Options

| Theme | Background | Text | Accent |
| :--- | :--- | :--- | :--- |
| `dark` | Gray-900 | White | Purple-400 |
| `light` | White | Gray-900 | Purple-600 |

### CSS Classes Modified

```javascript
// Elements affected by theme
document.body.classList.toggle('dark-mode' | 'light-mode');
header.classList.toggle('bg-gray-800' | 'bg-white');
controls.classList.toggle(...); 
// ... and more
```

---

## 4. Notification System

### Notification Types

| Type | Color | Icon | Use Case |
| :--- | :--- | :---: | :--- |
| `info` | Blue | ℹ️ | ข้อมูลทั่วไป |
| `success` | Green | ✅ | ทำสำเร็จ |
| `warning` | Yellow | ⚠️ | คำเตือน |
| `error` | Red | ❌ | ข้อผิดพลาด |

### Toast Behavior

```
┌─────────────────────────────────────┐
│  ✅ บันทึกสำเร็จ!                  │
└─────────────────────────────────────┘
        ↓ Auto-dismiss after 3s
        ↓ Slide out animation
        ↓ Remove from DOM
```

---

## 5. Button State Management

### Level Buttons

| Level | Active Style | Inactive Style |
| :---: | :--- | :--- |
| L1 | Purple background | Transparent |
| L2 | Purple background | Transparent |
| L3 | Purple background | Transparent |

### Record Button States

| State | Text (TH) | Color |
| :--- | :--- | :--- |
| Ready | บันทึก | Default |
| Recording | หยุดบันทึก | Red |
| Processing | กำลังประมวลผล... | Yellow |

---

## 6. Unified Popup System

ระบบ Popup ทั้งหมดในแอพ (Wisdom, Score, Tutorial) ใช้โครงสร้างพื้นฐานเดียวกันผ่าน `showPopup`:

```javascript
showPopup(contentId, htmlContent, onCloseCallback) {
    // 1. Create Overlay
    // 2. Inject HTML
    // 3. Bind Close Events
    // 4. Animate Entrace
}
```

---

## 7. Methods Reference

### Initialization

| Method | Description |
| :--- | :--- |
| `constructor()` | กำหนดค่าเริ่มต้น, สร้าง translations |
| `init()` | โหลดการตั้งค่าจาก localStorage |

### Global UI Methods

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `showPopup(id, html, onClose)` | string, string, fn | แสดง Modal Popup กลางจอ |
| `hidePopup()` | - | ปิด Popup ปัจจุบัน |

### Language Methods

| Method | Returns | Description |
| :--- | :--- | :--- |
| `toggleLanguage()` | string | สลับ TH ↔ EN |
| `setLanguage(lang)` | void | ตั้งภาษาเฉพาะ |
| `updateText()` | void | อัปเดตข้อความทั้งหน้า |
| `getText(key)` | string | ดึงคำแปลจาก key |
| `setText(id, text)` | void | ตั้งข้อความเฉพาะ element |

### Theme Methods

| Method | Returns | Description |
| :--- | :--- | :--- |
| `toggleTheme()` | string | สลับ Dark ↔ Light |
| `setTheme(theme)` | void | ตั้ง theme เฉพาะ |

### Notification Methods

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `showNotification(msg, type, duration)` | string, string, number | แสดง toast |
| `hideNotification(id)` | string | ซ่อน toast |

### Button State Methods

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `updateLevelButtons(level)` | string | อัปเดตปุ่มระดับ |
| `updateRecordButtonState(state)` | string | อัปเดตปุ่ม Record |
| `setElementEnabled(id, enabled)` | string, boolean | Enable/Disable element |

---

## 7. Code Examples

The `UIManager` serves as the central orchestrator for the application's user interface. It handles global UI state, theme switching (Dark/Light), language switching (i18n), and initial UI setup. It delegates specific popup management to specialized managers (e.g., `DisplayPopupManager`, `RulesPopupManager`).

### Toggle Language with UI Update

```javascript
toggleLanguage() {
  this.currentLang = this.currentLang === "th" ? "en" : "th";
  localStorage.setItem("taijiflow_lang", this.currentLang);
  this.updateText();
  
  // Update language button
  const langBtn = document.getElementById("lang-btn");
  if (langBtn) {
    langBtn.textContent = this.currentLang === "th" ? "EN" : "TH";
  }
  
  return this.currentLang;
}
```

### Theme Toggle

```javascript
toggleTheme() {
  this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("taijiflow_theme", this.currentTheme);
  this.setTheme(this.currentTheme);
  
  return this.currentTheme;
}
```

### Show Notification

```javascript
showNotification(message, type = "info", duration = 3000) {
  const id = `toast-${Date.now()}`;
  const toast = document.createElement("div");
  toast.id = id;
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${this.getTypeIcon(type)}</span>
    <span class="toast-message">${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-dismiss
  setTimeout(() => this.hideNotification(id), duration);
  
  return id;
}
```

### Update Text for All Elements

```javascript
updateText() {
  const dict = this.translations[this.currentLang];
  
  for (const [key, value] of Object.entries(dict)) {
    const element = document.getElementById(key.replace(/_/g, "-"));
    if (element) {
      if (element.tagName === "INPUT" && element.placeholder) {
        element.placeholder = value;
      } else {
        element.textContent = value;
      }
    }
  }
}
```
-   **Glassmorphism**: Enforces the `bg-white/90` + `backdrop-blur-xl` style across modals.
-   **Theme Toggling**: Switches between 'dark' and 'light' classes on the `<html>` element.

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
