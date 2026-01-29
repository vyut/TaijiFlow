# TaijiFlow AI - Shortcuts Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-25  
**Class:** ShortcutsManager  

---

## 1. ภาพรวม

`ShortcutsManager` เป็น Class สำหรับแสดงรายการคีย์ลัด (Keyboard Shortcuts) ทั้งหมดในรูปแบบ Popup Grid ที่สวยงามและเข้าใจง่าย แยกตามหมวดหมู่

### 🎯 หน้าที่หลัก

- รวบรวมรายการ Shortcuts ทั้งหมดไว้ในที่เดียว
- แสดงผลในรูปแบบ Grid แบ่งสีตามหมวดหมู่
- ควบคุมการเปิด/ปิด Popup (`?` หรือ `/`)

---

## 2. การใช้งาน

```javascript
const shortcutsManager = new ShortcutsManager(uiManager);
// Popup จะถูกสร้างและ inject ลง DOM โดยอัตโนมัติเมื่อเรียก init หรือ toggle ครั้งแรก
shortcutsManager.toggle(); // เปิด/ปิด
```

---

## 3. Data Structure

ข้อมูล Shortcuts จะถูกเก็บในรูปแบบ Array ของ Objects แบ่งตาม Category:

```javascript
const shortcutsData = [
    { 
        category: 'Control', 
        color: 'blue', 
        items: [
            { key: 'Space', desc: 'Start/Stop' },
            { key: 'Esc', desc: 'Exit' }
        ] 
    },
    { 
        category: 'Display', 
        color: 'purple', 
        items: [
            { key: 'G', desc: 'Ghost' },
            { key: 'P', desc: 'Path' },
            { key: 'S', desc: 'Skeleton' },
            { key: 'B', desc: 'Blur BG' }
        ] 
    },
    // ... Analysis, Settings
];
```

---

## 4. UI Layout

Popup ใช้ Glassmorphism Design:
- **Overlay:** สีดำโปร่งแสง (Backdrop blur)
- **Grid Container:** 2 คอลัมน์ (บนจอกว้าง) หรือ 1 คอลัมน์ (บนจอมือถือ)
- **Cards:** แต่ละหมวดหมู่จะมีการ์ดแยกสีที่ชัดเจน

---

## 5. Methods

| Method | Description |
|--------|-------------|
| `toggle()` | เปิด/ปิด Popup (เรียก `init()` อัตโนมัติถ้ายังไม่สร้าง) |
| `init()` | สร้าง DOM Elements และ Event Listeners สำหรับ: <br>- **Glassmorphism UI**: Uses the standard transparent styling.<br>- **Keyboard Listener**: Listens for '?' key to toggle visibility.<br>- **Close Button**: Added "Close" button for mouse users. |
| `generateHtml()` | สร้าง HTML String สำหรับ Grid Layout |

---
