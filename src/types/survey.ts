/**
 * ประเภทข้อมูลและโครงร่างของแบบสำรวจโครงการจัดตั้งชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร
 */

export type AgreementLevel = 
  | 'strongly_agree'     // เห็นด้วยอย่างยิ่ง
  | 'agree'              // เห็นด้วย
  | 'not_sure'           // ไม่แน่ใจ
  | 'disagree'           // ไม่เห็นด้วย
  | 'strongly_disagree'; // ไม่เห็นด้วยอย่างยิ่ง

export type IntentType = 
  | 'join_member'        // ประสงค์สมัครสมาชิก
  | 'receive_news'       // ประสงค์รับข้อมูลข่าวสารก่อนตัดสินใจ
  | 'feedback_only';     // ประสงค์แสดงความคิดเห็นเพียงอย่างเดียว

export type ExperienceLevel = 
  | 'beginner'           // ไม่เคยเล่นมาก่อนหรือผู้เริ่มต้น
  | 'returning'          // เคยเล่นในอดีตแต่หยุดไปนาน
  | 'regular';           // เล่นเป็นประจำหรือมีประสบการณ์ต่อเนื่อง

export type ParticipationRole = 
  | 'committee'          // สนใจร่วมเป็นคณะกรรมการ
  | 'occasional_support' // สนใจสนับสนุนการจัดกิจกรรมเป็นครั้งคราว
  | 'participate_only';  // สนใจเข้าร่วมกิจกรรมอย่างเดียว (ห้ามเลือกปนกับสองข้อแรก)

export interface DayTimePair {
  id: string;
  dayTh: string;
  timeSlotTh: string;
  label: string;
}

export const TIME_SLOT_OPTIONS: DayTimePair[] = [
  { id: "mon_evening", dayTh: "วันจันทร์", timeSlotTh: "ช่วงเย็น (17.00 - 19.30 น.)", label: "วันจันทร์ ช่วงเย็น (17.00 - 19.30 น.)" },
  { id: "tue_evening", dayTh: "วันอังคาร", timeSlotTh: "ช่วงเย็น (17.00 - 19.30 น.)", label: "วันอังคาร ช่วงเย็น (17.00 - 19.30 น.)" },
  { id: "wed_evening", dayTh: "วันพุธ", timeSlotTh: "ช่วงเย็น (17.00 - 19.30 น.)", label: "วันพุธ ช่วงเย็น (17.00 - 19.30 น.)" },
  { id: "thu_evening", dayTh: "วันพฤหัสบดี", timeSlotTh: "ช่วงเย็น (17.00 - 19.30 น.)", label: "วันพฤหัสบดี ช่วงเย็น (17.00 - 19.30 น.)" },
  { id: "fri_evening", dayTh: "วันศุกร์", timeSlotTh: "ช่วงเย็น (17.00 - 19.30 น.)", label: "วันศุกร์ ช่วงเย็น (17.00 - 19.30 น.)" },
  { id: "sat_morning", dayTh: "วันเสาร์", timeSlotTh: "ช่วงเช้า (06.30 - 09.00 น.)", label: "วันเสาร์ ช่วงเช้า (06.30 - 09.00 น.)" },
  { id: "sat_evening", dayTh: "วันเสาร์", timeSlotTh: "ช่วงเย็น (16.30 - 19.00 น.)", label: "วันเสาร์ ช่วงเย็น (16.30 - 19.00 น.)" },
  { id: "sun_morning", dayTh: "วันอาทิตย์", timeSlotTh: "ช่วงเช้า (06.30 - 09.00 น.)", label: "วันอาทิตย์ ช่วงเช้า (06.30 - 09.00 น.)" },
  { id: "sun_evening", dayTh: "วันอาทิตย์", timeSlotTh: "ช่วงเย็น (16.30 - 19.00 น.)", label: "วันอาทิตย์ ช่วงเย็น (16.30 - 19.00 น.)" },
];

export const ACTIVITY_OPTIONS = [
  "กิจกรรมฟุตบอลเพื่อสุขภาพ",
  "การฝึกทักษะพื้นฐาน",
  "ฟุตบอลสัมพันธ์ระหว่างหน่วยงาน",
  "การแข่งขัน",
  "ฟุตบอลสนามเล็ก",
  "ฟุตบอล 11 คน",
  "รูปแบบยืดหยุ่นตามจำนวนผู้เข้าร่วม"
];

