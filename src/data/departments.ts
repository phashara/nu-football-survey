/**
 * ข้อมูลหน่วยงานมหาวิทยาลัยนเรศวร
 * อ้างอิงจากเว็บไซต์ทางการ:
 * - คณะและวิทยาลัย: https://www.nu.ac.th/?page_id=1929
 * - หน่วยงานสนับสนุนและโรงเรียน: https://www.nu.ac.th/?page_id=1927
 * 
 * วันที่ตรวจสอบข้อมูล: 1 กันยายน 2569
 * หมายเหตุ: หัวข้อกลุ่ม (Category) ใช้สำหรับจัดกลุ่มเท่านั้น ห้ามใช้เป็นตัวเลือกหน่วยงาน
 */

export interface DepartmentItem {
  id: string;
  nameTh: string;
  nameEn?: string;
  category: 'faculty_college' | 'school' | 'support_unit' | 'other_unit';
  categoryLabel: string;
  sourceUrl: string;
  verifiedDate: string;
}

export interface DepartmentGroup {
  category: 'faculty_college' | 'school' | 'support_unit' | 'other_unit';
  categoryLabel: string;
  items: DepartmentItem[];
}

export const OFFICIAL_DEPARTMENTS: DepartmentItem[] = [
  // --- กลุ่มคณะและวิทยาลัย (https://www.nu.ac.th/?page_id=1929) ---
  {
    id: "fac_med",
    nameTh: "คณะแพทยศาสตร์",
    nameEn: "Faculty of Medicine",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_dent",
    nameTh: "คณะทันตแพทยศาสตร์",
    nameEn: "Faculty of Dentistry",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_pharm",
    nameTh: "คณะเภสัชศาสตร์",
    nameEn: "Faculty of Pharmacy",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_nursing",
    nameTh: "คณะพยาบาลศาสตร์",
    nameEn: "Faculty of Nursing",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_ph",
    nameTh: "คณะสาธารณสุขศาสตร์",
    nameEn: "Faculty of Public Health",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_ahs",
    nameTh: "คณะสหเวชศาสตร์",
    nameEn: "Faculty of Allied Health Sciences",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_medsci",
    nameTh: "คณะวิทยาศาสตร์การแพทย์",
    nameEn: "Faculty of Medical Science",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_sci",
    nameTh: "คณะวิทยาศาสตร์",
    nameEn: "Faculty of Science",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_eng",
    nameTh: "คณะวิศวกรรมศาสตร์",
    nameEn: "Faculty of Engineering",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_agri",
    nameTh: "คณะเกษตรศาสตร์ ทรัพยากรธรรมชาติและสิ่งแวดล้อม",
    nameEn: "Faculty of Agriculture, Natural Resources and Environment",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_arch",
    nameTh: "คณะสถาปัตยกรรมศาสตร์ ศิลปะและการออกแบบ",
    nameEn: "Faculty of Architecture, Art and Design",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_logistics",
    nameTh: "คณะโลจิสติกส์และดิจิทัลซัพพลายเชน",
    nameEn: "Faculty of Logistics and Digital Supply Chain",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "col_energy",
    nameTh: "วิทยาลัยพลังงานทดแทนและสมาร์ตกริดเทคโนโลยี",
    nameEn: "School of Renewable Energy and Smart Grid Technology",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_edu",
    nameTh: "คณะศึกษาศาสตร์",
    nameEn: "Faculty of Education",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_hum",
    nameTh: "คณะมนุษยศาสตร์",
    nameEn: "Faculty of Humanities",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_soc",
    nameTh: "คณะสังคมศาสตร์",
    nameEn: "Faculty of Social Sciences",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_law",
    nameTh: "คณะนิติศาสตร์",
    nameEn: "Faculty of Law",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "fac_bec",
    nameTh: "คณะบริหารธุรกิจ เศรษฐศาสตร์และการสื่อสาร",
    nameEn: "Faculty of Business, Economics and Communications",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "col_grad",
    nameTh: "บัณฑิตวิทยาลัย",
    nameEn: "The Graduate School",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "col_nuic",
    nameTh: "วิทยาลัยนานาชาติ",
    nameEn: "Naresuan University International College",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },
  {
    id: "col_chsm",
    nameTh: "วิทยาลัยการจัดการระบบสุขภาพ",
    nameEn: "College of Health Systems Management",
    category: "faculty_college",
    categoryLabel: "คณะและวิทยาลัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1929",
    verifiedDate: "2026-09-01"
  },

  // --- โรงเรียน (https://www.nu.ac.th/?page_id=1927) ---
  {
    id: "sch_sec_satit",
    nameTh: "โรงเรียนมัธยมสาธิตมหาวิทยาลัยนเรศวร",
    nameEn: "Demonstration School of Naresuan University (Secondary)",
    category: "school",
    categoryLabel: "โรงเรียน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "sch_pri_satit",
    nameTh: "โรงเรียนประถมสาธิตมหาวิทยาลัยนเรศวร",
    nameEn: "Demonstration School of Naresuan University (Primary)",
    category: "school",
    categoryLabel: "โรงเรียน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },

  // --- หน่วยงานสนับสนุน (https://www.nu.ac.th/?page_id=1927) ---
  {
    id: "supp_pres_office",
    nameTh: "สำนักงานอธิการบดี",
    nameEn: "Office of the President",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_central",
    nameTh: "กองกลาง สำนักงานอธิการบดี",
    nameEn: "Central Division",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_academic_admin",
    nameTh: "กองการบริหารการศึกษา",
    nameEn: "Division of Academic Affairs",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_hr",
    nameTh: "กองการบริหารงานบุคคล",
    nameEn: "Human Resources Division",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_student_affairs",
    nameTh: "กองกิจการนิสิต",
    nameEn: "Student Affairs Division",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_finance",
    nameTh: "กองคลังและพัสดุ",
    nameEn: "Finance and Supplies Division",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_property",
    nameTh: "กองพัฒนาอาคารและสถานที่",
    nameEn: "Buildings and Grounds Development Division",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_planning",
    nameTh: "กองแผนงาน",
    nameEn: "Planning Division",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_research",
    nameTh: "กองการวิจัยและนวัตกรรม",
    nameEn: "Division of Research and Innovation",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_qa",
    nameTh: "กองพัฒนาคุณภาพการศึกษา",
    nameEn: "Educational Quality Development Division",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_citcoms",
    nameTh: "สำนักบริการเทคโนโลยีสารสนเทศและการสื่อสาร (CITCOMS)",
    nameEn: "Center for Information Technology and Communication Services",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_library",
    nameTh: "สำนักหอสมุด",
    nameEn: "Naresuan University Library",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_academic_service",
    nameTh: "สำนักบริการวิชาการ",
    nameEn: "Academic Service Center",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "supp_publishing",
    nameTh: "สำนักพิมพ์มหาวิทยาลัยนเรศวร",
    nameEn: "Naresuan University Publishing House",
    category: "support_unit",
    categoryLabel: "หน่วยงานสนับสนุน",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },

  // --- หน่วยงานอื่น / สถานบริการทางการแพทย์และวิจัย (https://www.nu.ac.th/?page_id=1927) ---
  {
    id: "oth_nu_hospital",
    nameTh: "โรงพยาบาลมหาวิทยาลัยนเรศวร",
    nameEn: "Naresuan University Hospital",
    category: "other_unit",
    categoryLabel: "หน่วยงานอื่น / สถานบริการทางการแพทย์และวิจัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "oth_dent_hospital",
    nameTh: "โรงพยาบาลทันตกรรม",
    nameEn: "Naresuan University Dental Hospital",
    category: "other_unit",
    categoryLabel: "หน่วยงานอื่น / สถานบริการทางการแพทย์และวิจัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  },
  {
    id: "oth_science_park",
    nameTh: "อุทยานวิทยาศาสตร์ภาคเหนือตอนล่าง",
    nameEn: "Lower Northern Science Park",
    category: "other_unit",
    categoryLabel: "หน่วยงานอื่น / สถานบริการทางการแพทย์และวิจัย",
    sourceUrl: "https://www.nu.ac.th/?page_id=1927",
    verifiedDate: "2026-09-01"
  }
];

export const OTHER_DEPARTMENT_CUSTOM_ID = "custom_not_in_list";
export const OTHER_DEPARTMENT_CUSTOM_LABEL = "ไม่พบหน่วยงานในรายการ โปรดระบุ";

export function getGroupedDepartments(): DepartmentGroup[] {
  const groups: Record<string, DepartmentGroup> = {
    faculty_college: {
      category: 'faculty_college',
      categoryLabel: 'คณะและวิทยาลัย',
      items: []
    },
    school: {
      category: 'school',
      categoryLabel: 'โรงเรียน',
      items: []
    },
    support_unit: {
      category: 'support_unit',
      categoryLabel: 'หน่วยงานสนับสนุน',
      items: []
    },
    other_unit: {
      category: 'other_unit',
      categoryLabel: 'หน่วยงานอื่น / สถานบริการทางการแพทย์และวิจัย',
      items: []
    }
  };

  OFFICIAL_DEPARTMENTS.forEach(dept => {
    if (groups[dept.category]) {
      groups[dept.category].items.push(dept);
    }
  });

  return Object.values(groups);
}
