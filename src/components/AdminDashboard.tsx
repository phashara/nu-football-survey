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
  MessageSquare
} from 'lucide-react';
import { auth, googleProvider, isAllowedAdmin, getAdminSurveyData } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import type { SurveyResponseFirestoreDoc, SurveyContactFirestoreDoc } from '../types/survey';
import { TIME_SLOT_OPTIONS } from '../types/survey';
import { exportSurveySummaryCSV, exportSurveyContactsCSV } from '../utils/csvExport';
import { formatThaiDate } from '../utils/schedule';

export const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [responses, setResponses] = useState<SurveyResponseFirestoreDoc[]>([]);
  const [contacts, setContacts] = useState<SurveyContactFirestoreDoc[]>([]);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [intentFilter, setIntentFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'contacts' | 'duplicates' | 'timeslots'>('overview');

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser && currentUser.email) {
        const allowed = isAllowedAdmin(currentUser.email);
        setIsAuthorized(allowed);
        if (allowed) {
          fetchData();
        }
      } else {
        setIsAuthorized(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    if (!auth) {
      setLoginError("ไม่พบคอนฟิกูเรชัน Firebase โปรดตรวจสอบไฟล์ .env หรือการตั้งค่าระบบ");
      return;
    }
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user && res.user.email) {
        if (!isAllowedAdmin(res.user.email)) {
          setLoginError(`อีเมล ${res.user.email} ไม่ได้รับสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ (ไม่อยู่ใน Allowlist)`);
          await signOut(auth);
        }
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setLoginError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      setResponses([]);
      setContacts([]);
    }
  };

  const fetchData = async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const result = await getAdminSurveyData();
      setResponses(result.responses);
      setContacts(result.contacts);
    } catch (err: any) {
      console.error("Fetch data error:", err);
      setDataError(err.message || "ไม่สามารถโหลดข้อมูลจาก Firestore ได้");
    } finally {
      setLoadingData(false);
    }
  };

  // Filtered responses
  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      const matchDept = departmentFilter === 'ALL' || r.primaryDepartmentName === departmentFilter;
      const matchIntent = intentFilter === 'ALL' || r.intent === intentFilter;
      return matchDept && matchIntent;
    });
  }, [responses, departmentFilter, intentFilter]);

  // Overall Statistics (Real data only - no fake data!)
  const stats = useMemo(() => {
    const total = responses.length;
    const agree = responses.filter(r => r.agreementLevel === 'strongly_agree' || r.agreementLevel === 'agree').length;
    const memberIntent = responses.filter(r => r.intent === 'join_member').length;
    const newsIntent = responses.filter(r => r.intent === 'receive_news').length;
    const feedbackOnly = responses.filter(r => r.intent === 'feedback_only').length;

    const committeeCount = responses.filter(r => (r.supportRoles || []).includes('committee')).length;
    const supportCount = responses.filter(r => (r.supportRoles || []).includes('occasional_support')).length;

    return {
      total,
      agree,
      agreePercent: total > 0 ? ((agree / total) * 100).toFixed(1) : '0',
      memberIntent,
      newsIntent,
      feedbackOnly,
      committeeCount,
      supportCount
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

  // Time slot frequency calculation
  const timeSlotStats = useMemo(() => {
    const counts: Record<string, number> = {};
    TIME_SLOT_OPTIONS.forEach(s => counts[s.id] = 0);

    responses.forEach(r => {
      (r.preferredTimeSlots || []).forEach(slotId => {
        if (counts[slotId] !== undefined) {
          counts[slotId]++;
        }
      });
    });

    return TIME_SLOT_OPTIONS.map(slot => ({
      ...slot,
      count: counts[slot.id] || 0,
      percent: responses.length > 0 ? Math.round(((counts[slot.id] || 0) / responses.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [responses]);

  // Potential duplicate detection (by Name, Phone, or Email) - DO NOT DELETE
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

  // Not logged in or unauthorized screen
  if (!user || !isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-fadeIn">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-800">
          <ShieldAlert className="w-8 h-8 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">แผงควบคุมผู้ดูแลระบบ</h2>
          <p className="text-xs text-slate-500 mt-1">
            เข้าถึงได้เฉพาะผู้ดูแลระบบที่ได้รับอนุญาต (Admin Allowlist) ผ่าน Google Sign-in เท่านั้น
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-left">
            {loginError}
          </div>
        )}

        {user && !isAuthorized && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
            บัญชี Google: <strong>{user.email}</strong> ไม่ได้อยู่ในรายชื่อผู้ดูแลระบบที่มีสิทธิ์เข้าถึง
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          เข้าสู่ระบบด้วย Google Workspace
        </button>

        {user && (
          <button
            onClick={handleSignOut}
            className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto cursor-pointer"
          >
            ออกจากระบบ
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 my-6">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider">แผงควบคุมระบบรับฟังความคิดเห็น</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">รายงานผลสำรวจความคิดเห็นโครงการจัดตั้งชมรมฟุตบอลฯ</h1>
          <p className="text-xs text-slate-400 mt-1">
            ผู้ดูแลระบบ: {user.email} (ข้อมูลจริงจาก Firebase Firestore)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchData}
            disabled={loadingData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            รีเฟรชข้อมูล
          </button>

          <button
            onClick={() => exportSurveySummaryCSV(responses)}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            title="ส่งออกผลสำรวจทางสถิติ (ไม่มีข้อมูลติดต่อบุคคล)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            ส่งออกผลสำรวจ (CSV)
          </button>

          <button
            onClick={() => exportSurveyContactsCSV(contacts)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            title="ส่งออกรายชื่อผู้สมัครสมาชิกและติดต่อ (แยกไฟล์)"
          >
            <Download className="w-3.5 h-3.5" />
            ส่งออกข้อมูลติดต่อ (CSV)
          </button>

          <button
            onClick={handleSignOut}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {dataError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{dataError}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">ผู้ตอบทั้งหมด</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">คน</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-medium">เห็นชอบโครงการ</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-950">{stats.agree}</div>
          <div className="text-[11px] text-emerald-700 mt-1">{stats.agreePercent}% ของผู้ตอบ</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-orange-700 mb-1">
            <span className="text-xs font-medium">สมัครสมาชิก</span>
            <UserCheck className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-950">{stats.memberIntent}</div>
          <div className="text-[11px] text-orange-700 mt-1">แสดงความจำนง</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-xs font-medium">ขอรับข่าวสาร</span>
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-950">{stats.newsIntent}</div>
          <div className="text-[11px] text-blue-700 mt-1">รอตัดสินใจ</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-xs font-medium">สนใจเป็นกรรมการ</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-950">{stats.committeeCount}</div>
          <div className="text-[11px] text-purple-700 mt-1">พร้อมร่วมบริหาร</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-medium">ช่วยงานครั้งคราว</span>
            <HeartHandshake className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-950">{stats.supportCount}</div>
          <div className="text-[11px] text-amber-700 mt-1">ช่วยเฉพาะกิจ</div>
        </div>
      </div>

      {/* Warning on Potential Duplicates */}
      {potentialDuplicates.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-amber-900">
            <span className="font-bold text-amber-950">ตรวจพบรายการที่อาจเป็นข้อมูลซ้ำ ({potentialDuplicates.length} รายการ): </span>
            ระบบไม่ทำการลบข้อมูลอัตโนมัติเพื่อให้ผู้ดูแลระบบตรวจสอบและติดต่อยืนยันด้วยตนเอง
            <button
              onClick={() => setActiveTab('duplicates')}
              className="ml-2 underline font-semibold text-orange-700 hover:text-orange-900 cursor-pointer"
            >
              ดูรายการซ้ำ
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs sm:text-sm font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 transition-colors shrink-0 ${
            activeTab === 'overview' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ภาพรวมและความคิดเห็น
        </button>
        <button
          onClick={() => setActiveTab('timeslots')}
          className={`pb-3 px-3 transition-colors shrink-0 ${
            activeTab === 'timeslots' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          สรุปความสะดวกวัน–เวลา ({timeSlotStats.filter(t => t.count > 0).length} ช่วง)
        </button>
        <button
          onClick={() => setActiveTab('responses')}
          className={`pb-3 px-3 transition-colors shrink-0 ${
            activeTab === 'responses' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          รายการคำตอบทั้งหมด ({responses.length})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 px-3 transition-colors shrink-0 ${
            activeTab === 'contacts' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ข้อมูลติดต่อ ({contacts.length})
        </button>
        {potentialDuplicates.length > 0 && (
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`pb-3 px-3 transition-colors shrink-0 text-amber-700 ${
              activeTab === 'duplicates' ? 'border-b-2 border-amber-600 font-bold' : ''
            }`}
          >
            แจ้งเตือนข้อมูลซ้ำ ({potentialDuplicates.length})
          </button>
        )}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>กรองข้อมูล:</span>
            </div>

            <div className="flex-1 min-w-[200px]">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500"
              >
                <option value="ALL">ทุกหน่วยงาน ({responses.length})</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="w-auto">
              <select
                value={intentFilter}
                onChange={(e) => setIntentFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500"
              >
                <option value="ALL">ทุกความจำนง</option>
                <option value="join_member">ประสงค์สมัครสมาชิก</option>
                <option value="receive_news">ประสงค์รับข้อมูลข่าวสาร</option>
                <option value="feedback_only">แสดงความคิดเห็นอย่างเดียว</option>
              </select>
            </div>
          </div>

          {/* Suggestions and Concerns Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Suggestions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                ข้อเสนอแนะเพิ่มเติมจากบุคลากร
              </h3>
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredResponses.filter(r => r.suggestions && r.suggestions.trim().length > 0).length === 0 ? (
                  <div className="text-xs text-slate-400 p-4 text-center">ยังไม่มีข้อเสนอแนะในเงื่อนไขที่เลือก</div>
                ) : (
                  filteredResponses
                    .filter(r => r.suggestions && r.suggestions.trim().length > 0)
                    .map((r, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="font-semibold text-slate-700">{r.primaryDepartmentName}</span>
                          <span>{r.createdAt?.toDate ? formatThaiDate(r.createdAt.toDate(), false) : ''}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{r.suggestions}</p>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Concerns */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                ข้อกังวลและประเด็นที่ควรระมัดระวัง
              </h3>
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredResponses.filter(r => r.concerns && r.concerns.trim().length > 0).length === 0 ? (
                  <div className="text-xs text-slate-400 p-4 text-center">ยังไม่มีข้อกังวลในเงื่อนไขที่เลือก</div>
                ) : (
                  filteredResponses
                    .filter(r => r.concerns && r.concerns.trim().length > 0)
                    .map((r, i) => (
                      <div key={i} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="font-semibold text-slate-700">{r.primaryDepartmentName}</span>
                          <span>{r.createdAt?.toDate ? formatThaiDate(r.createdAt.toDate(), false) : ''}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{r.concerns}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Time Slots Heatmap / Bar chart */}
      {activeTab === 'timeslots' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-base font-bold text-slate-900">สรุปจำนวนผู้สะดวกในแต่ละคู่วันและเวลา</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              คำนวณจากผู้ที่เลือกช่วงเวลาสะดวก (สามารถเลือกได้มากกว่าหนึ่งช่วง) เพื่อหาช่วงที่มีผู้พร้อมเข้าร่วมสูงสุด
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {timeSlotStats.map((slot) => (
              <div key={slot.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{slot.label}</span>
                  <span className="text-slate-600 font-mono">
                    <strong>{slot.count}</strong> คน ({slot.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-orange-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, slot.percent)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Responses Table */}
      {activeTab === 'responses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">ตารางข้อมูลคำตอบแบบสำรวจ (แยกจากข้อมูลติดต่อ)</span>
            <span className="text-xs text-slate-400">แสดงผล {filteredResponses.length} จาก {responses.length} รายการ</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">ลำดับ</th>
                  <th className="p-3">หน่วยงาน</th>
                  <th className="p-3">ระดับความเห็นชอบ</th>
                  <th className="p-3">ความจำนง</th>
                  <th className="p-3">ประสบการณ์</th>
                  <th className="p-3">ความสนใจช่วยงาน</th>
                  <th className="p-3">วันที่ตอบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredResponses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  filteredResponses.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-400">#{idx + 1}</td>
                      <td className="p-3 font-medium text-slate-900">{r.primaryDepartmentName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          r.agreementLevel === 'strongly_agree' || r.agreementLevel === 'agree'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {r.agreementLevel}
                        </span>
                      </td>
                      <td className="p-3">{r.intent}</td>
                      <td className="p-3">{r.experienceLevel || '-'}</td>
                      <td className="p-3">{(r.supportRoles || []).join(', ') || '-'}</td>
                      <td className="p-3 text-slate-400">
                        {r.createdAt?.toDate ? formatThaiDate(r.createdAt.toDate(), false) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Contacts Directory */}
      {activeTab === 'contacts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-100 bg-amber-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-slate-900">ทะเบียนข้อมูลติดต่อ (เฉพาะผู้สมัครสมาชิกและขอรับข่าวสาร)</span>
            </div>
            <span className="text-xs text-slate-500">{contacts.length} รายการ</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">ลำดับ</th>
                  <th className="p-3">ชื่อ–นามสกุล</th>
                  <th className="p-3">หน่วยงาน</th>
                  <th className="p-3">โทรศัพท์</th>
                  <th className="p-3">อีเมล</th>
                  <th className="p-3">ประเภท</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      ยังไม่มีข้อมูลผู้สมัครสมาชิกหรือขอรับข่าวสาร
                    </td>
                  </tr>
                ) : (
                  contacts.map((c, idx) => (
                    <tr key={c.id || idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-400">#{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{c.fullName}</td>
                      <td className="p-3">{c.primaryDepartmentName}</td>
                      <td className="p-3 font-mono">{c.phone || '-'}</td>
                      <td className="p-3 font-mono">{c.email || '-'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-800">
                          {c.intent}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Potential Duplicates */}
      {activeTab === 'duplicates' && (
        <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-xs space-y-4 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              รายการที่อาจเป็นข้อมูลส่งซ้ำ
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ระบบตรวจสอบความคล้ายคลึงของชื่อ หมายเลขโทรศัพท์ หรืออีเมล <strong>เพื่อแจ้งเตือนให้คณะทำงานทราบเท่านั้น โดยไม่มีการลบข้อมูลโดยอัตโนมัติ</strong>
            </p>
          </div>

          {potentialDuplicates.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              ไม่พบรายการที่เข้าข่ายข้อมูลซ้ำ
            </div>
          ) : (
            <div className="space-y-3">
              {potentialDuplicates.map((dup, idx) => (
                <div key={idx} className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="font-bold text-amber-900">{dup.reason}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dup.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="bg-white p-2.5 rounded-lg border border-amber-200 space-y-0.5">
                        <div className="font-semibold text-slate-900">{item.fullName}</div>
                        <div className="text-slate-600 text-[11px]">{item.primaryDepartmentName}</div>
                        <div className="text-slate-500 text-[11px] font-mono">
                          {item.phone && `Tel: ${item.phone} `}
                          {item.email && `Email: ${item.email}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
