/**
 * TaijiFlow AI - Chatbot Manager v1.0
 * ผู้ช่วยตอบคำถามเกี่ยวกับมวยไท้เก๊กและท่าม้วนไหม
 * ใช้ Gemini API
 */

class TaijiChatbot {
  constructor() {
    this.apiKey = localStorage.getItem("taijiflow_gemini_key") || "";
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;

    // System Prompt - ความรู้เกี่ยวกับไท้เก๊ก
    this.systemPrompt = `คุณคือครูสอนมวยไท้เก๊ก (Taijiquan) ผู้เชี่ยวชาญด้านท่าม้วนไหม (Silk Reeling - Chán Sī Gōng)

## ความรู้ของคุณ:

### หลักการไท้เก๊ก 10 ข้อ (10 Essentials):
1. โปรงกระหม่อมเบา (虚领顶劲) - ศีรษะลอยขึ้นเบาๆ
2. เก็บหน้าอกผ่อนหลัง (含胸拔背) - ไม่ยืดอกจนเกินไป
3. ผ่อนคลายเอว (松腰) - เอวเป็นศูนย์กลาง
4. แยกเต็มว่าง (分虚实) - รู้จักถ่ายน้ำหนัก
5. จมไหล่ตกศอก (沉肩坠肘) - ไหล่และศอกผ่อนลง
6. ใช้จิตไม่ใช้แรง (用意不用力) - เน้นความตั้งใจ
7. บนล่างประสาน (上下相随) - ร่างกายเคลื่อนไหวพร้อมกัน
8. ในนอกรวมเป็นหนึ่ง (内外相合) - จิตใจและร่างกายเป็นหนึ่ง
9. ต่อเนื่องไม่ขาดตอน (相连不断) - การเคลื่อนไหวไม่หยุด
10. สงบในเคลื่อนไหว (动中求静) - จิตนิ่งแม้กายเคลื่อน

### ท่าม้วนไหม (Silk Reeling) 4 ท่าพื้นฐาน:
1. **มือขวาตามเข็มนาฬิกา (Right Hand Clockwise)**: เริ่มจากด้านล่างซ้าย วนขึ้นไปด้านบนขวา
2. **มือขวาทวนเข็มนาฬิกา (Right Hand Counter-Clockwise)**: เริ่มจากด้านบนขวา วนลงมาด้านล่างซ้าย
3. **มือซ้ายตามเข็มนาฬิกา (Left Hand Clockwise)**: กระจกเงาของมือขวาทวนเข็ม
4. **มือซ้ายทวนเข็มนาฬิกา (Left Hand Counter-Clockwise)**: กระจกเงาของมือขวาตามเข็ม

### หลักสำคัญของท่าม้วนไหม:
- **จมศอก**: ศอกต้องอยู่ต่ำกว่าไหล่เสมอ
- **ผ่อนไหล่**: ไม่ยกไหล่ขึ้น
- **เอวนำ**: ทุกการเคลื่อนไหวเริ่มจากเอว ไม่ใช่แขน
- **ต่อเนื่อง**: เคลื่อนไหวเป็นวงกลมไม่หยุด
- **หมุนข้อมือ**: ฝ่ามือหมุนตามทิศทางการเคลื่อนที่

### 3 ระดับการฝึก:
- **ระดับ 1 (ท่านั่ง)**: นั่งบนเก้าอี้ เน้นเฉพาะการเคลื่อนไหวแขน
- **ระดับ 2 (ท่ายืน)**: ยืนตรง เพิ่มการหมุนเอวและถ่ายน้ำหนัก
- **ระดับ 3 (ท่ายืนย่อ)**: ย่อเข่า เพิ่มความมั่นคงและพลังขา

### ประโยชน์ของท่าม้วนไหม:
- เพิ่มความยืดหยุ่นของข้อต่อ
- เสริมสร้างความสมดุล
- ฝึกสมาธิและการรับรู้ร่างกาย
- เสริมการไหลเวียนพลังชี่
- ลดความเครียดและผ่อนคลาย

## วิธีตอบ:
- ตอบเป็นภาษาไทยหากถามเป็นไทย, อังกฤษหากถามเป็นอังกฤษ
- ตอบกระชับแต่ครบถ้วน
- ยกตัวอย่างประกอบเมื่อเหมาะสม
- หากไม่แน่ใจ ให้บอกตรงๆ`;

    this.init();
  }

  init() {
    this.createUI();
    this.bindEvents();
  }