export const BENEFIT_OPTIONS = [
  "ส่งเสริมสุขภาพร่างกายและการออกกำลังกายอย่างต่อเนื่อง",
  "ผ่อนคลายความเครียดจากการทำงานและส่งเสริมสุขภาพจิต",
  "สร้างความสัมพันธ์และความสามัคคีระหว่างเพื่อนร่วมงาน",
  "สร้างเครือข่ายและโอกาสประสานงานระหว่างหน่วยงานภายในมหาวิทยาลัย",
  "เป็นช่องทางสวัสดิการและการใช้เวลาว่างให้เกิดประโยชน์",
  "มีพื้นที่พัฒนาทักษะกีฬาและร่วมกิจกรรมที่ตนเองสนใจ"
];

export const OBSTACLE_OPTIONS = [
  "ภาระงานหรือเวลาเลิกงานไม่แน่นอน",
  "ข้อจำกัดด้านสุขภาพหรือมีอาการบาดเจ็บเดิม",
  "การเดินทางหรือภารกิจดูแลครอบครัว",
  "ขาดอุปกรณ์กีฬาหรือชุดรองเท้าที่เหมาะสม",
  "กังวลเรื่องระดับทักษะหรือความปลอดภัยในการเล่น",
  "ติดภารกิจการสอน/การประชุมนอกเวลาราชการ"
];

export const SUPPORT_AREAS = [
  "การประสานงาน",
  "งานเลขานุการและสมาชิก",
  "การจัดกิจกรรม",
  "สนามและอุปกรณ์",
  "การเงินและการรายงาน",
  "การสื่อสารและประชาสัมพันธ์",
  "อื่น ๆ"
];

export interface SurveyFormData {
  // ส่วนที่ 1 ข้อมูลผู้ตอบ
  isNUPersonnel: boolean;
  primaryDepartmentId: string;
  primaryDepartmentName: string;
  customDepartmentName?: string;
  subDepartment?: string;

  // ส่วนที่ 2 ความคิดเห็นต่อร่างโครงการ
  agreementLevel: AgreementLevel | '';
  expectedBenefits: string[];
  concerns?: string;
  suggestions?: string;

  // ส่วนที่ 3 ความจำนง
  intent: IntentType | '';

  // ส่วนที่ 4 ความต้องการกิจกรรม (ข้ามได้ถ้า intent == 'feedback_only')
  activityTypes: string[];
  experienceLevel: ExperienceLevel | '';
  frequency: string;
  obstacles: string[];
  otherObstacle?: string;
  preferredTimeSlots: string[]; // List of DayTimePair IDs

  // ส่วนที่ 5 ความสนใจร่วมดำเนินงาน (ข้ามได้ถ้า intent == 'feedback_only')
  supportRoles: ('committee' | 'occasional_support' | 'participate_only')[];
  interestedAreas: string[];
  otherAreaDescription?: string;

  // ส่วนที่ 6 ข้อมูลติดต่อ (เฉพาะ intent == 'join_member' หรือ 'receive_news')
  fullName: string;
  phone?: string;
  email?: string;

  // หน้าตรวจทาน
  acknowledgedDisclaimer: boolean;
}

export const INITIAL_FORM_DATA: SurveyFormData = {
  isNUPersonnel: false,
  primaryDepartmentId: '',
  primaryDepartmentName: '',
  customDepartmentName: '',
  subDepartment: '',

  agreementLevel: '',
  expectedBenefits: [],
  concerns: '',
  suggestions: '',

  intent: '',

  activityTypes: [],
  experienceLevel: '',
  frequency: '',
  obstacles: [],
  otherObstacle: '',
  preferredTimeSlots: [],

  supportRoles: [],
  interestedAreas: [],
  otherAreaDescription: '',

  fullName: '',
  phone: '',
  email: '',

  acknowledgedDisclaimer: false,
};

/**
 * โครงสร้างที่จัดเก็บใน Firestore แยกคำตอบออกจากข้อมูลติดต่อ
 */
export interface SurveyResponseFirestoreDoc {
  id: string;
  userId: string;
  surveyVersion: string;
  isNUPersonnel: boolean;
  primaryDepartmentId: string;
  primaryDepartmentName: string;
  customDepartmentName?: string;
  subDepartment?: string;
  agreementLevel: AgreementLevel;
  expectedBenefits: string[];
  concerns?: string;
  suggestions?: string;
  intent: IntentType;
  activityTypes: string[];
  experienceLevel?: string;
  frequency?: string;
  obstacles: string[];
  otherObstacle?: string;
  preferredTimeSlots: string[];
  supportRoles: string[];
  interestedAreas: string[];
  otherAreaDescription?: string;
  hasContactInfo: boolean;
  acknowledgedDisclaimer: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface SurveyContactFirestoreDoc {
  id: string;
  userId: string;
  surveyVersion: string;
  fullName: string;
  phone?: string;
  email?: string;
  primaryDepartmentName: string;
  intent: IntentType;
  createdAt: any;
  updatedAt: any;
}
