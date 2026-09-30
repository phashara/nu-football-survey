import React from 'react';
import { ThumbsUp, CheckSquare, MessageSquare, AlertCircle } from 'lucide-react';
import type { SurveyFormData, AgreementLevel } from '../types/survey';
import { BENEFIT_OPTIONS } from '../types/survey';

interface Step2FeedbackProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  errors: Record<string, string>;
}

export const Step2Feedback: React.FC<Step2FeedbackProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const likertOptions: { value: AgreementLevel; label: string; desc: string; color: string }[] = [
    { value: 'strongly_agree', label: 'เห็นด้วยอย่างยิ่ง', desc: 'สนับสนุนโครงการจัดตั้งชมรมอย่างยิ่ง', color: 'hover:border-emerald-500 hover:bg-emerald-50/40 peer-checked:border-emerald-600 peer-checked:bg-emerald-50' },
    { value: 'agree', label: 'เห็นด้วย', desc: 'เห็นควรให้มีการจัดตั้งชมรมเพื่อบุคลากร', color: 'hover:border-blue-500 hover:bg-blue-50/40 peer-checked:border-blue-600 peer-checked:bg-blue-50' },
    { value: 'not_sure', label: 'ไม่แน่ใจ', desc: 'ยังไม่มีข้อมูลเพียงพอ หรือต้องการดูรายละเอียดเพิ่มเติม', color: 'hover:border-amber-500 hover:bg-amber-50/40 peer-checked:border-amber-600 peer-checked:bg-amber-50' },
    { value: 'disagree', label: 'ไม่เห็นด้วย', desc: 'อาจยังไม่มีความจำเป็นหรือยังไม่เหมาะสมในเวลานี้', color: 'hover:border-orange-500 hover:bg-orange-50/40 peer-checked:border-orange-600 peer-checked:bg-orange-50' },
    { value: 'strongly_disagree', label: 'ไม่เห็นด้วยอย่างยิ่ง', desc: 'ไม่เห็นชอบกับการจัดตั้งชมรม', color: 'hover:border-rose-500 hover:bg-rose-50/40 peer-checked:border-rose-600 peer-checked:bg-rose-50' },
  ];

  const handleBenefitToggle = (benefit: string) => {
    const current = formData.expectedBenefits || [];
    if (current.includes(benefit)) {
      updateFormData({ expectedBenefits: current.filter(b => b !== benefit) });
    } else {
      updateFormData({ expectedBenefits: [...current, benefit] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-orange-600 tracking-wider uppercase">ส่วนที่ 2 จาก 6</span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">ความคิดเห็นต่อร่างโครงการจัดตั้งชมรมฟุตบอล</h2>
        <p className="text-sm text-slate-600 mt-1">
          ท่านสามารถแสดงความคิดเห็นได้อย่างอิสระ โดยไม่จำเป็นต้องมีความประสงค์สมัครสมาชิก
        </p>
      </div>

      {/* Likert Scale */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-sm font-semibold text-slate-900">
          1. ท่านเห็นชอบด้วยกับการจัดตั้ง “ชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร” หรือไม่ <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-1 gap-2.5">
          {likertOptions.map((opt) => (
            <label
              key={opt.value}
              className="relative flex items-center p-3.5 rounded-xl border border-slate-200 cursor-pointer transition-all has-checked:border-orange-600 has-checked:bg-orange-50/30 has-checked:ring-1 has-checked:ring-orange-600 hover:border-slate-300"
            >
              <input
                type="radio"
                name="agreementLevel"
                value={opt.value}
                checked={formData.agreementLevel === opt.value}
                onChange={() => updateFormData({ agreementLevel: opt.value })}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300"
              />
              <div className="ml-3">
                <span className="text-sm font-bold text-slate-900 block">{opt.label}</span>
                <span className="text-xs text-slate-500">{opt.desc}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.agreementLevel && (
          <p className="text-xs text-red-600 font-medium">{errors.agreementLevel}</p>
        )}
      </div>

      {/* Expected Benefits */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-sm font-semibold text-slate-900">
          2. ประโยชน์ที่คาดว่าจะได้รับจากการจัดตั้งชมรม (เลือกได้หลายข้อ)
        </label>
        <p className="text-xs text-slate-500">เลือกข้อที่สอดคล้องกับมุมมองของท่าน</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {BENEFIT_OPTIONS.map((benefit) => {
            const isChecked = formData.expectedBenefits.includes(benefit);
            return (
              <label
                key={benefit}
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 cursor-pointer transition-all ${
                  isChecked
                    ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleBenefitToggle(benefit)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 mt-0.5 shrink-0"
                />
                <span>{benefit}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Concerns */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <label className="block text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          3. ข้อกังวล หรือประเด็นที่ควรระมัดระวัง (ถ้ามี)
        </label>
        <p className="text-xs text-slate-500">
          เช่น ความปลอดภัย อาการบาดเจ็บ การจัดสรรเวลา งบประมาณ หรือสถานที่
        </p>
        <textarea
          rows={3}
          value={formData.concerns}
          onChange={(e) => updateFormData({ concerns: e.target.value })}
          placeholder="ระบุข้อกังวลที่ท่านต้องการให้คณะผู้ประสานงานนำไปพิจารณา..."
          className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Additional Suggestions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <label className="block text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-slate-500" />
          4. ข้อเสนอแนะเพิ่มเติมต่อร่างโครงการ
        </label>
        <textarea
          rows={3}
          value={formData.suggestions}
          onChange={(e) => updateFormData({ suggestions: e.target.value })}
          placeholder="ความคิดเห็น ข้อเสนอแนะ หรือคำแนะนำที่เป็นประโยชน์ต่อการดำเนินงาน..."
          className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
        />
      </div>
    </div>
  );
};
