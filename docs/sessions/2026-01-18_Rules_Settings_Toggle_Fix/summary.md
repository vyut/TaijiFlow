# 🔧 Rules Settings Toggle Bug Fix

**Date:** 2026-01-18  
**Version:** v0.9.11

---

## 🐛 ปัญหาที่พบ

เมื่อผู้ใช้ปิดกฎใน Rules Settings ก่อนเริ่มฝึก แล้วกดเริ่มฝึก **กฎยังคงแจ้งเตือน** แม้ checkbox จะถูก uncheck แล้ว

---

## 🔍 Root Cause Analysis

### ลำดับเหตุการณ์ (ก่อนแก้)

```
1. User เปิด Rules Settings
2. User ปิด Rule 1 (uncheck)
   → currentRulesConfig.checkPath = false ✅
   
3. User กดเริ่มฝึก
   → analyze() ถูกเรียก พร้อม currentLevel = "L2"
   
4. ⚠️ BUG: Level เปลี่ยนจาก null → "L2"
   if (currentLevel !== this.currentLevel) {
       // this.currentLevel = null, currentLevel = "L2"
       // เงื่อนไขเป็น TRUE → RESET CONFIG!
       
       this.currentRulesConfig = {...RULES_CONFIG["L2"]};
       // 💥 checkPath กลับเป็น true!
   }
   
5. กฎ 1 ยังแจ้งเตือน แม้ปิดไปแล้ว ❌
```

### สาเหตุหลัก

| ปัจจัย | รายละเอียด |
|--------|------------|
| **Initial State** | `currentLevel = null` ใน constructor |
| **Trigger** | `analyze()` ถูกเรียกพร้อม level ที่ไม่ใช่ null |
| **Bug Logic** | `currentLevel !== this.currentLevel` เป็น TRUE |
| **Impact** | `currentRulesConfig` ถูก reset จาก `RULES_CONFIG[level]` |
| **Result** | User settings ถูกทับด้วย level defaults |

---

## ✅ Solution: User Overrides Pattern

### แนวคิด

แยกเก็บ **user settings** ไว้ใน `userOverrides` object ต่างหาก  
เมื่อ level เปลี่ยน → **merge** level defaults กับ userOverrides

### การแก้ไข

#### 1. เพิ่ม `userOverrides` object

```javascript
// heuristics_engine.js - constructor
this.userOverrides = {};  // เก็บค่าที่ user เปลี่ยนแยกต่างหาก
```

#### 2. อัปเดต `setRuleEnabled()`

```javascript
// rules_config_manager.js
setRuleEnabled(configKey, enabled) {
  if (this.engine && this.engine.currentRulesConfig) {
    this.engine.currentRulesConfig[configKey] = enabled;
    
    // 🆕 เก็บใน userOverrides ด้วย
    if (this.engine.userOverrides) {
      this.engine.userOverrides[configKey] = enabled;
    }
  }
}
```

#### 3. แก้ไข `analyze()` merge logic

```javascript
// heuristics_engine.js - analyze()
if (currentLevel && currentLevel !== this.currentLevel) {
  const levelConfig = this.RULES_CONFIG[currentLevel];
  
  // 🆕 Merge: levelConfig เป็น base, userOverrides ทับ
  this.currentRulesConfig = { ...levelConfig, ...this.userOverrides };
  
  this.currentLevel = currentLevel;
}
```

---

## 📊 Flow หลังแก้ไข

```
1. User ปิด Rule 1
   → currentRulesConfig.checkPath = false
   → userOverrides.checkPath = false  ← 🆕 เก็บแยก

2. User กดเริ่มฝึก
   → analyze() ถูกเรียก
   
3. Level เปลี่ยน null → "L2"
   levelConfig = {checkPath: true, ...}  ← จาก RULES_CONFIG
   
   currentRulesConfig = {
     ...levelConfig,      // base
     ...userOverrides     // override: checkPath = false
   };
   
4. ผลลัพธ์: checkPath = false ✅ (คงค่า user)
```

---

## 📁 Files Changed

| File | Changes |
|------|---------|
| [heuristics_engine.js](file:///Users/yut/TaijiFlow/js/heuristics_engine.js) | Added `userOverrides`, modified analyze() merge |
| [rules_config_manager.js](file:///Users/yut/TaijiFlow/js/rules_config_manager.js) | setRuleEnabled() saves to userOverrides |

---

## ✅ Verification

- **Test:** ปิดกฎใน Settings → เริ่มฝึก → ทำผิดกฎที่ปิด
- **Expected:** ไม่มี feedback จากกฎที่ปิด
- **Result:** ✅ Working