  createUI() {
    // Chat Toggle Button
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "chat-toggle-btn";
    toggleBtn.innerHTML = "🤖";
    toggleBtn.title = "ถามครูไท้เก๊ก";
    document.body.appendChild(toggleBtn);

    // Chat Container
    const chatContainer = document.createElement("div");
    chatContainer.id = "chat-container";
    chatContainer.classList.add("hidden");
    chatContainer.innerHTML = `
      <div class="chat-header">
        <span>🥋 ครูไท้เก๊ก AI</span>
        <button id="chat-close-btn">✕</button>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div class="chat-welcome">
          <p>สวัสดีครับ! ผมคือครูไท้เก๊ก AI 🙏</p>
          <p>ถามเกี่ยวกับ:</p>
          <ul>
            <li>หลักการไท้เก๊ก</li>
            <li>ท่าม้วนไหม (Silk Reeling)</li>
            <li>วิธีฝึกที่ถูกต้อง</li>
            <li>ประโยชน์ของการฝึก</li>
          </ul>
        </div>
      </div>
      <div class="chat-input-area">
        <input type="text" id="chat-input" placeholder="พิมพ์คำถาม..." />
        <button id="chat-send-btn">➤</button>
      </div>
      <div class="chat-api-setup ${this.apiKey ? "hidden" : ""}" id="api-setup">
        <p>⚠️ กรุณาใส่ Gemini API Key</p>
        <input type="password" id="api-key-input" placeholder="API Key..." />
        <button id="save-api-key-btn">บันทึก</button>
        <a href="https://aistudio.google.com/app/apikey" target="_blank">ขอ API Key ฟรี</a>
      </div>
    `;
    document.body.appendChild(chatContainer);
  }

  bindEvents() {
    // Toggle chat
    document.getElementById("chat-toggle-btn").addEventListener("click", () => {
      this.toggleChat();
    });

    // Close chat
    document.getElementById("chat-close-btn").addEventListener("click", () => {
      this.toggleChat();
    });

    // Send message
    document.getElementById("chat-send-btn").addEventListener("click", () => {
      this.sendMessage();
    });

    // Enter key to send
    document.getElementById("chat-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !this.isLoading) {
        this.sendMessage();
      }
    });

    // Save API Key
    document
      .getElementById("save-api-key-btn")
      .addEventListener("click", () => {
        this.saveApiKey();
      });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const container = document.getElementById("chat-container");
    const toggleBtn = document.getElementById("chat-toggle-btn");

    if (this.isOpen) {
      container.classList.remove("hidden");
      toggleBtn.innerHTML = "✕";
      document.getElementById("chat-input").focus();
    } else {
      container.classList.add("hidden");
      toggleBtn.innerHTML = "🤖";
    }
  }

  saveApiKey() {
    const keyInput = document.getElementById("api-key-input");
    const key = keyInput.value.trim();
    if (key) {
      this.apiKey = key;
      localStorage.setItem("taijiflow_gemini_key", key);
      document.getElementById("api-setup").classList.add("hidden");
      this.addMessage("system", "✅ บันทึก API Key เรียบร้อยแล้ว!");
    }
  }

  async sendMessage() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();

    if (!message || this.isLoading) return;

    if (!this.apiKey) {
      this.addMessage("system", "⚠️ กรุณาใส่ API Key ก่อน");
      return;
    }

    // Add user message
    this.addMessage("user", message);
    input.value = "";
    this.isLoading = true;

    // Show loading
    const loadingId = this.addMessage("bot", "กำลังคิด...");

    try {
      const response = await this.callGeminiAPI(message);
      this.updateMessage(loadingId, response);
    } catch (error) {
      console.error("Chatbot error:", error);
      this.updateMessage(loadingId, `❌ เกิดข้อผิดพลาด: ${error.message}`);
    }

    this.isLoading = false;
  }

  async callGeminiAPI(userMessage) {
    // ใช้ gemini-2.0-flash-exp (ฟรี) หรือ gemini-1.5-flash-latest
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`;

    // Build conversation history
    const contents = [
      {
        role: "user",
        parts: [{ text: this.systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "เข้าใจแล้วครับ ผมพร้อมตอบคำถามเกี่ยวกับมวยไท้เก๊กและท่าม้วนไหมแล้วครับ",
          },
        ],
      },
    ];

    // Add previous messages
    for (const msg of this.messages.slice(-10)) {
      // Last 10 messages
      if (msg.role !== "system") {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API Error");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  addMessage(role, content) {
    const messagesContainer = document.getElementById("chat-messages");
    const msgId = `msg-${Date.now()}`;

    const msgDiv = document.createElement("div");
    msgDiv.id = msgId;
    msgDiv.className = `chat-message ${role}`;
    msgDiv.innerHTML = this.formatMessage(content);

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (role !== "system") {
      this.messages.push({ role, content });
    }

    return msgId;
  }

  updateMessage(msgId, content) {
    const msgDiv = document.getElementById(msgId);
    if (msgDiv) {
      msgDiv.innerHTML = this.formatMessage(content);

      // Update in messages array
      const lastBotMsgIndex = this.messages.findLastIndex(
        (m) => m.role === "bot"
      );
      if (lastBotMsgIndex >= 0) {
        this.messages[lastBotMsgIndex].content = content;
      }
    }
  }

  formatMessage(text) {
    // Basic markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.taijiChatbot = new TaijiChatbot();
});
