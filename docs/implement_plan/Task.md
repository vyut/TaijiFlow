# Task: Update System Architecture Diagrams for TaijiFlow

## Objective

วิเคราะห์ codebase ทั้งหมดและอัปเดต/สร้าง diagrams ที่สำคัญสำหรับรายงาน SE ป.โท

---

## Phase 1: Analysis ✅

- [x] Explore codebase structure (19 JS modules)
- [x] Analyze main modules
- [x] Identify new features (9 new features found)
- [x] Document current system flow

## Phase 2: Diagram Planning ✅

- [x] Compare current code with existing diagrams
- [x] Identify diagrams that need updating
- [x] Plan new diagrams (Class + Sequence)

## Phase 3: Implementation (In Progress)

- [x] Update ActivityDiagram_UC02.wsd (add Low Light Check) ✅
- [x] Create ClassDiagram.wsd ✅ (14 classes, 20 relationships)
- [x] Update ActivityDiagram_UC05.wsd (add Display Options + Rules Config) ✅
- [x] Update ActivityDiagram_UC06.wsd (data_collector details) ✅
- [x] Add Gesture Hint UI (index.html, translations.js, ui_manager.js) ✅
- [ ] Create SequenceDiagram_UC02.wsd ⏳ (TODO)
- [ ] Update System Architecture doc (optional)

---

## New Features Found

- Low Light Warning
- Theme System (Dark/Light)
- Ghost Manager + Silhouette Video
- Score Popup Manager
- Rules Config Manager
- Gesture Manager
- Tutorial Manager
- Feedback Manager
- Audio Manager - TTS

---

## Session Log: 2026-01-06

### ✅ สิ่งที่ทำเสร็จ

1. **ClassDiagram.wsd** - สร้างใหม่ (14 classes, 20 relationships)
2. **ActivityDiagram_UC05.wsd** - เพิ่ม Display Options + Rules Config + Dev Notes
3. **ActivityDiagram_UC06.wsd** - อัปเดตให้ตรงกับ data_collector.html
4. **Gesture Hint UI** - เพิ่มใน Start Overlay (👍/✊)
5. **ตรวจสอบ UML** - Verify ทุก diagrams (UC01-UC06, Heuristics, Class)

### ⏳ สิ่งที่ต้องทำต่อ

1. **SequenceDiagram_UC02.wsd** - สร้างใหม่
2. **(Optional)** Component Diagram
3. **(Optional)** State Diagram
