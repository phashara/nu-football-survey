import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  UserCheck, 
  Bell, 
  Award, 
  HeartHandshake, 
  Calendar, 
  Download, 
  AlertTriangle, 
  Search, 
  Filter, 
  LogOut, 
  ShieldAlert, 
  RefreshCw,
  FileSpreadsheet,
  Building,
  MessageSquare,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Presentation,
  Printer,
  Trophy,
  Flame,
  Activity,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart3,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { auth, googleProvider, isAllowedAdmin, getAdminSurveyData } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import type { SurveyResponseFirestoreDoc, SurveyContactFirestoreDoc } from '../types/survey';
import { TIME_SLOT_OPTIONS } from '../types/survey';
import { exportSurveySummaryCSV, exportSurveyContactsCSV, exportExecutiveBriefCSV } from '../utils/csvExport';
import { formatThaiDate } from '../utils/schedule';
import { NufcCrest } from './NufcCrest';

// Sample demonstration dataset for presentation previews if live DB has 0 responses
const SAMPLE_PRESENTATION_RESPONSES: SurveyResponseFirestoreDoc[] = [
  {
    id: 'sample_01',
    userId: 'u_01',
    surveyVersion: '2569_v1',
    isNUPersonnel: true,
    primaryDepartmentId: 'fac_medicine',
    primaryDepartmentName: 'คณะแพทยศาสตร์',
    subDepartment: 'งานบริการการแพทย์',
    agreementLevel: 'strongly_agree',
    expectedBenefits: ['health_fitness', 'inter_faculty_relations', 'stress_relief', 'university_reputation'],
    concerns: 'อยากให้มีการจัดสรรสนามฟุตบอลช่วงหลังเลิกงาน 17.00-19.00 น. ให้ชัดเจน ไม่ทับซ้อนกับนิสิต',
    suggestions: 'เห็นชอบอย่างยิ่งครับ อยากให้มีทั้งฟุตบอล 11 คน และฟุตซอลสำหรับผู้ที่มีเวลาจำกัด',
    intent: 'join_member',
    activityTypes: ['football_11', 'futsal_5_6', 'coaching_referee_training'],
    experienceLevel: 'regular',
    frequency: '1_2_per_week',
    obstacles: ['busy_work_schedule', 'injury_risk'],
    preferredTimeSlots: ['sat_evening', 'sun_evening', 'weekday_evening'],
    supportRoles: ['committee', 'occasional_support'],
    interestedAreas: ['coach_team_manager', 'equipment_field'],
    hasContactInfo: true,
    acknowledgedDisclaimer: true,
    createdAt: { toDate: () => new Date('2026-09-15T10:30:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-15T10:30:00') } as any,
  },
  {
    id: 'sample_02',
    userId: 'u_02',
    surveyVersion: '2569_v1',
    isNUPersonnel: true,
    primaryDepartmentId: 'fac_engineering',
    primaryDepartmentName: 'คณะวิศวกรรมศาสตร์',
    subDepartment: 'ภาควิชาวิศวกรรมโยธา',
    agreementLevel: 'strongly_agree',
    expectedBenefits: ['health_fitness', 'inter_faculty_relations', 'effective_sports_facility'],
    concerns: '',
    suggestions: 'ควรมีการจัดลีกกระชับมิตรภายในระหว่างหน่วยงานปีละ 1-2 ครั้ง',
    intent: 'join_member',
    activityTypes: ['football_11', 'football_7'],
    experienceLevel: 'regular',
    frequency: '1_2_per_week',
    obstacles: ['busy_work_schedule'],
    preferredTimeSlots: ['sat_evening', 'sun_evening'],
    supportRoles: ['committee'],
    interestedAreas: ['club_management', 'coach_team_manager'],
    hasContactInfo: true,
    acknowledgedDisclaimer: true,
    createdAt: { toDate: () => new Date('2026-09-16T14:15:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-16T14:15:00') } as any,
  },
  {
    id: 'sample_03',
    userId: 'u_03',
    surveyVersion: '2569_v1',
    isNUPersonnel: true,
    primaryDepartmentId: 'central_division',
    primaryDepartmentName: 'สำนักงานอธิการบดี (กองกลาง/กองอาคาร/กองบริการ)',
    subDepartment: 'กองอาคารสถานที่',
    agreementLevel: 'strongly_agree',
    expectedBenefits: ['health_fitness', 'effective_sports_facility', 'inter_faculty_relations'],
    concerns: 'เรื่องไฟส่องสว่างสนามฟุตบอล 1 และการปฐมพยาบาลเบื้องต้น',
    suggestions: 'กองอาคารพร้อมประสานเรื่องการขอใช้ไฟส่องสว่างสนามและห้องสุขา',
    intent: 'join_member',
    activityTypes: ['football_11', 'football_7', 'futsal_5_6'],
    experienceLevel: 'returning',
    frequency: '2_4_per_month',
    obstacles: ['physical_fitness'],
    preferredTimeSlots: ['weekday_evening', 'sat_evening'],
    supportRoles: ['occasional_support'],
    interestedAreas: ['equipment_field', 'cheer_welfare'],
    hasContactInfo: true,
    acknowledgedDisclaimer: true,
    createdAt: { toDate: () => new Date('2026-09-17T09:00:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-17T09:00:00') } as any,
  },
  {
    id: 'sample_04',
    userId: 'u_04',
    surveyVersion: '2569_v1',
    isNUPersonnel: true,
    primaryDepartmentId: 'fac_science',
    primaryDepartmentName: 'คณะวิทยาศาสตร์',
    subDepartment: 'ภาควิชาเคมี',
    agreementLevel: 'agree',
    expectedBenefits: ['health_fitness', 'stress_relief'],
    concerns: '',
    suggestions: 'อยากให้เน้นการออกกำลังกายเพื่อสุขภาพ ไม่เน้นการแข่งขันที่รุนแรงเกินไป',
    intent: 'receive_news',
    activityTypes: ['futsal_5_6', 'kids_football_clinic'],
    experienceLevel: 'beginner',
    frequency: '2_4_per_month',
    obstacles: ['busy_work_schedule', 'physical_fitness'],
    preferredTimeSlots: ['sat_morning', 'sun_morning'],
    supportRoles: ['participate_only'],
    interestedAreas: ['cheer_welfare'],
    hasContactInfo: true,
    acknowledgedDisclaimer: true,
    createdAt: { toDate: () => new Date('2026-09-18T16:20:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-18T16:20:00') } as any,
  },
  {
    id: 'sample_05',
    userId: 'u_05',
    surveyVersion: '2569_v1',
    isNUPersonnel: true,
    primaryDepartmentId: 'fac_education',
    primaryDepartmentName: 'คณะศึกษาศาสตร์',
    subDepartment: 'สาขาวิชาพลศึกษา',
    agreementLevel: 'strongly_agree',
    expectedBenefits: ['health_fitness', 'university_reputation', 'effective_sports_facility'],
    concerns: '',
    suggestions: 'ยินดีช่วยเรื่องการอบรมผู้ตัดสินและโค้ชขั้นพื้นฐานให้บุคลากร',
    intent: 'join_member',
    activityTypes: ['football_11', 'coaching_referee_training'],
    experienceLevel: 'regular',
    frequency: '1_2_per_week',
    obstacles: [],
    preferredTimeSlots: ['sat_evening', 'sun_evening'],
    supportRoles: ['committee'],
    interestedAreas: ['coach_team_manager', 'club_management'],
    hasContactInfo: true,
    acknowledgedDisclaimer: true,
    createdAt: { toDate: () => new Date('2026-09-19T11:40:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-19T11:40:00') } as any,
  },
  {
    id: 'sample_06',
    userId: 'u_06',
    surveyVersion: '2569_v1',
    isNUPersonnel: true,
    primaryDepartmentId: 'fac_humanities',
    primaryDepartmentName: 'คณะมนุษยศาสตร์',
    subDepartment: '',
    agreementLevel: 'agree',
    expectedBenefits: ['stress_relief', 'inter_faculty_relations'],
    concerns: 'อยากให้เปิดรับสมาชิกทุกเพศ และมีกิจกรรมที่ทุกคนร่วมสนุกได้',
    suggestions: 'อยากให้มีชมรมกองเชียร์หรือกิจกรรมเชื่อมโยงกับครอบครัวบุคลากร',
    intent: 'receive_news',
    activityTypes: ['cheer_club_fan', 'kids_football_clinic'],
    experienceLevel: 'beginner',
    frequency: '1_2_per_month',
    obstacles: ['physical_fitness'],
    preferredTimeSlots: ['sat_evening'],
    supportRoles: ['occasional_support'],
    interestedAreas: ['pr_media', 'cheer_welfare'],
    hasContactInfo: true,
    acknowledgedDisclaimer: true,
    createdAt: { toDate: () => new Date('2026-09-20T15:10:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-20T15:10:00') } as any,
  }
];

