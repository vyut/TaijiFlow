/**
 * ============================================================================
 * TaijiFlow AI - Tutorial Manager v1.0
 * ============================================================================
 *
 * ระบบคู่มือการฝึก (Tutorial Popup System)
 *
 * @description
 *   แสดง Popup คู่มือการฝึกท่าม้วนไหมแบบ Interactive
 *   มี 3 Tabs: หลักการ, ท่าฝึก 4 แบบ, วิธีใช้งาน
 *
 * ============================================================================
 * โครงสร้าง Tabs
 * ============================================================================
 *
 *   1. Principles (หลักการ)
 *      - ความหมายท่าม้วนไหม
 *      - ประโยชน์การฝึก
 *      - หลัก 10 ข้อไท้เก๊ก
 *      - หลักสำคัญท่าม้วนไหม
 *
 *   2. Exercises (ท่าฝึก 4 แบบ)
 *      - RH-CW: มือขวา ตามเข็ม
 *      - RH-CCW: มือขวา ทวนเข็ม
 *      - LH-CW: มือซ้าย ตามเข็ม
 *      - LH-CCW: มือซ้าย ทวนเข็ม
 *      - แต่ละท่ามี 3 ระดับ (L1, L2, L3)
 *      - แสดงรูปภาพและขั้นตอน 4 ขั้น
 *
 *   3. How To Use (วิธีใช้งาน)
 *      - ขั้นตอนการใช้งาน 7 ข้อ
 *      - เคล็ดลับการฝึก
 *
 * ============================================================================
 * Features
 * ============================================================================
 *
 *   - Multi-language (TH/EN)
 *   - Responsive Design
 *   - Interactive Exercise Selector
 *   - Image Display per Exercise/Level
 *
 * ============================================================================
 * การใช้งาน
 * ============================================================================
 *
 *   ```javascript
 *   // สร้าง Instance (ทำเพียงครั้งเดียวตอนโหลดไฟล์)
 *   const tutorialManager = new TutorialManager();
 *
 *   // เปิด/ปิด Popup
 *   tutorialManager.open("th");  // เปิดภาษาไทย
 *   tutorialManager.close();     // ปิด
 *
 *   // สลับ Tab
 *   tutorialManager.switchTab("exercises");
 *   ```
 *
 * ============================================================================
 * @author TaijiFlow AI Team
 * @since 1.0.0
 * ============================================================================
 */

// =============================================================================
// CLASS: TutorialManager
// =============================================================================

/**
 * TutorialManager Class
 *
 * @description
 *   จัดการ Tutorial Popup และ Content ทั้งหมด
 */
