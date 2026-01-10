# TaijiFlow AI - Theme Matching Plan

**Created:** 2026-01-10  
**Completed:** 2026-01-10  
**Status:** ✅ Completed

---

## 🎯 เป้าหมาย

1. ทำให้ `index.html` และ `app.html` ใช้ Theme เดียวกัน
2. รวม CSS ที่ซ้ำกันเป็น base.css

---

## 📊 สถานะปัจจุบัน

| Element | index.html | app.html |
|---------|-----------|----------|
| Background | `#000` (ดำ) | `bg-gray-900` (~#111827) |
| Cards | Purple glass | Gray cards |
| CSS File | landing.css (541 lines) | styles.css (349 lines) |

---

## 📐 แผนโครงสร้าง CSS ใหม่

### โครงสร้างที่แนะนำ

```
css/
├── base.css          (~100 lines) - shared styles
├── landing.css       (~400 lines) - landing only  
└── app.css           (~300 lines) - app only
```

### base.css จะมี

```css
:root {
  --color-bg-dark: #000;
  --color-bg-gradient: linear-gradient(180deg, #000 0%, #1a1a2e 100%);
  --color-accent: #a855f7;
  --font-family: 'Sarabun', sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-family);
  background: var(--color-bg-dark);
  color: #fff;
}

/* Shared animations, responsive breakpoints */
```

### ประโยชน์

| Metric | ก่อน | หลัง | ผลลัพธ์ |
|--------|:----:|:----:|:-------:|
| Code ซ้ำ | 70 lines | 0 | ลด 70 lines |
| Consistency | ❌ | ✅ | Theme เดียวกัน |
| Maintenance | 2 files | 1 base file | ง่ายขึ้น |

---

## 🎨 การวิเคราะห์สี Background

### ตัวเลือก

| Option | สี | ใช้ใน |
|--------|:--:|-------|
| A | `#000` (ดำสนิท) | index.html ปัจจุบัน |
| B | `#111827` (gray-900) | app.html ปัจจุบัน |

### แนะนำ: ใช้ `#000` (ดำสนิท) ทั้งสองหน้า

**เหตุผล:**

1. **Contrast สูง** - ข้อความขาวบนดำ = อ่านง่ายที่สุด
2. **Premium feel** - ดำสนิทดูหรูกว่าเทา
3. **Canvas focus** - วิดีโอ/skeleton โดดเด่นบนพื้นดำ
4. **Consistent** - ผู้ใช้ไม่สับสนเมื่อเปลี่ยนหน้า
5. **Purple accent** - สี accent ม่วงเด่นบนดำมากกว่าเทา

---

## 📝 ขั้นตอนดำเนินการ

### Phase 1: สร้าง base.css
- [ ] สร้าง `css/base.css`
- [ ] ย้าย shared styles
- [ ] เพิ่ม CSS variables

### Phase 2: อัปเดต landing.css
- [ ] ลบ code ที่ซ้ำ
- [ ] Import base.css

### Phase 3: อัปเดต styles.css → app.css
- [ ] Rename เป็น app.css
- [ ] เปลี่ยน background เป็น #000
- [ ] Import base.css

### Phase 4: อัปเดต HTML
- [ ] index.html: เพิ่ม link base.css
- [ ] app.html: เพิ่ม link base.css, ลบ Tailwind bg classes

### Phase 5: ทดสอบ
- [ ] Dark Mode
- [ ] Light Mode  
- [ ] Responsive
- [ ] Fullscreen Mode

---

## ⚠️ ข้อควรระวัง

1. **Overlay readability** - ตรวจสอบข้อความบน overlay
2. **Canvas contrast** - skeleton ต้องมองเห็นได้
3. **Light mode** - ต้องทดสอบทั้ง 2 modes

---

*แผนนี้รอดำเนินการในอนาคต*
