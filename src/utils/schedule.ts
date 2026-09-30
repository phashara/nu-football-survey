/**
 * การคำนวณและตรวจสอบกรอบเวลารับฟังความคิดเห็นตามเขตเวลาประเทศไทย (UTC+07:00)
 * 
 * กำหนดการ:
 * - เริ่มเตรียมการ: 1 ตุลาคม 2569
 * - เปิดรับความคิดเห็น: 8 ตุลาคม 2569 เวลา 00.00 น.
 * - ปิดรับความคิดเห็น: 31 ตุลาคม 2569 เวลา 23.59.59 น.
 */

// Timezone offset for Thailand is UTC+7 (420 minutes)
export const THAILAND_OFFSET_HOURS = 7;
export const THAILAND_OFFSET_MS = THAILAND_OFFSET_HOURS * 60 * 60 * 1000;

// ISO 8601 strings with +07:00 timezone
export const SCHEDULE = {
  PREPARATION_START_ISO: "2026-10-01T00:00:00+07:00",
  SURVEY_OPEN_ISO: "2026-10-08T00:00:00+07:00",
  SURVEY_CLOSE_ISO: "2026-10-31T23:59:59+07:00",
  
  PREPARATION_START_TIMESTAMP: new Date("2026-10-01T00:00:00+07:00").getTime(),
  SURVEY_OPEN_TIMESTAMP: new Date("2026-10-08T00:00:00+07:00").getTime(),
  SURVEY_CLOSE_TIMESTAMP: new Date("2026-10-31T23:59:59+07:00").getTime(),
};

export type SurveyStatus = 'PREPARING' | 'OPEN' | 'CLOSED';

/**
 * Returns current timestamp in UTC ms adjusted or relative
 */
export function getThailandTime(date: Date = new Date()): Date {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + THAILAND_OFFSET_MS);
}

/**
 * Checks whether the survey is currently open based on a timestamp.
 */
export function getSurveyStatus(currentTimestamp: number = Date.now()): SurveyStatus {
  if (currentTimestamp < SCHEDULE.SURVEY_OPEN_TIMESTAMP) {
    return 'PREPARING';
  }
  if (currentTimestamp > SCHEDULE.SURVEY_CLOSE_TIMESTAMP) {
    return 'CLOSED';
  }
  return 'OPEN';
}

/**
 * Format date in Thai Buddhist Era (พ.ศ.)
 */
export function formatThaiDate(date: Date | number, includeTime: boolean = false): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  
  // Calculate Thailand local components
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const thaiDate = new Date(utc + THAILAND_OFFSET_MS);
  
  const day = thaiDate.getDate();
  const month = thaiMonths[thaiDate.getMonth()];
  const year = thaiDate.getFullYear() + 543;
  
  if (!includeTime) {
    return `${day} ${month} ${year}`;
  }
  
  const hours = String(thaiDate.getHours()).padStart(2, '0');
  const minutes = String(thaiDate.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} เวลา ${hours}.${minutes} น.`;
}

/**
 * Status message defined by project specification
 */
export const STATUS_DISCLAIMER_TEXT = 
  "ร่างโครงการอยู่ระหว่างรับฟังความคิดเห็น ยังไม่ถือเป็นการอนุมัติจัดตั้งชมรม การสมัครสมาชิกยังเป็นเพียงการแสดงความจำนง และการแจ้งความสนใจเป็นกรรมการยังไม่ถือเป็นการแต่งตั้ง";