class TutorialManager {
  constructor() {
    this.isOpen = false;
    this.currentTab = "principles";
    this.currentExercise = "rh_cw";
    this.currentLevel = "L1";

    // Translations
    this.translations = {
      th: {
        title: "📖 คู่มือการใช้ TaijiFlow AI",
        tabs: {
          principles: "หลักการ",
          exercises: "ท่าม้วนไหม 4 แบบ",
          howto: "วิธีใช้งาน",
        },
        principles: {
          heading: "ท่าม้วนไหมคืออะไร?",
          description:
            "ท่าม้วนไหม (Silk Reeling / 纏絲勁) เป็นการเคลื่อนไหวพื้นฐานที่สำคัญที่สุดของไท้เก๊กตระกูลเฉิน เป็นการฝึกให้พลังไหลเวียนผ่านร่างกายเป็นเกลียว เหมือนการดึงเส้นไหมจากรังไหม",
          benefits: {
            heading: "ประโยชน์จากการฝึก",
            items: [
              "พัฒนาการประสานงานของร่างกาย",
              "เสริมสร้างความยืดหยุ่นข้อต่อ",
              "ฝึกสมาธิและการรับรู้ร่างกาย",
              "เป็นพื้นฐานสู่ท่าไท้เก๊กอื่นๆ",
            ],
          },
          essentials: {
            heading: "หลักการมวยไท้เก๊ก 10 ข้อ",
            items: [
              "โปรงกระหม่อมเบา (虚领顶劲) - ศีรษะลอยขึ้นเบาๆ",
              "เก็บหน้าอกผ่อนหลัง (含胸拔背) - ไม่ยืดอกจนเกินไป",
              "ผ่อนคลายเอว (松腰) - เอวเป็นศูนย์กลาง",
              "แยกเต็มว่าง (分虚实) - รู้จักถ่ายน้ำหนัก",
              "จมไหล่ตกศอก (沉肩坠肘) - ไหล่และศอกผ่อนลง",
              "ใช้จิตไม่ใช้แรง (用意不用力) - เน้นความตั้งใจ",
              "บนล่างประสาน (上下相随) - ร่างกายเคลื่อนไหวพร้อมกัน",
              "ในนอกรวมเป็นหนึ่ง (内外相合) - จิตใจและร่างกายเป็นหนึ่ง",
              "ต่อเนื่องไม่ขาดตอน (相连不断) - การเคลื่อนไหวไม่หยุด",
              "สงบในเคลื่อนไหว (动中求静) - จิตนิ่งแม้กายเคลื่อน",
            ],
          },
          keyPoints: {
            heading: "หลักสำคัญท่าม้วนไหม",
            items: [
              "จมศอก - ศอกต้องอยู่ต่ำกว่าไหล่เสมอ",
              "ผ่อนไหล่ - ไม่ยกไหล่ขึ้น",
              "เอวนำ - ทุกการเคลื่อนไหวเริ่มจากเอว ไม่ใช่แขน",
              "ต่อเนื่อง - เคลื่อนไหวเป็นวงกลมไม่หยุด",
              "หมุนข้อมือ - ฝ่ามือหมุนตามทิศทางการเคลื่อนที่",
            ],
          },
        },
        exercises: {
          heading: "เลือกท่าที่ต้องการเรียนรู้",
          step: "ขั้นที่",
          types: {
            rh_cw: { name: "มือขวา ตามเข็ม", short: "RH-CW" },
            rh_ccw: { name: "มือขวา ทวนเข็ม", short: "RH-CCW" },
            lh_cw: { name: "มือซ้าย ตามเข็ม", short: "LH-CW" },
            lh_ccw: { name: "มือซ้าย ทวนเข็ม", short: "LH-CCW" },
          },
          levels: {
            L1: { name: "ระดับ 1 - นั่ง", desc: "สำหรับผู้เริ่มต้น" },
            L2: { name: "ระดับ 2 - ยืน", desc: "ระดับกลาง" },
            L3: { name: "ระดับ 3 - ยืนย่อ", desc: "ระดับสูง" },
          },
          descriptions: {
            rh_cw: {
              summary:
                "เริ่มจากตำแหน่งด้านล่าง หมุนมือขวาวนขึ้นทางด้านนอก ตามเข็มนาฬิกา",
              steps: [
                "ตัดฝ่ามือลง - ลดสะโพกนั่งลง + ถ่ายน้ำหนัก",
                "ดันฝ่ามือ - หมุนตัวส่งแรง",
                "อุ้มฝ่ามือ - ลดสะโพก + ถ่ายน้ำหนักไปทางขวา",
                "พลิกฝ่ามือ - พลิกข้อมือหมุน กลับสู่ท่าเริ่มต้น",
              ],
            },
            rh_ccw: {
              summary:
                "เริ่มจากตำแหน่งด้านบน หมุนมือขวาวนลงทางด้านใน ทวนเข็มนาฬิกา",
              steps: [
                "พลิกฝ่ามือ - พลิกข้อมือหมุน",
                "อุ้มฝ่ามือ - ลดสะโพก + ถ่ายน้ำหนักไปทางขวา",
                "ดันฝ่ามือ - หมุนตัวส่งแรง",
                "ตัดฝ่ามือลง - ลดสะโพกนั่งลง กลับสู่ท่าเริ่มต้น",
              ],
            },
            lh_cw: {
              summary:
                "เริ่มจากตำแหน่งด้านล่าง หมุนมือซ้ายวนขึ้นทางด้านนอก ตามเข็มนาฬิกา",
              steps: [
                "ตัดฝ่ามือลง - ลดสะโพกนั่งลง + ถ่ายน้ำหนัก",
                "ดันฝ่ามือ - หมุนตัวส่งแรง",
                "อุ้มฝ่ามือ - ลดสะโพก + ถ่ายน้ำหนักไปทางซ้าย",
                "พลิกฝ่ามือ - พลิกข้อมือหมุน กลับสู่ท่าเริ่มต้น",
              ],
            },
            lh_ccw: {
              summary:
                "เริ่มจากตำแหน่งด้านบน หมุนมือซ้ายวนลงทางด้านใน ทวนเข็มนาฬิกา",
              steps: [
                "พลิกฝ่ามือ - พลิกข้อมือหมุน",
                "อุ้มฝ่ามือ - ลดสะโพก + ถ่ายน้ำหนักไปทางซ้าย",
                "ดันฝ่ามือ - หมุนตัวส่งแรง",
                "ตัดฝ่ามือลง - ลดสะโพกนั่งลง กลับสู่ท่าเริ่มต้น",
              ],
            },
          },
        },
        howto: {
          heading: "วิธีใช้งาน TaijiFlow AI",
          steps: [
            { icon: "1️⃣", text: "เลือกท่า (มือขวา/ซ้าย, ตาม/ทวนเข็ม)" },
            { icon: "2️⃣", text: "เลือกระดับ (L1 นั่ง / L2 ยืน / L3 ยืนย่อ)" },
            {
              icon: "3️⃣",
              text: "กด 'เริ่มการฝึก' หรือ 👍 ยกนิ้วโป้ง 2 วินาที",
            },
            { icon: "4️⃣", text: "ยืนในท่า T-Pose 3 วินาที เพื่อ Calibrate" },
            { icon: "5️⃣", text: "ทำตามเส้นสีเขียว ฟังเสียงแจ้งเตือน" },
            { icon: "6️⃣", text: "กด 'หยุด' หรือ ✊ กำมือ 2 วินาที เพื่อหยุด" },
            { icon: "7️⃣", text: "ดูคะแนนและข้อผิดพลาดเพื่อปรับปรุง" },
          ],
          tips: {
            heading: "� ข้อแนะนำ",
            items: [
              {
                icon: "✅",
                label: "Device:",
                text: "รองรับ Mac/PC Desktop/Laptop ที่มี Webcam",
              },
              {
                icon: "✅",
                label: "Space:",
                text: "แสงสว่างเพียงพอ ยืนห่างจากกล้อง 1.5-2 เมตร",
              },
              {
                icon: "✅",
                label: "Wear:",
                text: "สวมเสื้อที่มีสีตัดกับพื้นหลัง",
              },
            ],
          },
          warnings: {
            heading: "⚠️ ข้อควรระวัง",
            items: [
              {
                icon: "🛑",
                label: "Limitation:",
                text: "AI เป็นผู้ช่วยฝึก ไม่สามารถแทนครูผู้สอนจริง",
              },
              {
                icon: "🛑",
                label: "Health:",
                text: "หากมีอาการไม่สบาย หรือไม่ปกติ ให้หยุดฝึกทันที",
              },
              {
                icon: "🛑",
                label: "Disclaimer:",
                text: "สำหรับผู้มีปัญหาสุขภาพ ปรึกษาแพทย์ก่อนใช้",
              },
            ],
          },
        },
        closeBtn: "ปิด",
      },
      en: {
        title: "📖 TaijiFlow AI User Guide",
        tabs: {
          principles: "Principles",
          exercises: "4 Exercises",
          howto: "How to Use",
        },
        principles: {
          heading: "What is Silk Reeling?",
          description:
            "Silk Reeling (纏絲勁 / Chán Sī Jìn) is the foundational movement of Chen-style Taijiquan. It trains the body to move energy in spiraling patterns, like drawing silk threads from a cocoon.",
          benefits: {
            heading: "Benefits of Practice",
            items: [
              "Develops body coordination",
              "Improves joint flexibility",
              "Trains focus and body awareness",
              "Foundation for all Taijiquan forms",
            ],
          },
          essentials: {
            heading: "10 Taijiquan Essentials",
            items: [
              "Empty the neck, lift the head - Head floats up lightly",
              "Contain chest, raise back - Don't puff out the chest",
              "Relax the waist - Waist is the center of rotation",
              "Distinguish empty and full - Know weight distribution",
              "Sink shoulders, drop elbows - Shoulders and elbows relaxed",
              "Use mind, not force - Focus on intention",
              "Upper and lower follow - Body moves together",
              "Internal and external unite - Mind and body as one",
              "Continuous without break - Movement never stops",
              "Stillness in motion - Calm mind in moving body",
            ],
          },
          keyPoints: {
            heading: "Silk Reeling Key Principles",
            items: [
              "Sink elbows - Elbows must stay below shoulder level",
              "Relax shoulders - Don't raise the shoulders",
              "Waist leads - All movement starts from waist, not arms",
              "Continuous - Move in circles without stopping",
              "Rotate wrist - Palm rotates following movement direction",
            ],
          },
        },
        exercises: {
          heading: "Select an exercise to learn",
          step: "Step",
          types: {
            rh_cw: { name: "Right Hand Clockwise", short: "RH-CW" },
            rh_ccw: { name: "Right Hand Counter-CW", short: "RH-CCW" },
            lh_cw: { name: "Left Hand Clockwise", short: "LH-CW" },
            lh_ccw: { name: "Left Hand Counter-CW", short: "LH-CCW" },
          },
          levels: {
            L1: { name: "Level 1 - Seated", desc: "For beginners" },
            L2: { name: "Level 2 - Standing", desc: "Intermediate" },
            L3: { name: "Level 3 - Bow Stance", desc: "Advanced" },
          },
          descriptions: {
            rh_cw: {
              summary:
                "Start from bottom, rotate right hand upward outward clockwise",
              steps: [
                "Cut palm down - Lower hip + shift weight",
                "Push palm - Rotate body to send force",
                "Support palm - Lower hip + shift weight right",
                "Flip palm - Rotate wrist, return to start",
              ],
            },
            rh_ccw: {
              summary:
                "Start from top, rotate right hand downward inward counter-clockwise",
              steps: [
                "Flip palm - Rotate wrist",
                "Support palm - Lower hip + shift weight right",
                "Push palm - Rotate body to send force",
                "Cut palm down - Lower hip, return to start",
              ],
            },
            lh_cw: {
              summary:
                "Start from bottom, rotate left hand upward outward clockwise",
              steps: [
                "Cut palm down - Lower hip + shift weight",
                "Push palm - Rotate body to send force",
                "Support palm - Lower hip + shift weight left",
                "Flip palm - Rotate wrist, return to start",
              ],
            },
            lh_ccw: {
              summary:
                "Start from top, rotate left hand downward inward counter-clockwise",
              steps: [
                "Flip palm - Rotate wrist",
                "Support palm - Lower hip + shift weight left",
                "Push palm - Rotate body to send force",
                "Cut palm down - Lower hip, return to start",
              ],
            },
          },
        },
        howto: {
          heading: "How to Use TaijiFlow AI",
          steps: [
            { icon: "1️⃣", text: "Select exercise (Right/Left, CW/CCW)" },
            {
              icon: "2️⃣",
              text: "Select level (L1 Seated / L2 Standing / L3 Bow)",
            },
            { icon: "3️⃣", text: "Click 'Start' or 👍 Thumb Up for 2 seconds" },
            { icon: "4️⃣", text: "Stand in T-Pose for 3 seconds to calibrate" },
            { icon: "5️⃣", text: "Follow the green path, listen to feedback" },
            {
              icon: "6️⃣",
              text: "Click 'Stop' or ✊ Closed Fist for 2 seconds",
            },
            { icon: "7️⃣", text: "Review your score and errors to improve" },
          ],
          tips: {
            heading: "� Tips",
            items: [
              {
                icon: "✅",
                label: "Device:",
                text: "Supports Mac/PC Desktop/Laptop with Webcam",
              },
              {
                icon: "✅",
                label: "Space:",
                text: "Well-lit area, stand 1.5-2m from camera",
              },
              {
                icon: "✅",
                label: "Wear:",
                text: "Clothes that contrast with background",
              },
            ],
          },
          warnings: {
            heading: "⚠️ Warnings",
            items: [
              {
                icon: "🛑",
                label: "Limitation:",
                text: "AI is a training assistant, not a replacement for a real teacher",
              },
              {
                icon: "🛑",
                label: "Health:",
                text: "If you feel unwell or abnormal, stop training immediately",
              },
              {
                icon: "🛑",
                label: "Disclaimer:",
                text: "Consult a doctor before use if you have health issues",
              },
            ],
          },
        },
        closeBtn: "Close",
      },
    };

    this.createUI();
  }

