import { Building2 } from "lucide-react";
import { SectionProps } from "@/types/company-details/types";

const CompanyInfoSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Building2 size={20} className="text-gray-500" />
          Company Information
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                onChange("name", e.target.value);
                if (fieldErrors.name) onClearError("name");
              }}
              className={inputClass("name")}
              placeholder="Enter company name"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                onChange("email", e.target.value);
                if (fieldErrors.email) onClearError("email");
              }}
              className={inputClass("email")}
              placeholder="Enter email address"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => {
                onChange("phoneNumber", e.target.value);
                if (fieldErrors.phoneNumber) onClearError("phoneNumber");
              }}
              className={inputClass("phoneNumber")}
              placeholder="Enter phone number"
            />
            {fieldErrors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              VAT Number
            </label>
            <input
              type="text"
              value={formData.vatNumber}
              onChange={(e) => onChange("vatNumber", e.target.value)}
              className={inputClass("vatNumber")}
              placeholder="Enter VAT number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => onChange("currency", e.target.value)}
              className={inputClass("currency")}
              placeholder="e.g. EUR"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoSection;
