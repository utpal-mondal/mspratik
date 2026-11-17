import { SectionProps } from "@/types/company-details/types";

const labelClass = "block text-[13px] font-medium text-[#3B4957] mb-1.5";
const errorClass = "mt-1 text-xs text-[#A12B2B]";

const CompanyInfoSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">
          Company Information
        </h2>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>
              Company Name <span className="text-[#A12B2B]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                onChange("name", e.target.value);
                if (fieldErrors.name) onClearError("name");
              }}
              className={`${inputClass("name")} capitalize`}
              placeholder="Enter company name"
              maxLength={30}
            />
            {fieldErrors.name && (
              <p className={errorClass}>{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                onChange("email", e.target.value);
                if (fieldErrors.email) onClearError("email");
              }}
              className={inputClass("email")}
              placeholder="Enter email address"
              maxLength={50}
            />
            {fieldErrors.email && (
              <p className={errorClass}>{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => {
                onChange("phoneNumber", e.target.value);
                if (fieldErrors.phoneNumber) onClearError("phoneNumber");
              }}
              className={inputClass("phoneNumber")}
              placeholder="Enter phone number"
              maxLength={20}
            />
            {fieldErrors.phoneNumber && (
              <p className={errorClass}>{fieldErrors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>VAT Number</label>
            <input
              type="text"
              value={formData.vatNumber}
              onChange={(e) => onChange("vatNumber", e.target.value)}
              className={inputClass("vatNumber")}
              placeholder="Enter VAT number"
              maxLength={20}
            />
          </div>

          <div>
            <label className={labelClass}>Language</label>
            <select
              value={formData.language}
              onChange={(e) => onChange("language", e.target.value)}
              className={inputClass("language")}
            >
              <option value="nl">Dutch</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Currency</label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => onChange("currency", e.target.value)}
              className={inputClass("currency")}
              placeholder="e.g. EUR"
              maxLength={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoSection;