  /**
   * Get translation based on current language
   */
  t(key, lang = "th") {
    const keys = key.split(".");
    let value = this.translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }

  /**
   * Create Tutorial UI elements
   * @deprecated v4.0 - Use open() with dynamic generation
   */
  createUI() {
    // Tutorial Button - Bind existing button in HTML
    const btn = document.getElementById("tutorial-btn");
    if (btn) {
      btn.onclick = () => this.open();
    }
  }

  /**
   * Open tutorial popup
   */
  open(lang = "th") {
    if (!window.uiManager) return;

    // Try to get language from uiManager if available
    if (window.uiManager.currentLang) {
      lang = window.uiManager.currentLang;
    }

    this.currentLang = lang;
    this.isOpen = true;

    // Prepare Translations
    const t_Title = this.t("title", lang);
    const t_Tab1 = this.t("tabs.principles", lang);
    const t_Tab2 = this.t("tabs.exercises", lang);
    const t_Tab3 = this.t("tabs.howto", lang);
    const t_Close = this.t("closeBtn", lang);

    // Generate Full HTML Structure
    const html = `
      <div class="w-11/12 max-w-4xl h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl 
                  border border-purple-500/50 overflow-hidden flex flex-col 
                  transform scale-95 animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 id="tutorial-title" class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            ${t_Title}
          </h2>
          <!-- Close X Button managed by shell, but we can add one here too -->
          <button id="tutorial-x-btn" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">&times;</button>
        </div>
        
        <!-- Tabs -->
        <div class="flex border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/30">
          <button id="tab-principles" onclick="tutorialManager.switchTab('principles')" 
                  class="tutorial-tab flex-1 py-3 text-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium border-b-2 border-transparent">
            ${t_Tab1}
          </button>
          <button id="tab-exercises" onclick="tutorialManager.switchTab('exercises')" 
                  class="tutorial-tab flex-1 py-3 text-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium border-b-2 border-transparent">
            ${t_Tab2}
          </button>
          <button id="tab-howto" onclick="tutorialManager.switchTab('howto')" 
                  class="tutorial-tab flex-1 py-3 text-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium border-b-2 border-transparent">
            ${t_Tab3}
          </button>
        </div>
        
        <!-- Content Area -->
        <div id="tutorial-content" class="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-gray-900">
          <!-- Dynamic content will be injected here -->
        </div>
        
        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/50">
          <button id="tutorial-close-btn" 
                  class="px-8 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-purple-500/30">
            ${t_Close}
          </button>
        </div>

        <style>
           .custom-scrollbar::-webkit-scrollbar { width: 8px; }
           .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
           .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; }
           .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
           .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
           .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
           .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
           @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        </style>
      </div>
    `;

    // Call Shared Popup
    window.uiManager.showPopup(html, {
      id: "tutorial-popup",
      closeBtnId: "tutorial-x-btn",
      onClose: () => {
        this.isOpen = false;
        // Clean up references
        this.contentEl = null;
      },
    });

    // Re-bind content element reference immediately
    this.contentEl = document.getElementById("tutorial-content");

    // Bind Footer Close Button manually (since we used ID for X button in options)
    const footerClose = document.getElementById("tutorial-close-btn");
    if (footerClose) {
      footerClose.onclick = () => this.close();
    }

    // Render Initial Tab
    this.switchTab(this.currentTab);
  }

