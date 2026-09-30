import React from 'react';
import { CheckCircle2, AlertCircle, Home, BookOpen, ShieldCheck } from 'lucide-react';
import type { IntentType } from '../types/survey';
import { STATUS_DISCLAIMER_TEXT } from '../utils/schedule';

interface SubmissionSuccessProps {
  intent: IntentType | '';
  isExperimentalMode?: boolean;
  docId?: string;
  onReset: () => void;
  onOpenDraft: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  intent,
  isExperimentalMode = false,
  docId,
  onReset,
  onOpenDraft
}) => {
  const isFeedbackOnly = intent === 'feedback_only';
  
  // Specific title based on intent
  const title = isFeedbackOnly 
    ? "ได้รับความคิดเห็นแล้ว" 
    : "ได้รับการแสดงความจำนงแล้ว";

  const description = isFeedbackOnly
    ? "ขอขอบคุณสำหรับความคิดเห็นและข้อเสนอแนะอันมีค่า คณะผู้ประสานงานจะนำข้อมูลไปปรับปรุงร่างโครงการต่อไป"
    : "ขอขอบคุณสำหรับการแสดงความจำนง คณะผู้ประสานงานได้บันทึกความประสงค์ของท่านเรียบร้อยแล้ว";

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 text-center max-w-2xl mx-auto my-8 animate-fadeIn">
      {/* Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
      </div>

      {/* Main Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        {title}
      </h2>
      <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
        {description}
      </p>

      {/* Test / Experimental Mode Alert */}
      {isExperimentalMode && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 text-left flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>โหมดทดลอง (Demo / Preview Mode):</strong> ระบบกำลังทำงานในโหมดทดสอบ ข้อมูลถูกประมวลผลบนเครื่องทดสอบ กรุณาตั้งค่าสภาพแวดล้อม Firebase เมื่อต้องการใช้งานจริง
          </div>
        </div>
      )}

      {/* Reiteration of Draft Status */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-left space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span>ข้อความเน้นย้ำสถานะโครงการ</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {STATUS_DISCLAIMER_TEXT}
        </p>
        <p className="text-xs text-slate-500 pt-1 border-t border-slate-200">
          กำหนดการปิดรับความคิดเห็น: 31 ตุลาคม 2569 เวลา 23.59 น. (เวลาประเทศไทย)
        </p>
        {docId && (
          <p className="text-[11px] text-slate-400 font-mono">
            เลขอ้างอิงการตอบแบบสำรวจ: {docId}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          กลับสู่หน้าหลัก
        </button>

        <button
          onClick={onOpenDraft}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-orange-600" />
          อ่านร่างโครงการฉบับเต็ม
        </button>
      </div>
    </div>
  );
};
