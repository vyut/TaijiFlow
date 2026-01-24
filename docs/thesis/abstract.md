# บทคัดย่อ (Abstract)

---

## บทคัดย่อ

**ชื่อโครงการ:** TaijiFlow AI: ระบบ AI ต้นแบบสำหรับการฝึกท่าม้วนไหมในมวยไท้เก๊กสกุลเฉิน

---

การฝึกมวยไท้เก๊กสกุลเฉินแบบดั้งเดิมประสบปัญหาหลายประการ ได้แก่ การเข้าถึงครูผู้เชี่ยวชาญที่มีจำกัด ความเร่งรีบและข้อจำกัดด้านเวลาของผู้ฝึก และการขาดข้อมูลป้อนกลับ (Feedback) แบบทันที (Real-time) ระหว่างฝึกซ้อมด้วยตนเอง โดยเฉพาะอย่างยิ่ง ท่าม้วนไหม (Silk Reeling / ฉานซือจิ้ง) ซึ่งเป็นพื้นฐานสำคัญของสกุลเฉิน มีความซับซ้อนในการเคลื่อนไหวที่ต้องอาศัยการตรวจสอบจากผู้เชี่ยวชาญ

โครงการนี้มีวัตถุประสงค์หลัก 2 ประการ ได้แก่ (1) การพัฒนาระบบปัญญาประดิษฐ์ต้นแบบ (Prototype AI System) ที่สามารถวิเคราะห์และให้ข้อมูลป้อนกลับการเคลื่อนไหวของท่าม้วนไหมได้แบบทันที และ (2) การสร้างชุดเมตริกเชิงปริมาณ (Quantitative Metrics) สำหรับใช้ในการประเมินคุณภาพการเคลื่อนไหวตามหลักการของมวยไท้เก๊ก โดยชุดเมตริกประกอบด้วย 9 กฎ (Heuristics Rules) สำหรับ 3 ระดับการฝึก

ระบบพัฒนาเป็น Web Application โดยใช้ MediaPipe Pose สำหรับตรวจจับท่าทาง 33 จุดแบบ Real-time โดยไม่ต้องติดตั้งอุปกรณ์เสริม Heuristics Engine ที่ออกแบบขึ้นประกอบด้วย 9 กฎการตรวจสอบ ครอบคลุมหลักการสำคัญของท่าม้วนไหมในมวยไท้เก๊กสกุลเฉิน เช่น เส้นทางเป็นวงกลม ไหล่ผ่อนศอกจม เอวนำแขนตาม และความลื่นไหลต่อเนื่อง ระบบแบ่งความยากเป็น 3 ระดับ (L1: 3 กฎ, L2: 5 กฎ, L3: 9 กฎ) เพื่อรองรับผู้ฝึกทุกระดับ

ผลการทดสอบกับผู้ใช้จำนวน 8 คน พบว่าระบบมีคะแนนความพึงพอใจเฉลี่ย 4.2/5.0 โดยผู้ใช้ 87.5% ต้องการใช้งานต่อเนื่อง และ 75% แนะนำให้ผู้อื่นใช้ ระบบสามารถประมวลผลได้มากกว่า 25 FPS และให้ Feedback ภายใน 1 วินาที ซึ่งสอดคล้องกับข้อกำหนดของการฝึกแบบทันที

โครงการนี้แสดงให้เห็นศักยภาพของการนำ AI มาประยุกต์ใช้ในการฝึกศิลปะการต่อสู้ตามแบบฉบับ ช่วยเพิ่มการเข้าถึงและสร้างโอกาสในการฝึกฝนด้วยตนเองอย่างมีประสิทธิภาพ ด้วยข้อมูลป้อนกลับแบบทันทีและวัดผลได้

**คำสำคัญ:** มวยไท้เก๊กสกุลเฉิน, ท่าม้วนไหม, Pose Estimation, MediaPipe, Real-time Feedback, Web Application

---

## Abstract

**Project Title:** TaijiFlow AI: A Prototype AI System for Silk Reeling Training in Chen-style Taijiquan

---

Traditional Chen-style Taijiquan training faces several challenges, including limited access to qualified instructors, time constraints and busy lifestyles of practitioners, and the lack of real-time feedback during self-practice. Silk Reeling (Chán Sī Jìng), the foundational movement pattern unique to Chen-style, involves complex spiraling motions that require expert supervision for proper execution.

This project has two primary objectives: (1) to develop a Prototype AI System capable of analyzing and providing real-time feedback on Silk Reeling movements, and (2) to create a set of Quantitative Metrics comprising nine Heuristics Rules for evaluating movement quality based on Taijiquan principles across three training levels.

The system was developed as a Web Application utilizing MediaPipe Pose for real-time detection of 33 body landmarks without requiring any wearable sensors. A custom-designed Heuristics Engine implements nine analytical rules covering essential principles of Chen-style Taijiquan Silk Reeling, including circular path shape, sinking shoulders and elbows, waist-initiated movement, and smooth continuous motion. Three difficulty levels (L1: 3 rules, L2: 5 rules, L3: 9 rules) accommodate practitioners of varying skill levels.

User testing with 8 participants yielded an average satisfaction score of 4.2/5.0. Results showed that 87.5% of users expressed interest in continued use, and 75% would recommend the system to others. The system achieves processing speeds exceeding 25 FPS with feedback latency under 1 second, meeting real-time training requirements.

This project demonstrates the potential of applying AI technology to traditional martial arts training, improving accessibility and enabling effective self-practice opportunities with real-time, measurable feedback.

**Keywords:** Chen-style Taijiquan, Silk Reeling, Pose Estimation, MediaPipe, Real-time Feedback, Web Application

---

*Document created: 2026-01-10*

