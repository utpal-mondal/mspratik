import { Truck } from "lucide-react";
import { SectionProps } from "@/types/vehicle-entry/types";

const VehicleInfoSection: React.FC<SectionProps> = ({
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
          <Truck size={16} className="text-blue-600" />
          Vehicle Information
        </h2>
      </div>
      <div className="p-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => {
                onChange("vehicleNumber", e.target.value.toUpperCase());
                if (fieldErrors.vehicleNumber) onClearError("vehicleNumber");
              }}
              className={`${inputClass("vehicleNumber")} uppercase`}
              placeholder="e.g. MH12AB1234"
              maxLength={13}
            />
            {fieldErrors.vehicleNumber && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.vehicleNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Vehicle Type
            </label>
            <select
              value={formData.vehicleType}
              onChange={(e) => onChange("vehicleType", e.target.value)}
              className={inputClass("vehicleType")}
            >
              <option value="self">Self</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Number of Wheels
            </label>
            <input
              type="number"
              min={2}
              value={formData.numberOfWheels}
              onChange={(e) => {
                onChange("numberOfWheels", e.target.value.replace(/\D/g, ""));
                if (fieldErrors.numberOfWheels) onClearError("numberOfWheels");
              }}
              className={inputClass("numberOfWheels")}
              placeholder="e.g. 4"
            />
            {fieldErrors.numberOfWheels && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.numberOfWheels}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Registration Expiry Date
            </label>
            <input
              type="date"
              value={formData.registrationExpiryDate}
              onChange={(e) => onChange("registrationExpiryDate", e.target.value)}
              className={inputClass("registrationExpiryDate")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoSection;
