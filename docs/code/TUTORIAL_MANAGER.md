# TaijiFlow AI - Tutorial Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** 709  
**Class:** TutorialManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Tab Structure](#2-tab-structure)
3. [Principles Content](#3-principles-content)
4. [Exercises Content](#4-exercises-content)
5. [Methods Reference](#5-methods-reference)
6. [Code Examples](#6-code-examples)

---

## 1. ภาพรวม

`TutorialManager` จัดการ Tutorial Popup และ Content ทั้งหมด

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Popup Management** | เปิด/ปิด Tutorial popup |
| **Tab Navigation** | 3 tabs (Principles, Exercises, How To Use) |
| **Content Rendering** | แสดงเนื้อหาตาม tab และภาษา |
| **Exercise Selection** | เลือกท่าและระดับ |

### 📊 การใช้งาน

```javascript
const tutorialManager = new TutorialManager();

// เปิด Tutorial
tutorialManager.open("th");

// สลับ Tab
tutorialManager.switchTab("exercises");

// ปิด Tutorial
tutorialManager.close();
```

---

## 2. Tab Structure

### Available Tabs

| Tab ID | Name (TH) | Name (EN) | Content |
|--------|-----------|-----------|---------|
| `principles` | หลักการ | Principles | 8 หลักการไท้เก๊ก |
| `exercises` | ท่าฝึก | Exercises | 4 ท่า × 3 ระดับ |
| `howto` | วิธีใช้งาน | How To Use | 7 ขั้นตอน |

### Tab Layout

```
┌─────────────────────────────────────────────────────┐
│  [หลักการ] [ท่าฝึก] [วิธีใช้งาน]                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│              Tab Content Area                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. Principles Content

### 8 หลักการของท่าม้วนไหม

| # | หลักการ (TH) | Principle (EN) |
|:-:|------------|----------------|
| 1 | เส้นทางวงกลม | Circular Path |
| 2 | ศอกจม | Elbow Sinking |
| 3 | ไหล่ผ่อน | Shoulder Relaxation |
| 4 | เอวนำ | Waist Leading |
| 5 | ศีรษะนิ่ง | Head Stability |
| 6 | ความต่อเนื่อง | Continuity |
| 7 | ความนุ่มนวล | Softness |
| 8 | การถ่ายน้ำหนัก | Weight Shifting |

---

## 4. Exercises Content

### 4 ท่าฝึก

| Type ID | Name (TH) | Name (EN) |
|---------|-----------|-----------|
| `rh_cw` | มือขวา ตามเข็ม | Right Hand Clockwise |
| `rh_ccw` | มือขวา ทวนเข็ม | Right Hand Counter-CW |
| `lh_cw` | มือซ้าย ตามเข็ม | Left Hand Clockwise |
| `lh_ccw` | มือซ้าย ทวนเข็ม | Left Hand Counter-CW |

### 3 ระดับ

| Level | Name (TH) | Name (EN) | Description |
|:-----:|-----------|-----------|-------------|
| L1 | ระดับ 1 - ยืนตรง | Level 1 - Standing | ระดับพื้นฐาน |
| L2 | ระดับ 2 - ยืนโค้ง | Level 2 - Bent | ระดับกลาง |
| L3 | ระดับ 3 - ยืนย่อ | Level 3 - Squat | ระดับสูง |

### Exercise Details

```javascript
descriptions = {
  rh_cw: {
    summary: "มือขวาหมุนตามเข็มนาฬิกา",
    steps: [
      "ยืนในท่าเริ่มต้น",
      "ยกแขนขวาขึ้น",
      "หมุนแขนตามเข็มนาฬิกา",
      "รักษาความต่อเนื่อง"
    ],
    image: "images/exercises/rh_cw.png"
  },
  // ... other exercises
};
```

---

## 5. Methods Reference

### Initialization

| Method | Description |
|--------|-------------|
| `constructor()` | สร้าง translations และ exercise data |
| `createUI()` | สร้าง popup HTML structure |

### Popup Control

| Method | Parameters | Description |
|--------|------------|-------------|
| `open(lang)` | string | เปิด popup |
| `close()` | - | ปิด popup |

### Tab Navigation

| Method | Parameters | Description |
|--------|------------|-------------|
| `switchTab(tab)` | string | สลับไปยัง tab |
| `renderContent(tab)` | string | Render เนื้อหา tab |

### Content Rendering

| Method | Parameters | Description |
|--------|------------|-------------|
| `renderPrinciples(lang)` | string | Render หลักการ |
| `renderExercises(lang)` | string | Render ท่าฝึก |
| `renderHowTo(lang)` | string | Render วิธีใช้งาน |

### Selection

| Method | Parameters | Description |
|--------|------------|-------------|
| `selectExercise(type)` | string | เลือกท่าฝึก |
| `selectLevel(level)` | string | เลือกระดับ |

### Utility

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `t(key, lang)` | string, string | string | ดึงคำแปล |

---

## 6. Code Examples

### Create UI Structure

```javascript
createUI() {
  const popup = document.createElement('div');
  popup.id = 'tutorial-popup';
  popup.className = 'tutorial-overlay hidden';
  popup.innerHTML = `
    <div class="tutorial-modal">
      <button class="tutorial-close">&times;</button>
      <h2 class="tutorial-title">TaijiFlow AI User Guide</h2>
      <div class="tutorial-tabs">
        <button class="tab-btn active" data-tab="principles">หลักการ</button>
        <button class="tab-btn" data-tab="exercises">ท่าฝึก</button>
        <button class="tab-btn" data-tab="howto">วิธีใช้งาน</button>
      </div>
      <div class="tutorial-content"></div>
    </div>
  `;
  document.body.appendChild(popup);
}
```

### Render Principles Tab

```javascript
renderPrinciples(lang) {
  const principles = this.translations[lang].principles;
  let html = '<div class="principles-list">';
  
  principles.forEach((p, i) => {
    html += `
      <div class="principle-item">
        <span class="principle-number">${i + 1}</span>
        <div class="principle-content">
          <h4>${p.name}</h4>
          <p>${p.description}</p>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}
```

### Tab Switching

```javascript
switchTab(tab) {
  if (this.currentTab === tab) return;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Update content
  this.currentTab = tab;
  this.renderContent(tab);
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
