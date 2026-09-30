import React from 'react';
import { Calendar, Clock, Activity, AlertCircle } from 'lucide-react';
import type { SurveyFormData, ExperienceLevel } from '../types/survey';
import { ACTIVITY_OPTIONS, OBSTACLE_OPTIONS, TIME_SLOT_OPTIONS } from '../types/survey';

interface Step4ActivitiesProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  errors: Record<string, string>;
}

export const Step4Activities: React.FC<Step4ActivitiesProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const handleActivityToggle = (act: string) => {
    const current = formData.activityTypes || [];
    if (current.includes(act)) {
      updateFormData({ activityTypes: current.filter(a => a !== act) });
    } else {
      updateFormData({ activityTypes: [...current, act] });
    }
  };

  const handleObstacleToggle = (obs: string) => {
    const current = formData.obstacles || [];
    if (current.includes(obs)) {
      updateFormData({ obstacles: current.filter(o => o !== obs) });
    } else {
      updateFormData({ obstacles: [...current, obs] });
    }
  };

  const handleTimeSlotToggle = (slotId: string) => {
    const current = formData.preferredTimeSlots || [];
    if (current.includes(slotId)) {
      updateFormData({ preferredTimeSlots: current.filter(s => s !== slotId) });
    } else {
      updateFormData({ preferredTimeSlots: [...current, slotId] });
    }
  };

  const expLevels: { value: ExperienceLevel; label: string; desc: string }[] = [
    { value: 'beginner', label: 'ผู้เริ่มต้น / ไม่เคยเล่นมาก่อน', desc: 'ต้องการเน้นออกกำลังกายเบา ๆ เรียนรู้ทักษะพื้นฐาน' },
    { value: 'returning', label: 'เคยเล่นในอดีต แต่หยุดไปนาน', desc: 'ต้องการฟื้นฟูสภาพร่างกายและปรับตัว ค่อย ๆ เพิ่มระดับ' },
    { value: 'regular', label: 'เล่นเป็นประจำ / มีประสบการณ์ต่อเนื่อง', desc: 'มีความพร้อมในการเล่นเกมและเข้าใจตำแหน่งการเล่น' },
  ];

  const frequencies = [
    { value: 'weekly_1_2', label: 'สัปดาห์ละ 1–2 ครั้ง' },
    { value: 'biweekly', label: 'ทุก 2 สัปดาห์ (เดือนละ 2 ครั้ง)' },
    { value: 'monthly_1_2', label: 'เดือนละ 1 ครั้ง' },
    { value: 'occasionally', label: 'เป็นครั้งคราวเมื่อเวลาสะดวก' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-orange-600 tracking-wider uppercase">ส่วนที่ 4 จาก 6</span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">ความต้องการรูปแบบกิจกรรมและช่วงเวลาที่สะดวก</h2>
        <p className="text-sm text-slate-600 mt-1">
          ข้อมูลนี้ใช้เพื่อคำนวณจำนวนผู้ที่สะดวกพร้อมกัน และออกแบบกิจกรรมให้เหมาะกับสมาชิกทุกกลุ่ม
        </p>
      </div>

      {/* 1. Preferred Activity Types */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-sm font-semibold text-slate-900">
          1. รูปแบบกิจกรรมที่ท่านสนใจเข้าร่วม (เลือกได้หลายข้อ) <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ACTIVITY_OPTIONS.map((activity) => {
            const isChecked = formData.activityTypes.includes(activity);
            return (
              <label
                key={activity}
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 cursor-pointer transition-all ${
                  isChecked
                    ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleActivityToggle(activity)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                />
                <span>{activity}</span>
              </label>
            );
          })}
        </div>
        {errors.activityTypes && (
          <p className="text-xs text-red-600 font-medium">{errors.activityTypes}</p>
        )}
      </div>

      {/* 2. Football Experience Level */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-sm font-semibold text-slate-900">
          2. ระดับประสบการณ์ในการเล่นฟุตบอลของท่าน <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {expLevels.map((lvl) => (
            <label
              key={lvl.value}
              className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                formData.experienceLevel === lvl.value
                  ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="experienceLevel"
                value={lvl.value}
                checked={formData.experienceLevel === lvl.value}
                onChange={() => updateFormData({ experienceLevel: lvl.value })}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300 mt-0.5"
              />
              <div>
                <span className="text-sm font-bold text-slate-900 block">{lvl.label}</span>
                <span className="text-xs text-slate-500">{lvl.desc}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.experienceLevel && (
          <p className="text-xs text-red-600 font-medium">{errors.experienceLevel}</p>
        )}
      </div>

      {/* 3. Desired Frequency */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-sm font-semibold text-slate-900">
          3. ความถี่ที่คาดว่าจะสามารถเข้าร่วมกิจกรรมได้ <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {frequencies.map((freq) => (
            <label
              key={freq.value}
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                formData.frequency === freq.value
                  ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 font-semibold text-orange-950'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={freq.value}
                checked={formData.frequency === freq.value}
                onChange={() => updateFormData({ frequency: freq.value })}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300"
              />
              <span className="text-sm">{freq.label}</span>
            </label>
          ))}
        </div>
        {errors.frequency && (
          <p className="text-xs text-red-600 font-medium">{errors.frequency}</p>
        )}
      </div>

      {/* 4. Day & Time Pairs (Crucial for Availability Heatmap / Overlap) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <label className="block text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-600" />
              4. วันและช่วงเวลาที่ท่านสะดวกเข้าร่วม (เลือกได้มากกว่าหนึ่งช่วง) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบใช้คู่วันและเวลาเพื่อวิเคราะห์ช่วงเวลาที่มีบุคลากรสะดวกพร้อมกันมากที่สุดสำหรับการจัดสรรสนาม
            </p>
          </div>
          {formData.preferredTimeSlots.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 shrink-0">
              เลือกแล้ว {formData.preferredTimeSlots.length} ช่วง
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {TIME_SLOT_OPTIONS.map((slot) => {
            const isSelected = formData.preferredTimeSlots.includes(slot.id);
            return (
              <label
                key={slot.id}
                className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold ring-1 ring-orange-500 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleTimeSlotToggle(slot.id)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 mt-0.5 shrink-0"
                />
                <div>
                  <div className="text-sm font-semibold">{slot.dayTh}</div>
                  <div className="text-[11px] text-slate-500 font-normal">{slot.timeSlotTh}</div>
                </div>
              </label>
            );
          })}
        </div>
        {errors.preferredTimeSlots && (
          <p className="text-xs text-red-600 font-medium">{errors.preferredTimeSlots}</p>
        )}
      </div>

      {/* 5. Obstacles */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-sm font-semibold text-slate-900">
          5. อุปสรรคหรือข้อจำกัดที่อาจทำให้ท่านไม่สะดวกเข้าร่วมกิจกรรม (เลือกได้หลายข้อ)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {OBSTACLE_OPTIONS.map((obs) => {
            const isChecked = formData.obstacles.includes(obs);
            return (
              <label
                key={obs}
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 cursor-pointer transition-all ${
                  isChecked
                    ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleObstacleToggle(obs)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 mt-0.5 shrink-0"
                />
                <span>{obs}</span>
              </label>
            );
          })}
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            อุปสรรคอื่น ๆ เพิ่มเติม (ถ้ามี)
          </label>
          <input
            type="text"
            value={formData.otherObstacle}
            onChange={(e) => updateFormData({ otherObstacle: e.target.value })}
            placeholder="ระบุข้อจำกัดอื่น ๆ ของท่าน..."
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>
    </div>
  );
};
