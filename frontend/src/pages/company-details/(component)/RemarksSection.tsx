import { SectionProps } from "@/types/company-details/types";

const labelClass = "block text-[15px] font-medium text-[#3B4957] mb-1.5";

const RemarksSection: React.FC<SectionProps> = ({
  formData,
  inputClass,
  onChange,
}) => {
  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Remarks</h2>
      </div>
      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Remarks</label>
          <textarea
            value={formData.remark}
            onChange={(e) => onChange("remark", e.target.value)}
            className={`${inputClass("remark")} !h-auto py-2`}
            rows={4}
            placeholder="Any notes about this company"
          />
        </div>
        <div>
          <label className={labelClass}>Location API</label>
          <textarea
            value={formData.locationApi}
            onChange={(e) => onChange("locationApi", e.target.value)}
            className={`${inputClass("locationApi")} !h-auto py-2`}
            rows={4}
            placeholder="Location API URL or configuration"
          />
        </div>
      </div>
    </div>
  );
};

export default RemarksSection;
