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
  LockOpen
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
  const [allowTestSubmission, setAllowTestSubmission] = useState(true); // Allow preview testing mode

  useEffect(() => {
    // Check real-time schedule status
    const status = getSurveyStatus();
    setCurrentTimeStatus(status);

    // Initial Firebase connection check
    if (isFirebaseConfigured) {
      testConnection().catch(() => {});
      ensureAnonymousUser().catch(() => {});
    }
  }, []);

  const updateFormData = (patch: Partial<SurveyFormData>) => {
    setFormData(prev => ({ ...prev, ...patch }));
    // Clear relevant errors
    const keys = Object.keys(patch);
    setErrors(prev => {
      const next = { ...prev };
      keys.forEach(k => delete next[k]);
      return next;
    });
  };

  // Determine active step sequence depending on intent
  // If intent is 'feedback_only', skip step 4 (Activities) and step 6 (Contact)
  const isFeedbackOnly = formData.intent === 'feedback_only';

  const validateCurrentStep = (): boolean => {
    const errs: Record<string, string> = {};

    if (surveyStep === 1) {
      if (!formData.isNUPersonnel) {
        errs.isNUPersonnel = "โปรดยืนยันว่าเป็นบุคลากรที่ปฏิบัติงานอยู่ในมหาวิทยาลัยนเรศวร";
      }
      if (!formData.primaryDepartmentId) {
        errs.primaryDepartmentId = "โปรดเลือกหน่วยงานต้นสังกัดหลัก";
      }
      if (formData.primaryDepartmentId === 'custom_not_in_list' && !formData.customDepartmentName?.trim()) {
        errs.customDepartmentName = "โปรดระบุชื่อหน่วยงานของท่าน";
      }
    } else if (surveyStep === 2) {
      if (!formData.agreementLevel) {
        errs.agreementLevel = "โปรดเลือกระดับความเห็นชอบต่อการจัดตั้งชมรม";
      }
    } else if (surveyStep === 3) {
      if (!formData.intent) {
        errs.intent = "โปรดเลือกความจำนงของท่าน";
      }
    } else if (surveyStep === 4) {
      if (!isFeedbackOnly) {
        if (!formData.activityTypes || formData.activityTypes.length === 0) {
          errs.activityTypes = "โปรดเลือกรูปแบบกิจกรรมที่สนใจอย่างน้อย 1 รายการ";
        }
        if (!formData.experienceLevel) {
          errs.experienceLevel = "โปรดเลือกระดับประสบการณ์";
        }
        if (!formData.frequency) {
          errs.frequency = "โปรดเลือกความถี่ที่คาดว่าจะสะดวกเข้าร่วม";
        }
        if (!formData.preferredTimeSlots || formData.preferredTimeSlots.length === 0) {
          errs.preferredTimeSlots = "โปรดเลือกวันและช่วงเวลาที่สะดวกอย่างน้อย 1 ช่วงเวลา";
        }
      }
    } else if (surveyStep === 5) {
      if (!isFeedbackOnly) {
        if (!formData.supportRoles || formData.supportRoles.length === 0) {
          errs.supportRoles = "โปรดเลือกระดับความสนใจในการมีส่วนร่วมหรือเลือก 'สนใจเข้าร่วมกิจกรรมอย่างเดียว'";
        }
      }
    } else if (surveyStep === 6) {
      if (!isFeedbackOnly) {
        if (!formData.fullName.trim()) {
          errs.fullName = "โปรดกรอกชื่อ – นามสกุล";
        }
        const hasPhone = Boolean(formData.phone?.trim());
        const hasEmail = Boolean(formData.email?.trim());
        if (!hasPhone && !hasEmail) {
          errs.contactChannel = "โปรดระบุหมายเลขโทรศัพท์ หรืออีเมล อย่างน้อย 1 ช่องทางเพื่อการติดต่อ";
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;

    if (surveyStep === 3 && isFeedbackOnly) {
      // Skip Part 4 and Part 6 -> Go directly to Review (Step 7)
      setSurveyStep(7);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (surveyStep < 7) {
      setSurveyStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (surveyStep === 7 && isFeedbackOnly) {
      // If we jumped from Step 3 to Step 7, go back to Step 3
      setSurveyStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (surveyStep > 1) {
      setSurveyStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.acknowledgedDisclaimer) {
      setSubmitError("โปรดกดยืนยันการรับทราบสถานะร่างโครงการก่อนส่งแบบสำรวจ");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isFirebaseConfigured) {
        const result = await submitSurvey(formData);
        setSubmitDocId(result.docId);
        setSubmitSuccess(true);
      } else {
        // Fallback for trial demo mode when Firebase credentials are not yet injected
        await new Promise(r => setTimeout(r, 600));
        setSubmitDocId(`trial_preview_${Date.now()}`);
        setSubmitSuccess(true);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSurvey = () => {
    setFormData(INITIAL_FORM_DATA);
    setSurveyStep(1);
    setSubmitSuccess(false);
    setCurrentView('home');
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-['Sarabun',sans-serif]">
      {/* Official Top Notice Bar */}
      <aside aria-label="แถบประกาศสถานะโครงการ" className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
            <span>มหาวิทยาลัยนเรศวร • ระบบรับฟังความคิดเห็นบุคลากรเพื่อสวัสดิการและการกีฬา</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              กำหนดการรับฟัง: 8 – 31 ต.ค. 2569 (23.59 น.)
            </span>
          </div>
        </div>
      </aside>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo / Crest Badge (Compliant with "ห้ามใช้ตรามหาวิทยาลัยหากยังไม่มีไฟล์ตราที่ถูกต้อง") */}
          <div 
            onClick={() => { setCurrentView('home'); }} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-orange-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
              <div className="relative flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-black text-orange-400">NU</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-bold text-orange-700 uppercase tracking-wider">
                โครงการจัดตั้งชมรมฟุตบอลบุคลากร
              </div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                มหาวิทยาลัยนเรศวร
              </div>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsDraftModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-orange-600" />
              อ่านร่างโครงการฉบับเต็ม
            </button>

            {currentView === 'admin' ? (
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                หน้าหลัก
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('admin')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                title="สำหรับคณะกรรมการและผู้ดูแลระบบ"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">ผู้ดูแลระบบ</span>
              </button>
            )}

            {currentView !== 'survey' && (
              <button
                onClick={() => {
                  setCurrentView('survey');
                  setSurveyStep(1);
                  setSubmitSuccess(false);
                }}
                className="px-4 py-2 sm:py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
              >
                <span>ตอบแบบสำรวจ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Status Disclaimer Banner (MANDATORY EXACT TEXT) */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  สถานะโครงการและการสำรวจ
                </div>
                <div className="text-sm sm:text-base font-semibold text-amber-950 leading-relaxed">
                  “{STATUS_DISCLAIMER_TEXT}”
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800">
              <div className="relative z-10 max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/30 border border-orange-500/40 text-orange-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>รับฟังความคิดเห็นบุคลากร มหาวิทยาลัยนเรศวร</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                  แบบสำรวจความคิดเห็นโครงการจัดตั้งชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                  ขอเชิญบุคลากรมหาวิทยาลัยนเรศวรทุกท่านร่วมแสดงความคิดเห็น สำรวจความต้องการกิจกรรมฟุตบอลเพื่อสุขภาพ และร่วมแสดงความจำนงสมัครสมาชิก เพื่อเป็นกลไกส่งเสริมสุขภาพ สวัสดิการ และสร้างความสัมพันธ์ระหว่างหน่วยงาน
                </p>

                {/* Timeline Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-xs">
                    <span className="text-slate-400 block text-[11px]">เริ่มเตรียมการ</span>
                    <strong className="text-white">1 ตุลาคม 2569</strong>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-xs">
                    <span className="text-slate-400 block text-[11px]">เปิดรับความคิดเห็น</span>
                    <strong className="text-white">8 ตุลาคม 2569</strong>
                  </div>
                  <div className="bg-orange-500/20 backdrop-blur-xs p-3 rounded-xl border border-orange-500/30 text-xs">
                    <span className="text-orange-300 block text-[11px]">ปิดรับความคิดเห็น</span>
                    <strong className="text-orange-200">31 ต.ค. 2569 เวลา 23.59 น.</strong>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <button
                    onClick={() => {
                      setCurrentView('survey');
                      setSurveyStep(1);
                      setSubmitSuccess(false);
                    }}
                    className="px-7 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>เริ่มตอบแบบสำรวจ</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setIsDraftModalOpen(true)}
                    className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base border border-white/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-orange-400" />
                    <span>อ่านร่างโครงการฉบับเต็ม</span>
                  </button>
                </div>
              </div>

              {/* Decorative Subtle Accent */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
            </section>

            {/* 4 Core Objectives Grid */}
            <section className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  วัตถุประสงค์ของการรับฟังความคิดเห็นและสำรวจความต้องการ
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  ข้อมูลที่ได้จะถูกนำไปใช้วิเคราะห์เพื่อปรับปรุงร่างโครงการให้สอดคล้องกับบุคลากรทุกกลุ่ม
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-orange-300 transition-colors space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">รับฟังความคิดเห็นต่อร่าง</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    รวบรวมข้อคิดเห็น ข้อกังวล และข้อเสนอแนะต่อโครงสร้างกิจกรรมและการบริหารจัดการ
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-orange-300 transition-colors space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">สำรวจความต้องการกิจกรรม</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    สำรวจรูปแบบการเล่น ประสบการณ์ และช่วงเวลาที่สะดวก เพื่อจัดสรรพื้นที่และเวลาให้เกิดประโยชน์สูงสุด
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-orange-300 transition-colors space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">รับแสดงความจำนงสมาชิก</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    เปิดรับการแจ้งความประสงค์สมัครสมาชิกไว้ล่วงหน้าเพื่อประกอบการประเมินความต้องการจริง
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-orange-300 transition-colors space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">รับแจ้งความสนใจร่วมงาน</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    เปิดโอกาสให้ผู้สนใจร่วมเป็นคณะกรรมการหรือช่วยงานเฉพาะกิจเพื่อเตรียมความพร้อมด้านผู้ดำเนินงาน
                  </p>
                </div>
              </div>
            </section>

            {/* Initial Proposed Activity Formats */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                รูปแบบกิจกรรมเบื้องต้น (ตามร่างโครงการ)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-orange-600" />
                    ฟุตบอลเพื่อสุขภาพ & ทักษะ
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    เน้นการออกกำลังกายสม่ำเสมอ ฝึกทักษะการรับ–ส่งบอล การยิงประตู และการควบคุมลูก ไม่จำกัดทักษะเดิม
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-orange-600" />
                    ฟุตบอลสัมพันธ์ & สนามเล็ก
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    หมุนเวียนผู้เล่น เล่นแบบสนามเล็กหรือยืดหยุ่นตามจำนวนผู้เข้าร่วม เน้นความสนุกสนานและสร้างเครือข่าย
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    ความปลอดภัย & กติกาสุภาพ
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    อบอุ่นร่างกายอย่างเหมาะสม หลีกเลี่ยงการปะทะรุนแรง เคารพซึ่งกันและกัน และมีผู้ประสานงานประจำกิจกรรม
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
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
                {/* Survey Progress Bar */}
                <div className="bg-slate-900 text-white p-4 sm:p-6 border-b border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-orange-400">
                      ขั้นตอนที่ {surveyStep} {isFeedbackOnly && surveyStep === 7 ? '(ข้ามไปหน้าตรวจทาน)' : 'จาก 6'}
                    </span>
                    <span className="text-slate-400">
                      {Math.round(((isFeedbackOnly && surveyStep === 7 ? 6 : surveyStep) / 6) * 100)}%
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round(((isFeedbackOnly && surveyStep === 7 ? 6 : surveyStep) / 6) * 100))}%` }}
                    ></div>
                  </div>

                  {/* Breadcrumb Steps for Large Screens */}
                  <div className="hidden sm:flex items-center justify-between mt-3 text-[11px] text-slate-400 font-medium">
                    <span className={surveyStep === 1 ? 'text-orange-400 font-bold' : ''}>1. หน่วยงาน</span>
                    <span className={surveyStep === 2 ? 'text-orange-400 font-bold' : ''}>2. ความคิดเห็น</span>
                    <span className={surveyStep === 3 ? 'text-orange-400 font-bold' : ''}>3. ความจำนง</span>
                    <span className={surveyStep === 4 ? 'text-orange-400 font-bold' : isFeedbackOnly ? 'line-through text-slate-600' : ''}>4. กิจกรรม</span>
                    <span className={surveyStep === 5 ? 'text-orange-400 font-bold' : isFeedbackOnly ? 'line-through text-slate-600' : ''}>5. ช่วยงาน</span>
                    <span className={surveyStep === 6 ? 'text-orange-400 font-bold' : isFeedbackOnly ? 'line-through text-slate-600' : ''}>6. ข้อมูลติดต่อ</span>
                    <span className={surveyStep === 7 ? 'text-orange-400 font-bold' : ''}>ตรวจทาน</span>
                  </div>
                </div>

                {/* Form Step Body */}
                <div className="p-5 sm:p-8">
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
                          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          ย้อนกลับ
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCurrentView('home')}
                          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          กลับหน้าหลัก
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>
                          {surveyStep === 3 && isFeedbackOnly ? 'ข้ามไปยังหน้าตรวจทาน' : 'ถัดไป'}
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

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 text-center sm:text-left">
            <div>
              <div className="font-bold text-white text-sm">
                แบบสำรวจความคิดเห็นโครงการจัดตั้งชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร
              </div>
              <div className="text-slate-400 text-xs mt-0.5">
                เริ่มดำเนินการเตรียมจัดตั้ง 1 ตุลาคม 2569 • เปิดรับฟังความคิดเห็น 8–31 ตุลาคม 2569 เวลา 23.59 น.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDraftModalOpen(true)}
                className="text-xs text-orange-400 hover:text-orange-300 underline cursor-pointer"
              >
                อ่านร่างโครงการฉบับเต็ม
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 text-center sm:text-left">
            <p>
              {STATUS_DISCLAIMER_TEXT}
            </p>
            <p className="shrink-0">
              เขตเวลาประเทศไทย (UTC+07:00)
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
