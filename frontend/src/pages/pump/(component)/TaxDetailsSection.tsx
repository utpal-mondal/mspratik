import { SectionProps } from "@/types/pump-entry/types";

const TaxDetailsSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Tax Details</h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
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
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.gstnNo}</p>
            )}
          </div>

          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Pan NO
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
              <p data-field-error className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.panNo}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxDetailsSection;
