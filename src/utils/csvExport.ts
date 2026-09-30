import type { SurveyResponseFirestoreDoc, SurveyContactFirestoreDoc } from '../types/survey';
import { TIME_SLOT_OPTIONS } from '../types/survey';
import { formatThaiDate } from './schedule';

/**
 * Helper to escape CSV cell contents safely
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Trigger download of CSV text with UTF-8 BOM
 */
function triggerCsvDownload(csvContent: string, fileName: string) {
  // UTF-8 BOM ensures Thai characters display properly in MS Excel and spreadsheet viewers
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. Export Survey Results & Feedback (Excludes Personal Contact Info)
 */
export function exportSurveySummaryCSV(responses: SurveyResponseFirestoreDoc[], fileNamePrefix: string = 'nu_football_survey_summary') {
  const timeSlotMap = new Map(TIME_SLOT_OPTIONS.map(t => [t.id, t.label]));

  const headers = [
    "รหัสอ้างอิง",
    "ยืนยันบุคลากร มน.",
    "หน่วยงานต้นสังกัดหลัก",
    "หน่วยงานระบุเพิ่มเติม",
    "หน่วยงานย่อย",
    "ระดับความคิดเห็นต่อร่างโครงการ",
    "ประโยชน์ที่คาดว่าจะได้รับ",
    "ข้อกังวล",
    "ข้อเสนอแนะเพิ่มเติม",
    "ความจำนง",
    "รูปแบบกิจกรรมที่สนใจ",
    "ระดับประสบการณ์",
    "ความถี่ที่ต้องการเข้าร่วม",
    "อุปสรรคในการเข้าร่วม",
    "อุปสรรคอื่น ๆ",
    "ช่วงเวลาที่สะดวก",
    "ความสนใจร่วมดำเนินงาน",
    "ด้านงานที่สนใจสนับสนุน",
    "ด้านงานอื่น ๆ",
    "มีข้อมูลติดต่อ",
    "วันเวลาที่ตอบ (พ.ศ.)"
  ];

  const rows = responses.map((r, idx) => {
    const agreementThai = {
      strongly_agree: "เห็นด้วยอย่างยิ่ง",
      agree: "เห็นด้วย",
      not_sure: "ไม่แน่ใจ",
      disagree: "ไม่เห็นด้วย",
      strongly_disagree: "ไม่เห็นด้วยอย่างยิ่ง"
    }[r.agreementLevel] || r.agreementLevel;

    const intentThai = {
      join_member: "ประสงค์สมัครสมาชิก",
      receive_news: "ประสงค์รับข้อมูลข่าวสารก่อนตัดสินใจ",
      feedback_only: "ประสงค์แสดงความคิดเห็นเพียงอย่างเดียว"
    }[r.intent] || r.intent;

    const experienceThai = {
      beginner: "ไม่เคยเล่นมาก่อนหรือผู้เริ่มต้น",
      returning: "เคยเล่นในอดีตแต่หยุดไปนาน",
      regular: "เล่นเป็นประจำหรือมีประสบการณ์ต่อเนื่อง"
    }[r.experienceLevel || ''] || r.experienceLevel || '-';

    const timeSlotsThai = (r.preferredTimeSlots || [])
      .map(id => timeSlotMap.get(id) || id)
      .join("; ");

    const supportRolesThai = (r.supportRoles || [])
      .map(role => {
        if (role === 'committee') return "สนใจร่วมเป็นคณะกรรมการ";
        if (role === 'occasional_support') return "สนใจสนับสนุนการจัดกิจกรรมเป็นครั้งคราว";
        if (role === 'participate_only') return "สนใจเข้าร่วมกิจกรรมอย่างเดียว";
        return role;
      })
      .join("; ");

    const formattedDate = r.createdAt?.toDate ? formatThaiDate(r.createdAt.toDate(), true) : '-';

    return [
      escapeCSV(`RESP-${idx + 1}`),
      escapeCSV(r.isNUPersonnel ? "ใช่" : "ไม่ใช่"),
      escapeCSV(r.primaryDepartmentName),
      escapeCSV(r.customDepartmentName || "-"),
      escapeCSV(r.subDepartment || "-"),
      escapeCSV(agreementThai),
      escapeCSV((r.expectedBenefits || []).join("; ")),
      escapeCSV(r.concerns || "-"),
      escapeCSV(r.suggestions || "-"),
      escapeCSV(intentThai),
      escapeCSV((r.activityTypes || []).join("; ")),
      escapeCSV(experienceThai),
      escapeCSV(r.frequency || "-"),
      escapeCSV((r.obstacles || []).join("; ")),
      escapeCSV(r.otherObstacle || "-"),
      escapeCSV(timeSlotsThai),
      escapeCSV(supportRolesThai),
      escapeCSV((r.interestedAreas || []).join("; ")),
      escapeCSV(r.otherAreaDescription || "-"),
      escapeCSV(r.hasContactInfo ? "มี" : "ไม่มี"),
      escapeCSV(formattedDate)
    ].join(',');
  });

  const csvContent = [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const now = new Date();
  const dateStr = `${now.getFullYear() + 543}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  triggerCsvDownload(csvContent, `${fileNamePrefix}_${dateStr}.csv`);
}

/**
 * 2. Export Contact Directory Separately (Restricted to Admins)
 */
export function exportSurveyContactsCSV(contacts: SurveyContactFirestoreDoc[], fileNamePrefix: string = 'nu_football_survey_contacts') {
  const headers = [
    "ลำดับ",
    "ชื่อ-นามสกุล",
    "หมายเลขโทรศัพท์",
    "อีเมล",
    "หน่วยงาน",
    "ความจำนง",
    "วันเวลาที่บันทึก (พ.ศ.)"
  ];

  const rows = contacts.map((c, idx) => {
    const intentThai = {
      join_member: "ประสงค์สมัครสมาชิก",
      receive_news: "ประสงค์รับข้อมูลข่าวสารก่อนตัดสินใจ",
      feedback_only: "ประสงค์แสดงความคิดเห็นเพียงอย่างเดียว"
    }[c.intent] || c.intent;

    const formattedDate = c.createdAt?.toDate ? formatThaiDate(c.createdAt.toDate(), true) : '-';

    return [
      escapeCSV(idx + 1),
      escapeCSV(c.fullName),
      escapeCSV(c.phone || "-"),
      escapeCSV(c.email || "-"),
      escapeCSV(c.primaryDepartmentName),
      escapeCSV(intentThai),
      escapeCSV(formattedDate)
    ].join(',');
  });

  const csvContent = [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const now = new Date();
  const dateStr = `${now.getFullYear() + 543}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  triggerCsvDownload(csvContent, `${fileNamePrefix}_${dateStr}.csv`);
}

/**
 * 3. Export Executive Summary Briefing CSV
 */
export function exportExecutiveBriefCSV(responses: SurveyResponseFirestoreDoc[], fileNamePrefix: string = 'nu_football_executive_brief') {
  const total = responses.length;
  const agreeCount = responses.filter(r => r.agreementLevel === 'strongly_agree' || r.agreementLevel === 'agree').length;
  const agreePercent = total > 0 ? ((agreeCount / total) * 100).toFixed(1) : '0';
  const memberCount = responses.filter(r => r.intent === 'join_member').length;
  const newsCount = responses.filter(r => r.intent === 'receive_news').length;
  const committeeCount = responses.filter(r => (r.supportRoles || []).includes('committee')).length;
  const supportCount = responses.filter(r => (r.supportRoles || []).includes('occasional_support')).length;

  const lines = [
    ["รายงานสรุปผลการสำรวจความคิดเห็น", "โครงการจัดตั้งชมรมฟุตบอลและกีฬาฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร"],
    ["วันที่สร้างรายงาน", new Date().toLocaleDateString('th-TH')],
    [""],
    ["ตัวชี้วัดสำคัญ (Key Metrics)", "จำนวน", "สัดส่วน (%)"],
    ["จำนวนผู้ตอบแบบสำรวจทั้งหมด", String(total), "100%"],
    ["ผู้เห็นชอบในการจัดตั้งชมรม (เห็นด้วยอย่างยิ่ง + เห็นด้วย)", String(agreeCount), `${agreePercent}%`],
    ["ผู้ประสงค์สมัครเป็นสมาชิกชมรม", String(memberCount), total > 0 ? `${((memberCount / total) * 100).toFixed(1)}%` : '0%'],
    ["ผู้ประสงค์รับข้อมูลข่าวสารเพื่อร่วมกิจกรรม", String(newsCount), total > 0 ? `${((newsCount / total) * 100).toFixed(1)}%` : '0%'],
    ["ผู้พร้อมร่วมเป็นคณะกรรมการบริหารชมรม", String(committeeCount), total > 0 ? `${((committeeCount / total) * 100).toFixed(1)}%` : '0%'],
    ["ผู้พร้อมสนับสนุนกิจกรรมเป็นครั้งคราว", String(supportCount), total > 0 ? `${((supportCount / total) * 100).toFixed(1)}%` : '0%'],
  ];

  const csvContent = lines.map(row => row.map(escapeCSV).join(',')).join('\r\n');
  const now = new Date();
  const dateStr = `${now.getFullYear() + 543}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  triggerCsvDownload(csvContent, `${fileNamePrefix}_${dateStr}.csv`);
}