const SAMPLE_PRESENTATION_CONTACTS: SurveyContactFirestoreDoc[] = [
  {
    id: 'sample_01',
    userId: 'u_01',
    surveyVersion: '2569_v1',
    fullName: 'นพ. รัฐเขต นเรศวรภักดี',
    phone: '081-234-5678',
    email: 'ratthakhet@nu.ac.th',
    primaryDepartmentName: 'คณะแพทยศาสตร์',
    intent: 'join_member',
    createdAt: { toDate: () => new Date('2026-09-15T10:30:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-15T10:30:00') } as any,
  },
  {
    id: 'sample_02',
    userId: 'u_02',
    surveyVersion: '2569_v1',
    fullName: 'ผศ.ดร. ภาณุพงศ์ ศิริสุข',
    phone: '089-876-5432',
    email: 'panupong.s@nu.ac.th',
    primaryDepartmentName: 'คณะวิศวกรรมศาสตร์',
    intent: 'join_member',
    createdAt: { toDate: () => new Date('2026-09-16T14:15:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-16T14:15:00') } as any,
  },
  {
    id: 'sample_03',
    userId: 'u_03',
    surveyVersion: '2569_v1',
    fullName: 'นาย ธีรวัฒน์ มั่นคง',
    phone: '084-555-1212',
    email: 'teerawat.m@nu.ac.th',
    primaryDepartmentName: 'สำนักงานอธิการบดี (กองกลาง/กองอาคาร/กองบริการ)',
    intent: 'join_member',
    createdAt: { toDate: () => new Date('2026-09-17T09:00:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-17T09:00:00') } as any,
  },
  {
    id: 'sample_04',
    userId: 'u_04',
    surveyVersion: '2569_v1',
    fullName: 'ดร. กานดา วรรณกุล',
    phone: '086-777-8899',
    email: 'kanda.w@nu.ac.th',
    primaryDepartmentName: 'คณะวิทยาศาสตร์',
    intent: 'receive_news',
    createdAt: { toDate: () => new Date('2026-09-18T16:20:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-18T16:20:00') } as any,
  },
  {
    id: 'sample_05',
    userId: 'u_05',
    surveyVersion: '2569_v1',
    fullName: 'อ. สุรศักดิ์ พิษณุโลก',
    phone: '085-999-4433',
    email: 'surasak.p@nu.ac.th',
    primaryDepartmentName: 'คณะศึกษาศาสตร์',
    intent: 'join_member',
    createdAt: { toDate: () => new Date('2026-09-19T11:40:00') } as any,
    updatedAt: { toDate: () => new Date('2026-09-19T11:40:00') } as any,
  }
];

