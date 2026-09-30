# ระบบแบบสำรวจความคิดเห็นโครงการจัดตั้งชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร

เว็บแอปพลิเคชันภาษาไทยสำหรับรับฟังความคิดเห็น สำรวจความต้องการ และรับแสดงความจำนงสมัครสมาชิกต่อร่างโครงการจัดตั้งชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร พัฒนาด้วย React 19, TypeScript, Vite, Tailwind CSS และเชื่อมต่อกับ Firebase (Cloud Firestore & Firebase Authentication)

---

## 📌 สถานะโครงการและคำชี้แจงสำคัญ

> **“ร่างโครงการอยู่ระหว่างรับฟังความคิดเห็น ยังไม่ถือเป็นการอนุมัติจัดตั้งชมรม การสมัครสมาชิกยังเป็นเพียงการแสดงความจำนง และการแจ้งความสนใจเป็นกรรมการยังไม่ถือเป็นการแต่งตั้ง”**

### กำหนดการดำเนินการ (เขตเวลาประเทศไทย UTC+07:00)
- **เริ่มเตรียมการ:** 1 ตุลาคม 2569
- **เปิดรับความคิดเห็น:** 8 ตุลาคม 2569 เวลา 00.00 น.
- **ปิดรับความคิดเห็น:** 31 ตุลาคม 2569 เวลา 23.59 น.

---

## 🚀 คุณสมบัติเด่นของระบบ

1. **การสำรวจแบบหลายขั้นตอน (Multi-step Survey) พร้อมแถบแสดงความคืบหน้า**
   - **ส่วนที่ 1:** ยืนยันสถานะบุคลากร มน. พร้อมค้นหาหน่วยงานต้นสังกัดหลัก (อ้างอิงจากเว็บไซต์ทางการ www.nu.ac.th) มีตัวเลือก “ไม่พบหน่วยงานในรายการ โปรดระบุ” และหน่วยงานย่อย
   - **ส่วนที่ 2:** ความคิดเห็นต่อร่างโครงการ (Likert Scale 5 ระดับ, ประโยชน์ที่คาดว่าจะได้รับ, ข้อกังวล, ข้อเสนอแนะ)
   - **ส่วนที่ 3:** ความจำนง (สมัครสมาชิก, รับข่าวสาร, แสดงความคิดเห็นเพียงอย่างเดียว)
     - *เงื่อนไขพิเศษ:* หากเลือก **“แสดงความคิดเห็นเพียงอย่างเดียว”** ระบบจะข้ามคำถามกิจกรรมและข้อมูลติดต่อ ไปยังหน้าตรวจทานทันที
   - **ส่วนที่ 4:** ความต้องการกิจกรรม (รูปแบบกิจกรรม, ระดับประสบการณ์, ความถี่, อุปสรรค, วันและช่วงเวลาที่สะดวกแบบคู่วัน–เวลา เพื่อใช้คำนวณ Heatmap)
   - **ส่วนที่ 5:** ความสนใจร่วมดำเนินงาน (ร่วมเป็นกรรมการ, สนับสนุนครั้งคราว, หรือเข้าร่วมอย่างเดียวแบบ Exclusive)
   - **ส่วนที่ 6:** ข้อมูลติดต่อ (ชื่อ-นามสกุล และ โทรศัพท์ หรือ อีเมล อย่างน้อยหนึ่งช่องทาง)
     - *การคุ้มครองข้อมูลส่วนบุคคล:* **ไม่มีการขอเลขบัตรประชาชน วันเดือนปีเกิด ที่อยู่ และข้อมูลสุขภาพโดยละเอียด**
   - **หน้าตรวจทานก่อนส่ง:** สรุปคำตอบทั้งหมด พร้อมกล่องกดยืนยันข้อความสถานะโครงการก่อนกดส่ง

2. **ความปลอดภัยและการแยกข้อมูล (Data Architecture & Security)**
   - **แยกคอลเลกชันคำตอบและข้อมูลติดต่อ:**
     - `survey_responses/{userId}_2569_v1` : ข้อมูลสถิติและความคิดเห็น
     - `survey_contacts/{userId}_2569_v1` : ข้อมูลติดต่อเฉพาะผู้สมัครสมาชิกหรือขอรับข่าวสาร
   - **Document ID คงที่ต่อผู้ใช้และเวอร์ชัน:** ป้องกันการกดส่งซ้ำแล้วเกิดข้อมูลซ้ำซ้อน
   - **Anonymous Authentication:** ผู้ตอบไม่ต้องสร้างบัญชีใหม่หรือกรอกรหัสผ่าน
   - **Firestore Security Rules:** ผู้ตอบอ่านและแก้ไขได้เฉพาะข้อมูลของตนเอง ปฏิเสธการเข้าถึงข้อมูลของผู้อื่นทั้งหมดโดยค่าเริ่มต้น
   - **Server Timestamp:** บันทึกเวลาด้วย `request.time` จากเซิร์ฟเวอร์

