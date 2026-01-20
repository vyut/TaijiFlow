# Implementation Plan: Full I18n Refactor

## Goal
สร้างระบบ i18n แบบ Unified ที่ใช้ data-i18n attributes ทั้ง index.html และ app.html

## Proposed Changes
### Phase 1: Shared Infrastructure
[NEW] js/i18n_manager.js
สร้าง Module กลางสำหรับจัดการภาษา:

// Core Functions
function getLang() { /* localStorage */ }
function setLang(lang) { /* save + apply */ }
function applyTranslations(lang) { /* generic loop */ }
// Special handlers for complex cases
function translateDropdowns(lang) { /* handle <option> */ }
~50 lines

[MODIFY] js/translations.js
เพิ่ม landing section (~35 keys):

const TRANSLATIONS = {
  th: {
    landing: {
      nav_about: "เกี่ยวกับ",
      hero_badge: "การบรรจบกันของ...",
      btn_start: "เข้าสู่การฝึก",
      // ...
    },
    // existing app translations...
  },
  en: {
    landing: { ... },
    // existing...
  }
}
Phase 2: Index Refactor
[MODIFY] index.html
A. Add Language Toggle Button (Navbar)

<button id="lang-toggle" class="lang-btn">EN</button>
B. Add data-i18n to Elements (~30 elements)

<!-- Before -->
<a href="#about">เกี่ยวกับ</a>
<!-- After -->
<a href="#about" data-i18n="landing.nav_about">เกี่ยวกับ</a>
C. Import Scripts

<script src="js/translations.js"></script>
<script src="js/i18n_manager.js"></script>
[MODIFY] css/landing.css
Add language toggle button styles:

.lang-btn { /* styles */ }
Phase 3: App Refactor
[MODIFY] app.html
Add data-i18n to static elements (~50 elements):

Labels, buttons, modal text
Dropdown <option> elements
[MODIFY] js/ui_manager.js
Remove: ~100 lines of hardcoded 
setText()
 calls

Keep:

Theme management
Notification system
Special dynamic text handlers
Add: Call to applyTranslations() in 
init()

Verification Plan
Manual Testing
Index TH→EN: Toggle language, verify all text changes
App TH→EN: Toggle language, verify all text changes
Cross-page Sync: Change lang in app → go to index → should be same lang
Dropdowns: Verify options translated correctly
Persistence: Refresh page → lang should persist
Risk Assessment
Risk	Mitigation
Dropdown translation breaks	Keep legacy handler as fallback
Dynamic text (start/stop btn)	Use hybrid approach
Missing translations	Fallback to Thai
Estimated Time
Phase 1: 15 min
Phase 2: 20 min
Phase 3: 30 min
Phase 4: 10 min
Total: ~75 min