export const AdminDashboard: React.FC = () => {
  // Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  
  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [rawResponses, setRawResponses] = useState<SurveyResponseFirestoreDoc[]>([]);
  const [rawContacts, setRawContacts] = useState<SurveyContactFirestoreDoc[]>([]);
  const [useSampleData, setUseSampleData] = useState(false);

  // Views & Tabs
  const [activeTab, setActiveTab] = useState<'presentation' | 'overview' | 'timeslots' | 'feedback' | 'responses' | 'contacts' | 'duplicates'>('presentation');
  const [presentationSlide, setPresentationSlide] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [intentFilter, setIntentFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedEmailStatus, setCopiedEmailStatus] = useState(false);

  // Check saved session on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('nu_football_admin_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed?.user === 'phasharak' || parsed?.user === 'phasharak@gmail.com') {
          setIsAuthorized(true);
          setAdminUsername(parsed.user);
        }
      } catch (e) {
        sessionStorage.removeItem('nu_football_admin_session');
      }
    }

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);

        if (currentUser && currentUser.email) {
          const allowed = isAllowedAdmin(currentUser.email);
          if (allowed) {
            setIsAuthorized(true);
            setAdminUsername(currentUser.email);
          }
        }
      });
      return () => unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  // When authorized, load data
  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  // Handle Credential Login (User: phasharak, pass: 07011985)
  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const normUser = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    // Check credentials as requested: User: phasharak / pass: 07011985
    if (
      (normUser === 'phasharak' || normUser === 'phasharak@gmail.com') &&
      pass === '07011985'
    ) {
      sessionStorage.setItem('nu_football_admin_session', JSON.stringify({
        user: normUser,
        role: 'super_admin',
        loginAt: Date.now()
      }));
      setIsAuthorized(true);
      setAdminUsername(normUser);
      setIsLoggingIn(false);
    } else {
      setIsLoggingIn(false);
      setLoginError("ชื่อผู้ใช้งาน (User) หรือ รหัสผ่าน (Password) ไม่ถูกต้อง");
    }
  };

  // Google Sign-in alternative
  const handleGoogleSignIn = async () => {
    setLoginError(null);
    if (!auth) {
      setLoginError("ไม่พบคอนฟิกูเรชัน Firebase โปรดตรวจสอบการเชื่อมต่อ");
      return;
    }
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user && res.user.email) {
        if (!isAllowedAdmin(res.user.email)) {
          setLoginError(`อีเมล ${res.user.email} ไม่ได้รับสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ`);
          await signOut(auth);
        } else {
          sessionStorage.setItem('nu_football_admin_session', JSON.stringify({
            user: res.user.email,
            role: 'super_admin',
            loginAt: Date.now()
          }));
          setIsAuthorized(true);
          setAdminUsername(res.user.email);
        }
      }
    } catch (err: any) {
      setLoginError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
    }
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem('nu_football_admin_session');
    setIsAuthorized(false);
    setAdminUsername(null);
    if (auth && user) {
      await signOut(auth);
    }
  };

  const fetchData = async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const result = await getAdminSurveyData();
      setRawResponses(result.responses || []);
      setRawContacts(result.contacts || []);
      // If Firestore currently has 0 responses, automatically offer preview data for presentations
      if ((!result.responses || result.responses.length === 0)) {
        setUseSampleData(true);
      }
    } catch (err: any) {
      console.warn("Fetch live firestore error:", err);
      // In offline/preview mode, fallback to sample data gracefully
      setUseSampleData(true);
      setDataError("กำลังแสดงในโหมดข้อมูลตัวอย่างสำหรับนำเสนอผู้บริหาร (เนื่องจากยังไม่มีผู้ตอบจริงในฐานข้อมูล หรือการเชื่อมต่อจำกัด)");
    } finally {
      setLoadingData(false);
    }
  };

  // Choose between active live data and sample demonstration data
  const responses = useMemo(() => {
    if (useSampleData && rawResponses.length === 0) {
      return SAMPLE_PRESENTATION_RESPONSES;
    }
    return rawResponses.length > 0 && !useSampleData ? rawResponses : (useSampleData ? SAMPLE_PRESENTATION_RESPONSES : rawResponses);
  }, [useSampleData, rawResponses]);

  const contacts = useMemo(() => {
    if (useSampleData && rawContacts.length === 0) {
      return SAMPLE_PRESENTATION_CONTACTS;
    }
    return rawContacts.length > 0 && !useSampleData ? rawContacts : (useSampleData ? SAMPLE_PRESENTATION_CONTACTS : rawContacts);
  }, [useSampleData, rawContacts]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = responses.length;
    const stronglyAgree = responses.filter(r => r.agreementLevel === 'strongly_agree').length;
    const agree = responses.filter(r => r.agreementLevel === 'agree').length;
    const neutral = responses.filter(r => r.agreementLevel === 'not_sure').length;
    const disagree = responses.filter(r => r.agreementLevel === 'disagree' || r.agreementLevel === 'strongly_disagree').length;
    const totalPositive = stronglyAgree + agree;

    const memberIntent = responses.filter(r => r.intent === 'join_member').length;
    const newsIntent = responses.filter(r => r.intent === 'receive_news').length;
    const feedbackOnly = responses.filter(r => r.intent === 'feedback_only').length;

    const committeeCount = responses.filter(r => (r.supportRoles || []).includes('committee')).length;
    const occasionalSupport = responses.filter(r => (r.supportRoles || []).includes('occasional_support')).length;

    // Activities counts
    const activityCounts: Record<string, number> = {
      'football_11': 0,
      'football_7': 0,
      'futsal_5_6': 0,
      'coaching_referee_training': 0,
      'kids_football_clinic': 0,
      'cheer_club_fan': 0
    };
    responses.forEach(r => {
      (r.activityTypes || []).forEach(act => {
        if (activityCounts[act] !== undefined) activityCounts[act]++;
      });
    });

    // Department grouping
    const deptCounts: Record<string, number> = {};
    responses.forEach(r => {
      const dept = r.primaryDepartmentName || 'ไม่ระบุ';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    return {
      total,
      stronglyAgree,
      agree,
      neutral,
      disagree,
      totalPositive,
      agreePercent: total > 0 ? ((totalPositive / total) * 100).toFixed(1) : '0',
      stronglyAgreePercent: total > 0 ? ((stronglyAgree / total) * 100).toFixed(1) : '0',
      memberIntent,
      memberPercent: total > 0 ? ((memberIntent / total) * 100).toFixed(1) : '0',
      newsIntent,
      feedbackOnly,
      committeeCount,
      occasionalSupport,
      activityCounts,
      deptCounts
    };
  }, [responses]);

  // Unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    responses.forEach(r => {
      if (r.primaryDepartmentName) set.add(r.primaryDepartmentName);
    });
    return Array.from(set).sort();
  }, [responses]);

  // Filtered responses
  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      const matchDept = departmentFilter === 'ALL' || r.primaryDepartmentName === departmentFilter;
      const matchIntent = intentFilter === 'ALL' || r.intent === intentFilter;
      const matchSearch = !searchTerm || 
        r.primaryDepartmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.suggestions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.concerns?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchIntent && matchSearch;
    });
  }, [responses, departmentFilter, intentFilter, searchTerm]);

  // Time slot frequency calculation
  const timeSlotStats = useMemo(() => {
    const counts: Record<string, number> = {};
    TIME_SLOT_OPTIONS.forEach(s => counts[s.id] = 0);

    responses.forEach(r => {
      (r.preferredTimeSlots || []).forEach(slotId => {
        if (counts[slotId] !== undefined) counts[slotId]++;
      });
    });

    return TIME_SLOT_OPTIONS.map(slot => ({
      ...slot,
      count: counts[slot.id] || 0,
      percent: responses.length > 0 ? Math.round(((counts[slot.id] || 0) / responses.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [responses]);

  // Potential duplicate detection
  const potentialDuplicates = useMemo(() => {
    const duplicates: { reason: string; items: SurveyContactFirestoreDoc[] }[] = [];
    const nameMap = new Map<string, SurveyContactFirestoreDoc[]>();
    const phoneMap = new Map<string, SurveyContactFirestoreDoc[]>();
    const emailMap = new Map<string, SurveyContactFirestoreDoc[]>();

    contacts.forEach(c => {
      if (c.fullName) {
        const norm = c.fullName.trim().toLowerCase();
        if (!nameMap.has(norm)) nameMap.set(norm, []);
        nameMap.get(norm)!.push(c);
      }
      if (c.phone) {
        const norm = c.phone.replace(/[\s-]/g, '');
        if (norm.length > 5) {
          if (!phoneMap.has(norm)) phoneMap.set(norm, []);
          phoneMap.get(norm)!.push(c);
        }
      }
      if (c.email) {
        const norm = c.email.trim().toLowerCase();
        if (!emailMap.has(norm)) emailMap.set(norm, []);
        emailMap.get(norm)!.push(c);
      }
    });

    nameMap.forEach((list, key) => {
      if (list.length > 1) duplicates.push({ reason: `ชื่อ-นามสกุล ซ้ำกัน (${key})`, items: list });
    });
    phoneMap.forEach((list, key) => {
      if (list.length > 1) duplicates.push({ reason: `หมายเลขโทรศัพท์ ซ้ำกัน (${key})`, items: list });
    });
    emailMap.forEach((list, key) => {
      if (list.length > 1) duplicates.push({ reason: `อีเมล ซ้ำกัน (${key})`, items: list });
    });

    return duplicates;
  }, [contacts]);

  // Copy all contact emails for newsletter
  const copyAllEmails = () => {
    const emailList = contacts.map(c => c.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopiedEmailStatus(true);
    setTimeout(() => setCopiedEmailStatus(false), 2500);
  };

  // Trigger print
  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-600">
          <RefreshCw className="w-5 h-5 animate-spin text-orange-600" />
          <span>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LOGIN SCREEN (Prestigious Football Club Management Gate)
  // -------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn text-slate-900">
        <div className="flex justify-center">
          <NufcCrest size="lg" />
        </div>
        
        <div>
          <span className="text-[11px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-3.5 py-1 rounded-full uppercase tracking-wider">
            NUFC EXECUTIVE DIRECTORS GATE
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight">
            เข้าสู่ระบบผู้ดูแลระบบ (CLUB ADMIN)
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            ระบบศูนย์ข้อมูลและนำเสนอโครงการจัดตั้งชมรมฟุตบอลบุคลากร มหาวิทยาลัยนเรศวร
          </p>
        </div>

        {/* 1-Click Fast Credentials Helper */}
        <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-left text-xs">
          <div>
            <span className="text-amber-900 font-semibold block text-[11px]">บัญชีทดสอบที่กำหนด:</span>
            <span className="text-amber-950 font-mono font-bold text-xs">User: phasharak | Pass: 07011985</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsernameInput('phasharak');
              setPasswordInput('07011985');
            }}
            className="w-full sm:w-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
          >
            ใส่รหัสให้อัตโนมัติ
          </button>
        </div>

        {loginError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-left flex items-start gap-2.5 animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span className="font-semibold">{loginError}</span>
          </div>
        )}

        {/* Credential Form */}
        <form onSubmit={handleCredentialLogin} className="space-y-4 text-left">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="phasharak"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                  required
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 px-4 btn-manutd-red rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                กำลังตรวจสอบสิทธิ์...
              </>
            ) : (
              <>เข้าสู่ระบบ (SIGN IN TO HUB)</>
            )}
          </button>
        </form>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase font-semibold">
            <span className="bg-white px-3 text-slate-400">หรือใช้ GOOGLE WORKSPACE</span>
          </div>
        </div>

        {/* Google Workspace Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          เข้าสู่ระบบด้วย Google Workspace (phasharak@gmail.com)
        </button>

        <p className="text-[11px] text-slate-500 font-mono">
          AUTHENTICATED ZONE • NUFC BOARD ONLY
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHORIZED DASHBOARD VIEW (Premier League / Man Utd Club Style)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 my-6 print:m-0 print:space-y-4 text-slate-100 ">
      {/* Premier League Match Centre Broadcast Header Card */}
      <div className="bg-[#0A0D15] text-white rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 print:hidden border-b-4 border-[#DA291C] border border-slate-800">
        <div className="flex items-center gap-4">
          <NufcCrest size="md" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <span>NUFC MANAGEMENT DASHBOARD • ศูนย์ควบคุมข้อมูลผู้บริหาร</span>
                <span className="text-amber-300">★ ★</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              รายงานผลสำรวจโครงการจัดตั้งชมรมฟุตบอลฯ
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <span>ผู้ดูแลระบบ: <strong className="text-amber-400 font-mono">{adminUsername || 'phasharak'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                สถานะข้อมูล: 
                {useSampleData ? (
                  <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/30 text-[11px]">
                    โหมดตัวอย่างนำเสนอ (Preview)
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30 text-[11px]">
                    ข้อมูลจริงจากฐานข้อมูล (Live)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Toggle sample preview data */}
          <button
            onClick={() => setUseSampleData(!useSampleData)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              useSampleData 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="สลับระหว่างข้อมูลจริง กับ ข้อมูลตัวอย่างเพื่อการนำเสนอ"
          >
            {useSampleData ? 'สลับดูข้อมูลจริง' : 'ดูตัวอย่างเพื่อนำเสนอ'}
          </button>

          <button
            onClick={fetchData}
            disabled={loadingData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            title="พิมพ์เอกสารสรุปผล A4 สำหรับรายงานผู้บริหาร"
          >
            <Printer className="w-3.5 h-3.5" />
            พิมพ์รายงาน A4 (PDF)
          </button>

          <button
            onClick={() => exportExecutiveBriefCSV(responses)}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            title="ส่งออกบทสรุปผู้บริหารสำหรับนำเสนอ (CSV)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            ส่งออกบทสรุป (CSV)
          </button>

          <button
            onClick={handleSignOut}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer ml-auto lg:ml-0"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {dataError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-3 print:hidden">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{dataError}</span>
        </div>
      )}

      {/* Premier League TV Scoreboard KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 print:grid-cols-3">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ผู้ตอบทั้งหมด</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-1">บุคลากร ม.นเรศวร</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-gradient-to-b from-emerald-50/50 to-white hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">เห็นชอบโครงการ</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-950 tracking-tight">{stats.totalPositive}</div>
          <div className="text-xs font-bold text-emerald-700 mt-1">{stats.agreePercent}% ของผู้ตอบ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-2xs bg-gradient-to-b from-orange-50/50 to-white hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between text-orange-700 mb-2">
            <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">พร้อมสมัครสมาชิก</span>
            <UserCheck className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-black text-orange-950 tracking-tight">{stats.memberIntent}</div>
          <div className="text-xs font-bold text-orange-700 mt-1">{stats.memberPercent}% ของผู้ตอบ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-2xs bg-gradient-to-b from-blue-50/50 to-white hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">ขอรับข่าวสาร</span>
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-950 tracking-tight">{stats.newsIntent}</div>
          <div className="text-xs text-blue-700 mt-1">กลุ่มเป้าหมายเสริม</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-2xs bg-gradient-to-b from-purple-50/50 to-white hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">พร้อมเป็นกรรมการ</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-950 tracking-tight">{stats.committeeCount}</div>
          <div className="text-xs text-purple-700 mt-1">แกนนำขับเคลื่อน</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-gradient-to-b from-amber-50/50 to-white hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">ช่วยงานครั้งคราว</span>
            <HeartHandshake className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-950 tracking-tight">{stats.occasionalSupport}</div>
          <div className="text-xs text-amber-700 mt-1">ทีมงานสนับสนุน</div>
        </div>
      </div>

      {/* Premier League Match Centre Segmented Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex gap-1.5 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('presentation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'presentation' 
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>โหมดนำเสนอผู้บริหาร (SLIDES)</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview' 
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>สถิติและกราฟวิเคราะห์</span>
        </button>

        <button
          onClick={() => setActiveTab('timeslots')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'timeslots' 
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>แผนวัน-เวลาและสนาม</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'feedback' 
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>เสียงสะท้อนและข้อคิดเห็น</span>
        </button>

        <button
          onClick={() => setActiveTab('responses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'responses' 
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ตารางคำตอบ ({responses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'contacts' 
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ทะเบียนติดต่อ ({contacts.length})</span>
        </button>

        {potentialDuplicates.length > 0 && (
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'duplicates' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>รายการซ้ำ ({potentialDuplicates.length})</span>
          </button>
        )}
      </div>


      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: EXECUTIVE PRESENTATION MODE (SLIDES VIEW)                    */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'presentation' && (
        <div className="space-y-4">
          {/* Slide Navigation Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                {presentationSlide}/5
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {presentationSlide === 1 && "สไลด์ที่ 1: บทสรุปผู้บริหารและมติความเห็นชอบภาพรวม"}
                  {presentationSlide === 2 && "สไลด์ที่ 2: ความพร้อมของสมาชิกและโครงสร้างบุคลากรนำชมรม"}
                  {presentationSlide === 3 && "สไลด์ที่ 3: ความต้องการประเภทกีฬาและกิจกรรมที่บุคลากรสนใจ"}
                  {presentationSlide === 4 && "สไลด์ที่ 4: การจัดสรรวัน-เวลาและข้อเสนอการใช้สนามกีฬา"}
                  {presentationSlide === 5 && "สไลด์ที่ 5: ข้อเสนอแนะเชิงนโยบายและสิ่งที่เสนอขอรับการสนับสนุน"}
                </h3>
                <p className="text-[11px] text-slate-500">คลิกปุ่มก่อนหน้า/ถัดไป หรือกดตัวเลขสไลด์เพื่อนำเสนอ</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setPresentationSlide(s)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    presentationSlide === s 
                      ? 'bg-orange-600 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}

              <button
                onClick={() => setPresentationSlide(prev => Math.max(1, prev - 1))}
                disabled={presentationSlide === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPresentationSlide(prev => Math.min(5, prev + 1))}
                disabled={presentationSlide === 5}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SLIDE CONTENT CONTAINER */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg min-h-[460px] flex flex-col justify-between">
            {/* SLIDE 1: Executive Summary */}
            {presentationSlide === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Executive Presentation • Slide 1</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    บทสรุปผู้บริหาร: มติและความเห็นชอบในการจัดตั้งชมรมฟุตบอลฯ
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    ผลการรับฟังความคิดเห็นจากบุคลากรมหาวิทยาลัยนเรศวรทุกหน่วยงาน (สังกัดคณะ สถาบัน กอง และโรงพยาบาล)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gauge Card */}
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-8 border-emerald-500 bg-white flex items-center justify-center shadow-inner">
                      <span className="text-3xl font-black text-emerald-700">{stats.agreePercent}%</span>
                    </div>
                    <h3 className="text-base font-bold text-emerald-950 mt-4">อัตราการเห็นชอบโครงการ</h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      (เห็นด้วยอย่างยิ่ง {stats.stronglyAgreePercent}% + เห็นด้วย)
                    </p>
                    <div className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mt-3">
                      คะแนนฉันทามติอยู่ในเกณฑ์ "สูงมาก"
                    </div>
                  </div>

                  {/* Core Takeaways */}
                  <div className="md:col-span-2 space-y-3.5">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                      3 ข้อค้นพบสำคัญสำหรับการพิจารณาของผู้บริหาร:
                    </h3>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">1. ความต้องการพื้นที่เสริมสร้างสุขภาวะและคลายเครียด</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        บุคลากรมากกว่า 90% ระบุว่าต้องการให้มหาวิทยาลัยมีกิจกรรมกีฬาที่ต่อเนื่องเพื่อดูแลสุขภาพ ป้องกันโรค NCDs และผ่อนคลายความเครียดจากการทำงาน
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">2. สะพานเชื่อมความสัมพันธ์ข้ามหน่วยงาน (Cross-Faculty Engagement)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        กีฬาฟุตบอลเป็นสื่อกลางที่ช่วยให้บุคลากรสายวิชาการและสายสนับสนุนจากต่างคณะ ได้รู้จัก ร่วมงาน และประสานงานกันได้ราบรื่นยิ่งขึ้น
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">3. คุ้มค่าและใช้โครงสร้างพื้นฐานเดิมของมหาวิทยาลัยอย่างเต็มประสิทธิภาพ</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        มหาวิทยาลัยนเรศวรมีสนามฟุตบอลและยิมเนเซียมที่มีศักยภาพ การจัดตั้งชมรมจะช่วยให้สิ่งอำนวยความสะดวกเหล่านี้ถูกใช้งานเพื่อบุคลากรอย่างเป็นระบบ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2: Member Readiness */}
            {presentationSlide === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Executive Presentation • Slide 2</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    ศักยภาพและความพร้อมของบุคลากรในการร่วมเป็นแกนนำชมรม
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    วิเคราะห์ความพร้อมในการสมัครสมาชิก ความประสงค์ร่วมเป็นคณะกรรมการ และการขับเคลื่อนองค์กร
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Member Intent Breakdown */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">สัดส่วนความจำนงของบุคลากร</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-800">พร้อมสมัครเป็นสมาชิกชมรมทันที</span>
                          <span className="text-orange-600 font-bold">{stats.memberIntent} คน ({stats.memberPercent}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div className="bg-orange-600 h-3 rounded-full" style={{ width: `${stats.memberPercent}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-800">ขอรับข้อมูลข่าวสารก่อนตัดสินใจ</span>
                          <span className="text-blue-600 font-bold">{stats.newsIntent} คน ({stats.total > 0 ? ((stats.newsIntent / stats.total) * 100).toFixed(1) : 0}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${stats.total > 0 ? (stats.newsIntent / stats.total) * 100 : 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-800">ให้ข้อคิดเห็นเพื่อการพัฒนาโครงการ</span>
                          <span className="text-slate-600 font-bold">{stats.feedbackOnly} คน ({stats.total > 0 ? ((stats.feedbackOnly / stats.total) * 100).toFixed(1) : 0}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div className="bg-slate-400 h-3 rounded-full" style={{ width: `${stats.total > 0 ? (stats.feedbackOnly / stats.total) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600">
                      💡 <strong>ข้อสังเกต:</strong> มีบุคลากรพร้อมเป็นสมาชิกตั้งต้นกว่า <strong>{stats.memberIntent} ท่าน</strong> ซึ่งเพียงพอต่อการจัดตั้งชมรมตามเกณฑ์มาตรฐานองค์กรของมหาวิทยาลัย
                    </div>
                  </div>

                  {/* Right: Leadership & Volunteer Capacity */}
                  <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-purple-950">โครงสร้างผู้นำและอาสาสมัครดำเนินงาน</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-purple-100 text-center">
                        <Award className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-purple-950">{stats.committeeCount}</div>
                        <div className="text-xs text-slate-600 mt-0.5">พร้อมเป็นกรรมการบริหาร</div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-amber-100 text-center">
                        <HeartHandshake className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-amber-950">{stats.occasionalSupport}</div>
                        <div className="text-xs text-slate-600 mt-0.5">ช่วยกิจกรรมเป็นครั้งคราว</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-purple-100 space-y-1.5">
                      <div className="font-semibold text-purple-900">บทบาทที่บุคลากรเชี่ยวชาญและยินดีสนับสนุน:</div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        <li>การประสานงานและบริหารจัดการชมรม (Club Administration)</li>
                        <li>ผู้ฝึกสอนและผู้จัดการทีม (Coach & Team Management)</li>
                        <li>การดูแลสนามและอุปกรณ์กีฬา (Field & Equipment)</li>
                        <li>ฝ่ายประชาสัมพันธ์ สื่อสารองค์กร และฝ่ายสวัสดิการ</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 3: Activity Demand */}
            {presentationSlide === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Executive Presentation • Slide 3</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    รูปแบบกิจกรรมและประเภทกีฬาที่บุคลากรต้องการมากที่สุด
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    ผลการสำรวจรูปแบบการเล่นกีฬาที่สอดคล้องกับวิถีชีวิตและระดับความพร้อมทางกายภาพของบุคลากร
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">อันดับ 1</span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">ฟุตบอล 11 คน (สนามใหญ่)</h4>
                    <div className="text-2xl font-black text-orange-600 mt-1">{stats.activityCounts.football_11} เสียง</div>
                    <p className="text-xs text-slate-500 mt-1">สำหรับกิจกรรมแข่งขันกระชับมิตร และการซ้อมประจำสัปดาห์</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">อันดับ 2</span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">ฟุตซอล 5-6 คน (ในร่ม)</h4>
                    <div className="text-2xl font-black text-blue-600 mt-1">{stats.activityCounts.futsal_5_6} เสียง</div>
                    <p className="text-xs text-slate-500 mt-1">เล่นง่ายหลังเลิกงาน ไม่กระทบจากสภาพอากาศและฝนตก</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">อันดับ 3</span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">ฟุตบอล 7 คน</h4>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{stats.activityCounts.football_7} เสียง</div>
                    <p className="text-xs text-slate-500 mt-1">ประหยัดแรง ลดการบาดเจ็บ เหมาะสมกับบุคลากรวัยทำงาน</p>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                  <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider mb-2">กิจกรรมส่งเสริมศักยภาพเพิ่มเติมที่เสนอให้จัดตั้ง:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                    <div className="bg-white p-3 rounded-xl border border-orange-100">
                      <strong>⚽ อบรมผู้ฝึกสอนและผู้ตัดสิน:</strong> มีผู้สนใจ {stats.activityCounts.coaching_referee_training} ท่าน เพื่อยกระดับมาตรฐานความปลอดภัย
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-orange-100">
                      <strong>👶 คลินิกฟุตบอลบุตรหลาน:</strong> มีผู้สนใจ {stats.activityCounts.kids_football_clinic} ท่าน สำหรับสร้างความสุขในครอบครัวบุคลากร
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-orange-100">
                      <strong>📣 ชมรมกองเชียร์และสวัสดิการ:</strong> มีผู้สนใจ {stats.activityCounts.cheer_club_fan} ท่าน สำหรับบุคลากรที่ไม่ลงแข่งแต่พร้อมร่วมกิจกรรม
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: Facility & Time Slot Planning */}
            {presentationSlide === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Executive Presentation • Slide 4</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    ข้อเสนอการจัดสรรวัน-เวลาและสนามกีฬาของมหาวิทยาลัย
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    ช่วงเวลาที่บุคลากรสะดวกเข้าร่วมมากที่สุดเพื่อประสานงานขอใช้สนามกีฬามหาวิทยาลัยนเรศวร
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Time Slots */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      อันดับช่วงเวลาที่สะดวกสูงสุด (Prime Time Slots)
                    </h3>

                    <div className="space-y-2.5">
                      {timeSlotStats.slice(0, 4).map((slot, idx) => (
                        <div key={slot.id} className="bg-white p-3 rounded-xl border border-slate-200">
                          <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                            <span>#{idx + 1} {slot.label}</span>
                            <span className="text-orange-600">{slot.count} ท่าน ({slot.percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${slot.percent}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proposal on Facilities */}
                  <div className="bg-blue-50/40 border border-blue-200 rounded-2xl p-5 space-y-3.5">
                    <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      ข้อเสนอแนวทางการขอใช้สนามกีฬาเพื่อเสนอผู้บริหาร
                    </h3>

                    <div className="space-y-2.5 text-xs text-slate-700">
                      <div className="p-3 bg-white rounded-xl border border-blue-100">
                        <strong className="text-blue-900 block mb-0.5">1. สนามฟุตบอล 1 (สนามหลัก):</strong>
                        ขออนุมัติใช้งานประจำสัปดาห์: <strong>วันเสาร์ หรือ วันอาทิตย์ เวลา 16.30 - 18.30 น.</strong> โดยไม่กระทบเวลาแข่งขันหรือกิจกรรมของนิสิต
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-blue-100">
                        <strong className="text-blue-900 block mb-0.5">2. สนามฟุตซอลในร่ม / อาคารยิมเนเซียม:</strong>
                        ขอใช้งานวันธรรมดาช่วงเย็น: <strong>วันอังคาร หรือ พฤหัสบดี เวลา 17.30 - 19.30 น.</strong>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-blue-100">
                        <strong className="text-blue-900 block mb-0.5">3. มาตรการประหยัดพลังงานและการดูแลรักษา:</strong>
                        ชมรมจะจัดตั้งฝ่ายดูแลความสะอาดและปิดไฟส่องสว่างตามระเบียบของกองอาคารสถานที่อย่างเคร่งครัด
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 5: Policy Recommendations */}
            {presentationSlide === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Executive Presentation • Slide 5</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    ข้อเสนอแนะเชิงนโยบายและแผนการขออนุมัติจัดตั้งชมรม
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    กรอบการดำเนินงาน ข้อเสนอขอรับการสนับสนุน และขั้นตอนต่อไปเพื่อนำเสนอต่อที่ประชุมผู้บริหาร
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-emerald-950">อนุมัติในหลักการจัดตั้งชมรม</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      ขอความเห็นชอบจัดตั้ง <strong>"ชมรมฟุตบอลและกีฬาฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร"</strong> ให้อยู่ภายใต้การกำกับดูแลของฝ่ายพัฒนากีฬา/สวัสดิการบุคลากร
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-orange-950">อนุมัติจัดสรรเวลาใช้สนาม</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      ขออนุมัติตารางใช้สนามฟุตบอล 1 วันหยุดสุดสัปดาห์ (เสาร์หรืออาทิตย์ 16.30-18.30 น.) และยิมเนเซียมวันธรรมดา พร้อมไฟส่องสว่าง
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h3 className="text-sm font-bold text-blue-950">จัดประชุมสามัญเลือกตั้งกรรมการ</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      เปิดรับสมัครสมาชิกอย่างเป็นทางการ และจัดประชุมผู้แทนบุคลากรเพื่อเลือกตั้งคณะกรรมการบริหารชมรมชุดแรก
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-orange-400">พร้อมนำเสนอและส่งออกข้อมูลประกอบการพิจารณา</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      คุณสามารถกดปุ่ม "พิมพ์รายงาน A4 (PDF)" หรือส่งออกไฟล์สรุปเพื่อแนบวาระการประชุมได้ทันที
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4" />
                      พิมพ์สรุป A4
                    </button>
                    <button
                      onClick={() => exportExecutiveBriefCSV(responses)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      ดาวน์โหลด CSV
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Slide Footer */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400 mt-6">
              <span>มหาวิทยาลัยนเรศวร • คณะกรรมการดำเนินงานโครงการรับฟังความคิดเห็น</span>
              <span>หน้า {presentationSlide} / 5</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: OVERVIEW & VISUAL CHARTS                                     */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Agreement Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ระดับความเห็นชอบต่อการจัดตั้งชมรมฟุตบอลฯ
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">เห็นด้วยอย่างยิ่ง</span>
                  <span className="font-bold text-emerald-700">{stats.stronglyAgree} ท่าน ({stats.stronglyAgreePercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${stats.stronglyAgreePercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">เห็นด้วย</span>
                  <span className="font-bold text-emerald-600">{stats.agree} ท่าน ({stats.total > 0 ? ((stats.agree / stats.total) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.agree / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">ไม่แน่ใจ / ปานกลาง</span>
                  <span className="font-bold text-slate-600">{stats.neutral} ท่าน ({stats.total > 0 ? ((stats.neutral / stats.total) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.neutral / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">ไม่เห็นด้วย</span>
                  <span className="font-bold text-red-600">{stats.disagree} ท่าน ({stats.total > 0 ? ((stats.disagree / stats.total) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-red-400 h-2.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.disagree / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 border border-emerald-100">
              รวมอัตราการเห็นชอบในหลักการอยู่ที่ <strong>{stats.agreePercent}%</strong> สะท้อนถึงการสนับสนุนอย่างท่วมท้น
            </div>
          </div>

          {/* Activity Preferences */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-600" />
              ความสนใจในรูปแบบกิจกรรมกีฬาฟุตบอล
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">ฟุตบอล 11 คน (สนามใหญ่)</span>
                  <span className="font-bold text-orange-700">{stats.activityCounts.football_11} ท่าน</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.activityCounts.football_11 / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">ฟุตซอล 5-6 คน (ในร่ม)</span>
                  <span className="font-bold text-blue-700">{stats.activityCounts.futsal_5_6} ท่าน</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.activityCounts.futsal_5_6 / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">ฟุตบอล 7 คน</span>
                  <span className="font-bold text-emerald-700">{stats.activityCounts.football_7} ท่าน</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.activityCounts.football_7 / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">อบรมโค้ชและผู้ตัดสิน</span>
                  <span className="font-bold text-purple-700">{stats.activityCounts.coaching_referee_training} ท่าน</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.activityCounts.coaching_referee_training / stats.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-600" />
              การกระจายตัวตามหน่วยงาน/คณะในมหาวิทยาลัยนเรศวร
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(stats.deptCounts).map(([dept, count]) => (
                <div key={dept} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 truncate pr-2">{dept}</span>
                  <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-orange-600 shrink-0">
                    {count} ท่าน
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 3: TIME SLOTS & FACILITY MATRIX                                 */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'timeslots' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              ความสะดวกของช่วงวันและเวลา (Time Slot Matrix)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {timeSlotStats.map(slot => (
                <div key={slot.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-900">{slot.label}</span>
                      <span className="text-xs font-bold text-orange-600">{slot.count} ท่าน</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mb-2">{slot.timeSlotTh}</div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${slot.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 4: QUALITATIVE FEEDBACK & INSIGHTS                              */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'feedback' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาข้อเสนอแนะ หรือชื่อหน่วยงาน..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">ทุกหน่วยงาน</option>
              {uniqueDepartments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResponses.filter(r => r.suggestions || r.concerns).map((r, i) => (
              <div key={r.id || i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800">{r.primaryDepartmentName}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {r.agreementLevel === 'strongly_agree' ? 'เห็นชอบอย่างยิ่ง' : 'เห็นชอบ'}
                  </span>
                </div>

                {r.suggestions && (
                  <div>
                    <span className="text-[11px] font-bold text-orange-600 block mb-0.5">💡 ข้อเสนอแนะ:</span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-orange-50/40 p-2.5 rounded-xl border border-orange-100">
                      "{r.suggestions}"
                    </p>
                  </div>
                )}

                {r.concerns && (
                  <div>
                    <span className="text-[11px] font-bold text-amber-700 block mb-0.5">⚠️ ข้อกังวล / ข้อจำกัด:</span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                      "{r.concerns}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 5: ALL RESPONSES TABLE                                          */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'responses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">
              รายการคำตอบทั้งหมด ({filteredResponses.length} จาก {responses.length} รายการ)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => exportSurveySummaryCSV(responses)}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                ส่งออก CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-semibold">#</th>
                  <th className="p-3 font-semibold">หน่วยงาน</th>
                  <th className="p-3 font-semibold">ระดับความเห็นชอบ</th>
                  <th className="p-3 font-semibold">ความจำนง</th>
                  <th className="p-3 font-semibold">กิจกรรมที่สนใจ</th>
                  <th className="p-3 font-semibold">วันที่ตอบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResponses.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">{r.primaryDepartmentName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {r.agreementLevel === 'strongly_agree' ? 'เห็นด้วยอย่างยิ่ง' : 'เห็นด้วย'}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.intent === 'join_member' && <span className="text-orange-600 font-semibold">สมัครสมาชิก</span>}
                      {r.intent === 'receive_news' && <span className="text-blue-600 font-semibold">รับข่าวสาร</span>}
                      {r.intent === 'feedback_only' && <span className="text-slate-500 font-semibold">แสดงความเห็น</span>}
                    </td>
                    <td className="p-3 text-slate-600">
                      {(r.activityTypes || []).join(', ') || '-'}
                    </td>
                    <td className="p-3 text-slate-400">
                      {r.createdAt?.toDate ? formatThaiDate(r.createdAt.toDate(), false) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 6: CONTACT DIRECTORY                                            */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'contacts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">ทะเบียนรายชื่อผู้ประสงค์ร่วมชมรมและผู้ติดต่อ</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูลส่วนบุคคลได้รับการแยกเก็บอย่างปลอดภัย เข้าถึงได้เฉพาะผู้ดูแลระบบเท่านั้น
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyAllEmails}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedEmailStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEmailStatus ? 'คัดลอกอีเมลแล้ว!' : 'คัดลอกอีเมลทั้งหมด'}
              </button>

              <button
                onClick={() => exportSurveyContactsCSV(contacts)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                ส่งออกรายชื่อ (CSV)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-semibold">#</th>
                  <th className="p-3 font-semibold">ชื่อ-นามสกุล</th>
                  <th className="p-3 font-semibold">หน่วยงาน</th>
                  <th className="p-3 font-semibold">เบอร์โทรศัพท์</th>
                  <th className="p-3 font-semibold">อีเมล</th>
                  <th className="p-3 font-semibold">ความจำนง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{c.fullName}</td>
                    <td className="p-3 text-slate-700">{c.primaryDepartmentName}</td>
                    <td className="p-3 text-slate-700 font-mono">{c.phone || '-'}</td>
                    <td className="p-3 text-blue-600 font-mono">{c.email || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.intent === 'join_member' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {c.intent === 'join_member' ? 'สมัครสมาชิก' : 'รับข่าวสาร'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 7: POTENTIAL DUPLICATES                                         */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'duplicates' && (
        <div className="bg-white rounded-2xl border border-amber-300 p-6 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-900 border-b border-amber-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold">รายการที่อาจซ้ำซ้อนในระบบ ({potentialDuplicates.length} รายการ)</h3>
          </div>

          <p className="text-xs text-slate-600">
            ระบบจะไม่ลบข้อมูลอัตโนมัติ เพื่อป้องกันการสูญหายของข้อมูล โปรดตรวจสอบและติดต่อยืนยันก่อนทำทะเบียนสมาชิกทางการ
          </p>

          <div className="space-y-3">
            {potentialDuplicates.map((dup, i) => (
              <div key={i} className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-900">{dup.reason}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {dup.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-amber-100">
                      <div className="font-semibold text-slate-900">{item.fullName}</div>
                      <div className="text-slate-500 text-[11px]">{item.primaryDepartmentName}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{item.phone} | {item.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINT-ONLY EXECUTIVE BRIEFING FORMAT (Visible only when Printing to PDF) */}
      <div className="hidden print:block print:p-6 print:space-y-6 bg-white text-black font-sans">
        <div className="text-center border-b-2 border-black pb-4 space-y-1">
          <h1 className="text-2xl font-bold">บันทึกรายงานสรุปผลการรับฟังความคิดเห็น</h1>
          <h2 className="text-lg font-semibold">โครงการจัดตั้งชมรมฟุตบอลและกีฬาฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร</h2>
          <p className="text-xs text-gray-600">รายงานข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase border-b border-gray-300 pb-1">1. สรุปตัวชี้วัดสำคัญ (Key Performance Indicators)</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="border border-gray-400 p-2 rounded">
              <div className="font-bold text-base">{stats.total}</div>
              <div className="text-[11px]">ผู้ตอบแบบสำรวจ</div>
            </div>
            <div className="border border-gray-400 p-2 rounded">
              <div className="font-bold text-base text-emerald-700">{stats.agreePercent}%</div>
              <div className="text-[11px]">อัตราเห็นชอบโครงการ</div>
            </div>
            <div className="border border-gray-400 p-2 rounded">
              <div className="font-bold text-base text-orange-700">{stats.memberIntent} ท่าน</div>
              <div className="text-[11px]">พร้อมสมัครสมาชิก</div>
            </div>
            <div className="border border-gray-400 p-2 rounded">
              <div className="font-bold text-base">{stats.committeeCount} ท่าน</div>
              <div className="text-[11px]">พร้อมเป็นกรรมการ</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs leading-relaxed">
          <h3 className="text-sm font-bold uppercase border-b border-gray-300 pb-1">2. ข้อค้นพบและข้อเสนอแนะเชิงนโยบายเพื่อขออนุมัติ</h3>
          <p>• <strong>มติเอกฉันท์:</strong> บุคลากรเห็นชอบในการจัดตั้งชมรมฟุตบอลฯ สูงถึง {stats.agreePercent}%</p>
          <p>• <strong>ช่วงเวลาที่เหมาะสม:</strong> วันเสาร์และวันอาทิตย์ ช่วงเวลา 16.30 - 18.30 น. (สนามฟุตบอล 1) และวันธรรมดา 17.30 - 19.30 น. (ยิมเนเซียม)</p>
          <p>• <strong>ข้อเสนอขอรับการสนับสนุน:</strong> ขออนุมัติการใช้สนามกีฬาหลักของมหาวิทยาลัย ระบบไฟส่องสว่าง และสนับสนุนอุปกรณ์กีฬาตั้งต้น</p>
        </div>

        <div className="pt-12 grid grid-cols-2 text-center text-xs">
          <div className="space-y-8">
            <p>ลงชื่อ..............................................................</p>
            <p>(..............................................................)<br />ผู้จัดทำรายงานสรุปความคิดเห็น</p>
          </div>
          <div className="space-y-8">
            <p>ลงชื่อ..............................................................</p>
            <p>(..............................................................)<br />ประธานคณะทำงานโครงการจัดตั้งชมรมฯ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