3. **แผงควบคุมสำหรับผู้ดูแลระบบ (Admin Dashboard)**
   - เข้าถึงได้เฉพาะผู้ที่ผ่าน **Google Sign-in** และอยู่ใน **Allowlist** (`phasharak@gmail.com` และรายการในระบบ)
   - สรุปตัวเลขสถิติจริง: ผู้ตอบทั้งหมด, จำนวนผู้เห็นชอบ, ผู้แสดงความจำนง, ผู้ขอรับข่าวสาร, ผู้สนใจเป็นกรรมการ, ผู้สนใจช่วยงาน
   - กราฟสรุปจำนวนผู้สะดวกในแต่ละคู่วันและเวลา (Heatmap & Frequency)
   - กรองข้อมูลตามหน่วยงานและประเภทความจำนง
   - ระบบตรวจจับและแจ้งเตือนรายการที่อาจเป็นข้อมูลซ้ำ (โดยไม่ลบข้อมูลอัตโนมัติ)
   - ส่งออกข้อมูลเป็น **CSV แบบ UTF-8 พร้อม BOM (`\uFEFF`)** รองรับภาษาไทยบน Microsoft Excel ได้อย่างสมบูรณ์ แยกไฟล์สรุปผลออกจากไฟล์ข้อมูลติดต่อ

4. **การอ่านร่างโครงการฉบับเต็ม**
   - มี Modal ให้อ่านร่างโครงการฉบับรับฟังความคิดเห็นครบทั้ง 11 หมวดและภาคผนวก ก

---

## 🛠️ ขั้นตอนการตั้งค่าและการติดตั้ง

### 1. การตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

คัดลอกไฟล์ `.env.example` เป็น `.env.local` หรือกำหนดในระบบ CI/CD:

```bash
cp .env.example .env.local
```

กรอกค่าจาก Firebase Project Console:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"

# รายชื่ออีเมลผู้ดูแลระบบที่มีสิทธิ์เข้าใช้งาน Admin Dashboard (คั่นด้วยจุลภาค)
VITE_ADMIN_EMAILS="phasharak@gmail.com"
```

> ⚠️ **คำเตือนด้านความปลอดภัย:** ห้ามนำ Service Account Key หรือ Admin Secret มาใส่ในโค้ดฝั่ง Client เด็ดขาด

---

### 2. การตั้งค่า Firebase Authentication & Firestore

1. **เปิดใช้งาน Authentication Providers ใน Firebase Console:**
   - ไปที่ **Authentication** > **Sign-in method**
   - เปิดใช้งาน **Anonymous** (สำหรับผู้ตอบแบบสำรวจ)
   - เปิดใช้งาน **Google** (สำหรับผู้ดูแลระบบ Admin Dashboard)

2. **การตั้งค่า Authorized Domains ใน Firebase Console:**
   - ไปที่ **Authentication** > **Settings** > **Authorized domains**
   - เพิ่มโดเมนที่ต้องการอนุญาตให้เข้าสู่ระบบ เช่น:
     - `localhost`
     - `<username>.github.io` (สำหรับ GitHub Pages)
     - โดเมนของ Google AI Studio Cloud Run (เช่น `*.run.app`)

3. **การ Deploy Firestore Security Rules:**
   - กฎความปลอดภัยอยู่ในไฟล์ `firestore.rules`
   - สามารถ Deploy ผ่าน Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```

---

### 3. การเผยแพร่ไปยัง GitHub Pages ผ่าน GitHub Actions

โปรเจกต์นี้มีไฟล์ Workflow อัตโนมัติอยู่ที่ `.github/workflows/deploy.yml`

#### ขั้นตอนการเปิดใช้งาน GitHub Pages:
1. Push โค้ดขึ้นบน GitHub Repository
2. ไปที่ **Settings** ของ Repository บน GitHub
3. เลือกเมนู **Pages** ในแถบด้านซ้าย
4. ในส่วน **Build and deployment** ให้เลือก **Source: GitHub Actions**
5. ไปที่ **Settings** > **Secrets and variables** > **Actions** แล้วเพิ่ม Environment Secrets สำหรับค่า `VITE_FIREBASE_*` (ตามข้อ 1) เพื่อให้ขั้นตอน build นำค่าไปใช้งานได้อย่างปลอดภัย
6. เมื่อมีการ Push ไปที่ branch `main` ระบบจะรัน automated tests, type check, build ด้วย Base path สัมพัทธ์ (`--base=./`) และ Deploy ไปยัง GitHub Pages โดยอัตโนมัติ

---

### 4. การรันระบบและทดสอบในเครื่อง (Local Development)

```bash
# ติดตั้ง dependencies
npm install

# รัน Automated Test Suite (ครอบคลุม Validation, Timezone, Security, Duplicate Protection)
npx vitest run

# รัน Development Server
npm run dev

# ตรวจสอบ Type และ Lint
npm run lint

# ทดสอบ Build
npm run build
```

---

## 🧪 รายการ Automated Tests ที่ครอบคลุม

- `conditional validation`: ทดสอบการข้ามส่วนกิจกรรมและข้อมูลติดต่อเมื่อเลือก "แสดงความคิดเห็นเพียงอย่างเดียว", ทดสอบการบังคับเลือกเบอร์โทรหรืออีเมล, และทดสอบความ Exclusive ของตัวเลือกช่วยงาน
- `survey closure & Thailand timezone`: ทดสอบการนับเวลาตามเขตเวลา UTC+07:00, การแปลง พ.ศ., การปิดรับแบบสำรวจหลัง 31 ต.ค. 2569 เวลา 23.59.59 น.
- `duplicate submission protection`: ทดสอบการสร้าง Document ID คงที่ต่อ User ID และ Survey Version
- `permissions & security`: ทดสอบสิทธิ์ผู้ตอบในการเข้าถึงเฉพาะข้อมูลตนเอง, การป้องกันไม่ให้ผู้ตอบอ่านข้อมูลของผู้อื่น, และการอนุญาตเฉพาะ Admin Allowlist ในการดูข้อมูลทั้งหมด
