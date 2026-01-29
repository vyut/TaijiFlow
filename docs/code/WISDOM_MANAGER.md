# TaijiFlow AI - Wisdom Manager Documentation
- **Daily Wisdom**: Shows a random quote on startup.
- **Glassmorphism UI**: Beautiful, reliable aesthetic.

**Version:** 1.0  
**Last Updated:** 2026-01-25  
**Class:** WisdomManager  

---

## 1. ภาพรวม

`WisdomManager` รับผิดชอบในการแสดง "คำคมปรัชญาเต๋า" (Taoist Wisdom) เพื่อสร้างบรรยากาศและสมาธิระหว่างการฝึก

### 🎯 หน้าที่หลัก

- สุ่มเลือกคำคมจากฐานข้อมูล (`translations.js`)
- แสดง Popup พร้อม Animation "Enso" (วงกลมวาดมือ)
- ทำงานร่วมกับ `UIManager` ในการจัดการ Overlay

---

### 📊 การใช้งาน

```javascript
const wisdomManager = new WisdomManager(uiManager);

// แสดงคำคม (สุ่มใหม่ทุกครั้ง)
wisdomManager.show();

// ซ่อน
wisdomManager.hide();
```

---

## 3. Animation

ระบบใช้ **SVG & CSS Animation** ในการสร้างวงกลม Enso:
- **SVG:** วาดเส้นวงกลมที่ไม่สมบูรณ์ (Wabi-sabi aesthetics)
- **CSS:** `stroke-dasharray` animation เพื่อจำลองการตวัดพู่กัน

---

## 4. Data Source

คำคมถูกเก็บไว้ใน `translations.js` ภายใต้ key `TAIJI_QUOTES`:

```javascript
// translations.js
window.TAIJI_QUOTES = [
    { th: "ความอ่อนนุ่มพิชิตความแข็งกร้าว", en: "Softness overcomes hardness." },
    { th: "นิ่งสงบสยบความเคลื่อนไหว", en: "Stillness conquers motion." },
    // ...
];
```

---

### Visual Structure

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Background** | `bg-white/90` | Glassmorphism base with blur |
| **Animation** | Enso Circle | SVG path animation (Zen circle) |
| **Content** | Quote + Author | Typography with fade-in effect |

## 5. Methods

| Method | Description |
|--------|-------------|
| `show()` | สุ่มคำคมและแสดง Popup |
| `hide()` | ซ่อน Popup |
| `drawEnso(ctx)` | (Deprecated) วาด Enso ด้วย Canvas (ปัจจุบันใช้ CSS) |

---
