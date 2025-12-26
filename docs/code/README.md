# TaijiFlow AI - Code Documentation Index

**Version:** 0.6.0  
**Last Updated:** 2024-12-24

---

## 📚 เอกสารโค้ด

### ภาพรวมระบบ

| เอกสาร | คำอธิบาย |
|--------|---------|
| [SYSTEM_OVERVIEW.md](../SYSTEM_OVERVIEW.md) | สถาปัตยกรรม, Data Flow, Dependencies |

---

### Core Files

| ไฟล์ | เอกสาร | Lines | คำอธิบาย |
|------|--------|-------|---------|
| script.js | [SCRIPT_JS.md](SCRIPT_JS.md) | 1,723 | Main Controller |
| heuristics_engine.js | [HEURISTICS_ENGINE.md](HEURISTICS_ENGINE.md) | 973 | Pose Analysis (8 Rules) |
| calibration_manager.js | [CALIBRATION_MANAGER.md](CALIBRATION_MANAGER.md) | 362 | T-Pose Calibration |
| scoring_manager.js | [SCORING_MANAGER.md](SCORING_MANAGER.md) | 270 | Scoring System |

---

### UI & Display Files

| ไฟล์ | เอกสาร | Lines | คำอธิบาย |
|------|--------|-------|---------|
| audio_manager.js | [AUDIO_MANAGER.md](AUDIO_MANAGER.md) | 584 | TTS Feedback |
| drawing_manager.js | [DRAWING_MANAGER.md](DRAWING_MANAGER.md) | 430 | Canvas Drawing |
| ui_manager.js | [UTILITY_FILES.md](UTILITY_FILES.md#4-ui-manager) | 1,091 | UI Management |
| ghost_manager.js | [UTILITY_FILES.md](UTILITY_FILES.md#3-ghost-manager) | 261 | Ghost Overlay |

---

### Utility Files

| ไฟล์ | เอกสาร | Lines | คำอธิบาย |
|------|--------|-------|---------|
| path_generator.js | [UTILITY_FILES.md](UTILITY_FILES.md#1-path-generator) | 85 | Dynamic Path |
| session_manager.js | [UTILITY_FILES.md](UTILITY_FILES.md#2-session-manager) | 115 | User/Session ID |
| translations.js | [UTILITY_FILES.md](UTILITY_FILES.md#5-translations) | ~500 | i18n Strings |

---

### อื่นๆ

| ไฟล์ | Lines | คำอธิบาย |
|------|-------|---------|
| tutorial_manager.js | 750 | Tutorial Popup |
| chatbot.js | 600 | Gemini Chatbot |
| gesture_manager.js | 400 | Gesture Control |
| data_exporter.js | 200 | Data Export |
| rules_config_manager.js | 300 | Rules Settings UI |

---

## 📊 สถิติโค้ด

| Metric | Value |
|--------|-------|
| Total JS Files | 18 |
| Total Lines | ~8,500 |
| Core Logic | ~3,500 lines |
| UI/Display | ~2,500 lines |
| Utilities | ~2,500 lines |

---

*เอกสารนี้อัปเดตอัตโนมัติเมื่อมีการเปลี่ยนแปลงไฟล์*
