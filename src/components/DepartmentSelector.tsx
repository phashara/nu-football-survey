import React, { useState, useMemo } from 'react';
import { Search, Building2, Check, HelpCircle } from 'lucide-react';
import { 
  OFFICIAL_DEPARTMENTS, 
  getGroupedDepartments, 
  OTHER_DEPARTMENT_CUSTOM_ID, 
  OTHER_DEPARTMENT_CUSTOM_LABEL,
  DepartmentItem
} from '../data/departments';

interface DepartmentSelectorProps {
  selectedDeptId: string;
  selectedDeptName: string;
  customDeptName?: string;
  subDepartment?: string;
  onChange: (deptId: string, deptName: string, customName?: string, subDept?: string) => void;
  error?: string;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  selectedDeptId,
  selectedDeptName,
  customDeptName = '',
  subDepartment = '',
  onChange,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const grouped = useMemo(() => getGroupedDepartments(), []);

  // Filtered list based on search
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();
    return OFFICIAL_DEPARTMENTS.filter(
      d => d.nameTh.toLowerCase().includes(term) || (d.nameEn && d.nameEn.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  const handleSelect = (dept: DepartmentItem) => {
    onChange(dept.id, dept.nameTh, customDeptName, subDepartment);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSelectCustom = () => {
    onChange(OTHER_DEPARTMENT_CUSTOM_ID, OTHER_DEPARTMENT_CUSTOM_LABEL, customDeptName, subDepartment);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-1.5">
          หน่วยงานต้นสังกัดหลักที่ปฏิบัติงานอยู่ <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          โปรดเลือกหน่วยงานที่ท่านสังกัดปฏิบัติงานจริง (ไม่ใช่สภา สมาคม หรือชมรม)
        </p>

        {/* Selected Department Display or Search Trigger */}
        <div className="relative">
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border text-sm flex items-center justify-between cursor-pointer transition-all ${
              error 
                ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500' 
                : isOpen 
                  ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white' 
                  : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
              {selectedDeptName ? (
                <span className="font-medium text-slate-900 truncate">{selectedDeptName}</span>
              ) : (
                <span className="text-slate-400">กดเพื่อค้นหาหรือเลือกหน่วยงาน...</span>
              )}
            </div>
            <span className="text-xs text-orange-600 font-semibold px-2 py-0.5 rounded-md bg-orange-50">
              {isOpen ? 'ปิด' : 'เลือก'}
            </span>
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-80 flex flex-col animate-fadeIn">
              {/* Search Box inside dropdown */}
              <div className="p-2.5 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="พิมพ์ชื่อคณะ, กอง, หรือสำนัก เพื่อค้นหา..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Department List */}
              <div className="overflow-y-auto p-2 divide-y divide-slate-100 text-sm">
                {/* Search Results */}
                {searchTerm.trim() ? (
                  filteredDepartments && filteredDepartments.length > 0 ? (
                    filteredDepartments.map((dept) => (
                      <div
                        key={dept.id}
                        onClick={() => handleSelect(dept)}
                        className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                          selectedDeptId === dept.id ? 'bg-orange-50 text-orange-950 font-semibold' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div>
                          <div>{dept.nameTh}</div>
                          <div className="text-xs text-slate-400">{dept.categoryLabel}</div>
                        </div>
                        {selectedDeptId === dept.id && <Check className="w-4 h-4 text-orange-600" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      ไม่พบชื่อหน่วยงานที่ค้นหา
                    </div>
                  )
                ) : (
                  // Grouped Categories (Group titles are NOT selectable)
                  grouped.map((group) => (
                    <div key={group.category} className="py-2 first:pt-0">
                      {/* Non-selectable header */}
                      <div className="px-2.5 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider select-none bg-slate-50/80 rounded-md mb-1">
                        {group.categoryLabel}
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map((dept) => (
                          <div
                            key={dept.id}
                            onClick={() => handleSelect(dept)}
                            className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between text-xs sm:text-sm transition-colors ${
                              selectedDeptId === dept.id ? 'bg-orange-50 text-orange-950 font-semibold' : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <span>{dept.nameTh}</span>
                            {selectedDeptId === dept.id && <Check className="w-4 h-4 text-orange-600" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                {/* Option: Not found in list */}
                <div className="pt-2">
                  <div
                    onClick={handleSelectCustom}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between border border-dashed text-xs sm:text-sm transition-colors ${
                      selectedDeptId === OTHER_DEPARTMENT_CUSTOM_ID
                        ? 'border-orange-500 bg-orange-50/50 text-orange-900 font-semibold'
                        : 'border-slate-300 hover:border-slate-400 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>{OTHER_DEPARTMENT_CUSTOM_LABEL}</span>
                    </div>
                    {selectedDeptId === OTHER_DEPARTMENT_CUSTOM_ID && <Check className="w-4 h-4 text-orange-600" />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
      </div>

      {/* If "Not found in list" is chosen, show custom input */}
      {selectedDeptId === OTHER_DEPARTMENT_CUSTOM_ID && (
        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
          <label className="block text-xs font-semibold text-amber-950">
            โปรดระบุชื่อหน่วยงานต้นสังกัดของท่าน <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customDeptName}
            onChange={(e) => onChange(selectedDeptId, selectedDeptName, e.target.value, subDepartment)}
            placeholder="เช่น ศูนย์นวัตกรรม..., สถาบัน..."
            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}

      {/* Optional Sub-department */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          หน่วยงานย่อย / ภาควิชา / งาน (ไม่บังคับ)
        </label>
        <input
          type="text"
          value={subDepartment}
          onChange={(e) => onChange(selectedDeptId, selectedDeptName, customDeptName, e.target.value)}
          placeholder="เช่น ภาควิชาอายุรศาสตร์, งานการเงิน, งานสารบรรณ..."
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
        />
      </div>
    </div>
  );
};
