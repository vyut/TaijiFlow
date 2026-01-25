# WebGPU Technical Analysis & Phase 2 Application Plan for TaijiFlow AI

**Document ID:** DOC-TECH-WEBGPU-01
**Version:** 1.0
**Date:** 2026-01-25
**Status:** Future Planning / Research

---

## 1. บทนำ: WebGPU คืออะไร? (Technology Overview)

**WebGPU** คือ API มาตรฐานใหม่สำหรับการประมวลผลกราฟิก (Graphics) และการคำนวณ (Computation) บนเว็บเบราว์เซอร์ ซึ่งถูกออกแบบมาเพื่อปลดล็อกประสิทธิภาพของฮาร์ดแวร์ GPU สมัยใหม่ (Modern GPUs) ให้กับเว็บแอปพลิเคชัน

### 1.1 ความแตกต่างจาก WebGL
WebGPU ไม่ใช่เพียงการอัปเกรด WebGL แต่มันคือการ **"เปลี่ยนกระบวนทัศน์" (Paradigm Shift)** ในการเข้าถึง GPU:

| คุณสมบัติ | WebGL (Legacy) | WebGPU (Next-Gen) |
|:---------|:---------------|:------------------|
| **พื้นฐาน API** | OpenGL ES (เน้น Graphics) | Vulkan / Metal / DirectX 12 (Low-level access) |
| **การประมวลผล** | Single-threaded, Graphics heavy | **Parallel Compute Shaders**, Async-heavy |
| **CPU Overhead** | สูง (CPU ต้องตรวจสอบทุกคำสั่ง) | **ต่ำมาก** (CPU สั่งงานแล้วไปทำอย่างอื่นได้เลย) |
| **ความเหมาะสมกับ AI** | ต้องแปลงข้อมูลเป็น Texture (Hack) | **Compute Shaders** คำนวณ Matrix ได้โดยตรง |

### 1.2 หัวใจสำคัญ: Compute Shaders
สิ่งที่ทรงพลังที่สุดของ WebGPU คือ **Compute Shaders** ซึ่งอนุญาตให้จาวาสคริปต์ส่งงานคำนวณทางคณิตศาสตร์ที่ซับซ้อน (เช่น AI Inference, Physics Simulation) ไปให้ GPU ที่มี Core นับพันหน่วยช่วยคำนวณพร้อมกันได้ โดยไม่ต้องเกี่ยวข้องกับการวาดภาพขึ้นหน้าจอเลย

---

## 2. การประยุกต์ใช้ใน Phase 2: Two-Handed Silk Reeling (8 ท่าสองมือ)

ใน Phase 2 ของ TaijiFlow ที่จะขยายเนื้อหาไปสู่ **ท่าม้วนไหมสองมือ (Double Hand Silk Reeling)** ความซับซ้อนของระบบจะเพิ่มขึ้นทวีคูณ WebGPU จะเข้ามาแก้ปัญหาดังนี้:

### 2.1 ความท้าทายของท่าสองมือ (Two-Handed Complexities)
1.  **Landmark Tracking Load:** ต้องติดตามจุดประสานงาน (Coordination Points) เพิ่มขึ้น 2 เท่า (มือซ้าย + ขวาสัมพันธ์กับ สะโพก + ไหล่)
3.  **Advanced Synchronization Rules:** กฎเพิ่มเติมที่จะถูกพัฒนาใน Phase 2 เพื่อตรวจสอบความสัมพันธ์ของอวัยวะ (เช่น มือซ้ายต้องหมุนเข้าเมื่อมือขวาหมุนออก) ซึ่งซับซ้อนกว่ากฎพื้นฐาน 9 ข้อแรก
3.  **UI Feedback Draw:** การวาดเส้นทาง (Path) สองวงซ้อนกัน และเส้นเชื่อมโยง (Linkage lines) ระหว่างอวัยวะ

### 2.2 การใช้ WebGPU แก้ปัญหา (Solutions)

#### A. AI Inference Acceleration (MediaPipe with WebGPU Delegate)
*   **Concept:** ย้ายการประมวลผล MediaPipe Pose ทั้งหมดไปรันบน WebGPU Backend
*   **ประโยชน์:** ลดเวลาในการตรวจจับ (Inference Time) จาก ~30-40ms (WebGL) เหลือ **~5-10ms** บนเครื่องสเปคสูง
*   **ผลลัพธ์:** ทำให้สามารถรันโมเดลที่แม่นยำขึ้น (Heavy Model ใช้งานจริงได้) หรือเพิ่ม FPS ให้ลื่นไหลระดับ 60fps แม้บนมือถือ เพื่อจับการเคลื่อนไหวที่ละเอียดอ่อนของสองมือได้ทันท่วงที

#### B. การจำลอง "เส้นไหม" (Silk Visualization) ด้วย GPGPU
*   **Concept:** ใช้ Compute Shader สร้าง **Physics-based Ribbon** (เส้นริบบิ้นที่มีน้ำหนัก) เชื่อมระหว่างมือสองข้าง
*   **การทำงาน:** แทนที่จะวาดเส้นตรงธรรมดา (Canvas `lineTo`) เราจะจำลองเส้นเชือกที่มีความตึงหย่อน (Tension) ตามหลัก "จ้านซือจิ้ง" (Silk Reeling Energy)
    *   ถ้าผู้ฝึกเคลื่อนไหวสัมพันธ์กันดี -> เส้นไหมจะตึงสวยงาม เรืองแสง
    *   ถ้ามือข้างหนึ่งเร็วเกินไป -> เส้นไหมจะหย่อน หรือขาด (Visual Break)
    *   การคำนวณฟิสิกส์ของจุดนับร้อยจุดบนเส้นเชือก (Verlet Integration) ทำบน GPU ได้ลื่นไหล

