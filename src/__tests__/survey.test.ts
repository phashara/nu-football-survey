import { describe, it, expect } from 'vitest';
import { 
  SCHEDULE, 
  getSurveyStatus, 
  formatThaiDate, 
  getThailandTime, 
  THAILAND_OFFSET_HOURS 
} from '../utils/schedule';
import { 
  getSurveyDocId, 
  isAllowedAdmin, 
  SURVEY_VERSION 
} from '../services/firebase';
import { OTHER_DEPARTMENT_CUSTOM_ID } from '../data/departments';

describe('1. Thailand Timezone and Schedule Tests (การจัดการเวลาและเขตเวลาประเทศไทย)', () => {
  it('should enforce UTC+07:00 Thailand offset', () => {
    expect(THAILAND_OFFSET_HOURS).toBe(7);
  });

  it('should format dates in Thai Buddhist Era (พ.ศ.)', () => {
    // 2026 A.D. is 2569 B.E.
    const date = new Date("2026-10-08T10:00:00+07:00");
    const formatted = formatThaiDate(date, false);
    expect(formatted).toContain("2569");
    expect(formatted).toContain("ตุลาคม");
    expect(formatted).toContain("8");
  });

  it('should return PREPARING status before survey opens (ก่อน 8 ตุลาคม 2569)', () => {
    const timeBeforeOpen = new Date("2026-10-05T12:00:00+07:00").getTime();
    expect(getSurveyStatus(timeBeforeOpen)).toBe('PREPARING');
  });

  it('should return OPEN status during survey period (8–31 ตุลาคม 2569)', () => {
    const timeDuringOpen = new Date("2026-10-15T12:00:00+07:00").getTime();
    expect(getSurveyStatus(timeDuringOpen)).toBe('OPEN');
  });

  it('should return CLOSED status after deadline (หลัง 31 ตุลาคม 2569 เวลา 23.59.59 น.)', () => {
    const timeAfterClose = new Date("2026-11-01T00:00:01+07:00").getTime();
    expect(getSurveyStatus(timeAfterClose)).toBe('CLOSED');
  });
});

describe('2. Conditional Validation Tests (การตรวจสอบความถูกต้องตามเงื่อนไข)', () => {
  function validateForm(formData: any) {
    const errors: Record<string, string> = {};

    if (!formData.isNUPersonnel) {
      errors.isNUPersonnel = "ต้องเป็นบุคลากรมหาวิทยาลัยนเรศวร";
    }

    if (!formData.primaryDepartmentId) {
      errors.primaryDepartmentId = "ต้องเลือกหน่วยงาน";
    }

    if (formData.primaryDepartmentId === OTHER_DEPARTMENT_CUSTOM_ID && !formData.customDepartmentName?.trim()) {
      errors.customDepartmentName = "ต้องระบุชื่อหน่วยงานเพิ่มเติม";
    }

    if (!formData.agreementLevel) {
      errors.agreementLevel = "ต้องเลือกระดับความเห็นชอบ";
    }

    if (!formData.intent) {
      errors.intent = "ต้องเลือกความจำนง";
    }

    // Conditional: If feedback only, skip activities and contact
    if (formData.intent !== 'feedback_only') {
      if (!formData.activityTypes || formData.activityTypes.length === 0) {
        errors.activityTypes = "ต้องเลือกรูปแบบกิจกรรม";
      }
      if (!formData.preferredTimeSlots || formData.preferredTimeSlots.length === 0) {
        errors.preferredTimeSlots = "ต้องเลือกช่วงเวลาที่สะดวก";
      }
      if (!formData.fullName?.trim()) {
        errors.fullName = "ต้องระบุชื่อ-นามสกุล";
      }
      const hasContact = Boolean(formData.phone?.trim() || formData.email?.trim());
      if (!hasContact) {
        errors.contactChannel = "ต้องระบุโทรศัพท์หรืออีเมลอย่างน้อย 1 ช่องทาง";
      }
    }

    // Role exclusivity: "participate_only" cannot be mixed with committee or occasional support
    if (formData.supportRoles?.includes('participate_only') && formData.supportRoles.length > 1) {
      errors.supportRoles = "ตัวเลือกสนใจเข้าร่วมกิจกรรมอย่างเดียวห้ามเลือกพร้อมตัวเลือกช่วยงานอื่น";
    }

    return errors;
  }

  it('should pass with minimal fields when intent is feedback_only (ข้ามคำถามกิจกรรมและข้อมูลติดต่อ)', () => {
    const form = {
      isNUPersonnel: true,
      primaryDepartmentId: 'fac_med',
      agreementLevel: 'strongly_agree',
      intent: 'feedback_only',
      // No activities or contact provided
    };
    const errors = validateForm(form);
    expect(errors.activityTypes).toBeUndefined();
    expect(errors.fullName).toBeUndefined();
    expect(errors.contactChannel).toBeUndefined();
    expect(Object.keys(errors).length).toBe(0);
  });

  it('should fail when intent is join_member but contact info is missing', () => {
    const form = {
      isNUPersonnel: true,
      primaryDepartmentId: 'fac_med',
      agreementLevel: 'agree',
      intent: 'join_member',
      activityTypes: ['กิจกรรมฟุตบอลเพื่อสุขภาพ'],
      preferredTimeSlots: ['mon_evening'],
      fullName: '',
      phone: '',
      email: ''
    };
    const errors = validateForm(form);
    expect(errors.fullName).toBeDefined();
    expect(errors.contactChannel).toBeDefined();
  });

  it('should accept either phone or email for contact information', () => {
    const formWithPhone = {
      isNUPersonnel: true,
      primaryDepartmentId: 'fac_med',
      agreementLevel: 'agree',
      intent: 'join_member',
      activityTypes: ['กิจกรรมฟุตบอลเพื่อสุขภาพ'],
      preferredTimeSlots: ['mon_evening'],
      fullName: 'นายทดสอบ บุคลากร',
      phone: '081-234-5678',
      email: ''
    };
    expect(validateForm(formWithPhone).contactChannel).toBeUndefined();

    const formWithEmail = {
      ...formWithPhone,
      phone: '',
      email: 'test@nu.ac.th'
    };
    expect(validateForm(formWithEmail).contactChannel).toBeUndefined();
  });

  it('should enforce exclusivity for participate_only in support roles', () => {
    const invalidForm = {
      isNUPersonnel: true,
      primaryDepartmentId: 'fac_med',
      agreementLevel: 'agree',
      intent: 'join_member',
      activityTypes: ['กิจกรรมฟุตบอลเพื่อสุขภาพ'],
      preferredTimeSlots: ['mon_evening'],
      fullName: 'นายทดสอบ บุคลากร',
      phone: '081-234-5678',
      supportRoles: ['participate_only', 'committee']
    };
    const errors = validateForm(invalidForm);
    expect(errors.supportRoles).toBeDefined();
  });
});