  /**
   * Close tutorial popup
   */
  close() {
    this.isOpen = false;
    // Let UIManager handle the DOM removal via its generic close mechanism
    // We can simulate a click on the bound close button or just hide the popup ID
    const popup = document.getElementById("tutorial-popup");
    if (popup) {
      // Trigger the standard close animation/logic from UIManager if possible,
      // or just emulate user action.
      // Easiest is to find the close button we told UIManager about.
      const xBtn = document.getElementById("tutorial-x-btn");
      if (xBtn) xBtn.click();
      else popup.click(); // Click outside fallback
    }
  }

  /**
   * Switch between tabs
   */
  /**
   * Switch between tabs
   */
  switchTab(tab) {
    this.currentTab = tab;

    // Update tab styles (New Design: Border Bottom + Text Color)
    const tabs = ["principles", "exercises", "howto"];
    tabs.forEach((t) => {
      const btn = document.getElementById(`tab-${t}`);
      if (btn) {
        if (t === tab) {
          // Active
          btn.classList.add(
            "text-purple-600",
            "dark:text-purple-400",
            "border-purple-500",
            "bg-purple-50",
            "dark:bg-white/5",
          );
          btn.classList.remove(
            "text-gray-500",
            "dark:text-gray-400",
            "border-transparent",
          );
        } else {
          // Inactive
          btn.classList.add(
            "text-gray-500",
            "dark:text-gray-400",
            "border-transparent",
          );
          btn.classList.remove(
            "text-purple-600",
            "dark:text-purple-400",
            "border-purple-500",
            "bg-purple-50",
            "dark:bg-white/5",
          );
        }
      }
    });

    // Render content
    this.renderContent(tab);
  }

