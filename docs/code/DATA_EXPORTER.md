# TaijiFlow AI - Data Exporter Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** ~200  
**Class:** DataExporter

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Export Formats](#2-export-formats)
3. [Data Structure](#3-data-structure)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`DataExporter` รับผิดชอบ Export ข้อมูล Training Session

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Frame Recording** | บันทึก frame ระหว่างฝึก |
| **JSON Export** | Export ข้อมูลแบบละเอียด |
| **CSV Export** | Export แบบตาราง |
| **File Download** | สร้างไฟล์ download |

### 📊 การใช้งาน

```javascript
const exporter = new DataExporter();

// เริ่มบันทึก
exporter.startRecording();

// บันทึกแต่ละ frame
exporter.recordFrame({
  landmarks: [...],
  feedback: [...],
  score: 85
});

// หยุดและ export
exporter.stopRecording();
exporter.exportJSON();
```

---

## 2. Export Formats

### JSON Format

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | string | Unique session ID |
| `userId` | string | Anonymous user ID |
| `exercise` | string | ท่าที่ฝึก (rh_cw, etc.) |
| `level` | string | ระดับ (L1, L2, L3) |
| `startTime` | number | Unix timestamp |
| `duration` | number | ระยะเวลา (ms) |
| `frames` | Array | ข้อมูลแต่ละ frame |
| `calibration` | Object | ข้อมูล calibration |
| `feedback` | Array | Feedback ทั้งหมด |
| `score` | Object | คะแนนสรุป |

### CSV Format

| Column | Description |
|--------|-------------|
| timestamp | เวลาของ frame |
| wrist_x | ตำแหน่ง X ของข้อมือ |
| wrist_y | ตำแหน่ง Y ของข้อมือ |
| feedback | ข้อเสนอแนะ |
| score | คะแนนของ frame |

---

## 3. Data Structure

### Session Data

```javascript
sessionData = {
  sessionId: "abc123-xyz789",
  userId: "user-001",
  exercise: "rh_cw",
  level: "L2",
  startTime: 1704844800000,
  duration: 30000,
  
  calibration: {
    shoulderWidth: 0.32,
    armLength: 0.25,
    torsoHeight: 0.35
  },
  
  frames: [
    {
      timestamp: 0,
      landmarks: [...33 landmarks...],
      feedback: ["ศอกสูงไป", "ดี!"],
      score: 85
    },
    // ... 900 frames for 30 sec at 30fps
  ],
  
  score: {
    total: 82,
    grade: "B",
    breakdown: {
      pathAccuracy: 85,
      smoothness: 78,
      continuity: 83
    }
  }
};
```

### Frame Data

```javascript
frame = {
  timestamp: 1234,          // ms from start
  landmarks: [...],         // 33 landmarks
  feedback: ["ศอกสูงไป"],   // array of feedback strings
  score: 85,               // 0-100
  
  // Optional analytics
  wristPosition: { x: 0.5, y: 0.3 },
  elbowAngle: 110,
  pathDeviation: 0.05
};
```

---

## 4. Methods Reference

### Recording Control

| Method | Returns | Description |
|--------|---------|-------------|
| `startRecording()` | void | เริ่มบันทึก |
| `stopRecording()` | Object | หยุดบันทึก, return data |
| `recordFrame(data)` | void | บันทึก frame |
| `isRecording()` | boolean | กำลังบันทึกหรือไม่ |

### Export Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `exportJSON()` | void | Download JSON file |
| `exportCSV()` | void | Download CSV file |
| `getData()` | Object | ดึงข้อมูล session |

### File Handling

| Method | Parameters | Description |
|--------|------------|-------------|
| `downloadFile(data, filename)` | string, string | สร้าง download |

---

## 5. Code Examples

### Start Recording

```javascript
startRecording() {
  this.isActive = true;
  this.frames = [];
  this.startTime = Date.now();
  this.sessionId = this.generateSessionId();
  
  console.log('🔴 Recording started');
}
```

### Record Frame

```javascript
recordFrame(data) {
  if (!this.isActive) return;
  
  const frame = {
    timestamp: Date.now() - this.startTime,
    landmarks: data.landmarks,
    feedback: data.feedback || [],
    score: data.score || 0,
    wristPosition: this.extractWristPosition(data.landmarks)
  };
  
  this.frames.push(frame);
}
```

### Export as JSON

```javascript
exportJSON() {
  const data = {
    sessionId: this.sessionId,
    userId: sessionManager.getUserId(),
    exercise: currentExercise,
    level: currentLevel,
    startTime: this.startTime,
    duration: Date.now() - this.startTime,
    frames: this.frames,
    calibration: calibrator.getData(),
    score: scoringManager.getResult()
  };
  
  const json = JSON.stringify(data, null, 2);
  const filename = `taijiflow_${this.sessionId}.json`;
  this.downloadFile(json, filename, 'application/json');
}
```

### Export as CSV

```javascript
exportCSV() {
  const headers = ['timestamp', 'wrist_x', 'wrist_y', 'feedback', 'score'];
  const rows = this.frames.map(f => [
    f.timestamp,
    f.wristPosition?.x?.toFixed(4) || '',
    f.wristPosition?.y?.toFixed(4) || '',
    f.feedback.join('; '),
    f.score
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  const filename = `taijiflow_${this.sessionId}.csv`;
  this.downloadFile(csv, filename, 'text/csv');
}
```

### Download File

```javascript
downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