describe('3. Duplicate Submission Protection (การป้องกันการส่งซ้ำ)', () => {
  it('should generate a deterministic document ID for each user and survey version', () => {
    const userId1 = "user_abc_123";
    const docId1 = getSurveyDocId(userId1);
    const docId1Repeat = getSurveyDocId(userId1);

    expect(docId1).toBe(`user_abc_123_${SURVEY_VERSION}`);
    expect(docId1).toBe(docId1Repeat);

    const userId2 = "user_xyz_789";
    const docId2 = getSurveyDocId(userId2);
    expect(docId2).not.toBe(docId1);
  });
});

describe('4. Permissions & Access Control (สิทธิ์ผู้ตอบและผู้ดูแลระบบ)', () => {
  // Mock Firestore Security Rule Evaluator
  function evaluateRule(action: 'get' | 'list' | 'create', path: string, authUser: { uid: string; email?: string } | null, resourceOwnerId?: string): boolean {
    if (!authUser) return false;
    
    const isAdmin = isAllowedAdmin(authUser.email);

    if (path.startsWith('survey_responses/')) {
      if (action === 'get') {
        return resourceOwnerId === authUser.uid || isAdmin;
      }
      if (action === 'list') {
        return isAdmin; // Regular respondent is FORBIDDEN to list all responses!
      }
      if (action === 'create') {
        return true;
      }
    }
    return false;
  }

  it('should allow respondent to read their own data', () => {
    const authUser = { uid: "user_111", email: "" };
    const canReadOwn = evaluateRule('get', 'survey_responses/user_111_2569_v1', authUser, "user_111");
    expect(canReadOwn).toBe(true);
  });

  it('should PREVENT respondent from reading another respondent\'s data', () => {
    const authUser = { uid: "user_111", email: "" };
    const canReadOther = evaluateRule('get', 'survey_responses/user_222_2569_v1', authUser, "user_222");
    expect(canReadOther).toBe(false);
  });

  it('should PREVENT regular respondent from listing survey responses', () => {
    const authUser = { uid: "user_111", email: "" };
    const canList = evaluateRule('list', 'survey_responses/', authUser);
    expect(canList).toBe(false);
  });

  it('should recognize authorized admin in allowlist and grant listing permission', () => {
    const adminUser = { uid: "admin_999", email: "phasharak@gmail.com" };
    expect(isAllowedAdmin(adminUser.email)).toBe(true);

    const canAdminList = evaluateRule('list', 'survey_responses/', adminUser);
    expect(canAdminList).toBe(true);

    const canAdminReadAny = evaluateRule('get', 'survey_responses/user_111_2569_v1', adminUser, "user_111");
    expect(canAdminReadAny).toBe(true);
  });

  it('should deny admin access to unauthorized email addresses', () => {
    const stranger = { uid: "random_user", email: "stranger@gmail.com" };
    expect(isAllowedAdmin(stranger.email)).toBe(false);

    const canStrangerList = evaluateRule('list', 'survey_responses/', stranger);
    expect(canStrangerList).toBe(false);
  });
});