  /**
   * Render tab content
   */
  renderContent(tab) {
    const lang = this.currentLang || "th";

    switch (tab) {
      case "principles":
        this.renderPrinciples(lang);
        break;
      case "exercises":
        this.renderExercises(lang);
        break;
      case "howto":
        this.renderHowTo(lang);
        break;
    }
  }

  /**
   * Render Principles tab
   */
  renderPrinciples(lang) {
    const p = this.t("principles", lang);
    this.contentEl.innerHTML = `
      <div class="space-y-6">
        <div>
          <h3 class="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-3">${p.heading}</h3>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${p.description}</p>
        </div>
        
        <!-- Benefits -->
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600/30 rounded-xl p-4">
          <h4 class="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">${
            p.benefits.heading
          }</h4>
          <div class="grid grid-cols-2 gap-2">
            ${p.benefits.items
              .map(
                (item) =>
                  `<div class="text-gray-700 dark:text-gray-300 flex items-start"><span class="text-green-600 dark:text-green-400 mr-2">✓</span>${item}</div>`,
              )
              .join("")}
          </div>
        </div>
        
        <!-- 10 Essentials -->
        <div class="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4">
          <h4 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">${
            p.essentials.heading
          }</h4>
          <div class="grid md:grid-cols-2 gap-2 text-sm">
            ${p.essentials.items
              .map(
                (item, i) =>
                  `<div class="text-gray-700 dark:text-gray-300 flex items-start"><span class="text-blue-600 dark:text-blue-400 mr-2 font-bold">${
                    i + 1
                  }.</span>${item}</div>`,
              )
              .join("")}
          </div>
        </div>
        
        <!-- Key Points -->
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600/30 rounded-xl p-4">
          <h4 class="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-3">${
            p.keyPoints.heading
          }</h4>
          <div class="grid md:grid-cols-2 gap-2">
            ${p.keyPoints.items
              .map(
                (item) =>
                  `<div class="text-gray-700 dark:text-gray-300 flex items-start"><span class="text-yellow-600 dark:text-yellow-400 mr-2">•</span>${item}</div>`,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Exercises tab
   */
  renderExercises(lang) {
    const e = this.t("exercises", lang);
    const types = Object.keys(e.types);
    const levels = Object.keys(e.levels);

    const exerciseDesc = e.descriptions[this.currentExercise];

    this.contentEl.innerHTML = `
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-purple-600 dark:text-purple-400">${e.heading}</h3>
        
        <!-- Exercise Type Buttons -->
        <div class="flex flex-wrap gap-2">
          ${types
            .map(
              (type) => `
            <button onclick="tutorialManager.selectExercise('${type}')" 
              class="exercise-type-btn px-4 py-2 rounded-lg transition-colors text-sm font-medium
                ${
                  this.currentExercise === type
                    ? "bg-purple-600 text-white shadow-md transform scale-105"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }">
              ${e.types[type].name}
            </button>
          `,
            )
            .join("")}
        </div>
        
        <!-- Exercise Detail -->
        <div class="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4">
          <div class="flex flex-col gap-4">
            <!-- Image -->
            <div>
              <img id="exercise-image" 
                src="images/tutorial/${this.currentExercise}_L1.png" 
                alt="${e.types[this.currentExercise].name}"
                class="w-full rounded-lg bg-gray-200 dark:bg-gray-700"
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 200%22><rect fill=%22%23374151%22 width=%22800%22 height=%22200%22/><text x=%22400%22 y=%22100%22 text-anchor=%22middle%22 fill=%22%239CA3AF%22 font-size=%2216%22>Image: ${
                  this.currentExercise
                }</text></svg>'">
            </div>
            <!-- Description -->
            <div>
              <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${
                e.types[this.currentExercise].name
              }</h4>
              <p class="text-gray-700 dark:text-gray-300 mb-4">${exerciseDesc.summary}</p>
              
              <!-- 4 Steps -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                ${exerciseDesc.steps
                  .map(
                    (step, i) => `
                  <div class="bg-white dark:bg-gray-700/50 rounded-lg p-3 text-center shadow-sm dark:shadow-none">
                    <div class="text-purple-600 dark:text-purple-400 font-bold mb-1">${e.step} ${
                      i + 1
                    }</div>
                    <div class="text-gray-600 dark:text-gray-300 text-sm">${step}</div>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Select exercise type
   */
  selectExercise(type) {
    this.currentExercise = type;
    this.renderExercises(this.currentLang);
  }

  /**
   * Select level
   */
  selectLevel(level) {
    this.currentLevel = level;
    this.renderExercises(this.currentLang);
  }

  /**
   * Render How To Use tab
   */
  renderHowTo(lang) {
    const h = this.t("howto", lang);

    this.contentEl.innerHTML = `
      <div class="h-full flex flex-col">
        <h3 class="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4 shrink-0">${h.heading}</h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
          <!-- Left Column: Steps -->
          <div class="space-y-3">
            ${h.steps
              .map(
                (step) => `
              <div class="flex items-center gap-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 transition hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-purple-200 dark:hover:border-purple-800">
                <span class="text-3xl filter drop-shadow-sm">${step.icon}</span>
                <span class="text-gray-800 dark:text-gray-200 font-medium">${step.text}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <!-- Right Column: Tips & Warning -->
          <div class="space-y-6">
            <!-- Tips Section -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600/30 rounded-xl p-5 shadow-sm">
              <h4 class="text-lg font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                ${h.tips.heading}
              </h4>
              <div class="space-y-3">
                ${h.tips.items
                  .map(
                    (item) => `
                  <div class="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span class="text-green-600 dark:text-green-400 mt-0.5 text-lg">${item.icon}</span>
                    <span class="leading-relaxed"><strong class="text-gray-900 dark:text-white">${item.label}</strong> ${item.text}</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
            
            <!-- Warnings Section -->
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-600/30 rounded-xl p-5 shadow-sm">
              <h4 class="text-lg font-bold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
                ${h.warnings.heading}
              </h4>
              <div class="space-y-3">
                ${h.warnings.items
                  .map(
                    (item) => `
                  <div class="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500 dark:text-red-400 mt-0.5 text-lg">${item.icon}</span>
                    <span class="leading-relaxed"><strong class="text-gray-900 dark:text-white">${item.label}</strong> ${item.text}</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize Tutorial Manager
const tutorialManager = new TutorialManager();
