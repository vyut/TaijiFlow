# TaijiFlow AI - Score Popup Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** ~180  
**Class:** ScorePopupManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Score Display](#2-score-display)
3. [Grading System](#3-grading-system)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`ScorePopupManager` แสดง Score Summary หลังจบการฝึก

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Score Display** | แสดงคะแนนขนาดใหญ่ |
| **Grading** | แสดงเกรด A/B/C/D/F |
| **Statistics** | ระยะเวลา, frames, feedback |
| **Animations** | เอฟเฟกต์การแสดงผล |

### 📊 การใช้งาน

```javascript
const scorePopup = new ScorePopupManager();

// แสดง popup
scorePopup.show({
  score: 85,
  grade: 'B',
  duration: 30,
  totalFrames: 900,
  correctFrames: 765,
  feedbackSummary: { ... }
});

// ปิด popup
scorePopup.hide();
```

---

## 2. Score Display

### Popup Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              🎉 ยินดีด้วย!                           │
│                                                     │
│                    85                               │
│                   คะแนน                              │
│                   เกรด B                            │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ⏱️ ระยะเวลา: 30 วินาที                             │
│  📊 Frames: 765/900 (85%)                          │
├─────────────────────────────────────────────────────┤
│  Feedback Summary:                                  │
│  • เส้นทาง: 📖 ดีมาก (90%)                          │
│  • ศอก: ⚠️ ปรับปรุง (70%)                          │
│  • ความต่อเนื่อง: ✅ ดี (85%)                       │
├─────────────────────────────────────────────────────┤
│               [ฝึกอีกครั้ง]                          │
└─────────────────────────────────────────────────────┘
```

---

## 3. Grading System

### Grade Criteria

| เกรด | คะแนน | สี | คำอธิบาย |
|:----:|:-----:|:--:|----------|
| A | 90-100 | 🟢 Green | ยอดเยี่ยม |
| B | 75-89 | 🔵 Blue | ดีมาก |
| C | 60-74 | 🟡 Yellow | ดี |
| D | 50-59 | 🟠 Orange | พอใช้ |
| F | 0-49 | 🔴 Red | ต้องปรับปรุง |

### Grade Colors

```javascript
const GRADE_COLORS = {
  A: { bg: '#10b981', text: '#ffffff' }, // Green
  B: { bg: '#3b82f6', text: '#ffffff' }, // Blue
  C: { bg: '#f59e0b', text: '#000000' }, // Yellow
  D: { bg: '#f97316', text: '#000000' }, // Orange
  F: { bg: '#ef4444', text: '#ffffff' }  // Red
};
```

---

## 4. Methods Reference

### Popup Control

| Method | Parameters | Description |
|--------|------------|-------------|
| `show(data)` | Object | แสดง popup พร้อมข้อมูล |
| `hide()` | - | ปิด popup |
| `createPopup(data)` | Object | สร้าง HTML structure |

### Rendering

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `renderScore(score)` | number | string | Render คะแนน |
| `renderGrade(grade)` | string | string | Render เกรด |
| `renderStats(data)` | Object | string | Render สถิติ |
| `renderFeedback(summary)` | Object | string | Render feedback |

### Utility

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getGradeColor(grade)` | string | Object | ดึงสีของเกรด |
| `formatDuration(sec)` | number | string | Format เวลา |

---

## 5. Code Examples

### Show Popup

```javascript
show(data) {
  // Remove existing popup
  this.hide();
  
  const popup = this.createPopup(data);
  document.body.appendChild(popup);
  
  // Animation
  requestAnimationFrame(() => {
    popup.classList.add('visible');
  });
  
  // Close on overlay click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) this.hide();
  });
}
```

### Create Popup Structure

```javascript
createPopup(data) {
  const { score, grade, duration, totalFrames, correctFrames, feedbackSummary } = data;
  const gradeColor = this.getGradeColor(grade);
  const lang = window.uiManager?.currentLang || 'th';
  
  const popup = document.createElement('div');
  popup.id = 'score-popup';
  popup.className = 'score-overlay';
  
  popup.innerHTML = `
    <div class="score-modal">
      <h2>${lang === 'th' ? '🎉 ยินดีด้วย!' : '🎉 Congratulations!'}</h2>
      
      <div class="score-main">
        <div class="score-number" style="color: ${gradeColor.bg}">${score}</div>
        <div class="score-label">${lang === 'th' ? 'คะแนน' : 'Score'}</div>
        <div class="score-grade" style="background: ${gradeColor.bg}; color: ${gradeColor.text}">
          ${lang === 'th' ? 'เกรด' : 'Grade'} ${grade}
        </div>
      </div>
      
      ${this.renderStats(data, lang)}
      ${this.renderFeedback(feedbackSummary, lang)}
      
      <button class="score-close-btn">${lang === 'th' ? 'ฝึกอีกครั้ง' : 'Train Again'}</button>
    </div>
  `;
  
  popup.querySelector('.score-close-btn').onclick = () => this.hide();
  
  return popup;
}
```

### Render Statistics

```javascript
renderStats(data, lang) {
  const { duration, totalFrames, correctFrames } = data;
  const percentage = Math.round((correctFrames / totalFrames) * 100);
  
  return `
    <div class="score-stats">
      <div class="stat-item">
        <span class="stat-icon">⏱️</span>
        <span>${lang === 'th' ? 'ระยะเวลา' : 'Duration'}: ${duration} ${lang === 'th' ? 'วินาที' : 'sec'}</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">📊</span>
        <span>Frames: ${correctFrames}/${totalFrames} (${percentage}%)</span>
      </div>
    </div>
  `;
}
```

### Get Grade Color

```javascript
getGradeColor(grade) {
  const colors = {
    A: { bg: '#10b981', text: '#ffffff' },
    B: { bg: '#3b82f6', text: '#ffffff' },
    C: { bg: '#f59e0b', text: '#000000' },
    D: { bg: '#f97316', text: '#000000' },
    F: { bg: '#ef4444', text: '#ffffff' }
  };
  
  return colors[grade] || colors['C'];
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
