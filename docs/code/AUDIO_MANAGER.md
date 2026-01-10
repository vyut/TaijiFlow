# TaijiFlow AI - Audio Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** 584  
**Class:** AudioManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Web Speech API](#2-web-speech-api)
3. [Cooldown System](#3-cooldown-system)
4. [Feedback System](#4-feedback-system)
5. [Methods Reference](#5-methods-reference)
6. [Code Examples](#6-code-examples)

---

## 1. ภาพรวม

`AudioManager` รับผิดชอบระบบเสียงพูดแจ้งเตือน (Text-to-Speech Feedback)

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **TTS Integration** | ใช้ Web Speech API |
| **Bilingual Support** | TH/EN voices |
| **Cooldown System** | ป้องกันพูดซ้ำเร็วเกินไป |
| **Feedback Mapping** | แปลง feedback เป็นข้อความสั้น |

### 🎯 ความสำคัญใน Tai Chi Training

| ประโยชน์ | คำอธิบาย |
|---------|---------|
| รักษาสมาธิ | ไม่ต้องหันดูหน้าจอ |
| แก้ไขทันที | เมื่อได้ยินคำแนะนำ |
| Body Awareness | ผ่านการฟังและปรับท่า |
| ฝึกต่อเนื่อง | ไม่ถูกขัดจังหวะ |

### 📊 การใช้งาน

```javascript
const audio = new AudioManager();
audio.setLanguage("th");

// พูดแจ้งเตือน
audio.announce("record_start");

// พูด feedback
audio.speakFeedback(["ศอกลอย", "เอวไม่นำ"]);

// Toggle เสียง
const isEnabled = audio.toggle();
```

---

## 2. Web Speech API

### Browser Support

| Browser | Version | Notes |
|---------|:-------:|-------|
| Chrome | 33+ | ✅ Best support |
| Edge | 14+ | ✅ Good |
| Firefox | 49+ | ⚠️ Limited voices |
| Safari | 7+ | ✅ Good |

### Voice Selection Logic

```javascript
// Priority order for Thai
1. th-TH (Native Thai)
2. th (Thai generic)
3. en-US (Fallback English)
4. en (Any English)
```

### Available Voices

| Language | Voice Name Examples |
|----------|-------------------|
| Thai | Google ไทย, Kanya |
| English | Google US English, Microsoft David |

---

## 3. Cooldown System

### หลักการ

ป้องกันการพูดซ้ำเร็วเกินไป ซึ่งจะรบกวนการฝึก

### Configuration

| Parameter | Value | Description |
|-----------|:-----:|-------------|
| `COOLDOWN_MS` | 3000 | 3 วินาที |
| `lastSpeakTime` | Object | เก็บเวลาพูดแต่ละ key |

### ปัญหาที่แก้

```
❌ ปัญหา: พูดซ้ำ "ศอกลอย ศอกลอย ศอกลอย" ทุก frame
✅ แก้ไข: พูด "ศอกลอย" ครั้งเดียว รอ 3 วินาทีก่อนพูดซ้ำ
```

### Logic

```javascript
speak(message, force = false) {
  const now = Date.now();
  const lastSpeak = this.lastSpeakTime[message] || 0;
  
  // Skip if within cooldown (unless force)
  if (!force && (now - lastSpeak < this.COOLDOWN_MS)) {
    return; // Skip - ยังอยู่ใน cooldown
  }
  
  // Update timestamp
  this.lastSpeakTime[message] = now;
  
  // Speak
  this.synthesize(message);
}
```

---

## 4. Feedback System

### Feedback Mapping

ระบบแปลง feedback key เป็นข้อความสั้นสำหรับพูด

| Feedback Key | TH | EN |
|-------------|----|----|
| `path_off` | เส้นทางเบี่ยง | Path deviation |
| `elbow_high` | ศอกสูง | Elbow high |
| `elbow_good` | ศอกดี | Good elbow |
| `waist_not_leading` | เอวไม่นำ | Waist not leading |
| `head_moving` | ศีรษะโยก | Head moving |
| `jerky` | กระตุก | Jerky |

### Announcement Keys

| Key | TH | EN |
|-----|----|----|
| `record_start` | เริ่มบันทึก | Recording started |
| `record_stop` | หยุดบันทึก | Recording stopped |
| `calibrate_start` | กางแขนท่า T | Spread your arms |
| `calibrate_hold` | ค้างไว้ | Hold position |
| `calibrate_done` | ปรับเทียบเสร็จ | Calibration complete |
| `training_start` | เริ่มฝึก | Training started |
| `training_stop` | จบการฝึก | Training ended |

---

## 5. Methods Reference

### Initialization

| Method | Description |
|--------|-------------|
| `constructor()` | ตั้งค่าเริ่มต้น, ตรวจสอบ Web Speech API |

### Control Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `toggle()` | - | boolean | เปิด/ปิดเสียง |
| `setLanguage(lang)` | string | void | ตั้งภาษา ("th"/"en") |
| `isEnabled()` | - | boolean | ตรวจสอบสถานะ |

### Speaking Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `speak(message, force)` | string, boolean | พูดข้อความ (มี cooldown) |
| `speakFeedback(feedbacks)` | Array | พูด feedback (เฉพาะอันแรก) |
| `announce(type)` | string | ประกาศพิเศษ (force) |

### Internal Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `synthesize(text)` | string | สร้าง SpeechSynthesisUtterance |
| `getVoice()` | - | SpeechSynthesisVoice | หา voice ตามภาษา |
| `mapFeedback(key)` | string | string | แปลง key → text |

---

## 6. Code Examples

### Constructor

```javascript
constructor() {
  // Check browser support
  this.isSupported = 'speechSynthesis' in window;
  this.synth = this.isSupported ? window.speechSynthesis : null;
  
  // State
  this.enabled = true;
  this.currentLang = 'th';
  this.COOLDOWN_MS = 3000;
  this.lastSpeakTime = {};
  
  // Voice (load async)
  this.voice = null;
  this.loadVoice();
}
```

### Toggle Audio

```javascript
toggle() {
  this.enabled = !this.enabled;
  console.log(`🔊 Audio: ${this.enabled ? 'ON' : 'OFF'}`);
  return this.enabled;
}
```

### Speak with Cooldown

```javascript
speak(message, force = false) {
  if (!this.isSupported || !this.enabled) return;
  
  const now = Date.now();
  const lastSpeak = this.lastSpeakTime[message] || 0;
  
  if (!force && (now - lastSpeak < this.COOLDOWN_MS)) {
    return; // Still in cooldown
  }
  
  this.lastSpeakTime[message] = now;
  
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = this.voice;
  utterance.lang = this.currentLang === 'th' ? 'th-TH' : 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  this.synth.speak(utterance);
}
```

### Speak Feedback

```javascript
speakFeedback(feedbacks) {
  if (!feedbacks || feedbacks.length === 0) return;
  
  // Only speak first feedback (priority-based)
  const firstFeedback = feedbacks[0];
  const mappedText = this.mapFeedback(firstFeedback);
  
  this.speak(mappedText);
}
```

### Announce Special Events

```javascript
announce(type) {
  const announcements = {
    th: {
      record_start: 'เริ่มบันทึก',
      record_stop: 'หยุดบันทึก',
      calibrate_start: 'กางแขนท่า T ค้างไว้',
      calibrate_done: 'ปรับเทียบเสร็จสมบูรณ์',
      training_start: 'เริ่มการฝึก',
      training_stop: 'จบการฝึก'
    },
    en: {
      record_start: 'Recording started',
      record_stop: 'Recording stopped',
      calibrate_start: 'Spread your arms in T pose',
      calibrate_done: 'Calibration complete',
      training_start: 'Training started',
      training_stop: 'Training ended'
    }
  };
  
  const message = announcements[this.currentLang][type];
  if (message) {
    this.speak(message, true); // force = true
  }
}
```

---

*เอกสารนี้อัปเดต: 2026-01-10*
