import { Globe } from "lucide-react";
import { SectionProps } from "@/types/company-details/types";

const RemarksSection: React.FC<SectionProps> = ({
  formData,
  inputClass,
  onChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Globe size={20} className="text-gray-500" />
          Remarks
        </h2>
      </div>
      <div className="p-6">
        <textarea
          value={formData.remark}
          onChange={(e) => onChange("remark", e.target.value)}
          className={inputClass("remark")}
          rows={4}
          placeholder="Any notes about this company"
        />
      </div>
    </div>
  );
};

export default RemarksSection;
