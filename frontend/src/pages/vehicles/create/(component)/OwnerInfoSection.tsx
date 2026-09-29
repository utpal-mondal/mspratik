import { User } from "lucide-react";
import { SectionProps } from "@/types/vehicle-entry/types";

const OwnerInfoSection: React.FC<SectionProps> = ({
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
          Owner Information
        </h2>
      </div>
      <div className="p-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Owner Name
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => {
                onChange("ownerName", e.target.value);
                if (fieldErrors.ownerName) onClearError("ownerName");
              }}
              className={inputClass("ownerName")}
              placeholder="Enter owner name"
              maxLength={50}
            />
            {fieldErrors.ownerName && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.ownerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Owner Phone Number
            </label>
            <input
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => {
                onChange("ownerPhone", e.target.value.replace(/[^\d+\s-]/g, ""));
                if (fieldErrors.ownerPhone) onClearError("ownerPhone");
              }}
              className={inputClass("ownerPhone")}
              placeholder="e.g. 9876543210"
              maxLength={10}
            />
            {fieldErrors.ownerPhone && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.ownerPhone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerInfoSection;
