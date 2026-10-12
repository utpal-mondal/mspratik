import { SectionProps } from "@/types/client-entry/types";

const labelClass = "block text-[13px] font-medium text-[#3B4957] mb-1.5";
const errorClass = "mt-1 text-xs text-[#A12B2B]";

const TaxDetailsSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Tax Details</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>GSTN No</label>
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
              <p className={errorClass}>{fieldErrors.gstnNo}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Pan No</label>
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
              <p className={errorClass}>{fieldErrors.panNo}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaxDetailsSection;
