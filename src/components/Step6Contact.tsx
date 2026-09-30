import React from 'react';
import { User, Phone, Mail, ShieldCheck, Lock } from 'lucide-react';
import type { SurveyFormData } from '../types/survey';

interface Step6ContactProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  errors: Record<string, string>;
}

export const Step6Contact: React.FC<Step6ContactProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-orange-600 tracking-wider uppercase">ส่วนที่ 6 จาก 6</span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">ข้อมูลสำหรับติดต่อและประสานงาน</h2>
        <p className="text-sm text-slate-600 mt-1">
          สำหรับผู้ที่ประสงค์สมัครสมาชิกหรือขอรับข่าวสาร เพื่อใช้แจ้งขั้นตอนยืนยันและนัดหมายกิจกรรมต่อไป
        </p>
      </div>

      {/* Strict Privacy Guarantee Box */}
      <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-xs sm:text-sm text-slate-700 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Lock className="w-4 h-4 text-orange-600" />
          <span>นโยบายการคุ้มครองข้อมูลส่วนบุคคลตามข้อกำหนดโครงการ</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          ระบบจัดเก็บข้อมูลติดต่อเท่าที่จำเป็นสำหรับการประสานงานชมรมเท่านั้น 
          <strong> ไม่มีการขอเลขประจำตัวประชาชน วันเดือนปีเกิด ที่อยู่ หรือประวัติสุขภาพโดยละเอียด</strong> และข้อมูลติดต่อนี้จะถูกจัดเก็บแยกต่างหากจากข้อมูลความคิดเห็นทางสถิติเพื่อความปลอดภัยสูงสุด
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-orange-600" />
            ชื่อ – นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            placeholder="เช่น นายสมชาย ใจดี"
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-900 focus:outline-hidden transition-colors ${
              errors.fullName 
                ? 'border-red-500 ring-1 ring-red-500' 
                : 'border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
            }`}
          />
          {errors.fullName && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* Contact info notice: at least one of phone or email */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-800 mb-3">
            ช่องทางติดต่อ (กรุณาระบุอย่างน้อยหนึ่งช่องทาง: โทรศัพท์ หรือ อีเมล) <span className="text-red-500">*</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                หมายเลขโทรศัพท์ (มือถือ หรือเบอร์โต๊ะทำงาน)
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="เช่น 081-234-5678 หรือ 055-96xxxx"
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl text-slate-900 focus:outline-hidden transition-colors ${
                  errors.contactChannel 
                    ? 'border-red-400 ring-1 ring-red-400' 
                    : 'border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                อีเมล (อีเมลมหาวิทยาลัย @nu.ac.th หรืออีเมลส่วนตัว)
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="เช่น somchai@nu.ac.th"
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl text-slate-900 focus:outline-hidden transition-colors ${
                  errors.contactChannel 
                    ? 'border-red-400 ring-1 ring-red-400' 
                    : 'border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                }`}
              />
            </div>
          </div>

          {errors.contactChannel && (
            <p className="text-xs text-red-600 mt-2 font-medium">{errors.contactChannel}</p>
          )}
        </div>
      </div>
    </div>
  );
};
