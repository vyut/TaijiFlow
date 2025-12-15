/**
 * TaijiFlow AI - Tutorial Manager v1.0.0
 * คู่มือการฝึกท่าม้วนไหม แบบ Popup
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
          types: {
            rh_cw: { name: "มือขวา ตามเข็ม", short: "RH-CW" },
            rh_ccw: { name: "มือขวา ทวนเข็ม", short: "RH-CCW" },
            lh_cw: { name: "มือซ้าย ตามเข็ม", short: "LH-CW" },
            lh_ccw: { name: "มือซ้าย ทวนเข็ม", short: "LH-CCW" },
          },
          levels: {
            L1: { name: "ระดับ 1 - นั่ง", desc: "สำหรับผู้เริ่มต้น" },
            L2: { name: "ระดับ 2 - ยืน", desc: "ระดับกลาง" },
            L3: { name: "ระดับ 3 - ยืนก้าว", desc: "ระดับสูง" },
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
            { icon: "2️⃣", text: "เลือกระดับ (L1 นั่ง / L2 ยืน / L3 ยืนก้าว)" },
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
            heading: "💡 เคล็ดลับ",
            items: [
              "ฝึกในที่แสงสว่างเพียงพอ",
              "ยืนห่างจากกล้อง 1.5-2 เมตร",
              "สวมเสื้อผ้าที่ตัดกับพื้นหลัง",
              "เริ่มจากระดับ L1 ก่อนเสมอ",
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
            heading: "💡 Tips",
            items: [
              "Practice in well-lit area",
              "Stand 1.5-2 meters from camera",
              "Wear clothes that contrast with background",
              "Always start with Level 1",
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
   */
  createUI() {
    // Tutorial Button
    const btn = document.createElement("button");
    btn.id = "tutorial-btn";
    btn.innerHTML = "❓";
    btn.title = "คู่มือการฝึก";
    btn.className =
      "fixed top-4 right-4 z-40 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xl shadow-lg transition-all";
    btn.onclick = () => this.open();
    document.body.appendChild(btn);

    // Tutorial Container (Modal)
    const container = document.createElement("div");
    container.id = "tutorial-container";
    container.className = "fixed inset-0 z-50 hidden";
    container.innerHTML = `
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="tutorialManager.close()"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  w-11/12 max-w-4xl h-[85vh] bg-gray-900 rounded-2xl shadow-2xl 
                  border border-purple-500/50 overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="tutorial-title" class="text-xl font-bold text-white">📖 คู่มือการฝึกท่าม้วนไหม</h2>
          <button onclick="tutorialManager.close()" class="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <!-- Tabs -->
        <div class="flex border-b border-gray-700">
          <button id="tab-principles" onclick="tutorialManager.switchTab('principles')" 
                  class="tutorial-tab flex-1 py-3 text-center text-white bg-purple-600">หลักการ</button>
          <button id="tab-exercises" onclick="tutorialManager.switchTab('exercises')" 
                  class="tutorial-tab flex-1 py-3 text-center text-gray-400 hover:text-white">ท่า 4 แบบ</button>
          <button id="tab-howto" onclick="tutorialManager.switchTab('howto')" 
                  class="tutorial-tab flex-1 py-3 text-center text-gray-400 hover:text-white">วิธีใช้</button>
        </div>
        
        <!-- Content -->
        <div id="tutorial-content" class="flex-1 overflow-y-auto p-6">
          <!-- Dynamic content here -->
        </div>
        
        <!-- Footer -->
        <div class="p-4 border-t border-gray-700 text-center">
          <button onclick="tutorialManager.close()" 
                  class="px-8 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            <span id="tutorial-close-btn">ปิด</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    this.containerEl = container;
    this.contentEl = document.getElementById("tutorial-content");
  }

  /**
   * Open tutorial popup
   */
  open(lang = "th") {
    // Try to get language from uiManager if available
    if (typeof uiManager !== "undefined" && uiManager.currentLang) {
      lang = uiManager.currentLang;
    }

    this.currentLang = lang;
    this.containerEl.classList.remove("hidden");
    this.isOpen = true;

    // Update title and tabs
    document.getElementById("tutorial-title").textContent = this.t(
      "title",
      lang
    );
    document.getElementById("tab-principles").textContent = this.t(
      "tabs.principles",
      lang
    );
    document.getElementById("tab-exercises").textContent = this.t(
      "tabs.exercises",
      lang
    );
    document.getElementById("tab-howto").textContent = this.t(
      "tabs.howto",
      lang
    );
    document.getElementById("tutorial-close-btn").textContent = this.t(
      "closeBtn",
      lang
    );

    this.switchTab(this.currentTab);
  }

  /**
   * Close tutorial popup
   */
  close() {
    this.containerEl.classList.add("hidden");
    this.isOpen = false;
  }

  /**
   * Switch between tabs
   */
  switchTab(tab) {
    this.currentTab = tab;

    // Update tab styles
    document.querySelectorAll(".tutorial-tab").forEach((t) => {
      t.classList.remove("bg-purple-600", "text-white");
      t.classList.add("text-gray-400");
    });
    document
      .getElementById(`tab-${tab}`)
      .classList.add("bg-purple-600", "text-white");
    document.getElementById(`tab-${tab}`).classList.remove("text-gray-400");

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
          <h3 class="text-2xl font-bold text-purple-400 mb-3">${p.heading}</h3>
          <p class="text-gray-300 leading-relaxed">${p.description}</p>
        </div>
        
        <!-- Benefits -->
        <div class="bg-green-900/20 border border-green-600/30 rounded-xl p-4">
          <h4 class="text-lg font-semibold text-green-400 mb-3">${
            p.benefits.heading
          }</h4>
          <div class="grid grid-cols-2 gap-2">
            ${p.benefits.items
              .map(
                (item) =>
                  `<div class="text-gray-300 flex items-start"><span class="text-green-400 mr-2">✓</span>${item}</div>`
              )
              .join("")}
          </div>
        </div>
        
        <!-- 10 Essentials -->
        <div class="bg-gray-800/50 rounded-xl p-4">
          <h4 class="text-lg font-semibold text-blue-400 mb-3">${
            p.essentials.heading
          }</h4>
          <div class="grid md:grid-cols-2 gap-2 text-sm">
            ${p.essentials.items
              .map(
                (item, i) =>
                  `<div class="text-gray-300 flex items-start"><span class="text-blue-400 mr-2 font-bold">${
                    i + 1
                  }.</span>${item}</div>`
              )
              .join("")}
          </div>
        </div>
        
        <!-- Key Points -->
        <div class="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4">
          <h4 class="text-lg font-semibold text-yellow-400 mb-3">${
            p.keyPoints.heading
          }</h4>
          <div class="grid md:grid-cols-2 gap-2">
            ${p.keyPoints.items
              .map(
                (item) =>
                  `<div class="text-gray-300 flex items-start"><span class="text-yellow-400 mr-2">•</span>${item}</div>`
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
        <h3 class="text-xl font-bold text-purple-400">${e.heading}</h3>
        
        <!-- Exercise Type Buttons -->
        <div class="flex flex-wrap gap-2">
          ${types
            .map(
              (type) => `
            <button onclick="tutorialManager.selectExercise('${type}')" 
              class="exercise-type-btn px-4 py-2 rounded-lg transition-colors
                ${
                  this.currentExercise === type
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }">
              ${e.types[type].short}
            </button>
          `
            )
            .join("")}
        </div>
        
        <!-- Level Buttons -->
        <div class="flex gap-2">
          ${levels
            .map(
              (level) => `
            <button onclick="tutorialManager.selectLevel('${level}')" 
              class="level-btn px-4 py-2 rounded-lg transition-colors
                ${
                  this.currentLevel === level
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }">
              ${level}
            </button>
          `
            )
            .join("")}
        </div>
        
        <!-- Exercise Detail -->
        <div class="bg-gray-800/50 rounded-xl p-4">
          <div class="flex flex-col gap-4">
            <!-- Image (full width for wide images) -->
            <div>
              <img id="exercise-image" 
                src="images/tutorial/${this.currentExercise}_${
      this.currentLevel
    }.png" 
                alt="${e.types[this.currentExercise].name}"
                class="w-full rounded-lg bg-gray-700"
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 200%22><rect fill=%22%23374151%22 width=%22800%22 height=%22200%22/><text x=%22400%22 y=%22100%22 text-anchor=%22middle%22 fill=%22%239CA3AF%22 font-size=%2216%22>Image: ${
                  this.currentExercise
                }_${this.currentLevel}</text></svg>'">
            </div>
            <!-- Description -->
            <div>
              <h4 class="text-xl font-bold text-white mb-2">${
                e.types[this.currentExercise].name
              }</h4>
              <p class="text-purple-400 mb-3">${
                e.levels[this.currentLevel].name
              } - ${e.levels[this.currentLevel].desc}</p>
              <p class="text-gray-300 mb-4">${exerciseDesc.summary}</p>
              
              <!-- 4 Steps -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                ${exerciseDesc.steps
                  .map(
                    (step, i) => `
                  <div class="bg-gray-700/50 rounded-lg p-3 text-center">
                    <div class="text-purple-400 font-bold mb-1">ขั้นที่ ${
                      i + 1
                    }</div>
                    <div class="text-gray-300 text-sm">${step}</div>
                  </div>
                `
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
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-purple-400">${h.heading}</h3>
        
        <!-- Steps -->
        <div class="space-y-3">
          ${h.steps
            .map(
              (step) => `
            <div class="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4">
              <span class="text-2xl">${step.icon}</span>
              <span class="text-gray-300">${step.text}</span>
            </div>
          `
            )
            .join("")}
        </div>
        
        <!-- Tips hidden for now -->
      </div>
    `;
  }
}

// Initialize Tutorial Manager
const tutorialManager = new TutorialManager();
