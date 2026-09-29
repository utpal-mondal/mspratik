import { User } from "lucide-react";
import { SectionProps } from "@/types/driver-entry/types";

const DriverInfoSection: React.FC<SectionProps> = ({
  formData,
  fieldErrors,
  inputClass,
  onChange,
  onClearError,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <User size={16} className="text-blue-600" />
          Driver Information
        </h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Driver Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.driverName}
              onChange={(e) => {
                onChange("driverName", e.target.value);
                if (fieldErrors.driverName) onClearError("driverName");
              }}
              className={inputClass("driverName")}
              placeholder="Enter driver name"
              maxLength={50}
            />
            {fieldErrors.driverName && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.driverName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                onChange("phoneNumber", e.target.value.replace(/[^\d+\s-]/g, ""));
                if (fieldErrors.phoneNumber) onClearError("phoneNumber");
              }}
              className={inputClass("phoneNumber")}
              placeholder="e.g. 9876543210"
              maxLength={10}
            />
            {fieldErrors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Years of Experience
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={formData.experienceYears}
              onChange={(e) => {
                onChange("experienceYears", e.target.value.replace(/\D/g, ""));
                if (fieldErrors.experienceYears) onClearError("experienceYears");
              }}
              className={inputClass("experienceYears")}
              placeholder="e.g. 5"
            />
            {fieldErrors.experienceYears && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.experienceYears}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverInfoSection;
