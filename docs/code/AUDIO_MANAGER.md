# TaijiFlow AI - Audio Manager Documentation

**Version:** 1.0  
**Last Updated:** 2024-12-24  
**Lines:** 584  
**Class:** AudioManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Web Speech API](#2-web-speech-api)
3. [Cooldown System](#3-cooldown-system)
4. [Methods Reference](#4-methods-reference)

---

## 1. ภาพรวม

`AudioManager` รับผิดชอบระบบเสียงพูดแจ้งเตือน (Text-to-Speech Feedback)

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
audio.announceFeedback(["ศอกลอย"]);
```

---

## 2. Web Speech API

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 33+ |
| Edge | 14+ |
| Firefox | 49+ |
| Safari | 7+ |

### Voice Selection

```javascript
// หา Thai voice
const thaiVoice = voices.find(v => v.lang.includes("th"));

// Fallback to English
const engVoice = voices.find(v => v.lang.includes("en"));
```

---

## 3. Cooldown System

### หลักการ

ป้องกันการพูดซ้ำเร็วเกินไป

```javascript
const COOLDOWN_MS = 3000; // 3 วินาที

// ถ้าพูดข้อความเดิมภายใน 3 วินาที → ข้าม
if (Date.now() - lastSpeak[message] < COOLDOWN_MS) {
  return; // skip
}
```

---

## 4. Methods Reference

| Method | คำอธิบาย |
|--------|---------|
| `setLanguage(lang)` | ตั้งค่าภาษา ("th"/"en") |
| `toggle()` | เปิด/ปิดเสียง |
| `announce(key)` | พูดตาม key (record_start, ...) |
| `announceFeedback(msgs)` | พูด feedback จาก array |
| `speak(text)` | พูดข้อความตรงๆ |

### Announcement Keys

| Key | TH | EN |
|-----|----|----|
| `record_start` | เริ่มบันทึก | Recording started |
| `record_stop` | หยุดบันทึก | Recording stopped |
| `calibrate_start` | กางแขนท่า T | Spread your arms |
| `calibrate_done` | ปรับเทียบเสร็จ | Calibration complete |

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
