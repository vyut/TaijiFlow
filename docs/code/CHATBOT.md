# TaijiFlow AI - Chatbot Documentation

**Version:** 1.1  
**Last Updated:** 2026-01-10  
**Lines:** 487  
**Class:** TaijiChatbot

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Gemini API Integration](#2-gemini-api-integration)
3. [System Prompt](#3-system-prompt)
4. [Methods Reference](#4-methods-reference)
5. [UI Structure](#5-ui-structure)
6. [Code Examples](#6-code-examples)

---

## 1. ภาพรวม

`TaijiChatbot` คือ AI Chatbot ใช้ Gemini API สำหรับตอบคำถามเกี่ยวกับมวยไท้เก๊ก

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Gemini Integration** | เรียก Gemini 1.5 Flash API |
| **Context Awareness** | มี System Prompt เฉพาะทาง |
| **Markdown Support** | แปลง markdown เป็น HTML |
| **API Key Storage** | เก็บ key ใน localStorage |

### 📊 การใช้งาน

```javascript
// สร้างอัตโนมัติตอนโหลดไฟล์
window.taijiChatbot = new TaijiChatbot();

// เปิด/ปิด Chat
taijiChatbot.toggleChat();
```

---

## 2. Gemini API Integration

### API Configuration

| Parameter | Value |
|-----------|-------|
| Model | `gemini-1.5-flash` |
| Endpoint | `generativelanguage.googleapis.com` |
| Method | POST |

### Request Format

```javascript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'เข้าใจครับ' }] },
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })
  }
);
```

---

## 3. System Prompt

### Topics Covered

| Topic | Description |
|-------|-------------|
| **8 หลักการ** | หลักการของท่าม้วนไหม |
| **เทคนิค** | วิธีการฝึกที่ถูกต้อง |
| **ข้อควรระวัง** | สิ่งที่ควรหลีกเลี่ยง |
| **ประโยชน์** | ประโยชน์ต่อสุขภาพ |
| **ปรัชญา** | หยินหยาง, เต๋า |

### Prompt Structure

```
คุณเป็นผู้เชี่ยวชาญด้านมวยไท้เก๊กสายเฉินสไตล์...

หลักการ 8 ข้อ:
1. เส้นทางวงกลม - ...
2. ศอกจม - ...
...

เมื่อผู้ใช้ถามเกี่ยวกับ "หลักการ" ให้อธิบาย...
เมื่อผู้ใช้ถามเกี่ยวกับ "เทคนิค" ให้แนะนำ...
```

---

## 4. Methods Reference

### Initialization

| Method | Description |
|--------|-------------|
| `constructor()` | สร้าง properties, load API key, create UI |
| `init()` | Initialize chatbot |
| `createUI()` | สร้าง chat UI elements |
| `bindEvents()` | ผูก event listeners |

### Chat Control

| Method | Returns | Description |
|--------|---------|-------------|
| `toggleChat()` | void | เปิด/ปิด chat panel |
| `saveApiKey()` | void | บันทึก API key ลง localStorage |

### Messaging

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `sendMessage()` | - | void | ส่งข้อความจาก input |
| `callGeminiAPI(msg)` | string | Promise\<string\> | เรียก Gemini API |
| `addMessage(role, content)` | string, string | string | เพิ่มข้อความใน chat |
| `updateMessage(id, content)` | string, string | void | อัปเดตข้อความที่มีอยู่ |
| `formatMessage(text)` | string | string | แปลง Markdown → HTML |

---

## 5. UI Structure

### Chat UI Layout

```
┌─────────────────────────────────────┐
│ 🤖 TaijiFlow AI Assistant    [×]   │
├─────────────────────────────────────┤
│ [API Key Input]  [Save]             │
├─────────────────────────────────────┤
│                                     │
│  User: สวัสดีครับ                   │
│                                     │
│  Bot: สวัสดีครับ! ยินดีช่วยเหลือ...   │
│                                     │
├─────────────────────────────────────┤
│ [Type a message...]  [Send]         │
└─────────────────────────────────────┘
```

### Toggle Button

```html
<button id="chat-toggle" class="chat-toggle-btn">
  🤖
</button>
```

---

## 6. Code Examples

### API Key Storage

```javascript
saveApiKey() {
  const input = document.getElementById('chat-api-key');
  const key = input.value.trim();
  
  if (key) {
    this.apiKey = key;
    localStorage.setItem('taijiflow_gemini_key', key);
    this.addMessage('bot', '✅ บันทึก API Key สำเร็จ');
  }
}
```

### Call Gemini API

```javascript
async callGeminiAPI(userMessage) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: this.systemPrompt }] },
          { role: 'model', parts: [{ text: 'เข้าใจครับ' }] },
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      })
    }
  );
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
```

### Format Message (Markdown → HTML)

```javascript
formatMessage(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}
```

---

## ⚠️ ข้อจำกัด

| Limitation | Description |
|------------|-------------|
| API Key Required | ผู้ใช้ต้องสมัคร Gemini API เอง |
| Data Privacy | ข้อความถูกส่งไป Google โดยตรง |
| Rate Limits | อาจมี limits ตาม Gemini quota |

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
