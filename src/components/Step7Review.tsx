import React from 'react';
import { CheckCircle, AlertTriangle, Send, Loader2, Edit3, ShieldAlert } from 'lucide-react';
import type { SurveyFormData } from '../types/survey';
import { TIME_SLOT_OPTIONS } from '../types/survey';

interface Step7ReviewProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onGoToStep: (stepNumber: number) => void;
  submitError?: string | null;
}

export const Step7Review: React.FC<Step7ReviewProps> = ({
  formData,
  updateFormData,
  onSubmit,
  isSubmitting,
  onGoToStep,
  submitError
}) => {
  const agreementMap: Record<string, string> = {
    strongly_agree: "เห็นด้วยอย่างยิ่ง",
    agree: "เห็นด้วย",
    not_sure: "ไม่แน่ใจ",
    disagree: "ไม่เห็นด้วย",
    strongly_disagree: "ไม่เห็นด้วยอย่างยิ่ง"
  };

  const intentMap: Record<string, string> = {
    join_member: "ประสงค์สมัครสมาชิก",
    receive_news: "ประสงค์รับข้อมูลข่าวสารก่อนตัดสินใจ",
    feedback_only: "ประสงค์แสดงความคิดเห็นเพียงอย่างเดียว"
  };

  const experienceMap: Record<string, string> = {
    beginner: "ผู้เริ่มต้น / ไม่เคยเล่นมาก่อน",
    returning: "เคยเล่นในอดีต แต่หยุดไปนาน",
    regular: "เล่นเป็นประจำ / มีประสบการณ์ต่อเนื่อง"
  };

  const frequencyMap: Record<string, string> = {
    weekly_1_2: "สัปดาห์ละ 1–2 ครั้ง",
    biweekly: "ทุก 2 สัปดาห์ (เดือนละ 2 ครั้ง)",
    monthly_1_2: "เดือนละ 1 ครั้ง",
    occasionally: "เป็นครั้งคราวเมื่อเวลาสะดวก"
  };

  const timeSlotMap = new Map(TIME_SLOT_OPTIONS.map(t => [t.id, t.label]));

  const isFeedbackOnly = formData.intent === 'feedback_only';

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-orange-600 tracking-wider uppercase">หน้าตรวจทานก่อนส่ง</span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">ตรวจสอบความถูกต้องของข้อมูล</h2>
        <p className="text-sm text-slate-600 mt-1">
          โปรดตรวจสอบคำตอบของท่าน หากต้องการแก้ไขส่วนใด สามารถกดปุ่มแก้ไขเพื่อย้อนกลับไปปรับปรุงได้
        </p>
      </div>

      {/* Group 1: Respondent info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">1</span>
            ข้อมูลสถานะและหน่วยงาน
          </h3>
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 p-1 hover:bg-orange-50 rounded-md transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            แก้ไข
          </button>
        </div>
        <div className="text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
          <div>
            <span className="text-slate-400 block text-xs">สถานะบุคลากร:</span>
            <span className="font-semibold text-emerald-700">ยืนยันการเป็นบุคลากรมหาวิทยาลัยนเรศวร</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">หน่วยงานต้นสังกัดหลัก:</span>
            <span className="font-semibold text-slate-900">
              {formData.primaryDepartmentName}
              {formData.customDepartmentName ? ` (${formData.customDepartmentName})` : ''}
            </span>
          </div>
          {formData.subDepartment && (
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-xs">หน่วยงานย่อย:</span>
              <span className="text-slate-800">{formData.subDepartment}</span>
            </div>
          )}
        </div>
      </div>

      {/* Group 2: Feedback */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">2</span>
            ความคิดเห็นต่อร่างโครงการ
          </h3>
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 p-1 hover:bg-orange-50 rounded-md transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            แก้ไข
          </button>
        </div>
        <div className="text-xs sm:text-sm space-y-2 text-slate-700">
          <div>
            <span className="text-slate-400 block text-xs">ระดับความเห็นชอบ:</span>
            <span className="font-bold text-slate-900 text-base text-orange-800">
              {agreementMap[formData.agreementLevel] || formData.agreementLevel}
            </span>
          </div>
          {formData.expectedBenefits.length > 0 && (
            <div>
              <span className="text-slate-400 block text-xs">ประโยชน์ที่คาดว่าจะได้รับ:</span>
              <ul className="list-disc pl-5 space-y-0.5 text-xs text-slate-800">
                {formData.expectedBenefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
          {formData.concerns && (
            <div>
              <span className="text-slate-400 block text-xs">ข้อกังวล:</span>
              <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-0.5">
                {formData.concerns}
              </p>
            </div>
          )}
          {formData.suggestions && (
            <div>
              <span className="text-slate-400 block text-xs">ข้อเสนอแนะ:</span>
              <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-0.5">
                {formData.suggestions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Group 3: Intent */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">3</span>
            ความจำนงต่อการเข้าร่วม
          </h3>
          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 p-1 hover:bg-orange-50 rounded-md transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            แก้ไข
          </button>
        </div>
        <div className="text-xs sm:text-sm">
          <span className="text-slate-400 block text-xs">ความจำนง:</span>
          <span className="font-bold text-slate-900 text-sm sm:text-base">
            {intentMap[formData.intent] || formData.intent}
          </span>
          {isFeedbackOnly && (
            <p className="text-xs text-slate-500 mt-1 italic">
              (เลือกแสดงความคิดเห็นเพียงอย่างเดียว จึงไม่มีข้อมูลกิจกรรมและข้อมูลติดต่อ)
            </p>
          )}
        </div>
      </div>

      {/* Group 4 & 5: Activities & Support (Only if NOT feedback only) */}
      {!isFeedbackOnly && (
        <>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">4</span>
                ความต้องการกิจกรรมและเวลา
              </h3>
              <button
                type="button"
                onClick={() => onGoToStep(4)}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 p-1 hover:bg-orange-50 rounded-md transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                แก้ไข
              </button>
            </div>
            <div className="text-xs sm:text-sm space-y-2 text-slate-700">
              <div>
                <span className="text-slate-400 block text-xs">รูปแบบกิจกรรม:</span>
                <span className="text-slate-900 font-medium">
                  {formData.activityTypes.join(', ') || '-'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-xs">ระดับประสบการณ์:</span>
                  <span className="text-slate-900">{experienceMap[formData.experienceLevel] || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">ความถี่ที่ต้องการ:</span>
                  <span className="text-slate-900">{frequencyMap[formData.frequency] || '-'}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">ช่วงวันและเวลาที่สะดวก:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.preferredTimeSlots.map(slotId => (
                    <span key={slotId} className="px-2.5 py-1 bg-orange-50 text-orange-900 text-xs rounded-lg border border-orange-200 font-medium">
                      {timeSlotMap.get(slotId) || slotId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">5</span>
                ความสนใจร่วมดำเนินงาน
              </h3>
              <button
                type="button"
                onClick={() => onGoToStep(5)}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 p-1 hover:bg-orange-50 rounded-md transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                แก้ไข
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 space-y-1.5">
              <div>
                <span className="text-slate-400 block text-xs">บทบาทที่สนใจ:</span>
                <span className="font-semibold text-slate-900">
                  {formData.supportRoles.map(r => {
                    if (r === 'committee') return 'สนใจร่วมเป็นคณะกรรมการ';
                    if (r === 'occasional_support') return 'สนใจสนับสนุนการจัดกิจกรรมเป็นครั้งคราว';
                    return 'สนใจเข้าร่วมกิจกรรมอย่างเดียว';
                  }).join(', ') || '-'}
                </span>
              </div>
              {formData.interestedAreas.length > 0 && (
                <div>
                  <span className="text-slate-400 block text-xs">ด้านงานที่สนใจสนับสนุน:</span>
                  <span className="text-slate-800">{formData.interestedAreas.join(', ')}</span>
                  {formData.otherAreaDescription && ` (${formData.otherAreaDescription})`}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">6</span>
                ข้อมูลติดต่อ
              </h3>
              <button
                type="button"
                onClick={() => onGoToStep(6)}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 p-1 hover:bg-orange-50 rounded-md transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                แก้ไข
              </button>
            </div>
            <div className="text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400 block text-xs">ชื่อ-นามสกุล:</span>
                <span className="font-semibold text-slate-900">{formData.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">โทรศัพท์:</span>
                <span className="text-slate-900">{formData.phone || '-'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-xs">อีเมล:</span>
                <span className="text-slate-900">{formData.email || '-'}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mandatory Acknowledgment Checkbox */}
      <div className="p-4 bg-orange-50/70 border-2 border-orange-300 rounded-2xl space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acknowledgedDisclaimer}
            onChange={(e) => updateFormData({ acknowledgedDisclaimer: e.target.checked })}
            className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-slate-300 rounded mt-0.5"
          />
          <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
            “ข้าพเจ้ารับทราบว่าการตอบแบบสำรวจนี้เป็นการแสดงความคิดเห็นหรือการแสดงความจำนงเบื้องต้น ยังไม่ถือเป็นการยืนยันสมาชิกหรือการแต่งตั้งคณะกรรมการ” <span className="text-red-500">*</span>
          </div>
        </label>
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-xs sm:text-sm text-red-700 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>{submitError}</div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!formData.acknowledgedDisclaimer || isSubmitting}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
            formData.acknowledgedDisclaimer && !isSubmitting
              ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer active:scale-98'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>กำลังบันทึกข้อมูลไปยังระบบ...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>ยืนยันการส่งแบบสำรวจ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
