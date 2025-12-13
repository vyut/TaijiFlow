# TaijiFlow AI - System Architecture

## 📊 Core Features Data Flow

แผนภาพแสดงการไหลของข้อมูลผ่าน 6 Core Features ของระบบ

```mermaid
flowchart TB
    subgraph Input["📥 INPUT"]
        A["🎥 Webcam"]
    end
    
    subgraph Core1["1️⃣ POSE DETECTION"]
        B["MediaPipe Pose<br/>33 Landmarks"]
    end
    
    subgraph Core2["2️⃣ CALIBRATION"]
        C["วัดสัดส่วนร่างกาย<br/>T-Pose 3 วินาที"]
    end
    
    subgraph Core3["3️⃣ PATH VISUALIZATION"]
        D["แสดงเส้นทางอ้างอิง<br/>Reference Path"]
    end
    
    subgraph Core4["4️⃣ HEURISTICS ENGINE"]
        E["วิเคราะห์ 8 กฎ<br/>เปรียบเทียบท่าทาง"]
    end
    
    subgraph Core5["5️⃣ REAL-TIME FEEDBACK"]
        F["🔊 เสียงแจ้งเตือน<br/>👁️ Visual Overlay"]
    end
    
    subgraph Core6["6️⃣ SCORE REPORT"]
        G["📊 คะแนน 0-100%<br/>🎓 เกรด A-F<br/>⚠️ Top Errors"]
    end
    
    subgraph Output["👤 USER"]
        H["ผู้ฝึกท่าม้วนไหม"]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    F --> H
    G --> H
    
    style A fill:#e3f2fd,stroke:#1976d2
    style B fill:#e3f2fd,stroke:#1976d2
    style C fill:#e8f5e9,stroke:#388e3c
    style D fill:#fff8e1,stroke:#f9a825
    style E fill:#ffebee,stroke:#d32f2f
    style F fill:#fce4ec,stroke:#c2185b
    style G fill:#ede7f6,stroke:#7b1fa2
    style H fill:#f3e5f5,stroke:#9c27b0
```

---

## 🔄 Simplified Flow

```mermaid
flowchart LR
    A["📥 Input"] --> B["⚙️ Calibrate"] --> C["🧠 Analyze"] --> D["📊 Report"]
    
    C --> E["🔊 Feedback"]
    E --> F["👤 User"]
    D --> F
```

---

## 📋 Core Features Summary

| # | Feature | Input | Output |
|---|---------|-------|--------|
| 1 | Pose Detection | Video Frame | 33 Landmarks |
| 2 | Calibration | Landmarks | Body Metrics |
| 3 | Path Visualization | Reference JSON | Canvas Drawing |
| 4 | Heuristics Engine | Landmarks + Metrics | Error Flags |
| 5 | Real-time Feedback | Error Flags | Voice + Visual |
| 6 | Score Report | Session Logs | Score + Grade |

---

## 🧩 Module Dependencies

```mermaid
flowchart TB
    subgraph Main["script.js"]
        M["Main Controller"]
    end
    
    subgraph Modules["JavaScript Modules"]
        H["heuristics_engine.js"]
        C["calibration_manager.js"]
        D["drawing_manager.js"]
        S["scoring_manager.js"]
        A["audio_manager.js"]
        U["ui_manager.js"]
        G["gesture_manager.js"]
        CH["chatbot.js"]
    end
    
    subgraph External["External APIs"]
        MP["MediaPipe Pose"]
        MG["MediaPipe Gesture"]
        GM["Gemini API"]
        WS["Web Speech API"]
    end
    
    M --> H
    M --> C
    M --> D
    M --> S
    M --> A
    M --> U
    M --> G
    M --> CH
    
    H --> MP
    G --> MG
    CH --> GM
    A --> WS
```
