# Walkthrough: Rule 7 Time-Based Fix (v0.9.9)

**Date:** 2026-01-14  
**Version:** v0.9.9

---

## 🎯 Problem Statement

Rule 7 (Continuity - 绵绵不断) was not triggering pause warnings when users stopped moving during training.

---

## 🔍 Root Cause Analysis

### Root Cause 1: Frame-Based Counter + Skip Frame Logic
- Original implementation used `pauseCounter` to count "still" frames
- **Problem:** Heuristics run only ~0.83x/sec due to double throttling:
  - Camera: 1/4 frames sent to MediaPipe
  - Heuristics: 1/9 MediaPipe frames analyzed
- **Impact:** Required 18+ seconds to trigger (instead of ~0.5s)

### Root Cause 2: Undefined Timestamp
- `results.image.timeStamp` from MediaPipe was `undefined`
- `wristHistory.t` became `NaN`
- All time-based calculations failed

---

## ✅ Solution Implemented

### 1. Time-Based Average Velocity
```javascript
// New CONFIG
PAUSE_WINDOW_MS: 2000,           // 2 second window
PAUSE_AVG_VELOCITY_THRESHOLD: 0.003
```

### 2. New `isPaused()` Helper
- Filters wristHistory for points within time window
- Calculates avgVelocity = totalDistance / timeSpan
- Returns true if avgVelocity < threshold

### 3. Fixed Timestamp
```javascript
// Before (broken)
t: timestamp  // from MediaPipe - undefined!

// After (working)
t: Date.now()  // JavaScript timestamp
```

### 4. Rule 1 Integration
- Added `isPaused()` check to skip Path Shape analysis during pause
- Prevents false "move in circle" warnings from jitter

---

## 📁 Files Changed

| File | Changes |
|------|---------|
| [heuristics_engine.js](file:///Users/yut/TaijiFlow/js/heuristics_engine.js) | Time-based detection, isPaused(), getMessage() |
| [drawing_manager.js](file:///Users/yut/TaijiFlow/js/drawing_manager.js) | Use TRANSLATIONS |
| [translations.js](file:///Users/yut/TaijiFlow/js/translations.js) | Added heur_*, circle_* keys |
| [CHANGELOG.md](file:///Users/yut/TaijiFlow/CHANGELOG.md) | v0.9.9 entry |
| [HEURISTICS_ENGINE.md](file:///Users/yut/TaijiFlow/docs/code/HEURISTICS_ENGINE.md) | Updated Rule 7 section |

---

## ✅ Verification

- **Test:** Pause hand ~2-3 seconds during training
- **Expected:** "⚠️ เคลื่อนไหวต่อเนื่อง อย่าหยุดนิ่ง" appears
- **Result:** ✅ Working

---

## 📋 Tomorrow: Test Remaining Rules

| Rule | Status |
|------|--------|
| 1. Path Shape | ✅ Tested |
| 2. Arm Rotation | ❌ To Test |
| 3. Elbow Sinking | ✅ Tested |
| 4. Waist Initiation | ❌ To Test |
| 5. Vertical Stability | ❌ To Test |
| 6. Smoothness | ❌ To Test |
| 7. Continuity | ✅ Tested |
| 8. Weight Shift | ❌ To Test (L3 only) |
