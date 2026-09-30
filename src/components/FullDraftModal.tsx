import React from 'react';
import { X, BookOpen, Download, AlertCircle, Calendar } from 'lucide-react';
import { STATUS_DISCLAIMER_TEXT } from '../utils/schedule';

interface FullDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullDraftModal: React.FC<FullDraftModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base sm:text-lg font-bold text-white tracking-wide">
                ร่างโครงการจัดตั้งชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร
              </h2>
              <p className="text-xs text-slate-300">ฉบับรับฟังความคิดเห็นของบุคลากร (เริ่มดำเนินการเตรียมจัดตั้ง 1 ตุลาคม 2569)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-900">ประกาศสถานะร่างโครงการ: </span>
            {STATUS_DISCLAIMER_TEXT}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-sm sm:text-base leading-relaxed">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              ร่างโครงการจัดตั้งชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร
            </h1>
            <p className="text-sm font-semibold text-orange-700">ฉบับรับฟังความคิดเห็นของบุคลากร</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>เริ่มดำเนินการเตรียมจัดตั้งวันที่ 1 ตุลาคม 2569 (ปีงบประมาณ พ.ศ. 2570)</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 bg-slate-100 p-3 rounded-lg border border-slate-200">
              เอกสารฉบับนี้จัดทำขึ้นเพื่อรับฟังความคิดเห็นและสำรวจความต้องการของบุคลากร ก่อนปรับปรุงรายละเอียดและเสนอขออนุมัติจัดตั้งชมรมต่อมหาวิทยาลัย การเผยแพร่ร่างโครงการและการเปิดรับการแสดงความจำนงสมัครสมาชิกยังไม่ถือเป็นการได้รับอนุมัติจัดตั้งชมรม
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-orange-600 pl-3">
              1. หลักการและเหตุผล
            </h2>
            <p>
              บุคลากรเป็นกำลังสำคัญในการขับเคลื่อนภารกิจของมหาวิทยาลัย ทั้งด้านการจัดการศึกษา การวิจัย การบริการวิชาการ การทำนุบำรุงศิลปวัฒนธรรม และการบริหารสนับสนุนภารกิจต่าง ๆ การส่งเสริมให้บุคลากรมีสุขภาพกายและสุขภาพจิตที่ดี มีความสัมพันธ์อันดีระหว่างเพื่อนร่วมงาน และมีโอกาสเข้าร่วมกิจกรรมที่เหมาะสมกับความสนใจ จึงเป็นองค์ประกอบสำคัญของการพัฒนาคุณภาพชีวิตและการจัดสวัสดิการบุคลากร
            </p>
            <p>
              การออกกำลังกายร่วมกันเป็นกิจกรรมที่เชื่อมโยงการดูแลสุขภาพกับการสร้างความสัมพันธ์ภายในองค์กร การมีพื้นที่และกิจกรรมที่ดำเนินอย่างสม่ำเสมอจะช่วยเพิ่มโอกาสให้บุคลากรจัดสรรเวลาสำหรับการออกกำลังกาย พบปะเพื่อนร่วมงาน และสร้างเครือข่ายระหว่างหน่วยงาน การมีส่วนร่วมในการจัดกิจกรรมยังเปิดโอกาสให้บุคลากรร่วมเสนอแนวคิดและรับผิดชอบการดำเนินงาน และพัฒนากิจกรรมให้สอดคล้องกับความต้องการ
            </p>
            <p>
              ฟุตบอลเป็นกีฬาที่อาศัยความร่วมมือ การสื่อสาร และการทำงานเป็นทีม สามารถจัดกิจกรรมได้หลายรูปแบบ ตั้งแต่การฝึกทักษะพื้นฐาน การเล่นเพื่อออกกำลังกาย ไปจนถึงกิจกรรมฟุตบอลสัมพันธ์ การออกแบบกิจกรรมให้เหมาะสมกับระดับทักษะและความพร้อมของผู้เข้าร่วมจะช่วยให้บุคลากรที่มีประสบการณ์แตกต่างกันเข้าร่วมได้ ทั้งผู้เริ่มต้น ผู้ที่ไม่ได้เล่นฟุตบอลมาเป็นเวลานาน และผู้ที่เล่นฟุตบอลเป็นประจำ
            </p>
            <p>
              การรวมกลุ่มในรูปแบบชมรมจะช่วยให้การจัดกิจกรรมมีความต่อเนื่อง เนื่องจากมีผู้ประสานงาน มีแนวทางบริหารร่วมกัน มีการวางแผนการใช้สถานที่และอุปกรณ์ และมีช่องทางให้สมาชิกเสนอความคิดเห็น ตลอดจนช่วยให้มหาวิทยาลัยมีข้อมูลประกอบการพิจารณาสนับสนุนกิจกรรมที่ตอบสนองความต้องการของบุคลากรอย่างเป็นระบบ
            </p>
            <p>
              จึงเสนอให้มีการจัดตั้ง “ชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร” เพื่อเป็นกลไกส่งเสริมสวัสดิการด้านสุขภาพและคุณภาพชีวิตบุคลากร และเป็นพื้นที่สร้างความสัมพันธ์ระหว่างหน่วยงาน โดยมุ่งเสนอให้มหาวิทยาลัยพิจารณาจัดสรรงบประมาณและสนับสนุนทรัพยากรที่จำเป็นต่อการดำเนินงานในระยะต่อไป
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-orange-600 pl-3">
              2. วัตถุประสงค์
            </h2>
            <div className="space-y-2 pl-2">
              <h3 className="font-semibold text-slate-900">2.1 วัตถุประสงค์ของชมรม</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li><strong>2.1.1 เพื่อส่งเสริมสุขภาพและการออกกำลังกายของบุคลากร:</strong> เปิดโอกาสให้บุคลากรเข้าร่วมกิจกรรมฟุตบอลอย่างสม่ำเสมอ โดยมีรูปแบบที่เหมาะสมกับความสนใจ ทักษะ และความพร้อมของผู้เข้าร่วม</li>
                <li><strong>2.1.2 เพื่อส่งเสริมสวัสดิการและคุณภาพชีวิตบุคลากร:</strong> พัฒนากิจกรรมกีฬาในรูปแบบชมรม เพื่อประกอบการพิจารณาสนับสนุนสวัสดิการด้านสุขภาพและการออกกำลังกายจากมหาวิทยาลัย</li>
                <li><strong>2.1.3 เพื่อสร้างความสัมพันธ์ระหว่างหน่วยงาน:</strong> ส่งเสริมให้บุคลากรได้พบปะ ทำกิจกรรมร่วมกัน แลกเปลี่ยนประสบการณ์ และสร้างความร่วมมือผ่านกิจกรรมกีฬา</li>
                <li><strong>2.1.4 เพื่อส่งเสริมการมีส่วนร่วมของสมาชิก:</strong> เปิดโอกาสให้สมาชิกเสนอความคิดเห็น ร่วมวางแผน และร่วมรับผิดชอบการดำเนินงานตามความสนใจและความพร้อม</li>
                <li><strong>2.1.5 เพื่อพัฒนาการดำเนินงานให้ต่อเนื่อง:</strong> จัดให้มีผู้รับผิดชอบ แผนกิจกรรม แนวทางใช้ทรัพยากร และการติดตามผลที่เหมาะสม รวมถึงการส่งมอบงานเมื่อมีการเปลี่ยนผู้รับผิดชอบ</li>
              </ul>

              <h3 className="font-semibold text-slate-900 pt-2">2.2 วัตถุประสงค์ระยะเตรียมการจัดตั้ง</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li><strong>2.2.1</strong> เพื่อรวบรวมความคิดเห็นต่อร่างโครงการ ข้อกังวล และข้อเสนอแนะจากบุคลากร</li>
                <li><strong>2.2.2</strong> เพื่อสำรวจความต้องการกิจกรรม ความสะดวกในการเข้าร่วม และความจำนงสมัครสมาชิก</li>
                <li><strong>2.2.3</strong> เพื่อรวบรวมผู้สนใจร่วมเป็นคณะกรรมการหรือสนับสนุนการดำเนินกิจกรรม เพื่อประเมินความพร้อมด้านผู้รับผิดชอบ</li>
                <li><strong>2.2.4</strong> เพื่อนำข้อมูลมาใช้ปรับปรุงโครงการก่อนดำเนินการเสนอขออนุมัติในระยะถัดไป</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-orange-600 pl-3">
              3. กลุ่มเป้าหมายและแนวทางการเข้าร่วม
            </h2>
            <div className="space-y-2 text-slate-700">
              <p><strong>3.1 กลุ่มเป้าหมายของการสำรวจครั้งนี้:</strong> บุคลากรที่ปฏิบัติงานอยู่ในมหาวิทยาลัยนเรศวร ณ วันที่ตอบแบบสำรวจ ทั้งผู้ที่สนใจฟุตบอลและผู้ที่ต้องการแสดงความคิดเห็นต่อการจัดตั้งชมรม ส่วนรายละเอียดคุณสมบัติสมาชิกจะพิจารณาให้สอดคล้องกับแนวทางของมหาวิทยาลัยก่อนยืนยันการเป็นสมาชิก</p>
              <p><strong>3.2 ลักษณะการมีส่วนร่วม:</strong> เป็นไปโดยสมัครใจ สามารถเลือกแสดงความคิดเห็นต่อร่างโครงการโดยไม่จำเป็นต้องสมัครสมาชิก, แสดงความจำนงสมัครสมาชิก, ขอรับข้อมูลข่าวสาร หรือแจ้งความสนใจร่วมดำเนินงาน</p>
              <p><strong>3.3 หลักการเปิดรับสมาชิก:</strong> เปิดรับบุคลากรโดยไม่กำหนดให้ต้องมีทักษะฟุตบอลหรือประสบการณ์แข่งขันมาก่อน ออกแบบกิจกรรมโดยคำนึงถึงความแตกต่างด้านอายุ เพศ และเวลาที่สะดวก</p>
              <p><strong>3.4 จำนวนกลุ่มเป้าหมาย:</strong> ระยะรับฟังความคิดเห็นยังไม่กำหนดจำนวนสมาชิกขั้นต่ำ โดยจะใช้จำนวนผู้แสดงความจำนงและความพร้อมเข้าร่วมประกอบการกำหนดเป้าหมายในระยะต่อไป</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-orange-600 pl-3">
              4. รูปแบบและแนวทางดำเนินกิจกรรม
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-900 text-sm">4.1 กิจกรรมฟุตบอลเพื่อสุขภาพ</h4>
                <p className="text-xs text-slate-600 mt-1">จัดเล่นฟุตบอลร่วมกันอย่างสม่ำเสมอ เน้นการออกกำลังกายและความสนุกสนาน หมุนเวียนผู้เล่นอย่างทั่วถึง</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-900 text-sm">4.2 กิจกรรมฝึกทักษะพื้นฐาน</h4>
                <p className="text-xs text-slate-600 mt-1">เรียนรู้หรือทบทวนการรับ–ส่งบอล การควบคุมลูก และกติกาเบื้องต้น</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-900 text-sm">4.3 สำหรับผู้เริ่มต้นและผู้กลับมาออกกำลังกาย</h4>
                <p className="text-xs text-slate-600 mt-1">ปรับระดับความหนักและระยะเวลาให้เหมาะสม ไม่บังคับเล่นในระดับเดียวกับผู้มีประสบการณ์</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-900 text-sm">4.4 ฟุตบอลสัมพันธ์ระหว่างหน่วยงาน</h4>
                <p className="text-xs text-slate-600 mt-1">กระชับความสัมพันธ์ระหว่างหน่วยงาน ทีมผสม เน้นน้ำใจนักกีฬา</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg md:col-span-2">
                <h4 className="font-bold text-slate-900 text-sm">4.5–4.7 การแข่งขัน ความปลอดภัย และแนวทางร่วมกัน</h4>
                <p className="text-xs text-slate-600 mt-1">การแข่งขันเป็นกิจกรรมเพิ่มเติมตามความสมัครใจ มีการดูแลความปลอดภัยเบื้องต้น อบอุ่นร่างกาย เคารพกติกา และหลีกเลี่ยงการเล่นรุนแรง</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-orange-600 pl-3">
              5. แนวทางการบริหารชมรม
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold">
                    <th className="border border-slate-200 p-2">ด้านงาน</th>
                    <th className="border border-slate-200 p-2">หน้าที่เบื้องต้น</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">การบริหารและประสานงาน</td>
                    <td className="border border-slate-200 p-2">ประสานมหาวิทยาลัยและหน่วยงานที่เกี่ยวข้อง ติดตามแผน และประสานการตัดสินใจร่วมกัน</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">งานเลขานุการและสมาชิก</td>
                    <td className="border border-slate-200 p-2">ดูแลทะเบียนสมาชิก นัดหมาย บันทึกข้อสรุป และจัดเก็บเอกสาร</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">การจัดกิจกรรม</td>
                    <td className="border border-slate-200 p-2">วางแผนกิจกรรม ประสานผู้เข้าร่วม และดูแลการดำเนินกิจกรรม</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">สถานที่และอุปกรณ์</td>
                    <td className="border border-slate-200 p-2">ประสานการใช้สนาม จัดทำรายการอุปกรณ์ และดูแลทรัพยากรส่วนกลาง</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">การเงินและการรายงาน</td>
                    <td className="border border-slate-200 p-2">จัดทำข้อมูลและหลักฐานการใช้จ่ายเมื่อมีการดำเนินงานตามที่ได้รับอนุมัติ</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2 font-medium">การสื่อสารและประชาสัมพันธ์</td>
                    <td className="border border-slate-200 p-2">แจ้งข่าวสาร เผยแพร่กำหนดการ และรับข้อเสนอแนะ</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 italic">
              * การแจ้งความสนใจร่วมเป็นคณะกรรมการหรือสนับสนุนการดำเนินกิจกรรม เป็นการรวบรวมผู้พร้อมมีส่วนร่วมในระยะเตรียมการจัดตั้ง ยังไม่ถือเป็นการแต่งตั้งหรือมอบหมายตำแหน่ง
            </p>
          </section>

          {/* Section 6 - 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-orange-600 pl-3">
              6. กำหนดการและขั้นตอนการดำเนินงาน
            </h2>
            <div className="space-y-2 text-slate-700 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 shrink-0">1 ตุลาคม 2569:</span>
                <span>เริ่มดำเนินการเตรียมจัดตั้ง (ปีงบประมาณ พ.ศ. 2570)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 shrink-0">8 ตุลาคม 2569:</span>
                <span>เปิดรับฟังความคิดเห็นผ่านแบบสำรวจออนไลน์และรับแสดงความจำนง</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 shrink-0">31 ตุลาคม 2569:</span>
                <span>ปิดรับแบบสำรวจ เวลา 23.59 น. (เวลาประเทศไทย)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 shrink-0">1–15 พ.ย. 2569:</span>
                <span>ตรวจสอบข้อมูล วิเคราะห์ผล และปรับปรุงร่างโครงการก่อนเสนอขออนุมัติ</span>
              </div>
            </div>
          </section>

          {/* Section 7 - Principles of Data Protection */}
          <section className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
            <h3 className="font-bold text-slate-900">หลักการดูแลข้อมูลส่วนบุคคล</h3>
            <p className="text-slate-600">
              ระบบเก็บข้อมูลเท่าที่จำเป็นต่อการสำรวจและประสานงาน <strong>ไม่มีการขอเลขประจำตัวประชาชน วันเดือนปีเกิด ที่อยู่ หรือข้อมูลสุขภาพโดยละเอียด</strong> โดยแยกข้อมูลคำตอบทางสถิติออกจากข้อมูลติดต่อ และนำเสนอผลสรุปในภาพรวมเพื่อความโปร่งใสและคุ้มครองความเป็นส่วนตัว
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            เอกสารร่างโครงการจัดตั้งชมรมฟุตบอลบุคลากรมหาวิทยาลัยนเรศวร
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