---

## 3. WebGPU กับการแสดงผลขั้นสูง (Advanced Visuals & "Yi" Visualization)

ในมวยไท่จี๋ จิต (Yi) นำปราณ (Qi) ซึ่งเป็นนามธรรม WebGPU จะช่วยเปลี่ยนนามธรรมนี้ให้เป็นรูปธรรม (Visualization):

### 3.1 Qi Particle System (ละอองปราณ)
*   **Technique:** GPU Particle System (ล้านจุด)
*   **Application:** สร้างละอองแสงที่ไหลเวียนตามแขนขาของผู้ฝึก
    *   **Flow Visualization:** เมื่อขยับถูกต้องตามหลักสรีระ (Kinematics) ละอองแสงจะไหลลื่น (Laminar Flow)
    *   **Blockage Visualization:** เมื่อเกร็งไหล่หรือศอก (ผิดหลัก) ละอองแสงจะติดขัดหรือเปลี่ยนเป็นสีแดงและกระจายตัว (Turbulence)
*   **Why WebGPU:** การคำนวณตำแหน่งและความเร็วของอนุภาค 100,000+ ตัว ต้องใช้ Compute Shader เท่านั้นจึงจะไม่กินแรง CPU

### 3.2 High-Quality Skeleton Occlusion
*   **Technique:** Depth Buffer & 3D Model Mapping
*   **Application:** แทนที่จะวาดเส้นทับตัวคนเฉยๆ เราสามารถสร้าง 3D Skeleton ที่ "ซ้อนทับ" ร่างกายผู้ฝึกอย่างสมบูรณ์แบบ (Occlusion) ทำให้เส้น Path ดูเหมือนลอยอยู่รอบตัวคนจริงๆ (Immersive AR)

---

## 4. ประโยชน์อื่นๆ (Additional Benefits)

### 4.1 พลังงานความร้อนและแบตเตอรี่ (Thermal & Battery Efficiency)
*   **ปัญหาเดิม:** WebGL กินไฟสูง เพราะ CPU ต้องตื่นมาสั่งงาน GPU ตลอดเวลา (CPU-GPU synchronization bottleneck)
*   **WebGPU:** CPU สั่งงานเพียงครั้งเดียว (Command Encoding) แล้ว GPU ทำงานยาว ทำให้ CPU สามารถเข้าสู่ Low-power state ได้บ่อยขึ้น
*   **ผลลัพธ์:** ผู้ใช้ฝึกไท่จี๋บน iPad/Tablet ได้นานขึ้น เครื่องร้อนน้อยลงอย่างเห็นได้ชัด

### 4.2 รองรับหน้าจอ High Refresh Rate (120Hz/144Hz)
*   ด้วยประสิทธิภาพที่สูงขึ้น ทำให้การเรนเดอร์ UI ตอบสนองต่อจอ ProMotion (120Hz) ได้จริง ทำให้การฝึกรู้สึกลื่นไหลเป็นธรรมชาติ (Fluidity is key for Taiji)

---

## 5. แผนการดำเนินงาน (Roadmap Strategy for Phase 2)

### Q2 2026: Preparation & Prototype
*   [ ] ศึกษา WebGPU API และ WGSL (WebGPU Shading Language)
*   [ ] ทดลอง Port ส่วน `WebGLManager` เดิมไปเป็น `NextGenGraphicManager` (WebGPU)
*   [ ] ทดสอบ MediaPipe with WebGPU backend ใน Lab (เช็คความแม่นยำและความเร็ว)

### Q3 2026: Two-Handed Implementation
*   [ ] พัฒนา Rule Engine v2 สำหรับ 8 ท่าสองมือ (Logic บน CPU/JS ยังคงเดิมเพื่อความง่ายในการแก้บั๊ก)
*   [ ] พัฒนา **"Energy Ribbon"** Visualization ด้วย WebGPU Compute Shader
*   [ ] สร้างระบบ Fallback: ถ้าเครื่องผู้ใช้ไม่รองรับ WebGPU -> ให้กลับไปใช้ WebGL ตัวเก่าอัตโนมัติ

### Q4 2026: Polish & Qi Visualization
*   [ ] เพิ่ม Particle System จำลองการไหลเวียนพลัง
*   [ ] ปรับแต่ง Performance ให้รองรับมือถือ Android ระดับกลาง (Mid-range Optimization)

---

## 6. บทสรุป (Conclusion)

การนำ **WebGPU** มาใช้ใน TaijiFlow Phase 2 ไม่ใช่เป็นเพียงเรื่องของกราฟิกที่สวยงามขึ้น (Eye candy) แต่เป็น **ความจำเป็นทางวิศวกรรม (Engineering Necessity)** เพื่อรองรับความซับซ้อนของการคำนวณท่า 2 มือ และการแสดงผล Feedback แบบ Real-time Physics ที่จะช่วยให้ผู้ฝึก "เห็นภาพ" (Visualize) ความรู้สึก (Feeling) ของมวยไท่จี๋ได้ชัดเจนแบบที่ไม่เคยมีมาก่อน

> *"Technology becomes the mirror of Internal Arts."* - เปลี่ยนนามธรรมภายใน ให้เป็นรูปธรรมภายนอกด้วยพลังคำนวณ

---

**Prepared by:** Antigravity (AI Assistant)
**For:** TaijiFlow AI Project Phase 2 Planning
