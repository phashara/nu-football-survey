import React from 'react';
import { DepartmentSelector } from './DepartmentSelector';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { SurveyFormData } from '../types/survey';

interface Step1RespondentProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  errors: Record<string, string>;
}

export const Step1Respondent: React.FC<Step1RespondentProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-orange-600 tracking-wider uppercase">ส่วนที่ 1 จาก 6</span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">ข้อมูลสถานะและหน่วยงานผู้ตอบแบบสำรวจ</h2>
        <p className="text-sm text-slate-600 mt-1">
          เพื่อประโยชน์ในการวิเคราะห์การเข้าถึงของบุคลากรจากหลากหลายหน่วยงานภายในมหาวิทยาลัยนเรศวร
        </p>
      </div>

      {/* Employment Verification */}
      <div className={`p-4 rounded-xl border transition-all ${
        errors.isNUPersonnel 
          ? 'bg-red-50/50 border-red-300 ring-1 ring-red-400' 
          : formData.isNUPersonnel 
            ? 'bg-emerald-50/40 border-emerald-300' 
            : 'bg-slate-50 border-slate-200'
      }`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isNUPersonnel}
            onChange={(e) => updateFormData({ isNUPersonnel: e.target.checked })}
            className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 mt-0.5"
          />
          <div>
            <span className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              ข้าพเจ้ายืนยันว่าเป็นบุคลากรที่ปฏิบัติงานอยู่ในมหาวิทยาลัยนเรศวร ณ วันที่ตอบแบบสำรวจ <span className="text-red-500">*</span>
            </span>
            <p className="text-xs text-slate-600 mt-1">
              (สายวิชาการ, สายสนับสนุน, พนักงานมหาวิทยาลัย, หรือลูกจ้างทุกประเภทที่ปฏิบัติงานอยู่ในปัจจุบัน)
            </p>
          </div>
        </label>
        {errors.isNUPersonnel && (
          <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {errors.isNUPersonnel}
          </p>
        )}
      </div>

      {/* Department Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <DepartmentSelector
          selectedDeptId={formData.primaryDepartmentId}
          selectedDeptName={formData.primaryDepartmentName}
          customDeptName={formData.customDepartmentName}
          subDepartment={formData.subDepartment}
          onChange={(id, name, custom, sub) => {
            updateFormData({
              primaryDepartmentId: id,
              primaryDepartmentName: name,
              customDepartmentName: custom,
              subDepartment: sub
            });
          }}
          error={errors.primaryDepartmentId || errors.customDepartmentName}
        />
      </div>

      <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
        หมายเหตุ: ข้อมูลหน่วยงานจะถูกนำไปใช้วิเคราะห์การกระจายตัวของผู้สนใจในแต่ละคณะ/กอง โดยไม่นำไปใช้ระบุตัวตนรายบุคคล
      </div>
    </div>
  );
};
