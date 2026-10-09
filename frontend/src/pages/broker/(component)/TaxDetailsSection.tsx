import { FileText } from "lucide-react";
import { SectionProps } from "@/types/broker-entry/types";

const TaxDetailsSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          Tax Details
        </h2>
      </div>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GSTN No
            </label>
            <input
              type="text"
              value={formData.gstnNo}
              onChange={(e) => {
                onChange("gstnNo", e.target.value.toUpperCase());
                if (fieldErrors.gstnNo) onClearError("gstnNo");
              }}
              className={`${inputClass("gstnNo")} uppercase`}
              placeholder="Enter GSTN No"
              maxLength={15}
            />
            {fieldErrors.gstnNo && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.gstnNo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pan No
            </label>
            <input
              type="text"
              value={formData.panNo}
              onChange={(e) => {
                onChange("panNo", e.target.value.toUpperCase());
                if (fieldErrors.panNo) onClearError("panNo");
              }}
              className={`${inputClass("panNo")} uppercase`}
              placeholder="Enter Pan No"
              maxLength={10}
            />
            {fieldErrors.panNo && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.panNo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Form
            </label>
            <input
              type="text"
              value={formData.shortForm}
              onChange={(e) => {
                onChange("shortForm", e.target.value.toUpperCase());
                if (fieldErrors.shortForm) onClearError("shortForm");
              }}
              className={`${inputClass("shortForm")} uppercase`}
              placeholder="Enter Short Form Of The Cc"
              maxLength={10}
            />
            {fieldErrors.shortForm && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.shortForm}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adhar No
            </label>
            <input
              type="text"
              value={formData.adharNo}
              onChange={(e) => {
                onChange("adharNo", e.target.value.replace(/\D/g, ""));
                if (fieldErrors.adharNo) onClearError("adharNo");
              }}
              className={inputClass("adharNo")}
              placeholder="Enter Adhar No"
              maxLength={12}
            />
            {fieldErrors.adharNo && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.adharNo}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxDetailsSection;
