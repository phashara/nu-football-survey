import React from 'react';
import { Users, HeartHandshake, ShieldAlert, Award } from 'lucide-react';
import type { SurveyFormData } from '../types/survey';
import { SUPPORT_AREAS } from '../types/survey';

interface Step5SupportProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  errors: Record<string, string>;
}

export const Step5Support: React.FC<Step5SupportProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const currentRoles = formData.supportRoles || [];

  // Mutually exclusive logic:
  // "participate_only" cannot be selected with "committee" or "occasional_support"
  const handleRoleToggle = (role: 'committee' | 'occasional_support' | 'participate_only') => {
    if (role === 'participate_only') {
      // Selecting participate_only clears any other roles and interested areas
      if (currentRoles.includes('participate_only')) {
        updateFormData({ supportRoles: [] });
      } else {
        updateFormData({ 
          supportRoles: ['participate_only'],
          interestedAreas: [],
          otherAreaDescription: ''
        });
      }
    } else {
      // Selecting committee or occasional_support removes participate_only
      let updated = currentRoles.filter(r => r !== 'participate_only');
      if (updated.includes(role)) {
        updated = updated.filter(r => r !== role);
      } else {
        updated = [...updated, role];
      }
      updateFormData({ supportRoles: updated });
    }
  };

  const handleAreaToggle = (area: string) => {
    const current = formData.interestedAreas || [];
    if (current.includes(area)) {
      updateFormData({ interestedAreas: current.filter(a => a !== area) });
    } else {
      updateFormData({ interestedAreas: [...current, area] });
    }
  };

  const isAssisting = currentRoles.includes('committee') || currentRoles.includes('occasional_support');

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-orange-600 tracking-wider uppercase">ส่วนที่ 5 จาก 6</span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">ความสนใจร่วมดำเนินงานและสนับสนุนกิจกรรมชมรม</h2>
        <p className="text-sm text-slate-600 mt-1">
          การสำรวจนี้มีวัตถุประสงค์เพื่อประเมินความพร้อมด้านกำลังคนและผู้ประสานงานในระยะเตรียมการจัดตั้ง
        </p>
      </div>

      {/* Official Clarification */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-900">คำชี้แจงสำคัญ: </span>
          การแจ้งความสนใจร่วมเป็นคณะกรรมการหรือร่วมสนับสนุนการจัดกิจกรรม <strong>เป็นการรวบรวมผู้พร้อมมีส่วนร่วมในระยะเตรียมการจัดตั้ง ยังไม่ถือเป็นการแต่งตั้งหรือมอบหมายตำแหน่งอย่างเป็นทางการ</strong> โดยจะมีการประสานงานและแจ้งแนวทางในลำดับถัดไป
        </div>
      </div>

      {/* Role Selection */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-sm font-semibold text-slate-900">
          1. ระดับความสนใจในการมีส่วนร่วมบริหารหรือสนับสนุนการดำเนินงาน <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500">
          (หมายเหตุ: ตัวเลือก "สนใจเข้าร่วมกิจกรรมอย่างเดียว" ไม่สามารถเลือกพร้อมกับตัวเลือกช่วยงานอื่นได้)
        </p>

        <div className="grid grid-cols-1 gap-3">
          {/* Option 1: Committee */}
          <label
            className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
              currentRoles.includes('committee')
                ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={currentRoles.includes('committee')}
              onChange={() => handleRoleToggle('committee')}
              className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-slate-300 rounded mt-0.5"
            />
            <div>
              <span className="font-bold text-sm text-slate-900 block flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-600" />
                สนใจร่วมเป็นคณะกรรมการชมรม
              </span>
              <span className="text-xs text-slate-500">
                พร้อมร่วมวางแผน ประสานงานมหาวิทยาลัย หรือร่วมบริหารจัดการในระยะเตรียมการจัดตั้ง
              </span>
            </div>
          </label>

          {/* Option 2: Occasional Support */}
          <label
            className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
              currentRoles.includes('occasional_support')
                ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={currentRoles.includes('occasional_support')}
              onChange={() => handleRoleToggle('occasional_support')}
              className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-slate-300 rounded mt-0.5"
            />
            <div>
              <span className="font-bold text-sm text-slate-900 block flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-orange-600" />
                สนใจสนับสนุนการจัดกิจกรรมเป็นครั้งคราว
              </span>
              <span className="text-xs text-slate-500">
                ยินดีช่วยงานเฉพาะกิจ เช่น วันจัดกิจกรรม ฟุตบอลสัมพันธ์ หรือช่วยดูแลอุปกรณ์ โดยไม่ต้องเป็นกรรมการประจำ
              </span>
            </div>
          </label>

          {/* Option 3: Participate Only (Exclusive) */}
          <label
            className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
              currentRoles.includes('participate_only')
                ? 'border-slate-700 bg-slate-100 ring-1 ring-slate-700'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={currentRoles.includes('participate_only')}
              onChange={() => handleRoleToggle('participate_only')}
              className="w-5 h-5 text-slate-800 focus:ring-slate-700 border-slate-300 rounded mt-0.5"
            />
            <div>
              <span className="font-bold text-sm text-slate-900 block flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-600" />
                สนใจเข้าร่วมกิจกรรมอย่างเดียว
              </span>
              <span className="text-xs text-slate-500">
                ประสงค์ร่วมเล่นฟุตบอลหรือออกกำลังกาย โดยยังไม่สะดวกรับผิดชอบงานบริหารหรือช่วยจัดกิจกรรม
              </span>
            </div>
          </label>
        </div>

        {errors.supportRoles && (
          <p className="text-xs text-red-600 font-medium">{errors.supportRoles}</p>
        )}
      </div>

      {/* Areas of interest (Visible ONLY if Committee or Occasional Support is selected) */}
      {isAssisting && (
        <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-xs space-y-3 animate-fadeIn">
          <label className="block text-sm font-semibold text-slate-900">
            2. ด้านงานที่ท่านสนใจหรือมีความถนัดในการร่วมสนับสนุน (เลือกได้หลายข้อ)
          </label>
          <p className="text-xs text-slate-500">
            อ้างอิงตามกรอบหน้าที่บริหารเบื้องต้นในร่างโครงการ
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {SUPPORT_AREAS.map((area) => {
              const isChecked = formData.interestedAreas.includes(area);
              return (
                <label
                  key={area}
                  className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 cursor-pointer transition-all ${
                    isChecked
                      ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleAreaToggle(area)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                  />
                  <span>{area}</span>
                </label>
              );
            })}
          </div>

          {formData.interestedAreas.includes('อื่น ๆ') && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                โปรดระบุด้านงานอื่น ๆ ที่ท่านสนใจ
              </label>
              <input
                type="text"
                value={formData.otherAreaDescription || ''}
                onChange={(e) => updateFormData({ otherAreaDescription: e.target.value })}
                placeholder="เช่น การถ่ายภาพ, การปฐมพยาบาลเบื้องต้น..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
