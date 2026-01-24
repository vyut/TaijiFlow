# 📊 TaijiFlow Data Export Format Documentation

## วิธีการจัดเก็บไฟล์

### กระบวนการ (Flow)
```
ผู้ใช้กด Record → เก็บข้อมูลทุกเฟรมใน Memory → ผู้ใช้กด Stop → สร้าง JSON → Download ลงเครื่อง
```

### รายละเอียด
| ขั้นตอน | รายละเอียด |
|---------|------------|
| **1. Recording** | ข้อมูลเก็บใน Array `recordedSessionData` ใน RAM |
| **2. Stop** | สร้าง Object `fullDataset` รวมทุกอย่าง |
| **3. Export** | แปลงเป็น JSON String ด้วย `JSON.stringify()` |
| **4. Download** | สร้าง Blob → URL → `<a>.click()` → Download ลงเครื่อง |

### ชื่อไฟล์
```
taiji_data_{exercise}_{timestamp}.json
ตัวอย่าง: taiji_data_rh_cw_1733661600000.json
```

---

## โครงสร้าง JSON Export

```json
{
  "user_id": "user_m4x9k2abc",
  "session_id": "sess_m4x9k8xyz",
  
  "meta": {
    "date": "2024-12-08T12:30:00.000Z",
    "timezone": "Asia/Bangkok",
    "exercise": "rh_cw",
    "level": "L1",
    "user_calibration": {
      "torsoHeight": 0.234,
      "shoulderWidth": 0.156,
      "armLength": 0.312
    },
    "platform": {
      "userAgent": "Mozilla/5.0...",
      "platform": "MacIntel",
      "isMobile": false,
      "screenWidth": 1920,
      "screenHeight": 1080,
      "language": "th-TH"
    }
  },
  
  "summary": {
    "duration_seconds": 45.3,
    "total_frames": 1350,
    "fps_estimated": 30,
    "total_issues": 12,
    "issue_log": [...]
  },
  
  "scoring": {
    "score": 85.5,
    "grade": "B",
    "correct_frames": 1155,
    "error_frames": 195,
    "top_errors": [...],
    "all_errors": [...]
  },
  
  "raw_data": [
    {
      "frame_number": 0,
      "timestamp": 0.033,
      "visibility_avg": 0.945,
      "has_error": false,
      "landmarks": [...],
      "active_feedbacks": []
    },
    ...
  ]
}
```

---

## คำอธิบาย Fields

### 🔑 Identification

| Field | Type | คำอธิบาย |
|-------|------|----------|
| `user_id` | string | ID ผู้ใช้ (สร้างอัตโนมัติ, คงที่ตลอดใน LocalStorage) |
| `session_id` | string | ID Session (สร้างใหม่ทุกครั้งที่กด Record) |

### 📋 Meta

| Field | คำอธิบาย | ใช้สำหรับ |
|-------|----------|----------|
| `date` | วันเวลา ISO 8601 | Filter ตามช่วงเวลา |
| `timezone` | Timezone ผู้ใช้ | แก้ปัญหา UTC offset |
| `exercise` | ท่าที่ฝึก (rh_cw, lh_ccw, etc.) | **Classification Label** |
| `level` | ระดับ (L1, L2, L3) | Stratified Training |
| `user_calibration` | สัดส่วนร่างกาย | **Normalization** |
| `platform` | ข้อมูลอุปกรณ์ | Filter ตาม Device |

### 📊 Summary

| Field | คำอธิบาย | ใช้สำหรับ |
|-------|----------|----------|
| `duration_seconds` | ความยาว (วินาที) | Filter short sessions |
| `total_frames` | จำนวนเฟรม | ตรวจสอบ Data Quality |
| `fps_estimated` | FPS โดยประมาณ | ปรับ Temporal Sampling |

### 🎯 Scoring

| Field | คำอธิบาย | ใช้สำหรับ |
|-------|----------|----------|
| `score` | คะแนน 0-100% | **Regression Target** |
| `grade` | เกรด A-F | Classification Target |
| `correct_frames` | เฟรมถูกต้อง | Class Balance Analysis |
| `top_errors` | Top 3 ข้อผิดพลาด | Error Analysis |

### 🎬 Raw Data (ต่อเฟรม)

| Field | คำอธิบาย | ใช้สำหรับ |
|-------|----------|----------|
| `frame_number` | ลำดับเฟรม (0, 1, 2, ...) | Sequence Index |
| `timestamp` | เวลา (วินาที) | Temporal Analysis |
| `visibility_avg` | ค่า Visibility เฉลี่ย (0-1) | **Filter เฟรมคุณภาพต่ำ** |
| `has_error` | มีข้อผิดพลาดไหม | Quick Binary Label |
| `landmarks` | 33 จุด (x, y, z, visibility) | **Model Input** |
| `active_feedbacks` | ข้อผิดพลาดที่ตรวจพบ | **Multi-label Ground Truth** |

---

## วิธีใช้งานสำหรับ ML Training

### 1. Filter เฟรมคุณภาพต่ำ
```python
# กรองเฟรมที่มี visibility_avg < 0.7
good_frames = [f for f in data['raw_data'] if f['visibility_avg'] >= 0.7]
```

### 2. แยก Train/Test ตาม User
```python
# ใช้ user_id เพื่อป้องกัน Data Leakage
train_users = ['user_a', 'user_b']
test_users = ['user_c']
```

### 3. Normalize ด้วย Calibration Data
```python
shoulder_width = data['meta']['user_calibration']['shoulderWidth']
# ปรับ landmarks ให้เป็นสัดส่วนเดียวกัน
```

---

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|------|--------|
| [script.js](file:///Users/yut/TaijiFlow/script.js) | รวบรวมข้อมูลและสร้าง fullDataset |
| [data_exporter.js](file:///Users/yut/TaijiFlow/data_exporter.js) | Download เป็นไฟล์ JSON |
| [scoring_manager.js](file:///Users/yut/TaijiFlow/scoring_manager.js) | คำนวณคะแนนและ Error counts |
