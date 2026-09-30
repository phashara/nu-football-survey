import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles, 
  Award,
  Users,
  Heart,
  ChevronRight,
  Lock,
  Trophy,
  Flame,
  Activity,
  Layers,
  Check,
  Building,
  Target,
  ExternalLink,
  Shield,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { 
  SCHEDULE, 
  getSurveyStatus, 
  formatThaiDate, 
  STATUS_DISCLAIMER_TEXT, 
  SurveyStatus,
  getThailandTime
} from './utils/schedule';
import { 
  SurveyFormData, 
  INITIAL_FORM_DATA, 
  TIME_SLOT_OPTIONS 
} from './types/survey';
import { 
  isFirebaseConfigured, 
  submitSurvey, 
  ensureAnonymousUser, 
  testConnection 
} from './services/firebase';
import { NufcCrest } from './components/NufcCrest';
import { FullDraftModal } from './components/FullDraftModal';
import { Step1Respondent } from './components/Step1Respondent';
import { Step2Feedback } from './components/Step2Feedback';
import { Step3Intent } from './components/Step3Intent';
import { Step4Activities } from './components/Step4Activities';
import { Step5Support } from './components/Step5Support';
import { Step6Contact } from './components/Step6Contact';
import { Step7Review } from './components/Step7Review';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'survey' | 'admin'>('home');
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [surveyStep, setSurveyStep] = useState(1);
  const [formData, setFormData] = useState<SurveyFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitDocId, setSubmitDocId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Time and status
  const [currentTimeStatus, setCurrentTimeStatus] = useState<SurveyStatus>('PREPARING');

  useEffect(() => {
    const status = getSurveyStatus();
    setCurrentTimeStatus(status);

    if (isFirebaseConfigured) {
      testConnection().catch(() => {});
      ensureAnonymousUser().catch(() => {});
    }
  }, []);

  const updateFormData = (patch: Partial<SurveyFormData>) => {
    setFormData(prev => ({ ...prev, ...patch }));
    const keys = Object.keys(patch);
    setErrors(prev => {
      const next = { ...prev };
      keys.forEach(k => delete next[k]);
      return next;
    });
  };

  const isFeedbackOnly = formData.intent === 'feedback_only';

  const validateCurrentStep = (): boolean => {
    const errs: Record<string, string> = {};

    if (surveyStep === 1) {
      if (!formData.isNUPersonnel) {
        errs.isNUPersonnel = "โปรดยืนยันว่าเป็นบุคลากรที่ปฏิบัติงานอยู่ในมหาวิทยาลัยนเรศวร";
      }
      if (!formData.primaryDepartmentId) {
        errs.primaryDepartmentId = "โปรดเลือกคณะ/วิทยาลัย/หน่วยงานต้นสังกัดหลัก";
      }
      if (formData.primaryDepartmentId === 'other' && !formData.customDepartmentName?.trim()) {
        errs.customDepartmentName = "โปรดระบุชื่อหน่วยงานต้นสังกัด";
      }
    } else if (surveyStep === 2) {
      if (!formData.agreementLevel) {
        errs.agreementLevel = "โปรดระบุระดับความคิดเห็นต่อร่างโครงการ";
      }
      if (!formData.expectedBenefits || formData.expectedBenefits.length === 0) {
        errs.expectedBenefits = "โปรดเลือกประโยชน์ที่คาดว่าจะได้รับอย่างน้อย 1 ข้อ";
      }
    } else if (surveyStep === 3) {
      if (!formData.intent) {
        errs.intent = "โปรดระบุความจำนงในการมีส่วนร่วมกับโครงการ";
      }
    } else if (surveyStep === 4 && !isFeedbackOnly) {
      if (!formData.activityTypes || formData.activityTypes.length === 0) {
        errs.activityTypes = "โปรดเลือกรูปแบบกิจกรรมที่สนใจอย่างน้อย 1 รูปแบบ";
      }
      if (!formData.experienceLevel) {
        errs.experienceLevel = "โปรดระบุระดับประสบการณ์หรือทักษะกีฬาฟุตบอล";
      }
      if (!formData.frequency) {
        errs.frequency = "โปรดระบุความถี่ที่คาดว่าจะเข้าร่วมกิจกรรม";
      }
      if (!formData.preferredTimeSlots || formData.preferredTimeSlots.length === 0) {
        errs.preferredTimeSlots = "โปรดเลือกช่วงวันและเวลาที่สะดวกอย่างน้อย 1 ช่วง";
      }
    } else if (surveyStep === 5 && !isFeedbackOnly) {
      if (!formData.supportRoles || formData.supportRoles.length === 0) {
        errs.supportRoles = "โปรดระบุความสนใจร่วมดำเนินงานหรือสนับสนุนกิจกรรม";
      }
    } else if (surveyStep === 6 && !isFeedbackOnly) {
      if (!formData.fullName.trim()) {
        errs.fullName = "โปรดระบุชื่อ-นามสกุลสำหรับบันทึกความจำนง";
      }
      if (!formData.phone?.trim() && !formData.email?.trim()) {
        errs.phone = "โปรดระบุหมายเลขโทรศัพท์หรืออีเมลอย่างน้อย 1 ช่องทางสำหรับการติดต่อ";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (surveyStep === 3 && isFeedbackOnly) {
      setSurveyStep(7);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setSurveyStep(prev => Math.min(prev + 1, 7));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    if (surveyStep === 7 && isFeedbackOnly) {
      setSurveyStep(3);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    setSurveyStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitSurvey(formData);
      setSubmitDocId(res.docId);
      setSubmitSuccess(true);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSurvey = () => {
    setFormData(INITIAL_FORM_DATA);
    setSurveyStep(1);
    setSubmitSuccess(false);
    setSubmitDocId('');
    setSubmitError(null);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 ">
      {/* 1. MATCHDAY LIVE TICKER BAR */}
      <div className="bg-[#0A0D15] text-white text-xs py-2 px-4 border-b border-red-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 bg-red-600/30 text-red-400 border border-red-500/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
              <span className="w-2 h-2 rounded-full bg-red-500 live-dot"></span>
              LIVE
            </span>
            <span className="text-slate-200 text-xs font-medium">
              แบบสำรวจความคิดเห็นต่อร่างโครงการจัดตั้งชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              กำหนดการ: 8 – 31 ต.ค. 2569 (23.59 น.)
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-emerald-400 font-bold">
              สถานะ: เปิดรับฟังความคิดเห็น
            </span>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL MANCHESTER UNITED / PREMIER LEAGUE STYLE CLUB NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b-4 border-[#DA291C] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
          {/* Official Football Club Crest & Brand */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <NufcCrest size="md" className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <span>NARESUAN UNIVERSITY FOOTBALL CLUB</span>
                <span className="text-amber-300">★ ★</span>
                <span className="text-slate-400 hidden sm:inline">• EST. 2569</span>
              </div>
              <div className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-red-400 transition-colors leading-tight">
                โครงการจัดตั้งชมรมฟุตบอลบุคลากร
              </div>
            </div>
          </div>

          {/* Navigation Links - ALWAYS VISIBLE ON ALL SCREENS */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer rounded-lg ${
                  currentView === 'home' 
                    ? 'bg-white/15 text-amber-400 border border-amber-400/40' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                ⚽ หน้าหลัก
              </button>

              <button
                onClick={() => setIsDraftModalOpen(true)}
                className="hidden md:flex px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-amber-400 hover:bg-white/10 transition-all cursor-pointer rounded-lg items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                ร่างโครงการ
              </button>

              {/* CRITICAL: ADMIN MENU BUTTON - PROMINENT & ALWAYS VISIBLE */}
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer rounded-lg flex items-center gap-1.5 shadow-sm ${
                  currentView === 'admin' 
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40 ring-2 ring-red-400' 
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-amber-500/40'
                }`}
                title="เข้าสู่ระบบผู้ดูแลระบบ (Admin Dashboard)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>ผู้ดูแลระบบ</span>
                <span className="hidden sm:inline text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded ml-0.5">ADMIN</span>
              </button>
            </nav>

            {/* Standout Take Survey Action Button */}
            {currentView !== 'survey' ? (
              <button
                onClick={() => {
                  setCurrentView('survey');
                  setSurveyStep(1);
                  setSubmitSuccess(false);
                }}
                className="px-4 py-2 sm:px-5 sm:py-2.5 btn-manutd-red rounded-xl flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm font-black uppercase tracking-wider shrink-0"
              >
                <span>ทำแบบสำรวจ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('home')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                กลับหน้าหลัก
              </button>
            )}
          </div>
        </div>

        {/* Mobile Quick Action Sub-bar to ensure no user misses any menu */}
        <div className="md:hidden bg-[#0A0D15] border-t border-slate-800 px-4 py-1.5 flex items-center justify-around text-xs">
          <button 
            onClick={() => setCurrentView('home')}
            className={`py-1 px-2.5 rounded font-bold transition-colors ${currentView === 'home' ? 'text-amber-400 font-extrabold' : 'text-slate-400'}`}
          >
            ⚽ หน้าหลัก
          </button>
          <button 
            onClick={() => { setCurrentView('survey'); setSurveyStep(1); setSubmitSuccess(false); }}
            className={`py-1 px-2.5 rounded font-bold transition-colors ${currentView === 'survey' ? 'text-red-400 font-extrabold' : 'text-slate-400'}`}
          >
            📋 แบบสำรวจ
          </button>
          <button 
            onClick={() => setIsDraftModalOpen(true)}
            className="py-1 px-2.5 rounded font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            📜 ร่างโครงการ
          </button>
          <button 
            onClick={() => setCurrentView('admin')}
            className={`py-1 px-2.5 rounded font-extrabold transition-colors flex items-center gap-1 ${currentView === 'admin' ? 'text-red-400 bg-red-950/60' : 'text-amber-400'}`}
          >
            <Lock className="w-3 h-3 text-amber-400" />
            ผู้ดูแลระบบ
          </button>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {/* Official Mandatory Status Disclaimer Banner - HIGH CONTRAST & EASY TO READ */}
            <div className="bg-amber-50/90 border-l-4 border-amber-600 p-4 sm:p-5 rounded-2xl shadow-xs border border-amber-200">
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    ประกาศสถานะโครงการอย่างเป็นทางการ (OFFICIAL NOTICE)
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                    “{STATUS_DISCLAIMER_TEXT}”
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Section: Premier League & Manchester United Matchday Presentation */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E1B4B] text-white shadow-xl p-6 sm:p-10 border border-slate-700">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Big Match Title & Brief */}
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span>PUBLIC CONSULTATION & SQUAD DEMAND SURVEY 2026</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                    แบบสำรวจความคิดเห็น<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-300 to-amber-300">
                      โครงการจัดตั้งชมรมฟุตบอลบุคลากร
                    </span><br />
                    มหาวิทยาลัยนเรศวร
                  </h1>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                    ขอเชิญบุคลากรมหาวิทยาลัยนเรศวรทุกท่านร่วมแสดงความคิดเห็น สำรวจความต้องการกิจกรรมกีฬาฟุตบอลเพื่อสุขภาพ และร่วมแสดงความจำนงสมัครสมาชิก เพื่อเป็นกลไกส่งเสริมสุขภาพ สวัสดิการ และสร้างความสัมพันธ์ระหว่างหน่วยงาน
                  </p>

                  {/* Primary CTA Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                    <button
                      onClick={() => {
                        setCurrentView('survey');
                        setSurveyStep(1);
                        setSubmitSuccess(false);
                      }}
                      className="px-7 py-3.5 btn-manutd-red rounded-xl flex items-center justify-center gap-2.5 text-sm sm:text-base font-black uppercase tracking-wider cursor-pointer shadow-lg"
                    >
                      <span>เริ่มตอบแบบสำรวจ (TAKE SURVEY)</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setIsDraftModalOpen(true)}
                      className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm sm:text-base border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>อ่านร่างโครงการฉบับเต็ม</span>
                    </button>

                    <button
                      onClick={() => setCurrentView('admin')}
                      className="px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 font-bold text-sm sm:text-base border border-amber-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>ผู้ดูแลระบบ</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Premier League Style Fixture & Milestone Card */}
                <div className="lg:col-span-5">
                  <div className="bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
                      <span className="text-red-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        MATCHWEEK 2569 • ข้อมูลโครงการ
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                        🟢 เปิดรับฟังความคิดเห็น
                      </span>
                    </div>

                    {/* Team VS Team Matchup Graphic */}
                    <div className="grid grid-cols-7 items-center gap-2 py-2 text-center">
                      <div className="col-span-3 flex flex-col items-center">
                        <div className="w-13 h-13 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-inner mb-2">
                          🏛️
                        </div>
                        <span className="text-xs font-bold text-slate-900 uppercase leading-tight">
                          บุคลากร ม.นเรศวร
                        </span>
                        <span className="text-[10px] text-slate-500">สายวิชาการ & สายสนับสนุน</span>
                      </div>

                      <div className="col-span-1 flex flex-col items-center justify-center">
                        <span className="text-base font-black text-red-600">VS</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-tighter">CHARTER</span>
                      </div>

                      <div className="col-span-3 flex flex-col items-center">
                        <div className="w-13 h-13 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shadow-inner mb-2 p-1">
                          <NufcCrest size="sm" />
                        </div>
                        <span className="text-xs font-bold text-red-600 uppercase leading-tight">
                          ชมรมฟุตบอลทางการ
                        </span>
                        <span className="text-[10px] text-slate-500">เป้าหมายก่อตั้ง 2569</span>
                      </div>
                    </div>

                    {/* Timeline & Key Stats */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[10px]">ระยะเวลารับฟังความคิดเห็น</span>
                        <strong className="text-slate-900 text-xs sm:text-sm font-bold">8 – 31 ต.ค. 2569</strong>
                      </div>
                      <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                        <span className="text-red-700 block text-[10px]">เป้าหมายความจำนง</span>
                        <strong className="text-red-700 text-xs sm:text-sm font-bold">50+ รายชื่อสมาชิก</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Core Objectives: Crisp High-Contrast Cards (EASY TO READ) */}
            <section className="space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
                    <Target className="w-6 h-6 text-red-600" />
                    4 วัตถุประสงค์หลักของการเปิดรับฟังความคิดเห็น
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    เพื่อความโปร่งใส มีส่วนร่วม และขับเคลื่อนชมรมอย่างเป็นรูปธรรมตามระเบียบมหาวิทยาลัย
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-red-500 hover:shadow-md transition-all space-y-2 relative overflow-hidden group">
                  <div className="h-1 bg-red-600 absolute top-0 left-0 right-0"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-red-600">01</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      CHARTER
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">รับฟังความคิดเห็นต่อร่าง</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    รวบรวมข้อคิดเห็น ข้อกังวล และข้อเสนอแนะต่อโครงสร้างกิจกรรมและการบริหารจัดการชมรม
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-red-500 hover:shadow-md transition-all space-y-2 relative overflow-hidden group">
                  <div className="h-1 bg-red-600 absolute top-0 left-0 right-0"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-red-600">02</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      FORMATS
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">สำรวจความต้องการกิจกรรม</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    สำรวจรูปแบบการเล่น ประสบการณ์ และช่วงเวลาที่สะดวก เพื่อจัดสรรพื้นที่และเวลาให้เกิดประโยชน์สูงสุด
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-red-500 hover:shadow-md transition-all space-y-2 relative overflow-hidden group">
                  <div className="h-1 bg-red-600 absolute top-0 left-0 right-0"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-red-600">03</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      ROSTER
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">รับแสดงความจำนงสมาชิก</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    เปิดรับการแจ้งความประสงค์สมัครสมาชิกไว้ล่วงหน้าเพื่อประกอบการประเมินความต้องการจริง
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-red-500 hover:shadow-md transition-all space-y-2 relative overflow-hidden group">
                  <div className="h-1 bg-red-600 absolute top-0 left-0 right-0"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-red-600">04</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      COMMITTEE
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">รับแจ้งความสนใจร่วมงาน</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    เปิดโอกาสให้ผู้สนใจร่วมเป็นคณะกรรมการหรือช่วยงานเฉพาะกิจเพื่อเตรียมความพร้อมด้านผู้ดำเนินงาน
                  </p>
                </div>
              </div>
            </section>

            {/* Proposed Activity Formats - Clean & High Contrast */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight">
                    รูปแบบกิจกรรมกีฬาฟุตบอลตามร่างโครงการ (MATCH & TRAINING FORMATS)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    ออกแบบยืดหยุ่นเพื่อรองรับบุคลากรทุกกลุ่มวัย ทั้งเพื่อการออกกำลังกายและเชื่อมความสัมพันธ์
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-red-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black text-lg border border-red-200">
                      11s
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">สนาม 1 ม.นเรศวร</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">ฟุตบอล 11 คน (สนามใหญ่)</h3>
                  <p className="text-slate-600 leading-relaxed">
                    สำหรับการซ้อมประจำสัปดาห์และการแข่งขันกระชับมิตรระหว่างหน่วยงาน ณ สนามฟุตบอล 1 มหาวิทยาลัยนเรศวร
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg border border-amber-200">
                      7s
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">MINI PITCH</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">ฟุตบอล 7 คน (สนามเล็ก)</h3>
                  <p className="text-slate-600 leading-relaxed">
                    รูปแบบยืดหยุ่น เหมาะสำหรับบุคลากรวัยทำงาน ลดความเสี่ยงจากการบาดเจ็บและสร้างมิตรภาพ
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg border border-emerald-200">
                      5v5
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">GYMNASIUM</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">ฟุตซอล 5-6 คน (ในร่ม)</h3>
                  <p className="text-slate-600 leading-relaxed">
                    ออกกำลังกายหลังเลิกงานในร่ม ณ ยิมเนเซียม ไม่กระทบจากสภาพอากาศ เล่นง่าย สนุกสนานและปลอดภัย
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: MULTI-STEP SURVEY WIZARD */}
        {currentView === 'survey' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {submitSuccess ? (
              <SubmissionSuccess
                intent={formData.intent}
                isExperimentalMode={!isFirebaseConfigured}
                docId={submitDocId}
                onReset={handleResetSurvey}
                onOpenDraft={() => setIsDraftModalOpen(true)}
              />
            ) : (
              <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
                {/* Survey Matchday Header & Stepper */}
                <div className="bg-[#0F172A] text-white p-5 sm:p-6 border-b-2 border-red-600">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="text-amber-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 live-dot"></span>
                      ขั้นตอนที่ {surveyStep} {isFeedbackOnly && surveyStep === 7 ? '(ข้ามไปตรวจทาน)' : 'จาก 6'}
                    </span>
                    <span className="text-slate-300 font-mono">
                      {Math.round(((isFeedbackOnly && surveyStep === 7 ? 6 : surveyStep) / 6) * 100)}% เสร็จสิ้น
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round(((isFeedbackOnly && surveyStep === 7 ? 6 : surveyStep) / 6) * 100))}%` }}
                    ></div>
                  </div>

                  {/* Breadcrumb Steps */}
                  <div className="hidden sm:flex items-center justify-between mt-3.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span className={surveyStep === 1 ? 'text-amber-400 font-bold' : ''}>1. หน่วยงาน</span>
                    <span className={surveyStep === 2 ? 'text-amber-400 font-bold' : ''}>2. ความคิดเห็น</span>
                    <span className={surveyStep === 3 ? 'text-amber-400 font-bold' : ''}>3. ความจำนง</span>
                    <span className={surveyStep === 4 ? 'text-amber-400 font-bold' : isFeedbackOnly ? 'line-through text-slate-600' : ''}>4. กิจกรรม</span>
                    <span className={surveyStep === 5 ? 'text-amber-400 font-bold' : isFeedbackOnly ? 'line-through text-slate-600' : ''}>5. ช่วยงาน</span>
                    <span className={surveyStep === 6 ? 'text-amber-400 font-bold' : isFeedbackOnly ? 'line-through text-slate-600' : ''}>6. ข้อมูลติดต่อ</span>
                    <span className={surveyStep === 7 ? 'text-amber-400 font-bold' : ''}>7. ตรวจทาน</span>
                  </div>
                </div>

                {/* Form Step Body - HIGH CONTRAST CLEAN WHITE */}
                <div className="p-6 sm:p-8 bg-white text-slate-900">
                  {surveyStep === 1 && (
                    <Step1Respondent
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}

                  {surveyStep === 2 && (
                    <Step2Feedback
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}

                  {surveyStep === 3 && (
                    <Step3Intent
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}

                  {surveyStep === 4 && (
                    <Step4Activities
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}

                  {surveyStep === 5 && (
                    <Step5Support
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}

                  {surveyStep === 6 && (
                    <Step6Contact
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}

                  {surveyStep === 7 && (
                    <Step7Review
                      formData={formData}
                      updateFormData={updateFormData}
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                      onGoToStep={(step) => setSurveyStep(step)}
                      submitError={submitError}
                    />
                  )}

                  {/* Navigation Buttons */}
                  {surveyStep < 7 && (
                    <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
                      {surveyStep > 1 ? (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          ย้อนกลับ
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCurrentView('home')}
                          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          กลับหน้าหลัก
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-7 py-2.5 rounded-xl btn-manutd-red flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-black uppercase tracking-wider shadow-md"
                      >
                        <span>
                          {surveyStep === 3 && isFeedbackOnly ? 'ข้ามไปยังหน้าตรวจทาน' : 'ถัดไป (NEXT)'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Official Premier League & Manchester United Club Footer */}
      <footer className="mt-auto bg-[#0F172A] text-slate-300 text-xs py-8 border-t-4 border-[#DA291C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <NufcCrest size="sm" />
              <div>
                <div className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <span>NARESUAN UNIVERSITY FOOTBALL CLUB</span>
                  <span className="text-amber-400">• EST. 2569</span>
                </div>
                <div className="text-slate-400 text-xs mt-0.5">
                  โครงการจัดตั้งชมรมฟุตบอลและกีฬาฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร • จังหวัดพิษณุโลก
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
              >
                หน้าหลัก
              </button>
              <button
                onClick={() => setIsDraftModalOpen(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
              >
                อ่านร่างโครงการฉบับเต็ม
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer bg-white/10 px-2.5 py-1 rounded"
              >
                🔒 ผู้ดูแลระบบ (Admin)
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 text-center sm:text-left font-mono">
            <p>
              {STATUS_DISCLAIMER_TEXT}
            </p>
            <p className="shrink-0 text-slate-400">
              THAILAND TIME (UTC+07:00)
            </p>
          </div>
        </div>
      </footer>

      {/* Full Draft Document Reader Modal */}
      <FullDraftModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
      />
    </div>
  );
}
