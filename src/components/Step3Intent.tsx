import React from 'react';
import { UserCheck, Bell, MessageCircle, AlertCircle } from 'lucide-react';
import type { SurveyFormData, IntentType } from '../types/survey';

interface Step3IntentProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  errors: Record<string, string>;
}

export const Step3Intent: React.FC<Step3IntentProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const intentOptions: {
    type: IntentType;
    title: string;
    description: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      type: 'join_member',
      title: 'ประสงค์สมัครสมาชิก',
      description: 'มีความประสงค์เข้าร่วมกิจกรรมของชมรม และยินดีแสดงความจำนงไว้ล่วงหน้า (ระบบจะสอบถามความต้องการกิจกรรมและข้อมูลติดต่อ)',
      badge: 'แสดงความจำนง',
      icon: UserCheck
    },
    {
      type: 'receive_news',
      title: 'ประสงค์รับข้อมูลข่าวสารก่อนตัดสินใจ',
      description: 'สนใจกิจกรรม แต่ขอติดตามความคืบหน้า รายละเอียดวันเวลา และค่าใช้จ่ายก่อนยืนยันการเป็นสมาชิก (ระบบจะสอบถามความต้องการกิจกรรมและช่องทางติดต่อ)',
      badge: 'ติดตามข่าวสาร',
      icon: Bell
    },
    {
      type: 'feedback_only',
      title: 'ประสงค์แสดงความคิดเห็นเพียงอย่างเดียว',
      description: 'ต้องการมีส่วนร่วมในการแสดงความคิดเห็นต่อโครงการ โดยยังไม่ประสงค์เข้าร่วมกิจกรรมหรือสมัครสมาชิก (ระบบจะข้ามส่วนกิจกรรมและข้อมูลติดต่อ ไปยังหน้าตรวจทานทันที)',
      badge: 'แสดงความคิดเห็นเท่านั้น',
      icon: MessageCircle
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-orange-600 tracking-wider uppercase">ส่วนที่ 3 จาก 6</span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">ความจำนงต่อการเข้าร่วมและการสมัครสมาชิก</h2>
        <p className="text-sm text-slate-600 mt-1">
          โปรดเลือกความจำนงของท่านตามความพร้อมและระดับความสนใจในปัจจุบัน
        </p>
      </div>

      {/* Official Notice */}
      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-xs sm:text-sm text-amber-950 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-900">ข้อความชี้แจงสถานะ: </span>
          การแสดงความจำนงครั้งนี้เป็นการแจ้งความประสงค์ไว้ล่วงหน้าเพื่อประกอบการเตรียมจัดตั้ง ยังไม่ถือเป็นการยืนยันสมาชิก และไม่มีข้อผูกมัดทางการเงินใด ๆ ในระยะนี้
        </div>
      </div>

      {/* Options Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {intentOptions.map((opt) => {
          const isSelected = formData.intent === opt.type;
          const Icon = opt.icon;

          return (
            <label
              key={opt.type}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="intent"
                value={opt.type}
                checked={isSelected}
                onChange={() => updateFormData({ intent: opt.type })}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-orange-600" />
                    {opt.title}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {errors.intent && (
        <p className="text-xs text-red-600 font-medium">{errors.intent}</p>
      )}

      {/* Helper text if feedback only */}
      {formData.intent === 'feedback_only' && (
        <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900">
          💡 เมื่อท่านกด <strong>“ถัดไป”</strong> ระบบจะข้ามคำถามเกี่ยวกับความต้องการกิจกรรมและความสนใจร่วมเป็นกรรมการ รวมถึงข้อมูลติดต่อ และนำท่านไปยังหน้าตรวจทานเพื่อยืนยันความคิดเห็นทันที
        </div>
      )}
    </div>
  );
};
