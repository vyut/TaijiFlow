# TaijiFlow AI - Rules Config Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** ~300  
**Class:** RulesConfigManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [8 Rules Configuration](#2-8-กฎของ-heuristics-engine)
3. [Level Presets](#3-level-presets)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`RulesConfigManager` จัดการ UI สำหรับ configure Heuristics Rules

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Toggle Rules** | เปิด/ปิดแต่ละ rule |
| **Threshold Adjustment** | ปรับค่า threshold |
| **Level Presets** | L1/L2/L3 presets |
| **Development Mode** | ซ่อนใน Production |

### 📊 การใช้งาน

```javascript
const rulesConfig = new RulesConfigManager(heuristicsEngine);

// เปิด UI
rulesConfig.show();

// ใช้ preset
rulesConfig.applyPreset('L2');

// Toggle rule
rulesConfig.toggleRule(1, true);  // Enable rule 1
```

---

## 2. 8 กฎของ Heuristics Engine

### รายละเอียดกฎ

| # | กฎ | คำอธิบาย | Default |
|:-:|-----|---------|:-------:|
| 1 | Path Shape | ตรวจเส้นทางวงโค้ง | ✅ |
| 2 | Arm Rotation | ตรวจการหมุนแขน | ❌ L1 |
| 3 | Elbow Sinking | ตรวจศอกต่ำ | ✅ |
| 4 | Waist Initiation | ตรวจเอวนำการเคลื่อนไหว | ❌ L1-L2 |
| 5 | Vertical Stability | ตรวจความนิ่งของหัว | ✅ |
| 6 | Smoothness | ตรวจความลื่นไหล | ❌ L1 |
| 7 | Continuity | ตรวจความต่อเนื่อง | ✅ |
| 8 | Weight Shift | ตรวจการถ่ายน้ำหนัก | ❌ L1-L2 |

### Rule Priority

```
Priority Order (สูงสุดก่อน):
1. Path Shape       - สำคัญที่สุด
2. Continuity       - ต้องไม่หยุดกลางทาง
3. Elbow Sinking    - หลักพื้นฐาน
4. Smoothness       - ไม่กระตุก
5. Arm Rotation     - หมุนถูกทิศ
6. Vertical Stability - ศีรษะนิ่ง
7. Waist Initiation - ระดับสูง
8. Weight Shift     - ระดับสูงสุด
```

---

## 3. Level Presets

### Preset Configuration

| Level | Enabled Rules | Disabled Rules |
|:-----:|---------------|----------------|
| L1 | 1, 3, 5, 7 | 2, 4, 6, 8 |
| L2 | 1, 2, 3, 5, 6, 7 | 4, 8 |
| L3 | All (1-8) | None |

### Threshold Adjustments

| Level | Path Threshold | Smoothness | Notes |
|:-----:|:--------------:|:----------:|-------|
| L1 | 0.15 | - | ผ่อนปรนที่สุด |
| L2 | 0.12 | 0.8 | ปานกลาง |
| L3 | 0.10 | 0.6 | เข้มงวดที่สุด |

---

## 4. Methods Reference

### UI Control

| Method | Description |
|--------|-------------|
| `show()` | แสดง config panel |
| `hide()` | ซ่อน config panel |
| `toggle()` | สลับ show/hide |
| `createUI()` | สร้าง UI structure |

### Rule Management

| Method | Parameters | Description |
|--------|------------|-------------|
| `toggleRule(ruleNumber, enabled)` | number, boolean | เปิด/ปิด rule |
| `setThreshold(ruleNumber, value)` | number, number | ตั้ง threshold |
| `getEnabledRules()` | - | ดึง rules ที่เปิดอยู่ |

### Preset

| Method | Parameters | Description |
|--------|------------|-------------|
| `applyPreset(level)` | string | ใช้ L1/L2/L3 preset |
| `saveAsPreset(name)` | string | บันทึก preset ใหม่ |
| `loadPreset(name)` | string | โหลด preset |

### Sync

| Method | Description |
|--------|-------------|
| `syncWithEngine()` | Sync UI กับ engine |
| `applyToEngine()` | Apply changes ไป engine |

---

## 5. Code Examples

### Toggle Rule

```javascript
toggleRule(ruleNumber, enabled) {
  // Update internal state
  this.rulesState[ruleNumber] = enabled;
  
  // Update UI checkbox
  const checkbox = document.getElementById(`rule-${ruleNumber}-toggle`);
  if (checkbox) {
    checkbox.checked = enabled;
  }
  
  // Apply to engine
  this.heuristics.setRuleEnabled(ruleNumber, enabled);
  
  console.log(`Rule ${ruleNumber}: ${enabled ? 'enabled' : 'disabled'}`);
}
```

### Apply Level Preset

```javascript
applyPreset(level) {
  const presets = {
    L1: {
      enabled: [1, 3, 5, 7],
      disabled: [2, 4, 6, 8],
      thresholds: { 1: 0.15 }
    },
    L2: {
      enabled: [1, 2, 3, 5, 6, 7],
      disabled: [4, 8],
      thresholds: { 1: 0.12, 6: 0.8 }
    },
    L3: {
      enabled: [1, 2, 3, 4, 5, 6, 7, 8],
      disabled: [],
      thresholds: { 1: 0.10, 6: 0.6 }
    }
  };
  
  const preset = presets[level];
  if (!preset) return;
  
  preset.enabled.forEach(r => this.toggleRule(r, true));
  preset.disabled.forEach(r => this.toggleRule(r, false));
  
  Object.entries(preset.thresholds).forEach(([rule, value]) => {
    this.setThreshold(parseInt(rule), value);
  });
  
  console.log(`✅ Applied ${level} preset`);
}
```

### Create UI

```javascript
createUI() {
  const panel = document.createElement('div');
  panel.id = 'rules-config-panel';
  panel.className = 'rules-panel hidden';
  
  panel.innerHTML = `
    <div class="rules-header">
      <h3>Rules Configuration</h3>
      <button class="rules-close">×</button>
    </div>
    <div class="rules-presets">
      <button data-preset="L1">L1</button>
      <button data-preset="L2">L2</button>
      <button data-preset="L3">L3</button>
    </div>
    <div class="rules-list">
      ${this.renderRulesList()}
    </div>
  `;
  
  document.body.appendChild(panel);
  this.bindEvents();
}

renderRulesList() {
  const rules = [
    { num: 1, name: 'Path Shape', desc: 'เส้นทางวงโค้ง' },
    { num: 2, name: 'Arm Rotation', desc: 'การหมุนแขน' },
    // ... etc
  ];
  
  return rules.map(r => `
    <div class="rule-item">
      <label>
        <input type="checkbox" id="rule-${r.num}-toggle" />
        <span>${r.num}. ${r.name}</span>
      </label>
      <small>${r.desc}</small>
    </div>
  `).join('');
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
