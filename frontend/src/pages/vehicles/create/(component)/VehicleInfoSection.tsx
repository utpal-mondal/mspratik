import { Truck } from "lucide-react";
import { SectionProps } from "@/types/vehicle-entry/types";
import CustomDatePicker from "@/components/ui/DatePicker";

const VehicleInfoSection: React.FC<SectionProps> = ({
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
          <Truck size={16} className="text-blue-600" />
          Vehicle Information
        </h2>
      </div>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Expiry Date
            </label>
            {/* <input
              type="date"
              value={formData.registrationExpiryDate}
              onChange={(e) => onChange("registrationExpiryDate", e.target.value)}
              className={inputClass("registrationExpiryDate")}
            /> */}

            <CustomDatePicker
            id="date"
            value={formData.registrationExpiryDate ? new Date(formData.registrationExpiryDate):null}
            onChange={(date) => onChange("registrationExpiryDate", date ? date.toISOString().split("T")[0]:"")}
            placeholder="DD/MM/YYYY"
           className={inputClass("registrationExpiryDate")}
          />
          </div>

       

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

             <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoSection;
