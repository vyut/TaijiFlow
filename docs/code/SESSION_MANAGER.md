# TaijiFlow AI - Session Manager Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Lines:** ~115  
**Class:** SessionManager

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [User Identification](#2-user-identification)
3. [Platform Detection](#3-platform-detection)
4. [Methods Reference](#4-methods-reference)
5. [Code Examples](#5-code-examples)

---

## 1. ภาพรวม

`SessionManager` จัดการ Session และ User Identification

### 🎯 หน้าที่หลัก

| หน้าที่ | คำอธิบาย |
|---------|---------|
| **Anonymous ID** | สร้าง UUID สำหรับ user |
| **Session Tracking** | Track แต่ละ session |
| **Platform Detection** | ตรวจจับ device type |

### 📊 การใช้งาน

```javascript
const sessionManager = new SessionManager();

// ดึง User ID (สร้างถ้าไม่มี)
const userId = sessionManager.getOrCreateUserId();

// สร้าง Session ID ใหม่
const sessionId = sessionManager.generateSessionId();

// ดึงข้อมูล Platform
const platform = sessionManager.getPlatformInfo();
```

---

## 2. User Identification

### Anonymous User ID

| Property | Description |
|----------|-------------|
| Format | UUID v4 |
| Storage | localStorage |
| Key | `taijiflow_user_id` |
| Persistence | ถาวร (จนกว่าจะลบ) |

### Session ID

| Property | Description |
|----------|-------------|
| Format | `sess_{timestamp}_{random}` |
| Storage | Memory only |
| Lifetime | Per session |

---

## 3. Platform Detection

### Platform Info Object

```javascript
platformInfo = {
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
  platform: "MacIntel",
  screenWidth: 1920,
  screenHeight: 1080,
  devicePixelRatio: 2,
  isMobile: false,
  isTablet: false,
  browser: "Chrome",
  browserVersion: "120"
};
```

### Device Detection

| Device Type | Detection Method |
|-------------|-----------------|
| Mobile | userAgent + touchPoints |
| Tablet | screen size + userAgent |
| Desktop | Default |

---

## 4. Methods Reference

### User ID

| Method | Returns | Description |
|--------|---------|-------------|
| `getOrCreateUserId()` | string | ดึงหรือสร้าง User ID |
| `getUserId()` | string | ดึง User ID (อาจ null) |
| `resetUserId()` | string | สร้าง User ID ใหม่ |

### Session ID

| Method | Returns | Description |
|--------|---------|-------------|
| `generateSessionId()` | string | สร้าง Session ID |
| `getCurrentSessionId()` | string | ดึง Session ID ปัจจุบัน |

### Platform

| Method | Returns | Description |
|--------|---------|-------------|
| `getPlatformInfo()` | Object | ข้อมูล platform |
| `isMobileDevice()` | boolean | เป็น mobile หรือไม่ |
| `isTabletDevice()` | boolean | เป็น tablet หรือไม่ |
| `getBrowser()` | Object | ชื่อและ version browser |

---

## 5. Code Examples

### Get or Create User ID

```javascript
getOrCreateUserId() {
  let userId = localStorage.getItem('taijiflow_user_id');
  
  if (!userId) {
    userId = this.generateUUID();
    localStorage.setItem('taijiflow_user_id', userId);
    console.log('✅ Created new user ID:', userId);
  }
  
  return userId;
}
```

### Generate UUID

```javascript
generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### Generate Session ID

```javascript
generateSessionId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  this.currentSessionId = `sess_${timestamp}_${random}`;
  return this.currentSessionId;
}
```

### Platform Detection

```javascript
getPlatformInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio || 1,
    isMobile: this.isMobileDevice(),
    isTablet: this.isTabletDevice(),
    browser: this.getBrowser()
  };
}

isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(navigator.userAgent);
}

isTabletDevice() {
  const width = window.screen.width;
  const height = window.screen.height;
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  
  return minDimension >= 600 && maxDimension <= 1400 && this.isMobileDevice();
}
```

---

*เอกสารนี้สร้างจาก code analysis โดยอัตโนมัติ*
